import wixLocationFrontend from 'wix-location-frontend';
import { authentication } from 'wix-members-frontend';
import { beginButtonChallenge, findButton, getHuntState } from 'backend/rabbitHole.web';
import { elementIdsForRoute, placementsForRoute } from 'public/rabbitPlacementSlots';

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
    const physicalButtons = new Map(elementIdsForRoute(route).map(elementId => [
        elementId, optionalElement($w, `#${elementId}`)
    ]));
    physicalButtons.forEach(button => button?.collapse());
    if (!placements.length) return { bound: false, reason: 'NO_DISCOVERY_PLACEMENTS', route };

    const slots = placements.map(placement => ({
        ...placement,
        button: physicalButtons.get(placement.elementId),
        status: optionalElement($w, `#${statusElementId(placement.elementId)}`)
    }));
    const challenges = new Map();
    let activeButtonId = null;
    let inFlight = false;
    const collapseAll = () => slots.forEach(slot => slot.button?.collapse());
    const setStatus = (slot, message) => {
        if (slot.status) slot.status.text = message;
    };
    const setLabel = (slot, label) => {
        if (slot && typeof slot.button.label === 'string') slot.button.label = label;
    };
    const expose = (slot, label, ariaLabel) => {
        collapseAll();
        setLabel(slot, label);
        if (slot?.button.accessibility && ariaLabel) slot.button.accessibility.ariaLabel = ariaLabel;
        slot?.button.expand();
        return slot;
    };
    const activate = nextState => {
        collapseAll();
        activeButtonId = null;
        if (!nextState?.nextButtonId || nextState.nextPage !== route) return null;
        const slot = slots.find(candidate => candidate.buttonId === nextState.nextButtonId);
        if (!slot?.button) {
            if (slot) console.warn(`Rabbit discovery editor element is missing: #${slot.elementId}`);
            return null;
        }
        activeButtonId = slot.buttonId;
        challenges.clear();
        return expose(slot, 'A tiny forest mark', `Hidden forest discovery ${slot.buttonId}`);
    };

    const availableSlots = slots.filter(slot => slot.button);
    if (!availableSlots.length) {
        return { bound: false, reason: 'EDITOR_ELEMENT_MISSING', missingElementId: slots[0]?.elementId, route };
    }
    const signInSlot = () => expose(availableSlots[0], 'Sign in to begin the hidden hunt', 'Sign in to begin the hidden hunt');
    const retrySlot = (preferred, message) => {
        activeButtonId = null;
        challenges.clear();
        const slot = preferred?.button ? preferred : availableSlots[0];
        expose(slot, 'Retry loading the hidden hunt', 'Retry loading the hidden hunt');
        setStatus(slot, message);
        return slot;
    };
    const refresh = async () => {
        challenges.clear();
        if (!(await authentication.loggedIn())) {
            activeButtonId = null;
            return signInSlot();
        }
        const state = await getHuntState();
        const requiredSlot = state?.nextPage === route
            ? slots.find(slot => slot.buttonId === state.nextButtonId)
            : null;
        if (requiredSlot && !requiredSlot.button) {
            collapseAll();
            return { error: 'EDITOR_ELEMENT_MISSING', missingElementId: requiredSlot.elementId };
        }
        return activate(state);
    };

    availableSlots.forEach(slot => {
        slot.button.onClick(async () => {
            if (inFlight) return;
            inFlight = true;
            try {
                if (!(await authentication.loggedIn())) {
                    await authentication.promptLogin();
                    await refresh();
                    return;
                }
                if (activeButtonId !== slot.buttonId) {
                    await refresh();
                    return;
                }
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
                retrySlot(slot, String(error?.message || error));
            } finally {
                inFlight = false;
            }
        });
    });

    if (typeof authentication.onLogin === 'function') authentication.onLogin(() => {
        if (!inFlight) refresh().catch(error => retrySlot(null, String(error?.message || error)));
    });

    try {
        const activeSlot = await refresh();
        if (activeSlot?.error) {
            return {
                bound: false,
                reason: activeSlot.error,
                missingElementId: activeSlot.missingElementId,
                route
            };
        }
        return { bound: true, buttonId: activeButtonId, route };
    } catch (error) {
        retrySlot(null, 'Hunt state unavailable. Your saved progress has not been changed.');
        return { bound: true, buttonId: null, route };
    }
}
