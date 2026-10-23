import { authentication } from 'wix-members-frontend';
import { forestEncounter } from 'backend/rabbitHole.web';
$w.onReady(async () => { if (!(await authentication.loggedIn())) { await authentication.promptLogin(); return; } const result = await forestEncounter('lootgrem', 'listen'); if ($w('#forestMessage')) $w('#forestMessage').text = result.dialogue || 'The forest is listening.'; });
