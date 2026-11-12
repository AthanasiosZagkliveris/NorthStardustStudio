# 45. Purpose & Beliefs: the six texts and their questions

Status: **specification**, written 2026-11-09, updated 2026-11-12. How the Identity System's six texts (Mission, Vision, Values, Principles, Philosophy, Manifesto) become one chapter, "Purpose & Beliefs", of three pair tiles, and, for each text, the guiding questions, the control, the length, the "i" and the connections. **Built 2026-11-09** as the owner decided (section 6): the chapter, its three pair tiles, the page name and the "i" of the six texts; the saved keys stay as they are. Not built: the Positioning note beside the Mission (section 6, 7) and the codes in the register (section 5).

Related: doc 40 (the form of a tile document), doc 39 (what an "i" says), doc 28 (4.1, the wording rules; 8.1, the page as built; 8.6a, the Review), doc 38 (Positioning, which comes before), doc 44 (the questions register and the code rule), doc 2 (the source rule).

## 1. Purpose and scope

**The decision record.** The owner, 2026-11-09: wants a structured documentation of the six texts, with questions. The direction accepted before it: group them as **Purpose & Beliefs**, in three pairs and in this order, **1. Mission & Vision** (purpose), **2. Values & Principles** (beliefs), **3. Philosophy & Manifesto** (expression); the lower-risk first step is to rename the Ethics chapter and give it three pair tiles, with Definition keeping Organisation and Positioning; a single master tile later, only if wanted.

**What the founder gets.** An early-stage founder (solo or a small team) writes six short texts once, guided by a few prompts each, and the app prints them in the Business Plan, shows the Vision beside the Strategic Compass and lists what is empty on the Review. This is not a survey about the founder: every prompt is there to get a usable sentence into a document.

**What stays (the saved data).** The six texts keep their saved keys and their places; nothing is migrated.

| Text | Saved under | Control today |
|---|---|---|
| Mission | Identity section 1 (Definition), key `mission` | text box (auto-growing) |
| Vision | Identity section 1 (Definition), key `vision` | text box |
| Philosophy | Identity section 2 (Ethics), key `philosophy` | text box |
| Values | Identity section 2 (Ethics), key `values` | numbered list (`NumberedTextList`) |
| Principles | Identity section 2 (Ethics), key `principles` | numbered list |
| Manifesto | Identity section 2 (Ethics), key `manifesto` | text box |

The keys are made from the column titles of `src/assets/SystemAnswers/01_IdentitySystemAnswer.md` (the parser's slug), and `StorageService.ts` recognises an old Ethics save by them (`ETHICS_COLUMN_IDS`). **So the six column titles must not change**; a pair tile is a new drawing over them, not a new answer.

**What would change (the drawing only).** The chapter title (Ethics → Purpose & Beliefs), the tiles (eight single tiles → Organisation, Positioning, then three pair tiles), the order of the six, the "i" of each text (the bullets of `src/assets/SystemQuestions/01_IdentitySystemQuestions.md`, which the tile shows as its "i") and the generated library placements. The readers in section 3 are untouched.

## 2. The structure

### 2.1 Why these three pairs, in this order

- **Purpose first.** Collins and Porras split a company's vision into a **core ideology** (core purpose and core values: what it stands for and why it exists, kept while strategies change) and an **envisioned future** (what it aims to become) [CP-96]. Mission & Vision is the purpose half and the future; the guides for small businesses ask the same two things first: why the business exists and whom it serves, then where it is heading in five to ten years [BDC; KU-CTB].
- **Beliefs second.** Values are the other half of the core ideology [CP-96]; principles are the rules that put them into practice, so they follow them and are written after them.
- **Expression last.** Philosophy and Manifesto say the same beliefs in prose: the Philosophy as the founder's way of seeing the work, the Manifesto as a public declaration. Both are easier to write once the four texts above exist, and both draw on them.
- **Sinek's Golden Circle (why, how, what)** [SIN-09] was considered and adds nothing the pairs do not: the "why" is the Mission's third prompt, the "how" is the Principles, the "what" is the Organisation's Description. It is not used as a structure.

### 2.2 The layout options

| Option | Chapter 1 Definition | Chapter 2 | Risk |
|---|---|---|---|
| **A (recommended, the owner's first step)** | Organisation, Positioning | **Purpose & Beliefs**: Mission & Vision, Values & Principles, Philosophy & Manifesto | The Mission & Vision tile draws two keys saved in section 1 from a tile of chapter 2: a cross-section tile, drawing code only |
| B | Organisation, Positioning, Mission & Vision | **Beliefs**: Values & Principles, Philosophy & Manifesto | None to the data (each tile stays in its own section); departs from the owner's grouping |
| C (later, only if wanted) | Organisation, Positioning | one master tile **Purpose & Beliefs** opening a dialog with the three pairs as sub tiles (the `view: true` dialog of the Legal Entity tiles) | As A, plus a dialog of sub tiles |

**A pair tile** opens one dialog with its two parts side by side (owner, 2026-11-09: "place them side by side"), in the Organisation's two columns with the 1px divider between them, one under the other where the window is narrow; each with its own heading and "i" (`DialogHeading`), drawn by the controls they have today. Side by side, a principle stands beside the value it keeps; the "i" no longer explains what the pair beside it already shows (the Values' "the value, then what it means here" and the Principles' "A value says what matters; a principle says what you do about it" were cut, 2026-11-09). The tile shows both texts' lines, a hairline between them, as a tile shows one (section 6, 6).

**Names.** The chapter "Purpose & Beliefs"; the tiles "Mission & Vision", "Values & Principles", "Philosophy & Manifesto" (the ampersand as in the app's other pair names, "Founders & Ownership"). The page "Definition and Ethics" (`PageGroups.ts`) is "Definition and Purpose" (section 6, 2).

## 3. The six texts

Each entry follows doc 40. The "i" follows doc 39, 3.2: the guiding questions first (the owner's prompts, revised here and approved, section 6, 3; the app says them in its affirmative voice), then how to answer, then one example; each point at most 160 characters. The examples use the project's example business Lumen & Loom (a textile maker selling gifts).

### 3.1 Mission (proposed code PB1)

- **Its purpose for the founder:** one or two sentences saying what the business does, for whom, and why it matters. It opens the Business Plan's executive summary, so a reader learns the point of the business before its figures.
- **Guiding questions:** 1. Who do you serve? 2. What do you do for them? 3. Why does it matter to them?
- **Control:** text box (as today). **Asked when:** always. **Options:** none.
- **Length:** one or two sentences, about 35 words or fewer.
- **The "i" says:**
  - Who do you serve? What do you do for them? Why does it matter to them?
  - Say what you do today; the future you aim for belongs in the Vision.
  - Make it specific enough to describe your business alone.
  - Example: "We weave personalised throws that let people give a gift that lasts."
- **Connections.** *Comes from:* Positioning (who you sell to, the purpose and the differentiation chosen, the Notes), on the same page above. *Read by (built):* the Business Plan, executive summary, the line "Mission" (`BusinessDocuments.ts`, `executiveSummary`); the Review, "Mission: not answered yet." (`OpenItems.ts`); the library placements. *Read by (not built yet):* the Positioning Notes shown behind an "i" note beside the box, as the Segment shows them ("Your Positioning (Identity)"); a Review note when the Mission names a customer that no Segment describes.

### 3.2 Vision (proposed code PB2)

- **Its purpose for the founder:** one sentence describing the future the business is working towards, so the Strategic Compass and the plan's direction have something to follow.
- **Guiding questions:** 1. What will be different for your customers when you succeed? 2. What will the business be by then? 3. When do you want to get there?
- **Control:** text box (as today). **Asked when:** always. **Options:** none.
- **Length:** one sentence, two at most.
- **The "i" says:**
  - What will be different for your customers when you succeed, and what will the business be by then?
  - Think five to ten years ahead. Describe the result; the steps belong in the Strategy.
  - Example: "Every home in the UK and Ireland has one throw it keeps for life."
- **Connections.** *Comes from:* the Mission (the same customer, further on). *Read by (built):* the Business Plan, executive summary, the line "Vision"; the Strategy System's Strategic Compass, which shows the Vision beside it (`Conversation.tsx`, `identityVision`, read from section 1); the Review, "Vision: not answered yet." *Read by (not built yet):* none proposed. The time horizon is not asked as a number: the Strategic Period (Strategy) owns the plan's length, and one owner per fact applies.

### 3.3 Values (proposed code PB3)

- **Its purpose for the founder:** three to five values the business will keep even when it costs it something; they are printed as a list and are what the Principles put into practice.
- **Guiding questions:** 1. What matters most in how you work? 2. What would you refuse to do, even for a good sale? 3. What does each value mean here, in a few words?
- **Control:** numbered list, one value a line (as today). **Asked when:** always. **Options:** none.
- **Length:** three to five lines; each a word or two, then a colon and what it means here.
- **The "i" says:**
  - What matters most in how you work? What would you hold to, even at the cost of a sale?
  - List three to five, one a line, each with what it means here.
  - Example: "Craft: every piece is finished by hand and checked before it leaves."
- **Connections.** *Comes from:* nothing asked before. *Read by (built):* the Business Plan, company description, "Values and Principles", the sub-heading "Values" (a list); the Review. *Read by (not built yet):* the check of doc 28, 6.1 and rule 22 (the Profile's "what they care about" compared with the positioning and the Values); the Profile's values shown beside the Brand voice tile (doc 28, R23, open).
- **Would a choice question help? Rejected.** A pick list of common values ("Integrity", "Quality", "Respect") with own words was weighed:
  1. It would change nothing the app writes beyond the same words in the same list, so it fails the purpose test.
  2. Generic values sound right and mean little; a list makes them easier to pick and harder to keep [LEN-02, opening opened]; core values are found by the founder, not chosen from a menu [CP-96, not verified in the full text].
  3. Rule 14 (doc 28, section 3) wants a plain list from a business school or university document; none with a list suited to a founder was found in this round.
  4. "What customers care about" (list L1, doc 34) already owns the customer's side; a second list of similar words would repeat it.
  The "what it means here" after a colon gives the specificity a list would take away.

### 3.4 Principles (proposed code PB4)

- **Its purpose for the founder:** the few rules that turn the Values into behaviour, written so that a new helper could follow them on day one; printed as a numbered list.
- **Guiding questions:** 1. For each value, what do you always do, or never do? 2. How do you treat customers, suppliers and the people who work with you? 3. Which rule settles a hard choice quickly?
- **Control:** numbered list (as today). **Asked when:** always. **Options:** none.
- **Length:** three to seven lines; each one rule, beginning "We …".
- **The "i" says:**
  - For each value, what do you always do, and what do you always avoid?
  - One rule a line, beginning "We …".
  - Example: "We remake any piece with a fault, at no cost, within a year."
- **Connections.** *Comes from:* the Values (each principle should follow from one). *Read by (built):* the Business Plan, company description, "Values and Principles", the sub-heading "Principles" (a numbered list); the Review. *Read by (not built yet):* none proposed.
- **Would a choice question help? Rejected.** Tying each principle to a value by a picker would add a step and change nothing in the documents; the "i" asks for the link instead.

### 3.5 Philosophy (proposed code PB5)

- **Its purpose for the founder:** a short paragraph on how the founder sees the work and the world around it: the belief behind the way the business does things. It is the reasoning a reader of the plan would otherwise have to guess.
- **Guiding questions:** 1. What do you believe about your trade that others in it do not? 2. Why do you do the work this way? 3. Which belief shapes most of your choices?
- **Control:** text box (as today). **Asked when:** always. **Options:** none.
- **Length:** one short paragraph, three to five sentences.
- **The "i" says:**
  - What do you believe about your trade that sets you apart? Why do you work this way?
  - Explain the belief; the rules it leads to go in Principles.
  - Example: "We believe a thing made slowly is used for longer, so we make fewer and better."
- **Connections.** *Comes from:* the Values and Principles above. *Read by (built):* the Business Plan, company description, "Values and Principles", the line "Philosophy"; the Review. *Read by (not built yet):* none proposed.

### 3.6 Manifesto (proposed code PB6)

- **Its purpose for the founder:** the public declaration: a few lines, in the business's own voice, of what it stands for and against, written to be read by customers and the people who might join. It opens the Business Plan's company description.
- **Guiding questions:** 1. What do you stand for? 2. What do you stand against? 3. What would you say to the customers and people you want to attract?
- **Control:** text box (as today). **Asked when:** always. **Options:** none.
- **Length:** four to eight short lines or a short paragraph; each line break is a paragraph in the plan.
- **The "i" says:**
  - What do you stand for, and what do you stand against?
  - Write it for your customers, in your own voice. Draw on your Values and say them in fresh words.
  - Example: "We are for things that last. We are against the throwaway gift."
- **Connections.** *Comes from:* all five texts above (in its own voice). *Read by (built):* the Business Plan, company description, the heading "Manifesto" (`paragraphs`); the Review. *Read by (not built yet):* the Brand System's voice, as a display only (doc 28, 6.1: no text is written into Brand).

### 3.7 What changes when an answer above changes

Nothing is removed: the six are free texts and none decides whether another is asked. An empty text is one Review item, "<text>: not answered yet."

### 3.8 The Vision's two choices (PB7, PB8)

Added 2026-11-12 (owner approved, D1). In the Mission & Vision dialog, in the Vision's column, under its text, one question per band. Built in phase 3 (the order of work: doc 49, section 8). The phrases the Business Plan prints are at the end of this section.

#### PB7. What will your business be when your Vision comes true?

- **Label:** What will your business be when your Vision comes true?
- **Control:** ticks, "3 max".
- **Asked when:** always.
- **Options**, each with the Theme it puts first and its phrase for the Business Plan:

  | id | Label | Theme | Plan phrase |
  |---|---|---|---|
  | `customers` | Serving a large, growing customer base | Growth & Market | serving a large, growing customer base |
  | `loved` | Loved and recommended by its customers | Customers & Experience | recommended by loyal customers |
  | `range` | Offering a strong, growing range | Products & Innovation | offering a strong, growing range |
  | `profitable` | Profitable and paying its own way | Revenue & Financial Sustainability | profitable, paying its own way |
  | `trusted` | Known and trusted in its field | Brand & Positioning | trusted in its field |
  | `smooth` | Running smoothly with a strong team | Operations & Capability | running smoothly with a strong team |
  | `partners` | Working closely with strong partners | Partnerships & Expansion | working closely with strong partners |

- **"i":**
  - The kind of future your Vision describes.
  - Your choices put the matching Strategic Themes first on the Strategy page.
- **Saved as:** `purpose.visionAmbitions: string[]`.
- **Read by:** the Theme order; the Compass draft; the Business Plan's Executive Summary.

#### PB8. Where will your customers be?

- **Label:** Where will your customers be?
- **Control:** one choice (radio).
- **Asked when:** always.
- **Options**, with the Segment's ids, the shared rank, and the plan phrase:

  | id | Rank | Label | Plan phrase |
  |---|---|---|---|
  | `city` | 1 | In my city / town | in our city / town |
  | `region` | 2 | In my state / region | across our state / region |
  | `country` | 3 | Across my country | across our country |
  | `countries` | 4 | In several countries | in several countries |
  | `worldwide` | 5 | Worldwide | worldwide |

  The Segment's own ids are `city`, `region`, `country`, `countries` and `online` ("Anywhere online"), as built in `SegmentQuestions.ts` (`reach`). The Segment's `online` takes rank 5, level with `worldwide`.
- **Shown under it:** a muted line, "Today: [the widest Segment answer] ([Segment])".
- **"i":**
  - Where your customers will be when your Vision comes true.
  - The distance from today's reach, shown below, guides the growth choices on the Strategy page.
- **Saved as:** `purpose.visionReach: string`.
- **Read by:**
  - The SWOT Opportunity "Customers beyond your reach today: [PB8 label]". It shows when PB8's rank is above every Segment's rank.
  - SC2's start.
  - The order of the Partnerships & Expansion Theme.
- **The Review:** "Your Vision's future: not chosen yet". It shows once the Vision has text and PB7 or PB8 is empty.
- **The Business Plan prints:** "When our Vision comes true, the business will be [PB7 phrases, joined with commas and 'and'], with customers [PB8 phrase]."

| Answer | Option → phrase |
|---|---|
| PB7 (plan) | customers → serving a large, growing customer base; loved → recommended by loyal customers; range → offering a strong, growing range; profitable → profitable, paying its own way; trusted → trusted in its field; smooth → running smoothly with a strong team; partners → working closely with strong partners |
| PB8 (plan) | city → in our city / town; region → across our state / region; country → across our country; countries → in several countries; worldwide → worldwide |

## 4. How the texts connect without repeating one another

| Text | Owns | Does not hold |
|---|---|---|
| Mission | the present: whom, what, why | the future (Vision), the beliefs (Philosophy) |
| Vision | the future result | the steps (the Strategy), today's work (Mission) |
| Values | what matters, as named words | rules of behaviour (Principles) |
| Principles | what you always or never do | the reasons (Philosophy), the names of the values |
| Philosophy | the belief behind the approach, explained | a list; a call to customers (Manifesto) |
| Manifesto | the public declaration, in voice | new facts: it restates the others, never adds one the plan relies on |

- **Mission or Vision.** Mission is now and concrete; Vision is later and a result [BDC; KU-CTB]. The Mission's "i" sends the future to the Vision, and the Vision's "i" sends the steps to the Strategy.
- **Values or Principles.** A value says what matters ("Craft"); a principle says what you do about it ("We finish every piece by hand"). Each principle should follow from a value; a value with no principle is a sign it is not yet kept.
- **Philosophy or Manifesto.** Both are prose about beliefs: the Philosophy explains to a reader of the plan, the Manifesto declares to the public. Doc 39's one-owner rule applies to facts, so the Manifesto may echo the others in its voice; its "i" asks it not to copy the Mission.
- **With the cards that come later.** The Organisation's Description owns what the business makes; the Positioning owns whom it sells to and how it differs; "What customers care about" (L1) owns the customer's priorities. None of the six asks them again.

## 5. Codes

The Identity texts have no codes in the register (doc 44 lists the Foundation's cards only). Under the code rule of doc 40 (permanent ids; the next free code), the card takes a new prefix, **PB** (Purpose & Beliefs), not used by any card:

| Code | Text | Saved key | Status |
|---|---|---|---|
| PB1 | Mission | section 1, `mission` | proposed |
| PB2 | Vision | section 1, `vision` | proposed |
| PB3 | Values | section 2, `values` | proposed |
| PB4 | Principles | section 2, `principles` | proposed |
| PB5 | Philosophy | section 2, `philosophy` | proposed |
| PB6 | Manifesto | section 2, `manifesto` | proposed |
| PB7 | The Vision's ambitions | section 1, `visionAmbitions` (new) | proposed |
| PB8 | The Vision's reach | section 1, `visionReach` (new) | proposed |

The codes follow the pairs' order, not today's tile order. They enter the register (`tools/scripts/docs/questions-register.mjs`) now that the chapter is built (section 6); they are not in it yet. No structured question is proposed (sections 3.3 and 3.4), so no further code is taken.

## 6. The owner's decisions

The owner, 2026-11-09 ("Change the 2. Ethics to Purpose & Beliefs, and move there the Mission and Vision. Follow your recommendations."): each open question takes the recommendation of this document.

1. **Layout: option A, built.** Definition keeps Organisation and Positioning; the chapter "Purpose & Beliefs" holds Mission & Vision, Values & Principles, Philosophy & Manifesto, in that order. Mission & Vision draws the two texts saved in Definition (section 1, keys `mission` and `vision`) and marks them with Definition's keys (`AnswerRenderer.tsx`, `pageSections`; `Conversation.tsx`). Three master tiles stand as the 2 x 2 of four with its fourth place empty, the size of every chapter's tiles (layout rules, section 23).
2. **Names: built.** The chapter "Purpose & Beliefs" (the section's title in `01_IdentitySystemAnswer.md`; its keys are the column titles, unchanged); the page "Definition and Purpose" (`PageGroups.ts`); the tiles "Mission & Vision", "Values & Principles", "Philosophy & Manifesto", each name on a line of its own (a master tile's forced break).
3. **The prompts: the guiding questions of section 3 replace the bullets, built** (`01_IdentitySystemQuestions.md`), in the app's affirmative voice: where section 3's wording said what not to do, the "i" says what to do (the Mission: "Say what you do today; the future you aim for belongs in the Vision." and "Make it specific enough to describe your business alone."; the Vision: "Describe the result; the steps belong in the Strategy."; the Values: "What would you hold to, even at the cost of a sale?"; the Principles: "what do you always do, and what do you always avoid?"; the Philosophy: "What do you believe about your trade that sets you apart?"; the Manifesto: "Draw on your Values and say them in fresh words."; the Vision's example: "Every home in the UK and Ireland has one throw it keeps for life.").
4. **The Vision's horizon: five to ten years** [BDC], built in its "i".
5. **The Business Plan's headings: as they are.** The readers stay untouched (section 1): the plan prints Philosophy under "Values and Principles" and the Manifesto apart. Its reader now finds the four texts by the chapter's new title (`BusinessDocuments.ts`).
6. **A pair tile's face: both texts' lines, built**, the first's, a hairline, the second's, as a tile shows one text; the list scrolls.
7. **The Positioning beside the Mission: yes, not built.** It needs a new note beside the Mission's box (section 3.1, "Read by (not built yet)"), a new feature; it waits, with the Review note on a customer no Segment describes.
8. **The Vision's two choices, PB7 and PB8 (owner, 2026-11-12 14:10, D1): approved, not built** (section 3.8; built in phase 3, doc 49, section 8).

The codes PB1 to PB6 (section 5) are decided; they are not yet in the register (`tools/scripts/docs/questions-register.mjs`, doc 44).

## 7. Sources

Written in the Harvard style of doc 2, 2.1. "Opened" means read on 2026-11-09 for this document; what was not opened, or only in part, says so.

- **[CP-96]** Collins, J.C. and Porras, J.I. (1996) 'Building your company's vision', *Harvard Business Review*, 74(5), September to October. Available at: https://hbr.org/1996/09/building-your-companys-vision (Accessed: 9 November 2026). Opened: the summary only (a fixed core purpose and core values while strategies change). The split into core ideology and envisioned future is the article's structure as published; the full text, behind the paywall, was not verified in this session.
- **[BDC]** Business Development Bank of Canada (no date) *Vision and mission statements*. Available at: https://www.bdc.ca/en/articles-tools/entrepreneur-toolkit/templates-business-guides/glossary/vision-and-mission-statements (Accessed: 9 November 2026). Opened: the mission says why the company exists, whom it serves and what it offers, and is too vague if it fits a competitor; the vision looks five to ten years ahead; both brief.
- **[KU-CTB]** Center for Community Health and Development, University of Kansas (no date) *Proclaiming your dream: developing vision and mission statements*, Community Tool Box, chapter 8, section 2. Available at: https://ctb.ku.edu/en/table-of-contents/structure/strategic-planning/vision-mission-statements/main (Accessed: 9 November 2026). Opened: vision as the future hoped for, brief; mission as what the organisation will do and why, concise and outcome-oriented.
- **[SBA]** U.S. Small Business Administration (no date) *Write your business plan*. Available at: https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan (Accessed: 9 November 2026). Opened: the executive summary of a traditional plan includes the mission statement (the place the app prints it); vision and values are not mentioned.
- **[POM]** *Principles of Management*, v1.1, chapter 4 'Developing mission, vision, and values'. Saylor Academy edition. Available at: https://saylordotorg.github.io/text_principles-of-management-v1.1/s08-developing-mission-vision-and-.html (Accessed: 9 November 2026). Opened in part: the mission covers why, what and whom; the vision is brief and future-oriented; values may stand in a statement of their own. The page does not name its authors; an open textbook, support only.
- **[LEN-02]** Lencioni, P.M. (2002) 'Make your values mean something', *Harvard Business Review*, 80(7), July. Available at: https://hbr.org/2002/07/make-your-values-mean-something (Accessed: 9 November 2026). Opened: the opening only (a list of generic values may do more harm than good); the rest was not verified.
- **[SIN-09]** Sinek, S. (2009) *How great leaders inspire action* [TED talk]. Available at: https://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action (not opened in this session; not verified). Considered and not used (section 2.1).

These are listed here only; none is added to doc 2 until the chapter is built and an "i" cites one.
