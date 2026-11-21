# Settings — the screens and choices that set how the app works

Status: **specification**, written 2026-11-20, updated 2026-11-21 (the Global Settings screen, `global-settings.md` until 2026-11-21, is below). What a founder sets outside the Systems' questions: the **Global Settings** screen, and the two tools that set how the app is read, the **reading mode** and **Focus**. All three are in the header's **Menu** (layout rules, section 6, the Menu; owner, 2026-11-21 23:44 UTC+2: "Include the Reading Mode"; 2026-11-21 03:40: the reading mode is **Appearance**). Each is the one owner of what it sets; the figures and rules behind them are in the documents linked.

| Setting | Where | Specification | Built by |
|---|---|---|---|
| Global Settings | **Menu**, then **Settings** (`/settings`) | [below](#the-global-settings-screen) | `src/pages/GlobalSettings.tsx`, `src/framework/engine/GlobalSettings.ts` |
| Appearance (the reading mode) | **Menu**, then **Appearance**'s side menu | this file, below | `src/components/menu/ToolsMenu.tsx` |
| Focus | **Menu**, then **Focus**, on an interview page | this file, below | `src/components/menu/FocusModeButton.tsx`, `src/services/FocusModeService.ts` |

## Global Settings

The rates and limits the calculated lines read, in one place (the cost model, section 6): the business stages with the Opening Date (entered on the Organisation tile) and today's stage (Questions 2, 8.2a); the financial plan's own settings; the assets (the capitalisation limit, useful lives, amortisation); the rates (employer on-costs, royalty, affiliate and sales-agent); the reserve (the Startup and Operational Contingency Funds, the target operating reserve, read by the Workbook's Funding Request: `workbook/financial-documents.md`); the Channel Fee Table. Each section a card of fields, every detail in an "i" beside its label (layout rules, section 14). The screen in full: `global-settings.md`.

## Appearance (the reading mode)

Four options in Appearance's side menu, in the Menu, the chosen one marked: **Light**, **Sepia** (warm paper for long reading), **Dark** and **Auto** (follows the system's light or dark; it says "Auto" with the icon of what it comes to now) (`ToolsMenu.tsx`). Every colour is a token of each mode (layout rules, section 2, Tokens; WCAG 2.2 AA in every mode: the contrast checks of the layout probe). The choice is the person's, kept on this device (`ThemeService`), never in an Organisation's answers.

## Focus

On an interview page, **Focus** in the Menu hides the rails, the Help, the header and the progress line and centres the page at a reading width (`focus-mode.css`); one small "Exit focus" button stays in the top-right corner, and Escape exits too, after any dialog has closed. The choice is remembered on this device until exited (`FocusModeService`).

## The Global Settings screen

It says how the screen is drawn today and which rule each part follows; the rates' sources and the decisions behind them are in the documents linked from each part, each the one owner of its facts.

> **Global Settings** · opened from the header's **Menu** (`ToolsMenu.tsx`), its Settings row (`/settings`, `pages/GlobalSettings.tsx`). Back, and Escape, return to where it was opened from.

### As built

The rates and limits the calculated lines read, held in one place (the cost model, section 6; `framework/engine/GlobalSettings.ts`). Every figure is kept as typed and saved at once; a change here reaches every line that reads it. Each section is a card of fields; every detail stands in an "i" beside its label (layout rules, 14).

| Section | What it holds | Owner of the detail |
|---|---|---|
| Business stages | The Opening Date (entered on the Organisation tile), the four stages' durations, today's stage | Questions 2, 8.2a |
| Financial plan | The Financial Foundation's own settings (its answer, edited here) | [Section 5](../03-business-system/06-costs-funding-and-position.md) |
| Assets | The capitalisation limit, the useful life of each asset group, each asset's own years, the intangible assets' amortisation | [Section 5, 30.6](../03-business-system/06-costs-funding-and-position.md#306-dates-rates-and-floors) |
| Rates | The employer on-cost coefficient, the royalty, affiliate and sales-agent rates | the cost model, section 6 |
| Reserve | The Startup and Operational Contingency Funds, the target operating reserve | [Section 5, 30.3](../03-business-system/06-costs-funding-and-position.md#303-funds-rules-f1-to-f6) |
| **Channel Fee Table** | What each channel takes of its sales | below |

### The Channel Fee Table

**What a row is.** A provider (a payment service or a marketplace) in one country: commission (% of the channel's revenue), fixed fee per order (in the row's currency), chargeback or risk allowance (%), and a note that says where the rate comes from and when it was checked. Charged as revenue x (commission + allowance) + the fixed fee x orders (`channelFeeOf`).

**Where the rows come from.** The app's fee data (`framework/engine/ChannelFeeData.ts`) holds a row for every provider and marketplace the app lists, in each of the six first-version countries (GB, IE, US, CA, AU, NZ): **checked** (its rate and the date it was read), **not checked** (no rate yet, or a figure from a secondary source, said in its note) or **not available** there. A new Organisation's table starts from all of them; a saved table migrates once (data version 2): its rows become the UK's, the rows it lacks are added, and the old combined "Wolt, Amazon" row is gone. The figures and their sources: Questions 18, section 1.4.

**Which rows the screen shows** (owner, 2026-11-15 15:10 and 16:37; layout rules, 1, "Related to the answers"):

- the rows of the Legal Entity's country (the UK's while none is chosen),
- of those, the ones a name of the user's own channels takes: a subchannel, an expense card, or a payment service the Segment names (Questions 12, Box 4, 8a) -- whatever its status, so a provider not checked yet, or not available in the country, says so;
- an **"Entered by you"** row for each name written in under an Other (a marketplace, a payment service, a paying subchannel) that no row takes; it is kept once anything is typed in it.

There is no "+ Add channel" and no x: a row appears with its channel and leaves with it. Every value stays editable.

**Reset** (under the table) asks first, in the app's confirmation dialog, then gives the country's rows back as the fee data has them (a rate changed is restored, a row removed is back); the rows the user made and other countries' rows stay (`resetChannelFees`).

**Who reads a row.** The match is by name, the more particular first (Stripe Terminal before Stripe; `channelFeeRowFor`), in the Legal Entity's country; a row with no rate, or not available there, is never charged.

- A paying subchannel's card on Customer Engagement shows its **Fees** (its own name, its expense cards' names, then the Segment's payment services; Questions 17).
- The forecast's channel fees ([Section 5, 30.4](../03-business-system/06-costs-funding-and-position.md#304-calculated-lines)): a "% of revenue" card is charged on each Offering's own revenue through the card's subchannels, at the full rate; a payment service's card with no price is charged from its row; never twice.

### Built from the review, 2026-11-20

Owner, 2026-11-20 12:49 UTC+2: "proceed to changes". The Startup Contingency Fund's help says "usually 10 to 20%" with its source (NYU Entrepreneurship, *The Runway Equation*, 2025); the default stays. For a United States organisation, the Employer on-cost coefficient's "i" adds that the rate includes the state's unemployment insurance, given by the state's agency (U.S. Department of Labor, *Contacts for State UI Tax Information and Assistance*, https://oui.doleta.gov/unemploy/agencies.asp, opened 2026-11-20).

### Review of 2026-11-20

Asked by the owner (2026-11-19 21:44 UTC+2, the round's Global Settings review). Read on the screen and in `GlobalSettings.ts` against this round's changes and the sources of Questions 20, section 13. Nothing needed a change; three points wait for the owner.

| Rule | Now | Proposed |
|---|---|---|
| The Reserve follows a cited range | Startup Contingency Fund "10 to 15%"; Target operating reserve 3 months ("an investor may ask for 6") | Keep 3 months (UW-Madison SBDC: "3-6 months of expense coverage"); say the startup padding as 10 to 20% (NYU Entrepreneurship, *The Runway Equation*, 2025), the default left at its value |
| A frequency the cost cards offer is known everywhere | "Every two years" (biennial, added 2026-11-19) is a cost frequency, not a setting | Nothing here: no setting uses a frequency |
| A country's figures come from its own rows | The Channel Fee Table holds six countries (GB, US, CA, AU, NZ, IE); the on-cost rate is one figure for the country | For the United States, employers' state unemployment insurance varies by state: a note under the on-cost rate where the country is the US, its rates added to each state's row in the states' table (`UsStates.ts`, Questions 10, section 2.2, built 2026-11-20, which holds each state's filings and sales tax) |
| The legal fees say when they were checked | The fees' checked date lives with the fees (`LEGAL_FEES_CHECKED`, 2026-11-19), and the Review says when it is a year old | Nothing here |
