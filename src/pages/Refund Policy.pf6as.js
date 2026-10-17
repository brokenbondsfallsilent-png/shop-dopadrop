const policyRows = [
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
 const texts = $w('Text');
 const heading = texts.find(el => /<h1[ >]/i.test(el.html || '') && (el.text || '').includes('Refund'));
 const title = texts.find(el => (el.text || '').trim() === 'A Legal Disclaimer');
 const body = texts.find(el => (el.text || '').startsWith('The explanations and information provided on this page'));
 if(heading) heading.html = '<h1 style="color:#f5ff37;font-size:48px;line-height:1.15;font-weight:800">Returns &amp; Refunds</h1>';
 if(!title || !body) return;
 const titleId = '#' + title.id; const bodyId = '#' + body.id;
 const repeater = $w('Repeater')[0];
 function paintItem($item, row) {
  $item(titleId).html = '<h2 style="color:#ff37bb;font-size:28px;line-height:1.2;font-weight:700">'+row.title+'</h2>';
  $item(bodyId).html = row.body.replace(/<(p|li)(>)/g, '<$1 style="color:#f4f4ef;font-size:18px;line-height:1.65">');
 }
 repeater.onItemReady(paintItem); repeater.data = policyRows; repeater.forEachItem(paintItem);
});