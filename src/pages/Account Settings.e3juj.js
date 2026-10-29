$w.onReady(function () {
    const heading = $w('Text').find(element => /<h1[ >]/i.test(element.html || '') || /Account Settings/i.test(element.text || ''));
    if (heading) heading.html = '<h1>My Little Corner of Chaos</h1><p>Account Settings</p>';
});
import { bindRabbitDiscovery } from 'public/rabbitDiscovery';

$w.onReady(() => bindRabbitDiscovery($w));
