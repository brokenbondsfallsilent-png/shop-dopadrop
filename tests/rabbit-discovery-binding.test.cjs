const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourcePath = path.resolve(__dirname, '../src/public/rabbitDiscovery.js');

function loadBinder(deps) {
    const source = fs.readFileSync(sourcePath, 'utf8')
        .replace(/^import .*;\r?\n/gm, '')
        .replace('export async function bindRabbitDiscovery', 'async function bindRabbitDiscovery')
        .concat('\nglobalThis.bindRabbitDiscovery = bindRabbitDiscovery;');
    const context = { console: { warn() {}, error() {} }, ...deps };
    vm.runInNewContext(source, context);
    return context.bindRabbitDiscovery;
}

function makeButton() {
    return {
        label: '',
        accessibility: {},
        collapsed: false,
        collapseCount: 0,
        expandCount: 0,
        clickHandler: null,
        collapse() { this.collapsed = true; this.collapseCount += 1; },
        expand() { this.collapsed = false; this.expandCount += 1; },
        onClick(handler) { this.clickHandler = handler; }
    };
}

function makeWixElements(ids) {
    const elements = Object.fromEntries(ids.map(id => [`#${id}`, makeButton()]));
    return {
        elements,
        $w(selector) {
            if (!(selector in elements)) throw new Error(`missing ${selector}`);
            return elements[selector];
        }
    };
}

const aboutSlots = Object.freeze([
    Object.freeze({ buttonId: 32, route: '/about', elementId: 'rabbitDiscovery32' }),
    Object.freeze({ buttonId: 33, route: '/about', elementId: 'rabbitDiscovery33' }),
    Object.freeze({ buttonId: 34, route: '/about', elementId: 'rabbitDiscovery34' })
]);

function baseDeps(overrides = {}) {
    return {
        wixLocationFrontend: { path: ['about'] },
        authentication: { loggedIn: async () => true, promptLogin: async () => {} },
        placementsForRoute: route => route === '/about' ? aboutSlots : [],
        elementIdsForRoute: route => route === '/about'
            ? aboutSlots.map(slot => slot.elementId)
            : [],
        beginButtonChallenge: async buttonId => ({ buttonId, token: `token-${buttonId}` }),
        findButton: async buttonId => ({ newFind: true, found: buttonId - 31, required: 50 }),
        getHuntState: async () => ({ nextButtonId: 32, nextPage: '/about' }),
        ...overrides
    };
}

test('binder advances between distinct physical slots on the same route', async () => {
    let stateCall = 0;
    const foundCalls = [];
    const { elements, $w } = makeWixElements(['rabbitDiscovery32', 'rabbitDiscovery33', 'rabbitDiscovery34']);
    const bind = loadBinder(baseDeps({
        getHuntState: async () => (++stateCall === 1
            ? { nextButtonId: 32, nextPage: '/about' }
            : { nextButtonId: 33, nextPage: '/about' }),
        findButton: async (buttonId, route, token) => {
            foundCalls.push([buttonId, route, token]);
            return { newFind: true, found: 32, required: 50 };
        }
    }));

    const result = await bind($w);
    assert.equal(result.bound, true);
    assert.equal(result.buttonId, 32);
    assert.equal(elements['#rabbitDiscovery32'].collapsed, false);
    assert.equal(elements['#rabbitDiscovery33'].collapsed, true);
    assert.equal(elements['#rabbitDiscovery34'].collapsed, true);

    await elements['#rabbitDiscovery32'].clickHandler();
    assert.deepEqual(foundCalls, []);
    await elements['#rabbitDiscovery32'].clickHandler();

    assert.deepEqual(foundCalls, [[32, '/about', 'token-32']]);
    assert.equal(elements['#rabbitDiscovery32'].collapsed, true);
    assert.equal(elements['#rabbitDiscovery33'].collapsed, false);
    assert.equal(elements['#rabbitDiscovery33'].label, 'A tiny forest mark');
    assert.equal(elements['#rabbitDiscovery33'].accessibility.ariaLabel, 'Hidden forest discovery 33');
});

test('shared category template collapses every physical slot before binding', async () => {
    const categorySlots = Object.freeze([
        Object.freeze({ buttonId: 8, route: '/category/desk-workspace-fidgets', elementId: 'rabbitDiscoveryHeading' }),
        Object.freeze({ buttonId: 9, route: '/category/desk-workspace-fidgets', elementId: 'rabbitDiscoveryGrid' })
    ]);
    const { elements, $w } = makeWixElements([
        'rabbitDiscoveryHeading', 'rabbitDiscoveryGrid', 'rabbitDiscoveryFooter'
    ]);
    const bind = loadBinder(baseDeps({
        wixLocationFrontend: { path: ['category', 'desk-workspace-fidgets'] },
        placementsForRoute: route => route === '/category/desk-workspace-fidgets' ? categorySlots : [],
        elementIdsForRoute: route => route.startsWith('/category/')
            ? ['rabbitDiscoveryHeading', 'rabbitDiscoveryGrid', 'rabbitDiscoveryFooter']
            : [],
        getHuntState: async () => ({ nextButtonId: 8, nextPage: '/category/desk-workspace-fidgets' })
    }));

    const result = await bind($w);
    assert.equal(result.bound, true);
    assert.equal(elements['#rabbitDiscoveryHeading'].collapsed, false);
    assert.equal(elements['#rabbitDiscoveryGrid'].collapsed, true);
    assert.equal(elements['#rabbitDiscoveryFooter'].collapsed, true);
});

test('unassigned category routes still collapse every shared template slot', async () => {
    const { elements, $w } = makeWixElements([
        'rabbitDiscoveryHeading', 'rabbitDiscoveryGrid', 'rabbitDiscoveryFooter'
    ]);
    const bind = loadBinder(baseDeps({
        wixLocationFrontend: { path: ['category', 'not-in-the-hunt'] },
        placementsForRoute: () => [],
        elementIdsForRoute: route => route.startsWith('/category/')
            ? ['rabbitDiscoveryHeading', 'rabbitDiscoveryGrid', 'rabbitDiscoveryFooter']
            : []
    }));

    const result = await bind($w);
    assert.equal(result.bound, false);
    assert.equal(result.reason, 'NO_DISCOVERY_PLACEMENTS');
    assert.equal(Object.values(elements).every(element => element.collapsed), true);
});

test('missing shared category controls fail closed with the exact element ID', async () => {
    const categorySlots = Object.freeze([
        Object.freeze({ buttonId: 8, route: '/category/desk-workspace-fidgets', elementId: 'rabbitDiscoveryHeading' }),
        Object.freeze({ buttonId: 9, route: '/category/desk-workspace-fidgets', elementId: 'rabbitDiscoveryGrid' })
    ]);
    const { elements, $w } = makeWixElements(['rabbitDiscoveryHeading', 'rabbitDiscoveryGrid']);
    const bind = loadBinder(baseDeps({
        wixLocationFrontend: { path: ['category', 'desk-workspace-fidgets'] },
        placementsForRoute: () => categorySlots,
        elementIdsForRoute: () => [
            'rabbitDiscoveryHeading', 'rabbitDiscoveryGrid', 'rabbitDiscoveryFooter'
        ]
    }));

    const result = await bind($w);
    assert.equal(result.bound, false);
    assert.equal(result.reason, 'EDITOR_ELEMENT_MISSING');
    assert.equal(result.missingElementId, 'rabbitDiscoveryFooter');
    assert.equal(Object.values(elements).every(element => element.collapsed), true);
});

test('signed-out native routes keep every slot collapsed and do not open login', async () => {
    let loginPrompts = 0;
    const { elements, $w } = makeWixElements(['rabbitDiscovery32', 'rabbitDiscovery33', 'rabbitDiscovery34']);
    const bind = loadBinder(baseDeps({
        authentication: { loggedIn: async () => false, promptLogin: async () => { loginPrompts += 1; } },
        getHuntState: async () => { throw new Error('MEMBER_LOGIN_REQUIRED'); }
    }));

    const result = await bind($w);
    assert.equal(result.bound, false);
    assert.equal(result.reason, 'MEMBER_LOGIN_REQUIRED');
    assert.equal(Object.values(elements).every(element => element.collapsed), true);
    assert.equal(loginPrompts, 0);
});

test('missing page-local controls fail closed with the exact editor ID', async () => {
    const { elements, $w } = makeWixElements(['rabbitDiscovery32', 'rabbitDiscovery34']);
    const bind = loadBinder(baseDeps());

    const result = await bind($w);
    assert.equal(result.bound, false);
    assert.equal(result.reason, 'EDITOR_ELEMENT_MISSING');
    assert.equal(result.missingElementId, 'rabbitDiscovery33');
    assert.equal(Object.values(elements).every(element => element.collapsed), true);
});
