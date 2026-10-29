# 34. Future features: everything that is not in the first published version (owner, 2026-10-29)

Status: **list, not a plan.** The owner's rule: **all other existing information is a future feature.** The first version is exactly what doc 33 says; every other collected, designed or built item below is deferred. Nothing here is scheduled. Items that are already built in the app stay in the code and are hidden or left unused in the first version; they are not deleted.

Related: doc 33 (the first version), docs 27 to 32 (where each item is described).

## 1. Product scope

| # | Future feature | First version has | Described in | In the app today |
|---|---|---|---|---|
| 1 | Other languages | English only | doc 28 4.1 (wording rules) | English |
| 2 | Complete lists (legal forms, activities, codes) for more countries | Six countries; Other (any other country) with typed activity and code | doc 28 5 | Any country can be chosen; some have a profile, the rest a neutral one |
| 3 | Official legal forms, with sources, for countries beyond the six, in place of the five generic forms | Five generic forms for Other | doc 28 rule 14 | Per-country lists in `LegalEntityJurisdictions.ts` |
| 4 | Other classification schemes and a general crosswalk (ISIC) | The six countries' own schemes; Other typed by hand | doc 28 5.3, 5.8 | Built for the six countries |
| 5 | Multi-sided markets and platforms: sides, one Segment per side, Differentiation and Outcome per side, the anchor-side rule | Single-sided | doc 28 8.2 | Built (Market Structure option) |
| 6 | B2G: public-sector buyers, Administrative Level audience, the institutional relationships | B2C and/or B2B | doc 28 8.2; doc 31 6.3 | Built |
| 7 | G2B: government-to-business, Regulatory Intensity audience, locked audiences, procurement and tender rows, payment-delay notices | B2C and/or B2B | doc 28 8.2; doc 31 6.4 | Built |

## 2. Buyer and user (positioning)

| # | Future feature | Described in |
|---|---|---|
| 8 | The detailed life stages (Infancy through Late Adolescence; Young, Established, Peak, Mature, Active Retirees; Dependent seniors) with the edge rule "from X up to but not including Y", in place of the coarse groups | doc 31 1, 2, 9B |
| 9 | The Micro-Buyers (16 to 18) as a restricted sub-category of Direct Buyers | doc 31 2, 9F 5 |
| 10 | The public-sector and government-to-business buyer and user relationships (the other ten of the 22) | doc 31 6.3, 6.4, 9G, 9I |
| 11 | The positioning guidance of each B2B relationship (value positioning, buyer and user pain points, messaging focus) as tooltips or text | doc 31 9M |
| 12 | "Who chooses" (I7f) with its household wording, and "what matters most to the User" (I7g) | doc 31 9H, 9K |
| 13 | The routing of the End User answers into the second Profile: age, P25 relationship, P21 role, P9 and P17 ticks | doc 31 9H, 9I, 9K |
| 14 | The relationship-to-purpose table (22 rows, 12 purposes) as tooltips and ordering of the purpose list | doc 31 9G |
| 15 | Accessibility questions (permanent, temporary, situational; functional categories) saved as Profile tags | doc 31 3, 9C 4, 9F 7 |
| 16 | Caregiving questions (who is cared for, the role, the household) saved as Profile tags | doc 31 4, 9C 4 |
| 17 | The buyer-category rules beyond age: data separation, contract and liability flags, payment routing | doc 31 9F 4 |
| 18 | The caregiver override of privacy walls, decided by each country's law | doc 31 9E 2 |
| 19 | Review checks: a household plan's unit price against a single-user purchase option (O3); the exact syntax of the P25 field | doc 31 9K |

Age limits by activity and by buyer, which were listed here, are now in the first version, in the Segment (doc 33 section 6).

## 3. Research still to do

| # | Item | Described in |
|---|---|---|
| 20 | Doc 30 gaps: the Irish statutes, the New Zealand bills (social media minimum age, Arms Act, online casino, TAB), the other Australian states, thin UK rows | doc 30 |
| 21 | Sources with no acceptable support: the stage names Established, Peak, Mature, Dependent seniors; Dual-Intent Buyers; the business and public relationship subtypes; four purposes; the childcare, eldercare and specialised care split | doc 32 |
| 22 | Re-opening the cited pages that refused automated reading, and the originals not opened | doc 32 section 4 |

## 4. Rule for this list

An item moves into doc 33 only when the owner says so. If the owner names a feature in doc 33 that is also listed here, doc 33 governs and the row is removed from this list.
