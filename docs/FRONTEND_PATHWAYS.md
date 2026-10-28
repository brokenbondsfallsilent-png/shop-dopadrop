# Shop-DopaDrop frontend pathways

This is the implementation map for storefront navigation, visible controls and the Rabbit Hole experience. It describes the local source contract; Wix Preview and the published site must still be verified separately.

## Surface ownership

| Surface | Owner | Responsibilities |
| --- | --- | --- |
| Homepage embed | `#html3` and `shop-dopadrop-home-current.html` | Homepage visuals, catalogue cards, collection cards and the 50 hidden hunt objects |
| Shared Rabbit Hole launcher | `#html2` and `rabbit-widget.html` | The single visible gem, progress summary and links to Cave, Forest and Daily |
| Wix native pages | Wix page controllers | Product, collection, cart, checkout, account, policy and Rabbit Hole destination pages |

The homepage's internal Rabbit Hole HUD stays hidden. The shared header is the only visible launcher.

## Customer pathways

### Shopping

`Home -> Featured product or collection -> Product -> Cart -> Checkout -> Confirmation`

Secondary discovery routes are Shop All, Best Sellers, Search, Gift Card and Journal. The homepage iframe emits `SHOP_DOPA_NAVIGATE`; `Home.c1dmp.js` permits only known storefront paths and live Wix product or collection paths.

### Account

`Home -> Account -> Wix member profile and orders`

The embedded header owns one Account link. Duplicate native member bars are removed by `masterPage.js`. Authentication remains Wix-owned.

The member-only `getMyRabbitDashboard` backend method supplies a single read-only dashboard snapshot built from the authenticated member's live hunt record and private DopaVerse profile. It includes rank, XP, selected and unlocked titles, current hunt percentage, next assigned secret/page, forest and daily completion counts, safe reward status, next recommended action and stable route pathways.

The response is allowlisted rather than copied from database records. It excludes member IDs, challenge tokens and digests, reward idempotency keys, provider transaction IDs and raw persistence metadata.

The dashboard exposes only the safe reward-choice enum after Lootgrem authorization. An authorized checkout-code choice produces `claim_checkout_code`; an authorized loyalty choice produces `loyalty_points_unavailable` while live issuance is disabled. Unknown stored choices are returned as `null` and never become actionable.

Daily riddle submissions are guarded per member and day. Six incorrect answers are allowed in a rolling ten-minute window; further submissions return `DAILY_ATTEMPT_LIMITED` with retry seconds. Expired failures are pruned automatically, a correct answer clears that day's failures, and other days remain isolated. Incorrect answers persist only attempt timestamps—never the submitted answer—and daily content continues to award zero loyalty points.

The 30-day campaign content is validated when the backend module initializes. It must contain exactly thirty sequential entries with non-blank titles, teasers and prompts, three unique visible choices, unique titles and an answer present among those choices. Invalid content fails closed before it can be served. Release-day calculation is pinned to the Australia/Sydney calendar and capped at day thirty.

Successful daily riddles and forest encounters also synchronize trusted private DopaVerse activity. Unique valid completed days set the monotonic `riddlesSolved` total, while only the complete ordered Mothkeeper, Rootwhisper and Tanglebright encounter sequence records one completed quest chain. These writes grant no XP or staff permissions, and a profile-sync failure is logged without undoing already-saved Rabbit Hole progress.

### Rabbit Hole

`Gem -> Panel -> Hunt progress -> Forest or Daily -> Cave after 50 discoveries`

- The gem opens one dialog and returns focus when it closes.
- Escape closes the dialog.
- The cave control remains visibly disabled until `caveUnlocked` is returned by the trusted backend state.
- Forest and Daily routes have Wix page controllers and member gates.
- The public widget has no progress-reset control.
- No member-callable backend progress-reset method is exposed.
- The Cave page cannot directly issue a live reward.

## Backend challenge verification

Each hidden discovery now uses a two-step server gate. The authenticated member first requests a short-lived opaque challenge for the one next valid button on its assigned page. Completion is accepted only when the same member returns the same button, page and token after the minimum interaction delay and before expiry.

Challenges are single-use and issuance is capped per rolling minute. Only a SHA-256 digest is stored; the one-time plaintext token is returned to the browser but is not retained in the member record. The challenge is also bound to the hunt-state revision that issued it, preventing completion from a stale tab after progress changes elsewhere. Instant completion, replay, a forged token, a different member, a stale revision, an out-of-sequence button and a wrong page are all rejected before hunt progress is saved. The client never supplies or overrides member identity.

This is an abuse-resistance layer, not a claim that browser interaction is impossible to automate. Wix Preview still needs an authenticated click-through before launch.

## Reward transaction safety

Live loyalty issuance remains disabled. The dormant provider path now uses an explicit fail-closed transaction state machine for future integration testing:

- the member must finish the cave, authorize the claim and explicitly choose loyalty points;
- one stable member idempotency key is used for the provider call;
- completed awards return idempotently without calling the provider again;
- pending claims cannot be started again in parallel;
- an interrupted or ambiguous provider result is quarantined as `reconciliation_required` rather than retried;
- only a matching pending claim with a provider transaction ID may become `awarded`;
- claimant analytics failure is logged after the member award and cannot invite a second award call.

There is no automatic recovery from `reconciliation_required`. A trusted operator must compare the saved idempotency key with the provider ledger before any future retry or status repair.

The cave dialogue now exposes both promised reward choices. Choosing checkout code records the explicit member choice but does not return the code; the separately gated `claimCheckoutCode` method is the only response that reveals it. Choosing loyalty points records that choice without enabling issuance, which remains disabled for offline staging.

Reward types are mutually exclusive. Once either claim becomes pending, uncertain or completed, the dialogue choice is locked. A code-issued member cannot start a loyalty-points claim, and an awarded or in-flight loyalty claim cannot issue the checkout code. Repeated checkout-code claims return the same already-issued result without changing the original issuance timestamp.

## Interaction states

Every visible control should support the states that apply to it:

1. Resting
2. Hover
3. Keyboard focus
4. Pressed
5. Loading
6. Success or discovered
7. Locked or disabled
8. Error
9. Member-only

The neon palette supplies state accents, but state must never be communicated by colour alone. Keep text, disabled attributes, focus outlines and live-region feedback.

## Verification boundary

Local tests cover ownership, route-controller presence, reward/reset safety and widget document integrity. Before claiming a Wix-facing change complete, verify desktop and mobile Preview for:

- exactly one Account control;
- exactly one gem in the approved section-relative bottom-right position;
- one panel that opens and closes cleanly;
- keyboard focus and Escape behaviour;
- accurate progress and Cave locked/unlocked state;
- product, collection, cart and account navigation;
- no stale `filesusr.com` or GitHub Pages asset version.

Publishing, reward issuance, member-data changes and hunt-progress resets require separate authorization.

Local setup manifests are included for `RabbitHuntMembers`, `RabbitHuntGlobal` and `DopaMemberProfiles`. All collection operations are owner-only; authenticated members interact only through allowlisted web methods. The manifests document required Wix collection fields but do not create or modify live collections by themselves, so their live permissions and field types still require verification in the Wix collection manager.

Every member hunt record is normalized on load and save. Missing nested state receives complete safe defaults; forest history keeps only the valid ordered encounter prefix, valid unique fragments and days, and finite non-negative bond values. Unknown dialogue nodes, reward statuses and reward choices fail closed, and claim authorization survives only on the approved reward dialogue node. This allows older or partial records to recover without granting progress or crashing daily and forest endpoints.
