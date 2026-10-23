import { authentication } from 'wix-members-frontend';
import { enterCave, chooseLootgrem, claimReward } from 'backend/rabbitHole.web';

$w.onReady(async () => {
    if (!(await authentication.loggedIn())) { await authentication.promptLogin(); return; }
    try {
        await enterCave();
        $w('#comp-mvl0ugrl').onClick(() => chooseLootgrem('welcome', 'who'));
        $w('#comp-mvl0uqjc').onClick(() => chooseLootgrem('welcome', 'reward'));
        $w('#comp-mvl0v0ka').onClick(async () => {
            const next = await chooseLootgrem('reward', 'claim');
            if (next.requiresExplicitClaim) await claimReward();
        });
    } catch (error) {
        console.error('Rabbit Hole cave gate failed:', error);
    }
});
