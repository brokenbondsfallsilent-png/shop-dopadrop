import { authentication } from 'wix-members-frontend';
import { getDailyContent, solveDailyContent } from 'backend/rabbitHole.web';
$w.onReady(async () => {
    if (!(await authentication.loggedIn())) { await authentication.promptLogin(); return; }
    const message = $w('#dailyMessage'); const answer = $w('#dailyAnswer');
    try { const result = await getDailyContent(); if (!result.entry) { if (message) message.text = 'The daily chronicle is sleeping.'; return; } if (message) message.text = `${result.entry.title}: ${result.entry.prompt}`; if ($w('#dailySubmit')) $w('#dailySubmit').onClick(async () => { const solved = await solveDailyContent(result.entry.day, answer?.value || ''); if (message) message.text = solved.correct ? `Correct. You found ${solved.collectible}.` : 'Not quite. The forest keeps the answer for now.'; }); } catch (error) { if (message) message.text = 'Sign in to read the daily chronicle.'; }
});
