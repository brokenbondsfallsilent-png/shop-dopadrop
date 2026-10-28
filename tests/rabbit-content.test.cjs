const test = require('node:test');
const assert = require('node:assert/strict');

const { buildDailyContent, DAILY_CONTENT, campaignDay } = require('../src/backend/rabbitContent.js');

const valid = [
    ['First', 'First teaser', 'First prompt?', ['one', 'two', 'three'], 'one'],
    ['Second', 'Second teaser', 'Second prompt?', ['red', 'green', 'blue'], 'green']
];

test('the published campaign contains thirty valid sequential riddles', () => {
    assert.equal(DAILY_CONTENT.length, 30);
    assert.deepEqual(DAILY_CONTENT.map(entry => entry.day), Array.from({ length: 30 }, (_, index) => index + 1));
    for (const entry of DAILY_CONTENT) {
        assert.equal(entry.choices.length, 3);
        assert.ok(entry.choices.includes(entry.answer));
    }
});

test('daily content construction rejects missing days and duplicate content', () => {
    assert.throws(() => buildDailyContent(valid, 3), /DAILY_CONTENT_COUNT_INVALID/);
    assert.throws(() => buildDailyContent([valid[0], valid[0]], 2), /DAILY_CONTENT_TITLE_DUPLICATE/);
    assert.throws(
        () => buildDailyContent([['First', 'Teaser', 'Prompt?', ['same', 'same', 'other'], 'same']], 1),
        /DAILY_CONTENT_CHOICES_INVALID/
    );
});

test('daily content construction rejects blank fields and hidden answers', () => {
    assert.throws(
        () => buildDailyContent([['', 'Teaser', 'Prompt?', ['one', 'two', 'three'], 'one']], 1),
        /DAILY_CONTENT_FIELD_INVALID/
    );
    assert.throws(
        () => buildDailyContent([['First', 'Teaser', 'Prompt?', ['one', 'two', 'three'], 'four']], 1),
        /DAILY_CONTENT_ANSWER_INVALID/
    );
});

test('campaign release days follow Sydney calendar boundaries and cap at day thirty', () => {
    assert.equal(campaignDay(new Date('2026-10-29T12:59:59.000Z'), '2026-10-30'), 0);
    assert.equal(campaignDay(new Date('2026-10-29T13:00:00.000Z'), '2026-10-30'), 1);
    assert.equal(campaignDay(new Date('2026-11-27T13:00:00.000Z'), '2026-10-30'), 30);
    assert.equal(campaignDay(new Date('2026-12-31T00:00:00.000Z'), '2026-10-30'), 30);
});
