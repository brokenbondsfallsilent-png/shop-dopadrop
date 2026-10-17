const policyRows = [
  {
    "_id": "delivery",
    "title": "We ship across Australia. Free.",
    "body": "<p>Every order ships free, Australia-wide. No minimum spend. No catching fine print. Just your stuff, on its way to you.</p><p><strong>Estimated delivery times:</strong></p><ul><li>Standard shipping: 7–14 business days</li><li>Express options may be available at checkout depending on your location</li></ul><p>Orders are dispatched within 1–3 business days of payment confirmation. You'll receive a tracking number by email once your order leaves the warehouse.</p><p><strong>Heads up:</strong> Shop-DopaDrop is a dropshipping store. Your order ships directly from our supplier to your door. This means delivery times can vary slightly depending on stock location. If your order contains multiple items, they may arrive in separate parcels.</p>"
  },
  {
    "_id": "tracking",
    "title": "Track your order",
    "body": "<p>Once your order ships, you'll get a tracking link by email. Use it to follow your parcel all the way to your door.</p><p>If you haven't received your tracking details within 5 business days of ordering, email us at <a href=\"mailto:dylan.thorne@alchemisecollectiveptyltd.com\">dylan.thorne@alchemisecollectiveptyltd.com</a> and we'll sort it out.</p>"
  },
  {
    "_id": "returns",
    "title": "Something not right? We'll fix it.",
    "body": "<p>We want every Shop-DopaDrop order to land exactly as expected. If something's wrong, here's how we handle it:</p><p><strong>Change of mind</strong></p><p>We don't accept returns for change of mind. Given the nature of sensory and fidget products, we're unable to resell items once they've been opened. Please check product descriptions carefully before ordering — and if you're unsure, email us first.</p><p><strong>Damaged or faulty items</strong></p><p>If your item arrives damaged, broken, or not as described, we'll replace it or refund you in full. No questions asked.</p><p>To lodge a claim:</p><ol><li>Email us within 14 days of receiving your order</li><li>Include your order number and a photo of the issue</li><li>We'll respond within 2 business days with a resolution</li></ol><p><strong>Wrong item received</strong></p><p>If we (or our supplier) sent you the wrong product, we'll replace it and cover any return shipping. Just email us with a photo and your order number.</p>"
  },
  {
    "_id": "refunds",
    "title": "Refunds",
    "body": "<p>Approved refunds are processed back to your original payment method within 5–10 business days. You'll receive an email confirmation once your refund is on its way.</p><p>We use Stripe for all payments, so refund timing depends on your bank or card provider.</p>"
  },
  {
    "_id": "contact",
    "title": "Still have questions?",
    "body": "<p>We're a small operation and we genuinely care about getting things right.</p><p>Email: <a href=\"mailto:dylan.thorne@alchemisecollectiveptyltd.com\">dylan.thorne@alchemisecollectiveptyltd.com</a></p><p>We aim to respond within 1–2 business days, Monday to Friday.</p><p>Shop-DopaDrop is a trading name of Alchemise Collective Pty Ltd, registered in Australia.<br>This policy was last updated October 2026.</p>"
  }
];
$w.onReady(function () {
    $w('Text').forEach(element => {
        if ((element.html || '').includes('<h1') && (element.text || '').trim() === 'Shipping Policy') {
            element.html = '<h1 style="color:#f5ff37;font-size:54px;line-height:1.1;font-weight:800">Delivery &amp; Returns</h1><p style="color:#ff37bb;font-size:19px;line-height:1.5">No stress. No fine print. Just the info you need.</p>';
        }
    });
    const repeater = $w('#repeater2');
    function paintItem($item, itemData) {
        $item('#text83').html = '<h2 style="color:#ff37bb;font-size:28px;line-height:1.2;font-weight:700">' + itemData.title + '</h2>';
        $item('#text82').html = itemData.body.replace(/<(p|li)(>)/g, '<$1 style="color:#f4f4ef;font-size:18px;line-height:1.65">');
    }
    repeater.onItemReady(paintItem);
    repeater.data = policyRows;
    repeater.forEachItem(paintItem);
});