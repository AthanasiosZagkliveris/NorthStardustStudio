# 2. Questionnaire specification: lists, questions, connections and evidence

Status: **proposal**, written 2026-10-22, updated 2026-11-21; parts are built. It is the specification that goes with Questions 1 (the plan). **Built** (marked "as built" or "built" where described): the Organisation tile with its activity cascade (Research 3, 5.7 to 5.10, 8.5), the business stage and key dates (8.2a), the Early Positioning questions with the End User questions (8.2), the Legal Entity (8.5), the Segment card's questions (6.3a, Questions 12), the Profile card's questions in part (6.4, Questions 13), the Competitor card (6.6, Questions 14), the Value Proposition draft (6.7, Questions 15) and the Offering card in part (6.8, Questions 16). **Not built:** everything else (the shared lists as fields, the industry pack, the rest of the Profile, O12, the journey, the price questions). The **plan** (the goal, the order, what is built when, what was cut and why) is Questions 1, and **the flow of the questions as trees** (which answer leads to which question, the key branches, both, mixed, not sure and other, the order) is Questions 3. This document holds the detail the plan points to: the shared lists with examples, the industry list in two levels, every question with its wording and options, how every characteristic connects to the rest of the app and on what evidence, and the moves and decisions. Decisions for the owner are marked **[D]** and collected in section 13 (which also holds the decisions of Questions 1 and 3). The counts of questions, drivers, checks and notes are held only in Appendix B. Where the code and this document disagree, the latest dated decision wins (`standard.md`, section 3). Its Business page numbers are the old ones (`specifications/03-business-system/README.md`, "The old page numbers"). The sources are in `01-references.md`, section 2.7, and are cited here by id (for example `DIG-14`).

> **First published version (owner, 2026-10-29):** English only; UK, Ireland, USA, Canada, Australia, New Zealand and Other; single-sided; B2C and/or B2B; the buyer's category separate from the buyer's life stage. **Questions 4 governs** where it differs from this document. Everything described here that the first version does not contain (B2G, G2B, multi-sided markets, other countries, accessibility, caregiving and the rest) is a future feature: Questions 4. Age limits are checked on the Offering (O12) and the Review (Questions 16; O12 is not built yet). Contents of the documents: `docs/README.md`; index: `docs/index.md`; glossary: `docs/app/03-glossary.md`.

> **Where each part stands (2026-11-08).** What is built, tile by tile, is held in the questions README (`docs/design/questions/README.md`) and in Questions 1, section 11; this note says only which document governs each section. Current: 1 to 5 (the summary, the rules and the wording), 11 (the connection map and the evidence), 12 to 15. Governed by their tile documents: 6.3a by **Questions 12** (the Segment), 6.4 and 6.5 by **Questions 13** (the Profile), 6.6 to 6.8 by **Questions 14 to 16** (the Competitor, the Value Proposition, the Offering), 8.2 by **Questions 8** (Positioning), 8.5 by **Questions 7** (the Organisation); where they differ, those documents are right. Replaced and archived: 6.3 (the Segment's G-list), the 6.6 tables and the 6.7 paragraph of 2026-11-03. Not yet specified in that form: 7 (Customer Engagement), 9 and 10. Age limits by activity: **Research 4**. What an "i" says: **Interface 10**. The form every tile document takes: **Questions 1, section 11**.

**Contents**

- [1. Summary](#1-summary)
- [2. What was read, and what was not](#2-what-was-read-and-what-was-not)
- [3. Rules for the changes](#3-rules-for-the-changes)
- [4. Plain wording](#4-plain-wording)
  - [4.1 Rules for writing our questions](#41-rules-for-writing-our-questions)
- [5. The countries and the shared lists](#5-the-countries-and-the-shared-lists)
  - [5.1 What differs by country](../research/03-lists-and-classifications.md#51-what-differs-by-country)
  - [5.2 The shared lists](../research/03-lists-and-classifications.md#52-the-shared-lists)
  - [5.3 The crosswalks (national schemes behind the plain lists)](../research/03-lists-and-classifications.md#53-the-crosswalks-national-schemes-behind-the-plain-lists)
  - [5.4 Industries, level 2: the "more exactly?" list](../research/03-lists-and-classifications.md#54-industries-level-2-the-more-exactly-list)
  - [5.5 Examples under the options](../research/03-lists-and-classifications.md#55-examples-under-the-options)
  - [5.6 The industry pack: what a sub-industry gives the user](../research/03-lists-and-classifications.md#56-the-industry-pack-what-a-sub-industry-gives-the-user)
  - [5.7 The activity cascade: levels, how many to pick, and what the data shows](../research/03-lists-and-classifications.md#57-the-activity-cascade-levels-how-many-to-pick-and-what-the-data-shows)
  - [5.8 The code and the words: what the cascade ends on, and how each country names it](../research/03-lists-and-classifications.md#58-the-code-and-the-words-what-the-cascade-ends-on-and-how-each-country-names-it)
  - [5.9 How many choices at each level (the sufficient numbers)](../research/03-lists-and-classifications.md#59-how-many-choices-at-each-level-the-sufficient-numbers)
  - [5.10 The classification data](../research/03-lists-and-classifications.md#510-the-classification-data)
- [6. Business 1 · Foundation: the customer model and the cards](#6-business-1--foundation-the-customer-model-and-the-cards)
  - [6.1 The owner's customer-segment text: analysis and what was adopted](#61-the-owners-customer-segment-text-analysis-and-what-was-adopted)
  - [6.2 The model: categories, groups and the questions that carry them](#62-the-model-categories-groups-and-the-questions-that-carry-them)
  - [6.3 Segment card (tile "Segment Description"): step 1, revised after the owner's review of 2026-10-23](#63-segment-card-tile-segment-description-step-1-revised-after-the-owners-review-of-2026-10-23)
  - [6.4 Profile card (cards nested in the same tile): a typical person, asked specifically](#64-profile-card-cards-nested-in-the-same-tile-a-typical-person-asked-specifically)
  - [6.5 The cascade: one choice per Segment, the Profile follows it](#65-the-cascade-one-choice-per-segment-the-profile-follows-it)
  - [6.6 Competitor card (tile "Competitors")](#66-competitor-card-tile-competitors)
  - [6.7 Tile "Value Proposition"](#67-tile-value-proposition)
  - [6.8 Offering card (tile "Offerings")](#68-offering-card-tile-offerings)
  - [6.9 Required answers (proposal)](#69-required-answers-proposal-d)
  - [6.10 Information the earlier files expect that has no field](#610-information-the-earlier-files-expect-that-has-no-field)
- [7. Business 2 · Customer Engagement, rebuilt as a journey](#7-business-2--customer-engagement-rebuilt-as-a-journey)
  - [7.1 Why it changes](17-customer-engagement.md#71-why-it-changes)
  - [7.2 Target structure (per Segment)](17-customer-engagement.md#72-target-structure-per-segment-d)
  - [7.3 Stage card](17-customer-engagement.md#73-stage-card)
  - [7.4 The proposals (rules; all suggestions the user can ignore)](17-customer-engagement.md#74-the-proposals-rules-all-suggestions-the-user-can-ignore)
  - [7.5 Demand card (one per Offering)](17-customer-engagement.md#75-demand-card-one-per-offering)
- [8. Identity · what to ask](#8-identity--what-to-ask)
  - [8.1 What exists (as built, 2026-10-25)](#81-what-exists-as-built-2026-10-25)
  - [8.2 The Positioning tile and the Identity questions](08-positioning-tile.md#82-the-positioning-tile-and-the-identity-questions)
  - [8.2a The business stage, the Opening Date and the key dates (as built, 2026-10-24 and 25)](#82a-the-business-stage-the-opening-date-and-the-key-dates-as-built-2026-10-24-and-25)
  - [8.3 Brand starting points from Identity (parked)](#83-brand-starting-points-from-identity-parked)
  - [8.4 Brand and Strategy: the rest](#84-brand-and-strategy-the-rest)
  - [8.5 The Organisation tile (page 1): layout](07-organisation-tile.md#85-the-organisation-tile-page-1-layout)
  - [8.6 The wording of the Organisation tile](07-organisation-tile.md#86-the-wording-of-the-organisation-tile)
- [9. Founders and Capability](#9-founders-and-capability)
  - [9.1 Three founder places today](../../specifications/03-business-system/04-infrastructure-and-capability.md#91-three-founder-places-today)
  - [9.2 Target](../../specifications/03-business-system/04-infrastructure-and-capability.md#92-target-d)
  - [9.3 The new questions](../../specifications/03-business-system/04-infrastructure-and-capability.md#93-the-new-questions)
  - [9.4 What the skill areas are, and why](../../specifications/03-business-system/04-infrastructure-and-capability.md#94-what-the-skill-areas-are-and-why)
- [10. Business 3 (Delivery) and Business 5 (price)](#10-business-3-delivery-and-business-5-price)
  - [10.1 Delivery card](19-capacity-and-delivery.md#101-delivery-card)
  - [10.2 Revenue stream card (page 5)](20-financials-and-inventory.md#102-revenue-stream-card-page-5)
  - [10.3 Minimum ages to buy, by product and country (O12)](16-offering-questions.md#103-minimum-ages-to-buy-by-product-and-country-o12)
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

1. **One test for every question: does it save the founder work?** A question is kept as a **driver** when its answer produces a proposal: it pre-fills a field, proposes a card or a channel, drafts a text, or narrows a later list. A question that only raises a Review check is a **check**; a field that nothing reads stays a **note** and is not asked. Of the candidate questions, **67 remain numbered: 41 drivers, 21 checks, 4 notes and 1 parked** (the Brand question); the totals by area, and the ids withdrawn or merged, are in Appendix B, which is the one place that holds them. The plan (Questions 1) builds the drivers first.
2. **Target countries: the UK, USA, Canada, Australia, Ireland and New Zealand** (owner, 2026-10-23). Lists that depend on a country (industry, organisation size, education, urban or rural, tax, quoting prices) were checked against official sources of those six countries (section 5). **The UK and the EU have a new industry classification** (UK SIC 2026 and NACE Rev. 2.1, which move the section letters), so the industry list is keyed on divisions, not on letters (Research 3, 5.3).

**The letters of the ids** are labels, never shown to the user: **I** Identity; **G** the customer Group (the Segment card); **P** the Person (the Profile card); **K** the Competitor (C was taken by Capability); **O** the Offering; **L1 to L25** the shared **Lists** of Research 3, 5.2; **W** the Work of the Delivery card (it was L1 to L3, which clashed with the Lists, renamed 2026-10-25); **C** Capability and the founders; **R** the Revenue stream; **J** the customer Journey (the stage card); **D** the Demand card; **F** (FS, FC, FV, FO, FI, FD, FQ, FR) the ids of the earlier question files, Appendix A only.
3. **Identity is the entry point.** The Organisation tile (what kind of work you do, in the levels of the country's classification; when it opens) and the Early Positioning tile (the market structure, who pays, the audience, what you compete on, each a choice beside its free text; 8.2) hold the answers meant to narrow every later list and to suggest examples (segments, offerings, skills, resources, channels). The Segment card reads them in part so far (8.1, 8.2, Questions 12). Giving the Brand system starting points is parked by the owner (2026-10-23, section 8.3).
4. **The customer is a model, not a form** (the owner's customer-segment text, 6.1): six categories; a **Segment** takes one choice per question and a **Profile** takes specifics, **and the Profile follows the Segment** (the cascade, 6.5; Questions 13, 2.2); answers filter, reveal and suggest; an answer that no longer applies is removed (Interface 10, 3.4).
5. **Every characteristic is connected to the other parts, with evidence** (section 11). The result is 28 **rules the evidence supports**, a longer list of **rules it does not support** (so they are not built), and an **evidence line** the user can read beside each connection. Demographics connect to competitors only through what customers care about and where they look.
6. **A suggestion, a Review check or a help line, never a hidden option.** Tendencies from official statistics are shown as tendencies, with their source. Typical ranges appear in a rate's 'i' only where a checked source supports them; no figure is filled in (owner, 2026-11-17 00:10; the four built are in Questions 18, 2.6). **One exception, a fixed official fee** (Questions 10, decision 5; the owner's delegation of 2026-11-19 19:48 UTC+2): a registry's set fee (£100 incorporation, £50 confirmation statement, $200, $9) is filled in, with a muted line "Official fee, checked [date]" and its source, and followed until the founder changes it; a premium or a quote stays empty.
7. **The wording is plain and every option has an example** (sections 4, Research 3, 5.5). **One vocabulary in several places** (Research 3, 5.2): the "what customers care about" list is ticked by a Profile, chosen by an Offering, used for a competitor's strengths and for what you compete on.
8. **Customer Engagement is rebuilt as a journey** (section 7): one tile per stage, one card per channel, proposed from the Profile's and the Offering's answers. **Founders and capability** are one place with the gap derived (section 9).
9. **No new page.** Tiles and cards only, from existing components; a chapter may hold any number of tiles.

## 2. What was read, and what was not

**Read** (two read-only passes each, from the code): Business pages 1, 2, 3 and 5, the Identity System, the Founders Profile and the Business founder cards, the tile and card pattern and the shared components; the specifications of page 1, page 2 and the Offering's Capability part of page 3; the audience PDF, the two question files of 2026-10-15, and the owner's customer-segment text of 2026-10-23. **Research** (web, eleven passes, 2026-10-23, including an inventory of the Brand System and the industry classifications): official sources of the six countries on every list and connection in this document. Many official pages could not be opened by the research tool (ACCC, ATO, Ofcom, ACMA, several StatCan and CSO tables, NZQA, QQI, Stats NZ expenditure); those points rest on search excerpts and are marked in `01-references.md`, which also has a coverage table showing which country has what.

**Not read:** the Brand and Strategy editors in detail; the rest of the page 3 specification; the Financial editors beyond price and revenue; `09-layout-rules.md` in full; the tests; the jurisdiction option lists beyond their shape. Nothing was run in a browser. Lists marked "author's proposal" have no source and need the owner's approval.

## 3. Rules for the changes

1. **One owner per answer.** An answer is asked once, in the card that owns it; other places read it by id.
2. **Everything is a tile or a card.** A page is chapters of Master Tiles; a tile opens a dialog of cards; a card holds fields. A **chapter may hold fewer or more than four tiles** (owner, 2026-10-22).
3. **Existing components only** (`01-shared-components.md`). Legend: **Dropdown** = `OptionPicker` (one answer); **Radio** = `RadioChoice`; **Ticks** = `BusinessTicks` / `TickField` (several); **Number** = `NumberCell`; **Text** = `TextField` / `StrategyTextArea`; **List** = `NumberedListInput`. A shared control is never changed.
4. **Four behaviours, from the owner's text.** **Filter**: hide an option only when it is genuinely incompatible with an earlier answer, never because it is merely less common. **Reveal**: show a follow-up question when an answer makes it relevant. **Suggest**: offer a likely connection as a labelled suggestion the user can ignore. **Review dependencies**: when an earlier answer changes, the compatible answers stay and an answer that no longer applies (a question no longer asked, an option no longer offered) is removed on the next choice, as built (Questions 12 and 13, 2.2; the standard phrase in Interface 10, 3.4). A preset hides, never deletes: a saved value in a hidden option stays and counts.
5. **Evidence rule.** A connection that is not logically certain is a *tendency*: it shows an evidence line with its source id and country, says "tends to", never says "is", and is never used to exclude, hide, price differently or fill in a number.
6. **Texts of the page 1 specification are used as written**; every new or changed label and option needs the owner's approval. A box that becomes a question keeps its title and gains an optional note.
7. **Tooltips** are one-line "Click to ..." sentences, only on pressed controls.
8. **After every change:** a browser check in three reading modes, `npm run check:layout` alone, `npm run check:console`, `npm run verify`, the examples in `src/data/examples/` (and goldens where figures move), a row in the log.
9. **Ask only what something reads.** A question is kept if a calculation, a suggestion, a draft or a Review item reads it.
10. Numbers (price, volume, income, age, size) are never choice labels.
11. **Driver, check or note.** Every question is one of three (Appendix B): a driver produces a proposal, a check only raises a Review item, a note is not asked. The first release builds the drivers.
12. **Who they are is one choice; what they do is several.** A Segment is a narrow group: each fact of who they are (age group, education, size, work, industry, type) is one choice, and more than that is another Segment (Questions 12). The Profile follows the Segment (Questions 13, 2.2). Several answers belong to what customers do or prefer.
13. **Each fact is asked once, where it belongs.** A default (a country, a first Segment's answer) is not a second question; it is a starting value the user confirms. A field that only repeats another is not asked.

**Rule 14: lists come only from documents, never from the author** (the owner, 2026-10-23, repeated; refined 2026-10-24). **Where an input asks for a country's own classification (codes, names, categories: industries, legal forms, registers), the list is taken from the official document of a government, a statistics office, a regulator or a statute. Where it is only the options of a dropdown (how a business positions itself, how it wants to be seen), the list may come from the documents of a business school or university** (a faculty's own page, paper or published abstract). In both cases the list keeps that document's order and words, or it is the owner's own wording from this conversation. The author makes up no list and no category. **Audit:** most lists of Research 3, 5.2 are the author's and fail this rule: L1 (what customers care about), L2 (worries), L3 (frustrations), L4 (goals), L5 (skill areas), L7 (the 18 industries), L9 (age bands, a composite), L11, L13, L14, L15, and the option lists of O1, O3, I5, I9 and several Profile questions. Only L8, L10 and L12 follow statistics offices' own wording, and L6 follows the app. Each is to be replaced by an official list, the owner's wording, or dropped, tile by tile, after the Organisation tile. The industry cascade (Research 3, 5.7 to 5.10), the legal forms (existing, by country) and the Stage question (I8) already follow this rule.

## 4. Plain wording

The wording follows these author's rules (no outside style guide was opened for them):

- Speak to "you" and say "they" for the customer; one idea per question; about twelve words or fewer.
- No jargon in a question or an option. "B2B" is "businesses or organisations"; "decision-maker" is "the person who makes the final decision"; "channel" is explained under the "i" as "a way you reach customers".
- Options are things a founder recognises, not categories from a statistics office. Where a national scheme exists it sits **behind** the option (the crosswalk), not in front of it.
- Every question has an "i"; what it says (what it asks, how to answer, what it changes now, the option notes and the source line of a connection that rests on evidence) is owned by Interface 10, 3.2 to 3.4.
- A question that does not fit the customer is not asked, and a question the user cannot answer yet is left unanswered: no "Not relevant", "Not sure yet" or "Prefer not to say" option (owner, 2026-11-02; section 4.1).
- The owner approves the final wording of every question and option **[D]**.

### 4.1 Rules for writing our questions

This section owns how a question is worded; Interface 10 owns what its "i" says. From official survey and style guidance (sources in `01-references.md`, QST). Most were read; the gaps are stated there.

**Before a new question is added** (it was Questions 3, section 8): it has one owner, the card where it is asked (rule 3.1); it passes the value test and is a driver, a check or a note with an id and a row in Appendix B (rules 3.9 and 3.11; Questions 3, section 7); it sits where it prunes early or waits for the draft (Questions 3, section 6); what each answer shows, hides or proposes is written in its tile document's connections (Questions 1, section 11); a connection that is not certain shows its evidence and says "tends to" (rule 3.5); its options have examples (Research 3, 5.5) and it has an "i" (Interface 10); and its wording follows the tables below.

| Do | Source |
|---|---|
| **One idea per question**: no "and" or "or" joining two concepts | QST-01, QST-03 |
| **Answer options that do not overlap and cover everything**; test that a boundary value (for example 25) fits one band only | QST-01, QST-10, QST-14 |
| **Simple words**; spell out abbreviations | QST-01, QST-03 |
| **A logical order**: an inherent order where there is one (education, age, size); otherwise the most common option first; keep a list to about ten short options | QST-03 |
| **No "Prefer not to say", "Not sure" or "Not relevant" option** (owner, 2026-11-02): the questions help the app user define their own customer and set the questions that follow, they are not a survey of people about themselves; a question is left unanswered, or is not asked, instead | QST-03, QST-06 |
| **Single choice when one answer is expected**; several only when several can genuinely apply, with "Select all that apply" and "None" last | QST-12 |
| **"Other" only where a real further option exists** (owner, 2026-11-04), last, with a place to say what | QST-03 |
| **Ask only what we will use**: every question says what it is for | QST-06 |
| **A slash joins similar things, the word "or" joins different things** ("Laptop / desktop", "Non-profit / charity / NGO"; "Owner or senior executive", "Invoice, bank transfer or purchase order"); a name that holds a comma ("Buy Now, Pay Later") keeps it | owner, 2026-11-03 (replaces the slash-only rule of 2026-11-02) |
| **Reuse an established wording** (the statistics offices') where there is one | QST-10 |
| **Test the wording** with a few real users before it is built | QST-10, QST-15 |
| **Affirmative, natural voice**: say what something is and does; the rule is owned by `standard.md`, section 3 | owner, 2026-11-09 |

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

**Moved to Research 3 (`03-lists-and-classifications.md`) on 2026-10-29; the sub-section numbers are unchanged.** It holds the country differences, the shared lists, the national crosswalks, the industry lists, the examples, the industry pack, the activity cascade, the code and the words, the choices at each level and the classification data. References in this document written "Research 3, 5.N" point there.

- [5.1 What differs by country](../research/03-lists-and-classifications.md#51-what-differs-by-country)
- [5.2 The shared lists](../research/03-lists-and-classifications.md#52-the-shared-lists)
- [5.3 The crosswalks (national schemes behind the plain lists)](../research/03-lists-and-classifications.md#53-the-crosswalks-national-schemes-behind-the-plain-lists)
- [5.4 Industries, level 2: the "more exactly?" list](../research/03-lists-and-classifications.md#54-industries-level-2-the-more-exactly-list)
- [5.5 Examples under the options](../research/03-lists-and-classifications.md#55-examples-under-the-options)
- [5.6 The industry pack: what a sub-industry gives the user](../research/03-lists-and-classifications.md#56-the-industry-pack-what-a-sub-industry-gives-the-user)
- [5.7 The activity cascade: levels, how many to pick, and what the data shows](../research/03-lists-and-classifications.md#57-the-activity-cascade-levels-how-many-to-pick-and-what-the-data-shows)
- [5.8 The code and the words: what the cascade ends on, and how each country names it](../research/03-lists-and-classifications.md#58-the-code-and-the-words-what-the-cascade-ends-on-and-how-each-country-names-it)
- [5.9 How many choices at each level (the sufficient numbers)](../research/03-lists-and-classifications.md#59-how-many-choices-at-each-level-the-sufficient-numbers)
- [5.10 The classification data](../research/03-lists-and-classifications.md#510-the-classification-data)

## 6. Business 1 · Foundation: the customer model and the cards

One frame per Customer Segment (as today). Tiles and cards are unchanged; fields are added or changed. **The P, G and I ids in 6.6 to 7.5 are the earlier design's**; where each is asked now is listed at the head of 11.5. **The Tier column** in the question tables of sections 6 to 10 says when a question is asked (core, adaptive, optional); **Appendix B** says what a question is worth (driver, check, note) and governs where the two differ.

### 6.1 The owner's customer-segment text: analysis and what was adopted

The text describes the Customer Segment as a **connected information model** rather than a questionnaire: a Segment is the broad group, a Profile a more specific customer within it (up to three), six categories organise the characteristics, and a connection map decides which questions, options and information become relevant.

**Adopted as written:**

- **The two levels.** Segment = ranges and broad choices; Profile = specifics. The earlier "derive the Segment from the Profiles" idea is withdrawn; instead each Profile is checked against its Segment (6.5).
- **The six categories and their groups** (table 6.2). Groups that earlier drafts missed are added: household and family composition, occupation and employment, nationality and cultural background, language, gender and sex, geography details (country, region, city, local area, urban or rural), digital skills, devices, spending priorities, buying frequency, risk orientation.
- **The model vocabulary:** Category, Group, Characteristic, Band (a predefined range or list), Question, Option, Connection, Rule, Meaning, Evidence. In the app a Category is a block of fields on the card, a Group a field set, a Characteristic a field, a Band one of the lists of Research 3, 5.2, a Question its label, an Option an option, a Connection a row of section 11, a Rule what the app does (Filter, Reveal, Suggest or Review), the Meaning the "i" help line and the Evidence the source ids shown with the connection. **[D]** the repository already generates documents from tables (`npm run tables`, the library); the model could be kept as **one content table** from which the fields, options, rules and help lines are generated, so a rule is written once.
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

| Category | Group | Segment (one choice, or several for what they do) | Profile (a specific) |
|---|---|---|---|
| **1 Demographics** | Age and life stage | G6 age group (one choice) | P1 an age |
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

> **Moved (2026-11-01).** The earlier design of the Segment card (the ids G1 to G25, the worked cases, what the card gives the next parts) is in `docs/archive/proposals/segment-questions-g-list-2026-10-23.md`. What is built is 6.3a below and Questions 12; they govern. The table says where each old id went.

| Old id | The question | Now |
|---|---|---|
| G1 | Who you sell to | retired: asked once in Identity (Seller and Buyer Relationship, Questions 8) and only read by the Segment |
| G2 | Where are your customers? | Geographics 1, "Where are your customers?" (Questions 12) |
| G3 | Their main country | not asked; the customers' country is read from the Organisation later (not built) |
| G4 | The kind of area | Geographics 2, a check held back while Planning and Launching (Questions 12) |
| G5 | Their languages | not asked |
| G6 | The age range of the customer | Demographics 1, the age group chosen as a term from the Positioning life stage (Questions 12) |
| G7 | Education | Demographics 2 |
| G8 | Household income | Demographics (income, Low to High) |
| G10 | The gender mix | Demographics (five radios) |
| G13 | Work situation | Demographics: the primary work status, the non-working situation, and for the working their environment, schedule and income structure |
| G23 | The type of organisation | Business Data 1 |
| G14 | How big are they | Business Data 2 (four sizes; skipped for the self-employed) |
| G15 | The industry | Business Data 3 and 4 (a sector, then an industry) |
| G16 | What they usually pay | not a Segment question (the price belongs with the Offering) |
| G17, G18, G19 | price feeling, what they spend on, how often they buy | withdrawn on 2026-10-25 and merged into Identity and the Offering (see the archived text) |
| G24, G25 | who uses it | withdrawn; the user is a part of the same card for a Proxy or Dual-Intent buyer (Questions 12) |
| Proposals, worked cases, what the card gives the next parts | | the archived text; the reads that are planned are in each question's connections (Questions 12) |

### 6.3a The Segment card's questions as built

**Questions 12 owns the questions of the Segment card**: every question, its control, when it is asked, its options, its "i", what it comes from and what reads it, in the order of the card. This section keeps only what is not there.

The five boxes and what they ask:

| Box | Asks | Asked of |
|---|---|---|
| 1 Demographics | the age group (a term of the buyer's life stage chosen in Positioning), education, work status and what follows from it, household income, gender mix | a buyer that is people |
| 2 Geographics | where the customers are; the kind of area (Managing and Growing only) | both |
| 3 Business Data | the type and size of the organisation, the sector, the industry | a buyer that is a business; it comes before Geographics |
| 4 Purchasing Power & Behaviour | comfort with online tools; the social environment (people only); where they discover new products; sharing, shopping triggers and path to purchase (people only); where they buy; how they pay; who decides to buy (business only) | both, by part |
| 5 Market Size & Industry Outlook | the size of the market, the trajectory, the macro trend, how competitive (in this order since 2026-11-06, Questions 12) | both |

A **user** part (a life stage, then the questions that follow from the Positioning relationship) is asked when a relationship chosen in Positioning has a Proxy or Dual-Intent buyer. The kind of a Segment (people or businesses) and the two Segments made where Positioning chose both are in Questions 12. The code is `src/framework/engine/choices/SegmentQuestions.ts`; the card reads Identity through `segmentContext` (`src/framework/engine/SegmentContext.ts`).

**Not built yet (the reads).** The answers are saved and shown in the Segment's documents (the Market document and the export); little else reads them. The reads that are planned are listed under each question in Questions 12 and in Guide 3, section 8.3.

### 6.4 Profile card (cards nested in the same tile): a typical person, asked specifically

**Questions 13 owns the Profile's questions**: each question with its control, options, conditions, starting values and connections; what is built (`src/framework/engine/choices/ProfileQuestions.ts`) and what is not (the kind of business A4, the specialised needs A6, the proposed Profiles, the user's own Profile). A Profile asks a typical person only what the Segment cannot; the personal facts the Segment already asks (education, household income, the shares of gender) are not asked again, and language, household and relationship status and job title stay in the note. The Needs (Functional, Emotional, Social) stay text lists: a need is a precise statement ("send an invoice in under a minute"), not a category.

The ids of the earlier design are kept here because other documents cite them. Where each went:

| Id | Question | Now |
|---|---|---|
| P1 | How old is this person? | Questions 13, A1 |
| P5 | What is this person's gender? | A2 |
| P6 | What is this person's job role? | A3 |
| P9 | What matters most to this person? (up to 5, list L1, each rated) | B1 |
| P11 | Where do they look when they need something like this? (list L6; proposes the **Discover** channels, 7.4) | split into C2 (social media), C3 (communities) and C4 (events) |
| P12 | How does this person compare options? (proposes **Evaluate** channels, 7.4) | D1 |
| P13 | How do they usually buy? (proposes **Purchase** channels; reveals the "Contracts or tenders" demand row) | not asked: the Segment asks where they buy (Questions 12) |
| P14 | How do they like to pay? (list L13; proposes the Direct Payment subchannels, 7.4) | not asked: the Segment asks how they pay |
| P15 | Which devices does this person use? (list L15) | C1 |
| P16 | How comfortable are your customers online? | not asked: the Segment asks it; the app never infers it from age |
| P17 | What are this person's main goals? (list L4) | E1 |
| P18 | What frustrates this person? (list L3) | E2 |
| P19 | What might stop this person buying? (list L2; the Offering ticks the worries it answers, O8) | E3 |
| P20 | How much help does this person want before buying? | D2 |
| P21 | What is this person's role in buying? (the five buying-centre roles of Webster and Wind, 1972 [CHN-02]) | A5 |
| P22 | How is the decision made? | not asked: the Segment asks how the decision is authorised; A5 says what part this person plays |
| P24 | Which kind of business is it? (the level-2 list of the industry, Research 3, 5.4) | A4 (not built) |

What each answer should read (the Value Proposition draft, the Evaluate channels on page 2, the Review) is in the connections of each question in Questions 13.

### 6.5 The cascade: one choice per Segment, the Profile follows it

The Segment holds one choice per question and each Profile a specific answer, and **the Profile follows the Segment** (Questions 13, 2.2). This saves the user from re-reading a whole list on every Profile and keeps the two levels consistent. **Questions 13, section 2, owns the table of what the Segment sets and the Profile chooses within it** (the age group and the exact age, the work status and the job level, the gender mix, the industry and the kind of business, the ways of discovering ideas and the social environment), the Profiles the app proposes, and what happens when a Segment answer changes. The old ids map as G6 to A1, G13 to A3, G10 to A2, G15 to A4; G3 (the main country) is not asked.

Questions asked only at the Profile, with no Segment range: P9 to P22 (Questions 13, boxes B to E). If a Segment answer changes, the answers that still fit stay and the others are removed (Questions 13, 2.2). The same Review checks list a Profile outside its Segment and a Segment range no Profile covers.

### 6.6 Competitor card (tile "Competitors")

> **Questions 14 owns the Competitor card**: every question as built (K1 to K10), its options, its "i" and its connections. The tables of 2026-11-03 that stood here are in `docs/archive/proposals/competitor-and-value-proposition-2026-11-03.md`.

### 6.7 Tile "Value Proposition"

> **Questions 15 owns the Value Proposition tile**: the text, the draft sentence and the open items as built. The paragraph of 2026-11-03 that stood here is in `docs/archive/proposals/competitor-and-value-proposition-2026-11-03.md`.

### 6.8 Offering card (tile "Offerings")

> **Questions 16 owns the Offering card**: the Type, Functional Needs Addressed (by the Profiles' task ids), the six boxes with their Notes in two sections (Description; Terms & Service), O1 to O10 and O14 to O18 (built 2026-11-07 and 2026-11-08), O12 (derived, not built) and O13 (retired), each with its options, its "i" and its connections. The tables of 2026-11-03 that stood here are replaced by it.

Kept here because Questions 16 does not hold it: **O11**, "What does the customer spend on when they buy this?" (a dropdown of L12; optional, for people; it replaces G18): it would show which share of the customer's spending the Offering competes for, with an evidence line (rule 15 of 11.5). It is not asked (Questions 16, "Still to decide"). And a planned Review of O1 against how comfortable the Segment is online (Questions 12, Box 4, 1) and the Profile's devices (Questions 13, C1; rule 7 of 11.5).

### 6.9 Required answers (proposal) **[D]**

Today only a card's name is checked. Proposed, once, per page: Segment: name. Profile: name, one functional need, at least one of C2 to C4 or D1 (Questions 13). Competitor: name, type. Offering: name, type, O3, one need addressed. Everything else is optional and appears on the Review page.

### 6.10 Information the earlier files expect that has no field

A competitor's website and numeric price; buying timing (dropped); nationality as a list (section 12). Each is a **[D]**: add a field, keep it in a note, or leave it out.

## 7. Business 2 · Customer Engagement, rebuilt as a journey

Moved on 2026-11-21 to [Questions 17, section 6](17-customer-engagement.md#6-the-journey-rebuild-the-design-and-its-reasons), with the tile it designs.

## 8. Identity · what to ask

### 8.1 What exists (as built, 2026-10-25)

**The Identity System is one page**, of two chapters, Definition and Purpose; its tiles and what each holds are `specifications/01-identity-system/01-definition.md`, section 1 (the one owner).

**Prose only:** the six texts of Purpose. The Positioning tile has four choice questions, the End User questions (asked only for one audience) and a Notes box (8.2). The Organisation tile holds the facts of the organisation (8.5).

**What other parts read from Identity (checked in the code, 2026-10-25).**

| Identity answer | Read by |
|---|---|
| Country | Currency, the consumption tax's name, the jurisdiction profile, the registration numbers asked for, the activity scheme and its code name |
| Legal Form | The ownership questions (a one-owner form has none), owners' drawings in the financials, the open items |
| Opening Date, with the durations of the Global Settings | The business stage; the plan start; the Review's messages and key dates; the Calendar's key dates; the Positioning tile's name, limits and locks; the exported title |
| Registration Date, legal expenses | Key dates; the plan start |
| Activities | The exports only (as codes with the scheme's initials). **The industry pack of Research 3, 5.6 is not built.** |
| Market Structure, Seller and Buyer Relationship, Audience, Differentiation and Outcome | **The exports, and one step in Business 1:** the Segment card reads the Seller and Buyer Relationship (its kind), the buyer's life stage and category (its age terms and its user part) and the audience's scale (the organisation's type and size): Questions 12. No other part reads them yet (8.2, "What the Segment will read") |
| Positioning Notes (the free text) | The Segment shows it behind an "i" note ("Your Positioning (Identity)") on its first two instructions. It shapes no question. |

**So Early Positioning must not ask again what the Organisation tile already holds** (the activities, the stage), and the Segment must not ask again what Early Positioning holds (who pays, the kind of market).

### 8.2 The Positioning tile and the Identity questions

Moved on 2026-11-21 to [Questions 8, section 4](08-positioning-tile.md#82-the-positioning-tile-and-the-identity-questions), with the tile it designs.

### 8.2a The business stage, the Opening Date and the key dates (as built, 2026-10-24 and 25)

**The stage comes from the Opening Date (the owner's rule).** The user sets the Opening Date (a field of the Organisation tile), and the stage follows: **before it, Planning; from it, Launching; then Managing; then Growing; with no Opening Date, Planning.** Each stage lasts as long as the Global Settings say (`stageOf`, `BusinessStage.ts`). The stage is shown, never chosen; the stored `businessStage` is legacy and ignored. The Conversation page works the stage out once and hands it to the pages (`businessStage`).

**The durations are set in the Global Settings, section Business stages,** laid out as the Assets are: the Opening Date as a record under the title (like the Plan Start), and a table **Stage, Start, End, Duration, Time in:, Reset** with one row for each stage and one whole number each, each with its own Reset (shown when changed) and a Reset for the table. **Planning 3 months** (ends at the Opening Date, counted back from it), **Launching 12 months** (from the Opening Date), **Managing 12 months** (after Launching), **Growing 3 years** (after Managing; the only one in years). With the defaults, Launching ends 12 months after the opening, Managing 24, Growing 60 (the owner's windows). Start and End are the days each stage runs from and to (blank until an Opening Date exists); the row of the stage the business is in today is highlighted and bold; the first column is as wide as the label column above it, so the Start dates stand under the Opening Date. A duration left empty or at 0 takes its default (`stageDurationsOf`); a decimal point, or more than 120 months (50 years), is refused. The stage, the limits and locks, the tile's name, the exported title, the Review's messages and the key dates all follow the durations. **[D]** The defaults for Managing and Growing are the owner's windows made into durations; the owner may want others.

**The timings are indicators, written on the Review** (`stageMessages`, a "second look"): while Planning, the months to the Opening Date and how long the planning has run (a warning when it has run longer than its duration); while Launching, "month 7 of 12", the months left to prove the Early Positioning Statement or change it, and the date; while Managing, the months left of the Core Market Positioning's horizon; while Growing, the year of the stage and the end of the window of the Corporate & Portfolio Positioning. An organisation with nothing started has none.

**Plan start counts the legal expenses (the owner's decision).** The plan's first month is the earlier of the Opening Date and the earliest cost, **a Business card's or a Legal Entity expense's** (`legalExpenseDates`; a one-time expense with no date falls on the formation's). Because of it: the forecast and the documents start earlier; **Sustainability counts a fixed cost only from the month its own Start date falls in** (and to its End date), as the cash flow does; and the Business Plan's Financial Plan section starts at the derived plan start (the generic page export of the Business System still reads the stored one, an older limit).

**Key dates (owner).** The milestones of the organisation, past and to come, in time order: **Plan starts, Organisation registered, Opening Date, Launching window ends, Managing window ends, Growing window ends**, each with how long ago or how long is left (`KeyDates.ts`). **On the Review** they are a section, "Key dates" (the past ones quieter; not counted among what is left to look at); **on the Calendar** they are one kind of date, "Key dates", listed first and recommended.

**The Review shows only the open Organisation; the Landing page's header has a "Review" button for every Organisation** (each folded with its count; Back returns to the Landing).

### 8.3 Brand starting points from Identity (parked)

**Parked.** The owner asked on 2026-10-23 to ignore the Brand system for now. This section and the research behind it (`01-references.md`, BRD) are kept for later; nothing in it is planned or built until the owner lifts it, and the question I5 is asked only then.

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

### 8.5 The Organisation tile (page 1): layout

Moved on 2026-11-21 to [Questions 7, section 4](07-organisation-tile.md#85-the-organisation-tile-page-1-layout), with the tile it designs.

### 8.6a What the Review says of the Organisation and the Positioning

Moved on 2026-11-21 to [Questions 7, section 4](07-organisation-tile.md#86a-what-the-review-says-of-the-organisation-and-the-positioning), with the tile it designs.

### 8.6 The wording of the Organisation tile

Moved on 2026-11-21 to [Questions 7, section 4](07-organisation-tile.md#86-the-wording-of-the-organisation-tile), with the tile it designs.

## 9. Founders and Capability

Moved on 2026-11-21 to [the Infrastructure & Capability specification, section 12](../../specifications/03-business-system/04-infrastructure-and-capability.md#12-founders-and-capability-the-design-and-its-reasons), with the tile it designs.

## 10. Business 3 (Delivery) and Business 5 (price)

### 10.1 Delivery card

Moved on 2026-11-21 to [Questions 19, section 12](19-capacity-and-delivery.md#101-delivery-card), with the tile it designs.

### 10.2 Revenue stream card (page 5)

Moved on 2026-11-21 to [Questions 20, section 16](20-financials-and-inventory.md#102-revenue-stream-card-page-5), with the tile it designs.

### 10.3 Minimum ages to buy, by product and country (O12)

Moved on 2026-11-21 to [Questions 16](16-offering-questions.md#103-minimum-ages-to-buy-by-product-and-country-o12), with the tile it designs.

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

**The ids below are the earlier design's.** Where each is now asked (2026-11-03): I3 is Questions 8 question 1; I7c question 8 (Differentiation; since 2026-11-08 the Competitor card's K14, once per Segment, Questions 14); P9 is Questions 13 B1; P11 the Segment's "Where do your customers discover new products?" (Questions 12, Box 4 Q2) and the Profile's C2 to C4; P12 D1; P13 is not asked (the Segment's "Where do your customers usually shop?", Box 4 Q7, and "Formal procurement" in Box 4 Q9 take its place); P14 the Segment's "How do your customers pay?" (Box 4 Q8); P15 C1; P16 the Segment's "How comfortable are your customers online?" (Box 4 Q1; rule 6 is triggered by "Not very comfortable"); P17, P18, P19 are E1, E2, E3; P20 D2; P21 A5; P22 the Segment's "Who decides to buy?" (Box 4 Q9); P1, P5, P6 are A1, A2, A3; G2 and G4 Box 2 Q1 and Q2; G6, G7, G8, G10 Box 1 Q1, Q2, Q8, Q9; G13 Box 1 Q3 to Q7; G14, G15, G23 Box 3; G20 Box 5 Q2. **Not asked:** G3 (the customers' country: proposed to start from the Organisation's Country), G5 (language: rules 18 and 19 are parked), G16 and G19 (withdrawn: rule 14 reads O3 alone, rule 16 the household income).


| # | Trigger | Part | Kind | What the app does | Evidence |
|---|---|---|---|---|---|
| 1 | I3 (Identity) | Questions | Operational | Reveals the people or the business questions | definition |
| 2 | G3 (the customers' country) | Lists | Operational | Selects the education, size, industry and area crosswalks; shows the equality notice and language notes | Research 3, 5.3, EQL-01 to EQL-05 |
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
| 21 | K5 and K8 (Questions 14) against B1, C2 to C4, E3 and D2 (Questions 13) | Competitors | Review | A value customers care about that no competitor or offering delivers; a channel customers use that competitors use and you do not; "customers work it out themselves": have you listed an Internal solution and the Status quo as alternatives? | logical |
| 22 | B1 (Questions 13) against I7c, the Values tile, O4 | Positioning, values | Review | The offering's benefit, the positioning and the Profile's values should agree | logical |
| 23 | G6, G7, G8, G13, P1, P5, P6 | Profile | Review | Each Profile fits its Segment (6.5) | logical |
| 24 | An earlier answer changes | Dependent answers | Review dependencies | The compatible answers stay; an answer that no longer applies is removed on the next choice (as built; Interface 10, 3.4) | rule 3.4 |
| 25 | Legal Entity country | Segment | Operational | The first Segment's country (G3) starts from the Legal Entity's country; the user confirms or changes it; a second Segment starts from the first one's answers | definition |
| 26 | I1, I2 | Industry pack, activity code | Suggest | Proposes the pack's examples (Research 3, 5.6) and the country's activity code for the user to confirm | BUS-01 to BUS-05, BUS-18 to BUS-20 |
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
| O1 and the Offering Type | If no Product or Hybrid offering exists, Physical Delivery and Retail & Wholesale (channels), Delivery Vehicles, Delivery Running Costs and Materials & Stock (resources) and the Logistics & Fulfilment partner type are hidden. Hidden, not deleted. An Offering posted, shipped or collected (O6), or sent a way O20 names, has a physical item whatever its Type and form (2026-11-16). |
| I1, I2 | The industry pack's suggestions (Research 3, 5.6); industry overlap checks; the country's section or code, suggested on the Organisation tile and printed on the documents. |
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

- Collects only what a segment needs; a question the user does not want to answer is left empty, with no "Prefer not to say" option (owner, 2026-11-02; the Australian standard, Stats NZ and the UK ICO ask people about themselves, which these questions do not) [SEX-01, CUL-03].
- Asks **country, language and need**, not race or ethnicity. There is **no ethnicity or race list**; any ethnicity item would be an optional note for research or equity analysis, and only with each country's own categories (the US race and ethnicity standard is not used for other markets) [CUL-01, CUL-02]. **[D]**
- Asks gender only when G10 is yes, with an "Another gender" option [SEX-01].
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

**Status** (2026-11-08): *built* (in the app as decided), *superseded by doc N* (the tile document decided otherwise and governs) or *open* (not built, or still to decide).

The 28 rows that were *built* or *superseded* on 2026-11-21 are in [the archive](../../archive/reports/questionnaire-decisions-done-2026-11-21.md); the rows below are open.

| # | Status | Change | Kind | Decision |
|---|---|---|---|---|
| R1 | open | Page 2 rebuilt as a journey of stage tiles and cards (section 7) | rebuild of existing layout | **[D]** yes or no; stage-first or keep channel-first; five stages or four |
| R2 | open | The founders' profile moves into Founders & Ownership (9.2) | move, editor only | **[D]** |
| R3 | open | Capability becomes a Business 3 tile, derived from founders and offerings (9.2, 9.4) | move and change | **[D]** Business 3, or stay in Identity |
| R4 | open (O3 is built, Questions 16; the three read-only fields are not) | "How it is bought" asked once on the Offering (O3) | merge of three questions | confirm: three read-only fields replace three inputs |
| R7 | open | The six skill areas (L5) | list | approve or replace |
| R8 | open (the lists now run to L25, Research 3, 5.2) | The shared lists L1 to L16 and their plain wording | lists | approve each, or amend |
| R9 | open | Relationship type per stage card, not per offering | model | **[D]** |
| R10 | open | Required answers (6.9) | rule | approve |
| R11 | open | Stage word: "Discover" or "Discovery" | wording | choose |
| R12 | open | Capacity counts founders only | scope | keep for now or widen |
| R13 | open | Setup fee plus recurring price | scope | leave out or add a second charge |
| R14 | open | Gender, relationship status, household and nationality; competitor website and price | scope | per item |
| R15 | open | Identity prompts "Description" and "Positioning" shortened or derived (8.2) | wording | **[D]** |
| R17 | open | The industry list is one plain list with a crosswalk to each country's scheme | list | approve |
| R19 | open | Tax defaults by country; a Review item at the registration threshold | rule | confirm; threshold item yes or no |
| R20 | open | The customer model kept as one content table that generates fields, options, rules and help (6.1) | architecture | **[D]** |
| R21 | open | The connection rules of 11.5 (28 rules) and what is not built (11.6) | rules | approve; add or remove |
| R22 | open (no ethnicity or race list is asked, as built; the equality notice is not built) | No ethnicity or race list; country, language and need instead; the equality notice (section 12) | rule | confirm |
| R23 | open | The Profile's values shown beside the Brand voice tile (6.1) | display | yes or no |
| R24 | open | Digital-only channels moved down and labelled, not hidden (rule 6 of 11.5) | rule | confirm |
| R26 | open | The industry in two levels with examples, keyed on divisions; the UK activity-code edition (UK SIC 2026 is current; the app's hint cites SIC 2007) (Research 3, 5.3, 5.4) | list, data | approve the list; decide the hint |
| R27 | open | Industry packs: the Tier 1 and Tier 2 packs first (about twelve), the others show generic examples; examples labelled "for example" (Research 3, 5.6) | scope | approve |
| R28 | open (parked) | **Parked by the owner, 2026-10-23.** Brand starting points, when lifted: from I5 only, not from industry or price; suggestions only, with the evidence strength shown; update the colour-association help and its WCAG 2.1 note (8.3) | rule | approve |
| R30 | open | The first release builds the 41 drivers; the 21 checks later; the 4 notes are never asked (Appendix B) | scope | choose |
| R31 | open | An example under every option, for every list (Research 3, 5.5) | content | approve and complete |
| R37 | open (O12 is derived, not ticked, Questions 16; not built) | O12 and the minimum-age table (10.3): only rows with an official source drive a Review check; the other cells say "check the rule" | list, data | approve; have each Excerpt row re-checked before it is built |
| R38 | open | Customers under 18 who pay: allowed, with notes and Review lines and a filter on P14; the app states no rule on contracts and gives no legal advice (6.3) | rule | confirm |
| R39 | open (future feature, Questions 4) | (multi-sided part: future feature, Questions 4) I11 "Market Structure" (single-sided, or a multi-sided platform of two or more distinct groups; the owner's wording, the meaning corrected 2026-10-25) is asked once in Identity and decides whether the last Positioning question splits per side, and (with I3) that each side is one Segment frame. **Who uses it, when not the buyer, is read from I7b (Proxy Buyers / Gifters) and made a second Profile; there is no Segment question** (6.3, 8.2) | field | corrected 2026-10-25 |
| R40 | open (future feature, Questions 4) | (multi-sided: future feature, Questions 4) When both parts pay (diners pay for the food, restaurants pay a commission) the Segment holds one payer part; the other payment is noted on O3 and confirmed on the Review page. Alternative: allow a payer flag on each part | rule | choose |
| R45 | open | The Business Plan's "Main activity" row becomes "Activities", filled from the cascade; the box saves into the Description's value (8.5) | label, rule | confirm the label |
| R51 | open (the audit, tile by tile) | Lists come only from official documents; the owner's wording where given; the audit of the other lists is planned tile by tile (rule 14) | rule | confirmed 2026-10-23 |
| R56 | open | Candidate additions to lists (Questions 3, former decision 3): P12 (industry reports or trade press; an AI assistant; asking the supplier's other customers), P13 (a reseller, distributor or agent; an event or trade show; an approved-supplier list or framework), P14 (**someone else pays**; direct debit; cheque or voucher), O1 (a rental or hire; a booking of seats, tickets or rooms), O3 (**free to the customer**; a commission or a share of sales), L5 (research and product development). All are the author's, from reading the lists against the statistics offices' categories | list | approve one by one; "Someone else pays" in P14 and "Free to the customer" in O3 first |
| R58 | open | "Copy a Profile": start a Profile from another and change what differs (Questions 3, section 6; former decision 6) | feature | recommended: yes |

**Where the earlier decision lists went.** Questions 1 (section 7, ten decisions) and 29 (section 9, twelve decisions) no longer hold their own lists; every item is in this table. Questions 1's ten decisions are R1 (page 2 as a journey), R26 (the two-level industry list; the UK hint), R25 (Identity choices), R27 (industry packs), R28 (Brand, parked), R29 (the cascade), R30 (build the drivers), R2 and R3 (founders and capability), R22 (no ethnicity list) and R8 with R31 (the plain wording, lists and examples). Questions 3's twelve are R35 (several relationships make a Segment frame each; Identity asks "Who do you sell to?"), R44 (the "Another type" of G23 and the "Other" of P6 are withdrawn, placed with an "i"), R56 to R61 (candidates, order, copy, G10 last, split, O3 options), R36 (decided 2026-10-25: no "Who uses it?"), R40 (both parts pay), R37 (O12 and the minimum-age lookup) and R38 (customers under 18 who pay).

## 14. Order of work

The order, the stages, their sizes and their "done when" are in Questions 1, section 6 (the plan). The index of the app and its documents is `docs/app/01-contents.md`.

## 15. Evidence

All sources, with their publisher, country, what they support and whether they were opened, are in `01-references.md`, section 2.7 (research of 2026-10-23, the six target countries, reorganised by topic with a coverage table). The ones the lists and rules above rest on:

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

**Assumptions with no qualifying source:** the shared lists L1 to L5, L11, L13 and L15 and their examples (Research 3, 5.5); the industry packs (Research 3, 5.6); the brand mapping of images and voice (8.3); the stage action lists (J2); the proposal rules of 7.4 and rules 8 to 10 and 13 of 11.5; the "Charged" mapping; the values list; the options of the relationship-status, household, risk and gender questions; that 33 core questions are an acceptable load. No peer-reviewed study validating the Business Model Canvas's channel and relationship blocks with start-ups was found.

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
| I6 | Check (counted; not asked) | Review against budget and competitor prices. 8.2 withdraws I6 as a question (the price position is already said by Differentiation and Outcome, I7c and I7j), so it is counted here but not asked **[D: if it is dropped from the count, the checks are 20 and the total 66]** |
| I7 | Driver | Differentiation and Outcome, as built on Early Positioning (I7c and I7j, 8.2): it frames the Value Proposition and the Competitor questions and writes a first Positioning sentence. The old I7 was merged into I7c, and the one counted driver stands for the Early Positioning family; I7b (audience) and I7d to I7g (the End User) are the built questions of 8.2 and are not counted separately |
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
