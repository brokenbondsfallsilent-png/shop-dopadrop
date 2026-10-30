const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

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

test('Wix embeds use the current hosted asset cache revision', () => {
    const masterSource = read('src/pages/masterPage.js');
    const homeSource = read('src/pages/Home.c1dmp.js');

    assert.match(masterSource, /rabbit-widget\.html\?v=rabbit50-20261029/);
    assert.match(homeSource, /shop-dopadrop\/\?v=rabbit50-20261029/);
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
    assert.match(source, /chooseLootgrem\(currentNode,\s*action\.choiceId\)/);
    assert.match(source, /rewardIssuanceEnabled/);
});

test('the compact widget has one complete document and one small login control', () => {
    const source = read('src/public/rabbit-widget.html');
    const servedSource = read('docs/rabbit-widget.html');

    assert.equal(servedSource, source);
    assert.equal((source.match(/<\/html>/gi) || []).length, 1);
    assert.equal((source.match(/<script(?:\s|>)/gi) || []).length, 2);
    assert.equal((source.match(/<\/script>/gi) || []).length, 2);
    assert.equal((source.match(/id=["']login["']/g) || []).length, 1);
    assert.match(source, /class="login"/);
    assert.match(source, /\.login\{[^}]*font-size:10px/);
    assert.match(source, /document\.getElementById\('login'\)\.onclick=\(\)=>send\('sign-in'\)/);
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

test('the gem clears prior member data when the dashboard becomes signed out', () => {
    const widget = read('src/public/rabbit-widget.html');
    const servedWidget = read('docs/rabbit-widget.html');

    assert.equal(servedWidget, widget);
    assert.match(widget, /const clearDashboard=/);
    assert.match(widget, /if\(!view\.signedIn\)\{clearDashboard\(\);/);
    assert.match(widget, /text\(xp,'0 XP'\)/);
    assert.match(widget, /text\(count,'0 \/ 50'\)/);
    assert.match(widget, /text\(forest,'0 encounters'\)/);
    assert.match(widget, /text\(daily,'0 \/ 0'\)/);
    assert.match(widget, /text\(reward,'Treasure locked'\)/);
    assert.match(widget, /bar\.style\.width='0%'/);
});

test('the member dashboard renders when window.status is the browser status string', () => {
    const widget = read('src/public/rabbit-widget.html');
    const inlineScripts = [...widget.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
    const script = inlineScripts.at(-1)[1];
    const listeners = {};
    const makeClassList = initial => {
        const values = new Set(initial);
        return {
            add: value => values.add(value),
            remove: value => values.delete(value),
            contains: value => values.has(value)
        };
    };
    const makeElement = (...classes) => ({
        classList: makeClassList(classes),
        setAttribute() {},
        focus() {},
        querySelectorAll() { return []; },
        parentElement: { setAttribute() {} },
        style: {},
        textContent: '',
        disabled: false,
        title: ''
    });
    const elements = Object.fromEntries(
        ['g', 'p', 'x', 'login', 'xp', 'count', 'forest', 'daily', 'reward', 'n', 'bar', 'c', 'f', 'd', 'dashboard', 'rank', 'identity', 'status']
            .map(id => [id, makeElement(...(id === 'dashboard' ? ['dashboard', 'loading'] : []))])
    );
    const parent = { postMessage() {} };
    const context = {
        ...elements,
        status: '',
        parent,
        document: {
            activeElement: null,
            addEventListener() {},
            getElementById: id => elements[id]
        },
        window: {
            addEventListener: (type, listener) => { listeners[type] = listener; }
        },
        RabbitDashboardView: {
            buildDashboardView: () => ({
                signedIn: true,
                rank: 'Trail Starter',
                identity: 'Dylan',
                xp: '10 XP',
                progress: '2 / 50',
                forest: '1 encounter',
                daily: '1 / 30',
                reward: 'Treasure locked',
                primary: { label: 'Continue the hunt' },
                percent: 4
            })
        }
    };

    vm.runInNewContext(script, context);
    listeners.message({
        source: parent,
        data: { type: 'RABBIT_WIDGET_RESULT', action: 'dashboard', ok: true, payload: {} }
    });

    assert.equal(elements.dashboard.classList.contains('loading'), false);
    assert.equal(elements.status.textContent, 'DopaHQ ready.');
    assert.equal(elements.rank.textContent, 'Trail Starter');
});

test('source and served mobile decoration bands clip transformed artwork', () => {
    const source = read('src/public/shop-dopadrop-home-current.html');
    const servedSource = read('docs/index.html');

    assert.match(source, /\.art-sprinkles\{[^}]*overflow:hidden/);
    assert.match(servedSource, /\.art-sprinkles\{[^}]*overflow:hidden/);
});

test('homepage discoveries remain reliable 44px touch targets on mobile', () => {
    const source = read('src/public/shop-dopadrop-home-current.html');
    const servedSource = read('docs/index.html');

    for (const html of [source, servedSource]) {
        assert.match(html, /\.rabbit-secret\{[^}]*touch-action:manipulation/);
        assert.match(html, /@media\(max-width:600px\)\{\.rabbit-secret\{[^}]*min-width:44px[^}]*min-height:44px/);
    }
});

test('homepage discovery bands stay above decorative and text layers without leaving their bands', () => {
    const source = read('src/public/shop-dopadrop-home-current.html');
    const servedSource = read('docs/index.html');

    for (const html of [source, servedSource]) {
        assert.match(html, /\.art-sprinkles\{[^}]*overflow:hidden[^}]*isolation:isolate[^}]*z-index:2/);
        assert.match(html, /\.rabbit-secret\{[^}]*z-index:3/);
    }
});

test('storefront route buttons have real destinations outside the Wix iframe', () => {
    const source = read('src/public/shop-dopadrop-home-current.html');
    const servedSource = read('docs/index.html');

    for (const html of [source, servedSource]) {
        assert.match(html, /const STOREFRONT_ORIGIN='https:\/\/www\.shop--dopadrop\.com\.au'/);
        assert.match(html, /a\.href=storefrontHref\(route\)/);
        assert.match(html, /if\(window\.parent===window\)return true/);
        assert.match(html, /send\(\{type:'SHOP_DOPA_NAVIGATE',path:route\}\)/);
    }
});

test('the embedded Account control opens Wix login instead of navigating to a dead public profile URL', () => {
    const source = read('src/public/shop-dopadrop-home-current.html');
    const servedSource = read('docs/index.html');

    for (const html of [source, servedSource]) {
        assert.match(html, /route==='\/profile\/my\/profile'/);
        assert.match(html, /a\.href=STOREFRONT_ORIGIN/);
        assert.match(html, /send\(\{type:'RABBIT_LOGIN_REQUEST'\}\)/);
    }
});

test('the standalone homepage mounts the gem while the Wix hunt iframe leaves it to the shared header', () => {
    const source = read('src/public/shop-dopadrop-home-current.html');
    const servedSource = read('docs/index.html');

    for (const html of [source, servedSource]) {
        assert.match(html, /if\(window\.parent!==window\)return/);
        assert.match(html, /iframe\.src='rabbit-widget\.html'/);
        assert.match(html, /iframe\.title='Rabbit Hole member dashboard'/);
        assert.match(html, /iframe\.className='standalone-gem'/);
    }
});

test('the shared Rabbit question renderer owns one safe responsive choice surface', () => {
    const source = read('src/public/rabbit-question.html');
    const servedSource = read('docs/rabbit-question.html');

    assert.equal(servedSource, source);
    assert.equal((source.match(/<!doctype html>/gi) || []).length, 1);
    assert.equal((source.match(/<\/html>/gi) || []).length, 1);
    assert.equal((source.match(/role="radiogroup"/g) || []).length, 1);
    assert.doesNotMatch(source, /innerHTML\s*=/);
    assert.match(source, /event\.source\s*!==\s*parent/);
    assert.match(source, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
    assert.match(source, /\.choice:last-child:nth-child\(odd\)\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/s);
    assert.match(source, /min-height:\s*48px/);
    assert.match(source, /:focus-visible\s*\{[^}]*outline:\s*3px solid #f5ff37/s);
    assert.match(source, /@media\s*\(max-width:\s*600px\)/);
    assert.match(source, /@media\s*\(max-width:\s*600px\)[\s\S]*grid-template-columns:\s*1fr/);
    assert.match(source, /@media\s*\(max-width:\s*600px\)[\s\S]*border-left:\s*4px solid/);
    assert.match(source, /id="environment"/);
    assert.match(source, /id="guardian"/);
    assert.match(source, /view\.artwork\.environment/);
    assert.match(source, /view\.artwork\.guardian/);
    assert.match(source, /scene\.classList\.add\('has-guardian'\)/);
    assert.match(source, /scene\.classList\.remove\('has-guardian'\)/);
    assert.match(source, /prefers-reduced-motion/);

    for (const state of ['ready', 'pending', 'correct', 'incorrect', 'locked', 'completed', 'error', 'limited']) {
        assert.match(source, new RegExp(`data-state="${state}"|state-${state}`));
    }

    assert.match(source, /if\s*\(pending\)\s*return/);
    assert.doesNotMatch(source, /claimReward|resetHuntState|memberId|rewardChoice/);
});

test('shared question assets preserve served parity and reward reset safeguards', () => {
    assert.equal(read('docs/rabbit-question.html'), read('src/public/rabbit-question.html'));
    assert.equal(read('docs/rabbitQuestionView.js'), read('src/public/rabbitQuestionView.js'));
    for (const file of ['daily-tavern-v4.webp', 'forest-day-v3.webp', 'forest-night-v3.webp', 'cave-environment-v4.webp', 'mothkeeper.webp', 'rootwhisper-v7.webp', 'grumblebark-v2.webp', 'tanglebright-v4.webp']) {
        assert.deepEqual(
            fs.readFileSync(path.join(root, 'docs/assets/rabbit-hole', file)),
            fs.readFileSync(path.join(root, 'src/public/assets/rabbit-hole', file))
        );
    }

    const backend = read('src/backend/rabbitHole.web.js');
    const pages = [
        read('src/pages/Rabbit Hole Daily.i6ju2.js'),
        read('src/pages/Rabbit Hole Forest.l4tqi.js'),
        read('src/pages/Rabbit Hole Cave.zoimi.js')
    ].join('\n');
    assert.match(backend, /const REWARD_ISSUANCE_ENABLED = false/);
    assert.doesNotMatch(backend, /export const resetHuntState/);
    assert.doesNotMatch(pages, /claimReward|resetHuntState/);
});

