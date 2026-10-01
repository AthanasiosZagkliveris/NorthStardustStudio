# Workspace features E — helpers for founders (user-approved 2026-09-29)

Same repo, branch, conventions, verification rules (NO screenshots; tests, `tsc`, `build`, and the check scripts ONLY on the screens this batch touches, at 1920 in light and dark (768 only where a layout reflows); the full sweep runs once in the final overall check; localStorage backup/restore) and hard rule as `workspace-A-brief.md` in this folder — read its header first. Batches A–D are committed; build on them. DO NOT merge, push or switch branches. One commit per item.

**Reuse, don't rebuild:** `planOutcomes(values)` and the scenario model (D), `FieldKey`/`openField`/field status line (B0), the Review page (B3), the undo toast (C1), the document engine (BusinessDocuments/ExportRenderers/PdfExporter/MarkdownExporter), the app tooltip (`.app-tooltip`), InfoNote.

## E1. "What would it take?"
- On Business › 5. Sustainability, a quiet panel under the results titled **What would it take?** with three questions, each answered in one line, changing ONE input at a time (the input most directly tied to the goal; state which):
  1. **Break even by** [month picker, default: 12 months after plan start] → "Charge $X per <Offering> (now $Y), or win N <unit> a month (now M)." — per main Offering (largest revenue); if several Offerings, pick the largest and say so.
  2. **Close the funding gap** → "You need $X more funding, or running costs $Y a month lower."
  3. **Never run out of cash** → "Start with $X more, or <the smallest change that works: delay the largest one-time cost to <month>>".
- When a goal is already met: "Already breaking even in Jul 2027." / "No funding gap." / "Cash never runs out."
- Solve with a bounded search (bisection) over `planOutcomes` (no second calculation path); results in whole currency units and one-decimal volumes; unreachable → "Not reachable by changing <input> alone."
- Each answer has **Try this** → creates a scenario (D3) named e.g. "Price $2,750" with that single override and opens it; if 3 scenarios exist, the link is disabled with the reason. Tests: solver correctness against planOutcomes, met/unreachable cases, Try this.

## E2. Lender-ready check
- On the Review page (B3), a first section **Ready for a lender?** with ~10 automatic checks, each ✓ or ○ with one plain sentence and, when open, **Go there** (`openField`). Rules in one module (easy to extend; later an investor list can reuse the mechanism). Suggested rules (verify each against the data model; drop any that can't be evaluated reliably):
  1. Three years of projections (plan length ≥ 3 years and revenue recorded).
  2. Founders' own capital recorded.
  3. Monthly loan repayments covered: no month where repayments exceed the operating result + cash (state the worst month and amount).
  4. Funding gap closed or funding sought covers it.
  5. Use of funds listed (Funding Need rows).
  6. Management experience described for every founder (Founders Profile).
  7. Market Size & Industry Outlook answered and not flagged "Not sure/Needs research".
  8. Pricing set for every Offering.
  9. Legal entity registered or formation planned with a date.
  10. No required Foundation sections incomplete.
- Also one line on System Selection's Business Documents card: "Lender check: 8 of 10" linking to the Review section. Not a score elsewhere; never blocks. Tests per rule.

## E3. Executive One-Pager and elevator pitch
- A fourth tab on Business Documents, **One-Pager**, with the same export (PDF, Markdown) as the other documents and the same paper look (stays white in every theme).
- One A4 page: logo (if uploaded), organization name and one-line positioning; **Problem**, **Solution**, **Market** (main Segment + market size first sentence), **Business model** (Offerings with price), **Team** (one line per founder: name, role, years/experience first sentence), **Key numbers** (small table: revenue and profit per plan year, break-even month, funding need), **Funding ask** (amount sought, use of funds, sources). Each block: first sentence(s) of the user's own answers, trimmed to fit; missing → "Not covered by the Foundation answers." The page must fit one A4 in the PDF (measure; shorten by rules, never overflow).
- **Elevator pitch:** a short paragraph at the top of the tab (not in the PDF page unless it fits) assembled from Positioning, Value Proposition and main Segment by template ("<Name> helps <segment> <value>…"), with a **Copy** button (clipboard with fallback select). Deterministic, the user's own words, no AI. Tests.

## E4. Glossary hints
- One content file (`src/assets/Glossary.md` or JSON) with ~40 business/finance/legal terms used in the Foundation (break-even, runway, funding gap, working capital, gross margin, operating profit, cash flow, pass-through, owner's drawings, EIN, VAT/sales tax, principal, amortisation, balance sheet, current liability, segment, value proposition, positioning, KPI, baseline, churn/retention, CAC, conversion rate, capacity, …), each with a one-sentence plain definition (British/US spelling as the app uses).
- A shared text renderer marks the FIRST mention per page of a glossary term (case-insensitive, whole word, plural-aware) in help/instruction text, ⓘ notes, field labels and the documents' on-screen view (not inside inputs, not in PDFs/exports) with a faint dotted underline; hover/focus shows the definition in the app tooltip style; keyboard focusable; `aria-describedby`. Never inside links/buttons. Tests: matching rules, first-mention-only, no marking in inputs/exports.

## Report
Reply with only: Status, commits, one-line test summary, concerns, then a concise report per item.

## References (user requirement — applies to E2 and E4; the global rule and allowlist from batch B item BR apply — use its `Source` type and pass its URL test)
Every lender-check rule (E2) and every glossary definition (E4) must cite at least one **valid, authoritative reference**, shown to the user as a "Source" link (reuse InfoNote's `href` source-link mechanism / the app's external-link opener) with the publisher's name, e.g. "Source: U.S. Small Business Administration".
- **Accept only:** official government and regulator sites (e.g. sba.gov, irs.gov, sec.gov, investor.gov, consumerfinance.gov, gov.uk incl. HMRC and Companies House, europa.eu, national statistics offices, central banks), official standard setters (IFRS Foundation, FASB), universities and their official business schools, libraries, extension or small-business-development centres (.edu / .ac.uk and equivalents), and official professional bodies (e.g. AICPA, ACCA, ICAEW). SCORE counts only as an SBA resource partner page with an identifiable author/organisation.
- **Reject:** open-edit or anonymous sources (Wikipedia, forums, Q&A sites), content farms and marketing blogs, and commercial explainer sites without an identifiable expert author and editorial standards (e.g. Investopedia, CFI, generic "glossary" sites). If no acceptable source exists for a term or rule, drop it or reword it to what an acceptable source supports.
- **Verify every link** (WebFetch it): it must load, be on the publisher's official domain, and actually support the definition/rule as worded; prefer stable pages (not news/PDF-of-the-day). Record for each: title, publisher, URL, date checked — keep them in the glossary/rules data file (not in code comments).
- Definitions are written in our own words (short, plain) and must agree with the cited source; no copying beyond a short phrase.
- In the report, list every reference (term/rule → publisher → URL) and any items dropped for lack of an acceptable source.
