# 8. The Positioning tile: every question and option, as built

Status: **specification**, written 2026-11-01, updated 2026-11-21. Every question of the Positioning tile (Identity System, page 1) in the order it is asked, with its control, when it is asked, its options, what its "i" says and what it connects to. Questions 8 to 10 (the Differentiation and the two outcomes) moved to the Business System's Foundation cards on 2026-11-08 (owner, "Move all three"): K14 after the Competitors (Questions 14), the Offering's O4 (Questions 16) and the Segment's End user, 9 (Questions 12); their sections below say where, and their codes stay retired (Questions 6).

Related: Questions 7 (the Organisation tile, whose Opening Date sets the stage), Questions 12 (the Segment's questions, which read these answers), Questions 4 (the first version: single-sided, B2C and B2B), Research 5 (the age terms, the relationships and the relevance tables), Questions 2 (8.2, the design), `src/components/interview/editors/legal/` and `src/framework/engine/PositioningIds.ts`.

**The tile** is named by the business stage: **Early Positioning** (Planning and Launching), **Core Market Positioning** (Managing), **Corporate & Portfolio Positioning** (Growing); the saved key stays `positioning`. It has two columns with a divider, and its questions are grouped by relationship (owner, 2026-11-09): question 1, the Seller & Buyer Relationship, stands first, on the left; then each relationship chosen asks its own questions together, in the order they follow from one another: a consumer buyer (B2C) 3, 4, 5, 6 (the buyer's life stage, the buyer's category, the buyer and end user relationship, the end user's life stage), a business buyer (B2B) 2, 4, 5 (the scale, the buyer's category, the buyer and end user relationship). With both chosen, the consumer's group stands on the left under question 1 and the business's on the right above the purpose, and the two columns are equal, so they hold about as much; with one, its group stands on the left and the purpose alone on the right (the left column as wide as its longest option). A double rule stands between one group and the next in a column. The codes stay as they were (Questions 6): only their order changed. On the right, what is offered (the purpose; the differentiation and the outcomes moved to the Business System on 2026-11-08); the Notes, the positioning statement, stand under both. The tile's lines say the customers, the end user and the purposes. The questions are bands, as on the Segment card. A question with a limit shows it beside its label ("2 max") and locks the other options at the limit, with no warning.

**The stage sets how many choices a question allows** (the owner's matrix, Questions 2, 8.2): Planning: one in every question. Launching: one, except two in the purpose (and in the differentiation and the end user's outcome, which keep this limit where they are asked now). Managing: two in each. Growing: free. A question of one choice is a radio; a question of several is ticks. When a new Opening Date moves the business into another stage, an answer that no longer fits goes back to empty, and a question that fits keeps its answers. Every question's "i" carries the stage's line, before its sources, in the stage's words, for example: "At this stage (Planning): choose one. When the stage changes (the Opening Date), an answer over the limit goes back to empty."

**Connections** are named as in Questions 12: *Comes from* is what a question takes from another answer; *Read by* is what reads it, built and not built yet. Built for all of them: the exports list the answers in words (the Differentiation and the end user's outcome under each Segment since 2026-11-08).

## 1. The left column: the relationship, then the consumer buyer (B2C)

### 1. Seller & Buyer Relationship

- **Control:** a radio (Planning, Launching) or ticks, 2 max (Managing), free (Growing).
- **Asked when:** always.
- **Options:**
  - B2C (Business-to-Consumer)
  - B2B (Business-to-Business)
- **The "i" says:** Who pays: the buyer who approves the budget; the person who uses it can be someone else. The positioning statement is written for the buyers; each distinct group of them may need its own. B2C (Business-to-Consumer): individuals or consumers who pay for personal or family use. B2B (Business-to-Business): businesses, companies, freelancers or public bodies. Based on the positioning statement of the strategy literature. (Public bodies named, owner, 2026-11-08: a public buyer is chosen as B2B, with the scale Enterprise or Public Sector.)
- **Connections:**
  - *Comes from:* the stage (the limit).
  - *Read by (built):* the Segment card, which asks people's questions for B2C and the business's for B2B (Questions 12); every question below; the exports.
  - *Not built yet:* B2G and G2B and the multi-sided market are built and hidden (Questions 4); an older answer that holds them is read without them.

### 3. Buyer's Life-Stage (a consumer buyer)

- **Control:** as question 2.
- **Asked when:** B2C is chosen: the first of the consumer buyer's questions, on the left under question 1. It is not shown frozen before a relationship is chosen (only question 2 is).
- **Options:**
  - Students / Young Adults
  - Workers / Professionals
  - Seniors
- **The "i" says:** The stage of life of the people who buy. Your Segment's age groups follow it. Students / Young Adults: they buy for themselves; tech-savvy, low budget, sensitive to trends. Workers / Professionals: they buy for themselves, with their own income; they seek time savings, convenience or status and decide inside a busy working life. Seniors: they buy for themselves, often on a fixed income and with time to compare; they look for accessibility, simplicity, trust and health support. Where a family member buys for them, the buyer's category below is Proxy or Dual-Intent.
- **Connections:**
  - *Comes from:* the relationship.
  - *Read by (built):* the Segment's age group (the terms offered: Students / Young Adults: Minors, semi-dependent and Young adults; Workers / Professionals: Established, Peak, Mature; Seniors: Active Retirees and Dependent seniors); the order of the purposes, differentiations and outcomes.

### 4. Buyer's category

- **Control:** a radio, for each relationship chosen, in that relationship's group: after the life stage for a consumer buyer, after the scale for a business buyer (the label gets "(B2C)" or "(B2B)" when both are, and the B2B one stands in the right column).
- **Asked when:** a relationship is chosen.
- **Options:**
  - Direct Buyers
  - Proxy Buyers
  - Dual-Intent Buyers
- **The "i" says:** What the buyer buys for. It tells the buyer who pays from the person who uses it, whatever the buyer's life stage or scale. Direct Buyers: purchasing exclusively for their own personal use. Proxy Buyers: purchasing exclusively on behalf of someone else (a gift, a parent buying for a child, an employer buying for its staff). Dual-Intent Buyers: purchasing a single offering to be used by themselves and their dependents (a family plan, a shared tier). For Proxy and Dual-Intent Buyers the questions about the end user follow. Based on the buying roles of the marketing literature.
- **Connections:**
  - *Comes from:* the relationship.
  - *Read by (built):* the end-user questions below (asked for Proxy and Dual-Intent only); the Segment card's End user part; the order of the purposes.

### 5. Buyer & End User relationship

- **Control:** as question 1 (the audience limit).
- **Asked when:** the buyer's category is Proxy or Dual-Intent, for that relationship, right after that relationship's buyer's category (the B2B one in the right column when both are chosen).
- **Options:** a consumer buyer: Parent or guardian; Caregiver; Family member; Spouse or partner; Friend or acquaintance; Commercial & Professional. A business buyer: Employer; Business partner; Business serving clients; Professional intermediary; Sponsor or funder; Institution or membership body (Proxy or Dual-Intent; added 2026-11-09). Only the relationships that can be the chosen category are offered (a friend can only be a Proxy, a spouse or partner only Dual-Intent), and one already chosen stays. **No "Other"** (owner, 2026-11-09, Research 5 decision 39: it recorded nothing the app could use): a saved Other (`rel:otherpersonal`, `rel:otherbusiness`) still reads, shows until it is unticked, and opens the same questions; its tile and export words stay.
- **The "i" says:** How is the buyer related to the person who will use it? It orders the purposes below and your Segment's Differentiation: a parent looks for safety and trust, an employer for compliance and duty of care. Only the relationships that fit the buyer's category above are offered. Institution or membership body: a school for its pupils, a care home for its residents, a club or union for its members, a council for its residents.
- **Connections:**
  - *Comes from:* the buyer's category and the buyer's life stage (a Student or Young Adult buyer is not a Commercial & Professional buyer).
  - *Read by (built):* the end user's life stages offered (the owner's matrix); which relationship questions the Segment's End user part asks (school stage, work status, job level, or the clients' type and size); the order of the purposes and differentiations.

### 6. End User's Life-Stage (a consumer buyer)

- **Control:** as question 1.
- **Asked when:** B2C and a Proxy or Dual-Intent buyer, and more than one life stage fits: the last of the consumer buyer's questions. Where only one fits (a Parent of a Students / Young Adults buyer's dependent: Minors) it is set and the question is not drawn (owner, 2026-11-01).
- **Options:**
  - Minors
  - Young Adults
  - Adults
  - Seniors
- **The "i" says:** The life stage of the person who will use it. A broad group is enough to give the end user's Profile its first shape; the exact age comes later, on the Profile. Minors: under 18; some goods and online services have extra rules for them. Young Adults: 18 to 24. Adults: 25 to 64. Seniors: 65 and over. The Segment then asks the end user's stage within it (Baby, Child, Teenager and so on).
- **Connections:**
  - *Comes from:* the relationship and the buyer's life stage (a stage the combination leaves blank is not offered).
  - *Read by (built):* the Segment's End user part (the terms offered); the order of the differentiations and outcomes.

## 2. The right column: the business buyer (B2B), then what is offered

### 2. Audience Specialisation & Scale (a business buyer)

- **Control:** as question 1 (the audience limit follows the stage).
- **Asked when:** B2B is chosen: the first of the business buyer's questions, at the top of the right column when B2C is chosen too, else on the left under question 1. Before any relationship is chosen it stands frozen there, under question 1, with the hint "Choose a seller and buyer relationship first."
- **Options:**
  - Solopreneurs & Freelancers
  - Startups & SMBs
  - Mid-Market
  - Enterprise or Public Sector
- **The "i" says:** How big the businesses you sell to are. Your Segment's size question offers the sizes that go with it. Solopreneurs & Freelancers: individual professionals (immediate decision, need for low cost or self-service). Startups & SMBs: small and medium-sized or rapidly growing companies (need for speed, flexibility and an immediate solution). Mid-Market: medium-sized businesses with structured departments (need for workflows, roles and scale). Enterprise or Public Sector: multinationals or public bodies (multi-month sales or tender cycle, need for maximum security).
- **Connections:**
  - *Comes from:* the relationship.
  - *Read by (built):* the Segment card (a business scale means a business buyer where no relationship is chosen); the order of the differentiations and of the purposes (the owner's tables).

### 7. Purpose

- **Control:** ticks, up to the stage's limit (the purpose, differentiation and outcome limit), with "2 max" shown where it applies.
- **Asked when:** always.
- **Options:** the twelve purposes, ordered by relevance to the answers so far (the owner's tables, Research 5, 10.7): Learning & Development; Health, Care & Wellbeing; Gifting & Appreciation; Entertainment & Enjoyment; Social Connection & Relationships; Productivity & Efficiency; Business Growth & Performance; Creation & Expression; Everyday Needs & Convenience; Protection & Risk Reduction; Compliance & Obligations; Access & Social Support. The ones the tables call generally less directly relevant to the buyer are not offered; one already chosen stays.
- **The "i" says:** Why the offering is bought: the purpose it serves for the person who gets it. Only the purposes that fit your answers above are offered: the primary ones first, then the possible ones.
- **Connections:**
  - *Comes from:* the relationship, the buyer's category, the buyer and end user relationship, the life stages and the audience scale (the order and the options).
  - *Read by (built):* the order of the differentiations and outcomes; the exports.
  - *Read by (not built yet):* the Value Proposition draft (Questions 2, 6.7). No Offering question asks a purpose.

### 8. Differentiation (moved to the Business System, owner, 2026-11-08)

**Moved.** The owner decided (2026-11-08, "Move all three") that questions 8, 9 and 10 leave this tile and are answered on the Business System's Foundation cards. **Why:** a differentiation is set against the alternatives the customer would otherwise choose, so it is answered after the competitors are known, not before them (Dunford, *Obviously Awesome*, 2019: the competitive alternatives come first, the unique attributes and the value they enable follow from them).

- **Where it is now:** once for each Segment, in its Competitors column after the Competitor cards, in its own section Differentiation (named "Insights & Differentiation" until 2026-11-09; the label under it asks "How will you stand apart?"): code K14 (Questions 14), saved on the Segment (`questions.differentiation`). Its options, its "i" (one line changed: the result is asked on each Offering, not "next") and its order (Research 5, the owner's tables, `differentiationOptionsFor`) are as built here; the stage sets its limit as before.
- **The saved answer:** `organisation.differentiation` stays readable; it is the starting value of every Segment's K14 until that Segment saves its own, which then wins (even cleared). Where it is empty, the openings ticked on the Segment's Competitors (K10) start K14 instead, through the crosswalk of Questions 14 (2026-11-09). It no longer shows on this tile, in the tile's lines or in the Review's open item of this tile.

### 9. Outcome for the buyer (moved to the Offering, owner, 2026-11-08)

- **Where it is now:** the Offering's O4 ("Which of what matters most to your customers does it do best?") is its one owner (Questions 16); no question asks it twice. Each of its four options already has its value in O4's list through the crosswalk (Research 3, 5.2a: Lower costs → Affordability; Time saved → Speed, Convenience; Legal & data-protection cover → Safety / security, Reputation; Higher quality & prestige → Quality, Values), so O4 needed no new option.
- **The saved answer:** `organisation.outcome` stays readable; it starts O4's ticks after the Differentiation's (up to three), until the Offering saves its own.

### 10. Outcome for the end user (moved to the Segment, owner, 2026-11-08)

- **Where it is now:** the Segment's End user part, End user, 9 (Questions 12), asked only where the Segment has an end user (its own buyer is Proxy or Dual-Intent); its options, its "i" and its order (the purposes, then the life stages) as built here; the stage sets its limit. On the same day it moved on to each Profile's end-user part, E4 (Questions 13, 2.1; owner, 2026-11-08), where the Segment's answer, else this one, is its start.
- **The saved answer:** `organisation.outcomeUser` stays readable; it is the starting value of each Profile's E4 (through the Segment's End user, 9 where that was saved) where the Segment has an end user, until the Profile saves its own.

## 3. Under both columns

### 11. Notes

- **Control:** the shared optional note (a tick and the word), the positioning statement in the App User's own words.
- **Asked when:** always (optional).
- **The "i":** the Notes have none; the guidance on the positioning statement (for whom, what, unlike whom, why) is on the "i" of the dialog's title.
- **Connections:**
  - *Read by (built):* the Business Plan's positioning section (headed Early Positioning Statement, Core Market Positioning or Corporate & Portfolio Positioning by the stage) and the exports; the Segment card shows it behind the "i" of the first instruction.

## 4. The design and its reasons

(Moved here from Questions 2, section 8.2, on 2026-11-21: the tile's design and its reasons stand with what was built. The sub-section numbers are Questions 2's, so a citation such as "Questions 2, 8.2" finds its text here.)

### 8.2 The Positioning tile and the Identity questions

> **As built: Questions 8** lists every question and option of the tile, by stage, with what each comes from and is read by. This section keeps the design, its reasons and the reads still to be built.

> **First published version (Questions 4, 4).** Single-sided only: the Multi-sided option of I11, the anchor-side rule and the `side:outcome` answers are future features (Questions 4, item 5). B2C and B2B only: B2G and G2B in I3, the B2G and G2B audiences of I7b and the locked audiences are future features (Questions 4, items 6 and 7); they are built and stay in the code. The buyer's category (Direct, Proxy, Dual-Intent) is a question of its own, and I7b keeps three life stages, so "Proxy Buyers / Gifters" leaves the life-stage list (Questions 4, section 5; built on 2026-10-29). In the End User block only the relationship and, for B2C, the user's life stage are in the first version: I7f and I7g and the routing of the End User answers into the second Profile are future features (Guide 3, section 8.2, items 12 and 13). **Built on 2026-10-29:** the tile asks what the tables below say; the Organisation tile (8.5) takes the six countries and Other (Questions 4, section 3).

#### What it asks

The tile keeps its free-text box (the **Notes**, the shared optional note) and gains four choice questions before it (the owner's request, 2026-10-23, the owner's words as written, 2026-10-24). The choices come first and **narrow** what the user has to think about; the Notes then say the rest in the user's own words: what problem the business solves, for whom, and why its solution is different. The same answers are meant to narrow every later list, name the first Segment and Offering and suggest examples (8.2, "What the Segment will read"). Mission, Philosophy, Principles and Manifesto stay prose: nothing downstream could read a list from them.

| Id | Question (the owner's label) | Component | Options (the owner's words; brackets are in the "i") | Saved as |
|---|---|---|---|---|
| I11 | **Market Structure** | **Not asked in the first version** (built 2026-10-29: the answer is single-sided, saved as "single") | Single-sided Market. The Multi-sided Market / Platform option is built and hidden: a future feature (Questions 4, item 5) | `marketType` (always `single`; an older "multi" is read as single) |
| I3 | **Seller and Buyer Relationship** (who pays) | Radio where one choice is allowed, ticks with a limit where several are, by the stage | **B2C (Business-to-Consumer)**; **B2B (Business-to-Business)**. B2G and G2B are built and hidden: a future feature (Questions 4, items 6 and 7) | `customerType` (a list of ids; "both" is read as B2B and B2C) |
| I7b | One **audience** question for each relationship chosen; frozen until one is chosen; emptied for a relationship that is removed | As I3 | **B2B, Audience Specialisation & Scale:** Solopreneurs & Freelancers; Startups & SMBs; Mid-Market (50 to 249 employees); Enterprise or Public Sector. **B2C, Buyer's Life-Stage:** Students / Young Adults; Workers / Professionals; Seniors. The option Proxy Buyers / Gifters is now the buyer's category (I7h) | `audience` (a list of ids) |
| I7h | **Buyer's category** (new 2026-10-29), one for each relationship chosen | Radio, one choice | **Direct Buyers** (for their own personal use); **Proxy Buyers** (on behalf of someone else); **Dual-Intent Buyers** (one offering for themselves and their dependents) | `buyerCategory`: `b2c:direct`, `b2c:proxy`, `b2c:dual`, `b2b:...` |
| I7i | **Purpose** (new 2026-10-29), asked once | As I7c | The twelve purposes of Research 5, section 7: Learning & Development; Health, Care & Wellbeing; Gifting & Appreciation; Entertainment & Enjoyment; Social Connection & Relationships; Productivity & Efficiency; Business Growth & Performance; Creation & Expression; Everyday Needs & Convenience; Protection & Risk Reduction; Compliance & Obligations; Access & Social Support | `purpose` (a list of ids) |
| I7c | **Differentiation** (split from the old "Differentiation & Outcome" on 2026-10-30): what the **offering** does differently from the competitors; asked once | As I3 | **Cost-driven**; **Convenience-driven**; **Compliance, Risk & Security**; **Status & Premium**; **Performance & Innovation**; **Ecosystem & Integration** (the last two added 2026-10-30); **Personal Service & Relationship** (added 2026-11-08, Questions 8, question 8) | `differentiation` (a list of ids; an older answer's `outcome` ids, and `side:outcome`, are read as the differentiation) |
| I7j | **Outcome** (for the buyer: **Outcome for the buyer** where the user has one of their own); the measurable result the buyer gets; asked once | As I3 | **Lower costs**; **Time saved**; **Legal & data-protection cover**; **Higher quality & prestige** | `outcome`: `savings`, `time`, `assurance`, `prestige` |
| I7k | **Outcome for the user**: asked only where some buyer is a Proxy or Dual-Intent Buyer (the buyer and the user want different things) | As I3 | **Enjoyment & fun**; **Comfort & ease**; **Safety & care**; **Learning & growth**; **Looks & belonging**; **Practical use** (the former I7g, now the user's outcome) | `outcomeUser`: `enjoy`, `comfort`, `safety`, `learning`, `belong`, `practical` |

Older answers read as lists: a single id is a list of one, and "both" is B2B and B2C. I5 (brand personality) is parked (8.3); I6 and I7 are withdrawn (I6: the Harvard Business School's two routes already say the price, a premium price or lower costs [FUN-19]; I7 was merged into I7c).

#### What the words mean (corrected 2026-10-25)

Three different things were mixed in the earlier text, and the sources separate them [FUN-34 to FUN-39, FUN-43]:

1. **Customer and user.** The **customer** is the user who pays (or an entity that pays); the **user** is who uses it. They can be the same people, or different (a parent who buys for a child, an employer who buys software its staff use, an insurer who pays for a patient). The **economic buyer** approves the budget; the functional and technical buyers are other roles in the purchase. **The Seller and Buyer Relationship question is about the economic buyer** (who pays), and it says so in its "i". The buyer who is not the user is **not** a question of the market structure.
2. **Single-sided and multi-sided market.** A **single-sided market** sells a product or service directly to one audience of buyers; one group pays, and the product does not need another group to be worth buying. A **multi-sided market (a platform)** connects two or more distinct groups that transact with each other, and its value to one group depends on the other (a marketplace, a delivery app, an advertising-funded service). Each group is a **side**. Any market brings buyers and sellers together, so "getting both sides on board" alone does not make a platform; the structure does [FUN-36, FUN-38].
3. **Where the buyer is not the user, in a single-sided market.** A parent who buys for a child, or a corporate buyer for its staff, is a buyer-and-user split in a **single-sided** market. The Positioning answer for it is the B2C life stage **Proxy Buyers / Gifters** (the buyer pays and decides, the product is for someone else); other cases (an employer, a hospital's procurement) are a second Profile with P21 "They will use it" (6.3); there is no Segment question for it.

**Platforms and the stage.** While **Planning and Launching** a platform business answers every question for **one side only**, the *anchor side* (the critical side for the start, usually the one that pays); the one-choice limits enforce it and the "i" says it. While **Managing and Growing** several relationships can be chosen, each opens its own audience question, and Differentiation & Outcome is asked **once for each side** ("Differentiation & Outcome (B2C)", "(B2B)"), the answers saved as `side:outcome` (for example `b2c:cost`). In a single-sided market the same relationships are one hybrid, and the last question is asked once.

#### The buyer's category and the End User (built 2026-10-29; first version, Questions 4, section 5)

**Why.** Who pays and who uses it are two different things, whatever the buyer's life stage or scale. The buyer's category (I7h) says which: a **Direct Buyer** buys for personal use; a **Proxy Buyer** buys on behalf of someone else; a **Dual-Intent Buyer** buys one offering for themselves and their dependents. The earlier option Proxy Buyers / Gifters of the life-stage list is the category now, so the life stage keeps its three options. For a Proxy or Dual-Intent Buyer the End User questions follow, in the same column, directly under the category.

| Id | Question (label) | Asked of | Component | Options | Limit by stage | Saved as |
|---|---|---|---|---|---|---|
| I7e | **Buyer & User relationship** | A relationship whose category is Proxy or Dual-Intent | Radio or ticks | **B2C:** Parent or guardian; Caregiver; Family member; Spouse or partner; Friend or acquaintance; Commercial & Professional (a proxy buyer; added 2026-10-30). **B2B:** Employer; Business partner; Business serving clients; Professional intermediary; Sponsor or funder; Institution or membership body (Proxy or Dual-Intent; added 2026-11-09). *Note (owner, 2026-11-09, Research 5 decision 39): "Other" is no longer offered in either list; a saved one still reads and keeps its questions* | As the audience: 1, 1, 2, any | `rel:parent`, `rel:caregiver`, `rel:family`, `rel:partner`, `rel:friend`, `rel:commercial`, `rel:otherpersonal` (saved only); `rel:employer`, `rel:copartner`, `rel:serving`, `rel:intermediary`, `rel:sponsor`, `rel:institution`, `rel:otherbusiness` (saved only) |
| I7d | **User's Life-Stage** | B2C only | Radio or ticks | Minors; Young Adults; Adults; Seniors | As the audience | `age:minor`, `age:young`, `age:adult`, `age:senior` |

**What the first version does not ask.** "Who chooses" (the former I7f) is a future feature (Guide 3, section 8.2, item 12); its saved answers are read without it. "What matters most to the End User" (the former I7g) is the **outcome for the user** (I7k); its saved answers (`wants:safety`) are read as that outcome. The routing of the six into the second Profile's ticks (P9, P17) is still future (Guide 3, section 8.2, item 13). Older ages are read as the four life stages: the three under 18 are Minors, the older adults are Seniors; the three relationships already saved (`rel:parent`, `rel:family`, `rel:friend`) keep their ids. The relationship only suggests the category; the buyer's own answer decides it (Research 5, decision 8).

**The words of the card (2026-10-30).** In the card the options are written short: "and" is "&" ("Learning & Development"), a word the question's name already says is not repeated ("Commercial & Professional", "Other"), and a relationship is named by its role ("Caregiver", "Employer", "Business partner"); the page's tile and the exports use the same names. The documents name the questions in full ("Seller and Buyer Relationship"; the card says "Seller & Buyer Relationship").

**Where they are asked (arranged 2026-10-30).** Early Positioning has two columns, each of two groups told apart by a **double divider line** (two 1px lines 2px apart; no subtitles in the card): **Business** (the relationship, its audience or life stage and its buyer's category), then **User** (a Proxy or Dual-Intent buyer's relationship and user's life stage), in the left column; **Offering** (the Purpose and the Differentiation), then **Outcome** (the buyer's and, for a Proxy or Dual-Intent buyer, the user's), in the right column. **The left column is as wide as its longest option (the right takes the rest) so that every option is on one line from a window about 1440px wide, a hairline stands under the title of each question, and every other question of a column is a tinted band (the card's label colour at 12%), as the parts of the channel card are.** **The page's tile has the same four groups, with no subtitles**: each option on a bulleted line of its own, in its own words, a hairline between two groups (the square holds about six lines: where there are more, the tile ends at a whole line; the card has them all). **Left, every question before the Purpose (moved on 2026-10-30):** the Seller and Buyer Relationship and, for each relationship chosen, its audience question (Buyer's Life-Stage, or Audience Specialisation & Scale), its Buyer's category and, for a Proxy or Dual-Intent category, the buyer and user relationship and, for B2C, the user's life stage. **Right, the offering:** the Purpose, the Differentiation and the Outcome (and the user's), once. Each is a `legal-entity-org-section` block of the same kind as before (a label over a radio or tick group, an "i" on each). The **Purpose** options come in the order of their relevance (Research 5, 10.7): for a business buyer the audience scale and the buyer's category; for a consumer buyer the buyer's and the user's life stage, else the buyer and user relationship, else the buyer's category, else the seller and buyer relationship (purpose by purpose); the **User's Life-Stage** offers only the stages the owner's matrix allows for the buyer's life stage and the relationship (Research 5, 10.7; before a buyer's life stage is chosen, a Parent or legal guardian leaves only Minors and Young Adults); the **Outcome for the buyer** and the **Outcome for the user** list first the outcomes the purposes chosen drive (Research 5, 10.7; nothing is hidden or ticked); the **Buyer and User relationship** hides what does not fit the category, the buyer's life stage and the user's life stages chosen; the purposes the table calls generally less directly relevant to those answers are not offered (an answer already chosen stays). **No new component.** An answer is dropped with its question: a category that no longer applies, or a relationship that is removed, takes its End User answers with it.

**Only the relationships that can be the category are offered (2026-10-30).** A Proxy Buyer buys for the other, so the Spouse or romantic partner (a shared purchase) is not offered; a Dual-Intent Buyer shares the purchase, so the Friend or acquaintance and the Commercial & Professional relationship (a buyer for another) are not offered; for a business buyer an employer, a professional intermediary, a sponsor or funder and another business relationship are Proxy, a business partner and a business serving its clients are Dual-Intent (Research 5, 10.7). A relationship already chosen that no longer fits goes with the change of category. Fewer options help the user; the buyer's own answer still decides the category.

**What reads them (designed, not built).** The Segment proposes a second Profile for the person who uses it: its age from I7d (P1), "They will use it" ticked (P21), and the buyer's relationship in P25 (Research 5, decision 18). Nothing in Business 1 reads the category, the relationship or the purpose yet.

#### How the stage shapes the questions

The earlier the business, the narrower its focus. The stage is not chosen: it is worked out from the Opening Date and the durations of the Global Settings (8.2a). An organisation with no Opening Date is Planning.

| Question | Planning | Launching | Managing | Growing |
|---|---|---|---|---|
| Seller and Buyer Relationship | 1 | 1 | 2 | any |
| Each audience question | 1 | 1 | 2 | any |
| Differentiation | 1 | 2 | 2 | any |
| Outcome (and the user's outcome) | 1 | 2 | 2 | any |
| Buyer's category | 1 | 1 | 1 | 1 |
| Purpose | 1 | 2 | 2 | any |

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
| Changes the Opening Date or a duration so the stage changes | Limits, locks, the tile's name, the "i" notes and the exported title change at once; questions whose answers no longer fit go back to empty (no notice appears; the "i" of the Opening Date and the "i" of each choice question say it) |
| Writes in Notes | Nothing else changes |

What does not react, on purpose: the market structure does not limit the relationships; an audience answer does not limit an outcome; the outcome list is the same for every relationship; the Notes depend on nothing.

#### The "i" notes and their sources

Each question's "i" lists every option (the words that were taken out of the labels are there), says what the question decides and what the **current stage** allows ("At this stage (Launching): choose up to 2", with the options not yet open and when they open), and shows only what holds now (the multi-sided point of the other stage, and the sentences about locks and the beachhead where they do not apply, are left out). Every "i" lists all its points (`fullList`), because the three-point cap would cut the options. References, all opened on 2026-10-25 [FUN-45]: HBS Institute for Strategy & Competitiveness, *Strategic Positioning* (premium price or lower costs; "stuck in the middle"), for Differentiation & Outcome; eCornell, *How to Write Market Positioning Statements* (target market, differentiation, frame of reference, reason to believe), for the relationship; Stanford E145 (Moore's two-sentence template), for the relationship and the outcome; the SBA's *Market research and competitive analysis* (customers by age, wealth, family status and interests; a business "won't be for everybody"), for the audience; HBS Online, *Crafting the Perfect Brand Positioning Statement* (age and life stage), for the life stage. **No accepted source was found for the multi-sided definition, the administrative levels and the regulatory intensity** (the OECD note could not be opened), so those "i" notes cite none and stand on the owner's wording. Every positioning template read has the same parts (target, need, category, benefit, competitor, difference, reason to believe) [FUN-24, FUN-29, FUN-40]; the four bases of segmentation (geographic, demographic, psychographic, behavioural) belong to the **Segment** of Business 1, not here [FUN-41].

#### What the Segment will read

**Built:** the Segment card asks its questions (6.3a, Questions 12) and reads Identity: the Seller and Buyer Relationship decides the kind of a Segment (people or businesses; where both are chosen, two Segment cards are made, the first of people and the second of businesses), the buyer's life stage decides the age terms offered, the audience's scale sets the organisation's type and size, and the audience chosen in Identity is shown in the "i" of the box it belongs to. There is no question "Who uses it?" (6.3): the user is a part of the Segment for a Proxy or Dual-Intent buyer. The questions G2 to G8, G10, G13 to G16 and G23 are the earlier ids (6.3 maps them to Questions 12). Which questions exist, where, and what they should be called or where they should sit is in Questions 3, section 10.

The rows of the table below that Questions 12 does not describe are the design and are not built; they are for the owner to approve **[D]** (the B2G, G2B and multi-sided rows are future features in the first version, Questions 4); each rule only suggests a default, and warns where something looks wrong, as 6.3 already does:

| Identity answer | What it does to the Segment (a starting value the user confirms; never a hidden option) |
|---|---|
| **Country** (Organisation) | G3 starts there; the currency symbol of G8 and G16; the national lists of G7, G14, G15 and G23; the examples; the equality notice |
| **Legal form, founders** | Nothing: they describe the seller, not the customers |
| **Activities** (industry, pack) | Suggests the Segment's name and the kinds of business of the Profiles (Research 3, 5.6, not built). **Never fills G15**: G15 is the customers' industry, not the seller's |
| **Opening Date, Registration Date** | Nothing directly; through the stage |
| **Business stage** | Planning and Launching: **one Segment**, drivers only; the checks (G4, G5, G16) are held back and figures are labelled forecast. Managing: up to two. Growing: any number. A stage change flags a Segment that no longer fits and deletes nothing. (The app's instruction text says "1 primary segment (maximum 2)"; it is the owner's wording and stays until the owner decides) |
| **B2C** | Box 1 (people) is asked; Box 3 is not |
| **B2B** | Box 3 is asked; G23 offers the four types (a public body allowed); Box 1 is not |
| **B2G** (future feature, Questions 4) | Box 3; G23 starts at "A public body" (not asked); G15 starts at "Government and public administration" (the pack may start at Education or Health); the tender row; the administrative level is shown in the "i" |
| **G2B Context** (future feature, Questions 4) | Box 3; G23 asked; G15 asked first, the regulated industries listed first; the regulatory intensity is shown in the "i" and a Heavily Regulated Markets answer adds a Review item |
| **Several relationships** | One Segment frame for each (people first), within the stage's limit; the second starts with G2 and G3 copied |
| **Multi-sided** (future feature, Questions 4) | Each side is one of the relationships, so **each side is its own Segment frame**, with its own outcome (I7c). There is no Buyer part or User part (6.3) |
| **Single-sided with several relationships** | A hybrid: still one frame for each |
| **Audience: scale** | Solopreneurs & Freelancers: G23 starts at "Self-employed or freelancer" and G14 is skipped. Startups & SMBs: G14 starts at "1 to 9" to "10 to 49". Mid-Market: "50 to 249". Enterprise or Public Sector: "250 to 499" and over, and "a public body" is offered. **Built on 2026-11-01** (owner's decision; the Segment takes the sizes and the type from the scale: Questions 12). The mapping is the author's: the EU's own SME line is under 250 employees, so the owner's Mid-Market lies inside the official medium size |
| **Audience: life stage** | Proxy Buyers / Gifters: G6 starts at an adult range and a **second Profile for the person who uses it** is proposed (P21 "They will use it"). Students / Young Adults: G6 starts at 18 to 24 (it may widen to 16 to 17, with the under-18 box) and G13 at "In full-time education". Workers / Professionals: G13 starts at employed or self-employed; no G6 range is set, because 25 to 64 is wider than three bands ("choose up to three"). Seniors: G6 starts at 65 to 74 and 75 or older, G13 at "Retired"; comfort with online tools (P16) is **not** inferred from age |
| **Audience: administrative level, regulatory intensity** (future features, Questions 4) | Shown in the "i" of Business Data; Local Government keeps the tender row visible |
| **Differentiation** (I7c, Questions 8 question 8; for each side of a platform) | Frames the Value Proposition prompt and the Competitor questions, and **replaces G17**: Cost-driven starts the Value Proposition at "Lower price" and asks K1 (their price against yours) first; Convenience-driven at "Ease and convenience" and "Speed" and P16 and P20; Compliance, Risk & Security at "Safety and low risk" and "Trust and reputation" and the worry "Risk or security" in P19; Status & Premium at "Quality and results" and "Shared values or identity". They are starting ticks in P9, O4 and K2 (list L1) that the user can change |
| **Positioning Notes** (free text) | Shown behind the "i" ("Your Positioning (Identity)"); it shapes no question |


A second Segment starts from the first one's answers. Build order proposed: the relationship and the market structure; the audience defaults; the outcome and the stage; the country and the industry pack.

#### Not built, and open decisions **[D]**

- **The output templates** of the owner's text (Template A, single-sided: "For [niche] who are struggling with [pain point], our product is a [category] that delivers [outcome]. Unlike [status quo / competitors]."; Template B, the bridge for a platform), which need three things no Positioning question asks (the pain point, the category, the status quo). **Decided (owner, 2026-11-03): no new Positioning cells.** The Business answers hold all three (the pain point is the Profile's E2, the category the Offering's Type or O1, the status quo a Competitor of type Status quo or Direct competitor), so the statement is drafted **per Segment in the Value Proposition tile** (6.7) from them; Identity's Notes stay the user's own text, written before Business is answered. Shorten the Notes' prompt to "What problem are you solving, for whom, and why is your solution different from the competition?"; add the optional "What makes people believe it?" (reason to believe, in every template).
- **The Future Positioning tab** and its strategic shift matrix (optional while Planning and Launching, mandatory while Growing), the strategic output (a present strategy or a transformation roadmap), the strategic goal line of each stage, and the number of statements by stage (one, one, one with two angles for a platform, several).
- **The time horizon** beside the stage (current: today to 12 months; future: 3 to 5 years) and a runway question: **the Financial Foundation already computes the Financial Runway, so it should be read, not asked again**; the owner's rule is a lock with a short note, not a red alert.
- A hybrid **B2B2C** option, tool-tips for the stages, and the export and the Foundation note still saying "Positioning".
- **A source** for the multi-sided definition, the administrative levels and the regulatory intensity; the owner's lists are the owner's own wording (rule 14 allows it). Supporting literature named by the owner and not opened: Kotler and Keller, *Marketing Management*; Moore, *Crossing the Chasm* (its slots opened in Stanford E145 [FUN-28]); Osterwalder and Pigneur, the Business Model Canvas and the Value Proposition Canvas; Evans, *Platform Economics* (text read from the owner's PDF [FUN-43]).
- Small-team limits from the owner's text (beachhead market, product limit, runway and pivot milestone, time-boxing) are Strategy or Business matters, not Positioning; parked until the owner says where.

#### The other Identity questions

| Id | Question | Component | Options | Type | What it saves or reads |
|---|---|---|---|---|---|
| I1 | What does your business do? (up to four activities, in order of importance) | Cascade of dropdowns, one path per activity | The country's own levels (Research 3, 5.7), down to the final code; a shortlist plus "Show all" **(not built: every dropdown lists all its entries)** | Driver | Fills the code at the end of each activity; the industry pack of Research 3, 5.6 (example Segment, Offering, skill areas, resource groups, Discover channels) and the drafted Description sentence are **not built** |
| I2 | (merged into I1, 2026-10-23) | | | | |
| I4 | (withdrawn 2026-10-23) | | | | Where your customers are is asked once, on the Segment (G2) |
| I5 | How do you want to be seen? | Dropdown | Aaker's five dimensions of brand personality (Stanford GSB, 1997) [FUN-20]: Sincerity; Excitement; Competence; Sophistication; Ruggedness | Parked | Brand starting points (8.3) |
| I8 | Business stage | **Not a question**: worked out from the Opening Date (8.2a) | Planning; Launching; Managing; Growing (the SBA's four headings [FUN-18]) | Driver | The estimate basis (D1: "sales I have made" and "website data" appear from "Manage your business"); labels figures forecast before launch and actual after; sets the Positioning limits |
| I9 | What do you want the business to become? | Dropdown | Keep it small and steady; Grow steadily; Grow fast; Build it to sell or hand over; Not sure yet (the UK Longitudinal Small Business Survey asks about growth aims [PLN-05]; the two extra options are the author's and fail rule 14) | Check | Later: suggestions for the funding route and the hiring question (C4) |

The legal-form label is matched by text to decide drawings or salary, which breaks for a free-text "Other" and translated labels; Records 2 (I6) already asks for a legal-form *kind* and this plan keeps that request. The activity code that I1 suggests does not replace the typed code; it fills it in for the user to confirm.
