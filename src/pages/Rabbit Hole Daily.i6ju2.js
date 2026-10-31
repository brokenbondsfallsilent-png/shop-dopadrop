import { authentication } from 'wix-members-frontend';
import { getDailyContent, solveDailyContent } from 'backend/rabbitHole.web';
import { bindRabbitDiscovery } from 'public/rabbitDiscovery';
import { bindRabbitQuestionView } from 'public/rabbitQuestionBridge';

$w.onReady(() => bindRabbitDiscovery($w));

let reloadDailyQuestion = async () => {};

$w.onReady(function () {
    let initialized = false;
    const initialize = () => {
        if (initialized) {
            reloadDailyQuestion();
            return;
        }
        initialized = true;

    let content;
    let entry;
    let choiceMap = new Map();

    const snapshot = (status) => {
        if (!entry) {
            return {
                mode: 'daily',
                eyebrow: 'Rabbit Hole Daily',
                progress: { current: 0, total: 30 },
                question: 'The next forest chronicle has not been released yet.',
                hint: 'Return when the forest opens its next clue.',
                choices: [{ id: 'unreleased', label: 'Chronicle locked', action: 'answer' }],
                meta: ['DAY 0 OF 30', 'No points are awarded here'],
                status: { kind: 'locked', message: 'No daily question is available yet.' }
            };
        }
        const completed = content.completedDays.includes(entry.day);
        return {
            mode: 'daily',
            eyebrow: `Day ${entry.day} · ${entry.title}`,
            progress: { current: entry.day, total: 30 },
            question: entry.prompt,
            hint: entry.teaser,
            choices: entry.choices.map((choice, index) => ({
                id: `choice-${index + 1}`,
                label: choice,
                action: 'answer'
            })),
            meta: [`DAY ${entry.day} OF 30`, 'No points are awarded here'],
            status: status || (completed
                ? { kind: 'completed', message: 'Today\'s chronicle is complete.' }
                : { kind: 'ready', message: 'Choose one answer.' })
        };
    };

    const load = async () => {
        content = await getDailyContent();
        entry = content?.entry || null;
        choiceMap = new Map((entry?.choices || []).map((choice, index) => [`choice-${index + 1}`, choice]));
        return snapshot();
    };

    const questionView = bindRabbitQuestionView($w, {
        load,
        submit: async action => {
            const answer = choiceMap.get(action.choiceId);
            if (action.action !== 'answer' || !answer || !entry) throw new Error('INVALID_DAILY_CHOICE');
            return solveDailyContent(entry.day, answer);
        },
        mapResult: result => snapshot(result.correct
            ? { kind: 'completed', message: 'Correct. Today\'s forest chronicle is complete.' }
            : { kind: 'incorrect', message: `Not this time. ${result.attemptsRemaining} attempts remain.` }),
        mapError: error => {
            const message = String(error?.message || error || '');
            const limited = message.match(/DAILY_ATTEMPT_LIMITED:(\d+)/);
            if (limited) return snapshot({
                kind: 'limited',
                message: `The forest needs a pause. Try again in ${limited[1]} seconds.`
            });
            return snapshot({ kind: 'error', message: 'The chronicle could not be checked. Please try again.' });
        }
    });
    reloadDailyQuestion = questionView.reload;
    };
    // Do not await the login modal from onReady, and continue after login.
    authentication.onLogin(initialize);
    if (authentication.loggedIn()) initialize();
    else authentication.promptLogin().then(initialize).catch(() => {
        // The discovery button and shared member gem can retry a cancelled login.
    });
});

