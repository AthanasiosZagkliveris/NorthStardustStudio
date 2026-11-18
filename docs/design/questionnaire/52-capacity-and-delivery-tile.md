# 52. Capacity & Delivery: the tile, as proposed

Status: **proposal**, written 2026-11-15, for the owner's decision. **Built 2026-11-16:** the rename (section 1, with decision 1 as recommended) and the Skills band (section 9, Capacity and Capability unified: owner, 2026-11-16 20:25). **Built 2026-11-17** (the open decisions and gaps, Group 3; decisions 2 to 8 as recommended): the band's ceiling, its lines and the people's own bars (section 4, section 10), DV6, DV9 and DV10, DV11 (as the hours a Staff, Partner or Supplier card can give), DV12 and DV13 in place of DV5 (section 10), DV1 as O3's record, and the Lumen example's option A (section 7); the lead-time note on the Delivery card (section 10, Group 4b); DV6 under its label, and the Lumen example's looms (DV7, DV8) and finishing supplier (DV13, a week) (2026-11-17). Section 5 (Sustainability) is not built. It renames the Delivery tile of Business Capability (Offering's Capability) "Capacity & Delivery" and places doc 51's seven additions (doc 51, section 4) on it, on the Delivery card, in the Delivery dialog and in Sustainability's check, with existing components only. Section 7 adds one proposal for the Lumen & Loom Studio example.

Related: doc 51 (the research and the seven additions), doc 50 (Demand & Conversion, seasons from D3), doc 43 (the Offering card: O1, O3, O10, O15), doc 47 (Customer Engagement: the subchannels and the journey stage Delivery), doc 48 (the Financial pages), doc 40 (the form of a tile document), doc 44 (the register); `src/components/interview/editors/capability/useCapabilitySections.tsx` (the tile), `src/components/interview/editors/capability/useCapabilityActivityAndDelivery.tsx` (the dialog and the cards), `src/components/interview/editors/BusinessCapabilityModel.ts` (`DELIVERY_HELP`), `src/framework/engine/DemandCapacity.ts` (`founderDeliveryHours`, `capacityCheck`), `src/components/interview/editors/FinancialSustainabilityEditor.tsx` (`capacityBlock`).

## 1. The rename

- **Built:** the tile (`useCapabilitySections.tsx`, the tile with id `delivery`) and its dialog are titled **Capacity & Delivery**. The dialog's first part is the founders' capacity (and, with this proposal, the planning ceiling, the deliverable sales and when to add help); the cards below hold each Offering's delivery. The new name says both.
- **The floating card keeps "Delivery"** as its caption (the tile's `group`): it holds one Offering's delivery only **[decision 1, built as recommended]**.
- **It also separates the tile from the journey stage.** "Delivery" is also a stage of the customer journey on Customer Engagement (doc 47). "Capacity & Delivery" on Business Capability reads as its own place.
- **What changes with it:** the tile's `title`, the dialog's heading, `DELIVERY_HELP.section`'s first line ("How much the founders can deliver, and how each Offering is delivered: …"), the tests that open the tile by name (`BusinessCapabilityEditor.test.tsx`, `openTile("Delivery")`), the examples' golden files, doc 22 (help texts) and the page 3 specification. The tile's id (`delivery`), its anchor (`section-offering-delivery`) and the saved data (`capability.delivery`) stay as they are, so saved work opens unchanged.

## 2. What the tile is

- **Where:** Business System › page 3, Business Capability › Offering's Capability, beside Activities and Partners & Suppliers.
- **The tile (closed):** its title and a link for each Offering; a link opens that Offering's Delivery card alone, floating; the rest of the tile opens the dialog. Unchanged.
- **The dialog, in order** (section 11, owner, 2026-11-18 10:38):
  1. **The Delivery tiles** (`CardBoxes`, one tile for each Offering, its `BusinessCard` floating from it). Each tile says how it is delivered and the hours it takes. Section 3 adds to the cards.
  2. **Capacity**, under its band (`DialogSectionBand`): the founders' delivery capacity line, the per-founder list, and each founder's month at the expected sales (the `delivery-budget-table` and its bar). Sections 4.1 to 4.4 add to it.
  3. **Skills**, under its band (section 9).
- **Components used:** only the ones the dialog and card already use: `BusinessCard`, `BusinessField` (side rows), `OptionPicker`, `NumberCell`, `OptionalNote`, `InfoText` with `InfoNote`, the `delivery-budget-table`, the `delivery-budget-bar`, `delivery-muted` lines and `CardBoxes`. The one addition to a look is a mark on the bar at the planning ceiling (section 4.1), made in the bar's own shared style **[decision 2]**.

## 3. The Delivery card, one for each Offering

The card's questions in the card's order, with proposed codes. The card has no codes yet (doc 44 lists none for it); **DV** is free and would be added to `tools/scripts/docs/questions-register.mjs`. DV1 to DV5 are built; DV6 to DV11 are proposed.

### DV1. Delivered

- **Control:** one choice (`OptionPicker`, side row): Per unit, Every month. **Asked:** always. **Started from:** O3. Built.
- **A record of Customers Buy** (built; owner, 2026-11-18 00:46, the review's second batch, 1.2): where O3 leaves it open (unanswered or Free), Delivered is Demand & Conversion's Customers Buy (every month, until they cancel: Every month), one fact with one owner; the note that said they disagree is gone. Asked only while neither says.
- **Working Hours by person lists only those who give working time** (owner, 2026-11-18 02:31): the founders and Staff, and the Partners and Suppliers in a group that does part of the job (Contractors & Advisers, Technical Support, Creative & IT Services, or none yet), never one charged as a share of revenue; and any card that says its hours a month, or already holds hours on the card (`givesWorkingHours`). A courier, a payment service, a materials seller and a revenue partner are costs, not people.
- **P3, the people who make it first** (owner, 2026-11-18 03:01 UTC+2: "All, P1 to P9"): Working Hours by person lists the Team of the Offering's Production activities first, in their order, then the other founders and people; the hours stay blank (no answer holds a time).
- **P5, Hours Given per month** (owner, 2026-11-18 03:01 UTC+2: "All, P1 to P9"): Per month is already where Hours Given starts for every Offering delivered every month (a dedicated person or team included); Per week only where the founder chooses it. Nothing to add; the hours are the founder's.

### DV2. Hours Given

- **Control:** one choice: Per month, Per week. **Asked:** when DV1 is Every month. Built.

### DV3. Working Hours per Unit, by person

- **Control:** a `NumberCell` for each founder and each External Professional linked to the Offering. **Asked:** always. Built.
- **With DV6 (proposed):** on a session card the label reads "Working Hours per Session, by person", and the total line adds "about N h a customer" (hours ÷ DV6).

### DV6. Customers in one session (proposed; doc 51, addition 5)

- **Control:** a number (`NumberCell`) under its label (the label is long for the side column; 2026-11-17, the layout check), starts at 1. **Asked:** when DV1 is Per unit and the Offering is delivered as a session, class, workshop or event **[decision 3: which O1 or O3 answers count]**.
- **What it changes:** the hours a sale takes are DV3 ÷ DV6; the budgets and Sustainability's check read the hours for the sessions needed (expected sales ÷ DV6, rounded up). With DV6 at 1 every saved card reads as today.
- **The "i" says:** "The most customers one session serves: a class of 8 in a 3-hour session takes about 23 minutes a customer. Expected sales count customers; the hours count sessions."
- **Lumen:** Weaving Workshops (up to eight a workshop) gets DV6 = 8 and DV3 per session (Maya Chen 3.2 h, the linked External Professional 0.8 h): the same 0.4 h and 0.1 h a participant as today, now read as about 4 sessions a month for the 32 places.
- **P4, its start** (owner, 2026-11-18 03:01 UTC+2: "All, P1 to P9"): on a card not yet saved, the Quantity of the one equipment or workspace Resource that serves this Offering alone, where it holds more than one (Lumen's eight frame looms for the workshops: eight places); blank otherwise.

### DV4. Calendar Time (weeks)

- **Control:** a number. **Asked:** when DV1 is Per unit. **Started from:** O15. Built.
- **Its start, less the sending** (owner, 2026-11-17 08:38: "Bugs plus the first batch" of the review): O15's upper end less the weeks the sending takes (O20: about a week by post, courier or a fulfilment service), a week at least -- "One to four weeks" by courier starts 3. The lead-time note (section 10) is said once the card is the founder's own (saved), never on its starts alone.

### DV7 and DV8. Limited by, and Holds at once (proposed; doc 51, addition 4)

- **Control:** one optional side row: DV7 a one-choice `OptionPicker` of this Offering's Resource cards (equipment, workspace), DV8 a `NumberCell` beside it. **Asked:** when DV1 is Per unit and the Offering has at least one Resource card.
- **What it checks:** the card's "about N running at once" line adds "· the 3 floor looms hold 3", and where the running work is more than DV8: "About 4 running at once: the 3 floor looms hold 3. Plan for a longer Calendar Time or one more loom."
- **The "i" says:** "The equipment or room each unit needs while it runs, and how many units it holds at once. A loom, a kiln or a treatment room often sets the pace while the founders still have hours."
- **DV12's starts** (built; owner, 2026-11-18 00:46, the review's second batch, 2.10): on a card not yet saved, Equipment or a workspace where a Resource of that kind serves the Offering (the one, where there is one), and Materials from a supplier where a Supplier with a lead time serves it (the one, where there is one).
- **DV12's starts unticked to none stay none** (owner, 2026-11-18: a start follows its source until edited, and unticking every tick is an edit): the card is kept, saved with no ticks.

### DV9 and DV10. Set-up for a batch, and Units in a batch (proposed; doc 51, addition 7)

- **Control:** two optional numbers on one side row. **Asked:** when DV1 is Per unit and the Offering's category is a Product or Hybrid (doc 43).
- **What it changes:** the hours a unit takes add DV9 ÷ DV10; the total line shows "set-up adds 0.5 h a unit".
- **The "i" says:** "The time one batch takes to set up (warping a loom, firing a kiln, preparing a kitchen) and the units it makes. Bigger batches spread the set-up over more units."
- **A physical item only** (owner, 2026-11-17 08:38: "Bugs plus the first batch" of the review): asked of a Product or Hybrid not made to order that is physical (`offeringIsPhysical`); a digital file, an app or online access has no batch.

### DV5. Constraints

- **Control:** `OptionalNote`, free text. **Started from:** O10. Built. With DV7 and DV8, it keeps what a figure cannot hold (lead times, availability).

### DV11. Hours a month they can give (proposed; doc 51, addition 7)

- **Where:** on the External Professional's card (Partners & Suppliers), one optional `NumberCell`; its one owner is that card. Listed here because the Delivery card and the dialog read it.
- **What it checks:** the dialog and Sustainability report a professional's hours above it: "Ana: 30 h needed a month, 20 h available."

## 4. The Delivery dialog: the Capacity band

Doc 51's additions 1, 2, 3 and 6 add lines to the band. None asks a new question: each is read from answers already given. The quoted figures show the wording; they are illustrations, not Lumen's results (Lumen's 99% for Maya Chen is what the dialog shows today).

### 4.1 The planning ceiling at 85% (addition 1)

- **The bar:** a mark at 85% (section 2, decision 2). The line under the bar: "99% of Maya Chen's delivery hours at the expected sales. A plan holds best at 85% or less: that leaves room for a busy week or a day off." At 85% or less: "72% of Maya Chen's delivery hours at the expected sales: room for a busy week or a day off."
- **The "i" (`CAPACITY_UTILISATION_HELP`) adds:** "Above about 85%, waiting and late work grow fast (Choo, 2016, after Kingman)."
- **The ceiling is a constant** (`PLANNING_CEILING = 0.85` in `DemandCapacity.ts`) **[decision 4: fixed, or a figure in Global Settings]**.

### 4.2 The sales the capacity can deliver (addition 2)

- **One `delivery-muted` line per founder above the ceiling:** "At 85% of Maya Chen's hours, about 14 Bespoke commissions a month fit; the expected 18 leave about 4 a month, about £380, for more hours or help."
- **Which Offering gives way:** the last one in the budget (recurring work stays first, as today) **[decision 5]**.
- **Read by:** the Business Plan's risks and operations text (not built yet). The forecast stays as the founder set it.

### 4.3 When to start adding capacity (addition 3)

- **One line, from Sustainability's ramp:** "Maya Chen passes 85% in March 2027. To have help by then, start looking by January: hiring takes about 5 weeks in the UK, then notice and training (Totaljobs, 2025)."
- **The lead time:** 8 weeks in all (5 to hire, 3 for notice and training) **[decision 6]**. A first employee also needs PAYE registration and Employers' Liability insurance (GOV.UK): the line links to Legal Entity › Registrations.

### 4.4 The busiest times (addition 6)

- **Now:** where a Segment's D3 is Evenings or Weekends and the Offering is delivered live (In Person, Online / Live subchannels), one line: "Your customers buy in the evenings and at weekends: plan the delivery hours for those times."
- **With doc 50's seasons:** the busiest month, "December needs 118% of Maya Chen's hours", in the band and in Sustainability's check.

## 5. Sustainability: "Can the Expected Sales Be Delivered?"

- **Today** (`capacityBlock`): the founders' hours needed against their hours month by month, the first month short, and the busiest month.
- **Proposed, in the same `FigureTable` and verdict line:**
  - a column or row mark for the months above 85%, and the verdict names "the first month above 85%" beside "the first month short" (4.1);
  - the sales and revenue beyond the ceiling in the first such month (4.2);
  - the month to start adding capacity (4.3);
  - External Professionals' hours above their DV11, by name.
- **Reads:** `capacityCheck` gains the ceiling and returns `firstAboveCeiling`; nothing else on the page changes.

## 6. Order of building

1. The rename (section 1): words, tests, examples, docs.
2. 4.1, 4.2 and 4.3 with section 5: no new question, the largest gain for the plan.
3. DV6 (Customers in one session), then DV7 and DV8, then DV9 and DV10, then DV11.
4. 4.4 now for D3; the busiest month with doc 50's seasons.

Each step: tests, the examples (`src/data/examples/`), the golden files, doc 44 (`npm run docs:index`), doc 22, the page 3 specification and the log.

## 7. The Lumen example: Weaving Workshops sold through the Online Store

- **Today:** Weaving Workshops' two Customer Sources are a Sales funnel through Instagram (about 160 enquiries a month, 25% ask for dates, 50% book: 20 places) and Referrals (20 introductions, 60%: 12 places); 32 places a month. Its Purchase approach on Customer Engagement is "Simple online booking", and the Online Store (Website) serves every Offering. With the 20:25 rule (a channel's share of revenue split by what each Offering sells through the expense's own subchannels), Shopify Basic and Shopify Payments, shared 70/30 with the Workshops, fall wholly on the Collection: the Workshops sell nothing through the Online Store.
- **Proposed (A, recommended):** the funnel's subchannel becomes the Online Store, with its Basis: "About 160 people a month ask about workshops through Instagram and the Facebook group; one in four opens the dates in the online store, and half of those book there." The places stay at 32 a month; the Online Store's costs are then shared by what each Offering sells there.
- **B:** a third Customer Source, Online Store visitors who book without asking first (for example 200 visits, 2%: 4 places). It adds sales, so the forecast and every figure after it move.
- **[decision 7]** A or B; and whether the bookings go through the Shopify store or the Workshop booking app (£23 a month), in which case the subchannel is Website › Booking / Registration Page and the booking app is its expense.
- **Then:** the example JSON, its golden files and the Inventory's shares are rewritten and checked on the page.

## 8. Decisions for Thanos

1. The floating card keeps the caption "Delivery" (recommended; built so on 2026-11-16), or takes "Capacity & Delivery" too.
2. A mark on the capacity bar at 85% (one addition to the bar's shared style), or the line under the bar only.
3. Which Offerings ask DV6: those whose O1 or O3 answer is a session, class, workshop or event (recommended), or every Per unit Service.
4. The ceiling fixed at 85% (recommended), or a figure in Global Settings.
5. Which Offering's sales give way above the ceiling: the last in the budget (recommended), or each in proportion.
6. The lead time to add help: 8 weeks (recommended), or asked once on the Founder cards.
7. The Lumen example: A (recommended) or B, and the Shopify store or the booking app.
8. The code prefix DV for the Delivery card's questions.

**Answered 2026-11-17:** each as recommended (decision 1 built 2026-11-16).

## 9. The Skills band (LC1), built 2026-11-16

The owner, 2026-11-16 20:25: "capacity and capability should be unified, and the capability section to be removed." The Legal Entity's Capability tile (its two texts, Gaps and Cover) is gone; what it asked is asked here, between the Capacity and the Delivery cards.

- **The dialog, in order:** 1. Capacity, as before; 2. **Skills**; 3. the Delivery cards, three a row.
- **LC1, "Which skills does the business still need?"** Ticks, one a line: Bookkeeping and tax; Legal and contracts; Marketing and social media; Selling; Design; Website and technology; Making or producing; Customer service; Delivery and logistics; Other (a numbered list, one skill a row). Its "i": "Skills the plan needs that the team lacks today. Each one's cover comes from the Team of its activities."
- **The cover, read, never typed.** Beside each ticked skill, "Covered by:" and the names on the Team of the activities in its group, each a link to that card: Marketing and social media from Marketing; Selling and Customer service from Sales & Customer; Making or producing and Delivery and logistics from Production; the rest, and every Other row, from Infrastructure's Pre-Operational and Operational. With no one there, "Not covered yet", a link to the Activities tile.
- **Notes:** one shared Notes field (`NotesField`), with no placeholder.
- **Saved as** `skillsNeeded` (the ticked ids), `skillsOther` (the rows) and `skillsNotes` on the Business Capability answer (`src/framework/engine/capability/skills.ts`).
- **Read once from the old answer.** While `skillsNeeded` has never been saved, every reader takes the Founders Profile's `teamGaps` as Other rows, one a sentence, and `teamCover` as the Notes; the page saves that the first time it can write, where that text is there (a page opened fresh is left as it is). `teamGaps` and `teamCover` are kept as legacy keys, read only.
- **Readers:** the Business Plan's "Skills and Cover" (each skill with its cover or "not covered yet", then the Notes; "Not covered by the Foundation answers." when there is nothing); the Business System's export (Offering's Capability, after Delivery); the Review (one item per skill not covered yet, linked to Capacity & Delivery). The Founders Profile's export holds the founders alone.
- **The code LC1** is this document's. Doc 44 registers the Foundation's cards only (page 1 of the Business System, the Organisation and the Positioning), so LC1 is not in it.

## 10. Built 2026-11-17: the band, the card, and what can hold up delivery

The open decisions and gaps, Group 3 (owner, 2026-11-16 21:51; the coordinator's brief). Codes are permanent; DV5 is retired.

- **The bar** (`delivery-budget-bar`, one for founders and the people beside them): a fixed mark at 85% (`PLANNING_CEILING`, `DemandCapacity.ts`).
- **The line under a founder's bar:** above 85%, "99% of Maya Chen's delivery hours at the expected sales. A plan holds best at 85% or less: that leaves room for a busy week or a day off."; at or below, "72% of Maya Chen's hours: room for a busy week or a day off." Its "i" adds the ceiling, after Choo (2016) and Kingman (1961).
- **What fits** (4.2): the last Offering in the budget gives way first, the one before it where the last cannot take all the excess. One Offering: "At 85% of Maya Chen's hours, about 14 Bespoke Commissions a month fit. The other 4 a month, about £380, need more hours or help." Several: "At 85% of Maya Chen's hours, 3 Trade Collection orders and 1 Bespoke Commission a month, about £2,832, need more hours or help." (`offeringCount`: a name said in the plural counts itself, any other counts orders.) The sales beyond stay in the forecast as the founder set them.
- **When to add help** (4.3): "Maya Chen passes 85% in June 2027. To have help by then, start looking by April." -- the plan's months at the expected sales (`salesCapacity`, `firstAboveCeiling`), 8 weeks ahead; its "i" cites Totaljobs (2025) and GOV.UK (PAYE, Employers' Liability insurance).
- **Busy times** (4.4): where a Profile answers D3 with Evenings or Weekends and an Offering of its Segment is delivered in sessions: "Your customers buy in the evenings and at weekends: plan the delivery hours for those times."
- **The people beside the founders:** a Staff, Partner or Supplier card with "Hours a month they can give" gets its own bar and line: "Ana Ruiz: 30 h needed a month, 20 h available."
- **DV1** is O3's record where O3 is answered (a saved card follows O3).
- **DV6, Customers in one session:** asked where the Offering is delivered in sessions (O1 A live online session or An in-person service, or O3 Per session) and DV1 is Per unit; DV3 then reads "Working Hours per Session, by person", the hours a customer are DV3 ÷ DV6, and the total line adds "about N h a customer". Its "i" as section 3.
- **DV9 and DV10, Set-up for a batch (hours) and Units in a batch:** asked for a Product or Hybrid, DV1 Per unit, unless O14 is Made to order; each unit carries DV9 ÷ DV10, each person in proportion to their own hours; the total line adds "set-up adds N h a unit".
- **DV12, What can hold up delivery?** (replaces DV5, Constraints): ticks -- Equipment or a workspace (DV7 "Which one?", this Offering's Resource cards; DV8 "How many units can it hold at once?", checked against the units running at once, Little's Law: "About 4 running at once: the floor looms hold 3. Plan for a longer Calendar Time, or add to the floor looms."); Materials or stock from a supplier (DV13 "Which supplier?", this Offering's Supplier cards; the Supplier card's Lead time is added to the Calendar Time, with "Linen yarn takes 3 weeks to arrive: order 3 weeks ahead of the busy months."); Other (a numbered list). Its "i": "Think about what slows you down when orders pick up: a machine or room, or materials arriving. Tick each one that applies." Partners' time, seasons, skills, licences and money are left out on purpose: the bars, Busy times, Skills, Registrations and Financial Position cover them. A saved Constraints text moves once into Other, one row a sentence; DV5 is retired, replaced by DV12, and its start from O10 with it.
- **Production activities** linked to an Offering show its Delivery hours as a record: "Homeware Collection delivery: 3 h a unit", a link that opens the Delivery card.
- **The export:** the Delivery table's last column is "What Can Hold Up Delivery".
- **Lumen:** Weaving Workshops hold 3.2 h (Maya Chen) and 0.8 h (the tutor) a session for 8 customers, the same 0.4 h and 0.1 h a participant; option A is in the example (section 7).
- **When customers expect it sooner** (Group 4b, 2026-11-17): the card says "Customers expect it within a week, and making and sending it takes about 3 weeks. Keep some ready-made stock, or tell customers 1 to 4 weeks." where the Calendar Time, a supplier's lead time and the sending (O20) take longer than O15 allows.
- **A needed skill's cover, skill by skill** (owner, 2026-11-18 02:31): Marketing and Making keep their group's Team (Marketing's, Production's); Selling the Sales activities but customer service; every other skill the activities whose name says it, in any group -- bookkeeping, a contract or a trade mark, the website, design, customer service, delivery (`skillCover`, `SKILL_WORDS`). Lumen's Website and technology: Oliver Grant, who launches the website (it had listed the lawyer and the accountant). Its "i" says so.

## 11. Decided 2026-11-18: the order a founder thinks in

Owner, 2026-11-18 10:38 UTC+2: "Check the Capacity & Delivery dialogue and the floated card's structure, layout, sequence, content and wording."

- **The dialog** opens on what is delivered: the Delivery tiles first, then the Capacity band, then the Skills band. Each band is the shared `DialogSectionBand`. Before this, the tiles stood last, under the Skills' Notes, with blank faces.
- **A Delivery tile's face:** how it is delivered (DV1, "Per unit" or "Every month") and the hours it takes, everyone together ("5.3 h a unit", "4 h a session", "6 h a client a month").
- **The card, in order:**
  1. What is delivered: DV1 (and DV2, Hours Given).
  2. Who does it and how long: DV3 by person and the total, then DV4, Calendar Time. The note on when customers expect it follows the Calendar Time it is about.
  3. How many at once: DV6, or DV9 and DV10.
  4. What can hold it up: DV12 and its DV7, DV8 and DV13.
  5. The results: "While one runs" and "At expected sales". These read every answer above them, so they come last; before this, they stood between DV3 and the Calendar Time.
- **The card's bands** (owner, same message: "fix the style of the dialogue and the floated cards to fit the other and follow the related rules"): each step above is a box of the shared bands, as a Customer Engagement card -- What Is Delivered, Who Does It and How Long, How Many at Once (where it is asked), What Can Hold It Up, Results -- its title band, then its questions in bands of their own, the tints alternating (`SingleColumn`, `EngagementBoxes`, `EngagementBox`). The card stands in the floating card's content box (`column-tile-content`), so its bands reach the card's edges.
- **The rows and their cells** (owner, 2026-11-18 12:41: "Fix the fields and their cells properly"): each person's hours fill the answer column to the content edge, the name in the label column, as the card's side-label rows. Customers in one session, Which one?, How many units can it hold at once? and Which supplier? stand under their labels -- their words, or a resource's own name, are longer than the side column holds --, a number cell short, a dropdown as wide as its longest option.
- **Wording:** the labels are unchanged. Field labels on the other pages use both cases ("Customers Buy", "Units in a batch"), so there is no shared rule to follow on this page alone.
- **One owner for the founders' month** (owner, 2026-11-18 16:55, "Do all 8"): the founders' table at the expected sales is this tile's Capacity band alone; Revenue & Pricing's Delivery Check (doc 48, section 8) says only whether the expected sales fit, their busiest month and who delivers outside the founders' hours, with a link here.
