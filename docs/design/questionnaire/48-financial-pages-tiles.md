# 48. The Financial pages and the Inventory: tiles and two questions, as proposed

Status: **specification**, written 2026-11-12, updated 2026-11-20. Built in part. The owner approved it on 2026-11-12 (D12, D13, D14, D15). **One page, Financials (2026-11-19; the owner's approved plan of 2026-11-18, step 1)**: Revenue & Pricing (Section 4) and Costs, Funding & Position (Section 5) are drawn as one page, "Financials" (`PageGroups.ts`), its two chapters side by side: **Revenue & Break Even** (Revenue Streams, Break-Even, Sustainability) and **Financial Foundation** (Costs, Capital & Funding, Financial Position). Each section keeps its number, its title and its saved answer; nothing moved (section 11). **Built 2026-11-17** (owner, 2026-11-17 07:36: "Rearrange the financial parts (Financial Foundation and Sustainability) according to the documents"): section 11's order -- Revenue & Pricing Page 4, Costs, Funding & Position Page 5, their answers moved once (`swapFinancialPages`), the keys inside them unchanged --; section 1's four Master Tiles of Financial Foundation (as first built on 2026-11-12, then parked); section 2's tiles as Revenue (Revenue Streams, Delivery Check, Revenue Summary) on Page 4 and Break Even (Break-Even Point, Break-Even Time, Sustainability, Stress Test) beside Financial Position on Page 5, each tile opening the blocks it held. Layout only. **Next in phase 7a:** the Offering Economics card (section 3), RV1 (section 4), O19, K15 as a record and C1 (section 12), FN1, the dialogs' nested sub tiles and the Cash Timeline as a Diagram tile. The build waits for phase 7, the financials, the last phase of the order of work (doc 49, section 8; owner, 2026-11-12 15:18): the tiles, RV1, FN1, IN1 to IN4 and the Offering Economics card are built there; IN5 with phase 6 (Initiatives and Activities). Nothing here is built yet.

Related: doc 40 (the form), the page 4 and page 5 specifications (`specifications/business-system/`), doc 5 (5.3, I7, I9, K1), `ai/layout-rules.md` (section 12, the Inventory), doc 47 (the Offering's four faces), doc 49 (Strategy reads these figures).

## 1. Financial Foundation: one chapter, four Master Tiles

| Master Tile | Its face lists | Dialog: nested sub tiles | Cards |
|---|---|---|---|
| **Costs** | Launch budget, running costs a month, cost of each sale | Launch: before the opening; Running costs: every month; Cost of each sale; One-time costs after the opening; Not counted yet (shown while it holds a line) | each sub tile opens **the Inventory's table** filtered to its heading (section 6); a line opens its card |
| **Funding Need** | Establishment, Operating, Offering with amounts | Establishment (Pre-operational Budget, Startup Contingency, Cash to raise), Operating (Operational Contingency Fund), Offering | read-only cards |
| **Capital & Funding** | the sources by status | Internal (Founder's Capital), External (Non-repayable, Equity, Debt), Other | one card per source (3 a row, "+ Add card"); a loan's card holds its schedule |
| **Financial Position** | the headline (the gap, or Covered with the runway) | six figure tiles, Funding Mix, Upcoming Obligations, Decision Signals; **Cash Timeline** as a Diagram tile | none |

The plan's dates stay in the page title; VAT and the plan settings sit in the Costs dialog's head. A page of one chapter stands at the left at half width, so its tiles are the size of every chapter's.

**As built (2026-11-19):** Financial Foundation is three Master Tiles (Costs, Capital & Funding, Financial Position, the Funding Need inside Financial Position; owner, 2026-11-18 16:55), the second chapter of Financials, beside Revenue & Break Even (section 11). The title says "4. Financials" and the plan's months.

## 2. Sustainability: two chapters of four Master Tiles

| Chapter | Master Tiles | Nested |
|---|---|---|
| **Revenue** | Revenue Streams (one card per Offering); Offering Economics (section 3); Delivery Check (per Offering); Revenue Summary | the stream card's Revenue Timeline as a Diagram tile |
| **Break Even** | Break-Even Point; Break-Even Time (Diagram tile); Sustainability (status, buffer, summary, signals); Stress Test (the four worse cases and What It Would Take) | none |

**As built (2026-11-19):** one chapter, **Revenue & Break Even**, the first of Financials (section 11), of three Master Tiles: Revenue Streams (its dialog holds the Delivery Check and the Revenue Summary; owner, 2026-11-18 10:38), Break-Even (the Point and the Time) and Sustainability (with the Stress Test; owner, 2026-11-18 16:55). The tiles keep their ids, so a note or a link saved on one still lands.

## 3. The Offering Economics card (read-only)

One floating card per Offering that joins its four faces. It owns nothing; every figure is a link to its owner.

- **Where:** a Master Tile in Sustainability's Revenue chapter (section 2), one card tile per Offering; also reached from the Offering's card on Page 1 by a link "See its economics".
- **Bands, each shown once its figures exist:**
  1. **Demand:** expected sales a month, Customers Buy, Cancel / Month.
  2. **Delivery:** hours per unit or client, hours needed a month, the share of delivery capacity.
  3. **Price:** the price, how it is charged, the payment timing, RV1's basis.
  4. **Cost:** the variable cost per unit, the fixed costs linked to it a month.
  5. **Result:** margin per unit, contribution a month, its own break-even volume.
  With no price yet, the Price and Result bands read "Set a price on Sustainability to see the margin."
- **Signals:** "Expected sales need more delivery hours than the founders have"; "The price sits below the cost of each sale"; "Expected sales are above the Segment's market size band".
- **Needs:** the Inventory's Offering column and filter (section 6).

## 4. Two questions

The tax in a price needs no question: Financial Foundation's VAT basis (Excluding VAT, Including VAT, Not VAT registered) already covers every amount on both Financial pages.

### RV1 (Sustainability, Revenue stream card, the band under the Price)

- **Label:** How did you set this price?
- **Control:** one choice.
- **Asked when:** a price is entered.
- **Options**, each with its own "i" and its plan phrase:

  | id | Label | Its "i" | Plan phrase |
  |---|---|---|---|
  | `cost-plus` | My costs plus a margin | Your cost of each sale, on Financial Foundation, with a margin added. | its costs plus a margin |
  | `market` | The prices of similar offers | What customers pay today for something close to it. | the prices of similar offers |
  | `value` | What it is worth to my customers | The value of what it does for them. | its worth to customers |
  | `launch` | A launch price to win first customers | A lower opening price, raised once customers know you. | a launch price to win first customers |

- **"i":**
  - The method behind this price. It shows on your Offering's economics and in your Business Plan.
  - Based on: a source still to open (section 10). Nothing is cited until it is read.
- **Saved as:** `revenueStream.priceBasis`.
- **Read by:**
  - The Offering Economics card.
  - The Business Plan's Products and Services: "Priced on [plan phrase]."
  - The Review: "[Offering]: a launch price; plan when it rises". It shows once `launch` is chosen and the Development field holds no rise.
- The SWOT Weakness "[Offering] is priced below its cost of each sale" reads the price and the cost only, whatever RV1 says.

### FN1 (Financial Foundation, Capital & Funding dialog head)

- **Label:** How much of the business would you offer investors?
- **Control:** one choice.
- **Asked when:** the Legal Entity's form can have shareholders. It is hidden for a form matching `NO_REGISTRY_FORM` (sole trader, self-employed, freelance; `AnswerLegal.ts`). It shows while no form is entered.
- **Options:**
  - `none` – None
  - `minority` – Less than half
  - `majority` – Half or more
- **"i":**
  - Investors buy a share of the business. Loans, grants and your own capital leave it all with you.
  - Your answer orders the funding types when you add a card.
  - Based on: SBA, *Write your business plan* (Funding request).
- **Saved as:** `financialFoundation.equityLimit`.
- **Read by:**
  - The "+ Add card" order. With `none`, Non-repayable and Debt come first.
  - Strategy's "Apply for [source]" suggestions, in the same order.
  - The Review: "Equity cards give [n]% of the business, above your limit". It shows when the Equity cards' shares add up to more than the answer allows: above 0% for `none`, 50% or more for `minority`.
  - The Business Plan's Funding Request.

## 5. The Review

- "[Offering]: priced below its cost of each sale", whatever RV1 says.
- "[Offering]: a launch price; plan when it rises" (RV1, above).
- "Equity cards give [n]% of the business, above your limit" (FN1, above).

## 6. The Inventory

### 6.1 What it is

A page-wide help tile on Page 3 (footer band; layout rules, section 12; page 3 spec, section 8). It lists every Resource, Activity, Partner, Supplier, the Founders and the Legal Entity's expenses, as tiles or a table (Name, Type, Section, Category, Group, Cost, Frequency, Cost Nature, Behaviour, Status, Linked), with a funnel (Include, Sort, Belongs to, Status, Frequency, Linked, Costs, Columns), a legend for the four links and three text sizes. Cost Nature and Behaviour follow the Financial Foundation's rules (`InventoryClassification.ts`).

### 6.2 Decided

- **The funnel's blocks start folded** (Thanos, 2026-11-12 13:44). The code does this (`CapabilityOverview.tsx`); the layout rules, section 12, say "open by default" and were corrected on 2026-11-12 (PR #32).

### 6.3 Proposed

| # | Change | Why | With |
|---|---|---|---|
| IN1 | An **Offering** column (the Offerings with their shares) and an **Offering** block in the funnel | the Offering Economics card and the Metric "margin per unit" need each Offering's costs together; doc 5, I7 | phase 7 |
| IN2 | **Each currency's total** shown apart | a cost in another currency is listed and left out of every total; doc 5, I9 | phase 7 |
| IN3 | An optional column **"A month"** (the monthly equivalent Page 4 already works out), off by default in Columns | a monthly, a yearly and a per-project cost compare at a glance | phase 7 |
| IN4 | **The Financial Costs tile opens this table** filtered to its heading | one register of costs, two ways in: one owner, one component | phase 7 |
| IN5 | The Linked column gains an **Objective** circle | once an Initiative links to an Activity (phase 6), the Inventory shows which work serves a Strategy Objective | phase 6 |

## 7. Codes

New prefixes **RV** (revenue) and **FN** (funding). RV1 and FN1 enter the register when built. **RV2 is withdrawn** (2026-11-12, before registration): the tax in a price is answered once for both Financial pages by Financial Foundation's VAT basis (`VAT_BASES`, `src/framework/engine/financial/stored.ts`); never reused.

## 8. Decided

| # | Decision | Approved (owner, 2026-11-12 14:10) |
|---|---|---|
| D12 | Price questions | RV1 only, four options; RV2 withdrawn |
| D13 | FN1 | Three options, the Review check, hidden for sole traders |
| D14 | Inventory IN1 to IN4 | Yes; IN3 optional |
| D15 | Funnel blocks folded | Decided 13:44; Brief 1 fixes the documentation |

- **Fees follow where they pay** (owner, 2026-11-17 09:09 UTC+2, option (a): "Fees follow where they pay"): the forecast's Channel fees line charges an Offering's revenue a fee only where its customers pay: it is shared equally among the Purchase-stage subchannels of its Segment that serve it (an Online Store, a marketplace, a Studio / Shop, a market, a stockist or wholesale account), and the Discover subchannels take none. A marketplace takes the money and its own fee only. The part paid on the founder's own subchannels that no fee of their own covers goes through the Segment's payment services (Direct Payment), equally; with no paying subchannel, the payment services share it all (`offeringPayingRevenue`). A commission -- a cost held by referral and affiliate subchannels only, a sales agent's or an affiliate's -- is still charged on the revenue of the Customer Sources that name it (`offeringChannelRevenue`). Revenue, volumes and revenue lines do not move; only the fee and commission lines do. The Inventory's Cost per Offering reads the same split, and its "i" says so. Lumen & Loom: Shopify Payments falls on the Online Store's half of the Homeware Collection's and the Weaving Workshops' revenue, SumUp's card fees on the market's half (no Customer Source named the Card, so they had fallen on the whole); its channel fees £185.55 to £107.02 a month, its break-even revenue £11,339 to £11,204. The rule in full: doc 47, section 5.

- **Revenue in one card, its streams as tiles** (owner, 2026-11-18 10:38: "Revenue streams should be tiles. Place the Revenue Summary and Delivery Check in the same card as the Revenue Stream Tiles"): the Revenue chapter is one tile, Revenue Streams; its dialog holds a tile for each stream (the dialog's card list, three in a row: its price and how it is charged), then the Delivery Check and the Revenue Summary, each under its band. A stream's card floats from its tile, one side-label row a field, its groups the shared boxes of bands, as a Customer Engagement card (owner, same message: "fix the style of the dialogue and the floated cards to fit the other"): Price, Sales Volume, Begins and Payment, Orders & Delivery where the Offering has a cost per order, then Results with the Assumptions (`EngagementBox`). Its label column is as wide as its longest label and "i" (10.5 times the body size: owner, 2026-11-18 12:41, "Fix the layout of the Revenue Streams floating cards"), the rest to the answers, so a picker shows its whole option; "from Demand & Conversion" is read in full, on two lines where it needs them.
- **The funding sources as tiles** (owner, 2026-11-18 12:41: "At the Capital & Funding, make the Funding Sources into tiles"): in the Capital & Funding dialog each category -- Internal, External, Other -- lists its sources as tiles (the dialog's card list, three in a row: its type, amount and status), the Add tile after them; the Founders' Capital stays as its summary. A source's card floats from its tile in three boxes of the shared bands -- Source & Amount ("&" in headings, owner 2026-10-29/30, 2026-11-19 00:24), When It Arrives (a loan: Loan Terms), What It Is For --, each field under its label (the card's own rows: a funding type, a lender's name and a loan's terms are longer than a side column holds), its dropdowns as wide as their longest option.
- **Break Even in two tiles** (owner, 2026-11-18 16:55: "Do all 8", the review's proposals 1 and 2): **Break-Even** -- the Break-Even Point and the Break-Even Time, which read the same costs and margins; its face the break-even revenue and the expected month; its dialog each block under its band -- and **Sustainability** -- the Sustainability and the Stress Test, which both say when the money could run out; its face the status, the Financial Exhaustion, the Sustainability Buffer and the Worst shortfall, the Stress Test's hardest case (the "as planned" shortfall is the Sustainability's own, said once). Its tile ids are the first block's (`point`, `sustainability`); nothing saved names the tiles.
- **Funding Need inside Financial Position** (owner, 2026-11-18 16:55, proposal 4): Financial Foundation has three tiles -- Costs, Capital & Funding, Financial Position --; Financial Position's dialog opens on its headline and figures, then the Funding Need's blocks under their band (Establishment, Operating, Offering, the cash to raise before the opening, the Operational Contingency Fund, the total). Its face adds the Total Funding Need. `FINANCIAL_FOUNDATION_SECTIONS` and its empty checks lose the Funding Need (it asked nothing: calculated from the costs); the Business Plan and the exports keep their own Funding Need heading.
- **Page 4, one tile** (owner, 2026-11-18 16:55, proposal 5): Revenue & Pricing stays its own page (section 11's order); its chapter holds Revenue Streams alone until phase 7a's Offering Economics card (section 3) joins it as its second tile. Its tile is a master tile at the size of four (the 2 x 2's side), centred in its chapter as every chapter of one large tile; Financial Foundation's three tiles and Break Even's two are master tiles too, filling three places and the top row of the 2 x 2 (the owner's rule: master tiles never change their size or layout).
- **The Delivery Check, its verdict** (owner, 2026-11-18 16:55, proposal 3): in the Revenue Streams dialog the Delivery Check says whether the expected sales fit the founders' capacity, its busiest month, and who delivers outside it, with a link to Capacity & Delivery on Infrastructure & Capability, where the founders' table is (one owner: doc 52, section 4).
- **The Revenue Summary without its Price** (owner, 2026-11-18 16:55, proposal 6): Revenue Stream, Expected Volume, Expected Revenue, Share; each stream's tile says its price.
- **The Costs tile says the share of revenue** (owner, 2026-11-18 16:55, proposal 7): each cost counted with revenue named with its share ("Shopify Payments 2%", "SumUp in-person card fees 1.69%"; one alone, "Share of revenue 2%"), in place of how many there are; never added up, as each is paid on its own part of the revenue. The Costs total says the same: "£2,589 + 2% (Shopify Payments) · 1.69% (SumUp in-person card fees)".
- **Founders' Capital as a tile** (owner, 2026-11-18 16:55, proposal 8): in Capital & Funding's Internal category the founders' capital is the first tile, as the sources beside it (its total and each founder's); its card floats as theirs do, read only -- each founder's capital and the total under one band --, with the way to the Legal Entity's Founders & Ownership, where it is answered.
- **The two chapters of Costs, Funding & Position side by side** (owner, 2026-11-18 10:38: "The chapter tiles should be next to each other"): Financial Foundation and Break Even each one column of the page, top-aligned (`.column-tiles-pair`).
- **The financial cards reviewed** (owner, 2026-11-18 10:38): both pages' titles show the plan's period as the pages work it out, from the Opening Date and the earliest dated cost (Revenue & Pricing had shown a start saved before); the Sustainability tile says the status, when the money runs out and the buffer; the Stress Test tile says the plan as planned and in the hardest case; Costs says the cost of each sale and, on its own line, how many costs are a share of revenue ("% of Rev" retired from the words: "2% of revenue", "2 shares of revenue").

## 9. Phrases for the Business Plan

| Answer | Option → phrase |
|---|---|
| RV1 (plan) | cost-plus → its costs plus a margin; market → the prices of similar offers; value → its worth to customers; launch → a launch price to win first customers |
| FN1 (Funding Request) | none → "The founders keep the whole business; the funding comes from their own capital, loans and grants."; minority → "The founders would offer investors less than half of the business."; majority → "The founders would offer investors half or more of the business." |

## 10. Sources

- U.S. Small Business Administration (no date) *Write your business plan*. Available at: https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan (Accessed: 12 November 2026). Opened in part (FN1: the funding request says whether debt or equity).
- A source on pricing methods for RV1 is still to find and open; RV1's "i" cites nothing until then.

## 11. The order of the Financial pages

Recorded 2026-11-12 (owner, 15:37; doc 49, section 8, phase 7). Pages 4 and 5 change places in content: **Revenue & Pricing first, then Costs, Funding & Position**, so each page reads only the pages before it. Today Funding Need (page 4) reads revenue from Sustainability (page 5); in this order it reads it from the page before.

| Page | Holds | Reads |
|---|---|---|
| **4. Revenue & Pricing** | the Revenue Streams with the price and RV1; the Offering Economics card (section 3); the pricing questions' ranges (section 12) | pages 1 to 3: value and competitors, Expected Sales, the cost of each sale (`offeringCosts`) |
| **5. Costs, Funding & Position** | Costs (section 1), Funding Need (net of revenue), Capital & Funding with FN1, Financial Position; **Break-even and the Stress Test beside Financial Position** | pages 1 to 4 |

- The saved keys stay as they are, as with the Purpose chapter (doc 45): only where the sections stand changes.
- The Offering Economics card stands on the Revenue & Pricing page.
- Break-even stands beside Financial Position: it needs the margin per unit (page 4) and the fixed costs (page 5).
- Status: built 2026-11-17 (owner, 2026-11-17 07:36: "Rearrange the financial parts (Financial Foundation and Sustainability) according to the documents"), layout only: the pages' order and their chapters; Funding Need reads the revenue of the page before it.
- **One page, Financials** (built 2026-11-19; the owner's approved plan of 2026-11-18, step 1): the two sections are one page of the pages rail, "4. Financials" (`PageGroups.ts`, as Identity's Definition & Purpose), its chapters side by side in this order, numbered as every joined page's frames (layout rules section 13; owner, 2026-11-19): **1. Revenue & Break Even** (Section 4's editor: Revenue Streams, Break-Even, Sustainability) and **2. Financial Foundation** (Section 5's editor: Costs, Capital & Funding, Financial Position). The sections keep their numbers, titles and saved answers, and the order of reading above: no data moved, no migration; `swapFinancialPages` and `retireLegacyBusinessPages` are as they were. A note, a link or a Glossary place on either section opens Financials; the title keeps the plan's months (section 1). Break-even now stands in the first chapter, across from Financial Foundation; it still reads both sections.
- **Waiting for Revenue & Pricing, C1** (owner, 2026-11-17 07:16: "Yes to all"): the channel fees on a price that includes VAT (the fee is taken of the whole price the customer pays, VAT included), read where the price is set.
- **Waiting for Revenue & Pricing** (owner, 2026-11-17; the open decisions and gaps, Group 4d): O14's job there (doc 43): Packages / tiers, a price row per tier on the Offering's revenue stream; Add-ons / extras, an add-on stream beside it (Made to order already skips DV9, the batch's set-up, doc 52). And the seasons: the Profiles' D3 (Around seasons / holidays) and the Segment's "Sales, seasons or planned gifts" shape the monthly pattern of the expected sales (doc 50, 2.3), on the page that holds the months.

## 12. Pricing inputs

Status: **proposal**, written 2026-11-12; the wording is for the owner's approval. A price reflects three things: its cost, its customer and its competition (MIT OpenCourseWare 15.818 *Pricing*; Penn State Extension, *Choosing a pricing method*).

### 12.1 What the app holds today

| The three Cs | What the app has | Where |
|---|---|---|
| **Cost** | the cost of each sale and each Offering's monthly costs, by its shares | `offeringCosts` (`src/framework/engine/financial/offeringCosts.ts`), from the page 3 cards and the Legal Entity's expenses; available before page 4 is opened |
| **Customer** | how price-sensitive customers are: *Lower price* rated (B1), "It costs too much" (E2), "The price or their budget" (E3), *Save time / money* (E1); the household income (Box 1, 8, `income`); the organisation's size (Box 3, 2, `size`); who holds the budget (Box 4, 9, `authorise`); how they decide (Box 4, 6, `path`); how they pay (Box 4, 8, `pay`); the Offering's terms and timing (O3, O3b) | Segment and Profile (page 1), Offering (page 1) |
| **Competition** | a rating on Affordability where a Profile chose *Lower price* (K8); the opening "Offer lower prices" (K10); the Differentiation *Cost-driven* or *Status & Premium* (K14) | Competitor card (page 1) |

The app knows how much price matters and how customers pay; it holds no amount: no competitor's price and no price customers expect.

### 12.2 Two proposed questions

#### K15 (Competitor card, doc 41)

- **Built (owner, 2026-11-18 03:08 UTC+2: "Build K15 and P7 now"):** on the Competitor card (doc 41, K15); the price's "i" on Revenue & Pricing says the Segment's competitors' range, last (P7); nothing is written into the price. O19 stays proposed. From and To stand in one row, each half of it (owner, 2026-11-18 12:41).

- **Placed (owner, 2026-11-17 07:16: "Yes to all"):** asked on the Competitor card, since it describes the competitor; the Revenue & Pricing section shows it beside the price as a record.

- **Label:** What do they charge for a similar offer?
- **Control:** an amount range (From, To) in the organisation's currency, "per" taken from the Offering's O3 terms; and a tick "Not known yet".
- **"i":**
  - The price range customers see today. It helps you place your own price.
  - Based on: MIT OpenCourseWare 15.818 *Pricing*; Penn State Extension, *Choosing a pricing method*.
- **Judged on the competitor's own facts** (the start-up rule): never compared with the founder's own price.

#### O19 (Revenue & Pricing, beside the price; doc 43)

- **Placed (owner, 2026-11-17 07:16: "Yes to all"):** asked in the Revenue & Pricing section beside the price, no longer on the Offering card; its code O19 is kept.

- **Label:** What would your customers expect to pay?
- **Control:** an amount range (From, To) in the organisation's currency; and a tick "Not known yet".
- **"i":**
  - Your best estimate of what customers would pay for it. Asking a few of them gives the surest answer.
  - Based on: MIT OpenCourseWare 15.810, lecture 10, *Principles of Pricing* (Hauser, 2015); Penn State Extension, *Product pricing: what do I charge?*.

**RV1** stays as specified (section 4), asked in the Revenue & Pricing section beside the price (owner, 2026-11-17 07:16: "Yes to all").

**Read by:** the Offering Economics card (the price against both ranges); the Business Plan's Products and Services; the Review: "[Offering]: price above what customers expect", shown only when the price and O19's range both exist.

**Codes:** K15 and O19 are the next free codes of their cards (K11 to K13 are retired, never reused; doc 44). They enter the register when built.

**Sources** (each read in excerpt; opened in full before an "i" cites it): MIT OpenCourseWare 15.818 *Pricing* (Spring 2010), lecture 1; MIT OpenCourseWare 15.810 *Marketing Management*, lecture 10, *Principles of Pricing* (Hauser, Fall 2015); Penn State Extension, *Product pricing: what do I charge?* and *Choosing a pricing method*.

## 13. The Financials page's master tiles: review and proposal (2026-11-20)

Asked by the owner (2026-11-19 21:44 UTC+2): review the Financial page's master cards for a logical sequence. Read as drawn on the Lumen & Loom example at 1920 x 1100. Nothing below is built: each change moves a tile between chapters or changes what a tile says, so it waits for the owner.

**As it stands.** Chapter 1, Revenue & Break Even: Revenue Streams, Break-Even, Sustainability. Chapter 2, Financial Foundation: Costs, Capital & Funding, Financial Position. Inside each chapter the order runs as the money does.

| Rule | Now | Proposed |
|---|---|---|
| Each part reads only what stands before it (section 11, owner 2026-11-12 15:37) | Break-Even (chapter 1) reads the fixed costs, and Sustainability (chapter 1) reads the funding and the position, both from chapter 2 | **A.** Break-Even and Sustainability move to chapter 2, after Financial Position (section 11 as written: "Break-even and the Stress Test beside Financial Position"); chapter 1 becomes Revenue alone. **B.** The chapters change places: Financial Foundation first, then Revenue & Break Even, Sustainability last (the money in and out first, then what it earns and how long it lasts). **C.** As it stands, with each tile's "i" naming where its inputs come from |
| One sequence a founder can follow | Revenue, Break-Even, Sustainability, then Costs, Capital & Funding, Position | With A: Revenue; then Costs, Capital & Funding, Position, Break-Even, Sustainability. With B: Costs, Capital & Funding, Position, Revenue, Break-Even, Sustainability |
| Affirmative wording (feedback, the app's voice) | Sustainability Buffer "n/a" where the money runs out before break-even | "Runs out before break-even" (the buffer's sign said in words) |
| A line only where it says something (owner, 2026-11-19 22:48) | Costs shows "Launch budget £0" on a business with no launch costs | The Launch budget line only where there is one |

Recommended: **A**. It keeps the owner's chapter names and order, follows section 11 as decided, and leaves chapter 1 the revenue a founder sets first.
