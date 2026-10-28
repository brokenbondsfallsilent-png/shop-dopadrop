const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('Home uses html3 for the hunt and does not create a second header widget', () => {
    const source = read('src/pages/Home.c1dmp.js');

    assert.doesNotMatch(source, /const view = \$w\(['"]#html1['"]\)/);
    assert.doesNotMatch(source, /\$w\(['"]#html2['"]\)/);
    assert.doesNotMatch(source, /rabbit-widget\.html/);
    assert.match(source, /const view = \$w\(['"]#html3['"]\)/);
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
    const servedSource = read('docs/index.html');

    assert.match(source, /\.rabbit-hud\{display:none!important\}/);
    assert.match(servedSource, /\.rabbit-hud\{display:none!important\}/);
    assert.match(source, /installRabbitHunt\(\)/);
    assert.match(servedSource, /installRabbitHunt\(\)/);
});

test('all header Rabbit Hole destinations have page controllers', () => {
    const masterPage = read('src/pages/masterPage.js');
    const destinations = [
        ['rabbit-hole-cave', 'src/pages/Rabbit Hole Cave.zoimi.js'],
        ['rabbit-hole-forest', 'src/pages/Rabbit Hole Forest.l4tqi.js'],
        ['rabbit-hole-daily', 'src/pages/Rabbit Hole Daily.i6ju2.js']
    ];

    destinations.forEach(([route, controller]) => {
        assert.match(masterPage, new RegExp(`/${route}`));
        assert.ok(fs.existsSync(path.join(root, controller)), `${controller} is missing`);
    });
});

test('the cave page cannot directly issue a live reward', () => {
    const source = read('src/pages/Rabbit Hole Cave.zoimi.js');

    assert.doesNotMatch(source, /claimReward/);
    assert.match(source, /chooseLootgrem\('reward', 'claim'\)/);
});

test('the compact widget has one complete document and no duplicate sign-in control', () => {
    const source = read('src/public/rabbit-widget.html');
    const servedSource = read('docs/rabbit-widget.html');

    assert.equal(servedSource, source);
    assert.equal((source.match(/<\/html>/gi) || []).length, 1);
    assert.equal((source.match(/<script(?:\s|>)/gi) || []).length, 2);
    assert.equal((source.match(/<\/script>/gi) || []).length, 2);
    assert.doesNotMatch(source, /id=["']s["']/);
    assert.doesNotMatch(source, /send\('sign-in'\)/);
});

test('the compact widget cannot reset hunt progress and exposes dialog state', () => {
    const widget = read('src/public/rabbit-widget.html');
    const masterPage = read('src/pages/masterPage.js');

    assert.doesNotMatch(widget, /reset-test/);
    assert.doesNotMatch(masterPage, /resetHuntState/);
    assert.match(widget, /aria-controls="p"/);
    assert.match(widget, /aria-expanded="false"/);
    assert.match(widget, /role="dialog"/);
    assert.match(widget, /e\.key==='Escape'/);
    assert.match(widget, /id="c" type="button" disabled/);
    assert.match(widget, /c\.disabled=view\.percent<100/);
    assert.match(widget, /c\.disabled=!message\.payload\.caveUnlocked/);
    assert.match(widget, /e\.source!==parent/);
    assert.match(widget, /e\.key==='Tab'/);
    assert.match(widget, /button:not\(:disabled\)/);

    const homePage = read('src/pages/Home.c1dmp.js');
    const homeEmbed = read('src/public/shop-dopadrop-home-current.html');
    assert.doesNotMatch(homePage, /resetHuntState/);
    assert.doesNotMatch(homeEmbed, /rabbitRequest\('reset'\)/);
    assert.doesNotMatch(homeEmbed, /id="rabbitReset"/);

    const servedHome = read('docs/index.html');
    assert.doesNotMatch(servedHome, /rabbitRequest\('reset'\)/);
    assert.doesNotMatch(servedHome, /id="rabbitReset"/);

    const backend = read('src/backend/rabbitHole.web.js');
    assert.doesNotMatch(backend, /export const resetHuntState/);
});

test('the single gem requests and renders the allowlisted member dashboard', () => {
    const widget = read('src/public/rabbit-widget.html');
    const servedWidget = read('docs/rabbit-widget.html');
    const view = read('src/public/rabbitDashboardView.js');
    const servedView = read('docs/rabbitDashboardView.js');
    const masterPage = read('src/pages/masterPage.js');

    assert.equal(servedWidget, widget);
    assert.equal(servedView, view);
    assert.match(widget, /rabbitDashboardView\.js/);
    assert.match(widget, /id="dashboard"/);
    assert.match(widget, /send\('dashboard'\)/);
    assert.match(widget, /send\('dashboard-next'\)/);
    assert.match(masterPage, /getMyRabbitDashboard/);
    assert.match(masterPage, /data\.action === 'dashboard'/);
    assert.match(masterPage, /data\.action === 'dashboard-next'/);
    assert.doesNotMatch(widget, /innerHTML\s*=/);
});

