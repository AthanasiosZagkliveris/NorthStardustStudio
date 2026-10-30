# 34. Future features: everything that is not in the first published version (owner, 2026-10-29)

Status: **living list**, written 2026-10-29, updated 2026-10-29; not a plan. The owner's rule: **all other existing information is a future feature.** The first version is exactly what doc 33 says; every other collected, designed or built item below is deferred. Nothing here is scheduled. Items that are already built in the app stay in the code and are hidden or left unused in the first version; they are not deleted.

Related: doc 33 (the first version), docs 27 to 32 (where each item is described).

## 1. Product scope

| # | Future feature | First version has | Described in | In the app today |
|---|---|---|---|---|
| 1 | Other languages | English only | doc 28 4.1 (wording rules) | English |
| 2 | Complete lists (legal forms, activities, codes) for more countries | Six countries; Other (any other country) with typed activity and code | doc 28 5 | Any country can be chosen; some have a profile, the rest a neutral one |
| 3 | Official legal forms, with sources, for countries beyond the six, in place of the four generic forms | Four generic forms for Other | doc 28 rule 14 | Per-country lists in `LegalEntityJurisdictions.ts` |
| 4a | Heavy, public or late-stage institutional options: the audience scale Enterprise / Public Sector; the public company legal forms; the Nonprofit Corporation (US) and Cooperative (Canada) forms | Left out on 2026-10-30 | section 5 below | Removed from the app |
| 4 | Other classification schemes and a general crosswalk (ISIC) | The six countries' own schemes; Other typed by hand | doc 35 5.3, 5.8 | Built for the six countries |
| 5 | Multi-sided markets and platforms: sides, one Segment per side, Differentiation and Outcome per side, the anchor-side rule | Single-sided | doc 28 8.2 | Built and hidden since 2026-10-29 (the Market Structure question is not asked) |
| 6 | B2G: public-sector buyers, Administrative Level audience, the institutional relationships | B2C and/or B2B | doc 28 8.2; doc 34 5.1 | Built and hidden since 2026-10-29 |
| 7 | G2B: government-to-business, Regulatory Intensity audience, locked audiences, procurement and tender rows, payment-delay notices | B2C and/or B2B | doc 28 8.2; doc 34 5.2 | Built and hidden since 2026-10-29 |

## 2. Buyer and user (positioning)

| # | Future feature | Described in |
|---|---|---|
| 8 | The detailed life stages (Infancy through Late Adolescence; Young, Established, Peak, Mature, Active Retirees; Dependent seniors) with the edge rule "from X up to but not including Y", in place of the coarse groups | doc 31 1, 2, section 10.1 |
| 9 | The Micro-Buyers (16 to 18) as a restricted sub-category of Direct Buyers | doc 31 2, decision 5 |
| 10 | The public-sector and government-to-business buyer and user relationships (the other ten of the 22) | doc 34 section 5; doc 31 decision 18 |
| 11 | The positioning guidance of each B2B relationship (value positioning, buyer and user pain points, messaging focus) as tooltips or text | doc 31 section 10.6 |
| 12 | "Who chooses" (I7f) with its household wording (removed from the app on 2026-10-29); "what matters most to the User" (I7g) is now the Outcome for the user (2026-10-30) | doc 31 section 10.3, decisions 20 to 22 |
| 13 | The routing of the End User answers into the second Profile: age, P25 relationship, P21 role, P9 and P17 ticks | doc 31 section 10.3, decision 18, decisions 20 to 22 |
| 14 | The relationship-to-purpose table (22 rows, 12 purposes) as tooltips and ordering of the purpose list | doc 31 section 10.4 |
| 15 | Accessibility questions (permanent, temporary, situational; functional categories) saved as Profile tags | doc 31 3, decision 12, decision 12 |
| 16 | Caregiving questions (who is cared for, the role, the household) saved as Profile tags | doc 31 4, decision 12 |
| 17 | The buyer-category rules beyond age: data separation, contract and liability flags, payment routing | doc 31 decision 27 |
| 18 | The caregiver override of privacy walls, decided by each country's law | doc 31 decision 9 |
| 19 | Review checks: a household plan's unit price against a single-user purchase option (O3); the exact syntax of the P25 field | doc 31 decisions 20 to 22 |

Age limits by activity and by buyer, which were listed here, are now in the first version, in the Segment (doc 33 section 6).

## 3. Research still to do

| # | Item | Described in |
|---|---|---|
| 20 | Doc 30 gaps: the Irish statutes, the New Zealand bills (social media minimum age, Arms Act, online casino, TAB), the other Australian states, thin UK rows | doc 30 |
| 21 | Sources with no acceptable support: the stage names Established, Peak, Mature, Dependent seniors; Dual-Intent Buyers; the business and public relationship subtypes; four purposes; the childcare, eldercare and specialised care split | doc 32 |
| 22 | Re-opening the cited pages that refused automated reading, and the originals not opened | doc 32 section 4 |

## 4. Rule for this list

An item moves into doc 33 only when the owner says so. If the owner names a feature in doc 33 that is also listed here, doc 33 governs and the row is removed from this list.

## 5. Heavy, public and institutional options (moved from doc 31 and the app, 2026-10-30)

The owner removed these from the first version; they are kept here until a later version brings them back.

**The audience scale Enterprise / Public Sector** (multinationals or public bodies: multi-month sales and tender cycle, need for maximum security; 250 or more employees; "a public body" offered in the Segment). Its two columns of the owner's tables (doc 31, 10.7) were, as Direct / Dual then Proxy (● primary, ○ possible):

| Purpose | Enterprise / Public Sector: Direct / Dual | Enterprise / Public Sector: Proxy |
|---|---|---|
| Learning and Development | ● | ● |
| Health, Care and Wellbeing | ○ | ● |
| Gifting and Appreciation | ○ | ● |
| Entertainment and Enjoyment | ● | ○ |
| Social Connection and Relationships | ○ |  |
| Productivity and Efficiency | ● | ○ |
| Business Growth and Performance | ● |  |
| Creation and Expression | ○ |  |
| Everyday Needs and Convenience | ● | ● |
| Protection and Risk Reduction | ○ | ● |
| Compliance and Obligations | ○ | ● |
| Access and Social Support |  | ● |

| Differentiation | Enterprise / Public Sector: Direct / Dual | Enterprise / Public Sector: Proxy |
|---|---|---|
| Cost-driven |  | ○ |
| Convenience-driven | ● |  |
| Compliance, Risk & Security | ● | ● |
| Status & Premium | ● |  |
| Performance & Innovation | ● | ● |
| Ecosystem & Integration | ● | ● |

The owner's notes: Ecosystem & Integration is primary from Mid-Market up (large organisations want a tool that connects to their stacks); an Enterprise / Government Proxy buyer values Performance & Innovation (superior or proprietary features for large data volumes).

**The legal forms** left out: Public Limited Company (PLC) and Public Company (Ltd) in the country lists, Public Limited Company (PLC / Corp / AG) among the generic forms, Nonprofit Corporation (United States) and Cooperative (Canada).

### 5.1 Government and public-sector relationships

| Relationship | Example |
|---|---|
| Public authority providing for employees | A local council purchases case-management software for its social workers. |
| Public authority providing for citizens or residents | A municipality funds access to a public transport service for residents. |
| Public authority providing for service recipients or beneficiaries | A government agency commissions vocational training for unemployed people. |
| Public authority acting through another institution or service provider | A government department funds a charity to deliver support services to vulnerable households. |
| Other institutional relationship | A public library purchases accessible reading software for its registered users. |

### 5.2 Government-to-business relationships

These examples are slightly different because G2B often involves a government service or regulatory obligation rather than a conventional purchase.

| Relationship | Example |
|---|---|
| Government serving business owners or operators | A business owner uses a government portal to register a new company. |
| Government serving employees or authorised representatives | A company's authorised accountant submits employment records through a government portal. |
| Government providing regulatory or compliance services | A manufacturer uses a government system to submit mandatory safety documentation. |
| Government supporting or funding businesses | A small business applies for a government grant through an official funding portal. |
| Other institutional relationship | A business uses a government-provided export advisory service. |

**The relationships of the public sector and of government (rows 13 to 22 of the purpose table of doc 31 10.4, owner's marks, no source; ● primary, ○ possible)**

| # | Relationship | Learn & develop | Health & care | Gift & appreciation | Entertainment | Social connection | Productivity | Business growth | Creation | Everyday needs | Protection | Compliance | Access & support |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 13 | Public authority providing for employees | ● | ○ |  |  | ○ | ● |  |  | ○ | ● | ○ | ○ |
| 14 | Public authority providing for citizens or residents | ● | ● |  | ● | ● | ○ |  | ○ | ● | ○ | ○ | ● |
| 15 | Public authority providing for service recipients or beneficiaries | ● | ● |  | ○ | ● | ○ |  |  | ● | ○ | ○ | ● |
| 16 | Public authority acting through another institution or service provider (new row) | ○ | ○ |  |  |  | ● |  |  | ○ | ● | ● | ● |
| 17 | Other institutional relationship (public sector) (new row) | ○ | ○ |  | ○ | ○ | ● |  | ○ | ● | ● |  | ● |
| 18 | Government serving business owners or operators |  |  |  |  |  | ● | ● |  | ○ | ● | ● | ● |
| 19 | Government serving employees or authorised representatives (new row) |  |  |  |  |  | ● | ○ |  |  | ○ | ● | ○ |
| 20 | Government providing regulatory or compliance services (new row) |  |  |  |  |  | ○ |  |  |  | ● | ● |  |
| 21 | Government supporting or funding businesses (new row) | ○ |  |  |  |  | ○ | ● |  |  |  | ● | ● |
| 22 | Other institutional relationship (government to business) (new row) |  |  |  |  |  | ● | ● |  |  | ● | ● | ○ |

And, from the first collection (section 8 of doc 31), the four rows of the 15-row table:

| Buyer–user relationship | Learn & develop | Health & care | Gift & appreciation | Entertainment | Social connection | Productivity | Business growth | Creation | Everyday needs | Protection | Compliance | Access & support |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Public authority → employees | ● | ○ |  |  | ○ | ● |  |  | ○ | ● | ○ | ○ |
| Public authority → citizens | ● | ● |  | ● | ● | ○ |  | ○ | ● | ○ | ○ | ● |
| Public authority → beneficiaries | ● | ● |  | ○ | ● | ○ |  |  | ● | ○ | ○ | ● |
| Government → businesses | ○ |  |  |  |  | ● | ● |  | ○ | ● | ● | ● |

