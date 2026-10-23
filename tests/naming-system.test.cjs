const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('homepage keeps obvious navigation while introducing the branded shopping identities', () => {
    const homepage = read('src/public/shop-dopadrop-home-current.html');
    assert.match(homepage, /Shop All/);
    assert.match(homepage, /Our Story/);
    assert.match(homepage, /The Dopamine Dealers/);
    assert.match(homepage, /The Stim Station/);
    assert.match(homepage, /The Dopamine Drop/);
});

test('all twelve sensory collections have a branded identity and descriptive subtitle', () => {
    const naming = read('src/public/dopaNaming.js');
    const expected = [
        ['desk-workspace-fidgets', 'The Desk Goblins', 'Desk Fidgets & Workspace Toys'],
        ['hand-fidgets-spinners', 'The Fidget Frenzy', 'Hand Fidgets & Spinners'],
        ['sensory-rings-chains-wearables', 'The Wearable Wiggles', 'Sensory Jewellery & Wearables'],
        ['chew-oral-sensory', 'The Chomp Shop', 'Chewable & Oral Sensory Tools'],
        ['tactile-textured-sensory', 'The Texture Trove', 'Tactile & Textured Sensory Toys'],
        ['weighted-deep-pressure', 'The Gravity Zone', 'Weighted & Deep Pressure Sensory'],
        ['visual-light-stimulation', 'The Glow Hole', 'Visual & Light Sensory Tools'],
        ['auditory-rhythm-tools', 'The Sound Lab', 'Auditory & Rhythm Sensory'],
        ['focus-calm-tools', 'The Brain Break Room', 'Focus & Calm Tools'],
        ['stim-toys-squishies', 'The Squish Pit', 'Stim Toys & Squishies'],
        ['sensory-kits-bundles', 'The Dopamine Bundles', 'Sensory Kits & Bundles'],
        ['movement-balance', 'The Wiggle Workshop', 'Movement & Balance Tools']
    ];
    expected.flat().forEach(value => assert.match(naming, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
});

test('confirmed Wix pages use playful headings paired with an obvious purpose', () => {
    const expectations = {
        'src/pages/About.h2wml.js': ['Behind the Chaos', 'Our Story &amp; Mission'],
        'src/pages/Contact.sdtlj.js': ['The Dopamine Hotline', 'Contact Customer Support'],
        'src/pages/Blog.ejdl4.js': ['The Brain Dump', 'Stories, Guides &amp; Discoveries'],
        'src/pages/GIFT CARD.t7j18.js': ['Gift a Little Dopamine', 'Shop Gift Cards'],
        'src/pages/Events.w9owy.js': ['The Chaos Calendar', 'Events &amp; Community Activities'],
        'src/pages/Cart Page.low20.js': ['The Loot Cart', 'Your Cart'],
        'src/pages/Search Results.ziu7d.js': ['The Treasure Hunt', 'Search Results'],
        'src/pages/My Orders.ofgf2.js': ['My Dopamine Deliveries', 'My Orders'],
        'src/pages/Account Settings.e3juj.js': ['My Little Corner of Chaos', 'Account Settings']
    };
    for (const [file, phrases] of Object.entries(expectations)) {
        const source = read(file);
        phrases.forEach(phrase => assert.match(source, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${file} should contain ${phrase}`));
    }
});

test('legal and checkout pages retain their standard purpose labels', () => {
    assert.match(read('src/pages/Shipping policy.rrbon.js'), /Shipping Policy/);
    assert.match(read('src/pages/Refund Policy.pf6as.js'), /Returns &amp; Refunds/);
    assert.doesNotMatch(read('src/pages/Checkout.jrinr.js'), /Dopamine Checkout|Chaos Checkout/);
});
