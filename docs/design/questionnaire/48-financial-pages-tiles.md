# 48. The Financial pages and the Inventory: tiles and two questions, as proposed

Status: **specification**, written 2026-11-12, updated 2026-11-20. Built in part. The owner approved it on 2026-11-12 (D12, D13, D14, D15). **One page, Financials (2026-11-19; the owner's approved plan of 2026-11-18, step 1)**: Revenue & Pricing (Section 4) and Costs, Funding & Position (Section 5) are drawn as one page, "Financials" (`PageGroups.ts`), drawn since 2026-11-20 as ONE chapter, **Financial Foundation**, of five Master Tiles in two groups, four and one: Revenue Streams, Costs, Funding, Cash Flow | Break-Even & Sustainability (`oneChapter`; `joinedChapter.ts`; built 2026-11-20, doc 48, section 13). Each section keeps its number, its title and its saved answer; nothing moved (section 11). **Built 2026-11-17** (owner, 2026-11-17 07:36: "Rearrange the financial parts (Financial Foundation and Sustainability) according to the documents"): section 11's order -- Revenue & Pricing Page 4, Costs, Funding & Position Page 5, their answers moved once (`swapFinancialPages`), the keys inside them unchanged --; section 1's four Master Tiles of Financial Foundation (as first built on 2026-11-12, then parked); section 2's tiles as Revenue (Revenue Streams, Delivery Check, Revenue Summary) on Page 4 and Break Even (Break-Even Point, Break-Even Time, Sustainability, Stress Test) beside Financial Position on Page 5, each tile opening the blocks it held. Layout only. **Next in phase 7a:** the Offering Economics card (section 3), RV1 (section 4), O19 and K15 as a record (section 12), the fee on a VAT-inclusive price (section 11), FN1, the dialogs' nested sub tiles and the Cash Timeline as a Diagram tile. They are built in phase 7, the financials, the last phase of the order of work (doc 49, section 8; owner, 2026-11-12 15:18), with IN1 to IN4; IN5 comes with phase 6 (Initiatives and Activities).

Related: doc 40 (the form), the page 4 and page 5 specifications (`specifications/business-system/`), doc 5 (5.3, I7, I9, K1), `ai/layout-rules.md` (section 12, the Inventory), doc 47 (the Offering's four faces), doc 49 (Strategy reads these figures).

## 1. Financial Foundation: the costs, the funding and the position

| Master Tile | Its face lists | Dialog: nested sub tiles | Cards |
|---|---|---|---|
| **Costs** | Launch budget, running costs a month, cost of each sale | Launch: before the opening; Running costs: every month; Cost of each sale; One-time costs after the opening; Not counted yet (shown while it holds a line) | each sub tile opens **the Inventory's table** filtered to its heading (section 6); a line opens its card |
| **Funding Need** | Establishment, Operating, Offering with amounts | Establishment (Pre-operational Budget, Startup Contingency, Cash to raise), Operating (Operational Contingency Fund), Offering | read-only cards |
| **Capital & Funding** | the sources by status | Internal (Founder's Capital), External (Non-repayable, Equity, Debt), Other | one card per source (3 a row, "+ Add card"); a loan's card holds its schedule |
| **Financial Position** | the headline (the gap, or Covered with the runway) | six figure tiles, Funding Mix, Upcoming Obligations, Decision Signals; **Cash Timeline** as a Diagram tile | none |

The plan's dates stay in the page title; VAT and the plan settings sit in the Costs dialog's head. A page of one chapter stands at the left at half width, so its tiles are the size of every chapter's.

**As built (2026-11-20, section 11):** Financials is one chapter, Financial Foundation, of six Master Tiles. Section 5 hands it three of them, after Revenue Streams: Costs, Capital & Funding and Financial Position, the Funding Need inside Financial Position (owner, 2026-11-18 16:55). The title says "3. Financials" and the plan's months.

## 2. Revenue and Break Even: the Master Tiles

| Chapter | Master Tiles | Nested |
|---|---|---|
| **Revenue** | Revenue Streams (one card per Offering); Offering Economics (section 3); Delivery Check (per Offering); Revenue Summary | the stream card's Revenue Timeline as a Diagram tile |
| **Break Even** | Break-Even Point; Break-Even Time (Diagram tile); Sustainability (status, buffer, summary, signals); Stress Test (the four worse cases and What It Would Take) | none |

**As built (2026-11-20, section 11):** Section 4's editor draws Financials' one chapter, Financial Foundation, with three Master Tiles of its own: Revenue Streams first (its dialog holds the Delivery Check and the Revenue Summary; owner, 2026-11-18 10:38), then, after Section 5's three, Break-Even (the Point and the Time) and Sustainability (with the Stress Test; owner, 2026-11-18 16:55). The tiles keep their ids, so a note or a link saved on one still lands.

## 3. The Offering Economics card (read-only)

One floating card per Offering that joins its four faces. It owns nothing; every figure is a link to its owner.

- **Where:** a Master Tile of Financials' one chapter, Financial Foundation, beside Revenue Streams (section 2), one card tile per Offering; also reached from the Offering's card on Page 1 by a link "See its economics".
- **Bands, each shown once its figures exist:**
  1. **Demand:** expected sales a month, Customers Buy, Cancel / Month.
  2. **Delivery:** hours per unit or client, hours needed a month, the share of delivery capacity.
  3. **Price:** the price, how it is charged, the payment timing, RV1's basis.
  4. **Cost:** the variable cost per unit, the fixed costs linked to it a month.
  5. **Result:** margin per unit, contribution a month, its own break-even volume.
  With no price yet, the Price and Result bands read "Set a price on Revenue Streams to see the margin."
- **Signals:** "Expected sales need more delivery hours than the founders have"; "The price sits below the cost of each sale"; "Expected sales are above the Segment's market size band".
- **Needs:** the Inventory's Offering column and filter (section 6).

## 4. Two questions

The tax in a price needs no question: Financial Foundation's VAT basis (Excluding VAT, Including VAT, Not VAT registered) already covers every amount on both Financial pages.

### RV1 (Financials, Revenue Streams: a stream's card, the band under the Price)

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

### FN1 (Financials, Capital & Funding dialog head)

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

New prefixes **RV** (revenue) and **FN** (funding). RV1 and FN1 enter the register (doc 44) when built (section 12). **RV2 is withdrawn** (2026-11-12, before registration): the tax in a price is answered once for both Financial pages by Financial Foundation's VAT basis (`VAT_BASES`, `src/framework/engine/financial/stored.ts`); never reused.

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
- **Revenue Streams, one tile** (owner, 2026-11-18 16:55, proposal 5): Revenue & Pricing's part of Financials is one tile, Revenue Streams, the first of the one chapter's six Master Tiles (section 11); phase 7a's Offering Economics card (section 3) joins it as a tile beside it. All six are master tiles (the owner's rule: master tiles never change their size or layout).
- **The Delivery Check, its verdict** (owner, 2026-11-18 16:55, proposal 3): in the Revenue Streams dialog the Delivery Check says whether the expected sales fit the founders' capacity, its busiest month, and who delivers outside it, with a link to Capacity & Delivery on Infrastructure & Capability, where the founders' table is (one owner: doc 52, section 4).
- **The Revenue Summary without its Price** (owner, 2026-11-18 16:55, proposal 6): Revenue Stream, Expected Volume, Expected Revenue, Share; each stream's tile says its price.
- **The Costs tile says the share of revenue** (owner, 2026-11-18 16:55, proposal 7): each cost counted with revenue named with its share ("Shopify Payments 2%", "SumUp in-person card fees 1.69%"; one alone, "Share of revenue 2%"); never added up, as each is paid on its own part of the revenue. The Costs total says the same: "£2,589 + 2% (Shopify Payments) · 1.69% (SumUp in-person card fees)".
- **Founders' Capital as a tile** (owner, 2026-11-18 16:55, proposal 8): in Capital & Funding's Internal category the founders' capital is the first tile, as the sources beside it (its total and each founder's); its card floats as theirs do, read only -- each founder's capital and the total under one band --, with the way to the Legal Entity's Founders & Ownership, where it is answered.
- **The tiles next to each other** (owner, 2026-11-18 10:38: "The chapter tiles should be next to each other"): Financials' six tiles stand together in one frame, the one chapter Financial Foundation (2026-11-20, section 11).
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

Recorded 2026-11-12 (owner, 15:37; doc 49, section 8, phase 7). The Financial sections stand in this order: **Revenue & Pricing first, then Costs, Funding & Position**, so each reads only what stands before it: the Funding Need reads its revenue from Revenue & Pricing.

| Page | Holds | Reads |
|---|---|---|
| **4. Revenue & Pricing** | the Revenue Streams with the price and RV1; the Offering Economics card (section 3); the pricing questions' ranges (section 12) | pages 1 to 3: value and competitors, Expected Sales, the cost of each sale (`offeringCosts`) |
| **5. Costs, Funding & Position** | Costs (section 1), Funding Need (net of revenue), Capital & Funding with FN1, Financial Position; **Break-even and the Stress Test beside Financial Position** | pages 1 to 4 |

- The saved keys stay as they are, as with the Purpose chapter (doc 45): only where the sections stand changes.
- The Offering Economics card stands on the Revenue & Pricing page.
- Break-even stands beside Financial Position: it needs the margin per unit (page 4) and the fixed costs (page 5).
- Status: built 2026-11-17 (owner, 2026-11-17 07:36: "Rearrange the financial parts (Financial Foundation and Sustainability) according to the documents"), layout only: the pages' order and their chapters; Funding Need reads the revenue of the page before it.
- **One page, Financials** (built 2026-11-19; the owner's approved plan of 2026-11-18, step 1): the two sections are one page of the pages rail, "3. Financials" (`PageGroups.ts`, as Identity's Definition & Purpose), drawn as one chapter (the next point). The sections keep their numbers, titles and saved answers, and the order of reading above: no data moved, no migration; `swapFinancialPages` and `retireLegacyBusinessPages` are as they were. A note, a link or a Glossary place on either section opens Financials; the title keeps the plan's months (section 1). Break-Even reads both sections.
- **One chapter** (built 2026-11-20; owner, 02:11 UTC+2: "The financials should be in a single page. Maybe they should all be under only one chapter."): rule | was | now: each part reads only what stands before it | Revenue & Break Even (Revenue Streams, Break-Even, Sustainability) before Financial Foundation (Costs, Capital & Funding, Financial Position), so Break-Even and Sustainability read the chapter after them | one chapter, Financial Foundation (this document's own name for it, section 1; the page's title, Financials, is not repeated): Revenue Streams, Costs, Capital & Funding, Financial Position, Break-Even, Sustainability. Ids, saved keys and dialogs unchanged. **Five Master Tiles since 2026-11-20** (doc 48, section 13): Revenue Streams, Costs, Funding (Capital & Funding and Financial Position, one tile), Cash Flow | Break-Even & Sustainability (one tile), four and one, each reading only what stands before it; the merged tiles keep their ids and anchors, so a note or a link lands in them.
- **Waiting for Revenue & Pricing, the fee on a VAT-inclusive price** (owner, 2026-11-17 07:16: "Yes to all"; a calculation, named without a code: the code C1 is the founder's skill area, doc 28, section 9.3): the channel fees on a price that includes VAT (the fee is taken of the whole price the customer pays, VAT included), read where the price is set.
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

## 12.3 The Revenue card, 2026-11-20

Built (owner, 2026-11-20 12:49 UTC+2: "proceed to changes"): rule | was | now.

| Rule | Was | Now |
|---|---|---|
| The start-up rule: the competitors' range is shown, never compared with the price (section 12.2) | Last in the Price's "i" | A line under the price: "Your competitors charge about [From] to [To] for a similar offer."; out of the "i", one owner |
| A card's lists fold alike (layout rules section 21, `FoldList`) | Volume from Each Month always open | Folded under Sales Volume with its count; open while it holds no month |
| Affirmative voice; a note that names a fix offers it | "... customers buy this Offering every month, but it is charged once here ..." | "On Customer Engagement, customers buy this Offering every month. Charged monthly, its active clients count as clients each month." and the link "Charge it monthly" (or per sale), which sets Charged |

## 13. The Financials chapter: one proposal for the page (2026-11-20)

Asked by the owner (2026-11-19 21:44 UTC+2: review the financial master cards for a logical sequence; 2026-11-20 02:13: "Did you review the existing financial tiles, and their content? Did you do also an online research?"; 02:14: "Do not make a proposal for each tile, but for all the financial page/chapter."). Read field by field in the code and on the Lumen & Loom and Quillfield examples, and against four sources (below). **Built 2026-11-20** (owner, 12:49 UTC+2: "proceed to changes"): steps 1, 3, 4 and 5, and decisions (a), (b), (c) and (e); the Master Tiles stand four and one, the shape this section names first, and three and two stays the alternative for the owner. **In progress:** step 2 (the owner's minimum pay) and decision (d), the personal survival budget on the founder. Built before them: the one chapter and its order (section 11, "One chapter"), the Sustainability Buffer said in words, the Launch budget line only where there is one.

**Why.** A founder who has not sold anything yet needs four answers from this page, in this order: what the business could earn, what it costs to start and to run, how the money in covers the money out month by month, and when it pays for itself and how long the money lasts. The four sources run the same way: revenue, then costs, then break-even and funding, then a cash table (BU); revenue, start-up costs, variable, fixed, labour and owner pay, then financing, with a 3 to 6 months' cover of expenses (UW-Madison SBDC); a bottom-up budget padded by 10 to 20% and 18 to 24 months of runway (NYU); a 12-month cash flow forecast with the owner's minimum pay and loan repayments as expenses, and a personal survival budget (Start Up Loans). Today's page holds almost all of these, but spread across six tiles that repeat each other, with two standard parts missing and the month-by-month cash table only in the exported documents.

**The proposed chapter: five steps, each reading only what stands before it.**

1. **Revenue** (Revenue Streams; built 2026-11-20: "Not priced yet" on the face). One card per Offering: what it is charged per, the price, the expected sales and their build-up, when it begins and when the customer pays; the Delivery Check and the Revenue Summary as now. *Auto-filled*: the charge and the unit from the Offering's terms and form (O3, O1), when the customer pays from O3t (asked once: the stream shows it, never asks it again), the sales from Demand & Conversion, the hours from Capacity & Delivery. *For a founder with no price yet*: the card opens on the competitors' price range (K15) and the customers' expected range (O19) as the starting point, says "Not priced yet" on the face, and the rest of the chapter still shows the costs and the funding (each step says what it waits for).
2. **Costs** (Costs; the owner's minimum pay in progress). Unchanged in what it reads (Legal Entity expenses, Founders, Workspace, Resources, Partners and Suppliers, the Offerings' resources, the calculated lines); its face says the Launch budget, the Running costs a month and the Cost of each sale. *Add*: **the owner's minimum pay** as a line of its own where no founder salary is set (Start Up Loans: the owner's minimum pay is an expense; SBDC: owner pay by legal form), read from a **personal survival budget** (below).
3. **Funding** (Capital & Funding and Financial Position, MERGED into one tile, `financial-funding`; built 2026-11-20: its dialog reads Sources, Uses, then Financial Position). The money in (the founders' capital, read from Founders & Ownership, then each source) and what it is for, side by side: **Sources & Uses** (SBDC's exhibit; BU's amount required, use of funds and type of funds), which takes over the separate Funding Need band and the Linked Funding Need ticks. *Drop*: "Founder's Capital" as a type a founder can add (it is read from Founders & Ownership: one owner per fact). *Pad*: the contingency on the launch budget stays (Global Settings), and its range is said with NYU's 10 to 20%. The face: Funding Gap or Covered, and the Runway.
4. **Cash Flow** (NEW, from what is computed today; built 2026-11-20 in the shared `ForecastTable`). The first 12 months, month by month: money in (revenue, funding received), money out (costs, the owner's pay, loan repayments), net, and the closing balance (Start Up Loans' forecast; BU's cash table; SBDC's 3-year horizon on the documents). It takes over the two cash charts (Financial Position's Funding Timeline and Break-Even's Revenue-Adjusted Financial Position, one chart) and the Operating need's first-year table. The forecast already computes it for the documents (`FinancialForecast.ts`); the page shows it.
5. **Break-Even & Sustainability** (Break-Even and Sustainability, MERGED into one tile, `sustainability-break-even-point`; built 2026-11-20). When it pays for itself (BU: fixed costs / (price - variable cost)) and how long the money lasts: the break-even revenue, the Expected Break Even, the Financial Exhaustion and the Buffer said in words, the Stress Test and What It Would Take. *Drop*: the five figures said twice in the Sustainability dialog (its table repeats its own tiles), and the third runway in Break-Even's "i" (the Runway is Funding's, one figure). *Read the 3 to 6 months of cover* (SBDC) as the Buffer's goal.

**The personal survival budget** (NEW; Start Up Loans; in progress). A short card on the Founders & Ownership founder (not on this page: it is the founder's, not the business's): the household's money in a month and its costs, giving the minimum the founder must take from the business. It feeds step 2's owner's minimum pay and step 5's question, "can the founder live until break-even?". Asked only where the founder takes no salary from the business.

**From six tiles to five** (built 2026-11-20): Revenue, Costs, Funding, Cash Flow, Break-Even & Sustainability. The Master Tiles keep their size: five in the two groups of the chapter, four and one, the order left to right; three and two stays the alternative for the owner.

**What stays as it is**: every saved answer and id (a merged tile holds the two tiles' ids, so a note or a link still lands); the documents' forecast; the Global Settings rates.

**Decided** (owner, 2026-11-20 12:49 UTC+2: "proceed to changes"; (a), (b), (c) and (e) built, (d) in progress): (a) the five steps and their order; (b) merging Capital & Funding with Financial Position, and Break-Even with Sustainability; (c) adding the Cash Flow tile; (d) the personal survival budget and the owner's minimum pay; (e) "Not priced yet" with the price ranges as the start.

**Sources** (each read in full on 2026-11-20):
- Rana K. Gupta, *Building a Financial Plan: The Numbers* (slides), Boston University, 2020: the income statement, fixed costs, break-even "Fixed costs / (Price per unit - Variable cost per unit)", the cash table, then milestones, amount required, use of funds, type of funds.
- UW-Madison Small Business Development Center (Wisconsin School of Business), *Beginner's Guide to Financial Projections Workbook*, 2023: revenue, start-up costs, variable and fixed costs, labour and owner pay; working capital "3-6 months of expense coverage"; the Sources and Uses of Funds exhibit.
- Frank Rimalovski, *The Runway Equation: How Much to Raise and When to Spend It*, NYU Entrepreneurship, 22 Nov 2025: a bottom-up budget padded by 10 to 20%, 18 to 24 months of runway, founders' survival pay, revenue as the best non-dilutive capital.
- Start Up Loans (the UK government-backed programme, British Business Bank): the business plan, the cash flow forecast template (12 months; money in minus money out; the owner's minimum salary and loan repayments as expenses) and the personal survival budget template (read 2026-11-20 by the cloud session; startuploans.co.uk refuses automated reading from this computer).
