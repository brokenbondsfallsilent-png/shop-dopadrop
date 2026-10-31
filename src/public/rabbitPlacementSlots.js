const slots = [];
const add = (route, elementId) => {
    slots.push(Object.freeze({ buttonId: slots.length + 5, route, elementId }));
};

add('/category/all-products', 'rabbitDiscoveryHeading');
add('/category/all-products', 'rabbitDiscoveryGrid');
add('/category/all-products', 'rabbitDiscoveryFooter');
[
    'desk-workspace-fidgets', 'hand-fidgets-spinners', 'sensory-rings-chains-wearables',
    'chew-oral-sensory', 'tactile-textured-sensory', 'weighted-deep-pressure',
    'visual-light-stimulation', 'auditory-rhythm-tools', 'focus-calm-tools',
    'stim-toys-squishies', 'sensory-kits-bundles', 'movement-balance'
].forEach(slug => {
    add(`/category/${slug}`, 'rabbitDiscoveryHeading');
    add(`/category/${slug}`, 'rabbitDiscoveryGrid');
});
['rabbitDiscovery32', 'rabbitDiscovery33', 'rabbitDiscovery34']
    .forEach(elementId => add('/about', elementId));
['rabbitDiscovery35', 'rabbitDiscovery36', 'rabbitDiscovery37']
    .forEach(elementId => add('/contact', elementId));
add('/shipping-policy', 'rabbitDiscovery38');
add('/refund-policy', 'rabbitDiscovery39');
add('/privacy-policy', 'rabbitDiscovery40');
add('/shipping-policy', 'rabbitDiscovery41');
add('/refund-policy', 'rabbitDiscovery42');
add('/privacy-policy', 'rabbitDiscovery43');
add('/accessibility-statement', 'rabbitDiscovery44');
add('/rabbit-hole-forest', 'rabbitDiscovery45');
add('/rabbit-hole-daily', 'rabbitDiscovery46');
add('/blog', 'rabbitDiscovery47');
add('/gift-card', 'rabbitDiscovery48');
add('/accessibility-statement', 'rabbitDiscovery49');
add('/rabbit-hole-forest', 'rabbitDiscovery50');

export const NATIVE_DISCOVERY_SLOTS = Object.freeze(slots);

export function placementsForRoute(route) {
    const value = String(route || '');
    const normalized = value.startsWith('/') ? value : `/${value}`;
    return Object.freeze(NATIVE_DISCOVERY_SLOTS.filter(slot => slot.route === normalized));
}

export function elementIdsForRoute(route) {
    const value = String(route || '');
    const normalized = value.startsWith('/') ? value : `/${value}`;
    if (normalized.startsWith('/category/')) {
        return Object.freeze([
            'rabbitDiscoveryHeading', 'rabbitDiscoveryGrid', 'rabbitDiscoveryFooter'
        ]);
    }
    return Object.freeze(placementsForRoute(normalized).map(slot => slot.elementId));
}
