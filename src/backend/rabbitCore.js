import { HUNT_ROUTE, HUNT_STAGES, TOTAL_BUTTONS } from './rabbitContent';
import { normaliseRabbitDetails } from './rabbitState';

export function normaliseState(item = {}) {
    const foundIds = [...new Set((item.foundIds || []).map(Number).filter(id => Number.isInteger(id) && id >= 1 && id <= TOTAL_BUTTONS))].sort((a, b) => a - b);
    const details = normaliseRabbitDetails(item);
    return {
        ...item,
        foundIds,
        foundCount: foundIds.length,
        caveUnlocked: foundIds.length === TOTAL_BUTTONS,
        caveEntered: Boolean(item.caveEntered),
        ...details,
        version: Number(item.version || 1)
    };
}

export function addFind(item, buttonId, pagePath) {
    if (!Number.isInteger(buttonId) || buttonId < 1 || buttonId > TOTAL_BUTTONS) {
        throw new Error('UNKNOWN_BUTTON');
    }
    const state = normaliseState(item);
    const expectedId = state.foundCount + 1;
    const expectedPath = HUNT_ROUTE[expectedId - 1];
    if (buttonId !== expectedId) throw new Error('HUNT_STEP_OUT_OF_SEQUENCE');
    if (typeof pagePath === 'string' && pagePath !== expectedPath) throw new Error('WRONG_HUNT_PAGE');
    const isNew = !state.foundIds.includes(buttonId);
    if (isNew) state.foundIds.push(buttonId);
    state.foundIds.sort((a, b) => a - b);
    state.foundCount = state.foundIds.length;
    state.caveUnlocked = state.foundCount === TOTAL_BUTTONS;
    if (state.caveUnlocked && state.rewardStatus === 'not_eligible') state.rewardStatus = 'eligible';
    state.version += isNew ? 1 : 0;
    return { state, isNew };
}

export function publicState(item) {
    const state = normaliseState(item);
    const nextId = state.foundCount + 1;
    const rewardChoice = ['checkout_code', 'loyalty_points'].includes(state.rewardChoice) ? state.rewardChoice : null;
    return {
        foundIds: state.foundIds,
        found: state.foundCount,
        required: TOTAL_BUTTONS,
        caveUnlocked: state.caveUnlocked,
        caveEntered: state.caveEntered,
        rewardStatus: state.rewardStatus,
        rewardChoice,
        nextButtonId: nextId <= TOTAL_BUTTONS ? nextId : null,
        nextPage: nextId <= TOTAL_BUTTONS ? HUNT_ROUTE[nextId - 1] : null,
        stage: HUNT_STAGES.find(stage => nextId <= stage.threshold) || HUNT_STAGES.at(-1),
        forest: state.forestState,
        lootgrem: state.caveUnlocked ? state.lootgremState : null
    };
}
