import wixData from 'wix-data';
import wixLocationFrontend from 'wix-location-frontend';
import { authentication } from 'wix-members-frontend';
import {
    claimReward, chooseLootgrem, enterCave, findButton, forestEncounter,
    getDailyContent, getHuntState, resetHuntState, solveDailyContent
} from 'backend/rabbitHole.web';

// Shop-DopaDrop: existing homepage, existing catalogue, no database writes.
$w.onReady(function () {
    const view = $w('#html1');
    // The standalone Rabbit Hole widget is the separate #html2 embed.
    // Keep #html1 reserved for the homepage so the widget bridge never
    // accidentally targets or duplicates the homepage embed.
    const rabbitWidget = $w('#html2');
    if (rabbitWidget) rabbitWidget.src = 'https://brokenbondsfallsilent-png.github.io/shop-dopadrop/rabbit-widget.html?v=5528520';
    // Keep the gemstone launcher visible in the editor and preview. Some Wix
    // responsive breakpoints can leave an HTML component collapsed even though
    // its iframe content is still present in the accessibility tree.
    try {
        if (rabbitWidget && typeof rabbitWidget.expand === 'function') rabbitWidget.expand();
        if (rabbitWidget && typeof rabbitWidget.show === 'function') rabbitWidget.show();
    } catch (_) { /* component visibility is controlled by the page layout */ }
    // Keep the hunt asset versioned and HTTPS-hosted. Draft-only until Wix is published.
    // Cache-bust the homepage asset so Wix does not reuse the pre-HUD-removal copy.
    // Force Wix's HTML component to load the current bridge-enabled build.
    // The cache key is intentionally bumped whenever the embedded navigation
    // contract changes so an older filesusr snapshot cannot mask the router.
    view.src = 'https://brokenbondsfallsilent-png.github.io/shop-dopadrop/?v=c0e7a29';
    const currentHuntPage = () => {
        const path = Array.isArray(wixLocationFrontend.path) ? wixLocationFrontend.path : [];
        return !path.length || (path.length === 1 && path[0].toLowerCase() === 'home')
            ? '/' : '/' + path.join('/');
    };
    ['#section3', '#section2'].forEach(id => $w(id).collapse());
    async function readAll(collection) {
        let page = await wixData.query(collection).limit(100).find();
        const items = [...page.items];
        const totalCount = page.totalCount;
        while (page.hasNext()) {
            page = await page.next();
            items.push(...page.items);
        }
        return { items, totalCount };
    }
    let catalogPromise;
    const allowedPaths = new Set([
        '/category/desk-workspace-fidgets', '/category/hand-fidgets-spinners',
        '/category/sensory-rings-chains-wearables', '/category/chew-oral-sensory',
        '/category/tactile-textured-sensory', '/category/weighted-deep-pressure',
        '/category/visual-light-stimulation', '/category/auditory-rhythm-tools',
        '/category/focus-calm-tools', '/category/stim-toys-squishies',
        '/category/sensory-kits-bundles', '/category/movement-balance',
        '/category/all-products', '/category/best-sellers', '/gift-card',
        '/about', '/contact', '/blog', '/cart-page', '/shipping-policy', '/refund-policy',
        '/privacy-policy', '/terms-and-conditions', '/accessibility-statement'
    ]);
    function mediaUrl(value) {
        if (!value) return '';
        if (value.startsWith('https://')) return value;
        const match = value.match(/^wix:image:\/\/v1\/([^/]+)/);
        return match ? 'https://static.wixstatic.com/media/' + match[1] : '';
    }
    async function loadCatalogue() {
        const results = await Promise.allSettled([
            readAll('Stores/Products'),
            readAll('Stores/Collections')
        ]);
        if (results[0].status !== 'fulfilled') {
            console.error('Shop-DopaDrop catalogue unavailable:', results[0].reason);
            return { type: 'SHOP_DOPA_CATALOG', products: [], collections: [], error: true };
        }
        const result = results[0].value;
        const items = result.items.filter(product => product.visible !== false);
        const products = items.map(p => ({
            name: p.name,
            price: p.formattedDiscountedPrice || p.formattedPrice || '',
            image: mediaUrl(p.mainMedia),
            url: typeof p.productPageUrl === 'string' ? p.productPageUrl : ''
        }));
        products.forEach(p => { if (p.url.startsWith('/product-page/')) allowedPaths.add(p.url); });
        const collections = results[1].status === 'fulfilled'
            ? results[1].value.items.map(c => ({
                name: c.name,
                url: c.slug ? '/category/' + encodeURIComponent(c.slug) : '/category/all-products'
            })) : [];
        collections.forEach(c => allowedPaths.add(c.url));
        const amounts = items.map(p => p.discountedPrice ?? p.price).filter(p => typeof p === 'number' && p > 0);
        return {
            type: 'SHOP_DOPA_CATALOG', loaded: true, products, collections,
            total: items.length,
            minPrice: amounts.length
                ? new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(Math.min(...amounts)) : ''
        };
    }
    async function rabbitReply(requestId, action) {
        try {
            const payload = await action();
            view.postMessage({ type: 'RABBIT_HOLE_RESULT', requestId, ok: true, payload });
        } catch (error) {
            const message = String(error?.message || error || 'Rabbit Hole request failed');
            view.postMessage({
                type: 'RABBIT_HOLE_RESULT', requestId, ok: false,
                error: message.includes('MEMBER_LOGIN_REQUIRED') ? 'MEMBER_LOGIN_REQUIRED' : message
            });
        }
    }
    view.onMessage(async event => {
        const data = event.data;
        if (data?.type === 'SHOP_DOPA_READY') {
            catalogPromise = catalogPromise || loadCatalogue();
            view.postMessage(await catalogPromise);
        }
        if (data?.type === 'SHOP_DOPA_NAVIGATE' && typeof data.path === 'string' && allowedPaths.has(data.path)) {
            wixLocationFrontend.to(data.path);
        }
        if (data?.type === 'RABBIT_HOLE_REQUEST' && typeof data.requestId === 'string') {
            const actions = {
                state: () => getHuntState(),
                reset: () => resetHuntState(),
                find: () => findButton(data.buttonId, currentHuntPage()),
                cave: () => enterCave(),
                dialogue: () => chooseLootgrem(data.node, data.option),
                encounter: () => forestEncounter(data.characterId, data.actionId),
                daily: () => getDailyContent(),
                solveDaily: () => solveDailyContent(data.day, data.answer),
                claim: () => claimReward()
            };
            if (actions[data.action]) await rabbitReply(data.requestId, actions[data.action]);
        }
        if (data?.type === 'RABBIT_LOGIN_REQUEST') {
            try {
                await authentication.promptLogin();
                view.postMessage({ type: 'RABBIT_LOGIN_RESULT', ok: true });
            } catch (error) {
                view.postMessage({ type: 'RABBIT_LOGIN_RESULT', ok: false, error: error?.message || 'LOGIN_CANCELLED' });
            }
        }
    });
    if (!rabbitWidget || typeof rabbitWidget.onMessage !== 'function') return;
    rabbitWidget.onMessage(async event => {
        const data = event.data || {};
        if (data.type !== 'rabbit-hole-action') return;
        const requestId = `widget-${Date.now()}`;
        if (data.action === 'sign-in') {
            try {
                await authentication.promptLogin();
                rabbitWidget.postMessage({ type: 'RABBIT_WIDGET_RESULT', action: data.action, ok: true });
            } catch (error) {
                rabbitWidget.postMessage({ type: 'RABBIT_WIDGET_RESULT', action: data.action, ok: false, error: error?.message || 'LOGIN_CANCELLED' });
            }
            return;
        }
        const actions = {
            'enter-cave': () => { wixLocationFrontend.to('/rabbit-hole-cave'); return Promise.resolve({ destination: '/rabbit-hole-cave' }); },
            forest: () => { wixLocationFrontend.to('/rabbit-hole-forest'); return Promise.resolve({ destination: '/rabbit-hole-forest' }); },
            'daily-clue': () => { wixLocationFrontend.to('/rabbit-hole-daily'); return Promise.resolve({ destination: '/rabbit-hole-daily' }); }
        };
        if (data.action === 'reset-test') {
            try {
                if (!(await authentication.loggedIn())) throw new Error('MEMBER_LOGIN_REQUIRED');
                const payload = await resetHuntState();
                rabbitWidget.postMessage({ type: 'RABBIT_WIDGET_RESULT', requestId, action: data.action, ok: true, payload });
            } catch (error) {
                rabbitWidget.postMessage({ type: 'RABBIT_WIDGET_RESULT', requestId, action: data.action, ok: false, error: String(error?.message || error) });
            }
            return;
        }
        if (!actions[data.action]) return;
        try {
            if (!(await authentication.loggedIn())) {
                rabbitWidget.postMessage({ type: 'RABBIT_WIDGET_RESULT', requestId, action: data.action, ok: false, error: 'MEMBER_LOGIN_REQUIRED' });
                return;
            }
            const payload = await actions[data.action]();
            rabbitWidget.postMessage({ type: 'RABBIT_WIDGET_RESULT', requestId, action: data.action, ok: true, payload });
        } catch (error) {
            rabbitWidget.postMessage({ type: 'RABBIT_WIDGET_RESULT', requestId, action: data.action, ok: false, error: String(error?.message || error) });
        }
    });
});
