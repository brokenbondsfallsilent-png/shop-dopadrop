const policyRows = [
  {
    "_id": "delivery",
    "title": "Free shipping across Australia",
    "body": "<p>We ship Australia-wide. Standard shipping is free.</p><p>Orders are usually dispatched within 1 to 3 business days of payment. Standard delivery takes about 7 to 14 business days after dispatch.</p><p>These are estimates, not guarantees. Delays can happen because of couriers, customs, weather or supplier stock.</p>"
  },
  {
    "_id": "supplier",
    "title": "Supplier-direct delivery",
    "body": "<p>Shop-DopaDrop is a dropshipping store. Your order is sent directly from one of our suppliers to you. Items in one order may arrive in separate parcels, and parcels may come from different locations.</p><p>Our Privacy Policy explains how your delivery details are shared with our suppliers.</p>"
  },
  {
    "_id": "tracking",
    "title": "Tracking your order",
    "body": "<p>You will receive a tracking link by email once your order ships. If your order arrives in separate parcels, check the tracking information for each shipment.</p><p>If your parcel has not arrived within the estimated delivery period, or tracking shows a delivery problem, email us with your order number and tracking details so we can investigate with the supplier or courier.</p>"
  },
  {
    "_id": "address",
    "title": "Your delivery address",
    "body": "<p>Please make sure your delivery address is correct. Contact us as soon as possible if you notice an error. We cannot redirect an order once it has shipped.</p><p>If an order is returned because of an incorrect or incomplete address, we may need to charge for reshipping.</p>"
  },
  {
    "_id": "cancellations",
    "title": "Cancelling an order",
    "body": "<p>Email us as soon as possible with your order number. We can cancel your order for a full refund if it has not been dispatched by the supplier. Once it has shipped, our standard returns rules apply.</p>"
  },
  {
    "_id": "issues",
    "title": "Something wrong with your delivery?",
    "body": "<p>For a damaged, faulty or wrong item, contact us with your order number and a photo. We will replace the item or refund you in line with our returns policy and your rights under the Australian Consumer Law.</p><p>Please contact us within 14 days of delivery where you can so we can sort it out quickly. This contact window does not limit your consumer rights.</p><p>Nothing in this Shipping Policy limits any rights or remedies available under the Australian Consumer Law. See our Terms &amp; Conditions and returns policy for further information.</p>"
  },
  {
    "_id": "contact",
    "title": "Contact us",
    "body": "<p>Email: <a href=\"mailto:dylan.thorne@alchemisecollectiveptyltd.com\">dylan.thorne@alchemisecollectiveptyltd.com</a></p><p>We aim to reply within 1 to 2 business days, Monday to Friday.</p><p>Shop-DopaDrop is a trading name of Alchemise Collective Pty Ltd (ABN 87 347 622 791).</p><p>Last updated: 18 October 2026.</p>"
  }
];
$w.onReady(function () {
    $w('Text').forEach(element => {
        if ((element.html || '').includes('<h1') && (element.text || '').trim() === 'Shipping Policy') {
            element.html = '<h1 style="color:#f5ff37;font-size:54px;line-height:1.1;font-weight:800">Shipping Policy</h1><p style="color:#ff37bb;font-size:19px;line-height:1.5">Free Australia-wide shipping. Clear delivery details.</p>';
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
