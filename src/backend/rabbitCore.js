import { TOTAL_BUTTONS } from './rabbitContent';

export function normaliseState(item = {}) {
    const foundIds = [...new Set((item.foundIds || []).map(Number).filter(id => Number.isInteger(id) && id >= 1 && id <= TOTAL_BUTTONS))].sort((a, b) => a - b);
    return {
        ...item,
        foundIds,
        foundCount: foundIds.length,
        caveUnlocked: foundIds.length === TOTAL_BUTTONS,
        caveEntered: Boolean(item.caveEntered),
        lootgremState: item.lootgremState || { node: 'welcome', claimAuthorized: false },
        forestState: item.forestState || { bonds: {}, fragments: [], encounters: [] },
        rewardStatus: item.rewardStatus || 'not_eligible',
        version: Number(item.version || 1)
    };
}

export function addFind(item, buttonId) {
    if (!Number.isInteger(buttonId) || buttonId < 1 || buttonId > TOTAL_BUTTONS) {
        throw new Error('UNKNOWN_BUTTON');
    }
    const state = normaliseState(item);
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
    return {
        foundIds: state.foundIds,
        found: state.foundCount,
        required: TOTAL_BUTTONS,
        caveUnlocked: state.caveUnlocked,
        caveEntered: state.caveEntered,
        rewardStatus: state.rewardStatus,
        forest: state.forestState,
        lootgrem: state.caveUnlocked ? state.lootgremState : null
    };
}
