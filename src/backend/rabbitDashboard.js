const PATHWAYS = Object.freeze({
    hunt: '/',
    forest: '/rabbit-hole-forest',
    daily: '/rabbit-hole-daily',
    cave: '/rabbit-hole-cave',
    account: '/profile/my/profile'
});

const SAFE_REWARD_STATUSES = new Set([
    'not_eligible', 'eligible', 'pending', 'reconciliation_required', 'awarded', 'code_issued'
]);
const SAFE_REWARD_CHOICES = new Set(['checkout_code', 'loyalty_points']);

function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function strings(value) {
    return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
}

function integers(value) {
    return Array.isArray(value)
        ? [...new Set(value.map(Number).filter(item => Number.isInteger(item) && item >= 1 && item <= 30))].sort((a, b) => a - b)
        : [];
}

function nextAction(hunt) {
    if (!hunt.caveUnlocked) return 'find_next_secret';
    if (!hunt.caveEntered) return 'enter_cave';
    if (hunt.rewardStatus === 'reconciliation_required') return 'reward_support_required';
    if (hunt.rewardStatus === 'pending') return 'reward_processing';
    if (hunt.rewardStatus === 'awarded' || hunt.rewardStatus === 'code_issued') return 'journey_complete';
    if (hunt.lootgrem?.claimAuthorized && hunt.rewardChoice === 'checkout_code') return 'claim_checkout_code';
    if (hunt.lootgrem?.claimAuthorized && hunt.rewardChoice === 'loyalty_points') return 'loyalty_points_unavailable';
    return 'talk_to_lootgrem';
}

export function buildRabbitDashboard(input = {}) {
    const profile = input.profile || {};
    const hunt = input.hunt || {};
    const forest = hunt.forest || {};
    const found = number(hunt.found);
    const required = Math.max(1, number(hunt.required));
    const rewardStatus = SAFE_REWARD_STATUSES.has(hunt.rewardStatus) ? hunt.rewardStatus : 'not_eligible';
    const rewardChoice = SAFE_REWARD_CHOICES.has(hunt.rewardChoice) ? hunt.rewardChoice : null;
    const safeHunt = { ...hunt, rewardStatus, rewardChoice };

    return {
        identity: {
            rank: { level: number(profile.rank?.level), title: String(profile.rank?.title || '') },
            progressionXp: number(profile.progressionXp),
            sensoryIdentity: typeof profile.sensoryIdentity === 'string' ? profile.sensoryIdentity : null,
            selectedTitles: strings(profile.selectedTitles),
            unlockedTitles: strings(profile.unlockedTitles),
            quest: {
                level: number(profile.quest?.level),
                title: String(profile.quest?.title || ''),
                found: number(profile.quest?.found),
                threshold: number(profile.quest?.threshold)
            }
        },
        progress: {
            found,
            required,
            percent: Math.min(100, Math.round((found / required) * 100)),
            nextButtonId: Number.isInteger(hunt.nextButtonId) ? hunt.nextButtonId : null,
            nextPage: typeof hunt.nextPage === 'string' ? hunt.nextPage : null
        },
        stage: hunt.stage ? {
            threshold: number(hunt.stage.threshold),
            label: String(hunt.stage.label || ''),
            difficulty: String(hunt.stage.difficulty || '')
        } : null,
        forest: {
            completedEncounters: strings(forest.encounters).length,
            collectedFragments: strings(forest.fragments).length
        },
        daily: {
            campaignStart: String(input.campaignStart || ''),
            currentDay: Math.min(30, number(input.currentDay)),
            completedDays: integers(forest.completedDays)
        },
        reward: {
            status: rewardStatus,
            choice: rewardChoice,
            liveIssuanceEnabled: false,
            supportRequired: rewardStatus === 'reconciliation_required'
        },
        nextAction: nextAction(safeHunt),
        pathways: { ...PATHWAYS }
    };
}
