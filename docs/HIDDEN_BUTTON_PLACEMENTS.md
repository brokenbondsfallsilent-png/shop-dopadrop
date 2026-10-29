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
| 5 | `/category/all-products` | Shop All | Heading | Category controller | `#rabbitDiscoveryButton` placement blocked |
| 6 | `/category/all-products` | Shop All | Catalogue midpoint | Category controller | Same template element, blocked |
| 7 | `/category/all-products` | Shop All | Catalogue footer | Category controller | Same template element, blocked |
| 8 | `/category/desk-workspace-fidgets` | Collection | Heading | Category controller | Category template element blocked |
| 9 | `/category/desk-workspace-fidgets` | Collection | Product grid | Category controller | Same template element, blocked |
| 10 | `/category/hand-fidgets-spinners` | Collection | Heading | Category controller | Category template element blocked |
| 11 | `/category/hand-fidgets-spinners` | Collection | Product grid | Category controller | Same template element, blocked |
| 12 | `/category/sensory-rings-chains-wearables` | Collection | Heading | Category controller | Category template element blocked |
| 13 | `/category/sensory-rings-chains-wearables` | Collection | Product grid | Category controller | Same template element, blocked |
| 14 | `/category/chew-oral-sensory` | Collection | Heading | Category controller | Category template element blocked |
| 15 | `/category/chew-oral-sensory` | Collection | Product grid | Category controller | Same template element, blocked |
| 16 | `/category/tactile-textured-sensory` | Collection | Heading | Category controller | Category template element blocked |
| 17 | `/category/tactile-textured-sensory` | Collection | Product grid | Category controller | Same template element, blocked |
| 18 | `/category/weighted-deep-pressure` | Collection | Heading | Category controller | Category template element blocked |
| 19 | `/category/weighted-deep-pressure` | Collection | Product grid | Category controller | Same template element, blocked |
| 20 | `/category/visual-light-stimulation` | Collection | Heading | Category controller | Category template element blocked; unlocks Mothkeeper |
| 21 | `/category/visual-light-stimulation` | Collection | Product grid | Category controller | Same template element, blocked |
| 22 | `/category/auditory-rhythm-tools` | Collection | Heading | Category controller | Category template element blocked |
| 23 | `/category/auditory-rhythm-tools` | Collection | Product grid | Category controller | Same template element, blocked |
| 24 | `/category/focus-calm-tools` | Collection | Heading | Category controller | Category template element blocked |
| 25 | `/category/focus-calm-tools` | Collection | Product grid | Category controller | Same template element, blocked |
| 26 | `/category/stim-toys-squishies` | Collection | Heading | Category controller | Category template element blocked |
| 27 | `/category/stim-toys-squishies` | Collection | Product grid | Category controller | Same template element, blocked |
| 28 | `/category/sensory-kits-bundles` | Collection | Heading | Category controller | Category template element blocked |
| 29 | `/category/sensory-kits-bundles` | Collection | Product grid | Category controller | Same template element, blocked |
| 30 | `/category/movement-balance` | Collection | Heading | Category controller | Category template element blocked; unlocks Rootwhisper |
| 31 | `/category/movement-balance` | Collection | Product grid | Category controller | Same template element, blocked |
| 32 | `/about` | About | Founder story opening | About controller | `#rabbitDiscoveryButton` placement blocked |
| 33 | `/about` | About | Origin story midpoint | About controller | Same page element, blocked |
| 34 | `/about` | About | Welcome-home sign-off | About controller | Same page element, blocked |
| 35 | `/contact` | Support | Support introduction | Contact controller | `#rabbitDiscoveryButton` placement blocked |
| 36 | `/contact` | Support | Help-choosing section | Contact controller | Same page element, blocked |
| 37 | `/contact` | Support | Contact sign-off | Contact controller | Same page element, blocked |
| 38 | `/shipping-policy` | Policy | Tracking section | Shipping controller | `#rabbitDiscoveryButton` placement blocked |
| 39 | `/refund-policy` | Policy | Refunds section | Refund controller | `#rabbitDiscoveryButton` placement blocked |
| 40 | `/privacy-policy` | Policy | Privacy promise | Privacy controller | `#rabbitDiscoveryButton` placement blocked; unlocks Grumblebark |
| 41 | `/profile/my/profile` | Member | Profile summary | Profile controller | `#rabbitDiscoveryButton` placement blocked |
| 42 | `/my-orders` | Member | Orders summary | Orders controller | `#rabbitDiscoveryButton` placement blocked |
| 43 | `/account-settings` | Member | Settings footer | Account Settings controller | `#rabbitDiscoveryButton` placement blocked |
| 44 | `/notifications` | Member | Notifications footer | Notifications controller | `#rabbitDiscoveryButton` placement blocked |
| 45 | `/rabbit-hole-forest` | Adventure | Forest path | Forest controller | `#rabbitDiscoveryButton` placement blocked |
| 46 | `/rabbit-hole-daily` | Adventure | Daily chronicle | Daily controller | `#rabbitDiscoveryButton` placement blocked |
| 47 | `/blog` | Adventure | Brain Dump archive | Blog controller | `#rabbitDiscoveryButton` placement blocked |
| 48 | `/gift-card` | Adventure | Gift-card artwork | Gift Card controller | `#rabbitDiscoveryButton` placement blocked |
| 49 | `/accessibility-statement` | Adventure | Accessibility promise | Accessibility controller | `#rabbitDiscoveryButton` placement blocked |
| 50 | `/rabbit-hole-forest` | Adventure | Tanglebright threshold | Forest controller | Same page element, blocked; unlocks Tanglebright |

## Guardian editor blockers

The backend sequence and thresholds are complete:

1. Mothkeeper — 20 unique discoveries, `mothkeeper:wait`
2. Rootwhisper — 30 unique discoveries, `rootwhisper:protect`
3. Grumblebark — 40 unique discoveries, `grumblebark:listen`
4. Tanglebright — 50 unique discoveries, `tanglebright:approach`

The Forest page already has wired controls for Mothkeeper, Rootwhisper and Tanglebright. Wix Studio must add the Grumblebark encounter control before the four-step sequence can be completed in Preview. Its final Wix component ID must then replace a named editor contract or be wired in `Rabbit Hole Forest.l4tqi.js`; no component ID was fabricated in source.

## Required Wix Studio placement pass

- Add one initially collapsed `#rabbitDiscoveryButton` to each of these native templates/pages: Category, About, Contact, Shipping Policy, Refund Policy, Privacy Policy, Profile, My Orders, Account Settings, Notifications, Rabbit Hole Forest, Rabbit Hole Daily, Blog, Gift Card and Accessibility Statement.
- Optionally add `#rabbitDiscoveryStatus` next to each button as an accessible status message.
- On the Category template, position the single reusable control so it works for both the heading and product-grid anchors at desktop and mobile breakpoints; the backend reveals it only for the member's currently assigned ID.
- Add and wire the missing Grumblebark encounter control on Rabbit Hole Forest.
- Preview as an authenticated test member from discovery 1 through 50 on desktop and mobile. Do not publish until the route, challenge-delay, guardian and cave gates are observed end to end.
