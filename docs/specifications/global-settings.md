# Global Settings

Status: **specification**, written 2026-11-15 (owner, 17:11: "create, update and optimise the docs (specs per page)"). It says how the screen is drawn today and which rule each part follows; the rates' sources and the decisions behind them are in the documents linked from each part, each the one owner of its facts.

> **Global Settings** · opened from the header's **Settings** button (`/settings`, `pages/GlobalSettings.tsx`). Back, and Escape, return to where it was opened from.

## As built

The rates and limits the calculated lines read, held in one place (the cost model, section 6; `framework/engine/GlobalSettings.ts`). Every figure is kept as typed and saved at once; a change here reaches every line that reads it. Each section is a card of fields; every detail stands in an "i" beside its label (layout rules, 14).

| Section | What it holds | Owner of the detail |
|---|---|---|
| Business stages | The Opening Date (entered on the Organisation tile), the four stages' durations, today's stage | doc 28, 8.2a |
| Financial plan | The Financial Foundation's own settings (its answer, edited here) | [page 4](business-system/page-4-financial-foundation.md) |
| Assets | The capitalisation limit, the useful life of each asset group, each asset's own years, the intangible assets' amortisation | [page 4, 30.6](business-system/page-4-financial-foundation.md#306-dates-rates-and-floors) |
| Rates | The employer on-cost coefficient, the royalty, affiliate and sales-agent rates | the cost model, section 6 |
| Reserve | The Startup and Operational Contingency Funds, the target operating reserve | [page 4, 30.3](business-system/page-4-financial-foundation.md#303-funds-rules-f1-to-f6) |
| **Channel Fee Table** | What each channel takes of its sales | below |

## The Channel Fee Table

**What a row is.** A provider (a payment service or a marketplace) in one country: commission (% of the channel's revenue), fixed fee per order (in the row's currency), chargeback or risk allowance (%), and a note that says where the rate comes from and when it was checked. Charged as revenue x (commission + allowance) + the fixed fee x orders (`channelFeeOf`).

**Where the rows come from.** The app's fee data (`framework/engine/ChannelFeeData.ts`) holds a row for every provider and marketplace the app lists, in each of the six first-version countries (GB, IE, US, CA, AU, NZ): **checked** (its rate and the date it was read), **not checked** (no rate yet, or a figure from a secondary source, said in its note) or **not available** there. A new Organisation's table starts from all of them; a saved table migrates once (data version 2): its rows become the UK's, the rows it lacks are added, and the old combined "Wolt, Amazon" row is gone. The figures and their sources: doc 50, section 1.4.

**Which rows the screen shows** (owner, 2026-11-15 15:10 and 16:37; layout rules, 1, "Related to the answers"):

- the rows of the Legal Entity's country (the UK's while none is chosen),
- of those, the ones a name of the user's own channels takes: a subchannel, an expense card, or a payment service the Segment names (doc 35, Box 4, 8a) -- whatever its status, so a provider not checked yet, or not available in the country, says so;
- an **"Entered by you"** row for each name written in under an Other (a marketplace, a payment service, a paying subchannel) that no row takes; it is kept once anything is typed in it.

There is no "+ Add channel" and no x: a row appears with its channel and leaves with it. Every value stays editable.

**Reset** (under the table) asks first, in the app's confirmation dialog, then gives the country's rows back as the fee data has them (a rate changed is restored, a row removed is back); the rows the user made and other countries' rows stay (`resetChannelFees`).

**Who reads a row.** The match is by name, the more particular first (Stripe Terminal before Stripe; `channelFeeRowFor`), in the Legal Entity's country; a row with no rate, or not available there, is never charged.

- A paying subchannel's card on Customer Engagement shows its **Fees** (its own name, its expense cards' names, then the Segment's payment services; doc 47).
- The forecast's channel fees ([page 4, 30.4](business-system/page-4-financial-foundation.md#304-calculated-lines)): a "% of revenue" card is charged on each Offering's own revenue through the card's subchannels, at the full rate; a payment service's card with no price is charged from its row; never twice.
