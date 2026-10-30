import wixLocationFrontend from 'wix-location-frontend';
import { authentication } from 'wix-members-frontend';
import { beginButtonChallenge, findButton, getHuntState } from 'backend/rabbitHole.web';
import { placementsForRoute } from 'public/rabbitPlacementSlots';

function currentRoute() {
    const path = Array.isArray(wixLocationFrontend.path)
        ? wixLocationFrontend.path.filter(Boolean).join('/')
        : '';
    return path ? `/${path}` : '/';
}

function optionalElement($w, id) {
    try { return $w(id); } catch (_) { return null; }
}

function statusElementId(elementId) {
    return elementId.replace(/^rabbitDiscovery/, 'rabbitDiscoveryStatus');
}

export async function bindRabbitDiscovery($w, options = {}) {
    const route = currentRoute();
    const placements = placementsForRoute(route);
    if (!placements.length) return { bound: false, reason: 'NO_DISCOVERY_PLACEMENTS', route };

    const slots = placements.map(placement => ({
        ...placement,
        button: optionalElement($w, `#${placement.elementId}`),
        status: optionalElement($w, `#${statusElementId(placement.elementId)}`)
    }));
    slots.forEach(slot => slot.button?.collapse());
    const missing = slots.find(slot => !slot.button);
    if (missing) {
        console.warn(`Rabbit discovery editor element is missing: #${missing.elementId}`);
        return {
            bound: false,
            reason: 'EDITOR_ELEMENT_MISSING',
            missingElementId: missing.elementId,
            route
        };
    }

    const challenges = new Map();
    let activeButtonId = null;
    const collapseAll = () => slots.forEach(slot => slot.button.collapse());
    const setStatus = (slot, message) => {
        if (slot.status) slot.status.text = message;
    };
    const activate = nextState => {
        collapseAll();
        activeButtonId = null;
        if (!nextState?.nextButtonId || nextState.nextPage !== route) return null;
        const slot = slots.find(candidate => candidate.buttonId === nextState.nextButtonId);
        if (!slot) return null;
        activeButtonId = slot.buttonId;
        slot.button.label = 'A tiny forest mark';
        if (slot.button.accessibility) {
            slot.button.accessibility.ariaLabel = `Hidden forest discovery ${slot.buttonId}`;
        }
        slot.button.expand();
        return slot;
    };

    slots.forEach(slot => {
        slot.button.onClick(async () => {
            if (activeButtonId !== slot.buttonId || !(await authentication.loggedIn())) return;
            try {
                const challenge = challenges.get(slot.buttonId);
                if (!challenge) {
                    challenges.set(slot.buttonId, await beginButtonChallenge(slot.buttonId, route));
                    setStatus(slot, 'The mark stirred. Touch it once more.');
                    return;
                }
                const result = await findButton(slot.buttonId, route, challenge.token);
                challenges.delete(slot.buttonId);
                setStatus(slot, result.caveUnlocked
                    ? 'All 50 discoveries are complete. Tanglebright is waiting.'
                    : `Discovery ${result.found} of ${result.required} saved.`);
                const nextState = await getHuntState();
                activate(nextState);
                if (typeof options.onFound === 'function') await options.onFound(result, nextState);
            } catch (error) {
                challenges.delete(slot.buttonId);
                setStatus(slot, String(error?.message || error));
            }
        });
    });

    let state;
    try {
        state = await getHuntState();
    } catch (error) {
        collapseAll();
        if (String(error?.message || error).includes('MEMBER_LOGIN_REQUIRED')) {
            return { bound: false, reason: 'MEMBER_LOGIN_REQUIRED', route };
        }
        console.error('Rabbit discovery state failed:', error);
        return { bound: false, reason: 'STATE_UNAVAILABLE', route };
    }

    const activeSlot = activate(state);
    if (!activeSlot) return { bound: false, reason: 'NOT_ASSIGNED_HERE', route };
    return { bound: true, buttonId: activeSlot.buttonId, route };
}
