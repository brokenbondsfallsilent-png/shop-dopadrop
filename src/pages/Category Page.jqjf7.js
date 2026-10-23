import wixLocationFrontend from 'wix-location-frontend';
import { getCollectionNaming } from 'public/dopaNaming';

$w.onReady(function () {
    const identity = getCollectionNaming(wixLocationFrontend.path);
    if (!identity) return;
    const heading = $w('Text').find(element => /<h1[ >]/i.test(element.html || ''));
    if (!heading) return;
    heading.html = `<h1>${identity.title}</h1><p>${identity.subtitle}</p>`;
    heading.customClassList.add('dopa-neon-heading');
});
