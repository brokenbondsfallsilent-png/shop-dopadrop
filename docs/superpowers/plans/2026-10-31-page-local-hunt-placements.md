# Page-Local Hunt Placements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize all 50 Rabbit Hole discoveries into distinct page-local, in-flow placements that remain above ordinary page layers and work reliably on mobile.

**Architecture:** Keep the authenticated backend sequence authoritative, but replace the single native `#rabbitDiscoveryButton` contract with a public route-to-slot registry and a placement-aware binder. Static pages receive uniquely numbered Wix controls; the shared Category template exposes heading, grid, and footer slots whose logical discovery identity is determined by route. Wix-owned member routes are removed and discoveries 41-44 are redistributed to editable policy/accessibility pages.

**Tech Stack:** Wix Studio, Velo JavaScript, Wix Members frontend, Node.js built-in test runner, ESLint.

**Spec:** `docs/superpowers/specs/2026-10-31-page-local-hunt-placements-design.md`

## Global Constraints

- Preserve ordered IDs 1-50, signup gate at 1, Mothkeeper 20, Rootwhisper 30, Grumblebark 40, and Tanglebright 50.
- Keep reward issuance disabled and expose no public reset.
- Keep `#html3` as homepage/hunt ownership and `#html2` as gem-dashboard ownership.
- Every rendered page with multiple assigned discoveries must use distinct in-flow physical slots.
- Every mobile hit area must be at least 44 by 44 CSS pixels.
- Discovery controls must sit above normal page-canvas layers but below Wix system overlays.
- Do not push, merge to `main`, publish, reset progress, change member data outside normal test discoveries, or issue rewards.

## Review Focus

- A route with two or three discoveries must expand only the authoritative next physical slot and must advance to another distinct slot after success.
- A shared Category-template slot must resolve to the correct logical ID for the current route without leaking another collection's ID.
- Signed-out state must expose the signup/login gate without allowing an unauthenticated discovery.
- Missing or misnamed Wix controls must fail closed and identify the exact element ID rather than silently binding the wrong slot.
- Wix system overlays must remain operable above foregrounded discovery controls.

---

### Task 1: Canonical redistribution and editor identities

**Files:**
- Modify: `src/backend/rabbitContent.js`
- Modify: `tests/rabbit-placements.test.cjs`

**Interfaces:**
- Consumes: existing `place(route, surface, anchor, editorElementId)` registry builder.
- Produces: `HUNT_PLACEMENTS` entries with final routes, anchors, and editor IDs for all 50 discoveries.

- [ ] **Step 1: Write failing registry tests**

Add assertions that discoveries 41-44 no longer use member routes and instead map to the approved Shipping, Refund, Privacy, and Accessibility anchors. Assert that static native discoveries use their numbered element IDs, Category discoveries use only `rabbitDiscoveryHeading`, `rabbitDiscoveryGrid`, or `rabbitDiscoveryFooter`, and no rendered route assigns two logical IDs to the same physical slot.

- [ ] **Step 2: Run the placement test and verify RED**

Run: `node --test tests/rabbit-placements.test.cjs`

Expected: FAIL because IDs 41-44 still target member routes and native entries reuse `rabbitDiscoveryButton`.

- [ ] **Step 3: Update `HUNT_PLACEMENTS`**

Assign explicit editor element IDs. Map Shop All to heading/grid/footer, each collection to heading/grid, static routes to `rabbitDiscoveryNN`, and redistribute:

- 41: `/shipping-policy`, `delivery help footer`, `rabbitDiscovery41`
- 42: `/refund-policy`, `returns help footer`, `rabbitDiscovery42`
- 43: `/privacy-policy`, `data controls footer`, `rabbitDiscovery43`
- 44: `/accessibility-statement`, `assistance footer`, `rabbitDiscovery44`

- [ ] **Step 4: Run the placement test and verify GREEN**

Run: `node --test tests/rabbit-placements.test.cjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/backend/rabbitContent.js tests/rabbit-placements.test.cjs
git commit -m "refactor: redistribute hunt placement registry"
```

---

### Task 2: Public route-to-slot registry

**Files:**
- Create: `src/public/rabbitPlacementSlots.js`
- Create: `tests/rabbit-placement-slots.test.cjs`

**Interfaces:**
- Consumes: canonical placement values from Task 1, duplicated as a member-safe public layout contract.
- Produces: `placementsForRoute(route: string): Array<{ buttonId: number, elementId: string, statusElementId?: string }>`.

- [ ] **Step 1: Write failing public-registry tests**

Test exact route normalization, distinct slot ordering for routes with multiple discoveries, Category-template physical IDs, redistributed IDs 41-44, an empty result for removed member routes, and parity with backend `HUNT_PLACEMENTS` for IDs/routes/editor IDs.

- [ ] **Step 2: Run the slot test and verify RED**

Run: `node --test tests/rabbit-placement-slots.test.cjs`

Expected: FAIL because `rabbitPlacementSlots.js` does not exist.

- [ ] **Step 3: Implement `placementsForRoute(route)`**

Return frozen member-safe descriptors only. Normalize a missing leading slash, reject unknown routes with an empty array, and preserve canonical button order.

- [ ] **Step 4: Run the slot test and verify GREEN**

Run: `node --test tests/rabbit-placement-slots.test.cjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/public/rabbitPlacementSlots.js tests/rabbit-placement-slots.test.cjs
git commit -m "feat: add page-local discovery slot registry"
```

---

### Task 3: Placement-aware authenticated binder

**Files:**
- Modify: `src/public/rabbitDiscovery.js`
- Create: `tests/rabbit-discovery-binding.test.cjs`
- Modify: `tests/rabbit-placements.test.cjs`

**Interfaces:**
- Consumes: `placementsForRoute(route)` and existing `getHuntState`, `beginButtonChallenge`, `findButton` APIs.
- Produces: `bindRabbitDiscovery($w, options = {})` that binds all local slots for the current route and returns `{ bound, buttonId?, route, reason?, missingElementId? }`.

- [ ] **Step 1: Write failing binder tests**

Use real lightweight element doubles to assert that the binder collapses every route slot before state resolution, expands exactly the authoritative next slot, labels/focuses each control safely, advances between distinct same-route slots after completion, keeps other slots collapsed, keeps every native slot collapsed when signed out so discovery 1 remains the only signup gate, and reports the exact missing required ID.

- [ ] **Step 2: Run the binder test and verify RED**

Run: `node --test tests/rabbit-discovery-binding.test.cjs`

Expected: FAIL because the current binder resolves only `#rabbitDiscoveryButton`.

- [ ] **Step 3: Implement multi-slot binding**

Resolve the current route once, obtain all descriptors, safely look up each numbered or template element, attach one handler per slot, and use authoritative state to expand only `nextButtonId`. Keep the two-step challenge and post-success state refresh. Route status output to the matching numbered status element when present.

- [ ] **Step 4: Remove the single-element contract assertion**

Update `rabbit-placements.test.cjs` to require `placementsForRoute` and forbid `#rabbitDiscoveryButton` as the native binding contract.

- [ ] **Step 5: Run binder and placement tests and verify GREEN**

Run: `node --test tests/rabbit-discovery-binding.test.cjs tests/rabbit-placements.test.cjs`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/public/rabbitDiscovery.js tests/rabbit-discovery-binding.test.cjs tests/rabbit-placements.test.cjs
git commit -m "feat: bind distinct page-local hunt controls"
```

---

### Task 4: Remove obsolete member-page bindings

**Files:**
- Modify: `src/pages/Profile.nqcgq.js`
- Modify: `src/pages/My Orders.ofgf2.js`
- Modify: `src/pages/Account Settings.e3juj.js`
- Modify: `src/pages/Notifications.u2bgt.js`
- Modify: `tests/rabbit-placements.test.cjs`

**Interfaces:**
- Consumes: redistributed registry from Task 1.
- Produces: member-page controllers with no hunt binding imports or calls.

- [ ] **Step 1: Write failing controller assertions**

Assert that the four removed member controllers do not import or call `bindRabbitDiscovery`, while every remaining native owning controller still does.

- [ ] **Step 2: Run the placement test and verify RED**

Run: `node --test tests/rabbit-placements.test.cjs`

Expected: FAIL because the member controllers still bind the hunt.

- [ ] **Step 3: Remove only obsolete hunt imports and calls**

Preserve all unrelated member-page headings, styling, and account behavior.

- [ ] **Step 4: Run the placement test and verify GREEN**

Run: `node --test tests/rabbit-placements.test.cjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "src/pages/Profile.nqcgq.js" "src/pages/My Orders.ofgf2.js" "src/pages/Account Settings.e3juj.js" "src/pages/Notifications.u2bgt.js" tests/rabbit-placements.test.cjs
git commit -m "refactor: remove hunt from locked member pages"
```

---

### Task 5: Homepage foreground contract

**Files:**
- Modify: `src/public/shop-dopadrop-home-current.html`
- Modify: `docs/index.html`
- Modify: `tests/rabbit-interface-ownership.test.cjs`

**Interfaces:**
- Consumes: existing four homepage discoveries.
- Produces: four explicitly marked elements using `data-rabbit-id="1"` through `data-rabbit-id="4"`, selected with `[data-rabbit-id]`, each in the intended hero, featured-products, collection-trail, or founder-invitation band.

- [ ] **Step 1: Extend failing homepage tests**

Assert that `data-rabbit-id="1"` through `data-rabbit-id="4"` occur exactly once, their nearest owning sections are respectively the hero, products, collections, and founder/about invitation areas, `installRabbitHunt` selects `[data-rabbit-id]` instead of the first four decorative nodes, every band clips its target away from text, targets have explicit foreground stacking and 44 by 44 mobile hit areas, and decorative descendants cannot intercept pointer events.

- [ ] **Step 2: Run the interface test and verify RED where coverage is missing**

Run: `node --test --test-name-pattern="homepage" tests/rabbit-interface-ownership.test.cjs`

Expected: at least one new assertion FAIL before implementation.

- [ ] **Step 3: Apply the minimum homepage CSS/markup corrections**

Add the four explicit data attributes at the canonical anchors and change installation to bind those exact nodes in numeric order. Keep current authenticated messaging. Do not expose additional homepage discoveries or move targets outside their artwork bands.

- [ ] **Step 4: Copy the final source file byte-for-byte to the served file**

Ensure `src/public/shop-dopadrop-home-current.html` and `docs/index.html` are identical.

- [ ] **Step 5: Run interface tests and verify GREEN**

Run: `node --test tests/rabbit-interface-ownership.test.cjs`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/public/shop-dopadrop-home-current.html docs/index.html tests/rabbit-interface-ownership.test.cjs
git commit -m "fix: isolate homepage hunt placements"
```

---

### Task 6: Placement documentation and editor checklist

**Files:**
- Modify: `docs/HIDDEN_BUTTON_PLACEMENTS.md`
- Modify: `docs/FRONTEND_PATHWAYS.md`
- Modify: `tests/rabbit-placements.test.cjs`

**Interfaces:**
- Consumes: final registries and binder contracts from Tasks 1-5.
- Produces: exact route, anchor, physical editor ID, and verification status for every discovery.

- [ ] **Step 1: Write failing documentation assertions**

Assert the docs no longer describe a shared `#rabbitDiscoveryButton`, list the redistribution of 41-44, name the three Category-template slots, and separate local wiring, editor placement, Preview verification, and production verification.

- [ ] **Step 2: Run the placement test and verify RED**

Run: `node --test tests/rabbit-placements.test.cjs`

Expected: FAIL because current documentation describes the obsolete shared control and member routes.

- [ ] **Step 3: Update both documents**

Include the foreground contract, 44 by 44 mobile requirement, system-overlay exception, and an explicit editor checklist for every static page and Category-template slot.

- [ ] **Step 4: Run the placement test and verify GREEN**

Run: `node --test tests/rabbit-placements.test.cjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/HIDDEN_BUTTON_PLACEMENTS.md docs/FRONTEND_PATHWAYS.md tests/rabbit-placements.test.cjs
git commit -m "docs: define page-local hunt editor contract"
```

---

### Task 7: Wix Studio desktop and mobile placement pass

**Files:**
- External Wix Studio draft only; no repository file unless the editor reports a contract mismatch.
- Update verification-state rows in `docs/HIDDEN_BUTTON_PLACEMENTS.md` only after observed evidence.

**Interfaces:**
- Consumes: exact editor IDs and anchors from Tasks 1-6.
- Produces: in-flow Wix controls matching the local contract.

- [ ] **Step 1: Open the authenticated Wix Studio draft without publishing**

Stop if authentication, permissions, or the editor-control bridge is unavailable.

- [ ] **Step 2: Rebuild the Category-template slots**

Place `#rabbitDiscoveryHeading`, `#rabbitDiscoveryGrid`, and `#rabbitDiscoveryFooter` between normal content blocks. Verify distinct vertical positions on desktop and mobile.

- [ ] **Step 3: Rebuild static-page slots**

Place every numbered control at its documented anchor. Shipping, Refund, Privacy, Accessibility, About, Contact, and Forest must each expose all of their distinct assigned slots simultaneously in the editor structure.

- [ ] **Step 4: Apply the foreground contract**

Bring each discovery control to front within its local container, keep the container in normal flow, remove negative overlap, ensure no ancestor clips the hit area, and leave Wix system overlays above it.

- [ ] **Step 5: Verify desktop and mobile Preview hit testing**

For each slot, tap/click the center, keyboard-focus it, confirm text remains readable, and record whether the slot is editor placed and Preview verified. Do not reset member progress or issue rewards.

- [ ] **Step 6: Commit only observed documentation-state changes**

```bash
git add docs/HIDDEN_BUTTON_PLACEMENTS.md
git commit -m "docs: record page-local Wix placement verification"
```

---

### Task 8: Full local verification and handoff

**Files:**
- No planned production changes.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: evidence-backed branch ready for separate review and deployment authorization.

- [ ] **Step 1: Run the full suite**

Run: `npm.cmd test`

Expected: all tests pass with zero failures.

- [ ] **Step 2: Run lint and whitespace checks**

Run: `npm.cmd run lint`

Run: `git diff --check`

Expected: both exit successfully.

- [ ] **Step 3: Verify homepage source/served parity**

Compare SHA-256 hashes of `src/public/shop-dopadrop-home-current.html` and `docs/index.html`.

Expected: identical hashes.

- [ ] **Step 4: Audit safety invariants**

Confirm reward issuance remains disabled, no public reset exists, Cave cannot directly claim rewards, member identity stays backend-derived, and guardian thresholds remain 20/30/40/50.

- [ ] **Step 5: Report exact evidence and blockers**

Report branch, commits, tests, editor placements actually observed, mobile/desktop Preview coverage, and any Wix-owned placements that could not be completed. Explicitly state that production remains unchanged until separately authorized.

