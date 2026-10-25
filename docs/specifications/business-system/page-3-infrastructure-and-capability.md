# Business System — Page 3: Infrastructure & Capability

Status: **specification**, updated 2026-10-17.

> **3. Business System — Page 3 of 5.**
> Was labelled "(Page 2)"; Page 2 is Customers Engagement.

Two top-level sections, each holding the same three subsections:

- **Infrastructure** — 1. Resources, 2. Activities, 3. Partners & Suppliers
- **Offering's Capability** — 1. Resources, 2. Activities, 3. Partners & Suppliers

Every "3. Partners & Suppliers" cross-reference below means the
third subsection of whichever section the reader is in.

**Layout (cards, titles and help).** The two sections are two cards side by
side (stacked under 1100px). The column title ("1. INFRASTRUCTURE",
"2. OFFERING'S CAPABILITY") is the card's one label and its first row, inside
the card: the card has no head row or fold arrow of its own. This page has no
"Hide Help" button: each title has a label arrow after it (a triangle
the title's size, not the 36px fold arrow), pointing right while its help is hidden (the default) and
down while open. Pressing it drops the help text down as a panel over the card,
under the title, without moving anything below it; the arrow, Escape or a click
outside closes it, and only one is open at a time. Nothing is saved about it.
The first row of tiles of both cards starts at the same height (Offering's
Capability's tiles stand under a heading-height space matching Infrastructure's
first section heading). A column title carries its "i" (what the column is) before its arrow. Titles on this page use the type scale only: the page title 36px, a column title
28px, a dialog title and a section heading 24px, a tile, box, subcategory heading and card name 18px
(a tile or box title too long for its room drops to 14px, that title only), labels 18px, notes and summaries 14px.




## Current structure (batches F to I; where it differs from the older text below, THIS section wins)

The sections after this one were written as the page grew, round by round. The statements here describe what the app does now and replace the old wording on: the resource kinds, the statuses, the fixed lists, the partner and supplier cards, the activities and the cost row.

### Resources: nine categories, 47 groups

Both sections hold the same nine categories as tiles. A card belongs to a **category** and a **group**; the group lists are fixed (there is no "Other..." entry). Infrastructure has 21 groups, Offering's Capability 26.

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
| Human Resources | Admin Team | Delivery Team |

(The Founders' own card sits with Human Resources.) In a card the **Group** line comes first, in the order Category, Group, Name; a partner or supplier card has no Category line.

### Statuses

- A resource card: **Exists / Free**, **Rent** (spaces only), **Partners & Suppliers**, **Activity**, **Costs** (spaces say **Buy**). A people card also offers **Needs Investigation**, and a people card with no one assigned reads **Needs Activity**.
- Each status shows its own "+" row (the supplier, the activity, the price) in the same style as its neighbours.
- **Partners & Suppliers** picks from the partners and suppliers already recorded through a cascade **Category → Group → Name**, with a link symbol 🔗 that opens the linked card. A partner or supplier is a card of its own with its own cost.
- **Activity** creates an activity (idempotent by `sourceId`) and says where it went.

### Partners and suppliers

Partners and suppliers are two kinds of card, each with fixed groups per section (`BUSINESS_PARTNER_GROUPS`) and no free "Other". Each carries a Name, a Group, a cost with the same cost row as a resource (below), the offerings it serves (Offering's Capability), notes and a Responsible person.

### Activities

- Groups: Infrastructure has **Pre-Operational** (with a Type, Capex or Start-up) and **Operational**; Offering's Capability has **Production**, **Marketing**, and **Sales & Customer**.
- Every activity has a **Start date** and an **End date** (its period); Pre-Operational also a Type. An activity cannot start after the resources it needs start (flagged "starting too late"), and the units it can produce are capped by its period.
- **Resources** rows (a dropdown per row with the link symbol, not a tick list) list what the activity uses; **Performers** are the people who carry it out.
- Completion moves a row to **Completed**.

### The cost row

- **Frequencies** (7): One-time, Monthly, Quarterly, Annually, Per unit, Per project, % of Rev. **Units** by group (hour, metre, litre, kWh are decimal; items are whole). **Qty** follows the group's rule.
- **Cost options** and **billing types** for the groups that have them (for example a licence billed as a one-off, a subscription or a percentage); a Percentage billing line has a **rate override** whose placeholder is the Global Settings default.
- **Payment plan** (on a Per project price): Deposit & Balance, Instalments or Milestones, with percents that must total 100% and dates; incomplete plans are flagged and the whole price is then paid on the Start date.
- **Extras** (for example delivery, installation, warranty) and **dated notes**, each with a hint per group.
- **Assets**: a **Useful life** (years) and **Warranty**; the useful life is checked against the capitalisation limit of the Global Settings (the limit is tested on ONE unit with its bundled services, so a Technical Support service is bundled with the asset it supports). An **Amortisation period** for a franchise fee.
- **Offering shares**: a card linked to several offerings divides its cost by shares that must total 100%.
- **Insurances**: a policy for an asset or a person generates a linked card (`insuranceId` / `insuresId`) so the insurance is counted once.

### Completeness

A card is complete when the fields its status needs are filled (Cost option, Amortisation period, Start date and Type for activities, price and frequency for Costs, and so on). The tile shows incomplete cards; nothing blocks saving.

### What reads this page

- **Page 4** reads every card with a price, grouped by cost nature, with the **Opening Date** (set on the Identity System's Organization tile) and the **Global Settings** (`/settings`: capitalisation limit, useful lives by asset group, fee tables, contingency rates, insurance per employee, income tax) that Page 3 never asks for again.
- **Page 2** channel expenses create cards here (blank ones stay in the Channel tile; template ones sit in their own teal group tile).

### Infrastructure - i

**Layout (section tiles).** Each of the three numbered sections below shows
tiles, not its content: true squares of one size, 12px apart. Every set of tiles, boxes and card
boxes takes the **one shape**: one to three in a single row, exactly four as a 2 x 2 square, five or
more in two rows (the last row possibly shorter). 1. Resources: six tiles, three across in two rows
(Founders, Workspace, Utilities, Workstation, Equipment, Digital Infrastructure), with no
Organizational / Operational Resources headings. 2. Activities: four tiles as a 2 x 2 square
(Operational, Production, Marketing, Sales & Customer) and, on the second row right beside Sales &
Customer, the grey **Completed** tile (see below). 3. Partners & Suppliers: two tiles in a row
(Partners, Providers). The three sections keep their heading
(number, title, "i") as a plain heading above their tiles, with no fold arrow
and no fold behaviour.

**A tile.** Its title stands so that its last line is centred on the line one third down the square
(a long title grows upward; one that does not fit above that line drops to 14px, that title only), underlined
by a hairline of its own. Under it a short list of what the section includes, in small muted text with the
app's bullet, one line each cut by an ellipsis, every item of the list (a list the tile cannot hold scrolls; there is no "+N more" line): the founders with the
names alone, the Workspace's type ("Not set" until chosen), the subcategories
of Utilities, Workstation, Equipment and Digital Infrastructure (an added one too), the activities of an
Activities tile, the partners and providers, the cards' names in Offering's Capability and the Offerings in
Delivery. The list block is centred under the title, inside the square, and starts 12px under the title's underline. A long subcategory name may take two lines ("Cooling & Air" / "Conditioning", "Online Presence" / "& Communication"); no other item does. Multi-word titles of the app's own are in Title Case
(Channel Resources, Digital Infrastructure, Add Other, Unnamed Activity; "&" and "/" stay as they are). The tile's accessible name is its title and the list
("Utilities, Electricity, Internet"). A tile whose section holds no cards yet and has the "+" box shows no list and no glyph, only the box ("No items yet"); a box without that "+" box (a subcategory box in a dialog) shows a small "+" under its title instead of the list.

**The lists on the tiles are selectable.** Each item of a list is a button, underlined under the pointer and the focus. Pressing a
founder's name, an activity, a resource, a partner or a provider opens THAT card alone, as a **floating card** (492px wide, `--open-card-width`; a founder's 297px) over the dimmed page, with a drop shadow, centred over the page's column with its top on the top of the first row of tiles; Back, Escape or a click outside closes it. Pressing
the Workspace item (or the Workspace tile itself) opens only the Workspace form, floating, centred over the Resources tiles. Pressing a
subcategory (Electricity, Internet ...) opens its card alone when it holds exactly one, the section's dialog on that subcategory when it holds several, and -- empty -- the dialog on it with a new blank card waiting. "+N more", and the tile outside its list, open the
section's dialog as before. Delivery's list is plain text.

**A tile grows when you point at it.** Under the pointer (not with the keyboard focus: that has its ring) the tile grows to 110%, without moving the other tiles,
overlapping them and throwing a drop shadow that grows with it. Pressing an item of its list never moves it from under the pointer; closing a card or a dialog (Escape, Back, a click outside) returns to the default page: no tile grown and, after a mouse click, no ring on the item that opened it. It grows inward -- the left column from its left edge, the right from its right, the
middle from its centre, the top row from the top, the bottom row from the bottom -- so it never leaves its card. This does not apply to the boxes in a dialog.

**The + box on a tile.** The tiles that take new cards -- Infrastructure's Operational, Production, Marketing, Sales & Customer (and a category added
earlier), Partners and Suppliers, **Utilities, Workstation, Equipment and Digital Infrastructure**; Offering's Capability's Resources, Activities and Partners & Suppliers (it adds a
partner) -- carry a small "+" box at their lower right (Completed, Founders, the Workspace and Delivery do not). It is a swap of two colours: at rest the colour of the tile with a 2px stroke and the "+" in the darker tone of its hue, exactly centred; under the pointer
filled with the darker tone, no stroke, the "+" in the colour of the tile. Pressing it adds a blank card of that kind at the end of the tile's list, numbered after the existing
ones, and opens it as a floating card (a resource group has none: each of its subcategory boxes carries its own "+", which makes a blank resource in that subcategory), its Name focused; left completely blank it
is removed again.

**The look of the boxes.** The boxes (page tiles, subcategory boxes, card boxes, the Completed box) have no stroke and no border: their edge is a light from the top left and a shade to the
bottom right, inside, with no thin line outside it. The opened cards (founder, resource, Workspace, activity, partner, provider, Delivery), their cells (inputs, pickers, text boxes, name cells, the x) and the Back button take the same edge, the cells a lighter one;
the focus ring stays. A tile's title and its underline stand one line higher than before (a title that then no longer fits drops to the small size), the list under it starting 12px under the underline.
The "i" of a coloured card is the colour of the card with a stroke and its letter in the darker tint of its hue; under the pointer the stroke goes and the two swap. The arrows of a founder's card (Responsibilities, Completed) and the title arrows are the label arrow: under the pointer and the keyboard focus their outline triangle fills; no ground, no ring.

**A card opened from a list or a "+" box** stands centred over the page's column it belongs to (Infrastructure's or Offering's Capability's), its top on the top of the first row of tiles, with the name of its box (Operational, Providers, Workspace ...)
centred above it, outside it, and the box's "i" after the name where the box has one. The page behind is only dimmed (a flat scrim).

**A status and the activity it creates.** A resource whose Status is Needs Activity or Needs Investigation has an activity made for it, its child: the child's name follows the parent's ("Investigate ...",
"Set up ..."), it has no name cell and cannot be deleted (its number and name are plain text, the name a link to the parent), and it is removed if the parent's Status changes or the parent is deleted. The parent has one line under its Status,
"Open Activity “Investigate ...”" (the name is the link), which turns bold when the pointer is on the Status if the child holds details of the user's. A link from either card opens both, the parent above the child. (The Workspace form is not changed by this.)

**Opening a section.** Pressing a tile opens that section, with its heading,
"i" notes and cards exactly as described below, in a **dialog as wide as the
page's card area** (the two cards together), between the underline of the page heading and
the footer (the page behind dimmed and inert), the same for every section, with one translucent,
blurred ground (only the hue differs: Infrastructure rose, Capability terracotta, channel
teal) and the same glass for the cards in it. Back (lower left), Escape, or a click on the
dimmed space outside the dialog closes it and the page is as it was: same scroll position, the
focus on the tile. The dialog's **header** is its title, and the views opened inside it follow on the same line
after a slash, in the same size, regular and muted: "6. Digital Infrastructure / Software / Xero accounting (i)".
What a dialog holds is **centred across it and starts at its top**.

**Cards as boxes.** In every dialog a list of cards (Resources, Activities, Partners and Suppliers, and the
channel tiles) is a grid of closed square boxes, all one side: each shows the card's number and name and, under
it, one small line (its status and cost, who is responsible, ...). Pressing a box opens that card, fully
editable (Back or Escape returns to the boxes first, then closes the dialog). The boxes are as large as they can
be and still all fit the dialog, never larger than the tile that opened it, and when there are many they get
smaller (and scroll under 96px). A list ends with a half-size dashed **Add** box ("Add Resource", "Add
Activity", "Add Partner", "Add Provider"). Activities can be dragged onto each other to reorder them. A section that holds no cards yet opens directly on one new blank
card with its Name focused; if it is left completely empty it is removed again. A section with **several
subcategories** (Utilities, Workstation, Equipment, Digital Infrastructure; Offering's Partnerships &
Providers) opens on boxes, one per subcategory (an empty one shows the "+"), and a box shows that
subcategory's card boxes.

**Completed activities.** Infrastructure's Activities has a grey **Completed** tile after the four categories
(placed right of Sales & Customer on the second row; with a fifth category, after the last tile of the final
row). It holds every activity ticked Completed, whichever category it belongs to, drawn in grey (the grey of
everything completed); ticking Completed on an activity files it there, un-ticking returns it to its category's
active list. Up to eight are card boxes in one grid; more show first boxes named after the categories that hold
finished ones. It has no Add box, and exists only while an activity is completed (un-ticking the last one closes its dialog).
Offering's Capability has the same grey **Completed** tile (after its other tiles, no "+" box), holding its finished activities; the Activities tile and dialog hold the live ones only. A completed activity, in both sections, opens **frozen**: every field is disabled, grey, with no reaction -- but its Completed tick, which can be unticked to unfreeze it and file it back.

**Founders.** Up to four founders show their cards open side by side in one row; five to eight show two
balanced rows of open cards; more than eight show each founder as a closed square box (name
and first role), and pressing a box opens that founder's card in place of the boxes (Back or
Escape returns to the boxes first). A card is 297px wide, what its content needs: four across from 1224px of dialog content,
three from 915px, two from 606px. **A founder's card:** number and name (on one line, the number 8px before the name), the roles as a bulleted
list (no "Roles" label), Salary | Frequency, Working Hrs | Delivery Hrs (four cells of one size, the two columns side by side at the left,
12px apart; the Working Hrs and Delivery Hrs labels are two lines), one muted line with the share of the working hours (for
example "70% of working hours"; nothing while the working hours are blank), and Responsibilities
with only the rate beside it ("0/6"). Every text of the card starts at one left edge; the numbers, the bullets and the
fold arrows hang to the left of it, at one x. The Responsibilities list is collapsed every time the
dialog opens; opened, its "Completed N" row is in line with the Responsibilities heading, and both fold arrows are the label arrow (an outline triangle that fills
under the pointer and the keyboard focus).

**The opened card.** A Resource, Activity, Partner or Provider card is centred, exactly 492px wide at most (`--open-card-width`), and nothing in it is
stretched: a picker is as wide as its longest option, the Quantity 56px (`--qty-w`), the Price 128px, the currency as wide as its
code, Quantity, Price and currency on one row 12px apart; Frequency and Responsible are side-label rows in the
one label column. On an Activity card the Performer and Responsible labels (the Responsible's with its tick) stand
12px before their dropdowns, on one line, the two dropdowns at one x; the Performer's dropdown runs to the right edge of the name cell, and at the x's place stands a "+" box (the page's, at the x's size) that adds a performer, a further performer's row ending in an x; the Completed tick stands at the left with the other ticks. In every card the Responsible's tick, label and dropdown stay on one row, however narrow
the card. On a Resource the Status is a row like the Frequency (label, then the dropdown, both as wide as their longest option and no wider). The number and the x of a card stay
on the first line of its name when the name wraps. The cards of finished activities are grey.

**Workspace (the form card is frozen: it is not to be changed again).** The Workspace opens ALONE as a floating card centred over the Resources tiles, with no dialog around it. The card (the same glass as every card),
holding one tidy form: a label column as wide as the widest label and the control column 12px after it, every
field the same pattern. The three pickers (Workspace, Status, Frequency) are one width, the widest option of
any of them, and the Price (the box and its currency) ends where they do. The Deposit is a row like the others, its tick
and label in the label column, 45px high ticked or not, so it never moves when clicked. The fields and the
Status-dependent fields (Price, Frequency and Deposit only at Costs; the provider or partner for the other
statuses) are unchanged.

**Scrolling.** The page heading and the two cards' title rows stay in place; each card's body
scrolls on its own below its title (Offering's Capability shows all its tiles without a bar unless
the window is too small). A narrow window (cards stacked) scrolls as the other pages do.

- Existed or planned resources, activities, and partnerships \& providers the organisation needs to establish, operate, and deliver.

#### 1. Resources - i

- Physical and digital resources the organisation needs to operate.

A. Founders

1. Name
2. Roles ( Next to the name)
3. Salary ( -> Price per month)(next to the roles)
4. Responsibilities ( under the name) - i (- This list is developed automatically)
+ Add Founder


###### B. Workspace  - i (one of the bellow options 1-5, drop down list) 

- Where the organisation's work is carried out.


1\. Home  

2\. Coworking Space  

3\. Incubator / Accelerator  

4\. Dedicated Workspace  

5\. Other -> Specify/Name  

Status - i (drop down list) (Activities created or assigned from Infrastructure are placed under the appropriate activity category)

- Already Exists / Free — Is already available to the organisation without an additional cost.
- Provided — Is included under an existing package or arrangement. (Action -> A Provider must be defined under 3. Partnerships \& Providers → B. Providers.)
- Needs Investigation — It is not yet known and requires research. ( Action -> An Investigation Activity is created and assigned.)
- Costs - It must be purchased. Record its price and payment frequency.

(Status List)

a. Already Exists / Free  

b. Provided -> Add or Define Provider from the 3. Partnerships \& Providers/B. Providers  

c. Needs Investigation  

d. Costs -> Price / per Month  

When the Workspace Costs, an optional **Deposit** (a tick, then an amount in the card's currency) records money paid up front and returned later, such as a rent deposit. Page 4 gathers it as a one-time Establishment cost, treated as a Deposit (an asset, never a cost).  

###### C. Utilities - i ( all the options exists as subsections, can add slots)

- A utility category can contain multiple entries, as additional equipment, maintenance, installation, or professional services.
- Record the appropriate provider or activity, and any related costs separately.

1.Electricity

2. Internet 

3. Heating \& Gas  

4. Cooling \& Air Conditioning

5. Water

6. Other -> Specify/Name (+ Add Section / Idividual)

###### D. Workstation ( all the options exists as subsections, can add slots) 

1.Furniture - i - e.g. desks, chairs, shelving, cabinets, or storage.

2. Electrical - i - e.g. power strips, sockets, chargers, or lighting.

3.Supporting - i  - e.g. stands, organisers, or ergonomic accessories.

4. Other -> Specify/Name (+ Add Section / Idividual)

###### E. Equipment  ( all the options exists as subsections, can add slots) 

1. Computing - i - e.g. desktops, laptops.

2. Peripherals - i - e.g. monitors, keyboards, mice, printers, or webcams.

3. Specialised - i - e.g. cameras, scanners, drawing tablets, 3D printers.

4. Other -> Specify/Name (+ Add Section / Idividual)

###### F. Digital Infrastructure ( all the options exists as subsections, can add slots) 

1. Software - i - e.g. design, accounting, communication, or management software.

2. Digital Services - i - e.g. store, protect, back up, or manage the organisation's digital information.

3. Online Presence \& Communication - i - e.g. email, social media, and website services.

4. Other -> Specify/Name (+ Add Section / Idividual)

Each slot recorded under C. Utilities, D. Workstation, E. Equipment or F. Digital Infrastructure should have:

1\. Name

2\. Quantity/Amount (next to the name)

3\. Description/Relevant Information (optional, under the name)

4\. Status (Next to the Quantity/ drop down list) - i (Activities created or assigned from Infrastructure are placed under the appropriate activity category)

- Already Exists / Free — Is already available to the organisation without an additional cost.
- Provided — Is included under an existing package or arrangement. (Action -> A Provider must be defined under 3. Partnerships \& Providers → Select A. External Professionals \& Parners or B. Providers.)
- Needs Activity — It can be created, developed or established internally by the founders. (Action -> An Activity is created and assigned.)
- Needs Investigation — It is not yet known and requires research. ( Action -> An Investigation Activity is created and assigned.)
- Costs - It must be purchased. Record its price and payment frequency.

(Status list)

a. Already Exists / Free

b. Provided

c. Needs Activity

d. Needs Investigation

e. Costs

(Costs)
- Price
- Frequency (next to the Price) (drop down list):

i. One-time

ii. Montly

iii. Annually

iv. Other -> Specify/Name

#### 2. Activities - i (Active # - number ( in red coulour))

- Add activities directly or create them from resources marked Activity.
- Activities do not record costs directly. Any resulting cost is recorded under the relevant Resource, Partnership \& Provider.
- Assign one responsible person to each activity.


(Each activity should have a tick box - completed, once it is clicked, it can move to the Completed Part of the Activities.)
(Each Activity can be deleted, or moved up and downby drag and drop)

Each slot should have:

- Name (Action -> Assign under the Founders responsibilities.)
- Description (under the name) (optional)
- Performers (next to the name) (Action -> Assign one of the founders, or Partners \& Providers (Action -> Select A. External Professionals \& Parners or B. Providers.))
- Responsible (next to the Performer) (Action -> Assign one of the Founders)

###### A. Operational - i (Active # - number ( in red coulour))

- Activities required to establish and operate the organisation.

###### B. Production - i (Active # - number ( in red coulour))

- Activities required to design, develop and deliver the offerings.

###### C. Marketing - i (Active # - number ( in red coulour))

- Activities required to promote the organisation and its offerings.

###### D. Sales \& Customer - i (Active # - number ( in red coulour))

- Activities required to acquire customers and manage customer relationships.

E. Others -> Specify/Name (+ Add Section / Idividual) (Active # - number ( in red coulour))

Completed (maximise/minimise) In light blue colour.

#### 3. Partnerships \& Providers - i

- Add Partnerships \& Providers directly or create them from Resources or Activities.

Each slot should have:

1\. Name

2\. Description/Relevant Information (optional, under the name)

3\. Responsible (next to the Name) - i (- Who is responsible for contacting, and coordinating, ensuring the required work or process is completed.)

4\. Costs (Record its price and payment frequency)(Next to the Responsible)

###### A. External Professionals \& Parners - i 

- Add activities that cannot or should not be performed by the founders.

(A default list with 3 inputs, that they can edited, or removed)

1. Accountant
2. Lawyer
3. Insurance Professional

###### B. Providers - i 

- Businesses or services that supply the organisation with resources.

### Offering's Capability - i

**Layout (section tiles).** Four tiles as a 2 x 2 square (Resources, Activities,
Partners & Suppliers, Delivery; with channel tiles five or six as two rows of three, seven or more
in two rows with more across), the same squares, tile anatomy and dialog as
Infrastructure's; each opens its section as described below. Cards a Customer
Channel made (the Resource cards "+ Add expenses" makes on a channel, and any
partner or provider a channel is linked to) are kept apart from the cards the
user wrote: in the category they belong to there is one more tile, "Channel
resources" after Resources, "Channel partners" after Partners & Suppliers,
in a different colour (teal) that its dialog and its cards share. It exists
only while there is such a card, has no "+ Add", and its cards keep their
"For channel: ..." line with the way back to the channel. A card of
Infrastructure that a channel links stays in Infrastructure.

- Record the additional resources, activities, partnerships \& providers required for each offering, and link them to the relative Offering-s.
- Identify opportunities to eliminate, share, obtain for free, or source their best value.
- Use the results to compare offering options and make better decisions.

#### 1. Resources

Each slot should have:

1\. Name

2\. Quantity/Amount (next to the name)

3\. Description/Relevant Information (optional, under the name)

4\. Status (Next to the Quantity/ drop down list) - i (Activities created or assigned from Infrastructure are placed under the appropriate activity category)

5\. Linked to (Next to Status) (Action -> Assign relative Offering)

- Already Exists / Free — Is already available to the organisation without an additional cost.
- Provided — Is included under an existing package or arrangement. (Action -> A Provider must be defined under 3. Partnerships \& Providers → Select A. External Professionals \& Parners or B. Providers.)
- Needs Activity — It can be created, developed or established internally by the founders. (Action -> An Activity is created and assigned.)
- Needs Investigation — It is not yet known and requires research. ( Action -> An Investigation Activity is created and assigned.)
- Costs - It must be purchased. Record its price and payment frequency.

(Status list)

a. Already Exists / Free

b. Provided

c. Needs Activity

d. Needs Investigation

e. Costs

(Costs)

- Price
- Frequency (next to the Price) (drop down list):

i. One-time

ii. Montly

iii. Annually

iv. Other -> Specify/Name

"+ Add expenses" on a Customer Channel of Page 2 creates a blank Resource card in Offering's Capability › Resources, linked to the channel and its actions; the user then chooses its Offerings, Status, Frequency and partner here, and nothing is pre-filled from the channel. The channel keeps only a link to the card and the channel actions the resource serves, so its cost is counted once, from this page.

On a Resource card (at Costs) **Frequency**, and on a Partner / Provider card **Responsible**, are shown as a label with its drop down list beside it on one line, the label centred on the list's centre line, in one shared label column so the two lists start at the same left edge (a Partner / Provider's own Frequency is unchanged, its label above its drop down list, beside the Price). In an organization with exactly one founder, the Responsible field is not shown at all (on an Activity, a Partner / Provider and a Strategy Objective): that founder is the responsible one automatically, wherever it is read, and never written over a choice; with two or more founders, or none, the user chooses (a Strategy Objective's Responsible is the same label-beside-drop-down row). Beside the Responsible label there is a tick box, ticked by default: unticking it removes the field for that card (the drop down is hidden and the chosen founder cleared; the tick and label stay so it can be ticked again), and that card then has no responsible by choice: it is not listed as missing one, and no founder is assumed for it. Offering's Capability › 1. Resources and 2. Activities lay their cards out in independent columns, as many as fit, numbered across (1 2 3, then 4 5 6, card 4 under card 1): each column is its own stack, so opening a card moves only the cards below it in its column. A folded Resource, Activity or Partner / Provider card is always the same size: its name and its one-line summary are each cut with an ellipsis where they do not fit (the full name appears on hover). In 4. Delivery, the hours of each person under "Working Hours per Unit, by person" are shown with no unit after the box; the cards carry no explanatory paragraphs (the notes on sharing work with an external professional and on how founders' and external hours count are behind the "i" of "Working Hours per Unit, by person", and the note on how the budgets use the capacity is behind the "i" of the delivery capacity line); the computed hours read as short labelled lines ("While one runs", "At expected sales").

#### 2. Activities

- Add activities directly or create them from resources marked Activity.
- Activities do not record costs directly. Any resulting cost is recorded under the relevant Resource, Partnership \& Provider.
- Assign one responsible person to each activity.

Each slot should have:

- Name (Action -> Assign under the Founders responsibilities.)
- Description (under the name) (optional)
- Performers (next to the name) (Action -> Assign one of the founders, or Partners \& Providers (Action -> Select A. External Professionals \& Parners or B. Providers.))
- Responsible (next to the Performer) (Action -> Assign one of the Founders)
- Linked to (next to the Responsible) (Action -> Assign relative Offering)

#### 3. Partnerships \& Providers

Each slot should have:

1\. Name

2\. Description/Relevant Information (optional, under the name)

3\. Responsible (next to the Name) - i (- Who is responsible for contacting, and coordinating, ensuring the required work or process is completed.)

4\. Costs (Record its price and payment frequency)(Next to the Responsible)

5\. Linked to (next to the Costs) (Action -> Assign relative Offering)

---

## Opened cards, small controls and tiles (latest round)

  - **Corners.** Unchanged: every box, card and dialog keeps the radius it had (8px boxes and cards, 6px cells); nothing follows the box size.
  - **Recessed text and number cells.** A text or number input / textarea (not a picker, not a tick box) is the raised cell turned over: `--cell-inset-recess` (shade at the top left, light at the bottom right) on the cell edge (`--cell-edge`); a picker keeps `--cell-inset`; the focus ring stays over it; a disabled (frozen) cell is flat. The Workspace form and the Delivery cards take it through the same selector. The x (`.strategy-box-remove`), ticks, the "i", "+" boxes, arrows and other small buttons are NOT touched by the page-3 edges: the x is the app's one (remove-button.css) and no rule of `page-3-edges.css` names it; the probe checks every x at rest has no inset shadow and looks like every other.
  - **Wired / filled arrows.** The founders' fold arrows (11 x 18 closed, 18 x 11 open at an 18px label) and the title arrows are the label arrow (`FoldArrow.tsx`, `label-arrow.css`): an SVG triangle, an outline (2px line inside the shape) at rest, the same triangle filled under the pointer and keyboard focus. Box, margins and place are identical in both states, so nothing moves. No ground or ring on hover.
  - **The dropdown list** is a card of its own under the cell (above it where there is no room): 6px gap, no stroke (the boxes' inset light and shade plus the drop shadow), exactly the cell's width and left edge (inline width / min / max from the cell's box), a long option wrapping inside it with its full text as tooltip. A Status, Responsible or Provider picker `fill="fit"` runs from its label's gap to the right edge of the name cell.
  - **The opened card's columns** (Resource, Activity, Partner, Provider, channel cards; not Delivery, not the Workspace form): a grid of three columns -- the marker (the number, as wide as its digits), the content and the x (32px) -- 8px apart, the head on a subgrid. Everything under the head starts at the name cell's LEFT edge (x 245.9 at the 480px card) and ends at its RIGHT edge (634.3); the x column stays empty but for an Activity's "+" / x beside a performer; the Responsible row (Partner / Provider and Activity) ends at the name cell's edge; the Description box ends there too. A Partner's / Provider's Price (219 with its currency) and Frequency (hugging its longest option, 126px; the placeholder is just "Select") sit side by side while the content column has 358px (at the 480px card it has 388px), under each other below that. A child activity's head: the number at the card's padding edge (12px), 8px to the name, the name's text starting at the name column's left edge, both on one centre line (0.3px apart); the head 12px from the card's top. Probe rules 18c / 18f read all of it, including that no picker shows a cut value; the one exception is a Status picker holding its longest option (282px of text beside a 124px label in a 388px column), which ends in an ellipsis with its whole text in the list.
  - **Subcategory "+".** Each subcategory box of the four resource groups (fixed ones, and a founder's own Other) has a 36px "+" box at its lower right (in the box's own grid cell, 12px in) that makes a blank resource in that subcategory and opens it floating, captioned with the subcategory's name; left blank it is removed again (the subcategory stays). The four group tiles have no "+".
  - **Completed tile** (Infrastructure and Offering's Capability) exists only while at least one activity is completed; un-ticking the last one closes the dialog by itself. No "None yet".
  - **Founders tile** lists the names alone. **Delivery tile** items are links: each opens that Offering's Delivery card floating, captioned "Delivery". A Delivery card's order number stands at the card's padding edge (12px in, left-aligned); a person's "(founder)" / "(external)" is in the tooltip and the input's accessible name, not drawn. Opened floating, a Delivery card keeps its own wide label column (`--side-label-short`).
  - **Channel cards** (a Resource, partner or provider a Customer Channel made, in Offering's Capability) are auto-generated: no name cell and no x -- the number and the name are plain text (the name from the channel's cell, where it is renamed and where the card is removed); their other fields stay editable; the "For channel: ... Go there" line stays. A card of Infrastructure only linked from a channel is the user's own and keeps its name cell and x.
  - **Landing:** a "Reload" button after the theme switch in the header (reloads the app).

## The round after it: cards, the cost row, small controls (latest)

- **One way to present a card.** Resource, Activity, Partner and Provider cards (channel-made and finished ones, the parent / child pair) are only floating cards on their section part of the page, never inside a dialog. A tile or subcategory box that holds exactly one card opens it at once; one that holds none makes one blank card and opens it; one that holds several opens a dialog that is only a grid of boxes, and pressing a card box closes it and opens the card floating. Back, Escape and the backdrop return to the page. Founders, the Workspace and Delivery are unchanged.
- **Names.** Offering's Capability: the tile "Partners & Suppliers" with two boxes, "Partners" and "Providers"; Infrastructure: "3. Partners & Suppliers" with the tiles "Partners" and "Providers". The Status option "External Professionals & Partners" keeps its words.
- **The cost row**: [Qty] [Price] [currency] ... [Frequency] on one line (Qty 56px, 12px gaps, the currency over the Status / Responsible pickers' left edge, the Frequency to the name cell's right edge); under 358px of content the Frequency goes under the row. The Resource's Status label column is 164px.
- **The x** follows the "+" box's swap of two colours in the card's ground and the danger red, app-wide. **The Back button** of a floating card does too, in its card's colour.
- **Small controls and type**: the hover lift is 1.2 times what it was (`--hover-lift`), the focused cell is ringed in clean white in the dark theme, numeric inputs right-align, the section help drop-down is 480px wide, the lists on the tiles scroll (no "+N more"), titles and captions use `--title-ink` / `--floating-caption-ink`, and every text is on the type scale (14, 18, 24, 28, 36).
- **The Workspace Deposit**: its amount box matches the Price box above it, and its currency text starts where the letters of the Price row's currency picker start.
- **Channel-made cards**: no name cell and no x (the name is plain text, renamed and removed from the channel's cell); their other fields stay editable.

## This round's changes

- **Resource cards link to what they made or use.** A resource that created an activity (or an investigation), or that is Provided / Needs External Professional, shows one line per link under its Status ("Open Activity ...", "Open Partner ..."); the name opens that card floating above the resource. Each line is one line, cut with an ellipsis.
- **One Completed tile**, outside both sections, under Offering's Capability's card (Infrastructure's activities by category, then Offering's). It exists while an activity is completed. Offering's card can scroll inside when the tile takes its room.
- **Delivery cards are 360px wide.** A clicked cell's focus stroke is 1px, dark (`--focus-ring-ink`).
- **Tile titles** stand higher in the tile (`--tile-title-top: 0.25`). **Tile lists** show only whole lines (the tile's height decides how many); a list that holds more has a thin scrollbar with no arrows, a thumb about two lines tall, visible on hover only.
- **Section help**: the "i" beside a section title is gone (the drop-down beside the title carries the same text, in its own colours, with the current terms: Partners, Providers).
- **The floor** (button "Floor", bottom right): a panel over the page listing every Resource, Activity, Partner and Provider (and, when switched on, the Workspace and the Founders) as tiles or as a table. Each row shows where it belongs (Infrastructure › Utilities › Electricity), a coloured symbol per connection (activity, investigate, Partner, Provider; click opens the pair) and can be filtered by kind, belongs to, status, payment frequency, cost range and "connected only".
- **The x** that deletes a card is the previous default red (`.card-remove`, `.profile-card-remove`); the x of a cell or field (performer, milestone, volume change, registration number, clear, field remove) keeps `--x-red` (danger text red).
- **Costs on the Financial Foundation are generated**: nothing is typed there (no "Add Cost"); each row names where it was recorded, its amount, what it comes to a year, and how it is counted (changeable). The examples' former typed costs live on Page 3 cards now.

> **Note, 2026-10-21.** The Inventory and Completed tiles now stand in the footer's band of the page, level with the page's Back link and centred under the two cards; they take no room above it, and the footer lets the pointer through to them. The Inventory's window of filter and sort opens outward from its dialog; its table has the columns Name, Type, Section, Category, Group, Cost, Frequency, Cost Nature, Behaviour, Status and Linked (a channel's name follows its card's group; there is no Channel column), a column list, and a text size in three steps. Where the rounds below say that the row stands under Offering's Capability's card, is two thirds of its width, or has 215px tiles, they are older: the layout rulebook, section 12, is right.

## Round 3 changes (links, Inventory, Costs summary)

- **Status "Partners"** replaces "External Professionals & Partners" as the label (stored id `professional` unchanged). Partners no longer starts with Accountant, Lawyer and Insurance Professional (saved answers keep theirs).
- **Provided resource**: the Provider picker lists the providers, then ONE workspace option: the type chosen on the Workspace form (not "Other"; none when none is chosen), then "Other…". It is stored as `workspace:<kind>`; the link line opens the Workspace form beside the resource. The old price sentence is gone: ONE line under the Status, "Open Provider “Name”", a real link, the name cut by an ellipsis (the line is a flex row so the ellipsis cuts the name, not the words before it); the price is in its tooltip.
- **A Partner's or Provider's card** shows one such line per resource (or the Workspace) that uses it, "Open Resource “Name”"; a click opens that card with this one.
- **Inventory**: a tile beside Completed (outside both sections, under Offering's Capability's card, the row two thirds of the card wide so the card above keeps its two rows of tiles). Its dialog (the shared blurred overlay) lists every Resource, Activity, Partner, Provider, the Workspace, the Founders and the Legal Entity's expenses (shown only, they belong to the Identity System) as tiles or a table: name, kind, where it belongs, status, cost and frequency, a coloured dot per link (activity, investigate, Partner, Provider). Filters: kinds, belongs to, status, payment frequency, cost range, connected only. A tile opens its card floating.
- **Hover**: the Completed / Inventory tiles grow from their bottom-left corner. **Tile lists** use the standard thin scrollbar (the app-wide `scrollbar-width: none` was hiding the styled one), drawn on hover only. **Delivery cards** are 360px.
- **Financial Foundation > Costs is a summary**: read-only text rows (cost and source link, amount with its yearly equivalent, frequency, when, Fixed/Variable and Offering for an Offering's cost), group totals and the All costs line. No Add, Change, select, input or remove; how a cost counts (group, behaviour, equipment or deposit) is worked out automatically, so it can no longer be set by hand. Old saved own-costs show as plain rows.

## Inventory overlay (revised)

- The tiles are the page's own (TileFace / TileList, the page's tile size read from a page tile, the same text sizes) in the colour of the section they stand in on the page: Infrastructure, Offering's Capability, a Customer Channel's teal; a legal expense in the Legal Entity's neutral card ground (`--bg-card-tint`), shown only.
- Where a tile belongs is plain lines with no labels and no arrows (Infrastructure, Utilities, Electricity), then the status and the cost (Costs, £38 monthly). Step 2 of Belongs to lists the place's kinds (Resources, Activities, Partners, Providers) then its other groups, both narrowing. Dots for links stand at its lower left.
- ALL filters and the orders are in the funnel (the Strategy boxes' own `BoxActions` funnel, extended with `menuContent`): Include (kinds, with the Workspace, the Founders and the legal expenses), Belongs to as a drill-down (step 1 ONE place: Legal, Infrastructure, Offering, Channel, ticked with the round tick; step 2 that place's groups, several tickable; changing the place clears step 2; every tile is in exactly one place and group), Status, Payment frequency, Cost range, Linked, and Sort (page order, name A-Z / Z-A, cost high/low, status, kind; a bullet marks the order in use). The grid and the table share them.
- On a resource card the link to its Provider / Partner stands directly under that field (the Activity link stays under the Status that made it).
- Belongs to is four steps in the funnel: 1 Place (Legal, Infrastructure, Offering, Channel; one), 2 Kind (Resources, Activities, Partners, Providers; the Workspace and the Founders count as Resources), 3 Category (only while Resources is ticked: Utilities, Workstation, Equipment, Digital Infrastructure, Workspace, Founders), 4 Group (only while a ticked category has groups: the subsections of the ticked categories, e.g. Digital Infrastructure: Software, Digital Services, Online Presence & Communication; none for Workspace and Founders). Unticking Resources clears 3 and 4; unticking a category clears its groups. Legal's Expenses is shown under Legal.
- The Inventory and Completed tiles are the page's own size (215px at 1600 wide): the row under Offering's card has the card's inset (12px) on its left so the tiles take the card's columns; Offering's card keeps at least 320px and scrolls inside for the rest.
- In the Inventory overlay the header (count, legend, Tiles / Table, funnel) stays in place; only the tiles or the table scroll under it. A tile is in a page slot (`section-tile-slot`): the page tile's lift, glow and transition, grown to 110%. The legend's circles are toggles (a ringed one is on): only the tiles with that connection (Activity, Investigate, Partner, Provider). A circle on a tile is a button too: only that tile and what it is connected to, with a chip "Connected to <name> ×" in the header to clear it; neither opens a card.
- The overlay's grid has as many tiles across as fit the whole panel (215px tiles, 12px gaps; six at 1600 wide). A tile grows INWARDS on hover (110%): the left column to the right, the right column to the left, the top row downwards, the bottom row upwards, the middle from the centre, so it never leaves the panel or goes under the header.

## One card tile everywhere

A card (Resource, Activity, Partner, Provider) shown as a tile is ONE component, `CardTile` (one stylesheet, `card-tile.css`), in the Inventory overlay and in every grid of cards in the dialogs (Resources, Activities, Partners, Providers, a category's and a subcategory's, the channel tiles', the Completed activities): 215px, the colour of its section, "number. name" over the lines of where it belongs / status / cost, a circle per link, the page tile's hover at 110% growing inwards. The Workspace and the Founders are resources: their Kind reads "Resource" in the table, the sort and the tiles (Include still toggles each of them).

## Activities and Partners & Suppliers match the Resources (parity)

- **One link line** (`cardLink` in the editor) is the same on every card: "Open <Kind> “Name”", the name a real link, one line, an ellipsis, a click opens the other card with this one. A Resource has it to its Activity and to its Provider / Partner (under that field); a Provider / Partner card to every Resource and the Workspace that uses it; (An Activity made by a resource keeps its name as the link to that resource.) Any card can now be the one on top of a pair.
- **Tiles**: the same card tile (name with its number, where it belongs, status, cost and payment, circles) for Resources, Activities, Partners and Suppliers; an activity's circles are the Partners / Providers who perform it and the resource that made it, a partner's the resources and activities that use it.
- **Costs in Inventory read as the Costs section counts them**: the quantity times the price, a founder's monthly pay, the Workspace's deposit. The totals reconcile exactly (Lumen & Loom: 16,065 one-time, 7,173 a month, 3,970 a year; Quillfield: 4,560, 5,327, 1,595).

## Partners & Suppliers: one card with a Category (stage A)

- A Partner / Provider card has a **Category** under its name (label and drop-down on one row): **Partners**, **Providers**, the categories the user made, and **Other…**, which makes a new category (named in the box that appears) and offers it to every other card. The categories are the organization's (`partnerCategories`, shared by Infrastructure's and Offering's cards; an unnamed one nobody uses is dropped again).
- **Stored**: `BusinessPartnerValue.category` (an id: `partners`, `providers`, or a made one) and `BusinessCapabilityValue.partnerCategories`. The two stored lists (`professionals`, `providers`) stay as they are. **Migration**: a saved card without a category is read as the list it is in (professionals: Partners, providers: Providers), so nothing is lost; both examples now carry the field (Lumen & Loom: DPD Local and Royal Mail in a "Couriers" category; Quillfield: the Accountant and the Lawyer in "Professional services").
- **What follows the category**: a card is a Provider (in links, Inventory Kind, its place) only in the Providers category and a Partner in every other; the Financial Foundation's expense natures and cost-source labels follow the category too (Providers: outsourced services; the rest by the list it is stored in). Exports still follow the stored lists. Inventory shows the category as the card's Group.

## Activities: a Category on every activity (stage B)

- An activity card has a **Category** under its name (label and drop-down on one row, the same cell as a Partner / Provider's): Operational, Production, Marketing, Sales & Customer, the categories the user made, and **Other…** (a new category, named in the box that appears and offered afterwards to every activity). Offering's Capability's activities have it too; the list is the organization's (`activityCategories`), shared by both sections.
- **Stored**: `BusinessActivityValue.category`. An Infrastructure activity's category is the list it is filed in (changing it files the activity in the other category's list, and its card stays open); an Offering activity carries the field. **Migration**: an Infrastructure activity reads its category from its list; a named category an old answer kept only as the list of its activities becomes an entry of `activityCategories`; an Offering activity saved without one is **Production** (Operational when a resource of Infrastructure made it); one made by a resource's status is filed by the section of the resource, from the one constant `DERIVED_ACTIVITY_CATEGORY` (Infrastructure: Operational, Offering: Production), so the default is changed in one place. Both examples carry the field.
- Inventory shows the category as the activity's Group (Infrastructure and Offering alike).

## Stage C: resource status, categories and groups

- **One status, "Partners & Suppliers"**, replaces "Provided" and "Partners" on a resource card (stored `partners-providers`; a saved answer with either is read as it; the Workspace form keeps its own "Provided"). Its picker lists every partner and provider of the section (and the Workspace type chosen on the Workspace form), "Other…" makes a new card in the Partners category; **below it, in one row, the Category of the chosen card** (the same cell as on the Partner / Provider card, one component). At **Needs Activity / Needs Investigation**, below the link to the activity it made, the **Category of that activity** (the same cell as on the Activity card; default from `DERIVED_ACTIVITY_CATEGORY`).
- **An Infrastructure resource has a Category and a Group** under its name: the Category is the group it is filed in (Utilities, Workstation, Equipment, Digital Infrastructure), the Group its subsection (Electricity ... or one the user made with "Other…", named in the box that appears). Changing the Category files the card in that category's first group; the card stays open. A new *Category* ("Other…" at that level) and the Workspace category come with stages D and E (they need the new tiles). Offering's Capability resources have no category yet.

## Incomplete cards (C2)

A card needs an answer in every field that is not behind an optional tick box. One that lacks one is **stored as it is, flagged, and counted nowhere** until it is fixed. Required (CardCompleteness.ts):
- **Resource**: Name; Status; at Partners & Suppliers the partner or provider; at Costs the Price and the Payment Frequency (the named frequency at Other). Qty and Description are optional.
- **Activity**: Name; at least one Performer; the Responsible, unless the tick is off, the rule names him (a one-founder organization; one founder among the Performers) or there is no founder.
- **Partner / Provider**: Name; Price and Payment Frequency; the Responsible as for an Activity.
- **Workspace**: the kind (the name at Other); the Status; at Provided the Provider; at Costs the Price and the Frequency. (A wholly untouched Workspace is not an error.)
- **Founder**: Salary, Working Hours, Delivery Hours (or the percent). (A founder with none of the four filled is not an error.)
- The Offering link ("Linked to") is not required: it needs the Foundation's Offerings.

**Left out of** (through `countedCapability`, read at `capabilityOf` -- every export and document --, the Financial Foundation's Costs and everything built on them: funding need, forecast, break-even, Sustainability --, the capacity, and the page tiles' counts): a Resource, Activity, Partner or Provider that is incomplete; the Workspace's status, price and deposit; a founder's pay and hours. **Shown**: the card is in Inventory (red, "n incomplete", never counted), and each incomplete card is an item of the **Review** page ("<name>: price missing; it is not counted yet."), with the same anchor as every other item. **Indicators**: the card tile (every grid, the overlay) has a red glow that flashes around it, with what is missing in its tooltip and as the tile's description; in a page tile's list the line of an incomplete card is red, flashing and FIRST (a subcategory line holds it too); steady red where motion is reduced; the glow and the red line clear the moment the card is complete. A card left completely blank is still removed, as before.

## Links added with C (card to card)

- A Partner / Provider card used by a Customer Channel has **Open Channel “…”** (the channel on its page, one line); every card a channel holds -- resources too -- has it (it replaces "For channel: … Go there"). Page 2 already links the other way (the channel's resources open their card).
- (An Activity card has no link under its Performer or Responsible, and a Founder or Partner / Provider card none back to the activities they perform -- removed on request; the circles on the tiles remain.)

## Section tiles and views (this round)

- **Four tiles per section.** Infrastructure: Founders, Resources, Activities, Partners & Suppliers. Offering's Capability: Resources, Activities, Partners & Suppliers, Delivery. Completed and Inventory stay under Offering's card, full page width.
- **A section tile opens a view** (`SectionView.tsx`): the cards' tiles grouped by category. A category with `CATEGORY_TILE_MIN_CARDS` (2) cards or more is a category tile with its own + Add; a smaller one shows its cards as tiles. The section's own Add ends the grid; Resources also ends with Add Workspace. Resources group by Category, then Group (a category with several groups opens a grid of group tiles; an empty group tile is drawn at 50%).
- Cards a Customer Channel made stand inside the Resources / Partners & Suppliers views (their title is the link to the channel; no separate channel tiles).
- **Order, never alphabetical**: Resources: Workspace first, then Utilities, Workstation, Equipment, Digital Infrastructure, the user's own; Activities: Operational, Production, Marketing, Sales & Customer, the user's own; Partners & Suppliers: Partners, Providers, the user's own. The same order in the Category dropdowns and the Inventory filter.
- Category and group titles are in capitals (tile, dialog header, Inventory filter lists). Every list line on every tile is a link that underlines on hover and opens its card.
- A section dialog covers its section card's area (same left and right edges, top and height); Inventory and Completed cover the page content area. The grid places as many 215px tiles across as fit.
- A group made with "Add Other" and left without a name or a card is taken away again.
- The Add boxes are tiles of the same size as every other tile.
- The Open Partner/Provider/Founder/Activity link lines between Activity, Founder and Partner cards are removed; resource <-> activity, resource <-> provider and channel links stay.

## Several Workspaces (stage D)

- Workspace is a category of the Resources; any number of Workspace cards, each the unchanged Workspace form. `capability.workspaces` (each with an `id`) replaces the single `capability.workspace`; a saved answer with the old single `workspace` is read as the first card (id `workspace`, nothing lost). The first card keeps its cost ids (`workspace`, `workspace-deposit`); the others use `<id>` and `<id>-deposit`.
- A resource whose Category is set to Workspace becomes a Workspace card (same id, cost, provider, the status the form knows; its name becomes the "Other" workspace's name).
- Costs, forecast, deposits, completeness (`incompleteCards`/`countedCapability`), exports, documents and Inventory read every Workspace card; totals with one Workspace are unchanged.

## Navigation: a stack of views (latest; replaces "Back, Escape and a click outside all return to the page")

- A card opened from a group, category or section view (or from Inventory) floats OVER that view, which stays open under it. **Back** and a **click on the empty space** return to the PREVIOUS view (the view the card was opened from; the parent card under a stacked pair). A dialog's own **Back** and a click on its empty space go one level up: group view -> category view -> section view -> the page.
- **Escape** closes every layer at once: back to the main page (3. Infrastructure & Capability), never to another page.
- A card with a Responsibilities list on a Founder card: each line is a link (a tile list item's reaction) that opens the founder card above the activity's.
- Popups ("i" notes, dropdowns) are drawn outside the boxes around them, so a card or dialog edge never cuts them.
- The four tiles of a page card (2 x 2) are scaled up to fill the card (never taller than the window leaves under the title), the block centred; Inventory / Completed keep their size and stand from the cards' top to 12px above the footer.
- A resource at Partners & Suppliers: Status, Category (of the chosen partner/provider), Name, then the link to its card.
- Reload: the example copies are found by id or, for an imported copy, by name.

## Channel cards (rules the examples follow)

- A channel card exists ONLY because a channel on Page 2 holds a Channel Resource (`engagement.channelResources`); the Offering area shows it automatically (CHANNEL category tile, the channel teal). There is no button on page 3 that makes one (the Channel tile has no Add; the Add Card makes the user's own card).
- A Channel Resource at Partners & Suppliers is linked to a Partner / Provider card, one at Needs Activity / Investigation to an activity: those generated cards are in the channel's teal too (tile and floating card); the Partner / Provider keeps its Category.
- Examples: Lumen & Loom's couriers come from its Physical Delivery / Postal Service channels (cards "Parcel delivery to customers" and "Tracked postage for small orders", Providers DPD Local and Royal Mail); the Accountant is one card (150 a month), not also a Legal Entity expense.

## Cards without a Back button; titles; the funnel (latest; replaces the Back button of a floating card)

- A floating card has **no Back button**. The tiles area behind it stays usable (the scrim only tints): a press on another tile closes the card and opens that tile in its place; a press on empty space closes only the card (back to the view it was opened from); the area's own Back goes one level up; scrolling works; **Esc** closes every layer to page 3.
- **Every tile title is one line, one size (18px, the body step), at one place; one too long ends with an ellipsis and the full title is its tooltip.** Never wrapped, never a smaller size. A Channel tile exists only while a channel has made cards.
- **Missing information** (a card lacking a required answer): the red flashing glow and the red first line show on EVERY tile that holds such a card, up the hierarchy: the card tile, its group tile, its category tile, the page tile (Resources / Activities / Partners & Suppliers / Founders), Inventory (and its "n incomplete" count) and Completed.
- **The circles** (one per link, the colour of what is at the other end): purple = an Activity, orange = an Investigation (an activity made by a card at Needs Investigation, from either end), green = a Partner, blue = a Provider, grey = a Resource (what an activity follows, what a Partner or Provider supplies, a Workspace it provides). The legend shows all five. A Workspace links its generated activity and its Provider.
- **Inventory funnel**: Include = Founders, Resources (the Workspace is with them), Activities, Partners & Suppliers, Legal expenses. Belongs to = Legal / Infrastructure / Offering; the **Type** list of Infrastructure is Founders, Resources, Activities, Partners & Suppliers; of Offering, Resources, Activities, Partners & Suppliers and **Channel** (every card in the channel's colour -- made by a channel, or generated by one: its activity, its Provider -- is of type Channel and of place Offering, in no other type, so the counts add up). The Category list appears once a Type is ticked. Status and Frequency are the app's dropdown, as long as their longest option. Labels are in capitals and wrap. The menu is a fixed 250px wide (never wider than the window less 24px), so that "Digital Infrastructure" and "Online Presence & Communication" wrap onto two lines while "Partners & Suppliers" stays on one (at 260px the first stops wrapping); its height is capped to the window and it scrolls inside; the Cost from / to cells are 6.5em (91px) each, side by side. The tick "Linked" keeps only the tiles that have a link. The **Costs** option ISOLATES the expenses: switched on, only the tiles that have an expense (a price, or a Workspace deposit) are shown, and under it the cost order (buttons "High to low" / "Low to high"; in the Sort list "Cost, high to low" / "Cost, low to high") and the cost range (from / to) apply to them -- a filter, no totals. The menu opens beside the dialog where the window has room, else under the funnel. A card opened from Inventory carries its own section's name above it.

- **Activities**: the number of ACTIVE (not completed) activities stands next to the dialog title (the overall number only; none on the category tiles); there is no separate "Active n" line.
- **A floating card does not dim the tiles area** (a faint tint, no blur): the card stands out by its shadow, its box name on a small dark pill.

## The Workspace is a Category of the Resource card (reopened by the user; replaces "the Workspace form is frozen" and "several Workspaces")

- There is **ONE kind of resource card**. **Workspace is a Category** of it, the first of the Categories (Workspace, Utilities, Workstation, Equipment, Digital Infrastructure). It has no card, form, dialog, tile type or floating variant of its own.
- A Resource card whose Category is Workspace shows, in the card's normal flow (the Category cell, then these), the Workspace form's fields with the labels and behaviour they had: the **Workspace** (type: Home, Coworking Space, Incubator / Accelerator, Dedicated Workspace, Other, and the name of an Other one), the **Status** (Already Exists / Free, Provided, Needs Investigation, Costs), its price and frequency at Costs, the Provider at Provided, and the optional **Deposit** (the amount box is the Price box, the currency text stands where the currency picker stands). The card keeps its Name (required), its × (any Workspace card can be deleted, the first one too) and its Description. The Group cell is not shown (the Workspace has one group).
- Choosing the Category Workspace (or leaving it) changes the SAME card: it keeps its id, cost, provider, links and the activities that follow it. Partners & Suppliers is the Workspace's Provided, and back.
- **Data**: a Workspace card is a resource slot in `resources.workspace` (fields `workspaceKind`, `workspaceKindOther`, `deposit`); the engine reads them through `workspacesOf`. An answer saved before is read into cards of that Category: ids kept (the first stays `workspace`: its cost lines `workspace` and `workspace-deposit`), the Name filled from the type ("Dedicated Workspace", or the Other name), an untouched Workspace makes no card. Totals, forecasts, exports and the goldens are unchanged. Both examples are saved in this shape.
- **A NEW Resource card has no Category and no Group**: the Category and Group cells read "Select"; until both are chosen the card is incomplete (red effect, "Missing: Category" / "Group", counted nowhere). It stands in the Resources view under the tile **No category** (or, with a Category but no Group, the group tile **No group**). Existing cards keep their values. Every empty dropdown of a page-3 card reads just "Select".

## New Activity and Partner / Provider cards start at "Select"; marks on the lines of a tile's list; the long title's slide (latest)

- **Category of a NEW card.** An Activity or a Partner / Provider made by the section's Add (the "+" of the page tile, or "Add Card" in the section's view) is filed under no category (`UNASSIGNED_CATEGORY` = "unassigned"): its Category cell reads "Select" and the card is incomplete ("Category" is the first thing it lacks: the red flashing glow and the tooltip, like a Resource with no Category) until one is chosen. Its cards are listed in a "No category" tile/line, which exists only while such cards do. The "+" of a CATEGORY tile (Operational, Providers ...) preselects that category. Existing cards keep their categories (no migration; the reader leaves a stored "unassigned" as it is, also for an Offering activity).
- **Empty lines.** In the lists of the page section tiles (Resources, Activities, Partners & Suppliers: their categories) a category with no card is drawn at `--list-empty-opacity` (.7, the lowest that keeps 3:1 against the tile ground in every theme: dark 4.41, light 3.21, sepia 3.05), text and bullet; a line with a card is unchanged. (Category and group tiles of the dialogs list cards, not groups, so they have no such line.)
- **Channel marks (Offering's Capability).** In the Resources tile list the Channel line is plain: its text and bullet are in the channel teal (CHANNEL_TILE_HUE 172, `--channel-marker`). In the Activities and Partners & Suppliers lists a line with cards made by a Customer Channel carries two bullets stacked in the bullet column, the line's own on top and the channel's teal one under it (the same size, a 2px gap, the pair centred on the line, same x as every bullet), so the text stays in the column of the other lines. Infrastructure's lists carry neither mark.
- **A long title** (cut by an ellipsis) slides left under the pointer, over its tile, to show its whole name (exactly the cut part, measured as scroll width less visible width: the last letter ends at the title area's right edge, the ellipsis off while it is there and back when the title is home; about 100px a second, at least a third of a second, at most a second and a half) and slides back when the pointer leaves. Every tile title does it (page, category, group, card, Inventory, Completed, founders): the title's box, size, place and rule are unchanged (it is a scroll of the box); with `prefers-reduced-motion` nothing moves and the tooltip stays. List lines do not slide.

## The funnel's rhythm and fold arrows; the lists' height (latest)

- **One rhythm in the funnel** (two rulebook tokens only): `--space-field` (12px) is the menu's padding, the gap between its blocks (Include, Belongs to, Status / Frequency, Costs, Sort), above and below a block's label, between a block's sub-lists and between the fields of the Status / Frequency / Costs blocks; `--space-label` (6px) is the gap between rows of ticks, from a select's or input's label to its control, between the two cost-order buttons and between the two Cost cells. The cost-order buttons ("High to low", "Low to high") are two small buttons side by side on one row; Linked and Costs are ticks at the other ticks' spacing.
- **Fold arrows.** Include, Belongs to and Sort each carry the overview menu's title arrow (`title-arrow.css`: small, right of the label; a button with `aria-expanded`, "Fold <block>" / "Unfold <block>"). All three are open at first; a click folds that block (Sort folds its orders) and the state is kept while the overview stays open. The menu's height stays capped to the window and scrolls inside.
- **A tile's list shows every whole line that fits** (up to the room under the title). Cause of the 1.17px overflow at 1366: the list measured where each line ends from the top of the tile's layer instead of from the top of the list, so the room looked used up by the title's height, a line was left out and the last shown line could stand 1.2px past the list's end. The measure is now from the list's top; the 4px under the last line (descenders) stays.

## Funnel order, cost arrows, the table, teal lines (latest)

- **Funnel.** Blocks in this order: Include, Sort, Belongs to, then Status, Frequency, Linked and Costs. Include, Sort and Belongs to are FOLDED at first; each fold arrow stands right after its label. The cost order is two small arrow buttons beside the Costs tick (up = "Low to high", down = "High to low"; aria-labels and tooltips say so; the pressed one is the order in use, pressing it again returns to page order); the range cells are labelled "From" and "To". The tick boxes stand on their label's centre line (no margin of their own). The orders of the Sort block are the app's orders without the two cost ones.
- **Empty lines** use one token, `--list-empty-opacity` = .7: the lowest opacity with 3:1 against the tile ground in every theme (dark 4.41, light 3.21, sepia 3.05).
- **Table.** Columns: Name, Type, Section (Infrastructure / Offering / Legal Entity), Category (what the group was: Utilities, Workstation, Equipment, Digital Infrastructure, Workspace, Operational, Partners ...), Group (the former subgroup), Cost, Frequency, Status, Linked. A Legal Entity expense has only Section "Legal Entity", Type "Expense", its name, cost and frequency. A card with a second cost (a Workspace's deposit) has two lines, one per cost; the second reads "<amount> Deposit", One-time, repeats the card's name and fields and is dimmed (the name is repeated so each line stands alone). Linked shows the coloured bullets only, the text of each link as its tooltip; a bullet isolates as on the tiles. The table follows the filters and the sort, and fits the panel at 1600 and 1366 without sideways scroll.
- **Channel-made cards' lines.** In every list of cards (category tiles, group tiles) the line of a card with the channel tone (channel-held cards, their connected Partner / Provider, generated activities) is in the channel teal, text and bullet; the tile keeps its colour, other lines the normal one; an incomplete card's red and an empty category's fade win.

## The Channel group; dropdown lists (latest)

- **Group "Channel".** A card of the Customer Channel (the channel tone: channel-held resources, their connected Partner / Provider, generated activities) has the Group "Channel": in the Inventory table's Group column and as the last line of its tile (after its category; Section, Type and Category keep their values, e.g. Offering / Provider / Providers / Channel). In the funnel, "Channel" is a Group under the categories that hold such cards (shown once that category is ticked), and ticking it narrows to them. The Offering Type "Channel" filter and its counts are unchanged.
- **Dropdown lists on page 3** (every OptionPicker inside a card, a dialog or the funnel) float free of the boxes around them (position fixed, placed in window coordinates under the cell, over it where there is no room below, else capped to the larger room and scrolling), so the funnel's own scroll cannot cut a list. Checked: Status and Frequency in the funnel at 1366x650 and 1600x1000.

## The table mode, and the header over the layers (latest)

- **Table mode** is an opaque, calm reading surface (Tiles mode keeps its see-through look): per theme a ground, a soft ink (never pure white or black; dark 10.8:1, light 12.1:1, sepia 10.0:1), subtle row lines, a zebra tint and a hover tint; links and bullets keep their colours. Text sizes are three steps of the type scale (14, 18, 24px) with the row padding that goes with each, chosen by "A−" / "A+" next to Tiles / Table (kept while the overlay is open); the default is 14px below 1600 wide (18px at 1366 needs sideways scroll: 1298px against 1221px) and 18px from 1600. The heading row is sticky at the top of the scrolling table. A COLUMNS block in the funnel (folded at first, like the others) ticks the columns Type ... Linked (Name always shown); turning the Costs isolation on hides Status and Linked (tick them back), turning it off shows them again.
- **The header is never affected by the page's layers.** While a dialog, a floating card or Inventory is open the app header (reading version, Notes, Search, Review, Reload, Focus) stands above their scrims (`body:has(.section-tile-overlay) .app-header { z-index: 1001 }`), is not made inert (the dialog makes inert only what is beside the header), and a press in the header does not close a floating card. Its menus and Notes panel open over the layers; the reading version changes the open layers' colours live; an Escape typed in the header while Notes or a menu is open belongs to them first, the next one closes the layers. The probe checks it (rule 17e2: the header is never inert, never covered).

## Batch J: what changed after the first rewrite

- **Start date on every card** (V2): a card without a Start date is incomplete (Resource, Partner / Supplier, Activity; a founder's Start date is when the pay starts). The Start date places the cost in a month of the cash flow; a recurring cost stops at its End date.
- **Notes**: a card's Description is a plain note. The dated notes (the record date and time, and "Add Date") are in the Notes window opened from the header.
- **Help**: a category's "i" in its dialog says the help texts of its groups (one line each when it has several); the Group of a partner or supplier card carries the "i" of its group.
- **Extras that are a rate or a floor**: Customs duty and Other duties (a percent of the card's price, a line of the goods' own kind), a person's Commission (a percent of revenue, a calculated line), Minimum order (a floor on purchases: a month buys at least that many units, the excess is carried over as stock).
- **Activity rows**: Performer and Resources are lists of dropdown rows with the link symbol; the Resources list has units and shows the estimated cost of each card under it.

## Batch K0: after the user's visual pass

- **Names**: "All Tiles" is **Inventory**; "Partners & Providers" is **Partners & Suppliers**; the link-type legend says Supplier.
- **Inventory table**: two more columns, **Cost Nature** and **Behaviour**, worked out as on the Financial Foundation (a card with no cost has none).
- **Partner / Supplier card and a resource's Partners & Suppliers status**: one **Group** field listing every group of the place; the group picked decides whether the card is a Partner or a Supplier. There is no Category row.
- **Dates**: the End date has a tick (optional); a founder's Start date cell is full width.
- **Activity card**: no Type field; the Resources dropdown is on the label's line; the link symbols stand at the left of their dropdowns, and every selected performer (founders too) has one.
- **Linked Offerings**: with several, a whole-number percent (two digits) at the end of each row.
- **Payment plan**: each payment is a row of amount, percent and date (amount and percent are one figure). Deposit & Balance is two rows; Instalments has a one-digit number that makes that many numbered rows; Milestones are two rows each (stage with "+" / x, then the values).
- **Status "i"**: lists only the statuses the card offers.
