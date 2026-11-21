# 48. The Financial pages and the Inventory: tiles and two questions, as proposed

Status: **specification**, written 2026-11-12, updated 2026-11-21. The page Financials: Revenue & Pricing (Section 4) and Costs, Funding & Position (Section 5) drawn as one chapter, **Financial Foundation** (`PageGroups.ts`, `oneChapter`, `joinedChapter.ts`), of three Master Tiles that ask, Revenue Streams, Costs and Funding (section 14, the one owner of the chapter's tiles), with the Offering Economics card, the questions RV1 and FN1, the Inventory's changes IN1 to IN5 and the owner's decisions D12 to D15. Each section keeps its number, its title and its saved answer (section 11). Built in part: the page, its order and its tiles (sections 1, 2, 11 and 14); still to build, in phase 7a: the Offering Economics card (section 3), RV1 (section 4), O19 and K15 as a record (section 12), the fee on a VAT-inclusive price (section 11), FN1, the dialogs' nested sub tiles and the Cash Timeline as a Diagram tile, with IN1 to IN4; IN5 comes with phase 6 (doc 49, section 8). The dates of each step are in the log.

Related: doc 40 (the form), the two Financials specifications (`specifications/business-system/page-3-*.md`), doc 5 (5.3, I7, I9, K1), `ai/layout-rules.md` (section 12, the Inventory), doc 47 (the Offering's four faces), doc 49 (Strategy reads these figures).

**Contents**

- [1. Financial Foundation: the costs, the funding and the position](#1-financial-foundation-the-costs-the-funding-and-the-position)
- [2. Revenue and Break Even: the Master Tiles](#2-revenue-and-break-even-the-master-tiles)
- [3. The Offering Economics card (read-only)](#3-the-offering-economics-card-read-only)
- [4. Two questions](#4-two-questions)
- [5. The Review](#5-the-review)
- [6. The Inventory](#6-the-inventory)
- [7. Codes](#7-codes)
- [8. Decided](#8-decided)
- [9. Phrases for the Business Plan](#9-phrases-for-the-business-plan)
- [10. Sources](#10-sources)
- [11. The order of the Financial pages](#11-the-order-of-the-financial-pages)
- [12. Pricing inputs](#12-pricing-inputs)
- [12.3 The Revenue card, 2026-11-20](#123-the-revenue-card-2026-11-20)
- [13. The Financials chapter: one proposal for the page (2026-11-20)](#13-the-financials-chapter-one-proposal-for-the-page-2026-11-20)
- [14. Inputs on the page, records in the Workbook (owner, 2026-11-20 18:35 UTC+2)](#14-inputs-on-the-page-records-in-the-workbook-owner-2026-11-20-1835-utc2)
- [15. Each Offering's sales, cost, price and margin (the round of 2026-11-21 00:56 UTC+2)](#15-each-offerings-sales-cost-price-and-margin-the-round-of-2026-11-21-0056-utc2)

## 1. Financial Foundation: the costs, the funding and the position

| Master Tile | Its face lists | Dialog: nested sub tiles | Cards |
|---|---|---|---|
| **Costs** | Launch budget, running costs a month, cost of each sale | Launch: before the opening; Running costs: every month; Cost of each sale; One-time costs after the opening; Not counted yet (shown while it holds a line) | each sub tile opens **the Inventory's table** filtered to its heading (section 6); a line opens its card |
| **Funding Need** | Establishment, Operating, Offering with amounts | Establishment (Pre-operational Budget, Startup Contingency, Cash to raise), Operating (Operational Contingency Fund), Offering | read-only cards |
| **Capital & Funding** | the sources by status | Internal (Founder's Capital), External (Non-repayable, Equity, Debt), Other | one card per source (3 a row, "+ Add card"); a loan's card holds its schedule |
| **Financial Position** | the headline (the gap, or Covered with the runway) | six figure tiles, Funding Mix, Upcoming Obligations, Decision Signals; **Cash Timeline** as a Diagram tile | none |

The plan's dates stay in the page title; VAT and the plan settings sit in the Costs dialog's head. A page of one chapter stands at the left at half width, so its tiles are the size of every chapter's.

**As built (2026-11-20, section 11; superseded by section 14):** Financials is one chapter, Financial Foundation, of six Master Tiles. Section 5 hands it three of them, after Revenue Streams: Costs, Capital & Funding and Financial Position, the Funding Need inside Financial Position (owner, 2026-11-18 16:55). The title says "3. Financials" and the plan's months.

## 2. Revenue and Break Even: the Master Tiles

| Chapter | Master Tiles | Nested |
|---|---|---|
| **Revenue** | Revenue Streams (one card per Offering); Offering Economics (section 3); Delivery Check (per Offering); Revenue Summary | the stream card's Revenue Timeline as a Diagram tile |
| **Break Even** | Break-Even Point; Break-Even Time (Diagram tile); Sustainability (status, buffer, summary, signals); Stress Test (the four worse cases and What It Would Take) | none |

**As built (2026-11-20, section 11; superseded by section 14):** Section 4's editor draws Financials' one chapter, Financial Foundation, with three Master Tiles of its own: Revenue Streams first (its dialog holds the Delivery Check and the Revenue Summary; owner, 2026-11-18 10:38), then, after Section 5's three, Break-Even (the Point and the Time) and Sustainability (with the Stress Test; owner, 2026-11-18 16:55). The tiles keep their ids, so a note or a link saved on one still lands.

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

A page-wide help tile on Infrastructure & Capability (footer band; layout rules, section 12; the Infrastructure & Capability specification, section 8). It lists every Resource, Activity, Partner, Supplier, the Founders and the Legal Entity's expenses, as tiles or a table (Name, Type, Section, Category, Group, Cost, Frequency, Cost Nature, Behaviour, Status, Linked), with a funnel (Include, Sort, Belongs to, Status, Frequency, Linked, Costs, Columns), a legend for the four links and three text sizes. Cost Nature and Behaviour follow the Financial Foundation's rules (`InventoryClassification.ts`).

### 6.2 Decided

- **The funnel's blocks start folded** (Thanos, 2026-11-12 13:44). The code does this (`CapabilityOverview.tsx`); the layout rules, section 12, say "open by default" and were corrected on 2026-11-12 (PR #32).

### 6.3 Proposed

| # | Change | Why | With |
|---|---|---|---|
| IN1 | An **Offering** column (the Offerings with their shares) and an **Offering** block in the funnel | the Offering Economics card and the Metric "margin per unit" need each Offering's costs together; doc 5, I7 | phase 7 |
| IN2 | **Each currency's total** shown apart | a cost in another currency is listed and left out of every total; doc 5, I9 | phase 7 |
| IN3 | An optional column **"A month"** (the monthly equivalent Costs, Funding & Position already works out), off by default in Columns | a monthly, a yearly and a per-project cost compare at a glance | phase 7 |
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

The decisions below are as built on 2026-11-17 and 2026-11-18; the chapter as it is now is section 14 (the Delivery Check, the Revenue Summary, the Uses and the Financial Position are records of the Workbook's Financial Documents, and Funding asks the Founders' Capital, External and Other).

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
- Break-even stands beside Financial Position: it needs the margin per unit (Revenue & Pricing) and the fixed costs (Costs, Funding & Position).
- Status: built 2026-11-17 (owner, 2026-11-17 07:36: "Rearrange the financial parts (Financial Foundation and Sustainability) according to the documents"), layout only: the pages' order and their chapters; Funding Need reads the revenue of the page before it.
- **One page, Financials** (built 2026-11-19; the owner's approved plan of 2026-11-18, step 1): the two sections are one page of the pages rail, "3. Financials" (`PageGroups.ts`, as Identity's Definition & Purpose), drawn as one chapter (the next point). The sections keep their numbers, titles and saved answers, and the order of reading above: no data moved, no migration; `swapFinancialPages` and `retireLegacyBusinessPages` are as they were. A note, a link or a Glossary place on either section opens Financials; the title keeps the plan's months (section 1). Break-Even reads both sections.
- **One chapter** (built 2026-11-20; owner, 02:11 UTC+2: "The financials should be in a single page. Maybe they should all be under only one chapter."): rule | was | now: each part reads only what stands before it | Revenue & Break Even (Revenue Streams, Break-Even, Sustainability) before Financial Foundation (Costs, Capital & Funding, Financial Position), so Break-Even and Sustainability read the chapter after them | one chapter, Financial Foundation (this document's own name for it, section 1; the page's title, Financials, is not repeated): Revenue Streams, Costs, Capital & Funding, Financial Position, Break-Even, Sustainability. Ids, saved keys and dialogs unchanged. **Three Master Tiles that ask** (section 14, the one owner of the chapter's tiles): Revenue Streams, Costs and Funding, each reading only what stands before it, the records in the Workbook's Financial Documents; the merged tiles keep their ids and anchors, so a note or a link lands in them.
- **Waiting for Revenue & Pricing, the fee on a VAT-inclusive price** (owner, 2026-11-17 07:16: "Yes to all"; a calculation, named without a code: the code C1 is the founder's skill area, doc 28, section 9.3): the channel fees on a price that includes VAT (the fee is taken of the whole price the customer pays, VAT included), read where the price is set.
- **Waiting for Revenue & Pricing** (owner, 2026-11-17; the open decisions and gaps, Group 4d): O14's job there (doc 43): Packages / tiers, a price row per tier on the Offering's revenue stream; Add-ons / extras, an add-on stream beside it (Made to order already skips DV9, the batch's set-up, doc 52). And the seasons: the Profiles' D3 (Around seasons / holidays) and the Segment's "Sales, seasons or planned gifts" shape the monthly pattern of the expected sales (doc 50, 2.3), on the page that holds the months.

## 12. Pricing inputs

Status: **proposal**, written 2026-11-12; the wording is for the owner's approval. A price reflects three things: its cost, its customer and its competition (MIT OpenCourseWare 15.818 *Pricing*; Penn State Extension, *Choosing a pricing method*).

### 12.1 What the app holds today

| The three Cs | What the app has | Where |
|---|---|---|
| **Cost** | the cost of each sale and each Offering's monthly costs, by its shares | `offeringCosts` (`src/framework/engine/financial/offeringCosts.ts`), from the Infrastructure & Capability cards and the Legal Entity's expenses; available before Costs, Funding & Position is opened |
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
| A card's lists fold alike (layout rules section 6, `FoldList`) | Volume from Each Month always open | Folded under Sales Volume with its count; open while it holds no month |
| Affirmative voice; a note that names a fix offers it | "... customers buy this Offering every month, but it is charged once here ..." | "On Customer Engagement, customers buy this Offering every month. Charged monthly, its active clients count as clients each month." and the link "Charge it monthly" (or per sale), which sets Charged |

## 13. The Financials chapter: one proposal for the page (2026-11-20)

The chapter as it is now is section 14, which took Cash Flow and Break-Even & Sustainability to the Workbook and left three Master Tiles; this section keeps the proposal and its sources as built that morning.

Asked by the owner (2026-11-19 21:44 UTC+2: review the financial master cards for a logical sequence; 2026-11-20 02:13: "Did you review the existing financial tiles, and their content? Did you do also an online research?"; 02:14: "Do not make a proposal for each tile, but for all the financial page/chapter."). Read field by field in the code and on the Lumen & Loom and Quillfield examples, and against four sources (below). **Built 2026-11-20** (owner, 12:49 UTC+2: "proceed to changes"): steps 1, 3, 4 and 5, and decisions (a), (b), (c) and (e); step 2 and decision (d) the same day, in their own change; the Master Tiles stand four and one, the shape this section names first, and three and two stays the alternative for the owner. Built before them: the one chapter and its order (section 11, "One chapter"), the Sustainability Buffer said in words, the Launch budget line only where there is one.

**Why.** A founder who has not sold anything yet needs four answers from this page, in this order: what the business could earn, what it costs to start and to run, how the money in covers the money out month by month, and when it pays for itself and how long the money lasts. The four sources run the same way: revenue, then costs, then break-even and funding, then a cash table (BU); revenue, start-up costs, variable, fixed, labour and owner pay, then financing, with a 3 to 6 months' cover of expenses (UW-Madison SBDC); a bottom-up budget padded by 10 to 20% and 18 to 24 months of runway (NYU); a 12-month cash flow forecast with the owner's minimum pay and loan repayments as expenses, and a personal survival budget (Start Up Loans). Today's page holds almost all of these, but spread across six tiles that repeat each other, with two standard parts missing and the month-by-month cash table only in the exported documents.

**The proposed chapter: five steps, each reading only what stands before it.**

1. **Revenue** (Revenue Streams; built 2026-11-20: "Not priced yet" on the face). One card per Offering: what it is charged per, the price, the expected sales and their build-up, when it begins and when the customer pays; the Delivery Check and the Revenue Summary as now. *Auto-filled*: the charge and the unit from the Offering's terms and form (O3, O1), when the customer pays from O3t (asked once: the stream shows it, never asks it again), the sales from Sales Forecast, the hours from Capacity & Delivery. *For a founder with no price yet*: the card opens on the competitors' price range (K15) and the customers' expected range (O19) as the starting point, says "Not priced yet" on the face, and the rest of the chapter still shows the costs and the funding (each step says what it waits for).
2. **Costs** (Costs; the owner's minimum pay built 2026-11-20). Unchanged in what it reads (Legal Entity expenses, Founders, Workspace, Resources, Partners and Suppliers, the Offerings' resources, the calculated lines); its face says the Launch budget, the Running costs a month and the Cost of each sale. *Add*: **the owner's minimum pay** as a line of its own where no founder salary is set (Start Up Loans: the owner's minimum pay is an expense; SBDC: owner pay by legal form), read from a **personal survival budget** (below).
3. **Funding** (Capital & Funding and Financial Position, MERGED into one tile, `financial-funding`; built 2026-11-20: its dialog reads Sources, Uses, then Financial Position). The money in (the founders' capital, read from Founders & Ownership, then each source) and what it is for, side by side: **Sources & Uses** (SBDC's exhibit; BU's amount required, use of funds and type of funds), which takes over the separate Funding Need band and the Linked Funding Need ticks. *Drop*: "Founder's Capital" as a type a founder can add (it is read from Founders & Ownership: one owner per fact). *Pad*: the contingency on the launch budget stays (Global Settings), and its range is said with NYU's 10 to 20%. The face: Funding Gap or Covered, and the Runway.
4. **Cash Flow** (NEW, from what is computed today; built 2026-11-20 in the shared `ForecastTable`). The first 12 months, month by month: money in (revenue, funding received), money out (costs, the owner's pay, loan repayments), net, and the closing balance (Start Up Loans' forecast; BU's cash table; SBDC's 3-year horizon on the documents). It takes over the two cash charts (Financial Position's Funding Timeline and Break-Even's Revenue-Adjusted Financial Position, one chart) and the Operating need's first-year table. The forecast already computes it for the documents (`FinancialForecast.ts`); the page shows it.
5. **Break-Even & Sustainability** (Break-Even and Sustainability, MERGED into one tile, `sustainability-break-even-point`; built 2026-11-20). When it pays for itself (BU: fixed costs / (price - variable cost)) and how long the money lasts: the break-even revenue, the Expected Break Even, the Financial Exhaustion and the Buffer said in words, the Stress Test and What It Would Take. *Drop*: the five figures said twice in the Sustainability dialog (its table repeats its own tiles), and the third runway in Break-Even's "i" (the Runway is Funding's, one figure). *Read the 3 to 6 months of cover* (SBDC) as the Buffer's goal.

**The personal survival budget** (NEW; Start Up Loans; built 2026-11-20). A short card on the Founders & Ownership founder (not on this page: it is the founder's, not the business's): the household's money in a month and its costs, giving the minimum the founder must take from the business. It feeds step 2's owner's minimum pay and step 5's question, "can the founder live until break-even?". Asked only where the founder takes no salary from the business. **As built:** a band of the founder's card in the Founders & Ownership dialog, **Personal Survival Budget**, two optional amounts a month side by side, *Household income* (what the household has without the business: a partner's pay, benefits, savings drawn) and *Household costs* (rent or mortgage, bills, food, travel, debts), then one line in the band: "You need about £X a month from the business." (the costs less the income, never below nothing). Saved on the Legal Entity's founder, beside the capital the founder puts in (`householdIncome`, `householdCosts`: one owner, the founder's own money; a founder saved before has neither). Asked only where Infrastructure & Capability sets that founder no salary; a founder given a salary keeps what was typed, unasked and uncounted. **The owner's minimum pay** is then a cost line of its own in Costs, "Owner's minimum pay: [name]", in Founders, a month from the founder's start, Operating and Fixed, with no employer's on-costs (drawings, not a salary; `owner-pay-` + the founder's id), so the running costs, the Cash Flow, the break-even and the runway all carry it, and step 5's question is answered by the Expected Break Even and the Financial Exhaustion read with it.

**From six tiles to five** (built 2026-11-20): Revenue, Costs, Funding, Cash Flow, Break-Even & Sustainability. The Master Tiles keep their size: five in the two groups of the chapter, four and one, the order left to right; three and two stays the alternative for the owner.

**What stays as it is**: every saved answer and id (a merged tile holds the two tiles' ids, so a note or a link still lands); the documents' forecast; the Global Settings rates.

**Decided** (owner, 2026-11-20 12:49 UTC+2: "proceed to changes"; (a) to (e) built): (a) the five steps and their order; (b) merging Capital & Funding with Financial Position, and Break-Even with Sustainability; (c) adding the Cash Flow tile; (d) the personal survival budget and the owner's minimum pay; (e) "Not priced yet" with the price ranges as the start.

**Sources** (each read in full on 2026-11-20):
- Rana K. Gupta, *Building a Financial Plan: The Numbers* (slides), Boston University, 2020: the income statement, fixed costs, break-even "Fixed costs / (Price per unit - Variable cost per unit)", the cash table, then milestones, amount required, use of funds, type of funds.
- UW-Madison Small Business Development Center (Wisconsin School of Business), *Beginner's Guide to Financial Projections Workbook*, 2023: revenue, start-up costs, variable and fixed costs, labour and owner pay; working capital "3-6 months of expense coverage"; the Sources and Uses of Funds exhibit.
- Frank Rimalovski, *The Runway Equation: How Much to Raise and When to Spend It*, NYU Entrepreneurship, 22 Nov 2025: a bottom-up budget padded by 10 to 20%, 18 to 24 months of runway, founders' survival pay, revenue as the best non-dilutive capital.
- Start Up Loans (the UK government-backed programme, British Business Bank): the business plan, the cash flow forecast template (12 months; money in minus money out; the owner's minimum salary and loan repayments as expenses) and the personal survival budget template (read 2026-11-20 by the cloud session; startuploans.co.uk refuses automated reading from this computer).

## 14. Inputs on the page, records in the Workbook (owner, 2026-11-20 18:35 UTC+2)

Asked: "At the Financial Page, Funding, remove the Internal section, and optimise the remaining section." "Check if any information/section is already covered (Cash Flow VS Financial Forecast, etc.)." "The app should have tiles/sections that require inputs or answers (radio, multiple, drop down etc). Any doc that are just records (especially when it is a final output), should be placed in the Business Documents, in the Workbook."

**Read, tile by tile** (what each asks, and where the Workbook already says it):

| Tile | Asks for | Records it shows | Already in the Workbook |
|---|---|---|---|
| Revenue Streams | each stream's price, charge, volume build-up, begins, payment | the Delivery Check, the Revenue Summary | Business Plan, Financial Plan, "1. Revenue" (the streams table, the expected revenue) and "Capacity" |
| Costs | each cost's classification (group, behaviour, frequency where Other), own costs | the launch budget, running costs and cost of each sale | Business Plan Appendix "Costs"; Financial Forecast |
| Funding | each source (type, amount, status, schedule) | Uses (the Funding Need), Financial Position | Business Plan "Funding Request": need, available, gap, Use of Funds, Sources of Funds |
| Cash Flow | nothing | the twelve months, the Funding Timeline, the Revenue-Adjusted Financial Position | Financial Forecast: the Cash-Flow Forecast (the same table); the two charts are not there yet |
| Break-Even & Sustainability | nothing | point, time, exhaustion, buffer, Stress Test | Business Plan "2. Break Even" (all but the Stress Test) |

This section is the one owner of the Financials chapter's tiles: every other document names them in a line and links here.

**The page after this change** (rule | was | now: a page asks; the documents record | five Master Tiles, two of them records only | three, each asking):

1. **Revenue Streams**: the stream cards. Its Delivery Check and Revenue Summary leave the dialog: the Business Plan says both.
2. **Costs**: as now.
3. **Funding**: the sources only. **Internal is removed**: the founders' own money is the Founders' Capital, read from Founders & Ownership (one owner per fact); reinvested revenue is the forecast's own (the cash the business keeps), never a source to add; existing organisational funds are an Other source. A source saved under Internal is read under Other, its type and figures kept (nothing is lost). The sections then: Founders' Capital (read only), External, Other. Uses and Financial Position leave the dialog: the Business Plan's Funding Request says them.

**To the Workbook**: Cash Flow (the Financial Forecast holds the table; its two charts, the Funding Timeline and the Revenue-Adjusted Financial Position, stand under the Cash-Flow Forecast, each once) and Break-Even & Sustainability (the Business Plan's "2. Break Even"; the Stress Test table is added there, its four cases and their shortfalls).

The chapter keeps its name and frame, Financial Foundation, its three Master Tiles in the 2 x 2, the fourth place empty (layout rules section 23, "three leave its fourth place empty"). No saved answer changes: the records hold no input. As built: a link or note made to the Uses or the Financial Position lands on the Funding tile (their anchors kept on it); the Glossary's places for the break even, the contribution margin, the cash runway and the funding gap open the Workbook's Financial Documents at the tab that says them; a note made to the Cash Flow or Break-Even tile opens the Financials page.

**Bracketed details** (round of 18:35, item 9) on the three tiles that stay go into their "i".

**The Workbook's two kinds of document** (owner, 2026-11-20 20:46 UTC+2: "At the Workbook separate the Business and the Financial Documents. Make the Financial Documents with tabs just like the Business Documents."). Rule | was | now: each record has one place | one section, Business Documents, with the Business Plan, the Business Model Canvas and the Financial Forecast, the plan repeating the Funding Request, the Financial Plan and the Projections | two sections of the Workbook's rail, one under the other, each the same panel, title, "i", text sizes, Export and tabs (`BusinessDocumentsView`):

| Section | Tabs |
|---|---|
| Business Documents | Business Plan, Business Model Canvas |
| Financial Documents | Financial Forecast (its tables, then the Funding Timeline and the Revenue-Adjusted Financial Position under the Cash-Flow Forecast), Funding Request (the need, what is available, the gap, Use of Funds, the Cash to Raise Before the Opening and the Operational Contingency Fund, Sources of Funds; then the Financial Projections), Financial Plan (the costs, the revenue, the break even with its Stress Test, the capacity, the costs in full) |

The Business Plan keeps every part that is not a figure of money and, where its financial parts stood, one section, **Financial Documents**, that names where they are (one owner per fact): the Funding Request, the Financial Plan and the Financial Forecast of the Workbook. Its Executive Summary still says the plan's figures in a sentence (the funding sought, the expected revenue, the break even). Each Financial Document exports on its own, as Markdown and PDF (the Forecast also as CSV). A link, note or search result made to a moved record lands on its tab.

**The Business Plan's export carries the Financial Documents as its appendix** (owner, 2026-11-20 20:47 UTC+2, his decision: "the appendix"). On screen the plan names where they are; its Markdown and PDF end, after its own Appendix, with "Financial Appendix A: Funding Request" and "Financial Appendix B: Financial Plan" (and the Financial Forecast, where the Workbook exports it), written by the Financial Documents' own code, no second copy (`businessPlanForExport`, `plan.ts`). A document whose parts carry their own headings gives one appendix section a part ("Financial Appendix A: Funding Request, Financial Projections"), so every heading keeps its level. One switch turns it off (`PLAN_EXPORT_WITH_FINANCIAL_APPENDIX`): the plan then exports alone and each Financial Document on its own.

**What left the Funding tile is said in the Funding Request** (rule | was | now: nothing a record showed is lost | the Uses card showed the cash to raise before the opening and the Operational Contingency Fund | the Funding Request's "Cash to Raise Before the Opening" (the budget's three parts, the Total Pre-operational Budget, the Startup Contingency Fund, the opening inventory, the total) and "Operational Contingency Fund" (the target, the running costs a month, what is set aside each month, what is held at the opening, the months to reach the target), from the same engine (`contingencyFunds`), once there is an Opening Date). Their three inputs -- the two rates and the target months -- are the Global Settings' and stay there. The Financial Plan's Funding Need keeps its Loan repayments column while a loan is recorded. While there is no Opening Date, the Costs tile says where it is given ("Give the Opening Date, on the Organization tile (Identity System), ..."), the words the Funding tile used.

## 15. Each Offering's sales, cost, price and margin (the round of 2026-11-21 00:56 UTC+2)

Asked (owner, 2026-11-21 00:56 UTC+2): "Review the Revenue Streams and Funding sections; which parts could be covered by existing answers from previous parts." "There is a wide price range in competitors' offerings, without filtering them … That way we could narrow down the price range." "I do not want the cost to present the same information with the inventory. It would have been better to define the costs of each offering." "Having a better idea of the competitors offering's price, and the app user's offering's costs we could calculate better the revenue of each offering." Decided (owner, 23:44 UTC+2): "2. Do an online research and find the best answer." "3. I think they should be compared according the profile's needs and answers." "4. and 5." built as proposed; "6. a. Demand & Conversion to Expected Sales (do also online research …)" — the research found **Sales Forecast** the established term, and the owner chose it (23:49); "b. stay as it is: Capacity does not mean only hours but also skills and expenses."

### 15.1 One owner for each figure

| Figure | Owner (asked once) | Read, never asked again, by |
|---|---|---|
| An Offering's normal monthly sales and the months to reach them | **Sales Forecast** (Customer Engagement; formerly "Demand & Conversion"): potential customers × reached × converted × buying, built up month by month | the Revenue Stream (shown), the Capacity & Delivery cards, the forecast |
| When its sales begin | the **Revenue Stream**'s Begins, starting from the later of the plan's first month after the Opening Date and the Offering's readiness (O2); the founder changes it freely | Sales Forecast's build-up starts there |
| Its price and how it is charged | the **Revenue Stream** (its charge and unit start from the Offering's O3 and O1) | the market price range beside it (information only) |
| How many sales the founders' hours allow | **Capacity & Delivery** (the founders' delivery hours ÷ the hours one sale takes) | a warning beside the Sales Forecast and the stream where the sales need more hours: never a second figure for the sales |
| A loan: amount, month received, term, rate, repayment holiday | **Funding**, one source a loan | the cash flow: in the month received; repayments from the month after, or after the holiday (interest only during it) |
| The founders' capital: amount | **Founders & Ownership** (the capital switch on) | Funding (read only), the cash flow: in the plan's first month (in hand when the plan starts) |
| The founders' pay and hours | **Infrastructure & Capability** (the Founders) | the costs, the cash flow, the running-cost rate below |

Rule | was | now: a figure is asked once | the stream asked its own monthly volume, its First Month and its Months to Normal beside Sales Forecast's (C2; the stream's volume, when Sales Forecast answered, was an unread second copy) | the stream shows Sales Forecast's figures with a link to where they are changed; where Sales Forecast has no answer for an Offering, the stream keeps asking them (an Offering sold without a forecast still counts). Saved answers stay valid: a stream's saved volume, First Month and Months to Normal are kept and read only where Sales Forecast is silent.

Sources: SBA (2017; n.d.), driver-based forecasts built from reach and conversion; Aulet (2013) and Disciplined Entrepreneurship (n.d.), bottom-up market sizing; SCORE (2020) and University of Wisconsin SBDC (n.d.), the projections templates; Start Up Loans (n.d.-a; n.d.-b) and GOV.UK (n.d.), the 12-month cash-flow forecast and the loan repayments.

### 15.2 The cost of each Offering

The **Costs** tile becomes **Cost of each Offering** (rule | was | now: one owner for a list | the Costs dialog listed every cost card, the Inventory's lines again (C5), with its filters | the three totals (Launch budget, Running costs a month, Cost of each sale) and the Total Pre-operational Budget stay on top, then **Running costs shared** (the rate, with its working in the "i"), a card for each Offering sold, and the costs not counted yet; every cost in full is the Inventory's and the Workbook's Financial Plan's, "Costs in Full"). Nothing on the tile takes an answer: its Opening Date is a note pointing to the Organisation tile; the ledger's filters were a view only, saved nowhere. Its face: each Offering sold, its full cost of one (none sold yet: the running costs a month). Each card: the Offering's name, then its figures as the totals are drawn (`FigureTiles`): Price, Direct cost, Contribution, Full cost (its running share under it, the working in its "i"), Margin; a contribution or margin below nothing in the risk tone (`offeringEconomics`, `FinancialFoundationEditor.tsx`). (A table of seven columns ran past the dialog's edge at 1920: the cards wrap at any width.)

Each Offering's card (time-driven activity-based costing with the founders' delivery hours as the one driver: Kaplan and Anderson, 2004; HBS Working Knowledge, 2004; Garrett, n.d.):

```
Direct cost of one          = its own costs per sale (materials, per-order and per-project costs, the fees of the channels it sells through) — as the break even counts them
Running costs to share      = the running costs a month, less the costs that serve this Offering alone
Rate (per delivery hour)    = running costs to share ÷ the founders' delivery hours available a month
Running cost of one         = the hours one sale takes (Capacity & Delivery) × the rate
                              + its own running costs a month ÷ its sales a month (Sales Forecast)
Full cost of one            = direct cost of one + running cost of one
Contribution of one         = price − direct cost of one
Margin                      = (price − full cost of one) ÷ price
```

- The denominator is the hours **available**, not the hours sold: each Offering carries only the time it takes; hours left over are capacity still free, said as such (Kaplan and Anderson, 2004).
- A cost that serves one Offering alone (its equipment, its own tool) is charged to it, never shared (Garrett, n.d.).
- An Offering with no hours per sale yet takes its share by its revenue, and its card says so in its "i".
- The card shows the **contribution beside the full cost**: a sale whose price is below its full cost but above its direct cost still helps cover the running costs; the full cost is for planning and long-run pricing (CIMA, 2005; Kaplan and Anderson, 2004). How the running costs are shared changes each Offering's cost, never the total profit.
- A price below the direct cost is said plainly under its Contribution, in the risk tone: "Each sale costs more than its price." The price stays the founder's. (Lumen's Trade Collection, £48 a product, has a direct cost of £22 and a full cost of £159: a margin of -232%, its contribution £26 still towards the running costs; the earlier proposal's £72 counted the founders' hours as a direct cost.)

### 15.3 The price customers already pay elsewhere

A Competitor card gains **K16, "Which of the Profile's needs do they meet?"** (ticks of the same need items an Offering ticks, by id; doc 41, K16). Beside each Revenue Stream's price, the **market price range**: the lowest From to the highest To (K15) of the Segment's competitors that meet at least one need this Offering meets, their count and names in its "i"; while no competitor ticks K16, every competitor of the Segment, said in the "i". It is the price customers already pay for these needs (value-based pricing's reference value: ICAEW, n.d.; MIT OpenCourseWare, 2010), never a price the app sets and never compared with the founder's own past prices (a start-up has none; the owner's rule of 2026-11-04). Sources: Osterwalder et al. (2014) and Strategyzer (n.d.), the Value Proposition Canvas; Christensen et al. (2016), jobs to be done.

### 15.4 Each Offering's revenue

Each Revenue Stream's card closes with **This Offering's economics**: its price, the market price range, its direct cost, contribution, full cost and margin, and its sales a month from the Sales Forecast; the stream's tile face keeps its price. The Workbook's Financial Plan gains the same table, one row an Offering.

### 15.5 The examples

Rule | was | now: an example's data agrees with itself | Lumen's DPD and Royal Mail couriers, "one parcel per order" on their cards, were priced per parcel and counted per item; the weaving tutor's cost card paid 0.4 of an hour a participant ("a six-hour workshop for about fifteen") while the Workshops' Delivery card gives the tutor 0.8 of an hour a session of eight | the couriers priced per order (the unit "order", which the costs count per order); the tutor paid 0.1 of an hour a participant, £2.35, as the Delivery card says (Maya leads the workshops: "Heavy reliance on Maya for weaving and teaching"; the tutor covers the evening course when she is on commissions). Lumen's funding gap £25,864 -> £23,724. Trade Collection keeps its £48.

### 15.6 Sources

Aulet, B. (2013) *Disciplined Entrepreneurship: 24 Steps to a Successful Startup*. Hoboken, NJ: Wiley.

Christensen, C.M., Hall, T., Dillon, K. and Duncan, D.S. (2016) 'Know your customers' "jobs to be done"', *Harvard Business Review*, 94(9), pp. 54–62. Available at: https://hbr.org/2016/09/know-your-customers-jobs-to-be-done (Accessed: 21 November 2026).

CIMA (2005) *Management Accounting Official Terminology*. 2nd edn. Oxford: CIMA Publishing.

Disciplined Entrepreneurship (n.d.) *Step 4: Calculate the total addressable market size for the beachhead market*. Available at: https://www.d-eship.com/step4/ (Accessed: 21 November 2026).

Garrett, K. (n.d.) *Activity-based costing*. ACCA technical article. Available at: https://www.accaglobal.com/uk/en/student/exam-support-resources/fundamentals-exams-study-resources/f5/technical-articles/ABC.html (Accessed: 21 November 2026).

GOV.UK (n.d.) *Apply for a Start Up Loan for your business*. Available at: https://www.gov.uk/apply-start-up-loan (Accessed: 21 November 2026).

HBS Working Knowledge (2004) *Adding time to activity-based costing*. Harvard Business School. Available at: https://www.library.hbs.edu/working-knowledge/adding-time-to-activity-based-costing (Accessed: 21 November 2026).

ICAEW (n.d.) *Financial strategy: value-based pricing*. Available at: https://www.icaew.com/technical/business-and-management/boards-and-committees/general/financial-strategy-value-based-pricing-the-driver-to-increased-short-term-profits (Accessed: 21 November 2026).

Kaplan, R.S. and Anderson, S.R. (2004) 'Time-driven activity-based costing', *Harvard Business Review*, 82(11), pp. 131–138. Available at: https://hbr.org/2004/11/time-driven-activity-based-costing (Accessed: 21 November 2026).

Kotler, P. and Keller, K.L. (2016) *Marketing Management*. 15th edn. Harlow: Pearson.

MIT OpenCourseWare (2010) *15.818 Pricing, Lecture 2: Economic value to the customer*. Available at: https://ocw.mit.edu/courses/15-818-pricing-spring-2010/ (Accessed: 21 November 2026).

Osterwalder, A., Pigneur, Y., Bernarda, G. and Smith, A. (2014) *Value Proposition Design*. Hoboken, NJ: Wiley.

SBA (2017) *What makes a new business forecast realistic?* Available at: https://www.sba.gov/blog/what-makes-new-business-forecast-realistic (Accessed: 21 November 2026).

SBA (n.d.) *Write your business plan*. Available at: https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan (Accessed: 21 November 2026).

SCORE (2020) *Financial Projections Template Guide*. Available at: https://www.score.org/resource/template/financial-projections-template (Accessed: 21 November 2026).

Start Up Loans (n.d.-a) *What is a cash flow forecast?* Available at: https://www.startuploans.co.uk/cash-flow-forecast-template (Accessed: 21 November 2026).

Start Up Loans (n.d.-b) *Loan repayments*. Available at: https://www.startuploans.co.uk/support-and-guidance/frequently-asked-questions/loan-repayments (Accessed: 21 November 2026).

Strategyzer (n.d.) *Value Proposition Canvas*. Available at: https://www.strategyzer.com/canvas/value-proposition-canvas (Accessed: 21 November 2026).

University of Wisconsin SBDC (n.d.) *Financial projections templates*. Available at: https://projections.sbdc.wisc.edu/ (Accessed: 21 November 2026).
