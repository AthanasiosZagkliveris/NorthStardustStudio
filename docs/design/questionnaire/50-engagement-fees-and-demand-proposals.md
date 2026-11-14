# 50. Channel fees on Customer Engagement, and what Demand & Conversion could add

Status: **specification**, built 2026-11-14 (owner, 12:00: "For the proposed changes (Fees, Demand recheck) check the best solution and apply them"): 1.4 and 2.5 as recommended -- the UK rows (PayPal marked not checked), the match by name (`channelFeeFor`), the Fees line on a paying subchannel's card with the fee on each Offering's sale and the link to Global Settings; "Tried it (%)" (`funnelIsTrial`) and the read-only time to buy (`monthsToClose`), not fed into the forecast (Sustainability's ramp already starts sales slowly; a shift would need the forecast to hold the contacts month by month). Written as a proposal 2026-11-14, for the owner's decision (owner, 2026-11-14 09:31: "Check the global settings, channel fees section, where it could be placed on the engagement page, and how"; "Make an online research, regarding Demand & Conversion, and check if there are any missing information as options"). 

Related: doc 47 (Customer Engagement), doc 48 (the Financial pages), `src/framework/engine/GlobalSettings.ts` (the Channel Fee Table), `src/framework/engine/CalculatedLines.ts` (`channelFeeRowFor`), `src/framework/engine/DemandCapacity.ts` (`DEMAND_SOURCES`).

## 1. The Channel Fee Table on Customer Engagement

### 1.1 What it is today

- **Where:** Global Settings, "Channel Fee Table": one row per channel or platform (Stripe, PayPal, "Wolt, Amazon"), each with a commission (% of the channel's revenue), a fixed fee for each order, a chargeback allowance (%) and a note. The rates are examples the founder edits once.
- **What reads it:** the Financial Foundation's calculated fee lines. A percentage-cost card (a "% of Rev" supplier such as Shopify Payments or SumUp) takes the row whose channel its name contains (`channelFeeRowFor`), and the line is revenue × (commission + chargeback) + orders × fixed fee, shared between the Offerings it serves.
- **What Customer Engagement knows:** the channels and subchannels (Direct Payment › Card, Website › Online Store, Marketplace › Etsy) and, through the Inventory's Channel Costs, the cards a channel holds.

### 1.2 Where it could stand

| Option | What the founder sees | One owner per fact |
|---|---|---|
| **A. A read-only Fees band on a subchannel's card** (recommended) | On Direct Payment, Website and Marketplace subchannels: "Fees: 2% + £0.25 an order + 0.5% chargeback (Stripe)", read from the row that matches the subchannel's name or its payment card, with a link "Change in Global Settings". Where no row matches a payment or marketplace subchannel: "No fee set for Etsy: add it in Global Settings". | Yes: Global Settings stays the owner; the card only reads it. |
| B. A field band on the Purchase stage's table | A Fees column in the Purchase stage's table. | Yes, but the fees are a channel's, not a stage's: the other stages would show nothing. |
| C. Editable fees on the card | The same figures, typed on the card. | No: two places for one figure. |

### 1.3 Recommendation

Option A, read only. A subchannel the founder sells through is where the fee is felt; the figure stays in Global Settings, where the Financial Foundation reads it. Shown only on the categories that take a fee (Direct Payment, Website, Marketplace), so no other card grows a band. It also closes a gap: a marketplace subchannel made from the answers (doc 47, the marketplace option) now says whether its fee is set.

### 1.4 Making the fees easier (owner, 2026-11-14 11:15: "How could it be optimised better the channel fees, so to improve the user experience")

- **Start from today's UK rates.** The table's examples are out of date: Stripe's standard UK-card rate is now about 1.5% + 20p (premium cards 1.9% + 20p), not 2% + 25p. Ship the main UK platforms as rows, each with its rate, the date it was checked and its pricing page:

  | Platform | What it takes (checked 2026-11-14) | Where from |
  |---|---|---|
  | Stripe | 1.5% + 20p (UK cards); 2.5% + 20p (EEA) | Stripe's pricing page, as quoted by Wise and Airwallex |
  | SumUp | 1.69% in person; 2.5% online (payment links, invoices) | SumUp UK pricing |
  | Shopify Payments | 2.0% + 25p in person on Basic (to 1.5% + 25p on Advanced) | Shopify UK pricing, as quoted by SumUp |
  | Etsy | 6.5% transaction + 4% + 20p payment processing; about 16p a listing | Etsy's fee pages, as quoted by A2X and Elver Accountants |
  | Stripe Terminal | 1.4% + 10p in person (UK cards) | Stripe's UK pricing page |
  | PayPal | its UK rates, to be read from PayPal's merchant fees page | (not checked yet: its row says so) |

  Each rate is to be read again from the platform's own page before it is shipped (the search returned third-party copies of them).
- **Match by the name, as the cost lines already do.** A subchannel named after a platform (Etsy, Shopify, SumUp) and a supplier card named after one take its row (`channelFeeRowFor`); no step for the founder.
- **Show it where it is paid** (option A above): the subchannel's card reads "Fees: 6.5% + 4% + 20p a sale (Etsy, checked 14 Nov 2026)", and what that comes to on the Offering's price ("on a £95 sale: about £10.18"), with the link to Global Settings.
- **One place to change it:** Global Settings, as now; the card's line says "Change in Global Settings".

**Recommendation:** all four, in that order: the UK rows with their dates and sources, the match by name, the line on the card with the amount on a sale, Global Settings the one owner.

## 2. Demand & Conversion: what the sources measure, and what the app asks

### 2.1 What the app asks today

- **Customer Source, by kind:** Referrals (introductions a month, Buy %); Sales funnel (prospects a month, Qualified %, Buy %); Repeat customers (Buy Again %, Times Each); Contracts or tenders (bids a year, Won %, units a contract); Marketplace or walk-in (visitors a month, Buy %); Other (a figure). Each with its Channel, Estimated (Calculate or a figure) and a Basis.
- **Customers Buy:** one sale at a time, or every month until they cancel, read from the Offering's terms (O3); Cancel / Month (%) for the second.
- **Expected Sales** and **Assumptions**; the ramp, price, items per order and delivery charge are on Sustainability.

### 2.2 What the sources build a forecast from

- **A bottom-up forecast** builds revenue from its drivers, each source on its own: traffic or leads by source, the conversion from each stage to the next, the customers won, then churn and retention; a transactional shop as traffic × conversion × average order value, a services business as pipeline × close rate × project size. Its rates should be the business's own, tested against a market-size ceiling (LaunchRock, *Bottoms Up Forecast*; Forecastr, *How to build a great forecast*).
- **AARRR** (Dave McClure, *Startup Metrics for Pirates*, 2007): Acquisition, Activation, Retention, Referral, Revenue, with a conversion metric at each stage (ProductPlan, *AARRR framework*).
- **UK guidance:** a sales forecast for 12 to 18 months with the cash flow (NI Business Info, *Financial forecasts for your business plan*); plan for seasons and for quiet and busy periods (Start Up Loans, *What is a cash flow forecast?*); a new business tends to forecast over-optimistic sales, and readers discount for it (South Tyneside Council, *Prepare a business plan*).

### 2.3 What is missing, and whether it is asked elsewhere

| Missing | Why it matters | Asked elsewhere? | Proposal |
|---|---|---|---|
| **Activation** (a free trial, sample or first session that turns into paid) | AARRR's second stage; the step a subscription or a service often loses most at | Partly: an Offering's terms can be a trial (doc 43); no rate is asked | A source kind "Trial or sample": trials a month, Paid (%) |
| **The time to buy** (from first contact to sale) | A B2B funnel or a tender takes months: sales arrive later than the contacts | No | A "Months to close" figure on Sales funnel and Contracts; the forecast shifts the sales by it |
| **Seasons** | UK guidance asks for quiet and busy periods | Partly: the Profiles' "When does {s} usually buy?" (D3) and "Sales, seasons or planned gifts" | Read D3 into a monthly pattern on Sustainability's ramp; no new question |
| **Cost per customer, per source** | Whether a source pays for itself (CAC against what a customer brings) | Partly: the channel costs (Inventory, Channel Costs) and the sources' channels | Worked out, not asked: each channel's monthly cost ÷ the customers its sources bring (doc 47, step two) |
| **A ceiling from the market** | A forecast tested against how many customers there are | Partly: Market Size is text on the Foundation | A figure "Customers in reach" on the Segment, read as a check, never a cap |
| **A low and a high case** | Rates for a new business are guesses: three scenarios are the usual answer | Yes: the Financial Foundation's stress test and "What it would take" | None: link to them from Assumptions |
| **Average order value** | Traffic × conversion × order value | Yes: Sustainability's price, items per order and delivery charge | None |

### 2.4 Recommendation

Add the two that change a figure the app writes and that nothing else asks: **Activation** (a "Trial or sample" source kind) and **the time to buy** ("Months to close"). Read **seasons** from D3 and work out **cost per customer** from what is already recorded, with no new question. Leave the market ceiling for the Strategy pages.

### 2.5 The two proposals rechecked (owner, 2026-11-14 11:15: "check if the proposed options could be improved, optimised or if they could be covered by existed options")

- **"Trial or sample" is covered by the Sales funnel.** Its three steps are the funnel's own (AIDA: attention, interest, desire, action; AARRR: acquisition, activation, revenue): Prospects are the acquisition, **Qualified** the activation, Buy the revenue. Where the Profiles compare options by "A demo, trial or sample" (D1), the Qualified step's label and "i" say "Tried it (%)": the people who took the trial or sample. No new kind of source.
- **"Months to close" comes from the answers.** "Who decides to buy?" (`authorise`): one person deciding, or the team agreeing, about a month; a manager signing off or several departments checking, two to three months; formal procurement, three to six months. "How do your customers usually decide to buy?" (`path`): on impulse or out of habit, none. Applied as a start, shown on the Sales funnel and Contracts sources as a read-only line ("Sales arrive about 3 months after first contact, as your buyers decide"), changed only by changing those answers. No new question.

**Recommendation (simplified):** no new source kind and no new question. Word the funnel's Qualified step from D1, and work the time to buy out from `authorise` and `path`; seasons from D3 and cost per customer from the channel costs, as in 2.4.

**Sources for the funnel's stages** (read in excerpt): Singapore Management University Academy, *Marketing funnel*; University of Newcastle Business School, Marketing Technology Lab, *The Marketing Funnel*; Santa Clara University, *Digital marketing and marketing funnel*; Elias St. Elmo Lewis's AIDA (as cited by MasterClass, *AIDA Model*).

**Sources** (each read in excerpt through a search; opened in full before an "i" cites it): LaunchRock, *Bottoms Up Forecast* and *Revenue Forecast*; Forecastr, *How to build a great forecast: key startup metrics and techniques*; ProductPlan, *AARRR framework*; Dave McClure, *Startup Metrics for Pirates* (2007); NI Business Info, *Financial forecasts for your business plan*; Start Up Loans, *What is a cash flow forecast?*; South Tyneside Council, *Prepare a business plan*. University sources for the funnel's stages are in 2.5.
