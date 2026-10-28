const test = require('node:test');
const assert = require('node:assert/strict');

const { transitionLootgrem } = require('../src/backend/rabbitContent.js');

test('the reward dialogue offers both explicit reward choices', () => {
    const points = transitionLootgrem({ node: 'reward', claimAuthorized: false }, 'reward', 'claim');
    const code = transitionLootgrem({ node: 'reward', claimAuthorized: false }, 'reward', 'code');

    assert.deepEqual(points.state, { node: 'reward', claimAuthorized: true });
    assert.equal(points.rewardChoice, 'loyalty_points');
    assert.deepEqual(code.state, { node: 'reward', claimAuthorized: true });
    assert.equal(code.rewardChoice, 'checkout_code');
});

test('choosing the checkout code does not reveal it before the claim endpoint', () => {
    const result = transitionLootgrem({ node: 'reward', claimAuthorized: false }, 'reward', 'code');

    assert.deepEqual(result.response, { next: 'code', requiresExplicitClaim: true });
    assert.equal(JSON.stringify(result).includes('LOOTGREM'), false);
});

test('dialogue transitions reject stale nodes and unavailable choices', () => {
    assert.throws(
        () => transitionLootgrem({ node: 'welcome', claimAuthorized: false }, 'reward', 'claim'),
        /DIALOGUE_OUT_OF_SEQUENCE/
    );
    assert.throws(
        () => transitionLootgrem({ node: 'welcome', claimAuthorized: false }, 'welcome', 'code'),
        /INVALID_DIALOGUE_CHOICE/
    );
});

test('a started or completed reward locks the dialogue choice', () => {
    for (const rewardStatus of ['pending', 'reconciliation_required', 'awarded', 'code_issued']) {
        assert.throws(
            () => transitionLootgrem(
                { node: 'reward', claimAuthorized: true },
                'reward',
                'code',
                { rewardStatus, rewardChoice: 'loyalty_points' }
            ),
            /REWARD_CHOICE_LOCKED/
        );
    }
});
