import { authentication } from 'wix-members-frontend';
import { enterCave, chooseLootgrem } from 'backend/rabbitHole.web';
import { bindRabbitQuestionView } from 'public/rabbitQuestionBridge';

$w.onReady(async () => {
    if (!(await authentication.loggedIn())) {
        await authentication.promptLogin();
        return;
    }

    let currentNode = 'welcome';
    let dialogue = null;

    const lockedSnapshot = (message = 'Find all 50 hidden discoveries before entering the cave.') => ({
        mode: 'cave',
        guardianKey: 'tanglebright',
        eyebrow: 'Rabbit Hole Cave',
        progress: { current: 0, total: 1 },
        question: 'The cave remains sealed.',
        hint: 'The guardians will open it when the forest path is complete.',
        choices: [],
        meta: ['CAVE LOCKED', 'REWARDS DISABLED'],
        status: { kind: 'locked', message }
    });

    const dialogueSnapshot = (status) => ({
        mode: 'cave',
        guardianKey: 'tanglebright',
        eyebrow: 'Cave dialogue · Tanglebright',
        progress: { current: currentNode === 'welcome' ? 0 : 1, total: 3 },
        question: dialogue?.text || 'The campfire waits.',
        hint: 'Choose the response that feels right.',
        choices: (dialogue?.choices || []).map(choice => ({
            id: choice.id,
            label: choice.text,
            action: 'dialogue'
        })),
        meta: ['LOOTGREM DIALOGUE', 'REWARD ISSUANCE DISABLED'],
        status: status || { kind: 'ready', message: 'The fire is listening.' }
    });

    const terminalSnapshot = result => {
        const chosePoints = result.next === 'claim';
        const choseCode = result.next === 'code';
        const rewardDisabled = chosePoints && result.rewardIssuanceEnabled === false;
        return {
            mode: 'cave',
            guardianKey: 'tanglebright',
            eyebrow: 'Cave dialogue · Choice recorded',
            progress: { current: 3, total: 3 },
            question: choseCode
                ? 'Your checkout treasure choice has been recorded.'
                : 'Your loyalty treasure choice has been recorded.',
            hint: rewardDisabled
                ? 'Live loyalty-point issuance remains disabled.'
                : 'Continue through your private member dashboard when the safe claim pathway is available.',
            choices: [],
            meta: ['DIALOGUE COMPLETE', 'REWARD ISSUANCE DISABLED'],
            status: {
                kind: 'completed',
                message: choseCode
                    ? 'No checkout code is revealed on this page.'
                    : 'No loyalty points were issued.'
            }
        };
    };

    bindRabbitQuestionView($w, {
        load: async () => {
            const result = await enterCave();
            currentNode = result.lootgrem?.node || 'welcome';
            dialogue = result.dialogue;
            return dialogueSnapshot();
        },
        submit: async action => {
            if (action.action !== 'dialogue' || !dialogue?.choices?.some(choice => choice.id === action.choiceId)) {
                throw new Error('INVALID_DIALOGUE_CHOICE');
            }
            return chooseLootgrem(currentNode, action.choiceId);
        },
        mapResult: result => {
            if (result.dialogue) {
                currentNode = result.next;
                dialogue = result.dialogue;
                return dialogueSnapshot({ kind: 'correct', message: 'The fire shifts. Tanglebright answers.' });
            }
            if (result.next === 'claim' || result.next === 'code') return terminalSnapshot(result);
            return dialogueSnapshot({ kind: 'error', message: 'The dialogue could not continue.' });
        },
        mapError: error => {
            const message = String(error?.message || error || '');
            if (message.includes('CAVE_LOCKED')) return lockedSnapshot();
            return dialogue
                ? dialogueSnapshot({ kind: 'error', message: 'The fire went quiet. Please choose again.' })
                : lockedSnapshot('The cave could not be opened. Please return after completing the forest path.');
        }
    });
});

