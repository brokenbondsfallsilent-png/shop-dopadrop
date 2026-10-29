import { authentication } from 'wix-members-frontend';
import { forestEncounter } from 'backend/rabbitHole.web';
import { bindRabbitDiscovery } from 'public/rabbitDiscovery';

$w.onReady(() => bindRabbitDiscovery($w));

$w.onReady(async () => {
    if (!(await authentication.loggedIn())) {
        await authentication.promptLogin();
        return;
    }

    $w('#comp-mvl0wln1').onClick(() => forestEncounter('mothkeeper', 'wait'));
    $w('#comp-mvl101pj').onClick(() => forestEncounter('rootwhisper', 'protect'));
    $w('#comp-mvl11a5p').onClick(() => forestEncounter('tanglebright', 'approach'));
});
