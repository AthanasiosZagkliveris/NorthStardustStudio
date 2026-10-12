# Business System — Page 4: Financial Foundation
## Design & Development Prompt

> **3. Business System — Page 4 of 5.**
> Was labelled "Page 1", and its layout banner carried the
> pre-swap System number 4. The first of the two Financial
> pages; **Page 5 — Financial Sustainability** follows it.

## 1. Purpose

Design and develop **Page 4 — Financial Foundation** of the Business System.

The page establishes the organisation's financial requirements and financing capacity. It should allow a founder or small organisation to record the financial information necessary to understand:

- what the organisation needs to pay for,
- how much financial support is required,
- where the money will come from,
- when money will become available,
- what financial obligations are created,
- whether the identified funding is sufficient, and
- how long the organisation can continue operating if funding is sufficient but revenue is not yet enough.

The page is a **financial model-building and decision-support tool**, not an accounting application.

The page follows this logic:

**Costs → Funding Need → Capital & Funding → Financial Position**

The Financial Position is calculated from the information entered in the previous sections. It should identify either a **Funding Gap** or, when the identified requirement is covered, an estimated **Financial Runway**.

---

# 2. Core Design Principles

### 2.1 Build on information already recorded

Do not ask the user to re-enter costs that already exist in other systems.

Costs should be consolidated from relevant existing records, including:

- Legal Entity — 1. Identity System, Page 3
- Infrastructure — Page 3, Infrastructure
- Founders — Page 3, Infrastructure → 1. Resources → A. Founders
- Offering's Capability — Page 3, Offering's Capability

Where a cost originates elsewhere, show its **source** and provide a link/reference back to the originating record.

### 2.2 Separate data entry from analysis

The page has two jobs:

1. **Capture the information required to shape the financial model.**
2. **Analyse that information and present the financial picture clearly.**

Users enter the underlying financial information. The system calculates totals, funding positions, schedules, gaps and runway where possible.

### 2.3 Progressive disclosure

Do not expose every financial parameter to every user.

The required information should depend on the selected cost or funding type.

For example:

- Founder's Capital requires relatively little information.
- A Grant may require a payment schedule and conditions.
- An Investment may require ownership/equity information.
- A Loan requires interest, repayment timing and repayment terms.

Only reveal additional fields when they are relevant.

### 2.4 Conservative complexity

The target audience is founders and small organisations, particularly organisations in development and their early years.

Do not turn this page into professional accounting or treasury software.

---

# 3. Page Structure

The page contains four sequential sections:

1. **Costs**
2. **Funding Need**
3. **Capital & Funding**
4. **Financial Position**

The visual flow should communicate:

**What does it cost?**
↓
**What needs to be financed?**
↓
**Where will the money come from?**
↓
**Are we financially covered?**

---

# 4. Section 1 — Costs

## Purpose

Identify and consolidate the costs required to establish, operate and deliver the organisation's Offerings.

The section should primarily be a **consolidated view**, rather than another independent cost-entry system.

## 4.1 Cost Groups

Use four primary cost groups:

### Establishment

Costs required to establish or launch the organisation.

### Operating

Ongoing costs required to keep the organisation functioning independently of a particular Offering.

### Offering

Costs directly associated with creating, delivering or supporting a particular Offering.

Offering costs should link to the relevant Offering where applicable.

### Other

A controlled fallback for costs that do not reasonably fit the previous groups.

---

# 5. Cost Analysis

Each cost should have three distinct dimensions.

## 5.1 Cost Group

**Establishment / Operating / Offering / Other**

This answers:

> What does this cost support?

## 5.2 Cost Behaviour

**Fixed / Variable / Semi-variable**

This answers:

> How does this cost change as organisational activity changes?

### Fixed
A cost that does not materially change with the level of activity over the relevant period.

### Variable
A cost that changes with production, sales, projects or usage.

### Semi-variable
A cost containing both a fixed component and a variable component.

Where possible, semi-variable costs should be separated into their fixed and variable components for analysis.

This classification supports the later Break-Even model.

## 5.3 Payment Frequency / Timing

Possible values:

- One-time
- Monthly
- Quarterly
- Annually
- Per project
- Per unit
- Usage-based
- Other

Do not confuse Cost Group with Payment Frequency.

---

# 6. Cost Record

A cost record should contain, where applicable:

| Field | Purpose |
|---|---|
| Name | Identify the cost |
| Source | Identify where the cost originates |
| Cost Group | Establishment / Operating / Offering / Other |
| Amount | Cost value |
| Frequency | When/how often it is paid |
| Cost Behaviour | Fixed / Variable / Semi-variable |
| Offering | Relevant Offering, if applicable |
| Description | Optional additional information |

**As built, there is no "+ Add Cost".** The Costs section is generated only: every cost is read from the record that owns it (a Page 3 card, a Legal Entity expense, a founder's salary), shows its source with a link back, and is edited there. A cost with no home is added as a card on Page 3 (or an expense on the Legal Entity), never typed on this page. Only the classification of a read cost (group, behaviour, offering, and from the opening on its cost nature) is stored here.

A Workspace Deposit recorded on Page 3 (Infrastructure → Workspace, status Costs) is gathered here as a **Workspace deposit** line: one-time, Establishment, Treat As Deposit (an asset, never a cost, returned later), paid in the plan's first month. It is entered once, on Page 3, and is not added again here.

A **possible duplicate** is warned of ("Also recorded as ... Counted twice?") only when ALL hold: the names are similar (equal, one the other plus whole words, or at least 60% of their significant words shared); the amount (after quantity), currency and frequency are the same; and the two lines come from the same source (the same record, the same page and section, or, across pages, equal names). The same name with a different price is never a duplicate.

---

# 7. Section 2 — Funding Need

## Purpose

Translate the identified costs into a clear understanding of **how much financial support is required, for what purpose and when**.

Do not simply calculate one total number.

## 7.1 Funding Need Categories

Use:

### Establishment
Money required to establish and launch the organisation.

### Initial Operating Requirement
Money required to support operations before revenue becomes sufficient.

### Offering Development / Launch
Money required to develop, prepare or launch an Offering before it can generate sufficient revenue.

### Other
For relevant requirements outside the above.

## 7.2 Funding Need Record

Support:

- Name / Purpose
- Amount
- Required Date or Period
- Linked Costs
- Description / Conditions

Funding needs may be one-time or distributed across periods.

**As built, Funding Needs are calculated, not typed** (there is no "+ Add Funding Need"): Establishment, Initial Operating Requirement, Offering Development / Launch and Other are derived from the costs and their timing. With an Opening Date, the **Establishment** need is the **cash to raise before the opening** (see "Cost nature, funds and scheduling" below), and the budget lines it counts are not counted again as running costs.

Example:

**Product Development**

- January: €3,000
- February: €2,000
- March: €1,000
- Total: €6,000

The system must support both simple and scheduled requirements.

---

# 8. Section 3 — Capital & Funding

## Purpose

Identify how the organisation intends to finance its financial requirements.

The main categories are:

### Internal
### External
### Other

These categories describe the **origin of financial resources**.

They should not be confused with the specific funding type.

---

# 9. Internal

Possible types:

- Founder's Capital
- Reinvested Revenue
- Existing Organisational Funds

## Founder's Capital

Where founder information and capital already exist in the Legal Entity, reference that information rather than duplicating it.

Founder's Capital is not Revenue.

---

# 10. External

Use a conservative set of funding types.

### Non-repayable

- Grant
- Subsidy
- Award / Competition
- Other Non-repayable Funding

### Equity

- Angel Investment
- Venture Investment
- Equity Investment
- Equity Crowdfunding

### Debt

- Bank Loan
- Business Loan
- Microloan
- Credit Facility
- Other Debt

The system must distinguish these because they have different consequences.

---

# 11. Other

Possible types:

- Reward Crowdfunding
- Friends & Family
- In-kind Contribution
- Other

Keep this category deliberately limited.

---

# 12. Funding Record

Every funding source should capture the information necessary to understand its real financial effect.

Common fields:

| Field | Purpose |
|---|---|
| Name | Identify the funding source |
| Source Category | Internal / External / Other |
| Funding Type | Grant / Investment / Loan / etc. |
| Provider / Source | Who provides it |
| Total Amount | Total expected/agreed amount |
| Status | Current state |
| Availability | Amount currently available |
| Timing | When funds become available |
| Funding Schedule | How funds are received |
| Purpose | What the funding supports |
| Linked Funding Need | What requirement it addresses |
| Conditions | Restrictions or requirements |

---

# 13. Funding Status

Do not treat planned funding as available money.

Use statuses such as:

- Planned
- Preparing
- Requested / Applied
- Approved / Agreed
- Received / Available
- Completed / Closed

The important distinction is:

**Expected ≠ Confirmed ≠ Available**

For example, a €12,000 grant may be approved but only €4,000 may have been received.

The model should therefore show:

- Total Award: €12,000
- Received: €4,000
- Confirmed Future: €8,000

---

# 14. Funding Schedules

Funding may be received:

- once,
- periodically,
- in instalments, or
- when specific milestones are reached.

Support:

### One-time
A single payment.

### Periodic
A repeated amount at a defined frequency.

Parameters:

- Amount
- Frequency
- Start Date
- End Date or Number of Periods

### Milestone-based
Funding is released when a defined condition or milestone is reached.

Parameters:

- Amount
- Expected Date
- Milestone / Condition

### Other
For arrangements that do not fit the above.

The system should calculate resulting availability over time.

---

# 15. Investment

For equity investment, capture only the information needed by the Business System:

- Investor
- Amount
- Date / Timing
- Status
- Ownership / Equity, if applicable
- Conditions
- Purpose

Do not build a full shareholder-management system here.

The Legal Entity (1. Identity System, Page 3) remains the authoritative location for legal ownership information.

---

# 16. Loans

When the user selects **Loan**, progressively reveal:

- Provider / Lender
- Principal Amount
- Interest Rate
- Interest Type, where relevant
- Loan Start Date
- Repayment Start Date
- Repayment Frequency
- Term / Number of Payments
- Repayment Method, where necessary
- Conditions
- Purpose

The system should calculate the repayment schedule where sufficient information is available.

---

# 17. Loan Repayment Schedule

A loan should be modelled as:

**Loan Received**
↓
**Principal + Interest**
↓
**Repayment Schedule**
↓
**Future Financial Obligations**

Where possible, calculate:

- Payment amount
- Principal component
- Interest component
- Payment dates
- Remaining principal
- Total interest

Do not require the user to manually create every repayment.

---

# 18. Loan → Costs / Expenses

Loan principal and interest must be treated differently.

### Principal

Repayment of borrowed money.

It is a financing cash outflow, not an operating cost of producing an Offering.

### Interest

The cost of borrowing.

It should be available as a financial expense.

When automatic repayment integration is enabled, create or link the relevant future expense records automatically.

Example:

**Monthly repayment: €430**

- Principal: €380
- Interest: €50

The user should not have to manually enter 24 repayment expenses.

Use the relationship:

**Loan → Repayment → Expense**

---

# 19. Section 4 — Financial Position

## Purpose

Provide the user with the **big picture** required to make financial decisions.

It should answer:

- How much do we need?
- How much do we have?
- How much is confirmed?
- How much is still expected?
- When will money arrive?
- When will money leave?
- Do we have a Funding Gap?
- If not, how long can we continue?
- What major financial obligations are approaching?

This section should primarily be calculated rather than manually entered.

---

# 20. Financial Overview

Primary indicators:

### Funding Need
Total identified financial requirement.

### Available Now
Financial resources currently available.

### Confirmed Future
Financial resources confirmed but not yet available.

### Pending
Funding expected but not yet confirmed.

### Funding Gap
Remaining amount required after considering available/confirmed financing.

### Financial Runway
Estimated period for which available financial resources can support the organisation before they are exhausted.

---

# 21. Funding Gap

Calculate the remaining uncovered requirement while considering timing.

If the organisation requires €20,000 and has €15,000 of confirmed financing:

**Funding Gap = €5,000**

Display:

> **Additional financing required: €5,000**

The user should be able to trace the gap back to relevant funding needs and costs.

---

# 22. When There Is No Funding Gap

If identified financing covers the requirement:

Display:

> **Funding Requirement Covered**

Do not stop at:

> Funding Gap: €0

Instead calculate:

### Financial Runway

Estimate how long the organisation can continue operating before its available financial resources are exhausted.

Consider:

- Available funds
- Timing of incoming funding
- Timing of outgoing costs
- Recurring operating costs
- Known financial obligations
- Loan repayments
- Other scheduled payments

---

# 23. Financial Timeline

Provide a visual timeline of incoming and outgoing money.

Example:

```text
JAN        FEB        MAR        APR        MAY        JUN        JUL
│          │          │          │          │          │          │
▼          ▼          ▼          ▼          ▼          ▼          ▼
Grant      Costs      Costs      Grant      Costs      Costs      Loan
€4k        -€1k       -€1.5k     €4k        -€1.2k     -€1.2k     -€430
```

The timeline should reveal cash-pressure periods even when total funding is sufficient.

---

# 24. Funding Mix

Show where financial resources originate.

Example:

- Founder's Capital
- Grant
- Investment
- Loan
- Other

Allow the user to understand dependence on different sources.

Avoid turning this into an automatic recommendation engine.

---

# 25. Upcoming Obligations

Automatically surface significant future financial events, such as:

- Grant instalment expected
- Loan repayment begins
- Annual software renewal
- Insurance payment
- Large production payment
- Workspace payment
- Other significant scheduled costs

---

# 26. Decision Support

The Financial Position should provide useful financial signals, not just totals.

Examples:

### Funding Gap
> Additional financing of €6,000 is required.

### Funding Timing
> Available funds may fall below the identified operating requirement before the next scheduled funding payment.

### Loan
> Loan repayments begin in July and create an estimated monthly obligation of €430.

### Runway
> Based on current available funds and identified financial requirements, the organisation can operate for approximately 8 months before available funds are exhausted.

### Funding Dependency
> A significant proportion of planned financing depends on funding that has not yet been received.

These are decision-support observations, not financial advice.

---

# 27. Important Financial Distinctions

Use `i` information controls to explain:

### Cost
Money the organisation needs to spend.

### Funding Need
Money the organisation needs to obtain to support its financial requirements.

### Capital
Money contributed to the organisation, particularly by founders or investors.

### Funding
Financial resources provided by another source to support the organisation.

### Loan
Borrowed money that creates a repayment obligation.

### Revenue
Money generated through the organisation's Offerings.

### Funding Gap
The amount of identified financial requirement not covered by available/confirmed financing.

### Financial Runway
The estimated period for which available financial resources can support the organisation under current assumptions.

Capital and funding are **not revenue** and should not be used to artificially improve operating performance or the core Break-Even calculation.

---

# 28. Recommended Page Layout

Use the existing North Stardust visual language and progressive structure.

```text
┌─────────────────────────────────────────────────────────────┐
│ 3. BUSINESS SYSTEM                                          │
│ Financial Foundation                                        │
│                                                             │
│ Establish the financial requirements and financing          │
│ capacity of the organisation.                               │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│ 1. COSTS                                                  i │
│                                                             │
│ [ Establishment ] [ Operating ] [ Offering ] [ Other ]      │
│                                                             │
│ Cost | Source | Group | Amount (CUR) | Frequency | When |      │
│ Cost nature | Behaviour | Offering   (generated, no Add)     │
└─────────────────────────────────────────────────────────────┘

                              ↓

┌─────────────────────────────────────────────────────────────┐
│ 2. FUNDING NEED                                           i │
│                                                             │
│ Purpose | Amount | Timing | Linked Costs   (calculated)      │
│ Funds: budget, contingency, cash to raise                    │
│                                                             │
│ Total Funding Need                                         │
└─────────────────────────────────────────────────────────────┘

                              ↓

┌─────────────────────────────────────────────────────────────┐
│ 3. CAPITAL & FUNDING                                      i │
│                                                             │
│ INTERNAL          EXTERNAL             OTHER                │
│                                                             │
│ Founder's         Grant                Crowdfunding         │
│ Capital           Investment           In-kind              │
│ Reinvestment     Loan                 Other                 │
│ Existing Funds    Subsidy                                     │
│                                                             │
│ [+ ADD FUNDING SOURCE]                                      │
│                                                             │
│ Funding Schedule / Status / Conditions / Obligations        │
└─────────────────────────────────────────────────────────────┘

                              ↓

┌─────────────────────────────────────────────────────────────┐
│ 4. FINANCIAL POSITION                                     i │
│                                                             │
│ NEED          AVAILABLE       GAP          RUNWAY            │
│ €30,000       €24,000         €6,000       —                 │
│                                                             │
│ Funding Mix                                                 │
│ Funding Timeline                                            │
│ Upcoming Obligations                                        │
│ Decision Signals                                            │
│                                                             │
│ If Funding Gap = 0:                                        │
│ "Funding Requirement Covered"                              │
│ "Estimated Financial Runway: X months"                     │
└─────────────────────────────────────────────────────────────┘
```

---

# 29. Scope Boundary

This page should **not** become a full accounting or financial-management system.

Keep the following outside this page unless a future Finance System requires them:

- Detailed bookkeeping
- Invoices
- Accounts receivable/payable management
- Bank reconciliation
- Tax accounting
- Full financial statements
- Payroll management
- Detailed cash accounting
- Investment portfolio management
- Full debt management
- Professional financial forecasting

The Financial Foundation should provide a **structured financial model for business planning and decision-making**.

## Final Outcome

The page should help the founder move from:

> "I think I need some money to start this."

to:

> "I know what the organisation costs, what needs to be financed, when the money is required, where the financing will come from, what obligations it creates, whether there is a funding gap, and how long the organisation can operate under the current financial assumptions."


---

# 30. Cost nature, funds and scheduling (as built, batches F to I)

## 30.1 Opening Date and Global Settings

- **Opening Date** is a field on this page next to Plan Start. Until it is given, the funds block asks for it; with it, costs are split into what falls before and from the opening.
- **Global Settings** are kept per organisation on `/settings` (the header's Settings button), never on this page: opening date default, channel fee table (Stripe 2% + 0.25 + 0.5, PayPal 3.5% + 0.35 + 1, Wolt/Amazon 25%), royalty 10%, affiliate 15%, agent 10%, capitalisation limit, useful life by six asset groups, target reserve months (3), Startup Contingency rate (10%), Operational Contingency rate (4%), insurance per employee, income tax rate.

## 30.2 Cost nature (rules C1 to C16)

Each cost line has a nature, shown in its own column (header "Cost nature", with an i): **Startup**, **Pre-Operating**, **CapEx**, **OpEx**, **COGS** or **Inventory**. Before the opening the nature follows the rules (a dated cost before the opening is in the budget; an asset above the capitalisation limit, tested on one unit with its bundled services, is CapEx). From the opening on, the row has a dropdown to choose CapEx, OpEx or COGS, or "Set by the rules"; the months before the opening stay in the budget. The Amount column header carries the currency, "Amount (EUR)", and the rows hold the figures alone.

## 30.3 Funds (rules F1 to F6)

Under Funding Need, with an Opening Date:

- **Total Pre-operational Budget** = CapEx + Startup + Pre-Operating (also shown under the costs).
- **Startup Contingency Fund** = the Startup rate of that budget.
- **Cash to raise before the opening** = budget + Startup Contingency + opening inventory (kept outside the contingency base).
- **Operational Contingency Fund**: after the opening, the Operational rate of monthly OpEx is set aside until the fund equals the target reserve months of OpEx; the card shows OpEx a month, the target, and the months to reach it.
- The **Establishment** funding need is the cash to raise.

## 30.4 Calculated lines

Lines the page computes and the forecast uses, with no record behind them: employer on-costs, key-person insurance per employee, channel fees, royalties and commissions, depreciation (cost plus services over useful life; COGS for Offering, OpEx for Infrastructure), amortisation (franchise fee), opening inventory released to COGS, an accumulated Start-up and Pre-Operating row, and income tax. The balance sheet gains Inventory, Intangible assets, Pre-launch costs to be written off and **Payments due under payment plans**.

## 30.5 Scheduling a per-project card

A Per project card with a Start date or a ticked payment plan is a dated payment: the cost (price x Qty) is counted in full in the month of the Start date; the cash leaves by the plan (Deposit & Balance, Instalments, Milestones). The difference is held as prepaid (paid ahead) or as a payment due (paid after). Payments dated before the plan start come off opening cash. A per-project card with neither remains a cost of each project sold. The cost row's When says "Paid in full, May 2027" or "N payments, A to B". A Per unit cost follows the units sold.

## 30.6 Not yet built

Minimum-order floor, customs and other duty lines, percentage commission/bonus extras on people cards, VAT, the Repair Record (use of the contingency fund), and enforcing a Start date on every cost card.

## 30.7 Batch J additions

- **Dates place the cost.** A card's Start date puts a one-time cost in its month, starts a recurring one (monthly, quarterly, annually) in that month, and its End date stops it; a Per project card with a Start date or a plan is one dated payment.
- **A rate is shown as a rate**: a Percentage cost (a payment fee, a royalty, a commission) reads "4%" under "Amount" and "% of revenue" under Frequency, never as money.
- **Rate and floor extras**: Customs duty and Other duties add a line of the goods' own kind (price times the rate); a person's Commission is a calculated line of the revenue it follows; a Minimum order makes a month's purchases at least that many units, the excess carried as stock.
- **The examples** (Lumen & Loom, Quillfield) are in the current structure: every card in its category and group, dated, linked to its Offerings, with their suppliers, activities, Opening Date and Global Settings.
