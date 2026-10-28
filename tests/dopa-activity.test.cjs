const test = require('node:test');
const assert = require('node:assert/strict');

const { applyTrustedActivityEvent, mergeTrustedActivity } = require('../src/backend/dopaActivity.js');

test('delayed activity writes cannot reduce trusted counters or completed flags', () => {
    const merged = mergeTrustedActivity(
        { hiddenButtonsFound: 24, riddlesSolved: 3, questCompleted: true },
        { hiddenButtonsFound: 21, riddlesSolved: 2, questCompleted: false }
    );

    assert.deepEqual(merged, { hiddenButtonsFound: 24, riddlesSolved: 3, questCompleted: true });
});

test('new trusted progress advances counters and permanent flags', () => {
    const merged = mergeTrustedActivity(
        { hiddenButtonsFound: 24, questCompleted: false },
        { hiddenButtonsFound: 25, questCompleted: true, secretPagesFound: 1 }
    );

    assert.deepEqual(merged, { hiddenButtonsFound: 25, questCompleted: true, secretPagesFound: 1 });
});

test('collected activity facts are unioned without duplicates', () => {
    const merged = mergeTrustedActivity(
        { collectedFragments: ['Lantern Oath', 'Root Map'] },
        { collectedFragments: ['Root Map', 'Tanglebright Thread'] }
    );

    assert.deepEqual(merged.collectedFragments, ['Lantern Oath', 'Root Map', 'Tanglebright Thread']);
});

test('undefined, null, negative counters, and nested objects cannot erase activity', () => {
    const merged = mergeTrustedActivity(
        { hiddenButtonsFound: 7, questJoined: true, source: 'rabbit-hole' },
        { hiddenButtonsFound: -5, questJoined: null, source: undefined, injected: { staffRole: 'owner' } }
    );

    assert.deepEqual(merged, { hiddenButtonsFound: 7, questJoined: true, source: 'rabbit-hole' });
});

test('a retried trusted event cannot credit progression XP twice', () => {
    const first = applyTrustedActivityEvent(
        { progressionXp: 100, activity: {}, processedActivityEventIds: [] },
        { riddlesSolved: 1 },
        { eventId: 'daily:member-a:1', xpDelta: 25 }
    );
    const retried = applyTrustedActivityEvent(first.profile, { riddlesSolved: 1 }, {
        eventId: 'daily:member-a:1', xpDelta: 25
    });

    assert.equal(first.profile.progressionXp, 125);
    assert.equal(retried.profile.progressionXp, 125);
    assert.equal(retried.duplicate, true);
    assert.deepEqual(retried.profile.processedActivityEventIds, ['daily:member-a:1']);
});

test('different trusted event IDs can each credit progression XP once', () => {
    const first = applyTrustedActivityEvent({ progressionXp: 0 }, {}, { eventId: 'event-1', xpDelta: 10 });
    const second = applyTrustedActivityEvent(first.profile, {}, { eventId: 'event-2', xpDelta: 15 });

    assert.equal(second.profile.progressionXp, 25);
    assert.deepEqual(second.profile.processedActivityEventIds, ['event-1', 'event-2']);
});

test('positive progression XP requires a trusted event ID', () => {
    assert.throws(
        () => applyTrustedActivityEvent({ progressionXp: 10 }, {}, { xpDelta: 5 }),
        /ACTIVITY_EVENT_ID_REQUIRED/
    );
});
