export const HUNT_ROUTE = ['/', '/about', '/category/all-products', '/category/best-sellers', '/gift-card', '/blog', '/contact', '/category/desk-workspace-fidgets', '/category/hand-fidgets-spinners', '/category/sensory-rings-chains-wearables', '/category/chew-oral-sensory', '/category/tactile-textured-sensory', '/category/weighted-deep-pressure', '/category/visual-light-stimulation', '/category/auditory-rhythm-tools', '/category/focus-calm-tools', '/category/stim-toys-squishies', '/category/sensory-kits-bundles', '/category/movement-balance', '/category/puzzles-hands-on-play', '/shipping-policy', '/refund-policy', '/privacy-policy', '/terms-and-conditions', '/accessibility-statement', '/category/all-products', '/about', '/contact', '/blog', '/gift-card', '/category/best-sellers', '/category/desk-workspace-fidgets', '/category/hand-fidgets-spinners', '/category/sensory-rings-chains-wearables', '/category/chew-oral-sensory', '/category/tactile-textured-sensory', '/category/weighted-deep-pressure', '/category/visual-light-stimulation', '/category/auditory-rhythm-tools', '/category/focus-calm-tools', '/category/stim-toys-squishies', '/category/sensory-kits-bundles', '/category/movement-balance', '/category/puzzles-hands-on-play', '/', '/about', '/category/all-products', '/contact', '/blog', '/gift-card'];

export const TOTAL_BUTTONS = 50;
export const REWARD_POINTS = 500;
export const CAMPAIGN_START = '2026-10-30';

// The hunt is a relay, not a single-page gallery. Each ordinal belongs to
// exactly one destination page; the member may only claim the next ordinal
// when the current page matches this route.
export const HUNT_ROUTE = [
    '/','/about','/category/all-products','/category/best-sellers','/gift-card',
    '/blog','/contact','/category/desk-workspace-fidgets','/category/hand-fidgets-spinners',
    '/category/sensory-rings-chains-wearables','/category/chew-oral-sensory',
    '/category/tactile-textured-sensory','/category/weighted-deep-pressure',
    '/category/visual-light-stimulation','/category/auditory-rhythm-tools',
    '/category/focus-calm-tools','/category/stim-toys-squishies',
    '/category/sensory-kits-bundles','/category/movement-balance','/category/puzzles-hands-on-play',
    '/shipping-policy','/refund-policy','/privacy-policy','/terms-and-conditions',
    '/accessibility-statement','/category/all-products','/about','/contact','/blog','/gift-card',
    '/category/best-sellers','/category/desk-workspace-fidgets','/category/hand-fidgets-spinners',
    '/category/sensory-rings-chains-wearables','/category/chew-oral-sensory',
    '/category/tactile-textured-sensory','/category/weighted-deep-pressure',
    '/category/visual-light-stimulation','/category/auditory-rhythm-tools',
    '/category/focus-calm-tools','/category/stim-toys-squishies',
    '/category/sensory-kits-bundles','/category/movement-balance','/category/puzzles-hands-on-play',
    '/','/about','/category/all-products','/contact','/blog','/gift-card'
];

export const LOOTGREM_DIALOGUE = {
    welcome: {
        text: 'The fire crackles. A moss-covered creature watches you. “Fifty little secrets. And you found every one.”',
        choices: [
            { id: 'who', text: 'Who are you?' },
            { id: 'reward', text: 'I came for the treasure.' }
        ]
    },
    who: {
        text: '“LOOTGREM. Keeper of lost buttons and very excellent apples.”',
        choices: [{ id: 'reward', text: 'And my treasure?' }]
    },
    reward: {
        text: '“Five hundred points, once per traveller. Shall I place them in your pouch?”',
        choices: [
            { id: 'claim', text: 'Yes. Claim my 500 points.' },
            { id: 'later', text: 'Not yet.' }
        ]
    },
    later: {
        text: '“The fire will wait.”',
        choices: [{ id: 'reward', text: 'I am ready now.' }]
    }
};

export const FOREST_ENCOUNTERS = {
    lootgrem: {
        name: 'LOOTGREM',
        actions: {
            listen: { line: 'You listen as LOOTGREM recounts the first ember.', affinity: 2, fragment: 'Ember Song' },
            share: { line: 'You share a tale of the road.', affinity: 1, fragment: 'Roadsong' }
        }
    },
    mothkeeper: {
        name: 'The Mothkeeper',
        actions: {
            wait: { line: 'You let the lantern settle before asking.', affinity: 2, fragment: 'Lantern Oath' },
            ask: { line: 'You ask who lit the lantern.', affinity: 1, fragment: 'First Flame' }
        }
    },
    rootwhisper: {
        name: 'Rootwhisper',
        actions: {
            protect: { line: 'You shield a tiny shoot from the cold.', affinity: 2, fragment: 'Seed Promise' },
            explore: { line: 'You follow a root toward the dark.', affinity: 1, fragment: 'Root Map' }
        }
    }
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

export const DAILY_CONTENT = RAW_DAYS.map((entry, index) => ({
    day: index + 1,
    title: entry[0],
    teaser: entry[1],
    prompt: entry[2],
    choices: entry[3],
    answer: entry[4],
    collectible: `Forest Chronicle: ${entry[0]}`
}));

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
