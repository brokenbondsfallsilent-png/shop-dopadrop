function activityFact(value) {
    if (typeof value === 'string') return value.trim() ? value : undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
    return undefined;
}

function mergeList(existing, incoming) {
    const values = [...(Array.isArray(existing) ? existing : []), ...incoming]
        .map(activityFact)
        .filter(value => value !== undefined);
    return [...new Set(values)];
}

export function mergeTrustedActivity(existing = {}, patch = {}) {
    const merged = { ...existing };
    for (const [key, incoming] of Object.entries(patch || {})) {
        if (Array.isArray(incoming)) {
            merged[key] = mergeList(merged[key], incoming);
        } else if (typeof incoming === 'boolean') {
            merged[key] = Boolean(merged[key]) || incoming;
        } else if (typeof incoming === 'number' && Number.isFinite(incoming) && incoming >= 0) {
            const current = typeof merged[key] === 'number' && Number.isFinite(merged[key]) && merged[key] >= 0
                ? merged[key]
                : 0;
            merged[key] = Math.max(current, incoming);
        } else if (typeof incoming === 'string' && incoming.trim()) {
            merged[key] = incoming;
        }
    }
    return merged;
}

export function applyTrustedActivityEvent(profile = {}, activityPatch = {}, options = {}) {
    const xpDelta = Math.max(0, Number(options.xpDelta || 0));
    const eventId = typeof options.eventId === 'string' ? options.eventId.trim() : '';
    if (xpDelta > 0 && !eventId) throw new Error('ACTIVITY_EVENT_ID_REQUIRED');
    if (eventId.length > 200) throw new Error('ACTIVITY_EVENT_ID_INVALID');

    const processed = Array.isArray(profile.processedActivityEventIds)
        ? profile.processedActivityEventIds.filter(id => typeof id === 'string')
        : [];
    const duplicate = Boolean(eventId && processed.includes(eventId));
    const nextProcessed = eventId && !duplicate ? [...processed, eventId].slice(-250) : processed;
    return {
        duplicate,
        profile: {
            ...profile,
            activity: mergeTrustedActivity(profile.activity, activityPatch),
            hasActivity: Boolean(profile.hasActivity) || Object.keys(activityPatch || {}).length > 0,
            progressionXp: Math.max(0, Number(profile.progressionXp || 0) + (duplicate ? 0 : xpDelta)),
            processedActivityEventIds: nextProcessed
        }
    };
}
