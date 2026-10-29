# Rabbit Hole Artwork Design

Date: 2026-10-30 (Australia/Sydney)

## Intent

Give Rabbit Hole Daily, Forest and Cave the missing visual identity. The experience should feel enchanting and friendly at first glance, with a darkly unhinged neurospicy undertone: mischievous, surprising and strange, never frightening or hostile.

## Goals

- Create three responsive environment artworks: Daily, Forest and Cave.
- Create transparent portraits for Mothkeeper, Rootwhisper, Grumblebark and Tanglebright.
- Layer portraits independently over the correct environment inside the shared Rabbit question renderer.
- Preserve readable question text, accessible controls, mobile cropping and reduced-motion support.
- Keep authentication, discovery sequencing, guardian thresholds, reward issuance and reset protection unchanged.

## Non-goals

- Do not redesign the Shop-DopaDrop logo or general storefront.
- Do not change guardian order, dialogue authority or hunt progression.
- Do not add horror, gore, threatening imagery or flashing effects.
- Do not publish until the completed visual result has been inspected and approved.

## Art direction

- Painterly illustrated storybook fantasy with polished game-concept-art finish.
- Bioluminescent cyan, acid green, hot pink and warm golden accents against deep indigo and near-black environments.
- Charming silhouettes and expressive faces with crooked, slightly impossible details.
- No embedded text, logos or watermarks.
- Environments reserve quiet central space for the question card and useful edge detail for wide displays.
- Guardian portraits are waist-up or three-quarter transparent cutouts with clear silhouettes at small sizes.

## Approaches considered

1. Full storybook scene per guardian: highest atmosphere, but duplicates environments and crops poorly across breakpoints.
2. Reusable environments plus transparent guardian portraits: selected. It gives each page a distinct world while allowing Forest to swap guardians safely and responsively.
3. Neon tarot-card emblems: highly legible but too menu-like and less immersive.

## Integration

- Store final web assets under `docs/assets/rabbit-hole/` and mirror them under `src/public/assets/rabbit-hole/`.
- Extend the safe question view model with allowlisted artwork keys only; backend data must never supply arbitrary image URLs.
- Map `daily`, `forest` and `cave` modes to their environment artwork.
- Map Forest guardian identifiers to their portraits; Cave uses Tanglebright.
- Render artwork as decorative layers around the existing accessible semantic card. Portraits receive useful alt text only when they communicate the active guardian; decorative scenery remains hidden from assistive technology.
- Use responsive `object-fit`/`object-position`, CSS contrast overlays and a single-column mobile composition.
- Disable nonessential artwork motion under `prefers-reduced-motion`.

## Verification

- Inspect every generated asset for subject, palette, transparency, absence of text and consistency.
- Test all three modes and all four guardians in the shared renderer.
- Test desktop and mobile layouts, long labels, locked/completed/error states and reduced motion.
- Preserve source/served asset parity.
- Run the full automated suite, lint and `git diff --check`.
- Keep Wix publishing paused for a visual approval checkpoint.
