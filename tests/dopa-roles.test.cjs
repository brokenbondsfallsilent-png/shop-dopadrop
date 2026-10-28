const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

async function loadRoles() {
    const source = fs.readFileSync(path.resolve(__dirname, '../src/backend/dopaRoles.js'), 'utf8');
    return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}

test('membership XP resolves all permanent DopaSquad ranks without spending points', async () => {
    const { rankForXp } = await loadRoles();
    const cases = [
        [0, 1, 'Freshly Dropped'], [99, 3, 'Stimling'], [100, 4, 'Fidget Fiend'],
        [250, 5, 'DopaGoblin'], [500, 6, 'Chaos Collector'], [1000, 7, 'Sensory Sorcerer'],
        [2000, 8, 'DopaDynamo'], [4000, 9, 'NeuroNinja'], [7500, 10, 'DopaLegend'],
        [12000, 11, 'Chaos Overlord'], [20000, 12, 'The Dopamine Deity']
    ];
    for (const [xp, level, title] of cases) assert.deepEqual(rankForXp(xp, { profileComplete: xp > 0, hasActivity: xp > 0 }), { level, title });
});

test('profile completion and first activity unlock the pre-XP ranks in order', async () => {
    const { rankForXp } = await loadRoles();
    assert.deepEqual(rankForXp(0), { level: 1, title: 'Freshly Dropped' });
    assert.deepEqual(rankForXp(0, { profileComplete: true }), { level: 2, title: 'DopaSprout' });
    assert.deepEqual(rankForXp(0, { profileComplete: true, hasActivity: true }), { level: 3, title: 'Stimling' });
});

test('sensory identities are member-selected from the twelve approved titles', async () => {
    const { normaliseIdentity, SENSORY_IDENTITIES } = await loadRoles();
    assert.equal(Object.keys(SENSORY_IDENTITIES).length, 12);
    assert.equal(normaliseIdentity({ sensoryIdentity: 'Texture Hunter' }).sensoryIdentity, 'Texture Hunter');
    assert.equal(normaliseIdentity({ sensoryIdentity: 'DopaHQ Operator' }).sensoryIdentity, null);
});

test('quest titles and achievements derive from authenticated hunt progress', async () => {
    const { questIdentity } = await loadRoles();
    assert.equal(questIdentity({ foundCount: 0 }).title, 'Clueless Wanderer');
    assert.equal(questIdentity({ foundCount: 1 }).title, 'Button Sniffer');
    assert.equal(questIdentity({ foundCount: 8 }).title, 'Pixel Prowler');
    assert.equal(questIdentity({ foundCount: 50, caveEntered: true }).title, 'The Grand Gremlin');
});

test('activity titles remain private by default and staff titles never become permissions', async () => {
    const { publicIdentity } = await loadRoles();
    const hidden = publicIdentity({ progressionXp: 250, sensoryIdentity: 'Texture Hunter' }, { foundCount: 8 });
    assert.equal(hidden.rank, null);
    assert.equal(hidden.sensoryIdentity, null);
    assert.equal(hidden.questTitle, null);
    assert.equal(hidden.staffPermission, undefined);

    const visible = publicIdentity({
        progressionXp: 250,
        sensoryIdentity: 'Texture Hunter',
        visibility: { rank: true, sensoryIdentity: true, questTitle: true }
    }, { foundCount: 8 });
    assert.equal(visible.rank.title, 'DopaGoblin');
    assert.equal(visible.sensoryIdentity, 'Texture Hunter');
    assert.equal(visible.questTitle, 'Pixel Prowler');
    assert.equal(visible.staffPermission, undefined);
});

test('XP and redeemable Dopamine Points are never combined', async () => {
    const { publicIdentity } = await loadRoles();
    const identity = publicIdentity({ progressionXp: 500, dopaminePoints: 900, visibility: { rank: true } }, { foundCount: 0 });
    assert.equal(identity.progressionXp, 500);
    assert.equal(identity.dopaminePoints, undefined);
    assert.equal(identity.rank.title, 'Chaos Collector');
});

test('the store-wide catalogue covers shopping, rewards, learning, community, events, support and staff', async () => {
    const { TITLE_CATALOGUE, STAFF_ROLES } = await loadRoles();
    assert.equal(TITLE_CATALOGUE.shopping.firstPurchase, 'Loot Goblin');
    assert.equal(TITLE_CATALOGUE.rewards.firstPoints, 'DopaDepositor');
    assert.equal(TITLE_CATALOGUE.learning.verifiedFacts, 'Fact Goblin');
    assert.equal(TITLE_CATALOGUE.community.positiveContributor, 'DopaChampion');
    assert.equal(TITLE_CATALOGUE.events.attended, 'DopaParticipant');
    assert.equal(TITLE_CATALOGUE.support.returns, 'Rescue Gremlin');
    assert.equal(TITLE_CATALOGUE.sitewide.exceptionalAchievement, 'The Grand Dopamancer');
    assert.equal(STAFF_ROLES.storeAdministrator, 'DopaHQ Operator');
    assert.equal(STAFF_ROLES.founder, 'The Grand Alchemist');
});

test('store-wide titles derive from trusted activity facts without exposing them publicly by default', async () => {
    const { deriveAchievementTitles } = await loadRoles();
    const titles = deriveAchievementTitles({
        storeBrowsed: true,
        firstPurchase: true,
        savedProducts: 2,
        rewardsAccount: true,
        rewardPointsEarned: 600,
        resourcesRead: 1,
        eventsAttended: 1
    });
    assert.ok(titles.includes('DopaExplorer'));
    assert.ok(titles.includes('Loot Goblin'));
    assert.ok(titles.includes('Wishlist Wizard'));
    assert.ok(titles.includes('Dopamine Stasher'));
    assert.ok(titles.includes('Curiosity Critter'));
    assert.ok(titles.includes('DopaParticipant'));
});

test('member preference updates cannot assign staff or moderation permissions', async () => {
    const { applyMemberPreferences } = await loadRoles();
    const profile = applyMemberPreferences({}, {
        sensoryIdentity: 'Glow Goblin',
        selectedTitles: ['Fact Goblin', 'DopaHQ Operator', 'Community Guardian'],
        visibility: { rank: true, selectedTitles: true },
        staffRole: 'founder',
        communityRole: 'moderator'
    }, ['Fact Goblin']);
    assert.equal(profile.sensoryIdentity, 'Glow Goblin');
    assert.deepEqual(profile.selectedTitles, ['Fact Goblin']);
    assert.equal(profile.staffRole, undefined);
    assert.equal(profile.communityRole, undefined);
});

test('quest achievements join the same store-wide title collection', async () => {
    const { deriveAchievementTitles } = await loadRoles();
    const titles = deriveAchievementTitles({ hiddenButtonsFound: 50, riddlesSolved: 1, secretPagesFound: 1, questCompleted: true });
    assert.ok(titles.includes('Button Sniffer'));
    assert.ok(titles.includes('Riddle Rat'));
    assert.ok(titles.includes('Secret Snatcher'));
    assert.ok(titles.includes('The Grand Gremlin'));
});

test('the DopaHQ member API exposes preferences but no client activity or permission assignment method', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '../src/backend/dopaProfiles.web.js'), 'utf8');
    assert.match(source, /getMyDopaProfile/);
    assert.match(source, /updateMyDopaPreferences/);
    assert.match(source, /completeMyDopaProfile/);
    assert.doesNotMatch(source, /export const (recordActivity|assignStaffRole|setProgressionXp)/);
    assert.doesNotMatch(source, /Permissions\.Anyone/);
});

test('Dopa member profiles stay private and are written only through trusted backend code', () => {
    const schema = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/backend/DopaMemberProfiles.schema.json'), 'utf8'));
    assert.deepEqual(schema.permissions, {
        read: 'siteOwner',
        insert: 'siteOwner',
        update: 'siteOwner',
        remove: 'siteOwner'
    });

    const backend = fs.readFileSync(path.resolve(__dirname, '../src/backend/dopaProfiles.js'), 'utf8');
    assert.match(backend, /wixData\.get\(COLLECTION, memberId, \{ suppressAuth: true \}\)/);
    assert.match(backend, /wixData\.save\(COLLECTION, next, \{ suppressAuth: true \}\)/);
});
