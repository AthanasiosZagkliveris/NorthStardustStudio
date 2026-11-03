# 33. Specs and limitations: the first published version, and what is left for later (owner, 2026-10-29)

Status: **specification**, written 2026-10-29, updated 2026-11-02, as given by the owner. What the first published version of the app contains and what it does not. The owner's items are written as given; the assistant's checks against the app, doc 28 and doc 31 are marked **Check** and are for the owner to confirm. The Organization tile, Early Positioning and the Segment card follow it (section 8); the Profile card is built in part (doc 36). What the first version leaves out is in sections 10 to 15 (the future features: **all other existing information is a future feature**; nothing there is scheduled; items already built stay in the code, hidden or unused, and are not deleted; they were document 33 until 2026-11-02, a living list).

Related: doc 28 (questionnaire specification), doc 31 (positioning categories), doc 32 (sources), `docs/README.md` (contents), `docs/index.md` (index) and `docs/app/glossary.md` (glossary).

**Contents**

- [1. The scope at a glance](#1-the-scope-at-a-glance)
- [2. Language](#2-language)
- [3. Countries, legal forms, activities and codes](#3-countries-legal-forms-activities-and-codes)
- [4. Market structure and relationships](#4-market-structure-and-relationships)
- [5. The buyer: category and life stage are two separate things](#5-the-buyer-category-and-life-stage-are-two-separate-things)
- [6. Ages](#6-ages)
- [7. Limits that already stand (from earlier owner decisions)](#7-limits-that-already-stand-from-earlier-owner-decisions)
- [8. Built on 2026-10-29](#8-built-on-2026-10-29)
- [9. Open points of the first version](#9-open-points-of-the-first-version)
- [10. Product scope](#10-product-scope)
- [11. Buyer and user (positioning)](#11-buyer-and-user-positioning)
- [12. Research still to do](#12-research-still-to-do)
- [13. Rule for this list](#13-rule-for-this-list)
- [14. Heavy, public and institutional options (moved from doc 31 and the app, 2026-10-30)](#14-heavy-public-and-institutional-options-moved-from-doc-31-and-the-app-2026-10-30)
  - [14.1 Government and public-sector relationships](#141-government-and-public-sector-relationships)
  - [14.2 Government-to-business relationships](#142-government-to-business-relationships)
- [15. Thoughts (evaluated, not decided, not scheduled; owner's review of the Segment, 2026-11-01)](#15-thoughts-evaluated-not-decided-not-scheduled-owners-review-of-the-segment-2026-11-01)

## 1. The scope at a glance

| Area | First published version |
|---|---|
| Language | **English only** |
| Countries | The **six named countries** (UK, Ireland, USA, Canada, Australia, New Zealand) and **Other**, which is any country outside those six |
| Legal form | The six countries: each country's **own complete list**. Other: **four generic forms** |
| Activities and codes | The six countries: each country's **complete list with its codes**. Other: the user **types the activity and the code** |
| Market structure | **Single-sided only** |
| Seller and buyer relationship | **B2C and/or B2B** only |
| Buyer | The **buyer's category** is separate from the **buyer's life stage** |
| Ages | Placed in the **Segment**, and maybe as an "i" |

## 2. Language

English only, and **UK English** (owner, 2026-11-03: organisation, centre, specialised, behaviour), whatever the country; there is no language or spelling switch. Every label, tooltip, document and export is in English. The saved keys keep their spelling (`organization`). (Earlier owner constraint, kept: the audience is early-stage, solo or small teams.)

## 3. Countries, legal forms, activities and codes

1. **Six countries:** United Kingdom, Ireland, United States, Canada, Australia, New Zealand. Each has a **complete list of legal forms** and a **complete list of activities with their related codes**, from the country's own scheme (doc 34, 5.3 and 5.8: the classification, its levels and the label of the code; rule 14 of doc 28 for the legal forms).
2. **Other** means **any country outside those six**. For Other:
   - the app user **types the activity and the related code manually**;
   - the **legal form** has four options (public company, nonprofit and cooperative forms are left out: doc 33, section 14):
     1. Sole Proprietorship
     2. General Partnership
     3. Private Limited Company (LLC / Ltd / GmbH)
     4. Limited Liability Partnership (LLP)

**Check, for the owner:**
- **Settled while building (section 8):** the country picker lists the six countries and Other; Other opens a second list of every other country, and the legal form is one of the four generic forms.
- **Do the six countries' built legal-form lists count as "complete"?** The lists in the code are the ones the owner's rule 14 allows only from official documents; whether each is complete and sourced for the six countries has not been re-checked here.
- **The four generic forms are the owner's own list** (not from an official document), allowed because Other has no official source. Option 3 names several countries' forms in one option; the documents that follow the legal form (the "limited company" phrase, capital, registration authority) would follow the option for Other.
- **General Partnership** is new on the list in this form; the built lists name partnership forms per country.

## 4. Market structure and relationships

1. **Single-sided only.** The Market Structure question (I11) has no Multi-sided option in the first version.
2. **B2C and/or B2B only.** The Seller and Buyer Relationship question (I3) offers B2C and B2B; **B2G and G2B are left out** (their information is in doc 33, section 14).

**Check:** what this makes unnecessary in doc 28 8.2: the anchor-side rule and the "side:outcome" per-side answers (no sides), the audience lists for B2G (Administrative Level) and G2B (Regulatory Intensity), the locked audiences (Central Government and Ministries; Heavily Regulated Markets), and the public-sector and government-to-business relationships of doc 31 sections 6.3 and 6.4. The stage limits (1, 1, 2, any) still apply to B2C and B2B. The built app has these options; they are hidden in the first version, not deleted (doc 33).

## 5. The buyer: category and life stage are two separate things

The buyer's category no longer sits inside the life-stage list.

**Buyer's category** (what the buyer buys for):
1. **Direct Buyers**: purchasing exclusively for their own personal use.
2. **Proxy Buyers**: purchasing exclusively on behalf of someone else.
3. **Dual-Intent Buyers**: purchasing a single offering to be used by themselves **and** their dependents.

**Buyer's life stage** (B2C):
1. Students / Young Adults
2. Workers / Professionals
3. Seniors

**Shown only for Proxy Buyers or Dual-Intent Buyers (a filter):**

**1. Buyer & End User relationships**, by the relationship model chosen:

| B2C (personal) | B2B (business) |
|---|---|
| Parent or guardian | Employer |
| Caregiver | Business partner |
| Family member | Business serving clients |
| Spouse or partner | Professional intermediary |
| Friend or acquaintance | Sponsor or funder |
| Commercial & Professional (a proxy buyer; added 2026-10-30) | |
| Other | Other |

The B2B list is the six business relationships of doc 31 section 6.2, each with the owner's description of how it positions (doc 31 section 10.6). They split into **Proxy archetypes** (Employer; Professional intermediary; Sponsor or funder; Other, for example a franchise owner buying for franchise operators) and **Dual-Intent archetypes** (Business partner; Business serving clients).

**2. User's life stage (B2C):**
1. Minors
2. Young Adults
3. Adults
4. Seniors

**Then:** Purpose, Differentiation, Outcome. (The owner's list was sent unfinished; see the checks.)

**What the End User block holds in the first version:** the relationship and, for B2C, the user's life stage. The questions "who chooses" (I7f) and "what matters most to the User" (I7g), the routing into the second Profile's ticks, and everything else collected about the End User are **future features** (doc 33).

**Check, for the owner:**
1. **This replaces the I7b design of doc 31 decision 19.** There the life-stage list had five options, with Proxy and Dual-Intent among them. Now **I7b keeps three life-stage options** and **the category is a separate question**. The End User block is shown by the category.
2. **The life-stage list no longer holds "Proxy Buyers / Gifters"** (section 8): an older saved answer is read in the new form and the buyer's category is asked again.
3. **The user's life stage has four coarse groups** with no age edges given. Minors is read as under 18 and Seniors as 65 and over (which includes the Dependent seniors of 75 and over). Do the four replace the detailed stages of doc 31 section 1 or group them? Not stated.
4. **B2B users have no life stage.** The user's life stage is read as B2C only; for B2B the relationship is the only End User item.
5. **The buyer's category for B2B:** the archetypes of section 10.6 suggest a category for each relationship (Proxy or Dual-Intent); as decided in doc 31 decisions 8 to 10, the relationship only **suggests** it and the buyer's own answer governs.
6. **Purpose, Differentiation and Outcome are three items** (settled 2026-10-30: the owner asked for the Differentiation to be separate from the Outcome, the Differentiation focused on the offering, and for a different outcome for the buyer and the user where the buyer is a Proxy or Dual-Intent Buyer). Purpose uses the 12 purposes of doc 31 section 7; Differentiation keeps the owner's four words, with two more added the same day (section 8: six in all); the Outcome for the buyer is the four results those words name; the Outcome for the user is the six answers of the former "what matters most to the End User".

## 6. Ages

**Ages are placed in the Segment, and maybe as an "i"** (owner). Read as the age information collected in docs 30 and 31, shown on the Segment card (Business 1) and possibly in an "i" beside the relevant answer.

**Check, for the owner:**
- **Which ages?** Three kinds exist: the **legal ages by activity and country** (doc 30: alcohol, tobacco, gambling and so on), the **legal ages for a buyer** (majority, consent, credit; doc 31 section 10.2), and the **life-stage age ranges** (doc 31 section 1; the Segment's age range G6 already exists). The first two were requirements R-1 (Organization card) and R-2 (Positioning card) of doc 31 section 9; they now move to the Segment. Read here as **all three, shown on the Segment**, with the legal ones applied from the customers' country automatically.
- **Where, exactly:** a line in the Segment card, an "i", or both is not decided.

## 7. Limits that already stand (from earlier owner decisions)

- Smallest supported width is 768 px; the app aims at WCAG 2.2 AA.
- Sources follow rule 14 (doc 28): classifications from official bodies, plain lists from business-school or university documents.

## 8. Built on 2026-10-29

The Organization tile and the Early Positioning tile of the app follow this document. What was built, and how the open readings of section 3 to 5 were settled while building (each can be changed):

**Organization tile**
- **Country:** the picker lists the six countries and "Other". "Other" opens a second list, "Other country", of every other country (so the currency and the tax wording still follow the country). The six keep their legal forms, their classification and their registration data.
- **Legal form:** the six countries keep their own lists; every other country has the four generic forms (`GENERIC_LEGAL_FORMS`, `src/framework/engine/LegalEntityJurisdictions.ts`); the list has no "Other" entry.
- **Activities:** for the six countries the official classification (up to four activities); for Other each activity is typed with its code (an "Activity" box and a "Code" box in each row, up to four rows).

**Early Positioning tile**
- **Market Structure** is not asked (single-sided). **Seller and Buyer Relationship** offers B2C and B2B only. The built B2G, G2B and multi-sided features stay in the code and are hidden; an older answer that holds them is read without them.
- **Buyer's Life-Stage** (B2C) has three options; **Audience Specialisation & Scale** (B2B) is unchanged. **Buyer's category** (Direct, Proxy, Dual-Intent) is asked for each relationship chosen, one choice.
- For a Proxy or Dual-Intent Buyer: **Buyer & End User relationship** (the six personal ones and the Commercial & Professional one for B2C, the six business ones for B2B) and, for B2C only, **End User's Life-Stage** (Minors, Young Adults, Adults, Seniors).
- **Purpose** (the twelve purposes) is asked once, with the same limit as the outcome. **Differentiation** (Cost-driven; Convenience-driven; Compliance, Risk & Security; Status & Premium; and, added 2026-10-30, Performance & Innovation; Ecosystem & Integration) is about the offering. **Outcome** (Lower costs; Time saved; Legal & data-protection cover; Higher quality & prestige) is the buyer's result, and where some buyer is a Proxy or Dual-Intent Buyer it is asked as "Outcome for the buyer" beside an **Outcome for the user** (Enjoyment & fun; Comfort & ease; Safety & care; Learning & growth; Looks & belonging; Practical use). The lists of the outcomes are made from the words of the former question (the results it named) and of the former "what matters most"; confirm or send your own.
- **Only the relationships that fit the category are offered** (2026-10-30): a Proxy Buyer is not offered the Spouse or partner; a Dual-Intent Buyer is not offered the Friend or acquaintance or the Commercial & Professional; for a business buyer the proxy ones and the dual ones are told apart in the same way (doc 31, 10.7).
- **A radio reacts under the pointer as a tick box does** (its words underlined, the round's glow ring): doc 18 and the rulebook.
- "Who chooses" and "what matters most to the End User" are no longer asked (future features).

**Arranged on 2026-10-30:** the Early Positioning tile has two columns. Left, every question before the Purpose: the Seller and Buyer Relationship and, for each relationship, its audience (Buyer's Life-Stage or Audience Specialisation & Scale), its Buyer's category and the End User (the buyer and user relationship, the user's life stage). Right, the Purpose, the Differentiation and the Outcome. The **Purpose** options are ordered by relevance to the answers so far (the owner's tables, doc 31, 10.7: the buyer and user relationship, else the buyer's category, else the seller and buyer relationship); the purposes the tables call generally less directly relevant are not offered (2026-10-30; one already chosen stays).

**The Segment card (doc 35)** asks its choice questions, the age as a stage term, and describes the user of a Proxy or Dual-Intent buyer in a part of its own card. **The Profile card (doc 36)** asks the questions it can in part. **Not built:** anything that reads the category, the relationship or the purpose beyond the Segment (the reads in doc 35), and the Profile questions marked not built in doc 36.

**Saved answers:** an older answer is read in the new form: B2G, G2B and multi-sided answers drop; Proxy Buyers / Gifters in the life stage drops (the buyer's category is empty and is asked again); the End User ages fold into the four life stages (three under 18 are Minors, the older adults are Seniors), the relationships rel:parent, rel:family and rel:friend keep their ids, and who-chooses and what-matters-most go. The two example organizations carry a buyer's category and a purpose.

## 9. Open points of the first version

1. The owner's list was sent **unfinished** more than once. Anything after it is to be added here.
2. The checks of sections 3 to 6, in particular: the country picker; the four coarse life stages; whether B2B users have a life stage; Purpose, Differentiation and Outcome as three questions; which ages go in the Segment and where.

**Closed on 2026-10-30 (the owner: close the open points of the Positioning tile):** the Outcome lists (buyer and user) and the relationships offered for each category are approved as written; a purpose a table does not list is read from the next table; the master matrix stays a reference; no "Recommended" tag is added (doc 31, decision 38). Still future: the routing of the outcome for the user into the second Profile (doc 33, item 13).

**Left out on 2026-10-30 as heavy, public or late-stage institutional (the owner):** the **public company** legal forms (Public Limited Company, PLC, Public Company, Corp, AG) in every country list and in the generic forms; the **Nonprofit Corporation** (United States) and **Cooperative** (Canada) forms. They are listed in doc 33, section 14. A legal form already saved stays as the user's text. **The audience scale is not touched:** Audience Specialisation & Scale is the app user's audience (the customers of the business described, from Solopreneurs & Freelancers to Enterprise or Public Sector), a different thing from the app's own audience; the owner corrected the first reading on 2026-10-30.

**A change of country empties the dependent answers (2026-10-30):** the instant the Country changes to another value, the State (the subdivision) and the Address are emptied with the legal form, the activities and the registration numbers, so no address stays under another country's state or postcode. Choosing the same country again changes nothing.

**No "Other" in the Legal Form list (2026-10-30, the owner):** the Legal Form is one of the country's own forms, or one of the four generic forms for Other; the list has no "Other" entry and no free-text name beside it. A legal form saved earlier as "Other" shows with its typed name until the user chooses another.

## 10. Product scope

| # | Future feature | First version has | Described in | In the app today |
|---|---|---|---|---|
| 1 | Other languages | English only | doc 28 4.1 (wording rules) | English |
| 2 | Complete lists (legal forms, activities, codes) for more countries | Six countries; Other (any other country) with typed activity and code | doc 28 5 | Any country can be chosen; some have a profile, the rest a neutral one |
| 3 | Official legal forms, with sources, for countries beyond the six, in place of the four generic forms | Four generic forms for Other | doc 28 rule 14 | Per-country lists in `LegalEntityJurisdictions.ts` |
| 4a | Heavy, public or late-stage institutional legal forms: the public company forms; the Nonprofit Corporation (US) and Cooperative (Canada) forms | Left out | section 14 below | Removed from the app |
| 4 | Other classification schemes and a general crosswalk (ISIC) | The six countries' own schemes; Other typed by hand | doc 34 5.3, 5.8 | Built for the six countries |
| 5 | Multi-sided markets and platforms: sides, one Segment per side, Differentiation and Outcome per side, the anchor-side rule | Single-sided | doc 28 8.2 | Built and hidden (the Market Structure question is not asked) |
| 6 | B2G: public-sector buyers, Administrative Level audience, the institutional relationships | B2C and/or B2B | doc 28 8.2; section 14.1 | Built and hidden |
| 7 | G2B: government-to-business, Regulatory Intensity audience, locked audiences, procurement and tender rows, payment-delay notices | B2C and/or B2B | doc 28 8.2; section 14.2 | Built and hidden |

## 11. Buyer and user (positioning)

| # | Future feature | Described in |
|---|---|---|
| 8 | The finest life stages (Infancy through Late Adolescence) beyond the seven age terms the Segment asks, which follow the edge rule "from X up to but not including Y" | doc 31 1, 2, section 10.1; doc 35 |
| 9 | The Micro-Buyers (16 to 18) as a restricted sub-category of Direct Buyers | doc 31 2, decision 5 |
| 10 | The public-sector and government-to-business buyer and user relationships (the other ten of the 22) | section 14; doc 31 decision 18 |
| 11 | The positioning guidance of each B2B relationship (value positioning, buyer and user pain points, messaging focus) as tooltips or text | doc 31 section 10.6 |
| 12 | "Who chooses" (I7f) with its household wording (removed from the app); "what matters most to the User" (I7g) is now the Outcome for the user (2026-10-30) | doc 31 section 10.3, decisions 20 to 22 |
| 13 | The routing of the End User answers into the second Profile: age, P25 relationship, P21 role, P9 and P17 ticks | doc 31 section 10.3, decision 18, decisions 20 to 22 |
| 14 | The relationship-to-purpose table (22 rows, 12 purposes) as tooltips and ordering of the purpose list | doc 31 section 10.4 |
| 15 | Accessibility questions (permanent, temporary, situational; functional categories) saved as Profile tags (the Profile's A6, not built) | doc 31 3, decision 12; doc 36 |
| 16 | Caregiving questions (who is cared for, the role, the household) saved as Profile tags (the Profile's A6, not built) | doc 31 4, decision 12; doc 36 |
| 17 | The buyer-category rules beyond age: data separation, contract and liability flags, payment routing | doc 31 decision 27 |
| 18 | The caregiver override of privacy walls, decided by each country's law | doc 31 decision 9 |
| 19 | Review checks: a household plan's unit price against a single-user purchase option (O3); the exact syntax of the P25 field | doc 31 decisions 20 to 22 |

Age limits by activity and by buyer, which were listed here, are now in the first version, in the Segment (section 6).

## 12. Research still to do

| # | Item | Described in |
|---|---|---|
| 20 | Doc 30 gaps: the Irish statutes, the New Zealand bills (social media minimum age, Arms Act, online casino, TAB), the other Australian states, thin UK rows | doc 30 |
| 21 | Sources with no acceptable support: the stage names Established, Peak, Mature, Dependent seniors; Dual-Intent Buyers; the business and public relationship subtypes; four purposes; the childcare, eldercare and specialised care split | doc 32 |
| 22 | Re-opening the cited pages that refused automated reading, and the originals not opened | doc 32 section 4 |

## 13. Rule for this list

An item moves into sections 1 to 9 only when the owner says so. If the owner names a feature in sections 1 to 9 that is also listed here, sections 1 to 9 govern and the row is removed from this list.

## 14. Heavy, public and institutional options (moved from doc 31 and the app, 2026-10-30)

The audience scale (Enterprise or Public Sector included) is the app user's audience and **stays**; what is removed concerns the app user's own organisation.

The owner removed these from the first version; they are kept here until a later version brings them back.

**The legal forms** left out: Public Limited Company (PLC) and Public Company (Ltd) in the country lists, Public Limited Company (PLC / Corp / AG) among the generic forms, Nonprofit Corporation (United States) and Cooperative (Canada).

### 14.1 Government and public-sector relationships

| Relationship | Example |
|---|---|
| Public authority providing for employees | A local council purchases case-management software for its social workers. |
| Public authority providing for citizens or residents | A municipality funds access to a public transport service for residents. |
| Public authority providing for service recipients or beneficiaries | A government agency commissions vocational training for unemployed people. |
| Public authority acting through another institution or service provider | A government department funds a charity to deliver support services to vulnerable households. |
| Other institutional relationship | A public library purchases accessible reading software for its registered users. |

### 14.2 Government-to-business relationships

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

## 15. Thoughts (evaluated, not decided, not scheduled; owner's review of the Segment, 2026-11-01)

These came from a review of how the Segment's Box 4 and Box 5 answers could be read by the later parts. Only the reads that fit what the app has today are in doc 28 (6.3a, "Not built yet (the reads)"); the rest are kept here as thoughts, each with what it waits for. The rule they all follow: a tendency is shown as "tends to", orders or highlights, and never hides an option or sets a price (doc 28, rule 5).

| # | Thought | Why it is worth keeping | Waits for |
|---|---|---|---|
| 1 | **Persona archetype tags** on a Profile (for example "Trend-Driven Impulse Buyer"), compiled from Box 4 | A Profile can be summarised at a glance | A fixed list of archetypes in the owner's words; the app must not invent the names |
| 2 | **Competitor emphasis from Box 5, question 4**: Red Ocean raises differentiation and price comparison, Blue Ocean raises market education | It points the user to the work that matters | A place in the Competitor card; it highlights and orders, it does not add or remove rows |
| 3 | **Demand and capacity warning**: Box 5 size and trend against the capacity to deliver (a solo team with manual fulfilment) | A scaling bottleneck is seen early | The Capability page and the Review checks, which are held back while Planning and Launching |
| 4 | **"Why this is suggested" notice** on a page whose suggestions follow the Segment, with a way to see everything | The user knows why a list is ordered as it is | The owner's word on a new element (the notice and its switch) |
| 5 | **Journey auto-layout**: Awareness from Box 4 question 2, Consideration from question 6, Decision from questions 7 and 8 | The data already maps onto the three stages | A customer journey part; none is in the documents today |
| 6 | **Flags from the specialised needs of the Profile** (the accessibility needs and the caregiving roles moved there from the Segment, 2026-11-01): a solo or single-parent household raises a time-poverty and churn-risk note in a customer journey; sensory or physical needs raise a "compliance validation required" badge on an Offering | The needs of a Segment reach the parts that serve it | A customer journey part (none today) and a place on the Offering for the badge; they would highlight, never decide |
| 7 | **Reads of the working questions of Box 1 (3b to 3d)**: a frontline worker on shifts moves the journey's communication to asynchronous (SMS) and flags the drop-off of live calls; variable or performance-based income suggests pay-as-you-go or pause-and-resume terms in the Offering; a remote desk worker raises desktop and daytime channels | When they are free, how they are paid and where they are met decide how to reach and sell to them | A customer journey part, a recommendation place on the Offering and the channel order; each would only suggest, never hide or price (rule 5) |
| 8 | **Channel pins from the Profile's help wanted (D2)**: "They want to talk to a person" lifts live chat and phone support to the top of the channels; "They work it out themselves" lifts self-service | The channels the Profile needs come first | The Profile's questions and the channel order on page 2; it orders and highlights, never removes a channel |
| 9 | **A "baseline" helper on a new Profile**: a short bar saying the Segment's answers can start the Profile (the likely options ticked, for the user to keep or clear) | Saves the user typing what the Segment already says | The owner's word on a new element; the same starting values the design already plans (A1 within the group, C1 from the setting) without a bar |

**Dropped:** a pricing tip from "economic pressures" (it sets a price from a tendency, against rule 5) and examples such as named marketing sites in the channel list (the channel list the app already has is the only source).
