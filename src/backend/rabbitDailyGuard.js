export const DAILY_ATTEMPT_LIMIT = 6;
export const DAILY_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

function dayKey(day) {
    const value = Number(day);
    if (!Number.isInteger(value) || value < 1 || value > 30) throw new Error('DAILY_DAY_INVALID');
    return String(value);
}

function time(value) {
    const result = new Date(value).getTime();
    if (!Number.isFinite(result)) throw new Error('DAILY_TIME_INVALID');
    return result;
}

export function inspectDailyAttempts(state = {}, day, now = new Date()) {
    const key = dayKey(day);
    const nowMs = time(now);
    const windowStart = nowMs - DAILY_ATTEMPT_WINDOW_MS;
    const stored = state.dailyAttemptWindows?.[key];
    const recent = (Array.isArray(stored) ? stored : [])
        .map(attempt => new Date(attempt).getTime())
        .filter(Number.isFinite)
        .filter(attempt => attempt > windowStart && attempt <= nowMs)
        .sort((a, b) => a - b);
    const nextState = {
        ...state,
        dailyAttemptWindows: { ...(state.dailyAttemptWindows || {}), [key]: recent }
    };
    if (recent.length >= DAILY_ATTEMPT_LIMIT) {
        const error = new Error('DAILY_ATTEMPT_LIMITED');
        error.retryAfterMs = Math.max(1, recent[0] + DAILY_ATTEMPT_WINDOW_MS - nowMs + 1);
        throw error;
    }
    return { state: nextState, remaining: DAILY_ATTEMPT_LIMIT - recent.length };
}

export function recordDailyResult(state = {}, day, now = new Date(), correct = false) {
    const key = dayKey(day);
    const nowMs = time(now);
    const inspected = inspectDailyAttempts(state, day, nowMs);
    const attempts = correct
        ? []
        : [...inspected.state.dailyAttemptWindows[key], nowMs];
    return {
        state: {
            ...inspected.state,
            dailyAttemptWindows: { ...inspected.state.dailyAttemptWindows, [key]: attempts }
        },
        remaining: correct ? DAILY_ATTEMPT_LIMIT : Math.max(0, DAILY_ATTEMPT_LIMIT - attempts.length)
    };
}
