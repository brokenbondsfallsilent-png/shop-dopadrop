$w.onReady(function () {
    const heading = $w('Text').find(element => /<h1[ >]/i.test(element.html || '') || /My Orders/i.test(element.text || ''));
    if (heading) heading.html = '<h1>My Dopamine Deliveries</h1><p>My Orders</p>';
});
import { bindRabbitDiscovery } from 'public/rabbitDiscovery';

$w.onReady(() => bindRabbitDiscovery($w));
