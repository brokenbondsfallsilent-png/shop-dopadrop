# Hidden discovery placement registry

Date: 2026-10-31 (Australia/Sydney)

## Safety and verification boundary

The canonical 50-entry sequence uses authenticated per-member challenges. Discovery 1 remains the only signup gate. Guardian thresholds remain Mothkeeper 20, Rootwhisper 30, Grumblebark 40, and Tanglebright 50. Reward issuance is disabled and no public reset exists.

Buttons 1-4 are explicit page-local targets inside bounded homepage artwork bands. Buttons 5-50 use native Wix controls in normal content flow. Static pages use numbered IDs such as `#rabbitDiscovery32`; the Category template uses `#rabbitDiscoveryHeading`, `#rabbitDiscoveryGrid`, and `#rabbitDiscoveryFooter`.

Every native control must have a minimum 44 by 44 CSS-pixel mobile hit area and sit above every normal page-canvas text, image, repeater, decoration, section, and container layer. Legitimate Wix system overlays—login, cookies, navigation, cart, lightboxes, and accessibility dialogs—remain above the hunt.

Evidence states are separate:

- **Locally wired:** registry, controller, binder, and tests are complete.
- **Editor placed:** the exact element exists in Wix Studio at the documented in-flow anchor.
- **Preview verified:** desktop and mobile Preview hit testing and keyboard focus were observed.
- **Production verified:** the published customer site was observed after a separately authorized publish.

## Exact placements

| ID | Route | Intended anchor | Editor element | Locally wired | Editor placed | Preview verified | Production verified |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | `/` | Hero artwork | `data-rabbit-id="1"` | Yes | N/A | No | No |
| 2 | `/` | Featured products | `data-rabbit-id="2"` | Yes | N/A | No | No |
| 3 | `/` | Collection trail | `data-rabbit-id="3"` | Yes | N/A | No | No |
| 4 | `/` | Founder invitation | `data-rabbit-id="4"` | Yes | N/A | No | No |
| 5 | `/category/all-products` | Heading | `#rabbitDiscoveryHeading` | Yes | No | No | No |
| 6 | `/category/all-products` | Catalogue midpoint | `#rabbitDiscoveryGrid` | Yes | No | No | No |
| 7 | `/category/all-products` | Catalogue footer | `#rabbitDiscoveryFooter` | Yes | No | No | No |
| 8 | `/category/desk-workspace-fidgets` | Heading | `#rabbitDiscoveryHeading` | Yes | No | No | No |
| 9 | `/category/desk-workspace-fidgets` | Product grid | `#rabbitDiscoveryGrid` | Yes | No | No | No |
| 10 | `/category/hand-fidgets-spinners` | Heading | `#rabbitDiscoveryHeading` | Yes | No | No | No |
| 11 | `/category/hand-fidgets-spinners` | Product grid | `#rabbitDiscoveryGrid` | Yes | No | No | No |
| 12 | `/category/sensory-rings-chains-wearables` | Heading | `#rabbitDiscoveryHeading` | Yes | No | No | No |
| 13 | `/category/sensory-rings-chains-wearables` | Product grid | `#rabbitDiscoveryGrid` | Yes | No | No | No |
| 14 | `/category/chew-oral-sensory` | Heading | `#rabbitDiscoveryHeading` | Yes | No | No | No |
| 15 | `/category/chew-oral-sensory` | Product grid | `#rabbitDiscoveryGrid` | Yes | No | No | No |
| 16 | `/category/tactile-textured-sensory` | Heading | `#rabbitDiscoveryHeading` | Yes | No | No | No |
| 17 | `/category/tactile-textured-sensory` | Product grid | `#rabbitDiscoveryGrid` | Yes | No | No | No |
| 18 | `/category/weighted-deep-pressure` | Heading | `#rabbitDiscoveryHeading` | Yes | No | No | No |
| 19 | `/category/weighted-deep-pressure` | Product grid | `#rabbitDiscoveryGrid` | Yes | No | No | No |
| 20 | `/category/visual-light-stimulation` | Heading; Mothkeeper threshold | `#rabbitDiscoveryHeading` | Yes | No | No | No |
| 21 | `/category/visual-light-stimulation` | Product grid | `#rabbitDiscoveryGrid` | Yes | No | No | No |
| 22 | `/category/auditory-rhythm-tools` | Heading | `#rabbitDiscoveryHeading` | Yes | No | No | No |
| 23 | `/category/auditory-rhythm-tools` | Product grid | `#rabbitDiscoveryGrid` | Yes | No | No | No |
| 24 | `/category/focus-calm-tools` | Heading | `#rabbitDiscoveryHeading` | Yes | No | No | No |
| 25 | `/category/focus-calm-tools` | Product grid | `#rabbitDiscoveryGrid` | Yes | No | No | No |
| 26 | `/category/stim-toys-squishies` | Heading | `#rabbitDiscoveryHeading` | Yes | No | No | No |
| 27 | `/category/stim-toys-squishies` | Product grid | `#rabbitDiscoveryGrid` | Yes | No | No | No |
| 28 | `/category/sensory-kits-bundles` | Heading | `#rabbitDiscoveryHeading` | Yes | No | No | No |
| 29 | `/category/sensory-kits-bundles` | Product grid | `#rabbitDiscoveryGrid` | Yes | No | No | No |
| 30 | `/category/movement-balance` | Heading; Rootwhisper threshold | `#rabbitDiscoveryHeading` | Yes | No | No | No |
| 31 | `/category/movement-balance` | Product grid | `#rabbitDiscoveryGrid` | Yes | No | No | No |
| 32 | `/about` | Founder story opening | `#rabbitDiscovery32` | Yes | No | No | No |
| 33 | `/about` | Origin story midpoint | `#rabbitDiscovery33` | Yes | No | No | No |
| 34 | `/about` | Welcome-home sign-off | `#rabbitDiscovery34` | Yes | No | No | No |
| 35 | `/contact` | Support introduction | `#rabbitDiscovery35` | Yes | No | No | No |
| 36 | `/contact` | Help-choosing section | `#rabbitDiscovery36` | Yes | No | No | No |
| 37 | `/contact` | Contact sign-off | `#rabbitDiscovery37` | Yes | No | No | No |
| 38 | `/shipping-policy` | Tracking section | `#rabbitDiscovery38` | Yes | No | No | No |
| 39 | `/refund-policy` | Refunds section | `#rabbitDiscovery39` | Yes | No | No | No |
| 40 | `/privacy-policy` | Privacy promise; Grumblebark threshold | `#rabbitDiscovery40` | Yes | No | No | No |
| 41 | `/shipping-policy` | Delivery-help footer | `#rabbitDiscovery41` | Yes | No | No | No |
| 42 | `/refund-policy` | Returns-help footer | `#rabbitDiscovery42` | Yes | No | No | No |
| 43 | `/privacy-policy` | Data-controls footer | `#rabbitDiscovery43` | Yes | No | No | No |
| 44 | `/accessibility-statement` | Assistance footer | `#rabbitDiscovery44` | Yes | No | No | No |
| 45 | `/rabbit-hole-forest` | Forest path | `#rabbitDiscovery45` | Yes | No | No | No |
| 46 | `/rabbit-hole-daily` | Daily chronicle | `#rabbitDiscovery46` | Yes | No | No | No |
| 47 | `/blog` | Brain Dump archive | `#rabbitDiscovery47` | Yes | No | No | No |
| 48 | `/gift-card` | Gift-card artwork | `#rabbitDiscovery48` | Yes | No | No | No |
| 49 | `/accessibility-statement` | Accessibility promise | `#rabbitDiscovery49` | Yes | No | No | No |
| 50 | `/rabbit-hole-forest` | Tanglebright threshold | `#rabbitDiscovery50` | Yes | No | No | No |

## Wix Studio placement checklist

- Place every control between normal content blocks; never absolutely position it over text.
- On Category, keep heading, grid, and footer slots at distinct vertical positions on desktop and mobile.
- On About and Contact, keep all three numbered controls as separate in-flow elements.
- On Shipping, Refund, Privacy, Accessibility, and Forest, keep both assigned controls as separate in-flow elements.
- Bring each control to front within its local container and verify no ancestor clips its 44 by 44 hit area.
- Add matching status text where desired: numbered controls use `#rabbitDiscoveryStatusNN`; Category controls use `#rabbitDiscoveryStatusHeading`, `#rabbitDiscoveryStatusGrid`, and `#rabbitDiscoveryStatusFooter`.
- Verify touch center hit testing and keyboard focus in desktop and mobile Preview.
- Do not mark Preview or Production verified without direct observation.
