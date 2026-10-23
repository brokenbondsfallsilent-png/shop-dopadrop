import { authentication } from 'wix-members-frontend';
import { getDailyContent, solveDailyContent } from 'backend/rabbitHole.web';

$w.onReady(async () => {
    if (!(await authentication.loggedIn())) { await authentication.promptLogin(); return; }
    const answer = $w('#textarea_comp-mvl0zj49');
    const result = await getDailyContent();
    if (result?.entry) {
        $w('#comp-mvl0xvaa').onClick(() => solveDailyContent(result.entry.day, answer.value || ''));
    }
});
