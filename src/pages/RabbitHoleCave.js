import { authentication } from 'wix-members-frontend';
import { enterCave } from 'backend/rabbitHole.web';
$w.onReady(async () => { if (!(await authentication.loggedIn())) { await authentication.promptLogin(); return; } const result = await enterCave(); if ($w('#caveMessage')) $w('#caveMessage').text = result.dialogue || 'The cave is open.'; });
