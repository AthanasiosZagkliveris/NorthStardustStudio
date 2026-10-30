# 1. Identity System — 1. Definition

Status: **current design**, written 2026-10-30, updated 2026-10-30. The master tile "1. Definition" of the page "1. Definition and Ethics" of the Identity System: its layout, its four tiles, how each opens and reacts, and what reads what it holds.

Related: doc 26 (card structure), doc 28 (the questions, 8.1 to 8.6), doc 31 (the tables behind the Positioning lists, 10.7), doc 33 (the first version), doc 34 (future features), `docs/ai/tile-and-card-pattern.md` (the tile and card pattern), `docs/ai/layout-rules.md` (the measured rules).

> **Keep this document true (rule of this file):** it describes the app as it is. Whoever changes a tile, a field, a list, a limit or a reaction of the Definition changes this document in the same commit, and writes the change in the log (`design/core/04-log.md`). Where the code and this document disagree, the code is right and this document is the one to fix. What is described elsewhere but not in the app and not a future feature is collected in section 12, **Extra Information**, and nowhere else in this document.

## Contents

1. [What the master tile is](#1-what-the-master-tile-is)
2. [The page and its frame](#2-the-page-and-its-frame)
3. [How a tile opens, moves and closes](#3-how-a-tile-opens-moves-and-closes)
4. [The Organization tile](#4-the-organization-tile)
5. [The Early Positioning tile](#5-the-early-positioning-tile)
6. [The Mission tile](#6-the-mission-tile)
7. [The Vision tile](#7-the-vision-tile)
8. [The stage, the Opening Date and what follows them](#8-the-stage-the-opening-date-and-what-follows-them)
9. [What reads the Definition](#9-what-reads-the-definition)
10. [Saving, review and checks](#10-saving-review-and-checks)
11. [Where it is in the code](#11-where-it-is-in-the-code)
12. [Extra Information](#12-extra-information)

## 1. What the master tile is

The Identity System (System 1, Foundation) opens on its page 1, **"1. Definition and Ethics"**. The page holds two **master tiles** (frames), side by side: **1. Definition** and 2. Ethics (Philosophy, Values, Principles, Manifesto; not described here). Page 2 is Legal Entity.

The master tile **1. Definition** holds four tiles, in this order:

| # | Tile | Holds | Saved in | Opens |
|---|---|---|---|---|
| 1 | **Organization** | Name, country, address, legal form, dates, activities, and the description (Notes) | the Legal Entity answer (`organisation`), the Opening Date in the Global Settings, the description under the key "Description" | dialog with fields |
| 2 | **Early Positioning** (named by the stage, section 8) | Who the business sells to, why, how it differs, and the result | the Legal Entity answer (`organisation`); its Notes under the key "Positioning" | dialog with choice questions |
| 3 | **Mission** | One free text | the key "Mission" | dialog with one text box |
| 4 | **Vision** | One free text | the key "Vision" | dialog with one text box |

The questions behind the tiles are in `src/assets/SystemQuestions/01_IdentitySystemQuestions.md` (they are what the "i" of Mission and Vision says); the structure is in `src/assets/SystemAnswers/01_IdentitySystemAnswer.md` (a column layout of four free-text columns; the Organization and Early Positioning tiles replace the text boxes of the first two columns with their own editors). The Identity System has no "Need Help?" text: the guidance is in each tile's "i".

## 2. The page and its frame

- **Page title:** "1. Identity System — 1. Definition and Ethics", one line, with the System's icon; the page underline carries the frames edge to edge.
- **The frame** of the master tile: 12px padding, 8px corners, one hairline edge in its hue, its heading "1. DEFINITION" in capitals, centred, 28px semi-bold. The Definition takes the colour of the work "create"; Ethics the colour of "decide" (`WorkColours.ts`). A tile, its dialog and its floating cards take the frame's hue.
- **The tiles** are four squares in a 2 × 2 grid, one size by the window's width and height, each in the frame's tint with the box's inset light and shade, a 110% rise under the pointer growing inwards (doc 18). A tile's title is in capitals (18px, semi-bold, centred, underlined by a hairline), and below it a list or a text in 14px muted colour:
  - **Organization:** the name in bold, the legal form, a divider line, then the address (a long address keeps its first lines and joins the last two). Until something is written it shows the first line of what the column asks.
  - **Early Positioning:** the options chosen, one bullet each, under the names of its groups in bold: **Business** (the audience and the buyer's category, with its relationship), **User** (the buyer and user relationship and the user's life stage), **Offering** (the purposes and the differentiations) and **Outcome** (**Outcomes** where the user has one): a group with no answer is left out.
  - **Mission, Vision:** the first lines of the text.
- **At the narrow width** (768px, the smallest the app supports) the frames stack below the window width of 812px; the tiles keep their grid (doc 18, layout rules, "One shape on every page of chapters").
- **The page's own controls** stand in the header: Reading mode (Auto), Focus, Search (Ctrl+K), Notes, Review (with the number of items), Global Settings, and the organization's name; the lower left has Back. The **Pages rail** (a navigation named "Pages": Introduction, 1. Definition and Ethics, 2. Legal Entity) with its previous and next arrows moves between the System's pages.

## 3. How a tile opens, moves and closes

The behaviour is the shared one of `src/components/interview/tiles/SectionTiles.tsx` (the tile and card pattern); nothing in it is specific to the Definition.

| The user does | What happens |
|---|---|
| Presses a tile | Its **dialog** opens in the place of its master tile, the size of the frame and in its hue; the other master tile (Ethics) is shaded and inert; the page does not scroll |
| Presses another tile's bullet in the **section rail** ("Go to a section": Organization, Early Positioning, Mission, Vision) | That tile's dialog opens in place of the open one |
| Presses the **Previous section / Next section** arrows, or ← and → | The dialog moves to the previous or next tile of the frame |
| Presses **Escape**, the **Back** button, or the shaded space | The dialog closes; the page is as it was (the scroll position, the folds); the focus returns to the tile (with a visible ring after the keyboard) |
| Presses the **"i"** beside the title | A pop-up with what the tile asks (the questions of the column); it closes as every pop-up does (doc 23) |
| Types in a field | The answer is saved at once (the header shows "Saved"); no Save button |

Only one dialog is open at a time; which one is open is view state and is never saved. A tile's dialog has the title (18px semi-bold) with its "i", then its content, in one smooth scroll with no steps.

## 4. The Organization tile

**Dialog:** two columns with a 1px divider (12px clear on each side), the **Notes** across the whole width below a divider line.

| Left: where it is | Right: what it is and does |
|---|---|
| **Organization Name** (text) | **Legal Form** (dropdown, with an "i") |
| **Country** (dropdown: the six countries, then "Other"), and **Other country** (a second dropdown with every other country) when "Other" is chosen | **Registration Date** (date cell, with an "i") |
| **State, province or region** (dropdown, only for a country that has them) | **Opening Date** (date cell, with an "i") |
| **Address** (one text box of as many lines as it needs) | **Activities** (with an "i"): Primary, then up to three more |
| | |
| **Notes** (optional note: a tick and the word; the box opens on ticking; bullets and numbered lists; grows with its text; the page's Description, printed by the Business Plan) | |

**Fields and their rules**

- **Country:** the six of the first version (United Kingdom, Ireland, United States, Canada, Australia, New Zealand) and **Other** (any other country: the legal forms are the four generic ones, the activity and its code are typed). The country drives the legal forms, the activity scheme and its code name, the registration numbers, the currency and the date format.
- **Legal Form:** the country's official list in the official order; for Other, Sole Proprietorship, General Partnership, Private Limited Company (LLC / Ltd / GmbH) and Limited Liability Partnership (LLP). There is no "Other" entry. A one-owner form removes the ownership questions of the Legal Entity page. Public company, nonprofit and cooperative forms are not offered (doc 33, section 3).
- **Address:** free text, one box. The label of its last line (postcode, ZIP and so on) follows the country.
- **Registration Date:** independent of the registration number; not later than today and not later than the Opening Date; a warning stands under it for a date that has not come or a company formed after the Opening Date.
- **Opening Date:** saved in the Global Settings; it decides the business stage (section 8); it can be changed at any time.
- **Activities:** only the primary is required; Secondary, Tertiary and Quaternary are optional, added by "+" (it gives way at four) and removed by "×". Each is a cascade of dropdowns with the country's own level names, ending in one official code (SIC for the UK, NACE, NAICS and so on; the scheme's initials and the code in bold). A finished activity is folded to one line (fold arrow, "Primary", code, path); an open one shows its dropdowns. Changing a level empties the levels below it and the code. Every dropdown lists all its entries in the official order (doc 35, 5.8 to 5.10).
- **Frozen until a country is chosen:** Address, Legal Form and State show the hint "Choose a country first." and keep what they hold.

**How it reacts**

| The user does | What happens |
|---|---|
| Changes the **Country** to another value | The State, the **Address**, the Legal Form, the activities and the registration numbers issued by the country left are emptied (nothing carries over); the scheme, the level names, the currency and the postal label change. Choosing the same country again changes nothing |
| Chooses a **Legal Form** | The capital convention and the ownership questions follow it |
| Sets or changes the **Opening Date** | The stage is recalculated: the Early Positioning tile's name, limits, locks and answers follow (section 8); the plan start, the key dates and the Review's messages update |
| Adds or removes an activity | Up to four; the "+" returns when one is removed |

**What the tile shows** when closed: section 2. **What reads it:** section 9.

## 5. The Early Positioning tile

The tile's name follows the stage: **Early Positioning** (Planning, Launching), **Core Market Positioning** (Managing), **Corporate & Portfolio Positioning** (Growing; `positioningName`).

**Dialog:** two columns, each with two groups, told apart by a **double divider line** (two 1px lines 2px apart) and not by subtitles (the page's tile names the groups): Business then User on the left, Offering then Outcome on the right. The User group (and its divider) appears only for a Proxy or Dual-Intent buyer; the right group is titled "Outcomes" where the user has an outcome of their own. **The left column is as wide as its longest option and the right takes the rest, with a 1px divider between them, so every option stands on one line from a window about 1440px wide** (below it a long option wraps; under 901px the columns are one). **Under the title of each question there is a hairline** across its column.

| Left | Right |
|---|---|
| **Seller & Buyer Relationship** (B2C, B2B) | **Purpose** (twelve) |
| for each relationship chosen, its audience: **B2C Buyer's Life-Stage** (Students / Young Adults; Workers / Professionals / Adults; Seniors) or **B2B Audience Specialization & Scale** (Solopreneurs & Freelancers; Startups & SMBs; Mid-Market; Enterprise / Public Sector) | **Differentiation** (six: Cost-driven; Convenience-driven; Compliance, Risk & Security; Status & Premium; Performance & Innovation; Ecosystem & Integration) |
| **Buyer's category** (Direct Buyers; Proxy Buyers; Dual-Intent Buyers), one for each relationship | **Outcome** (the buyer's: Lower costs; Time saved; Legal & data-protection cover; Higher quality & prestige), named "Outcome for the buyer" where the user has one of their own |
| *double divider line* | *double divider line* |
| for a Proxy or Dual-Intent category: **Buyer & User relationship** (B2C: seven, with Commercial & Professional; B2B: six) and, for B2C, **User's Life-Stage** (Minors; Young Adults; Adults; Seniors) | **Outcome for the user** (Enjoyment & fun; Comfort & ease; Safety & care; Learning & growth; Looks & belonging; Practical use), only where some buyer is a Proxy or Dual-Intent Buyer |
| | **Notes** (optional note across the width) |

The audience scale is **the app user's audience** (the customers of the business described), not the app's audience (the people who use the app).

**The limits by stage** (one choice is a radio; several are ticks with "N max", the others locked grey when the limit is reached; a ticked option can always be unticked):

| Question | Planning | Launching | Managing | Growing |
|---|---|---|---|---|
| Seller & Buyer Relationship | 1 | 1 | 2 | any |
| Each audience question | 1 | 1 | 2 | any |
| Differentiation, Outcome (both) | 1 | 2 | 2 | any |
| Buyer's category | 1 | 1 | 1 | 1 |
| Purpose | 1 | 2 | 2 | any |

**How the lists are shaped** (the owner's tables, doc 31, 10.7; never chooses for the user, and an answer already given always stays visible):

- **Buyer & User relationship:** only the relationships that can be the buyer's category; a Students / Young Adults buyer is not offered Commercial & Professional; Parent or guardian is not offered when the user life stages chosen are only ones the matrix leaves blank for it.
- **User's Life-Stage:** only the stages the matrix allows for the buyer's life stage and the relationship chosen.
- **Purpose:** ordered by relevance and without the ones the tables call generally less directly relevant; for each purpose the first table that covers it decides (buyer and user life stage; business relationship; audience scale and category; consumer relationship; buyer's category; seller and buyer relationship).
- **Outcome for the buyer and Outcome for the user:** the outcomes the purposes chosen drive come first (the buyer's by the buyer's category; a Direct Buyer has no user outcome); nothing is hidden or ticked.
- **The life stages come first** (consumer buyer, once the buyer's and the user's life stages are both answered): they re-sort the Differentiation (a Student: Cost-driven and Convenience-driven; a Worker: Convenience-driven and Compliance, Risk & Security; a Senior: Compliance, Risk & Security and Status & Premium) and the two Outcome lists (by the purposes the life stages make primary), before the purposes chosen (doc 31, 10.7).
- **Differentiation:** ordered by the purposes chosen, then the business relationship, then the audience scale and category (or the buyer's category); a business buyer is not offered the ones the scale table leaves blank.

**How it reacts**

| The user does | What happens |
|---|---|
| Opens it with no relationship chosen | The audience question is frozen with the hint "Choose a seller and buyer relationship first."; the outcome questions are open |
| Chooses or removes a relationship | The audience question and the buyer's category of the other relationship are removed; the End User answers of a relationship no longer chosen go |
| Chooses a buyer's category | The End User questions appear for Proxy and Dual-Intent and go for Direct; a relationship that cannot be the new category goes with the change; the user's outcome goes where no buyer is Proxy or Dual-Intent any more |
| Chooses a relationship or a life stage | The lists of the other questions are re-shaped as above, and answers no longer allowed go (`fitPositioningToStage`) |
| The stage changes | Each question is checked against the new stage: an answer with more choices than the stage allows, or an option it locks, returns to empty, **without a notice**; the "i" of the Opening Date and the "i" of each choice question say that an answer over the limit goes back to empty when the stage changes; a question that still fits keeps its answers |

## 6. The Mission tile

**Dialog:** the title "Mission" with its "i" (what this means: "What is your purpose? What problem are you trying to solve? Why does solving it matter?"), then **one text box** that grows with its text (it opens 12 lines high), no limit on length, no placeholder. **On the page:** the first lines of the text. **Read by:** the Business Plan's summary (a labelled "Mission" line).

## 7. The Vision tile

**Dialog:** the same as Mission, titled "Vision" ("What future are you working towards? What would success look like? Think ten years or more ahead."). **On the page:** the first lines of the text. **Read by:** the Business Plan's summary (a labelled "Vision" line).

## 8. The stage, the Opening Date and what follows them

The business stage (Planning, Launching, Managing, Growing) is **not asked**: it is worked out from the Opening Date and the durations of the Global Settings; an organization with no Opening Date is Planning. The stage sets, in the Early Positioning tile: the tile's name, the limits of every question (section 5), and the options locked. When the Opening Date or a duration moves the business into another stage, the answers are checked against the new stage's set-up (section 5, last row). The rules of the stage, the Opening Date, the key dates and the Review's messages are in doc 28, 8.2a.

## 9. What reads the Definition

| Answer | Read by |
|---|---|
| Name, country, address, legal form, dates | The Legal Entity page (page 2), the registration numbers and the jurisdiction profile, the currency and the tax name, the financials, the Calendar's key dates, the Review, the Business Plan and the exports (doc 28, 8.1) |
| Legal Form | The ownership questions (a one-owner form has none), owners' drawings, the open items |
| Opening Date | The stage; the plan start; key dates; the Review's messages; the exported title |
| Activities | The exports only (as codes with the scheme's initials) |
| Description (the Organization's Notes) | The Business Plan's company paragraph |
| Seller & Buyer Relationship, audiences | The Segment card of Business 1 (to choose and annotate its boxes) and the exports |
| Early Positioning's other answers | The exports (as lines and words, `ExportRenderers.ts`) |
| Early Positioning Notes | The Segment shows it behind an "i" ("Your Positioning (Identity)") on its first two instructions |
| Mission, Vision | The Business Plan's summary |

## 10. Saving, review and checks

- **Saving:** every change is saved at once into the organization (browser storage); the header shows "Saved". An older answer is read in the new form (an audience, a purpose or a legal form that no longer exists is dropped or kept as text; `AnswerLegal.ts`).
- **Review items** the Definition raises (doc 28, 8.6a): for the Organization, what is missing among the name, country, address and legal form ("1. Definition: Organization: …"); for the Early Positioning (named by the stage), each question with no choice ("…: the purpose and the outcome not chosen yet."); for Mission and Vision, "not answered yet" while empty. The two Notes are optional and raise nothing. The Review's "go there" opens the tile.
- **Scenario tests:** `src/components/interview/editors/CountryScenarios.test.tsx` runs ten seeded random organizations for each of the six countries through the answer and the editor (the legal form is the country's own, the activity is a final code with every level named and its scheme's initials, the Positioning answers survive and are complete); **three of the ten are the owner's target audience** (the document "Target Audience Selection": Tier 1, knowledge-based service businesses such as AI automation and software development agencies, UI/UX and design studios, marketing agencies and business consulting firms; Tier 2, such as architecture and engineering practices, game studios, digital product studios and early-stage SaaS companies): a software agency, a marketing agency and a consulting firm, each with its country's code.
- **Layout:** the Definition page (the dialogs of the Organization and the Early Positioning, and the page's tiles) is covered by the layout check (`tools/scripts/layout-check/run.mjs`; the Lumen & Loom example is a Proxy business, so the User group is open), and the tick boxes and the radios are drawn from the same tokens (doc 21).
- **Checks that keep it true:** the component tests of the tiles (`src/components/interview/tiles/SectionTiles.test.tsx`, `src/components/interview/editors/LegalEntityEditor.test.tsx`), the tests of the lists (`src/framework/engine/PurposeRelevance.test.ts`, `src/framework/engine/RelationshipFit.test.ts`, `src/components/interview/editors/legal/fitPositioning.test.ts`, `src/components/interview/editors/legal/positioningIds.test.ts`), the layout check (`tools/scripts/layout-check/run.mjs`), `npm run docs:check` and the document-reference test.

## 11. Where it is in the code

| What | File |
|---|---|
| The page, its four tiles and their dialogs | `src/components/interview/editors/AnswerRenderer.tsx` (the column tiles branch, `organizationTile`) |
| The tile grid, dialogs, arrows and rail | `src/components/interview/tiles/SectionTiles.tsx` |
| The Organization and Early Positioning editor | `src/components/interview/editors/LegalEntityEditor.tsx` (`organizationOnly`, `audienceOnly`) |
| The fields and sections of both | `src/components/interview/editors/legal/useLegalFieldsAndSections.tsx` |
| The state, the country and legal form choices | `src/components/interview/editors/legal/useLegalState.tsx` (`chooseCountry`) |
| The lists, the information texts, the limits by stage | `src/components/interview/editors/legal/shared.tsx` (`choiceLimit`, `fitPositioningToStage`) |
| The ids, the words and the reader of older answers | `src/framework/engine/PositioningIds.ts`, `src/framework/engine/ActivityClassification.ts`, `src/framework/engine/AnswerLegal.ts` |
| The tables that shape the lists | `src/framework/engine/PurposeRelevance.ts`, `src/framework/engine/RelationshipFit.ts` |
| The countries and legal forms | `src/framework/engine/LegalEntityJurisdictions.ts` |
| The examples (an organization with all four tiles filled) | `src/data/examples/lumen-and-loom-studio.json`, `src/data/examples/quillfield-automation-llc.json` |

## 12. Extra Information

What other documents describe for this master tile that **is not in the app and is not listed as a future feature** (doc 34). The owner decides for each whether it becomes a future feature, is built, or is dropped.

1. **The shortlist with "Show all" in the activity dropdowns** (doc 28, 8.5; doc 35, 5.9): every dropdown lists all its entries.
2. **The completeness rule for the primary activity** (doc 28, 8.5): the Review does not flag a missing primary activity.
3. **The industry pack** (doc 35, 5.6): suggestions for the Segment's name and the kinds of business of the Profiles from the activities; nothing reads the activities but the exports.
4. **The audit of the lists under rule 14**, tile by tile (doc 28, section 3; doc 32): the legal forms of the six countries are not re-checked as complete and sourced.
5. **The Business Plan's "Activities" row label** is marked to confirm by the owner (doc 28, 8.6, **[D]**).
6. **The Value Proposition and the Competitors reading the Positioning** (doc 28, 8.2; doc 29, I7c): the differentiation, the outcomes, the purpose and the buyer's category shape no later question.
7. **Help text for the Identity System:** the "Need Help?" text of the System is absent on purpose (`src/assets/SystemHelp/01_IdentitySystemHelp.md`); the guidance is the "i" of each tile only.
8. **The Positioning Notes prompt** is to be shortened (doc 29, the Notes row).
9. **The master matrix of the owner's example paths** (doc 31, 10.7): its umbrella relationships (Landlord or property manager, Personal professional, Employer for work and life), "Direct Buyer (Self)" as a relationship and its B2B relationship and user names are not built; they were closed as a reference (doc 31, decision 38).
10. **Marks on the options** (doc 31, decision 38): the ● and ○ of the user's life-stage matrix, and a "Recommended" tag on the differentiations the purposes drive, are not drawn; the options are ordered or hidden only.
11. **Mission and Vision guidance:** no examples, no length advice and no completeness rule beyond "not empty" are in the app.
