const FOREST_SEQUENCE = Object.freeze([
    'mothkeeper:wait',
    'rootwhisper:protect',
    'grumblebark:listen',
    'tanglebright:approach'
]);
const DIALOGUE_NODES = new Set(['welcome', 'who', 'reward', 'later']);
const REWARD_STATUSES = new Set([
    'not_eligible', 'eligible', 'pending', 'reconciliation_required', 'awarded', 'code_issued'
]);
const REWARD_CHOICES = new Set(['checkout_code', 'loyalty_points']);

function stringList(value) {
    return Array.isArray(value)
        ? [...new Set(value.filter(item => typeof item === 'string' && item.trim()))]
        : [];
}

function encounterPrefix(value) {
    if (!Array.isArray(value)) return [];
    const prefix = [];
    for (let index = 0; index < FOREST_SEQUENCE.length; index += 1) {
        if (value[index] !== FOREST_SEQUENCE[index]) break;
        prefix.push(value[index]);
    }
    return prefix;
}

export function normaliseRabbitDetails(item = {}) {
    const forest = item.forestState && typeof item.forestState === 'object' && !Array.isArray(item.forestState)
        ? item.forestState
        : {};
    const rawBonds = forest.bonds && typeof forest.bonds === 'object' && !Array.isArray(forest.bonds)
        ? forest.bonds
        : {};
    const bonds = Object.fromEntries(Object.entries(rawBonds).filter(([, value]) => (
        typeof value === 'number' && Number.isFinite(value) && value >= 0
    )));
    const completedDays = Array.isArray(forest.completedDays)
        ? [...new Set(forest.completedDays.filter(day => Number.isInteger(day) && day >= 1 && day <= 30))].sort((a, b) => a - b)
        : [];
    const rawDialogue = item.lootgremState && typeof item.lootgremState === 'object' && !Array.isArray(item.lootgremState)
        ? item.lootgremState
        : {};
    const node = DIALOGUE_NODES.has(rawDialogue.node) ? rawDialogue.node : 'welcome';
    return {
        forestState: {
            bonds,
            fragments: stringList(forest.fragments),
            encounters: encounterPrefix(forest.encounters),
            completedDays
        },
        lootgremState: {
            node,
            claimAuthorized: node === 'reward' && rawDialogue.claimAuthorized === true
        },
        rewardStatus: REWARD_STATUSES.has(item.rewardStatus) ? item.rewardStatus : 'not_eligible',
        rewardChoice: REWARD_CHOICES.has(item.rewardChoice) ? item.rewardChoice : null
    };
}
