import { webMethod, Permissions } from 'wix-web-module';
import { currentMember } from 'wix-members-backend';
import { loadDopaProfile, markDopaProfileComplete, memberProfileView, updateDopaPreferences } from './dopaProfiles';

async function memberId() {
    const member = await currentMember.getMember();
    const id = member?._id || member?.id || member?.member?._id || member?.member?.id;
    if (!id) throw new Error('MEMBER_LOGIN_REQUIRED');
    return id;
}

export const getMyDopaProfile = webMethod(Permissions.SiteMember, async () => {
    const id = await memberId();
    return memberProfileView(await loadDopaProfile(id));
});

export const updateMyDopaPreferences = webMethod(Permissions.SiteMember, async (preferences = {}) => {
    const id = await memberId();
    return memberProfileView(await updateDopaPreferences(id, preferences));
});

export const completeMyDopaProfile = webMethod(Permissions.SiteMember, async () => {
    const id = await memberId();
    return memberProfileView(await markDopaProfileComplete(id));
});
