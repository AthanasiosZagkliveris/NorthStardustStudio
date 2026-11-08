# 38. The Positioning tile: every question and option, as built

Status: **specification**, written 2026-11-01, updated 2026-11-08. Every question of the Positioning tile (Identity System, page 1) in the order it is asked, with its control, when it is asked, its options, what its "i" says and what it connects to. Questions 8 to 10 (the Differentiation and the two outcomes) moved to the Business System's Foundation cards on 2026-11-08 (owner, "Move all three"): K14 after the Competitors (doc 41), the Offering's O4 (doc 43) and the Segment's End user, 9 (doc 35); their sections below say where, and their codes stay retired (doc 44).

Related: doc 37 (the Organisation tile, whose Opening Date sets the stage), doc 35 (the Segment's questions, which read these answers), doc 33 (the first version: single-sided, B2C and B2B), doc 31 (the age terms, the relationships and the relevance tables), doc 28 (8.2, the design), `src/components/interview/editors/legal/` and `src/framework/engine/PositioningIds.ts`.

**The tile** is named by the business stage: **Early Positioning** (Planning and Launching), **Core Market Positioning** (Managing), **Corporate & Portfolio Positioning** (Growing); the saved key stays `positioning`. It has two columns with a divider: on the left, who the customers are (the relationship, the audience, the buyer's category, the end user); on the right, what is offered (the purpose; the differentiation and the outcomes moved to the Business System on 2026-11-08); the Notes, the positioning statement, stand under both. The tile's lines say the customers, the end user and the purposes. The questions are bands, as on the Segment card. A question with a limit shows it beside its label ("2 max") and locks the other options at the limit, with no warning.

**The stage sets how many choices a question allows** (the owner's matrix, doc 28, 8.2): Planning: one in every question. Launching: one, except two in the purpose (and in the differentiation and the end user's outcome, which keep this limit where they are asked now). Managing: two in each. Growing: free. A question of one choice is a radio; a question of several is ticks. When a new Opening Date moves the business into another stage, an answer that no longer fits goes back to empty, and a question that fits keeps its answers. Every question's "i" carries the stage's line, before its sources, in the stage's words, for example: "At this stage (Planning): choose one. When the stage changes (the Opening Date), an answer over the limit goes back to empty."

**Connections** are named as in doc 35: *Comes from* is what a question takes from another answer; *Read by* is what reads it, built and not built yet. Built for all of them: the exports list the answers in words (the Differentiation and the end user's outcome under each Segment since 2026-11-08).

## 1. The left column: the customers

### 1. Seller & Buyer Relationship

- **Control:** a radio (Planning, Launching) or ticks, 2 max (Managing), free (Growing).
- **Asked when:** always.
- **Options:**
  - B2C (Business-to-Consumer)
  - B2B (Business-to-Business)
- **The "i" says:** Who pays: focuses on the Economic Buyer who approves the budget, separating them from the end user. The positioning statement is written for the target market, and each distinct segment may need its own. B2C (Business-to-Consumer): individuals or consumers who pay for personal or family use. B2B (Business-to-Business): businesses, companies, freelancers or public bodies. Based on the positioning statement of the strategy literature. (Public bodies named, owner, 2026-11-08: a public buyer is chosen as B2B, with the scale Enterprise or Public Sector.)
- **Connections:**
  - *Comes from:* the stage (the limit).
  - *Read by (built):* the Segment card, which asks people's questions for B2C and the business's for B2B (doc 35); every question below; the exports.
  - *Not built yet:* B2G and G2B and the multi-sided market are built and hidden (doc 33); an older answer that holds them is read without them.

### 2. Audience Specialisation & Scale (a business buyer)

- **Control:** as question 1 (the audience limit follows the stage).
- **Asked when:** B2B is chosen. Before any relationship is chosen it stands frozen, with the hint "Choose a seller and buyer relationship first."
- **Options:**
  - Solopreneurs & Freelancers
  - Startups & SMBs
  - Mid-Market
  - Enterprise or Public Sector
- **The "i" says:** Limits the target group to a specific niche, aligning the startup with the corresponding sales cycle and the buyer's daily life. Solopreneurs & Freelancers: individual professionals (immediate decision, need for low cost or self-service). Startups & SMBs: small and medium-sized or rapidly growing companies (need for speed, flexibility and an immediate solution). Mid-Market: medium-sized businesses with structured departments (need for workflows, roles and scale). Enterprise or Public Sector: multinationals or public bodies (multi-month sales or tender cycle, need for maximum security).
- **Connections:**
  - *Comes from:* the relationship.
  - *Read by (built):* the Segment card (a business scale means a business buyer where no relationship is chosen); the order of the differentiations and of the purposes (the owner's tables).

### 3. Buyer's Life-Stage (a consumer buyer)

- **Control:** as question 2.
- **Asked when:** B2C is chosen: it appears then, and is not shown frozen before a relationship is chosen (only question 2 is).
- **Options:**
  - Students / Young Adults
  - Workers / Professionals
  - Seniors
- **The "i" says:** Limits the target group to a specific niche, aligning the startup with the corresponding sales cycle and the buyer's daily life. Students / Young Adults: they buy for themselves; tech-savvy, low budget, sensitive to trends. Workers / Professionals: they buy for themselves, with their own income; they seek time savings, convenience or status and decide inside a busy working life. Seniors: they buy for themselves, often with a fixed income and more time to compare; needs for accessibility, simplicity, trust and health support; a family member may help decide (then the buyer's category below is Proxy or Dual-Intent).
- **Connections:**
  - *Comes from:* the relationship.
  - *Read by (built):* the Segment's age group (the terms offered: Students / Young Adults: Minors, semi-dependent and Young adults; Workers / Professionals: Established, Peak, Mature; Seniors: Active Retirees and Dependent seniors); the order of the purposes, differentiations and outcomes.

### 4. Buyer's category

- **Control:** a radio, for each relationship chosen (the label gets "(B2C)" or "(B2B)" when both are).
- **Asked when:** a relationship is chosen.
- **Options:**
  - Direct Buyers
  - Proxy Buyers
  - Dual-Intent Buyers
- **The "i" says:** What the buyer buys for. It tells the buyer who pays from the person who uses it, whatever the buyer's life stage or scale. Direct Buyers: purchasing exclusively for their own personal use. Proxy Buyers: purchasing exclusively on behalf of someone else; the payer is not the end user (a gift, a parent buying for a child, an employer buying for its staff). Dual-Intent Buyers: purchasing a single offering to be used by themselves and their dependents (a family plan, a shared tier). For Proxy and Dual-Intent Buyers the questions about the end user follow. Based on the buying roles of the marketing literature.
- **Connections:**
  - *Comes from:* the relationship.
  - *Read by (built):* the end-user questions below (asked for Proxy and Dual-Intent only); the Segment card's End user part; the order of the purposes and outcomes.

### 5. Buyer & End User relationship

- **Control:** as question 1 (the audience limit).
- **Asked when:** the buyer's category is Proxy or Dual-Intent, for that relationship (a double rule stands above the end user's questions).
- **Options:** a consumer buyer: Parent or guardian; Caregiver; Family member; Spouse or partner; Friend or acquaintance; Commercial & Professional; Other. A business buyer: Employer; Business partner; Business serving clients; Professional intermediary; Sponsor or funder; Other. Only the relationships that can be the chosen category are offered (a friend can only be a Proxy, a spouse or partner only Dual-Intent), and one already chosen stays.
- **The "i" says:** How is the buyer related to the person who will use it? It shapes the message: a parent is reached by safety and trust, an employer by compliance and duty of care. The relationship suggests the category above; the buyer's own answer decides it.
- **Connections:**
  - *Comes from:* the buyer's category and the buyer's life stage (a Student or Young Adult buyer is not a Commercial & Professional buyer).
  - *Read by (built):* the end user's life stages offered (the owner's matrix); which relationship questions the Segment's End user part asks (school stage, work status, job level, or the clients' type and size); the order of the purposes and differentiations.

### 6. End User's Life-Stage (a consumer buyer)

- **Control:** as question 1.
- **Asked when:** B2C and a Proxy or Dual-Intent buyer, and more than one life stage fits. Where only one fits (a Parent of a Students / Young Adults buyer's dependent: Minors) it is set and the question is not drawn (owner, 2026-11-01).
- **Options:**
  - Minors
  - Young Adults
  - Adults
  - Seniors
- **The "i" says:** The life stage of the person who will use it. A broad group is enough to give the end user's Profile its first shape; the exact age comes later, on the Profile. Minors: under 18 (online services and some goods have extra rules that differ by country: see the minimum ages in the documentation). Young Adults: 18 to 24. Adults: 25 to 64. Seniors: 65 and over. The Segment's Description then asks the end user's stage within it (Baby, Child, Teenager, Established, Peak and so on).
- **Connections:**
  - *Comes from:* the relationship and the buyer's life stage (a stage the combination leaves blank is not offered).
  - *Read by (built):* the Segment's End user part (the terms offered); the order of the differentiations and outcomes.

## 2. The right column: what is offered

### 7. Purpose

- **Control:** ticks, up to the stage's limit (the purpose, differentiation and outcome limit), with "2 max" shown where it applies.
- **Asked when:** always.
- **Options:** the twelve purposes, ordered by relevance to the answers so far (the owner's tables, doc 31, 10.7): Learning & Development; Health, Care & Wellbeing; Gifting & Appreciation; Entertainment & Enjoyment; Social Connection & Relationships; Productivity & Efficiency; Business Growth & Performance; Creation & Expression; Everyday Needs & Convenience; Protection & Risk Reduction; Compliance & Obligations; Access & Social Support. The ones the tables call generally less directly relevant to the buyer are not offered; one already chosen stays.
- **The "i" says:** Why the offering is bought: the purpose it serves for the person who gets it. Choose the ones that fit best. Only the purposes that fit your answers above are offered: the primary ones first, then the possible ones.
- **Connections:**
  - *Comes from:* the relationship, the buyer's category, the buyer and end user relationship, the life stages and the audience scale (the order and the options).
  - *Read by (built):* the order of the differentiations and outcomes; the exports.
  - *Read by (not built yet):* the Value Proposition draft (doc 28, 6.7). No Offering question asks a purpose.

### 8. Differentiation (moved to the Business System, owner, 2026-11-08)

**Moved.** The owner decided (2026-11-08, "Move all three") that questions 8, 9 and 10 leave this tile and are answered on the Business System's Foundation cards. **Why:** a differentiation is set against the alternatives the customer would otherwise choose, so it is answered after the competitors are known, not before them (Dunford, *Obviously Awesome*, 2019: the competitive alternatives come first, the unique attributes and the value they enable follow from them).

- **Where it is now:** once for each Segment, in its Competitors column after the Competitor cards, under the heading Insights & Differentiation: code K14 (doc 41), saved on the Segment (`questions.differentiation`). Its options, its "i" (one line changed: the result is asked on each Offering, not "next") and its order (doc 31, the owner's tables, `differentiationOptionsFor`) are as built here; the stage sets its limit as before.
- **The saved answer:** `organisation.differentiation` stays readable; it is the starting value of every Segment's K14 until that Segment saves its own, which then wins (even cleared). It no longer shows on this tile, in the tile's lines or in the Review's open item of this tile.

### 9. Outcome for the buyer (moved to the Offering, owner, 2026-11-08)

- **Where it is now:** the Offering's O4 ("What does it do best for the customer?") is its one owner (doc 43); no question asks it twice. Each of its four options already has its value in O4's list through the crosswalk (doc 34, 5.2a: Lower costs → Affordability; Time saved → Speed, Convenience; Legal & data-protection cover → Safety / security, Reputation; Higher quality & prestige → Quality, Values), so O4 needed no new option.
- **The saved answer:** `organisation.outcome` stays readable; it starts O4's ticks after the Differentiation's (up to three), until the Offering saves its own.

### 10. Outcome for the end user (moved to the Segment, owner, 2026-11-08)

- **Where it is now:** the Segment's End user part, End user, 9 (doc 35), asked only where the Segment has an end user (its own buyer is Proxy or Dual-Intent); its options, its "i" and its order (the purposes, then the life stages) as built here; the stage sets its limit. Phase 4b moves it into the end user's own Profile (doc 36) when that is built.
- **The saved answer:** `organisation.outcomeUser` stays readable; it is the starting value of each Segment's End user, 9 where that Segment has an end user, until the Segment saves its own.

## 3. Under both columns

### 11. Notes

- **Control:** the shared optional note (a tick and the word), the positioning statement in the App User's own words.
- **Asked when:** always (optional).
- **The "i":** the Notes have none; the guidance on the positioning statement (for whom, what, unlike whom, why) is on the "i" of the dialog's title.
- **Connections:**
  - *Read by (built):* the Business Plan's positioning section (headed Early Positioning Statement, Core Market Positioning or Corporate & Portfolio Positioning by the stage) and the exports; the Segment card shows it behind the "i" of the first instruction.
