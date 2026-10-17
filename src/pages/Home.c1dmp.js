import wixData from 'wix-data';
import wixLocationFrontend from 'wix-location-frontend';

// Shop-DopaDrop: existing homepage, existing catalogue, no database writes.
$w.onReady(function () {
    const view = $w('#html1');
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
        const items = result.items;
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
            total: result.totalCount,
            minPrice: result.totalCount === items.length && amounts.length
                ? new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(Math.min(...amounts)) : ''
        };
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
    });
});