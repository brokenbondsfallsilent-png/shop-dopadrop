(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.RabbitQuestionView = api;
}(typeof window !== 'undefined' ? window : this, function () {
    const MODES = Object.freeze(['daily', 'forest', 'cave']);
    const ACTION_IDS = Object.freeze(['answer', 'encounter', 'dialogue']);
    const STATUS_KINDS = Object.freeze([
        'ready', 'pending', 'correct', 'incorrect', 'locked', 'completed', 'error', 'limited'
    ]);
    const IDENTIFIER = /^[a-z0-9][a-z0-9_-]{0,63}$/i;
    const ENVIRONMENTS = Object.freeze({
        daily: 'assets/rabbit-hole/daily-environment-v2.png',
        forest: 'assets/rabbit-hole/forest-night-v3.png',
        cave: 'assets/rabbit-hole/cave-environment-v4.png'
    });
    const DAY_ENVIRONMENTS = Object.freeze({
        forest: 'assets/rabbit-hole/forest-day-v3.png'
    });
    const GUARDIANS = Object.freeze({
        mothkeeper: ['assets/rabbit-hole/mothkeeper-v4.png', 'Mothkeeper, guardian of the Rabbit Hole'],
        rootwhisper: ['assets/rabbit-hole/rootwhisper-v7.png', 'Rootwhisper, guardian of the Rabbit Hole'],
        grumblebark: ['assets/rabbit-hole/grumblebark-v2.png', 'Grumblebark, guardian of the Rabbit Hole'],
        tanglebright: ['assets/rabbit-hole/tanglebright-v2.png', 'Tanglebright, guardian of the Rabbit Hole']
    });

    function cleanText(value, maximum = 500) {
        return typeof value === 'string' ? value.trim().slice(0, maximum) : '';
    }

    function invalidView() {
        return { valid: false, disabled: true, choices: [] };
    }

    function buildQuestionView(snapshot) {
        if (!snapshot || typeof snapshot !== 'object' || !MODES.includes(snapshot.mode)) return invalidView();
        const question = cleanText(snapshot.question, 1000);
        const statusKind = STATUS_KINDS.includes(snapshot.status?.kind) ? snapshot.status.kind : 'ready';
        const choicesMissing = !Array.isArray(snapshot.choices) || snapshot.choices.length === 0;
        if (!question || (choicesMissing && !['locked', 'completed'].includes(statusKind))) return invalidView();

        const choices = (snapshot.choices || []).map(choice => {
            const id = cleanText(choice?.id, 64);
            const label = cleanText(choice?.label, 500);
            const action = cleanText(choice?.action, 32);
            if (!IDENTIFIER.test(id) || !label || !ACTION_IDS.includes(action)) return null;
            return { id, label, action, disabled: false };
        });
        if (choices.some(choice => !choice)) return invalidView();

        const disabled = ['pending', 'locked', 'completed'].includes(statusKind);
        const current = Math.max(0, Math.floor(Number(snapshot.progress?.current) || 0));
        const total = Math.max(1, Math.floor(Number(snapshot.progress?.total) || 1));
        const meta = Array.isArray(snapshot.meta)
            ? snapshot.meta.map(value => cleanText(value, 100)).filter(Boolean).slice(0, 2)
            : [];
        const guardian = GUARDIANS[cleanText(snapshot.guardianKey, 64).toLowerCase()] || null;

        return {
            valid: true,
            mode: snapshot.mode,
            eyebrow: cleanText(snapshot.eyebrow, 160),
            progress: { current, total, percent: Math.min(100, Math.round((current / total) * 100)) },
            question,
            hint: cleanText(snapshot.hint, 500),
            choices: choices.map(choice => ({ ...choice, disabled })),
            meta,
            status: { kind: statusKind, message: cleanText(snapshot.status?.message, 500) },
            artwork: {
                environment: ENVIRONMENTS[snapshot.mode],
                environmentDay: DAY_ENVIRONMENTS[snapshot.mode] || ENVIRONMENTS[snapshot.mode],
                environmentNight: ENVIRONMENTS[snapshot.mode],
                guardian: guardian ? guardian[0] : null,
                guardianAlt: guardian ? guardian[1] : ''
            },
            disabled
        };
    }

    function normaliseRenderMessage(data) {
        if (!data || data.type !== 'RABBIT_QUESTION_RENDER' || !IDENTIFIER.test(String(data.requestId || ''))) return null;
        const payload = buildQuestionView(data.payload);
        if (!payload.valid) return null;
        return { type: 'RABBIT_QUESTION_RENDER', requestId: String(data.requestId), payload };
    }

    function normaliseActionMessage(data) {
        if (!data || data.type !== 'RABBIT_QUESTION_ACTION') return null;
        const requestId = String(data.requestId || '');
        const action = cleanText(data.action, 32);
        const choiceId = cleanText(data.choiceId, 64);
        if (!IDENTIFIER.test(requestId) || !ACTION_IDS.includes(action) || !IDENTIFIER.test(choiceId)) return null;
        return { type: 'RABBIT_QUESTION_ACTION', requestId, action, choiceId };
    }

    return { ACTION_IDS, buildQuestionView, normaliseRenderMessage, normaliseActionMessage };
}));

