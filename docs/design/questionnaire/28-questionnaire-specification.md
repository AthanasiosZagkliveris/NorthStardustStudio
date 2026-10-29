# 28. Questionnaire specification: lists, questions, connections and evidence

Status: **proposal, with parts built.** Revised 2026-10-23 (it replaces the earlier drafts `27-questionnaire-plan.md` and `28-business-pages-structure.md` of 2026-10-22, merged here, and is now the specification that goes with `27-questionnaire-plan.md`). **Built** (marked "as built" or "built" where described): the Organization tile with its activity cascade (doc 35, 5.7 to 5.10, 8.5), the business stage and key dates (8.2a), the Early Positioning questions with the End User questions (8.2), the Legal Entity page (8.5), and the Segment's reading of I3 and I7b (8.2, "What the Segment will read"). **Not built:** everything else (the shared lists as fields, the industry pack, the Segment, Profile, Competitor and Offering questions, the journey, the price questions). The **plan** (the goal, the order, what is built when, what was cut and why) is document 27, and **the flow of the questions as trees** (which answer leads to which question, the key branches, both, mixed, not sure and other, the order) is document 29. This document holds the detail the plan points to: the shared lists with examples, the industry list in two levels, every question with its wording and options, how every characteristic connects to the rest of the app and on what evidence, and the moves and decisions. Decisions for the owner are marked **[D]** and collected in section 13 (which also holds the decisions of documents 27 and 29). The counts of questions, drivers, checks and notes are held only in Appendix B. Where the code and this document disagree, the code is right. The sources are in `02-references.md`, section 2.7, and are cited here by id (for example `DIG-14`).

> **First published version (owner, 2026-10-29):** English only; UK, Ireland, USA, Canada, Australia, New Zealand and Other; single-sided; B2C and/or B2B; the buyer's category separate from the buyer's life stage. **Doc 33 governs** where it differs from this document. Everything described here that the first version does not contain (B2G, G2B, multi-sided markets, other countries, age limits, accessibility, caregiving and the rest) is a future feature: doc 34. Contents of the documents: `docs/README.md`; index: `docs/index.md`; glossary: `docs/app/glossary.md`.

**Contents**

- [1. Summary](#1-summary)
- [2. What was read, and what was not](#2-what-was-read-and-what-was-not)
- [3. Rules for the changes](#3-rules-for-the-changes)
- [4. Plain wording](#4-plain-wording)
  - [4.1 Rules for writing our questions](#41-rules-for-writing-our-questions)
- [5. The countries and the shared lists](#5-the-countries-and-the-shared-lists)
  - [5.1 What differs by country](35-lists-and-classifications.md#51-what-differs-by-country)
  - [5.2 The shared lists](35-lists-and-classifications.md#52-the-shared-lists)
  - [5.3 The crosswalks (national schemes behind the plain lists)](35-lists-and-classifications.md#53-the-crosswalks-national-schemes-behind-the-plain-lists)
  - [5.4 Industries, level 2: the "more exactly?" list](35-lists-and-classifications.md#54-industries-level-2-the-more-exactly-list)
  - [5.5 Examples under the options](35-lists-and-classifications.md#55-examples-under-the-options)
  - [5.6 The industry pack: what a sub-industry gives the user](35-lists-and-classifications.md#56-the-industry-pack-what-a-sub-industry-gives-the-user)
  - [5.7 The activity cascade: levels, how many to pick, and what the data shows](35-lists-and-classifications.md#57-the-activity-cascade-levels-how-many-to-pick-and-what-the-data-shows)
  - [5.8 The code and the words: what the cascade ends on, and how each country names it](35-lists-and-classifications.md#58-the-code-and-the-words-what-the-cascade-ends-on-and-how-each-country-names-it)
  - [5.9 How many choices at each level (the sufficient numbers)](35-lists-and-classifications.md#59-how-many-choices-at-each-level-the-sufficient-numbers)
  - [5.10 The classification data](35-lists-and-classifications.md#510-the-classification-data)
- [6. Business 1 · Foundation: the customer model and the cards](#6-business-1--foundation-the-customer-model-and-the-cards)
  - [6.1 The owner's customer-segment text: analysis and what was adopted](#61-the-owners-customer-segment-text-analysis-and-what-was-adopted)
  - [6.2 The model: categories, groups and the questions that carry them](#62-the-model-categories-groups-and-the-questions-that-carry-them)
  - [6.3 Segment card (tile "Segment Description"): step 1, revised after the owner's review of 2026-10-23](#63-segment-card-tile-segment-description-step-1-revised-after-the-owners-review-of-2026-10-23)
  - [6.4 Profile card (cards nested in the same tile): a typical person, asked specifically](#64-profile-card-cards-nested-in-the-same-tile-a-typical-person-asked-specifically)
  - [6.5 The cascade: the Segment sets the range, the Profile chooses within it](#65-the-cascade-the-segment-sets-the-range-the-profile-chooses-within-it)
  - [6.6 Competitor card (tile "Competitors")](#66-competitor-card-tile-competitors)
  - [6.7 Tile "Value Proposition"](#67-tile-value-proposition)
  - [6.8 Offering card (tile "Offerings")](#68-offering-card-tile-offerings)
  - [6.9 Required answers (proposal)](#69-required-answers-proposal-d)
  - [6.10 Information the earlier files expect that has no field](#610-information-the-earlier-files-expect-that-has-no-field)
- [7. Business 2 · Customer Engagement, rebuilt as a journey](#7-business-2--customer-engagement-rebuilt-as-a-journey)
  - [7.1 Why it changes](#71-why-it-changes)
  - [7.2 Target structure (per Segment)](#72-target-structure-per-segment-d)
  - [7.3 Stage card](#73-stage-card)
  - [7.4 The proposals (rules; all suggestions the user can ignore)](#74-the-proposals-rules-all-suggestions-the-user-can-ignore)
  - [7.5 Demand card (one per Offering)](#75-demand-card-one-per-offering)
- [8. Identity · what to ask](#8-identity--what-to-ask)
  - [8.1 What exists (as built, 2026-10-25)](#81-what-exists-as-built-2026-10-25)
  - [8.2 The Positioning tile and the Identity questions](#82-the-positioning-tile-and-the-identity-questions)
  - [8.2a The business stage, the Opening Date and the key dates (as built, 2026-10-24 and 25)](#82a-the-business-stage-the-opening-date-and-the-key-dates-as-built-2026-10-24-and-25)
  - [8.3 Brand starting points from Identity (parked)](#83-brand-starting-points-from-identity-parked)
  - [8.4 Brand and Strategy: the rest](#84-brand-and-strategy-the-rest)
  - [8.5 The Organization tile (page 1): layout](#85-the-organization-tile-page-1-layout)
  - [8.6 The wording of the Organization tile](#86-the-wording-of-the-organization-tile)
- [9. Founders and Capability](#9-founders-and-capability)
  - [9.1 Three founder places today](#91-three-founder-places-today)
  - [9.2 Target](#92-target-d)
  - [9.3 The new questions](#93-the-new-questions)
  - [9.4 What the skill areas are, and why](#94-what-the-skill-areas-are-and-why)
- [10. Business 3 (Delivery) and Business 5 (price)](#10-business-3-delivery-and-business-5-price)
  - [10.1 Delivery card](#101-delivery-card)
  - [10.2 Revenue stream card (page 5)](#102-revenue-stream-card-page-5)
  - [10.3 Minimum ages to buy, by product and country (O12)](#103-minimum-ages-to-buy-by-product-and-country-o12)
- [11. The connection map](#11-the-connection-map)
  - [11.1 The kinds of connection, and what the app does](#111-the-kinds-of-connection-and-what-the-app-does)
  - [11.2 The eleven connections of the owner's text](#112-the-eleven-connections-of-the-owners-text)
  - [11.3 The owner's data-flow claims, one by one](#113-the-owners-data-flow-claims-one-by-one)
  - [11.4 What the evidence shows, by characteristic and band](#114-what-the-evidence-shows-by-characteristic-and-band)
  - [11.5 The rules the evidence supports (what the app does: 28 rules)](#115-the-rules-the-evidence-supports-what-the-app-does-28-rules)
  - [11.6 What is not built, because the evidence does not support it](#116-what-is-not-built-because-the-evidence-does-not-support-it)
  - [11.7 What an answer changes elsewhere (the earlier table, kept)](#117-what-an-answer-changes-elsewhere-the-earlier-table-kept)
- [12. Sensitive characteristics and equality](#12-sensitive-characteristics-and-equality)
- [13. Rebuilds, moves and decisions](#13-rebuilds-moves-and-decisions)
- [14. Order of work](#14-order-of-work)
- [15. Evidence](#15-evidence)
- [Appendix A. What became of the question files' questions](#appendix-a-what-became-of-the-question-files-questions)
- [Appendix B. Driver, check or note: what each question saves](#appendix-b-driver-check-or-note-what-each-question-saves)
  - [The counts (the one place that holds them)](#the-counts-the-one-place-that-holds-them)

## 1. Summary

1. **One test for every question: does it save the founder work?** A question is kept as a **driver** when its answer produces a proposal: it pre-fills a field, proposes a card or a channel, drafts a text, or narrows a later list. A question that only raises a Review check is a **check**; a field that nothing reads stays a **note** and is not asked. Of the candidate questions, **67 remain numbered: 41 drivers, 21 checks, 4 notes and 1 parked** (the Brand question); the totals by area, and the ids withdrawn or merged, are in Appendix B, which is the one place that holds them. The plan (document 27) builds the drivers first.
2. **Target countries: the UK, USA, Canada, Australia, Ireland and New Zealand** (owner, 2026-10-23). Lists that depend on a country (industry, organisation size, education, urban or rural, tax, quoting prices) were checked against official sources of those six countries (section 5). **The UK and the EU have a new industry classification** (UK SIC 2026 and NACE Rev. 2.1, which move the section letters), so the industry list is keyed on divisions, not on letters (doc 35, 5.3).

**The letters of the ids** are labels, never shown to the user: **I** Identity; **G** the customer Group (the Segment card); **P** the Person (the Profile card); **K** the Competitor (C was taken by Capability); **O** the Offering; **L1 to L16** the shared **Lists** of doc 35, 5.2; **W** the Work of the Delivery card (it was L1 to L3, which clashed with the Lists, renamed 2026-10-25); **C** Capability and the founders; **R** the Revenue stream; **J** the customer Journey (the stage card); **D** the Demand card; **F** (FS, FC, FV, FO, FI, FD, FQ, FR) the ids of the earlier question files, Appendix A only.
3. **Identity is the entry point.** The Organization tile (what kind of work you do, in the levels of the country's classification; when it opens) and the Early Positioning tile (the market structure, who pays, the audience, what you compete on, each a choice beside its free text; 8.2) hold the answers meant to narrow every later list and to suggest examples (segments, offerings, skills, resources, channels). Business 1 reads them only in part so far (8.1, 8.2). Giving the Brand system starting points is parked by the owner (2026-10-23, section 8.3).
4. **The customer is a model, not a form** (the owner's customer-segment text, 6.1): six categories; a **Segment** takes ranges and a **Profile** takes specifics, **and the Profile can only choose within what the Segment allowed** (the cascade, 6.5); answers filter, reveal and suggest; an answer that changes an earlier one flags what depends on it instead of deleting it.
5. **Every characteristic is connected to the other parts, with evidence** (section 11). The result is 28 **rules the evidence supports**, a longer list of **rules it does not support** (so they are not built), and an **evidence line** the user can read beside each connection. Demographics connect to competitors only through what customers care about and where they look.
6. **A suggestion, a Review check or a help line, never a hidden option.** Tendencies from official statistics are shown as tendencies, with their source; no conversion rate, sales cycle or price limit is proposed, because no source supports one.
7. **The wording is plain and every option has an example** (sections 4, doc 35, 5.5). **One vocabulary in several places** (doc 35, 5.2): the "what customers care about" list is ticked by a Profile, chosen by an Offering, used for a competitor's strengths and for what you compete on.
8. **Customer Engagement is rebuilt as a journey** (section 7): one tile per stage, one card per channel, proposed from the Profile's and the Offering's answers. **Founders and capability** are one place with the gap derived (section 9).
9. **No new page.** Tiles and cards only, from existing components; a chapter may hold any number of tiles.

## 2. What was read, and what was not

**Read** (two read-only passes each, from the code): Business pages 1, 2, 3 and 5, the Identity System, the Founders Profile and the Business founder cards, the tile and card pattern and the shared components; the specifications of page 1, page 2 and the Offering's Capability part of page 3; the audience PDF, the two question files of 2026-10-15, and the owner's customer-segment text of 2026-10-23. **Research** (web, eleven passes, 2026-10-23, including an inventory of the Brand System and the industry classifications): official sources of the six countries on every list and connection in this document. Many official pages could not be opened by the research tool (ACCC, ATO, Ofcom, ACMA, several StatCan and CSO tables, NZQA, QQI, Stats NZ expenditure); those points rest on search excerpts and are marked in `02-references.md`, which also has a coverage table showing which country has what.

**Not read:** the Brand and Strategy editors in detail; the rest of the page 3 specification; the Financial editors beyond price and revenue; `layout-rules.md` in full; the tests; the jurisdiction option lists beyond their shape. Nothing was run in a browser. Lists marked "author's proposal" have no source and need the owner's approval.

## 3. Rules for the changes

1. **One owner per answer.** An answer is asked once, in the card that owns it; other places read it by id.
2. **Everything is a tile or a card.** A page is chapters of Master Tiles; a tile opens a dialog of cards; a card holds fields. A **chapter may hold fewer or more than four tiles** (owner, 2026-10-22).
3. **Existing components only** (`21-shared-components.md`). Legend: **Dropdown** = `OptionPicker` (one answer); **Radio** = `RadioChoice`; **Ticks** = `BusinessTicks` / `TickField` (several); **Number** = `NumberCell`; **Text** = `TextField` / `StrategyTextArea`; **List** = `NumberedListInput`. A shared control is never changed.
4. **Four behaviours, from the owner's text.** **Filter**: hide an option only when it is genuinely incompatible with an earlier answer, never because it is merely less common. **Reveal**: show a follow-up question when an answer makes it relevant. **Suggest**: offer a likely connection as a labelled suggestion the user can ignore. **Review dependencies**: when an earlier answer changes, keep the compatible answers and flag the dependent ones for review, never silently delete them. A preset hides, never deletes: a saved value in a hidden option stays and counts.
5. **Evidence rule.** A connection that is not logically certain is a *tendency*: it shows an evidence line with its source id and country, says "tends to", never says "is", and is never used to exclude, hide, price differently or fill in a number.
6. **Texts of the page 1 specification are used as written**; every new or changed label and option needs the owner's approval. A box that becomes a question keeps its title and gains an optional note.
7. **Tooltips** are one-line "Click to ..." sentences, only on pressed controls.
8. **After every change:** a browser check in three reading modes, `npm run check:layout` alone, `npm run check:console`, `npm run verify`, the examples in `src/data/examples/` (and goldens where figures move), a row in the log.
9. **Ask only what something reads.** A question is kept if a calculation, a suggestion, a draft or a Review item reads it.
10. "Not sure yet" ends every list that may be unknown, kept apart from "Not applicable". Numbers (price, volume, income, age, size) are never choice labels.
11. **Driver, check or note.** Every question is one of three (Appendix B): a driver produces a proposal, a check only raises a Review item, a note is not asked. The first release builds the drivers.
12. **Who they are is a range or one value; what they do is several.** A Segment is a narrow group: an ordered fact (age, education, size) is a range from one band to another, an unordered fact (work, industry, type) is one value, and more than that is another Segment. Several answers belong to what customers do or prefer, mostly in the Profile.
13. **Each fact is asked once, where it belongs.** A default (a country, a first Segment's answer) is not a second question; it is a starting value the user confirms. A field that only repeats another is not asked.

**Rule 14: lists come only from documents, never from the author** (the owner, 2026-10-23, repeated; refined 2026-10-24). **Where an input asks for a country's own classification (codes, names, categories: industries, legal forms, registers), the list is taken from the official document of a government, a statistics office, a regulator or a statute. Where it is only the options of a dropdown (how a business positions itself, how it wants to be seen), the list may come from the documents of a business school or university** (a faculty's own page, paper or published abstract). In both cases the list keeps that document's order and words, or it is the owner's own wording from this conversation. The author makes up no list and no category. **Audit:** most lists of doc 35, 5.2 are the author's and fail this rule: L1 (what customers care about), L2 (worries), L3 (frustrations), L4 (goals), L5 (skill areas), L7 (the 18 industries), L9 (age bands, a composite), L11, L13, L14, L15, and the option lists of O1, O3, I5, I9 and several Profile questions. Only L8, L10 and L12 follow statistics offices' own wording, and L6 follows the app. Each is to be replaced by an official list, the owner's wording, or dropped, tile by tile, after the Organization tile. The industry cascade (doc 35, 5.7 to 5.10), the legal forms (existing, by country) and the Stage question (I8) already follow this rule.

## 4. Plain wording

The wording follows these author's rules (no outside style guide was opened for them):

- Speak to "you" and say "they" for the customer; one idea per question; about twelve words or fewer.
- No jargon in a question or an option. "B2B" is "businesses or organisations"; "decision-maker" is "the person who makes the final decision"; "channel" is explained under the "i" as "a way you reach customers".
- Options are things a founder recognises, not categories from a statistics office. Where a national scheme exists it sits **behind** the option (the crosswalk), not in front of it.
- Every question has a one-line help under the "i" saying what the question is for. A connection that rests on evidence adds one evidence line ("Official statistics in the UK show ...", with the year and the source).
- A choice that is not for everyone offers "Not relevant" or "Not sure yet", never forces a guess.
- The owner approves the final wording of every question and option **[D]**.

### 4.1 Rules for writing our questions

From official survey and style guidance (sources in `02-references.md`, QST). Most were read; the gaps are stated there.

| Do | Source |
|---|---|
| **One idea per question**: no "and" or "or" joining two concepts | QST-01, QST-03 |
| **Answer options that do not overlap and cover everything**; test that a boundary value (for example 25) fits one band only | QST-01, QST-10, QST-14 |
| **Simple words**; spell out abbreviations | QST-01, QST-03 |
| **A logical order**: an inherent order where there is one (education, age, size); otherwise the most common option first; keep a list to about ten short options | QST-03 |
| **"Not sure" and "Not relevant" where they are valid**, looking different from the real options. "Prefer not to say" is for people answering about themselves; our founder describes a group, so we use "Not sure yet" and "Not relevant" | QST-03, QST-06 |
| **Single choice when one answer is expected**; several only when several can genuinely apply, with "Select all that apply" and "None" last | QST-12 |
| **"Other" last**, with a place to say what | QST-03 |
| **Ask only what we will use**: every question says what it is for | QST-06 |
| **Reuse an established wording** (the statistics offices') where there is one | QST-10 |
| **Test the wording** with a few real users before it is built | QST-10, QST-15 |

| Avoid | Source |
|---|---|
| Double-barrelled questions ("How often and for how long ...?") | QST-03 |
| Leading or loaded words that steer or provoke | QST-01, QST-03 |
| Jargon, acronyms and vague words ("frequently", "average") | QST-03 |
| Negatives and double negatives | QST-01, QST-03 |
| "Tick all" where one answer is expected | QST-12 |
| Overlapping or missing bands ("20 to 30" beside "30 to 40") | QST-14 |
| Mentioning age, gender or disability unless it is needed | QST-06, QST-07 |
| Group labels and deficit words: "the poor", "the elderly", "old people", "the disabled", "dropout", "uneducated" (the last three are an inference from how the offices word their categories) | QST-04, QST-07, QST-08 |

**Wording by topic.** *Age*: "children and young people", "older people" or "older adults"; write "aged 65 to 74", not "65+" or "above" [AGE-08]. *Education*: name what the person has, as the offices do [DEM-03, DEM-09, QST-17]. *Income*: say "lower income" and "higher income", never "poor" or "rich"; and show the figure beside the label [QST-08, a US professional body, excerpt]. *Gender*: separate sex from gender; offer "Prefer not to say" and a self-describe option to people answering about themselves [QST-05, QST-06]; the UK standard is interim and a new one is due in autumn 2026, so check before locking the wording. *Work*: "Looking after home or family" is the CSO's wording [QST-24]; "Not working, looking for work" is the author's. *Disability*: "disabled person" or "person with [condition]" [QST-04].

## 5. The countries and the shared lists

**Moved to doc 35 (`35-lists-and-classifications.md`) on 2026-10-29; the sub-section numbers are unchanged.** It holds the country differences, the shared lists, the national crosswalks, the industry lists, the examples, the industry pack, the activity cascade, the code and the words, the choices at each level and the classification data. References in this document written "doc 35, 5.N" point there.

- [5.1 What differs by country](35-lists-and-classifications.md#51-what-differs-by-country)
- [5.2 The shared lists](35-lists-and-classifications.md#52-the-shared-lists)
- [5.3 The crosswalks (national schemes behind the plain lists)](35-lists-and-classifications.md#53-the-crosswalks-national-schemes-behind-the-plain-lists)
- [5.4 Industries, level 2: the "more exactly?" list](35-lists-and-classifications.md#54-industries-level-2-the-more-exactly-list)
- [5.5 Examples under the options](35-lists-and-classifications.md#55-examples-under-the-options)
- [5.6 The industry pack: what a sub-industry gives the user](35-lists-and-classifications.md#56-the-industry-pack-what-a-sub-industry-gives-the-user)
- [5.7 The activity cascade: levels, how many to pick, and what the data shows](35-lists-and-classifications.md#57-the-activity-cascade-levels-how-many-to-pick-and-what-the-data-shows)
- [5.8 The code and the words: what the cascade ends on, and how each country names it](35-lists-and-classifications.md#58-the-code-and-the-words-what-the-cascade-ends-on-and-how-each-country-names-it)
- [5.9 How many choices at each level (the sufficient numbers)](35-lists-and-classifications.md#59-how-many-choices-at-each-level-the-sufficient-numbers)
- [5.10 The classification data](35-lists-and-classifications.md#510-the-classification-data)

## 6. Business 1 · Foundation: the customer model and the cards

One frame per Customer Segment (as today). Tiles and cards are unchanged; fields are added or changed. **The Tier column** in the question tables of sections 6 to 10 says when a question is asked (core, adaptive, optional); **Appendix B** says what a question is worth (driver, check, note) and governs where the two differ.

### 6.1 The owner's customer-segment text: analysis and what was adopted

The text describes the Customer Segment as a **connected information model** rather than a questionnaire: a Segment is the broad group, a Profile a more specific customer within it (up to three), six categories organise the characteristics, and a connection map decides which questions, options and information become relevant.

**Adopted as written:**

- **The two levels.** Segment = ranges and broad choices; Profile = specifics. The earlier "derive the Segment from the Profiles" idea is withdrawn; instead each Profile is checked against its Segment (6.5).
- **The six categories and their groups** (table 6.2). Groups that earlier drafts missed are added: household and family composition, occupation and employment, nationality and cultural background, language, gender and sex, geography details (country, region, city, local area, urban or rural), digital skills, devices, spending priorities, buying frequency, risk orientation.
- **The model vocabulary:** Category, Group, Characteristic, Band (a predefined range or list), Question, Option, Connection, Rule, Meaning, Evidence. In the app a Category is a block of fields on the card, a Group a field set, a Characteristic a field, a Band one of the lists of doc 35, 5.2, a Question its label, an Option an option, a Connection a row of section 11, a Rule what the app does (Filter, Reveal, Suggest or Review), the Meaning the "i" help line and the Evidence the source ids shown with the connection. **[D]** the repository already generates documents from tables (`npm run tables`, the library); the model could be kept as **one content table** from which the fields, options, rules and help lines are generated, so a rule is written once.
- **The four kinds of connection** (contextual, influential, operational, evidence-sensitive) and **the four behaviours** (Filter, Reveal, Suggest, Review dependencies): rules 3.4 and 11.1.
- **The cautions:** a characteristic never determines another (age does not determine digital skill; gender must not be used to infer an occupation; nationality, location and language are not interchangeable); relationships that rest on evidence say so; nothing is based on stereotypes. Section 11.2 handles each of the 11 connections and section 12 the sensitive characteristics.
- **Country context:** one shared structure with country-specific options attached (section 5), not six models.
- **Market size and attractiveness are outside the customer summary**, as the text says. G20 to G22 stay as they are today (the Market Size box), kept apart from the customer model.

**Changed, with the reason:**

- "Hide complex digital channels" when digital familiarity is low (the text's data flow) conflicts with the text's own Filter rule (remove only what is incompatible). A channel is **moved down and labelled**, not hidden (11.3).
- "The decision-making method defines the initial conversion rate" is **not built**: no official or university source gives a conversion default or a sales-cycle length by customer type (11.6). The decision method is shown as a note and a Review prompt, and the app proposes no percentage.
- "Purchasing power determines the limits of pricing" becomes a **Review prompt** (a price high against the stated income range), not a limit.
- "Psychographics feed the Brand Identity (Mission and Manifesto)" becomes a **check and a display**: the Profile's "what they care about" (P9) is compared with the Identity's positioning (I7c) and values (the Values tile), and may be shown beside the Brand's voice tile **[D]**. Today nothing reads Mission, Values or Manifesto.
- "Income and the buyer's financial status unlock procurement and longer sales cycles" is kept only where the evidence supports it: a formal tender or a government customer **reveals** the "Contracts or tenders" demand row and a note of the stated tender periods and public payment terms (11.5); the length of the sales cycle is not estimated.
- Nationality and cultural background are **not a list** (no race or ethnicity categories; section 12); language and country are asked instead.

### 6.2 The model: categories, groups and the questions that carry them

| Category | Group | Segment (a range or broad choice) | Profile (a specific) |
|---|---|---|---|
| **1 Demographics** | Age and life stage | G6 age range | P1 an age |
| | Household and family | | the note of Specific Personal Information (not asked) |
| | Education and qualifications | G7 education levels | the note of Specific Personal Information |
| | Occupation and employment | G13 work situations; G15 industries (business customers) | P6 work situation or job level |
| | Income and economic status | G8 household income, one of five steps | the note of Specific Personal Information |
| | Nationality and cultural background | the note only (section 12) | the note only |
| | Language | G5 languages | the note of Specific Personal Information |
| | Gender and sex | G10 the usual gender mix (a ramp) | P5 gender (when the mix is not "not relevant") |
| | Other relevant characteristics | the note | the note |
| **2 Geography** | Country | G3 countries (when G2 is several countries or anywhere) | |
| | Region, city, local area | the Geographics box (names stay text) | |
| | Urban, suburban or rural | G4 kind of area | |
| | Reach | G2 scope | |
| **3 Needs and problems** | Needs | the text lists, each line with an id | |
| | Problems, challenges | | P18 frustrations |
| | Goals, desired outcomes | | P17 goals |
| | Unmet needs | derived: a need no offering answers (Review) | |
| **4 Psychographics** | Motivations, values | | P9 what they care about |
| | Attitudes, interests, lifestyle, aspirations | the notes | the notes |
| | Risk orientation | | (not asked: no source) |
| **5 Purchasing power and behaviour** | Financial circumstances | G16 what they usually pay; G8 | |
| | Purchasing habits | I7c outcome (price or quality; was G17) | P13 how they buy; P14 how they pay |
| | Decision-making | | P21 their part; P22 how it is decided |
| | Spending priorities | O11 (was G18) | |
| | Buying frequency | O3 (was G19) | |
| | Objections | | P19 what might stop them |
| **6 Digital and shopping habits** | Digital skills | | P16 how comfortable with online tools |
| | Devices | | P15 devices |
| | Software use, online activities | the notes | the notes |
| | Information sources | | P11 where they look |
| | Shopping channels, preferred methods | | P12 how they compare; P13 how they buy; P14 how they pay |
| | Help wanted | | P20 help before buying |
| (business customers) | Type, size, industry | G23, G14, G15 | |

### 6.3 Segment card (tile "Segment Description"): step 1, revised after the owner's review of 2026-10-23

**Where it is.** Business 1 › the frame of a Customer Segment › the tile "Segment Description". The tile opens the **Segment card** and, nested in it, the **Profile cards** (up to three). This step is the Segment card; the Profile cards are step 2.

**Today.** A **Name** and a **Description** made of five optional text boxes: *Demographics*, *Geographics*, *Business Data* (behind a tick), *Purchasing Power & Behaviour*, *Market Size & Industry Outlook*. Everything is free text and nothing is read by another part except the Name.

**Target.** Each box keeps its title and its text (now an optional **note**) and gains the choices below. Questions are written as lists. "Type" says what a question is worth (Appendix B): **driver** (it produces a proposal), **check** (a Review item only) or **note** (not asked).

#### How a question is answered on a Segment

| What it describes | How it is answered | Why |
|---|---|---|
| **Who they are**, in an order (age, education, organisation size) | **A range: From and To** (two existing dropdowns), narrow by design | A Segment is a narrow group. A range wider than three adjacent bands shows "A group this wide is usually two Segments with different needs. Create another Segment?" It warns; it does not block |
| **Who they are**, without an order (work situation, industry, type of organisation, area, language) | **One value** | If more than one applies, that is another Segment (the Foundation allows a primary Segment and one more) |
| **Income** | **One step on a five-step scale** (the currency symbol repeated: £ to £££££) | Shows how well off, without an exact figure |
| **The mix by gender** | **A ramp** (joined buttons) | A share, not a yes or no |
| **What they do or prefer** (what they spend on) | Several, in the Profile; the Segment asks none (G18 is merged into O11) | Preferences overlap; identity does not |

**Each fact is asked once, where it belongs.** G2 is asked here and **nowhere else**; who you sell to is asked **in Identity (I3)** and only read here; where your customers are is not asked in Identity (I4 stays withdrawn). G3 starts from the Legal Entity's country: that is a different fact (where the business is registered), so it is a default the user confirms, not a duplicate question. A second Segment starts from the first one's answers as a default and may change them.

#### Proposals at the top of the card (not questions)

| Proposal | Built from | What the user does |
|---|---|---|
| **Segment name** suggestions (for example "Small hospitality businesses") | the industry pack (I1), I3, G14, G15 | Presses Add, or types their own |
| **A description draft** ("Adults aged 25 to 44 with a bachelor's degree, household income around the typical in the United Kingdom ...") | the answers below | Presses "Use as text"; nothing is overwritten |
| **Profile suggestions**, up to three: one for each band of the age range; for business customers the kinds of business of the industry pack; **for the audience Proxy Buyers / Gifters (I7b), a second Profile for the person who uses it, beside the buyer's** | the ranges and the pack | Presses Add on the ones they want; each starts with its range already set |

#### First question: already answered in Identity (I3, "Seller and Buyer Relationship")

Asked once, on the Early Positioning tile (8.2), so that Business 1 opens with the right layout already arranged; the Segment card reads the answer and does not ask it again (the id G1 is retired). The owner's options: **B2C (Business-to-Consumer)**, **B2B (Business-to-Business)**, **B2G (Business-to-Government)** and **G2B Context (Regulatory/Compliance)**. "Business-to-consumer" is the term in the title of the EU's Directive 2005/29/EC on unfair commercial practices [FUN-18]. The question is about the **economic buyer, the one who pays** (the "i" says so).
- **B2C**: one Segment frame, set for individual people (Box 1).
- **B2B, B2G, G2B**: one Segment frame, set for businesses and organisations (Box 3; B2G asks for the public body and its administrative level, with the tender row; G2B the industry and its regulation).
- **Several relationships** (allowed while Managing and Growing): **one Segment frame for each**, each with its own box set. A Segment is one group; its questions differ for people and for businesses. (The old option "Both" is this case.)

It also sets the default of the tax question on the price card. **I3 describes the buyer (who pays).** A business that sells to two separate audiences (a studio with private clients and companies) has two Segments. Where the person who uses it is not the buyer, it is **one Segment with a second Profile for the user** (P21 "They will use it"), not two Segments and not a Segment question (below).

#### Buyer and user: read from Identity, with no Segment question (owner, 2026-10-25)

The vocabulary: the **customer** is who pays; the **user** (books also say consumer or end user) is who uses it. The app never says "consumer", because in law that word means something else. They can be different people: a baby uses the nappies and the mother pays; in a hospital the buyer is procurement and the user is a surgeon.

**There is no Segment question for it.** Identity already asks it: the audience of a consumer buyer is **"Buyer's Life-Stage and relationship with the User"** (I7b), and its option **Proxy Buyers / Gifters** says the buyer pays and the product is for someone else. The earlier proposals G24 "Who uses it?" and G25 "the user's age range", and the Buyer part and User part they would have created, are **withdrawn** (the owner: "there is no such question"): asking it again on the Segment would break rule 2 (ask each fact once), and the machinery (two parts, a question for each part, the stage cards reading the right part) is more than a Profile already does.

**What the Segment does instead.**

- **The Segment describes the buyer** (the one who pays, I3). G6 to G8, G13, G23, G14 and G15 describe the buyer.
- **The user is a second Profile** in the same Segment (a Profile is a typical person, up to three per Segment): P21 "They will use it" is ticked on it, and its age (P1) is its own. When I7b is Proxy Buyers / Gifters the app **proposes** that second Profile; for a business buyer whose staff use it (an employer, a hospital) the user adds it by hand. It is one Segment, never two.
- **A multi-sided Market Structure (I11) is not a buyer-and-user split.** Each side of a platform is one of the relationships chosen in I3, so **each side is its own Segment frame** (with its own outcome, I7c, asked per side). The Segments of a platform are tied only by the Market Structure; the dependence between the sides is not modelled (11.6).
- **The children's note** ("Selling to children and young people") and the O12 check read the age of a Profile (P1) and the buyer's range (G6): shown when either is below 18.

**What this removes:** G24, G25, the Buyer part and the User part, the two columns of questions "targeted" at each, the Profile limit "up to three per part" (it is up to three per Segment), and the P21 condition "G24 is not the same people".

#### Worked cases: who pays, who uses, who decides (one Segment; the user is a second Profile)

Each case is one Segment. The needs (comfort, safety, cost, prestige) are the owner's examples and become the Profiles' wants and worries (P17 to P19); they are not claims of the app. **Buyer** here means the one who pays.

| Case | Seller and Buyer Relationship | Market Structure; the user | The buyer (the Segment) | The user (a second Profile) | Notes |
|---|---|---|---|---|---|
| Baby products | B2C | Single-sided; the buyer is not the user | Parents: place the order, decide (comfort for the baby, their own peace of mind) | A baby (individual people), 0 to 2 | Nearly all the value proposition is aimed at the Buyer part; the baby has no worries of its own |
| Toys for young children | B2C | Single-sided; the buyer is not the user | Parent: safe, not too noisy; approves | Child: colour, a hero; asks for it | Two sets of worries; the child must want it and the parent must agree |
| Teenagers | B2C | Single-sided; the buyer is the user (own money) or not (a parent pays) | Teenager with a wallet, or the parent (controlled cost) | Teenager: acceptance, trends | G6 includes 13 to 17: the box "Customers under 18 who pay" and O12 apply |
| Gifts (flowers, jewellery, luxury) | B2C | Single-sided; the buyer is not the user | The giver: packaging, prestige, delivery speed | The recipient (optional): look, size, usefulness | The recipient's age is optional |
| HR or recruitment software | B2B | Single-sided; the buyer is not the user | Companies; finance or IT head signs | Recruiters and HR staff (individual people) | Size and industry are asked of the buyer only |
| Medical equipment | B2B | Single-sided; the buyer is not the user | Hospitals and clinics; procurement (cost, depreciation, warranty) | Doctors and surgeons (accuracy, ease, patient safety) | A public body shows the tender row |
| Corporate training | B2B | Single-sided; the buyer is not the user | HR manager or chief executive (productivity) | The employees who attend | |
| Elderly care, care homes | B2C | Single-sided; the buyer is not the user | Adult children: safety, supervision, communication, cost | The older parent, 65 or over: comfort, food, respect, social life | |
| Veterinary services, pet food | B2C | Single-sided; the buyer is not the user | The owner | none: an animal is not modelled as a user | The animal's needs go into the owner's wants and worries |
| Prescription medicines | B2C | Single-sided; the buyer is not the user | The patient (or an insurer or health service; not modelled) | The patient | The doctor who decides is a Profile of the Segment (P21) |
| Free tier of a search, social or music service | B2B and B2C (two sides) | Multi-sided (a platform: advertisers and users) | Advertisers: one Segment frame | The people who use it free: the other Segment frame (B2C) | O3 for the free side's offering is "Free to the customer"; a paid tier is another Offering |
| Delivery or marketplace app | B2B and B2C (two sides) | Multi-sided (a platform: restaurants and diners) | Restaurants: one Segment frame; they pay a commission | Diners: the other Segment frame (B2C) | Each side is its own Segment with its own payer; the diners' payment (food and delivery) is that Segment's, and which side pays the platform is confirmed on the Review page (R40) |

**Multi-sided platforms.** A platform has two or more distinct groups that need each other, and one group's value grows with the number in the other [MSP-03]. The model above covers **who is who, and who pays**: each side is one Segment frame (one for each relationship in I3, with its own outcome in I7c). It does **not** model the dependence between the groups (how one side's size changes the other's value, the start-up problem of needing both sides, subsidising one side); that is listed in 11.6 as not built. A zero price is still a product: the European Commission's 2024 notice says a service supplied at no price does not mean there is no market [MSP-04]. The one-Segment-for-each-side rule is the owner's, not a finding of the sources.

#### Box 1: Demographics (asked when the relationship includes B2C)

**G6. What is the age range of the customer, the person who pays?** From … To … · Driver. Each band has an "i" line, written by age and development, never by work.
- **0 to 2**, babies and toddlers. *i: Cared for entirely by adults. As a user, never as the one who pays: a parent or carer chooses and pays.*
- **3 to 5**, pre-school children. *i: Learning through play, with an adult always involved. A parent or carer chooses and pays.*
- **6 to 9**, early primary children. *i: Starting to use things alone; family is still the strongest influence. Parents choose and pay; children begin to ask.*
- **10 to 12**, older primary children. *i: Gaining independence, often a first personal device, influenced by friends. Parents usually still pay.*
- **13 to 15**, young teenagers. *i: More say over their own choices. Online services often need a parent's consent below an age that depends on the country (13 to 16).*
- **16 to 17**, older teenagers. *i: Close to adult life but still children in law. Some products and services have age limits at 16 or 18.*
- **18 to 24**, young adults. *i: Adults making their own decisions.*
- **25 to 34**, adults. *i: Early adulthood.*
- **35 to 44**, adults. *i: Mid-adulthood.*
- **45 to 54**, adults. *i: Mid-adulthood.*
- **55 to 64**, adults. *i: Later adulthood, before the usual start of the older-adult group.*
- **65 to 74**, older adults. *i: The start of the older-adult group in official statistics.*
- **75 or older**, older adults. *i: Some need more support.*

Why so many bands below 18: a 10-year-old and a 16-year-old are different customers, and so are a toddler and a teenager. The bands follow the stages of the UK's Children's Code (0 to 5, 6 to 9, 10 to 12, 13 to 15, 16 to 17), with the England early-years stage starting at 3 [AGE-03, AGE-06]; the adult bands are ten-year groups [AGE-14]; the older-adult line is 65 and the next 75, as in the ABS and ONS groups [AGE-14, DEM-12]. All bands below 18 are "children" in the UN Convention on the Rights of the Child, so the app treats them as needing a parent or carer in the decision [AGE-02]. The words are "children and young people", "older people" or "older adults", never "the elderly" [AGE-08].

**When a Profile's age (P1), the user's or the buyer's, is below 18**, the app shows the note **"Selling to children and young people"**: online services and data rules differ by country, and some goods have minimum ages (O12, section 10.3). **When G6 (the customer, who pays) includes a band below 18**, the app asks P21, hides G7 for the bands below 18, shows G13 for any range that includes 13 or older (the likely answer is "in full-time education"), and shows the box "Customers under 18 who pay" below. If G6 includes a band below 13, a line says "Under 13, someone else usually pays. Describe the person who pays here and the child as a second Profile (P21 'They will use it')." It warns; it does not block. The online consent lines:

| Country | Online or data rule | Source status |
|---|---|---|
| UK | 13 for online services; the Children's Code covers everyone under 18 | AGE-03, AGE-04, opened |
| Ireland | 16 (the digital age of consent) | AGE-19, excerpt; the PDF could not be read, re-check |
| USA | Under 13 (COPPA); teenagers are not covered by COPPA | AGE-09, opened |
| Canada | Under 13 needs a parent; 13 to 17 needs an assessment of capacity; Quebec 14 | AGE-12 opened; Quebec excerpt |
| Australia | Under-16 social media minimum age from 10 December 2025 (the duty is on the platforms); a children's online privacy code for under 18 is a draft due by 10 December 2026 | eSafety excerpt; AGE-16 opened |
| New Zealand | No minimum age; the Privacy Act applies to everyone, and a child is under 18 | AGE-18, opened |

#### Customers under 18 who pay, and whose money it is

A person under 18 can be a real customer: they may have pocket money or a wage and a debit card. The app does not guess; it asks (G6, P14) and shows what is known, as "tends to", with its status. Nothing here is legal advice, and nothing blocks the user.

| Case | What is known (status) | What the app does |
|---|---|---|
| A child uses it, an adult pays | The usual case below about 13 | A second Profile for the child (P21 "They will use it"); the Segment describes the payer |
| A teenager pays with pocket money or a part-time wage | Over 7 in 10 UK children aged 7 to 17 get regular money from pocket money or work [excerpt, Money and Pensions Service]. US teens aged 16 to 19: 36.5% employed in July 2026 [opened, BLS]. Canada, 2019, ages 15 to 19: 43.2% employed, more than 95% of full-time students' jobs part-time [opened, Statistics Canada]. **No official body gives a total for teenagers' spending**: any such figure the user types is a note, not evidence | Allowed in G6 (bands 13 to 15 and 16 to 17); P21 is asked; a Review line "Your Segment includes people under 18 who pay" points to O12 and the contract line below |
| When young people can work | Light, limited work from about 13 to 14 in the six countries; full-time only after the school-leaving age, about 16. England 14 [opened, GOV.UK]; Ireland 14 to 15 light work, 16 for full employment [opened, WRC]; USA 14 non-farm, hours limited, 16 unlimited [opened, DOL]; Ontario 14 by workplace, British Columbia 12 to 15 with a permit [opened]; Quebec 14 [excerpt]; New Zealand outside school hours for those 15 or under [opened]; **Australia is set by each state and territory and no page was opened** | Shown in the "i" line of the 13 to 15 band, as "tends to"; G13 offered from 13 |
| Own bank account or debit card | UK children's accounts, debit card from about 11 [excerpt, MoneyHelper]; Ireland teen accounts from 11 or 13, a parent may need to approve [opened, CCPC]; USA needs an adult co-owner or custodian, some states allow independent minor accounts [opened, FDIC, Federal Reserve]; Canada no-cost youth accounts for 18 and under [excerpt]; **Australia and New Zealand: no official source found** | P14 for a range wholly under 18: credit card, buy now pay later and invoice are not offered; debit card, cash and "a parent pays" are. A filter on a list, explained in a line |
| Credit | US credit card under 21 needs own income or a co-signer aged 21 or over [opened, CFPB]; Canada the primary cardholder must be of age [opened, FCAC]; UK 18 [non-official excerpt]; **Ireland, Australia, New Zealand: no official page** | Same filter; for ranges that include 18 or 20, a line "credit is limited under 21 in the USA" |
| Contracts under 18 | UK: a contract cannot generally be enforced against a minor, and a court may order property returned [opened, Minors' Contracts Act 1987]. Scotland: 16 and over have full capacity; under 16 only for transactions typical for their age [opened and excerpt, 1991 Act]. USA: voidable in most states [opened, Cornell]. New Zealand: unenforceable against the minor, a court may cancel [excerpt]. New South Wales: not binding on a minor unless the Act says so [excerpt]. Canada: the age of majority is 18 or 19 by province, and no current provincial rule was verified. **Ireland: not verified** | A note, never a block: "Customers under 18 can often cancel what they sign. Subscriptions and long contracts bind them less. Consider a parent or carer as the contract holder." A Review line when O3 is a subscription, membership or contract and G6 includes a band below 18 |
| Free of parents ("emancipated") | Court routes exist in some places; only California court material was found [excerpt] | Not modelled. The working line is under 18; a note says the age of majority is 19 in some Canadian provinces and that New Zealand's older statute says 20 but its contract law treats under 18 as minors |

Drives: narrows the Profile's age (P1) to the range; proposes a Profile per band (up to three); reveals the who-pays question and the notice for children; shown beside the channel suggestions as context. Evidence line: online use is near-universal below 65 and drops from 65, widest from 75 [DIG-07, DIG-14]; the app never infers skill from age.

**G7. What is their highest level of education?** From … To … (ordered; asked for ranges that include 18 or older) · Driver
- No formal qualifications
- School-level qualifications
- Vocational or trade qualification, apprenticeship or diploma
- Some college or university, no degree yet
- Bachelor's degree or equivalent
- Postgraduate degree (master's or doctorate)
- Not sure yet

Each option shows the customers' country's examples in its "i" (from G3), for example in the UK: *School-level: GCSEs, A levels; Vocational: apprenticeship, NVQ, HND*; in the USA: *School-level: a high-school diploma*; in Australia: *Year 10 to 12; Vocational: Certificate III or IV, Diploma*. **Why this wording.** The lowest option names what the person has, with no judgement, as the statistics offices do ("No qualifications", "No certificate, diploma or degree", "No qualification", "No formal education") [DEM-03, DEM-09, QST-17, QST-11]; "formal" is there because people learn outside school; "school-level" and "vocational" are separate so a trade qualification is not ranked below school; the words "dropout", "uneducated" and "unqualified" are not used (an inference: no style guide was found that names them). "Not sure yet" replaces "Prefer not to say": the founder is describing a group, not answering about themselves. Drives: shown in the Profile's note (P2 merged). Evidence line: digital skill and the way people pay vary more with education than with age (Ireland: basic digital skills 88% with high education against 14% with low [DIG-14]).

**G8. How would you describe their household income?** One step · Driver. The currency symbol of the organisation (£, € or $) is repeated; the "i" of each step shows the typical amount of the country.
- £, lower income: under 60% of the typical household income
- ££, below typical: 60% to 99%
- £££, around typical or somewhat above: 100% to 149%
- ££££, above typical: 150% to 199%
- £££££, higher income: 200% or more
- Not sure yet

**What the "i" shows.** The typical (median) income of the customers' country, with its year and definition, and the amounts of the five steps computed from it. The offices measure different things, so each country shows its own figure and its definition, and the five steps are always 60%, 100%, 150% and 200% of that figure. 60% is the official "relative low income" line in the UK and the at-risk-of-poverty line in Ireland and the EU; 200% is the OECD's upper-income boundary (an excerpt); 100% and 150% are the author's lines [INC-01, INC-08, INC-12, INC-13].

| Country | Typical figure shown | Year | Definition | Source |
|---|---|---|---|---|
| UK | £37,500 a year before housing costs, for a couple (a single adult £25,100) | FYE 2025 | net household income, equivalised | INC-01 |
| Ireland | €31,767 a year per person | 2025 survey (income of 2024) | equivalised disposable income | INC-08 |
| USA | $83,730 a year per household | 2024 | money income before tax, not equivalised | INC-04 |
| Canada | $74,200 a year per household | 2023 | after-tax income, not equivalised | INC-06 |
| Australia | $1,192 a week, about $62,000 a year | 2022-23 | equivalised disposable household income | INC-10 |
| New Zealand | not verified (the one figure found was from an aggregator and is not used) | | | INC-14 |

The scale describes the household, not the person: a student or a non-earning partner in a well-off household sits high on a relative scale. The steps are bands of the distribution, not fifths, so the middle steps hold most people. A higher figure is not a better customer; no source links income to willingness to pay for a service. Drives: shown in the Profile's note (P7 merged; an exact household figure stays in the note). The Segment does not ask for an amount.

**G13. What is their work situation?** One answer (asked for ranges that include 16 or older) · Driver
- Employed full time *i: Includes the armed forces, paid apprentices and trainees, and people on leave from a job (for example parental leave).*
- Employed part time *i: Includes casual work.*
- Self-employed or running their own business *i: Includes freelance and gig work.*
- Not working, looking for work
- In full-time education
- Looking after home or family
- Retired
- Not working because of health or disability
- Not working and not looking for work *i: For example a gap year, travelling or a break. Unpaid volunteering is not a work situation: choose the one that describes their main activity.*

These placements are the author's, following the usual labour-statistics split into employed, unemployed and not in the labour force (the standard was not opened); check them before building. There is no "Other".

If more than one is true of your customers, make another Segment. Drives: the Profile's job level (P6) for the employed and self-employed.

**G10. What is the usual gender mix of your customers?** A ramp of joined buttons · Driver (it reveals P5 and the notice)
- Not relevant to what I offer
- Almost all men (women 0 to 20%)
- Mostly men (women 20 to 40%)
- A mix (women 40 to 60%)
- Mostly women (women 60 to 80%)
- Almost all women (women 80 to 100%)

Help: "This describes your usual customers, not who may buy. Every gender can buy, and non-binary and other genders are welcome in every option." Drives: shows the equality notice (a segment must not be used to refuse, exclude or price people differently because of a protected characteristic, with the law of each customer country); a Profile's gender should fit the mix (Review). Household and nationality are not asked: nothing would read them.

#### Box 2: Geographics

**G2. Where are your customers?** · Driver
- In my local area
- In my region
- Across my country
- In several countries
- Anywhere online
- Not sure yet

Drives: orders the suggested channels (for a local scope, In Person and Community first); reveals G3.

**G3. Which is their main country?** (shown for "In several countries" or "Anywhere online"; otherwise it is the Legal Entity's country; the user confirms) · Driver
- United Kingdom
- Ireland
- United States
- Canada
- Australia
- New Zealand
- Another country *i: Any country outside these six, for example India, Singapore or South Africa. The plain lists are used, and a note says to check that country's law.*

Drives: chooses the country's examples for education, size, industry and area; the equality notice; the language notes. Customers in another country are another Segment.

**G4. What kind of area do they live or work in?** One answer · Check
- City centre or large city
- Large town
- Small town
- Rural area, villages and countryside
- Remote area, far from towns and services

Drives: a Review item when customers are remote or rural and the offering is shipped or delivered in person. Evidence line: the rural gap is small in most data and large only for remoteness [DIG-12, DIG-14].

**G5. Which languages do they use?** One answer · Check
- English only
- English and another language
- Mainly another language

Drives: "who will support them?" (a Capability item); a note on French for Canada. Named places and languages stay in the Geographics note.

#### Box 3: Business Data (asked when the relationship includes B2B, B2G or G2B)

**G23. What type of organisation are they?** One answer · Driver
- Self-employed or freelancer
- A private business *i: Includes co-operatives. A social enterprise belongs here or under non-profit, by how it is owned.*
- A non-profit or charity *i: Includes membership and professional bodies and religious organisations.*
- A public body, for example a government department, council, school or hospital

Drives: a public body reveals the "Contracts or tenders" demand row and a note of the stated tender periods and public payment terms [B2B-02, B2B-06, PAY-03]; non-profit and charity are asked here because no official industry scheme has them [BUS-17].

**G14. How big are they?** From … To … (ordered) · Driver
- Just one person, self-employed with no employees
- 1 to 9 employees, a small team
- 10 to 49 employees, a growing company
- 50 to 249 employees, a mid-sized company
- 250 to 499 employees, a large company
- 500 or more employees, a very large organisation

Drives: channel suggestions by size (P23 merged into it). Evidence line: websites, cloud and AI use rise with size in every country with data (UK: a website for 76% of sole traders and 99% of large firms [B2B-01]).

**G15. What industry do they work in?** One answer · Driver. The 18 industries, each with an example, then "Not sure, or more than one". There is no "Something else": every section of the four industry schemes sits under one of the 18, and what does not look like an industry is explained in the "i" lines. If they work in more than one industry, make another Segment.
- Farming, forestry and fishing, for example crops, livestock, forestry, fishing
- Mining, oil, gas and quarrying
- Manufacturing, for example food and drink, clothing, machinery, electronics, furniture
- Energy, water and waste, for example electricity, gas, water, recycling
- Construction, for example building, civil engineering, trades
- Wholesale and retail trade, for example shops, online stores, wholesalers, vehicle dealers
- Transport, postal and logistics, for example road, air, sea, couriers, warehousing
- Hospitality, for example hotels, restaurants and cafés, bars, catering
- Software, IT, media and telecoms, for example software, apps, web, IT services, film, publishing
- Finance and insurance, for example banks, lenders, insurers, brokers, payments
- Real estate and property, for example agents, landlords, property management, developers
- Professional, scientific and technical services, for example consulting, marketing, design, architecture, engineering, legal, accounting
- Administrative and support services, for example recruitment, cleaning, security, travel, call centres
- Government and public administration *i: Includes embassies and international bodies.*
- Education and training, for example schools, universities, tutors, training providers
- Health and social care, for example clinics, dentists, care homes, social work
- Arts, sport and recreation, for example artists, galleries, gyms, clubs
- Other services, for example repair, personal services, membership organisations *i: Includes households that employ staff, such as cleaners and nannies.*
- Not sure, or more than one *i: A label that spans industries (creative industries, agri-tech) is not one industry: choose the closest, and make another Segment for a second. Non-profits are not an industry either: the next question asks the type of organisation.*

Drives: the Profile's "which kind of business" (P24) shows the finer list of that sector, each with its example (doc 35, 5.4); competitor industry overlap. Evidence line: adoption depends on industry as much as size [B2B-01, B2B-03, B2B-05, B2B-07].

#### Box 4: Purchasing Power & Behaviour

**G16. What do they usually pay for something like yours?** From a number, to a number, in the organisation's currency · Check. The answer can be compared with the price (Review).

**G17. How do they feel about price?** **Withdrawn (merged into I7c, 2026-10-25).** The seller's Differentiation & Outcome (Cost-driven; Status & Premium) already says whether the Segment is reached on price or on quality; asking the customers' attitude again is the same fact twice. The Review compares the outcome with G16 and the price.

**G18. What do they spend most on?** **Withdrawn (merged into O11, 2026-10-25).** The Offering's O11 ("what does the customer spend on when they buy this?", list L12) is the one place the spending category is asked; the Segment-level list had nothing to be compared with except O11.

**G19. How often do they usually buy something like this?** **Withdrawn (merged into O3, 2026-10-25).** How the offering is bought (one purchase, a subscription, a project) is O3; the Segment's frequency was only a check against it.

#### Box 5: Market Size & Industry Outlook

Not part of the customer model (the owner's text, 2026-10-23). The existing box stays as it is (G20 to G22 are notes).

#### What the Segment card gives the next parts

| To | Gets |
|---|---|
| The Profile cards | Their options limited to the range or the one value; a proposed Profile per band, per kind of business, or for the child and the parent or carer |
| The channels (page 2) | The order of suggestions (G2), the country's lists (G3), channels by business size and industry (G14, G15) |
| The demand rows | The tender row for a public body (G23) |
| The Review page | Three checks (G4, G5, G16) and the Profile-fits-Segment checks |
| The documents | A drafted Segment description |

**Not asked, and why.** Buying timing (no seasonality in the model); household, nationality and the owner's "own or household" income question (nothing would read them; the income step is the household's); market size (outside this step). **Counts for the card:** see Appendix B (G9, G11, G12, G17, G18, G19, G24 and G25 are withdrawn, merged or no longer numbered).

### 6.4 Profile card (cards nested in the same tile): a typical person, asked specifically

| Today | Target |
|---|---|
| **Specific Personal Information** (exact age, gender, marital status, education, job title) | **P1, P5, P6**; education, household income, language, household and relationship status, and job title **stay in the note** |
| **Psychographics** | **P9**, plus the note (interests, lifestyle and aspirations stay text) |
| **Social & Interest Hubs** | **P11**, plus the note |
| **Information & Shopping Habits** | **P12 to P16**, plus the note |
| **Goals & Desires** | **P17**, plus the note |
| **Challenges & Problems** | **P18**, plus the note |
| **Objections** | **P19**, plus the note |
| **Needs** (Functional, Emotional, Social) | **stay text lists**, each line gets an id: a need is a precise statement ("send an invoice in under a minute"), not a category |

| Id | Question (plain) | Component | Options | Tier | Reads it |
|---|---|---|---|---|---|
| P1 | How old is this typical customer? | Number (years) | | Optional | Profile check against G6 |
| P5 | What is their gender? | Dropdown | Woman; Man; Non-binary; I would describe it differently; Prefer not to say | Adaptive (G10 is not "not relevant") | Note; equality notice |
| P6 | What kind of work do they do? (i: armed forces, choose the group that fits the role; clergy count as professionals) | Dropdown | Owner or senior executive; Manager; Professional or specialist; Technician, skilled trade or associate professional; Administrative, sales or service; Operator, labourer or elementary | Adaptive (when G13 is employed or self-employed, and always for a business customer's contact) | Review |
| P9 | What do they care about most? (up to 3) | Ticks | L1 | Core | Value Proposition draft; check against the offering's benefit (O4) and positioning (I7) |
| P11 | Where do they look when they need something like this? | Ticks: the channel categories, then the subchannels of the ticked ones | L6 | Core | Proposes **Discover** channels (7.4) |
| P12 | How do they compare their options? | Ticks | Your website; Reviews and recommendations online; A demo, trial or sample; A quote or proposal; What other people recommend; Comparison sites; A meeting or call | Core | Proposes **Evaluate** channels (7.4) |
| P13 | How do they usually buy? | Ticks | Online checkout; An invoice; In person; By phone or email; A contract or tender; On a marketplace; By booking | Core | Proposes **Purchase** channels (7.4); reveals the "Contracts or tenders" demand row |
| P14 | How do they like to pay? | Ticks | L13 | Optional | Proposes the Direct Payment subchannels (7.4); evidence line (11.4) |
| P15 | Which devices do they use? | Ticks | L15 | Optional | Review: make the order and forms work on a phone (11.5) |
| P16 | How comfortable are they with online tools? | Dropdown | Very comfortable; Comfortable with the basics; They need some help; Mostly offline; Not sure yet | Core | Moves digital-only channels down and suggests personal help (11.3); the app never infers it from age |
| P17 | What are they trying to achieve? (up to 3) | Ticks | L4 | Core | Value Proposition draft |
| P18 | What frustrates them today? | Ticks | L3 | Core | Value Proposition draft; Review |
| P19 | What might stop them buying? | Ticks | L2 | Core | The Offering ticks the worries it answers (O8); suggests Evaluate actions (11.5) |
| P20 | How much help do they want before they buy? | Dropdown | They work it out themselves; They like a little guidance; They want to talk to a person; They need a formal demonstration or proposal; Not sure yet | Core | Suggests the relationship type (7.4); Review against the help the offering gives (O7) |
| P21 | What part do they play in the purchase? (tick all that apply) | Ticks | They will use it; They influence the decision; They place the order; They make the final decision; They control who gets to the decision-maker | Adaptive (businesses or both; any age band below 18; or the audience is Proxy Buyers / Gifters, I7b) | Context on page 2; Review: nobody makes the final decision |
| P22 | How is the decision made? | Dropdown | They decide alone; They decide with family or colleagues; A manager or budget-holder approves; It goes through a formal tender or procurement; Not sure yet | Adaptive (businesses or both) | Reveals P21 and the tender row (11.5) |
| P24 | Which kind of business is it? | Dropdown | the level-2 list (doc 35, 5.4) of the industry chosen in G15, each with its example | Adaptive (businesses or both) | The pack's examples for this customer; competitor industry overlap |

**P21 explained.** The five roles are the buying-centre roles credited to Webster and Wind (1972): the user, the influencer, the buyer, the decider and the gatekeeper [CHN-02]. "They will use it" is the person who uses the offering day to day, who may be neither the one who pays nor the one who decides. It matters because the user needs support and proof it works, the buyer needs price and terms, and the decision-maker needs the business case. One person often holds several roles, so the question is ticks; for people buying for themselves they are all one person, so it is asked only of business customers.

**P5.** Gender follows the Australian standard's gender categories (man or male, woman or female, non-binary, a different term, prefer not to answer) [SEX-01] and is asked only when G10 is yes. It is optional and nothing reads it except the note and the equality notice, so the owner may drop it **[D]**. Household type and relationship status (the old P3 and P4, following the six statistics offices' categories [DEM-12]) are not asked: they stay in the note.

### 6.5 The cascade: the Segment sets the range, the Profile chooses within it

The Segment holds a range or one value and each Profile a specific answer, and **the Profile can only choose what the Segment allowed**. This saves the user from re-reading a whole list on every Profile and keeps the two levels consistent.

| Segment answer | Profile question | What the Profile gets |
|---|---|---|
| G3 main country | every list with a national scheme (P24) | the country's crosswalk |
| G6 age range of the customer (From, To) | P1 an age | a number within the range; outside it is a Review item, not an error. **A range that includes a band below 18 also asks P21** (who uses it, who pays, who decides) |
| G13 work situation (one) | P6 what kind of work | the job-level list, for the employed and self-employed |
| G15 industry (one) | P24 which kind of business | the finer list of that industry, each with its example |
| G10 gender mix | P5 gender | shown when the mix is not "not relevant"; a Profile's gender should fit the mix (Review) |

The app also proposes **Profiles** (up to three): one for each band of the age range; for business customers, the kinds of business of the industry pack; for the audience Proxy Buyers / Gifters, a second Profile for the one who uses it. Questions asked only at the Profile (no Segment range): P9 to P22 (what they care about, where they look, how they compare, buy and pay, devices, digital comfort, goals, frustrations, worries, help wanted, part in the purchase, how decided). If a Segment answer changes, the compatible Profile answers stay and the others are flagged (rule 3.4). The same Review checks list a Profile outside its Segment and a Segment range no Profile covers.

### 6.6 Competitor card (tile "Competitors")

| Today | Target |
|---|---|
| Name, **Type** (Direct competitor; Indirect competitor; Substitute; Internal solution; Status quo) | keep |
| Description: **What they sell** | stays text |
| Description: **Which areas and industries they serve** | the area stays in the box; industries overlap with G15 is a Review check |
| Description: **How they reach customers** | **K4** |
| Description: **What customers say** | **K6** (K5 is not asked) |
| SWOT **Strengths**, **Weaknesses** | **K2, K3** plus the note |
| SWOT **Opportunities**, **Threats** | stay text (K7 and K8 are not asked) |
| **Insights & Differentiation** | stays text; a **draft** is proposed from K2, K3 and O4 |

| Id | Question (plain) | Component | Options | Tier | Reads it |
|---|---|---|---|---|---|
| K1 | Is their price lower, about the same, or higher than yours? | Dropdown | Lower; About the same; Higher; I do not know | Optional | Review; price evidence (R2) |
| K2 | What do customers choose them for? | Ticks | L1 | Core | Differentiation draft; compared with P9 and P19 |
| K3 | Where do they fall short? | Ticks | L1 | Core | Differentiation draft: an opening where they are weak and you are strong |
| K4 | How do they reach customers? | Ticks | the 13 channel categories | Optional | Review: a channel customers use (P11) that you and your competitors do not cover, or that competitors use and you do not |
| K6 | How sure are you about this competitor? | Dropdown | I checked it at the source; Several reliable sources agree; Customers told me; It is what I have noticed; It is a guess | Optional | Review: "a guess" |

### 6.7 Tile "Value Proposition"

The text stays (one per Segment). A **draft sentence** is proposed from what the Profiles care about (P9), want and are frustrated by (P17, P18), the needs addressed, and the Offering's benefit (O4); the user adds it with a button, and nothing is overwritten. The tile also lists, as read-only open items: *something customers care about that no offering delivers*, *an offering that answers no need*, and *a benefit you claim that nobody cares about*.

### 6.8 Offering card (tile "Offerings")

| Today | Target |
|---|---|
| Name, **Type** (Product; Service; Hybrid; Other + "Name the type"), **Functional Needs Addressed** | keep; the Type **drives presets**; needs are read **by id** |
| **Function** | stays text |
| **Customer Benefit** | **O4**, plus the note |
| **Content & Scope** | stays text; what else is included is written in it (O9 is not asked) |
| **Purchase & Delivery** | **O3** and **O6**, plus the note |
| **Support & Communication** | **O7**, plus the note |
| **Requirements & Conditions** | **O10**, plus the note |

| Id | Question (plain) | Component | Options | Tier | Reads it |
|---|---|---|---|---|---|
| O1 | What form does it take? (the options follow the Offering's Type) | Dropdown | Product: A physical item; A digital file; A digital product or tool; Online access. Service: A live online session; An in-person session or service; Project work; An ongoing service. Hybrid: asked once for each part, or make one Offering per form. Not sure yet | Core | Presets: which goods and service options pages 2 and 3 show; Review against P16 and P15. **It refines the Type, it does not repeat it** (2026-10-26; "A mix" is the Type Hybrid) |
| O2 | Can customers buy it today? | Dropdown | Yes, now; Almost, after some preparation; In a trial or beta; Still being built; Just an idea | Core | Review: sales planned before it is ready |
| O3 | How do customers buy it? | Dropdown | One purchase; A subscription (regular payments); A membership; A licence; They pay for what they use; A project or contract; A monthly retainer; Not sure yet | Core | **Single source.** Sets Demand "Customers Buy", Delivery "Delivered" and the options of Revenue "Charged" (10.2); Review against G19 |
| O4 | What does it do best for the customer? (up to 3; the first is the main benefit) | Ticks | L1 | Core | Value Proposition draft; check against P9 (O5 merged into it, 2026-10-26) |
| O6 | How does the customer receive it? | Dropdown | Digital delivery, automatic; Digital delivery, by hand; An online or live session; In person; Shipped to them; They collect it; Ongoing online access; A mix; Not sure yet | Core | Proposes **Deliver** channels (7.4) |
| O7 | What help do you give after they buy? | Dropdown | None; Guides and how-tos; Automatic help (chat, emails); Personal help when needed; A dedicated person or team; It depends on the plan or contract; Not sure yet | Core | Proposes **Support** channels and the relationship type (7.4); Review against P20 |
| O8 | Which of their worries does it answer? | Ticks | the worries ticked in P19 | Core | Review: a worry nothing answers |
| O10 | What does the customer need to give you? | Ticks | L11 | Optional | Proposes the Delivery constraints (W3) |
| O11 | What does the customer spend on when they buy this? | Dropdown | L12 | Optional (people) | Which share of the customer's spending it competes for (it replaces G18); an evidence line |
| O12 | Is a minimum age to buy it set by law? (tick all that apply) | Ticks | Alcohol; Tobacco, vapes or nicotine; Gambling, betting or lotteries; Knives or blades; Fireworks; Films and games with age ratings; Credit, loans or buy now pay later; Tattoos, sunbeds or cosmetic treatments; Adult content; Pets; Medicines; None of these; Not sure yet | Optional (shown when G6 or a Profile's age, P1, includes a band below 21) | Shows the main country's minimum age for each tick with its status (10.3); Review: a Segment whose customer range starts below it; a note when the market is multi-sided and the kind is alcohol, tobacco or vapes (a gift); the online age-check note for online sellers |

The card grows by twelve rows and scrolls as every card does; the layout check must pass with it **[D]** (the optional rows can sit behind a fold if it is too long).

### 6.9 Required answers (proposal) **[D]**

Today only a card's name is checked. Proposed, once, per page: Segment: name. Profile: name, one functional need, at least one of P11, P12 or P13. Competitor: name, type. Offering: name, type, O3, one need addressed. Everything else is optional and appears on the Review page.

### 6.10 Information the earlier files expect that has no field

A competitor's website and numeric price; buying timing (dropped); nationality as a list (section 12). Each is a **[D]**: add a field, keep it in a note, or leave it out.

## 7. Business 2 · Customer Engagement, rebuilt as a journey

### 7.1 Why it changes

Today page 2 starts from channels (13 category tiles), then a relationship table, then a demand table; it asks the user to invent the channels. After page 1 the app already knows where the customers look (P11), how they compare (P12), how they buy and pay (P13, P14), how comfortable they are online (P16), how the offering reaches them (O6) and what help they want and get (P20, O7). So the page can **propose** a journey and ask the user to confirm and complete it. Two of its three sections are also tables, not tiles (document 5, item 5.3).

### 7.2 Target structure (per Segment) **[D]**

| Chapter | Tile | Opens | Cards |
|---|---|---|---|
| **Journey** | **Discover** | the channels used at this stage | a **stage card** per channel, and above them tiles of **suggested** channels, each with an Add button |
| | **Evaluate** | the same | the same |
| | **Purchase** | the same | the same |
| | **Deliver** | the same | the same |
| | **Support & Follow Up** | the same | the same |
| **Conversion** | **Demand & Conversion** | one card per Offering | the **demand card** |
| | **Channel Costs** | a read-only table of channel expenses and the cost per customer | none |

The stage names are the app's own. Official and university pages describe the journey as New Zealand's business.govt.nz does (trigger, researching, shortlisting, choosing, buying, follow-up) [CHN-01] and the Open University (problem recognition, information search, evaluation of alternatives, choice, post-purchase evaluation) [CHN-02]: "Discover" is the trigger or problem recognition, "Evaluate" is researching and shortlisting, "Purchase" is choosing and buying, "Support & Follow Up" is follow-up; **"Deliver" has a stage of its own in none of them** (it sits inside buying or after-purchase). It is kept because a business plans delivery separately; **[D]** keep five or fold Deliver into Purchase. The code spells the first stage "Discover" and the specifications "Discovery" **[D]**. Under each stage name the tile shows one plain line ("How customers first hear about you", "How they compare you", "How they buy", "How they receive it", "How you help afterwards"). The 13 channel categories are no longer tiles; the category becomes a field on the stage card, limited to the categories usual for the stage (the app already stores the usual stages of each category). This reverses today's order (channel, then stage, then action). It is the largest change of the plan, and a card is 480 px wide: the stage card is prototyped and run through the layout check before anything else is built on it.

### 7.3 Stage card

| Field | Component | Status | Options |
|---|---|---|---|
| Channel category | Dropdown (combo) | keep, filtered by stage | the usual categories of the stage (L6) |
| Subchannel | Dropdown (combo) | keep | the category's list |
| Links | List | keep | |
| Offerings served | Ticks ("All offerings" first) | keep | |
| **J1** Are you using this channel yet? | Dropdown | new, Core | Yes, it is active; Set up but not launched; Planned; Testing it; I have stopped using it |
| **J2** What do you do here? | Dropdown | new, Core | by stage (below); the existing free action lines stay as a note |
| **J3** How do you keep the relationship? | Dropdown | keep (the relationship type), **suggested** (7.4) | Do-it-yourself help (Self-Service); Personal help (Personal Assistance); A dedicated person or team (Dedicated Support); A customer community (Community); Automatic help (Automated Service) |
| Approach | Text | keep (a note) | |
| **J7** What should this achieve? | Ticks | keep (Get, Keep, Grow), **pre-ticked** (Discover, Evaluate, Purchase: Get; Deliver and Support: Keep; renewal or repeat: Grow) | Win customers (Get); Keep them (Keep); Grow what they buy (Grow) |
| Expenses (+ Add expense menu) | menu | keep | |

**J2 by stage (author's draft; to be approved):**

| Stage | Options |
|---|---|
| Discover | Publish content; Run advertising; Attend or host events; Ask for referrals; Be listed or featured; Contact people directly; Other |
| Evaluate | Share information; Offer a demo, trial or sample; Send a quote or proposal; Show proof (case studies, reviews); Answer questions; Other |
| Purchase | Take an online order; Send an invoice or payment link; Sign a contract; Take a booking; Take payment in person; Other |
| Deliver | Send files; Ship the order; Deliver in person; Deliver online or live; Get the customer started; Other |
| Support & Follow Up | Answer questions; Ask for feedback; Remind them to renew; Offer an upgrade or add-on; Run a community; Other |

**Relationship type per card.** Today the relationship is set per offering. In the journey it is set per stage card (a customer may help themselves while comparing and be assisted after buying), and applies to the offerings that card serves **[D]**.

### 7.4 The proposals (rules; all suggestions the user can ignore)

| Stage | Proposed from | Rule |
|---|---|---|
| Discover | P11, G2 | The ticked categories and subchannels; for a local scope the In Person and Community categories come first |
| Evaluate | P12 | Your website → Website; Reviews and recommendations online, Comparison sites → Marketplace or Website; A demo, trial or sample → Online / Live (digital) or In Person (physical); A quote or proposal → Email; What other people recommend → Referral & Affiliates; A meeting or call → Online / Live |
| Purchase | P13 | Online checkout → Website (Online Store) or Marketplace; An invoice → Direct Payment (Invoice); In person → In Person; By phone or email → Email; A contract or tender → Direct Payment (Invoice); By booking → Website (Booking page) |
| Purchase (payment) | P14 | Debit or credit card → Direct Payment (Card); Cash → Cash; Bank transfer → Bank Transfer; Mobile wallet or payment app → Payment Link (the nearest existing subchannel **[D]**); Invoice → Invoice; Buy now, pay later → no subchannel (a note) |
| Deliver | O6 | Digital delivery → File Delivery; Online or live → Online / Live; In person → In Person; Shipped → Physical Delivery; They collect it → In Person (Pickup); Ongoing online access → Website |
| Support & Follow Up | O7, P20 | Do-it-yourself or automatic help → Website, Automated Email; Personal help → Email, Online / Live; A dedicated person → Online / Live; Community → Community |
| Relationship type (J3) | P20 and O7 | They work it out themselves with no, guide-only or automatic help → Do-it-yourself or Automatic; a little guidance with personal help when needed → Personal help; a formal demonstration with a dedicated person → A dedicated person or team |

Age is not used to pick a channel by rule (section 11.4). The channel categories match the lists in official small-business guidance [CHN-03, CHN-04].

### 7.5 Demand card (one per Offering)

Rows are no longer typed from a source list: **one row is proposed for each Discover-stage channel that serves the offering**, plus "Repeat customers" for a recurring offering and "Contracts or tenders" when P13 includes a contract or tender or P22 says so. The six existing sources keep their formulas; a channel category maps to one of them (Referral & Affiliates → Referrals; Marketplace, In Person, Retail & Wholesale → Marketplace or walk-in; Website, Social Media, Email, Community, Online / Live → Sales funnel).

| Field | Component | Status | Options |
|---|---|---|---|
| Customers Buy | Dropdown | keep, **derived** from O3 | One sale at a time; Every month, until they cancel |
| Cancel / Month (%) | Number | keep, recurring only | |
| Row: channel or source | Dropdown | keep, **proposed** | Referrals; Sales funnel; Repeat customers; Contracts or tenders; Marketplace or walk-in; Other |
| Row: Estimated | Dropdown | keep | Enter a figure; Calculate |
| Row: numbers (visitors, prospects, qualified %, buy %, bids, won %, units, sales) | Number | keep | |
| **D1** What is this estimate based on? | Dropdown, per row | new, Core | L16 without "My costs plus a margin" |
| Basis, Assumptions | Text | keep (notes) | |
| Channels That Bring Them | Ticks | **replaced** by the rows | |
| Expected Sales | read-only | keep | |

`demand.channelIds` is finally read: spend on a channel divided by the customers its row brings gives the **cost per customer** shown in the Channel Costs tile. The app proposes **no default conversion percentage and no sales-cycle length** (11.6).

## 8. Identity · what to ask

### 8.1 What exists (as built, 2026-10-25)

**Page 1, "Definition and Ethics".** Chapter Definition: **Organization** (first tile), **Early Positioning** (the Positioning tile; its name follows the business stage, 8.2), **Mission**, **Vision**. Chapter Ethics: Philosophy, Values, Principles, Manifesto. **Page 2, "Legal Entity":** Founders & Ownership (founder tiles inside), Capability, Registrations, Expenses.

**Prose only:** Mission, Vision and the Ethics tiles. The Positioning tile has four choice questions, the End User questions (asked only for one audience) and a Notes box (8.2). The Organization tile holds the facts of the organization (8.5).

**What other parts read from Identity (checked in the code, 2026-10-25).**

| Identity answer | Read by |
|---|---|
| Country | Currency, the consumption tax's name, the jurisdiction profile, the registration numbers asked for, the activity scheme and its code name |
| Legal Form | The ownership questions (a one-owner form has none), owners' drawings in the financials, the open items |
| Opening Date, with the durations of the Global Settings | The business stage; the plan start; the Review's messages and key dates; the Calendar's key dates; the Positioning tile's name, limits and locks; the exported title |
| Registration Date, legal expenses | Key dates; the plan start |
| Activities | The exports only (as codes with the scheme's initials). **The industry pack of doc 35, 5.6 is not built.** |
| Market Structure, Seller and Buyer Relationship, Audience, Differentiation & Outcome | **The exports, and one step in Business 1:** the Segment card reads the Seller and Buyer Relationship and the audience only to choose and annotate its boxes. No question of any later part reads them yet (8.2, "What the Segment will read") |
| Positioning Notes (the free text) | The Segment shows it behind an "i" note ("Your Positioning (Identity)") on its first two instructions. It shapes no question. |

**So Early Positioning must not ask again what the Organization tile already holds** (the activities, the stage), and the Segment must not ask again what Early Positioning holds (who pays, the kind of market).

### 8.2 The Positioning tile and the Identity questions

> **First published version (doc 33, doc 34).** Single-sided only: the Multi-sided option of I11, the anchor-side rule and the `side:outcome` answers are future features (doc 34, item 5). B2C and B2B only: B2G and G2B in I3, the B2G and G2B audiences of I7b and the locked audiences are future features (doc 34, items 6 and 7); they are built and stay in the code. The buyer's category (Direct, Proxy, Dual-Intent) is a question of its own, and I7b keeps three life stages, so "Proxy Buyers / Gifters" leaves the life-stage list (doc 33, section 5; the built app keeps it until the new structure is built). In the End User block only the relationship and, for B2C, the user's life stage are in the first version: I7f and I7g and the routing of the End User answers into the second Profile are future features (doc 34, items 12 and 13). The tables below describe the built questions as they are.

#### What it asks

The tile keeps its free-text box (the **Notes**, the shared optional note) and gains four choice questions before it (the owner's request, 2026-10-23, the owner's words as written, 2026-10-24). The choices come first and **narrow** what the user has to think about; the Notes then say the rest in the user's own words: what problem the business solves, for whom, and why its solution is different. The same answers are meant to narrow every later list, name the first Segment and Offering and suggest examples (8.2, "What the Segment will read"). Mission, Philosophy, Principles and Manifesto stay prose: nothing downstream could read a list from them.

| Id | Question (the owner's label) | Component | Options (the owner's words; brackets are in the "i") | Saved as |
|---|---|---|---|---|
| I11 | **Market Structure** | Radio, one choice always | **Single-sided Market**; **Multi-sided Market / Platform** | `marketType` |
| I3 | **Seller and Buyer Relationship** (who pays) | Radio where one choice is allowed, ticks with a limit where several are, by the stage | **B2C (Business-to-Consumer)**; **B2B (Business-to-Business)**; **B2G (Business-to-Government)**; **G2B Context (Regulatory/Compliance)** | `customerType` (a list of ids) |
| I7b | One **audience** question for each relationship chosen; frozen until one is chosen; emptied for a relationship that is removed | As I3 | **B2B, Audience Specialization & Scale:** Solopreneurs & Freelancers; Startups & SMBs; Mid-Market; Enterprise / Public Sector. **B2C, Buyer's Life-Stage and relationship with the User:** Proxy Buyers / Gifters; Students / Young Adults; Workers / Professionals / Adults; Seniors. **B2G, Administrative Level (Jurisdiction Scale):** Local Government; Regional Administration; Central Government & Ministries; Institutional / Public Organizations. **G2B, Regulatory Intensity of the target industry:** General Commerce / Mass Market; Specialized Sectors; Heavily Regulated Markets; Cross-border Trade | `audience` (a list of ids) |
| I7c | **Differentiation & Outcome**; asked once, or once for each side of a platform (below) | As I3 | **Cost-driven**; **Convenience-driven**; **Compliance, Risk & Security**; **Status & Premium** | `outcome` (a list of ids; `side:outcome` for a side) |

Older answers read as lists: a single id is a list of one, and "both" is B2B and B2C. I5 (brand personality) is parked (8.3); I6 and I7 are withdrawn (I6: the Harvard Business School's two routes already say the price, a premium price or lower costs [FUN-19]; I7 was merged into I7c).

#### What the words mean (corrected 2026-10-25)

Three different things were mixed in the earlier text, and the sources separate them [FUN-34 to FUN-39, FUN-43]:

1. **Customer and user.** The **customer** is the user who pays (or an entity that pays); the **user** is who uses it. They can be the same people, or different (a parent who buys for a child, an employer who buys software its staff use, an insurer who pays for a patient). The **economic buyer** approves the budget; the functional and technical buyers are other roles in the purchase. **The Seller and Buyer Relationship question is about the economic buyer** (who pays), and it says so in its "i". The buyer who is not the user is **not** a question of the market structure.
2. **Single-sided and multi-sided market.** A **single-sided market** sells a product or service directly to one audience of buyers; one group pays, and the product does not need another group to be worth buying. A **multi-sided market (a platform)** connects two or more distinct groups that transact with each other, and its value to one group depends on the other (a marketplace, a delivery app, an advertising-funded service). Each group is a **side**. Any market brings buyers and sellers together, so "getting both sides on board" alone does not make a platform; the structure does [FUN-36, FUN-38].
3. **Where the buyer is not the user, in a single-sided market.** A parent who buys for a child, or a corporate buyer for its staff, is a buyer-and-user split in a **single-sided** market. The Positioning answer for it is the B2C life stage **Proxy Buyers / Gifters** (the buyer pays and decides, the product is for someone else); other cases (an employer, a hospital's procurement) are a second Profile with P21 "They will use it" (6.3); there is no Segment question for it.

**Platforms and the stage.** While **Planning and Launching** a platform business answers every question for **one side only**, the *anchor side* (the critical side for the start, usually the one that pays); the one-choice limits enforce it and the "i" says it. While **Managing and Growing** several relationships can be chosen, each opens its own audience question, and Differentiation & Outcome is asked **once for each side** ("Differentiation & Outcome (B2C)", "(B2B)"), the answers saved as `side:outcome` (for example `b2c:cost`). In a single-sided market the same relationships are one hybrid, and the last question is asked once.

#### The End User questions (built 2026-10-26; owner's request)

**Why.** The owner's life-stage answer **Proxy Buyers / Gifters** says the buyer pays and decides but someone else uses the product. Until now nothing followed from it. When it is chosen, Early Positioning asks **four short, broad questions about the End User**, enough to give the End User's Profile its first shape (the Segment proposes it as a second Profile, 6.3). They are asked only for that answer: choose another life stage, drop B2C, and the answers go (`fitPositioningToStage`, `legal/shared.tsx`). Saved in `endUser`, a list of ids prefixed by the question.

| Id | Question (label) | Component | Options | Limit by stage | Saved as |
|---|---|---|---|---|---|
| I7d | **End User Age Group** | Radio or ticks | Babies and young children (0 to 5); Children (6 to 12); Teenagers (13 to 17); Adults (18 to 64); Older adults (65 or older) | As the audience: 1, 1, 2, any | `age:early`, `age:child`, `age:teen`, `age:adult`, `age:older` |
| I7e | **Buyer's relationship with the End User** | Radio or ticks | Parent or carer; Another family member; Partner, friend or colleague (a gift) | As the audience | `rel:parent`, `rel:family`, `rel:friend` |
| I7f | **Who chooses: the Buyer or the End User** | Radio, always one | The Buyer chooses alone; The End User asks, the Buyer approves; The End User chooses, the Buyer pays | 1 | `decides:buyer`, `decides:asks`, `decides:user` |
| I7g | **What matters most to the End User** | Radio or ticks | Enjoyment and fun; Comfort and ease; Safety and care; Learning and growth; Looks and belonging; Practical use | As the outcome: 1, 2, 2, any | `wants:enjoy` and the other five |

**Where they are asked.** Early Positioning, right column, directly under the life-stage question and above Differentiation & Outcome, as `legal-entity-org-section` blocks of the same kind (labels over a radio or tick group, an "i" on each). **No new component, no new layout.** The Positioning tile lists the chosen answers as bullets; the exports carry them as "End User".

**Sources and status.** The age groups join the bands of 6.3 (the UK Children's Code stages 0 to 5, 6 to 9, 10 to 12, 13 to 17 [AGE-03]; adults to 64 and older adults from 65 [AGE-14]) in five broad groups. The buyer, user and decider roles come from the buying-centre roles taught by The Open University (user, influencer, buyer, decider, gatekeeper; opened 2026-10-26, a page about organisational buying that the app borrows for a consumer's purchase) and are cited in the "i" of I7e and I7f. **The option lists of I7e and I7g are the author's** (no official or university list of them was found) and fail rule 14 until the owner approves or amends them **[D]**. Children's and young people's rules (online consent, minimum ages) are in 10.3 and in doc 30.

**What reads them (designed, not built).** The Segment proposes a second Profile for the person who uses it: its age from I7d (P1), "They will use it" ticked (P21), its first wants from I7g (P9 and P17), and the buyer's own Profile from I7e and I7f (who decides). I7d under 18 shows the children's note on the Segment (6.3) and starts O12.

#### How the stage shapes the questions

The earlier the business, the narrower its focus. The stage is not chosen: it is worked out from the Opening Date and the durations of the Global Settings (8.2a). An organization with no Opening Date is Planning.

| Question | Planning | Launching | Managing | Growing |
|---|---|---|---|---|
| Seller and Buyer Relationship | 1 | 1 | 2 | any |
| Each audience question | 1 | 1 | 2 | any |
| Differentiation & Outcome | 1 | 2 | 2 | any |
| Market Structure | 1 | 1 | 1 | 1 |

- A question of one choice is a **radio**; a question of several is the existing tick group `BusinessTicks` with its optional `max`, which **locks** the other options once the limit is reached (grey, not ticked; no warning, no red mark; a ticked option can always be unticked), and the limit stands beside the label ("2 max", the existing `business-foundation-tick-note`; it is one unbreakable piece, on the label's row where it fits and on the next row where it does not). A free question has no note and no lock.
- **Locked while Planning and Launching:** Central Government & Ministries (B2G) and Heavily Regulated Markets (G2B); **open from Managing** (`lockedAudience`). Local Government and General Commerce / Mass Market are the named beachhead in their "i" and are open at every stage. The owner's "hard-locked or hidden" is built as **locked and visible**; hiding them is the alternative.
- **The answers follow the stage (owner, 2026-10-25).** When a new Opening Date or duration puts the business in another stage, each question is checked against that stage's set-up. A question with more answers than the stage allows, or with an option it locks, goes back to its default, **empty**; a question that still fits keeps its answers; the last question is also emptied where its form changes (once, or once for each side). The check runs on every page of the Conversation (`fitPositioningToStage`, `legal/shared.tsx`, called from `Conversation.tsx`).
- **The name follows the stage:** **Early Positioning** (Planning, Launching: a temporary, highly targeted statement that locks the first market and attracts the first customers), **Core Market Positioning** (Managing: the firm positioning once the business has found its product-market fit), **Corporate & Portfolio Positioning** (Growing: the umbrella over the statements of the products and markets). The tile, its rail entry and its dialog heading carry it (`positioningName`); the saved answer keeps the key `positioning`. The exported heading is **Early Positioning Statement**, **Core Market Positioning** or **Corporate & Portfolio Positioning** (`positioningDocumentTitle`).

#### How the options react to each other

| The user does | What happens |
|---|---|
| Opens the dialog with no relationship chosen | The audience question is frozen with the hint "Choose a seller and buyer relationship first"; the outcome question is open |
| Chooses a relationship | Its audience question opens; nothing answered is lost |
| Chooses a second relationship (Managing, Growing) | A second audience question opens beside the first |
| Removes a relationship | The answers of its audience question go; those of the others stay; where outcomes are per side, its outcomes go |
| Chooses Multi-sided while Planning or Launching | Nothing splits; the "i" says to answer for the anchor side |
| Chooses Multi-sided while Managing or Growing, with two or more relationships | The outcome question is asked once per side; plain outcomes already chosen are dropped |
| Switches back to Single-sided | The outcome question is one question again; the side outcomes are dropped |
| Chooses a relationship while Single-sided | Nothing else changes: the market structure does not restrict the relationships, only the stage's limit does |
| Reaches a question's limit | The unchosen options lock; unticking one unlocks the rest |
| Chooses B2G or G2B while Planning or Launching | Central Government & Ministries, or Heavily Regulated Markets, is locked |
| Changes the Opening Date or a duration so the stage changes | Limits, locks, the tile's name, the "i" notes and the exported title change at once; questions whose answers no longer fit go back to empty |
| Writes in Notes | Nothing else changes |

What does not react, on purpose: the market structure does not limit the relationships; an audience answer does not limit an outcome; the outcome list is the same for every relationship; the Notes depend on nothing.

#### The "i" notes and their sources

Each question's "i" lists every option (the words that were taken out of the labels are there), says what the question decides and what the **current stage** allows ("At this stage (Launching): choose up to 2", with the options not yet open and when they open), and shows only what holds now (the multi-sided point of the other stage, and the sentences about locks and the beachhead where they do not apply, are left out). Every "i" lists all its points (`fullList`), because the three-point cap would cut the options. References, all opened on 2026-10-25 [FUN-45]: HBS Institute for Strategy & Competitiveness, *Strategic Positioning* (premium price or lower costs; "stuck in the middle"), for Differentiation & Outcome; eCornell, *How to Write Market Positioning Statements* (target market, differentiation, frame of reference, reason to believe), for the relationship; Stanford E145 (Moore's two-sentence template), for the relationship and the outcome; the SBA's *Market research and competitive analysis* (customers by age, wealth, family status and interests; a business "won't be for everybody"), for the audience; HBS Online, *Crafting the Perfect Brand Positioning Statement* (age and life stage), for the life stage. **No accepted source was found for the multi-sided definition, the administrative levels and the regulatory intensity** (the OECD note could not be opened), so those "i" notes cite none and stand on the owner's wording. Every positioning template read has the same parts (target, need, category, benefit, competitor, difference, reason to believe) [FUN-24, FUN-29, FUN-40]; the four bases of segmentation (geographic, demographic, psychographic, behavioural) belong to the **Segment** of Business 1, not here [FUN-41].

#### What the Segment will read (designed 2026-10-25; first step built)

**Built (2026-10-25, first step; no new question):** the Seller and Buyer Relationship decides which of Demographics and Business Data the Segment asks (a box with text is never hidden; several relationships or none keep both; for businesses only, Business Data has no tick); the audience chosen in Identity is shown in the "i" of the box it belongs to. **No question was added**: a "Who uses it?" picker (G24) was built first and **removed the same day**, because the owner has no such question (6.3). Everything else in the table below, and the questions G2 to G8, G10, G13 to G16 and G23, is **not built**. Which questions exist, where, and what they should be called or where they should sit is in doc 29, section 10.

Otherwise nothing of the above is read by Business 1 (8.1). The design, for the owner to approve **[D]** (the B2G, G2B and multi-sided rows are future features in the first version, doc 34); each rule only suggests a default, and warns where something looks wrong, as 6.3 already does:

| Identity answer | What it does to the Segment (a starting value the user confirms; never a hidden option) |
|---|---|
| **Country** (Organization) | G3 starts there; the currency symbol of G8 and G16; the national lists of G7, G14, G15 and G23; the examples; the equality notice |
| **Legal form, founders** | Nothing: they describe the seller, not the customers |
| **Activities** (industry, pack) | Suggests the Segment's name and the kinds of business of the Profiles (doc 35, 5.6, not built). **Never fills G15**: G15 is the customers' industry, not the seller's |
| **Opening Date, Registration Date** | Nothing directly; through the stage |
| **Business stage** | Planning and Launching: **one Segment**, drivers only; the checks (G4, G5, G16) are held back and figures are labelled forecast. Managing: up to two. Growing: any number. A stage change flags a Segment that no longer fits and deletes nothing. (The app's instruction text says "1 primary segment (maximum 2)"; it is the owner's wording and stays until the owner decides) |
| **B2C** | Box 1 (people) is asked; Box 3 is not |
| **B2B** | Box 3 is asked; G23 offers the four types (a public body allowed); Box 1 is not |
| **B2G** (future feature, doc 34) | Box 3; G23 starts at "A public body" (not asked); G15 starts at "Government and public administration" (the pack may start at Education or Health); the tender row; the administrative level is shown in the "i" |
| **G2B Context** (future feature, doc 34) | Box 3; G23 asked; G15 asked first, the regulated industries listed first; the regulatory intensity is shown in the "i" and a Heavily Regulated Markets answer adds a Review item |
| **Several relationships** | One Segment frame for each (people first), within the stage's limit; the second starts with G2 and G3 copied |
| **Multi-sided** (future feature, doc 34) | Each side is one of the relationships, so **each side is its own Segment frame**, with its own outcome (I7c). There is no Buyer part or User part (6.3) |
| **Single-sided with several relationships** | A hybrid: still one frame for each |
| **Audience: scale** | Solopreneurs & Freelancers: G23 starts at "Self-employed or freelancer" and G14 is skipped. Startups & SMBs: G14 starts at "1 to 9" to "10 to 49". Mid-Market: "50 to 249". Enterprise / Public Sector: "250 to 499" and over, and "a public body" is offered. The mapping is the author's **[D]**: the EU's own SME line is under 250 employees, so the owner's Mid-Market lies inside the official medium size |
| **Audience: life stage** | Proxy Buyers / Gifters: G6 starts at an adult range and a **second Profile for the person who uses it** is proposed (P21 "They will use it"). Students / Young Adults: G6 starts at 18 to 24 (it may widen to 16 to 17, with the under-18 box) and G13 at "In full-time education". Workers / Professionals / Adults: G13 starts at employed or self-employed; no G6 range is set, because 25 to 64 is wider than three bands ("choose up to three"). Seniors: G6 starts at 65 to 74 and 75 or older, G13 at "Retired"; comfort with online tools (P16) is **not** inferred from age |
| **Audience: administrative level, regulatory intensity** (future features, doc 34) | Shown in the "i" of Business Data; Local Government keeps the tender row visible |
| **Outcome** (I7c; for each side of a platform) | Frames the Value Proposition prompt and the Competitor questions, and **replaces G17**: Cost-driven starts the Value Proposition at "Lower price" and asks K1 (their price against yours) first; Convenience-driven at "Ease and convenience" and "Speed" and P16 and P20; Compliance, Risk & Security at "Safety and low risk" and "Trust and reputation" and the worry "Risk or security" in P19; Status & Premium at "Quality and results" and "Shared values or identity". They are starting ticks in P9, O4 and K2 (list L1) that the user can change |
| **Positioning Notes** (free text) | Shown behind the "i" ("Your Positioning (Identity)"); it shapes no question |


A second Segment starts from the first one's answers. Build order proposed: the relationship and the market structure; the audience defaults; the outcome and the stage; the country and the industry pack.

#### Not built, and open decisions **[D]**

- **The output templates** of the owner's text (Template A, single-sided: "For [niche] who are struggling with [pain point], our product is a [category] that delivers [outcome]. Unlike [status quo / competitors]."; Template B, the bridge for a platform), which need three things no question asks (the pain point, the category, the status quo): add a draft line with those three as marked blanks, or three short cells, or leave the Notes as the only text. Shorten the Notes' prompt to "What problem are you solving, for whom, and why is your solution different from the competition?"; add the optional "What makes people believe it?" (reason to believe, in every template).
- **The Future Positioning tab** and its strategic shift matrix (optional while Planning and Launching, mandatory while Growing), the strategic output (a present strategy or a transformation roadmap), the strategic goal line of each stage, and the number of statements by stage (one, one, one with two angles for a platform, several).
- **The time horizon** beside the stage (current: today to 12 months; future: 3 to 5 years) and a runway question: **the Financial Foundation already computes the Financial Runway, so it should be read, not asked again**; the owner's rule is a lock with a short note, not a red alert.
- A hybrid **B2B2C** option, tool-tips for the stages, and the export and the Foundation note still saying "Positioning".
- **A source** for the multi-sided definition, the administrative levels and the regulatory intensity; the owner's lists are the owner's own wording (rule 14 allows it). Supporting literature named by the owner and not opened: Kotler and Keller, *Marketing Management*; Moore, *Crossing the Chasm* (its slots opened in Stanford E145 [FUN-28]); Osterwalder and Pigneur, the Business Model Canvas and the Value Proposition Canvas; Evans, *Platform Economics* (text read from the owner's PDF [FUN-43]).
- Small-team limits from the owner's text (beachhead market, product limit, runway and pivot milestone, time-boxing) are Strategy or Business matters, not Positioning; parked until the owner says where.

#### The other Identity questions

| Id | Question | Component | Options | Type | What it saves or reads |
|---|---|---|---|---|---|
| I1 | What does your business do? (up to four activities, in order of importance) | Cascade of dropdowns, one path per activity | The country's own levels (doc 35, 5.7), down to the final code; a shortlist plus "Show all" **(not built: every dropdown lists all its entries)** | Driver | Fills the code at the end of each activity; the industry pack of doc 35, 5.6 (example Segment, Offering, skill areas, resource groups, Discover channels) and the drafted Description sentence are **not built** |
| I2 | (merged into I1, 2026-10-23) | | | | |
| I4 | (withdrawn 2026-10-23) | | | | Where your customers are is asked once, on the Segment (G2) |
| I5 | How do you want to be seen? | Dropdown | Aaker's five dimensions of brand personality (Stanford GSB, 1997) [FUN-20]: Sincerity; Excitement; Competence; Sophistication; Ruggedness | Parked | Brand starting points (8.3) |
| I8 | Business stage | **Not a question**: worked out from the Opening Date (8.2a) | Planning; Launching; Managing; Growing (the SBA's four headings [FUN-18]) | Driver | The estimate basis (D1: "sales I have made" and "website data" appear from "Manage your business"); labels figures forecast before launch and actual after; sets the Positioning limits |
| I9 | What do you want the business to become? | Dropdown | Keep it small and steady; Grow steadily; Grow fast; Build it to sell or hand over; Not sure yet (the UK Longitudinal Small Business Survey asks about growth aims [PLN-05]; the two extra options are the author's and fail rule 14) | Check | Later: suggestions for the funding route and the hiring question (C4) |

The legal-form label is matched by text to decide drawings or salary, which breaks for a free-text "Other" and translated labels; document 5 (I6) already asks for a legal-form *kind* and this plan keeps that request. The activity code that I1 suggests does not replace the typed code; it fills it in for the user to confirm.

### 8.2a The business stage, the Opening Date and the key dates (as built, 2026-10-24 and 25)

**The stage comes from the Opening Date (the owner's rule).** The user sets the Opening Date (a field of the Organization tile), and the stage follows: **before it, Planning; from it, Launching; then Managing; then Growing; with no Opening Date, Planning.** Each stage lasts as long as the Global Settings say (`stageOf`, `BusinessStage.ts`). The stage is shown, never chosen; the stored `businessStage` is legacy and ignored. The Conversation page works the stage out once and hands it to the pages (`businessStage`).

**The durations are set in the Global Settings, section Business stages,** laid out as the Assets are: the Opening Date as a record under the title (like the Plan Start), and a table **Stage, Start, End, Duration, Time in:, Reset** with one row for each stage and one whole number each, each with its own Reset (shown when changed) and a Reset for the table. **Planning 3 months** (ends at the Opening Date, counted back from it), **Launching 12 months** (from the Opening Date), **Managing 12 months** (after Launching), **Growing 3 years** (after Managing; the only one in years). With the defaults, Launching ends 12 months after the opening, Managing 24, Growing 60 (the owner's windows). Start and End are the days each stage runs from and to (blank until an Opening Date exists); the row of the stage the business is in today is highlighted and bold; the first column is as wide as the label column above it, so the Start dates stand under the Opening Date. A duration left empty or at 0 takes its default (`stageDurationsOf`); a decimal point, or more than 120 months (50 years), is refused. The stage, the limits and locks, the tile's name, the exported title, the Review's messages and the key dates all follow the durations. **[D]** The defaults for Managing and Growing are the owner's windows made into durations; the owner may want others.

**The timings are indicators, written on the Review** (`stageMessages`, a "second look"): while Planning, the months to the Opening Date and how long the planning has run (a warning when it has run longer than its duration); while Launching, "month 7 of 12", the months left to prove the Early Positioning Statement or change it, and the date; while Managing, the months left of the Core Market Positioning's horizon; while Growing, the year of the stage and the end of the window of the Corporate & Portfolio Positioning. An organization with nothing started has none.

**Plan start counts the legal expenses (the owner's decision).** The plan's first month is the earlier of the Opening Date and the earliest cost, **a Business card's or a Legal Entity expense's** (`legalExpenseDates`; a one-time expense with no date falls on the formation's). Because of it: the forecast and the documents start earlier; **Sustainability counts a fixed cost only from the month its own Start date falls in** (and to its End date), as the cash flow does; and the Business Plan's Financial Plan section starts at the derived plan start (the generic page export of the Business System still reads the stored one, an older limit).

**Key dates (owner).** The milestones of the organization, past and to come, in time order: **Plan starts, Organization registered, Opening Date, Launching window ends, Managing window ends, Growing window ends**, each with how long ago or how long is left (`KeyDates.ts`). **On the Review** they are a section, "Key dates" (the past ones quieter; not counted among what is left to look at); **on the Calendar** they are one kind of date, "Key dates", listed first and recommended.

**The Review shows only the open Organization; the Landing page's header has a "Review" button for every Organization** (each folded with its count; Back returns to the Landing).

### 8.3 Brand starting points from Identity (parked)

**Parked.** The owner asked on 2026-10-23 to ignore the Brand system for now. This section and the research behind it (`02-references.md`, BRD) are kept for later; nothing in it is planned or built until the owner lifts it, and the question I5 is asked only then.

**What the Brand System asks today.** One page, two chapters. *Ambassador*: four free texts (Aesthetics, Body Language, Communication & Voice, and Imprint, which stores the first and the lasting impression). *Style*: Colours (six slots; each has a role, a name, a HEX value and a usage note), Typography (three slots with a role, a typeface name typed freely and a purpose; a five-level text hierarchy in pixels), Icon & Logo (one file each, SVG or PNG, 50 KB) and Brand Images (two to five). The app already shows help lists with no stored value: 11 colour associations (no cited source), colour combinations, five typeface styles (serif, sans-serif, slab serif, script, display), seven shapes and eight image kinds (product, people, environment, process, lifestyle, detail, abstract, editorial), and a live contrast verdict per colour. **Nothing reads Brand answers except the documents, the export and the open-items check**, so the starting points below are new.

**The starting points.** Each option of I5 proposes a set. They appear as suggestion tiles with an Add button on the Colours, Typography, Icon & Logo and Brand Images tiles, and as a voice note under Communication & Voice, each with a one-line reason and its evidence strength. Adding one creates the same card the user would have created; the user's own choice always wins.

| I5 option | Colour families | Typeface style | Shapes | Image kinds | Voice |
|---|---|---|---|---|---|
| Warm and honest | soft warm tones, greens, soft blues | sans-serif (humanist) or a friendly serif | circle, organic shapes | people, lifestyle | plain, friendly |
| Lively and bold | red, orange, bright saturated colours | display or a rounded, expressive sans-serif | triangle, abstract shapes | process, abstract | energetic, informal |
| Capable and reliable | blue, grey, restrained colours | clean sans-serif | square, rectangle | product, detail | clear, precise |
| Refined and premium | black, deep purple, muted neutrals | an elegant serif or a light sans-serif | circle, abstract shapes, fine lines | editorial, detail | measured, polished |
| Tough and practical | brown, dark green, earth tones | slab serif or a heavy sans-serif | hexagon, square | environment, process | direct, short |

**How strong is the evidence, column by column** [BRD-01 to BRD-11]:

| Part | Strength | Basis and limits |
|---|---|---|
| The five personalities | moderate | Aaker (1997), US sample, five dimensions: sincerity, excitement, competence, sophistication, ruggedness; a three-country follow-up found ruggedness US-only and competence absent in Spain (Japan added peacefulness, Spain passion) |
| Colour families | moderate | Experiments (Labrecque and Milne 2012, US): red with excitement, blue with competence, pink and purple with sophistication or sincerity, brown with ruggedness; colour meaning varies across cultures (Madden and others 2000, Aslam 2006, search excerpts), and the Western mapping is stated as such |
| Typeface style | moderate | Typeface design dimensions give different impressions (Henderson, Giese and Cote 2004); fit with the kind of product matters (Doyle and Bottomley 2006); the style labels in the table are the author's mapping, not a finding |
| Shapes | moderate for liking, weak for personality | Curved outlines are preferred to angular ones (Bar and Neta 2006); natural, harmonious logos were recognised best (Henderson and Cote 1998); round-friendly and angular-strong is extrapolated |
| Image kinds, voice | weak | No peer-reviewed source found; the mapping is the author's and is labelled "a suggestion" |
| **Industry** | **not used for colour** | Only one abstract-level content analysis of large global brands' logo colours was found, descriptive only; industry affects one suggestion, the typeface fit |
| **Price position** | **not used** | No source links price position to colour, type or shape |

**Constraint on every colour suggestion:** WCAG 2.2, success criterion 1.4.3: text needs a contrast of 4.5:1 (3:1 for large text) against its background, logotypes excepted [BRD-11]. A colour is suggested for text only if it can reach that, and the app's contrast note applies to it. **Found in passing:** the app's contrast note cites WCAG 2.1 and the 11 colour associations carry no source **[D]**.

### 8.4 Brand and Strategy: the rest

Not changed by this plan. Strategy could later read the competitors' SWOT notes as suggestions, and I9 as a compass suggestion; the Brand's voice tile could show P9 beside it **[D]**.

### 8.5 The Organization tile (page 1): layout

Settled with the owner on 2026-10-23; **built 2026-10-24 and 25.** The Organization is the first tile of page 1 (Definition), in the Description's place; its Notes box is that page's saved Description (the old Main Activity text where nothing was written there). Page 2 is named "Legal Entity" and no longer has the Organization tile. The export, the Business Plan and the open items read the new answers: the Activities as codes with the scheme's initials (the export names codes only, not their titles), the dates, the legal form; the open items of the organization point to page 1.

**Also built with it (the Legal Entity page).** **One-owner forms (2026-10-24):** where the legal form has one owner in law (Sole Proprietorship, Sole Trader, and the like) there is nothing to ask about ownership, so the Founders & Ownership dialog is the founder's card itself, with **no number and no head** (one person needs no number): its first row is **the Name cell and, on the card's second column, the Capital as an optional field** (the tick box and its word `Capital ($)`, the amount cell appearing under it once ticked, as every optional field of the page does: `OptionalField`; **unticked (the default), the tick and its word stand on the Name cell's own line** (centres 0.5px apart: 281.7 and 282.2 px); **ticked, they move up to the Name label's line and the amount cell stands level with the Name cell** (the row is 78px high in both states, so nothing under it moves); the tick's line is the Name label's line, `--label-line`, so the two labels' centres and the two cells' tops and bottoms are on one line: measured 43px cells, tops 260 and bottoms 303 px on both), the Capital over the same column as a skill's kind (14em wide on every row), then the founder's roles, experience, achievements and skills. There is no ownership table and no "Founders contribute capital" tick: the capital's tick switches the capital on, unticking it empties it and switches it off. **The amount cell takes only a figure** (`limitedNumberText` with the money limit, like every cost, price and expense cell: a letter is refused and the box keeps what it had); the cost filter's From and To cells of the capability overview now do the same. **Capital makes no expense** (it had made one: an expense of a ticked requirement whose own expense was missing was made by whatever the next edit was; an expense is now made only when the requirements change, and one the user removes stays removed). **Founders built 2026-10-24:** the Founders & Ownership dialog is a nested card: **the Ownership itself in the opened master tile** (the founders' names, their shares and capital, and the totals), and, **under a divider line** (edge to edge, 12px of space either side), **one tile for each founder named there** (its dialog is the founder's card: roles, experience, achievements, skills); the tile on the page lists **the founders' profiles, each name a link that opens that founder's card in the dialog** (no longer the names with their shares); the Capability tile stands beside it. **The Legal Entity page's frame is headed "Legal Entity"** (the chapter's name, centred over the tiles as the Strategy's "Situation & Direction" is; a page of one chapter has its heading without a number). **One chapter has the size of one of two** (measured at a 1500px window: the frame 688 by 736px, its tiles 325px, 13px of padding, the heading 12px over the tiles: the same as each frame of Definition and Ethics; it had been 700px wide, 12px more). **A page of one chapter stands at the left, as the Strategy's does** (the Legal Entity page, and every column page drawn as tiles with a single frame).

**Not yet built:** the shortlist with "Show all" (every dropdown lists all its entries, in the official order), the completeness rule for the primary activity, and the industry pack of doc 35, 5.6.

**Pages.** Page 1, chapter Definition, has four tiles in this order: **Organization** (takes the Description's place, first), Early Positioning (named by the business stage, 8.2), Mission, Vision. Ethics is unchanged. Page 2 has one frame with four tiles: **Founders & Ownership** (the founder tiles of the old chapter "Founders & Capability" become sub tiles inside its dialog: Ownership first, then one tile per founder), **Capability** (its own tile for now; it changes when Business is reached), **Registrations** and **Expenses**. Page 2 is named **Legal Entity** (the owner, 2026-10-23; built 2026-10-24: one frame with four tiles, Founders & Ownership, Capability, Registrations, Expenses; the Founders Profile is no page or frame of its own, a hidden section that keeps its saved answer). The chapter hue of Definition is purple (the "Create" work colour, `#8a6bd1`); under the layout rule the Organization tile takes it and no tile is an exception.

**The dialog** is one smooth scroll, no steps: two columns, a divider line across, and the Notes below.

```
LEFT: where it is                       | RIGHT: what it is and does
Organization Name                       | Legal Form (+ Name the legal form)
Country (and State or Region)           | Registration Date (always shown)
Address (free text)                     | Opening Date
                                        | Activities (i)
                                        |   Primary  SIC 62012            [+]
                                        |   Secondary  SIC 74100          [x]
                                        |              Industry, Division, Group, Class  [dropdowns]
-------------------------------------------------------------------- (a divider line across both columns)
Notes (the page's Description)  [auto-growing, the whole width]

(The business stage is not asked here: it follows the Opening Date, 8.2a. Who pays, the kind of market, the audience and the outcome are on the Early Positioning tile, 8.2.)
```

**On the page** the tile shows the name in bold, the legal form, a divider, then the address; until something is written it shows the first line of what the column asks.

**The fields** (every field is a `FieldRow pair`: label above, control below; `nested` after the first):

- **Organization Name** (`TextBox`), **Country** and **Legal Form** (`OptionPicker`), **Address** (`StrategyTextArea`, class `legal-entity-address`, free text). The country drives the legal forms, the activity scheme and its code name, the registration numbers, the currency and the date format. Legal Form is the country's official list, in the official order ("Other" asks for a name) and stays frozen until a country is chosen; it decides what is asked later (a form with one owner in law has no ownership questions).
- **Registration Date** (`DateCellInput`), **always shown and independent of the Registration Number** (owner, 2026-10-26): the date does not need a number and the number does not need the date. It cannot be later than today or later than the Opening Date. The warnings that go with it (a date that has not come; a company formed after the Opening Date) stand under it. The Key dates read it whenever it is filled.
- **Opening Date** (`DateCellInput`, with an "i"), saved in the Global Settings (`openingDate`). It decides the business stage (8.2a), the plan start where it is the earliest date recorded, the key dates and the Review's messages, and it can be changed at any time. Registration Date and Opening Date stand one under the other: side by side they do not fit a column that ends before the x column.
- **Activities:** below.
- **Notes** is the shared optional note, `OptionalNote` (a tick box and the word, the box opening on ticking; bullets and numbered lists, regular weight, grows with its text), named **Notes** with the placeholder "Add a note". It still saves the page's Description (its field key stays "Description"), which the Business Plan prints.

**How the options react.**

| The user does | What happens |
|---|---|
| Chooses or changes the **Country** | The Legal Form, the State or subdivision and the activities are cleared (nothing carries over to another country), and so are the registration numbers issued by the country left; the activity scheme, its level names and the postal label change to the new country's |
| Has no country yet | Legal Form is frozen |
| Chooses a **Legal Form** | A one-owner form removes the ownership questions on the Legal Entity page; "Other" asks for a name |
| Changes an activity's **level** | Every level below it is emptied, and the code at the end of that activity empties |
| Adds **activities** | Up to four; the "+" disappears at four and returns when one is removed; only the primary is required |
| Fills or empties the Registration Number | Nothing happens to the Registration Date (it is independent) |
| Sets or changes the **Opening Date** | The stage is recalculated (and with it every limit, lock, name and title, 8.2), the plan start may move, the key dates and the Review's messages update |

*Activities, the Performer pattern.* **Only the primary activity is required; Secondary, Tertiary and Quaternary are optional** (a row exists only once the "+" has added it, and its x takes it away). The "i" of "Activities" says so: "The primary activity is required; the others are optional, up to four in all. Each one ends in one official code of your country (the SIC code in the UK)." It changes with the country's code name (doc 35, 5.8). The list is the Performer list of an activity (`business-capability-performers` holding one `business-capability-performer` row per activity: 8px between cells, every cell 44px, the box buttons 32px, all on one centre line):
- Each row: the **sub-label** (`FieldLabel`: Primary, Secondary, Tertiary, Quaternary; 92px, the same width on every row), the **cell**, and the **x column**.
- **The "+" is in the first row's x column** (`AddButton shape="box" small`, "Add activity"), as the Performer's is; every other row has the remove x (`RemoveButton`). At four activities the "+" gives way to the empty slot (`business-capability-performer-slot`), so the cells still end at one x.
- **A finished activity** (it has its code) is folded. The **fold arrow** (`FoldArrow`, the label arrow) stands **inside the sub-label, left of its words**, as the label-arrow rule says (its glyph on the content edge, the words 26px from it; arrow, then "Primary"; the arrow points right when folded and down when open, so an open one can be folded too). **The code with its scheme's initials, in bold, stands on the same line, next to the sub-label** ("Primary  SIC 59112"; the code label of the country, doc 35, 5.8: SIC, NACE, NAICS, ANZSIC, BIC), and **under them, from the column's left edge, the last category** (the class, or the sub-class where there is one) as one plain line in regular weight, **not a link and not blue**; a name longer than its place ends in an ellipsis and **slides across as a marquee under the pointer** (the slide the long tile titles and the text links already have; it needs the same small hook for plain text). The code and the name are 6px apart vertically; the arrow, or the folded line, opens it. **Every text of the list is the body size (18px) and the labels' own weight and colour**: the sub-labels and the level names are labels (regular, the label colour), the code is semibold and the name regular in the text colour, as the cells' values are (measured: 18px on all of them; the code and name had been 16px, the dialog's default). **The code stays beside the sub-label while the row is open** (a finished row that is opened to be changed keeps its code in view); what differs between the two states is only what stands under the sub-label (the name, or the dropdowns) and nothing else: **the head row is 44px, a cell's height, in both states**, its arrow, sub-label, code and button on the centre line, so the Primary row is centred on the Organization Name's box whether it is folded or open (measured: the centres of the box, the row, the sub-label, the code, the arrow and the "+" are one line in both states).
- **An open activity** shows, under its sub-label, the cascade's dropdowns, each as a label above an `OptionPicker` (Industry, then the country's own level names), starting on the column's left edge (the edge of every label and control of the column, the folded lines too) and ending 8px before the x column's left edge, **the edge every control of the right column ends on** (Business stage included: measured 413 to 691 px for the column's labels, the five dropdowns and the Business stage; the "+" and the x from 699 to 731 px). The level labels carry the country's names and "i" (doc 35, 5.8).
- One left edge for everything under a sub-label (the folded lines and the dropdowns) and one right edge; every "+" and x has one right edge (measured in the mock at the 694px dialog: left 389, right 661, x 669 to 701 px).

*Measured in the mock (694px dialog, 3 loops).* Loop 1, alignment: the two columns start on one line; cells 44px, buttons 32px; the centres of the sub-label, cell and x of each row are equal; the "+" and the x have one right edge. Loop 2, behaviour: "+" adds a row up to four and disappears at four; an x removes a row and the "+" returns. Loop 3, widths: no sub-label is clipped; the folded cells and the dropdowns share their edges.

*Columns, divider and rows (owner, 2026-10-24; built as `.legal-entity-grid-organization` in `11-legal-entity.css`).* Two columns of sections, each section a label over its control (6px), the sections **12px apart in both columns** (the rule; no column has a gap the rules do not give it), the columns 25px apart with a 1px divider (`--line-divider`) down the middle and **12px clear on each side of it**. The columns follow the same rhythm, so **the rows are on the same lines without any space put in by hand**: an open activity's head row is as high as a cell (44px), so the Primary row stands beside the Organization Name's box, the first level beside the Country, the second beside the Address (measured within 1px). The Legal Form now stands beside the Organization Name (labels at 226 px, cells at 260 px in both columns), the Registration Date beside the Country and the Opening Date beside the Address, the Activities beneath; the vertical divider ends with the columns; the columns are not forced onto each other's lines, which had left holes of 40 to 200px. **A dropdown's list** is as wide as its longest official title (never narrower than the cell, never wider than 560px or the dialog: the picker's own rule, `layout-rules.md` section 10) and a title wider than that wraps instead of being cut; it is as tall as the window's room allows, up to 30 options, and scrolls beyond that (the picker's `visibleOptions`, 10 by default).

*Also noted.* The "Activities" label stands 2px lower than "Organization Name": a label with an "i" sits in its holder (`legal-entity-label-info`); the same 2px exists for every label with an "i" beside one without, so it is the page's existing behaviour and not changed here.

- **At the narrow width (768 px)** the left column is followed by the right: Name, Country, Address, then Legal Form, Registration Date, Opening Date, the activities (each ending in its code), and the Notes under a divider line.
- **The code is at the end of each activity** (the owner, 2026-10-23), in place of the single code row at the bottom of the column: the cascade's final code **generates** it and the user may edit it. Its label and its description come from the country (SIC code, NACE code, principal business activity code, industry code, ANZSIC code, BIC code). A folded activity shows its path and code on one line. Today's tick ("has a code") goes: the code is always shown once the last level is chosen.
- **Level labels:** every level, the first too, carries the country's own official name (doc 35, 5.7), each with an "i". **Everything the user reads in this part switches with the country:** the slot labels, the level names, the code label and the "i" (doc 35, 5.8).
- **Changing a level resets the levels below it** in that activity, and the code at the end of the activity empties (doc 35, 5.8, rule 3).
- **Options per level (doc 35, 5.9):** each dropdown shows all its children when there are six or fewer, else the shortlist that covers 90% of the businesses under that parent (never more than ten) plus "Show all"; **the options are in the official order of the classification (doc 35, 5.10), never by popularity**; the "i" says how many items businesses of the industry usually list (doc 35, 5.9); the only limit is four codes.
- **Storage (settled 2026-10-23, "codes only"):** the Legal Entity answer holds a list of up to four entries, each the code and the classification edition. The levels and titles are looked up from the code, because codes nest. Today's activity-code field and its tick are read as a fallback for the first entry until it is replaced. A change of level or of country empties the entry or the list.
- **Description** is the former Main Activity box, renamed. Its "i" carries both former Description prompts as general information: "Who are you, and what do you do? What do you create or provide?"; the old line "Name and legal details go in 3. Legal Entity" changes to say they are in this dialog. No label anywhere is "Main Activity".
- **Saved text.** The box saves into the Description's saved value, which the Business Plan prints as its paragraph. The old Main Activity text is read as a fallback until replaced. The Business Plan's Organization table row "Main activity" becomes "Activities", filled from the cascade (primary first) **[D, label to confirm]**. The export row, the completeness check and the open item that said "main activity" now say "description".
- **Answers read elsewhere:** see 8.1. The country, the legal form, the dates and the activities' codes are read by the Legal Entity page, the financials, the Review, the Calendar and the exports; the Segment of Business 1 does not read the Organization yet (8.2, "What the Segment will read").
- **Impacts to change together:** `PageGroups.ts` (both pages), the Review "go there" places and `MISSING_PLACES`, the rail and arrows, the colour map, `LegalEntityEditor`, the document and export builders that name Main Activity or the founders' profile, `SectionStatus`, the tests that read them.
- **Open:** the Capability tile's later change; the audit of lists under rule 14 (section 3), tile by tile. The examples hold the new fields (the activities' codes: Lumen & Loom 13921, Quillfield 541512; the Positioning answers; the Opening Dates).


### 8.6 The wording of the Organization tile

What the app says today, what changes, and what is new. Lists come only from official documents (rule 14); the owner's own words are used where the owner gave them. The wording of the choice questions (Market Structure, Seller and Buyer Relationship, the audience and the outcome) and of the business stage is in 8.2 and 8.2a.

| Element | Wording today (in the app) | Wording from now |
|---|---|---|
| The text box label | "Main Activity" | **"Description"** |
| The text box "i" (`INFO.mainActivity`) | "The work the organization actually does, described factually. Write it as a registry or a bank would expect to read it. Some countries classify it with an official activity code." | "Who are you, and what do you do? What do you create or provide? Write it as a registry or a bank would expect to read it. Name, country, address and legal form are above." (the page-1 prompts, one existing sentence kept, the code sentence dropped) |
| The text box placeholder | "What the organization does, in plain words" | unchanged |
| The activity-code "i" (`INFO.activityCode`) | "The official code for the organization's main activity: it classifies what the organization does. Asked for when the organization is registered, and on its annual filings where they apply." | The country's sentence of doc 35, 5.8, then "Generated from your choices; you can edit it." |
| The code label | the country's code name ("SIC code", and so on) | one label per country, at the end of each activity (doc 35, 5.8) |
| Organization Name, Country, Address, Subdivision, Legal Form, "Select a legal form", "Name the legal form", the "waiting for country" hint | as in the app | **unchanged** |
| Activity heading, slot labels, level names | none | per country (doc 35, 5.8); every level the scheme's own name |
| Level dropdown placeholders | none | "Select an industry", "Select a division", and so on, with the country's level name (the style of "Select a legal form") |
| Buttons and tooltips | none | "+ Add another activity" (the existing add-button style); tooltips "Click to add another activity", "Click to remove this activity", "Click to show all" |
| A long list | none | the last entry "Show all" opens the whole list, in the official order |
| Export row, Business Plan table row, open item, completeness | "Main Activity", "Main activity", "main activity" | "Description" in the export and the open item; the Business Plan's table row becomes "Activities" |
| Page names | page 2 "Organization"; page 1 tile "Description" | page 2 **"Legal Entity"**; the Description tile is removed |

## 9. Founders and Capability

### 9.1 Three founder places today

| Place | Holds |
|---|---|
| Identity 2 › Legal Entity › Founders & Ownership | a table: name; ownership %; capital; totals; one-founder organisations hide ownership and the add and remove buttons |
| Identity 2 › Founders & Capability | one tile per founder (roles; industry experience; management experience; key achievements; skills with a type: Skill, Professional / Technical Expertise, Degree / Qualification, Certification, Licence, Membership / Other Credential) and a Capability tile (two free-text boxes) |
| Business 3 › Infrastructure › Founders | pay, frequency (Weekly, Monthly, Annually), working hours, delivery hours, start date, allowance, commission, bonus; name, id and roles are overwritten from Identity |

The id is created in the Legal Entity; roles and experience are owned by the profile and shown read-only on page 3; nothing in the cost model or capacity reads the profile or the capability text.

### 9.2 Target **[D]**

- **The founder's profile moves into Founders & Ownership.** **Settled 2026-10-23: the founder tiles become sub tiles inside the Founders & Ownership dialog (Ownership first, then one tile per founder)**, in place of the table: part **Ownership** (name, ownership %, capital) and part **Profile** (roles, industry experience, management experience, key achievements, skills with type, and the new questions below). The totals move to the dialog heading. The chapter "Founders & Capability" disappears; Identity 2 keeps its one chapter. **Storage is unchanged in the first step** (only the editor moves), so no saved answer migrates.
- **Pay and hours stay on Business 3** (the cost model reads them and completeness flags a missing start date, salary or hours).
- **Capability stays its own tile on page 2 for now** (owner, 2026-10-23); its change to a card in Business 3 › Infrastructure, beside Founders, is considered when Business is reached. The derived gap (founders' skill areas against what the offerings need) needs Business 3 and cannot sit in Identity.
- Impacts to change together: `PageGroups.ts`, the Review "go there" places and `MISSING_PLACES`, the rail, the document and export builders that name the profile section, `SectionStatus`, the tests that read the profile editor, both examples. Risk: a founder card of ten-plus fields in a 480 px card, checked first.

### 9.3 The new questions

| Id | Where | Question (plain) | Component | Options | Tier |
|---|---|---|---|---|---|
| C1 | founder card, Profile | Which of these can you do yourself? (tick all that apply) | Ticks | L5 | Core |
| W1 | Delivery card | Who will do the work? | Dropdown | You or your team; An outside partner or provider; An automatic system; Shared between your team and a partner; Not decided | Core |
| W2 | Delivery card | What skills does the work need? (tick all that apply) | Ticks | L5 | Core |
| W3 | Delivery card | What could slow the work down? (tick all that apply) | Ticks | The customer's approvals; The customer's materials or access; Special equipment or software; Licences or permits; Supplier lead times; Your team's capacity; Rules or quality standards; Nothing I know of | Optional |
| C4 | Capability card | How will you cover each gap? (one answer per gap) | Dropdown | I plan to hire; An advisor or mentor; A partner; A contractor or freelancer; Training; I will learn it myself; Not covered yet | Core |

(C3, management experience, is not asked.) The only official form found, the UK Start Up Loans plan guide, asks about relevant work, education, transferable skills and gaps, in free text [PLN-07].

### 9.4 What the skill areas are, and why

A **skill area** is a short name for a kind of work the business needs done well (for example Marketing). The areas are the one vocabulary that joins three things that are separate today: what an **offering needs** (W2, on the Delivery card), what the **founders have** (C1, on each founder), and **how a shortage is filled** (C4). With them:

- a **gap is derived**, not typed: an area an offering needs and no founder covers; the Capability card lists it and asks only how it will be covered;
- the cover can **act**: "A partner" or "A contractor" proposes a Partner card, "I plan to hire" proposes a people-cost line, and "Not covered yet" is a Review item;
- the question that lenders and investors ask, "is every capability the plan needs covered by someone?", which the app's help already names but no code answers, finally has an answer.

Without areas, gaps and cover stay two free-text boxes read by nothing. **Where the six areas come from.** Business-plan guides of the six countries use the same headings: marketing (all); sales as its own heading (Business Queensland, GOV.UK; the SBA joins it to marketing); operations (Business Queensland "Operating plan", the Dublin Local Enterprise Office "Production and Operations"); finance (all); management and organisation (SBA, Local Enterprise Office); legal as a heading only in Business Queensland ("Legal matters and risk management"); people as a heading in Business Queensland ("Human resources plan") [PLN-01 to PLN-04]. So the six are supported in the main, with these choices that are the author's: "Production" is renamed "Delivering your product or service" because it reads oddly for a service business; finance and legal are combined; operations includes administration and technology (Queensland's "Digital services"); people and hiring sit under Leadership. They also reuse names the app already has (the activity groups Production, Marketing and Sales & Customer; Operational with the Admin Team; the partner group Business Services; "Management Experience" in the founder profile). Risk management and product development are not areas **[D]**. Approving the list is a **[D]**.

## 10. Business 3 (Delivery) and Business 5 (price)

### 10.1 Delivery card

Kept: Delivered (Per unit; Every month), now **derived** from O3; Hours Given (Per month; Per week), recurring only; working hours per person; Calendar Time in weeks, one-off only; Constraints (now **W3** ticks plus the note). New: **W1**, **W2**. Delivery capacity counts founders only; employees and contractors are not modelled **[D]**.

### 10.2 Revenue stream card (page 5)

The price stays here: price, unit, "Charged", payment timing, volume. The stream already owns them, and moving them means a migration for both examples and every consumer. Changes: **"Charged" is narrowed by O3** (proposed mapping: one purchase → Per sale; project or contract → Per project; subscription, membership, retainer → Monthly, Quarterly, Annually; licence → Annually or Per sale; pay for what they use → Per sale); new:

| Id | Question (plain) | Component | Options | Tier |
|---|---|---|---|---|
| R1 | Does your price include {tax name}? (VAT, GST or sales tax, from the Legal Entity's country) | Radio | Yes, the price includes it; No, it is added on top. Default: the price includes it when the customers are people (I3) in the UK, Ireland, Australia or New Zealand; it is added on top for businesses and in the USA and Canada | Core |
| R2 | What is your price based on? | Dropdown | L16 (the sales and website options appear once the stage is earning, as in D1) | Core |

R1 is the only answer that changes the arithmetic: the plan's VAT basis is display-only today, so a gross price typed under an "excluding VAT" plan gives wrong figures. The defaults follow the regulators (table doc 35, 5.1: TAX-01 to TAX-11). The registration thresholds could also feed a Review item (expected sales above the threshold while the consumption-tax tick is off) **[D]**. **Pricing methods** in official guidance (the US SBA, Canada's BDC, New Zealand's business.govt.nz) are cost-plus, hourly, competitor-based and value-based [PRC-01 to PRC-03]; **no official source in the six countries names a retainer or a project fee as a method**, so those are the app's own categories. A setup fee plus a recurring price needs a second charge on the stream and is **not** included **[D]**.

### 10.3 Minimum ages to buy, by product and country (O12)

> **See also doc 30** (2026-10-26): the same question asked of **activities** (27 kinds of business, six countries, direct or possible), with corrections to this table (UK pets and vapes) and the open conflicts.

What the founder needs: **if your customers include people under a certain age, you cannot lawfully sell some products to them.** In the UK the seller commits the offence even if the buyer lies, unless it took reasonable steps to check age [S1]. The table is the lookup behind O12. **Status:** *Opened* = the official page was read in full; *Excerpt* = a search summary of an official page, to be re-checked by a person; *Not found* = no official page surfaced (this does not mean there is no rule). **Only Opened and Excerpt rows from an official source may drive a Review check**; Not found cells show "check the rule for your area" and drive nothing.

| Kind | UK | USA | Canada | Australia | Ireland | New Zealand |
|---|---|---|---|---|---|---|
| Alcohol | 18 [S1, opened] | 21 in every state [S12, excerpt] | 18 in AB, MB, QC; 19 elsewhere [S14, opened] | 18 [S17, excerpt]; rules on adults supplying a minor vary by state | 18 [S19, excerpt] | 18 [S22, excerpt] |
| Tobacco | 18; from 1 Jan 2027 not to anyone born on or after 1 Jan 2009 [S2, opened] | 21 federal [S11, opened] | 18 federal baseline; some provinces 19 or 21 [S13, opened] | Not found (state laws) | 18; 21 from 1 Feb 2028 [S20, excerpt] | 18 [S21, excerpt] |
| Vapes | 18 in England and Wales [S3, opened]; **all vapes and nicotine products, pouches included, 18 from 29 Oct 2026** (Tobacco and Vapes Act 2026 s.10); single-use vapes banned in England from 1 Jun 2025 (SI 2024/1216 [doc 30, opened]) | 21 federal [S11, opened] | 18 federal baseline; provinces may go higher [S13, opened] | Pharmacy only; under 18 needs a prescription [S16, excerpt] | 18 [S19, excerpt] | 18 [S21, excerpt] |
| Gambling, betting, lotteries | Most 18; National Lottery 18 since 2021 [S4 opened, S5 excerpt] | Not found (state-set) | Not found (provincial) | Not found (state and territory) | 18 [S23, excerpt] | Not found |
| Knives and blades | 18; Scotland 16 for domestic knives [S1, S6, opened] | Not found | Not found | Not found | Not found | Not found |
| Fireworks | F2 and F3 18 [gov.uk, opened]; F1 and party poppers: no age stated on that page (the earlier "16" is unconfirmed, doc 30) | Not found | Not found | Not found | F1 not sold under 12 [S19, excerpt] | Not found |
| Films and games with ratings | Legal ratings 12, 15, 18 for video recordings; PEGI 12, 16, 18 enforced [S1, opened] | Not found (the ESRB system is voluntary, not verified) | Not found | Enforced by state and territory law; R18+ not to under 18; MA15+ not to under 15 without a parent [S18, excerpt, NSW only] | Not found | Not found |
| Credit, loans, BNPL | 18 [non-official excerpt] | Credit card under 21 needs own income or a co-signer [S10, excerpt] | Primary cardholder of age [FCAC, opened] | Not found | Not found | Not found |
| Tattoos, sunbeds, fillers | Tattoo 18 [S8, opened]; sunbeds 18; Botox and fillers 18 in England [S1, opened] | Not found | Not found | Not found | Not found | Not found |
| Pets | **12** (Pet Animals Act 1951 s.3; England, Wales and Scotland; 16 only in some councils' licence conditions) [doc 30, opened] | Not found | Not found | Not found | Not found | Not found |
| Medicines | No legal age found; paracetamol pack limits [S7, excerpt] | Not found | Not found | Under-18 vapes need a prescription [S16] | Not found | Not found |
| Adult content, online age checks | "Highly effective" age assurance, enforceable from 25 Jul 2025 [S15, excerpt] | Not found (state laws exist, not researched) | Not found | Social media minimum age 16 from 10 Dec 2025; platforms must take reasonable steps, no penalty on children or parents [S16b, excerpt] | Online Safety Code: self-declaration is not enough [S24, excerpt] | Not found |

**Where it varies:** Canada by province (alcohol 18 or 19; tobacco and vapes can be higher); the USA by state (gambling, knives, fireworks); Australia by state and territory (classification, supply to minors); the UK by nation (Scotland's knives, England's cosmetic rules; the Tobacco and Vapes Act 2026 has separate Scottish and Northern Irish sections). **Recent changes:** UK generational tobacco ban from 1 Jan 2027 and vape sale rules from 29 Oct 2026; Ireland's tobacco age rises to 21 on 1 Feb 2028; Australia's social media age of 16 started 10 Dec 2025. Not covered: driving; gambling outside the UK and Ireland; knives and fireworks outside the UK and Ireland; financial products outside the UK, USA and Canada.

**What O12 does with it.** (1) Ticks a kind: shows that kind's age for the main country (G3) with its status. (2) Review: "Offering X is restricted to age N in the UK; Segment Y starts at M." (3) When someone else uses it (the audience Proxy Buyers / Gifters, I7b, for example a gift) and the kind is alcohol, tobacco or vapes: a note that selling to an adult who buys for a child can still be an offence in some places. (4) For an online seller of an age-restricted kind: the age-check note. (5) For another country (G3): "check the law of that country". The sale restriction concerns the **customer** (G6); the restriction on use concerns the **user** (the second Profile, P21 "They will use it"; G25 is withdrawn).

## 11. The connection map

### 11.1 The kinds of connection, and what the app does

| Kind (from the owner's text) | Meaning | What the app does |
|---|---|---|
| **Contextual** | Gives the circumstances in which another answer is read | Shows the answer beside the other as context; no rule |
| **Influential** | A possible relationship worth a follow-up | **Suggest** (a labelled proposal) or **Review** (a prompt); never hides an option; shows an evidence line |
| **Operational** | Decides which follow-up options, lists or information the app shows | **Filter** or **Reveal**, only where the connection is a matter of definition (a country's lists, business or people questions), never on a tendency |
| **Evidence-sensitive** | Needs evidence before any conclusion | No rule, or a help line quoting the source; a visible "tends to" |

### 11.2 The eleven connections of the owner's text

| Connection | Kind | In the app | Evidence |
|---|---|---|---|
| 1 Age ↔ Household | Contextual | Both are asked; the household spending patterns are an evidence line in the Demographics note | SPN-05, SPN-06 |
| 2 Education ↔ Occupation | Contextual | Asked separately; the education list follows the customers' country (G3); no rule | DEM-03 to DEM-11 |
| 3 Occupation ↔ Income | Contextual | No rule: occupation does not establish income | none needed |
| 4 Income ↔ Purchasing behaviour | Influential | Review: a high price against a low income range; evidence line on G8 | SPN-06, SPN-07, SPN-09 |
| 5 Age ↔ Digital habits | Influential | Age is shown beside P16 and the channel suggestions; **digital comfort is asked directly (P16), never inferred from age** | DIG-07, DIG-12, DIG-14 |
| 6 Purchasing power ↔ Digital habits | Influential | P13 and P14 ask how they buy and pay; payment-method tendencies are an evidence line on P14 | DIG-08, DIG-09, DIG-13, DIG-18 |
| 7 Geography ↔ Nationality ↔ Language | Operational (definitions) | Two separate fields (G3, G5); country selects the lists; none is inferred from another | LNG-03 |
| 8 Geography ↔ Household | Contextual | Asked separately; no rule | none |
| 9 Nationality ↔ Education | Operational | The customers' **country** (not their nationality) selects the education crosswalk | DEM-03 to DEM-11 |
| 10 Gender ↔ Occupation | Evidence-sensitive | No inference; gender is asked only when relevant (G10) | SEX-01, EQL-01 |
| 11 Gender ↔ Digital and purchasing behaviour | Evidence-sensitive | No rule; the research found no official evidence of this kind | none |

### 11.3 The owner's data-flow claims, one by one

| Claim | Verdict | How the app treats it |
|---|---|---|
| Needs and problems → draft Value Proposition | Supported (logical) | The draft of 6.7; the user adds it |
| Psychographics → Brand Identity (Mission, Manifesto) | Partly | A check and a display (6.1); no text is written into Brand |
| Country and area → channel presets | Partly | G2 and G3 order the suggestions; the area (G4) matters for delivery, not for hiding online channels (11.4) |
| Low digital familiarity → hide complex digital channels | Changed | Digital-only channels are **moved down and labelled**, with personal and in-person channels suggested first (rule 3.4) |
| Purchasing power → pricing limits | Changed | A Review prompt, never a limit |
| Enterprise customers → procurement, longer cycles, revenue timing | Partly | A formal tender or a government customer reveals the tender row and a note of stated periods and payment terms (11.5); no cycle length is estimated |
| Decision-making → initial conversion rate | Not supported | No default percentage (11.6) |

### 11.4 What the evidence shows, by characteristic and band

All figures are tendencies of groups in official or central-bank data (or, where flagged, a non-profit or partnership), for the year and country stated; the countries measure different things and cannot be compared.

**Age (G6, P1).** Online use is near-universal below 65 in all six countries; the gaps open at 65 and widen at 75. So "online or not" separates few segments under 65.

| Band | Digital and shopping | Payments | Spending (US, 2024) |
|---|---|---|---|
| 0 to 17 | children and teenagers: no market evidence gathered; the online and legal thresholds are in 6.3 | | education 5.6% of US spending under 25 [SPN-05] |
| 18 to 24 | smartphone 97% (US, 18–29, Pew) [DIG-04] | UK mobile payments registered by 88% (16–24) [DIG-18]; Australia: nearly two-thirds of 18–29 paid by mobile in the diary week [DIG-13] | healthcare 3.1% (under 25) [SPN-05] |
| 25 to 34 | Ireland: basic digital skills 88%, online purchase 97–99% (under 55) [DIG-14, DIG-15] | UK: buy-now-pay-later used by 36% of 25–34 [DIG-18]; Canada 2021: cash 20.1% of purchases (18–34) [DIG-09] | |
| 35 to 44, 45 to 54 | Ireland: skills 82.7% (45–54) [DIG-14]; US Facebook use 80% (30–49, Pew) [CHN-07] | Canada: cash 16.6% (35–54) [DIG-09] | healthcare 6.5%, transport 17.1% (35–44); housing 30.6% (45–54) [SPN-05] |
| 55 to 64 | Ireland: skills 46.7%, online purchase 92.9% [DIG-14, DIG-15]; US smartphone 91% (50–64) [DIG-04] | Canada: cash 26.2% (55+) [DIG-09]; Australia: the cash share of in-person payments for over-50s fell from 42% to about 22% [DIG-13] | |
| 65 to 74 | Ireland: skills 47.5%, online purchase 78.6% [DIG-14, DIG-15]; US smartphone 79%, internet use 89% (65+) [DIG-04] | UK: mobile payments registered by 25% (65+) [DIG-18]; Australia: 9% in the diary week [DIG-13] | healthcare 12.7%, housing 36.1% (65+) [SPN-05] |
| 75 or older | Canada: internet use 72% in 2022, up from 62% in 2020 [DIG-07]; Australia: digital inclusion score 48.5 against 82.6 for 18–34 [DIG-12]; Ireland: 63% online in 2025 (excerpt) [DIG-19] | | healthcare 14.2% (75+) [SPN-05] |

**What must not be inferred from age:** skill (education matters more: Ireland, 55–74, high education 78% against low 13% [DIG-14]); platform (the only age-by-platform data opened is the US, from a non-profit [CHN-07]; the UK's Ofcom data could not be opened).

**Education (G7).**

| Level | Evidence |
|---|---|
| Did not finish secondary school | Ireland: basic digital skills 14.4% against 61.8% (medium) and 88.2% (high) [DIG-14]; Australia: digital inclusion 56.3 against 79.9 (bachelor's or higher) [DIG-11]; US smartphone 84% and home broadband 65% (high school or less) against 96% and 89% (college graduates) [DIG-04, DIG-05]; Canada 2021: cash 26.3% of purchases (high school) against 15.3% (university) [DIG-09]; UK 2020: 34% of adults with no qualifications had essential digital skills against 93% of degree holders (a dated excerpt) [DIG-19] |
| Finished secondary / trade / diploma | the middle of the same ranges; the evidence is published in three groups (low, medium, high), not the six levels |
| Bachelor's, master's or higher | the high end of the same ranges |

Education relates to digital skill and to the way people pay; it does not predict willingness to buy.

**Income (G8).**

| Income | Evidence |
|---|---|
| Lowest | US home broadband 57% (under $30,000) against 92% ($75,000 and over) [DIG-05]; US internet use 73% (under $25,000, 2023) [DIG-02]; Australia: digital inclusion 54.7 (lowest fifth) against 83.5 (highest) [DIG-11]; Canada 2021: cash 28.8% of purchases (under $45,000) against about 19% ($85,000 and over), while the **mobile** value share is higher at the low end (13% against 3%) [DIG-09]; US: 77% of adults under $25,000 have a bank account [DIG-06]. Spending: Ireland, the lowest fifth spends 51.4% on housing, fuel, light and food against 35.5% for the highest [SPN-09]; Canada, lowest fifth shelter 34.8%, food 17.9%, recreation 5.4%, education 1.3% [SPN-06] |
| Highest | Canada, highest fifth shelter 32.2%, food 14.6%, recreation 7.7%, education 2.9% [SPN-06]; Australia (2015–16): a larger share on transport and recreation [SPN-07]; UK: weekly spending £1,083.60 against £407.30 for the poorest fifth (FYE 2025) [SPN-03] |

Lower-income households spend a larger **share** on essentials; this is a tendency of households, and no source links income to willingness to pay for a service.

**Household and life stage (a note).** US 2024: a single parent, housing 37.3% and food 14.9%; couples with children (oldest 6–17), entertainment 5.6% and education 3.0%; couples without children, healthcare 9.8%; a single person, housing 37.4% [SPN-05]. Canada 2023: a one-person household, shelter 36.9%; couples without children, recreation 8.2% [SPN-06]. Ireland: retired and employed households differ in food patterns [SPN-09]. Surveys describe households, not individuals, and age and income effects overlap.

**Kind of area (G4).** The rural gap is small in most data: Ireland, basic skills 71.6% rural against 73.1% in cities [DIG-14]; US computer 93% rural against 96% urban (2021) [DIG-03]; urban can sit below suburban (Pew) [DIG-04]. It is large only in remoteness: Australia, remote First Nations communities score 21.6 points below the average [DIG-12]; Canada, rural Canadians travel about twice as far to cash access (excerpt). "Rural means offline" is **not** supported.

**Business customers (G14, G15).**

| Evidence | Source |
|---|---|
| UK: has a website 76% (sole trader), 84% (micro), 92% (small), 97% (medium), 99% (large); AI use 41% (micro) to 82% (large) among firms handling digitised data | B2B-01 |
| US: AI use 37% (250+ employees) against under 20% (4 or fewer) | B2B-03 |
| Canada: AI 26% (large), 8% (medium), 6% (small); cloud 48% overall, 81% in information and cultural industries; e-commerce orders 32% across sizes | B2B-05 |
| Australia: social media 51% of businesses, online orders 32%; AI highest in information, media and telecoms (38%) and professional services (24%), lowest in construction (6%) and hospitality (5%) | B2B-07 |
| Ireland (10 or more staff): web sales 34.2% (small), 43.9% (medium), 42.4% (large) | B2B-09 |
| Tender periods: UK minimum 25 to 35 days and an 8 working-day standstill; Canada 15 to 40 days | B2B-02, B2B-06 |
| Public payment: Ireland public authorities 30 days; UK interest at base rate plus 8% on late B2B payments; the UK Prompt Payment Code (30 days for small suppliers) is voluntary (excerpt) | PAY-02, PAY-03, PAY-05 |

Adoption rises with size, and industry matters at least as much (information and professional services highest; construction, hospitality and retail lowest). **No source gives a sales-cycle length or a number of decision-makers by company size** (11.6).

### 11.5 The rules the evidence supports (what the app does: 28 rules)

| # | Trigger | Part | Kind | What the app does | Evidence |
|---|---|---|---|---|---|
| 1 | I3 (Identity) | Questions | Operational | Reveals the people or the business questions | definition |
| 2 | G3 (the customers' country) | Lists | Operational | Selects the education, size, industry and area crosswalks; shows the equality notice and language notes | doc 35, 5.3, EQL-01 to EQL-05 |
| 3 | Legal Entity country | Price | Operational | Names the tax and sets R1's default | TAX-01 to TAX-11 |
| 4 | P11, P12, P13, O6, O7 | Channels | Suggest | Proposes the channels of each stage (7.4) | logical, definitions |
| 5 | P14 | Purchase channels | Suggest | Proposes the Direct Payment subchannels for the payment methods ticked | logical |
| 6 | P16 = "They need some help" or "Mostly offline" | Channels, relationship | Suggest | Moves digital-only channels down, labelled; suggests personal help, in-person and phone first; never hides | DIG-12, DIG-14 (skills vary with education and income, not age alone) |
| 7 | P15 = only a smartphone | Offering, channels | Review | "Make the order form and the checkout work on a phone" | DIG-02, DIG-03 |
| 8 | P19 (worries) | Evaluate actions | Suggest | Highlights actions: price or budget → a quote or proposal; trust or risk → proof (cases, reviews); fit or complexity → a demo, trial or sample; time to start → getting started; support → the Support-stage actions | logical, author's mapping |
| 9 | (withdrawn 2026-10-26: P10 deleted, the author's, no source) | | | | |
| 10 | P20 against O7 | Offering, relationship | Review | "Customers want to talk to a person; the offering gives none" (and the reverse) | logical |
| 11 | P20, O7 | Relationship type | Suggest | The type of J3 (7.4) | logical |
| 12 | P22 = formal tender, or G15 = government | Demand, price | Reveal, Review | Reveals the "Contracts or tenders" row and a note: minimum tender periods and standstill (UK, Canada; Australia and Ireland rest on excerpts), public payment terms (Ireland 30 days); suggests payment timing "invoice, on completion"; **proposes no cycle length** | B2B-02, B2B-06, PAY-03 |
| 13 | G14, G15 | Channels | Suggest | Online channels first for sectors and sizes with high adoption (information, professional services; larger firms); add direct and in-person for low-adoption sectors (construction, hospitality, retail); an evidence line | B2B-01, B2B-03, B2B-05, B2B-07 |
| 14 | O3 (merged G19) | Offering | Review | "Customers buy once or rarely; the offering is a subscription" (and the reverse) | logical |
| 15 | O11 (merged G18) | Offering | Contextual | Shows which share of spending the offering competes for | SPN-01 to SPN-09 |
| 16 | G8 or G16 against the price (Revenue) and K1 | Price | Review | "The price is high against the income range or budget"; never a limit | SPN-06, SPN-09 |
| 17 | G4 = remote or rural, with O6 = shipped or in person | Delivery | Review | Suggests the constraint "Supplier lead times" and a delivery-cost check | DIG-12 (remoteness) |
| 18 | G5 = another language | Capability | Review | "Customers use another language: who will support them?" (Sales and customer care) | LNG-03 |
| 19 | G3 includes Canada and the language includes French | Review | Review | A note that Quebec law requires businesses serving consumers there to inform and serve them in French; verify the Charter (an excerpt; Wales, Ireland and New Zealand language duties are placed on public bodies, not private businesses) | LNG-04 |
| 20 | G10 is not "not relevant" | Segment card | Review | Shows the equality notice (section 12) | EQL-01 to EQL-05 |
| 21 | K2, K3, K4 against P9, P11, P19, P20 | Competitors | Review | A value customers care about that no competitor or offering delivers; a channel customers use that competitors use and you do not; "customers work it out themselves": have you listed an Internal solution and the Status quo as alternatives? | logical |
| 22 | P9 against I7c, the Values tile, O4 | Positioning, values | Review | The offering's benefit, the positioning and the Profile's values should agree | logical |
| 23 | G6, G7, G8, G13, P1, P5, P6 | Profile | Review | Each Profile fits its Segment (6.5) | logical |
| 24 | An earlier answer changes | Dependent answers | Review dependencies | The compatible answers stay; the dependent ones are flagged for review, never deleted | rule 3.4 |
| 25 | Legal Entity country | Segment | Operational | The first Segment's country (G3) starts from the Legal Entity's country; the user confirms or changes it; a second Segment starts from the first one's answers | definition |
| 26 | I1, I2 | Industry pack, activity code | Suggest | Proposes the pack's examples (doc 35, 5.6) and the country's activity code for the user to confirm | BUS-01 to BUS-05, BUS-18 to BUS-20 |
| 27 | I5 | Brand | Suggest (parked) | Proposes colour families, typeface style, shapes, image kinds and voice (8.3), each with its evidence strength; never applied automatically; every colour checked against WCAG 2.2 | BRD-01 to BRD-11 |
| 28 | A Segment answer (G6, G13, G14, G15) | Profile | Filter | The Profile's options are the ones the Segment ticked; a value outside is a Review item | logical (6.5) |
| 29 | G6 range includes a band below 18 | Segment, Profiles | Reveal, Review | Asks who uses it, who pays and who decides (P21); proposes a Profile for the parent or carer; shows the note "Selling to children and young people" (online consent ages by country; goods with minimum ages; no rule on contracts with minors) | AGE-01 to AGE-18 |

Demographics connect to **competitors** only through rules 21 and 22: what customers care about, where they look, what they worry about. No official data links age, education or income to the choice of a competitor, so none is invented.

### 11.6 What is not built, because the evidence does not support it

- A **default conversion rate** or **sales-cycle length** for any customer type or size; a **number of decision-makers** by company size (only the qualitative direction, larger or more formal organisations use bigger groups, was found, in unopened journal excerpts).
- **The dependence between the groups of a platform** (how one side's size changes the other's value, the start-up problem of needing both sides, subsidising one side, pricing the sides against each other): no source tells the app how to model it, and each side of a platform is one Segment frame that describes only who pays and who uses (6.3, MSP-03).
- Choosing a **platform or channel from age alone**; "rural means offline"; "low income means no smartphone or no internet" (US under-$25,000 internet use is 73% to 91%, and about 80% own smartphones [DIG-02, DIG-04]); "older means unskilled" (over-65s outperformed 25–34s on one UK scam-email test, reported via trade press only).
- **Willingness to pay** from digital skill, education or income; any **price limit**.
- A **social-media gradient by business size** (only Australia has an overall figure; the Irish survey starts at ten staff); micro-firm digital rates for Ireland, Canada, the US and New Zealand.
- A **single payment-term default** per size band for private business customers (official rules concern interest and public payers).
- Invoice and bank-transfer use **by age or income**: no figure found in any country.
- Any rule using **ethnicity, race, religion or sexual orientation** (section 12).
- Comparing countries on one scale (the surveys differ), or reading **euro-area** payment figures as Irish.

### 11.7 What an answer changes elsewhere (the earlier table, kept)

| Answer | Effect |
|---|---|
| O3 | Demand "Customers Buy", Delivery "Delivered", Revenue "Charged" options. Recurring shows Cancel / Month and Hours Given; one-off shows Calendar Time. |
| O1 and the Offering Type | If no Product or Hybrid offering exists, Physical Delivery and Retail & Wholesale (channels), Delivery Vehicles, Delivery Running Costs and Materials & Stock (resources) and the Logistics & Fulfilment partner type are hidden. Hidden, not deleted. |
| I1, I2 | The industry pack's suggestions (doc 35, 5.6); industry overlap checks; the country's section or code, suggested on the Organization tile and printed on the documents. |
| I8 | Hides "sales I have made" and "website or social-media data" in D1 until the stage is earning; labels figures actual or forecast. |
| I9 | A suggestion for Capital & Funding and for the hire answer of C4 (later). |
| C1, W2 | Derive each area's status (covered, a gap, not needed). |
| C4 | A partner or contractor proposes a Partner card; a planned hire proposes a people-cost line; not covered is a Review item. Proposals are accepted by the user, never created silently. |
| W1 | An outside partner, or shared, with no linked partner is a Review item. |
| J1 | A planned channel behind a "sales I have made" or "website data" estimate is a Review item. |
| J7 | Pre-ticks the goal (win a customer, help them decide, get them started → Get; keep or renew, fix problems → Keep; repeat purchases, ongoing service → Grow) |
| D1 | Labels the figure actual (sales made, data, signed commitment), benchmark, or assumption (customer research, own estimate, nothing yet). |
| G20 | Review: expected customers against the market size. |
| R1 | Revenue, contribution and break-even strip or add tax (an engine change). |

Questions that change no number and feed only a note, a draft or the Review page are the optional and adaptive tier; the owner may cut any.

## 12. Sensitive characteristics and equality

**What the app does.**

- Collects only what a segment needs, with "Not relevant" and "Prefer not to say" defaults (the Australian standard, Stats NZ and the UK ICO all point this way) [SEX-01, CUL-03].
- Asks **country, language and need**, not race or ethnicity. There is **no ethnicity or race list**; any ethnicity item would be an optional note for research or equity analysis, and only with each country's own categories (the US race and ethnicity standard is not used for other markets) [CUL-01, CUL-02]. **[D]**
- Asks gender only when G10 is yes, with a self-describe and "Prefer not to say" option [SEX-01].
- Never infers a language skill from a country of birth (the ABS says collect it directly) [LNG-03], never infers race, ethnic origin or sexual orientation (the UK ICO treats the inference as special category data) [CUL-03], and never uses any of them to filter, price or exclude.
- Shows on the Segment card, when G10 is not "not relevant", or when G3 names a country with such a law, the notice: **"A segment must not be used to refuse, exclude or price people differently because of a protected characteristic."** with the law of each customer country and "seek legal advice" for finance, housing, insurance and health, where the exceptions differ. Age concessions and targeted offers are lawful in some places and not in others; the app does not say they are lawful everywhere.

| Country | Law (goods and services) | Covers | Status |
|---|---|---|---|
| UK | Equality Act 2010 [EQL-01] | age; gender reassignment; marriage or civil partnership; pregnancy and maternity; disability; race; religion or belief; sex; sexual orientation | opened |
| Ireland | Equal Status Acts 2000–2018 [EQL-04] | nine grounds: gender, civil status, family status, age, disability, sexual orientation, race, religion, Traveller community | opened |
| Canada | Canadian Human Rights Act, federally regulated services; provincial codes cover most businesses [EQL-03] | race, national or ethnic origin, colour, religion, age, sex, sexual orientation, gender identity, marital and family status, disability | federal opened; provincial not retrieved |
| USA | Equal Credit Opportunity Act for credit [EQL-02]; Title II of the Civil Rights Act for public accommodations (excerpt); the EEOC covers employment only | credit: race, colour, religion, national origin, sex, marital status, age | partly; retail is largely outside Title II |
| Australia | the Racial, Sex, Disability and Age Discrimination Acts (the AHRC page returned 403) [EQL-05] | race, sex, disability, age | excerpt |
| New Zealand | Human Rights Act 1993, section 44 [EQL-05] | the grounds in section 21 | excerpt |

The app must not build a segment such as "exclude a group" or "one group pays more", must not imply that a language or nationality means a person cannot or will not buy, and must not hard-code one country's categories for another's market.

## 13. Rebuilds, moves and decisions

| # | Change | Kind | Decision |
|---|---|---|---|
| R1 | Page 2 rebuilt as a journey of stage tiles and cards (section 7) | rebuild of existing layout | **[D]** yes or no; stage-first or keep channel-first; five stages or four |
| R2 | The founders' profile moves into Founders & Ownership (9.2) | move, editor only | **[D]** |
| R3 | Capability becomes a Business 3 tile, derived from founders and offerings (9.2, 9.4) | move and change | **[D]** Business 3, or stay in Identity |
| R4 | "How it is bought" asked once on the Offering (O3) | merge of three questions | confirm: three read-only fields replace three inputs |
| R5 | The Segment keeps ranges and the Profile keeps specifics, with a Review check (6.5) | rule | confirm |
| R6 | A box that becomes a question keeps its title plus a note | wording rule | confirm for page 1 (its texts are specified as exact) |
| R7 | The six skill areas (L5) | list | approve or replace |
| R8 | The shared lists L1 to L16 and their plain wording | lists | approve each, or amend |
| R9 | Relationship type per stage card, not per offering | model | **[D]** |
| R10 | Required answers (6.9) | rule | approve |
| R11 | Stage word: "Discover" or "Discovery" | wording | choose |
| R12 | Capacity counts founders only | scope | keep for now or widen |
| R13 | Setup fee plus recurring price | scope | leave out or add a second charge |
| R14 | Gender, relationship status, household and nationality; competitor website and price | scope | per item |
| R15 | Identity prompts "Description" and "Positioning" shortened or derived (8.2) | wording | **[D]** |
| R16 | (replaced by R30) | | |
| R17 | The industry list is one plain list with a crosswalk to each country's scheme | list | approve |
| R18 | Income is a number range, in the organisation's currency or the customers' | rule | confirm; which currency when G3 is another country |
| R19 | Tax defaults by country; a Review item at the registration threshold | rule | confirm; threshold item yes or no |
| R20 | The customer model kept as one content table that generates fields, options, rules and help (6.1) | architecture | **[D]** |
| R21 | The connection rules of 11.5 (28 rules) and what is not built (11.6) | rules | approve; add or remove |
| R22 | No ethnicity or race list; country, language and need instead; the equality notice (section 12) | rule | confirm |
| R23 | The Profile's values shown beside the Brand voice tile (6.1) | display | yes or no |
| R24 | Digital-only channels moved down and labelled, not hidden (rule 6 of 11.5) | rule | confirm |
| R25 | Identity choices sit beside the free text: the activities on the Organization tile (8.5) and the market, relationship, audience and outcome questions on the Early Positioning tile (8.2); none on Mission, Vision or the Ethics tiles, which stay prose (as built) | placement | confirm |
| R26 | The industry in two levels with examples, keyed on divisions; the UK activity-code edition (UK SIC 2026 is current; the app's hint cites SIC 2007) (doc 35, 5.3, 5.4) | list, data | approve the list; decide the hint |
| R27 | Industry packs: the Tier 1 and Tier 2 packs first (about twelve), the others show generic examples; examples labelled "for example" (doc 35, 5.6) | scope | approve |
| R28 | **Parked by the owner, 2026-10-23.** Brand starting points, when lifted: from I5 only, not from industry or price; suggestions only, with the evidence strength shown; update the colour-association help and its WCAG 2.1 note (8.3) | rule | approve |
| R29 | The cascade: the Profile may only choose within the Segment's ticks (6.5) | rule | confirm |
| R30 | The first release builds the 41 drivers; the 21 checks later; the 4 notes are never asked (Appendix B) | scope | choose |
| R31 | An example under every option, for every list (doc 35, 5.5) | content | approve and complete |
| R32 | A Segment is narrow: an ordered fact is a range (From, To), an unordered fact is one value, and more is another Segment; a range wider than three bands warns (6.3) | rule | confirm; the limit of three |
| R33 | Thirteen age bands, finer below 18, with an "i" under each, and the children's notice (6.3) | list | approve the bands and the i lines |
| R34 | Household income as one of five relative steps shown with the currency symbol, computed from the country's typical income; 60, 100, 150, 200% (6.3) | list, data | approve the steps; the 100% and 150% lines are the author's |
| R35 | Who you sell to (the Seller and Buyer Relationship, I3, which replaces G1) is asked in Identity so Business 1 opens arranged; where is asked once on the Segment (G2); I4, G9 and G11 withdrawn (6.3, 8.2). Replaces the earlier decision that the Segment owned G1 | rule | confirm |
| R36 | The buyer (who pays) and the user (who uses) are **one Segment**: the Segment describes the buyer (G6, G7, G8, G13, G23, G14, G15), the user is a **second Profile** (P21 "They will use it"), proposed for Proxy Buyers / Gifters (I7b). **G24 "Who uses it?" and G25 are withdrawn (owner, 2026-10-25: "there is no such question")**; each side of a multi-sided market is one Segment frame; the word "consumer" is not used (6.3). Replaces the earlier proposals of a second Segment for the payer and of a Buyer part and a User part. **A buyer who is not the user is not a multi-sided market** (corrected 2026-10-25) | rule | decided 2026-10-25 |
| R37 | O12 and the minimum-age table (10.3): only rows with an official source drive a Review check; the other cells say "check the rule" | list, data | approve; have each Excerpt row re-checked before it is built |
| R38 | Customers under 18 who pay: allowed, with notes and Review lines and a filter on P14; the app states no rule on contracts and gives no legal advice (6.3) | rule | confirm |
| R39 | (multi-sided part: future feature, doc 34) I11 "Market Structure" (single-sided, or a multi-sided platform of two or more distinct groups; the owner's wording, the meaning corrected 2026-10-25) is asked once in Identity and decides whether the last Positioning question splits per side, and (with I3) that each side is one Segment frame. **Who uses it, when not the buyer, is read from I7b (Proxy Buyers / Gifters) and made a second Profile; there is no Segment question** (6.3, 8.2) | field | corrected 2026-10-25 |
| R40 | (multi-sided: future feature, doc 34) When both parts pay (diners pay for the food, restaurants pay a commission) the Segment holds one payer part; the other payment is noted on O3 and confirmed on the Review page. Alternative: allow a payer flag on each part | rule | choose |
| R41 | The Organization tile moves to page 1 as its first tile (Organization, Positioning, Mission, Vision); the Description tile is removed; page 2 is named **Legal Entity**: Founders & Ownership (founder tiles inside), Capability, Registrations, Expenses (8.5) | structure | confirmed 2026-10-23 |
| R42 | The Organization dialog: information on the left (Name, Country, Address, Legal Form, Description), questions on the right (the activities, each ending in its code, then Customers and Who uses it) (8.5) | layout | confirmed |
| R43 | What the business does is up to four activities, each a complete path of dropdowns in the country's scheme ending in one final code; any combination, no "+" inside an activity; the first is the main one (doc 35, 5.7) | field | confirmed 2026-10-23 |
| R44 | "Main Activity" is renamed "Description" and placed last; "Other" options are removed in favour of placements with an "i" | label | confirmed |
| R45 | The Business Plan's "Main activity" row becomes "Activities", filled from the cascade; the box saves into the Description's value (8.5) | label, rule | confirm the label |
| R46 | The cascade generates the code; the heading, slot labels, level names, code label and "i" switch with the organisation's country, in the registry's own words (doc 35, 5.8) | rule, labels | confirmed 2026-10-23; the wording follows the registries' own pages and the Irish statute (doc 35, 5.8 lists which were opened) |
| R47 | A change at a higher level of the cascade resets the levels below it; the slot count is four in every country, with the "i" saying which the register uses; another country defaults to ISIC (doc 35, 5.8) | rule | confirmed 2026-10-23; the ISIC default is a judgement |
| R48 | The generated code is shown at the end of each activity, not in one row at the bottom (8.5) | layout | confirmed 2026-10-23 |
| R49 | The sufficient numbers: options shown per level and activities per parent, by level and by industry (doc 35, 5.9) | numbers | settled from the UK data; provisional elsewhere |
| R50 | A change of country resets every activity and code; nothing is carried over even where the schemes share codes (doc 35, 5.8, rule 4) | rule | confirmed 2026-10-23 |
| R51 | Lists come only from official documents; the owner's wording where given; the audit of the other lists is planned tile by tile (rule 14) | rule | confirmed 2026-10-23 |
| R52 | "Where are you with the business?" sits after the Description with the SBA's four stages (8.2, 8.5) | field | confirmed |
| R53 | Storage of the activities: codes only, with the edition (8.5) | storage | confirmed |
| R54 | Options appear in the official order; a shortlist keeps that order and ends with "Show all" (doc 35, 5.9, 5.10) | rule | confirmed |
| R55 | The Organization tile's labels: Registration Date and Opening Date (the stage follows the Opening Date, 8.2a; the Seller and Buyer Relationship and the Market Structure are on the Positioning tile, 8.2); a folded activity is the fold arrow left of the sub-label, then the code in bold and the last category under it, plain text with a marquee | wording, layout | proposed 2026-10-23; updated 2026-10-25 |
| R56 | Candidate additions to lists (doc 29, former decision 3): P12 (industry reports or trade press; an AI assistant; asking the supplier's other customers), P13 (a reseller, distributor or agent; an event or trade show; an approved-supplier list or framework), P14 (**someone else pays**; direct debit; cheque or voucher), O1 (a rental or hire; a booking of seats, tickets or rooms), O3 (**free to the customer**; a commission or a share of sales), L5 (research and product development). All are the author's, from reading the lists against the statistics offices' categories | list | approve one by one; "Someone else pays" in P14 and "Free to the customer" in O3 first |
| R57 | The Profile's behaviour (P9, P11 to P20, P22, P24) is asked first and its specifics (P1, P5, P6) after the first draft; every check is asked only after the first draft (doc 29, section 6; former decisions 4 and 5) | order | recommended: yes |
| R58 | "Copy a Profile": start a Profile from another and change what differs (doc 29, section 6; former decision 6) | feature | recommended: yes |
| R59 | G10 (the gender mix) is asked last in its box, because it only reveals the notice (doc 29, former decision 7) | order | recommended: yes |
| R60 | A split is offered when a range mixes children and adults (G6; doc 29, section 4; former decision 8) | rule | recommended: yes |
| R61 | "Free to the customer" and "A commission on sales" in O3 are proposed options, not only candidates: a funded service or a non-profit needs them (doc 29, former decision 14) | list | recommended: yes (the platform case is a future feature, doc 34) |

**Where the earlier decision lists went.** Documents 27 (section 7, ten decisions) and 29 (section 9, twelve decisions) no longer hold their own lists; every item is in this table. Document 27's ten decisions are R1 (page 2 as a journey), R26 (the two-level industry list; the UK hint), R25 (Identity choices), R27 (industry packs), R28 (Brand, parked), R29 (the cascade), R30 (build the drivers), R2 and R3 (founders and capability), R22 (no ethnicity list) and R8 with R31 (the plain wording, lists and examples). Document 29's twelve are R35 (several relationships make a Segment frame each; Identity asks "Who do you sell to?"), R44 (the "Another type" of G23 and the "Other" of P6 are withdrawn, placed with an "i"), R56 to R61 (candidates, order, copy, G10 last, split, O3 options), R36 (decided 2026-10-25: no "Who uses it?"), R40 (both parts pay), R37 (O12 and the minimum-age lookup) and R38 (customers under 18 who pay).

## 14. Order of work

The order, the stages, their sizes and their "done when" are in document 27, section 6 (the plan). The index of the app and its documents is `docs/app/contents.md`.

## 15. Evidence

All sources, with their publisher, country, what they support and whether they were opened, are in `02-references.md`, section 2.7 (research of 2026-10-23, the six target countries, reorganised by topic with a coverage table). The ones the lists and rules above rest on:

| Topic | Main sources | Limits |
|---|---|---|
| Industry, organisation size | BUS-01 to BUS-12, BUS-18 to BUS-20 | the UK and the EU have a new edition (SIC 2026, NACE Rev. 2.1); NAICS 2027 proposed; the countries disagree on "small"; revenue tests ignored; some ANZSIC group codes unverified |
| Age, education, household, work, income | DEM-01 to DEM-12 | the education crosswalk is inferred, not official; several tables unopened |
| Digital use and payments by group | DIG-01 to DIG-19 | the UK age data (Ofcom) and New Zealand data could not be opened; Pew, the Australian index and UK Finance are flagged; euro-area payment figures are not Irish |
| Household spending | SPN-01 to SPN-10 | households, not individuals; Australia's latest full results are 2015-16; New Zealand figures unverified |
| Business customers, tenders, payment terms | B2B-01 to B2B-10, PAY-01 to PAY-05 | no sales-cycle evidence; Canada's and New Zealand's current payment rules not found |
| Prices and tax | TAX-01 to TAX-11, PRC-01 to PRC-03 | Canada business-to-business and US sales tax have no official statement found; no official source for a retainer or project fee |
| Channels and journey | CHN-01 to CHN-08 | age-by-platform official data only for the US (non-profit) |
| Geography, language, culture, sex and gender, equality | GEO-01 to GEO-06, LNG-01 to LNG-04, CUL-01 to CUL-03, SEX-01 to SEX-04, EQL-01 to EQL-05 | language duties and several equality laws rest on excerpts; no suburban class in the US |
| Skill areas, stage, ambition | PLN-01 to PLN-07 | no official capability framework or ambition scale; GEM is an academic consortium |
| Brand starting points (parked) | BRD-01 to BRD-11 | US samples; cultural limits; imagery and voice have no source; industry and price are not used; several abstracts only |

**Assumptions with no qualifying source:** the shared lists L1 to L5, L11, L13 and L15 and their examples (doc 35, 5.5); the industry packs (doc 35, 5.6); the brand mapping of images and voice (8.3); the stage action lists (J2); the proposal rules of 7.4 and rules 8 to 10 and 13 of 11.5; the "Charged" mapping; the values list; the options of the relationship-status, household, risk and gender questions; that 33 core questions are an acceptable load. No peer-reviewed study validating the Business Model Canvas's channel and relationship blocks with start-ups was found.

## Appendix A. What became of the question files' questions

Left column: the ids of `north_stardust_multiple_choice_review.md`, written with an F (FS1, FO5) so they are not confused with this document's own ids (G, P, K, O, L, C, R, I, J, D). Right column: this document's ids. "Existing" means the app already has the field.

| Ids | Handling |
|---|---|
| FS1, FS8 | I3, G2 |
| FS2 | P21 (five buying roles) |
| FS3, FS7 | Dropped: derived from I3 and the channels chosen |
| FS4 | P22 |
| FS5 | O3 (how the offering is bought; G19 merged into it) |
| FS6 | P20 |
| FC1 | Existing: the competitor Type |
| FC2, FC3, FC4 | K1; K2 and K3 (as strengths and weaknesses, list L1); K6 |
| FV1 | Existing: the Offering's needs addressed (now by id) |
| FV2, FV3 | O4 (list L1; the second benefit is its second tick) |
| FV4 | Dropped: nothing would read it separately |
| FV5 | O8 (the worries the Profile ticked) |
| FO1 | Existing: the Offering Type |
| FO2 | O1 |
| FO3 | Existing (needs addressed) |
| FO4 | Implied by the Segment the Offering sits under |
| FO5 | O3 |
| FO6 | O2 |
| FO7, FO9 | Derived from O1 and O3 |
| FO8 | Dropped: nothing would read it |
| FO10, FO12 | O6, O7 |
| FO11 | W1 |
| FO13 | Replaced by C1, W2 and the derived gap |
| FO14 | Dropped: the cost cards already record what drives cost |
| FO15, FO16, FO17 | Existing: unit, "Charged", payment timing |
| FO18 | P14 (how customers pay) and the existing Direct Payment subchannels |
| FO19 | Existing: the price on the Revenue stream |
| FO20 | R2 |
| FCH1 to FCH4 | Existing: category, subchannel, stage, offerings |
| FCH5, FCH6 | Dropped (no basis for a fit rule); replaced by J2, a stage action list |
| FCH7 | Existing: links |
| FCH8 | Existing: the channel expense menu |
| FCH9 | J1 |
| FR1 | Existing (J3, now suggested) |
| FR2 | J7 (pre-ticked; J4 merged into it) |
| FR3, FR4, FR5 | Derived: the stage card serves offerings and sits at one stage and channel |
| FR6 | Dropped: nothing would read it |
| FR7 | Existing, now pre-ticked (J7) |
| FR8 | Existing text (note); J5 and J6 are not asked |
| FD1, FD2, FD6, FD10, FD11 | Derived |
| FD3 | Rows proposed from the Discover-stage channels (7.5) |
| FD4 | D1 |
| FD5, FD9 | Dropped: nothing would read them |
| FD7, FD8, FD12 | Existing numbers |
| FD13, FD14 | Derived label (D1, I8); confidence dropped |
| FI1, FI2, FI6 | Merged with O3, W1, O13 |
| FI3, FI4 | Existing links to resources and activities |
| FI5 | W1 |
| FI7 | W3 |
| FQ76 to FQ81 | Existing fields of the cost cards |
| FQ82 | Derived label (D1, I8) |

## Appendix B. Driver, check or note: what each question saves

**Parked** = set aside by the owner for now. **Driver** = its answer produces a proposal (pre-fills a field, proposes a card or a channel, drafts a text, narrows a later list). **Check** = its answer only raises a Review item or an evidence line. **Note** = nothing reads it, so it is not asked as a question and stays as the optional note. The *Tier* column in the tables of sections 6 to 10 says when a question is asked (core, adaptive, optional) and is the earlier view; where it differs from this appendix, this appendix governs.

| Id | Type | What it saves, or why it is only a check or a note |
|---|---|---|
| I1 | Driver | The industry pack; the activity code; the Description draft |
| I2 | (merged) | Merged into I1 |
| I3 | Driver | Arranges Business 1: one Segment frame for each relationship; asked once, on Early Positioning (Seller and Buyer Relationship) |
| I11 | Driver | Market Structure: whether the last Positioning question splits per side of a platform; each side of a platform is one Segment frame (6.3) |
| I4 | Withdrawn | Asked once, on the Segment (G2) |
| I5 | Parked | Brand starting points (the Brand system is set aside for now) |
| I6 | Check (counted; not asked) | Review against budget and competitor prices. 8.2 withdraws I6 as a question (the price position is already said by Differentiation & Outcome, I7c), so it is counted here but not asked **[D: if it is dropped from the count, the checks are 20 and the total 66]** |
| I7 | Driver | Differentiation & Outcome, as built on Early Positioning (I7c, 8.2): it frames the Value Proposition and the Competitor questions and writes a first Positioning sentence. The old I7 was merged into I7c, and the one counted driver stands for the Early Positioning family; I7b (audience) and I7d to I7g (the End User) are the built questions of 8.2 and are not counted separately |
| I8 | Driver | Narrows the estimate basis; labels figures |
| I9 | Check | A later suggestion for funding and hiring |
| I10 | Withdrawn | Merged away (2026-10-26): the Identity System's Values tile already holds the values; a second list asked the same |
| G1 | (moved) | Retired: asked in Identity as I3 |
| G2 | Driver | Orders the suggested channels; asked only here |
| G3 | Driver | Selects the national lists and the equality notice |
| G4 | Check | Remote or rural with shipped or in-person delivery |
| G5 | Check | Who supports another language; the Quebec note |
| G6 | Driver | Narrows P1; context beside the channel suggestions |
| G7 | Driver | Drives the description draft; shown in the Profile's note (P2 merged) |
| G8 | Driver | Drives the description draft; shown in the Profile's note (P7 merged) |
| G9 | Withdrawn | The income step is the household's |
| G10 | Driver | The gender mix reveals P5 and the equality notice |
| G11 | Withdrawn | Replaced by the ramp in G10 |
| G12, P3, P4, K5, K7, K8, O9, C2, C3, J5, J6 | Not asked | Removed from the numbered questions (2026-10-26): nothing read them. The text boxes of the cards stay |
| G13 | Driver | Narrows P6 |
| G14 | Driver | Channel suggestions by size (P23 merged into it) |
| G15 | Driver | Narrows P24; proposes the kinds of business as Profiles; competitor overlap |
| G23 | Driver | The tender row for a public body; the payment-terms note |
| G24 | Withdrawn | There is no such question (owner, 2026-10-25); read from I7b |
| G25 | Withdrawn | With G24 |
| G16 | Check | The price against what they usually pay |
| G17 | Withdrawn | Merged into I7c (price or quality) |
| G18 | Withdrawn | Merged into O11 |
| G19 | Withdrawn | Merged into O3 |
| G20 to G22 | Note | The Market Size box, outside this plan |
| P1 | Check | Age against the Segment's range |
| P2 | Withdrawn | Merged into the note of Specific Personal Information (2026-10-26) |
| P5 | Check | The equality notice |
| P6 | Check | Work situation against the Segment's |
| P7 | Withdrawn | Merged into the same note |
| P8 | Withdrawn | Merged into the same note (G5 keeps the language check) |
| P9 | Driver | The Value Proposition draft |
| P10 | Withdrawn | Deleted (2026-10-26): the author's, no source (rule 14), a check only |
| P11 | Driver | Proposes the Discover channels |
| P12 | Driver | Proposes the Evaluate channels |
| P13 | Driver | Proposes the Purchase channels; the tender row |
| P14 | Driver | Proposes the Direct Payment subchannels |
| P15 | Check | Order and forms on a phone |
| P16 | Driver | Moves digital-only channels down; suggests personal help |
| P17, P18 | Driver | The Value Proposition draft |
| P19 | Driver | Highlights Evaluate actions; the options of O8 |
| P20 | Driver | Suggests the relationship type |
| P21 | Check | Nobody makes the final decision |
| P22 | Driver | Reveals P21 and the tender row |
| P23 | Withdrawn | Merged into G14 (2026-10-26): a check that repeated the Segment's size at Profile level |
| P24 | Driver | The business customer's kind of business: pack examples, competitor overlap |
| K1 | Check | Price comparison |
| K2, K3 | Driver | The differentiation draft |
| K4 | Check | A channel gap |
| K6 | Check | "A guess" |
| O1 | Driver | The presets |
| O2 | Check | Sales before the offering is ready |
| O3 | Driver | The single source for three fields |
| O4 | Driver | The Value Proposition draft (O5 merged into it) |
| O6 | Driver | Proposes the Deliver channels |
| O7 | Driver | Proposes Support channels and the relationship type |
| O8 | Check | A worry nothing answers |
| O10 | Driver | Proposes the Delivery constraints (L3) |
| O11 | Check | The spending evidence line (G18 merged into it) |
| O12 | Check | A Segment whose customers are below the minimum age |
| W1 | Check | A partner chosen but none linked |
| W2 | Driver | Derives the capability gap |
| W3 | Note | Proposed from O10; not asked |
| C1 | Driver | Derives the capability gap |
| C4 | Driver | Proposes a Partner card or a people-cost line |
| C5 | Withdrawn | Merged into C4 (2026-10-26): "I plan to hire" already says it; how many is typed in the people-cost line it proposes |
| R1 | Driver | The tax arithmetic |
| R2 | Check | Price evidence |
| J1 | Check | A planned channel behind an actual estimate |
| J2 | Driver | A stage action, instead of typing it |
| J7 | Driver | Pre-ticks the goal (J4 merged into it, 2026-10-26) |
| D1 | Check | Labels the figure |

### The counts (the one place that holds them)

After the merges of 2026-10-25 and 2026-10-26 the numbered questions are **67: 41 drivers, 21 checks, 4 notes (G20 to G22, W3) and 1 parked (I5)**. Other documents give the total and link here; they do not repeat the table.

| Area | Drivers | Checks | Notes | Total | Ids |
|---|---|---|---|---|---|
| Identity | 5 | 2 | 0 (1 parked) | 8 | I1, I3, I5 to I9, I11 (I2 merged into I1; I4 withdrawn; I10 merged into the Values tile) |
| Segment | 10 | 3 | 3 | 16 | G2 to G8, G10, G13 to G16, G23 with G4, G5, G16 as checks, and G20 to G22 as notes |
| Profile | 12 | 5 | 0 | 17 | P1, P5, P6, P9, P11 to P22, P24 (P2, P7, P8, P10, P23 withdrawn; P3, P4 not asked) |
| Competitor | 2 | 3 | 0 | 5 | K1 to K4, K6 |
| Offering | 6 | 4 | 0 | 10 | O1 to O4, O6 to O8, O10 to O12 (O5 merged; O9 not asked) |
| Delivery, capability, founders | 3 | 1 | 1 | 5 | W1 to W3, C1, C4 (C2, C3 not asked; C5 merged) |
| Price | 1 | 1 | 0 | 2 | R1, R2 |
| Journey, demand | 2 | 2 | 0 | 4 | J1, J2, J7, D1 |
| **Total** | **41** | **21** | **4** | **67** (1 parked) | |

The drivers: I1, I3, I7, I8, I11; G2, G3, G6, G7, G8, G10, G13, G14, G15, G23; P9, P11, P12, P13, P14, P16, P17, P18, P19, P20, P22, P24; K2, K3; O1, O3, O4, O6, O7, O10; W2; C1, C4; R1; J2, J7. The first release builds the drivers; the checks follow; the notes are never asked.

**Withdrawn, merged or no longer numbered** (2026-10-25 and 2026-10-26): G24 and G25 (the user is a second Profile; I7b already asks it), G17 to G19 (into I7c, O11, O3), I10, C5, J4, P2, P7, P8, P10, P23, O5, and the notes G12, P3, P4, K5, K7, K8, O9, C2, C3, J5 and J6. That is 25 ids, while 91 candidates less the 67 that remain is 24; the earlier count of 91 is therefore off by one or one of the 25 was never among the 91 **[D: not identified]**. The question files of 2026-10-15 held 82 questions, about a dozen of which were already fields of the app (Appendix A).
