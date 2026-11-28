# 4. Specs and limitations: the first published version, and what is left for later (owner, 2026-10-29)

Status: **specification**, written 2026-10-29, updated 2026-11-27 (sections 10, 11 and 15, the later features, moved to Guide 3), as given by the owner. What the first published version of the app contains and what it does not. The owner's items are written as given; the assistant's checks against the app, Questions 2 and Research 5 are marked **Check** and are for the owner to confirm. The Organisation tile, Early Positioning and the Segment card follow it (section 8); the Profile card is built in part (Questions 13). What the first version leaves out is in sections 10 to 15 (the future features: **all other existing information is a future feature**; nothing there is scheduled; items already built stay in the code, hidden or unused, and are not deleted; they were Questions 4 until 2026-11-02, a living list).

Related: Questions 2 (questionnaire specification), Research 5 (positioning categories), Research 6 (sources), `docs/README.md` (contents), `docs/index.md` (index) and `docs/app/03-glossary.md` (glossary).

**Contents**

- [1. The scope at a glance](#1-the-scope-at-a-glance)
- [2. Language](#2-language)
- [3. Countries, legal forms, activities and codes](#3-countries-legal-forms-activities-and-codes)
- [4. Market structure and relationships](#4-market-structure-and-relationships)
- [5. The buyer: category and life stage are two separate things](#5-the-buyer-category-and-life-stage-are-two-separate-things)
- [6. Ages](#6-ages)
- [7. Limits that already stand (from earlier owner decisions)](#7-limits-that-already-stand-from-earlier-owner-decisions)
- [8. What is built](#8-what-is-built)
- [9. Open points of the first version](#9-open-points-of-the-first-version)
- [10. Product scope](#10-product-scope)
- [11. Buyer and end user (positioning)](#11-buyer-and-end-user-positioning)
- [12. Research still to do](#12-research-still-to-do)
- [13. Rule for this list](#13-rule-for-this-list)
- [14. Heavy, public and institutional options (moved from Research 5 and the app, 2026-10-30)](#14-heavy-public-and-institutional-options-moved-from-research-5-and-the-app-2026-10-30)
  - [14.1 Government and public-sector relationships](#141-government-and-public-sector-relationships)
  - [14.2 Government-to-business relationships](#142-government-to-business-relationships)
- [15. Thoughts (evaluated, not decided, not scheduled; owner's review of the Segment, 2026-11-01)](#15-thoughts-evaluated-not-decided-not-scheduled-owners-review-of-the-segment-2026-11-01)

## 1. The scope at a glance

| Area | First published version |
|---|---|
| Language | **English only** |
| Countries | The **six named countries** (UK, Ireland, USA, Canada, Australia, New Zealand) and **Other**, which is any country outside those six |
| Legal form | The six countries: each country's **own complete list**. Other: **four generic forms** |
| Activities and codes | The six countries: each country's **complete list with its codes**. Other: the App User **types the activity and the code** |
| Market structure | **Single-sided only** |
| Seller and buyer relationship | **B2C and/or B2B** only |
| Buyer | The **buyer's category** is separate from the **buyer's life stage** |
| Ages | Age limits are checked on the **Offering** (O12) and the **Review** (Questions 16, O12) (not built yet) |

## 2. Language

English only, and **UK English** (owner, 2026-11-03: organisation, centre, specialised, behaviour), whatever the country; there is no language or spelling switch. Every label, tooltip, document and export is in English. The saved keys keep their spelling (`organization`). (Earlier owner constraint, kept: the audience is early-stage, solo or small teams.)

## 3. Countries, legal forms, activities and codes

1. **Six countries:** United Kingdom, Ireland, United States, Canada, Australia, New Zealand. Each has a **complete list of legal forms** and a **complete list of activities with their related codes**, from the country's own scheme (Research 3, 5.3 and 5.8: the classification, its levels and the label of the code; rule 14 of Questions 2 for the legal forms).
2. **Other** means **any country outside those six**. For Other:
   - the App User **types the activity and the related code manually**;
   - the **legal form** has four options (public company, nonprofit and cooperative forms are left out: Questions 4, section 14):
     1. Sole Proprietorship
     2. General Partnership
     3. Private Limited Company (LLC / Ltd / GmbH)
     4. Limited Liability Partnership (LLP)

**Checks** (all settled except the second, which stays open for the owner):
- **Settled while building (section 8):** the country picker lists the six countries and Other; Other opens a second list of every other country, and the legal form is one of the four generic forms.
- **Open: do the six countries' built legal-form lists count as "complete"?** The lists in the code are the ones the owner's rule 14 allows only from official documents; whether each is complete and sourced for the six countries has not been re-checked here.
- **Settled (built, section 8): the four generic forms are the owner's own list** (not from an official document), allowed because Other has no official source. Option 3 names several countries' forms in one option; the documents that follow the legal form (the "limited company" phrase, capital, registration authority) would follow the option for Other.
- **Settled (built, section 8): General Partnership** is new on the list in this form; the built lists name partnership forms per country.

## 4. Market structure and relationships

1. **Single-sided only.** The Market Structure question (I11) is not asked in the first version: every market is read as single-sided.
2. **B2C and/or B2B only.** The Seller and Buyer Relationship question (I3) offers B2C and B2B; **B2G and G2B are left out** (their information is in Questions 4, section 14).

**Check:** what this makes unnecessary in Questions 2 8.2: the anchor-side rule and the "side:outcome" per-side answers (no sides), the audience lists for B2G (Administrative Level) and G2B (Regulatory Intensity), the locked audiences (Central Government and Ministries; Heavily Regulated Markets), and the public-sector and government-to-business relationships of Research 5 sections 6.3 and 6.4. The stage limits still apply to B2C and B2B: one choice while Planning; one while Launching, except two for the Outcome, the Differentiation and the Purpose; two while Managing; any number while Growing. The built app has these options; they are hidden in the first version, not deleted (Questions 4).

## 5. The buyer: category and life stage are two separate things

The buyer's category is a question of its own, apart from the life-stage list.

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
| Commercial & Professional (a proxy buyer; added 2026-10-30) | Institution or membership body (Proxy or Dual-Intent; Research 5, decision 39) |

The B2B list is the business relationships of Research 5 section 6.2, each with the owner's description of how it positions (Research 5 section 10.6), and the Institution or membership body (Research 5, decision 39). They split into **Proxy archetypes** (Employer; Professional intermediary; Sponsor or funder) and **Dual-Intent archetypes** (Business partner; Business serving clients); the Institution or membership body is either. Each list holds named relationships only: an answer saved as "Other" still reads, opens its questions and shows until it is unticked (Research 5, decision 39).

**2. End user's life stage (B2C):**
1. Minors
2. Young Adults
3. Adults
4. Seniors

**Then:** Purpose, Differentiation, Outcome (settled 2026-10-30: check 6).

**What the End User block holds in the first version:** the relationship and, for B2C, the end user's life stage. The questions "who chooses" (I7f) and "what matters most to the User" (I7g), the routing into the second Profile's ticks, and everything else collected about the End User are **future features** (Questions 4).

**Checks** (all settled and built, section 8, except check 3, which stays open for the owner):
1. **This replaces the I7b design of Research 5 decision 19.** There the life-stage list had five options, with Proxy and Dual-Intent among them. Now **I7b keeps three life-stage options** and **the category is a separate question**. The End User block is shown by the category.
2. **The life-stage list holds the life stages alone; "Proxy Buyers / Gifters" is a buyer's category** (section 8): an older saved answer is read in the new form and the buyer's category is asked again.
3. **Open: the end user's life stage has four coarse groups** with no age edges given. Minors is read as under 18 and Seniors as 65 and over (which includes the Dependent seniors of 75 and over). Do the four replace the detailed stages of Research 5 section 1 or group them? Not stated.
4. **B2B end users have no life stage.** The end user's life stage is read as B2C only; for B2B the relationship is the only End User item.
5. **The buyer's category for B2B:** the archetypes of section 10.6 suggest a category for each relationship (Proxy or Dual-Intent); as decided in Research 5 decisions 8 to 10, the relationship only **suggests** it and the buyer's own answer governs.
6. **Purpose, Differentiation and Outcome are three items** (settled 2026-10-30: the owner asked for the Differentiation to be separate from the Outcome, the Differentiation focused on the offering, and for a different outcome for the buyer and the end user where the buyer is a Proxy or Dual-Intent Buyer). Purpose uses the 12 purposes of Research 5 section 7; Differentiation keeps the owner's four words, with two more added the same day (section 8: six in all); the Outcome for the buyer is the four results those words name; the Outcome for the end user is the six answers of the former "what matters most to the End User".

## 6. Ages

**Age limits are checked on the Offering (O12) and the Review (Questions 16, O12) (not built yet).** The owner's first item (2026-10-29) placed the ages in the Segment, maybe as an "i"; the Segment now asks the age terms (Questions 12, Box 1, question 1) and the app derives the legal age from the activities, the ages and the country.

**Checks** (settled):
- **Which ages?** Three kinds exist: the **legal ages by activity and country** (Research 4: alcohol, tobacco, gambling and so on), the **legal ages for a buyer** (majority, consent, credit; Research 5 section 10.2), and the **life-stage age ranges** (Research 5 section 1; the Segment's age terms, Questions 12, Box 1, question 1). The first two were requirements R-1 (Organisation card) and R-2 (Positioning card) of Research 5 section 9; they are checked on the Offering (O12) and the Review (Questions 16, O12) (not built yet), with the legal ones applied from the customers' country automatically.
- **Where, exactly:** a Review item and a read-only line on each of the Segment's Offerings (Questions 16, O12; not built yet).

## 7. Limits that already stand (from earlier owner decisions)

- Smallest supported width is 768 px; the app aims at WCAG 2.2 AA.
- Every keyboard shortcut pairs Ctrl (⌘ on Apple devices) with a key, so a single letter starts nothing (WCAG 2.1.4). On a Mac's web browser ⌘, opens the browser's own settings, so it opens Settings only in the installed app. The keys are in Interface 8, section 5.
- Sources follow rule 14 (Questions 2): classifications from official bodies, plain lists from business-school or university documents.

## 8. What is built

The tiles that follow this document are described as built in their own documents: Questions 7 (the Organisation tile), Questions 8 (the Early Positioning tile), Questions 12 (the Segment card) and Questions 13 (the Profile card, in part). The record of what was built on 2026-10-29 and 2026-10-30, and how the open readings of sections 3 to 5 were settled, is in the log (Records 1, section 4.1, row of 2026-10-29 to 2026-10-30).

## 9. Open points of the first version

1. Settled: the owner's list, sent unfinished more than once, is complete as far as it goes; the country picker is built (section 3) and Purpose / Differentiation / Outcome are three questions (2026-10-30, section 5, check 6). Anything new is added here.
2. Still open: whether the six countries' legal-form lists are complete (section 3, second check) and the four coarse life stages (section 5, check 3).

**Closed on 2026-10-30 (the owner: close the open points of the Positioning tile):** the Outcome lists (buyer and end user) and the relationships offered for each category are approved as written; a purpose a table does not list is read from the next table; the master matrix stays a reference; no "Recommended" tag is added (Research 5, decision 38). Still future: the routing of the outcome for the end user into the second Profile (Guide 3, section 8.2, item 13).

**Left out on 2026-10-30 as heavy, public or late-stage institutional (the owner):** the **public company** legal forms (Public Limited Company, PLC, Public Company, Corp, AG) in every country list and in the generic forms; the **Nonprofit Corporation** (United States) and **Cooperative** (Canada) forms. They are listed in Questions 4, section 14. A legal form already saved stays as the App User's text. **The audience scale is not touched:** Audience Specialisation & Scale is the App User's audience (the customers of the business described, from Solopreneurs & Freelancers to Enterprise or Public Sector), a different thing from the app's own audience; the owner corrected the first reading on 2026-10-30.

**A change of country empties the dependent answers (2026-10-30):** the instant the Country changes to another value, the State (the subdivision) and the Address are emptied with the legal form, the activities and the registration numbers, so no address stays under another country's state or postcode. Choosing the same country again changes nothing.

**No "Other" in the Legal Form list (2026-10-30, the owner):** the Legal Form is one of the country's own forms, or one of the four generic forms for Other; the list has no "Other" entry and no free-text name beside it. A legal form saved earlier as "Other" shows with its typed name until the App User chooses another.

## 10. Product scope

Moved to Guide 3 (`../../guide/03-future-features.md`), section 8.1, on 2026-11-27, with its item numbers: everything after Version 1 is in one document.


## 11. Buyer and end user (positioning)

Moved to Guide 3 (`../../guide/03-future-features.md`), section 8.2, on 2026-11-27, with its item numbers: everything after Version 1 is in one document.

Age limits by activity and by buyer, once listed here, are in the first version: they are checked on the Offering (O12) and the Review (Questions 16, O12; section 6) (not built yet).


## 12. Research still to do

| # | Item | Described in |
|---|---|---|
| 20 | Research 4 gaps: the Irish statutes, the New Zealand bills (social media minimum age, Arms Act, online casino, TAB), the other Australian states, thin UK rows | Research 4 |
| 21 | Sources with no acceptable support: the stage names Established, Peak, Mature, Dependent seniors; Dual-Intent Buyers; the business and public relationship subtypes; four purposes; the childcare, eldercare and specialised care split | Research 6 |
| 22 | Re-opening the cited pages that refused automated reading, and the originals not opened | Research 6 section 4 |

## 13. Rule for this list

An item of the later list (Guide 3, section 8) moves into sections 1 to 9 only when the owner says so; sections 1 to 9 then govern and the row leaves Guide 3. The work the first version still needs is in the to-do list (Records 2).

## 14. Heavy, public and institutional options (moved from Research 5 and the app, 2026-10-30)

The audience scale (Enterprise or Public Sector included) is the App User's audience and **stays**; what is removed concerns the App User's own organisation.

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

These examples differ a little: G2B often involves a government service or a regulatory obligation, where B2B is a conventional purchase.

| Relationship | Example |
|---|---|
| Government serving business owners or operators | A business owner uses a government portal to register a new company. |
| Government serving employees or authorised representatives | A company's authorised accountant submits employment records through a government portal. |
| Government providing regulatory or compliance services | A manufacturer uses a government system to submit mandatory safety documentation. |
| Government supporting or funding businesses | A small business applies for a government grant through an official funding portal. |
| Other institutional relationship | A business uses a government-provided export advisory service. |

**The relationships of the public sector and of government (rows 13 to 22 of the purpose table of Research 5 10.4, owner's marks, no source; ● primary, ○ possible)**

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

The first collection's four public rows (Research 5, section 8) are rows 13, 14, 15 and 18 above; the one difference (row 18's Learn & develop) is noted in Research 5, 10.4. Rows 1 to 12 are in Research 5, 10.4.

## 15. Thoughts (evaluated, not decided, not scheduled; owner's review of the Segment, 2026-11-01)

Moved to Guide 3 (`../../guide/03-future-features.md`), section 8.3, on 2026-11-27, with its item numbers: everything after Version 1 is in one document.

