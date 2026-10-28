import { authentication } from 'wix-members-frontend';
import { enterCave, chooseLootgrem } from 'backend/rabbitHole.web';

$w.onReady(async () => {
    if (!(await authentication.loggedIn())) {
        await authentication.promptLogin();
        return;
    }

    try {
        await enterCave();
        $w('#comp-mvl0ugrl').onClick(() => chooseLootgrem('welcome', 'who'));
        $w('#comp-mvl0uqjc').onClick(() => chooseLootgrem('welcome', 'reward'));
        // Live reward issuance remains deliberately unavailable from the page.
        // The backend claim gate can be exercised only through the safe test flow.
        $w('#comp-mvl0v0ka').onClick(() => chooseLootgrem('reward', 'claim'));
    } catch (error) {
        console.error('Rabbit Hole cave gate failed:', error);
    }
});
