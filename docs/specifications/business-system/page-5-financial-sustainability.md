# Business System — Page 5: Financial Sustainability
## Design & Development Prompt

> **3. Business System — Page 5 of 5.**
> Was labelled "Page B", with **Page 4 — Financial Foundation**
> called "Page A" throughout. The second of the two Financial
> pages.

## 1. Page Purpose

Create **Page 5 — Financial Sustainability** as the second of the two Financial pages of the Business System.

The page follows **Page 4 — Financial Foundation**, which establishes the organisation's costs, funding needs, capital and funding sources, and financial position.

Financial Sustainability answers a different question:

> **Can the organisation generate enough revenue, and generate it early enough, to sustain itself before its available financial resources are exhausted?**

The page should connect **Revenue** with **Break Even** and evaluate both against the organisation's financial timeline.

The page is intended primarily for organisations under development and organisations in their early years, from a single founder to small teams. It must work for organisations that have not launched yet, organisations beginning operations, and organisations that already have some early revenue.

### Design philosophy

**Simple by default, realistic when necessary.**

A one-person organisation should be able to complete the page with a small number of revenue assumptions and receive a useful result. More detailed controls should appear progressively when the organisation has multiple Offerings, staged revenue, project-based payments, or more complex cost structures.

Do not turn this page into accounting, bookkeeping, CRM, sales-management, or professional financial forecasting software.

---

# 2. Relationship with Financial Foundation

Page 5 must use information already established in Page 4 rather than asking the user to recreate it.

### Page 4 — Financial Foundation

Answers:

> **What does the organisation need financially, how will it be funded, and how long can those resources support it?**

It establishes:

- Costs
- Funding Need
- Capital & Funding
- Financial Position
- Available and expected funds
- Funding timing
- Financial runway / exhaustion risk

### Page 5 — Financial Sustainability

Answers:

> **Can revenue develop sufficiently and quickly enough for the organisation to become financially sustainable before its available resources are exhausted?**

It establishes:

- Revenue Streams
- Pricing and revenue model
- Expected revenue
- Revenue development over time
- Break-Even Point
- Break-Even Time
- Sustainability Buffer
- Sustainability status

Do not treat funding as revenue.

Grants, investments, founder capital, loans, and other funding sources remain financing sources. They may extend the organisation's financial capacity, but they must not artificially increase revenue or make the break-even calculation appear healthier.

---

# 3. Page Structure

Use two main sections:

1. **Revenue**
2. **Break Even**

The sections should be visually distinct but clearly connected.

Recommended flow:

**Offerings → Revenue Streams → Revenue Development → Break-Even Requirement → Break-Even Time → Financial Sustainability**

---

# 4. Section 1 — Revenue

## Purpose

Define how each existing Offering is expected to generate revenue and how that revenue is expected to develop over time.

The section should answer:

> **What generates revenue, how much does it generate, how is it priced, and when is the revenue expected to occur?**

Do not recreate Offerings here. Every revenue stream should reference an existing Offering.

---

## 4.1 Revenue Stream

Allow the user to add one or more Revenue Streams.

Each Revenue Stream should contain:

### Offering
Select an existing Offering from the Foundation (Page 1).

### Revenue Model
Use a conservative predefined list:

- Product Sale
- Service Fee
- Subscription
- Licence
- Commission
- Usage-based
- Project / Contract
- Other

Do not create an unnecessarily long list. The purpose is to help the user identify the basic way money is generated.

### Price
The amount charged for the relevant revenue unit.

### Revenue Unit
Define what the price applies to, such as:

- Product
- Project
- Session
- Participant
- Licence
- Subscription
- Other

### Frequency
Use a limited list:

- One-time
- Per sale
- Monthly
- Quarterly
- Annually
- Per project
- Per contract
- Usage-based
- Other

### Expected Volume
The expected number of units within the selected period.

The system should calculate expected revenue from the defined price, volume, unit and frequency rather than requiring the user to manually calculate totals.

---

# 5. Revenue Development Over Time

Revenue must not be treated as a static mature-state number.

An organisation under development may initially have:

- no revenue
- a delayed first sale
- a gradual increase in customers
- irregular project revenue
- staged payments
- an expected operating level reached later

Therefore the page must account for **when revenue begins and how it develops**.

## Revenue Timeline

Allow the user to establish, at an appropriate level of simplicity:

- When revenue is expected to begin
- Initial expected volume
- Expected development toward normal operating volume
- Expected normal volume

For simple organisations, the system should allow a straightforward assumption such as:

> €2,000/month beginning in Month 3.

For organisations that need more detail, allow revenue to vary by period.

Example:

| Period | Expected Activity | Expected Revenue |
|---|---:|---:|
| Month 1 | 0 projects | €0 |
| Month 2 | 1 project | €800 |
| Month 3 | 2 projects | €1,600 |
| Month 4 | 3 projects | €2,400 |
| Month 5 | 4 projects | €3,200 |

The system should calculate the resulting revenue timeline automatically.

Do not require detailed monthly forecasting if the user does not need it. Use progressive disclosure.

---

# 6. Revenue Timing

Revenue generation and cash availability are not necessarily identical.

Where relevant, allow the user to define when payment is received.

For example:

- Full payment upfront
- Payment on completion
- Split payment
- Milestone payment
- Other

This is especially important for project-based organisations.

Example:

A €3,000 project may generate €3,000 of revenue but provide:

- €1,500 at project start
- €1,500 at completion

The system should not assume that the entire amount is immediately available when timing information is provided.

Keep this optional and progressive. Do not turn the section into an accounts-receivable system.

---

# 7. Revenue Summary

Provide a calculated summary of expected revenue.

Example:

| Revenue Stream | Price | Expected Volume | Expected Revenue |
|---|---:|---:|---:|
| Offering A | €800 / project | 3 / month | €2,400 |
| Offering B | €45 / sale | 15 / month | €675 |
| Offering C | €250 / session | 2 / month | €500 |
| **Total** | | | **€3,575 / month** |

Where multiple Offerings exist, show revenue by Offering and total expected revenue.

Optionally show each Offering's percentage of total expected revenue as a decision-support indicator.

Do not build a detailed analytics dashboard.

---

# 8. Section 2 — Break Even

## Purpose

Determine the level of revenue or activity required for the organisation's revenue to cover its costs.

The section should answer:

> **How much must the organisation sell or deliver before it covers its costs?**

And, critically:

> **When is it expected to reach that level?**

---

# 9. Break-Even Cost Inputs

Break-even calculations should use cost information from Page 4.

Do not ask the user to recreate the same costs.

Use the cost classification established in Financial Foundation:

- Fixed
- Variable
- Semi-variable

## Fixed Costs

Use costs identified as fixed.

These generally do not change with the level of sales or activity within the relevant period.

## Variable Costs

Use costs that vary with the level of activity.

For an Offering, determine the variable cost associated with one relevant revenue unit where possible.

## Semi-variable Costs

Where possible, encourage the user to separate semi-variable costs into fixed and variable components.

Do not force unnecessary complexity. If the cost cannot reasonably be separated, retain it as semi-variable and handle it conservatively in the calculation or flag that the break-even result is an estimate.

---

# 10. Break-Even Point

For a simple Offering, calculate:

**Break-Even Quantity = Fixed Costs ÷ (Price per Unit − Variable Cost per Unit)**

Where:

- **Fixed Costs (F)** = fixed costs for the selected period
- **Price per Unit (p)** = revenue received for one unit
- **Variable Cost per Unit (u)** = variable cost associated with one unit

The difference between price and variable cost is the **Contribution per Unit**.

Example:

- Fixed Costs = €2,000/month
- Price = €800/project
- Variable Cost = €100/project
- Contribution = €700/project
- Break-Even Quantity = approximately 2.86 projects

Therefore the organisation needs approximately **3 projects per month** to cover its costs.

The system should present the result in practical language rather than exposing the formula alone.

For example:

> **Break-even: approximately 3 projects per month**

---

# 11. Break-Even Revenue

Also calculate the revenue level required to cover costs.

For a simple model:

**Break-Even Revenue = Fixed Costs ÷ Contribution Margin**

The exact calculation should remain consistent with the selected period and revenue model.

All values used in a break-even calculation must refer to the same time period.

For example, do not compare annual fixed costs with monthly contribution without converting them to a common period.

Present both, where meaningful:

- Break-Even Revenue
- Break-Even Activity

Example:

> **Break-even revenue: €2,100/month**
>
> **Equivalent activity: approximately 3 projects/month**

---

# 12. Multiple Offerings

When an organisation has multiple Offerings, do not assume that each Offering independently represents the organisation's complete break-even position.

Provide two levels where appropriate:

### Offering Break Even

Shows the contribution and break-even implications of an individual Offering.

### Organisation Break Even

Shows the overall revenue/activity required for the organisation to cover its fixed costs.

When multiple Offerings contribute to the organisation's revenue, the overall result should consider the expected revenue mix rather than simply adding independent break-even quantities.

Keep the underlying calculation understandable and avoid building a complex financial modelling system.

---

# 13. Break-Even Time

This is a core requirement of the page.

A monthly break-even figure alone is not sufficient for an organisation under development.

The system must determine:

> **When is the organisation expected to reach break even?**

Use the Revenue Development timeline and the relevant costs to identify the first period in which expected revenue/activity is sufficient to cover the required costs.

Example:

| Month | Expected Revenue | Costs | Position |
|---|---:|---:|---|
| 1 | €0 | €2,000 | Below Break Even |
| 2 | €800 | €2,100 | Below Break Even |
| 3 | €1,600 | €2,200 | Below Break Even |
| 4 | €2,400 | €2,300 | Break Even |
| 5 | €3,200 | €2,400 | Above Break Even |

Result:

> **Expected Break-Even Time: Month 4**

The calculation must use the actual revenue and cost timing where such information has been provided.

---

# 14. Financial Exhaustion

The Page must use the financial position established in Page 4 to determine when the organisation's available financial resources are expected to be exhausted.

This should consider, where information exists:

- Available funds
- Confirmed future funding
- Funding timing
- Costs by period
- Expected revenue timing
- Loan repayments
- Other known financial obligations

The system should identify the point at which available financial resources would reach zero or become insufficient to continue operating under the current assumptions.

Call this:

**Financial Exhaustion Date / Period**

Do not confuse this with break even.

An organisation can:

- reach break even before financial exhaustion
- reach break even after financial exhaustion
- never reach break even under the current assumptions

---

# 15. Sustainability Comparison

The most important output of Page 5 is the comparison between:

### Break-Even Time
When the organisation is expected to become self-sustaining from its operations.

### Financial Exhaustion
When its available financial resources are expected to run out.

These two dates/periods must be compared.

## Scenario A — Sustainable Before Exhaustion

Example:

> Break Even: Month 5  
> Financial Exhaustion: Month 8

Result:

**Sustainable before financial exhaustion**

The organisation reaches break even approximately three months before its current financial resources are expected to be exhausted.

---

## Scenario B — Exhaustion Before Break Even

Example:

> Break Even: Month 8  
> Financial Exhaustion: Month 4

Result:

**Financial Risk**

The organisation is expected to exhaust its available financial resources before reaching break even.

This should indicate that additional funding, lower costs, earlier revenue, higher pricing, greater sales volume, or another change may be required.

Do not prescribe a single solution automatically.

---

## Scenario C — Already Sustainable

If expected revenue already covers the relevant costs:

> **Currently Above Break Even**

The system can still show the expected financial margin and the distance from exhaustion if applicable.

---

## Scenario D — Break Even Not Expected

If the current revenue assumptions never reach the break-even requirement within the defined planning period:

> **Break Even Not Reached**

The system should clearly state that the current assumptions do not show a path to break even within the selected period.

Do not claim that the organisation will fail. The result is based only on the current assumptions.

---

# 16. Sustainability Buffer

When break even occurs before financial exhaustion, calculate:

**Sustainability Buffer = Financial Exhaustion Period − Break-Even Period**

Example:

- Break Even: Month 5
- Financial Exhaustion: Month 8
- Sustainability Buffer: 3 months

Present this as a practical indicator:

> **3 months of financial buffer after expected break even**

This helps the founder understand how much time exists between becoming sustainable and exhausting current resources.

---

# 17. Revenue and Financial Runway Must Work Together

Page 4 may calculate a runway based on available funds and costs.

Page 5 should refine that picture by incorporating expected revenue.

Therefore distinguish between:

### Gross / Funding Runway

How long the organisation can continue based on available funds and known outflows.

### Revenue-Adjusted Financial Position

How the financial position changes when expected revenue is received at the expected times.

The final sustainability assessment should use the revenue-adjusted position where sufficient information exists.

This is especially important when the organisation begins with low or zero revenue.

---

# 18. Early-Stage Organisations and Zero Revenue

The system must work correctly when:

**Expected Revenue = €0**

This is a valid situation for an organisation under development.

In that case:

- Break-Even Time cannot be reached from revenue
- Financial exhaustion can still be calculated
- Funding requirements remain visible
- The system can show how long the organisation can continue under its current financial position

Do not treat zero revenue as an invalid or incomplete model.

---

# 19. Decision-Support Summary

At the end of the page, provide a concise financial sustainability summary.

Example:

## Financial Sustainability

| Indicator | Result |
|---|---:|
| Expected Monthly Revenue | €3,575 |
| Break-Even Revenue | €3,200 |
| Break-Even Activity | 3 projects/month |
| Expected Break-Even | Month 5 |
| Financial Exhaustion | Month 8 |
| Sustainability Buffer | 3 months |

### Status

**Sustainable before financial exhaustion**

> Based on the current assumptions, expected revenue is projected to reach break even in Month 5, approximately three months before available financial resources are expected to be exhausted.

---

# 20. Decision Signals

Use a small number of clear signals rather than a complex dashboard.

Potential signals:

- **Above Break Even**
- **Below Break Even**
- **Break Even Not Reached**
- **Sustainable Before Exhaustion**
- **Financial Risk**
- **Limited Sustainability Buffer**
- **Revenue Not Yet Established**
- **Funding Dependency**

These should be calculated from the information entered rather than manually selected by the user.

---

# 21. Important Financial Rules

The system must follow these rules:

1. **Funding is not Revenue.**
2. **Loans are not Revenue.**
3. **Founder capital is not Revenue.**
4. **Grants and investments are financing sources, not sales revenue.**
5. **Loan principal repayments are financing cash outflows, not operating costs.**
6. **Loan interest is a financial cost and should be treated separately from principal.**
7. **Break-even calculations must use consistent time periods.**
8. **Fixed and variable costs must remain distinguishable.**
9. **Revenue timing matters.**
10. **Funding timing matters.**
11. **Cost timing matters.**
12. **Revenue may initially be zero.**
13. **Break-Even Point and Break-Even Time are different measures.**
14. **Financial Exhaustion and Break-Even Time must be compared.**
15. **Calculated results should be presented as estimates based on the user's assumptions, not guarantees.**

---

# 22. Scope Boundaries

Do not turn Financial Sustainability into:

- bookkeeping
- accounting
- invoicing
- accounts receivable/payable
- bank reconciliation
- payroll management
- tax accounting
- detailed sales CRM
- detailed sales pipeline management
- investment portfolio management
- full debt management
- professional financial forecasting
- full financial statements

The page is a **decision-support model for founders and small organisations**, not an accounting or treasury system.

---

# 23. Final Concept

The two Financial pages should work as one connected model:

## Page 4 — Financial Foundation

**Costs → Funding Need → Capital & Funding → Financial Position**

Answers:

> **Can we establish and finance the organisation, and how long can our available resources support it?**

## Page 5 — Financial Sustainability

**Offerings → Revenue → Revenue Development → Break Even → Sustainability**

Answers:

> **Can the organisation generate enough revenue, soon enough, to become self-sustaining before its available resources are exhausted?**

The central relationship is:

**Financial Capacity ↔ Revenue Development ↔ Break Even**

The page should therefore not present break even as an isolated mathematical calculation. It should connect **how much revenue is required**, **how much revenue is expected**, **when that revenue is expected**, and **how long the organisation can financially survive**.

The final objective is to help a founder make a practical decision:

> **Under the current assumptions, can this organisation become financially sustainable before it runs out of money?**
