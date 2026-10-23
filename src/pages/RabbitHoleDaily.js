import { authentication } from 'wix-members-frontend';
import { getDailyContent } from 'backend/rabbitHole.web';
$w.onReady(async () => { if (!(await authentication.loggedIn())) { await authentication.promptLogin(); return; } const result = await getDailyContent(); if ($w('#dailyMessage')) $w('#dailyMessage').text = result.entry?.prompt || 'The daily chronicle is sleeping.'; });
