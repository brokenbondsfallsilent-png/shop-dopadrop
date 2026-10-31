const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { HUNT_PLACEMENTS } = require('../src/backend/rabbitContent.js');

const moduleUrl = pathToFileURL(path.resolve(__dirname, '../src/public/rabbitPlacementSlots.js')).href;
const load = () => import(moduleUrl);

test('public native slot registry stays in parity with canonical backend placements', async () => {
    const { NATIVE_DISCOVERY_SLOTS } = await load();
    const expected = HUNT_PLACEMENTS.slice(4).map(({ buttonId, route, editorElementId }) => ({
        buttonId, route, elementId: editorElementId
    }));
    assert.deepEqual(NATIVE_DISCOVERY_SLOTS, expected);
});

test('placementsForRoute normalizes routes and preserves distinct ordered slots', async () => {
    const { elementIdsForRoute, placementsForRoute } = await load();
    assert.deepEqual(placementsForRoute('category/all-products').map(item => item.buttonId), [5, 6, 7]);
    assert.deepEqual(placementsForRoute('/about').map(item => item.buttonId), [32, 33, 34]);
    assert.deepEqual(placementsForRoute('/rabbit-hole-forest').map(item => item.buttonId), [45, 50]);
    assert.equal(new Set(placementsForRoute('/about').map(item => item.elementId)).size, 3);
    assert.deepEqual(elementIdsForRoute('/category/desk-workspace-fidgets'), [
        'rabbitDiscoveryHeading', 'rabbitDiscoveryGrid', 'rabbitDiscoveryFooter'
    ]);
    assert.deepEqual(elementIdsForRoute('/about'), [
        'rabbitDiscovery32', 'rabbitDiscovery33', 'rabbitDiscovery34'
    ]);
});

test('redistributed policy slots replace removed member routes', async () => {
    const { placementsForRoute } = await load();
    assert.deepEqual(placementsForRoute('/shipping-policy').map(item => item.buttonId), [38, 41]);
    assert.deepEqual(placementsForRoute('/refund-policy').map(item => item.buttonId), [39, 42]);
    assert.deepEqual(placementsForRoute('/privacy-policy').map(item => item.buttonId), [40, 43]);
    assert.deepEqual(placementsForRoute('/accessibility-statement').map(item => item.buttonId), [44, 49]);
    for (const route of ['/profile/my/profile', '/my-orders', '/account-settings', '/notifications', '/unknown']) {
        assert.deepEqual(placementsForRoute(route), []);
    }
});

test('returned slot arrays and descriptors cannot mutate the registry', async () => {
    const { placementsForRoute } = await load();
    const slots = placementsForRoute('/contact');
    assert.equal(Object.isFrozen(slots), true);
    assert.equal(slots.every(Object.isFrozen), true);
});
