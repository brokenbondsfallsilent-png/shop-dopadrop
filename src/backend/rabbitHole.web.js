import { webMethod, Permissions } from 'wix-web-module';
import wixData from 'wix-data';
import { currentMember } from 'wix-members-backend';
import { accounts } from 'wix-loyalty.v2';
import { elevate } from 'wix-auth';
import {
    CAMPAIGN_START, DAILY_CONTENT, FOREST_ENCOUNTERS, LOOTGREM_DIALOGUE,
    REWARD_POINTS, TOTAL_BUTTONS, campaignDay
} from './rabbitContent';
import { addFind, normaliseState, publicState } from './rabbitCore';

const COLLECTION = 'RabbitHuntMembers';
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
        return normaliseState(await wixData.get(COLLECTION, id, { suppressAuth: true }));
    } catch (error) {
        if (error?.code !== 'WD_ITEM_NOT_FOUND' && !String(error?.message || error).toLowerCase().includes('not found')) throw error;
        return fresh(id);
    }
}

async function save(state) {
    state.lastSeenAt = new Date();
    return normaliseState(await wixData.save(COLLECTION, state, { suppressAuth: true }));
}

export const getHuntState = webMethod(Permissions.SiteMember, async () => {
    const id = await memberId();
    return publicState(await load(id));
});

export const findButton = webMethod(Permissions.SiteMember, async (buttonId) => {
    const id = await memberId();
    const before = await load(id);
    const { state, isNew } = addFind(before, Number(buttonId));
    if (isNew) await save(state);
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
    const current = state.lootgremState?.node || 'welcome';
    if (node !== current) throw new Error('DIALOGUE_OUT_OF_SEQUENCE');
    const available = LOOTGREM_DIALOGUE[current]?.choices || [];
    if (!available.some(choice => choice.id === option)) throw new Error('INVALID_DIALOGUE_CHOICE');
    if (option === 'claim') {
        state.lootgremState = { node: current, claimAuthorized: true };
        await save(state);
        return { next: 'claim', requiresExplicitClaim: true, rewardIssuanceEnabled: REWARD_ISSUANCE_ENABLED };
    }
    state.lootgremState = { node: option, claimAuthorized: false };
    await save(state);
    return { next: option, dialogue: LOOTGREM_DIALOGUE[option] };
});

export const forestEncounter = webMethod(Permissions.SiteMember, async (characterId, actionId) => {
    const id = await memberId();
    const state = await load(id);
    if (state.foundCount < 1) throw new Error('FIRST_DISCOVERY_REQUIRED');
    const encounter = FOREST_ENCOUNTERS[characterId]?.actions?.[actionId];
    if (!encounter) throw new Error('UNKNOWN_FOREST_ENCOUNTER');
    const key = `${characterId}:${actionId}`;
    const forest = state.forestState;
    if (forest.encounters.includes(key)) throw new Error('ENCOUNTER_ALREADY_RECORDED');
    forest.encounters.push(key);
    forest.bonds[characterId] = Number(forest.bonds[characterId] || 0) + encounter.affinity;
    if (!forest.fragments.includes(encounter.fragment)) forest.fragments.push(encounter.fragment);
    if (forest.bonds[characterId] >= 3 && !forest.fragments.includes(`${characterId}:trusted`)) forest.fragments.push(`${characterId}:trusted`);
    state.forestState = forest;
    await save(state);
    return { dialogue: encounter.line, affinity: forest.bonds[characterId], fragment: encounter.fragment, trusted: forest.bonds[characterId] >= 3, pointsAwarded: 0 };
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
    const state = await load(id);
    const currentDay = campaignDay(new Date(), CAMPAIGN_START);
    const day = DAILY_CONTENT[Number(dayNumber) - 1];
    if (!day || day.day > currentDay) throw new Error('CONTENT_NOT_RELEASED');
    const completed = state.forestState.completedDays || [];
    if (day.day > 1 && !completed.includes(day.day - 1)) throw new Error('PREVIOUS_DAY_REQUIRED');
    if (String(answer || '').trim().toLowerCase() !== day.answer.toLowerCase()) return { correct: false, completed: false };
    if (!completed.includes(day.day)) completed.push(day.day);
    state.forestState.completedDays = completed.sort((a, b) => a - b);
    if (!state.forestState.fragments.includes(day.collectible)) state.forestState.fragments.push(day.collectible);
    await save(state);
    return { correct: true, completed: true, collectible: day.collectible, pointsAwarded: 0 };
});

export const claimReward = webMethod(Permissions.SiteMember, async () => {
    const id = await memberId();
    const state = await load(id);
    if (!state.caveUnlocked || !state.lootgremState?.claimAuthorized) throw new Error('REWARD_GATE_INCOMPLETE');
    if (state.rewardStatus === 'awarded') return { status: 'awarded', alreadyAwarded: true, points: REWARD_POINTS };
    if (!REWARD_ISSUANCE_ENABLED) {
        return { status: 'disabled', points: 0, message: 'Reward issuance is disabled until integration testing is approved.' };
    }

    const loyalty = await accounts.getCurrentMemberAccount();
    const accountId = loyalty?.account?._id || loyalty?.account?.id;
    if (!accountId) throw new Error('LOYALTY_ACCOUNT_REQUIRED');
    const idempotencyKey = id;
    state.rewardStatus = 'pending';
    state.rewardIdempotencyKey = idempotencyKey;
    await save(state);

    const elevatedEarnPoints = elevate(accounts.earnPoints);
    const result = await elevatedEarnPoints(accountId, {
        amount: REWARD_POINTS,
        description: 'THE RABBIT HOLE — LOOTGREM treasure',
        appId: MANUAL_LOYALTY_APP_ID,
        idempotencyKey
    });
    state.rewardStatus = 'awarded';
    state.rewardTransactionId = result?.transactionId || result?.transaction_id || '';
    state.rewardIssuedAt = new Date();
    await save(state);
    return { status: 'awarded', alreadyAwarded: false, points: REWARD_POINTS, transactionId: state.rewardTransactionId };
});
