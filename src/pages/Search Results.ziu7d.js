$w.onReady(function () {
    const heading = $w('Text').find(element => /<h1[ >]/i.test(element.html || '') || /Search Results/i.test(element.text || ''));
    if (heading) heading.html = '<h1>The Treasure Hunt</h1><p>Search Results</p>';
});
