import { bindRabbitDiscovery } from 'public/rabbitDiscovery';

$w.onReady(() => bindRabbitDiscovery($w));
$w.onReady(function () {
    const heading = $w('Text').find(element => /<h1[ >]/i.test(element.html || ''));
    if (heading) heading.html = '<h1>Gift a Little Dopamine</h1><p>Shop Gift Cards</p>';
});
