# 47. Customer Engagement: the chapter, its tiles and the Offering's four faces, as proposed

Status: **specification**, written 2026-11-12, updated 2026-11-12. Built in part. The owner approved it on 2026-11-12 (D6). **Step one (the layout) is built (2026-11-12, phase 1)**: one chapter per Segment of four Master Tiles, each opening its section as it was (section 3). **The page follows the Foundation (2026-11-12, phase 1; owner, 16:19: "Update the Customer engagement to follow the answers from the foundation")**: the suggested channels, the suggested relationship type and the proposed Demand rows of step two are built (section 3, "Built"). The rest of step two (the stage-first Journey, the channel card with J1 and J2, the goals reading Demand, the cost per customer) comes in phase 5 (the order of work: doc 49, section 8).

Related: doc 28 (section 7, the journey and its questions J1, J2, J3, J7), doc 40 (the form), the page 2 specification (`specifications/business-system/page-2-section-1-channels.md`), `ai/customer-engagement-layout.md`, `ai/tile-and-card-pattern.md`, doc 5 (5.3, C4, C7, C8), doc 48 (the Offering Economics card), doc 46 (BA3 and the Body Language draft read this page).

## 1. What the page holds today

One card per Segment, in its colour, with the references (Segment, Profiles, Offerings) and three folding sections: **Customer Channel** (channels by 13 categories, Offerings, Journey Stages, Actions, Links, "+ Add expense", the action markers, the Channel resources table); **Customer Relationship** (per Offering, from the Profiles' functional needs; Relationship Types with a Purpose; per stage the Approach and a Goal: Get, Keep, Grow); **Demand & Conversion** (per Offering: sources, figures, Customers Buy, Cancel / Month, Expected Sales).

## 2. The Offering's four faces

| Face | Owner | Key fields | Starts from Page 1 |
|---|---|---|---|
| **Demand** | Page 2, Demand & Conversion | sources, funnel figures, Customers Buy, Cancel / Month, Expected Sales | O3 |
| **Delivery and capacity** | Page 3, Offering's Capability → Delivery card | Delivered, Hours Given, hours per unit or client, Calendar Time, Constraints; capacity = founders' delivery hours | O3, O15, O10 |
| **Cost** | Page 3 cards linked to the Offering → Page 4 | Resources, Activities, Partners, Suppliers with shares; cost per unit | none |
| **Price and revenue** | Page 5, Revenue stream card | Charged, Unit, Price, Volume, Development, Payment Timing, variable cost per unit | O3, O3b |
| **Can it be delivered?** | Page 3, the Delivery dialog, at the normal level of sales; Page 5, month by month as sales grow (the busiest month) | expected sales × hours per unit against the founders' delivery hours | read |

The Offering is the hub of pages 2 to 5 and each page holds one face; the founder never sees the four together.

**The delivery check stays where it is** (owner, 2026-11-12 15:54: "Leave Page 5 until step 7"). Page 3 already owns it at the normal level of sales: the Delivery dialog gives the founders' delivery capacity, each Offering's hours at the expected sales and what is left. Page 5's "Can the Expected Sales Be Delivered?" answers another question, the busiest month as sales grow, which needs page 5's growth figures; it stays, and in phase 7 it joins the Offering Economics card on the Revenue & Pricing page (doc 48, section 11).

## 3. One chapter per Segment

The Foundation page's shape (one chapter per Segment, four Master Tiles, 2 × 2), so the two pages read alike and a Segment keeps its colour and place.

| Master Tile | Opens | Nested tiles and cards | Its face lists |
|---|---|---|---|
| **Journey** | the five stages as sub tiles | **Stage** → its channels as card tiles (3 a row, "+ Add card") → the floating **channel card**; above the cards, the stage's **suggested channels**, each with Add | the five stages, each with its channels' count |
| **Relationships** | one card tile per Offering | the floating **relationship card** (types, purpose, per stage the Approach and the Goal) | the Offerings with their relationship types |
| **Demand & Conversion** | one card tile per Offering | the floating **demand card** | the Offerings with their expected sales a month |
| **Channel Costs** | a table tile (read-only) | the Channel resources table, plus spend a month and cost per customer per channel | the total spend a month and the cost per customer |

**Step one (layout only), built 2026-11-12:** the four tiles open the existing sections and table as they are, with no question changed (doc 5, 5.3). The faces: Channels (named so by the owner, 2026-11-12 17:04: "This is not the Journey but the Channels"; its face the five stages, each with the number of channels used at it), Relationships (each Offering with its relationship types), Demand & Conversion (each Offering with its expected sales a month, or its active clients), Channel Costs (the fixed cost a month, each variable cost, the one-time costs). Each dialog's help is the "i" beside its heading. The Segment's three reference columns (Segment, Profiles, Offerings) are no longer on the page (owner, 2026-11-12 16:41: "Remove the From your Foundation part"): Page 1 holds them. The Channel Costs table and the Relationships rows are wider than the chapter's card (a dialog is the card's width): the owner decides how they are shown.

**Built with step one, from step two (2026-11-12): the page follows the Foundation.** Every rule is in `JourneySuggestions.ts`, with its tests on both examples; nothing is added by itself, and no question or saved key changed.
- **Suggested channels, in the one grid of channels** (owner, 2026-11-12 16:41: "Why are there 2 sections with Channels?"): a channel's tile lists its suggested subchannels after its own, faded; a channel the Segment does not use yet is a faded tile listing what is suggested for it, and pressing it adds its first suggestion at its stage; in a channel's dialog, a suggested subchannel's faded tile says its stage and the answer it comes from, and pressing it adds it at that stage. Each tile's "i" names its suggestions with their stage and source; the Channels dialog's "i" says that faded items are suggestions, added only when pressed. A suggestion goes once the Segment has the channel. Discover reads the Segment's discover answer and the Profiles' social media, communities and events (C2 to C4), In Person and Community first for a Segment in one city; Evaluation reads D1 (a demo, trial or sample in person for a physical item, online otherwise); Purchase reads where they shop, how they pay, and a buyer who decides by tender (Invoice); Delivery reads O6; Support & Follow Up reads O7, then D2.
- **A suggested relationship type** (the Relationships dialog, above "+ Add Relationship Type"): the most personal of O7 and D2, with an Add, shown while the Offering has not that type.
- **Proposed Demand rows** (the Demand & Conversion dialog, above "+ Add Customer Source"): one for each Discover channel that serves the Offering and is not yet among the channels that bring its customers (its Customer Source by the channel's category; the row's Add records the channel in `demand.channelIds`), and Contracts or tenders where the buyer decides by tender.
- **Left out, no channel of their own:** "Media, reviews and comparison sites" (discover); "Buy Now, Pay Later or financing" (pay); "None" (O7); C2 to C4's Other. **Not proposed:** Repeat customers for a recurring Offering, which the Demand rules exclude (a recurring Offering's clients stay rather than buy again): the owner decides.

**Step two (the journey rebuild, doc 28, 7):**
- **The channel card** holds doc 28, 7.3's fields: category (the stage's usual ones), subchannel, Links, Offerings served, J1 *Are you using this channel yet?*, J2 *What do you do here?* (by stage), the Approach (a note), J7 the goal, "+ Add expense". One channel at several stages is one card shown in each (the shared-action pattern).
- **The suggested channels read Page 1** (built 2026-11-12, above; the "Asked, not read" items): Discover from the Segment's discover and reach and the Profiles' social hubs (C2 to C4); Evaluation from D1; Purchase from the Segment's pay and shopping answers; Delivery from O6; Support & Follow Up from O7 and D2. Each names its source.
- **Relationships suggest a type** (built 2026-11-12, above) from D2 and O7, and each type's "i" carries its fixed definition (touch level, who delivers, typical channels, cost driver; doc 5, C4).
- **Demand proposes its rows** (built 2026-11-12, above; Repeat customers left for the owner) from the Discover channels serving the Offering, plus Repeat customers for a recurring O3, plus Contracts or tenders where the Segment's buyer authorises by tender (doc 28, 7.5). `demand.channelIds` is then read, giving the cost per customer.
- **The goals read Demand's figures** (the J7 targets are withdrawn, section 4): Get reads the Demand rows of the channel (`demand.channelIds`), Keep reads Cancel / Month, Grow reads the Repeat customers row. Strategy's Metrics link to them (doc 49, 2.7).
- **Prototype first:** a card is 492px wide and the journey reverses today's order; the stage card is prototyped and passes the layout check before anything is built on it (doc 28, 7.2).

## 4. The questions

The channel card's questions are worded in doc 28, section 7.3, with their options, and are unchanged: **J1** Are you using this channel yet?; **J2** What do you do here?; **J3** How do you keep the relationship?; **J7** What should this achieve?. This card adds none.

**Withdrawn on 2026-11-12: the J7 goal targets.** Demand & Conversion already owns each figure (Get: the rows of new customers per channel, `demand.channelIds`; Keep: Cancel / Month; Grow: the Repeat customers row); Strategy's Metrics link to those figures (doc 49).

**Read by other cards:** J3 writes the second half of the Ambassador's Body Language draft (doc 46, section 3).

## 5. Decided

| # | Decision | Approved (owner, 2026-11-12 14:10) |
|---|---|---|
| D6 | Customer Engagement shape | One chapter per Segment, four tiles |
