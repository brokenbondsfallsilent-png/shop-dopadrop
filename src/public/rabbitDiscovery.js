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

export async function bindRabbitDiscovery($w, options = {}) {
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
    let buttonId;
    let challenge = null;
    const activate = nextState => {
        if (!nextState?.nextButtonId || nextState.nextPage !== route) {
            button.collapse();
            return false;
        }
        buttonId = nextState.nextButtonId;
        challenge = null;
        button.label = 'A tiny forest mark';
        if (button.accessibility) button.accessibility.ariaLabel = `Hidden forest discovery ${buttonId}`;
        button.expand();
        return true;
    };
    if (!activate(state)) return { bound: false, reason: 'NOT_ASSIGNED_HERE' };
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
            setStatus($w, result.caveUnlocked
                ? 'All 50 discoveries are complete. Tanglebright is waiting.'
                : `Discovery ${result.found} of ${result.required} saved.`);
            const nextState = await getHuntState();
            if (typeof options.onFound === 'function') await options.onFound(result, nextState);
            if (nextState.nextPage === route) activate(nextState);
            else button.collapse();
        } catch (error) {
            challenge = null;
            setStatus($w, String(error?.message || error));
        }
    });
    return { bound: true, buttonId, route };
}
