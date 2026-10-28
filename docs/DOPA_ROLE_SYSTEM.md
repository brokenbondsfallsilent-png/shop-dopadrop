# Shop-DopaDrop store-wide DopaVerse roles

The role engine is intentionally separate from Wix administrative permissions.

## Five systems

1. Membership rank: permanent rank calculated from non-spendable `progressionXp`.
2. Sensory identity: one member-selected title from the 12 sensory collections.
3. Achievement titles: earned from trusted shopping, quest, reward, learning and event activity.
4. Community roles: participation titles; moderator identities require separate staff approval.
5. Staff permissions: display titles only. Actual access remains controlled by Wix roles and permissions.

## CMS collection required before preview

Create a private CMS collection named `DopaMemberProfiles`. Site visitors must not have direct read or write access. Backend code accesses it with `suppressAuth`; authenticated members use the constrained web methods in `dopaProfiles.web.js`.

Recommended fields:

| Field | Type | Purpose |
| --- | --- | --- |
| `_id` | Text | Authenticated Wix member ID |
| `memberId` | Text | Authenticated Wix member ID |
| `progressionXp` | Number | Permanent, non-spendable XP |
| `profileComplete` | Boolean | Unlocks DopaSprout |
| `hasActivity` | Boolean | Unlocks Stimling |
| `sensoryIdentity` | Text | Member-selected specialist title |
| `selectedTitles` | Tags/Array | Up to four unlocked display titles |
| `visibility` | Object | Opt-in public visibility flags |
| `activity` | Object | Trusted aggregate activity facts |
| `createdAt` | Date | Creation time |
| `updatedAt` | Date | Last update time |
| `version` | Number | Profile revision counter |

## Security rules

- Public title visibility defaults to off.
- Member preference methods cannot award XP, unlock achievements, assign moderation, or assign staff access.
- Store activity must be recorded from trusted backend integrations using `recordDopaActivity()`.
- Purchase-derived titles must be opt-in before public display.
- Dopamine Points are never copied into or spent from progression XP.
- Staff display titles never grant permissions. Configure actual access using Wix roles.

## Existing integration

The Great Dopamine Hunt records authenticated button progress into the shared profile system. Failure to sync a profile is logged and does not invalidate an already-saved hunt discovery.

Trusted activity patches merge monotonically before profile persistence. Numeric progress keeps the highest recorded value, permanent Boolean facts cannot revert from true to false, and collected fact lists are unioned without duplicates. Undefined, null, negative-count and nested-object patch values are ignored. This protects against ordinary delayed or out-of-order event patches; exact simultaneous-write behaviour must still be validated against the real Wix collection runtime before launch.

Positive progression XP additionally requires a trusted `eventId`. Processed IDs are stored privately with the profile, and a duplicate delivery can refresh monotonic activity facts but cannot credit XP twice. The inline ledger retains the latest 250 IDs to bound profile size. If integrations later require permanent or high-volume deduplication, move event receipts to an owner-only append-only collection rather than increasing the member profile indefinitely.

Shopping, loyalty, learning, community and event integrations can feed trusted aggregate fields into `recordDopaActivity()` as their Wix event handlers are enabled. Do not expose that function through a member-callable web method.
