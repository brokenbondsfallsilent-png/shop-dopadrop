const test = require('node:test');
const assert = require('node:assert/strict');

const { normaliseRabbitDetails } = require('../src/backend/rabbitState.js');

test('missing nested hunt state receives safe complete defaults', () => {
    assert.deepEqual(normaliseRabbitDetails(), {
        forestState: { bonds: {}, fragments: [], encounters: [], completedDays: [] },
        lootgremState: { node: 'welcome', claimAuthorized: false },
        rewardStatus: 'not_eligible',
        rewardChoice: null
    });
});

test('malformed forest state preserves only valid progress', () => {
    const result = normaliseRabbitDetails({
        forestState: {
            bonds: { mothkeeper: 2, rootwhisper: -1, bad: 'lots' },
            fragments: ['Lantern Oath', 'Lantern Oath', 4, 'Seed Promise'],
            encounters: ['mothkeeper:wait', 'wrong:step', 'rootwhisper:protect'],
            completedDays: [3, 1, 3, 0, 31, '2']
        }
    });

    assert.deepEqual(result.forestState, {
        bonds: { mothkeeper: 2 },
        fragments: ['Lantern Oath', 'Seed Promise'],
        encounters: ['mothkeeper:wait'],
        completedDays: [1, 3]
    });
});

test('unknown dialogue and reward values fail closed', () => {
    const invalid = normaliseRabbitDetails({
        lootgremState: { node: 'admin', claimAuthorized: true },
        rewardStatus: 'free_money',
        rewardChoice: 'both'
    });
    const authorized = normaliseRabbitDetails({
        lootgremState: { node: 'reward', claimAuthorized: true },
        rewardStatus: 'eligible',
        rewardChoice: 'checkout_code'
    });

    assert.deepEqual(invalid.lootgremState, { node: 'welcome', claimAuthorized: false });
    assert.equal(invalid.rewardStatus, 'not_eligible');
    assert.equal(invalid.rewardChoice, null);
    assert.deepEqual(authorized.lootgremState, { node: 'reward', claimAuthorized: true });
    assert.equal(authorized.rewardStatus, 'eligible');
    assert.equal(authorized.rewardChoice, 'checkout_code');
});
