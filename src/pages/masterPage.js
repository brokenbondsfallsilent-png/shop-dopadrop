import wixLocationFrontend from 'wix-location-frontend';
import { authentication } from 'wix-members-frontend';
import { getHuntState, resetHuntState } from 'backend/rabbitHole.web';
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

// The shared header is the one owner of the Rabbit Hole launcher. The Home
// embed still contains the hunt, but its internal HUD is hidden so there is
// exactly one visible control.
$w.onReady(function () {
    const rabbitWidget = $w('#html2');
    if (!rabbitWidget) return;
    rabbitWidget.src = 'https://brokenbondsfallsilent-png.github.io/shop-dopadrop/rabbit-widget.html?v=header-single-gem';
    try {
        if (typeof rabbitWidget.expand === 'function') rabbitWidget.expand();
        if (typeof rabbitWidget.show === 'function') rabbitWidget.show();
    } catch (_) { /* component visibility is controlled by the header layout */ }
    if (typeof rabbitWidget.onMessage !== 'function') return;
    rabbitWidget.onMessage(async event => {
        const data = event.data || {};
        if (data.type !== 'rabbit-hole-action') return;
        const reply = (ok, payload, error) => rabbitWidget.postMessage({
            type: 'RABBIT_WIDGET_RESULT', action: data.action, ok, payload, error
        });
        try {
            if (data.action === 'sign-in') {
                await authentication.promptLogin();
                reply(true, await getHuntState());
                return;
            }
            if (!(await authentication.loggedIn())) throw new Error('MEMBER_LOGIN_REQUIRED');
            if (data.action === 'state') reply(true, await getHuntState());
            else if (data.action === 'reset-test') reply(true, await resetHuntState());
            else if (data.action === 'enter-cave') wixLocationFrontend.to('/rabbit-hole-cave');
            else if (data.action === 'forest') wixLocationFrontend.to('/rabbit-hole-forest');
            else if (data.action === 'daily-clue') wixLocationFrontend.to('/rabbit-hole-daily');
        } catch (error) {
            reply(false, undefined, String(error?.message || error));
        }
    });
});

// If a page contains a custom logout control, use Wix's member session API.
// Missing IDs are ignored so native Wix member menus continue to work normally.
$w.onReady(async function () {
    for (const id of ['#logoutButton', '#logout', '#signOut']) {
        try {
            const control = $w(id);
            if (control && typeof control.onClick === 'function') {
                control.onClick(() => authentication.logout());
            }
        } catch (_) { /* this page has no custom logout control */ }
    }
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
