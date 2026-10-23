import { authentication } from 'wix-members-frontend';
import { enterCave, chooseLootgrem, claimReward } from 'backend/rabbitHole.web';
$w.onReady(async () => {
    if (!(await authentication.loggedIn())) { await authentication.promptLogin(); return; }
    const message = $w('#caveMessage');
    const render = (value) => { if (message) message.text = value; };
    try {
        const opening = await enterCave();
        render(opening.dialogue?.text || 'The fire crackles. LOOTGREM is waiting.');
        if ($w('#lootgremWho')) $w('#lootgremWho').onClick(async () => { const next = await chooseLootgrem('welcome', 'who'); render(next.dialogue?.text || 'LOOTGREM watches the fire.'); });
        if ($w('#lootgremReward')) $w('#lootgremReward').onClick(async () => { const next = await chooseLootgrem('welcome', 'reward'); render(next.dialogue?.text || 'Five hundred points, once per traveller.'); });
        if ($w('#lootgremClaim')) $w('#lootgremClaim').onClick(async () => { const next = await chooseLootgrem('reward', 'claim'); if (next.requiresExplicitClaim) { const result = await claimReward(); render(result.status === 'disabled' ? 'Reward integration is disabled in this draft until testing is approved.' : `LOOTGREM placed ${result.points} points in your account.`); } });
    } catch (error) { render(error?.message === 'CAVE_LOCKED' ? 'The cave is sealed. Find all 50 buttons first.' : 'Sign in to enter the cave.'); }
});
