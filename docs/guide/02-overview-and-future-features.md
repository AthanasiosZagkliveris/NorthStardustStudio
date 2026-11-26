# Overview of the app: its guide, its specifications and its future features

Status: **reference**, written 2026-11-21, updated 2026-11-21 (part 5 is a proposal). Parts 1 to 4 describe the app as it is and point to the one document that owns each fact; part 5 proposes its future features (an AI Assistant, Team working mode, Voice mode, more languages and countries), from online research, nothing of it built; part 6 lists the sources. Asked by the owner on 2026-11-21 00:56 UTC+2: "create a new document with the app's guide and specs and its future features … Do online research and check what extra features the app needs now, or it could have in the future".

## Contents

1. [What the app is](#1-what-the-app-is)
2. [The guide](#2-the-guide)
3. [The specifications](#3-the-specifications)
4. [How the answers connect](#4-how-the-answers-connect)
5. [Future features](#5-future-features)
6. [Sources](#6-sources)

## 1. What the app is

North Stardust interviews an early-stage founder -- on their own or in a small team -- and writes their business documents from the answers. Four Systems, answered in order, each a page or pages of tiles that open their questions in dialogs and floating cards:

| System | Pages | What it asks |
|---|---|---|
| 1. Identity | one page: Definition, Purpose | the organisation, its positioning, founders and ownership, registrations and expenses; mission, vision, values, principles, philosophy, manifesto |
| 2. Brand | one page: Ambassador, Style | the brand as a person; colours, typography, text hierarchy, icon and logo, images |
| 3. Business | three pages: Foundation & Engagement, Infrastructure & Capability, Financials | segments, profiles, competitors, offerings, value propositions, channels, relationships, expected sales; founders' hours, resources, activities, partners and suppliers, capacity and delivery; revenue streams, costs, funding |
| 4. Strategy | one page: Situation & Direction | the current situation, the SWOT, the strategic compass, the strategic period with its themes, goals, objectives, metrics and roadmap |

The **Workbook** records what the answers work out: the Business Documents (Business Plan, Business Model Canvas), the Financial Documents (Financial Forecast, Funding Request, Financial Plan), the Review, the References, the Glossary and the Card Notes. The answers stay in the browser on the founder's device; there is no account or server yet. Desktop web, from a window 768px wide; WCAG 2.2 AA; UK English.

## 2. The guide

How a founder uses the app, step by step, is [the user guide](01-user-guide.md) (the one owner): the Organisations screen (section 2), the Systems and their pages (section 3), the header's Menu and Workbook (section 4), the Workbook (section 4.1). This document does not repeat it.

## 3. The specifications

Each page and screen has its specification under `docs/specifications/`:

| Part of the app | Specification |
|---|---|
| Identity System | [identity-system](../specifications/01-identity-system/01-definition.md) |
| Brand System | [brand-system](../specifications/02-brand-system/01-brand.md) |
| Business System | [business-system](../specifications/03-business-system/README.md): page 1, Foundation & Engagement; page 2, Infrastructure & Capability; page 3, Financials (its tiles: Questions 20, section 14) |
| Strategy System | [strategy-system](../specifications/04-strategy-system/01-situation-and-direction.md) |
| The Workbook | [workbook](../specifications/06-workbook/README.md), a file for each section |
| Settings, Appearance (the reading modes), Focus | [settings](../specifications/07-settings/README.md), [Global Settings](../specifications/07-settings/README.md#the-global-settings-screen) |
| The Inventory | [inventory](../specifications/05-inventory/README.md) |

The questions are in `docs/design/questions/` (their register: Questions 6); the layout is the rulebook's (`docs/ai/09-layout-rules.md`).

## 4. How the answers connect

The app fills, starts, offers or works out about 120 answers from earlier ones (drafts, starts, option lists, cards it makes, figures it computes): the list, with each one's source and code, is [Questions 5](../design/questions/05-auto-filled-answers.md). What waits for another answer (a city for its country) is listed in [AI 6, Chained answers](../ai/06-framework-conventions-and-patterns.md#chained-answers).

## 5. Future features

A proposal from online research (official, university and standards sources; part 6). Product claims about other tools come from their own pages and are described, not quoted; check them again before publishing. Fixed constraints throughout: desktop web, React, from 768px, WCAG 2.2 AA, UK English, data in the browser.

### 5.1 AI Assistant

#### What founders need (evidence)
- A randomised field experiment with 640 Kenyan entrepreneurs gave half a GPT-4 business mentor. The average effect on performance was close to zero: high performers gained about 15%, low performers lost about 8%. The gap came from which advice people chose to act on, not from the questions they asked [1]. The lesson: an assistant should help founders judge advice against their own answers, not just produce more of it.
- Planning helps small firms, and the effect is stronger when planning runs alongside learning and revision [2]. An assistant that prompts founders to revisit and test answers fits this better than one that writes a finished plan in one go.
- The SBA describes two plan formats (traditional and lean) and encourages founders to use the sections that suit their business [3]. An assistant can help match depth to purpose (a loan application versus an internal plan).

#### What comparable tools offer
- **LivePlan:** section-by-section writing help (ideas, rewrites, tone), suggested revenue and expense lines, and forecast-versus-actuals commentary when QuickBooks or Xero is connected [4].
- **Upmetrics:** asks a few questions and drafts a whole plan, then rewrites, shortens, expands or translates sections; it also offers research and "business question" assistants [5].
- **Notion AI:** general writing and summarising inside documents. Its help centre says customer data is not used to train models; providers keep data for up to 30 days on lower plans and zero days on Enterprise [6].

#### Design requirements and risks
- **Accuracy and hallucination:** NIST AI 600-1 names "confabulation" (confident false output) as a core generative-AI risk. It recommends checking sources and citations before release and while in use [7]. For North Stardust this means: the assistant cites which of the founder's answers it used; it marks figures as "suggested" until the founder accepts them; it never adds References entries that cannot be verified; and its suggestions for Financial Forecast numbers stay apart from the founder's own figures.
- **Disclosure:** EU AI Act Article 50(1), in force from 2 August 2026, requires users to be told before an interaction that they are dealing with an AI system, unless that is obvious [8]. Label the assistant clearly, and label AI-drafted text in the Workbook.
- **Privacy and GDPR:** the ICO's AI guidance applies even when personal data is processed "incidentally" [9]. Founder names, ownership splits and salaries are personal data. Sending them to a model provider makes that provider a processor (Article 28 contract), and a non-UK provider can create a restricted international transfer [10]. Needed: an opt-in switch, a preview of exactly what is sent, a provider with no training on the data and short or zero retention, and a "send without names" option.
- **Local-first fit:** today's data stays in the browser. A remote AI call is the first time data leaves the device, so it needs explicit consent for each use or each session.

#### Phased proposal
- **Now:** rule-based "assistant" with no model. It checks for gaps and contradictions using data the app already holds (for example a revenue stream with no channel, or costs higher than funding). This costs nothing in privacy and tests what founders find useful.
- **Next:** opt-in, bring-your-own-key or proxied LLM for rewording, summaries for Review, and Glossary explanations. It shows what it sends, cites the answers it used, and labels all output.
- **Later:** guided coaching that compares the plan with external benchmarks and sources (CRAAP-checked), plus scenario commentary on the Financial Forecast.

### 5.2 Team working mode

#### What founders need (evidence)
- Carta data shows solo-founded start-ups rose from 23.7% to 36.3% of new companies between 2019 and the first half of 2025 [11]. Teams are still the majority, so both solo and team modes matter.
- Research on founding teams is mixed: one study found solo for-profit founders more likely to survive [12], while a 2026 Bank of England working paper argues team firms can do better once team selection is taken into account [13]. Practical need: teams must agree on ownership, roles and the numbers. North Stardust already asks about these in "Founders & ownership".
- Founders also share plans with outside people (lenders, advisers, accelerators). Start Up Loans asks applicants for a business plan and a 12-month cash flow forecast [14].

#### What comparable tools offer
- **Google Docs:** roles (viewer, commenter, editor), Suggesting mode, comments, and version history with restore [15].
- **IdeaBuddy:** invited "Guests" who view and "Buddies" who edit, with a collaborator limit on each plan [16].
- **Upmetrics:** a shared workspace with real-time editing and secure sharing to investors and advisers [5]; **Enloop** lets you invite team members and consultants to review [17].

#### Design requirements and risks
- **Architecture:** real-time collaboration needs sync. The Ink & Switch "local-first" principles (fast, works offline, multi-device, collaboration, longevity, privacy, user control) describe how to add collaboration without giving up local ownership, typically using CRDT-based sync [18].
- **Roles that match the app:** owner, editor, commenter, viewer. Comments can reuse the existing Card Notes; a "suggest" state per card fits the Review section.
- **Privacy:** a server or relay makes the operator a controller or processor. Co-founders' personal data (equity, salary) needs field-level visibility, for example hiding personal finances from advisers. Data residency: host in the UK or EU, or document the transfer safeguards [10].
- **Conflicts:** two founders editing the same figure needs a visible merge rule. The Financial Forecast should show who changed which input, and when.
- **Accessibility:** presence indicators and live changes must be announced politely to screen readers. Content must not move under the cursor (WCAG 2.2 [19]).

#### Phased proposal
- **Now:** file-based teamwork. Export and import a project file (JSON), and a read-only "share pack" (PDF Workbook). Add a "prepared by" field per card.
- **Next:** async collaboration. Comments and suggestions in Card Notes, merged on import, with a change log per card.
- **Later:** optional end-to-end encrypted sync (local-first, CRDT) with roles, presence and adviser view links.

### 5.3 Voice mode

#### What users need (evidence)
- W3C WAI lists speech recognition users: people who cannot use a keyboard or mouse, people with RSI, and people with cognitive or learning disabilities who would rather speak than type [20].
- For a long interview-style app, dictating free-text answers (mission, value propositions, customer profiles) lowers the effort of typing.

#### What comparable tools offer
- **Google Docs voice typing:** dictation in Chrome, Edge and Safari; voice editing commands only in English [21].
- None of the planning tools reviewed (LivePlan, Upmetrics, IdeaBuddy, Enloop) presents voice input as a feature. This is a gap North Stardust could fill.

#### Design requirements and risks
- **WCAG 2.2:** 2.5.3 Label in Name. Every control's accessible name must contain its visible label, so speech users can say what they see [22]. Also 2.1.4 Character Key Shortcuts (no single-key shortcuts that dictation could trigger by mistake) and 3.3.2 Labels or Instructions [19]. Voice mode must add to keyboard and pointer input, never replace them, and nothing may require speech [20].
- **Privacy:** the Web Speech API in many browsers sends audio to a cloud service. A newer `processLocally` option asks for recognition on the device. Edge supports it from version 139; Firefox does not yet; support elsewhere is still changing [23][24]. Show where audio goes, ask for microphone permission only when voice mode is turned on, and prefer on-device recognition.
- **Accuracy:** dictated numbers ("fifteen hundred" versus "15,000") are risky for financial fields. Limit voice to text cells, or confirm numbers by reading them back.
- **Read-aloud:** text-to-speech of questions and the "i" help supports users with low vision or reading difficulties. Use UK English voices.

#### Phased proposal
- **Now:** audit Label in Name across shared components (one rule at the source, with a probe in the layout check). Rely on operating-system dictation (Windows Voice Access, macOS Voice Control), which already works with well-labelled fields.
- **Next:** an in-app microphone button on text cells using the Web Speech API, on-device where the browser supports it, off by default.
- **Later:** a hands-free "interview mode": questions read aloud, answers dictated, spoken navigation ("next card"), with a transcript the user reviews before saving.

### 5.4 Extra languages and countries

#### What founders need (evidence)
- Legal forms differ by country, with different names, liability and capital rules. Your Europe advises checking national rules before registering [25]. The app's legal-entity and Financials sections cover six countries today (GB, IE, US with every state, CA, AU, NZ) and Other (Questions 10); a new country needs its own pack.
- Tax and reporting duties also differ by country. For example, UK Making Tax Digital for Income Tax applies to sole traders and landlords with qualifying income over £50,000 from April 2026, falling to £30,000 in 2027 and £20,000 in 2028 [26]. Any country pack needs its own rules and dates.

#### What comparable tools offer
- **Upmetrics:** AI translation of plan sections [5].
- **LivePlan:** SBA-style formatting for US lenders [4]. Its country support is mostly limited to currency and formatting, not legal or tax content (vendor listings).

#### Design requirements and risks
- **Formats:** use the browser's `Intl` APIs (NumberFormat, DateTimeFormat, currency), backed by Unicode CLDR data, for numbers, dates and ISO 4217 currencies [27][28]. Store values without formatting (ISO dates, numbers in minor units plus a currency code) and format them only for display.
- **Country packs:** legal forms, tax bases, fee tables and official sources (rule 14) belong in data files per country. Keep them out of the code. Each pack needs a named source and a review date.
- **Right-to-left:** set `dir` on the `html` element, use CSS logical properties (inline-start/end) instead of left/right, and mirror rails and arrows [29]. The current 12px arrows and rails would need direction-aware variants.
- **Translation workflow:** pull out all strings (including "i" texts and references) into message catalogues. Exchange them with translators as XLIFF 2.1, the OASIS and ISO standard [30]. Use ICU plurals and keep the writing style rules (affirmative voice) in a style guide for each language. Machine translation can produce a first draft, but a person must review legal and financial terms.
- **Accessibility:** set the `lang` attribute per page and per passage (WCAG 3.1.1 and 3.1.2 [19]) so screen readers pronounce text correctly.

#### Phased proposal
- **Now:** make the code ready for other locales without adding languages. Store values in neutral form, format through `Intl`, use logical CSS properties, and keep country data (UK) in a separate data file.
- **Next:** country packs in English for Ireland, the US and one EU country (legal forms, currency, tax notes, sources).
- **Later:** full translation (for example French, German, Spanish, then Arabic as the right-to-left test) through an XLIFF workflow with human review.

### 5.5 Other features, ranked by value for an early-stage founder

| # | Feature | One-line evidence | Source | State (2026-11-21) |
|---|---|---|---|---|
| 1 | **Backup, export and import (JSON project file)** | Browsers can delete an origin's stored data when storage runs low; persistence must be requested and may be refused. | [31] | **Built**: Export and Import of an Organisation as a JSON file on the Landing page |
| 2 | **Persistent-storage request and storage warning** | `navigator.storage.persist()` lowers the risk of the browser deleting data; the browser decides whether to grant it. | [31] | **Built**: the Organisations are kept in IndexedDB and persistence is asked for at start (`IndexedDbStorage.keep`, `main.tsx`); when the browser refuses, the Landing page asks the founder to Export each Organisation (the desktop app keeps its data in its own folder, so it never shows there) |
| 3 | **Lender-ready exports (Start Up Loans format: plan, 12-month cash flow, survival budget)** | Start Up Loans applicants must send a 12-month cash flow forecast and a personal survival budget. | [14] | Built in part: the personal survival budget (Questions 20, section 13) and the Financial Documents in the Workbook; no export in the Start Up Loans format |
| 4 | **Scenario planning (base, low, high) on the Financial Forecast** | Planning works best combined with learning and revision; competitors offer "what-if" scenarios. | [2][32] | Not built (Workspace D3, Records 2, 5.4) |
| 5 | **Progress dashboard and plan-versus-actual review** | Regular revision is where planning pays off; LivePlan ties dashboards to actuals. | [2][4] | Not built (K2, Records 2, 5.2) |
| 6 | **Data privacy controls (what is stored, clear all, redact for sharing)** | UK GDPR expects data protection by design; personal data in plans includes founders' finances. | [9] | Not built |
| 7 | **Machine-readable export (CSV/JSON) of all answers** | The ICO names CSV, JSON and XML as suitable structured, machine-readable formats for portability. | [33] | Built in part: the JSON export of an Organisation and the forecast as CSV |
| 8 | **Templates and examples by industry** | The SBA publishes sample plans by business type to help founders start. | [34] | Not built: two example Organisations only |
| 9 | **Accounting software integration (Xero, QuickBooks, MTD-compatible)** | Accounting software is the most adopted digital tool among UK SMEs; MTD requires compatible software. | [26][35] | Not built |
| 10 | **Investor pitch summary or deck export** | Equity investment in UK small businesses is a large, active market; a short pitch is the usual first step. LivePlan offers a one-page pitch builder. | [32][36] | Not built (Workspace E3 One-Pager) |
| 11 | **Funding finder linked to the Funding section** | British Business Bank reports gaps in access to finance for some groups and regions. | [36] | Not built |
| 12 | **Reminders and calendar export (.ics) for roadmap and tax dates** | MTD quarterly updates have fixed deadlines (first one due 7 August 2026). | [26] | Not built |
| 13 | **Onboarding tour and sample project** | 53% of UK businesses with no employees used digital tools to run the business in 2024. Many solo founders are still new to such tools. | [37] | Built in part: the two example Organisations; no tour |
| 14 | **Tablet layout (768px and up, touch targets)** | WCAG 2.2 2.5.8 Target Size (Minimum) sets 24 by 24 CSS pixels for pointer targets. | [19] | Built in part: minimum width 768, the chapters stack below 1200 (AI 9, the layout rules); the touch targets are not checked |
| 15 | **What It Would Take on the Financials** (the smallest single change that keeps the cash at zero or above: more sales, a higher price, lower costs, a later start) | Founders without sales need to know what has to change before they borrow; a lever per answer turns a shortfall into a decision. | [2][14] | Built in the engine, tested, no screen shows it (`engine/financial/whatItWouldTake.ts`; Records 2, 5.4, E1) |
| 16 | **Loan repayment notes** (why each loan's repayments are, or are not yet, counted in the forecast, from its status) | Start Up Loans and lenders read the repayments in the 12-month cash flow; a requested loan that is counted overstates the cash. | [14] | Built in the engine, tested, no screen shows it (`loanRepaymentNotes` in `engine/financial/position.ts`) |

| 17 | **Capability Generator** (a page that drafts an Organisation's capabilities from its answers) | Moved off the Landing page to the future features by the owner (2026-11-22 18:58 UTC+2: "Move the Capability generator to future features"): its page (`/generator`) stays in the code, unlinked, until it is built. | owner | Not built: unlinked |
| 18 | **One warm and one cool chapter on Infrastructure & Capability** (Infrastructure and Offering's Capability each in a palette hue of its own, one warm, one cool; only the hue changes, the app's saturation and lightness stay) | Today both are warm (rose 335, terracotta 14: `stableCardHue`, Palette.ts) and look alike. Pictured 2026-11-27 in light, sepia and dark, every pair above 3:1 for symbols and 8:1 for titles: 1 lavender 262 with terracotta 14; 2 sky 200 with terracotta 14 (recommended: almost opposite on the wheel); 3 rose 335 with periwinkle 228. Kept as an idea by the owner (2026-11-27 00:10 UTC+2: "I will keep it as it it for now. But place it to future features as an idea"). | owner | Not built: today's hues kept |

### 5.6 The roadmap (local-first)

| Phase | AI Assistant | Team | Voice | Languages and countries | Other |
|---|---|---|---|---|---|
| **Now** | Rule-based gap and contradiction checks | Project file export and import; PDF share pack | Label-in-Name audit; works with operating-system dictation | Neutral storage, `Intl` formatting, logical CSS, UK data file | Backup, persist(), lender exports, privacy controls |
| **Next** | Opt-in LLM with send preview, citations, labels | Comments and suggestions merged on import | Microphone on text cells, on-device first | English country packs (IE, US, one EU) | Scenarios, dashboard, templates, .ics |
| **Later** | Coaching with benchmarks | Encrypted CRDT sync, roles, adviser links | Hands-free interview mode | Translations via XLIFF; right-to-left | Accounting sync, pitch deck, funding finder |

### 5.7 The future features scored, 1 to 10 (2026-11-21)

Asked by the owner on 2026-11-21 23:53 UTC+2: "Evaluate the future features, in a scale from 1-10 according importance, popularity, and effort to be build." Every feature of 5.1 to 5.5 and of the Workspace briefs (Records 2, 5.4) that is not built. The scores are a judgement from the evidence and sources of 5.1 to 5.5, not a measurement: the Beta questionnaire (Research 8) is the way to measure popularity with real founders.

- **Importance**: what it is worth to an early-stage founder who may not have sold anything yet (10 = the plan is wrong or lost without it).
- **Popularity**: how often comparable tools offer it and founders ask for it (10 = every comparable tool has it).
- **Effort**: how much there is to build in this app as it stands today (10 = the largest; 1 = an hour or two, the engine already built).
- **Priority** = Importance + Popularity − Effort (from −8 to 19): the higher, the sooner. Ties go to the more important.

| Rank | Feature | Importance | Popularity | Effort | Priority |
|---|---|---|---|---|---|
| 1 | #2 Persistent-storage request and warning | 9 | 4 | 1 | 12 |
| 2 | #3 Lender-ready exports (Start Up Loans format) | 9 | 7 | 4 | 12 |
| 3 | AI: rule-based gap and contradiction checks (5.1, Now) | 8 | 7 | 4 | 11 |
| 4 | #15 What It Would Take on the Financials | 8 | 5 | 2 | 11 |
| 5 | #13 Onboarding tour (sample organisations built) | 6 | 8 | 3 | 11 |
| 6 | Team: PDF share pack and "prepared by" (5.2, Now; export and import built) | 6 | 6 | 2 | 10 |
| 7 | #10 Pitch summary or One-Pager (Workspace E3) | 6 | 8 | 4 | 10 |
| 8 | Workspace D1: duplicate an Organisation | 5 | 7 | 2 | 10 |
| 9 | Workspace E2: lender-ready check | 8 | 5 | 4 | 9 |
| 10 | AI: opt-in language model with send preview and citations (5.1, Next) | 7 | 9 | 7 | 9 |
| 11 | #4 Scenarios, base, low, high (Workspace D3) | 7 | 9 | 8 | 8 |
| 12 | #5 Dashboard and plan against actual (K2) | 7 | 8 | 7 | 8 |
| 13 | #6 Privacy controls (clear all, redact for sharing) | 6 | 5 | 3 | 8 |
| 14 | #8 Templates and examples by industry | 6 | 8 | 6 | 8 |
| 15 | #16 Loan repayment notes on the Financials | 6 | 3 | 1 | 8 |
| 16 | Workspace E4: glossary hints | 5 | 6 | 4 | 7 |
| 17 | #12 Reminders and `.ics` export | 4 | 5 | 2 | 7 |
| 18 | Voice: Label-in-Name audit, operating-system dictation (5.3, Now) | 5 | 3 | 2 | 6 |
| 19 | #14 Touch targets of 24px at tablet sizes | 5 | 6 | 5 | 6 |
| 20 | Workspace D4: Compare (needs `planOutcomes` and D3) | 5 | 6 | 5 | 6 |
| 21 | #11 Funding finder | 6 | 5 | 6 | 5 |
| 22 | Team: comments and suggestions merged on import (5.2, Next) | 5 | 6 | 6 | 5 |
| 23 | Workspace D2: duplicate a card | 4 | 6 | 5 | 5 |
| 24 | #7 CSV of all answers (JSON built) | 3 | 4 | 2 | 5 |
| 25 | #9 Accounting software integration | 5 | 8 | 9 | 4 |
| 26 | Languages: neutral storage, `Intl`, logical CSS (5.4, Now) | 4 | 5 | 5 | 4 |
| 27 | Languages: English country packs, IE, US, one EU (5.4, Next) | 6 | 5 | 8 | 3 |
| 28 | Team: encrypted sync, roles, adviser links (5.2, Later) | 5 | 8 | 10 | 3 |
| 29 | Voice: microphone on text cells (5.3, Next) | 4 | 3 | 4 | 3 |
| 30 | AI: coaching against benchmarks (5.1, Later) | 5 | 5 | 9 | 1 |
| 31 | Languages: translations through XLIFF (5.4, Later) | 4 | 6 | 9 | 1 |
| 32 | Voice: hands-free interview mode (5.3, Later) | 2 | 1 | 8 | -5 |

**Reading it:** the first ten, but the language model (rank 10), are small builds of high worth, most of them on parts that already exist (the storage request, the lender exports and check, the rule-based checks, What It Would Take, the tour, the share pack, the One-Pager, duplicating an Organisation). The loan notes are the smallest build of all (rank 15: worth less alone, best shipped with What It Would Take). Scenarios, the dashboard and the language model are wanted and popular but large; sync, accounting integration and hands-free voice are the largest and come last.

## 6. Sources

[1] Otis, N., Clarke, R., Delecourt, S., Holtz, D. and Koning, R. (2023) *The Uneven Impact of Generative AI on Entrepreneurial Performance*. Harvard Business School Working Paper 24-042. Available at: https://pubsonline.informs.org/doi/10.1287/mnsc.2024.06909 (Accessed: 21 November 2026).

[2] Brinckmann, J., Grichnik, D. and Kapsa, D. (2010) 'Should entrepreneurs plan or just storm the castle? A meta-analysis on contextual factors impacting the business planning–performance relationship in small firms', *Journal of Business Venturing*, 25(1), pp. 24–40. Available at: https://ideas.repec.org/a/eee/jbvent/v25y2010i1p24-40.html (Accessed: 21 November 2026).

[3] U.S. Small Business Administration (n.d.) *Write your business plan*. Available at: https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan (Accessed: 21 November 2026).

[4] Palo Alto Software (n.d.) *Business plan software (LivePlan)*. Available at: https://www.bplans.com/business-plan-software/ (Accessed: 21 November 2026).

[5] Upmetrics (n.d.) *AI Assistant* and *Business plan collaboration*. Available at: https://upmetrics.co/features/ai-assistant and https://upmetrics.co/features/business-plan-collaboration (Accessed: 21 November 2026).

[6] Notion Labs (n.d.) *Notion AI security & privacy practices*. Available at: https://www.notion.com/help/notion-ai-security-practices (Accessed: 21 November 2026).

[7] National Institute of Standards and Technology (2024) *Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile* (NIST AI 600-1). Available at: https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf (Accessed: 21 November 2026).

[8] European Commission (2026) *Transparency obligations under Article 50 AI Act (FAQ)*. Available at: https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act (Accessed: 21 November 2026).

[9] Information Commissioner's Office (2023) *Guidance on AI and data protection*. Available at: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/ (Accessed: 21 November 2026).

[10] Information Commissioner's Office (n.d.) *What are our other key UK GDPR obligations in the context of international transfers?* Available at: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/a-guide-to-international-transfers/what-are-our-other-key-uk-gdpr-obligations-in-the-context-of-international-transfers (Accessed: 21 November 2026).

[11] Carta (2025) *Solo Founders Report 2025*. Available at: https://carta.com/data/solo-founders-report (Accessed: 21 November 2026).

[12] NYU Stern School of Business (n.d.) *Venture investors take note: solo founders outperform teams* (Greenberg, J. and Mollick, E.). Available at: https://www.stern.nyu.edu/experience-stern/faculty-research/venture-investors-take-note-solo-founders-outperform-teams (Accessed: 21 November 2026).

[13] Bank of England (2026) *Sorting into entrepreneurial teams* (Staff Working Paper). Available at: https://www.bankofengland.co.uk/-/media/boe/files/working-paper/2026/sorting-into-entrepreneurial-teams.pdf (Accessed: 21 November 2026).

[14] Start Up Loans (n.d.) *Cash flow forecast template* and *Planning templates & free guides*. Available at: https://www.startuploans.co.uk/cash-flow-forecast-template and https://www.startuploans.co.uk/free-start-up-guides (Accessed: 21 November 2026).

[15] Google (n.d.) *Google Docs Help: collaborate, suggest edits and version history*. Available at: https://support.google.com/a/users/answer/13004165 (Accessed: 21 November 2026).

[16] IdeaBuddy (n.d.) *New collaboration feature – work on ideas together* and *Pricing*. Available at: https://ideabuddy.com/blog/collaboration-feature-work-on-ideas-together/ and https://ideabuddy.com/pricing/ (Accessed: 21 November 2026).

[17] Entrepreneur (2011) *A business plan tool that helps size up your odds of success* (Enloop). Available at: https://www.entrepreneur.com/starting-a-business/a-business-plan-tool-that-helps-size-up-your-odds-of-success/220250 (Accessed: 21 November 2026).

[18] Kleppmann, M., Wiggins, A., van Hardenberg, P. and McGranaghan, M. (2019) *Local-first software: you own your data, in spite of the cloud*. Ink & Switch / Onward! 2019. Available at: https://www.inkandswitch.com/local-first/ (Accessed: 21 November 2026).

[19] W3C (2024) *Web Content Accessibility Guidelines (WCAG) 2.2*. W3C Recommendation. Available at: https://www.w3.org/TR/WCAG22/ (Accessed: 21 November 2026).

[20] W3C Web Accessibility Initiative (n.d.) *Speech recognition (Perspectives)* and *Input – How people with disabilities use the web*. Available at: https://www.w3.org/WAI/perspective-videos/voice/ and https://www.w3.org/WAI/people-use-web/tools-techniques/input/ (Accessed: 21 November 2026).

[21] Google (n.d.) *Type & edit with your voice*. Available at: https://support.google.com/docs/answer/4492226 (Accessed: 21 November 2026).

[22] W3C Web Accessibility Initiative (n.d.) *Understanding SC 2.5.3: Label in Name*. Available at: https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html (Accessed: 21 November 2026).

[23] MDN Web Docs (n.d.) *SpeechRecognition: processLocally property*. Available at: https://developer.mozilla.org/docs/Web/API/SpeechRecognition/processLocally (Accessed: 21 November 2026).

[24] Microsoft (n.d.) *Speech recognition API (Microsoft Edge)*. Available at: https://learn.microsoft.com/en-us/microsoft-edge/web-platform/speech-recognition-api (Accessed: 21 November 2026).

[25] European Union (n.d.) *Your Europe – Starting a business*. Available at: https://europa.eu/youreurope/business/lifecycle/starting/startups/index_en.htm (Accessed: 21 November 2026).

[26] HM Revenue & Customs (n.d.) *Making Tax Digital for Income Tax for sole traders and landlords: step by step*. Available at: https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-sole-traders-and-landlords-step-by-step (Accessed: 21 November 2026).

[27] Unicode Consortium (2026) *Unicode CLDR Project* (CLDR 48). Available at: https://cldr.unicode.org/ (Accessed: 21 November 2026).

[28] MDN Web Docs (n.d.) *Intl*. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl (Accessed: 21 November 2026).

[29] W3C Internationalization (n.d.) *Structural markup and right-to-left text in HTML*. Available at: https://www.w3.org/International/questions/qa-html-dir (Accessed: 21 November 2026).

[30] OASIS (2018) *XLIFF Version 2.1*. OASIS Standard. Available at: https://docs.oasis-open.org/xliff/xliff-core/v2.1/xliff-core-v2.1.html (Accessed: 21 November 2026).

[31] MDN Web Docs (n.d.) *Storage quotas and eviction criteria*. Available at: https://developer.mozilla.org/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria (Accessed: 21 November 2026).

[32] GetApp (n.d.) *LivePlan: features and pricing*. Available at: https://www.getapp.com/operations-management-software/a/liveplan/ (Accessed: 21 November 2026).

[33] Information Commissioner's Office (n.d.) *Right to data portability*. Available at: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-data-portability (Accessed: 21 November 2026).

[34] U.S. Small Business Administration (n.d.) *Sample business plans*. Available at: https://www.sba.gov/document/support-sample-business-plans (Accessed: 21 November 2026).

[35] Department for Business and Trade (2025) *Understanding technology adoption among UK SMEs*. Available at: https://www.gov.uk/government/publications/understanding-technology-adoption-among-uk-smes (Accessed: 21 November 2026).

[36] British Business Bank (2026) *Small Business Finance Markets Report 2026* and *Small Business Equity Tracker 2026*. Available at: https://www.british-business-bank.co.uk/about/research-and-publications/small-business-finance-markets-report-2026 and https://www.british-business-bank.co.uk/about/research-and-publications/small-business-equity-tracker-2026 (Accessed: 21 November 2026).

[37] Department for Business and Trade (2025) *Longitudinal Small Business Survey 2024: businesses with no employees*. Available at: https://www.gov.uk/government/statistics/small-business-survey-2024-businesses-with-no-employees/longitudinal-small-business-survey-2024-businesses-with-no-employees (Accessed: 21 November 2026).

**Notes on sources.** Competitor features [4][5][16][17][32] are vendor-reported or listing-reported and were not tested. ICO guidance [9][10][33] is under review after the Data (Use and Access) Act 2025. Browser support for on-device speech [23][24] is still changing. Bizplan was searched for but no reliable feature documentation was found, so it is left out.
