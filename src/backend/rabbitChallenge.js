import { createHash, timingSafeEqual } from 'crypto';

export const CHALLENGE_MIN_AGE_MS = 350;
export const CHALLENGE_TTL_MS = 2 * 60 * 1000;
export const CHALLENGE_WINDOW_MS = 60 * 1000;
export const CHALLENGE_LIMIT = 12;

function timestamp(value) {
    const time = new Date(value).getTime();
    if (!Number.isFinite(time)) throw new Error('CHALLENGE_TIME_INVALID');
    return time;
}

function tokenDigest(token) {
    return createHash('sha256').update(String(token), 'utf8').digest('hex');
}

export function issueChallenge(previous = {}, request = {}) {
    const nowMs = timestamp(request.now || new Date());
    const windowStart = nowMs - CHALLENGE_WINDOW_MS;
    const storedIssueTimes = previous.challengeIssueTimes;
    const recent = (Array.isArray(storedIssueTimes) ? storedIssueTimes : [])
        .map(value => new Date(value).getTime())
        .filter(Number.isFinite)
        .filter(time => time > windowStart && time <= nowMs);
    if (recent.length >= CHALLENGE_LIMIT) throw new Error('CHALLENGE_RATE_LIMITED');
    if (!request.memberId || !request.token) throw new Error('CHALLENGE_INPUT_INVALID');
    if (!Number.isInteger(request.buttonId) || typeof request.pagePath !== 'string') throw new Error('CHALLENGE_INPUT_INVALID');

    const challenge = {
        memberId: request.memberId,
        buttonId: request.buttonId,
        pagePath: request.pagePath,
        stateVersion: Number(previous.version || 1),
        tokenDigest: tokenDigest(request.token),
        issuedAt: new Date(nowMs).toISOString(),
        expiresAt: new Date(nowMs + CHALLENGE_TTL_MS).toISOString(),
        usedAt: null
    };
    return {
        ...challenge,
        token: request.token,
        state: {
            ...previous,
            activeChallenge: challenge,
            challengeIssueTimes: [...recent, nowMs]
        }
    };
}

export function verifyChallenge(challenge, attempt = {}) {
    if (!challenge) throw new Error('CHALLENGE_REQUIRED');
    if (challenge.usedAt) throw new Error('CHALLENGE_ALREADY_USED');
    if (attempt.memberId !== challenge.memberId) throw new Error('CHALLENGE_MEMBER_MISMATCH');
    if (attempt.buttonId !== challenge.buttonId) throw new Error('CHALLENGE_STEP_MISMATCH');
    if (attempt.pagePath !== challenge.pagePath) throw new Error('CHALLENGE_PAGE_MISMATCH');
    if (!Number.isInteger(attempt.stateVersion)) throw new Error('CHALLENGE_STATE_REQUIRED');
    if (!Number.isInteger(challenge.stateVersion)) throw new Error('CHALLENGE_STATE_INVALID');
    if (attempt.stateVersion !== challenge.stateVersion) {
        throw new Error('CHALLENGE_STATE_CHANGED');
    }
    const suppliedDigest = Buffer.from(tokenDigest(attempt.token), 'hex');
    const storedDigest = /^[a-f0-9]{64}$/.test(challenge.tokenDigest || '')
        ? Buffer.from(challenge.tokenDigest, 'hex')
        : Buffer.alloc(0);
    if (suppliedDigest.length !== storedDigest.length || !timingSafeEqual(suppliedDigest, storedDigest)) {
        throw new Error('CHALLENGE_TOKEN_INVALID');
    }

    const nowMs = timestamp(attempt.now || new Date());
    const issuedAt = timestamp(challenge.issuedAt);
    const expiresAt = timestamp(challenge.expiresAt);
    if (nowMs < issuedAt + CHALLENGE_MIN_AGE_MS) throw new Error('CHALLENGE_TOO_FAST');
    if (nowMs > expiresAt) throw new Error('CHALLENGE_EXPIRED');
    return { ok: true, challenge: { ...challenge, usedAt: new Date(nowMs).toISOString() } };
}
