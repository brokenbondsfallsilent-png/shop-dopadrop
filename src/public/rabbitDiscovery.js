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
    const route = currentRoute();
    let buttonId;
    let challenge = null;
    const activate = nextState => {
        if (!nextState?.nextButtonId || nextState.nextPage !== route) {
            buttonId = null;
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
    const refresh = async () => {
        challenge = null;
        if (!(await authentication.loggedIn())) {
            buttonId = null;
            button.label = 'Sign in to begin the hidden hunt';
            button.expand();
            return;
        }
        activate(await getHuntState());
    };
    let inFlight = false;
    button.onClick(async () => {
        if (inFlight) return;
        inFlight = true;
        try {
            if (!(await authentication.loggedIn())) {
                await authentication.promptLogin();
                await refresh();
                return;
            }
            if (!buttonId) {
                await refresh();
                return;
            }
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
            // The find may already be saved even if its reply/refresh failed.
            // Re-read authoritative state before attempting any further challenge.
            buttonId = null;
            button.label = 'Retry loading the hidden hunt';
            button.expand();
            setStatus($w, String(error?.message || error));
        } finally {
            inFlight = false;
        }
    });
    if (typeof authentication.onLogin === 'function') authentication.onLogin(() => {
        if (!inFlight) refresh().catch(() => setStatus($w, 'Reload the page to refresh your saved hunt.'));
    });
    try {
        await refresh();
    } catch (error) {
        buttonId = null;
        button.label = 'Retry loading the hidden hunt';
        button.expand();
        setStatus($w, 'Hunt state unavailable. Your saved progress has not been changed.');
    }
    return { bound: true, buttonId, route };
}
