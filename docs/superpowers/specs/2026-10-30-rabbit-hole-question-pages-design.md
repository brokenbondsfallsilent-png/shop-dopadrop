# Rabbit Hole Question Pages — Neon Tiles Design

Date: 2026-10-30 (Australia/Sydney)

## Intent

Make the three Rabbit Hole question surfaces—Daily, Forest guardian encounters, and Cave dialogue—feel like one coherent Shop-DopaDrop game. The experience must remain readable, keyboard-accessible, touch-friendly and faithful to the black/neon site language on desktop and mobile.

## Current-state findings

- The live `/rabbit-hole-daily` route currently redirects a signed-in member to Wix's **Access Restricted** page, so access configuration must be corrected before layout work can be verified live.
- Daily currently uses a textarea and one generated Wix button ID. Forest and Cave bind unrelated generated button IDs. There is no shared question-layout contract or consistent set of interactive states.
- Daily content already supplies exactly three visible choices. Forest and Cave supply dialogue choices through authenticated backend methods.
- Reward issuance must remain disabled. Question-page work must not add a public reset, expose answers, grant points, or bypass member authentication.

## Goals

- Use one shared visual system across Daily, Forest and Cave.
- Present answer choices as neon tiles on desktop.
- Adapt those tiles to a full-width neon-edged vertical stack on narrow phones.
- Give every answer control a minimum 48-pixel touch target and deterministic keyboard order.
- Show clear hover, focus, selected, loading, correct, incorrect, disabled and completed states.
- Preserve the existing authenticated backend calls and guardian/cave gates.
- Correct the question-page access configuration so an authorized signed-in member can reach the pages.

## Non-goals and anti-goals

- Do not publish as part of implementation; publishing requires a separate explicit instruction.
- Do not enable reward issuance, loyalty points, public progress resets or unauthenticated question access.
- Do not change riddle answers, dialogue content, encounter order, route slugs or member data.
- Do not hard-code a guessed Wix element ID or silently ignore missing required controls.
- Do not create a desktop-only layout that wraps unpredictably on phones.

## Chosen approach

The selected direction is **B1 — Adaptive Neon Tiles**.

- Desktop and tablet: choices appear in a two-column tile grid. If the number of choices is odd, the final tile spans the full row.
- Narrow phones: choices become a single-column stack. Each answer keeps the dark tile surface and gains a four-pixel neon left edge for quick scanning.
- The card contains, in order: encounter/day eyebrow, progress bar, question or dialogue text, optional hint, answer group, feedback/status region and compact metadata row.
- Daily, Forest and Cave use the same spacing, typography, radii and state colors while retaining their own labels and backend actions.

The selected implementation medium is one shared Wix HTML Component contract, `#rabbitQuestionView`, placed on Daily, Forest and Cave.

- A shared public HTML renderer owns the visual card, responsive grid/stack behavior, accessible choice semantics and interaction states.
- Each Wix page controller remains responsible for member authentication, calling the correct backend method and translating safe backend results into view data.
- The renderer receives only allowlisted display data and emits only allowlisted actions. It never imports backend modules, stores member authority or decides progression.
- Controller message handlers must validate `event.source`, the expected message type and every action/payload field before making a backend call.
- A request lock prevents duplicate submissions until the backend call settles.

## Alternatives considered

### A — Focused stack everywhere

Best raw readability and simplest keyboard flow, but less game-like than the direction selected by the owner.

### B2 — Fixed two-column tiles everywhere

Preserves the board-like composition at every breakpoint, but compresses longer answers and weakens touch accuracy on narrow phones.

### C — Select then Continue

Reduces accidental submission but adds an extra action to every question and changes the established immediate-choice interaction.

## Shared visual contract

### Question card

- Background: `#09090d` with a subtle `#12121b` gradient and restrained pink ambient glow.
- Border: one pixel `#454552`; radius 20–28 pixels depending on the Wix container.
- Maximum readable width: 760 pixels; centered within the page section.
- Internal spacing: 32 pixels desktop, 18–20 pixels mobile.
- Heading: off-white `#f4f4ef`, bold, responsive 22–36 pixels.
- Eyebrow and progress accent: cyan `#37e8ff`.
- Primary highlight: yellow `#f5ff37`.
- Secondary highlight: pink `#ff37bb`.

### Answer group

- Inside the HTML component, use a semantic `fieldset`/`legend` or equivalent radiogroup contract where only one answer is valid at a time.
- Desktop: two equal columns with 12–16 pixel gaps; odd final answer spans both columns.
- Mobile breakpoint: at or below 600 pixels, switch to one column.
- Each button is at least 48 pixels tall; preferred desktop tile height is 72 pixels.
- Long labels wrap naturally without clipping, overlap or reducing the text below 16 pixels.

### Interaction states

- Default: dark surface, neutral border, off-white label.
- Hover: cyan border and slight upward lift; no layout shift.
- Keyboard focus: three-pixel yellow outline with four-pixel offset.
- Selected/pending: pink border and tinted dark-pink surface; controls lock while the request is in flight.
- Correct: green accent, explicit “Correct” text in the live status region, then render the next allowed state.
- Incorrect: pink accent, explicit retry guidance, no answer leakage.
- Disabled/locked: reduced contrast while preserving readable text; explanatory status is visible and programmatically associated.
- Completed: show the completion message and prevent duplicate submissions.
- Error: restore enabled controls when safe and show a plain-language message without exposing backend details.
- Attempt limited: convert `DAILY_ATTEMPT_LIMITED:<seconds>` into plain-language retry timing without displaying the raw backend error.

## Page-specific behavior

### Daily

- Render the backend-provided three choices as buttons; remove free-text answer entry.
- Submit the exact selected choice through `solveDailyContent(day, answer)`.
- Preserve attempt limiting and the explicit “No points are awarded here” message.
- Do not expose the correct answer in page source or client state beyond the visible choices.
- After a correct answer, settle into a stable completed state for the current day. Do not auto-advance because the backend exposes only the current released entry.

### Forest

- Add a safe authenticated Forest stage-view endpoint that returns only the current guardian prompt and currently valid action tiles.
- Do not expose or render alternate encounter actions that the authoritative progression rules would reject.
- Preserve ordered guardian progression: Mothkeeper, Rootwhisper, Grumblebark, Tanglebright.
- Render all four guardians through the shared HTML contract, including the previously missing Grumblebark stage, and submit the selected allowlisted action through the authenticated forest endpoint.
- Locked encounters explain the required discovery milestone without allowing an early call.

### Cave

- Consume the safe dialogue text and choices returned by `enterCave()` and each `chooseLootgrem()` response, preserving the authoritative current dialogue node.
- When a reward choice reaches a terminal response with no next dialogue body, render an explicit safe terminal message rather than guessing another node.
- Keep cave access locked until all 50 discoveries are complete.
- Keep reward issuance disabled and retain the safe backend choice flow.

## Access and Wix editor requirements

- Audit Wix page permissions for Daily, Forest and Cave and set them for all signed-in site members, matching the existing `Permissions.SiteMember` backend boundary, without granting public access.
- Add one HTML Component named `#rabbitQuestionView` to each of the three pages. The shared HTML renderer owns the card, question text, status, progress and answer controls inside the iframe.
- The three HTML components use identical dimensions, anchoring and breakpoint rules in Wix Studio; page-specific content is sent from the controller.
- Verify desktop and mobile breakpoints in Preview while signed in as an authorized test member.

## Verification

- Add failing tests before product-code changes for shared markup/state behavior, three-choice Daily rendering, responsive layout hooks, guardian completeness and reward/reset safeguards.
- Test renderer messaging for source/type/action allowlisting, malformed payload rejection and duplicate-submit locking.
- Run the full repository test suite, lint and `git diff --check`.
- Verify in Wix Preview at desktop and mobile widths:
  - authorized member access;
  - keyboard order and visible focus;
  - long-label wrapping;
  - pending-state double-submit prevention;
  - safe translation of daily attempt-limit errors;
  - correct, incorrect, limited, locked and error feedback;
  - ordered guardian progression including Grumblebark;
  - Cave remains locked until 50 discoveries;
  - no reward issuance and no public reset.
- Report any editor-only placement or permission blocker exactly; do not claim live verification from local tests alone.
- Correct `FRONTEND_PATHWAYS.md` so the documented Forest sequence includes Grumblebark.

## Delivery boundary

Implementation will remain on the current development branch. No publish, Wix production mutation, member-data change, reward issuance or push to `main` is included without a new explicit instruction.
