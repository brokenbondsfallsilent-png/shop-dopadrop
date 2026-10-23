$w.onReady(function () {
    $w('Text').forEach(element => {
        if ((element.text || '').includes('All the latest from Visuelle')) {
            element.html = '<h1 style="color:#f5ff37;font-weight:800;line-height:1.1;font-size:clamp(30px,4vw,54px)">The Brain Dump</h1><p style="color:#ff37bb;font-size:19px;line-height:1.4">Stories, Guides &amp; Discoveries</p><p>Brains. Tools. Everyday chaos.</p>';
        }
    });
});
