import wixLocationFrontend from 'wix-location-frontend';
import { findButton, getHuntState } from 'backend/rabbitHole.web';
// Shared Shop-DopaDrop branding. Existing Wix store and member controls stay native.
$w.onReady(function () {
    $w('#vectorImage2').src = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><circle cx=\"16\" cy=\"16\" r=\"14\" fill=\"#09090d\" stroke=\"#ff37bb\" stroke-width=\"2\"/><path d=\"M18 4 8 18h7l-1 10 10-15h-7z\" fill=\"#f5ff37\"/></svg>";
    $w('Text').forEach(element => {
        const text = (element.text || '').trim();
        if (text === 'About' || text === 'Contact') {
            const path = text === 'About' ? '/about' : '/contact';
            const url = wixLocationFrontend.baseUrl.replace(/\/$/, '') + path;
            element.html = '<p><a href="' + url + '" style="color:inherit;text-decoration:underline">' + text + '</a></p>';
            element.onClick(() => wixLocationFrontend.to(path));
        } else if (text === 'Visuelle' || text === 'Shop-DopaDrop') {
            element.text = 'Shop-DopaDrop';
            element.customClassList.add('dopa-brand');
        } else if (text.includes('© 2035 by Visuelle')) {
            element.text = '© 2026 by Shop-DopaDrop. Built on Wix Studio.';
        } else if (text.includes('Get 15% off your first purchase') || text === 'Built for your brain. Free shipping Australia-wide.') {
            element.text = 'Built for your brain. Free shipping Australia-wide on orders $60 AUD and over.';
            element.customClassList.add('dopa-announcement');
        } else if (text.includes('We ship Australia-wide. Standard shipping is free.')) {
            element.html = element.html.replace('We ship Australia-wide. Standard shipping is free.', 'We ship Australia-wide. Standard shipping is free on orders of $60 AUD or more. Orders below $60 AUD have a $7.95 AUD standard shipping charge.');
        } else if (text === 'info@mysite.com' || text === 'dylan.thorne@alchemisecollectiveptyltd.com') {
            element.html = '<p><a href="mailto:dylan.thorne@alchemisecollectiveptyltd.com" style="color:#37e8ff;text-decoration:underline;overflow-wrap:anywhere">dylan.thorne@alchemisecollectiveptyltd.com</a></p>';
        } else if ( text === '123-456-7890' || text.includes('500 Terry Francine') || text === '/') {
            element.collapse();
        } else if (/https?:\/\/(www\.)?(facebook\.com\/WixStudio|instagram\.com\/wixstudio|twitter\.com\/WixStudio|tiktok\.com\/@wix|pinterest\.com\/wixcom)/i.test(element.html || '')) {
            element.collapse();
        }
    });
});

// Shared header hunt HUD. The header iframe is intentionally compact and
// delegates the secured member-state lookup to this page-level bridge.
$w.onReady(function () {
    // Replace the legacy full-page embed consistently on every Wix route.
    // The component is absent on a few native account/system pages, so this
    // remains intentionally guarded and never blocks those pages.
    try {
        const huntView = $w('#html1');
        if (huntView) huntView.src = 'https://brokenbondsfallsilent-png.github.io/shop-dopadrop/';
    } catch (error) {
        console.info('Rabbit Hole embed not present on this page');
    }
    const hud = $w('#html2');
    if (!hud) return;
    const currentHuntPage = () => {
        const path = Array.isArray(wixLocationFrontend.path) ? wixLocationFrontend.path : [];
        return path.length ? '/' + path.join('/') : '/';
    };
    hud.onMessage(async event => {
        const data = event.data || {};
        if (data.type === 'RABBIT_HUD_STATE') {
            try {
                hud.postMessage({ type: 'RABBIT_HUD_STATE_RESULT', payload: await getHuntState() });
            } catch (error) {
                hud.postMessage({ type: 'RABBIT_HUD_STATE_RESULT', payload: { count: 0, total: 50, preview: true } });
            }
        }
        if (data.type === 'RABBIT_HUD_FIND' && Number.isInteger(data.buttonId)) {
            try {
                const payload = await findButton(data.buttonId, currentHuntPage());
                hud.postMessage({ type: 'RABBIT_HUD_FIND_RESULT', payload });
            } catch (error) {
                hud.postMessage({ type: 'RABBIT_HUD_FIND_RESULT', payload: { ok: false, error: 'MEMBER_LOGIN_REQUIRED' } });
            }
        }
    });
});

// Consistent native text styling without changing repeater content.
$w.onReady(function () {
    $w('Text').forEach(element => {
        element.customClassList.add('dopa-native-text');
        if (/<h[1-6][ >]/i.test(element.html || '')) {
            element.customClassList.add('dopa-neon-heading');
        }
    });
});
$w.onReady(function () {
    $w('Section').forEach(section => section.customClassList.add('dopa-page-section'));
});
