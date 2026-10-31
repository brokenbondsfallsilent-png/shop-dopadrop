import wixLocationFrontend from 'wix-location-frontend';
import { getCollectionNaming } from 'public/dopaNaming';
import { bindRabbitDiscovery } from 'public/rabbitDiscovery';

$w.onReady(() => {
    // Keep the obsolete single-slot control recoverable in the Editor, but never
    // let it overlap the page-local Heading/Grid/Footer discovery controls.
    try { $w('#rabbitDiscoveryButton').collapse(); } catch (_) { /* legacy control already removed */ }
    return bindRabbitDiscovery($w);
});

$w.onReady(function () {
    const identity = getCollectionNaming(wixLocationFrontend.path);
    if (!identity) return;
    const heading = $w('Text').find(element => /<h1[ >]/i.test(element.html || ''));
    if (!heading) return;
    heading.html = `<h1>${identity.title}</h1><p>${identity.subtitle}</p>`;
    heading.customClassList.add('dopa-neon-heading');
});
