# App tests guide

Status: **reference**, written 2026-11-21, updated 2026-11-21. The app's tests: where they are, how they run (Vitest, the pre-commit hook, CI), and what every test file checks, grouped as screens, business rules, saved data and examples, whole pages, design system and docs, and content files. Counted on main of 2026-11-21; what to run after a change is AI 3.

**Contents**

- [The app's tests: where they are and what they check](#the-apps-tests-where-they-are-and-what-they-check)
- [Every test, in detail](#every-test-in-detail)
- [Screens: every test](#screens-every-test)
- [Business rules: every test](#business-rules-every-test)
- [Saved data and examples: every test](#saved-data-and-examples-every-test)
- [Whole pages: every test](#whole-pages-every-test)
- [Design system and docs: every test](#design-system-and-docs-every-test)
- [Content files: every test](#content-files-every-test)

## The app's tests: where they are and what they check

### Where they are and how they run

The app has 2,321 tests in 206 files (2,319 pass, 2 are skipped on purpose: they rewrite the saved examples and the saved document words, and run only when asked), counted on the Finance link fix, now on main. Most test files sit beside the file they test and carry its name with `.test.ts` or `.test.tsx` added, so `FinancialModel.ts` is tested by `FinancialModel.test.ts` next to it. The house-rule tests and the shared test helpers are in src/test/.

They are written with Vitest and come in two kinds:

- **Logic tests** (the framework, the design library, the docs, the styles) run without a screen, in a few seconds.
- **Screen tests** (everything else: components, pages, services, data, hooks and the house rules) draw the app's parts in a simulated browser page and click and type into them like a person would.

How to run them:

| Command | What it runs | When |
| --- | --- | --- |
| `npm run test:changed` | only the tests that reach the files you changed | while working |
| `npx vitest run` | every test (about 110 seconds) | before a push |
| `npm run verify` | every test, then the code and docs checks | before a push; CI runs the same checks, plus a build, on every push |
| `npx vitest run src/framework/engine/financial` | one folder or one file | when looking at one area |

### How much of the code the tests reach

Measured on 2026-11-22 with `npx vitest run --coverage` (`@vitest/coverage-v8`, installed only for the run): 79.0% of the lines of `src/`, 72.7% of the branches, 77.8% of the functions. The parts the tests reach least are the answers of Systems 05 to 24 (the checklist and card lists, the Process Library), the export (`AnswerExport.ts` 25%, `ExportFlow.tsx` 45%), `CalendarTaskService.ts` (27%), `jumpTo.ts` (28%) and `Landing.tsx` (35%); the review of 2026-11-21 (`docs/archive/proposals/app-review-2026-11-21.md`, T3) says which to test.

### The six groups

More than four tests in five check either the screens (991) or the business rules behind them (905).

| Group | Tests | Files | Where | What it protects |
| --- | --- | --- | --- | --- |
| Screens | 993 | 94 | `src/components/` | every card, tile, field, rail and dialog draws and behaves as specified |
| Business rules | 905 | 70 | `src/framework/engine/` | the questions, choices, money, legal and channel logic gives the right answers |
| Saved data and examples | 130 | 12 | `src/services/`, `src/data/`, `src/hooks/` | saving, loading, old answers and the two example businesses |
| Whole pages | 115 | 10 | `src/pages/` | each page opens, moves and exports as a whole |
| Design system and docs | 117 | 19 | `src/library/`, `src/styles/`, `src/docs/`, `src/test/` | the look stays on the tokens; the docs name only what exists |
| Content files | 63 | 1 | `src/framework/parser/` | the Systems' Markdown links resolve and their three files agree |

### What each group checks

### Screens: 991 tests

These draw a part of the app and use it as a founder would: open a tile, tick a box, add a card, fold a band. Each test checks one rule from the specifications or the layout rules.

- **Page editors** (592, `components/interview/editors/`): the Business pages (Foundation, Customer Engagement, Infrastructure & Capability, Financials), Legal Entity, Strategy and the others. Example: removing an Offering unticks it on every card that ticked it.
- **Tiles and dialogs** (189, `tiles/`): Master Tiles, carousels, floating cards, and a walk that opens every link in both examples and a fresh Organisation.
- **Fields** (57, `fields/`): tables, dropdowns, ratings, notes, date cells.
- **Rails** (38, `rails/`) and **cards** (24, `cards/`): the side dots, the page arrows, card faces and their completeness.
- **The rest of the frame** (91): the Menu, Notes, Calendar, header, shared controls and the Workbook's Financial Documents.

### Business rules: 905 tests

These run the app's logic without drawing anything, so they are fast and exact about numbers and words.

- **Questions and choices** (161, `choices/`): what each Segment, Profile, Offering and Competitor is asked, and the Mission, Vision, Ambassador and Strategy options. Example: a Profile's questions follow its Segment's answers.
- **Money** (132 in `financial/`): amounts, the cash flow, funding, position, contingency, the cost of each Offering, the owner's minimum pay. The forecast, payment and cost files beside the folder are counted under Everything else.
- **Channels** (39) and **legal** (29): channel resources and fees; legal facts, starts, suggestions and the US states.
- **Everything else in `framework/engine/`** (544): the Business Documents and forecast, demand against capacity, journey suggestions, search, statuses, card dates, the palette, labels with "&".

### Saved data and examples: 126 tests

- **Services** (95): saving and loading an Organisation, bringing old answers up to date, and the two example businesses (Quillfield and Lumen & Loom) checked for drift and completeness.
- **Data** (26) and **hooks** (4): the glossary places and the shared hooks.

### Whole pages: 115 tests

Each page opened as a whole: Landing (importing an Organisation file), System selection, the Conversation, Review, Workbook, Global Settings and the export flow. `examplePages.lumen.test.tsx` and `examplePages.quillfield.test.tsx` draw every page of both examples and compare them with a saved snapshot, so an unplanned change to any page shows up.

### Design system and docs: 116 tests

- **Library** (46): the design library's asset contracts, inventory and tables agree with the app.
- **Styles** (46): every look uses the shared tokens.
- **Docs** (17): every file, class and value a rulebook names exists in the code, and this guide lists every test file.
- **House rules** (7, `src/test/`): no em dash in the app's text, no page found by a fixed number, and the layout probe's own rules.

### Content files: 63 tests

`contentRelations.test.ts` reads the Systems' Markdown: every Dynamic Field link reaches a real page and column (the Finance link included), every shared field name is registered, and each System's Answers, Questions and Help files list the same Sections.

### What the tests do not check

A green run proves the logic, not the look: the simulated page has no real layout, so sizes, spacing and overlaps are left to the other checks.

| Check | What it catches | Command |
| --- | --- | --- |
| Layout check | sizes, gaps, alignment and overlaps in a real browser, at 768 to 1920 wide; CI also runs it on pull requests to main and when started by hand | `npm run check:layout` (one page: `-- --pages=<Page>`) |
| Style lints | a colour, corner or gap outside the tokens; a shared control restyled elsewhere; unused CSS | part of `npm run verify` |
| Import boundaries | a shared part reaching into a page or an editor | part of `npm run verify` and the pre-commit hook |
| Docs checks | the generated parts of the rulebook out of date, a doc that breaks the documentation standard, a questions register out of step | `npm run docs:check` |

The pre-commit hook runs four checks before every commit, in about 15 seconds: the types, the import boundaries, the CSS lint and the docs checks. A failure stops the commit.

The full description of each layer is in `docs/ai/03-toolchain-and-verification-playbook.md`.

### Every test, file by file

Every test is listed, in its own words (tests that only repeat for another System, example or reading mode are written once), on the tab Every test, in detail and its six sub-tabs, one per group above.

## Every test, in detail

The tabs under this one list all 202 test files and every test in them, one tab for each of the six groups on the Overview tab (counts and paths are in its table). Each test is written in the words the test itself uses, under the heading its file gives it.

The lists come from the full run of 21 November 2026, on the Finance link fix, now on main. Tests that differ only by System, example or reading mode are written once, with the list of what varies; each of them is still counted.

## Screens: every test

93 files, 991 tests. Each one draws a part of a screen (a card, an editor, a field, a tile, a rail, the Menu or the Notes) in a test browser, then presses, types and reads it as a person would. The largest folders are the editors (one per page of the interview) and the tiles.

### src/components/calendar/ (1 file, 3 tests)

#### CalendarAlone.test.tsx (3)

- **the Calendar opened from the Menu, on the page it is pressed on** (3)
  - draws nothing until it is asked for, then the rail's Calendar alone: no Capabilities or Systems handle
  - closes on Escape, and the key goes no further: the page never takes it as Back (the Notes panel's own Escape, useEscapeCloses)
  - closes on a press outside it

### src/components/capabilities/ (1 file, 1 test)

#### CapabilityList.test.tsx (1)

- **CapabilityList** (1)
  - reserves every label's bold width, so the highlight contains it

### src/components/controls/ (3 files, 18 tests)

#### RatingScale.test.tsx (7)

- **RatingScale** (4)
  - draws five rounds, low to high, in one named radio group with their words
  - chooses a round, moves to another, and clears when the chosen round is pressed again
  - chooses from the keyboard: Space on a focused round
  - cannot be changed while disabled
- **RatingScaleGroup** (3)
  - says the end words once for all rows and gives each row its own group
  - selectable: a ticked row shows its rating, unticking hides and clears it, and the tick works from the keyboard
  - shows what a row carries under it

#### TitleTooltips.test.tsx (9)

- **TitleTooltips** (9)
  - shows a title in the app's tooltip and keeps the name of an icon with no text
  - describes, and does not rename, an element that has words of its own
  - shows nothing for what is not a pressed control, and nothing for a control that only repeats its own words
  - says the name of an icon that has no title
  - gives no second tip to a control that draws its own, and shows one tip at a time (owner, 2026-11-14 12:40)
  - has no tip for a control whose pop-up window is open, and takes the tip away when the window opens
  - has no tip for a dropdown cell, whose value is on it
  - gives a Back button that shows only its arrow (its word hidden in a narrow window) a tooltip
  - says the whole title of a tile whose title is cut short by an ellipsis, and nothing for one that fits

#### Tooltip.test.tsx (2)

- **tipPlace** (2)
  - stands above its control, on its left edge, whatever stands there
  - stands under its control only where there is no room above

### src/components/interview/cards/ (5 files, 24 tests)

#### BusinessCardFields.test.tsx (11)

- **the business card › BusinessCard summary** (2)
  - shows the summary only while folded
  - puts the summary on its own row under the name
- **the business card › BusinessCard name** (2)
  - shows the name as text while folded and as a box once open
  - names an unnamed folded card by its kind
- **the missing scope › a card's fields show what it lacks exactly when its tile flashes** (2)
  - shows what a card lacks, its Name included, once it is not a card just made
  - is quiet while the card is a card just made and still open, and speaks when it is closed
- **an optional field › an optional field opened by its tick box** (5)
  - shows only its tick box and label until ticked, then the field, focused
  - loads ticked when it already has content
  - closes straight away when empty
  - clears its text at once as it is unticked, marked as a removal the page can undo
  - keeps nothing hidden, so the documents have nothing hidden to print

#### CardNameInput.test.tsx (4)

- **CardNameInput** (4)
  - asks the name in a one-line textarea under its label
  - does not add a line on Enter
  - turns a pasted line break into a space
  - grows to fit a name that wraps

#### CardNumber.test.tsx (3)

- **CardNumber** (3)
  - is just the number in a list whose title names its cards
  - says the kind in a list that nests kinds
  - stands the number alone in the list-number column, the kind after it

#### cardOrder.test.ts (4)

- **the one card order: fields, the Description, the tick-box link lists, then the card's state ticks last** (4)
  - puts each Offering's Capability card's Linked to after its Description, last
  - puts an Activity's Completed tick at the very end, after its Description and its links
  - puts a Legal Entity expense's Linked registration before its Description (the card structure's order)
  - keeps a funding source's Linked Funding Need last, under its optional texts

#### cardSummary.test.ts (2)

- **summaryText** (2)
  - joins the non-empty parts with a middle dot
  - is empty when nothing is filled in

### src/components/interview/editors/ (18 files, 237 tests)

#### AssetPreviewImage.test.tsx (2)

- **a brand file's preview, whole** (2)
  - widens an SVG's viewBox to everything it draws, a wordmark past its frame included
  - leaves an SVG that draws inside its frame as it is

#### BrandInventoryEditor.test.tsx (9)

- **BrandInventoryEditor, Icon & Logo** (7)
  - asks for one icon and one logo, each an SVG or a PNG
  - shows a second set's files in the one set while it is empty
  - removes with the ×, keeping an older file saved but not shown
  - refuses a file that is not an SVG or a PNG, or is over 50 KB, with a message
  - stores an uploaded PNG as the mark's one file
  - keeps a description of the logo and icon, a Notes field behind its tick
  - explains SVG, PNG and PDF at the end of the upload bullet
- **BrandInventoryEditor layout** (2)
  - puts each image beside ONE holder of its name and description
  - sets the Icon's description beside the Icon, and shares the rows across the columns

#### BrandStyleEditor.test.tsx (19)

- **BrandStyleEditor as tiles** (4)
  - opens a colour's floating card from the Colours tile without an error
  - is four large tiles: Colours, Typography with the Text Hierarchy, the Icon & Logo and the Brand Images
  - draws every colour as a block on the Colours tile, and each colour's box in its dialog covered with it, carrying its name, role and code
  - keeps the Text Hierarchy as its table under the typefaces, in the Typography tile's dialog
- **BrandStyleEditor limits** (1)
  - refuses a size over 120 px and anything but hex in a HEX box
- **BrandStyleEditor cards** (3)
  - names a colour in its card head and reads it folded, with its role
  - adds the next free role, and removes one keeping what it holds, with an undo
  - moves a card to another role without losing either role's values
- **BrandStyleEditor Text Hierarchy** (6)
  - explains every level in one "i" on the section's first guidance line, none in the box
  - draws each level's name at the size in its box, within its range
  - keeps a size within the range its "i" states when the box is left, quietly
  - steps by 1 with the arrow keys and the wheel (5 with Shift), within the range
  - fixes each level's row at its largest size, so a size typed moves nothing
  - asks each size in a square box, the value centred
- **BrandStyleEditor optional fields and tint** (2)
  - asks a colour's and a typeface's Usage behind a tick
  - tints a folded colour card no further than keeps its text at 4.5:1
- **brandStyleSectionsEmpty** (1)
  - counts a colour only with a whole HEX, and a size only from 8 px
- **BrandStyleEditor colour and typeface cards** (2)
  - sets Role and Colour beside their controls, the contrast inside the Colour's note
  - names a typeface's note Usage, as a colour's

#### BusinessEngagementEditor.test.tsx (26): Customer Engagement

- **BusinessEngagementEditor folding** (6)
  - starts the per-Offering blocks and the page sections open (they are content)
  - has a single Collapse all for Customer Relationship (the items start open)
  - starts Channel Categories open, with a subchannel count
  - folds and opens every Channel Category with Collapse all and Expand all channel categories
  - shows the References on the card, with the fold arrow beside 1. SEGMENT and no Show / Hide button
  - opens a newly added Channel Category
- **BusinessEngagementEditor number limits** (1)
  - refuses a keystroke that would take Buy (%) over 100
- **BusinessEngagementEditor formula references** (1)
  - shows the sales funnel formula beside a counted result
- **BusinessEngagementEditor offering picker** (3)
  - tells apart and records two Offerings with the same name
  - never offers to remove a channel's last Offering
  - gives a new channel every Offering, with nothing to remove
- **BusinessEngagementEditor Engagement Strategy (2. Customer Relationship)** (1)
  - shows the Engagement Strategy as a table: a column for each stage (no fold arrow, its channels in an "i"), a row for the Goal and one for the Approach
- **BusinessEngagementEditor starts from Page 1 (phase 5f, 2026-11-09)** (2)
  - reads Customers Buy from the Offering's O3, shown as the terms say it (owner, 2026-11-13 16:50)
  - keeps the terms over an answer saved before: a retainer is bought every month
- **BusinessEngagementEditor without a physical item (Questions 2, 11.7)** (2)
  - hides the Physical Delivery and Retail & Wholesale channels while no Offering is physical, as Page 3 hides its physical categories
  - says which channel categories are hidden: only the two physical ones, only with no physical item, only while unused
- **Customer Engagement follows the Foundation (Questions 17, section 3)** (4)
  - suggests a channel from how the customers discover you, in the one grid of channels, and pressing it adds that channel at its stage
  - links a subchannel tile's Offerings only where they have cards of their own (owner, 2026-11-16 14:24)
  - lists an answer-made channel the founder removed under Removed, and Restore brings it back (owner, 2026-11-16 16:36)
  - makes the Customer Sources the Foundation proposes, as the channels are, with no add of its own; a removed one comes back from Removed (owner, 2026-11-16 19:18)
- **every Offering has at least one relationship type (owner, 2026-11-13 00:29)** (2)
  - gives an Offering with no answers Personal Assistance, its card with no x while it is the only type; a second type is a card of its own, with its x
  - makes a type of each help written under O7's Other, named, as the five are (owner, 2026-11-16 19:18)
- **a Customer Source's choices narrowed by the earlier answers (owner, 2026-11-13 13:56)** (1)
  - lists the channels serving the Offering and the source kind its channel's customers come by; All lists every one; a chosen channel fills an empty kind
- **a Customer Source's kind narrows its channels (owner, 2026-11-14 11:15)** (1)
  - lists the channels whose customers come by the source's kind; All lists every one
- **the Removed lists of Customer's Relationship and Sales Forecast** (2)
  - opens a lone type's card at once from its Offering's tile while nothing is removed (owner, 2026-11-14 13:54; kept 2026-11-16 19:18)
  - lists a removed source, and Restore brings it back; a relationship dialog lists no removed type

#### BusinessFoundationEditor.test.tsx (26): Foundation (Segments, Profiles, Competitors, Offerings, Value Proposition)

- **BusinessFoundationEditor folding** (4)
  - starts Profile cards collapsed but the Segment open
  - opens a newly added Profile
  - proposes Profiles by buying role for a business Segment, each added once with its name
  - expands all Profiles in a Segment
- **BusinessFoundationEditor industry outlook** (3)
  - asks it with Market Size, in one box, as choice questions and no free text
  - moves an outlook saved in its own box into the Market Size box
  - loads a Segment saved without it unchanged, and never counts it as missing
- **BusinessFoundationEditor page order (owner, 2026-11-08)** (2)
  - puts the Offerings before the Value Proposition: in the tiles, the subsections and the instructions
  - points the Offering's instruction at the Profiles' needs, not at the Value Proposition that follows it
- **BusinessFoundationEditor follows the Identity answers** (3)
  - asks people's Demographics and not Business Data for a B2C seller
  - asks Business Data without its tick, and not Demographics, for a B2B seller
  - makes the first two Segments for the user, People then Businesses, when both relationships are chosen
- **BusinessFoundationEditor asks its questions** (2)
  - saves a choice on the Segment, and offers the age terms of the Positioning life stage
  - has no free-text box in a box of the Segment's Description
- **BusinessFoundationEditor asks the questions that left Positioning** (5)
  - asks the Differentiation once for the Segment, in its Competitors column after the Competitor cards, started from Positioning; a tick is saved on the Segment
  - asks the end user's outcome in each Profile's end-user part (E4) only where the Segment has an end user, no longer on the Segment
  - splits a Proxy or Dual-Intent Segment's Profile into the buyer and the end user; a Direct Segment's keeps its three sections
  - starts the Differentiation from the openings ticked on the Competitors where Positioning saved none, in the question's own order (Questions 14, K14)
  - asks one Differentiation as a radio while planning
- **BusinessFoundationEditor places the Segment's End user part** (1)
  - right after Demographics on a people Segment, and right after Business Data on a business Segment (the boxes of each column in their order)
- **BusinessFoundationEditor's Offering card order** (3)
  - draws the needs addressed as the first band of Customer Benefit, then O8 and O4; Function asks O1 alone; O2 opens Purchase & Delivery
  - draws two sections, Description (Function, Customer Benefit, Content & Scope) and Terms & Service (the other three boxes), and keeps the Notes in the one Description
  - titles the Competitor's SWOT section SWOT Analysis
- **BusinessFoundationEditor holds questions back while Planning** (1)
  - hides Box 1, 5, Box 4, 4, K3 and O16 while Planning, shows them from Launching, and keeps their answers
- **BusinessFoundationEditor Value Proposition layout (owner, 2026-11-09)** (1)
  - reads the text first, then Emotional and Social Needs side by side, one band each in two columns
- **BusinessFoundationEditor's Segment title (layout rules, section 9, "Tile title")** (1)
  - carries the full name as its tooltip, and is one line cut by an ellipsis that ends 12px before the x

#### ChannelResourceTable.test.tsx (4)

- **the Channel resources table (Customer Engagement, 1. Customer Channel)** (4)
  - lists each channel resource with its cost, behaviour, home channel (and the others it shows in), stages and actions, read-only
  - opens the card on 3. Infrastructure & Capability from the name, and names each action in a button
  - is a fold of its own, open until folded, and is not drawn while the Segment has no resources
  - lists two or more journey stages, offerings or actions one under the other, bulleted alike

#### ChannelResources.test.tsx (16)

- **a channel's resources, in its cell** (10)
  - adds a resource: a BLANK card is made in Offering's Capability, linked to the channel, named in both places at once
  - links an action by "#", shows it as a chip, and serves the other channel through it
  - "shared action" is a link that goes to the action's line; one link per action (#N) when the card is shared through several
  - finds an action of ANOTHER channel of the table by its number or words, and links it (the card then shows in that channel too)
  - finds an action to link by its number in the table as well as by its words
  - finds it by the digits alone, with or without the #, the exact number first and selected
  - has no symbol on the card: its summary says no actions, action or N actions, and the words isolate its actions
  - links an action picked in the table
  - picks only an action of its own Segment's table in the click-to-pick
  - takes a resource off with its card, and the undo toast brings both back
- **Typical costs for this channel (H4)** (5)
  - one press makes every template (T1 to T10, T12 and T13, no T11) in its group, the price blank, linked to the channel
  - pressing again makes nothing twice
  - an item the company already has is not made but offered as Link existing; linking makes nothing, and taking it off keeps the card
  - an offered template can still be added as a new card
  - taking a template-made supplier off the channel removes its card too
- **Typical costs are filtered by the channel's category** (1)
  - a Social Media channel is offered only the templates that fit it

#### CountryScenarios.test.tsx (24)

- **ten scenarios for each of the six countries (GB, IE, US, CA, AU, NZ), three of them the target audience** (6 × 4): for each country the same four tests
  - has the target audience's kinds of business in the country's classification
  - keeps each organisation's country, legal form, activity and positioning through the answer
  - shows the country, the legal form and the activity code with the scheme's name in the editor (the first two: a software business of the target audience and another of it)
  - shows the positioning answers ticked in the Positioning tile (the first two: a software business of the target audience and another of it)

#### FinancialEditors.test.tsx (16): Revenue & Pricing, Costs, Funding & Position

- **FinancialFoundationEditor folding** (1)
  - draws each funding source as a tile whose card opens from it (owner, 2026-11-18 12:41: "make the Funding Sources into tiles")
- **FinancialSustainabilityEditor folding** (3)
  - draws each revenue stream as a tile whose card opens from it
  - shows the frequency's label on a stream's tile, not its raw id
  - formats a stream tile's price as money and drops an empty unit
- **FinancialFoundationEditor number limits** (1)
  - refuses an interest rate over 100%, a minus sign and more than 600 payments
- **FinancialSustainabilityEditor number limits** (1)
  - refuses an Upfront share over 100% and letters in a price
- **the plan's income tax setting (Global Settings)** (1)
  - asks for a basis, with none chosen at first, and a rate from 0 to 100 with two decimals
- **a revenue stream's Begins & Payment and Orders & Delivery** (2)
  - stand as boxes of the shared bands, Begins & Payment then Orders & Delivery
  - ask about orders only where the Offering has a cost per order
- **FinancialSustainabilityEditor starts from Page 1 (phase 5f, 2026-11-09)** (2)
  - starts Charged from O3, and shows Customer Pays as the record of O3's second row (When do they pay?)
  - keeps the page's own stream over the starts, and saves the starts with the first thing written
- **Financials' chapters** (2)
  - draws Revenue & Pricing as Financial Foundation, writing nothing until a field is changed
  - draws Costs, Funding & Position as Financial Foundation alone
- **a revenue stream's card, 2026-11-20** (3)
  - says what the competitors charge under the price, writing nothing into it
  - folds Volume from Each Month, open while it holds no month, with its count
  - charges a stream as its customers buy, in one click

#### FoundersProfileEditor.test.tsx (10)

- **FoundersProfileEditor founders** (10)
  - draws one card per named Legal Entity founder, named and numbered as there
  - points to the Legal Entity while it names nobody
  - starts the cards folded, with the roles under the name, and folds them all at once
  - asks each question with its note
  - takes as many Key Achievements as there are, and takes an empty line away
  - asks Skills, Expertise & Qualifications as a numbered list, each line typed at its end
  - moves a line's type with it when the line is dragged
  - shows skills saved as plain lines, untyped, with nothing lost
  - seeds a founder saved on the Legal Entity with roles and experience, and saves it as its own
  - asks the Personal Survival Budget of a founder with no salary, and says what the business must pay

#### FundsBlock.test.tsx (10)

- **the funds before and after the opening** (3)
  - the Costs tile asks for the Opening Date while there is none
  - works out the budget before the opening, the Startup Contingency and the cash to raise: 30,000 of CapEx + 10% = 33,000
  - works out the Operational Contingency: OpEx a month, the target and the months to reach it
- **the Costs and Funding Need sections with the cost nature and the cash to raise (I7)** (4)
  - is read only: the three totals on top, then the cost of each Offering (Questions 20, 15.2); every cost in full is the Inventory's, and nothing is typed
  - says what the Global Settings contribute: the Opening Date, the capitalisation limit and the reserves
  - shows the Total Pre-operational Budget under the costs
  - the Establishment need is the cash to raise before the opening: the 30,000 of CapEx and its 3,000 contingency, not counted again as running costs
- **fundingNeeds and financialPosition with a launch** (2)
  - a launch replaces the one-time costs it counts and the running months before the opening
  - no launch without an Opening Date after the first month
- **Cost of each Offering, with an Offering sold (Questions 20, 15.2)** (1)
  - draws a card for each Offering: its price, direct cost, contribution, full cost with its running share, and margin

#### LegalEntityEditor.test.tsx (31)

- **LegalEntityEditor folding** (3)
  - puts Expand all on the subsection's heading row
  - starts requirement cards folded and opens a new one
  - shows a folded requirement's name in its head and the rest under it
- **LegalEntityEditor number limits** (2)
  - takes ownership to three decimals, and no minus sign in capital
  - takes a Formation Date no later than today
- **LegalEntityEditor founders & ownership** (3)
  - asks each founder's name, ownership and capital, and no longer roles or experience
  - keeps roles and experience saved before, for the Founders Profile to take
  - never clears a founder with a profile when a one-owner form is chosen
- **LegalEntityEditor chained answers** (1)
  - freezes where the organisation is, its legal form and its registration authority until a country is chosen, keeping what they hold
- **a Legal Entity requirement's or expense's name** (1)
  - is edited in the card's head, beside its number, and wraps and grows as every card's name does
- **LegalEntityEditor where it is** (8)
  - asks Country, then one Address box of lines holding the street, city and postcode saved before
  - names a US address's code the ZIP Code, and a UAE address none
  - asks the activities in the Performer pattern: the + in the first row, the x in the others, and only the primary required
  - names every level as the country's own scheme does, the first level too (Sector and Subsector in the United States)
  - makes no expense when the founders' capital is switched on: only a requirement's own tick makes one
  - takes up to four activities: the + goes at four
  - folds a finished activity to its code (with the scheme's initials) and its last category, and shows the saved ones folded
  - saves only the final code, and a change of country empties every activity
- **LegalEntityEditor as tiles** (8)
  - is one master tile, Registrations & Expenses (the Organisation and Founders & Ownership are tiles of Definition & Purpose; owner, 2026-11-09; the plan of 2026-11-18, step 3)
  - has no Capability tile, with the Founders Profile given too: the skills the business still needs are asked on Capacity & Delivery (owner, 2026-11-16 20:25)
  - opens a one-owner form's founder card straight: the name a cell, the capital an optional tick beside it that takes only a figure, no number, no ownership table
  - opens a box for each expense, with the add box, in the Expenses sub tile of Registrations & Expenses
  - lists every expense and every founder on their tiles, no display cap (the list scrolls; owner, 2026-11-09)
  - opens Registrations & Expenses as two sub tiles: Registrations (the formation's and the tax's numbers, the requirements nested), Expenses (owner, 2026-11-19 16:52)
  - Lumen & Loom (UK) and Quillfield (US): the Registrations tile lists what its dialog holds, in the dialog's order and words, with no status line (2 tests)
- **LegalEntityEditor the country, the legal form and the activities (the six countries and Other)** (3)
  - lists the six countries and Other; Other opens the list of every other country
  - gives Other the four generic legal forms and the typed activities; a country of the six keeps its own
  - saves a typed activity with its code, and reads it back
- **LegalEntityEditor: a change of country empties the state and the address** (2)
  - empties the address and the state the instant the country changes, and keeps them when the same country is chosen again
  - keeps the state, the legal form and the activities when the same country is chosen again (Questions 4, section 9)

#### OpeningDate.test.tsx (11)

- **the Opening Date field** (4)
  - stands on the Organisation tile, in the right column before the Activities, and hands the date on
  - is no longer a setting of the Global Settings' financial plan
  - shows the plan's first month, worked out, with nothing to pick
  - is no longer a field of the Financial Foundation page
- **the Opening Date in the Global Settings** (1)
  - is kept as an ISO date, and nothing else
- **a card split at the Opening Date (rule C1)** (6)
  - rent of 1,500 from 3 months before the opening is 4,500 before it, and runs past it
  - stops at the End date when that comes first
  - a one-time cost dated before the opening is wholly before it; one dated from it is not
  - an annual cost counts a twelfth for each month before the opening
  - counts nothing without an Opening Date, a Start date, or a counted amount
  - the cost lines carry the dates of their cards

#### ProcessLibraryEditor.test.tsx (5)

- **ProcessLibraryEditor, as it behaves today** (5)
  - draws a row for each process, its name in its Process name cell
  - writes what is typed into its process
  - adds a process after the one whose + is pressed
  - moves a process down and up
  - removes a process, and clears the last one rather than removing it

#### StrategyDates.test.tsx (10)

- **StrategicPeriodEditor Objective dates** (2)
  - clears End when Start moves past it
  - keeps End when Start stays before it
- **StrategicRoadmapEditor Objective bars** (4)
  - draws a bar only for a complete period that runs forwards
  - numbers bars by their own order in the Theme, not the Theme.Goal.Objective path
  - says the periods fall outside the Strategic Period when they do
  - still says no Objective has a period when none does
- **StrategicPeriodEditor Objective Responsible** (2)
  - is the Capability cards' side-label row (label beside a dropdown that takes the row) with several founders
  - is not shown at all with ONE founder (no label, no dropdown, no empty row), and with none
- **the Responsible tick on a Strategy Objective** (2)
  - is ticked by default next to the label; unticking hides the dropdown and stores responsibleOff; re-ticking brings it back empty
  - shows no tick with ONE founder

#### StrategyFoundationEditor.test.tsx (3)

- **StrategyFoundationEditor data-rail markers** (1)
  - marks every sub-section with the id the section rail expects
- **the SWOT's starts** (1)
  - show a rated change's line once, though the saved starts already hold it (round of 2026-11-20 18:35 UTC+2, batch C)
- **SW2, Which of these fit you?** (1)
  - writes a ticked suggestion into its quadrant's list and keeps the founder's own lines (Questions 21, section 10)

#### roadmapTooltip.test.tsx (6)

- **placeTooltip** (3)
  - sits above the element, from where it is first visible
  - goes above or below, never beside: on the side with more room, never over the element
  - never leaves the window
- **StrategicRoadmapEditor tooltips** (3)
  - shows a bar's full name and dates on hover, and hides it on leave
  - shows an Initiative with its Objective's dates on keyboard focus, and Escape hides it
  - does not stand in the way of the wheel

#### roadmapZoom.test.tsx (9)

- **roadmap zoom arithmetic** (3)
  - zooms in on wheel up and out on wheel down, and only when the level can change
  - moves a bar's name in by as much as the bar is hidden, never past the bar's end
  - keeps the moment under the pointer in place when the track widens
- **StrategicRoadmapEditor wheel zoom** (6)
  - switches to months on wheel up and back to quarters on wheel down
  - leaves the wheel to the page when the level cannot change
  - makes one step per gesture and adds up small trackpad deltas
  - ignores the wheel outside the timeline and sideways scrolling
  - gives every year heading its own box and every bar a pin offset
  - places a bar on its months at both levels

### src/components/interview/editors/capability/ (21 files, 259 tests): Infrastructure & Capability

The largest folder: the resource, activity, partner and supplier cards of the Capability pages, how they look, what they ask and how their costs are worked out.

#### ActivityPeriodAndResources.test.tsx (13)

- **the period of an activity** (3)
  - Pre-Operational runs from Plan Start to the day before the Opening Date; Operational and Sales from the Opening Date; Production and Marketing from Plan Start
  - says a start before the period, an end past it, and an end before the start
  - a linked resource that starts after the activity ends is found (the activity without an end counts as one day)
- **what an activity needs to be complete** (1)
  - a Start date (a Pre-Operational activity has no Type to give)
- **the Activity card** (6)
  - a performer card that holds several people gets a number box, never more than the card holds; one that holds one gets none
  - a founder is one person: no number box
  - the Resources tick opens a dropdown row per resource, with its link symbol and a + for another
  - says a resource that begins after the activity ends
  - a Per unit resource takes the units the activity uses, and the Cost is the price times them
  - a Pre-Operational activity has no Type field
- **an activity's Team** (2)
  - heads its choices Founders, Staff, Partners and Suppliers, the last three ending in a new card
  - makes a new card from the picker and puts it in the row; a Staff card's cost stands under the Team; each card lists the activity it works on
- **the cards on a Team link back** (1)
  - a founder's card lists the activities it works on, in its one Responsibilities list

#### ActivityStatus.test.tsx (8)

- **the Activity status** (7)
  - lists the activities of the place with their category, then + Add
  - does not offer an activity that ended before the card starts (the chosen one stays)
  - with no activity the list holds only + Add
  - choosing one stores it on the card; the link symbol beside the name opens it; nothing is made
  - - Add makes an ordinary activity (the only founder's, starting with the card), chooses it and asks its name
  - changing the status makes nothing and takes nothing away
  - a card at Activity with no activity chosen is incomplete
- **an older answer's derived activities** (1)
  - the activity a card's status made is the one the card chooses now, and an ordinary activity

#### BoxesAndCards.test.tsx (42): the look of the Capability boxes and cards

- **the boxes have no stroke: an inset light and an inset shade** (2)
  - takes the border out of a box altogether and gives it the light from the top left and the shade to the bottom right, per theme
  - keeps the hover and the focus: the glow beside the inset, and a ring by outline
- **the opened cards, their cells and the Back button have no stroke either** (2)
  - paints the border they keep (it holds the box model) in the light and the shade, side by side, so the inset shadow runs into it
  - keeps the tick boxes' own box and takes no stroke from a disabled (frozen) cell
- **the Delivery cards take the same edges, in one block that can be taken away** (1)
  - keeps them out of the general rules and gives them the same tokens in a block of their own at the foot of the edges
- **a tile's title, with its line, stands one line higher** (1)
  - starts the list 12px under the underline: it comes up by the lift the title measured for its tile
- **the cards of the finished activities are grey** (2)
  - marks an opened completed activity and gives it the Completed tint
  - does not tint an active activity
- **a hugging picker is as wide as its longest option** (2)
  - leaves its placeholder out of the width when it is told to be tight
  - is used by the Frequency of a Resource and of a Partner
- **a Resource card's Status is a side-label row, like its Frequency** (2)
  - sets the label beside the dropdown in the one label column
  - gives a Workspace card (a resource card with the Workspace fields) the same side-label Status row
- **the Responsible tick row is one row at every width** (4)
  - sets the tick, its words and the dropdown on one grid row that the narrow-card rules do not stack
  - puts Qty, Price, currency and Frequency on ONE row: the currency over the side pickers' left edge, the Frequency to the name cell's right edge, the Price between
  - lets the Frequency column give way to the room left, and puts a Per unit Frequency with its Unit under the row
  - lets the Frequency go under the row in a card too narrow for them (under 358px of content)
- **the box name above a floating card** (3)
  - is plain text centred above the card, outside it, and the card is under it
  - is also over a Workspace card, which floats under the name of the Resources tile whose list names it
  - says the box's own 'i' after its name where the box has a note (what the dialog's header says), and none where it has none
- **the box name above a card opened from a subcategory** (1)
  - leaves the subcategory's own note to the dialog's header, and says the section's note after the name of a card opened from it
- **the page behind a floating card is only dimmed** (1)
  - is a flat scrim: no blur, no lift of brightness, no inset light or shade on the page
- **the fold arrows of a founder's card do not move when toggled, and neither they nor the title arrows react to the pointer** (1)
  - has no ground, ring or bolder glyph under the pointer on a founder's arrows, and none on the title arrows
- **the + box** (2)
  - is two bars drawn from the middle of the box: no glyph to sit off-centre
  - swaps its two colours: the ground, a 2px stroke and the darker tone at rest; the tone filled, no stroke, the ground for the + under the pointer
- **the 'i' of a coloured card** (1)
  - is the ground of its surface with a 1.5px stroke and its letter in the darker tint; under the pointer they swap and the stroke goes
- **the Activity card's rows** (2)
  - sets the Team label beside its dropdown, which runs on to the + box in the x's own column; Completed is the last tick on the left
  - adds a performer's row with the +, repeating the dropdown and the x's column with an x; the + stays on the first row
- **a finished activity is frozen** (1)
  - puts every field in a disabled fieldset and leaves the Completed tick outside it
- **the cards of a resource group** (1)
  - have no fold arrow: a resource, an activity, a partner or a provider card is only ever open
- **the text and number cells are recessed** (1)
  - has one token for the recess (the inset the other way round), used by the text and number inputs and textareas, not by a picker
- **page 3's rules are scoped to page 3 (the Financial pages carry .business-capability too)** (2)
  - scopes every rule of the page-3 edges that names .business-capability to page 3's own root or its overlays
  - scopes the page's two-cards layout in conversation.css to .answer-columns (a Financial page's cards were once shrunk to 25px by it)
- **the round of small controls: the x, the Back button, the lift, the ring, the numbers, the help, the titles, the lists** (7)
  - gives the x the '+' box's swap of two colours: the card's ground, a 2px red stroke and X; filled red and the X in the ground under the pointer and the focus
  - multiplies the page-3 glows by one token, --hover-lift (1.2)
  - rings a focused cell one way in every mode: the primary edge and a 3px ring at the one strength, --focus-ring-mix (cell-focus.css; 70% since 2026-11-07)
  - right-aligns the numbers of page 3 and leaves the text inputs
  - makes the section's help drop-down 480px wide
  - gives titles and captions their own inks, softer than the theme's extremes
  - draws a Workspace card's Deposit currency as plain text where the Price row's letters are (the currency picker's inner left padding)
- **the page-3 edges reach only the cards, their cells and the Back buttons** (1)
  - leaves the x (the app's one remove button), the ticks, the 'i', the '+' and the arrows their own look: no rule of the edges names them
- **the fold arrows and the title arrows are wired, and filled under the pointer** (1)
  - draws the triangle as a mask: an outline at rest (stroke 1.5), filled on hover and keyboard focus, at the same size
- **the opened card's columns: everything under the head starts and ends at the name cell** (1)
  - lays a Resource / Activity / Partner / Provider card out on three columns (the marker, the content, the x) with the head on a subgrid

#### BusinessCapabilityEditor.test.tsx (21)

- **BusinessCapabilityEditor lists of cards as boxes** (7)
  - adds a Resource with the add box, which opens it at once; the earlier ones stay closed boxes
  - keeps structural sections open by default
  - counts only active activities in a category, the finished one being filed under Completed
  - puts an activity's one small line (its description, else who is responsible) under its name in its box
  - names a partner kind in the dialog's header, its cards boxes with no Expand all
  - carries only the heading on an activity category's title row (no Expand all)
  - shows the cards as closed boxes again on reload: nothing is open
- **BusinessCapabilityEditor number limits** (1)
  - refuses Delivery Hours above the founder's Working Hours
- **BusinessCapabilityEditor legacy numbers** (4)
  - reads a delivery's hours as the engine does
  - reads a resource's price as the engine does for its total
  - reads a chosen provider's price as the engine does
  - asks a resource's Quantity at Costs only, after the Status, and keeps it hidden otherwise
- **BusinessCapabilityEditor Frequency and Responsibility side labels** (2)
  - sets the label beside its dropdown: Status on a Resource, Responsible on a partner (whose Frequency, like a Resource's, keeps its label above, in the cost row)
  - gives the two labels one shared column (--side-label-short) and the gap --side-label-gap, label and dropdown on one centre line
- **BusinessCapabilityEditor Offering's Capability resources as boxes** (2)
  - lays the Resource cards out as closed square boxes, numbered in order, each opening its card
  - draws a Resource tile with its name cut after three lines and, under it, where it belongs, its status and its cost
- **BusinessCapabilityEditor starts from Page 1 (phase 5f, 2026-11-09)** (3)
  - shows Delivered as O3's record, starts Calendar Time from O15, and asks what can hold up delivery (DV12) in place of Constraints
  - starts Every month for a retainer, and saves the start with the first thing written
  - keeps the page's own Delivery over the starts
- **BusinessCapabilityEditor without a physical item (Questions 2, 11.7; phase 5f)** (2)
  - hides Vehicles and Materials & Inventory in the Offering's Resources while every Offering is a service and they hold no card
  - shows them for a physical item, and shows a category that holds a card whatever the Offerings

#### CardDatesAndStatuses.test.tsx (8)

- **Start date and End date, straight after the name** (4)
  - a resource card asks for both, and keeps what is typed as an ISO date
  - a partner card asks for both
  - an activity card asks for both
  - is read as a real day or not at all; a founder has a start date only
- **a dropdown with one option is shown as text** (2)
  - the Group of a category that has the one group is text, and the card is filed in it
  - a card of a category with several groups keeps its Group dropdown
- **the status "+" adds another status row** (2)
  - adds a row of Partners & Suppliers beside the first status, names its supplier, and takes it away with the ×
  - a status row is saved and read back

#### CategoryHelp.test.tsx (2)

- **the help of a category's header** (2)
  - Equipment (one group in Infrastructure) says the text of Devices & Tools, not a general sentence
  - Vehicles (two groups) says one line for each

#### CostOptions.test.tsx (14)

- **the options of the cost model** (5)
  - each group has its own, and each option its billing type
  - a courier's or a campaign's option has no billing type
  - the billing type locks the driver: Percentage is % of Rev, a Lump sum is One-time, a Fixed amount Monthly or Annually
  - choosing an option sets the driver, keeps one it allows, and sets the unit of a Per unit option
  - a saved option is kept only when it is one of the group's
- **a card that lacks its option or its period** (4)
  - is incomplete without a cost option, in a group that asks for one
  - a card of a group with no options is not asked for one
  - an upfront franchise fee also needs its amortisation period
  - a supplier or partner is asked for its option from the start
- **the cost option on the card** (5)
  - shows the Cost option, then its Billing type as text, and the choice locks the Frequency
  - a Percentage option shows the Rate override with the default rate of the Global Settings beside it
  - a Fixed amount shows no Rate override and offers Monthly or Annually
  - an upfront franchise fee is One-time (not shown) and asks for the amortisation period
  - a supplier's card has the Cost option above its price

#### CostRow.test.tsx (12)

- **the frequencies and units of a group** (3)
  - a group offers its own frequencies, Every two years only in Licences (owner, 2026-11-20 13:31 UTC+2); one it does not know offers the default seven
  - a group has its units, "unit" always among them; one unit besides "unit" is text
  - fills what the group fixes, once a price is typed: the one frequency, and a Per unit price's unit; and keeps what is there
- **the cost row of a card** (6)
  - keeps Every two years on a card that already holds it, in a group that offers it no longer
  - a group with several frequencies lists only its own
  - a group with one frequency shows it as text; a One-time one is not shown at all
  - Per unit shows the group's units beside the Frequency, with no label; another frequency shows none
  - one unit besides "unit" is text
  - a quantity takes whole numbers, and decimals when the unit is an hour, a metre, a litre or kWh
- **the lower rows** (3)
  - Useful life is not asked on the card of an asset bought
  - a Warranty is a tick on equipment, with its date in a Calendar beside it once ticked
  - a Rate override is a contract's own percent, for a % of Rev price of Royalties and of a Revenue Partner

#### Extras.test.tsx (13)

- **where an extra is offered** (3)
  - a bought space has its tax and charge, a bought vehicle its road tax, a person Allowance, Commission and Bonus
  - a producer has its duties; a landlord or lessor those of what is connected to it
  - what is connected is what rents from the supplier
- **how extras are kept** (2)
  - only a figure typed is kept, cleaned to its kind; an unknown extra is dropped
  - a Deposit on a rented Premises card moves to its landlord; one with no landlord stays
- **the extras that are costs** (3)
  - a bought space's tax is Annually and its charge Monthly; a person's Bonus is Annually and Allowance Monthly; a commission is a calculated line, a duty is the goods' own kind, a minimum is no line
  - a landlord's Deposit is an asset returned later, and counts only while a space is rented from it
  - a lessor connected to a rented vehicle prices it for the Qty
- **the extras on the cards** (5)
  - a bought space offers its tax and charge as ticks; a figure typed is kept; unticking clears it
  - a landlord's card shows the extras of what is connected; nothing connected, nothing
  - a lessor connected to a rented vehicle shows a Qty before its price, and Road tax
  - a producer offers its minimum and duties; a people card and a founder Allowance, Commission and Bonus
  - a founder card offers Allowance, Commission and Bonus

#### GeneratedInsurances.test.tsx (6)

- **withNewInsurances** (5)
  - a named premises gets an Insurances card in Infrastructure, linked both ways, annual, to be priced
  - a card with no name yet gets none; it gets one when it is named
  - is made once: not again after the card is renamed or its Insurances card is removed
  - an Offering machine, workshop, event or delivery vehicle gets one in the Offering's Documents & Rights, with its Offerings; a desk gets none
  - keeps the insurance links through the reader
- **the editor** (1)
  - naming a premises makes its Insurances card

#### OfferingResourceGroups.test.tsx (4)

- **Offering's Resources are filed by category and group** (4)
  - opens a category on a box for each of its fixed groups, and a group on its cards
  - keeps the cards with no category yet in a No category tile
  - gives an Offering resource a Category, then a Group, from the fixed lists and without Other…
  - offers no Other… for an Infrastructure resource's Group, and no Other tile in a category

#### OfferingShares.test.tsx (9)

- **the shares of the Offerings a card is linked to** (3)
  - by default, by the hours each uses where the Offerings have delivery hours, else by revenue; the user's own split totals 100% or the card is incomplete
  - saved splits are read once: Units become the user's own split in percents; a typed split stays the user's; equal parts take the default; stray shares are dropped
  - a deleted Offering takes its share with it; a generated card gains an Offering at 0, never over 100%
- **what an Offering card lacks** (1)
  - a link to an Offering, and shares that total 100%; a card of Infrastructure needs neither
- **the cost of a card shared by Offerings** (1)
  - a fixed cost is shared by the card's basis; a cost paid per unit carries no shares, each Offering paying it in full
- **the shares on the card** (4)
  - one Offering shows no percent and no question; two ask "How is it shared?", by revenue while no Offering has delivery hours, each percent a record
  - My own split starts from the split shown and says what is left to share
  - a cost paid per unit shows the ticks alone: each Offering pays it in full
  - ticking a third Offering keeps the typed shares and starts it at 0; unticking one takes its share away

#### ParentChild.test.tsx (30): a card and the activity it chooses

- **the pure rules of the card and activity choice** (3)
  - reads an old answer's derived activity (it named its card in sourceId) as the activity the card chooses: the same activity, now an ordinary one
  - keeps the activity a card already chose, and leaves an activity of the user's own alone
  - a card with the Status Activity and no activity chosen is incomplete: Activity is missing; choosing one completes it
- **the activity of a card in the editor** (4)
  - is an ordinary activity card: the common head, a number, a name box and a remove x, and no message about a card it follows
  - keeps its own name when the card is renamed: the activity does not follow the card
  - stays when the card's Status changes
  - stays when the card is deleted
- **the Activity row under the card's Status** (8)
  - is one row, Activity, with the chosen activity and a link symbol beside it; there is no Open Activity line, no alarm
  - lists the activities of the place that have not ended at the card's Start date, each as Name (Category), then + Add
  - makes a new ordinary activity with + Add: filed in Operational, starting with the card, chosen and named in a box; nothing else changes
  - choosing Activity as the Status creates nothing: only the Activity row appears, to choose from
  - a further status row of Activity shows the same Activity row
  - opens the card above its activity, stacked, each with its own box name; Back closes both
  - closes the whole pair with Escape
  - the activity opened in the pair is edited in place: renaming it renames the choice shown on the card
- **a card's number is its place in the view it is listed in** (1)
  - numbers an Offering activity within its category, so the tile and the opened card agree
- **several Workspaces** (1)
  - adds a Workspace card with the + of the Workspace category tile; left blank it is taken away, filled it stays and is one more category card
- **the Workspace as a Category of a resource** (2)
  - lists Workspace first among the Categories; choosing it turns the card into a Workspace card that keeps its id, cost and links
  - maps Partners & Suppliers to Rent on the way into the Workspace, and back on the way out; the id and the cost stay
- **the Workspace fields live in the merged Resource card** (3)
  - shows the Workspace fields in the normal resource card, with its Category cell, and no standalone form
  - has no kind list any more: the old Workspace dropdown and its Other name are gone, whatever kind an old answer held
  - deletes a Workspace card with its x, the first one too
- **an old Workspace answer is read into Workspace cards** (3)
  - turns a single old workspace into a card of the Workspace category: its id kept, its name the type's label, nothing lost
  - turns several old workspaces into several cards, keeping their ids; an Other one is named by what was written; an untouched one makes no card
  - an answer with no workspace has no Workspace card
- **a new Resource card is filed with no Category** (2)
  - is incomplete: Missing Category, then Group once a Category is chosen; the counted answer leaves it out
  - is what the Resources section's Add Card makes: its Category cell reads Select and the card says what is missing
- **a generated card its parent stops naming** (2)
  - asks first; Cancel keeps both, Continue removes the generated card
  - does not ask about an activity the user made on their own
- **a generated card replaced by another** (1)
  - keeps the screen as the data is while the question is asked: Cancel leaves the first activity chosen

#### PaymentPlan.test.tsx (11)

- **the rules of a payment plan** (6)
  - equal shares total 100%, the last taking what rounding leaves
  - instalments are dated evenly from the Start date to the End date
  - Deposit & Balance pays the first on the Start date and the balance on its own date, else the End date
  - a plan is incomplete when ticked with no type, when the percents do not total 100%, or when a payment has no date
  - a card with a ticked plan that does not total 100% is incomplete
  - is read clean: a known type, whole digits for a count, percents and real dates
- **the plan on the card** (5)
  - is offered on a Per project price only
  - Deposit & Balance: two rows, each an amount, a percent and a date; the deposit is paid at the Start date and the balance follows
  - Instalments: a two-digit number beside the type makes that many numbered rows; a new number makes them again
  - Milestones: a stage row with the + (an x on the ones after), then the amount, percent and date; the total must be 100%
  - unticking keeps nothing hidden on screen, and the card is complete again

#### RentAndBuy.test.tsx (7)

- **a space or a vehicle** (7)
  - offers Exists / Free, Rent, Activity and Buy
  - any other card keeps Exists / Free, Partners & Suppliers, Activity and Costs
  - Rent names a supplier of the ONE group of the place, with a link symbol, and 'Other…' makes one in that group
  - in the Offering the Rent group is Landlords, Leasing & Warehouses
  - Buy asks for the price its group buys with: a space One-time with no Qty, a vehicle Per unit with a Qty
  - moving a card into a space group turns its Partners & Suppliers into Rent and its Costs into Buy, and back
  - a rented space is incomplete until its supplier is named; a bought one until its price is

#### SupplierCascade.test.tsx (5)

- **Category, Group, Name** (4)
  - shows the Group first, with every group in the list, and the Name once the Group is picked
  - the link symbol appears beside the chosen name and opens that card with this one; there is no 'Open …' line
  - a chosen name shows its own Group; changing the Group clears the name
  - 'Other…' makes a new card in the Category and Group picked, and chooses it
- **a partner or supplier card has its Group** (1)
  - shows its Group, with every group of the place in the list; the group picked decides whether it is a Partner or a Supplier

#### activities.test.tsx (12)

- **BusinessCapabilityEditor completed activities** (8)
  - files a completed activity under the grey Completed tile, out of its category's list
  - returns an activity to its category's active list when it is un-ticked, and files one that is ticked under Completed
  - has no Completed tile while no activity is completed, in Infrastructure and in Offering's Capability
  - lists every completed activity, whichever category it belongs to, as card boxes of the one Completed tile (categories first, in order)
  - gives Offering's Capability a grey Completed tile of its own, like Infrastructure's, and takes the nested Completed box out of its Activities
  - files an Offering's Capability activity under its Completed tile when it is ticked, and back under Activities when it is un-ticked
  - FREEZES a completed activity (Infrastructure's and Offering's Capability's): every field is disabled but its Completed tick, which unfreezes it
  - draws the grey of the finished ones from the completed tokens: ground, edge and text
- **an activity made with "Other…" under a card's Activity status** (2)
  - is the sole founder's, as Performer and Responsibility, and starts when the card does
  - is left for the person to assign where there are several founders
- **an Activity's Responsible** (2)
  - is not shown at all in an organisation with ONE founder, who is still the responsible one
  - is unchanged with several founders (a Responsible dropdown)

#### assetCards.test.tsx (5)

- **technical support › services bundled into an asset** (3)
  - a Technical Support supplier named by the asset is linked to it; another group, or an unnamed one, is not
  - an asset that is not costing, or not a purchase, takes no service
  - the cost line of the service says the asset it goes into, and the asset is worth both
- **technical support › the asset card** (1)
  - shows the value with its services
- **useful life › Useful life is not asked on a card** (1)
  - an asset card has no Useful life field, whatever it costs: the years are set under the group on Global Settings

#### costInGroup.test.ts (4)

- **a card that changes its category or group starts its Frequency again** (4)
  - says Select (empty) for a group that offers several, and keeps nothing of the old frequency
  - takes the only frequency a group offers
  - takes the unit with an only Per unit frequency
  - says Select where there is no group

#### delivery.test.tsx (9)

- **BusinessCapabilityEditor Delivery** (6)
  - shows a person's hours with no unit after the box (the label names the hours)
  - does not draw '(founder)' or '(external)' after a person: it is in the tooltip and the input's name
  - lists each Offering on the Delivery tile as a link that opens THAT Offering's Delivery card alone, floating, under the caption 'Delivery'
  - asks LC1 on Capacity & Delivery: the Legal Entity's Gaps and Cover read in once, each ticked skill with its cover, or a link to the Activities
  - sets a Delivery card's order number at the card's padding edge: no box of its own to the left of it
  - carries no static explanation: the paragraphs sit behind the "i" of the hours label
- **Capacity & Delivery, Questions 19 (owner, 2026-11-17)** (3)
  - asks DV6 for sessions (the hours then a session's), DV9 and DV10 for a product, and DV12 in place of Constraints, each tick opening its own question
  - moves a saved Constraints text once into Other, one row a sentence
  - draws the 85% mark on every bar

#### founders.test.tsx (24)

- **BusinessCapabilityEditor founders' roles** (4)
  - asks one Frequency for the salary and both hours
  - shows each founder's roles from the Founders Profile, read-only
  - reads the roles a Legal Entity saved before the Founders Profile existed
  - points to Founders & Ownership when a founder has none
- **BusinessCapabilityEditor founders' Responsibilities** (8)
  - counts what is done of all of them, beside the label
  - shows only the rate beside the label, no word before it
  - starts a list of more than five folded, and unfolds it from its arrow
  - keeps what is done out of the list, in a Completed fold under it that starts folded
  - starts a list of five or fewer folded as well: every list is collapsed by default
  - stands the numbered list at the card's content edge, and its Completed row under the Responsibilities arrow
  - collapses the list again every time the dialog opens; toggling inside an open dialog works
  - has no arrow and no count while there is nothing to list
- **a Partnership / Provider's Responsible** (3)
  - is called Responsible
  - is not shown at all in an organisation with ONE founder: no label, no text, no empty row (that founder is still responsible)
  - keeps an explicit choice among several founders, and leaves it to the user with several or none
- **the Responsible tick on a Capability card** (5)
  - is ticked by default, next to the label, with the dropdown (tick, then label, then dropdown)
  - unticking removes the field for that card and clears the choice; re-ticking brings the dropdown back empty
  - starts unticked from a stored responsibleOff, and a card without the key is ticked
  - an unticked activity is not given the founder its single Performer would make responsible
  - shows no tick, no label and no dropdown with ONE founder
- **BusinessCapabilityEditor founders' share of working hours** (4)
  - says only the share of the working hours, without repeating the delivery hours of the field above
  - shows nothing while the working hours are blank or 0
  - adds the month a weekly Frequency counts to (new information), still without the delivery figure
  - lays the founder card's head out as the other cards: the number at the body's edge, the name 8px after it

### src/components/interview/editors/engagement/ (1 file, 24 tests)

#### customerChannels.test.tsx (24)

- **the customer channel categories** (4)
  - are the specification's, in its order, each with its channels and its journey stages
  - offers each category's channels, then Other, which lets the name be typed
  - offers a channel only its category's journey stages
  - loses nothing saved before: a channel named outside the list keeps its name, and a stage its category does not take is kept, marked as not usual
- **the channel help** (2)
  - explains every category, the chosen one first
  - explains a category's channels and its Other, the chosen one first, and nothing for a category of one's own
- **the examples, on the new categories** (3)
  - lumen-and-loom-studio.json loads with every channel, stage and action kept
  - quillfield-automation-llc.json loads with every channel, stage and action kept
  - draws a stage its category does not usually take with a quiet note, and a usual one without
- **a Segment's shared channel actions, in the table** (5)
  - offers the Segment's other actions as a line is typed, shares the one chosen, and takes a line out of one row only
  - shares an action by typing # and its total order number in a line: it is offered first, and Enter puts the same action there
  - leaves a number that refers to nothing, or to an action already on the row, as typed
  - lets an empty line go when focus leaves it, and keeps the one line of an empty row
  - keeps the one empty line of a row with no action, whatever focus does
- **action markers in the Customer Channel table** (10)
  - puts a link symbol on every row of a shared action and a tag symbol on a linked one, each in its own colour, with a line at the cell's edge
  - numbers every placement down the whole table, under its list number, and the resource's chips with the same numbers
  - shows the app's tooltip, one line of words, on hover or focus, and Escape closes it
  - lights an action's twins when its row is pointed at, and a resource's actions when its card or its symbol is
  - isolates a shared action by collapsing: only its lines, its channels' rows and the cards linked to it stay, no add button, and the note names the channels
  - isolating a shared action shows EVERY card linked to it in EVERY channel kept: at home and, by the shared action, in the other
  - creates nothing while isolated: Enter in an action line opens no new line, a Links box is not opened, and the lines stay editable
  - a click on empty space ends the isolation; a click on a control or a cell's content does not
  - isolates a resource from an action's symbol: only its card(s), with all its actions as chips and the clicked one highlighted, and the note names the resources
  - isolates a resource from its own card: its symbol, or the actions part of its summary, and a second click restores

### src/components/interview/editors/foundation/ (1 file, 7 tests)

#### identityLink.test.ts (7)

- **the buyer the Segment card follows** (7)
  - is the relationship chosen
  - is read from the buyer's category, then the audience, where no relationship is chosen
  - makes a Segment of one kind where the buyer is not known: businesses with the Business Data key, people without
  - settles a Segment's answers against Identity as it is now, so a change in Positioning leaves no old answer in the documents
  - reads each Segment's end user from its own relationship: B2C Direct and B2B Proxy (S9; owner, 2026-11-08)
  - offers a business Segment's end user only working ages (owner, 2026-11-08; no retirees, phase 5)
  - takes the user's life stage that fits where only one does, even if it was never saved

### src/components/interview/editors/legal/ (5 files, 61 tests)

#### LegalExpenseCard.test.tsx (10)

- **the Legal Entity expense in the value** (3)
  - has a Date, read as an ISO date
  - links exactly one registration: an earlier answer with several keeps the first
  - a one-time expense falls in the month of its own date, else the month of the formation
- **the Legal Entity expense card** (5)
  - sets the Date straight after the name, before the Cost
  - draws the Frequency as wide as its longest option, as the cost row's Frequency is
  - types the Date into the expense
  - chooses one linked registration from a dropdown; choosing another replaces it
  - keeps insurance out: its help sends insurance, licences and certificates to Documents & Rights
- **what cannot be in the Formation's date** (1)
  - says a registered company's date is not in the future, nor after the Opening Date
- **what a registration number may hold** (1)
  - takes digits only, no more than the country's, where its shape is digits

#### earlyPositioning.test.tsx (21)

- **LegalEntityEditor organisation columns** (1)
  - keeps where the organisation is on the left (name, country, address) and what it is and does on the right (Legal Form, Opening Date, Activities) with the Description below both, with no Customer or Market type
- **LegalEntityEditor Early Positioning questions** (1)
  - asks the seller and buyer relationship (B2C and B2B only), the audience, the buyer's category and the purpose, one choice each, and the audience follows the model
- **LegalEntityEditor Early Positioning limits by business stage** (3)
  - takes one choice while planning and launching, two in the outcome from launching, two in each while managing: the others locked, a note beside the label
  - reads an older answer: one id, or "both" as business-to-business and business-to-consumer
  - reads an older answer without what the first version leaves out: B2G, G2B, a multi-sided market, the Proxy audience and the two End User questions it no longer asks
- **The name of the positioning tile follows the business stage** (1)
  - is Early Positioning while planning and launching (and before a stage is chosen), Core Market Positioning while managing, Corporate & Portfolio Positioning while growing
- **LegalEntityEditor Early Positioning: the buyer's category and the End User** (6)
  - asks the End User only of a Proxy or Dual-Intent Buyer, and drops its answers with it
  - offers only the buyer and user relationships that can be the buyer's category, the user's life stage to a consumer buyer only
  - offers no Other relationship, but shows a saved one until it is unticked (owner, 2026-11-09)
  - takes a relationship that no longer fits away with the change of category
  - no longer asks the outcomes (2026-11-08: O4 owns the buyer's, the Segment's End user part the end user's), and keeps an end user's outcome saved before as the Segment's start
  - limits the End User's relationship by the stage, as the audience is limited
- **LegalEntityEditor Early Positioning: the two columns and the order of the purposes** (5)
  - asks every question before the purpose on the left (the relationship, the buyer's life stage, the buyer's category, the End User) and the purpose, the differentiation and the outcome on the right
  - groups the questions by relationship with both chosen: the consumer buyer's on the left under the first question, the business buyer's on the right above the purpose
  - keeps the order of the end user's outcomes and of the differentiations for the Segment, where they are asked now: the purposes chosen first
  - offers the purposes that fit the buyer, the most relevant first, and leaves out the ones that are generally less directly relevant
  - keeps a purpose that was chosen even when the answers above no longer make it relevant
- **LegalEntityEditor Early Positioning: the user of a parent, and the life stages of the buyer and the user** (4)
  - offers a parent or legal guardian only a minor or a young adult as the user
  - takes an adult or a senior user away when a parent is chosen
  - offers the purposes of the buyer's and the user's life stage: a student buying for a minor has no business growth
  - does not offer the Commercial & Professional to a Student or Young Adult buyer

#### fitPositioning.test.ts (13)

- **the Positioning answers follow the business stage** (4)
  - keeps answers that fit the stage, and returns the same object
  - sends a question with more answers than the stage allows back to its default (empty)
  - holds the purpose to the same limit as the outcome
  - leaves a growing business free
- **fitPositioningToStage: the buyer's category and the End User** (9)
  - keeps the End User's answers that fit the stage
  - empties a group with more answers than the stage allows, and the others stay
  - keeps the End User for a Dual-Intent buyer too, and drops it for a Direct Buyer
  - asks the user's life stage of a consumer buyer only, and the business relationships of a business buyer
  - drops the buyer's category of a relationship that is no longer chosen, and the End User with it
  - takes a relationship that cannot be the category away: a partner is not a Proxy Buyer's
  - keeps the user's outcome only while a buyer is a Proxy or Dual-Intent Buyer, to the stage's limit
  - gives a parent or legal guardian a minor or a young adult as the user: an adult or a senior goes
  - takes the Commercial & Professional away from a Student or Young Adult buyer

#### positioningIds.test.ts (5)

- **the ids of Early Positioning (design Questions 4): the lists the user sees, the ids a saved answer may hold, and the words of the exports agree** (5)
  - holds the lists of the editor to the ids the reader accepts
  - has words for every id, for the exports and the tile
  - reads an older End User answer: the three relationships stay, the ages fold into the four life stages, the other two questions go
  - reads an older answer to what matters most as the outcome for the user
  - keeps the audience Enterprise or Public Sector: the scale is the app user's audience

#### registrationsAndTaxes.test.tsx (12)

- **LegalEntityEditor registrations** (1)
  - heads one list of rows, each with its ×: the first moves the next up, the last leaves one empty row
- **LegalEntityEditor VAT** (1)
  - asks one tick, its number beside it, and reads a saved "not applicable" as not registered
- **LegalEntityEditor formation row** (1)
  - puts the Registration Date on the Organisation tile, left of the Opening Date, whether or not a registration number is given
- **LegalEntityEditor tax list** (1)
  - names the tax number and VAT beside their boxes, and heads only the registrations added, under them
- **LegalEntityEditor expense links** (1)
  - offers a legal requirement by its name alone, and asks the authority with no placeholder
- **LegalEntityEditor requirement type and free-text numbers** (2)
  - offers plain Type options beside the reference, the country's usual kinds in the Type's note, and Other for a legal form not listed
  - asks registration and tax numbers as free text that wraps, not one-line inputs
- **LegalEntityEditor VAT note** (2)
  - explains the consumption tax beside its tick, outside the label, with the UK threshold and its GOV.UK source
  - gives no figure where none is verified
- **LegalEntityEditor Add to Legal Entity Expenses** (2)
  - ticking a requirement makes an expense named as it is and linked to it; unticking takes it away, undoably
  - ticks a saved requirement an expense already links to, and leaves the others unticked
- **LegalEntityEditor requirement note** (1)
  - names a requirement's note as the expenses name theirs

### src/components/interview/editors/purpose/ (1 file, 4 tests): Purpose & Beliefs

#### PurposeChoices.test.tsx (4)

- **the Mission's choices, PB10 to PB12** (2)
  - draw the three questions from the Business System's Segments, and write the Mission's draft into an empty Mission
  - never write into a Mission the founder wrote
- **the Values' kinds, PB13** (2)
  - start a line of the Values for each kind ticked, in empty Values
  - never write into Values the founder wrote

### src/components/interview/fields/ (12 files, 57 tests): the shared fields

#### DynamicTable.test.tsx (5)

- **DynamicTable, as it behaves today** (5)
  - draws a heading for each column and a cell for each column of each row
  - writes what is typed into its row and column
  - adds a row after the one whose + is pressed
  - moves a row down and up
  - deletes a row, and clears the last one rather than removing it

#### FoldAllToggle.test.tsx (5)

- **FoldAllToggle** (5)
  - is hidden for fewer than two items
  - expands then collapses the whole group
  - opens and closes the nested folds with the cards
  - offers Expand all while a nested fold is closed
  - is hidden for one card, whatever it holds

#### InfoNote.test.tsx (4)

- **InfoNote** (4)
  - renders a Formula point and a source link
  - never links a source whose domain is not accepted
  - glues the i to the last word of its label
  - leaves a label without a note as plain text

#### InterviewInput.test.tsx (5)

- **InterviewInput autoGrow** (5)
  - sizes the textarea to its content on mount
  - follows the content as the value changes
  - refits when its width changes
  - leaves the height alone with autoGrow off
  - grows by default

#### ListStatic.test.tsx (2)

- **ListStatic** (2)
  - is an ordered list, one item a line, in order
  - puts a line's badge at the end of the same line, after its text

#### NumberedListInput.test.tsx (5)

- **NumberedListInput's origins: where each line came from** (5)
  - keeps every line where it was while one is typed into
  - marks a line opened by Enter as new, and moves the ones under it down
  - drops a line removed by Backspace, and moves the ones under it up
  - follows a line dragged to another place
  - draws each line's own end and placeholder where asked, and only the first placeholder where not

#### OptionPicker.test.tsx (5)

- **one control-sizing rule for pickers** (3)
  - takes the smallest standard width that fits its widest option
  - says its step on the picker
  - defines the steps once and sizes by them, never a width of its own
- **one option is a record, not a dropdown (owner, 2026-11-14 14:21 and 14:26)** (2)
  - shows the one option read only and saves it; a second option makes a dropdown again
  - keeps a dropdown where none is an answer too (an optional link), and for an option that does something

#### PageArrow.test.tsx (2)

- **the page arrows** (2)
  - are named Previous page and Next page, drawn with their character as the fallback
  - let ← and → turn the page only where nothing else uses the arrows

#### fieldMarks.test.tsx (5)

- **every field knows its key** (3)
  - from its page, its section, its card and its label, marked on its holder
  - tells an answer from what is none of the person's answers
  - is not recorded outside a page
- **every control has a key, whatever draws it** (1)
  - marks controls no label component reaches, and cards, from where they sit and what they are called
- **a field's key, by its id** (1)
  - stays the same when the field's label is renamed, so a link to it keeps working

#### numberInput.test.ts (13)

- **limitedNumberText** (11)
  - keeps digits and one point within the limits
  - blocks letters
  - blocks a minus sign
  - blocks a second point
  - blocks going over the maximum
  - blocks more decimals than allowed
  - refuses pasted text the same way, whole
  - lets a value saved before the limits be deleted a character at a time
  - refuses anything else in place of a value saved before the limits
  - takes averages to two decimals for monthly counts and items per order
  - asks for the keypad that suits the box
- **limitedHexText** (2)
  - keeps a # and up to six hex characters
  - blocks anything else

#### textLinks.test.ts (2)

- **the text links** (2)
  - are the same classes in the stylesheet and in the list the marquee reads
  - rest regular and plain and go bold and underlined under the pointer

#### useItemFolds.test.tsx (4)

- **useItemFolds** (4)
  - starts with every item closed
  - toggles one item and expands a new one
  - opens and closes a whole group
  - treats an empty group as not all open

### src/components/interview/rails/ (3 files, 38 tests): the Pages and Sections rails

#### BulletRail.test.tsx (11)

- **BulletRail** (11)
  - marks the active bullet as current
  - reports the chosen bullet
  - puts the bullet on the side nearest the card
  - puts its name above the bullets, once for assistive technology
  - holds its page arrow on a row of its own above the name, even with too few items to draw
  - stands each label's number in the list-number column, from 1. to 12.
  - shows what a click will open on hover and on keyboard focus alike
  - draws each page status as the bullet shape, and says it in the tooltip and the name
  - leaves a bullet without a status as it was
  - sizes its named tab to its longest name lit, bold and with the bold tracking (owner, 2026-11-19 22:47 UTC+2)
  - renders nothing for a single item

#### railItems.test.ts (15)

- **railId** (1)
  - slugs a label
- **pageRailItems** (1)
  - numbers each page and strips the Strategy period placeholder
- **pageIndexFromRailId** (1)
  - finds the section a page rail id names by its id, wherever it stands
- **sectionRailItems** (9)
  - uses the parts of a columns page
  - is empty for a stacked Multi-Part page
  - is empty for a tabbed Multi-Part page
  - omits unlabeled parts of a columns page
  - uses the fixed sub-sections of a bespoke page
  - lists Themes on the Goals and Roadmap pages
  - numbers the Legal Entity section's sections on their own
  - carries on a running count where the page does
  - is empty for pages without sub-sections
- **pickActiveRail** (3)
  - picks the last section whose top has passed the threshold
  - picks the first of several sections sharing a row
  - falls back to the first section before any has passed

#### useActiveRailSection.test.tsx (12)

- **useActiveRailSection** (10)
  - starts on the first section
  - follows the scroll position
  - follows the focused field
  - keeps the focused section on scroll while it is on screen
  - lets the scroll position win once the focused section is off screen
  - keeps a clicked bullet active through the scroll that follows
  - releases the pin on a user scroll
  - releases the pin when focus moves into another section
  - keeps the pin on a scroll key typed into a field
  - hands the bullet to the last visible section at the bottom of the page
- **scrollToRailSection** (2)
  - opens a folded section's toggle
  - scrolls the section under the header without focusing any field

### src/components/interview/ (1 file, 2 tests)

#### stickyFocus.test.ts (2)

- **a focused field is never hidden under the sticky title** (2)
  - scrolls a field reached under the band clear of it, 8px below
  - leaves a field that is already clear where it is

### src/components/interview/tiles/ (10 files, 189 tests): tiles, dialogs, floating cards and the Inventory

#### AllLinks.test.tsx (2)

- **every link of every tile's list** (2)
  - opens the right card (the item that was pressed, of the kind its tile holds) under its tile's name; Back closes it and the focus is back on the item; a second press works
  - draws no list item under the + box of its tile

#### AllLinksFresh.test.tsx (1)

- **every link of every tile's list, on a fresh organisation** (1)
  - walks the page of a fresh organisation too: every tile without a link is plain, and nothing breaks

#### AllTiles.test.tsx (14): the Inventory tile

- **where a tile belongs** (2)
  - an Offering resource is filed like Infrastructure's: its category and its group, 'No category' / 'No group' while it has none
  - a partner or supplier shows its type and its group; a Workspace card its group, Premises
- **completed activities** (1)
  - are hidden by default and shown with the Completed status filter
- **the table** (2)
  - writes the currency once, in the header of the Cost column, and the cost as a number
  - a cost in another currency says its own code in its cell
- **the tooltip of a circle** (1)
  - stands above the circle, as the app's tooltip, on pointing at it or focusing it; Escape closes it; the title is gone
- **the Offerings list of Belongs to (owner, 2026-11-13 16:12)** (1)
  - starts at All; an Offering ticked leaves All and shows its rows alone; All, or no Offering ticked, shows every row again
- **the Cost per Offering column of the Inventory (owner, 2026-11-14 09:31 and 13:54)** (1)
  - is a choice under Offering, shown with it, and gives each Offering's share of the cost as the card shares it, with the cost it comes to
- **an Offering chosen under Belongs to (owner, 2026-11-14 11:15)** (1)
  - lists only the chosen Offering, with its share, in the Offering and % columns
- **a share of revenue's Cost per Offering (owner, 2026-11-14 14:17 and 23:30)** (1)
  - is the rate on each Offering's revenue, a line each; with a revenue still to come, the rate and 'when sales are set'
- **a channel's share of revenue (owner, 2026-11-14 20:25)** (2)
  - is split by what each Offering sells through the expense's subchannels; one that sells nothing there has no line; with no source there, by the whole revenue
  - a fee is split by what is paid at its subchannels, a referral commission by its sources (owner, 2026-11-17 09:09, option (a))
- **a share of revenue's whole fee, as the forecast charges it (owner, 2026-11-16)** (1)
  - is the fee row's rate and its fixed fee on each order; a fixed fee in another currency is shown in it, left out, and said so
- **the Inventory's smart options (owner, 2026-11-14 20:08)** (1)
  - offers a journey stage only where, with the Offering chosen, a card is used at it; a ticked one stays

#### FloatingCards.test.tsx (42)

- **the lists on the page tiles are real controls** (11)
  - makes each item a button of its own, the tile's own button still opening the section
  - opens THAT card alone, floating, when an item is pressed: Back closes it
  - opens a category's view in the Activities dialog when its name is pressed and it holds several cards
  - lets the floating card go when its x removes the card
  - has no Back button; the tiles area stays usable: a press on another tile replaces the card, a press on empty space closes only the card
  - closes a floating card with Escape (with the view under it) and with a click on the dimmed space (the card alone)
  - returns Back from a card to the view it came from, Escape from a card closes the card and the dialog under it, and the dialog's Back goes one level up
  - opens a founder's card alone, in the look and width of any card
  - opens the ONE card of a resource group alone, floating, when its name is pressed
  - opens a category's view in the section dialog when its name is pressed, and a group's view inside it when the group holds several cards
  - leaves Delivery's list as plain text, as it was
- **a Workspace card opens alone, like any resource card** (2)
  - floats the one card (the view it came from stays under it) when the Workspace category tile and its card tile are pressed; it is a plain resource card, not a form of its own
  - opens the same card from the Workspace item of the tile's list
- **the + box of a tile that takes new cards** (6)
  - is on the Resources, Activities and Partners & Suppliers tiles of Infrastructure and of Offering's Capability, and only there
  - adds a card of no category yet (Select) and opens it floating, its name focused; it waits in the No category tile till a Category is chosen
  - removes the card again when it is left completely blank, and keeps the + of an empty tile
  - gives each group tile of a resource category a + that makes a blank resource in THAT group and opens it floating, under the Resources name
  - takes the blank resource of a group's + away again when it is left blank, and leaves the group
  - adds a partner, a provider and a resource the same way
- **a resource's links to the cards it is connected with** (10)
  - shows, under the Status, one line per connected card (the activity it made, the partner or provider it uses); a click opens that card above/below this one
  - shows, on a provider's card, one line per resource that uses it; a click opens that resource with the card
  - gives a Partners & Suppliers card no Category row (its tile says Partner or Supplier): its Group comes first
  - gives an Activity card a Group under its name; changing it files the activity in that group (Infrastructure) or sets it (Offering), no Other…
  - a resource that is Partners & Suppliers picks a Group (of any of the two types) and then a Name from that group; changing the Group above clears the name
  - a resource at the status Activity shows, below its Status, the activity it chose with its category, and the link symbol that opens it
  - gives an Infrastructure resource a Category and a Group; moving it files the card there and it stays open
  - flags an incomplete card: its tile glows (with what it lacks in its tooltip), its line in the page tile is red and first
  - passes an incomplete card up: its group tile, its category tile, its section tile and the Inventory tile glow and open with a red first line
  - offers, beside the providers, only the workspace type chosen on a Workspace card (none when none is chosen)
- **the Founders tile** (1)
  - lists the founders' names alone, with no rate of their responsibilities
- **no card is dragged: a card keeps its place, and so its number (owner, 2026-11-22 09:59 UTC+2; WCAG 2.5.7)** (2)
  - keeps the Activities in the order they were made, none draggable
  - does not make other lists draggable
- **the point a page tile scales from** (2)
  - is the corner, edge or centre its place in the group sets
  - moves toward the centre as far as it takes to keep the scaled tile inside a narrow card
- **the stylesheet of the page tiles, the floating cards and the dialog ground** (4)
  - scales a page tile to 110% on HOVER only, about its aimed corner, above its neighbours, with no motion when reduced
  - underlines a list item under the pointer and the focus
  - floats every card, a founder's too, with a drop shadow, 492px wide: one width, set by the floating card alone
  - sets an Activity card's Performer and Responsible rows with their dropdowns next to the labels, 12px apart
- **the point a page tile scales from is set once while the pointer stays** (1)
  - is not measured again when a press moves the focus: the tile (already grown) would be taken for its size and slide from under the pointer
- **closing a card or a dialog returns to the default page** (3)
  - gives the opener back its focus WITHOUT a ring after Escape or Back, however it was opened
  - does the same for a tile opened into its dialog
  - lets no tile grow under a resting pointer after the close, until the pointer really moves

#### SectionTiles.test.tsx (48)

- **the section tiles of 3. Infrastructure & Capability** (5)
  - places Infrastructure's four tiles two by two, with no group headings
  - shows a section's view as one category tile per category (whatever it holds, the empty ones too), ending with the section's add tile
  - gives Offering's Capability four tiles, two by two, and, outside both sections (under Offering's Capability's card), the Inventory tile and ONE grey Completed tile once an activity is completed
  - measures its tiles in a box of its own, the tiles' size container
  - keeps a category the founder added earlier as a category tile beside the standard ones
- **ONE SHAPE for every set of tiles, boxes and card boxes** (3)
  - puts 1 to 3 in a single row, exactly 4 in a 2 x 2 square, and 5 or more in two rows
  - sizes a group on the page from the three-across rule up to three across, and from its own count beyond
  - keeps Offering's Capability at four tiles, two by two, however many cards and channel-made cards it holds
- **MASTER TILES NEVER CHANGE THEIR SIZES, AND LAYOUT (owner, 2026-11-09)** (2)
  - draws a chapter of three large tiles as the 2 x 2 of four, its fourth place empty, at the size of four
  - keeps three tiles that are not master tiles in one row of the page's small size
- **tile anatomy: the title at a third of the height, underlined, a list of what the section includes** (3)
  - lists what each tile includes and says it again in the tile's accessible name
  - draws a group's title on ONE line, whole in its tooltip, inside its category's view
  - cuts a long accessible name sensibly
- **an empty section shows a small + under its title** (9)
  - draws no small + on a page tile that has the + box (the box is its +), only the note 'No items yet'; the group tiles of a dialog, which have one too, do the same
  - marks a subcategory box with no cards yet, and not one that holds some
  - opens an empty category on ONE new blank card, FLOATING, its name focused; left blank, the card is removed again and the + stays
  - also removes a blank card when its floating card is closed with Escape
  - keeps the card once anything is written in it: the tile lists it, and pressing the tile opens that one card floating
  - keeps a card that holds any input other than its name
  - adds a card with the add box of the grid, which closes the grid and opens the new card floating
  - opens an empty group tile on a blank card, floating under the group's name, and keeps it once written
  - lets a link to a card press its tile, its category tile, its group tile and the card's tile: the last one opens the card floating
- **a section tile's dialog** (7)
  - opens the section's content in a modal dialog named after the section, and the page behind is inert
  - puts the Back button at the lower left: the last thing in the dialog, after the content
  - closes with Back and returns the focus to the tile that opened it
  - closes with Escape, returns the focus to its tile, and the key goes no further (it is the page's Back)
  - lets an open list take Escape first, then the dialog
  - keeps the page as it was: a card written in its floating card is still there when the tile is pressed again, nothing is re-created
  - is editable as the section was: a card written in the dialog is saved
- **tile and dialog titles: an & never ends a line** (1)
  - joins an & to the word after it with a no-break space, only in what is drawn
- **a category with several groups opens on tiles** (6)
  - shows a tile for each group of every category with cards, inside the category tile of the Resources view
  - opens a group's card tiles in place of the grid, named as the dialog's subtitle; a card tile closes the grid and opens its card floating; Back and Escape return to the grid first, then close
  - starts on the tiles each time the dialog opens
  - lays the tiles out as the page's tile size, the add tile (half size) apart: Utilities 1, Documents & Rights 4, the Partners category and Suppliers
  - has no 'Add other' tile: the groups are a fixed list, so the group tiles end with the last group, and the add tile of a group's cards (the same size) adds a card
  - shows Offering's Partners as a category tile, and Infrastructure's Operational activities as one, each opening its cards
- **a list of cards as closed square boxes** (5)
  - draws each card as a box with its number and name, and opens that card, fully editable, FLOATING, on pressing it
  - ends the boxes with the add box, which adds a card and opens it at once
  - styles a completed activity as inactive, after the active ones, its number carrying on
  - shows every card as the one card tile: the page's size, in one grid from the left, the page tile's lines
  - grows a card tile 110% INWARDS from the side of its grid it stands on
- **a Workspace is one tidy resource card** (2)
  - holds the Workspace fields in the normal card flow, below its name and its Category cell, with no form or card of its own
  - is styled by the resource card's rules: no stylesheet rule names a Workspace form or card any more
- **the marks on the lines of a tile's list** (2)
  - draws a category with no card in the muted ink (4.5:1 on every tile ground, never by opacity) (its text and bullet), and not one that holds a card
  - sets Offering's Channel line (Resources) in the channel teal, no frame, and two stacked bullets (own on top, teal under) on a Partners line holding a channel's cards
- **the slide of a long title** (3)
  - slides a title cut by an ellipsis to its end while the pointer is over its tile, and back when it leaves
  - does not move a title that fits; one that is cut slides whatever the motion setting (it moves only under the pointer, and is the one way to read it)
  - keeps the title's box: the slide is a scroll, so its size and place are the same

#### capabilityFloor.test.ts (21): the Inventory's rows, filters and sorts

- **the floor** (12)
  - a row says where it belongs and what it is connected to
  - the Founders can be left out; a Workspace is a resource card, so it goes with the Resources
  - a row's place and type: a channel-toned row is the Offering's 'channel' type, and there is no Channel place
  - the categories of the channel type are those of the channel-made cards (and never the Founders)
  - the counts of the types add up to the tiles of a place
  - filters by place, status, payment frequency and cost range
  - a tile lists where it belongs, then its status and cost, as plain lines (no labels, no arrows)
  - a circle's links: an activity is seen from the card that chose it too, a Workspace card links its chosen activity and its supplier
  - an activity a partner performs is seen from the partner's side, and from the card that chose it
  - the Costs option isolates the tiles that have an expense; the cost order and range then apply to them
  - can be sorted by name and by cost
  - a cost reads as the Costs section counts it: times the quantity; a founder's pay and the Workspace's deposit are costs too
- **the Inventory's figures (owner, 2026-11-13 12:32: "it doesn't present accurate information")** (5)
  - a share of revenue is a percentage: no currency on its tile, last in a cost sort, in no range of money
  - the date orders put the cards by start date, a card with none last, then by name; the cards keep their own order (owner, 2026-11-22 09:59 UTC+2)
  - a cost in another currency says its code on its tile; a figure with pence keeps two decimals
  - the Status sort puts the rows with no status after those with one
  - a bought asset priced Per unit is one-time, as the Financial Foundation counts it
- **the Inventory's remaining calls (owner, 2026-11-13 16:50)** (2)
  - sorts the costs by frequency first (one-time, yearly, monthly, per unit, a share of revenue), then the amount, rows without a cost last
  - Resources holds the channel's resources
- **the Inventory's Journey Stages under Belongs to (owner, 2026-11-14 11:51)** (2)
  - All (no stage ticked) keeps every card of the place
  - a stage ticked keeps the channel cards used at it; two ticked keep either
- **the Inventory's columns stand where a row fills them (owner, 2026-11-14 13:54)** (1)
  - a column with nothing to show is not offered; one row filling it is enough

#### inventoryAndChannelTiles.test.tsx (20)

- **cards made from a Customer Channel** (4)
  - a card made from a template lives in its own category and group, in the channel's colour; only blank ones stay in the Channel tile
  - stand among the section's cards as tiles of a hue of their own: the Resources and Partners & Suppliers views, not tiles on the page
  - open floating from their tile, as auto-generated cards: the name is the link to the channel, there is no x, and the rest is editable
  - are not tiled in Infrastructure: a card linked from a channel stays where it is
- **Inventory: a tile's circle and the legend's circles never add up** (1)
  - shows the provider tile and its connected resources when its circle is pressed, even after a legend circle was pressed; the legend then clears the chip
- **the Inventory funnel menu** (4)
  - stands in three groups (Show, Order, Table; the Table in the Table view only) with From / To only while Costs is ticked, and the tick Linked (owner, 2026-11-14 18:17)
  - orders its blocks Include, Sort, Belongs to, then Status / Linked / Costs, all three labelled blocks folded at first, each arrow right after its label
  - lays out the tick boxes on their label's centre line (no margin of their own)
  - spaces its rows with the rulebook's two tokens only: 12px between blocks and around labels, 6px between ticks, label and control
- **the Inventory table** (4)
  - maps a card to Section, Category, Group, Cost and Frequency, one line for one cost
  - gives every card one line: a Workspace's deposit and extras are rows of their own (owner, 2026-11-13 16:50)
  - fills a Legal Entity expense with the funnel's names (Section Legal, Type Legal expense), name, cost and frequency only
  - shows the eleven columns in order, the second cost's line dimmed with the name repeated, the links as bullets only (their text a tooltip)
- **the lines of channel-made cards** (1)
  - sets the line of a card a Customer Channel made (its text and bullet) in the channel teal in a category tile's list, and not the others
- **the Channel group** (2)
  - reads Channel in the Group column and as the last line of a tile for a card of the Customer Channel (Section, Type and Category keep their values)
  - offers Channel as a Group under the category of the channel's cards, and narrows to them when ticked
- **the table mode: surface, columns, sizes** (4)
  - hides and shows the columns from the COLUMNS block (Name always shown), Status and Linked off while the Costs isolation is on
  - sizes the table's text in three steps of the type scale with the S / M / L toggle, 14px by default below 1900 wide
  - draws the table on an opaque calm surface per theme with a sticky heading, a band of the card's hue
  - keeps the fixed Name column on top and opaque in every row state, its heading fixed to the left too (owner, 2026-11-12 23:54)

#### openField.test.tsx (4)

- **opening a field** (2)
  - opens the field's System at its page, with the field to focus
  - focuses and highlights the field once it is on the page
- **the field status line** (2)
  - says nothing when there is nothing to say
  - says a scenario's own value, with its reset

#### tileLayers.test.tsx (31)

- **the tiles' stylesheet** (5)
  - draws every tile a true square of one size token, left-aligned in a 12px grid of the one shape
  - keeps page 3's heading and the cards' title rows in place and scrolls each card's body on its own
  - sets the page's two cards side by side in the page's two equal columns, stacked only under 1100px
  - draws no rule down the left of a group of sections any more
  - centres the content of every dialog across it, starting at the top
- **the page's cards and titles** (7)
  - gives each card its column title as its one label, with no head of its own, and nothing in it folds
  - lines up the first tile rows of the two cards with a heading-height row in Capability
  - hides every title's guidance to begin with, and opens one at a time with its own arrow
  - drops the guidance over the card, taking no room: it is absolutely positioned under the title
  - closes the guidance with Escape (the key goes no further) and with a press outside it
  - sets the tile titles one step up the type scale, the body size (18px)
  - sizes every title on the type scale, in a hierarchy: page 36, column title 28, dialog title and section heading 24, tile / box / card name 18
- **the dialog's square and backdrop** (2)
  - measures a page-wide frame from the underline of the page heading to 12px above the window's foot, over the footer's band (owner, 2026-11-12), the page card area's width, at most 92% of the window's
  - closes on a click on the dimmed backdrop, not on one inside the dialog or a drag that began inside
- **the Founders tile: the founders are tiles, and a card opens floating, the width of any card** (5)
  - is no exception: every dialog has the one frame, so none carries a wide class
  - shows the founders as card tiles (name and role), however many there are, with no open cards in the dialog
  - pressing a founder tile opens that founder's card floating, in the card width of every other card
  - names a founder's tile for a link to it, which presses it (data-opens)
  - lists each founder with the rate of their responsibilities on the Founders tile
- **the app header over the page's layers** (2)
  - is never made inert by a dialog, though the page around it is, and the header z-order rule is in the stylesheet
  - lets a press or an Escape in the header alone: a press there does not close a floating card, an Escape typed there with Notes open is Notes'
- **tailPlacement** (3)
  - puts the tail tile right of the last tile of a 2 x 2 square, in a third column
  - fills the first free cell of a short last row
  - starts a new row when the last row is full and wide
- **THE CAROUSEL ARROWS beside the card or the section opened last** (2)
  - goes to the next and the previous card of the tile, round its ends
  - goes through the sections from an opened section, and leaves the dialog's own arrows out of sight under a card
- **THE ROWS OF A TABLE THAT HOLD THE OPEN CARD (a Journey Stage's subchannels; owner, 2026-11-16 23:58)** (2)
  - frames the whole row of the card now open (every cell but a channel cell spanning other rows), follows the carousel arrows, and scrolls the dialog to it
  - draws one frame round the row in the links' blue, the colour a link frames its target in; the name keeps its own weight
- **A DIALOG UNDER A FLOATING CARD (owner, 2026-11-17 00:22: "Hide it")** (1)
  - hides its rail and arrows while the card is open, whether or not the card has cards beside it, and shows them again when it closes
- **an empty card is taken away however its layer is left (layout rules, section 11)** (2)
  - removes a blank card whose dialog closes with the layer under it (Escape closes every layer)
  - removes it once when it is left with Back, a layer at a time

#### tileParts.test.tsx (6)

- **a card tile's linked lines** (2)
  - are named by the card each opens, and a press still says which line it was
  - keep their numbers where no card is named
- **only the topmost layer shows its carousel arrows** (1)
  - hides a layer's arrows when a layer over it becomes a carousel after it is drawn (its step known later)
- **a title stands only over what it titles** (3)
  - puts a tile's sub-title over its lines, in capitals, centred, the lines bulleted
  - leaves the sub-title out where nothing stands under it
  - draws a dialog's titled section only where it holds something

### src/components/menu/ (3 files, 26 tests): the Menu, Search and Focus

#### FocusModeButton.test.tsx (4)

- **focus mode** (4)
  - turns on from Focus in the Menu, and off from the one Exit focus button
  - is remembered on this device until exited, and only an interview page takes it
  - still works when storage cannot be written
  - hides the rails, the Help, the progress line and the header's own tools, keeps the page at its regular width, with no transition

#### SearchDialog.test.tsx (7)

- **the search dialog** (5)
  - is a dialog with one box, focused, whose results are one listbox in groups
  - opens a page with Enter, the first result chosen until the arrows move
  - opens a field, focused in its card, and an answer, in the box that holds it
  - opens a Glossary term on the Workbook page's Glossary, found by its other words too, and Back returns here
  - closes on Escape without opening anything, and says when nothing matches
- **the search, from the Tools menu or Ctrl+K** (1)
  - opens on Search in the Menu or on Ctrl+K / Cmd+K, and gives the focus back when it closes
- **the search box's look** (1)
  - is a cell of the app: the shared cell look and the one ring, with the floating card's edge and shadow round the dialog

#### ToolsMenu.test.tsx (15)

- **the Menu (layout rules, section 6, "The Menu")** (4)
  - holds Search, Notes, Calendar, Focus, Settings and Appearance, each with its symbol and no title; Focus on an interview page only
  - holds Appearance alone where no Organisation is open
  - opens Appearance's reading modes in the same card on the pointer, a press and the keyboard, and closes it with the left arrow or Escape
  - opens each tool and closes: Search's dialog, the Notes' panel, Focus, the Global Settings and the Calendar on the page it is pressed on
- **the Menu's Appearance: the reading modes** (7)
  - offers Light, Sepia, Dark and Auto, Auto by default
  - sets data-theme and remembers each: Light, Sepia, Dark and Auto
  - starts from the remembered choice
  - under Auto, follows the system's light or dark; once Light or Sepia is chosen, it does not
  - follows a choice made in another window
  - closes on a click elsewhere or Escape, choosing nothing
  - falls back to Auto when storage cannot be read, and still switches
- **the pre-paint theme script** (4)
  - is loaded by index.html before the app
  - applies a stored Light, Sepia or Dark whatever the system says
  - follows the system's light or dark for Auto, nothing stored, or anything else
  - falls back to Auto when storage throws

### src/components/notepad/ (3 files, 24 tests): the Notes panel

#### Notepad.test.tsx (19)

- **the notepad** (4)
  - belongs to the person, not to an Organisation: kept under its own key, newest first
  - links a place once, finds the notes that link to a field, and forgets a removed link or note
  - says when a link no longer leads anywhere
  - names places by "#": Systems, pages and sections
- **the notepad on the page** (5)
  - opens from Notes in the Menu, with the count, and closes on Escape
  - deletes a note at once and offers it back, where it was, with its id, text and links
  - links a picked field without editing it, and outlines the field as in your notes
  - shows a noted field's notes on hover and focus, and marks them and the field each way while the Notepad is open
  - makes a link of what a picked element holds
- **a dated note** (2)
  - shows when it was recorded, automatically, and its Date tick places it on a day of the Calendar
  - writes a moment as the app writes dates and the hour
- **notes by Organisation** (2)
  - belong to the Organisation they were written in; the open one's first, directly, with no heading (its name is the header's), the others folded with their counts, General last
  - reads an older note as belonging to its first link's Organisation
- **a field in your notes, pointed at** (1)
  - draws its stroke inside the box, and outside it (the glow kept) while hovered, focused or its note is hovered
- **what can be clicked in the Notepad** (1)
  - gives a note and a chip a field's hover, "Link a field" the app's one underline, a chip's × the app's one ×, and a note the app's one ×
- **the Notepad panel** (3)
  - slides in over the page (no reduced-motion slide), from the header to the foot of the window, with a shadow off its left edge
  - stays open when the page is clicked (fields are linked by clicking them)
  - holds the person's own notes, not the card notes (owner, 2026-11-09: the Card Notes are the Workbook page's)
- **an empty note (owner, 2026-11-09: "empty notes should be removed")** (1)
  - goes when it is left, when the panel closes and when the notes are read; a note with text, a link or a date stays

#### linkDetail.test.ts (3)

- **a Notepad link chip's number and name** (3)
  - numbers a field by its System, page and section, and names it by its label, never its value
  - names a whole card by its section, and a section by its title
  - goes deeper inside a card list: each card's place as it is numbered, from what is saved now

#### notepadPlaces.test.ts (2)

- **a page said in words** (2)
  - names the Business System's joined pages from either of their sections, each at its place among the rail's pages
  - names the Identity System's one page from any of its sections, as the Brand System's is named

### src/components/shell/ (2 files, 11 tests): the header's save signal and the undo toast

#### SaveStatus.test.tsx (3)

- **The header's saved signal** (3)
  - is shown only while an Organisation is open
  - says Saving… while a save is pending, then ✓ Saved, politely announced
  - names the reason when a save failed, in the warning style, with what to do in its tooltip

#### UndoToast.test.tsx (8)

- **the undo toast** (5)
  - says what was removed, politely, with an Undo button that undoes it
  - goes after ten seconds, the removal final; the time stops while it is hovered
  - stops too while it holds the focus
  - undoes on Ctrl+Z (or ⌘Z) while it shows, but not inside a text field
  - shows one offer at a time: a new removal replaces it, and the last is final
- **offering to undo a removal on a page** (3)
  - offers it only for a marked removal of something written, and puts it back into the page as it is then
  - offers nothing for an empty row removed
  - marks every × named Remove on the page, and Delete on a movable box

### src/components/systems/ (2 files, 5 tests)

#### systemContents.test.ts (2)

- **what a System's tile lists (owner, 2026-11-23 17:28 UTC+2)** (2)
  - lists the pages of a System of several pages, the chapters of one page, the master tiles of one chapter
  - leaves the System's own word off a line, and shows an abbreviation with its full words as the tooltip

#### SystemList.test.tsx (3)

- **the list of Systems** (2)
  - gives every title the text its hover width is reserved from
  - shows each System's status as the rail's shape and its word
- **the progress line** (1)
  - is hidden for now by ONE switch (SHOW\_PROGRESS\_LINE), which draws nothing, not even a gap

### src/components/workbook/ (1 file, 3 tests): the Workbook's Financial Documents

#### FinancialDocuments.test.tsx (3)

- **the Workbook's Financial Documents** (3)
  - draw each document on its own tab: the Forecast with its two charts, the Funding Request, the Financial Plan with its Stress Test
  - opens on the document a link names
  - are where a Glossary place with a document leads: the Financial Documents, on that document's tab

## Business rules: every test

70 files, 905 tests. They check the app's engine without drawing a screen: the money (costs, revenue, the forecast and its statements), the dates and stages, the choices that follow earlier answers, the channels, the legal rules, and the moving of older saves. Many tests run on the two example organisations, Lumen & Loom Studio and Quillfield Automation LLC.

### src/framework/engine/ (40 files, 456 tests)

#### ActionOrder.test.ts (8)

- **the total action order number** (4)
  - numbers DISTINCT actions in the table's walk (channel, stage, line), 1..N with no gaps
  - every placement of a shared action shows the same number
  - finds the action that has a number, and nothing for a number it has not
  - reads #12 (a hash and digits only) as 12
- **the colour a mark takes** (4)
  - six solid hues, then the same hues in stripes, then in a cross-hatch, then round again
  - the classes: the hue, and the pattern past six
  - shared actions and resources take places in order, with no limit
  - a connection line is solid ink, 4px diagonal stripes against the second colour, or a cross-hatch, one part per place

#### BrandInventory.test.ts (6)

- **the Brand Inventory's one icon and one logo** (6)
  - shows a mark's own file first
  - shows a second set's file while the one set is empty, SVG before PNG
  - keeps the second set as saved, even once the mark has a file of its own
  - shows nothing for a file removed by hand, but keeps the older one saved
  - loads an answer saved before the description with it empty
  - exports the one file of each and the description

#### BusinessDocumentImages.test.ts (9)

- **the brand's pictures in the Business Documents** (6)
  - the Plan and the Forecast carry the logo on their covers
  - the Appendix's brand guide shows the logo and icon, then the images with their words
  - nothing at all where no pictures were uploaded
  - the PDF draws the logo on the cover and at every page's head, and the figures whole
  - Markdown carries a small picture as a data URL, and names a large one instead
  - only a data URL of an image is ever written
- **pictures made ready to print** (3)
  - an SVG goes in drawn as a PNG, and a picture that will not load is left out
  - an SVG is drawn in its own shape, read from its viewBox or its size
  - a logo that will not load leaves the cover and page heads without one

#### BusinessDocuments.test.ts (15)

- **business documents** (4)
  - the plan exports alone with the appendix switched off, and with the Financial Documents after its own sections with it on
  - the canvas fills all nine blocks
  - the plan has every section, answered
  - the financial forecast adds up, month by month and by year
- **the Quillfield example is complete** (4)
  - system 1 (identity), 2 (brand), 3 (business) and 4 (strategy) each have nothing missing (4 tests)
- **the optional answers in the documents** (5)
  - the founders' profiles replace the "not covered" lines under Management
  - Skills and Cover: a skill whose activities have no one on their Team is not covered yet; none at all is not covered
  - every achievement reaches the plan, and untyped skills come last, as written
  - a Legal Entity's roles and experience saved before the Founders Profile reach the plan unopened
  - the Identity System's export: the Legal Entity's owners, then each founder's profile
- **the industry outlook in the documents** (2)
  - the plan's Market Analysis gives each segment's market size and outlook, or says it is not covered
  - the Business System's export carries it

#### BusinessForecast.test.ts (50)

- **the forecast's accounting conventions** (2)
  - a sole proprietor's founder pay is drawings, and the balance sheet still balances
  - a company's founders are paid a salary; a grant is never capital
- **Quillfield: an unresolved funding gap** (9)
  - the Current Situation is drafted from the Business System
  - the Strategy System reads the financial plan's dates
  - the Funding Need covers the whole plan
  - the loan's repayments are scheduled
  - the gap is found: $10,700 in hand against $25,135
  - the $15,000 being sought still leaves cash short once it is repaid
  - the stress test: short as planned, and more so in every worse case
  - what it would take: any one of these closes the gap
  - what if: prices 30% higher close it; a $16,000 loan does not
- **Quillfield: the documents tie together** (22)
  - names the channels' journey stages as the page does, and their new channel names
  - negative cash is funding still to be found, and the balance sheet still balances
  - profit kept in the business is Sustainability's monthly result
  - founders' pay is the owner's drawings in the plan and the canvas
  - the funding request reconciles
  - with a grant sought instead of a loan, the funding request speaks of no repayments
  - the Current Situation draft says the market and the competition, each Segment (Questions 21, sections 2.3 and 10)
  - SW2 offers each quadrant the suggestions its answers support (Questions 21, sections 2.3 and 10)
  - the Funding Request says the contingency funds the Funding tile showed, from the Global Settings (Questions 20, section 14)
  - the Financial Plan's Funding Need has a Loan repayments column only while a loan is recorded
  - the plan runs in the standard order: the request, then the financials, then the Appendix
  - the funding request states its terms, debt and equity, period and repayment
  - the projections: Year 1 by quarter, the later years by year, capital expenditure and assumptions
  - the plan carries every saved answer the review asked for
  - the forecast exports as a document
  - the canvas: crucial work, resources by kind, streams by segment
  - the documents' formatting: whole amounts, one date format, bold labels
  - the forecast tables: no all-zero lines, year subtotals by month
  - each financial signal is said once, and capacity once
  - Risks does not repeat the SWOT's threats and weaknesses, and points to it
  - the Financial Forecast PDF/Markdown is landscape, and a wide monthly forecast is one table per year
  - splitMonthlyTableByYear keeps the Opening column with Year 1 only, and each year's own subtotal
- **the forecast statements' structure** (10)
  - Lumen and Quillfield: the cash flow's activities each add up, and together make the net change in cash (2 tests)
  - equipment and deposits are investing; capital, loans and drawings financing
  - Lumen and Quillfield: the balance sheet is classified, its groups add up, and it balances (2 tests)
  - a loan's next 12 months of repayments are current, the rest non-current
  - Lumen and Quillfield: the profit and loss runs by nature down to profit before tax, then its income tax (2 tests)
  - Quillfield: profit, less the owner's drawings, is the profit kept in the business
  - the quarterly view: four quarters and the year, adding up to the annual figures
- **income tax in the forecast** (7)
  - saved answers without it load as not chosen, and the page asks for it
  - not chosen yet: the statements stay before tax, and say so
  - not chosen yet: the statements are as they were before income tax was asked
  - pass-through: no tax at business level, net profit is the profit before tax
  - Lumen and Quillfield at 25 percent: tax on each year's profit, accrued, and paid the next year (2 tests)
  - the Business System export says which basis is used

#### BusinessStage.test.ts (10)

- **the business stage from the Opening Date** (2)
  - is planning before the Opening Date and with none, launching from it, managing from 12 months after it, growing from 24
  - follows a changed Opening Date at once
- **what the Review says of the stage's time** (2)
  - says the time left to the opening while planning, and warns of a planning that ran long
  - says how far into the window the launching, the managing and the growing are, and what is left
- **the stages' durations** (3)
  - move the stages: the opening, then Launching, Managing and Growing for as long as each is set
  - sum into the ends of the windows, the Growing years counted as twelve months each
  - change what the Review says: the planning's length and the launching's months
- **the key dates of the plan** (3)
  - are the plan's start, the registration, the opening and the ends of the stage windows, in time order, each behind or ahead
  - leave out a date that is missing, and the windows with no Opening Date
  - say how far each is: today, days, months, years

#### CapabilityDescriptions.test.ts (1)

- **the Capability descriptions** (1)
  - give every Capability its own text, and Foundation only its own

#### CapabilityMigration.test.ts (17)

- **the data model (F2)** (3)
  - nine resource categories; 21 groups in Infrastructure (Founders & Owners is the Founders tile) and 26 in the Offering, with the partner and supplier groups
  - activity groups by place: Pre-Operational and Operational in Infrastructure; Production, Marketing and Sales & Customer in the Offering
  - a new partner has a group (none yet) and a new resource a quantity of 1
- **an answer saved before the nine categories is moved into them (F3)** (8)
  - each earlier kind is filed in its group (F1)
  - a group the user made is the category's 'No group' (or its one group), its name written into the description of its cards
  - statuses: Provided is Rent on the Workspace and Partners & Suppliers elsewhere; Costs on the Workspace is Buy; Needs Activity is Activity
  - Needs Investigation outside the people cards is cleared, said in the description, and its activity stays (without its link)
  - partners and providers are Suppliers: the old Partners in Business Services (Infrastructure) or Contractors & Advisers (Offering), the old Providers and a category the user made with no group
  - Offering resources are not sorted by the old model: they wait in 'No category' (no category, no group), channel-made ones included
  - activities: Operational stays; the other earlier categories are 'No category' in Infrastructure, with the old one named
  - reading it again moves nothing; an answer that carries the version is read as it is
- **frequencies and quantity (F4)** (6)
  - the eight frequencies: Quarterly, % of Rev and Every two years (Questions 10, decision 2) added; Per order and Other gone
  - Per order is Per unit with the unit 'order'; Other is cleared and its words kept in the description
  - an asset purchase moves from One-time to Per unit (its quantity kept); a bought space, a lease and other groups stay as they are
  - a Per unit purchase is multiplied by its quantity; any other Per unit price is not
  - a Qty is a whole number, with decimals only for an hour, a metre, a litre or kWh
  - the cost model counts an asset purchase as a one-time cost of Qty times the price, and a Per unit order cost per order

#### CardDates.test.ts (5)

- **a card's dates in the cash flow** (5)
  - a monthly cost runs from the month of its Start date
  - a cost every two years falls in its first month, then 24 months on (Questions 10, decision 2)
  - an End date stops it in that month
  - a one-time cost falls in the month of its Start date
  - an annual cost recurs from its month

#### CardExtras.test.ts (6)

- **customs duty and other duties (percent of cost)** (3)
  - are lines of the goods' own kind: the card's price times the rate, per unit like the goods
  - clearance and handling stays one line per shipment
  - an extra not ticked (no figure) adds nothing
- **a person's commission (percent of revenue)** (1)
  - is a calculated line of the revenue it follows, not a fixed cost
- **the minimum order (X6)** (2)
  - without a minimum the cost follows the units sold
  - buys the minimum when a purchase is needed, carries the excess, and buys nothing while stock covers the demand

#### CostNature.test.ts (19)

- **rule C1: a card split around the Opening Date** (4)
  - rent of 1,500 from 3 months before the opening is 4,500 of Pre-Operating Expense, then OpEx
  - a one-time cost dated before the opening is wholly a Startup Expense
  - the same one-time cost dated from the opening is OpEx (C15), and a cost with no date follows the rules from the opening
  - a manual change applies from the opening only: the months before it stay in the budget (C13)
- **rule C4 and the capitalisation limit on one unit** (3)
  - a laptop at 1,500 with a limit of 500 is CapEx; 3 stools at 120 each are OpEx
  - before the opening an asset below the limit is a Startup Expense, not OpEx
  - with no limit set, a purchase of a physical asset is an asset
- **rule C2: a service linked to an asset is added to it** (3)
  - an oven of 4,000 and an installation of 800 are one asset of 4,800: CapEx at a limit of 4,500, though the oven alone is below it
  - the installation is bundled whatever its own invoice size
  - a service with no link is a Startup Expense before the opening and OpEx after it
- **rule C3: a lump sum by its cost option** (3)
  - an upfront franchise fee is an intangible asset: CapEx, the limit never applies to it
  - a set-up fee or an initial licence is a Startup Expense, never amortised
  - from the opening a set-up fee is a one-time OpEx and a franchise fee stays an asset (amortised from its purchase date)
- **rule C5: a Percentage cost is COGS, whatever its date** (1)
  - a gateway at 2.5% on pre-orders before the opening is COGS and is never charged to the startup fund
- **rules C6 to C8 and C15 from the opening** (3)
  - an Offering card with a Per unit or Per project driver, or in Materials, Delivery Team, Delivery Running Costs or Site Hire, is COGS
  - a recurring fixed cost is OpEx, in Infrastructure and in the Offering
  - an Infrastructure card with a Per unit driver is OpEx (C15)
- **rule C14: opening stock** (1)
  - a Materials & Stock card dated before the opening is a separate cash line outside the budget
- **rule F1: the Total Pre-operational Budget** (1)
  - is CapEx + Startup Expenses + Pre-Operating Expenses: 30,000 + 5,000 + 9,000 = 44,000

#### DemandCapacity.test.ts (40)

- **demandResult: answers saved with one model** (12)
  - gives nothing without a model
  - direct estimate
  - sales funnel: 40 prospects, 15% qualified, 25% buy gives 1.5
  - sales funnel is incomplete without every figure
  - referrals: 3 at 40% gives 1.2
  - repeat customers: 120 buying 3 times a year gives 30 a month
  - contracts: 12 bids, 25% won, 1 unit gives 0.25 a month
  - contracts: units default to 1
  - marketplace: 800 visitors at 2% gives 16
  - subscription: 1 new at 5% cancelling levels at 20 active in about 45 months
  - subscription with no cancellation has no level
  - a direct estimate becomes an Other figure; a funnel stays calculated
- **demandResult: several customer sources** (7)
  - adds the sources: a funnel of 0.9 and referrals of 0.6 give 1.5
  - a source can be a figure, whatever its type
  - an incomplete source is left out, the others still count
  - repeat customers come from the customers the other sources bring
  - repeat customers need another source to count
  - a recurring Offering: the sources give new clients, cancellations the active ones
  - keeps the sources through saving and loading
- **capacity: the founders' hours** (4)
  - delivery hours are given, or working hours times the share
  - recurring work comes first; external hours are not capacity
  - a founder over their hours is a shortfall, from that month
  - effort from before the split counts on its first deliverer
- **hours a week or a month** (2)
  - weekly hours become monthly at 52 / 12 weeks a month
  - a retainer's weekly hours per client count as monthly
- **numbers as typed** (2)
  - reads a single comma or point as the decimal separator
  - reads numbers glued together by other characters as nothing
- **guards for figures saved before the limits** (4)
  - reads a percentage within 0 to 100
  - stops a count at its maximum
  - counts Repeat Purchases Each and Units per Contract of 0 as not entered: 1
  - never gives more delivery hours than working hours
- **the channels that bring an Offering's customers, from its sources (owner, 2026-11-12)** (2)
  - are each source's channel, once, in the sources' order; a source with no channel adds none
  - read each source's channel as saved, and keep the ticks saved before readable but not counted
- **offeringChannelRevenue (owner, 2026-11-14 20:25)** (1)
  - files each Customer Source's expected sales x price x items under the subchannel it names
- **Capacity & Delivery, Questions 19 (owner, 2026-11-17)** (4)
  - a session's hours are shared by its customers (DV6); a batch's set-up is spread over its units, each person in proportion (DV9, DV10)
  - each founder's first month above the 85% ceiling, and the hours a person beside the founders can give
  - what can hold up delivery is read and said (DV12); a saved Constraints text is kept as saved until the card moves it
  - counts an Offering's sales in words: a plural name counts itself, any other name counts orders
- **one owner for the build-up (Questions 20, 15.1; 2026-11-21)** (2)
  - builds a recurring Offering up as its Demand works it out: the clients of the first month to the level, in its months
  - keeps the stream's own build-up where Demand gives no months (a one-off Offering, or no cancelling), and a month-by-month list always

#### DemandRecheck.test.ts (5)

- **the Demand recheck (Questions 18, section 2.5; owner, 2026-11-14 12:00)** (3)
  - the time to buy follows who decides: the longest the answers name
  - on impulse or out of habit, or with no one named, there is none
  - the funnel's middle step is a trial where a Profile compares by a demo, trial or sample
- **each Offering's revenue a month (owner, 2026-11-14 14:17)** (1)
  - is the expected sales x the price x the items per order; an Offering with no price is left out
- **the Customer Source a subchannel's customers come by (owner, 2026-11-14 17:44)** (1)
  - a shop on the website brings visitors; a main website, a landing page or social media a sales funnel

#### DifferentiationFromOpenings.test.ts (5)

- **the crosswalk from a K10 opening to a Differentiation** (2)
  - maps the openings that set the offering apart, and no other
  - orders the Differentiations by how many ticks argue for them, then by the first ticked
- **the K10 ticks start the Segment's K14** (3)
  - starts it where neither the Segment nor Positioning answered, within the stage's limit
  - lets a saved K14 win, even cleared, and Positioning's saved answer start it first
  - starts nothing from openings that argue for no Differentiation

#### FoundationShaping.test.ts (16)

- **the words follow who the question is about** (3)
  - asks a Proxy or Dual Segment's market size in buyers, as the rest of the buyer's boxes
  - asks a Proxy Segment's Offering how the end user receives it, has it and what they give, and how the buyer pays; a Dual or Direct one as written
  - names the end user by the relationship, else the end user
- **a Dual-Intent buyer uses it too** (1)
  - starts the buyer's role in buying with Uses it, Places the order and Makes the final decision
- **a minor end user of a Proxy buyer is asked what fits a minor** (2)
  - offers no adult goals (E1) nor the cost (E2), and keeps a saved one shown
  - asks a baby or child how they want to be seen with friends and in style only, a teenager all but a legacy
- **orders by earlier answers (never a lock)** (4)
  - puts the buyer's household of the relationship first (A7)
  - puts the worries the values ticked in B1 point to first, the highest rated first (B1 → E3)
  - orders how they decide to buy by what makes them go shopping (Box 4, 5 → 6)
  - puts the end user's needs first in what they give you by the form (O1 → O10)
- **starts from earlier answers (a saved answer wins)** (6)
  - starts how they receive it from the form, the clearest way only (O1 → O6)
  - starts how long until they have it from a digital form (O1 → O15)
  - starts the terms from the form (O1 → O3), and when they pay from the terms (O3 → O3b)
  - starts what comes after the sale at None where no help is given (O7 → O17)
  - starts the help before buying from how they compare options, only where nothing else starts it (D1 → D2)
  - starts who decides to buy from the kind and size of organisation (Box 3, 1 and 2 → Box 4, 9)

#### FounderPeriod.test.ts (11)

- **a founder's Frequency, migrated** (6)
  - lumen and quillfield calculate what they did before, to the cent (2 tests)
  - lumen and quillfield calculate what they did before with their Global Settings, to the cent (2 tests)
  - rewrites the documents' words (skipped: a tool run only when asked, which rewrites the saved words of the documents it compares with)
  - the weekly fixture, its salary kept to the cent, calculates what it did within that
- **migrating one founder** (5)
  - hours given a week make the monthly salary a week's
  - hours given a month (or before any choice) leave the salary as it was
  - an answer saved with its Frequency is never migrated again
  - a salary kept with more than two decimals is rounded to the cent, once
  - a year's salary and hours are a twelfth a month

#### FoundersProfile.test.ts (10)

- **the Founders Profile page** (3)
  - is the Identity System's fourth section, after Legal Entity
  - stores an object from the start, takes one number, and is never incomplete
  - never holds the Identity System up
- **founders' profiles and the Legal Entity saved before them** (7)
  - a named founder without a profile takes the Legal Entity's roles and experience
  - years saved in a box of their own move to the start of the experience, unless it starts with them
  - the page is seeded once, and loses nothing
  - keeps every Key Achievement: there is no cap
  - reads skills saved as plain lines as untyped entries, and an unknown type as none
  - lists skills by type, in the page's order, each after its type, the untyped last
  - gives the Business System's founders their roles from the profile

#### FunctionalNeeds.test.ts (5)

- **the Offering ticks the Profiles' functional items by id (owner, 2026-11-07)** (5)
  - gives every saved item an id made from its words and place, the same on every read
  - reads a tick saved as words as the item's id, and keeps a tick that matches nothing
  - pools the same words on two Profiles as one item with both ids
  - keeps a tick when the item's words are edited, and matches the Profile by id
  - keeps each line's id through an edit, a new line, a split and a removal

#### GlobalSettings.test.ts (18)

- **the starting values** (2)
  - hold the cost model's examples and leave a country's or the user's own figure empty
  - an Organisation that never saved any has them
- **reading what was saved** (4)
  - keeps exactly what was saved: a cleared figure stays cleared, a removed channel stays removed
  - cleans a figure to digits and one point
  - is idempotent
  - keeps only the useful life of the known asset groups
- **the readers** (2)
  - give the useful life of a group, the capitalisation limit and the reserve
  - work out the channel fee of the cost model: Stripe (UK cards, checked 14/11/2026) on 100,000 and 4,000 orders is 2,800
- **the channel fee data** (5)
  - gives a table saved at version 2 the rows checked on 2026-11-17, keeps a row the founder changed, and adds the new providers in the data's order
  - never offers a provider where it does not sell, and names Zettle PayPal Point of Sale in the US
  - holds a row for every listed provider and marketplace in each of the six countries
  - migrates a saved table: its rows become the UK's, and the rows it lacks are added once
  - shows only the country's rows that the answers name; a row made by hand that no channel names leaves (owner, 2026-11-15 16:37)
- **a subchannel named by the user, and the reset of the Channel Fee Table** (2)
  - lists each subchannel of a paying category named by the user, once; a listed one, a blank one or one not yet named is not
  - the reset gives back the country's rows from the app's data and keeps the rows the user made and other countries' rows
- **the country a browser suggests** (3)
  - is the region of the language
  - falls back to the time zone where the language names no region of the six
  - suggests nothing for any other country

#### JourneySuggestions.test.ts (28)

- **the channels the Foundation suggests, stage by stage** (5)
  - Quillfield's NYC Service Firms: every stage from its Page 1 answers
  - Lumen & Loom's London Homemakers: social media, communities and events from the Profiles; card and wallet from how they pay
  - a Segment in one city meets its customers in person first
  - Buy Now, Pay Later at the payment link, media and reviews at the website, a marketplace shopper at the Marketplace (owner, 2026-11-13 16:50)
  - a suggestion is met once the channel exists: the same subchannel, or any channel of a category suggested alone
- **the Demand rows the Foundation proposes** (2)
  - one row for each Discover channel serving the Offering that no source of it names yet, by the channel's category
  - Contracts or tenders where the buyer decides by a formal tender, once
- **the relationship types the answers create (owner, 2026-11-13 00:29 and 00:31)** (3)
  - every type the answers point to, each once, with its source: the help after buying, the help wanted before, the Profiles' communities
  - a buyer who decides by formal tender, or a government buyer of a business Segment, creates Dedicated Support
  - an Offering's types: the answers' less those removed, then those added; never none
- **every Offering's relationships, the one list the page and the documents read (owner, 2026-11-13)** (1)
  - each Offering of the Segment, in its order, with the types the page shows and their saved details; an Offering with nothing saved has its types too
- **the subchannels the answers make (owner, 2026-11-13 13:56)** (3)
  - a platform the Profiles name is made, at its stage, serving every Offering; a generic suggestion only where the category has no channel at that stage
  - a platform, community or event written in under Other is made too, by its name (owner, 2026-11-15 16:08)
  - a removed one stays removed; added again it is back; an untouched one goes with its answer
- **the Goals a stage starts with (owner, 2026-11-14 11:15)** (1)
  - Get before the sale, Keep at Delivery, Keep and Grow at Support where the Offering sells more after the sale
- **the marketplaces and shops a Segment names (owner, 2026-11-15 16:26)** (1)
  - each becomes its subchannel at Purchase: a marketplace by name, Other by the name written, a shop as its own or Retail & Wholesale
- **the delivery channels the Offering names (O20 to O22; owner, 2026-11-15 16:26)** (1)
  - each tick its delivery subchannel, Other by the name written; a session suggests the booking page
- **Other as a list (owner, 2026-11-15 16:43: "Other could be more than 1 channel!")** (1)
  - two names give two channels; a row removed takes its untouched channel away; an old text is read once by its commas
- **discovery and trial options** (4)
  - adverts by where they are seen, flyers and post: each named at Discover
  - free samples, tasters or trials: one way per Offering's form, a Demo with none
  - D1 offers the ways the Segment's Offerings fit, each its channel at Evaluation; the old demo migrates to them
  - a Free Sample is hidden from its picker while no Offering is physical
- **relationship types and Customer Sources from the answers** (2)
  - an Other written under O7 is a named relationship type; its label is its name
  - the new categories bring prospects; an Other channel's source carries its name; a removed source stays removed; a saved one takes its kind's channels
- **one source of a kind** (1)
  - a saved source of a kind takes the kind's channels, its figures kept; two saved of a kind stay apart and none is made
- **1.12: O10 says where an in-person Offering is given** (1)
  - makes Customer Location where they give access to their home or site, Studio / Shop where they give something else
- **B3: a channel the answers make serves the Offerings whose answers made it** (1)
  - serves the Offerings received that way, and every Offering where the Segment's own answer made it
- **3.2: Visitors from where they buy** (1)
  - makes a Visitors row from a Purchase channel of a marketplace, a shop or an online store

#### OwnerMinimumPay.test.ts (5)

- **the Personal Survival Budget** (3)
  - gives the household's costs less its income, never below nothing, and nothing with no costs typed
  - is kept on the Legal Entity's founder only once typed: a founder saved before stays as it was
  - is asked only of a founder the business pays no salary
- **the owner's minimum pay in Costs** (2)
  - is a monthly line of its own, under Founders, read as founders' pay, where no salary is set
  - is not counted where the founder has a salary, nor where the household needs nothing from the business

#### Palette.test.ts (12)

- **the palette** (8)
  - has seven named colours, each clear of the others on the wheel
  - takes the colours closest to the app's blue first, the warm ones last
  - draws a stored arbitrary hue as the nearest palette colour
  - leaves a Segment's stored hue alone and draws it from the palette
  - gives a new thing the next palette colour after its neighbour's
  - cycles through all seven, in priority order, before repeating, and never matches its neighbour
  - skips to the least-used colour once some are taken twice
  - gives new Segments and Themes palette colours only
- **the palette's contrast** (4)
  - warms the grounds toward the paper in sepia only
  - holds every label at 4.5:1 on every ground: light, dark, sepia (3 tests)

#### PartnerGroupHelp.test.ts (19)

- **the partner and supplier groups carry the help text of the help-texts document** (18)
  - has fifteen groups, each with a text
  - for each of the fifteen groups, its text is the document's, word for word (15 tests): Alliances & Networks; Goods & Equipment; Business Services; Creative & IT Services; Property, Vehicles & Facilities; Technical Support; Revenue Partners; Accreditation Bodies; Producers & Wholesalers; Logistics & Fulfilment; Contractors & Advisers; Agencies & Influencers; Venues & Organisers; Landlords, Leasing & Warehouses; Platforms & Payments
  - is read through partnerGroupHelp, and says nothing for no group
  - keeps no dash that reads as an em dash
- **every resource group carries the help text of the document** (1)
  - has a text for each, taken from the document

#### PaymentScheduling.test.ts (14)

- **a Per project card, paid in full or by its plan** (10)
  - not ticked: the whole price on its Start date
  - Deposit & Balance: a percent on the Start date, the rest on the End date (or its own date)
  - Instalments: equal payments from the Start date to the End date
  - Milestones: a percent on each stage's date
  - the plan moves the cash, not the cost: the total is the same, and Qty counts the projects
  - a plan that is not complete (the percents do not total 100%) leaves the price paid in full on the Start date
  - a payment dated before the plan is already spent
  - a Per project card of Qty 3 is three projects
  - a card with no Start date and no plan is still a cost of each project sold, as in an earlier answer
  - a project dated before the opening is wholly in the Total Pre-operational Budget, for all its projects
- **a Per unit cost follows the units sold** (1)
  - is charged on the units of the Offerings it is linked to, month by month, as a cost of sales
- **the forecast with a payment plan** (3)
  - counts the whole cost in the month of the Start date, and the cash on the plan's dates
  - owes what is not yet paid under the plan, and the balance sheet still balances
  - holds as prepaid what is paid before the cost is incurred

#### PurposeRelevance.test.ts (13)

- **the relevance of a purpose to the buyer (the owner's tables of 2026-10-30)** (13)
  - says nothing, and keeps the list as it is, until something is answered
  - reads the seller and buyer relationship table: Business Growth is a business purpose, Entertainment and Everyday Needs are consumer ones
  - reads the buyer's category table when a category is chosen: a Direct Buyer does not gift, a Proxy Buyer does
  - reads the buyer and user relationship table of a consumer buyer first: a friend does not buy for productivity, a Commercial & Professional buyer does not buy entertainment
  - puts the primary purposes first, then the possible ones, then the rest, and takes none away
  - reads the table of the buyer's and the user's life stage first, and the next table for the three purposes it does not cover
  - reads the owner's table of the audience scale and the business buyer's category first for a business buyer
  - orders the differentiations by the business buyer's audience scale and category
  - reads the owner's tables of the business buyer and user relationships before the audience scale
  - says which differentiations the purposes chosen drive
  - says which differentiations a business buyer and user relationship drives
  - says which outcomes the purposes chosen drive for the user
  - makes the life stages, once both are answered, the first key of the differentiations and the outcomes

#### RelationshipFit.test.ts (10)

- **which buyer and user relationships fit the buyer's category** (7)
  - knows every relationship of the first version, each fitting at least one category
  - agrees with the owner's table of the usual intent: a proxy relationship is never hidden from a Proxy Buyer, a dual one never from a Dual-Intent Buyer
  - reads the category of a model, and offers everything where there is no Proxy or Dual-Intent category
  - gives a parent or legal guardian a minor or a young adult as the user, never an adult or a senior
  - reads the owner's matrix of the buyer's life stage and the relationship for the user's life stage
  - does not offer the parent to a buyer who cares for an adult or a senior
  - puts first the differentiations the buyer's category usually pairs with, and takes none away
- **the user's life stage when only one fits** (2)
  - is set for a parent of a Students / Young Adults buyer's dependent: Minors
  - is left alone when several stages fit, one is chosen, or it is not a consumer Proxy or Dual-Intent buyer
- **2.14: a relationship type's drafts** (1)
  - drafts a Purpose from the type and the Offering's answers, and an Approach from a stage's channels

#### RemovalPatch.test.ts (6)

- **undoing a removal** (6)
  - puts a removed card back at its place, with its id and all its data
  - puts back what referred to it, and keeps edits made elsewhere since
  - does not overwrite a value changed since, nor put a card back twice
  - puts back a line of a list without ids at its position
  - puts back an optional text emptied
  - counts only what a person wrote as content: an empty row is not worth an undo

#### ResourceStatuses.test.ts (5)

- **a resource's status (stage C)** (5)
  - a card's status follows the group it is filed in: Rent and Buy are a space's, Partners & Suppliers and Costs another card's
  - a Buy asks for its group's price: a space One-time, a vehicle Per unit; what is there is kept
  - Provided and Partners are one status, Partners & Suppliers, in a saved answer; the Workspace's Provided is Rent and its Costs is Buy
  - Needs Investigation is no status: an old answer's is cleared, on a people card too, and said in its description
  - a resource card offers four statuses, a people card the same and a space or a vehicle four of its own

#### Responsibility.test.ts (15)

- **an Activity's Responsibility, set by its Performers** (6)
  - is the one founder among the Performers
  - is that founder even beside partners and providers
  - follows the Performers to a different single founder
  - is a choice with two or more founders, and the choice is kept
  - stays empty with no founder among the Performers
  - is the only founder of a one-founder organisation
- **a Partnership / Provider's Responsible** (2)
  - is the founder of a one-founder organisation while nobody is chosen: derived, nothing written
  - keeps an explicit choice, and with two or more founders, or none, is what was chosen (empty until then)
- **a Strategy Objective's Responsible** (1)
  - is the sole founder while nobody is chosen (no field to choose in): derived, nothing written; a choice or several founders leave it as chosen
- **the Responsible tick (responsibleOff): no responsible by choice** (3)
  - an unticked activity has no responsible, and the Performers rule does not give it the sole founder
  - an unticked partner or objective has none, even with one founder
  - is stored only when off: reading drops anything else, so older data is unchanged
- **the categories of an activity › an activity's category (stage B), read from saved answers** (3)
  - an Infrastructure activity's category is the category it is filed in; a made category is listed with its name
  - an Offering activity saved without a category is Production; one saved with a category keeps it, and an unknown one is Production
  - an answer saved before the nine categories: an activity whose category its place no longer has is in No category, its old category named in its description

#### ReviewItems.test.ts (18)

- **the Review page's items** (14)
  - Lumen, fully answered, is ready: nothing still open or missing
  - Quillfield, fully answered, is ready: nothing still open or missing
  - a System not started is one item, with the way to it
  - a card with information missing is one item, naming the card and what it lacks
  - an empty Mission is said where it is drawn, Purpose, and keeps its saved key in Definition (Questions 9)
  - a Vision with no future chosen is said where the Mission & Vision is drawn (PB7, PB8)
  - an Ambassador with text and no character chosen is said at its Aesthetics (BA1, Questions 11, section 5)
  - no founder named is said on Definition, where Founders & Ownership is drawn, and opens that page (2026-11-09)
  - income tax, asked on Costs, Funding & Position, is said as itself
  - with several founders, an activity nobody is responsible for is open
  - an activity whose Responsible tick is off is not open: no responsible by choice
  - an Offering with no Type, or no terms (O3), is open, as the later pages read them (phase 5f)
  - a second named Segment with no Offering and no competitor of its own is open; one with either is not (phase 5f)
  - lists nothing the Foundation never asks for
- **Review across the whole app** (2)
  - lists a System beyond the Foundation once it holds an answer, under its Capability
  - leaves out a System never answered
- **what the Positioning tile still lacks (the Review's open item)** (2)
  - says every question of an empty tile, the audience and the category only once a relationship is chosen
  - asks the audience and the category of each relationship chosen, and nothing of a complete tile

#### Search.test.ts (7)

- **search: the index** (2)
  - compares without case or accents
  - takes every text a person wrote from an answer, with the cards it is in, innermost first, and no codes or ids
- **search: finding** (5)
  - finds in three groups, pages before fields before answers
  - ranks an exact match first, then a start, then a word start, then the rest; then the app's order
  - needs every word, in any order, and ignores case and accents
  - keeps each group short
  - shows a short piece of an answer around what it found, the words marked

#### Sources.test.ts (7)

- **accepted sources** (7)
  - accepts governments, universities and the named official bodies
  - rejects open-edit, commercial and explainer sites
  - reads the host without www and refuses plain http
  - writes a source as a Harvard reference, and cites it by author and year
  - lists every source once, in alphabetical order, as a reference list does
  - keeps every registered source accepted and dated
  - finds no external URL in the app outside the accepted sources

#### ValueIds.test.ts (4)

- **the Values gain ids** (4)
  - loads an old save unchanged, with ids made from each line's words only, the same on every read and wherever the line stands
  - keeps each unchanged line's id through an edit, its text exactly as written
  - tells two lines of the same words apart by a suffix only
  - reads no Values as none

#### ampersandLabels.test.ts (2)

- **labels and options say & (owner, 2026-10-29/30 and 2026-11-19)** (2)
  - has no ' and ' in a label the app writes, but the sentences and names kept on purpose
  - has no ' and ' in a title or heading the app draws

#### answerReaders.test.ts (10)

- **the Profile's starts from the Segment's work answers** (4)
  - starts D3 from the work schedule, and from being retired
  - starts E3 at the price for students, and C1 at a smartphone on the road
  - orders D1 by the buying role (A5): a user tries it, the decider asks for a quote
  - writes a Profile's persona line, from the parts answered
- **the Offering's readers** (2)
  - puts Local delivery first in O20 for customers working at home
  - says the Support promise from O16, none with No set time
- **the Competitors' readers** (3)
  - opens the customers beyond a narrower competitor's reach (K2)
  - adds the crowded market's line to K10's i at 4 or 5
  - lays K1 to K10 side by side, a column per competitor, rows with an answer only
- **the Strategy SWOT's starts** (1)
  - shows a quadrant's starts until the founder edits it

#### autoFilled.test.ts (4)

- **P1 and P2: a source's Basis draft and what the founders' hours allow** (2)
  - drafts the Basis from the source's own working
  - says how many a month the founders' delivery hours allow of one Offering
- **P9: an Objective's drafts** (1)
  - names an Objective from each open item and each uncovered skill
- **K15 and P7: what competitors charge** (1)
  - keeps From and To as typed, or Not known yet, and spans the Segment's competitors

#### demandReaders.test.ts (7)

- **the typical ranges in a rate's i** (3)
  - gives online shop visitors the shops' range, its reference last, and the typical figure as the placeholder
  - gives a shop's visitors none
  - gives the funnel's buy rate and the tenders won theirs
- **the market-size check** (1)
  - says the customers a year as a share of the market's band, never changing a figure
- **the Identity answers in the source suggestions** (1)
  - proposes Contracts or tenders where the business sells to government
- **Ready from** (2)
  - is asked of an Offering still an idea or being built, with its note
  - moves Begins to the month it is ready, only while O2 says it is not

#### longLists.test.ts (7)

- **the Segment's long lists** (2)
  - offers the marketplaces the Offerings' forms sell on, Other always
  - orders the payment services by where they shop
- **the Profile's social media (C2)** (1)
  - puts LinkedIn first for a business Segment, TikTok and Instagram for customers under 25
- **the Offering's O3, O6, O20 and O15** (3)
  - offers O6 by the form; a saved way outside it stays, with its note
  - orders O6 and O20 by the Segment's reach, the post and couriers first for a rural area; several countries starts O15 at One to four weeks
  - notes customers far away for an Offering given only in person or collected
- **K5, the competitor's channels** (1)
  - gains Advertising, Print & mail and Samples & trials, and puts the customers' own groups first

#### offeringEconomics.test.ts (3)

- **the cost of each Offering (Questions 20, 15.2: time-driven activity-based costing by the founders' delivery hours)** (3)
  - shares the running costs at a rate for each delivery hour available, and charges an Offering's own costs to it alone
  - shares by revenue where an Offering gives no hours per sale, and where no delivery hours are known
  - says what a sale gives where its price is below its direct cost

#### offeringRemoval.test.ts (4)

- **removing an Offering** (4)
  - says which Offerings an answer no longer holds
  - unticks it on Offering's Capability's resources, activities, partners and suppliers, with its share
  - unticks it on a Customer Engagement channel, keeping what is keyed by Offering
  - leaves an answer that holds none of them as it is

### src/framework/engine/answers/ (2 files, 30 tests)

#### EffectiveAnswers.test.ts (26)

A "start" is an answer the app fills in from an earlier one; it follows its source until the founder sets the field.

- **a field set saves that field only** (1)
  - takes the field, its ratings and its Other from the answers shown, and nothing else
- **the Profile's starts follow the Segment until the field is set** (1)
  - starts the worry about price from a low household income, and follows a change of income while E3 is not set
- **the Offering's starts follow their sources until the field is set** (1)
  - starts O2 from the stage and O4 from the Differentiation, and an answer to O1 freezes neither
- **O4 keeps the order ticked (Questions 16, O4: the first ticked is the main benefit)** (1)
  - keeps the ticks already there in their place and puts a new one last
- **the readers read the answers as the card shows them** (1)
  - raises a starting worry the Offerings leave open, before it is ever saved
- **the Differentiation and the end user's outcome start from the Positioning answer saved before, per Segment** (5)
  - starts each Segment's Differentiation (K14) and its end user's outcome (End user, 9) from the old answers, within the stage's limit
  - lets a value saved in the new place win, even one cleared
  - asks the end user's outcome only where the Segment has an end user
  - starts O4 from the Segment's own Differentiation (the old one where none is saved), then from the buyer's outcome saved before
  - gives the documents and the exports the Segment's answers with the starts (settledSegmentAnswers), worded under the Segment
- **the later pages' starts follow the Offering's O3, O3b, O10 and O15** (4)
  - maps every O3 term to Customers Buy, Delivered and Charged
  - maps O3b to the Payment Timing: instalments are Milestones on a charge paid once, and no start on a monthly one
  - starts Calendar Time from O15's band for an Offering delivered per unit only, and Constraints from O10's words
  - finds an Offering by its id in any Segment, and gives nothing for an id not on Page 1
- **an Offering without a physical item (Questions 2, 11.7)** (2)
  - is a Service, or a form with no physical item; an Offering with no Type or form may have one
  - hides the physical groups only when every Offering is without one, and not when there are no Offerings
- **1.5: lists filtered by O1 show everything until every Offering has its form** (1)
  - filters by the forms only once each Offering has one
- **a start unticked to none stays none (owner, 2026-11-18)** (4)
  - keeps the Segment's How they pay and Who decides empty, through a reload and a change of their source
  - keeps a Profile's D1 and D3, and an Offering's O20, empty through a reload and a change of their source
  - keeps K6 empty once its starts are unticked, through the settle and a change of K5
  - keeps DV12 unticked to none on the saved card
- **B1: Calendar Time starts from O15 less the sending** (1)
  - takes the sending weeks off O15's upper end, a week at least
- **B2: every way to try it first while no Offering says what it is** (1)
  - gives no list of ways (so all show) until an Offering has a Type or a form
- **3.4, 3.7, 3.9: O3, O15 and O20 start from the answers above them** (2)
  - starts O20 with one way from the Segment's reach
  - starts O15 from how they receive it
- **a revenue stream's Per starts from the Offering's terms and form** (1)
  - says what one sale is, as Lumen's own streams say it

#### dynamicSources.test.ts (4): new with the Finance link fix

- **a Dynamic Field reading Revenue & Pricing** (3)
  - lists each Revenue Stream by its Offering's name, once, in order
  - skips a stream whose Offering is not chosen yet
  - gives nothing for another name or another page
- **a page's name** (1)
  - leaves out the period placeholder

### src/framework/engine/capability/ (1 file, 6 tests)

#### skills.test.ts (6)

- **LC1, the skills the business still needs (Capacity & Delivery; owner, 2026-11-16 20:25)** (5)
  - the Legal Entity's Gaps and Cover are read once: Gaps as Other rows, one a sentence; Cover as the Notes
  - the parser keeps the skills only once they are saved
  - a skill's cover is the Team of its group's activities: Marketing; Selling and Customer service, Sales; Making and Delivery, Production; the rest Infrastructure
  - each example's needed skills read with their cover; a group with no one on its Team is not covered yet
  - the Review lists each skill not covered yet, linking to Capacity & Delivery
- **Delivery: only the people who give working hours** (1)
  - keeps a contractor, leaves out a courier and a payment service, keeps one that says its hours or holds some

### src/framework/engine/cards/ (2 files, 17 tests)

#### CardCompleteness.test.ts (11)

- **incomplete cards** (5)
  - a resource needs its name and status, and at Costs a price and a frequency; at Partners & Suppliers who
  - a partner or provider needs its price and frequency; an activity a performer
  - an untouched Workspace or founder is not an error; a half-filled one is
  - the counted capability leaves incomplete cards out and strips the Workspace and the founder; the stored answer is untouched
  - every Workspace card is judged on its own and left out of the counts on its own
- **a card with no category yet** (1)
  - a new Activity or Partner / Provider (no category yet) lacks its Category first, and is kept as stored; the cards of a chosen category do not
- **a card's tile** (3)
  - says a Profile's age, kind of work and first goal
  - says an Offering's Type, form, whether it can be bought today and how it is paid for
  - says a Competitor's Type, reach and size, leaving out what is not answered
- **what a card of the Identity, Brand, Foundation and Strategy Systems still lacks** (2)
  - a card that holds nothing is not flagged; one that holds something but not what it needs is
  - a card of a Segment or a Strategy card needs its name once anything else is written

#### GeneratedCards.test.ts (6)

- **generated cards** (3)
  - asks about a generated card its parent stops naming, and nothing else names
  - keeps a generated card another card names
  - does not ask about a card made in the same change, or one made on its own
- **generated cards and their parent's removal and Offerings** (3)
  - asks about a generated card whose parent was removed
  - makes a generated card serve the Offerings of its parent
  - adds, never removes: another connected card's Offerings are added, the user's own stay, and the parent's change does not take them off

### src/framework/engine/channels/ (4 files, 39 tests)

#### ChannelActions.test.ts (5)

- **a Segment's shared channel actions** (5)
  - an answer saved before becomes one action per line, identical words kept apart
  - a new line makes an action; typing edits it
  - an action chosen in another row is the same action, and editing it edits it everywhere
  - taking it out of a row keeps it in the others; out of the last, it is gone, and undo brings it all back
  - the Lumen example shares its one repeated action between the studio and the markets

#### ChannelResourceTable.test.ts (11)

- **the channel resources table, derived** (11)
  - one row per distinct card of the Segment, in the channel table's order; none for a missing card or another Segment's link
  - the cost reads price x quantity and how often, or says why it has none
  - Fixed or Variable by frequency, as the Financial Foundation reads it; none without a counted cost
  - home channel, the others its actions reach, its stages in journey order, its actions by total number
  - a resource linked to an action of another channel keeps its home, lists that channel under it, and numbers the action by the whole table
  - Offerings: only the names the card holds, never All Offerings; none for a card with none linked or without the field
  - an Infrastructure card (no Offerings field) has no Offerings, whatever Offerings the Segment has
  - the summary adds up the rows: annual / 12 into the month, per-order apart, one-time apart
  - a share of revenue reads as a percentage, every other variable cost as an amount
  - with no channels there are no rows and no summary
  - Lumen & Loom's first Segment: every linked card once

#### ChannelResources.test.ts (18)

- **a channel's resources** (12)
  - "+ Add resource" makes a blank Resource in Offering's Capability and links it, not in Infrastructure
  - the new resource is blank: no Status, no Offerings, whatever the channel carries
  - a blank resource is not counted by Financial until the user gives it a Status and Offerings
  - linking or unlinking actions leaves the card as it was
  - a channel is never without Offerings: new ones carry all, saved ones with none read as all
  - one name: renamed on the card, it reads so on the channel
  - taking it off the channel deletes its card; deleting the card takes it off the channel; undo restores both
  - a resource made earlier in Infrastructure still shows on its channel, renames, and goes with it
  - serves another channel through a shared action: listed there, and in its summary marked shared
  - is linked to an action of ANOTHER channel of the Segment's table: it shows in that channel, reaches it, and the action lists it
  - cost links saved before become resources on their channel, on the same card; a category's on its first channel
  - the forecast counts each resource once, whatever channels it serves
- **the examples' channel resources** (2)
  - lumen and quillfield: 6 to 14 resources on its own cards, one serving a second channel, none a work tool, listed in the export (2 tests)
- **the payment services' cards, made from the answers** (3)
  - appears once: each service its card on the Card channel, named after it, and a second pass makes nothing more
  - a card the founder removes stays removed while the answer stays
  - an answer gone takes its untouched card away; an edited one stays
- **one card a payment service for the Organisation (owner, 2026-11-15 16:43)** (1)
  - a second Segment naming the same service has that card linked to its payment channel; an answer gone takes only its link

#### ChannelTableColumns.test.ts (5)

- **the Customer Channel table's fitted columns** (4)
  - the Journey Stage picker is made for the longest stage, the Channel one for the longest preset name
  - a column is its picker (widest option and chrome, rounded up), what stands beside it and the cell padding at both sides
  - Offerings and Action share the rest of the table whole pixel by whole pixel, Action the larger part
  - the widest of some widths, and Action takes the larger share of what is left
- **the Journey Stage column keeps its add button on one line** (1)
  - it is never narrower than the button (with the slack) and the cell padding at both sides

### src/framework/engine/choices/ (8 files, 161 tests)

These files hold the interview's questions: which are asked, in what order, which options are offered, and which answers start from earlier ones.

#### AmbassadorChoices.test.ts (8)

- **the Ambassador's choices** (8)
  - keeps known ids and ratings only; a key never set stays missing, so its start keeps following
  - is one character until Managing, then 2 (K14's pattern)
  - starts BA4 and BA6 from the first character, and keeps a rating the founder set
  - says BA4 in words: a 3 left out, both at 3 balanced
  - takes the two tone rows furthest from 3, a tie in the rows' order, never a 3
  - writes the drafts and the Business Plan's line (Questions 11, section 3)
  - offers BA9 the Values by their ids, keeps a tick on a Value still there, and writes the Lasting impression (Questions 11, BA9)
  - puts the trade's own terms first only where every Segment is a business

#### CompetitorQuestions.test.ts (23)

- **what each type of competitor is asked (Questions 14)** (4)
  - asks a rival business everything, a substitute no size or reach, the others the ratings only
  - words each question for its type
  - removes, on the next choice, the answers of the questions a new type does not ask
  - keeps a platform's rating only while it is ticked, and nothing outside 1 to 5
- **the review platforms in the order of the App User's industry and country (L18)** (2)
  - reads the industry from the first activity's code, through the crosswalk L7
  - puts Google and Facebook first, then the industry's, then the country's; the rest after them
- **K10: the openings, from the card's own answers** (4)
  - scores the values (5 − rating) × weight and words each by its rating
  - breaks a tie by how many of the Segment's competitors rate the value low
  - reads the stages, the reviews, the growth and the changes
  - words the status quo's and the internal solution's openings for what they are
- **Customer Acquisition and Other (owner, 2026-11-04)** (9)
  - keeps a channel's sub-channels while it is ticked, and opens where the customers are and the competitor is not
  - keeps an Other row while Other is ticked; a name that means a listed item becomes it, its rating kept
  - keeps K6's Other as a numbered list: a rating moves with its line, an emptied or removed line loses it, a finished line that means a platform becomes it
  - keeps K8 to the listed values: a value once written under Other is dropped
  - finds a value every Competitor is weak on and a Profile rates Essential, and puts its opening first
  - shows the first six openings, and any already ticked
  - reads the four SWOT boxes as two notes, the second box joined in as its own line
  - reads answers saved before K6 (attract) went under the new numbers
  - shows every value, the Segment's Profiles' B1 values first, the highest rated first
- **K3 held back while Planning** (1)
  - is not asked by the card while Planning (an empty stage too), is asked from Launching, and keeps its saved answer
- **K14's options say which competitors each start came from (owner, 2026-11-09)** (1)
  - names, in the competitors' order, those whose K10 ticks argue for each Differentiation
- **2.15: K6's rows from K5** (1)
  - ticks the Marketplace and Facebook rows where they reach customers there, while K6 is never answered
- **K5: every channel a competitor uses opens its list of subchannels** (1)
  - gives each of K5's channels a list, Online / live's the live tools

#### MissionChoices.test.ts (5)

- **the Mission's choices** (3)
  - offer the Segments, then the Offerings of those chosen (every Segment's while none is)
  - offer the goals ticked on the Profiles, the most chosen first; every goal while none is ticked
  - write the Mission's draft once who and what are chosen
- **the Values' kinds and the drafts that follow them** (2)
  - keep known kinds only, two at most, and start a line for each
  - start a Principle under each Value, and the Manifesto from the Values and the Philosophy's first sentence

#### OfferingQuestions.test.ts (31)

- **the Offering's questions (Questions 16; owner, 2026-11-07)** (4)
  - asks O1 by Type, O10 of a Service or Hybrid, O8 only when a Profile has worries
  - starts O2 from the stage, O4 from the differentiation, O6 from O1, never over an answer
  - starts O4 from Performance & Innovation and Ecosystem & Integration through the nearest L1 options (Research 3, 5.2a; owner, 2026-11-08)
  - starts O4 from the buyer's outcome saved on Positioning before 2026-11-08 (O4 owns it now), through the crosswalk, after the differentiation's ticks (Research 3, 5.2a)
- **the Value Proposition's draft and open items (Questions 15)** (4)
  - writes the draft with the highest-rated goal and frustration, the form and the main benefit, and the clear opening
  - ends the draft with what the Offering stands out for: a value a Profile rates Essential that every Competitor is weak on (owner, 2026-11-09)
  - lists what is open: values, needs by id, worries
  - counts an unwanted benefit only from O4 ticks the user saved, not from its starting ticks (owner, 2026-11-08)
- **no question asked twice (owner, 2026-11-07: "avoid overlapping and repetition")** (1)
  - asks the terms in O3, leaves the payment terms out of O10, and lets O7 answer the Support worry
- **O2, O3, O10 and O18 from the research (2026-11-08)** (6)
  - starts O2 at Yes, now while launching
  - reads a saved A membership as A subscription / membership, and keeps A project or contract first for an invoice
  - says only the Organisation country's cancellation rule in O18's "i"
  - keeps every new point of O3 and O10 within 160 characters
  - starts O4 from Personal Service & Relationship with Personalisation and Support
  - drafts the new goals in their phrases
- **the Offering's boxes** (3)
  - asks O1 then O24 in Function, O8 then O4 in Customer Benefit (after the needs addressed), and O2, O3, O6, O20 to O22, then O15 in Purchase & Delivery
  - asks O24 of a physical product only where the activity code does not say what it is; None of these stands alone (Questions 10, stage 4)
  - points O8's and O15's "i" where the other question stands now
- **O16 and O17 held back while Planning** (2)
  - are not asked while Planning (an empty stage too) and are from Launching; a saved answer stays readable
  - names O17's repairs option "Repairs / maintenance", its id unchanged (owner, 2026-11-09)
- **O18 between businesses and O3's order from the settled pay** (2)
  - says on a business Segment that consumer cancellation rights do not apply, instead of the country's consumer rule
  - orders O3 by the Segment's settled pay: a stale invoice on a people Segment no longer puts A project or contract first
- **O6 and O7 are ticks (2026-11-09)** (4)
  - asks both as ticks with no limit, and reads a saved single answer as one tick
  - lets None stand alone in O7, as in O17
  - no longer offers It depends on the plan, but keeps a saved one shown and printed until it is unticked
  - counts any help but None as answering the Support worry
- **O6's follow-ups** (1)
  - asks O20 when it is posted, O21 when it is sent online, O22 for a live session, and keeps Other's words while Other is ticked
- **1.13, 2.11 and 2.13: the Offering's orders and starts** (3)
  - puts the Ongoing terms first for a fixed salary, Per session first for hourly or variable pay
  - orders O4 and O8 by the Profiles' ratings, the rest in their own order
  - starts O3t from O3: per session and a licence before they get it, commission when it is done
- **2.8: a batch's set-up is asked of a physical item only** (1)
  - asks it of a physical Product, not of a digital one

#### ProfileQuestions.test.ts (44)

- **the Profile's questions follow the Segment** (15)
  - asks one job question: the kind of work of a working B2C customer, the job level of a B2B one
  - reads the options merged on 2026-11-17: the job levels and the genders
  - sets a self-employed customer's job level to Owner or senior leader without asking it
  - starts the role in buying from the job level, and keeps a role the user chose
  - reads a job saved before 2026-11-03: a B2B kind of work as a job level, Owner as Manager / director
  - asks who they live with of B2C adults only
  - asks who they live with on the payer's Profile of a Segment with an end user (a parent buying for a child)
  - asks gender only where the Segment's mix leans, and starts it from the mix
  - asks the purchase part only for a business, a user, or minors, and ticks all five for a sole practitioner
  - clears an exact age that falls outside the Segment's age group and keeps one inside it
  - removes the answer of a question no longer asked
  - asks a business Segment's Profile about events, without the consumer's Market / pop-up (owner, 2026-11-08)
  - holds a limit, and keeps what is written under Other only while Other is ticked
  - starts the worry about price where the household income is Low, and the help from the comfort
  - asks the social media unless the Segment's online comfort is rated 1
- **a Profile is one person** (1)
  - writes the questions of a woman, of a man, or of a person
- **the Profiles proposed for a business Segment, by buying role** (3)
  - proposes one Profile with every role where one person decides
  - proposes a user and a decider for a team or a manager, and adds a checker or a buyer, never more than three
  - proposes nothing for people or before the question is answered, and not a Profile already added
- **Psychographics and Motivations ticked and rated (Questions 13, section 11)** (3)
  - holds the limits: what matters most up to five, goals, frustrations and worries up to three
  - keeps a tick's rating while it is ticked, and an existing tick starts unrated
  - prints each tick with its rating, the highest first, and an unrated tick after
- **the Emotional and Social needs ticked and rated (Questions 13, section 10)** (3)
  - asks a person's lists of a people Segment and a business buyer's of a business one
  - keeps three ticks and their ratings, and prints them with their ratings
  - merged options (owner, 2026-11-06): reads a merged frustration as the one kept, counted once, the higher rating kept
- **the needs the Value Proposition lists (owner, 2026-11-07)** (3)
  - lists each ticked need once, the strongest first, in its one word; ties keep the options' order
  - reads the business kind too, and a tick left unrated comes last
  - offers Proud among the feelings, with its meaning in the "i"
- **the functional jobs ticked above the Profile's own tasks (owner, 2026-11-07)** (1)
  - offers the five jobs of L17, up to three, rated Mild to Strong, each meaning within 160 characters
- **goals, frustrations and worries from the research (2026-11-08)** (5)
  - reads a saved Stay within the rules as Compliance, counted once, the higher rating kept
  - offers Enjoyment to a person's Profile only
  - renames Complexity to Hassle and Insecurity to Skills gap, keeping the saved ids
  - adds the worry Image, what others will think
  - does not ask how they compare options of a Segment that buys on impulse or when it urgently needs it; out of habit it asks, with no start
- **a Proxy or Dual-Intent Segment's Profile holds the buyer and the end user** (6)
  - splits the questions by who chooses and pays (the buyer) and who it is for (the end user), for Proxy and Dual-Intent alike
  - leaves a Direct Segment's Profile as it was: one person, every question in one part, no end user's own question
  - asks an adult end user's household, and follows the minors' rules: no household for a baby, a child or a teenager, no online comfort for a baby
  - keeps the buyer's saved answers as they were (no key changed) and reads the end user's own part beside them
  - starts the end user's part from the Segment's end-user answers: the outcome moved from the Segment (itself started from Positioning); a saved answer wins
  - prints both parts in the documents and the exports, and drafts the Value Proposition of the end user's goal and frustration
- **the Profile's devices question** (1)
  - stands first in Information & Shopping Habits, no longer in Social & Interest Hubs
- **a business Segment's end user** (1)
  - is offered Young adult to Mature only, and its Profile part holds the age to 18 to 64
- **the Profile's answers the Segment's education and end user shape (owner, 2026-11-17)** (1)
  - starts B1 at Safety for an end user in the early years; orders C4, C2 and A3 by education
- **1.3, 2.6 and 2.12: the Profile's starts from where the Segment discovers and what makes it shop** (1)
  - starts D1 from free samples (the ways the Offerings fit) and from media and reviews, D3 from seasons

#### SegmentQuestions.test.ts (39)

- **the Segment's questions** (19)
  - gives every question unique option ids and every industry a sector
  - asks a people buyer Boxes 1 and the B2C habits, and a business buyer Box 3 and the decision
  - skips the size of a self-employed organisation and asks one industry under its sector's heading, the sector its record
  - offers the age terms of the Positioning life stage, and drops education and income for minors
  - asks the kind of area from Planning, only for one place or one country
  - keeps invoicing for business customers
  - makes 'They don't typically share' exclude the other ways, and holds the limits
  - asks the user block only for a Proxy or Dual-Intent buyer, by relationship
  - settles the answers: what is no longer asked, or no longer offered, goes
  - does not show a question with one option left, and its answer is that option
  - starts the work situation from the age term, and leaves a chosen one alone
  - asks the non-working situation only when the person is not working
  - asks the working environment, schedule and income structure of someone who is working
  - starts the way of paying from where they buy: Digital wallets on a phone, and leaves a chosen way alone
  - reads an older saved work situation as working or not, and the situation
  - reads the options merged on 2026-11-17: four education levels, three ways of sharing
  - reads a saved answer: known questions and options only, one id for a radio
  - reads a degree saved before it became a rating as its point (Questions 12)
  - prints a rating with its point and, at an end, its word
- **what the answers above settle (asked of no one, answered for them)** (6)
  - makes freelancers self-employed with no size, and shows them no question about who decides
  - takes the sizes of the scale chosen, and offers a public body only for Enterprise or Public Sector
  - keeps the size a choice for a public body of Enterprise or Public Sector, which can be small (owner, 2026-11-08)
  - makes a self-employed customer decide alone
  - makes a retiree not working and retired
  - asks the user's school stage, work and tool comfort only where the user's age calls for them
- **who the questions are about** (1)
  - a direct buyer's customers are customers; a proxy buyer's boxes say buyers, the user's box says users
- **what is changing, the path to purchase and where they discover (2026-11-08)** (3)
  - adds Environment & climate to what is changing
  - reads Straight away as On impulse, its id kept, and adds habit and urgent need
  - offers Sales calls or tenders to business customers only
- **Box 4's order** (1)
  - asks Finding & Choosing (comfort, socialising, what makes them shop, how they share, where they discover, how they decide), then Buying & Paying
- **the questions held back while Planning** (2)
  - does not ask where they work, how they are paid or how they share while Planning (an empty stage too), and asks them from Launching
  - keeps a saved answer through a stage change back and forth
- **the follow-ups of Where do your customers usually shop?** (2)
  - asks Which marketplaces on a marketplace, Which shops in a shop or both, and neither online
  - keeps the marketplace written in under Other while Other is ticked, and reads it back as saved
- **an Other's list (owner, 2026-11-16 14:24)** (1)
  - shows one empty row to type in, keeps the rows as typed, and reads an old text once by its commas
- **where they discover: the traditional ways** (2)
  - puts the printed and in-person ways first for customers not at ease online, passing by for a city, the online ways for anywhere online; Other last
  - asks where they see adverts only where adverts are ticked; the answer goes with the tick
- **2.8: how they pay, from who decides; no payment service where they buy on a marketplace** (2)
  - starts Invoice or purchase order where a manager signs off or a formal procurement decides
  - asks for the payment services only where they do not shop on a marketplace

#### StrategyChoices.test.ts (7)

- **the Strategy page's choices** (5)
  - starts SW1 with the Segments' changes ticked and first, then follows what the founder saves
  - turns a change rated 4 or 5 into an Opportunity and 1 or 2 into a Threat, 3 into neither
  - starts SC1 from the fullest pair of quadrants, the first two lines counting double; only SO or WO early on
  - offers and starts SC2 by the stage and by PB8's reach
  - writes the Compass draft, a part with no answer left out (Questions 21, 2.4)
- **a Metric's unit** (2)
  - offers Number, Percentage and Currency only
  - reads a saved Custom unit as one of them, keeping any words in the Description

#### VisionChoices.test.ts (4)

- **the Vision's choices** (4)
  - keeps PB7's known ids, each once, three at most; PB8's one known id
  - shares the Segment's reach ranks, "Anywhere online" level with Worldwide (D21)
  - says the Segment's widest reach today, with its Segment
  - writes the Business Plan's sentence from PB7's phrases, joined with commas and "and", and PB8's

### src/framework/engine/export/ (1 file, 13 tests)

#### ExportRenderers.test.ts (13)

- **exporting the Foundation capability** (6)
  - Systems 1 (identity), 2 (brand), 3 (business) and 4 (strategy) each have no empty page (4 tests)
  - the custom pages carry their answers
  - the Funding Need table uses an em dash, not "n/a", for a $0 need's When
- **the Legal Entity's address, one box of lines** (3)
  - a saved Address 2, City and Postcode are read as the Address's next lines, and exported as its parts
  - an address with no second line is kept as it was
  - a sentence reads the City back from the address's lines, only where it can be told
- **a Partnership / Provider's Responsible in the export** (2)
  - is the one founder of a one-founder organisation when nobody is chosen; a choice is kept; several founders leave it empty until chosen
  - is empty when the Responsible tick is off, even for a one-founder organisation
- **Page 5's export, for Lumen & Loom Studio and for Quillfield Automation** (2)
  - gives the break-even and the exhaustion month the page gives (one test each)

### src/framework/engine/fields/ (1 file, 10 tests)

#### FieldKeys.test.ts (10)

- **field keys** (4)
  - keeps a key saved under the US spelling when its label is written in UK English
  - names a field by System, page and path, and reads the name back
  - keeps a segment holding / or : whole
  - turns a label into a segment
- **reading and writing by path** (1)
  - writes a copy along the path, sharing the rest
- **the field registry** (2)
  - lists a page's fields as they are recorded
  - knows a page's own sections without rendering it
- **a yes-or-no choice** (1)
  - is two choices that are each other's no
- **currentFieldKey** (1)
  - leads a key saved under a renamed label to the field's key now
- **a field's kind** (1)
  - is an answer unless it is a status, a link, a display setting, a name or a choice with its own not-yet

### src/framework/engine/financial/ (5 files, 132 tests)

#### Amounts.test.ts (9)

- **parseDecimal** (3)
  - reads a single separator as the decimal point, whatever follows it
  - reads both separators as an amount does: the last is the decimal point
  - gives nothing without a number, or with numbers glued together
- **parseAmount** (4)
  - reads amounts as founders type them
  - keeps its thousands reading for money
  - gives nothing where digit groups are glued by other characters
  - reads spaces between groups of three digits as thousands
- **a fixed currency in a label** (2)
  - is its symbol where that says which currency it is, else its code
  - follows the label, and the accessible name keeps the code

#### CalculatedLines.test.ts (37)

- **month positions** (1)
  - a date falls in a plan month, counted from the plan start
- **employer on-costs and insurance per employee (X3)** (4)
  - gross salaries x the coefficient: 6,000 at 25% is 1,500 a month
  - nothing while no coefficient is set, and it says so
  - no on-costs on owners' drawings
  - insurance per employee: the headcount x the amount, when a key-person card exists
- **channel fees, royalties and partner commissions (X4, X5)** (6)
  - the Channel Fee Table, by the card's name: Stripe on 100,000 of revenue and 4,000 orders is 2,800
  - a payment service's card with no price is charged from its fee row; with a price, still once (owner, 2026-11-15 16:37)
  - a card of no channel in the table uses its own rate, on the revenue of its Offerings
  - a royalty on sales: the revenue x the rate, the card's override first, then its price, then the default of the Global Settings
  - a partner commission follows the revenue of its Offerings and stops at its End date
  - finds the row of the table by the channel's name
- **depreciation and amortisation (X1, X2)** (7)
  - an asset bought before the opening wears from the Opening Date: 12,000 over 10 years is 100 a month, into COGS (it helps to make the offering)
  - an Infrastructure asset goes to OpEx; the card's own useful life beats the group's default
  - the services bundled into the asset are depreciated with it: an oven of 4,000 and an installation of 800 over 4 years
  - an asset with no useful life of its own or its group's is not depreciated, and it says so
  - an End date stops the line
  - an upfront franchise fee is amortised over the period the user gives, from the Opening Date: 20,000 over 8 years is 208.33 a month
  - a franchise fee with no period of its own takes the Global Settings' years for franchise rights: 10 by default, 20,000 is 166.67 a month
- **opening inventory (C14, X11)** (2)
  - the cash is a purchase before the opening, and it reaches COGS as units are sold: 8,000 of stock, 100 units a month at 2 is 200
  - never more than the stock held
- **which lines are written off at the opening (X12)** (1)
  - a Startup or Pre-Operating Expense before the opening is listed; a cost from the opening is not
- **income tax: Page 4's Plan Settings own the rate (Records 2, section 5.5.6)** (1)
  - is the Financial Foundation's rate, whatever the Global Settings hold
- **the forecast with the calculated lines** (5)
  - the balance sheet balances in every month, and the cash flow ties to cash
  - shows the calculated lines: on-costs, fees, depreciation and amortisation, the opening inventory sold, the accumulated start-up row
  - keeps the cash of the Startup Expenses in the months they fall
  - income tax uses the rate of Page 4's Plan Settings
  - without the calculated lines the forecast is as it was
- **the fees a subchannel pays (Questions 18, section 1.4; owner, 2026-11-14 12:00)** (4)
  - the defaults start from the checked rates, Stripe Terminal before Stripe, each country its own row (owner, 2026-11-15 15:10)
  - a row with no rate, or not available in the country, is never charged
  - a subchannel is matched by its own name, else by its expense cards' names
  - the fee on a sale: the sale x (commission + chargeback) + the fixed fee (Etsy on a £95 sale: about £10.18)
- **a share of revenue charged on each Offering's own revenue** (6)
  - 2% of A's 6,000 and B's 4,000 is 120 and 80, whatever the 70/30 shares say
  - with no shares saved, both carry the full rate
  - a channel's share of revenue: only what each Offering sells through the expense's own subchannels
  - fees follow where they pay (owner, 2026-11-17 09:09, option (a)): shares the revenue equally among the Purchase subchannels, none to Discover, and the uncovered own part to the payment services
  - fees follow where they pay: charges a fee on what is paid at its subchannel, a payment service never on a marketplace sale, a commission on its source
  - fees follow where they pay: with no fee at the Online Store, the payment service takes the Online Store's part too

#### ContingencyFunds.test.ts (10)

- **the Startup Contingency Fund (F2) and the cash to raise (F6)** (3)
  - 10% of a Total Pre-operational Budget of 44,000 is 4,400, and 15% is 6,600
  - the cash to raise is the budget + the contingency + the opening inventory, which is outside the contingency base: 44,000 + 4,400 + 8,000 = 56,400
  - with no Opening Date there is no budget before it
- **the Operational Contingency Fund (F3, F4)** (7)
  - takes the monthly OpEx of the lines that are OpEx from the opening
  - a target of 3 months of OpEx 4,000 is 12,000
  - months to reach the target: startup fund 4,400, OpEx 4,000, target 12,000 takes 64 months at 3%, 38 at 5%, 19 at 10%
  - startup fund 6,600 at 3% takes 45 months
  - nothing is set aside when the startup fund already equals the target
  - the fund starts at the opening with the startup fund and grows by the monthly share until it reaches the target (4,000 at 4% is 160 a month)
  - cannot be reached with no OpEx or no rate

#### FinancialModel.test.ts (37)

- **numbers written back as text** (1)
  - half a unit is never five hundred
- **percentages, counts and decimal-only boxes read as decimals** (3)
  - 12.500% is twelve and a half, 33.333% a third
  - three owners of 33.333%, 33.333% and 33.334% own it all
  - money saved as 1.200 or 12.500 keeps its thousands reading
- **months** (1)
  - Month 1 is the plan start; earlier months count as Month 1
- **cost consolidation** (3)
  - reads Legal Entity expenses and Page 3 costs, with their sources
  - the page's classification is laid over a read cost, within its limits
  - costs fall in the months their frequency says
- **recording costs once, and in the right shape** (5)
  - a Page 3 price per unit is a variable cost per unit
  - an 'Other' cost can be reclassified on Page 4
  - an old Other frequency on Page 3 is cleared (the card is incomplete till one is chosen) and its words are kept in the description
  - in-kind contributions are not cash
  - only significant obligations are listed
- **a possible duplicate needs a similar name, the same price and frequency, and the same source** (7)
  - the same name, price and frequency in the same section is flagged, with its text
  - the same name, price and frequency on two pages, named the same, is flagged
  - the same name with a different amount is not flagged
  - the same name and amount at a different frequency is not flagged
  - Trade mark registration £220 and Trade fair stand £3,000 are not flagged
  - similar names, same price, but unconnected sources (different pages, different names) are not flagged
  - name similarity is conservative
- **resource quantities** (2)
  - a count other than 1 multiplies the price; empty, 1 or 0 does not
  - a saved quantity that is not a number moves into the description
- **costs shared by Offerings** (2)
  - a per-unit cost is paid by each; a fixed one is shared out
  - an Offering saved before the list is still linked
- **the Legal Entity, read as the financial pages read it** (2)
  - capital of 10,000 is ten thousand
  - an organisation not yet registered can be complete without a date or numbers
- **the Brand Inventory is complete as its help asks** (1)
  - one icon and one logo, each an SVG or a PNG
- **Strategic Themes are optional** (1)
  - 1.4 is complete with a Strategic Period and no Themes
- **guards for figures saved before the limits** (7)
  - a loan of 999999 payments is repaid in at most 600
  - a negative interest rate charges no interest, never a negative one
  - periodic funding arrives at most 600 times
  - a negative milestone, cost or capital counts as nothing
  - an ownership share is read within 0 to 100%
  - items per order below 1 count as 1
  - items per order and months to normal stop at their limits
- **the financial plan's months in the Financial pages' titles** (2)
  - run from the Plan Start for the Plan Length
  - say nothing until a Plan Start is chosen

#### fundingAndPosition.test.ts (39)

- **funding** (4)
  - Expected ≠ Confirmed ≠ Available: the specification's grant
  - planned money is pending, not available
  - an equal-payment loan: payment, interest and the last payment clearing it
  - an interest-free, equal-principal loan divides evenly
- **financial position** (7)
  - the specification's gap: €20,000 needed, €15,000 confirmed
  - the operating need: running costs until revenue covers them
  - a one-time cost paid before the plan starts is not in it
  - a cost per order is shared by the items in an order
  - runway: €6,000 against €1,000 a month lasts six months
  - founders' capital is read from the Legal Entity as available
  - an other-currency cost stays out of the timeline
- **revenue and break even** (9)
  - a gradual build-up reaches the normal volume
  - month by month: each entry holds until the next
  - a split payment moves half of each sale to later
  - the specification's break even: ≈2.86 projects on €2,000 fixed
  - per-unit costs on Page 4 become the stream's variable cost
  - break-even time, exhaustion and the buffer between them
  - what-if: a higher price brings break even forward
  - zero revenue is a valid model, and exhaustion is still found
  - exhaustion before break even is a financial risk
- **fixes from the financial review** (8)
  - a loan charges interest from the month it is drawn
  - a first quarterly repayment one month after drawing carries one month's interest
  - periodic funding stops at its total
  - an annual cost first paid before the plan keeps its month
  - an annual charge: its cost per unit is spread with its price
  - an annual charge paid upfront arrives at the start of each year
  - a month-by-month stream has a normal level and breaks even
  - no revenue is not break even, even with no costs
- **the Loan Repayments note** (5)
  - a pending loan's repayments are not counted until it is approved
  - a confirmed loan's repayments are counted from their first month
  - a loan without a name is named by its type, and quarterly repayments say so
  - with no loan there is nothing to explain, and no column
  - the rule names where a pending loan's repayments are counted
- **the Workspace's optional Deposit** (5)
  - reads tolerantly: absent is none, and no line is gathered
  - flows once as a one-time Establishment Deposit line, at the plan's start, from Infrastructure → Workspace
  - SEVERAL Workspaces: each costs its own rent and deposit, the first keeping its old ids; the old single workspace is read as the first
  - only while the Workspace costs money, and the founder can still reclassify it
  - Lumen's £3,750 rent deposit is the landlord's, once: no manual 'Rent deposit' beside it
- **a funding source saved under Internal** (1)
  - is read under Other, its type, amount and status kept

### src/framework/engine/legal/ (4 files, 29 tests)

#### LegalFacts.test.ts (7)

- **the legal facts read from the activity code** (5)
  - say what a product is where the code does, in each scheme family
  - suggest the music licence for PPL PRS's sectors only, never online-only retail
  - read a regulated profession from the code, and leave it open without one
  - settle the personal details where the activity keeps more than staff, marketing and accounts
  - know a company form, for HSE40's family exemption
- **whether a registration date is asked** (2)
  - is not asked of a sole trader or a sole proprietorship in the six countries
  - is asked of a company, of no form chosen yet and of any other country

#### LegalStarts.test.ts (5)

- **the legal starts** (5)
  - make a UK limited company's filings, with the official fees, and PAYE once anyone is paid
  - make no incorporation fee once the company is registered, and nothing for a sole trader
  - make a New York LLC's state items and the federal EIN; every other state its own row's
  - make each item once, by its rule or its name, and never one the founder removed
  - leave the examples as they are: Lumen holds its UK set, Quillfield, a sole proprietorship, needs none

#### LegalSuggestions.test.ts (6)

- **the legal suggestions** (6)
  - say a US state's own sales tax registration where it sells goods, and send to the state's page only where its filings are not confirmed
  - find the month turnover passes a threshold, over 12 months or in one month alone
  - say Lumen's VAT is already registered, and suggest only what its answers leave open
  - say nothing for Quillfield, a New York sole proprietorship, a year on, and the fees' check once over a year old
  - ask employers' liability of a paid Staff card only, a contractor never, with HSE40's words for a limited company (GB11)
  - suggest the music licence where Lumen's Market / Pop-up channel holds public gatherings, with no question (GB18)

#### UsStates.test.ts (11)

- **US\_STATES rows** (2)
  - has 51 rows with unique codes, DC included, alphabetical by name
  - gives every row a checked date and at least one https source
- **usStateOf** (2)
  - finds a state by code or name, case-insensitive and trimmed
  - finds nothing for an empty or unknown subdivision
- **sales tax family** (1)
  - has no statewide sales tax in AK, DE, MT, NH and OR, and one everywhere else
- **publication family** (1)
  - asks for publication only where the research confirms it
- **biennial reporters** (1)
  - reports every two years in AK, CA (LLC), DC, IN, IA (LLC), NE (LLC), NM (corporation) and NY
- **fixed taxes** (2)
  - gives California the $800 fixed tax for both forms
  - leaves out the Delaware LLC annual tax, where official pages conflict
- **amounts** (2)
  - writes every amount as plain dollars in digits
  - marks every formation and publication fee as one time

### src/framework/engine/status/ (2 files, 12 tests)

#### PageStatus.test.ts (6)

- **page status** (6)
  - every page of every untouched System is not started
  - a page with some answers but a required one missing is in progress
  - a page is defined exactly when the validator has nothing to report on it
  - the Roadmap, which asks nothing, follows the Strategy pages it is drawn from
  - ids and untouched defaults are not answers; a word or a number is
  - a System is defined only when every page is

#### SectionStatus.test.ts (6)

- **section status** (6)
  - a columns page: each column not started, in progress or defined on its own
  - a bespoke page: a required section half answered is in progress
  - a saved legal-item "not applicable" tick is ignored, and VAT's old value reads as not registered
  - optional sections are never in progress for being empty, and defined with their page
  - a complete example page has every section defined
  - the Strategic Period's Themes, each from its own Goals and Objectives

## Saved data and examples: every test

11 files, 128 tests. They check how an Organisation is saved, read back and moved from older saves, and that the two example organisations (Lumen & Loom Studio and Quillfield Automation LLC) are complete and read the way the app reads them.

### src/data/ (2 files, 28 tests)

#### resourceIcons.test.ts (2)

- **the Resources' symbols** (2)
  - names a category's file from its words
  - has a symbol for each of the nine categories, and none for a founder's own

#### glossaryPlaces.test.tsx (26)

- **the Glossary's places** (26): every Glossary term points to a place that is really on its page.
  - segment → 3.1 a Segment's Description is on its page
  - profile → 3.1 a Segment's Profiles is on its page
  - competitor → 3.1 a Segment's Competitors is on its page
  - offering → 3.1 a Segment's Offerings is on its page
  - offering → 3.4 Revenue Streams is on its page
  - value-proposition → 3.1 a Segment's Value Proposition is on its page
  - positioning → 1.1 Core Market Positioning is on its page
  - positioning-statement → 1.1 Core Market Positioning is on its page
  - business-stage → 1.1 Core Market Positioning is on its page
  - opening-date → 1.1 the Organisation, Opening Date is on its page
  - b2c-b2b → 1.1 Core Market Positioning, Seller & Buyer Relationship is on its page
  - buyer-end-user → 1.1 Core Market Positioning, Seller & Buyer Relationship is on its page
  - direct-buyer → 1.1 Core Market Positioning, Seller & Buyer Relationship is on its page
  - proxy-buyer → 1.1 Core Market Positioning, Seller & Buyer Relationship is on its page
  - dual-intent-buyer → 1.1 Core Market Positioning, Seller & Buyer Relationship is on its page
  - differentiation → 3.1 a Segment's Competitors, Differentiation is on its page
  - outcome → 1.1 Core Market Positioning is on its page
  - capacity-utilisation → 3.3 Capacity & Delivery is on its page
  - conversion-rate → 3.2 a Segment's Customer Channels is on its page
  - referral → 3.2 a Segment's Customer Channels is on its page
  - repeat-rate → 3.2 a Segment's Customer Relationship is on its page
  - customer-lifetime → 3.2 a Segment's Customer Relationship is on its page
  - loan-repayment → 3.5 Funding, Sources, a loan is on its page
  - simple-interest → 3.5 Funding, Sources, a loan is on its page
  - vat-registration → 1.3 Registrations, VAT is on its page
  - sic-code → 1.1 the Organisation, Activities is on its page

### src/hooks/ (1 file, 4 tests)

#### useListAutoFormat.test.tsx (4)

- **useListAutoFormat** (4): typed and pasted lists become real bullets and numbers.
  - turns a plain '- ' at the start of a line into a real bullet
  - normalizes every '- ' line in a pasted multi-line block into real bullets
  - keeps a renumbered run sequential when Enter inserts a new item in the middle
  - keeps the cursor at the end of a pasted numbered block whose renumbering adds a digit

### src/services/ (9 files, 97 tests)

#### AppInstallService.test.ts (2)

- **AppInstallService** (2)
  - offers Install once the browser fires its install prompt, and opens the browser's dialog
  - reloads the page when no new version waits

#### GlossaryService.test.ts (3)

- **the Glossary's terms** (2)
  - reads your terms from the saved answers: the named cards, with their kind
  - gives every app term a meaning and cites only registered sources
- **the app's terms that have appeared** (1)
  - lists an app term once one of its pages holds an answer, and every term with no Organisation

#### IndexedDbStorage.test.ts (4)

- **the Organizations in IndexedDB** (4)
  - reads what was written, at once and after the app starts again
  - moves an earlier version's Organizations in from localStorage, and leaves the theme and the notes there
  - adds an Organization seeded in localStorage later to the ones already kept, by id
  - keeps the store's debounce and saved signal: saving, then saved once IndexedDB has it

#### LocalOrganizationStore.test.ts (8)

- **LocalOrganizationStore** (8)
  - collapses a burst of writes into one, after the debounce, while reads see the latest at once
  - writes everything pending at once on flush
  - flushes when the page is hidden or left
  - reports saving, then saved, to subscribers
  - surfaces a full store as an error, keeps the edit, and recovers on the next successful write
  - names any other failed write as unavailable storage
  - never resurrects a removed document from a pending write
  - parses a saved Organisation once, and again only when the stored text changes

#### OrganizationService.test.ts (7)

- **Organisation format version** (6)
  - reads a document without a version as version 1, and a stamped one as its own
  - writes version 3 into every saved document
  - reads a version 1 document, and saves it back as version 3
  - exports version 3, also for a document last saved as version 1
  - imports version 1, 2 and 3 files, saving all as version 3
  - refuses a file from a newer format with a clear error, and adds nothing
- **The last place worked** (1)
  - is stored with the organisation, and saved only when it changes

#### ProgressService.test.ts (5)

- **Continue where you left off** (5)
  - goes back to the last page while it is not yet defined
  - moves on to the System's first page not defined once the last page is
  - offers the next Foundation System, in order, once this one is defined
  - shows nothing once every Foundation page is defined
  - shows nothing when nothing has been worked on, or the place is gone

#### cardServices.test.ts (3)

- **the card notes › the card notes** (1)
  - gathers the Notes text of every card on a page, whatever the list it is in
- **the card notes › the Brand's card notes** (1)
  - names a colour, a typeface and an image by the id their card is opened by
- **the card record › the record time of a card** (1)
  - is set the first time it is asked for, kept in the organisation's document, and does not change

#### examples.test.ts (51)

- **the examples are complete** (8): for each example, four tests.
  - leaves nothing in the Review
  - its key dates: has the plan's start, the opening and the ends of the stage windows, in time order
  - on the Calendar: marks the key dates, the opening among them, as one kind of date
  - its channels: names every subchannel and answers every channel its answers suggest
- **the examples match the code that reads them** (21)
  - for each example, one test per page: keeps 1.3 Legal Entity, 1.4 Founders Profile, 2.2 Brand Style, 3.1 Business Foundation, 3.2 Customer Engagement, 3.3 Infrastructure & Capability, 3.4 Revenue & Pricing, 3.5 Costs, Funding & Position, 4.1 Situation & Direction and 4.2 Goals & Objectives as the app reads it (20 tests)
  - updating the examples: writes the examples as the app reads them (skipped: a tool run only when asked, which rewrites the example files)
- **the examples in the browser › Reload refreshes the saved examples** (3)
  - replaces the copy that has the example's id, keeping its name and creation time
  - replaces an imported copy too (a new id, the example's name)
  - brings back no example that is not among the saved ones
- **the examples answer the Segment's questions › the example Lumen & Loom Studio** (10)
  - keeps its Positioning answers at the manage stage
  - keeps its Positioning answers at the grow stage
  - answers every question asked of London Homemakers, and nothing else
  - answers every question asked of Designers & Boutique Hotels, and nothing else
  - answers the Profile The Considered Nester with answers that stand against its Segment
  - answers the Profile The Hands-On Hobby Learner with answers that stand against its Segment
  - answers the Profile The Eco Interior Designer with answers that stand against its Segment
  - keeps the notes of The Considered Nester to what its choices do not say
  - keeps the notes of The Hands-On Hobby Learner to what its choices do not say
  - keeps the notes of The Eco Interior Designer to what its choices do not say
- **the examples answer the Segment's questions › the example Quillfield Automation LLC** (9)
  - keeps its Positioning answers at the plan stage
  - keeps its Positioning answers at the launch stage
  - keeps its Positioning answers at the manage stage
  - keeps its Positioning answers at the grow stage
  - answers every question asked of NYC Service Firms, and nothing else
  - answers the Profile The Busy Ops Manager with answers that stand against its Segment
  - answers the Profile The Agency Founder with answers that stand against its Segment
  - keeps the notes of The Busy Ops Manager to what its choices do not say
  - keeps the notes of The Agency Founder to what its choices do not say

#### olderAnswers.test.ts (15)

Each heading is a change to how answers are saved; the tests check that an older save is moved to the new shape once, and nothing else changes.

- **an income tax rate saved in the Global Settings** (3)
  - gives a plan with no basis the rate, and takes it out of the Global Settings, once
  - keeps a plan's own basis, and makes a plan answer where there was none
  - changes nothing where no rate was saved
- **the two Financial pages saved in the old order** (3)
  - moves an old save's two answers whole, each to the other's Section, and keeps the reader on the same page
  - runs once: a save already in the new order is left as it is
  - moves a page answered alone, and an organisation with no Business answers only takes the flag
- **an Offering removed before the Business System is saved** (2)
  - unticks it on every card that pointed at it, and nowhere else
  - changes nothing when no Offering was removed
- **the Segment starts saved before they followed their source** (1)
  - takes out each copy equal to its start, keeps a changed one and every other answer, once
- **the Segments made from the Identity answers** (5)
  - marks the first Segment, and the second where Positioning chose both people and businesses, once
  - marks only the first where Positioning chose one kind of customer
  - reads "both", as the Legal Entity's reader does
  - runs once: a Segment moved or removed afterwards keeps what it is, by its id
  - keeps the mark through the reader; a new Segment the user adds has none, the one a Foundation always has is the app's
- **a notepad saved before a field was renamed** (1)
  - leads its links to the fields as they are now

## Whole pages: every test

10 files, 115 tests. Each one draws a whole screen of the app, as the person sees it, and presses, types and moves around it.

### src/pages/ (10 files, 115 tests)

#### Conversation.test.tsx (21): the interview screen

- **Conversation Escape** (3)
  - closes the Strategy confirmation and stays on the page
  - offers Focus on an interview page only, and in focus mode leaves it before leaving the page, after a dialog has closed
  - goes Back to the current System's capability after a cross-System jump
- **Conversation records the last place worked** (10)
  - records the System and page once the interview shows, and the card a field is focused in
  - has no Sections rail on a page of tiles; the tile carries the column
  - draws Founders & Ownership and Registrations & Expenses on Definition, each saved in the Legal Entity's answer as before (owner, 2026-11-09 and 2026-11-20)
  - draws Purpose as three pair tiles, Mission & Vision saved in Definition under its own keys (Questions 9)
  - turns the page with the arrows above the rails and with ← / →, back to the Introduction from the first page
  - keeps the page while typing: ← in a box of the Identity System's one page stays there
  - lists the Introduction first on the Pages rail, unnumbered and with no status, and opens it from there
  - starts the interview at its first page, whichever page was last open
  - opens the interview itself, at the page, when continued
  - opens the Identity System's one page when continued at the Legal Entity
- **A System's opening screen** (7)
  - shows a Foundation System's guiding question, pages, what it uses from earlier and its thinking time
  - names each page in bold in the introduction, without repeating the question
  - opens the interview at a page named under What it covers
  - offers Start Interview under the content as one arrow-shaped button, with no separate arrow; → starts it too
  - is titled as a page is: the System, then the separator and Introduction in the page-title weight
  - says the Identity System is the starting point
  - shows only what another System's content has
- **3. Infrastructure & Capability folds its guidance per title** (1)
  - has no Hide Help button: each column title has its own arrow, the guidance hidden to begin with; other pages keep their button

#### ExportFlow.test.tsx (5): the Export dialog

- **ExportFlow** (5)
  - draws nothing while closed
  - lists the empty answers under their page, and Cancel and Continue do their part
  - waits for a Capability name and a format before it exports
  - writes the Markdown on Export and closes
  - starts the Operations picker again from All Processes each time the dialog opens

#### GlobalSettings.test.tsx (11): the Global Settings screen

- **opening Global Settings** (1)
  - opens from the header button, and returns to where it was opened from on Escape
- **the Global Settings screen** (7)
  - shows the starting values and lists the figures of the cost model
  - saves a figure at once, kept to what a number box takes
  - keeps the contingency rates: 10% for the startup fund and 4% for the operational one to begin with
  - lists only the groups that hold an asset
  - draws the Channel Fee Table's rows from the channels alone: no row while no channel names one, no add and no x (owner, 2026-11-15 16:37)
  - resets the Channel Fee Table after asking (owner, 2026-11-15 15:54)
  - is kept for the Organisation it belongs to
- **the Business stages of the Global Settings** (3)
  - lists the four stages with their durations, Planning, Launching and Managing in months, Growing in years, and the defaults to start with
  - takes whole numbers only, keeps them, and resets one stage or all
  - highlights the stage the business is in today, from the Opening Date, and says the rest in the "i" of the title

#### Landing.test.tsx (6): the Landing page

- **Landing import of an Organisation file** (2)
  - says plainly that a file from a newer version cannot be imported
  - imports a version 1 file as before
- **Landing reload** (2)
  - offers a Reload tool in the header that reloads the app view and keeps the data
  - refreshes the saved examples from the current example files, and no other Organisation
- **Landing header Workbook** (1)
  - shows the Workbook, the one button of every header, and it opens the Review of every Organisation
- **Landing user name** (1)
  - has no label above the box: the words inside it say what is asked and why, and name it for a screen reader

#### Review.test.tsx (6): the Review

- **opening Review** (2)
  - opens from the header Workbook on its Review tab and stays; pressing the Workbook again there does nothing
  - returns, on Escape and on Back, to where it was opened from
- **Review across Organisations** (4)
  - shows only the open Organisation, open, with no heading of its name: the header says it (owner, 2026-11-05 and 2026-11-09)
  - the total review has every Organisation, each open with its count; Go there selects the other one first
  - the total review has the Landing page's header, not the selected Organisation's
  - says a count once: a group's count that repeats the Organisation's is left out, and the Capability's sub-head shows only where a group spans several

#### SystemSelection.test.tsx (7): choosing a Capability and a System

- **SystemSelection capability description and System opening** (2)
  - selects a capability on click and opens its description dialog, which Escape closes first
  - opens a System immediately, with no confirmation step
- **SystemSelection capability memory** (2)
  - starts with the capability passed back in router state
  - starts with nothing selected when no capability is passed
- **SystemSelection continue where you left off** (3)
  - offers one line back to the last place worked, and opens it there
  - is hidden when nothing has been worked on
  - is hidden when the place no longer exists

#### Workbook.test.tsx (19): the Workbook, Glossary and References

- **the Glossary** (5)
  - lists the app's terms and yours, each kind in its own colour, A to Z
  - shows either kind, or both, through the funnel
  - has ONE funnel: the kinds of term first, then the letter ranges
  - cites an app term in the Harvard style, and the citation opens its full reference
  - shows the References under the letter ranges ticked in their funnel
- **the References' letter ranges** (4)
  - cut today's 27 references into A–I (15) and K–Z (12)
  - make three ranges of 45 references, about 15 each, from A to Z
  - never split one letter between two ranges
  - returns on Escape to where it was opened from
- **the Glossary's titles** (1)
  - carry an i with what the page is and how to read it, at most three points of 160 characters
- **the Workbook, a whole page (owner, 2026-11-09)** (9)
  - opens from the header's Workbook on the Business Documents, the tabs in a report's order, the Card Notes last (owner, 2026-11-10)
  - opens from the Landing page's Workbook (the same button) with the Landing's tabs: the total review, the Glossary and the References
  - leaves the Notes tool as it was: opening the Workbook does not close its side panel
  - filters the total review by Organisation: all ticked at first, one ticked off leaves its review out (owner, 2026-11-09)
  - has no Organisation funnel on one Organisation's review (the header's Workbook)
  - is drawn as a dialog of the app: the title over its rule, the sections in one framed panel with arrows and a tab of bullets (owner, 2026-11-09)
  - lists every Organisation's terms in the Landing page's Glossary, each named, under the one funnel
  - lists the open Organisation's terms alone, with no Organisation in the funnel, inside an Organisation
  - keeps the old addresses: /glossary, /review and /documents open the Workbook on their section

#### examplePages.lumen.test.tsx (19) and examplePages.quillfield.test.tsx (18): every page of both examples, against a saved picture

Each test draws one page of an example organisation and compares it with the saved snapshot (src/pages/\_\_snapshots\_\_/, one snapshot file for each example), so any change to what a page shows is noticed.

- **Lumen & Loom Studio** (18) and **Quillfield Automation** (18), the same 18 pages each:
  - Identity System › 1. Definition, 2. Purpose, 3. Legal Entity, 4. Founders Profile
  - Brand System › 1. Ambassador, 2. Style
  - Business System › 1. Foundation, 2. Customer Engagement, 3. Infrastructure & Capability, 4. Revenue & Pricing, 5. Costs, Funding & Position
  - Strategy System › 1. Situation & Direction, 2. Goals & Objectives, 3. Roadmap
  - Operations System › 1. Handbook, 2. Process Library, 3. Operational Log, 4. Roles & Responsibilities
- **the Financials page** (1)
  - draws one chapter of three Master Tiles that ask, each after what it reads (Questions 20, section 14: Cash Flow and Break-Even & Sustainability are records, in the Workbook)

#### segmentPage.test.tsx (3): the Segment page

- **Foundation & Engagement** (3)
  - shows the first Segment as one chapter of its seven tiles, and draws the other hidden
  - opens on the same page from either section, as a note or link to Customer Engagement does
  - shows a hidden Segment when a jump reaches a part of it

## Design system and docs: every test

18 files, 116 tests. They hold the docs to the code (every name and number a doc gives must exist in the code), the design library to its own rules, the stylesheets to their tokens and contrast, and the house rules on the app's text.

### src/docs/ (4 files, 17 tests): the docs agree with the code

#### documentAssets.test.ts (2)

- **the rulebook's section on the assets** (2)
  - is the block written from the contracts
  - has a part for every asset, with its numbers and its findings

#### documentReferences.test.ts (8)

- **the documents' references** (8)
  - read the code (the check is not run on nothing)
  - find a name the code lacks
  - take a family of properties (--theme-) as found when one starts with it
  - docs/ai/09-layout-rules.md names only custom properties, classes and files the code has
  - docs/specifications/03-business-system/04-infrastructure-and-capability.md names only custom properties, classes and files the code has
  - docs/design/foundation/01-current-design.md names only custom properties, classes and files the code has
  - docs/design/foundation/02-card-structure.md names only custom properties, classes and files the code has
  - docs/ai/08-card-kinds.md names only custom properties, classes and files the code has

#### documentValues.test.ts (5)

- **the token values of the documents** (5)
  - read the stylesheets (the check is not run on nothing)
  - work out var() and a calc() of plain numbers, and take the base value, not a reading mode's
  - find the token rows of a table and a number that differs
  - hold in the rulebook: every plain number in a token row is what the code gives
  - compare a good number of rows

#### testsGuide.test.ts (2)

- **the tests guide** (2)
  - lists every test file under its folder, and only those
  - says how many test files there are

### src/library/ with its subfolders (8 files, 46 tests): the design library

#### componentTokens.test.ts (4)

- **the component tokens** (4)
  - are what the library says: the generated stylesheet is the library's, token by token
  - hold the sizes of the owner's decisions: a cell 44, a box button 32, a mark 24
  - have the corner steps the app's own token file holds (the app does not import the library, so it carries the three numbers itself)
  - are read by the stylesheets and written by none of them

#### contract.test.ts (11)

- **the asset contracts** (11)
  - names every asset once and gives it a variant, a state and a contrast need
  - lists only custom properties its stylesheet reads
  - gives the label arrow the shape its stylesheet draws
  - gives the plus box the sizes and the swap its stylesheet draws
  - gives the info note the disc, the hit area, the gap and the page-3 stroke its stylesheets draw
  - gives the remove x the size, the stroke, the bars and the swap its stylesheet draws
  - gives the in-cell x its 24px target, no frame, the X in red, the growth of a fifth with a soft glow, the ring and the reduced motion (owner, 2026-11-14 12:29)
  - gives the rails the gaps, the growth, the rings and the wide breakpoint their stylesheet draws
  - gives the back button the arrow, the gaps and the rail form its stylesheets draw
  - gives the fold arrow the size, the stroke, the triangle and the focus its stylesheets draw
  - gives the dropdown the steps, the list and the options its stylesheets draw

#### floatingCard.test.ts (5)

- **the floating card base's contract** (5)
  - exists and lists its sizes by screen class and its parts top to bottom
  - has the sizes the stylesheets give: every size row with a property is that property's value in every class
  - names, in its parts, gaps that are the properties' values
  - keeps its geometry equal to its size table
  - names the WCAG 2.2 criteria that apply

#### data/library.test.ts (6)

- **the assets library** (6)
  - is sound: unique coded assets, described variables, variants that edit their own asset, requirements and placements that exist
  - holds the owner's split of the buttons: the x and the plus are one asset, the i is another
  - has the families of the owner, every component in a group, and the frame with its variants
  - says what kind every component is, and where each variant belongs
  - has every category, and no asset twice
  - builds fields from components and cards from fields

#### inventory/inventory.test.tsx (4)

- **the inventory** (4)
  - has a part for every component, tile and frame asset of the library, and for each of their variants
  - draws no part for a code the library does not have
  - builds every component, tile and frame, and each variant, without a failure
  - builds every field from its components, and every card from its fields

#### logs/diff.test.ts (6)

- **the log difference** (6)
  - has no change when nothing changed
  - case 1: a new asset, placed: both logs, with where
  - case 2: an existing asset placed, moved, and removed: the library log states where
  - case 3: a component placed without the library: the app log only, marked not in the library
  - logs an edit of an asset, naming the fields that changed, and a table row change in the app log
  - logs every asset as added from an empty state

#### model/check.test.ts (7)

- **the library checks** (7)
  - accepts a sound library, and the x and the + as variants of one asset
  - rejects a malformed or repeated code
  - keeps every asset unique by category and name
  - rejects letters that are not the category's kind
  - needs every variable and value named and described
  - keeps a variant inside its asset, numbered in order, with values of the asset's variables
  - rejects a requirement or a placement that points at nothing

#### tables/tables.test.ts (3)

- **the tables of the app** (3)
  - has every table, each with rows and with unique ids that start with its code
  - points from each table to an id that exists in the table above it
  - holds the four Foundation systems and the three parts of the app

### src/styles/ with its subfolder (4 files, 47 tests): stylesheets and colour tokens

#### layers.test.ts (1)

- **the layers' order** (1)
  - stacks the page's rails, a title's help, the Calendar, Notes and the header in that order, and the header's Menu above the side panels

#### lintStyles.test.ts (11)

- **the style lint's rules** (7)
  - finds a colour literal in any property, and not one built from tokens
  - never reads a comment
  - accepts a corner that is a token, zero, a circle or a pill, and finds a px literal
  - accepts a gap that is a token, zero or normal, and finds a px, em or vw literal
  - accepts a query of the catalogue and finds one outside it
  - skips the generated files
  - compares with a baseline: more of a known value or a new value is new; fewer is gone
- **the stylesheets** (3)
  - are all read (the lint is not run on nothing)
  - hold no colour, corner, gap or breakpoint literal beyond the baseline
  - keep the baseline tight: it lists nothing the stylesheets no longer hold
- **the one underline** (1)
  - is set in one place only

#### looks.test.ts (29)

The contrast tests run once for each reading mode: light, dark and sepia.

- **the second colour of a patterned action mark** (4)
  - keeps the second colour and every hue's ink at 3:1 on the surface (--bg-surface): light, dark, sepia (3 tests)
  - is a stripe (4px bands at 45 degrees) and a cross-hatch of it, read as --tint-fill
- **the button colour family** (5)
  - is the app's blue out on the page
  - is set by a Segment, Theme or section card from its palette colour
  - is set by the Completed group in its grey
  - is what the outlined buttons read, at rest and under the pointer
  - leaves no page colouring an add button of its own
- **the neutral card ground** (4)
  - keeps every card text at 4.5:1 on it, and differs from the white boxes: light, dark, sepia (3 tests)
  - is the ground of every neutral card
- **the completed grey** (4)
  - holds its head text at 4.5:1 on its grounds: light, dark, sepia (3 tests)
  - draws the group's head and its cards from the family (the done tag is no longer drawn: no screen renders it)
- **the drag hand** (2)
  - is drawn, sharp at 1x and 2x, with the browser's hand as the fallback
  - reaches every grip, and no rule falls back to the bare keyword
- **the financial label-and-amount lists** (2)
  - space their rows by --space-field, in one rule
  - put each amount on the first line of its label
- **the Capability and System row highlight** (3)
  - is one rule for all four kinds of row
  - leaves no list its own highlight colour
  - draws every row's text through the list ink, and gives each theme its highlight
- **one tick box** (3)
  - gives every checkbox one fixed size that a wrapping label cannot squeeze, beside its label's first line
  - leaves no checkbox a size of its own
  - underlines a tick-box option's words under the pointer, and gives its box a field's hover
- **a tick box's click area** (1)
  - is only the box and its words: the label is as wide as they are
- **a radio's reaction** (1)
  - reacts under the pointer as a tick box does: its words underlined and the round's glow ring

#### tokens/tokens.test.ts (6)

- **the generated colour files** (6)
  - colors.generated.css is what tokens.ts produces
  - sizes.generated.css is what tokens.ts produces
  - tokens.dtcg.json is what tokens.ts produces
  - contrast-report.md is what tokens.ts produces
  - holds every pair of colours that meet at its ratio, in every reading mode
  - reads every seed of every mode as a plain colour

### src/test/ (3 files, 7 tests): house rules and the layout probe

#### layoutProbe.test.ts (4)

- **the layout probe's rules** (4): the rules the layout check (npm run check:layout) measures with.
  - counts two measures as equal within the tolerance, and a hundredth over for rounding
  - groups boxes whose tops are close into one row, top to bottom
  - lists the distinct values in use, the commonest first
  - names the controls of a column whose left edge is not the first's

#### noEmDash.test.ts (2)

- **no em dash in the app's own text** (2)
  - keeps the title separators it allows where they are
  - finds no sentence em dash in the source or the content

#### noFixedPageNumbers.test.ts (1)

- **the app's texts** (1)
  - name a page or a chapter by its name, never by a fixed number

## Content files: every test

1 file, 63 tests. The one file reads the Markdown files in src/assets that the app's pages are built from, and checks that they agree with each other.

### src/framework/parser/ (1 file, 63 tests)

#### contentRelations.test.ts (63)

- **dynamic field links** (12): every Dynamic Field names a System, Section and Column that exist.
  - finds the links to check
  - system-answers/14\_DataGovernanceSystemAnswer.md:23 (Data Inventory: Data Asset) resolves
  - system-answers/17\_FinanceSystemAnswer.md:15 (Business System / Revenue & Pricing: Revenue Streams) resolves
  - system-answers/18\_StakeholderSystemAnswer.md:23 (Stakeholder Categories: Category) resolves
  - system-answers/18\_StakeholderSystemAnswer.md:35 (Stakeholder Register: Stakeholder) resolves
  - system-answers/18\_StakeholderSystemAnswer.md:47 (Stakeholder Register: Stakeholder) resolves
  - system-answers/18\_StakeholderSystemAnswer.md:59 (Stakeholder Register: Stakeholder) resolves
  - system-answers/21\_SocialMediaSystemAnswer.md:27 (Audience Profiles: Name) resolves
  - system-answers/22\_Metrics&ReportingSystemAnswer.md:23 (Performance Areas: Performance Area) resolves
  - system-answers/23\_QualitySystemAnswer.md:23 (Quality Standards: Quality Area) resolves
  - system-answers/23\_QualitySystemAnswer.md:35 (Quality Standards: Quality Area) resolves
  - lists no fixed link as known
- **shared field suffixes** (2): the shared Field names used in the files are registered.
  - reads the registry
  - name only registered Fields
- **Answer, Questions and Help files** (49): every System has its three files, and they list the same Sections.
  - every System has all three
  - for each of the 24 Systems (01 Identity to 24 Improvement), two tests: "Questions list the same Sections" and "Help lists the same Sections, or says it is absent"
