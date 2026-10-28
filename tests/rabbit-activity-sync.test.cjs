const test = require('node:test');
const assert = require('node:assert/strict');

const { rabbitActivityFacts } = require('../src/backend/rabbitActivity.js');

test('daily completions become the trusted riddle total', () => {
    const facts = rabbitActivityFacts({
        forestState: { completedDays: [3, 1, 3, 2], encounters: [] }
    });

    assert.equal(facts.riddlesSolved, 3);
    assert.equal(facts.questChainsCompleted, 0);
});

test('the full forest encounter sequence becomes one completed quest chain', () => {
    const facts = rabbitActivityFacts({
        forestState: {
            completedDays: [],
            encounters: ['mothkeeper:wait', 'rootwhisper:protect', 'tanglebright:approach']
        }
    });

    assert.equal(facts.questChainsCompleted, 1);
});

test('malformed or partial hunt state cannot inflate profile activity', () => {
    assert.deepEqual(rabbitActivityFacts(), { riddlesSolved: 0, questChainsCompleted: 0 });
    assert.deepEqual(rabbitActivityFacts({ forestState: { completedDays: [0, 31, 'x', 2], encounters: ['wrong'] } }), {
        riddlesSolved: 1,
        questChainsCompleted: 0
    });
});
