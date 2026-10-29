import { webMethod, Permissions } from 'wix-web-module';
import wixData from 'wix-data';
import { currentMember } from 'wix-members-backend';
import { accounts } from 'wix-loyalty.v2';
import { elevate } from 'wix-auth';
import { randomBytes } from 'crypto';
import {
    CAMPAIGN_START, DAILY_CONTENT, FOREST_ENCOUNTERS, LOOTGREM_DIALOGUE,
    HUNT_STAGES, TANGLEBRIGHT_REWARD,
    REWARD_POINTS, TOTAL_BUTTONS, campaignDay, transitionLootgrem
} from './rabbitContent';
import { addFind, normaliseState, publicState } from './rabbitCore';
import { rabbitActivityFacts } from './rabbitActivity';
import { issueChallenge, verifyChallenge } from './rabbitChallenge';
import { buildRabbitDashboard } from './rabbitDashboard';
import { buildForestStageView } from './rabbitForestView';
import { recordDailyResult } from './rabbitDailyGuard';
import { beginCheckoutCodeClaim, beginRewardClaim, finalizeRewardClaim, markRewardClaimUncertain } from './rabbitReward';
import { loadDopaProfile, memberProfileView, recordDopaActivity } from './dopaProfiles';

const COLLECTION = 'RabbitHuntMembers';
const GLOBAL_COLLECTION = 'RabbitHuntGlobal';
const GLOBAL_ID = 'global';
const REWARD_ISSUANCE_ENABLED = false;
const MANUAL_LOYALTY_APP_ID = '553c79f3-5625-4f38-b14b-ef7c0d1e87df';

async function memberId() {
    const member = await currentMember.getMember();
    const id = member?._id || member?.id || member?.member?._id || member?.member?.id;
    if (!id) throw new Error('MEMBER_LOGIN_REQUIRED');
    return id;
}

function fresh(id) {
    return normaliseState({
        _id: id,
        memberId: id,
        foundIds: [],
        lastSeenAt: new Date(),
        contentDay: 0,
        rewardStatus: 'not_eligible',
        version: 1
    });
}

async function load(id) {
    try {
        const item = await wixData.get(COLLECTION, id, { suppressAuth: true });
        return item ? normaliseState(item) : fresh(id);
    } catch (error) {
        if (error?.code !== 'WD_ITEM_NOT_FOUND' && !String(error?.message || error).toLowerCase().includes('not found')) throw error;
        return fresh(id);
    }
}

async function save(state) {
    state.lastSeenAt = new Date();
    return normaliseState(await wixData.save(COLLECTION, state, { suppressAuth: true }));
}

async function loadGlobal() {
    try {
        return await wixData.get(GLOBAL_COLLECTION, GLOBAL_ID, { suppressAuth: true });
    } catch (error) {
        if (error?.code !== 'WD_ITEM_NOT_FOUND' && !String(error?.message || error).toLowerCase().includes('not found')) throw error;
        return { _id: GLOBAL_ID, claimantCount: 0, updatedAt: new Date() };
    }
}

export const getHuntState = webMethod(Permissions.SiteMember, async () => {
    const id = await memberId();
    return publicState(await load(id));
});

export const getMyRabbitDashboard = webMethod(Permissions.SiteMember, async () => {
    const id = await memberId();
    const [huntRecord, profileRecord] = await Promise.all([load(id), loadDopaProfile(id)]);
    const hunt = publicState(huntRecord);
    return buildRabbitDashboard({
        profile: memberProfileView(profileRecord, hunt),
        hunt,
        currentDay: campaignDay(new Date(), CAMPAIGN_START),
        campaignStart: CAMPAIGN_START
    });
});

export const beginButtonChallenge = webMethod(Permissions.SiteMember, async (buttonId, pagePath) => {
    const id = await memberId();
    const state = await load(id);
    const expected = publicState(state);
    const requestedId = Number(buttonId);
    if (requestedId !== expected.nextButtonId) throw new Error('HUNT_STEP_OUT_OF_SEQUENCE');
    if (pagePath !== expected.nextPage) throw new Error('WRONG_HUNT_PAGE');
    const issued = issueChallenge(state, {
        memberId: id,
        buttonId: requestedId,
        pagePath,
        now: new Date(),
        token: randomBytes(24).toString('base64url')
    });
    await save(issued.state);
    return {
        token: issued.token,
        buttonId: issued.buttonId,
        pagePath: issued.pagePath,
        expiresAt: issued.expiresAt
    };
});

export const findButton = webMethod(Permissions.SiteMember, async (buttonId, pagePath, challengeToken) => {
    const id = await memberId();
    const before = await load(id);
    const verified = verifyChallenge(before.activeChallenge, {
        memberId: id,
        buttonId: Number(buttonId),
        pagePath,
        token: challengeToken,
        stateVersion: before.version,
        now: new Date()
    });
    before.activeChallenge = verified.challenge;
    const { state, isNew } = addFind(before, Number(buttonId), pagePath);
    if (isNew) {
        state.activeChallenge = null;
        await save(state);
        try {
            await recordDopaActivity(id, {
                questJoined: true,
                hiddenButtonsFound: state.foundCount,
                questCompleted: state.caveUnlocked
            });
        } catch (error) {
            // A profile-sync issue must never invalidate an already-saved hunt find.
            console.error('DopaVerse profile sync failed:', error);
        }
    }
    return { newFind: isNew, ...publicState(state) };
});

export const enterCave = webMethod(Permissions.SiteMember, async () => {
    const id = await memberId();
    const state = await load(id);
    if (state.foundCount !== TOTAL_BUTTONS) throw new Error('CAVE_LOCKED');
    state.caveEntered = true;
    state.lootgremState = { node: 'welcome', claimAuthorized: false };
    await save(state);
    return { character: 'LOOTGREM', scene: 'forest_cave_campfire', dialogue: LOOTGREM_DIALOGUE.welcome, ...publicState(state) };
});

export const chooseLootgrem = webMethod(Permissions.SiteMember, async (node, option) => {
    const id = await memberId();
    const state = await load(id);
    if (!state.caveUnlocked || !state.caveEntered) throw new Error('CAVE_LOCKED');
    const transition = transitionLootgrem(state.lootgremState, node, option, state);
    state.lootgremState = transition.state;
    if (transition.rewardChoice) state.rewardChoice = transition.rewardChoice;
    await save(state);
    return option === 'claim'
        ? { ...transition.response, rewardIssuanceEnabled: REWARD_ISSUANCE_ENABLED }
        : transition.response;
});

export const getForestContent = webMethod(Permissions.SiteMember, async () => {
    const id = await memberId();
    return buildForestStageView(await load(id));
});

export const forestEncounter = webMethod(Permissions.SiteMember, async (characterId, actionId) => {
    const id = await memberId();
    const state = await load(id);
    const encounterNumber = state.forestState?.encounters?.length || 0;
    const requiredThreshold = HUNT_STAGES[encounterNumber]?.threshold;
    if (!requiredThreshold || state.foundCount < requiredThreshold) throw new Error('FOREST_STAGE_LOCKED');
    const encounter = FOREST_ENCOUNTERS[characterId]?.actions?.[actionId];
    if (!encounter) throw new Error('UNKNOWN_FOREST_ENCOUNTER');
    const key = `${characterId}:${actionId}`;
    const forest = state.forestState;
    const sequence = ['mothkeeper:wait', 'rootwhisper:protect', 'grumblebark:listen', 'tanglebright:approach'];
    const expected = sequence[forest.encounters.length];
    if (key !== expected) throw new Error('FOREST_PREDECESSOR_REQUIRED');
    if (forest.encounters.includes(key)) throw new Error('ENCOUNTER_ALREADY_RECORDED');
    forest.encounters.push(key);
    forest.bonds[characterId] = Number(forest.bonds[characterId] || 0) + encounter.affinity;
    if (!forest.fragments.includes(encounter.fragment)) forest.fragments.push(encounter.fragment);
    if (forest.bonds[characterId] >= 3 && !forest.fragments.includes(`${characterId}:trusted`)) forest.fragments.push(`${characterId}:trusted`);
    state.forestState = forest;
    await save(state);
    try {
        await recordDopaActivity(id, rabbitActivityFacts(state));
    } catch (error) {
        // Profile synchronization cannot invalidate a durable forest encounter.
        console.error('DopaVerse forest activity sync failed:', error);
    }
    return { dialogue: encounter.line, affinity: forest.bonds[characterId], fragment: encounter.fragment, trusted: forest.bonds[characterId] >= 3, pointsAwarded: 0, stage: encounterNumber + 1 };
});

export const getDailyContent = webMethod(Permissions.SiteMember, async () => {
    const id = await memberId();
    const state = await load(id);
    const currentDay = campaignDay(new Date(), CAMPAIGN_START);
    const completed = state.forestState?.completedDays || [];
    const day = currentDay ? DAILY_CONTENT[currentDay - 1] : null;
    return {
        campaignStart: CAMPAIGN_START,
        currentDay,
        completedDays: completed,
        entry: day ? { day: day.day, title: day.title, teaser: day.teaser, prompt: day.prompt, choices: day.choices } : null,
        pointsAwardedByDailyContent: 0
    };
});

export const solveDailyContent = webMethod(Permissions.SiteMember, async (dayNumber, answer) => {
    const id = await memberId();
    let state = await load(id);
    const currentDay = campaignDay(new Date(), CAMPAIGN_START);
    const day = DAILY_CONTENT[Number(dayNumber) - 1];
    if (!day || day.day > currentDay) throw new Error('CONTENT_NOT_RELEASED');
    const completed = state.forestState.completedDays || [];
    if (day.day > 1 && !completed.includes(day.day - 1)) throw new Error('PREVIOUS_DAY_REQUIRED');
    const now = new Date();
    const correct = String(answer || '').trim().toLowerCase() === day.answer.toLowerCase();
    let guarded;
    try {
        guarded = recordDailyResult(state, day.day, now, correct);
    } catch (error) {
        if (error?.message === 'DAILY_ATTEMPT_LIMITED') {
            throw new Error(`DAILY_ATTEMPT_LIMITED:${Math.ceil(Number(error.retryAfterMs || 0) / 1000)}`);
        }
        throw error;
    }
    state = guarded.state;
    if (!correct) {
        await save(state);
        return { correct: false, completed: false, attemptsRemaining: guarded.remaining };
    }
    if (!completed.includes(day.day)) completed.push(day.day);
    state.forestState.completedDays = completed.sort((a, b) => a - b);
    if (!state.forestState.fragments.includes(day.collectible)) state.forestState.fragments.push(day.collectible);
    await save(state);
    try {
        await recordDopaActivity(id, rabbitActivityFacts(state));
    } catch (error) {
        // Profile synchronization cannot invalidate a durable riddle completion.
        console.error('DopaVerse daily activity sync failed:', error);
    }
    return { correct: true, completed: true, collectible: day.collectible, attemptsRemaining: guarded.remaining, pointsAwarded: 0 };
});

export const claimReward = webMethod(Permissions.SiteMember, async () => {
    const id = await memberId();
    const state = await load(id);
    const prepared = beginRewardClaim(state, { memberId: id, now: new Date() });
    if (prepared.action === 'already_awarded') {
        return { status: 'awarded', alreadyAwarded: true, points: REWARD_POINTS, transactionId: prepared.transactionId };
    }
    if (!REWARD_ISSUANCE_ENABLED) {
        return { status: 'disabled', points: 0, message: 'Reward issuance is disabled until integration testing is approved.' };
    }

    const loyalty = await accounts.getCurrentMemberAccount();
    const accountId = loyalty?.account?._id || loyalty?.account?.id;
    if (!accountId) throw new Error('LOYALTY_ACCOUNT_REQUIRED');
    const idempotencyKey = prepared.idempotencyKey;
    const pending = await save(prepared.state);

    const elevatedEarnPoints = elevate(accounts.earnPoints);
    let completed;
    try {
        const result = await elevatedEarnPoints(accountId, {
            amount: REWARD_POINTS,
            description: 'THE RABBIT HOLE — LOOTGREM treasure',
            appId: MANUAL_LOYALTY_APP_ID,
            idempotencyKey
        });
        completed = finalizeRewardClaim(pending, {
            idempotencyKey,
            transactionId: result?.transactionId || result?.transaction_id,
            now: new Date()
        });
        await save(completed);
    } catch (error) {
        console.error('Loyalty reward outcome requires reconciliation:', error);
        try {
            await save(markRewardClaimUncertain(pending, { idempotencyKey, now: new Date() }));
        } catch (saveError) {
            console.error('Unable to persist reward reconciliation state:', saveError);
        }
        throw new Error('REWARD_RECONCILIATION_REQUIRED');
    }
    try {
        const global = await loadGlobal();
        global.claimantCount = Number(global.claimantCount || 0) + 1;
        global.updatedAt = new Date();
        await wixData.save(GLOBAL_COLLECTION, global, { suppressAuth: true });
    } catch (error) {
        // The member award is already durable; analytics failure must not invite a retry.
        console.error('Reward claimant analytics update failed:', error);
    }
    return { status: 'awarded', alreadyAwarded: false, points: REWARD_POINTS, transactionId: completed.rewardTransactionId };
});

export const claimCheckoutCode = webMethod(Permissions.SiteMember, async () => {
    const id = await memberId();
    const state = await load(id);
    const prepared = beginCheckoutCodeClaim(state, { now: new Date() });
    if (prepared.action === 'issue_code') await save(prepared.state);
    return {
        status: 'code_issued',
        code: TANGLEBRIGHT_REWARD.code,
        alreadyIssued: prepared.action === 'already_issued'
    };
});
