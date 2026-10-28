const test = require('node:test');
const assert = require('node:assert/strict');

const {
    inspectDailyAttempts,
    recordDailyResult,
    DAILY_ATTEMPT_LIMIT,
    DAILY_ATTEMPT_WINDOW_MS
} = require('../src/backend/rabbitDailyGuard.js');

const base = new Date('2026-10-28T05:00:00.000Z');

test('wrong daily answers are capped inside the rolling window', () => {
    let state = {};
    for (let index = 0; index < DAILY_ATTEMPT_LIMIT; index += 1) {
        state = recordDailyResult(state, 1, new Date(base.getTime() + index), false).state;
    }

    assert.throws(
        () => inspectDailyAttempts(state, 1, new Date(base.getTime() + DAILY_ATTEMPT_LIMIT)),
        error => error.message === 'DAILY_ATTEMPT_LIMITED' && error.retryAfterMs > 0
    );
});

test('expired failures are pruned and attempts become available again', () => {
    let state = {};
    for (let index = 0; index < DAILY_ATTEMPT_LIMIT; index += 1) {
        state = recordDailyResult(state, 1, new Date(base.getTime() + index), false).state;
    }
    const afterWindow = new Date(base.getTime() + DAILY_ATTEMPT_WINDOW_MS + DAILY_ATTEMPT_LIMIT + 1);
    const inspected = inspectDailyAttempts(state, 1, afterWindow);

    assert.equal(inspected.remaining, DAILY_ATTEMPT_LIMIT);
    assert.deepEqual(inspected.state.dailyAttemptWindows['1'], []);
});

test('a correct answer clears failures for that day only', () => {
    let state = recordDailyResult({}, 1, base, false).state;
    state = recordDailyResult(state, 2, base, false).state;
    state = recordDailyResult(state, 1, new Date(base.getTime() + 1000), true).state;

    assert.deepEqual(state.dailyAttemptWindows['1'], []);
    assert.equal(state.dailyAttemptWindows['2'].length, 1);
});

test('attempt records reject invalid day and time inputs', () => {
    assert.throws(() => inspectDailyAttempts({}, 0, base), /DAILY_DAY_INVALID/);
    assert.throws(() => inspectDailyAttempts({}, 31, base), /DAILY_DAY_INVALID/);
    assert.throws(() => inspectDailyAttempts({}, 1, 'not-a-date'), /DAILY_TIME_INVALID/);
});
