const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('Home owns the Rabbit Hole UI through html1 only', () => {
    const source = read('src/pages/Home.c1dmp.js');

    assert.doesNotMatch(source, /\$w\(['"]#html2['"]\)/);
    assert.doesNotMatch(source, /rabbit-widget\.html/);
    assert.match(source, /const view = \$w\(['"]#html1['"]\)/);
});

test('the legacy shared-header Rabbit Hole embed is collapsed', () => {
    const source = read('src/pages/masterPage.js');

    assert.match(source, /const legacyRabbitEmbed = \$w\(['"]#html2['"]\)/);
    assert.match(source, /legacyRabbitEmbed\.collapse\(\)/);
    assert.doesNotMatch(source, /RABBIT_HUD_(?:STATE|FIND)/);
});

test('the Home embed retains its single internal Rabbit Hole HUD', () => {
    const source = read('src/public/shop-dopadrop-home-current.html');

    assert.doesNotMatch(source, /querySelectorAll\(['"]\.rabbit-hud['"]\)\.forEach\(node=>node\.remove\(\)\)/);
    assert.match(source, /installRabbitHunt\(\)/);
});
