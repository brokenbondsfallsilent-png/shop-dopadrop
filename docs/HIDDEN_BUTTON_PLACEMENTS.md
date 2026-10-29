# Hidden discovery placement registry

Date: 2026-10-29 (Australia/Sydney)

## Safety and verification boundary

This branch implements the canonical 50-entry route registry, authenticated per-member challenge flow, native page-controller bindings and four guardian milestones. It does not publish the site, change live member records, reset progress, issue rewards or enable loyalty points.

Routes were audited from the current Velo page modules, `Home.c1dmp.js` navigation allowlist and the preserved collection slugs in `dopaNaming.js`. A route in this registry is therefore a source-backed Wix route, not a proposed new page.

Buttons 1–4 are implemented inside the homepage HTML component. Buttons 5–50 require a native Wix Studio button with ID `#rabbitDiscoveryButton` on the owning page or template. An optional text element with ID `#rabbitDiscoveryStatus` provides accessible feedback. The source bindings fail safely when these editor elements are absent.

## Exact placements

| ID | Route | Surface | Intended anchor | Local wiring | Wix editor state |
| ---: | --- | --- | --- | --- | --- |
| 1 | `/` | Home | Hero artwork | Homepage embed | Implemented locally |
| 2 | `/` | Home | Featured products | Homepage embed | Implemented locally |
| 3 | `/` | Home | Collection trail | Homepage embed | Implemented locally |
| 4 | `/` | Home | Founder invitation | Homepage embed | Implemented locally |
| 5 | `/category/all-products` | Shop All | Heading | Category controller | Shared template control placed |
| 6 | `/category/all-products` | Shop All | Catalogue midpoint | Category controller | Shared template control placed |
| 7 | `/category/all-products` | Shop All | Catalogue footer | Category controller | Shared template control placed |
| 8 | `/category/desk-workspace-fidgets` | Collection | Heading | Category controller | Shared template control placed |
| 9 | `/category/desk-workspace-fidgets` | Collection | Product grid | Category controller | Shared template control placed |
| 10 | `/category/hand-fidgets-spinners` | Collection | Heading | Category controller | Shared template control placed |
| 11 | `/category/hand-fidgets-spinners` | Collection | Product grid | Category controller | Shared template control placed |
| 12 | `/category/sensory-rings-chains-wearables` | Collection | Heading | Category controller | Shared template control placed |
| 13 | `/category/sensory-rings-chains-wearables` | Collection | Product grid | Category controller | Shared template control placed |
| 14 | `/category/chew-oral-sensory` | Collection | Heading | Category controller | Shared template control placed |
| 15 | `/category/chew-oral-sensory` | Collection | Product grid | Category controller | Shared template control placed |
| 16 | `/category/tactile-textured-sensory` | Collection | Heading | Category controller | Shared template control placed |
| 17 | `/category/tactile-textured-sensory` | Collection | Product grid | Category controller | Shared template control placed |
| 18 | `/category/weighted-deep-pressure` | Collection | Heading | Category controller | Shared template control placed |
| 19 | `/category/weighted-deep-pressure` | Collection | Product grid | Category controller | Shared template control placed |
| 20 | `/category/visual-light-stimulation` | Collection | Heading | Category controller | Shared template control placed; unlocks Mothkeeper |
| 21 | `/category/visual-light-stimulation` | Collection | Product grid | Category controller | Shared template control placed |
| 22 | `/category/auditory-rhythm-tools` | Collection | Heading | Category controller | Shared template control placed |
| 23 | `/category/auditory-rhythm-tools` | Collection | Product grid | Category controller | Shared template control placed |
| 24 | `/category/focus-calm-tools` | Collection | Heading | Category controller | Shared template control placed |
| 25 | `/category/focus-calm-tools` | Collection | Product grid | Category controller | Shared template control placed |
| 26 | `/category/stim-toys-squishies` | Collection | Heading | Category controller | Shared template control placed |
| 27 | `/category/stim-toys-squishies` | Collection | Product grid | Category controller | Shared template control placed |
| 28 | `/category/sensory-kits-bundles` | Collection | Heading | Category controller | Shared template control placed |
| 29 | `/category/sensory-kits-bundles` | Collection | Product grid | Category controller | Shared template control placed |
| 30 | `/category/movement-balance` | Collection | Heading | Category controller | Shared template control placed; unlocks Rootwhisper |
| 31 | `/category/movement-balance` | Collection | Product grid | Category controller | Shared template control placed |
| 32 | `/about` | About | Founder story opening | About controller | `#rabbitDiscoveryButton` placed in draft editor |
| 33 | `/about` | About | Origin story midpoint | About controller | Same draft page element placed |
| 34 | `/about` | About | Welcome-home sign-off | About controller | Same draft page element placed |
| 35 | `/contact` | Support | Support introduction | Contact controller | `#rabbitDiscoveryButton` placed in draft editor |
| 36 | `/contact` | Support | Help-choosing section | Contact controller | Same draft page element placed |
| 37 | `/contact` | Support | Contact sign-off | Contact controller | Same draft page element placed |
| 38 | `/shipping-policy` | Policy | Tracking section | Shipping controller | `#rabbitDiscoveryButton` placed in draft editor |
| 39 | `/refund-policy` | Policy | Refunds section | Refund controller | `#rabbitDiscoveryButton` placed in draft editor |
| 40 | `/privacy-policy` | Policy | Privacy promise | Privacy controller | `#rabbitDiscoveryButton` placed in draft editor; unlocks Grumblebark |
| 41 | `/profile/my/profile` | Member | Profile summary | Profile controller | `#rabbitDiscoveryButton` placed in draft editor |
| 42 | `/my-orders` | Member | Orders summary | Orders controller | `#rabbitDiscoveryButton` placed in draft editor |
| 43 | `/account-settings` | Member | Settings footer | Account Settings controller | `#rabbitDiscoveryButton` placed in draft editor |
| 44 | `/notifications` | Member | Notifications footer | Notifications controller | `#rabbitDiscoveryButton` placed in draft editor |
| 45 | `/rabbit-hole-forest` | Adventure | Forest path | Forest controller | `#rabbitDiscoveryButton` placed in draft editor |
| 46 | `/rabbit-hole-daily` | Adventure | Daily chronicle | Daily controller | `#rabbitDiscoveryButton` placed in draft editor |
| 47 | `/blog` | Adventure | Brain Dump archive | Blog controller | `#rabbitDiscoveryButton` placed in draft editor |
| 48 | `/gift-card` | Adventure | Gift-card artwork | Gift Card controller | `#rabbitDiscoveryButton` placed in draft editor |
| 49 | `/accessibility-statement` | Adventure | Accessibility promise | Accessibility controller | `#rabbitDiscoveryButton` placed in draft editor |
| 50 | `/rabbit-hole-forest` | Adventure | Tanglebright threshold | Forest controller | Same draft page element placed; unlocks Tanglebright |

## Guardian editor status

The backend sequence and thresholds are complete:

1. Mothkeeper — 20 unique discoveries, `mothkeeper:wait`
2. Rootwhisper — 30 unique discoveries, `rootwhisper:protect`
3. Grumblebark — 40 unique discoveries, `grumblebark:listen`
4. Tanglebright — 50 unique discoveries, `tanglebright:approach`

The Forest page uses the shared `#rabbitQuestionView` component for all four authenticated guardian stages. Grumblebark is supplied by the authoritative stage view at 40 discoveries, so no separate generated editor control is required. Discovery 50 now reloads that same view immediately so Tanglebright unlocks without a page refresh.

## Required Wix Studio placement pass

- Draft-editor placements are complete on About, Contact, Shipping Policy, Refund Policy, Privacy Policy, Rabbit Hole Forest, Rabbit Hole Daily, Gift Card and Accessibility Statement.
- Draft-editor placements are now complete on all required native pages and the reusable Category template. The controls remain unpublished until the final publish gate.
- Optionally add `#rabbitDiscoveryStatus` next to each button as an accessible status message.
- On the Category template, position the single reusable control so it works for both the heading and product-grid anchors at desktop and mobile breakpoints; the backend reveals it only for the member's currently assigned ID.
- Preview as an authenticated test member without resetting existing member progress. Full 1-through-50 traversal remains a post-publish test-account check because the protected reset is intentionally unavailable to public code.
