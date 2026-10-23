$w.onReady(function () {
    $w('#text88').customClassList.add('dopa-story');
    $w('#text88').html = '<h1>Your brain called.</h1><h2>We picked up.</h2><p>Questions about an order? Looking for a texture, movement or kind of input that feels right? Tell us what you need.</p><p>There is no perfect way to ask. Short messages, long explanations, bullet points — all welcome. No masking required.</p><h2>Need help choosing?</h2><p>Tell us what your hands keep reaching for, which textures you love, and which ones you cannot stand. We can help you explore the collections.</p>' ;
    $w('#text88').html = $w('#text88').html.replace(
        '<h1>Your brain called.</h1>',
        '<h1>The Dopamine Hotline</h1><p>Contact Customer Support</p><h2>Your brain called.</h2>'
    );
});
