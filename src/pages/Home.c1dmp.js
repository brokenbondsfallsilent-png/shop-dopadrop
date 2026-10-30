import wixData from 'wix-data';
import wixLocationFrontend from 'wix-location-frontend';
import { authentication } from 'wix-members-frontend';
import {
    beginButtonChallenge, claimReward, chooseLootgrem, enterCave, findButton, forestEncounter,
    getDailyContent, getHuntState, solveDailyContent
} from 'backend/rabbitHole.web';

// Shop-DopaDrop: existing homepage, existing catalogue, no database writes.
$w.onReady(function () {
    // Rabbit Hole is hosted by the current homepage embed.
    // Keep the receiver bound to html3; html1 is the legacy homepage embed.
    const view = $w('#html3');
    // Keep the hunt asset versioned and HTTPS-hosted. Draft-only until Wix is published.
    // Cache-bust the homepage asset so Wix does not reuse the pre-HUD-removal copy.
    // Force Wix's HTML component to load the current bridge-enabled build.
    // The cache key is intentionally bumped whenever the embedded navigation
    // contract changes so an older filesusr snapshot cannot mask the router.
    view.src = 'https://brokenbondsfallsilent-png.github.io/shop-dopadrop/?v=rabbit50-20261029';
    // Login through the shared gem must also refresh the homepage hunt gate.
    authentication.onLogin(() => view.postMessage({ type: 'RABBIT_LOGIN_RESULT', ok: true }));
    // The hunt is page-aware: the server rejects a discovery unless the
    // browser is on the assigned destination route.
    const currentHuntPage = () => {
        const path = Array.isArray(wixLocationFrontend.path)
            ? wixLocationFrontend.path.filter(Boolean).join('/')
            : '';
        return path ? '/' + path : '/';
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
        '/category/all-products', '/category/best-sellers', '/category/puzzles-hands-on-play', '/gift-card', '/search',
        '/about', '/contact', '/blog', '/cart-page', '/profile/my/profile', '/shipping-policy', '/refund-policy',
        '/privacy-policy', '/terms-and-conditions', '/accessibility-statement'
    ]);
    // These are the exact fallback cards embedded in the saved homepage.
    // Keep their links usable before, or if, the catalogue request completes.
    [
        "/product-page/sdd-005-keyboard-fidget-toy-005",
        "/product-page/sdd-001-deformable-fidget-robot-001",
        "/product-page/shop-dopadrop-sdd-061",
        "/product-page/sdd-004-kalimba-thumb-piano-17-tone-kalimba-beginner-004",
        "/product-page/shop-dopadrop-sdd-136",
        "/product-page/sdd-003-high-grade-six-face-picture-wooden-jigsaw-3d-puzzle-toys-children-s-003",
        "/product-page/sdd-021-shining-led-fidget-spinner-021",
        "/product-page/shop-dopadrop-sdd-208"
    ].forEach(path => allowedPaths.add(path));
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
                challenge: () => beginButtonChallenge(data.buttonId, currentHuntPage()),
                find: () => findButton(data.buttonId, currentHuntPage(), data.challengeToken),
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
});
