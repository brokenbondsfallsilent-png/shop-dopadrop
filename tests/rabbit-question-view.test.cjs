const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const {
    ACTION_IDS,
    buildQuestionView,
    normaliseRenderMessage,
    normaliseActionMessage
} = require('../src/public/rabbitQuestionView.js');

const daily = {
    mode: 'daily',
    eyebrow: 'Day 7 · Mothkeeper asks',
    progress: { current: 7, total: 30 },
    question: 'What follows you without making a sound?',
    hint: 'Choose one answer.',
    choices: [
        { id: 'shadow', label: 'Your shadow', action: 'answer' },
        { id: 'name', label: 'A whispered name', action: 'answer' },
        { id: 'moon', label: 'The moon', action: 'answer' }
    ],
    meta: ['1 OF 3', 'NO POINTS AWARDED'],
    status: { kind: 'ready', message: '' },
    memberId: 'secret-member',
    rewardChoice: 'provider-secret',
    answer: 'shadow'
};

test('daily choices remain ordered while private fields are discarded', () => {
    const view = buildQuestionView(daily);

    assert.deepEqual(view.choices.map(choice => choice.id), ['shadow', 'name', 'moon']);
    assert.deepEqual(view.choices.map(choice => choice.label), ['Your shadow', 'A whispered name', 'The moon']);
    assert.equal(view.mode, 'daily');
    assert.equal(view.progress.percent, 23);
    assert.equal(view.memberId, undefined);
    assert.equal(view.rewardChoice, undefined);
    assert.equal(view.answer, undefined);
    assert.deepEqual(view.artwork, {
        environment: 'assets/rabbit-hole/daily-environment-v2.png',
        environmentDay: 'assets/rabbit-hole/daily-environment-v2.png',
        environmentNight: 'assets/rabbit-hole/daily-environment-v2.png',
        guardian: null,
        guardianAlt: ''
    });
});

test('artwork paths are selected only from fixed mode and guardian allowlists', () => {
    const forest = buildQuestionView({ ...daily, mode: 'forest', guardianKey: 'mothkeeper' });
    assert.equal(forest.artwork.environment, 'assets/rabbit-hole/forest-night-v3.png');
    assert.equal(forest.artwork.environmentDay, 'assets/rabbit-hole/forest-day-v3.png');
    assert.equal(forest.artwork.environmentNight, 'assets/rabbit-hole/forest-night-v3.png');
    assert.equal(forest.artwork.guardian, 'assets/rabbit-hole/mothkeeper-v4.png');
    assert.equal(forest.artwork.guardianAlt, 'Mothkeeper, guardian of the Rabbit Hole');
    assert.equal(buildQuestionView({ ...daily, mode: 'forest', guardianKey: '../../bad' }).artwork.guardian, null);
    assert.equal(buildQuestionView({ ...daily, mode: 'cave', guardianKey: 'tanglebright' }).artwork.guardian, 'assets/rabbit-hole/tanglebright-v2.png');
});

test('missing and malformed question snapshots fail closed', () => {
    for (const snapshot of [null, {}, { ...daily, question: '' }, { ...daily, choices: [] }, { ...daily, mode: 'unknown' }]) {
        assert.deepEqual(buildQuestionView(snapshot), { valid: false, disabled: true, choices: [] });
    }
});

test('locked and completed states disable every choice', () => {
    for (const kind of ['locked', 'completed']) {
        const view = buildQuestionView({ ...daily, status: { kind, message: 'Settled.' } });
        assert.equal(view.disabled, true);
        assert.ok(view.choices.every(choice => choice.disabled));
    }
});

test('only noninteractive locked and completed cards may omit choices', () => {
    for (const kind of ['locked', 'completed']) {
        const view = buildQuestionView({ ...daily, choices: [], status: { kind, message: 'Settled.' } });
        assert.equal(view.valid, true);
        assert.equal(view.disabled, true);
        assert.deepEqual(view.choices, []);
    }
    assert.deepEqual(buildQuestionView({ ...daily, choices: [], status: { kind: 'ready', message: '' } }), {
        valid: false,
        disabled: true,
        choices: []
    });
});

test('long labels stay literal text instead of becoming markup', () => {
    const label = '<img src=x onerror=alert(1)> A very long answer that must wrap safely';
    const view = buildQuestionView({
        ...daily,
        choices: [{ id: 'literal', label, action: 'answer' }]
    });

    assert.equal(view.choices[0].label, label);
});

test('render messages accept only allowlisted safe snapshots', () => {
    const message = normaliseRenderMessage({ type: 'RABBIT_QUESTION_RENDER', requestId: 'load-1', payload: daily });

    assert.equal(message.type, 'RABBIT_QUESTION_RENDER');
    assert.equal(message.requestId, 'load-1');
    assert.equal(message.payload.mode, 'daily');
    assert.equal(normaliseRenderMessage({ type: 'OTHER', requestId: 'load-1', payload: daily }), null);
    assert.equal(normaliseRenderMessage({ type: 'RABBIT_QUESTION_RENDER', requestId: '', payload: daily }), null);
});

test('action messages reject unknown actions and malformed identifiers', () => {
    assert.deepEqual(normaliseActionMessage({
        type: 'RABBIT_QUESTION_ACTION', requestId: 'req-1', action: 'answer', choiceId: 'shadow'
    }), {
        type: 'RABBIT_QUESTION_ACTION', requestId: 'req-1', action: 'answer', choiceId: 'shadow'
    });
    assert.equal(normaliseActionMessage({
        type: 'RABBIT_QUESTION_ACTION', requestId: 'req-2', action: 'reset', choiceId: 'all'
    }), null);
    assert.equal(normaliseActionMessage({
        type: 'RABBIT_QUESTION_ACTION', requestId: 'req-3', action: 'answer', choiceId: '<script>'
    }), null);
    assert.deepEqual([...ACTION_IDS], ['answer', 'encounter', 'dialogue']);
    assert.equal(Object.isFrozen(ACTION_IDS), true);
});

test('source and served view modules remain byte-identical', () => {
    const source = fs.readFileSync(path.join(root, 'src/public/rabbitQuestionView.js'), 'utf8');
    const served = fs.readFileSync(path.join(root, 'docs/rabbitQuestionView.js'), 'utf8');
    assert.equal(served, source);
});
