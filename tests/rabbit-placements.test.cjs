const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const {
    GUARDIAN_MILESTONES,
    HUNT_PLACEMENTS,
    HUNT_ROUTE,
    TOTAL_BUTTONS
} = require('../src/backend/rabbitContent.js');

test('all fifty discoveries have one ordered placement on audited real routes', () => {
    assert.equal(TOTAL_BUTTONS, 50);
    assert.equal(HUNT_PLACEMENTS.length, 50);
    assert.deepEqual(HUNT_PLACEMENTS.map(placement => placement.buttonId),
        Array.from({ length: 50 }, (_, index) => index + 1));
    assert.equal(new Set(HUNT_PLACEMENTS.map(placement => placement.buttonId)).size, 50);
    assert.deepEqual(HUNT_ROUTE, HUNT_PLACEMENTS.map(placement => placement.route));
    for (const placement of HUNT_PLACEMENTS) {
        assert.match(placement.route, /^\/(?!\/)/);
        assert.ok(placement.surface);
        assert.ok(placement.anchor);
        assert.ok(placement.editorElementId);
    }
});

test('placement distribution uses editable storefront, support, policy and adventure routes', () => {
    const routes = new Set(HUNT_PLACEMENTS.map(placement => placement.route));
    for (const route of [
        '/', '/category/all-products', '/category/desk-workspace-fidgets',
        '/category/movement-balance', '/about', '/contact', '/shipping-policy',
        '/refund-policy', '/privacy-policy', '/rabbit-hole-forest',
        '/rabbit-hole-daily', '/blog', '/gift-card', '/accessibility-statement'
    ]) assert.ok(routes.has(route), `${route} has no discovery placement`);
    for (const removedRoute of ['/profile/my/profile', '/my-orders', '/account-settings', '/notifications']) {
        assert.equal(routes.has(removedRoute), false, `${removedRoute} must not own a discovery placement`);
    }
    assert.equal(HUNT_PLACEMENTS.filter(item => item.route === '/').length, 4);
    assert.equal(HUNT_PLACEMENTS.filter(item => item.route === '/category/all-products').length, 3);
    assert.equal(HUNT_PLACEMENTS.filter(item => item.surface === 'collection').length, 24);
    assert.equal(HUNT_PLACEMENTS.filter(item => item.surface === 'member').length, 0);
});

test('redistributed discoveries 41 through 44 use distinct editable policy anchors', () => {
    const expected = [
        [41, '/shipping-policy', 'delivery help footer', 'rabbitDiscovery41'],
        [42, '/refund-policy', 'returns help footer', 'rabbitDiscovery42'],
        [43, '/privacy-policy', 'data controls footer', 'rabbitDiscovery43'],
        [44, '/accessibility-statement', 'assistance footer', 'rabbitDiscovery44']
    ];
    assert.deepEqual(
        HUNT_PLACEMENTS.slice(40, 44).map(({ buttonId, route, anchor, editorElementId }) =>
            [buttonId, route, anchor, editorElementId]),
        expected
    );
});

test('native placements resolve distinct page-local editor slots', () => {
    const categoryIds = new Set(['rabbitDiscoveryHeading', 'rabbitDiscoveryGrid', 'rabbitDiscoveryFooter']);
    for (const placement of HUNT_PLACEMENTS.slice(4)) {
        if (placement.route.startsWith('/category/')) {
            assert.ok(categoryIds.has(placement.editorElementId), `${placement.buttonId} has an invalid category slot`);
        } else {
            assert.equal(placement.editorElementId, `rabbitDiscovery${placement.buttonId}`);
        }
    }
    const physicalKeys = HUNT_PLACEMENTS.slice(4).map(item => `${item.route}:${item.editorElementId}`);
    assert.equal(new Set(physicalKeys).size, physicalKeys.length, 'a rendered route reuses a physical discovery slot');
});

test('guardian milestones are Mothkeeper 20, Rootwhisper 30, Grumblebark 40 and Tanglebright 50', () => {
    assert.deepEqual(GUARDIAN_MILESTONES.map(({ threshold, characterId, actionId }) => ({ threshold, characterId, actionId })), [
        { threshold: 20, characterId: 'mothkeeper', actionId: 'wait' },
        { threshold: 30, characterId: 'rootwhisper', actionId: 'protect' },
        { threshold: 40, characterId: 'grumblebark', actionId: 'listen' },
        { threshold: 50, characterId: 'tanglebright', actionId: 'approach' }
    ]);
});

test('native route templates bind placement-aware authenticated discovery controls', () => {
    const bindings = [
        'src/pages/Category Page.jqjf7.js', 'src/pages/About.h2wml.js',
        'src/pages/Contact.sdtlj.js', 'src/pages/Shipping policy.rrbon.js',
        'src/pages/Refund Policy.pf6as.js', 'src/pages/Privacy Policy.wcw8y.js',
        'src/pages/Rabbit Hole Forest.l4tqi.js', 'src/pages/Rabbit Hole Daily.i6ju2.js',
        'src/pages/Blog.ejdl4.js', 'src/pages/GIFT CARD.t7j18.js',
        'src/pages/Accessibility Statement.ymbtc.js'
    ];
    for (const controller of bindings) {
        assert.match(read(controller), /bindRabbitDiscovery/,
            `${controller} does not bind the discovery control`);
    }
    for (const removedController of [
        'src/pages/Profile.nqcgq.js', 'src/pages/My Orders.ofgf2.js',
        'src/pages/Account Settings.e3juj.js', 'src/pages/Notifications.u2bgt.js'
    ]) {
        assert.doesNotMatch(read(removedController), /bindRabbitDiscovery/,
            `${removedController} still binds a redistributed discovery`);
    }
    const helper = read('src/public/rabbitDiscovery.js');
    assert.match(helper, /placementsForRoute/);
    assert.doesNotMatch(helper, /#rabbitDiscoveryButton/);
    assert.doesNotMatch(helper, /authentication\.promptLogin/);
    assert.match(helper, /beginButtonChallenge/);
    assert.match(helper, /findButton/);
    assert.match(helper, /await getHuntState\(\)/);
    assert.match(helper, /nextPage !== route/);
    assert.match(helper, /activate\(nextState\)/);
    assert.match(helper, /options\.onFound\(result, nextState\)/);
    assert.doesNotMatch(helper, /resetHuntState|claimReward/);
});

test('the homepage embed owns only discoveries one through four', () => {
    const home = read('src/public/shop-dopadrop-home-current.html');
    const served = read('docs/index.html');
    for (const html of [home, served]) {
        assert.match(html, /querySelectorAll\('\[data-rabbit-id\]'\)/);
        assert.deepEqual(
            [...html.matchAll(/data-rabbit-id="(\d+)"/g)].map(match => Number(match[1])),
            [1, 4, 2, 3]
        );
        assert.doesNotMatch(html, /data-rabbit-id="(?:[5-9]|[1-9]\d+)"/);
    }
});

test('the first homepage discovery opens the Wix member signup gate', () => {
    const home = read('src/public/shop-dopadrop-home-current.html');
    assert.match(home, /memberReady!==true\)\{send\(\{type:'RABBIT_LOGIN_REQUEST'\}\)/);
});

test('reward issuance stays disabled and no public reset method is introduced', () => {
    const backend = read('src/backend/rabbitHole.web.js');
    assert.match(backend, /const REWARD_ISSUANCE_ENABLED = false/);
    assert.doesNotMatch(backend, /export const resetHuntState/);
});
