function iso(value) {
    const date = new Date(value || new Date());
    if (!Number.isFinite(date.getTime())) throw new Error('REWARD_TIME_INVALID');
    return date.toISOString();
}

function requireEligible(state) {
    if (!state?.caveUnlocked || !state?.lootgremState?.claimAuthorized) {
        throw new Error('REWARD_GATE_INCOMPLETE');
    }
    if (state.rewardChoice !== 'loyalty_points') throw new Error('REWARD_CHOICE_MISMATCH');
}

export function beginRewardClaim(state = {}, request = {}) {
    requireEligible(state);
    if (!request.memberId) throw new Error('REWARD_MEMBER_REQUIRED');
    if (state.rewardStatus === 'code_issued') throw new Error('REWARD_ALREADY_CLAIMED');
    if (state.rewardStatus === 'awarded') {
        return { action: 'already_awarded', state, transactionId: state.rewardTransactionId || '' };
    }
    if (state.rewardStatus === 'pending') throw new Error('REWARD_CLAIM_IN_PROGRESS');
    if (state.rewardStatus === 'reconciliation_required') throw new Error('REWARD_RECONCILIATION_REQUIRED');

    const idempotencyKey = `rabbit-hole:${request.memberId}`;
    return {
        action: 'call_provider',
        idempotencyKey,
        state: {
            ...state,
            rewardStatus: 'pending',
            rewardIdempotencyKey: idempotencyKey,
            rewardPendingAt: iso(request.now)
        }
    };
}

export function beginCheckoutCodeClaim(state = {}, request = {}) {
    if (!state?.caveUnlocked || !state?.lootgremState?.claimAuthorized) {
        throw new Error('REWARD_GATE_INCOMPLETE');
    }
    if (state.rewardChoice !== 'checkout_code') throw new Error('REWARD_CHOICE_MISMATCH');
    if (state.rewardStatus === 'awarded') throw new Error('REWARD_ALREADY_CLAIMED');
    if (state.rewardStatus === 'pending') throw new Error('REWARD_CLAIM_IN_PROGRESS');
    if (state.rewardStatus === 'reconciliation_required') throw new Error('REWARD_RECONCILIATION_REQUIRED');
    if (state.rewardStatus === 'code_issued') return { action: 'already_issued', state };
    return {
        action: 'issue_code',
        state: {
            ...state,
            rewardStatus: 'code_issued',
            rewardIssuedAt: iso(request.now)
        }
    };
}

function requireMatchingPending(state, idempotencyKey) {
    if (state?.rewardStatus !== 'pending' || state.rewardIdempotencyKey !== idempotencyKey) {
        throw new Error('REWARD_CLAIM_MISMATCH');
    }
}

export function finalizeRewardClaim(state = {}, result = {}) {
    requireMatchingPending(state, result.idempotencyKey);
    if (!result.transactionId) throw new Error('REWARD_TRANSACTION_REQUIRED');
    return {
        ...state,
        rewardStatus: 'awarded',
        rewardTransactionId: result.transactionId,
        rewardIssuedAt: iso(result.now)
    };
}

export function markRewardClaimUncertain(state = {}, result = {}) {
    requireMatchingPending(state, result.idempotencyKey);
    return {
        ...state,
        rewardStatus: 'reconciliation_required',
        rewardUncertainAt: iso(result.now)
    };
}
