# The kinds of card (internal list)

Status: **reference**, updated 2026-10-21.

Every card that opens from a tile (floating, or in a tile's dialog), by kind: where its code is and how its head is built. **The order number stands inside the name cell** on every card that has a name cell (drawn over the name's left, 10px in; the name's text starts at 38px); the marker column is gone, so the name cell and everything under it start at the card's own 12px padding, and the x has its own 32px column (+8px) at the right.

| # | Card | Opens from | Code | Head | Number inside the name cell |
|---|---|---|---|---|---|
| 1 | Resource (software, rented, offering, channel-made; the Workspace is a Resource of the category Workspace) | Infrastructure / Offering's Capability: Resources | `BusinessCapabilityEditor.tsx` `resourceCard` -> `BusinessCard` | `.strategy-box-head` in `.card-box-open > .business-capability-slot` | yes |
| 2 | Activity | Activities | `BusinessCapabilityEditor.tsx` `activityRow` | `.business-capability-activity-head` | yes |
| 3 | Partner / Provider / Professional | Partners & Suppliers | `BusinessCapabilityEditor.tsx` `partnerCard` -> `BusinessCard` | as 1 | yes |
| 4 | Offering delivery | Offering's Capability: Delivery | `BusinessCapabilityEditor.tsx` `deliveryCard` | as 1 (name is plain text, no x) | yes |
| 5 | Founder (Infrastructure) | Founders | `BusinessCapabilityEditor.tsx` `founderCard` | `.business-founder-open` (its own left edge: the marker column holds the bullets and numbers of its lists) | no: no name cell; its number and name are one line, content keeps the marker edge |
| 6 | Channel / subchannel (LinkedIn, Instagram ...) | Customer Engagement: a channel's tile | `BusinessEngagementEditor.tsx` `subchannelHead` | `.business-subchannel-head` | yes |
| 7 | Segment: Profile, Competitor, Offering | Business Foundation tiles | `BusinessFoundationEditor.tsx` (via `BusinessCard`) | `.floating-card-body .column-tile-content > .business-foundation-card` | yes |
| 8 | Segment: Description, Value Proposition | Business Foundation tiles | same file | no head (the card is a section) | no head |
| 9 | Legal requirement | Legal Entity: Registrations | `LegalEntityEditor.tsx` `requirementCard` -> `BusinessCard` (`legal`) | `.legal-entity-card-head` | yes |
| 10 | Legal expense | Legal Entity: Expenses | `LegalEntityEditor.tsx` (expense card) -> `BusinessCard` (`legal`) | as 9 | yes |
| 11 | Founders' profile | Identity: Organization, a founder's tile | `FoundersProfileEditor.tsx` -> `BusinessCard` (`legal`) | as 9 (name is plain text, no x) | yes |
| 12 | Brand colour | Brand: Colours | `BrandStyleEditor.tsx` `colourCard` | `.brand-style-card` | yes |
| 13 | Brand typeface | Brand: Typography | `BrandStyleEditor.tsx` `typefaceCard` | as 12 | yes |
| 14 | Brand image | Brand: Brand Images | `BrandInventoryEditor.tsx` `imageCard` -> `BusinessCard` | as 12 (name cell with the number inside, the x at the right; under it the picture across the card, then its words) | yes |
| 15 | Strategy: Theme, Goal, Objective, Metric | Strategy System: Strategic Period | `StrategicPeriodEditor.tsx` (`NumberedName`) | `.strategy-box-head` | yes (the model for the others) |
| 16 | Strategy: Initiatives | inside an Objective | `StrategicPeriodEditor.tsx` | a box with a list, not a card | no head |

Not cards (page frames with a fold arrow): the Financial page's numbered sections (`FinancialSectionCard`), the Segment frame's head, Customer Relationship's table bands.

The parts are shared (design document 23): `BusinessCard` draws a card (its box `CardShell`, head `CardHead`, name `NameCell`, number `CardNumber`); the number keeps its kind's class (`.legal-entity-card-number`, `.strategy-box-number`) and is placed over the name by the rules of `section-tiles/` ("THE ORDER NUMBER STANDS INSIDE THE NAME CELL"). The Strategy boxes' heads and the sub-channel's head stay their own, on purpose. A new kind of card takes one of these heads. A card of a completed activity is the Completed grey wherever it stands (layout rules, 36).
