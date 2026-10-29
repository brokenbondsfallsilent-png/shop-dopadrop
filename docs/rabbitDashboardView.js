(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.RabbitDashboardView = api;
}(typeof window !== 'undefined' ? window : this, function () {
    const SAFE_REWARD_STATUSES = new Set([
        'not_eligible', 'eligible', 'pending', 'reconciliation_required', 'awarded', 'code_issued'
    ]);

    function count(value, maximum = Number.MAX_SAFE_INTEGER) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? Math.min(maximum, Math.max(0, Math.floor(parsed))) : 0;
    }

    function plural(value, singular, pluralForm = `${singular}s`) {
        return `${value} ${value === 1 ? singular : pluralForm}`;
    }

    function rewardLabel(reward = {}) {
        const status = SAFE_REWARD_STATUSES.has(reward.status) ? reward.status : 'not_eligible';
        if (status === 'code_issued') return 'Checkout treasure issued';
        if (status === 'awarded') return 'Loyalty treasure awarded';
        if (status === 'pending') return 'Treasure processing';
        if (status === 'reconciliation_required') return 'Treasure needs support';
        if (status === 'eligible') return reward.liveIssuanceEnabled
            ? 'Treasure eligible'
            : 'Treasure eligible · live points disabled';
        return 'Treasure locked';
    }

    function primaryLabel(snapshot, found) {
        switch (snapshot.nextAction) {
        case 'find_next_secret': return `Find secret ${found + 1}`;
        case 'enter_cave': return 'Enter the cave';
        case 'talk_to_lootgrem': return 'Talk to Lootgrem';
        case 'claim_checkout_code': return 'Claim checkout treasure';
        case 'loyalty_points_unavailable': return 'Review treasure choice';
        case 'reward_processing': return 'Check treasure status';
        case 'reward_support_required': return 'Get treasure support';
        case 'journey_complete': return 'View account';
        default: return 'Continue the hunt';
        }
    }

    function buildDashboardView(snapshot) {
        if (!snapshot || typeof snapshot !== 'object') return { signedIn: false };
        const identity = snapshot.identity || {};
        const rank = identity.rank || {};
        const progress = snapshot.progress || {};
        const forest = snapshot.forest || {};
        const daily = snapshot.daily || {};
        const found = count(progress.found);
        const required = Math.max(1, count(progress.required));
        const completedDays = Array.isArray(daily.completedDays)
            ? daily.completedDays.filter(value => Number.isInteger(value) && value >= 1 && value <= 30).length
            : 0;
        const encounters = count(forest.completedEncounters);
        const fragments = count(forest.collectedFragments);
        return {
            signedIn: true,
            rank: `${String(rank.title || 'DopaSprout')} · Level ${count(rank.level)}`,
            identity: identity.sensoryIdentity ? String(identity.sensoryIdentity) : 'Identity not selected',
            xp: `${count(identity.progressionXp)} XP`,
            progress: `${found} / ${required}`,
            percent: count(progress.percent, 100),
            forest: `${plural(encounters, 'encounter')} · ${plural(fragments, 'fragment')}`,
            daily: `${completedDays} / ${count(daily.currentDay, 30)} daily riddles`,
            reward: rewardLabel(snapshot.reward),
            primary: { label: primaryLabel(snapshot, found), action: 'dashboard-next' }
        };
    }

    return { buildDashboardView };
}));
