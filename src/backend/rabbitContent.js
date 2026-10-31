export const TOTAL_BUTTONS = 50;
export const REWARD_POINTS = 500;
export const LOOTGREM_CHECKOUT_CODE = 'LOOTGREM';
export const GUARDIAN_MILESTONES = [
    { threshold: 20, label: 'MOTHKEEPER', characterId: 'mothkeeper', actionId: 'wait', difficulty: 'NORMAL' },
    { threshold: 30, label: 'ROOTWHISPER', characterId: 'rootwhisper', actionId: 'protect', difficulty: 'HARDER' },
    { threshold: 40, label: 'GRUMBLEBARK', characterId: 'grumblebark', actionId: 'listen', difficulty: 'EXTREME' },
    { threshold: 50, label: 'TANGLEBRIGHT', characterId: 'tanglebright', actionId: 'approach', difficulty: 'IMPOSSIBLE' }
];
export const HUNT_STAGES = GUARDIAN_MILESTONES;
export const CAMPAIGN_START = '2026-10-30';

const placements = [];
const place = (route, surface, anchor, editorElementId) => {
    if (!editorElementId) throw new Error('HUNT_EDITOR_ELEMENT_ID_REQUIRED');
    placements.push(Object.freeze({
        buttonId: placements.length + 1,
        route,
        surface,
        anchor,
        editorElementId
    }));
};

// Audited against the Velo page modules and preserved catalogue slugs in this
// checkout. Native Wix elements are deliberately represented as an editor
// contract: source can bind them, but only Wix Studio can place them on canvas.
['hero artwork', 'featured products', 'collection trail', 'founder invitation']
    .forEach((anchor, index) => place('/', 'home', anchor, `home-sprinkle-${index + 1}`));
[
    ['shop-all heading', 'rabbitDiscoveryHeading'],
    ['catalogue midpoint', 'rabbitDiscoveryGrid'],
    ['catalogue footer', 'rabbitDiscoveryFooter']
].forEach(([anchor, editorElementId]) => place('/category/all-products', 'shop-all', anchor, editorElementId));
[
    'desk-workspace-fidgets', 'hand-fidgets-spinners', 'sensory-rings-chains-wearables',
    'chew-oral-sensory', 'tactile-textured-sensory', 'weighted-deep-pressure',
    'visual-light-stimulation', 'auditory-rhythm-tools', 'focus-calm-tools',
    'stim-toys-squishies', 'sensory-kits-bundles', 'movement-balance'
].forEach(slug => {
    place(`/category/${slug}`, 'collection', `${slug} heading`, 'rabbitDiscoveryHeading');
    place(`/category/${slug}`, 'collection', `${slug} product grid`, 'rabbitDiscoveryGrid');
});
const placeStatic = (route, surface, anchor) => {
    const buttonId = placements.length + 1;
    place(route, surface, anchor, `rabbitDiscovery${buttonId}`);
};
['founder story opening', 'origin story midpoint', 'welcome home sign-off']
    .forEach(anchor => placeStatic('/about', 'about', anchor));
['support introduction', 'help choosing section', 'contact sign-off']
    .forEach(anchor => placeStatic('/contact', 'support', anchor));
placeStatic('/shipping-policy', 'policy', 'tracking section');
placeStatic('/refund-policy', 'policy', 'refunds section');
placeStatic('/privacy-policy', 'policy', 'privacy promise');
placeStatic('/shipping-policy', 'policy', 'delivery help footer');
placeStatic('/refund-policy', 'policy', 'returns help footer');
placeStatic('/privacy-policy', 'policy', 'data controls footer');
placeStatic('/accessibility-statement', 'adventure', 'assistance footer');
placeStatic('/rabbit-hole-forest', 'adventure', 'forest path');
placeStatic('/rabbit-hole-daily', 'adventure', 'daily chronicle');
placeStatic('/blog', 'adventure', 'brain dump archive');
placeStatic('/gift-card', 'adventure', 'gift card artwork');
placeStatic('/accessibility-statement', 'adventure', 'accessibility promise');
placeStatic('/rabbit-hole-forest', 'adventure', 'Tanglebright threshold');

if (placements.length !== TOTAL_BUTTONS) throw new Error('HUNT_PLACEMENT_COUNT_INVALID');
export const HUNT_PLACEMENTS = Object.freeze(placements);
export const HUNT_ROUTE = Object.freeze(HUNT_PLACEMENTS.map(placement => placement.route));

export const LOOTGREM_DIALOGUE = {
    welcome: {
        text: 'The fire crackles. Tanglebright, the final Loot Seeker, watches you. “Fifty little secrets. And you found every one.”',
        choices: [
            { id: 'who', text: 'Who are you?' },
            { id: 'reward', text: 'I came for the treasure.' }
        ]
    },
    who: {
        text: '“I am Tanglebright, the Loot Seeker. I keep the final choice: five hundred loyalty points, or a checkout reward.”',
        choices: [{ id: 'reward', text: 'And my treasure?' }]
    },
    reward: {
        text: '“Five hundred points, once per traveller. Shall I place them in your pouch?”',
        choices: [
            { id: 'claim', text: 'Yes. Claim my 500 points.' },
            { id: 'code', text: 'Give me the checkout code instead.' },
            { id: 'later', text: 'Not yet.' }
        ]
    },
    later: {
        text: '“The fire will wait.”',
        choices: [{ id: 'reward', text: 'I am ready now.' }]
    }
};

export function transitionLootgrem(currentState = {}, node, option, reward = {}) {
    const current = currentState.node || 'welcome';
    if (node !== current) throw new Error('DIALOGUE_OUT_OF_SEQUENCE');
    const available = LOOTGREM_DIALOGUE[current]?.choices || [];
    if (!available.some(choice => choice.id === option)) throw new Error('INVALID_DIALOGUE_CHOICE');
    if (['pending', 'reconciliation_required', 'awarded', 'code_issued'].includes(reward.rewardStatus)) {
        throw new Error('REWARD_CHOICE_LOCKED');
    }
    if (option === 'claim' || option === 'code') {
        return {
            state: { node: current, claimAuthorized: true },
            rewardChoice: option === 'code' ? 'checkout_code' : 'loyalty_points',
            response: { next: option, requiresExplicitClaim: true }
        };
    }
    return {
        state: { node: option, claimAuthorized: false },
        rewardChoice: null,
        response: { next: option, dialogue: LOOTGREM_DIALOGUE[option] }
    };
}

export const FOREST_ENCOUNTERS = {
    mothkeeper: {
        name: 'The first forest encounter',
        actions: {
            wait: { line: 'You let the Mothkeeper\'s lantern settle before asking.', affinity: 2, fragment: 'Lantern Oath' },
            ask: { line: 'You ask who lit the lantern.', affinity: 1, fragment: 'First Flame' }
        }
    },
    rootwhisper: {
        name: 'The second forest encounter',
        actions: {
            protect: { line: 'You shield a tiny shoot from the cold.', affinity: 2, fragment: 'Seed Promise' },
            explore: { line: 'You follow a root toward the dark.', affinity: 1, fragment: 'Root Map' }
        }
    },
    grumblebark: {
        name: 'Grumblebark, keeper of the Lowwood',
        actions: {
            listen: { line: 'You stay quiet while Grumblebark tells the roots what the storm forgot.', affinity: 2, fragment: 'Lowwood Echo' },
            answer: { line: 'You answer the old bark with a promise to tread gently.', affinity: 1, fragment: 'Bark Promise' }
        }
    },
    tanglebright: {
        name: 'The final forest encounter',
        actions: {
            approach: { line: 'Tanglebright steps from the thicket. The final path to the cave opens.', affinity: 2, fragment: 'Tanglebright Thread' }
        }
    }
};

export const TANGLEBRIGHT_REWARD = {
    name: 'Tanglebright, the Loot Seeker',
    code: LOOTGREM_CHECKOUT_CODE,
    points: REWARD_POINTS
};

const RAW_DAYS = [
    ['The Door That Wasn’t', 'The smallest doorway is often a sentence. Find the invitation hidden in the welcome.', 'What opens the first path?', ['curiosity', 'coins', 'thunder'], 'curiosity'],
    ['The Keeper of Names', 'The founder’s story has a quiet keeper. Seek what follows every beginning.', 'What follows a beginning?', ['a story', 'a receipt', 'a storm'], 'a story'],
    ['The Restless Clock', 'Tiny hands turn without time. Count what returns to its start.', 'Which shape has no ending?', ['circle', 'square', 'triangle'], 'circle'],
    ['The Shelf of Echoes', 'An ordinary shelf remembers every footstep. Follow the noise.', 'Where does an echo travel?', ['sound', 'silence', 'stone'], 'sound'],
    ['The Humming Root', 'A rhythm becomes a colour when the forest closes its eyes.', 'Which sense follows the hum?', ['sight', 'taste', 'smell'], 'sight'],
    ['The Lantern That Blinked', 'The lantern glows even when no one holds it.', 'What feeds a firefly’s light?', ['its own glow', 'a candle', 'a battery'], 'its own glow'],
    ['The Heavy Feather', 'The feather is light, the promise is heavy. Look for comfort, not weight.', 'Which word unlocks the feather?', ['comfort', 'gravity', 'iron'], 'comfort'],
    ['The Orchard of Quiet', 'A patient orchard asks for a gentler pace.', 'What does the orchard ask for?', ['patience', 'speed', 'noise'], 'patience'],
    ['The Compass That Listened', 'North is not always a direction. Sometimes it is someone who listens.', 'What points the compass onward?', ['connection', 'north pole', 'magnet'], 'connection'],
    ['The Postbox of Moths', 'The moths deliver invitations to gatherings after dark.', 'Where do invitations lead?', ['events', 'returns', 'checkout'], 'events'],
    ['The Festival Without a Date', 'The party begins whenever someone arrives.', 'What makes a gathering?', ['people', 'confetti', 'a clock'], 'people'],
    ['The Parcel Under the Fern', 'A parcel moves through the forest, but its secrets stay sealed.', 'What should stay sealed?', ['private details', 'a leaf', 'a ribbon'], 'private details'],
    ['The Unseen Footprints', 'Footprints are stories, but not every story should be collected.', 'What belongs to its owner?', ['personal data', 'mud', 'moonlight'], 'personal data'],
    ['The Pact of the Hollow Tree', 'Every trail needs a promise that protects the travellers.', 'What keeps the game fair?', ['rules', 'shortcuts', 'luck'], 'rules'],
    ['The Map That Grew', 'A map grows as its traveller learns.', 'What reveals a hidden route?', ['discovery', 'guessing', 'buying'], 'discovery'],
    ['The Second Sunrise', 'The forest starts again, but its first light is different.', 'What returns every morning?', ['sunrise', 'midnight', 'snow'], 'sunrise'],
    ['The Unpurchased Treasure', 'Not everything valuable has a price tag.', 'What can be found but not bought?', ['wonder', 'postage', 'stock'], 'wonder'],
    ['The Spinning Acorn', 'An acorn spins until it settles in the moss.', 'What stops a spinning acorn?', ['rest', 'noise', 'wind-up'], 'rest'],
    ['The Blanket of Stars', 'A blanket covers the forest without touching a tree.', 'What covers the night sky?', ['stars', 'paper', 'wool'], 'stars'],
    ['The Glass River', 'Watch the river, then listen to what it carries.', 'What does water make on stones?', ['ripples', 'sparks', 'dust'], 'ripples'],
    ['The Beat Beneath the Bridge', 'A bridge keeper asks for a rhythm, not a password.', 'What keeps a steady beat?', ['pulse', 'shadow', 'feather'], 'pulse'],
    ['The Orchard Key', 'The orchard’s key is hidden in the reason the forest exists.', 'Where do origins live?', ['about', 'checkout', 'delivery'], 'about'],
    ['The Gentle Monster', 'The monster has claws but chooses kindness.', 'What makes the monster gentle?', ['choice', 'size', 'silence'], 'choice'],
    ['The Different Path', 'No two brains walk the forest in quite the same way.', 'Which path is correct?', ['your own', 'the fastest', 'the loudest'], 'your own'],
    ['The Invitation in Ash', 'A campfire invitation needs someone to answer it.', 'What completes an invitation?', ['a reply', 'a stamp', 'a flame'], 'a reply'],
    ['The Return of the Lost Leaf', 'The leaf travels back to the tree it remembers.', 'Where does the leaf return?', ['home', 'the moon', 'the sea'], 'home'],
    ['The Whispering Boundary', 'The boundary is invisible, but the promise is clear.', 'What should a boundary protect?', ['trust', 'noise', 'dust'], 'trust'],
    ['The Last Agreement', 'Before entering the cave, remember the rule that makes treasure meaningful.', 'How many times may one member claim?', ['once', 'twice', 'forever'], 'once'],
    ['The Cave of Quiet Sparks', 'The embers spell a name that every explorer knows.', 'Who watches the campfire?', ['lootgrem', 'the merchant', 'the postman'], 'lootgrem'],
    ['The Thirty-First Shadow', 'The final shadow points back to the cave, where the journey began to change.', 'What survives after the last clue?', ['memory', 'a timer', 'a coupon'], 'memory']
];

export function buildDailyContent(rawDays, expectedCount = 30) {
    if (!Array.isArray(rawDays) || rawDays.length !== expectedCount) {
        throw new Error('DAILY_CONTENT_COUNT_INVALID');
    }
    const titles = new Set();
    return rawDays.map((entry, index) => {
        if (!Array.isArray(entry) || entry.length !== 5) throw new Error('DAILY_CONTENT_FIELD_INVALID');
        const [title, teaser, prompt, choices, answer] = entry;
        if (![title, teaser, prompt, answer].every(value => typeof value === 'string' && value.trim())) {
            throw new Error('DAILY_CONTENT_FIELD_INVALID');
        }
        const titleKey = title.trim().toLowerCase();
        if (titles.has(titleKey)) throw new Error('DAILY_CONTENT_TITLE_DUPLICATE');
        titles.add(titleKey);
        if (!Array.isArray(choices) || choices.length !== 3 || !choices.every(choice => typeof choice === 'string' && choice.trim())) {
            throw new Error('DAILY_CONTENT_CHOICES_INVALID');
        }
        const choiceKeys = choices.map(choice => choice.trim().toLowerCase());
        if (new Set(choiceKeys).size !== choices.length) throw new Error('DAILY_CONTENT_CHOICES_INVALID');
        if (!choiceKeys.includes(answer.trim().toLowerCase())) throw new Error('DAILY_CONTENT_ANSWER_INVALID');
        return {
            day: index + 1,
            title,
            teaser,
            prompt,
            choices: [...choices],
            answer,
            collectible: `Forest Chronicle: ${title}`
        };
    });
}

export const DAILY_CONTENT = buildDailyContent(RAW_DAYS);

export function campaignDay(now = new Date(), start = CAMPAIGN_START) {
    const sydneyParts = new Intl.DateTimeFormat('en-AU', {
        timeZone: 'Australia/Sydney',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(now);
    const part = (type) => Number(sydneyParts.find((item) => item.type === type)?.value);
    const todayUtc = Date.UTC(part('year'), part('month') - 1, part('day'));
    const [year, month, day] = start.split('-').map(Number);
    const startUtc = Date.UTC(year, month - 1, day);
    return Math.max(0, Math.min(30, Math.floor((todayUtc - startUtc) / 86400000) + 1));
}
