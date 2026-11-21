# The Workbook — Business Documents

Status: **current design**, written 2026-11-20. The Workbook's first section: the documents the Foundation's answers write that are not figures of money. The financial ones are the next section, Financial Documents (`financial-documents.md`).

> **Keep this document true:** whoever changes a document's parts, a tab or an export changes this file in the same commit and writes the change in the log.

## The panel

- **Tabs:** Business Plan, Business Model Canvas (`GROUP_TABS.business`, `BusinessDocumentsView.tsx`), the same tab component, title and "i" as Financial Documents.
- **The title row** (`WorkbookTools`): three text sizes (Aa) and **Export**, one button with its symbol (owner, 2026-11-09), its menu the formats the document has: Markdown and PDF (a PDF, never HTML: the owner's rule for downloads).
- The document shown below the tabs, as its export prints it, the organisation's name and logo on its cover (`brandPictures`, the Brand System).

## The Business Plan

`businessPlan` (`businessDocuments/plan.ts`), in the standard order: 1. Executive Summary, 2. Company Description, 3. Market Analysis, 4. Products and Services, 5. Marketing and Sales, 6. Operations, 7. Management and Organisation, 8. Strategy and Milestones, 9. Risks, 10. **Financial Documents** (one paragraph naming where they are: the Funding Request, the Financial Plan and the Financial Forecast of the Workbook; one owner per fact, doc 48, section 14), 11. Appendix (the Brand Style Guide).

- What each part reads: the Identity System (the Organisation, the Positioning, Founders & Ownership, Mission, Vision, Values and Principles, Philosophy, Manifesto), the Brand System (the Ambassador's texts, the Style), the Business System (the Segments, Offerings, Competitors, Value Propositions, channels and relationships, capability, the Skills and Cover), the Strategy System (the situation, SWOT, Compass, Themes and their cards). Where the answers collect nothing, the part says so ("Not covered by the Foundation answers"), never made up.
- Its Executive Summary says the plan's figures in a sentence (the funding sought, the expected revenue, the break even).
- **Its export carries the Financial Documents as its appendix** (owner, 2026-11-20 20:47 UTC+2, his decision; doc 48, section 14): the Markdown and the PDF end with "Financial Appendix A: Funding Request", "Financial Appendix A: Funding Request, Financial Projections", "Financial Appendix B: Financial Plan" and "Financial Appendix B: Financial Plan, Costs in Full", and the Financial Forecast at its period, each written by its own code (`businessPlanForExport`); a document whose parts have their own headings takes one appendix section a part, so every heading keeps its level. One switch turns it off (`PLAN_EXPORT_WITH_FINANCIAL_APPENDIX`).
- Formatting: whole amounts, one date format, bold labels (the documents' tests).

## The Business Model Canvas

`businessModelCanvas` (`businessDocuments/canvas.ts`): the nine blocks (Key Partners, Key Activities, Key Resources, Value Propositions, Customer Relationships, Channels, Customer Segments, Cost Structure, Revenue Streams), each a list read from the Business System: the partners and suppliers with their kind, the activities, the resources by kind, each Segment's Value Proposition, the relationships by Offering, the channels by kind, the Segments with their Profiles, the costs by group, the revenue streams with their prices.

## Where it is in the code

`src/components/workbook/BusinessDocumentsView.tsx`, `src/framework/engine/businessDocuments/plan.ts`, `canvas.ts`, `reading.ts`, `src/framework/engine/export/ExportRenderers.ts`; its tests `src/framework/engine/BusinessDocuments.test.ts`, the golden file of `FounderPeriod.test.ts`.
