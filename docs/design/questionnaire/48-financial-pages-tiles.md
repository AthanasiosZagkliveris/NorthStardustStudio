# 48. The Financial pages and the Inventory: tiles and two questions, as proposed

Status: **proposal**, written 2026-11-12, updated 2026-11-12. The owner approved it on 2026-11-12 (D12, D13, D14, D15). The build waits for phase 7, the financials, the last phase of the order of work (doc 49, section 8; owner, 2026-11-12 15:18): the tiles, RV1, FN1, IN1 to IN4 and the Offering Economics card are built there; IN5 with phase 6 (Initiatives and Activities). Nothing here is built yet.

Related: doc 40 (the form), the page 4 and page 5 specifications (`specifications/business-system/`), doc 5 (5.3, I7, I9, K1), `ai/layout-rules.md` (section 12, the Inventory), doc 47 (the Offering's four faces), doc 49 (Strategy reads these figures).

## 1. Financial Foundation: one chapter, four Master Tiles

| Master Tile | Its face lists | Dialog: nested sub tiles | Cards |
|---|---|---|---|
| **Costs** | Launch budget, running costs a month, cost of each sale | Launch: before the opening; Running costs: every month; Cost of each sale; One-time costs after the opening; Not counted yet (shown while it holds a line) | each sub tile opens **the Inventory's table** filtered to its heading (section 6); a line opens its card |
| **Funding Need** | Establishment, Operating, Offering with amounts | Establishment (Pre-operational Budget, Startup Contingency, Cash to raise), Operating (Operational Contingency Fund), Offering | read-only cards |
| **Capital & Funding** | the sources by status | Internal (Founder's Capital), External (Non-repayable, Equity, Debt), Other | one card per source (3 a row, "+ Add card"); a loan's card holds its schedule |
| **Financial Position** | the headline (the gap, or Covered with the runway) | six figure tiles, Funding Mix, Upcoming Obligations, Decision Signals; **Cash Timeline** as a Diagram tile | none |

The plan's dates stay in the page title; VAT and the plan settings sit in the Costs dialog's head. A page of one chapter stands at the left at half width, so its tiles are the size of every chapter's.

## 2. Sustainability: two chapters of four Master Tiles

| Chapter | Master Tiles | Nested |
|---|---|---|
| **Revenue** | Revenue Streams (one card per Offering); Offering Economics (section 3); Delivery Check (per Offering); Revenue Summary | the stream card's Revenue Timeline as a Diagram tile |
| **Break Even** | Break-Even Point; Break-Even Time (Diagram tile); Sustainability (status, buffer, summary, signals); Stress Test (the four worse cases and What It Would Take) | none |

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
- Status: proposal; built in phase 7.

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

- **Label:** What do they charge for a similar offer?
- **Control:** an amount range (From, To) in the organisation's currency, "per" taken from the Offering's O3 terms; and a tick "Not known yet".
- **"i":**
  - The price range customers see today. It helps you place your own price.
  - Based on: MIT OpenCourseWare 15.818 *Pricing*; Penn State Extension, *Choosing a pricing method*.
- **Judged on the competitor's own facts** (the start-up rule): never compared with the founder's own price.

#### O19 (Offering card, doc 43)

- **Label:** What would your customers expect to pay?
- **Control:** an amount range (From, To) in the organisation's currency; and a tick "Not known yet".
- **"i":**
  - Your best estimate of what customers would pay for it. Asking a few of them gives the surest answer.
  - Based on: MIT OpenCourseWare 15.810, lecture 10, *Principles of Pricing* (Hauser, 2015); Penn State Extension, *Product pricing: what do I charge?*.

**RV1** stays as specified (section 4).

**Read by:** the Offering Economics card (the price against both ranges); the Business Plan's Products and Services; the Review: "[Offering]: price above what customers expect", shown only when the price and O19's range both exist.

**Codes:** K15 and O19 are the next free codes of their cards (K11 to K13 are retired, never reused; doc 44). They enter the register when built.

**Sources** (each read in excerpt; opened in full before an "i" cites it): MIT OpenCourseWare 15.818 *Pricing* (Spring 2010), lecture 1; MIT OpenCourseWare 15.810 *Marketing Management*, lecture 10, *Principles of Pricing* (Hauser, Fall 2015); Penn State Extension, *Product pricing: what do I charge?* and *Choosing a pricing method*.
