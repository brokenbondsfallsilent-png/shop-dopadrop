const test = require('node:test');
const assert = require('node:assert/strict');

const { buildRabbitDashboard } = require('../src/backend/rabbitDashboard.js');

const profile = {
    rank: { level: 4, title: 'DopaScout' },
    progressionXp: 120,
    sensoryIdentity: 'Glow Goblin',
    selectedTitles: ['Clue Goblin'],
    unlockedTitles: ['Clue Goblin'],
    quest: { title: 'Pathfinder' },
    visibility: { rank: true },
    publicProfile: { rank: 'DopaScout' },
    memberId: 'must-not-leak'
};

const hunt = {
    found: 20,
    required: 50,
    caveUnlocked: false,
    caveEntered: false,
    rewardStatus: 'eligible',
    nextButtonId: 21,
    nextPage: '/shipping-policy',
    stage: { threshold: 30, label: 'SECOND FOREST ENCOUNTER', difficulty: 'HARDER' },
    forest: {
        encounters: ['mothkeeper:wait'],
        fragments: ['Lantern Oath', 'Forest Chronicle: Day One'],
        completedDays: [1]
    },
    activeChallenge: { tokenDigest: 'must-not-leak' },
    rewardIdempotencyKey: 'must-not-leak',
    rewardTransactionId: 'must-not-leak'
};

test('the dashboard combines member identity with live hunt progress and pathways', () => {
    const dashboard = buildRabbitDashboard({ profile, hunt, currentDay: 3, campaignStart: '2026-10-30' });

    assert.deepEqual(dashboard.progress, {
        found: 20, required: 50, percent: 40, nextButtonId: 21, nextPage: '/shipping-policy'
    });
    assert.equal(dashboard.identity.rank.title, 'DopaScout');
    assert.equal(dashboard.daily.currentDay, 3);
    assert.deepEqual(dashboard.daily.completedDays, [1]);
    assert.equal(dashboard.forest.completedEncounters, 1);
    assert.equal(dashboard.forest.collectedFragments, 2);
    assert.deepEqual(dashboard.pathways, {
        hunt: '/', forest: '/rabbit-hole-forest', daily: '/rabbit-hole-daily', cave: '/rabbit-hole-cave', account: '/profile/my/profile'
    });
});

test('the dashboard exposes only whitelisted member-safe fields', () => {
    const dashboard = buildRabbitDashboard({ profile, hunt, currentDay: 3, campaignStart: '2026-10-30' });
    const serialized = JSON.stringify(dashboard);

    assert.doesNotMatch(serialized, /must-not-leak/);
    assert.doesNotMatch(serialized, /tokenDigest|Idempotency|TransactionId|memberId/);
});

test('the dashboard next action follows authoritative hunt and reward state', () => {
    assert.equal(buildRabbitDashboard({ profile, hunt }).nextAction, 'find_next_secret');
    assert.equal(buildRabbitDashboard({ profile, hunt: { ...hunt, found: 50, caveUnlocked: true } }).nextAction, 'enter_cave');
    assert.equal(buildRabbitDashboard({ profile, hunt: { ...hunt, found: 50, caveUnlocked: true, caveEntered: true, rewardStatus: 'eligible' } }).nextAction, 'talk_to_lootgrem');
    assert.equal(buildRabbitDashboard({ profile, hunt: { ...hunt, found: 50, caveUnlocked: true, caveEntered: true, rewardStatus: 'reconciliation_required' } }).nextAction, 'reward_support_required');
    assert.equal(buildRabbitDashboard({ profile, hunt: { ...hunt, found: 50, caveUnlocked: true, caveEntered: true, rewardStatus: 'awarded' } }).nextAction, 'journey_complete');
});

test('the dashboard routes an authorized member to the selected safe reward pathway', () => {
    const completed = {
        found: 50,
        required: 50,
        caveUnlocked: true,
        caveEntered: true,
        rewardStatus: 'eligible',
        lootgrem: { node: 'reward', claimAuthorized: true }
    };
    const codeDashboard = buildRabbitDashboard({
        profile,
        hunt: { ...completed, rewardChoice: 'checkout_code' }
    });
    const pointsDashboard = buildRabbitDashboard({
        profile,
        hunt: { ...completed, rewardChoice: 'loyalty_points' }
    });

    assert.equal(codeDashboard.reward.choice, 'checkout_code');
    assert.equal(codeDashboard.nextAction, 'claim_checkout_code');
    assert.equal(pointsDashboard.reward.choice, 'loyalty_points');
    assert.equal(pointsDashboard.nextAction, 'loyalty_points_unavailable');
});

test('unknown reward choices are not exposed or treated as actionable', () => {
    const dashboard = buildRabbitDashboard({ profile, hunt: {
        found: 50,
        required: 50,
        caveUnlocked: true,
        caveEntered: true,
        rewardStatus: 'eligible',
        rewardChoice: 'provider-secret',
        lootgrem: { node: 'reward', claimAuthorized: true }
    } });

    assert.equal(dashboard.reward.choice, null);
    assert.equal(dashboard.nextAction, 'talk_to_lootgrem');
    assert.doesNotMatch(JSON.stringify(dashboard), /provider-secret/);
});
