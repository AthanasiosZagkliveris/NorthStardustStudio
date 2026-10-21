# 2. References

Status: **current**, 2026-10-14. Every decision in the app and in these documents should rest on a reference. This document holds the rule for what counts as a reference, the references the app itself shows, and the references used in the research and analysis.

## 2.1 The source rule

Two rules apply together.

**The app's rule (user rule, 2026-09-29, enforced in `src/framework/engine/Sources.ts` and tested by `Sources.test.ts`).** Every reference the app shows (the "Source:" and "Based on:" links in an "i" note; later the help text, document notes, glossary and checklists) is a `Source` with a title, the publisher, the address and the date it was last opened and found to support the note.

- **Accepted:** official government and regulator sites (for example sba.gov, irs.gov, sec.gov, investor.gov, consumerfinance.gov, bls.gov, census.gov, gov.uk including HMRC and Companies House, europa.eu, national statistics offices, central banks); official standard setters (IFRS Foundation, FASB, W3C); universities and their business schools, libraries, law institutes, extension and small-business-development centres (.edu, .ac.uk and equivalents); official professional bodies (AICPA, ACCA, ICAEW, CIMA); SCORE only as an SBA resource partner page with an identifiable organisation; university-hosted open textbooks (OpenStax at Rice University) only where the page names its academic authors.
- **Rejected:** open-edit or anonymous sources (Wikipedia, forums, Q&A), content farms, marketing blogs, vendor sites, and commercial explainer or training sites (Corporate Finance Institute, Wall Street Prep, WallStreetMojo, Investopedia, Klipfolio, Umbrex and the like).
- A domain on the list is necessary, not sufficient: the page must be the organisation's own and must support the exact wording it is cited for. `Sources.test.ts` scans every source file and content Markdown for external addresses and fails on any whose domain is not accepted.

**The research rule (user rule, 2026-10-14).** For research and analysis: strong sources are peer-reviewed journal articles found in academic databases, books published by university presses, and official statistical data from government portals. Each source is judged with the **CRAAP test**: Currency, Relevance, Authority, Accuracy, Purpose. Vendor and blog pages are support only and never the sole basis of a rule. A claim without a qualifying source is written as an **assumption** and needs the owner's decision.

Grades used in this document: **Strong** (peer-reviewed, university press, official statistics), **Standard** (standard setter or platform owner's own documentation), **Moderate** (peer-reviewed but conceptual, or old data), **Practitioner** (book or professional guide, not peer-reviewed), **Not used** (does not meet the rule).

## 2.2 References the app shows today

These 21 sources are in `Sources.ts`. They support the "i" notes of the Financial pages, the Business Documents, the UK tax and SIC hints and the intangible-asset lives.

| Title | Publisher | Checked | Link |
|---|---|---|---|
| Register for VAT: When to register for VAT | GOV.UK | 2026-10-01 | [www.gov.uk/vat-registration/when-to-register…](https://www.gov.uk/vat-registration/when-to-register) |
| Standard industrial classification of economic activities (SIC) | Companies House | 2026-10-01 | [www.gov.uk/government/publications/standard-industrial-class…](https://www.gov.uk/government/publications/standard-industrial-classification-of-economic-activities-sic) |
| Calculate your startup costs: break-even point | U.S. Small Business Administration | 2026-09-29 | [www.sba.gov/business-guide/plan-your-business/calculate-your…](https://www.sba.gov/business-guide/plan-your-business/calculate-your-startup-costs/break-even-point) |
| Calculate a Break-Even Point in Units and Dollars (Franklin, Graybeal, Cooper) | OpenStax, Rice University | 2026-09-29 | [openstax.org/books/principles-managerial-accounting/pages/3-…](https://openstax.org/books/principles-managerial-accounting/pages/3-2-calculate-a-break-even-point-in-units-and-dollars) |
| Explain Contribution Margin (Franklin, Graybeal, Cooper) | OpenStax, Rice University | 2026-09-29 | [openstax.org/books/principles-managerial-accounting/pages/3-…](https://openstax.org/books/principles-managerial-accounting/pages/3-1-explain-contribution-margin-and-calculate-contribution-margin-per-unit-contribution-margin-ratio-and-total-contribution-margin) |
| Industrial Production and Capacity Utilization (G.17): About | Board of Governors of the Federal Reserve System | 2026-09-29 | [www.federalreserve.gov/releases/g17/About.htm…](https://www.federalreserve.gov/releases/g17/About.htm) |
| Long Term Loan Repayment Methods (Gutierrez, Dalsted) | Colorado State University Extension | 2026-09-29 | [extension.colostate.edu/resource/long-term-loan-repayment-me…](https://extension.colostate.edu/resource/long-term-loan-repayment-methods/) |
| Simple Interest (Kirk, Contemporary Mathematics) | OpenStax, Rice University | 2026-09-29 | [openstax.org/books/contemporary-mathematics/pages/6-3-simple…](https://openstax.org/books/contemporary-mathematics/pages/6-3-simple-interest) |
| The Bonfire of VC: Cash Burn, the Good, the Bad & the Ugly (Damodaran) | NYU Stern School of Business | 2026-09-29 | [pages.stern.nyu.edu/~adamodar/pdfiles/blog/CashBurn.pdf…](https://pages.stern.nyu.edu/~adamodar/pdfiles/blog/CashBurn.pdf) |
| 29 CFR § 778.113 | Cornell Law School, Legal Information Institute | 2026-09-29 | [www.law.cornell.edu/cfr/text/29/778.113…](https://www.law.cornell.edu/cfr/text/29/778.113) |
| WCAG 2.1: contrast ratio | W3C | 2026-09-29 | [www.w3.org/TR/WCAG21/#dfn-contrast-ratio…](https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio) |
| Maximizing the Benefits of Customer Referrals | Baylor University, Keller Center for Research | 2026-09-29 | [kellercenter.hankamer.baylor.edu/news/story/2019/maximizing-…](https://kellercenter.hankamer.baylor.edu/news/story/2019/maximizing-benefits-customer-referrals) |
| eCommerce Key Performance Indicators | U.S. International Trade Administration | 2026-09-29 | [www.trade.gov/ecommerce-key-performance-indicators…](https://www.trade.gov/ecommerce-key-performance-indicators) |
| Customer Acquisition: What You Need To Know | Penn State Extension | 2026-09-29 | [extension.psu.edu/customer-acquisition-what-you-need-to-know…](https://extension.psu.edu/customer-acquisition-what-you-need-to-know) |
| Modeling Customer Lifetime Value (Gupta et al., Journal of Service Research) | UCLA Anderson School of Management | 2026-09-29 | [www.anderson.ucla.edu/sites/default/files/documents/areas/fa…](https://www.anderson.ucla.edu/sites/default/files/documents/areas/fac/marketing/JSR2006(0).pdf) |
| Infinite Series (Strang, Herman, Calculus Volume 2) | OpenStax, Rice University | 2026-09-29 | [openstax.org/books/calculus-volume-2/pages/5-2-infinite-seri…](https://openstax.org/books/calculus-volume-2/pages/5-2-infinite-series) |
| State Property Class Codes | Texas DFPS | 2026-10-10 | [dfps.texas.gov/handbooks/Asset_Management/Files/ASM_px_2.asp…](https://dfps.texas.gov/handbooks/Asset_Management/Files/ASM_px_2.asp) |
| FRS 102 intangible assets: what's changed? | ACCA | 2026-10-12 | [www.accaglobal.com/gb/en/technical-activities/technical-reso…](https://www.accaglobal.com/gb/en/technical-activities/technical-resources-search/2018/april/FRS102-intangible-assets-whats-changed.html) |
| IAS 38 Intangible Assets: Illustrative Examples | IFRS Foundation | 2026-10-12 | [www.ifrs.org/content/dam/ifrs/publications/html-standards/en…](https://www.ifrs.org/content/dam/ifrs/publications/html-standards/english/2024/issued/ias38-ie.html) |
| T.D. 8865: Amortization of Intangibles | IRS | 2026-10-12 | [www.eitc.irs.gov/pub/irs-regs/td8865.pdf…](https://www.eitc.irs.gov/pub/irs-regs/td8865.pdf) |
| A small company's intangible assets note | SEC (company filing) | 2026-10-12 | [www.sec.gov/Archives/edgar/data/1520118/000147793225007253/R…](https://www.sec.gov/Archives/edgar/data/1520118/000147793225007253/R15.htm) |


## 2.3 Design bases named in the project

These shaped the Business Documents and the cost model. They are named in commit messages and design documents; their pages were **not re-opened for this document**, so their grade is "Practitioner" until each one is re-checked and, if kept, added to `Sources.ts` with a date.

| Basis | Used for | Grade |
|---|---|---|
| Business Model Canvas (Osterwalder and Pigneur, as published by Strategyzer) | The canvas block definitions, channels and journey phases, relationship types, partner relationships | Practitioner (book) |
| SBA and SCORE business plan outline | Order and content of the Business Plan document | Practitioner (official guide for SBA; SCORE only as an SBA partner page) |
| Statement layout "as the standards do" (balance sheet, cash flow, profit and loss) | Forecast statements | To be re-checked against the standard setters named above |

## 2.3b Sources named in the research notes of 2026-10-05 to 2026-10-07

The research notes (document 3) list their sources by site name, without links. They are graded here **by type of publisher only**; the pages were not re-opened. Under the rule above most of them are not acceptable as a basis for a decision.

| Note | Sources named | Meets the rule |
|---|---|---|
| Resources, activities, partners and costs | Kent State University (Business Model Canvas page); Stanford GSB (the impact of the Business Model Canvas); BDC (Business Development Bank of Canada, glossary) | Yes by type (university; government-owned bank) |
| | Strategyzer support (Key Partnerships) | Practitioner (author of the method) |
| | fourweekmba, wrike, digitalleadership, superfastcpa, patriotsoftware, aihr, quotapath, freeagent, zenind | No (blogs, vendors) |
| Part 2: groups, frequency, key costs | CIPS (professional body, Kraljic matrix) | Yes by type |
| | inboundlogistics, cleartax, fishbowlinventory, happay, zoho, fractory, procurementandsupply | No (trade press, vendors) |
| Part 3: allocation, payments, channels, suppliers | csus.edu (accounting study guide); ocw.tau.edu.ng (management accounting lecture notes) | Yes by type (university material; check authorship) |
| | joist, ruul, finmap, osher, alooba, ssfllp, sensiba, leadsquared, impartner, superfastcpa | No (vendors, firms' blogs) |
| Part 4: channels, groups, payments | The page-2 specification and the Lumen example; "standard accounting practice; no new source was searched" | Internal; no external source |
| Industry costs and insurances | "Written from general knowledge, not from a single source" | None: an assumption |

Consequence: the decisions in document 1 that came from these notes are **decisions of the owner**, not findings of the sources. Where a rule needs support, document 5 lists the check to make against a qualifying source.

## 2.4 References used in the research and analysis of 2026-10-14

| Source | What it supports | Grade and limits (CRAAP at a glance) |
|---|---|---|
| [W3C, What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) | The new AA criteria in 2.2: 2.4.11 Focus Not Obscured (Minimum), 2.5.7 Dragging Movements, 2.5.8 Target Size (Minimum), 3.3.8 Accessible Authentication (Minimum); 4.1.1 Parsing removed | Standard. Current, authoritative. WCAG 1.4.10 Reflow and 1.4.12 Text Spacing were **not verified**. |
| [Android, window size classes](https://developer.android.com/develop/ui/compose/layouts/adaptive/window-size-classes) | Width classes 600 / 840 / 1200 / 1600 dp, height classes 480 / 900 dp, with the share of devices each covers; width matters more than height | Standard (platform owner). Mobile-app origin, used as a cross-check only. |
| [StatCounter, desktop screen resolutions](https://gs.statcounter.com/screen-resolution-stats/desktop-ww/worldwide) | Common desktop screens (1920×1080, 1536×864, 1366×768, 1280×720) | Moderate: usage data from a commercial counter; reports screen, not window, size. |
| [web.dev, how the Core Web Vitals thresholds were defined](https://web.dev/articles/defining-core-web-vitals-thresholds) | "Good" thresholds: LCP 2.5 s, INP 200 ms, CLS 0.1 at the 75th percentile of field data | Standard (platform owner). There is **no official bundle-size limit**; figures of 150–200 KB compressed seen elsewhere are third-party suggestions. |
| [ISO/IEC 25010 quality model, summary](https://www.tmap.net/wiki/quality-characteristics-iso25010/) | Performance efficiency; maintainability with modularity and reusability | Standard via a secondary summary; the standard itself was not read; the 2023 edition may add Safety. |
| [Malik et al. 2024, systematic review of home-based businesses, Journal of Family Business Management](https://emerald.com/insight/content/doi/10.1108/JFBM-03-2024-0062/full/html) | Home-based work is a lasting form for small businesses (58 articles, 2000–2023) | Strong. Abstract seen. |
| [Kim and Parker 2021, Small Business Economics](https://researchcommons.waikato.ac.nz/handle/10289/6787) | Panel data: nearly 40% of UK self-employed worked at home before 2020 | Strong. Abstract only; the link points to the repository entry found in the search, so confirm the DOI of the original paper before citing. |
| [Eurostat, working hours in the EU, 2025](https://ec.europa.eu/eurostat/web/products-eurostat-news/w/edn-20250501-1) | EU average week 36.0 hours (2024); own-account workers work more hours than employees in most countries | Strong (official). Average of all employed. |
| [Eurostat, how usual is it to work from home](https://ec.europa.eu/eurostat/fr/web/products-eurostat-news/-/edn-20210517-2) | 12.3% of employed people worked from home in 2020; self-employed far more | Strong, dated (2020). |
| [US Bureau of Labor Statistics, work at home](https://www.bls.gov/news.release/pdf/homey.pdf) | Self-employed with a home-based business worked 25 hours a week at home | Strong but old (2004). |
| [Chaudhry 2007, Journal of Research in Marketing and Entrepreneurship](https://www.emeraldinsight.com/insight/content/doi/10.1108/14715200780001337/full/html) | A CRM model for small service firms | Moderate: conceptual, not tested. |
| [Carbon Design System, component guide](https://v10.carbondesignsystem.com/contributing/component) and [GOV.UK component template](https://docs.publishing.service.gov.uk/repos/govuk-design-guide/components/*component-documentation-template.html) | Shape of a short component entry (usage, style, code, accessibility) | Practitioner. Support only. |

## 2.5 Found, but not used

| Item | Why not |
|---|---|
| "A 5% retention rise lifts profit by 25–95%" (blogs) | Secondary; the original Harvard Business Review source was not found. |
| "CRM adoption raises retention 25–40% and sales 15–30% in SMEs" (a 2024 preprint) | Not peer-reviewed; derivation unverified. |
| Bundle-size limits from checklist sites | No official value; vendor and blog pages. |
| "1 MB of JavaScript takes 2–3 seconds to parse" | Vendor guide without a cited source. |

## 2.6 To do

- Re-open and date the design bases in section 2.3, and add the ones that stay to `Sources.ts`.
- Read WCAG 1.4.10 and 1.4.12 at W3C; read ISO/IEC 25010 itself or a national standards body page.
- Search the Journal of Small Business Management and the International Small Business Journal for small-business evidence on relationship types, goals and channel mix (document 5 lists the requirements that wait on it).
