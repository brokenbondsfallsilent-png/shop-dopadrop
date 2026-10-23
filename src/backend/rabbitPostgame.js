const RIDDLE_SEEDS = [
    ['The Lantern That Waits', 'A lantern glows when nobody watches.', 'What keeps a quiet light alive?', ['patience', 'noise', 'rain'], 'patience'],
    ['The Moth Map', 'The moths draw a map without ink.', 'What guides a wandering wing?', ['curiosity', 'gravity', 'silence'], 'curiosity'],
    ['The Soft Bell', 'A bell rings only when the forest is ready.', 'What makes a sound worth hearing?', ['attention', 'volume', 'speed'], 'attention'],
    ['The Borrowed Glow', 'A borrowed glow still knows its way home.', 'Where does borrowed light return?', ['the source', 'the river', 'the cave'], 'the source'],
    ['The Patient Door', 'The door opens for the person who stops pushing.', 'What opens the patient door?', ['a pause', 'force', 'a key'], 'a pause'],
    ['The Moonlit Thread', 'A silver thread joins two distant branches.', 'What joins a path?', ['connection', 'distance', 'a wall'], 'connection'],
    ['The Quiet Wing', 'The smallest wing can change the whole clearing.', 'What changes a clearing?', ['movement', 'weight', 'stillness'], 'movement'],
    ['The Listening Stone', 'The stone remembers every footstep.', 'What does the stone keep?', ['memory', 'rain', 'fire'], 'memory'],
    ['The Warm Moss', 'Warm moss grows where travellers rest.', 'What helps a traveller continue?', ['rest', 'hurry', 'noise'], 'rest'],
    ['The Hidden Wick', 'A wick waits beneath the ash.', 'What does a wick need?', ['a spark', 'a storm', 'a shadow'], 'a spark'],
    ['The Gentle Turn', 'The path changes when the traveller changes pace.', 'What changes the path?', ['pace', 'weather', 'weight'], 'pace'],
    ['The Orchard Signal', 'One fruit shines when the orchard agrees.', 'What signals agreement?', ['a shared sign', 'a locked gate', 'a bell'], 'a shared sign'],
    ['The Night Compass', 'The compass points toward the kindest route.', 'What does it seek?', ['kindness', 'speed', 'gold'], 'kindness'],
    ['The Feathered Promise', 'A feather falls but the promise remains.', 'What remains after a promise?', ['trust', 'dust', 'silence'], 'trust'],
    ['The Last Lantern', 'The last lantern is lit for whoever returns.', 'Who receives the light?', ['the returning traveller', 'the first bird', 'the river'], 'the returning traveller']
];

export const MOTHKEEPER_RIDDLES = Array.from({ length: 7 }, (_, cycle) => RIDDLE_SEEDS.map((seed, slot) => ({
    id: cycle * 15 + slot + 1,
    cycle: cycle + 1,
    slot: slot + 1,
    title: `${seed[0]} — Cycle ${cycle + 1}`,
    teaser: seed[1],
    prompt: seed[2],
    choices: seed[3],
    answer: seed[4],
    collectible: `Lantern Memory ${cycle * 15 + slot + 1}`
}))).flat();

export const ROOTWHISPER_ITEMS = Array.from({ length: 105 }, (_, index) => ({
    id: index + 1,
    day: Math.floor(index / 15) + 1,
    label: `Rootwhisper trace ${String(index + 1).padStart(3, '0')}`
}));

export const MOTHKEEPER_RIDDLE_COUNT = MOTHKEEPER_RIDDLES.length;
export const ROOTWHISPER_ITEM_COUNT = ROOTWHISPER_ITEMS.length;
export const PRESTIGE_COST = 500;
export const MAX_PRESTIGE_CYCLES = 10;
export const PRESTIGE_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function postgameDay(day) {
    const safeDay = Math.max(1, Math.min(7, Number(day) || 1));
    return { day: safeDay, availableCount: safeDay * 15, itemIds: ROOTWHISPER_ITEMS.filter(item => item.day <= safeDay).map(item => item.id) };
}

export function canPrestige(state, now = new Date()) {
    if (!state?.mainQuestCompletedAt) return { ok: false, reason: 'MAIN_QUEST_INCOMPLETE' };
    if (Number(state.prestigeCount || 0) >= MAX_PRESTIGE_CYCLES) return { ok: false, reason: 'PRESTIGE_LIMIT_REACHED' };
    if (Number(state.loyaltyPoints || 0) < PRESTIGE_COST) return { ok: false, reason: 'INSUFFICIENT_POINTS' };
    if (now.getTime() - new Date(state.mainQuestCompletedAt).getTime() < PRESTIGE_COOLDOWN_MS) return { ok: false, reason: 'PRESTIGE_COOLDOWN' };
    return { ok: true };
}
