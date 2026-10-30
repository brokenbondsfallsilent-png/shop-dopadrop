# Page-Local Hunt Placements Design

## Intent

Reorganize all 50 Rabbit Hole discoveries so every one has a distinct physical hiding place inside the normal content flow of its existing Wix route. No discovery may depend on a floating page overlay or sit underneath a text, image, decorative, repeater, section, or container layer. The change exists to make the hunt usable on mobile without turning it into an obvious row of buttons.

## Goals

- Preserve the canonical ordered IDs and sequence in `HUNT_PLACEMENTS`, except for the explicitly approved redistribution of discoveries 41-44 from Wix-owned member pages.
- Keep four distinct homepage discoveries and separate distinct placements for every route that owns two or three discoveries.
- Put each discovery in an in-flow local slot between content blocks, never over readable content.
- Keep each interactive target at least 44 by 44 CSS pixels on mobile.
- Give every discovery slot the highest foreground order inside its local container and verify that no later sibling or ancestor overlay wins hit testing.
- Preserve authenticated per-member challenges, the signup gate at discovery 1, guardian thresholds 20/30/40/50, disabled reward issuance, and protected reset.
- Preserve desktop and mobile layouts, keyboard focus, accessible names, and status feedback.

## Non-goals

- Do not change route taxonomy, sequence, guardian identities, member records, or rewards.
- Do not expose all 50 discoveries on the homepage or create a separate hunt-only route.
- Do not make discoveries visually prominent; accessibility applies to hit testing, focus, and size, not obvious visual disclosure.
- Do not publish, push, merge to `main`, reset progress, or issue rewards as part of implementation.

## Anti-goals

- No absolute-positioned control over a text block.
- No shared single button that cycles through multiple discoveries assigned to one route.
- No discovery hidden behind another Wix layer at any breakpoint.
- No public reset, client-selected member identity, direct reward claim, or route bypass.

## Selected approach

Use a distinct in-flow discovery slot for every assigned anchor. This was selected over one reusable nook per page because the hunt must retain 50 separate physical hiding places. It was selected over page-local HTML strips because the user wants the discoveries to remain on the existing native Wix pages rather than add another embed boundary.

## Editor structure

Each native placement uses a small local container positioned between the two content blocks named by its canonical anchor. The container participates in normal responsive layout. Its discovery control is the topmost child and has a stable unique editor ID derived from its canonical ID, for example `#rabbitDiscovery32` through `#rabbitDiscovery50`. Optional feedback text uses the matching numbered status ID.

The reusable Category template owns three physical in-flow slots with shared physical IDs: `#rabbitDiscoveryHeading`, `#rabbitDiscoveryGrid`, and `#rabbitDiscoveryFooter`. Route-aware bindings map each canonical logical ID to the correct slot for that collection. Collection routes with two discoveries use heading and product-grid slots; Shop All uses all three. The canonical ID plus route plus physical slot is the unique placement identity; the template does not contain separate duplicate elements for IDs 5-31.

Static routes use their required number of local slots: About and Contact use three each; Forest uses two; all other listed native routes use one. Homepage discoveries 1-4 remain inside the hosted homepage, each in its own bounded artwork band.

## Foreground and hit-testing contract

For every breakpoint:

- the slot container must remain in normal document flow;
- the slot may not use negative margins that move it over copy;
- the interactive control must be the last/topmost child in its local container;
- the control must be brought to front in Wix Studio after placement, above every normal page-canvas text, image, repeater, decoration, section, and container layer;
- decorative siblings must not intercept pointer events;
- no ancestor container may clip the 44 by 44 hit area;
- a mobile Preview hit-test must select the discovery control at its visible center;
- keyboard focus must reach the same control in page order.

Legitimate Wix system surfaces—including login dialogs, cookie notices, navigation menus, cart panels, lightboxes, and accessibility modals—remain above discovery controls so essential site UI is never blocked.

The hosted homepage additionally uses an isolated stacking context and explicit foreground `z-index`, while clipping each target to its own artwork band so it cannot cover text.

## Runtime binding

Replace the single `#rabbitDiscoveryButton` lookup with a placement-aware binder that receives the canonical placements for the current route, resolves each unique editor ID, and collapses every non-current slot. Only the authoritative `nextButtonId` expands. Challenge issuance and completion continue to send the canonical button ID and current route to the backend. Missing required editor elements fail closed and identify the exact missing ID.

The binder must not infer progress locally. It continues to use `getHuntState`, `beginButtonChallenge`, and `findButton`. After a successful discovery it refreshes authoritative state and expands the next local slot only when the next canonical discovery is on the same route.

## Placement registry

The canonical routes and anchor names remain those in `docs/HIDDEN_BUTTON_PLACEMENTS.md` except for the following approved redistribution away from Wix-owned member pages:

- Discovery 41 moves from `/profile/my/profile` to `/shipping-policy`, anchored in a distinct in-flow delivery-help footer slot after discovery 38's tracking section.
- Discovery 42 moves from `/my-orders` to `/refund-policy`, anchored in a distinct in-flow returns-help footer slot after discovery 39's refunds section.
- Discovery 43 moves from `/account-settings` to `/privacy-policy`, anchored in a distinct in-flow data-controls footer slot after discovery 40's privacy promise.
- Discovery 44 moves from `/notifications` to `/accessibility-statement`, anchored in a distinct in-flow assistance footer slot before discovery 49's accessibility promise endpoint.

Static native routes gain unique numbered editor element IDs. Category-template discoveries map unique logical IDs onto the three shared physical template IDs. Documentation must distinguish locally wired, editor placed, Preview verified, and production verified states.

## Verification

- Unit tests prove 50 unique canonical IDs and unique native editor IDs.
- Binding tests prove all local slots begin collapsed, exactly the authoritative next slot expands, missing slots fail with their exact IDs, and multiple discoveries on one route advance between distinct slots.
- Existing authentication, sequence, guardian, reward, and reset tests remain green.
- Source and served homepage assets remain byte-identical.
- Wix Studio mobile and desktop Preview checks verify all physical slots are in flow, foregrounded, reachable by touch and keyboard, and do not cover text.
- Production verification remains a separate protected publish gate and uses an authenticated test member without a public reset.

## Constraints and builder calls

- Existing URLs, collection slugs, and page ownership remain unchanged.
- `#html3` remains homepage/hunt ownership; `#html2` remains the gem dashboard.
- Reward issuance stays disabled.
- The builder may choose subtle per-page visual styling, provided the target remains discoverable by deliberate exploration, maintains contrast when focused, and meets the foreground/hit-area contract.
- Where Wix template limitations prevent a literal unique element instance per collection route, uniqueness is defined by canonical ID plus route plus physical template slot; discoveries assigned to the same rendered page must still occupy distinct slots.
- If another Wix-owned route proves non-editable during the placement pass, it must not receive an overlay workaround. Stop and return for explicit redistribution approval.

