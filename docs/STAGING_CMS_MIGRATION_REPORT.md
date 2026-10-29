# Wix CMS staging migration report

Date: 2026-10-29 (Australia/Sydney)

## Scope and safety boundary

This migration compared the live Wix CMS schemas with the local staging manifests. It did not edit, replace, import, or delete collection items. It did not reset Rabbit Hole progress, issue rewards or loyalty points, change collection permissions, publish the Wix site, or spend Wix credits.

## Verified collections

| Collection ID | Wix display name | Live revision | Application fields | Permissions |
| --- | --- | ---: | ---: | --- |
| `DopaMemberProfiles` | Dopa Member Profiles | 1 | 12 | Admin-only read/write |
| `RabbitHuntMembers` | Rabbit Hole Member Progress | 2 | 20 | Admin-only read/write |
| `RabbitHuntGlobal` | Rabbit Hunt Global | 1 | 2 | Admin-only read/write |

The application fields and field types match the corresponding schema manifests in `src/backend`. Wix's four system fields are present in each collection and are not duplicated in the local manifests.

## Applied schema-only change

The live collections were missing the two `memberId` indexes declared by the local manifests. Two non-unique ascending indexes were created:

| Collection ID | Index name | Wix index ID | Field |
| --- | --- | --- | --- |
| `DopaMemberProfiles` | `memberId` | `67b30553-b1b6-4c24-8edb-1a1e4d1c1420` | `memberId ASC` |
| `RabbitHuntMembers` | `memberId` | `17ee82aa-852b-4e86-8d1d-bc09f86f657b` | `memberId ASC` |

Wix accepted both index requests. The indexes must reach `ACTIVE` before the migration is considered fully settled.

## Rollback boundary

No data rollback is required because no collection items were changed. If an index must be removed, drop only the exact Wix index ID listed above after confirming the target collection. Do not delete or recreate a collection to roll back an index.

