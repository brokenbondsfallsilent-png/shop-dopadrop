import { authentication } from 'wix-members-frontend';
import { forestEncounter } from 'backend/rabbitHole.web';

$w.onReady(async () => {
    if (!(await authentication.loggedIn())) { await authentication.promptLogin(); return; }
    $w('#comp-mvl0wln1').onClick(() => forestEncounter('lootgrem', 'listen'));
    $w('#comp-mvl101pj').onClick(() => forestEncounter('mothkeeper', 'wait'));
    $w('#comp-mvl11a5p').onClick(() => forestEncounter('rootwhisper', 'protect'));
});
