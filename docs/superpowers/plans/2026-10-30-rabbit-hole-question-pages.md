# Rabbit Hole Question Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the inconsistent Daily, Forest and Cave question controls with one authenticated, accessible B1 Neon Tiles HTML experience and make all three pages reachable by signed-in site members.

**Architecture:** A shared hosted HTML renderer owns presentation and emits an allowlisted `RABBIT_QUESTION_ACTION` message. Each Wix page controller owns authentication and backend calls, then sends allowlisted `RABBIT_QUESTION_RENDER` or `RABBIT_QUESTION_RESULT` messages back. A pure view/protocol module keeps rendering state and message validation testable outside Wix; the backend adds a read-only Forest stage view exposing only the next valid guardian action.

**Tech Stack:** Wix Studio/Velo, Wix HTML Components, JavaScript, HTML/CSS, Node `node:test`, Wix members frontend/backend web methods.

**Spec:** `docs/superpowers/specs/2026-10-30-rabbit-hole-question-pages-design.md`

## Global Constraints

- Work only on the current development branch; do not push to `main` or publish.
- Preserve routes `/rabbit-hole-daily`, `/rabbit-hole-forest` and `/rabbit-hole-cave`.
- All three pages are for signed-in site members; do not grant public access.
- Keep reward issuance disabled, cave locked until 50 discoveries and public reset unavailable.
- Preserve guardian order and milestones: Mothkeeper 20, Rootwhisper 30, Grumblebark 40, Tanglebright 50.
- The iframe receives display-safe data only and may emit only allowlisted action IDs; Wix controllers retain backend authority.
- Desktop/tablet use a two-column Neon Tiles grid; at `max-width: 600px`, choices become one full-width column with four-pixel neon left edges.
- Every control has a minimum 48-pixel target, visible keyboard focus and readable default, pending, correct, incorrect, disabled, completed and error states.
- Keep `src/public/rabbit-question.html` byte-identical to `docs/rabbit-question.html` and `src/public/rabbitQuestionView.js` byte-identical to `docs/rabbitQuestionView.js`.

## Review Focus

- A malformed or unknown iframe action must produce no backend call; Task 3 pins this with protocol and bridge tests.
- Rapid repeated clicks while a request is pending must submit once; Tasks 2 and 3 pin renderer and controller locks.
- Long answer labels at 320-pixel viewport width must wrap without clipping and retain 48-pixel targets; Task 2 pins responsive markup/CSS.
- `DAILY_ATTEMPT_LIMITED:<seconds>` must become safe retry copy without exposing raw backend errors; Task 4 pins error mapping.
- A stale Forest stage/action must be rejected by the authoritative backend and refreshed to the current valid stage; Task 5 pins stage derivation and sequence enforcement.

---

## File Structure

- Create `src/public/rabbitQuestionView.js`: pure UMD view-state and protocol validation helpers usable by browser and Node tests.
- Create `docs/rabbitQuestionView.js`: served mirror of the view module.
- Create `src/public/rabbit-question.html`: shared accessible Neon Tiles renderer and iframe message loop.
- Create `docs/rabbit-question.html`: hosted mirror of the renderer.
- Create `src/public/rabbitQuestionBridge.js`: reusable Wix HTML Component binding, action allowlisting, request lock and safe result/error mapping.
- Create `src/backend/rabbitForestView.js`: pure derivation of the current safe Forest stage from normalized hunt state.
- Modify `src/backend/rabbitHole.web.js`: add authenticated `getForestContent` web method while preserving authoritative `forestEncounter` checks.
- Modify the three Rabbit Hole page controllers: bind `#rabbitQuestionView`, load safe page content and map allowlisted actions to existing backend calls.
- Modify `docs/FRONTEND_PATHWAYS.md`: document all four guardians and the shared question component ownership.
- Add focused Node tests for the renderer/view model, bridge contract, Forest view and three page integrations.

### Task 1: Pure Question View and Protocol Model

**Files:**
- Create: `src/public/rabbitQuestionView.js`
- Create: `docs/rabbitQuestionView.js`
- Test: `tests/rabbit-question-view.test.cjs`

**Interfaces:**
- Consumes: plain question snapshots shaped as `{ mode, eyebrow, progress, question, hint, choices, meta, status }`.
- Produces: `buildQuestionView(snapshot)`, `normaliseRenderMessage(data)`, `normaliseActionMessage(data)` and immutable action IDs suitable for the renderer and Wix bridge.

- [ ] **Step 1: Write failing view-model tests**

Add tests proving: three-choice Daily input remains ordered; missing/malformed fields fail closed; unknown modes and action IDs are rejected; member/reward/internal fields are discarded; completed and locked states disable submission; long choice labels remain strings without HTML interpretation.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/rabbit-question-view.test.cjs`

Expected: FAIL because `rabbitQuestionView.js` does not exist.

- [ ] **Step 3: Implement the minimal pure module**

Implement the four exported helpers with allowlists for modes `daily`, `forest`, `cave` and actions `answer`, `encounter`, `dialogue`. Return only the fields required by the renderer; never copy arbitrary snapshot properties.

- [ ] **Step 4: Mirror the source module and verify GREEN**

Copy the exact finalized source bytes to `docs/rabbitQuestionView.js`, then run `node --test tests/rabbit-question-view.test.cjs`.

Expected: PASS, including byte-parity assertion.

- [ ] **Step 5: Commit**

```bash
git add src/public/rabbitQuestionView.js docs/rabbitQuestionView.js tests/rabbit-question-view.test.cjs
git commit -m "feat: add safe Rabbit question view model"
```

### Task 2: Shared B1 Neon Tiles Renderer

**Files:**
- Create: `src/public/rabbit-question.html`
- Create: `docs/rabbit-question.html`
- Modify: `tests/rabbit-interface-ownership.test.cjs`

**Interfaces:**
- Consumes: `RABBIT_QUESTION_RENDER` and `RABBIT_QUESTION_RESULT` messages accepted by `RabbitQuestionView.normaliseRenderMessage`.
- Produces: `{ type: 'RABBIT_QUESTION_READY' }` and `{ type: 'RABBIT_QUESTION_ACTION', requestId, action, choiceId }` messages to `parent`.

- [ ] **Step 1: Add failing renderer-contract tests**

Assert one complete HTML document; source/served byte parity; one semantic choice group; no `innerHTML` assignment; `event.source !== parent` rejection; 600-pixel single-column breakpoint; two-column desktop grid; odd final tile spanning both columns; four-pixel mobile neon edge; minimum 48-pixel controls; explicit selectors/classes for all eight states; visible `:focus-visible`; pending click lock; and no reward/reset/member secrets.

- [ ] **Step 2: Run the focused ownership test and verify RED**

Run: `node --test tests/rabbit-interface-ownership.test.cjs`

Expected: FAIL because the shared renderer is missing.

- [ ] **Step 3: Implement the renderer**

Use text nodes/`textContent` only. Render choices as real buttons inside a labelled group, preserve input order, generate no backend-derived HTML, lock on first valid action, and unlock only on an explicit nonterminal result. Apply the approved black/cyan/pink/yellow palette and B1 breakpoint contract.

- [ ] **Step 4: Mirror renderer bytes and verify GREEN**

Copy exact bytes to `docs/rabbit-question.html`; run `node --test tests/rabbit-interface-ownership.test.cjs`.

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/public/rabbit-question.html docs/rabbit-question.html tests/rabbit-interface-ownership.test.cjs
git commit -m "feat: add Neon Tiles question renderer"
```

### Task 3: Reusable Wix Question Bridge

**Files:**
- Create: `src/public/rabbitQuestionBridge.js`
- Create: `tests/rabbit-question-bridge.test.cjs`

**Interfaces:**
- Consumes: `bindRabbitQuestionView($w, options)` where options contain `load(): Promise<QuestionSnapshot>`, `submit(action): Promise<Result>`, `mapResult(result, action): QuestionSnapshot`, and `mapError(error): QuestionSnapshot`.
- Produces: one initialized `#rabbitQuestionView` binding with `ready`, `render`, `result` and request-lock behavior.

- [ ] **Step 1: Write failing bridge tests**

Test one load after READY, unknown message/action/payload rejection, one backend call for repeated same-request clicks, stale request result rejection, safe error rendering, and required-element failure with the exact missing ID `#rabbitQuestionView`.

- [ ] **Step 2: Run the bridge test and verify RED**

Run: `node --test tests/rabbit-question-bridge.test.cjs`

Expected: FAIL because the bridge does not exist.

- [ ] **Step 3: Implement the bridge**

Bind only the named HTML Component. Treat Wix's element-scoped `onMessage` as the parent-side source boundary; validate message type, request ID, action and choice ID before invoking `submit`. Set the hosted source URL with a new explicit cache revision but do not publish it.

- [ ] **Step 4: Run bridge tests and verify GREEN**

Run: `node --test tests/rabbit-question-bridge.test.cjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/public/rabbitQuestionBridge.js tests/rabbit-question-bridge.test.cjs
git commit -m "feat: add authenticated question iframe bridge"
```

### Task 4: Daily Question Page

**Files:**
- Modify: `src/pages/Rabbit Hole Daily.i6ju2.js`
- Create: `tests/rabbit-question-pages.test.cjs`

**Interfaces:**
- Consumes: `getDailyContent()`, `solveDailyContent(day, answer)` and `bindRabbitQuestionView`.
- Produces: Daily snapshots with exactly three answer actions and stable `completed`, `incorrect`, `limited`, `unreleased` or `error` state.

- [ ] **Step 1: Write failing Daily-controller tests**

Assert the textarea and opaque submit-button IDs are removed; `#rabbitQuestionView` is bound; all three backend choices become answer tiles; the selected visible value is submitted unchanged; correct completion does not auto-advance; `DAILY_ATTEMPT_LIMITED:75` maps to retry copy containing `75 seconds`; and “No points are awarded here” remains visible.

- [ ] **Step 2: Run the page test and verify RED**

Run: `node --test tests/rabbit-question-pages.test.cjs`

Expected: FAIL against the current textarea controller.

- [ ] **Step 3: Replace the Daily controller flow**

Keep the member login gate. Build the Daily snapshot from `result.entry`, call `solveDailyContent(entry.day, choiceId)`, and map backend outcomes without exposing raw errors or the correct answer.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `node --test tests/rabbit-question-pages.test.cjs tests/rabbit-daily-guard.test.cjs tests/rabbit-content.test.cjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Rabbit\ Hole\ Daily.i6ju2.js tests/rabbit-question-pages.test.cjs
git commit -m "feat: render Daily riddles as Neon Tiles"
```

### Task 5: Forest Stage View and Four Guardians

**Files:**
- Create: `src/backend/rabbitForestView.js`
- Modify: `src/backend/rabbitHole.web.js`
- Modify: `src/pages/Rabbit Hole Forest.l4tqi.js`
- Create: `tests/rabbit-forest-view.test.cjs`
- Modify: `tests/rabbit-question-pages.test.cjs`

**Interfaces:**
- Consumes: normalized state with `foundCount` and `forestState.encounters`, plus canonical `GUARDIAN_MILESTONES` and `FOREST_ENCOUNTERS`.
- Produces: `buildForestStageView(state)` and authenticated `getForestContent()` returning only `{ completed, locked, progress, guardian, prompt, choices }`; each choice contains the one canonical `characterId`/`actionId` pair currently valid.

- [ ] **Step 1: Write failing Forest view tests**

Cover 0/19/20/30/40/50 discoveries, every completed-prefix length, malformed encounter history, all-complete state and the stale-action case. Assert alternate actions such as `mothkeeper:ask` and `rootwhisper:explore` never appear.

- [ ] **Step 2: Run Forest tests and verify RED**

Run: `node --test tests/rabbit-forest-view.test.cjs`

Expected: FAIL because `buildForestStageView` is missing.

- [ ] **Step 3: Implement the pure Forest stage view**

Derive the next stage from the canonical sequence only. Return locked milestone copy when discoveries are insufficient, one safe action when unlocked, and stable completion after Tanglebright.

- [ ] **Step 4: Add failing backend/controller contract tests**

Assert `getForestContent` uses `Permissions.SiteMember`; the Forest controller removes all generated button IDs, binds `#rabbitQuestionView`, loads the safe stage view, submits only its returned character/action pair and refreshes after success or stale-stage failure.

- [ ] **Step 5: Implement the web method and Forest controller**

Load normalized member state, return `buildForestStageView(state)`, retain all existing authoritative checks in `forestEncounter`, and render all four guardians through the shared bridge.

- [ ] **Step 6: Run Forest and progression tests and verify GREEN**

Run: `node --test tests/rabbit-forest-view.test.cjs tests/rabbit-question-pages.test.cjs tests/rabbit-activity-sync.test.cjs tests/rabbit-state.test.cjs`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/backend/rabbitForestView.js src/backend/rabbitHole.web.js src/pages/Rabbit\ Hole\ Forest.l4tqi.js tests/rabbit-forest-view.test.cjs tests/rabbit-question-pages.test.cjs
git commit -m "feat: add four-stage Forest question flow"
```

### Task 6: Cave Dialogue Page

**Files:**
- Modify: `src/pages/Rabbit Hole Cave.zoimi.js`
- Modify: `tests/rabbit-question-pages.test.cjs`
- Modify: `tests/rabbit-interface-ownership.test.cjs`

**Interfaces:**
- Consumes: `enterCave()`, `chooseLootgrem(node, option)` and the shared bridge.
- Produces: safe Cave dialogue snapshots that preserve current node/choices and explicit terminal reward-choice messages.

- [ ] **Step 1: Write failing Cave flow tests**

Assert the three generated button IDs are removed; the response from `enterCave` supplies initial text/choices; each selection submits the current node plus selected option; the next returned dialogue replaces the card; terminal `claim` and `code` responses show safe completion text; `claimReward` is never imported/called; locked Cave renders a noninteractive message.

- [ ] **Step 2: Run Cave tests and verify RED**

Run: `node --test tests/rabbit-question-pages.test.cjs tests/rabbit-interface-ownership.test.cjs`

Expected: FAIL against the hard-coded controller.

- [ ] **Step 3: Implement Cave bridge mapping**

Keep the member and cave gates, track only the current safe node returned by backend state, render provided dialogue choices, and map terminal reward selections without issuing rewards.

- [ ] **Step 4: Run Cave/reward/dialogue tests and verify GREEN**

Run: `node --test tests/rabbit-question-pages.test.cjs tests/rabbit-interface-ownership.test.cjs tests/rabbit-dialogue.test.cjs tests/rabbit-reward.test.cjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Rabbit\ Hole\ Cave.zoimi.js tests/rabbit-question-pages.test.cjs tests/rabbit-interface-ownership.test.cjs
git commit -m "feat: render Cave dialogue with Neon Tiles"
```

### Task 7: Wix Draft Placement, Access and End-to-End Verification

**Files:**
- Modify: `docs/FRONTEND_PATHWAYS.md`
- Modify only if needed by verification: the files owned by Tasks 1–6

**Interfaces:**
- Consumes: the complete local renderer, bridge and three page controllers.
- Produces: saved Wix draft pages with one `#rabbitQuestionView` each, all-signed-in-member access, and an evidence-based blocker/verification report.

- [ ] **Step 1: Update documentation and write the final safeguard assertions**

Document the shared component ownership and all four guardians. Add assertions that rewards remain disabled, reset remains absent, and all source/served asset pairs are byte-identical.

- [ ] **Step 2: Run all local checks**

Run: `npm test`

Expected: all tests PASS.

Run: `npm run lint`

Expected: exit 0 with no errors.

Run: `git diff --check`

Expected: no output.

- [ ] **Step 3: Create the GitHub Pages asset commit on the development branch**

Commit only after source/served parity and all local checks pass. Do not push to `main` and do not publish Wix.

```bash
git add docs/FRONTEND_PATHWAYS.md src docs tests
git commit -m "docs: record shared Rabbit question ownership"
```

- [ ] **Step 4: Place the shared component in the Wix draft**

In Wix Studio, add one HTML Component to Daily, Forest and Cave; assign each the exact ID `#rabbitQuestionView`; use identical centered dimensions/anchors and desktop/mobile breakpoints; save the draft without publishing.

- [ ] **Step 5: Correct page access in the Wix draft**

Set Daily, Forest and Cave to all signed-in site members, not public and not custom-role-only. Save without publishing.

- [ ] **Step 6: Preview authenticated desktop and mobile flows**

Verify authorized access; B1 grid/stack behavior; long-label wrapping; keyboard focus/order; duplicate-submit lock; Daily correct/incorrect/limited/completed states; all four guardian stages including Grumblebark; Cave lock before 50; dialogue progression after 50; no reward issuance; and no reset.

- [ ] **Step 7: Record exact blockers and final branch state**

If Wix Studio prevents a placement, permission or Preview step, record the page, element, visible error and last verified checkpoint. Run `git status --short --branch` and report commits and verification level without claiming production deployment.

## Self-Review Results

- Spec coverage: every visual, responsive, accessibility, authentication, guardian, Cave, reward/reset and no-publish requirement is owned by Tasks 1–7.
- Step scan: every task follows RED → minimal implementation → GREEN → commit, with editor-only work isolated after local proof.
- Type consistency: `QuestionSnapshot`, `RABBIT_QUESTION_*`, `#rabbitQuestionView`, `buildForestStageView` and `getForestContent` names are consistent across producers and consumers.
- Review focus: malformed actions, duplicate clicks, narrow-screen labels, attempt limiting and stale Forest actions each have an owning test task.
- Proportion: implementation bodies are left to the executor; the plan records only interfaces, exact behavior, tests and verification gates.
