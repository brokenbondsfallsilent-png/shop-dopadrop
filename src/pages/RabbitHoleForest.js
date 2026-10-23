import { authentication } from 'wix-members-frontend';
import { forestEncounter } from 'backend/rabbitHole.web';
$w.onReady(async () => {
    if (!(await authentication.loggedIn())) { await authentication.promptLogin(); return; }
    const message = $w('#forestMessage');
    const encounter = async (character, action) => { try { const result = await forestEncounter(character, action); if (message) message.text = result.dialogue || 'The forest is listening.'; } catch (error) { if (message) message.text = error?.message === 'FIRST_DISCOVERY_REQUIRED' ? 'Find the first hidden button to enter the forest.' : 'That encounter has already been recorded.'; } };
    if ($w('#lootgremListen')) $w('#lootgremListen').onClick(() => encounter('lootgrem', 'listen'));
    if ($w('#mothkeeperWait')) $w('#mothkeeperWait').onClick(() => encounter('mothkeeper', 'wait'));
    if ($w('#rootwhisperProtect')) $w('#rootwhisperProtect').onClick(() => encounter('rootwhisper', 'protect'));
    if (message) message.text = 'The forest is listening. Choose an encounter.';
});
