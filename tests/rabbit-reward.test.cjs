const test = require('node:test');
const assert = require('node:assert/strict');

const {
    beginRewardClaim,
    beginCheckoutCodeClaim,
    finalizeRewardClaim,
    markRewardClaimUncertain
} = require('../src/backend/rabbitReward.js');

const now = new Date('2026-10-28T04:00:00.000Z');
const eligible = {
    caveUnlocked: true,
    lootgremState: { claimAuthorized: true },
    rewardChoice: 'loyalty_points',
    rewardStatus: 'eligible'
};

test('a reward claim requires the complete cave and explicit points choice', () => {
    assert.throws(() => beginRewardClaim({ ...eligible, caveUnlocked: false }, { memberId: 'member-a', now }), /REWARD_GATE_INCOMPLETE/);
    assert.throws(() => beginRewardClaim({ ...eligible, rewardChoice: 'checkout_code' }, { memberId: 'member-a', now }), /REWARD_CHOICE_MISMATCH/);
});

test('starting a claim creates one stable member idempotency key', () => {
    const started = beginRewardClaim(eligible, { memberId: 'member-a', now });

    assert.equal(started.action, 'call_provider');
    assert.equal(started.idempotencyKey, 'rabbit-hole:member-a');
    assert.equal(started.state.rewardStatus, 'pending');
    assert.equal(started.state.rewardIdempotencyKey, 'rabbit-hole:member-a');
    assert.equal(started.state.rewardPendingAt, now.toISOString());
});

test('pending and uncertain claims fail closed instead of calling the provider again', () => {
    assert.throws(() => beginRewardClaim({ ...eligible, rewardStatus: 'pending' }, { memberId: 'member-a', now }), /REWARD_CLAIM_IN_PROGRESS/);
    assert.throws(() => beginRewardClaim({ ...eligible, rewardStatus: 'reconciliation_required' }, { memberId: 'member-a', now }), /REWARD_RECONCILIATION_REQUIRED/);
});

test('an awarded claim is idempotent and does not call the provider again', () => {
    const result = beginRewardClaim({ ...eligible, rewardStatus: 'awarded', rewardTransactionId: 'txn-1' }, { memberId: 'member-a', now });

    assert.equal(result.action, 'already_awarded');
    assert.equal(result.transactionId, 'txn-1');
});

test('only the matching pending claim can be finalized', () => {
    const started = beginRewardClaim(eligible, { memberId: 'member-a', now });
    assert.throws(() => finalizeRewardClaim(started.state, {
        idempotencyKey: 'rabbit-hole:member-b', transactionId: 'txn-1', now
    }), /REWARD_CLAIM_MISMATCH/);

    const completed = finalizeRewardClaim(started.state, {
        idempotencyKey: started.idempotencyKey, transactionId: 'txn-1', now
    });
    assert.equal(completed.rewardStatus, 'awarded');
    assert.equal(completed.rewardTransactionId, 'txn-1');
    assert.equal(completed.rewardIssuedAt, now.toISOString());
});

test('an uncertain provider result is quarantined for reconciliation', () => {
    const started = beginRewardClaim(eligible, { memberId: 'member-a', now });
    const uncertain = markRewardClaimUncertain(started.state, {
        idempotencyKey: started.idempotencyKey, now
    });

    assert.equal(uncertain.rewardStatus, 'reconciliation_required');
    assert.equal(uncertain.rewardUncertainAt, now.toISOString());
});

test('a checkout code claim is gated and idempotent', () => {
    const codeEligible = { ...eligible, rewardChoice: 'checkout_code' };
    const issued = beginCheckoutCodeClaim(codeEligible, { now });

    assert.equal(issued.action, 'issue_code');
    assert.equal(issued.state.rewardStatus, 'code_issued');
    assert.equal(issued.state.rewardIssuedAt, now.toISOString());

    const repeated = beginCheckoutCodeClaim(issued.state, { now: new Date(now.getTime() + 1000) });
    assert.equal(repeated.action, 'already_issued');
    assert.equal(repeated.state.rewardIssuedAt, now.toISOString());
});

test('checkout code and loyalty point claims are mutually exclusive', () => {
    assert.throws(
        () => beginRewardClaim({ ...eligible, rewardStatus: 'code_issued' }, { memberId: 'member-a', now }),
        /REWARD_ALREADY_CLAIMED/
    );
    assert.throws(
        () => beginCheckoutCodeClaim({ ...eligible, rewardChoice: 'checkout_code', rewardStatus: 'awarded' }, { now }),
        /REWARD_ALREADY_CLAIMED/
    );
    assert.throws(
        () => beginCheckoutCodeClaim({ ...eligible, rewardChoice: 'checkout_code', rewardStatus: 'pending' }, { now }),
        /REWARD_CLAIM_IN_PROGRESS/
    );
    assert.throws(
        () => beginCheckoutCodeClaim({ ...eligible, rewardChoice: 'checkout_code', rewardStatus: 'reconciliation_required' }, { now }),
        /REWARD_RECONCILIATION_REQUIRED/
    );
});
