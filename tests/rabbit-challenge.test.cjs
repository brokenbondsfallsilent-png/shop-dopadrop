const test = require('node:test');
const assert = require('node:assert/strict');

const {
    issueChallenge,
    verifyChallenge,
    CHALLENGE_MIN_AGE_MS,
    CHALLENGE_TTL_MS,
    CHALLENGE_WINDOW_MS,
    CHALLENGE_LIMIT
} = require('../src/backend/rabbitChallenge.js');

const base = new Date('2026-10-28T01:00:00.000Z');

test('a challenge is bound to one member, next button, and owning page', () => {
    const issued = issueChallenge({}, {
        memberId: 'member-a', buttonId: 7, pagePath: '/about', now: base, token: 'opaque-token'
    });
    const challenge = issued.state.activeChallenge;
    const acceptedAt = new Date(base.getTime() + CHALLENGE_MIN_AGE_MS);

    assert.equal(verifyChallenge(challenge, {
        memberId: 'member-a', buttonId: 7, pagePath: '/about', token: 'opaque-token', stateVersion: 1, now: acceptedAt
    }).ok, true);
    assert.throws(() => verifyChallenge(challenge, {
        memberId: 'member-b', buttonId: 7, pagePath: '/about', token: 'opaque-token', stateVersion: 1, now: acceptedAt
    }), /CHALLENGE_MEMBER_MISMATCH/);
    assert.throws(() => verifyChallenge(challenge, {
        memberId: 'member-a', buttonId: 8, pagePath: '/about', token: 'opaque-token', stateVersion: 1, now: acceptedAt
    }), /CHALLENGE_STEP_MISMATCH/);
    assert.throws(() => verifyChallenge(challenge, {
        memberId: 'member-a', buttonId: 7, pagePath: '/contact', token: 'opaque-token', stateVersion: 1, now: acceptedAt
    }), /CHALLENGE_PAGE_MISMATCH/);
});

test('instant, expired, replayed, and forged challenge completions are rejected', () => {
    const issued = issueChallenge({}, {
        memberId: 'member-a', buttonId: 1, pagePath: '/', now: base, token: 'real-token'
    });
    const challenge = issued.state.activeChallenge;

    assert.throws(() => verifyChallenge(challenge, {
        memberId: 'member-a', buttonId: 1, pagePath: '/', token: 'real-token', stateVersion: 1, now: base
    }), /CHALLENGE_TOO_FAST/);
    assert.throws(() => verifyChallenge(challenge, {
        memberId: 'member-a', buttonId: 1, pagePath: '/', token: 'fake-token', stateVersion: 1, now: new Date(base.getTime() + CHALLENGE_MIN_AGE_MS)
    }), /CHALLENGE_TOKEN_INVALID/);
    assert.throws(() => verifyChallenge({ ...challenge, usedAt: acceptedIso() }, {
        memberId: 'member-a', buttonId: 1, pagePath: '/', token: 'real-token', stateVersion: 1, now: new Date(base.getTime() + CHALLENGE_MIN_AGE_MS)
    }), /CHALLENGE_ALREADY_USED/);
    assert.throws(() => verifyChallenge(challenge, {
        memberId: 'member-a', buttonId: 1, pagePath: '/', token: 'real-token', stateVersion: 1, now: new Date(base.getTime() + CHALLENGE_TTL_MS + 1)
    }), /CHALLENGE_EXPIRED/);
});

test('challenge verification requires the bound hunt-state revision', () => {
    const challenge = issueChallenge({ version: 7 }, {
        memberId: 'member-a', buttonId: 1, pagePath: '/', now: base, token: 'real-token'
    }).state.activeChallenge;
    const acceptedAt = new Date(base.getTime() + CHALLENGE_MIN_AGE_MS);

    assert.throws(() => verifyChallenge(challenge, {
        memberId: 'member-a', buttonId: 1, pagePath: '/', token: 'real-token', now: acceptedAt
    }), /CHALLENGE_STATE_REQUIRED/);
    assert.throws(() => verifyChallenge(challenge, {
        memberId: 'member-a', buttonId: 1, pagePath: '/', token: 'real-token', stateVersion: 'seven', now: acceptedAt
    }), /CHALLENGE_STATE_REQUIRED/);
});

test('the persisted challenge contains only a token digest', () => {
    const issued = issueChallenge({}, {
        memberId: 'member-a', buttonId: 1, pagePath: '/', now: base, token: 'real-token'
    });

    assert.equal(issued.token, 'real-token');
    assert.equal(issued.state.activeChallenge.token, undefined);
    assert.equal(
        issued.state.activeChallenge.tokenDigest,
        '1a2379b4b1e6ec841868f5955f4678184b41b948ded6965cdbb2a32a88db85ef'
    );
});

test('a challenge cannot complete against a newer hunt-state revision', () => {
    const issued = issueChallenge({ version: 7 }, {
        memberId: 'member-a', buttonId: 1, pagePath: '/', now: base, token: 'real-token'
    });

    assert.throws(() => verifyChallenge(issued.state.activeChallenge, {
        memberId: 'member-a', buttonId: 1, pagePath: '/', token: 'real-token',
        stateVersion: 8, now: new Date(base.getTime() + CHALLENGE_MIN_AGE_MS)
    }), /CHALLENGE_STATE_CHANGED/);
});

test('challenge issuance is capped per rolling member window', () => {
    let state = {};
    for (let index = 0; index < CHALLENGE_LIMIT; index += 1) {
        state = issueChallenge(state, {
            memberId: 'member-a', buttonId: 1, pagePath: '/',
            now: new Date(base.getTime() + index), token: `token-${index}`
        }).state;
    }
    assert.throws(() => issueChallenge(state, {
        memberId: 'member-a', buttonId: 1, pagePath: '/',
        now: new Date(base.getTime() + CHALLENGE_LIMIT), token: 'one-too-many'
    }), /CHALLENGE_RATE_LIMITED/);

    const afterWindow = issueChallenge(state, {
        memberId: 'member-a', buttonId: 1, pagePath: '/',
        now: new Date(base.getTime() + CHALLENGE_WINDOW_MS + CHALLENGE_LIMIT + 1), token: 'new-window'
    });
    assert.equal(afterWindow.state.challengeIssueTimes.length, 1);
});

test('malformed persisted issue times are discarded without bypassing valid rate limits', () => {
    const validTimes = Array.from(
        { length: CHALLENGE_LIMIT - 1 },
        (_, index) => new Date(base.getTime() + index).toISOString()
    );
    const issued = issueChallenge({
        version: 3,
        challengeIssueTimes: ['not-a-date', ...validTimes, null, {}, Number.POSITIVE_INFINITY]
    }, {
        memberId: 'member-a',
        buttonId: 1,
        pagePath: '/',
        now: new Date(base.getTime() + CHALLENGE_LIMIT),
        token: 'last-allowed-token'
    });

    assert.equal(issued.state.challengeIssueTimes.length, CHALLENGE_LIMIT);
    assert.throws(() => issueChallenge(issued.state, {
        memberId: 'member-a',
        buttonId: 1,
        pagePath: '/',
        now: new Date(base.getTime() + CHALLENGE_LIMIT + 1),
        token: 'one-too-many'
    }), /CHALLENGE_RATE_LIMITED/);
});

function acceptedIso() {
    return new Date(base.getTime() + CHALLENGE_MIN_AGE_MS).toISOString();
}
