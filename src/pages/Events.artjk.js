$w.onReady(function () {
    const heading = $w('Text').find(element => /<h1[ >]/i.test(element.html || ''));
    if (heading) heading.html = '<h1>The Chaos Calendar</h1><p>Events &amp; Community Activities</p><p>Slightly feral, possibly sane!</p>';
});
