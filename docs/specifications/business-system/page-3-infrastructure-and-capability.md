# Business System — Page 3: Infrastructure & Capability

Status: **specification**, rewritten 2026-10-29 from the code and from document 26. It says what the page asks and shows. Where it points elsewhere, that document owns the detail: the card rows are document 26 (card structure, in `design/current/`), the cost model is document 1, Part D, the measures and the look are the layout rulebook (`ai/layout-rules.md`, sections 8 to 12) and the pattern of tiles and cards is `ai/tile-and-card-pattern.md`. The open requirements for this page are in document 5, section 5.5.4.2.

> **3. Business System — Page 3 of 5.** Page 2 is Customer Engagement; Page 4 reads this page's costs.

The page records the resources, activities, partners and suppliers the organization needs to **establish, operate and deliver**. It has two cards of four tiles each.

| Card | Tiles |
|---|---|
| **1. Infrastructure** — the resources, activities, partners and suppliers the organization needs to establish and operate | Founders, Resources, Activities, Partners & Suppliers |
| **2. Offering's Capability** — what each offering additionally needs, linked to the offering | Resources, Activities, Partners & Suppliers, Delivery |

Offering's Capability exists to record the additional resources, activities, partners and suppliers each offering requires and link them to the Offering; to identify opportunities to eliminate, share, obtain for free or source their best value; and to use the results to compare offering options.

Under the two cards, in the footer's band, stand two help tiles: **Inventory** and **Completed** (section 8).

## 1. The page

- **Two cards** side by side (stacked below 1100px). The column title ("1. INFRASTRUCTURE", "2. OFFERING'S CAPABILITY") is the card's label and its first row; the card has no head row or fold arrow. There is no "Hide Help" button: a label arrow after each title (right while its help is hidden, the default; down while open) drops the help text over the card, under the title; the arrow, Escape or a click outside closes it, one open at a time. A column title carries its "i" before its arrow. The first row of tiles of both cards starts at one height.
- **Four tiles in each card** as a 2 x 2 square. A tile is a square showing its title and a list of what the section holds (the founders' names, the categories that hold cards, the activities, the partners, the Offerings in Delivery). Every line of the list is a link that opens that card alone as a floating card; the tile itself opens the section's dialog. A tile that takes new cards carries a small "+" box at its lower right: it adds a blank card of that section at the end of the list and opens it floating, its Name focused; left completely blank it is removed again. (Founders, Completed and Delivery have none.) A tile with a card that lacks a required answer shows that line red and first (section 9). The look and the measures are the rulebook's (sections 8 and 9).
- **Scrolling**: the page heading and the two cards' title rows stay in place; each card's body scrolls below its title.
- **Footer band**: Inventory and Completed (rulebook, section 12).

## 2. What a tile opens

- A section tile opens a **view** (`SectionView.tsx`) in a dialog covering the section card's area: the section's cards as tiles, **grouped by category**. Every category has its own tile from the start (an empty one drawn at 50%; `CATEGORY_TILE_MIN_CARDS` is 0), with a "+ Add" of its own; the section's own Add ends the grid. A category with several groups opens a grid of group tiles; a group opens its cards as tiles.
- **One way to present a card**: a Resource, Activity, Partner or Supplier card (channel-made and finished ones, and a parent and child pair, too) is only ever a **floating card** over its view, never inside a dialog. A tile or group tile that holds exactly one card opens it at once; one that holds none makes one blank card and opens it (left empty it is removed again); one that holds several opens a dialog that is only a grid of card tiles. The card tile (`CardTile`, `card-tile.css`) is one component everywhere: "number. name" over where it belongs, its status and its cost, and a small circle for each link (Resource, Activity, Partner, Supplier). A list of tiles ends with a dashed **Add** tile of the same size.
- **Order, never alphabetical**: Resources: Workspace first, then Utilities, Workstation, Equipment, Vehicles, Digital Infrastructure, Materials & Inventory, Documents & Rights, Human Resources (the order of the table in section 3); Activities: the place's groups in the order of section 4; Partners & Suppliers: Partners, then Suppliers. The same order in the Category dropdowns and the Inventory filter.
- A **new** Resource, Activity, Partner or Supplier card made by an Add is filed under no category (`UNASSIGNED_CATEGORY`): its Category (and Group) read "Select" and it is incomplete, listed under a "No category" (or "No group") tile that exists only while such cards do. A category tile's "+" preselects that category.
- **Layers and navigation** are the rulebook's (section 10): a card floats over the view it was opened from; Back and a click on empty space return to the previous layer; Escape closes every layer at once, back to this page; a floating card has no Back button.

## 3. Resources

A resource card belongs to a **category** and a **group**; both lists are fixed (there is no "Other..." to add one). Both cards hold the same nine categories. There are 47 groups in all: 31 of resources, 15 of partners and suppliers (section 5) and the Founders & Owners group.

| Category | Infrastructure groups | Offering's Capability groups |
|---|---|---|
| Workspace | Premises | Site Hire, Workshop & Storage |
| Utilities | Premises Utilities | Process Utilities |
| Workstation | Furniture & Fittings | Fixtures & Displays |
| Equipment | Devices & Tools | Production Machinery, Devices & Tools |
| Vehicles | Company Vehicles, Vehicle Running Costs | Delivery Vehicles, Delivery Running Costs |
| Digital Infrastructure | Software & Web, Cloud & Security | Sales & Delivery Tools, Platforms & APIs |
| Materials & Inventory | Business Consumables | Materials & Stock |
| Documents & Rights | Insurances, Licences, Certificates, Tickets & Trip Costs | Insurances, Licences, Royalties, Certificates, Tickets & Trip Costs |
| Human Resources | Admin Team (the Founders have their own tile) | Delivery Team |

- **The Workspace is a category of the one kind of resource card.** It has no form, dialog or card of its own. A card whose Category is Workspace shows, in the card's normal flow, the Workspace fields: the **Workspace type** (Home, Coworking Space, Incubator / Accelerator, Dedicated Workspace, Other, and the name of an Other one), the Status, the price and frequency when it costs, the supplier when rented, and an optional **Deposit** (a tick, then an amount in the card's currency: money paid up front and returned later, such as a rent deposit; Page 4 gathers it as a one-time Establishment cost treated as a Deposit, an asset, never a cost). There can be any number of Workspace cards; changing the Category to or from Workspace changes the same card (it keeps its id, cost, links and the activities that follow it). Stored as a resource slot in `resources.workspace` with `workspaceKind`, `workspaceKindOther` and `deposit`, read through `workspacesOf`; an answer saved with the old single workspace is read into cards of that category.
- **Statuses.** A resource card offers **Exists / Free**, **Partners & Suppliers**, **Activity** and **Costs**; a space or a vehicle says **Rent** (a supplier's service: it opens only the supplier group of the place that holds premises and vehicles, Property, Vehicles & Facilities in Infrastructure and Landlords, Leasing & Warehouses in Offering's Capability) and **Buy** for the same two things where the others say Partners & Suppliers and Costs. "+" adds a further status row, each with its own cells. "Needs Investigation" is not a status any more (an earlier answer's is cleared and said in the card's description).
- **Partners & Suppliers** picks the partner or supplier from those already recorded in this place (group, then name, with the link symbol that opens the linked card), and "Other..." makes a new card there. **Activity** lists the activities that have not ended at the card's Start date, with "Other..." to create one when there is none; the card is used by the activity it names. No activity is made behind the user's back.
- **Start date** is on every card (it places the cost in a month of the cash flow; a recurring cost stops at its End date, which is optional); a founder's is when the pay starts.
- **The cost row**: Qty, Price, currency, Frequency and Unit on one line. The **frequencies** are seven: One-time, Monthly, Quarterly, Annually, Per unit, Per project, % of Rev; a card offers only its group's (the rules are document 17). **Units** by group (hour, metre, litre, kWh are decimal; items are whole). **Cost options** and **billing types** for the groups that have them (for example a licence billed as a one-off, a subscription or a percentage); a Percentage billing line has a **rate override** whose placeholder is the Global Settings default; **Payment plan** on a Per project price (Deposit & Balance, Instalments or Milestones, with percents that total 100% and dates; an incomplete plan is flagged and the whole price is then paid on the Start date); **Extras** (delivery, installation, warranty, and the rate or floor extras: customs duty and other duties as a percent of the price, a person's commission as a percent of revenue, a minimum order as a floor on purchases with the excess carried as stock), each with a hint per group; **dated notes** (their record date and time are in the Notes window opened from the header). A rate is shown as a rate, never as money.
- **Assets**: a **Useful life** (years) and **Warranty**; the useful life is checked against the capitalisation limit of the Global Settings (the limit is tested on ONE unit with its bundled services, so a Technical Support service is bundled with the asset it supports); an **Amortisation period** for a franchise fee.
- **Insurances**: a policy for an asset or a person generates a linked card (`insuranceId` / `insuresId`) so the insurance is counted once.
- **Frequency, cost nature and behaviour of every group** are document 1, Part D; every row of every card is document 26.

## 4. Activities

- **Groups by place**: Infrastructure has **Pre-Operational** (from the Plan Start to the Opening Date, with a Type: Capital Expenditure or Start-up Expenses) and **Operational** (from the Opening Date); Offering's Capability has **Production** and **Marketing** (from the Plan Start) and **Sales & Customer** (from the Opening Date). The group is the card's Category; each tile shows its period. A new activity made by a resource's status is filed by the resource's section (`DERIVED_ACTIVITY_CATEGORY`: Operational in Infrastructure, Production in Offering's Capability).
- Every activity has a **Start date** (required) and an **End date** (optional; left empty it counts as one day), inside its group's period. A resource it uses cannot start after it (flagged "starting too late"), and the units it can produce are capped by its period.
- **Performers** are the people who carry it out: the founders first, then the partners and suppliers of the place, with a link symbol beside a partner or supplier; **Responsible** is a founder. **Resources** is a list of dropdown rows (each with units where the resource has them and the link symbol), not a tick list; the cost of each linked card is shown under the list and the Total after it. An activity records no price of its own: any cost is recorded under the Resource, Partner or Supplier.
- In an organization with exactly one founder the **Responsible** field is not shown on an Activity, a Partner or Supplier or a Strategy Objective: that founder is the responsible one automatically, wherever it is read, and never written over a choice. With two or more founders, or none, the user chooses. Beside the label a tick box, ticked by default: unticking removes the field for that card (the chosen founder cleared), and the card then has no responsible by choice, is not listed as missing one and has no founder assumed.
- A founder's **Responsibilities** list on the Founders tile is derived from the activities that name the founder; each line is a link that opens the activity.
- **Completed**: ticking Completed on an activity freezes it (every field disabled and grey, but the tick, which can be unticked to unfreeze it) and files it under the grey Completed tile; the tile exists only while an activity is completed and holds the finished activities of both cards. The number of **active** (not completed) activities stands next to the dialog title of Activities. An activity can be dragged onto another to reorder.

## 5. Partners & Suppliers

- Two kinds of card in each place, **Partners** and **Suppliers**, each with fixed groups (`BUSINESS_PARTNER_GROUPS`; no free "Other"). Infrastructure: Partners, Alliances & Networks; Suppliers, Goods & Equipment, Business Services, Creative & IT Services, Property, Vehicles & Facilities, Technical Support. Offering's Capability: Partners, Revenue Partners, Accreditation Bodies; Suppliers, Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments. A partner or supplier card has ONE **Group** dropdown listing every group of the place (Partners' first), and the group picked says which of the two the card is; there is no Category row.
- Each carries a Name, a Group, a cost with the same cost row as a resource, a **Responsible** person, notes and, in Offering's Capability, the Offerings it serves. The Financial Foundation's cost natures and cost-source labels follow the group (Suppliers: outsourced services; Partners by the list they are stored in).
- Offering's Capability shows the tile "Partners & Suppliers" with two boxes, Partners and Suppliers; Infrastructure shows the same. A card that a Customer Channel is linked to has the link line to the channel (section 7).

## 6. Founders (Infrastructure)

The Founders tile lists the names alone. A founder is defined once, on the Legal Entity page of the Identity System; this page adds the cost: **Start date** (when the pay starts), **Salary** with its **Frequency** (Weekly, Monthly or Annually), **Working Hrs** and **Delivery Hrs** (delivery cannot exceed working hours; a muted line shows the share of the working hours), an optional **Allowance** and the extras **Commission** and **Bonus**; the **Roles** and the Responsibilities are read, not typed. Up to four founders show their cards open side by side in one row; five to eight show two balanced rows; more than eight show each founder as a closed box (name and first role), and a press opens that card in place of the boxes. The Responsibilities list starts collapsed every time the dialog opens.

## 7. Offering's Capability only

- **Linked to (Offerings)** is required on every Resource, Activity, Partner and Supplier of Offering's Capability. A card linked to several offerings divides its cost by **shares** (a whole-number percent at the end of each row) that must total 100%; a card with none, or with shares that do not total 100%, is incomplete.
- **Delivery**: the tile lists the Offerings; each name opens that Offering's **Delivery card**, floating. The card holds: *Delivered* (per unit or every month); for every month, *Hours Given* (per week or per month) and hours per client; for per unit, hours per unit and *Calendar Time (weeks)*; constraints. The weeks are elapsed time only: they give the "While one runs: hours a week" line and "about N running at once", and are **never multiplied into hours** or turned into dates. Capacity is the founders' delivery hours; the check compares expected sales times each person's hours against it, with recurring work served first. People listed on the card: every founder, and the **partners** linked to that offering; suppliers (including Logistics & Fulfilment) and Delivery Team cards are not listed yet (document 5, I1 and I2). The notes on sharing work with an external professional and on how founders' and external hours count are behind the "i" of "Working Hours per Unit, by person". The question behind the card is document 28, 10.1.
- **Channel-made cards.** A card a Customer Channel made (the Resource cards that "+ Add expenses" and "Typical costs" make on a channel, and the partner or supplier a channel is linked to) is kept apart from the user's own: the Resources view and the Partners & Suppliers view of Offering's Capability each show one more category tile, **Channel**, after the others, in the channel's teal (so are the generated activity and the supplier card, and the Channel line in the Resources tile's list). It exists only while such a card does, has no "+ Add" and no button on this page makes one; such a card's Group is "Channel". Its number and name are plain text (the name is renamed, and the card removed, from the channel's cell); its other fields stay editable; a line "Open Channel “...”" leads back to the channel. A card of Infrastructure that a channel only links is the user's own and keeps its name cell and ×. The card stores the channel's expenses once: nothing is pre-filled from the channel, and the cost is counted once, from this page.

## 8. Inventory and Completed

- **Inventory** lists every Resource, Activity, Partner, Supplier, the Founders and the Legal Entity's expenses (shown only, they belong to the Identity System) as tiles or as a table, each in the colour of its place (Infrastructure, Offering's Capability, a channel's teal). A tile opens its card floating; a circle on a tile shows a link, and pressing it shows only that tile and what it is connected to. The legend filters by the four kinds of link (Resource, Activity, Partner, Supplier). The **funnel** holds Include, Sort, Belongs to (Place, Kind, Category, Group in four steps), Status, Frequency, Linked, Costs (which isolates the cards with an expense, with a cost order and a range) and Columns. The **table** has the columns Name, Type, Section, Category, Group, Cost, Frequency, Cost Nature, Behaviour, Status and Linked, in three text sizes; a second cost (a Workspace's deposit) is its own dimmed line. Costs are read as the Financial Foundation counts them (quantity times price, a founder's monthly pay, the deposit). An incomplete card is shown red and counted nowhere ("n incomplete" in the bar). The look, the measures and the behaviour of the dialog are the rulebook's, section 12.
- **Completed** is the grey tile of the finished activities (section 4).

## 9. Completeness, and what is counted

A card needs an answer in every field that is not behind an optional tick box (`CardCompleteness.ts`). One that lacks one is **stored as it is, flagged, and counted nowhere** until it is fixed. A card left completely blank is removed instead. Required:
- **Resource**: Name; **Start date**; Status; at Partners & Suppliers the partner or supplier, at Rent the supplier, at Activity the activity; at Costs or Buy the Price and the Payment Frequency (and the Cost option, the Amortisation period of a franchise fee and a complete Payment plan where they apply); a new card's Category and Group. In Offering's Capability also **Linked Offerings**. Qty and Description are optional.
- **Activity**: Category; Name; Start date; at least one Performer; the Responsible, unless the tick is off, the rule names him (a one-founder organization; one founder among the Performers) or there is no founder; in Offering's Capability also Linked Offerings.
- **Partner / Supplier**: Category; Name; Start date; Price and Payment Frequency (and the Cost option, Payment plan); the Responsible as for an Activity; in Offering's Capability also Linked Offerings.
- **Founder**: Start date, Salary, Working Hours, Delivery Hours (or the percent). A founder with none of these filled is not an error.

**Left out of** every total (through `countedCapability`, read at `capabilityOf`: every export and document, the Financial Foundation's Costs and everything built on them, the capacity and the page tiles' counts): an incomplete Resource, Activity, Partner or Supplier, and a founder's incomplete pay and hours. **Shown**: the card is in the Inventory (red, never counted) and is an item of the **Review** page ("<name>: price missing; it is not counted yet."). **Indicators**: the card tile has a red glow that flashes (steady where motion is reduced) with what is missing in its tooltip; the same red flashing glow and a red first line show on every tile above it up the hierarchy (group, category, page tile, Inventory with its count, Completed); they clear the moment the card is complete.

## 10. What reads this page

- **Page 4** reads every card with a price, grouped by cost nature, with the **Opening Date** (set on the Identity System's Organization tile) and the **Global Settings** (`/settings`: capitalisation limit, useful lives by asset group, fee tables, contingency rates, insurance per employee, income tax) that this page never asks for again. Its Costs section is a read-only summary: nothing is typed there.
- **Page 2** channel expenses create cards here (section 7).
- **Currency**: every price carries a currency, defaulting to the currency of the registered country (Identity System, Legal Entity) and changeable per price; a price left on the default follows the registration. A cost in another currency is listed and flagged, not counted (Page 4).
- **Page 5** reads the capacity (founders' delivery hours) against the expected sales.

## 11. Where the rest is

| What | Where |
|---|---|
| Every row of every card, by place, category and group | Document 26 (generated into documents 6 and 7) |
| The cost model: groups, cost natures, billing types, extras, taxes, periods, funds | Document 1, Part D |
| Frequencies by group and the open proposals | Document 17 |
| Tiles, dialogs, floating cards, the Inventory: measures and rules | `ai/layout-rules.md`, sections 8 to 12 |
| How tiles, frames, cards, rails and dialogs are built | `ai/tile-and-card-pattern.md` |
| The kinds of card and their code | `ai/card-kinds.md` |
| What is still open for this page | Document 5, section 5.5.4.2 |
