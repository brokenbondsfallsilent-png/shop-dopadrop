const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('Home uses html1 for the hunt and does not create a second header widget', () => {
    const source = read('src/pages/Home.c1dmp.js');

    assert.doesNotMatch(source, /\$w\(['"]#html2['"]\)/);
    assert.doesNotMatch(source, /rabbit-widget\.html/);
    assert.match(source, /const view = \$w\(['"]#html1['"]\)/);
});

test('the shared header owns the single gemstone launcher', () => {
    const source = read('src/pages/masterPage.js');

    assert.match(source, /const rabbitWidget = \$w\(['"]#html2['"]\)/);
    assert.match(source, /rabbit-widget\.html\?v=/);
    assert.match(source, /rabbitWidget\.expand\(\)/);
    assert.match(source, /rabbitWidget\.show\(\)/);
    assert.doesNotMatch(source, /rabbitWidget\.collapse\(\)/);
});

test('the embedded Home header owns one account link and native member bars are removed', () => {
    const source = read('src/pages/masterPage.js');
    const home = read('src/public/shop-dopadrop-home-current.html');

    assert.match(source, /#comp-m00ruy093/);
    assert.match(source, /#comp-mvl7duy5/);
    assert.match(source, /accountControl\.delete\(\)/);
    assert.equal((home.match(/aria-label="Account"/g) || []).length, 1);
});

test('the Home embed suppresses its internal HUD so only the header gem is visible', () => {
    const source = read('src/public/shop-dopadrop-home-current.html');

    assert.match(source, /\.rabbit-hud\{display:none!important\}/);
    assert.match(source, /installRabbitHunt\(\)/);
});

