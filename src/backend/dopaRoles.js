// Store-wide DopaVerse identity rules. These are display identities only.
// Wix member roles and administrative permissions remain separate and must
// never be inferred from XP, purchases, achievements or profile selections.

export const MEMBERSHIP_RANKS = Object.freeze([
    { level: 4, title: 'Fidget Fiend', xp: 100 },
    { level: 5, title: 'DopaGoblin', xp: 250 },
    { level: 6, title: 'Chaos Collector', xp: 500 },
    { level: 7, title: 'Sensory Sorcerer', xp: 1000 },
    { level: 8, title: 'DopaDynamo', xp: 2000 },
    { level: 9, title: 'NeuroNinja', xp: 4000 },
    { level: 10, title: 'DopaLegend', xp: 7500 },
    { level: 11, title: 'Chaos Overlord', xp: 12000 },
    { level: 12, title: 'The Dopamine Deity', xp: 20000 }
]);

export const SENSORY_IDENTITIES = Object.freeze({
    'desk-workspace-fidgets': 'Desk Goblin',
    'hand-fidgets-spinners': 'Spin Wizard',
    'sensory-rings-chains-wearables': 'Wiggle Warden',
    'chew-oral-sensory': 'Chomp Champion',
    'tactile-textured-sensory': 'Texture Hunter',
    'weighted-deep-pressure': 'Gravity Guardian',
    'visual-light-stimulation': 'Glow Goblin',
    'auditory-rhythm-tools': 'Rhythm Wrangler',
    'focus-calm-tools': 'Calm Collector',
    'stim-toys-squishies': 'Squish Sorcerer',
    'sensory-kits-bundles': 'Bundle Alchemist',
    'movement-balance': 'Movement Maverick'
});

export const TITLE_CATALOGUE = Object.freeze({
    shopping: Object.freeze({
        browsed: 'DopaExplorer', newArrivals: 'Fresh Drop Hunter', savedProducts: 'Wishlist Wizard',
        firstPurchase: 'Loot Goblin', sensoryBundlePurchase: 'Bundle Bandit', multipleCategories: 'Stim Safari Scout',
        repeatPurchase: 'Repeat Offender', verifiedReview: 'Review Gremlin', sharedWishlist: 'DopaCurator',
        recommendation: 'Sensory Scout'
    }),
    quest: Object.freeze({
        started: 'Clueless Wanderer', firstButton: 'Button Sniffer', firstRiddle: 'Riddle Rat',
        multipleElements: 'Pixel Prowler', secretPage: 'Secret Snatcher', questChain: 'Clue Goblin',
        portal: 'Portal Peeper', hiddenAreas: 'Chaos Cartographer', advancedPuzzle: 'DopaDetective',
        completed: 'The Grand Gremlin', apple: 'The Apple Thief', midnight: 'Midnight Mole',
        optionalSecrets: 'The Unreasonably Curious', vault: 'The Vaultbreaker'
    }),
    rewards: Object.freeze({
        accountOpened: 'Point Goblin', firstPoints: 'DopaDepositor', points500: 'Dopamine Stasher',
        points1000: 'Reward Raider', redeemed: 'Loot Liberator', milestone: 'Perk Collector',
        rareReward: 'Golden Goblin', highestTier: 'Vault Royalty'
    }),
    learning: Object.freeze({
        resourcesRead: 'Curiosity Critter', guideCompleted: 'Brain Explorer', preferencesExplored: 'Sensory Pathfinder',
        verifiedFacts: 'Fact Goblin', unusualFacts: 'Oddity Hunter', quizCompleted: 'Knowledge Gremlin',
        sourcedFact: 'Fact Forager', factReviewer: 'Vault Curator'
    }),
    community: Object.freeze({
        joined: 'Squadling', active: 'DopaBuddy', regularDiscussion: 'Conversation Goblin', encouragement: 'Hype Sprite',
        greeter: 'Welcome Warden', approvedContent: 'Chaos Contributor', positiveContributor: 'DopaChampion',
        longStanding: 'Squad Elder', moderator: 'Community Guardian', teamLeader: 'DopaSquad Captain'
    }),
    events: Object.freeze({
        registered: 'Chaos Recruit', attended: 'DopaParticipant', challengeJoined: 'Challenge Goblin',
        completed: 'Chaos Conqueror', regular: 'Event Enthusiast', host: 'Chaos Conductor',
        volunteer: 'DopaHelper', organiser: 'Event Overlord'
    }),
    support: Object.freeze({
        general: 'Chaos Untangler', enquiries: 'DopaResponder', returns: 'Rescue Gremlin',
        shipping: 'Parcel Pathfinder', helpdesk: 'Answer Alchemist', priority: 'Priority Pathfinder',
        productGuidance: 'Sensory Guide', manager: 'Chief Chaos Coordinator'
    }),
    sitewide: Object.freeze({ exceptionalAchievement: 'The Grand Dopamancer' })
});

export const STAFF_ROLES = Object.freeze({
    founder: 'The Grand Alchemist', generalManager: 'Chief Chaos Officer', operationsManager: 'Chaos Coordinator',
    productSourcing: 'Dopamine Hunter', catalogueManager: 'Keeper of the Loot', developer: 'Pixel Alchemist',
    designer: 'Neon Necromancer', marketingManager: 'Chief Hype Goblin', socialMediaManager: 'Scroll Sorcerer',
    supportManager: 'Chief Chaos Untangler', fulfilmentManager: 'Dispatch Overlord', communityManager: 'DopaSquad Captain',
    accessibilityLead: 'Accessibility Guardian', factVerification: 'The Alchemist', eventsCoordinator: 'Chaos Conductor',
    securityAdministrator: 'Vault Guardian', storeAdministrator: 'DopaHQ Operator'
});

const sensoryTitles = new Set(Object.values(SENSORY_IDENTITIES));
const bool = value => value === true;
const count = value => Math.max(0, Number(value) || 0);

export function rankForXp(value, status = {}) {
    const xp = count(value);
    let rank = status.hasActivity
        ? { level: 3, title: 'Stimling' }
        : status.profileComplete
            ? { level: 2, title: 'DopaSprout' }
            : { level: 1, title: 'Freshly Dropped' };
    for (const candidate of MEMBERSHIP_RANKS) if (xp >= candidate.xp) rank = { level: candidate.level, title: candidate.title };
    return rank;
}

export function questIdentity(state = {}) {
    const found = count(state.foundCount ?? state.found);
    const milestones = [
        [50, 10, 'The Grand Gremlin'], [40, 9, 'DopaDetective'], [30, 8, 'Chaos Cartographer'],
        [20, 7, 'Portal Peeper'], [15, 6, 'Clue Goblin'], [10, 5, 'Secret Snatcher'],
        [5, 4, 'Pixel Prowler'], [2, 3, 'Riddle Rat'], [1, 2, 'Button Sniffer'], [0, 1, 'Clueless Wanderer']
    ];
    const [minimum, level, title] = milestones.find(([threshold]) => found >= threshold);
    return { level, title, found, threshold: minimum };
}

export function deriveAchievementTitles(activity = {}) {
    const titles = [];
    const add = (condition, title) => { if (condition && !titles.includes(title)) titles.push(title); };
    const shopping = TITLE_CATALOGUE.shopping;
    add(bool(activity.storeBrowsed), shopping.browsed);
    add(bool(activity.newArrivalsViewed), shopping.newArrivals);
    add(count(activity.savedProducts) > 0, shopping.savedProducts);
    add(bool(activity.firstPurchase) || count(activity.purchaseCount) >= 1, shopping.firstPurchase);
    add(count(activity.sensoryBundlePurchases) > 0, shopping.sensoryBundlePurchase);
    add(count(activity.categoriesExplored) >= 3, shopping.multipleCategories);
    add(count(activity.purchaseCount) >= 2, shopping.repeatPurchase);
    add(count(activity.verifiedReviews) > 0, shopping.verifiedReview);
    add(count(activity.sharedWishlists) > 0, shopping.sharedWishlist);
    add(count(activity.productRecommendations) > 0, shopping.recommendation);

    const quest = TITLE_CATALOGUE.quest;
    add(count(activity.hiddenButtonsFound) === 0 && bool(activity.questJoined), quest.started);
    add(count(activity.hiddenButtonsFound) >= 1, quest.firstButton);
    add(count(activity.riddlesSolved) >= 1, quest.firstRiddle);
    add(count(activity.hiddenButtonsFound) >= 5, quest.multipleElements);
    add(count(activity.secretPagesFound) >= 1, quest.secretPage);
    add(count(activity.questChainsCompleted) >= 1, quest.questChain);
    add(count(activity.portalsFound) >= 1, quest.portal);
    add(count(activity.hiddenAreasExplored) >= 1, quest.hiddenAreas);
    add(count(activity.advancedPuzzlesSolved) >= 1, quest.advancedPuzzle);
    add(bool(activity.questCompleted) || count(activity.hiddenButtonsFound) >= 50, quest.completed);
    add(bool(activity.appleFound), quest.apple);
    add(bool(activity.midnightClueFound), quest.midnight);
    add(bool(activity.optionalSecretsExplored), quest.optionalSecrets);
    add(bool(activity.vaultBroken), quest.vault);

    const rewards = TITLE_CATALOGUE.rewards;
    add(bool(activity.rewardsAccount), rewards.accountOpened);
    add(count(activity.rewardPointsEarned) > 0, rewards.firstPoints);
    add(count(activity.rewardPointsEarned) >= 500, rewards.points500);
    add(count(activity.rewardPointsEarned) >= 1000, rewards.points1000);
    add(count(activity.rewardsRedeemed) > 0, rewards.redeemed);
    add(count(activity.loyaltyMilestones) > 0, rewards.milestone);
    add(count(activity.rareRewards) > 0, rewards.rareReward);
    add(bool(activity.highestRewardsTier), rewards.highestTier);

    const learning = TITLE_CATALOGUE.learning;
    add(count(activity.resourcesRead) > 0, learning.resourcesRead);
    add(count(activity.guidesCompleted) > 0, learning.guideCompleted);
    add(bool(activity.sensoryPreferencesExplored), learning.preferencesExplored);
    add(count(activity.verifiedFactsRead) > 0, learning.verifiedFacts);
    add(count(activity.unusualFactsFound) > 0, learning.unusualFacts);
    add(count(activity.educationalQuizzesCompleted) > 0, learning.quizCompleted);
    add(count(activity.sourcedFactsApproved) > 0, learning.sourcedFact);
    add(bool(activity.factReviewer), learning.factReviewer);

    const community = TITLE_CATALOGUE.community;
    add(bool(activity.communityJoined), community.joined);
    add(bool(activity.communityActive), community.active);
    add(bool(activity.regularDiscussion), community.regularDiscussion);
    add(count(activity.encouragements) > 0, community.encouragement);
    add(bool(activity.approvedGreeter), community.greeter);
    add(count(activity.approvedCommunityContent) > 0, community.approvedContent);
    add(bool(activity.positiveContributor), community.positiveContributor);
    add(bool(activity.longStandingMember), community.longStanding);

    const events = TITLE_CATALOGUE.events;
    add(count(activity.eventsRegistered) > 0, events.registered);
    add(count(activity.eventsAttended) > 0, events.attended);
    add(count(activity.challengesJoined) > 0, events.challengeJoined);
    add(count(activity.eventsCompleted) > 0, events.completed);
    add(count(activity.eventsAttended) >= 3, events.regular);
    add(count(activity.approvedEventsHosted) > 0, events.host);
    add(count(activity.eventVolunteerCount) > 0, events.volunteer);
    add(bool(activity.eventOrganiser), events.organiser);
    add(bool(activity.grandDopamancerAwarded), TITLE_CATALOGUE.sitewide.exceptionalAchievement);
    return titles;
}

export function normaliseIdentity(profile = {}) {
    const sensoryIdentity = sensoryTitles.has(profile.sensoryIdentity) ? profile.sensoryIdentity : null;
    const selectedTitles = [...new Set(Array.isArray(profile.selectedTitles) ? profile.selectedTitles.filter(title => typeof title === 'string') : [])].slice(0, 4);
    return {
        progressionXp: count(profile.progressionXp),
        profileComplete: bool(profile.profileComplete),
        hasActivity: bool(profile.hasActivity),
        sensoryIdentity,
        selectedTitles,
        visibility: {
            rank: bool(profile.visibility?.rank),
            sensoryIdentity: bool(profile.visibility?.sensoryIdentity),
            questTitle: bool(profile.visibility?.questTitle),
            selectedTitles: bool(profile.visibility?.selectedTitles),
            publicRanking: bool(profile.visibility?.publicRanking)
        }
    };
}

export function applyMemberPreferences(current = {}, requested = {}, unlockedTitles = []) {
    const allowedTitles = new Set(unlockedTitles);
    return normaliseIdentity({
        ...current,
        sensoryIdentity: requested.sensoryIdentity,
        selectedTitles: Array.isArray(requested.selectedTitles) ? requested.selectedTitles.filter(title => allowedTitles.has(title)) : current.selectedTitles,
        visibility: requested.visibility || current.visibility
    });
}

export function publicIdentity(profile = {}, questState = {}) {
    const identity = normaliseIdentity(profile);
    const unlockedTitles = deriveAchievementTitles(profile.activity || {});
    return {
        progressionXp: identity.progressionXp,
        rank: identity.visibility.rank ? rankForXp(identity.progressionXp, identity) : null,
        sensoryIdentity: identity.visibility.sensoryIdentity ? identity.sensoryIdentity : null,
        questTitle: identity.visibility.questTitle ? questIdentity(questState).title : null,
        selectedTitles: identity.visibility.selectedTitles ? identity.selectedTitles.filter(title => unlockedTitles.includes(title)) : [],
        publicRanking: identity.visibility.publicRanking
    };
}
