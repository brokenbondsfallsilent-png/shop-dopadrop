// Customer-facing identities for the existing Wix catalogue. Slugs and
// collection names stay unchanged so links, SEO and product assignments remain stable.
export const COLLECTION_NAMING = Object.freeze({
    'desk-workspace-fidgets': { title: 'The Desk Goblins', subtitle: 'Desk Fidgets & Workspace Toys' },
    'hand-fidgets-spinners': { title: 'The Fidget Frenzy', subtitle: 'Hand Fidgets & Spinners' },
    'sensory-rings-chains-wearables': { title: 'The Wearable Wiggles', subtitle: 'Sensory Jewellery & Wearables' },
    'chew-oral-sensory': { title: 'The Chomp Shop', subtitle: 'Chewable & Oral Sensory Tools' },
    'tactile-textured-sensory': { title: 'The Texture Trove', subtitle: 'Tactile & Textured Sensory Toys' },
    'weighted-deep-pressure': { title: 'The Gravity Zone', subtitle: 'Weighted & Deep Pressure Sensory' },
    'visual-light-stimulation': { title: 'The Glow Hole', subtitle: 'Visual & Light Sensory Tools' },
    'auditory-rhythm-tools': { title: 'The Sound Lab', subtitle: 'Auditory & Rhythm Sensory' },
    'focus-calm-tools': { title: 'The Brain Break Room', subtitle: 'Focus & Calm Tools' },
    'stim-toys-squishies': { title: 'The Squish Pit', subtitle: 'Stim Toys & Squishies' },
    'sensory-kits-bundles': { title: 'The Dopamine Bundles', subtitle: 'Sensory Kits & Bundles' },
    'movement-balance': { title: 'The Wiggle Workshop', subtitle: 'Movement & Balance Tools' },
    'best-sellers': { title: 'The Crowd Pleasers', subtitle: 'Best-Selling Sensory Finds' }
});

export function getCollectionNaming(path = []) {
    const parts = Array.isArray(path) ? path : [];
    const categoryIndex = parts.indexOf('category');
    return categoryIndex >= 0 ? COLLECTION_NAMING[parts[categoryIndex + 1]] : undefined;
}
