$w.onReady(function () {
    const heading = $w('Text').find(element => /<h1[ >]/i.test(element.html || '') || /^(Cart|Your Cart)$/i.test((element.text || '').trim()));
    if (heading) heading.html = '<h1>The Loot Cart</h1><p>Your Cart</p>';
});
