// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/hello-world

$w.onReady(function () {
    const heading = $w('Text').find(element => /<h1[ >]/i.test(element.html || '') || /Thank You|Order Confirmed/i.test(element.text || ''));
    if (heading) heading.html = '<h1>The Dopamine Is Dispatched!</h1><p>Order Confirmed</p>';
});
