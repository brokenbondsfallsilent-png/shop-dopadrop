const test = require('node:test');
const assert = require('node:assert/strict');

const { MOTHKEEPER_RIDDLE_COUNT, ROOTWHISPER_ITEM_COUNT, postgameDay, canPrestige } = require('../src/backend/rabbitPostgame.js');

test('post-game content has 105 riddles and 105 Rootwhisper items', () => {
    assert.equal(MOTHKEEPER_RIDDLE_COUNT, 105);
    assert.equal(ROOTWHISPER_ITEM_COUNT, 105);
});

test('Rootwhisper releases exactly 15 items per post-game day', () => {
    assert.equal(postgameDay(1).availableCount, 15);
    assert.equal(postgameDay(7).availableCount, 105);
});

test('prestige requires completion, 24 hours, balance, and remaining cycles', () => {
    const now = new Date('2026-11-02T12:00:00Z');
    assert.equal(canPrestige({ mainQuestCompletedAt: '2026-11-01T11:59:59Z', prestigeCount: 0, loyaltyPoints: 500 }, now).ok, true);
    assert.equal(canPrestige({ mainQuestCompletedAt: '2026-11-02T00:00:00Z', prestigeCount: 0, loyaltyPoints: 500 }, now).reason, 'PRESTIGE_COOLDOWN');
    assert.equal(canPrestige({ mainQuestCompletedAt: '2026-11-01T11:59:59Z', prestigeCount: 10, loyaltyPoints: 500 }, now).reason, 'PRESTIGE_LIMIT_REACHED');
    assert.equal(canPrestige({ mainQuestCompletedAt: '2026-11-01T11:59:59Z', prestigeCount: 0, loyaltyPoints: 499 }, now).reason, 'INSUFFICIENT_POINTS');
});
