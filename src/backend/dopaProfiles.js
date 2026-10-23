import wixData from 'wix-data';
import { applyMemberPreferences, deriveAchievementTitles, normaliseIdentity, publicIdentity, questIdentity, rankForXp } from './dopaRoles';

const COLLECTION = 'DopaMemberProfiles';

function fresh(memberId) {
    return {
        _id: memberId,
        memberId,
        progressionXp: 0,
        profileComplete: false,
        hasActivity: false,
        sensoryIdentity: null,
        selectedTitles: [],
        visibility: {},
        activity: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
    };
}

export async function loadDopaProfile(memberId) {
    try {
        const item = await wixData.get(COLLECTION, memberId, { suppressAuth: true });
        return item || fresh(memberId);
    } catch (error) {
        if (error?.code !== 'WD_ITEM_NOT_FOUND' && !String(error?.message || error).toLowerCase().includes('not found')) throw error;
        return fresh(memberId);
    }
}

export async function saveDopaProfile(profile) {
    const next = { ...profile, updatedAt: new Date(), version: Number(profile.version || 0) + 1 };
    return wixData.save(COLLECTION, next, { suppressAuth: true });
}

export async function recordDopaActivity(memberId, activityPatch = {}, options = {}) {
    const profile = await loadDopaProfile(memberId);
    profile.activity = { ...(profile.activity || {}), ...activityPatch };
    profile.hasActivity = profile.hasActivity || Object.keys(activityPatch).length > 0;
    profile.progressionXp = Math.max(0, Number(profile.progressionXp || 0) + Math.max(0, Number(options.xpDelta || 0)));
    return saveDopaProfile(profile);
}

export async function updateDopaPreferences(memberId, requested = {}) {
    const profile = await loadDopaProfile(memberId);
    const unlocked = deriveAchievementTitles(profile.activity || {});
    const preferences = applyMemberPreferences(profile, requested, unlocked);
    return saveDopaProfile({ ...profile, ...preferences });
}

export async function markDopaProfileComplete(memberId) {
    const profile = await loadDopaProfile(memberId);
    profile.profileComplete = true;
    return saveDopaProfile(profile);
}

export function memberProfileView(profile, questState = {}) {
    const identity = normaliseIdentity(profile);
    const unlockedTitles = deriveAchievementTitles(profile.activity || {});
    const effectiveQuestState = Object.keys(questState).length
        ? questState
        : { foundCount: Number(profile.activity?.hiddenButtonsFound || 0) };
    return {
        rank: rankForXp(identity.progressionXp, identity),
        progressionXp: identity.progressionXp,
        sensoryIdentity: identity.sensoryIdentity,
        selectedTitles: identity.selectedTitles.filter(title => unlockedTitles.includes(title)),
        unlockedTitles,
        quest: questIdentity(effectiveQuestState),
        visibility: identity.visibility,
        publicProfile: publicIdentity(profile, effectiveQuestState)
    };
}
