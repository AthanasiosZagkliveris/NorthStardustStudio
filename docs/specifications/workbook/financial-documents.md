# The Workbook — Financial Documents

Status: **current design**, written 2026-11-20. The Workbook's second section (owner, 2026-11-20 20:46 UTC+2: "At the Workbook separate the Business and the Financial Documents. Make the Financial Documents with tabs just like the Business Documents."): the records the Financials page works out, which the page no longer shows (doc 48, section 14: the page asks, the documents record).

> **Keep this document true:** whoever changes a document's parts, a tab or an export changes this file and doc 48, section 14, in the same commit, with a row in the log.

## The panel

The same panel, title, "i", text sizes, Export and tabs as Business Documents (`BusinessDocumentsView`, `group="financial"`). **Tabs:** Financial Forecast, Funding Request, Financial Plan (`GROUP_TABS.financial`). Each exports as Markdown and PDF; the Forecast as CSV too. A Glossary place for the break even, the contribution margin, the cash runway or the funding gap opens this section at its tab (`glossary.ts`, `document`).

## Financial Forecast

`businessForecastContent` (`businessDocuments/forecast.ts`) at the period chosen above it: **Annually** (the default), **Quarterly** or **Monthly**. Its tables, each in the shared `ForecastTable` (its caption kept in view while a monthly table scrolls sideways): the Profit & Loss, the Profit Kept in the Business (the owner's drawings where the legal form takes them), the Balance Sheet, the Cash-Flow Forecast, then **two charts under the Cash-Flow Forecast**: the **Funding Timeline** and the **Revenue-Adjusted Financial Position** (`CashTimelineChart`), each once; then the Notes. The figures: the one forecast (`FinancialForecast.ts`), the same the Business Plan's summary and the golden file read.

## Funding Request

`fundingRequest` (`businessDocuments/plan.ts`), two parts:

1. **Funding Request:** a sentence (what is sought towards what gap, or the need covered); the funding need, what is available now, what is confirmed still to arrive, the gap, the amount sought and what is still short after it; **Use of Funds** (Establishment, Operating, Offering with their amount and months, the total); **Cash to Raise Before the Opening** (the Capital Expenditure, Startup Expenses, Pre-Operating Expenses, the Total Pre-operational Budget, the Startup Contingency Fund, the opening inventory, the total) and the **Operational Contingency Fund** (the target, the running costs a month, what is set aside each month, what is held at the opening, the months to reach the target), once there is an Opening Date (`contingencyFunds`; their rates and target are inputs of the Global Settings); **Sources of Funds** (each source's type, amount, status, received and terms; the debt and equity; the period covered; the repayment).
2. **Financial Projections:** Year 1 by quarter, then by plan year, from the forecast: the Profit & Loss, the Profit Kept in the Business, the Balance Sheet, the Cash Flow, the Capital Expenditure and the Assumptions.

## Financial Plan

`financialPlan` (`businessDocuments/plan.ts`), three parts:

1. **Financial Plan:** the Funding Need (with its month-by-month table, its Loan repayments column only while a loan is recorded), the Capital & Funding, the Financial Position, the Revenue, the **Break Even** (the point, the time, the sustainability) with the **Stress Test** table (its four cases, each with its break even, lowest cash and shortfall).
2. **Each Offering's Economics** (2026-11-21; doc 48, 15.4): how the running costs are shared (each Offering's own, then a rate for each of the founders' delivery hours available), then a row an Offering sold: Price, Direct cost, Contribution, Full cost, Margin, Sales a month (`offeringEconomicsOf`). Left out where no Offering is sold yet.
3. **Costs in Full:** the costs by group, with their subtotals and the total, without their source.

## Where it is in the code

`src/components/workbook/BusinessDocumentsView.tsx`, `src/components/workbook/ForecastTable.tsx`, `src/framework/engine/businessDocuments/forecast.ts`, `plan.ts`, `reading.ts`, `src/framework/engine/export/ExportRenderers.ts`, `ContingencyFunds.ts`; the tests `src/framework/engine/BusinessDocuments.test.ts`, `src/pages/Workbook.test.tsx`.
