$w.onReady(function () {
    const heading = $w('Text').find(element => /<h1[ >]/i.test(element.html || '') || /Accessibility Statement/i.test(element.text || ''));
    if (heading) heading.html = '<h1>Accessibility at Shop-DopaDrop</h1><p>Accessibility Statement</p>';
});
