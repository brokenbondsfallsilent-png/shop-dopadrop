const test = require('node:test');
const assert = require('node:assert/strict');

const { buildDashboardView } = require('../src/public/rabbitDashboardView.js');

test('the gem dashboard presents member identity and progress from the safe snapshot', () => {
    const view = buildDashboardView({
        identity: {
            rank: { level: 4, title: 'DopaScout' },
            progressionXp: 120,
            sensoryIdentity: 'Glow Goblin'
        },
        progress: { found: 20, required: 50, percent: 40, nextPage: '/shipping-policy' },
        forest: { completedEncounters: 1, collectedFragments: 2 },
        daily: { currentDay: 3, completedDays: [1] },
        reward: { status: 'eligible', liveIssuanceEnabled: false },
        nextAction: 'find_next_secret'
    });

    assert.deepEqual(view, {
        signedIn: true,
        rank: 'DopaScout · Level 4',
        identity: 'Glow Goblin',
        xp: '120 XP',
        progress: '20 / 50',
        percent: 40,
        forest: '1 encounter · 2 fragments',
        daily: '1 / 3 daily riddles',
        reward: 'Treasure eligible · live points disabled',
        primary: { label: 'Find secret 21', action: 'dashboard-next' }
    });
});

test('the gem dashboard gives completed members a stable account pathway', () => {
    const view = buildDashboardView({
        identity: { rank: { level: 8, title: 'Grand Dopamancer' }, progressionXp: 900 },
        progress: { found: 50, required: 50, percent: 100 },
        forest: { completedEncounters: 3, collectedFragments: 30 },
        daily: { currentDay: 30, completedDays: Array.from({ length: 30 }, (_, index) => index + 1) },
        reward: { status: 'code_issued', choice: 'checkout_code', liveIssuanceEnabled: false },
        nextAction: 'journey_complete'
    });

    assert.equal(view.progress, '50 / 50');
    assert.equal(view.reward, 'Checkout treasure issued');
    assert.deepEqual(view.primary, { label: 'View account', action: 'dashboard-next' });
});

test('the gem dashboard fails closed for absent or malformed snapshots', () => {
    const view = buildDashboardView({
        identity: { rank: { level: -4, title: '<script>' }, progressionXp: 'not-a-number' },
        progress: { found: 90, required: 0, percent: 900 },
        daily: { currentDay: 99, completedDays: ['bad'] },
        reward: { status: 'provider-secret', liveIssuanceEnabled: true },
        nextAction: 'unknown-action'
    });

    assert.equal(view.rank, '<script> · Level 0');
    assert.equal(view.xp, '0 XP');
    assert.equal(view.progress, '90 / 1');
    assert.equal(view.percent, 100);
    assert.equal(view.reward, 'Treasure locked');
    assert.deepEqual(view.primary, { label: 'Continue the hunt', action: 'dashboard-next' });
    assert.equal(buildDashboardView(null).signedIn, false);
});
