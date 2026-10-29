import wixLocationFrontend from 'wix-location-frontend';
import { authentication } from 'wix-members-frontend';
import { beginButtonChallenge, findButton, getHuntState } from 'backend/rabbitHole.web';

function currentRoute() {
    const path = Array.isArray(wixLocationFrontend.path)
        ? wixLocationFrontend.path.filter(Boolean).join('/')
        : '';
    return path ? `/${path}` : '/';
}

function optionalElement($w, id) {
    try { return $w(id); } catch (_) { return null; }
}

function setStatus($w, message) {
    const status = optionalElement($w, '#rabbitDiscoveryStatus');
    if (status) status.text = message;
}

export async function bindRabbitDiscovery($w) {
    const button = optionalElement($w, '#rabbitDiscoveryButton');
    if (!button) {
        console.warn('Rabbit discovery editor element is missing on this Wix page.');
        return { bound: false, reason: 'EDITOR_ELEMENT_MISSING' };
    }
    button.collapse();
    let state;
    try {
        state = await getHuntState();
    } catch (error) {
        if (String(error?.message || error).includes('MEMBER_LOGIN_REQUIRED')) {
            button.label = 'Sign in to begin the hidden hunt';
            button.expand();
            button.onClick(() => authentication.promptLogin());
            return { bound: true, signInGate: true };
        }
        console.error('Rabbit discovery state failed:', error);
        return { bound: false, reason: 'STATE_UNAVAILABLE' };
    }
    const route = currentRoute();
    if (!state.nextButtonId || state.nextPage !== route) return { bound: false, reason: 'NOT_ASSIGNED_HERE' };
    const buttonId = state.nextButtonId;
    let challenge = null;
    button.label = 'A tiny forest mark';
    if (button.accessibility) button.accessibility.ariaLabel = `Hidden forest discovery ${buttonId}`;
    button.expand();
    button.onClick(async () => {
        if (!(await authentication.loggedIn())) {
            await authentication.promptLogin();
            return;
        }
        try {
            if (!challenge) {
                challenge = await beginButtonChallenge(buttonId, route);
                setStatus($w, 'The mark stirred. Touch it once more.');
                return;
            }
            const result = await findButton(buttonId, route, challenge.token);
            challenge = null;
            button.collapse();
            setStatus($w, result.caveUnlocked
                ? 'All 50 discoveries are complete. Tanglebright is waiting.'
                : `Discovery ${result.found} of ${result.required} saved.`);
        } catch (error) {
            challenge = null;
            setStatus($w, String(error?.message || error));
        }
    });
    return { bound: true, buttonId, route };
}
