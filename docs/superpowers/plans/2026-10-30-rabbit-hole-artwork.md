# Rabbit Hole Artwork Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three responsive Rabbit Hole environments and four guardian portraits to the shared Daily, Forest and Cave question experience.

**Architecture:** Generate project-owned raster assets, mirror them between `src/public` and `docs`, and select them exclusively through allowlisted mode/guardian keys in the safe view model. The shared HTML renderer owns the visual composition while Wix page controllers retain authenticated backend authority.

**Tech Stack:** Built-in image generation, PNG/WebP assets, vanilla HTML/CSS/JavaScript, Wix Velo page controllers, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-30-rabbit-hole-artwork-design.md`

## Global Constraints

- Enchanting and friendly with a darkly unhinged, mischievous undertone; never frightening or hostile.
- No horror, gore, embedded text, logos, watermarks or flashing effects.
- Preserve authentication, discovery order, guardian thresholds, reward-disabled state and protected reset.
- Use allowlisted artwork keys only; backend values must never become arbitrary URLs.
- Keep `src/public` and `docs` assets byte-identical.
- Keep Wix publishing paused for visual approval.

## Review Focus

- Unknown artwork or guardian keys must fall back safely without a broken image.
- Locked/completed/error snapshots must retain readable contrast over every environment.
- Long questions and labels must not collide with portraits at desktop or mobile widths.
- Transparent portraits must keep clean edges against dark and bright backgrounds.
- Reduced-motion users must receive a stable composition without decorative animation.

---

### Task 1: Generate and validate the artwork set

**Files:**
- Create: `src/public/assets/rabbit-hole/daily-environment.png`
- Create: `src/public/assets/rabbit-hole/forest-environment.png`
- Create: `src/public/assets/rabbit-hole/cave-environment.png`
- Create: `src/public/assets/rabbit-hole/mothkeeper.png`
- Create: `src/public/assets/rabbit-hole/rootwhisper.png`
- Create: `src/public/assets/rabbit-hole/grumblebark.png`
- Create: `src/public/assets/rabbit-hole/tanglebright.png`
- Create matching files under `docs/assets/rabbit-hole/`

**Interfaces:**
- Produces: three opaque wide environment images and four transparent portrait images with the exact filenames above.

- [ ] Generate each environment with consistent storybook-game art direction, quiet central card space and edge detail.
- [ ] Generate each guardian as an independently reusable transparent three-quarter portrait with a distinct silhouette.
- [ ] Inspect all seven assets for consistency, transparency, absence of text/watermarks and usable responsive framing.
- [ ] Copy selected final assets into both public trees and verify matching hashes.
- [ ] Commit with `feat: add Rabbit Hole artwork set`.

### Task 2: Add safe artwork keys to the view model

**Files:**
- Modify: `src/public/rabbitQuestionView.js`
- Modify: `docs/rabbitQuestionView.js`
- Test: `tests/rabbit-question-view.test.cjs`

**Interfaces:**
- Consumes: artwork filenames from Task 1.
- Produces: `buildQuestionView(input).artwork` with allowlisted `environment`, optional `guardian`, and guardian alt text.

- [ ] Add failing tests for daily/forest/cave mappings, every guardian, unknown keys and malformed input.
- [ ] Run `node --test tests/rabbit-question-view.test.cjs` and verify the new assertions fail.
- [ ] Implement fixed maps for mode environments and guardian portraits; discard arbitrary URLs and unknown keys.
- [ ] Mirror the module and run the focused test until it passes.
- [ ] Commit with `feat: map safe Rabbit Hole artwork`.

### Task 3: Supply guardian identity from page controllers

**Files:**
- Modify: `src/pages/Rabbit Hole Forest.l4tqi.js`
- Modify: `src/pages/Rabbit Hole Cave.zoimi.js`
- Test: `tests/rabbit-question-pages.test.cjs`

**Interfaces:**
- Consumes: existing authoritative `view.guardian.characterId` and Cave Tanglebright state.
- Produces: safe `guardianKey` values consumed by Task 2.

- [ ] Add failing controller tests asserting Forest exposes only the current guardian key and Cave selects Tanglebright.
- [ ] Run the focused test and verify failure.
- [ ] Add `guardianKey` to Forest and Cave snapshots without changing actions or backend calls.
- [ ] Run the focused test until it passes.
- [ ] Commit with `feat: select active Rabbit guardian artwork`.

### Task 4: Render responsive environments and portraits

**Files:**
- Modify: `src/public/rabbit-question.html`
- Modify: `docs/rabbit-question.html`
- Test: `tests/rabbit-interface-ownership.test.cjs`
- Test: `tests/rabbit-question-view.test.cjs`

**Interfaces:**
- Consumes: normalized `view.artwork` from Task 2.
- Produces: decorative environment layer and optional accessible portrait layer inside the existing question renderer.

- [ ] Add failing tests for fixed local asset roots, no arbitrary `innerHTML`/URL assignment, portrait alt handling, responsive layout and reduced motion.
- [ ] Run the focused tests and verify failure.
- [ ] Add environment, contrast veil and portrait elements around the semantic card.
- [ ] Add responsive desktop/mobile CSS with safe text spacing, `object-fit`/`object-position` and reduced-motion rules.
- [ ] Bind only normalized asset paths and alt text using DOM properties.
- [ ] Mirror the HTML and run focused tests until they pass.
- [ ] Commit with `feat: render Rabbit Hole scene artwork`.

### Task 5: Verify the complete visual system

**Files:**
- Modify if needed: `docs/HIDDEN_BUTTON_PLACEMENTS.md`

**Interfaces:**
- Consumes: completed artwork renderer and Wix question embed.
- Produces: verified, unpublished release candidate.

- [ ] Open the hosted renderer in Daily, each Forest guardian stage and Cave fixtures at desktop and mobile sizes.
- [ ] Inspect locked, ready, pending, correct, completed and error states for contrast and collisions.
- [ ] Verify all source/served assets and modules have matching hashes.
- [ ] Run `npm.cmd test`, `npm.cmd run lint` and `git diff --check`; require zero failures.
- [ ] Request a fresh whole-branch review and resolve Important/Critical findings.
- [ ] Present screenshots and exact verification results for visual approval; do not publish.
