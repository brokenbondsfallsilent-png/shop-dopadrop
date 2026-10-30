const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const read = p => fs.readFileSync(p, 'utf8');
const content = require('../src/backend/rabbitContent.js');
const details = require('../src/backend/rabbitState.js');
const reward = require('../src/backend/rabbitReward.js');
const challenge = require('../src/backend/rabbitChallenge.js');
const { caveSnapshot } = require('../src/public/rabbitCaveView.js');
const { buildQuestionView } = require('../src/public/rabbitQuestionView.js');
function moduleInVm(path, bindings) {
    const source = read(path);
    const names = [...source.matchAll(/export (?:async )?(?:function|const) (\w+)/g)].map(m => m[1]);
    const context = vm.createContext({ ...bindings, console });
    vm.runInContext(source.replace(/^import[\s\S]*?;\n/gm, '').replace(/export /g, '') + `\n;globalThis.api = {${names.join(',')}};`, context);
    return context.api;
}
const core = moduleInVm('src/backend/rabbitCore.js', { ...content, ...details });
function backend(initial = {}) {
    const records = new Map(Object.entries(initial));
    let writes = 0, providerCalls = 0, now = Date.parse('2026-10-30T00:00:00Z');
    const clone = x => JSON.parse(JSON.stringify(x));
    const api = moduleInVm('src/backend/rabbitHole.web.js', {
        ...content, ...core, ...reward, ...challenge,
        Date: class extends Date { constructor(...a) { super(...(a.length ? a : [now])); } },
        webMethod: (_, fn) => fn, Permissions: { SiteMember: 'member' },
        currentMember: { getMember: async () => ({ _id: 'offline-test-member' }) },
        wixData: {
            get: async (collection, id) => clone(records.get(`${collection}:${id}`) || null),
            save: async (collection, value) => { writes++; records.set(`${collection}:${value._id}`, clone(value)); return clone(value); }
        },
        accounts: { getCurrentMemberAccount: async () => { providerCalls++; throw Error('PROVIDER MUST NOT BE CALLED'); }, earnPoints: () => { providerCalls++; } },
        elevate: fn => fn, randomBytes: crypto.randomBytes,
        recordDopaActivity: async () => {}, rabbitActivityFacts: () => ({})
    });
    return { api, records, counts: () => ({ writes, providerCalls }), advance: () => { now += 6000; } };
}
const eligible = (extra = {}) => ({
    _id: 'offline-test-member', memberId: 'offline-test-member',
    foundIds: Array.from({ length: 50 }, (_, i) => i + 1), rewardStatus: 'eligible',
    caveEntered: true, lootgremState: { node: 'reward', claimAuthorized: true },
    rewardChoice: 'loyalty_points', ...extra
});
const key = 'RabbitHuntMembers:offline-test-member';

test('offline backend persists all 50 challenges/finds across reloads and unlocks only on 50', async () => {
    const b = backend();
    for (let id = 1; id <= 50; id++) {
        b.advance();
        const before = await b.api.getHuntState();
        assert.equal(before.nextButtonId, id);
        const issued = await b.api.beginButtonChallenge(id, content.HUNT_ROUTE[id - 1]);
        b.advance();
        const found = await b.api.findButton(id, content.HUNT_ROUTE[id - 1], issued.token);
        const reloaded = await b.api.getHuntState();
        assert.equal(found.found, id);
        assert.equal(reloaded.found, id);
        assert.equal(reloaded.caveUnlocked, id === 50);
        await assert.rejects(b.api.findButton(id, content.HUNT_ROUTE[id - 1], issued.token));
    }
    assert.equal((await b.api.getHuntState()).nextButtonId, null);
    assert.equal(b.counts().providerCalls, 0);
});

test('cave reload preserves saved dialogue/choice and does not save again', async () => {
    const b = backend({ [key]: eligible() });
    for (let i = 0; i < 2; i++) {
        const state = await b.api.enterCave();
        assert.equal(state.lootgrem.node, 'reward');
        assert.equal(state.lootgrem.claimAuthorized, true);
        assert.equal(state.rewardChoice, 'loyalty_points');
        assert.equal(state.dialogue.text, content.LOOTGREM_DIALOGUE.reward.text);
    }
    assert.equal(b.counts().writes, 0);
});

test('incomplete cave remains locked; first entry saves exactly once', async () => {
    const locked = backend();
    await assert.rejects(locked.api.enterCave(), /CAVE_LOCKED/);
    assert.equal(locked.counts().writes, 0);
    const b = backend({ [key]: eligible({ caveEntered: false, lootgremState: { node: 'welcome', claimAuthorized: false } }) });
    await b.api.enterCave(); await b.api.enterCave();
    assert.equal(b.counts().writes, 1);
});

test('both explicit reward confirmations remain disabled on repeated attempts, with zero writes/provider calls/code disclosure', async () => {
    for (const choice of ['loyalty_points', 'checkout_code']) {
        const b = backend({ [key]: eligible({ rewardChoice: choice }) });
        const claim = choice === 'loyalty_points' ? b.api.claimReward : b.api.claimCheckoutCode;
        for (let i = 0; i < 3; i++) {
            const result = await claim();
            assert.equal(result.status, 'disabled');
            assert.equal(result.points, 0);
            assert.equal(result.code, undefined);
        }
        assert.deepEqual(b.counts(), { writes: 0, providerCalls: 0 });
        assert.equal(b.records.get(key).rewardStatus, 'eligible');
    }
});

test('choice changes persist; cross-type and already-completed claims cannot issue a second reward', async () => {
    const b = backend({ [key]: eligible() });
    const later = await b.api.chooseLootgrem('reward', 'later');
    assert.equal(later.lootgrem.claimAuthorized, false);
    await b.api.chooseLootgrem('later', 'reward');
    await b.api.chooseLootgrem('reward', 'code');
    assert.equal((await b.api.enterCave()).rewardChoice, 'checkout_code');
    await assert.rejects(b.api.claimReward(), /REWARD_CHOICE_MISMATCH/);
    const done = backend({ [key]: eligible({ rewardStatus: 'awarded', rewardTransactionId: 'existing-offline-txn' }) });
    assert.equal((await done.api.claimReward()).alreadyAwarded, true);
    await assert.rejects(done.api.chooseLootgrem('reward', 'code'), /REWARD_CHOICE_LOCKED/);
    assert.deepEqual(done.counts(), { writes: 0, providerCalls: 0 });
});

test('cave snapshots work with unchanged hosted renderer; confirmation/change/postpone are interactive but completed/reconciliation states locked', () => {
    const state = core.publicState(eligible());
    const view = buildQuestionView(caveSnapshot(state));
    assert.equal(view.valid, true); assert.equal(view.disabled, false);
    assert.deepEqual(view.choices.map(c => c.id), ['confirm_reward', 'change_reward', 'postpone_reward']);
    for (const rewardStatus of ['awarded', 'code_issued', 'pending', 'reconciliation_required']) {
        const view = buildQuestionView(caveSnapshot({ ...state, rewardStatus }));
        assert.equal(view.valid, true); assert.equal(view.disabled, true); assert.equal(view.choices.length, 0);
    }
});

function caveController(b, loggedIn = true) {
    let options, ready, logins = 0; const destinations = [];
    let logged = loggedIn;
    const $w = { onReady: fn => { ready = fn; } };
    const source = read('src/pages/Rabbit Hole Cave.zoimi.js').replace(/^import.*;\n/gm, '');
    vm.runInNewContext(source, {
        $w, ...b.api, caveSnapshot,
        authentication: { loggedIn: async () => logged, promptLogin: async () => { logins++; logged = true; }, onLogin: () => {} },
        wixLocationFrontend: { to: path => destinations.push(path) },
        bindRabbitQuestionView: (_, callbacks) => { options = callbacks; return { reload: async () => {} }; }
    });
    ready();
    return { options, destinations, logins: () => logins };
}

test('Cave controller does not claim on load/choice/reload; confirm is safe and postpone preserves choice', async () => {
    const b = backend({ [key]: eligible() });
    const c = caveController(b);
    let view = await c.options.load();
    assert.equal(view.choices[0].id, 'confirm_reward');
    assert.equal(b.counts().writes, 0);
    await assert.rejects(c.options.submit({ action: 'dialogue', choiceId: 'forged' }), /INVALID_DIALOGUE_CHOICE/);
    const result = await c.options.submit({ action: 'dialogue', choiceId: 'confirm_reward' });
    view = c.options.mapResult(result);
    assert.match(view.status.message, /disabled/);
    assert.deepEqual(b.counts(), { writes: 0, providerCalls: 0 });
    await c.options.submit({ action: 'dialogue', choiceId: 'postpone_reward' });
    assert.deepEqual(c.destinations, ['/']);
    assert.equal(b.records.get(key).rewardChoice, 'loyalty_points');
    const reloaded = caveController(b);
    assert.equal((await reloaded.options.load()).choices[0].id, 'confirm_reward');
});

test('Cave sign-in is explicit, does not block onReady, and resumes saved dialogue after login', async () => {
    const b = backend({ [key]: eligible() });
    const c = caveController(b, false);
    assert.equal((await c.options.load()).choices[0].id, 'sign_in');
    assert.equal(c.logins(), 0); assert.equal(b.counts().writes, 0);
    const result = await c.options.submit({ action: 'dialogue', choiceId: 'sign_in' });
    assert.equal(c.options.mapResult(result).choices[0].id, 'confirm_reward');
    assert.equal(c.logins(), 1); assert.equal(b.counts().writes, 0);
});

function discoveryFixture({ logged = false, cancel = false, failState = false, failStateAfterFind = false } = {}) {
    let click, loginCallback, reads = 0, challengeCalls = 0, finds = 0;
    let found = 4;
    const button = { label: '', collapsed: false, accessibility: {}, collapse() { this.collapsed = true; }, expand() { this.collapsed = false; }, onClick(fn) { click = fn; } };
    const status = {};
    const api = moduleInVm('src/public/rabbitDiscovery.js', {
        wixLocationFrontend: { path: ['category', 'all-products'] },
        authentication: {
            loggedIn: async () => logged,
            promptLogin: async () => { if (cancel) throw Error('LOGIN_CANCELLED'); logged = true; },
            onLogin: fn => { loginCallback = fn; }
        },
        getHuntState: async () => { reads++; if (failState) throw Error('OFFLINE'); return { nextButtonId: found + 1, nextPage: '/category/all-products' }; },
        beginButtonChallenge: async () => { challengeCalls++; return { token: 'offline-token' }; },
        findButton: async () => { finds++; found++; if (failStateAfterFind) failState = true; return { found, required: 50, caveUnlocked: false }; }
    });
    const $w = id => id === '#rabbitDiscoveryButton' ? button : status;
    return { api, $w, button, status, click: () => click(), login: () => { logged = true; return loginCallback(); }, counts: () => ({ reads, challengeCalls, finds }), recover: () => { failState = false; cancel = false; } };
}

test('native discovery signs in before protected read and recovers cancellation without progression', async () => {
    const f = discoveryFixture({ cancel: true });
    await f.api.bindRabbitDiscovery(f.$w);
    assert.match(f.button.label, /Sign in/); assert.equal(f.counts().reads, 0);
    await f.click(); assert.equal(f.counts().reads, 0); assert.equal(f.counts().finds, 0);
    f.recover(); await f.click();
    assert.match(f.button.label, /forest mark/); assert.equal(f.counts().finds, 0);
    await Promise.all([f.click(), f.click()]);
    assert.equal(f.counts().challengeCalls, 1); assert.equal(f.counts().finds, 0);
    await f.click(); assert.equal(f.counts().finds, 1);
    assert.equal(f.button.accessibility.ariaLabel, 'Hidden forest discovery 6');
});

test('native discovery state failure exposes retry without silently hiding the control', async () => {
    const f = discoveryFixture({ logged: true, failState: true });
    await f.api.bindRabbitDiscovery(f.$w);
    assert.equal(f.button.collapsed, false); assert.match(f.button.label, /Retry/);
    f.recover(); await f.click(); assert.match(f.button.label, /forest mark/);
    assert.equal(f.counts().finds, 0);
});

test('gem login replies using dashboard protocol and also refreshes homepage member gate', () => {
    assert.match(read('src/pages/masterPage.js'), /action: 'dashboard', ok: true,[\s\S]*payload: await getMyRabbitDashboard\(\)/);
    assert.match(read('src/pages/Home.c1dmp.js'), /authentication\.onLogin\(\(\) => view\.postMessage\(\{ type: 'RABBIT_LOGIN_RESULT', ok: true \}\)\)/);
});

test('Forest and Daily resume exactly once after cancelled or successful member login without blocking onReady', async () => {
    for (const path of ['src/pages/Rabbit Hole Forest.l4tqi.js', 'src/pages/Rabbit Hole Daily.i6ju2.js']) {
        const ready = []; let loginHandler, binds = 0;
        const $w = { onReady: fn => ready.push(fn) };
        const source = read(path).replace(/^import.*;\n/gm, '');
        vm.runInNewContext(source, {
            $w, console,
            authentication: { loggedIn: () => false, onLogin: fn => { loginHandler = fn; }, promptLogin: () => Promise.reject(Error('LOGIN_CANCELLED')) },
            bindRabbitDiscovery: () => {},
            bindRabbitQuestionView: () => { binds++; return { reload: async () => {} }; }
        });
        for (const fn of ready) assert.equal(fn(), undefined);
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(binds, 0);
        loginHandler(); loginHandler();
        assert.equal(binds, 1);
    }
});


test('a saved discovery followed by failed refresh recovers from authoritative state without replaying the old ID', async () => {
    const f = discoveryFixture({ logged: true, failStateAfterFind: true });
    await f.api.bindRabbitDiscovery(f.$w);
    await f.click(); await f.click();
    assert.equal(f.counts().finds, 1); assert.match(f.button.label, /Retry/);
    f.recover(); await f.click();
    assert.equal(f.button.accessibility.ariaLabel, 'Hidden forest discovery 6');
    assert.equal(f.counts().challengeCalls, 1);
    assert.equal(f.counts().finds, 1);
});


test('uncertain saved dialogue requires readback, not replay against stale node', async () => {
    const b = backend({ [key]: eligible({ lootgremState: { node: 'welcome', claimAuthorized: false }, rewardChoice: null }) });
    const c = caveController(b);
    await c.options.load();
    // Simulate backend save succeeding but its response being lost in transit.
    await c.options.submit({ action: 'dialogue', choiceId: 'reward' });
    const uncertain = c.options.mapError(Error('NETWORK_REPLY_LOST'));
    assert.equal(uncertain.choices[0].id, 'reload_cave');
    assert.doesNotMatch(uncertain.status.message, /unchanged/);
    await assert.rejects(c.options.submit({ action: 'dialogue', choiceId: 'reward' }), /INVALID_DIALOGUE_CHOICE/);
    const recovered = c.options.mapResult(await c.options.submit({ action: 'dialogue', choiceId: 'reload_cave' }));
    assert.ok(recovered.choices.some(choice => choice.id === 'claim'));
    assert.equal(b.counts().writes, 1);
});
