const FOREST_SEQUENCE = Object.freeze([
    'mothkeeper:wait',
    'rootwhisper:protect',
    'grumblebark:listen',
    'tanglebright:approach'
]);

export function rabbitActivityFacts(state = {}) {
    const forest = state.forestState || {};
    const completedDays = Array.isArray(forest.completedDays)
        ? new Set(forest.completedDays.filter(day => Number.isInteger(day) && day >= 1 && day <= 30))
        : new Set();
    const encounters = Array.isArray(forest.encounters) ? forest.encounters : [];
    const completedForest = FOREST_SEQUENCE.every((key, index) => encounters[index] === key);
    return {
        riddlesSolved: completedDays.size,
        questChainsCompleted: completedForest ? 1 : 0
    };
}
