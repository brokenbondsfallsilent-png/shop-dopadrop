const test = require('node:test');
const assert = require('node:assert/strict');

const { bindRabbitQuestionView, QUESTION_VIEW_URL } = require('../src/public/rabbitQuestionBridge.js');

const tick = () => new Promise(resolve => setImmediate(resolve));

function harness(overrides = {}) {
    const posted = [];
    let listener;
    const view = {
        src: '',
        postMessage(message) { posted.push(message); },
        onMessage(handler) { listener = handler; }
    };
    const calls = { load: 0, submit: [] };
    const options = {
        async load() {
            calls.load += 1;
            return { mode: 'daily', question: 'Question?', choices: [{ id: 'yes', label: 'Yes', action: 'answer' }] };
        },
        async submit(action) {
            calls.submit.push(action);
            return { ok: true };
        },
        mapResult() {
            return { mode: 'daily', question: 'Complete', choices: [{ id: 'done', label: 'Done', action: 'answer' }], status: { kind: 'completed', message: 'Correct.' } };
        },
        mapError() {
            return { mode: 'daily', question: 'Try again', choices: [{ id: 'retry', label: 'Retry', action: 'answer' }], status: { kind: 'error', message: 'Something went wrong.' } };
        },
        ...overrides
    };
    const $w = id => {
        assert.equal(id, '#rabbitQuestionView');
        return view;
    };
    bindRabbitQuestionView($w, options);
    return { view, posted, calls, emit: data => listener({ data }) };
}

test('READY loads once and renders through the named HTML component', async () => {
    const app = harness();
    assert.equal(app.view.src, QUESTION_VIEW_URL);

    app.emit({ type: 'RABBIT_QUESTION_READY' });
    app.emit({ type: 'RABBIT_QUESTION_READY' });
    await tick();

    assert.equal(app.calls.load, 1);
    assert.equal(app.posted.length, 1);
    assert.equal(app.posted[0].type, 'RABBIT_QUESTION_RENDER');
    assert.equal(app.posted[0].payload.question, 'Question?');
});

test('unknown messages and malformed actions cannot reach submit', async () => {
    const app = harness();
    for (const data of [
        { type: 'OTHER' },
        { type: 'RABBIT_QUESTION_ACTION', requestId: '', action: 'answer', choiceId: 'yes' },
        { type: 'RABBIT_QUESTION_ACTION', requestId: 'req-1', action: 'reset', choiceId: 'yes' },
        { type: 'RABBIT_QUESTION_ACTION', requestId: 'req-2', action: 'answer', choiceId: '<script>' }
    ]) app.emit(data);
    await tick();
    assert.deepEqual(app.calls.submit, []);
});

test('duplicate and stale request IDs submit only once', async () => {
    let release;
    const app = harness({
        submit: action => {
            app.calls.submit.push(action);
            return new Promise(resolve => { release = resolve; });
        }
    });
    const action = { type: 'RABBIT_QUESTION_ACTION', requestId: 'req-1', action: 'answer', choiceId: 'yes' };

    app.emit(action);
    app.emit(action);
    await tick();
    assert.equal(app.calls.submit.length, 1);
    release({ ok: true });
    await tick();
    app.emit(action);
    await tick();
    assert.equal(app.calls.submit.length, 1);
    assert.equal(app.posted.filter(message => message.type === 'RABBIT_QUESTION_RESULT').length, 1);
});

test('backend errors render only the safe mapped snapshot', async () => {
    const app = harness({
        async submit() { throw new Error('provider-secret-stack'); }
    });
    app.emit({ type: 'RABBIT_QUESTION_ACTION', requestId: 'req-9', action: 'answer', choiceId: 'yes' });
    await tick();

    assert.equal(app.posted.length, 1);
    assert.equal(app.posted[0].type, 'RABBIT_QUESTION_RESULT');
    assert.equal(app.posted[0].payload.status.message, 'Something went wrong.');
    assert.doesNotMatch(JSON.stringify(app.posted[0]), /provider-secret-stack/);
});

test('the required editor contract fails with the exact missing element ID', () => {
    assert.throws(
        () => bindRabbitQuestionView(() => { throw new Error('not found'); }, {}),
        /#rabbitQuestionView/
    );
});
