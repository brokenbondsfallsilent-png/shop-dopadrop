const test = require('node:test');
const assert = require('node:assert/strict');

const { buildForestStageView } = require('../src/backend/rabbitForestView.js');

const sequence = [
    'mothkeeper:wait',
    'rootwhisper:protect',
    'grumblebark:listen',
    'tanglebright:approach'
];

const state = (foundCount, encounters = []) => ({ foundCount, forestState: { encounters } });

test('Forest milestones lock and unlock at 20, 30, 40 and 50 discoveries', () => {
    const cases = [
        [0, [], true, 'mothkeeper'],
        [19, [], true, 'mothkeeper'],
        [20, [], false, 'mothkeeper'],
        [30, sequence.slice(0, 1), false, 'rootwhisper'],
        [40, sequence.slice(0, 2), false, 'grumblebark'],
        [50, sequence.slice(0, 3), false, 'tanglebright']
    ];
    for (const [foundCount, encounters, locked, guardian] of cases) {
        const view = buildForestStageView(state(foundCount, encounters));
        assert.equal(view.locked, locked);
        assert.equal(view.guardian.id, guardian);
        assert.equal(view.choices.length, locked ? 0 : 1);
    }
});

test('each completed canonical prefix advances exactly one guardian', () => {
    for (let completed = 0; completed < sequence.length; completed += 1) {
        const view = buildForestStageView(state(50, sequence.slice(0, completed)));
        assert.equal(view.progress.current, completed);
        assert.equal(view.choices[0].characterId, sequence[completed].split(':')[0]);
        assert.equal(view.choices[0].actionId, sequence[completed].split(':')[1]);
    }
});

test('alternate and malformed history cannot skip the authoritative sequence', () => {
    for (const encounters of [
        ['mothkeeper:ask'],
        ['rootwhisper:protect'],
        ['mothkeeper:wait', 'rootwhisper:explore'],
        ['mothkeeper:wait', 'rootwhisper:protect', 'tanglebright:approach']
    ]) {
        const view = buildForestStageView(state(50, encounters));
        const validPrefix = encounters[0] === sequence[0]
            ? (encounters[1] === sequence[1] ? 2 : 1)
            : 0;
        assert.equal(view.progress.current, validPrefix);
        assert.equal(view.choices.length, 1);
        assert.doesNotMatch(JSON.stringify(view.choices), /mothkeeper:ask|rootwhisper:explore/);
    }
});

test('the full guardian sequence settles into a stable completed view', () => {
    const view = buildForestStageView(state(50, sequence));
    assert.equal(view.completed, true);
    assert.equal(view.locked, false);
    assert.equal(view.progress.current, 4);
    assert.equal(view.progress.total, 4);
    assert.deepEqual(view.choices, []);
    assert.equal(view.guardian, null);
});
