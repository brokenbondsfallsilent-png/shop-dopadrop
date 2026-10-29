import { FOREST_ENCOUNTERS, GUARDIAN_MILESTONES } from './rabbitContent.js';

const CANONICAL_SEQUENCE = Object.freeze(
    GUARDIAN_MILESTONES.map(stage => `${stage.characterId}:${stage.actionId}`)
);

function completedPrefix(encounters) {
    if (!Array.isArray(encounters)) return 0;
    let count = 0;
    while (count < CANONICAL_SEQUENCE.length && encounters[count] === CANONICAL_SEQUENCE[count]) count += 1;
    return count;
}

function actionLabel(actionId) {
    return `${actionId.charAt(0).toUpperCase()}${actionId.slice(1)}`;
}

export function buildForestStageView(state = {}) {
    const completed = completedPrefix(state.forestState?.encounters);
    const progress = { current: completed, total: CANONICAL_SEQUENCE.length };
    if (completed === CANONICAL_SEQUENCE.length) {
        return {
            completed: true,
            locked: false,
            progress,
            guardian: null,
            prompt: 'Every guardian has answered. The path to the cave is open.',
            choices: []
        };
    }

    const stage = GUARDIAN_MILESTONES[completed];
    const encounter = FOREST_ENCOUNTERS[stage.characterId];
    const locked = Math.max(0, Number(state.foundCount) || 0) < stage.threshold;
    return {
        completed: false,
        locked,
        progress,
        guardian: {
            id: stage.characterId,
            label: stage.label,
            threshold: stage.threshold,
            difficulty: stage.difficulty
        },
        prompt: locked
            ? `${stage.label} appears after ${stage.threshold} discoveries.`
            : encounter.name,
        choices: locked ? [] : [{
            id: `${stage.characterId}-${stage.actionId}`,
            label: actionLabel(stage.actionId),
            characterId: stage.characterId,
            actionId: stage.actionId
        }]
    };
}
