// Pure presentation model. Uses the existing hosted question-view protocol;
// all eligibility and issuance decisions remain on the authenticated backend.
export function caveSnapshot(state = {}, dialogue, status) {
    const base = {
        mode: 'cave', guardianKey: 'tanglebright', eyebrow: 'Rabbit Hole Cave',
        progress: { current: 0, total: 3 }, meta: ['PRIVATE MEMBER PROGRESS', 'REWARDS DISABLED']
    };
    if (!state.caveUnlocked) return {
        ...base, question: 'The cave remains sealed.',
        hint: 'Find all 50 hidden discoveries before entering the cave.', choices: [],
        status: { kind: 'locked', message: 'CAVE LOCKED' }
    };
    if (['awarded', 'code_issued', 'pending', 'reconciliation_required'].includes(state.rewardStatus)) {
        const done = ['awarded', 'code_issued'].includes(state.rewardStatus);
        return {
            ...base, progress: { current: 3, total: 3 },
            question: done ? 'Your treasure has already been recorded.' : 'Your reward needs a status check.',
            hint: done ? 'No second reward will be issued.' : 'Please contact support. Do not repeat the claim.',
            choices: [], status: { kind: done ? 'completed' : 'locked', message: state.rewardStatus }
        };
    }
    if (state.lootgrem?.claimAuthorized && ['loyalty_points', 'checkout_code'].includes(state.rewardChoice)) return {
        ...base, progress: { current: 2, total: 3 },
        question: state.rewardChoice === 'loyalty_points' ? 'Confirm your 500-point choice?' : 'Confirm your checkout reward choice?',
        hint: 'Your choice is saved. Reward issuance is disabled while testing; confirming cannot award points or reveal a checkout code.',
        choices: [
            { id: 'confirm_reward', label: 'Check reward availability (currently disabled)', action: 'dialogue' },
            { id: 'change_reward', label: 'Choose a different reward', action: 'dialogue' },
            { id: 'postpone_reward', label: 'Not now — keep my choice', action: 'dialogue' }
        ],
        status: status || { kind: 'ready', message: 'No reward has been issued.' }
    };
    return {
        ...base, progress: { current: state.lootgrem?.node === 'welcome' ? 0 : 1, total: 3 },
        question: dialogue?.text || 'The campfire waits.', hint: 'Choose a response. Your dialogue is saved.',
        choices: (dialogue?.choices || []).map(choice => ({ id: choice.id, label: choice.text, action: 'dialogue' })),
        status: status || { kind: 'ready', message: 'The fire is listening.' }
    };
}
