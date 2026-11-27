# The Workbook — the page and its sections

Status: **current design**, written 2026-11-20, updated 2026-11-27 (the Loan Repayments under the Cash-Flow Forecast; its sections, one file each until 2026-11-21, are below). The Workbook is one page of the app drawn as a dialog (layout rules, section 7, "The Workbook"): the title "Workbook" over its rule, one framed panel with the carousel arrows and a tab of bullets, a section a bullet. It opens from the header's **Workbook** button on every page with an Organisation open, and from the Landing page, where it covers every Organisation (`src/pages/Workbook.tsx`).

Each file here describes the app as it is; where it and the code differ, both are mended in one commit with a row in the log (`design/records/01-log.md`). The documents' contents are the engine's (`src/framework/engine/businessDocuments/`); their rules are Questions 20, section 14, for the financial ones, and the Business System's specifications for what each page feeds them.

## The sections

| Section | Shown | Specification | Built by |
|---|---|---|---|
| Business Documents | an Organisation open | [the section below](#the-section-business-documents) | `BusinessDocumentsView` (`group="business"`) |
| Financial Documents | an Organisation open; second, under Business Documents (owner, 2026-11-20 20:46 UTC+2) | [the section below](#the-section-financial-documents) | `BusinessDocumentsView` (`group="financial"`) |
| Review | an Organisation open | [the section below](#the-section-review) | `OrganizationReview` |
| References | the Handbook only (below) | [the section below](#the-section-references-and-glossary) | `Workbook.tsx` |
| Glossary | always; in the Handbook, the app's terms alone | [the section below](#the-section-references-and-glossary) | `GlossaryList` |
| Card Notes | an Organisation open; last | [the section below](#the-section-card-notes) | `Workbook.tsx` |

The rail's order is the order above with an Organisation open (`["documents", "financial-documents", "review", "glossary", "card-notes"]`). A section's title is the panel's heading, with its "i" (`GLOSSARY_INFO`) for the Glossary, the References and both kinds of document.

## The Handbook: the Landing page's book

**The Handbook** (owner, 2026-11-22 18:58 and 19:31 UTC+2: "I want a 'workbook' (possibly different name) for the app, that would exist at the landing page. So the references would exist only in this one, Glossary App only, and the App Guide, Specs & Limitations, and Future Features"; "Handbook sounds good"; "the extra tabs text are necessary for the app user, not the founders!"; rule | was | now: one owner for each fact | the Landing page's Workbook held the Total review, the References and every Organisation's Glossary, and each Organisation's Workbook held the References again | the Handbook, the Landing page's header button, holds the **App Guide**, **Specs & Limitations**, **Future Features** (their text in `src/data/handbook.ts`, written to the app's user), the **Glossary** of the app's terms alone and the **References**, which leave the Organisation's Workbook; a source asked for inside an Organisation (an "i"'s citation, a Glossary citation) opens the Handbook's References, Back returning there; the Total review left the Landing page, each Organisation's Review being in its own Workbook; it came back into the Handbook on 2026-11-22 at 20:35 UTC+2 (Records 1), as below). The same code draws both (`landing` in `Workbook.tsx`); Back returns to where it was opened from.

## What the Workbook reads

Every System's saved answers, the Global Settings and the Organisation's name (`OrganizationService`); it writes nothing but the reader's choices (the tab, the funnels, the text size, the Forecast's period), none of them saved with the answers.

## The section: Business Documents

The Workbook's first section: the documents the Foundation's answers write that are not figures of money. The financial ones are the next section, Financial Documents ([the section below](#the-section-financial-documents)).

> **Keep this document true:** whoever changes a document's parts, a tab or an export changes this file in the same commit and writes the change in the log.

### The panel

- **Tabs:** Business Plan, Business Model Canvas (`GROUP_TABS.business`, `BusinessDocumentsView.tsx`), the same tab component, title and "i" as Financial Documents.
- **The title row** (`WorkbookTools`): three text sizes (Aa) and **Export**, one button with its symbol (owner, 2026-11-09), its menu the formats the document has: Markdown and PDF (a PDF, never HTML: the owner's rule for downloads).
- The document shown below the tabs, as its export prints it, the organisation's name and logo on its cover (`brandPictures`, the Brand System).

### The Business Plan

`businessPlan` (`businessDocuments/plan.ts`), in the standard order: 1. Executive Summary, 2. Company Description, 3. Market Analysis, 4. Products and Services, 5. Marketing and Sales, 6. Operations, 7. Management and Organisation, 8. Strategy and Milestones, 9. Risks, 10. **Financial Documents** (one paragraph naming where they are: the Funding Request, the Financial Plan and the Financial Forecast of the Workbook; one owner per fact, Questions 20, section 14), 11. Appendix (the Brand Style Guide).

- What each part reads: the Identity System (the Organisation, the Positioning, Founders & Ownership, Mission, Vision, Values and Principles, Philosophy, Manifesto), the Brand System (the Ambassador's texts, the Style), the Business System (the Segments, Offerings, Competitors, Value Propositions, channels and relationships, capability, the Skills and Cover), the Strategy System (the situation, SWOT, Compass, Themes and their cards). Where the answers collect nothing, the part says so ("Not covered by the Foundation answers"), never made up.
- Its Executive Summary says the plan's figures in a sentence (the funding sought, the expected revenue, the break even).
- **Its export carries the Financial Documents as its appendix** (owner, 2026-11-20 20:47 UTC+2, his decision; Questions 20, section 14): the Markdown and the PDF end with "Financial Appendix A: Funding Request", "Financial Appendix A: Funding Request, Financial Projections", "Financial Appendix B: Financial Plan" and "Financial Appendix B: Financial Plan, Costs in Full", and the Financial Forecast at its period, each written by its own code (`businessPlanForExport`); a document whose parts have their own headings takes one appendix section a part, so every heading keeps its level. One switch turns it off (`PLAN_EXPORT_WITH_FINANCIAL_APPENDIX`).
- Formatting: whole amounts, one date format, bold labels (the documents' tests).

### The Business Model Canvas

`businessModelCanvas` (`businessDocuments/canvas.ts`): the nine blocks (Key Partners, Key Activities, Key Resources, Value Propositions, Customer Relationships, Channels, Customer Segments, Cost Structure, Revenue Streams), each a list read from the Business System: the partners and suppliers with their kind, the activities, the resources by kind, each Segment's Value Proposition, the relationships by Offering, the channels by kind, the Segments with their Profiles, the costs by group, the revenue streams with their prices.

### Where it is in the code

`src/components/workbook/BusinessDocumentsView.tsx`, `src/framework/engine/businessDocuments/plan.ts`, `canvas.ts`, `reading.ts`, `src/framework/engine/export/ExportRenderers.ts`; its tests `src/framework/engine/BusinessDocuments.test.ts`, the golden file of `FounderPeriod.test.ts`.

## The section: Financial Documents

The Workbook's second section (owner, 2026-11-20 20:46 UTC+2: "At the Workbook separate the Business and the Financial Documents. Make the Financial Documents with tabs just like the Business Documents."): the records the Financials page works out, which the page no longer shows (Questions 20, section 14: the page asks, the documents record).

> **Keep this document true:** whoever changes a document's parts, a tab or an export changes this file and Questions 20, section 14, in the same commit, with a row in the log.

### The panel

The same panel, title, "i", text sizes, Export and tabs as Business Documents (`BusinessDocumentsView`, `group="financial"`). **Tabs:** Financial Forecast, Funding Request, Financial Plan (`GROUP_TABS.financial`). Each exports as Markdown and PDF; the Forecast as CSV too. A Glossary place for the break even, the contribution margin, the cash runway or the funding gap opens this section at its tab (`glossary.ts`, `document`).

### Financial Forecast

`businessForecastContent` (`businessDocuments/forecast.ts`) at the period chosen above it: **Annually** (the default), **Quarterly** or **Monthly**. Its tables, each in the shared `ForecastTable` (its caption kept in view while a monthly table scrolls sideways): the Profit & Loss, the Profit Kept in the Business (the owner's drawings where the legal form takes them), the Balance Sheet, the Cash-Flow Forecast, then, where a loan is recorded, the **Loan Repayments** under it (each loan, its status and whether its repayments are counted in the table, then the rule that decides it: `loanRepaymentNotes`, `engine/financial/position.ts`; owner, 2026-11-27 03:16 UTC+2), then **two charts under the Cash-Flow Forecast**: the **Funding Timeline** and the **Revenue-Adjusted Financial Position** (`CashTimelineChart`), each once; then the Notes. The figures: the one forecast (`FinancialForecast.ts`), the same the Business Plan's summary and the golden file read.

### Funding Request

`fundingRequest` (`businessDocuments/plan.ts`), two parts:

1. **Funding Request:** a sentence (what is sought towards what gap, or the need covered); the funding need, what is available now, what is confirmed still to arrive, the gap, the amount sought and what is still short after it; **Use of Funds** (Establishment, Operating, Offering with their amount and months, the total); **Cash to Raise Before the Opening** (the Capital Expenditure, Startup Expenses, Pre-Operating Expenses, the Total Pre-operational Budget, the Startup Contingency Fund, the opening inventory, the total) and the **Operational Contingency Fund** (the target, the running costs a month, what is set aside each month, what is held at the opening, the months to reach the target), once there is an Opening Date (`contingencyFunds`; their rates and target are inputs of the Global Settings); **Sources of Funds** (each source's type, amount, status, received and terms; the debt and equity; the period covered; the repayment).
2. **Financial Projections:** Year 1 by quarter, then by plan year, from the forecast: the Profit & Loss, the Profit Kept in the Business, the Balance Sheet, the Cash Flow, the Capital Expenditure and the Assumptions.

### Financial Plan

`financialPlan` (`businessDocuments/plan.ts`), three parts:

1. **Financial Plan:** the Funding Need (with its month-by-month table, its Loan repayments column only while a loan is recorded), the Capital & Funding, the Financial Position, the Revenue, the **Break Even** (the point, the time, the sustainability) with the **Stress Test** table (its four cases, each with its break even, lowest cash and shortfall).
2. **Each Offering's Economics** (2026-11-21; Questions 20, 15.4): how the running costs are shared (each Offering's own, then a rate for each of the founders' delivery hours available), then a row an Offering sold: Price, Direct cost, Contribution, Full cost, Margin, Sales a month (`offeringEconomicsOf`). Left out where no Offering is sold yet.
3. **Costs in Full:** the costs by group, with their subtotals and the total, without their source.

### Where it is in the code

`src/components/workbook/BusinessDocumentsView.tsx`, `src/components/workbook/ForecastTable.tsx`, `src/framework/engine/businessDocuments/forecast.ts`, `plan.ts`, `reading.ts`, `src/framework/engine/export/ExportRenderers.ts`, `ContingencyFunds.ts`; the tests `src/framework/engine/BusinessDocuments.test.ts`, `src/pages/Workbook.test.tsx`.

## The section: Review

The Workbook's Review section: what is still to answer, worth a second look, missing from the documents, and the dates that matter, for the open Organisation; from the Landing page, the **Total review** of every Organisation.

> **Keep this document true:** whoever changes a group, an item's rule or "Go there" changes this file in the same commit, with a row in the log.

### What it shows

One column (`.glossary-page`), each Organisation a section headed by its name, then four groups (`OrganizationReview.tsx`):

| Group | What it lists |
|---|---|
| Still open | the questions and cards not answered yet, page by page |
| Worth a second look | answers that contradict or outrun others (an Objective outside the Strategic Period, the period beside the Financial Plan, a skill not covered …) |
| Key dates | the Opening Date, the business stage and the dates the answers set |
| Missing from the documents | what a document part needs and the answers do not hold yet |

Each item's **Go there** opens the page, card or field it is about (the field keys: `FieldKeys.ts`). Every gap, head and count is a token of the layout (layout rules, the Review: section 7, "The Review"); an Organisation's head and a group's head are the shared `FoldHead`, one count style; a group's count that repeats the Organisation's is left out; the key dates are never counted.

### The Total review (from the Landing page)

The header is the Landing page's (only the Workbook button); every Organisation in the Landing page's order, each its own section; with two Organisations or more, the Glossary's funnel chooses which show (`ResponsibilityFilter`). "No Organisations to show: the funnel leaves them all out." when none is ticked.

### Where it is in the code

`src/components/workbook/OrganizationReview.tsx`, `src/framework/engine/ReviewItems.ts`, `src/pages/Workbook.tsx`; the tests `src/pages/Review.test.tsx`, `src/pages/Workbook.test.tsx`.

## The section: References and Glossary

Two sections of the Workbook that explain the app's words and its sources.

> **Keep this document true:** whoever changes a term, a place, a source or a funnel changes this file in the same commit, with a row in the log.

### References

Every source the app cites, as a Harvard reference list, from A to Z, filed by the first letter of its first author (`letterOf`). The funnel chooses the letter ranges. Its "i": "Every source the app cites, from A to Z. The funnel shows the letter ranges you choose." (`GLOSSARY_INFO`). The sources are the one list of `src/framework/engine/Sources.ts`; the rule for which sources an option may cite is the collaboration rules' rule 14 (official government documents for classification inputs; business-school or university documents for plain options). A citation in the Glossary opens its reference here.

### Glossary

Every term from A to Z, in two kinds (`GlossaryList.tsx`):

- **The app's words**, in blue, each with its meaning and its sources (`src/data/glossary.ts`) and, where a page or a document says it, its **places**: a place on a page opens that page at its tile; a place in a Financial Document (the break even, the contribution margin, the cash runway, the funding gap) opens the Workbook's Financial Documents at its tab (`document`; "Workbook, Financial Documents").
- **The names the founder gave**, in terracotta (an Organisation, a Segment, an Offering, a card), each with "Open the …"; from the Landing page, every Organisation's names, each named with its Organisation ("Offering of Quillfield Automation").

The funnel chooses the kinds and the letter ranges. Its "i": "Every word the app uses and every name you gave, from A to Z. The funnel shows either kind, or both, and the letter ranges." Wording: UK English, affirmative (the help texts' rules, Interface 10).

### Where it is in the code

`src/components/workbook/GlossaryList.tsx`, `src/data/glossary.ts`, `src/framework/engine/Sources.ts`, `src/pages/Workbook.tsx`; the test `src/pages/Workbook.test.tsx`.

## The section: Card Notes

The Workbook's last section, with an Organisation open: the Notes field of every card, page by page.

> **Keep this document true:** whoever changes what a card note holds or where a press leads changes this file in the same commit, with a row in the log.

- **What it lists:** each card's Notes that holds text (a card's last field; layout rules, section 7, rule 11), under its page and its card's name (`CardNotesService`, `WorkbookCardNotes`; Interface 3).
- **The funnel** chooses the pages shown.
- **A press** on a note opens its card, on its page, floating where the card floats (layout rules, section 8, "One way to present a card").
- **Kept apart:** the Notes panel of the header holds the person's own notes, each linked to a page, card or field; it is not this section (layout rules, section 7, "Notes (the side window)").

### Where it is in the code

`src/components/notepad/Notepad.tsx` (`WorkbookCardNotes`), `src/services/CardNotesService.ts`, drawn by `src/pages/Workbook.tsx`; the tests `src/services/cardServices.test.ts`, `src/pages/Workbook.test.tsx`.
