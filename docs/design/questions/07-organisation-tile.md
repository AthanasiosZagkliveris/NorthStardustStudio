# 7. The Organisation tile: every field and option, as built

Status: **specification**, written 2026-11-01, updated 2026-11-21. Every field of the Organisation tile (Identity System, page 1, the tile before Early Positioning) in the order it is asked, with its control, when it is asked, its options, what its "i" says and what it connects to.

Related: Questions 8 (Early Positioning, the next tile, in the same form), Questions 12 (the Segment's questions), Questions 2 (8.5 the tile as designed; 8.2a the stage, the Opening Date and the key dates), Research 3 (the countries, the activity cascade and the codes), Questions 4 (the first version: six countries and Other), `src/components/interview/editors/legal/`.

**The tile** is one dialog of two columns with a divider: the left one is where the organisation is (name, country, address), the right one is what it is and does (legal form, dates, activities); the Notes stand under both. Controls are the existing ones (text cell, `OptionPicker`, date cell, `ActivitiesField`, the shared optional note). A field that depends on the country waits for it: it is frozen, with a hint saying what to choose first, until the country is chosen. **Connections** are named as in Questions 12: *Comes from* is what the field takes from another answer; *Read by* is what reads it (built, and not built yet).

## 1. The left column: where the organisation is

### 1. Organisation Name

- **Control:** a text cell. Placeholder: "The legal name of the organisation".
- **Asked when:** always.
- **The "i":** none.
- **Connections:**
  - *Comes from:* nothing.
  - *Read by (built):* the page's titles and the organisation's name across the app, the documents and the exports.

### 2. Country

- **Control:** one choice (the existing picker).
- **Asked when:** always. It comes first because it decides the registry, the tax, the legal forms and the classification of the activities.
- **Options:** the six countries of the first version, in alphabetical order (Australia, Canada, Ireland, New Zealand, United Kingdom, United States), then Other.
- **The "i":** none.
- **Connections:**
  - *Comes from:* nothing. Changing it empties what depends on it (the state or region, the legal form, the activities).
  - *Read by (built):* the legal forms offered, the registry and the registration fields, the tax name, the currency, the activity classification and its code, the address lines' wording; the Legal Entity's tiles, the financials, the Review, the Calendar and the exports.
  - *Read by (not built yet):* the Segment's first customer question and the lists by country (Questions 2, 8.2, "What the Segment will read").

### 3. Other country

- **Control:** one choice (the picker, searchable, with aliases such as "UK" and "USA").
- **Asked when:** Country is Other.
- **Options:** every country but the six.
- **The "i":** none.
- **Connections:** as Country; for these countries the legal form is one of the four generic forms and the activity and its code are typed.

### 4. State or Region

- **Control:** one choice (the picker, searchable; its label is the country's own word, for example State, Province or Region).
- **Asked when:** the country has a subdivision that changes an answer: which registry, whether a consumption tax applies. Not for the countries where it changes nothing. Frozen until the country is chosen.
- **Options:** the country's subdivisions, then Other.
- **The "i":** none.
- **Connections:**
  - *Comes from:* the country.
  - *Read by (built):* the registry, the tax and, where it applies, the legal forms.

### 5. Address

- **Control:** a text box of several lines (at least two, growing with the text). Placeholder: the lines expected, in the country's words (the city, then the street and the country's postal code name, or the street alone where addresses carry no code).
- **Asked when:** a country is chosen and, where the country has a State or Region, that is chosen too (frozen until then, with a hint saying which to choose first).
- **The "i":** none.
- **Connections:**
  - *Comes from:* the country (the placeholder).
  - *Read by (built):* the exports and the documents (the registered address). *Not built yet:* the Segment does not read it (an address in free text cannot start where the customers are).

## 2. The right column: what it is and does

### 6. Legal Form

- **Control:** one choice (the picker), the country's own forms; where a country has no list of its own, the four generic forms (Questions 4). The list has no Other entry; a legal form saved earlier as Other still shows, with its typed name (field 7).
- **Asked when:** a country is chosen (frozen until then).
- **Options:** the country's legal forms (Research 3), or the four generic forms.
- **The "i" says:** Decides who is liable for the organisation's debts: the organisation, or you personally. Decides how it is taxed, and whether it must hold share capital.
- **Connections:**
  - *Comes from:* the country.
  - *Read by (built):* the Name the legal form field; the tax, the Founders' capital question and the Legal Entity's tiles; the documents and the exports.

### 7. Name the legal form

- **Control:** a text cell.
- **Asked when:** the saved legal form is Other (an answer from before the list lost its Other entry); not asked of a new answer.
- **The "i":** none.

### 8. Registration Date

- **Control:** a date cell.
- **Asked when:** always, except where the legal form is a sole trader or a sole proprietorship in the six countries: then it is not asked, not required and not checked (`registrationDateApplies`; see the note "Built on 2026-11-01" below). It cannot be later than today (the cell's limit), nor later than the Opening Date (an alert under the dates on the tile says so).
- **The "i" says:** The day the organisation was registered with the registry of its country. It is today or earlier, and on or before the Opening Date: the company exists before the business opens.
- **Connections:**
  - *Comes from:* nothing; it is checked against the Opening Date. It is saved with the Legal Entity's formation.
  - *Read by (built):* the plan's start (the legal expenses), the key dates on the Review and the Calendar.

### 9. Opening Date

- **Control:** a date cell.
- **Asked when:** always. It can be changed at any time.
- **The "i" says:** The day the business opens and issues its first receipt. It sets the stage: planning before it, launching from it. The stage also sets Positioning's name and how many choices its questions allow; a change of stage empties an answer over the new limit. Costs dated before it make the pre-operational budget, on the Financial Foundation.
- **Connections:**
  - *Comes from:* nothing (it is saved with the Global Settings).
  - *Read by (built):* the business stage (Planning, Launching, Managing, Growing) and so the name and the limits of Early Positioning (Questions 8), the number of Segments, the questions the Segment holds back; the financial plan's pre-operational period; the key dates on the Review and the Calendar.

### 10. Activities

- **Control:** up to four rows, each the existing activities field (a cascade of dropdowns for the six countries, ending in the country's official code; typed activity and code for Other). The first row is the primary activity; the app requires no row: the Organisation section counts as complete only once the main activity is given (Notes, field 11).
- **Asked when:** a country is chosen (frozen until then).
- **The "i" says:** The first is the primary activity; add others, up to four in all. Each one ends in one official code of your country (the code of its classification scheme); for Other the activity and its code are typed.
- **Connections:**
  - *Comes from:* the country (the classification scheme and its edition).
  - *Read by (built):* the exports and the documents (the activities line).
  - *Read by (not built yet):* the industry pack's examples and the Segment's name suggestions (Research 3, 5.6); it never fills the Segment's industry, which is the customers', not the seller's.

## 3. Under both columns

### 11. Notes

- **Control:** the shared optional note: a tick and the word, the box opening on ticking. It saves the page's Description.
- **Asked when:** always. The Organisation section counts as complete only once the main activity (`organisation.mainActivity`) is given; the box the user sees for it is this Notes box, which shows the main activity until the page's Description is written.
- **The "i" says:** Who are you, and what do you do? What do you create or provide? Write it as a registry or a bank would expect to read it.
- **Connections:**
  - *Read by (built):* the Business Plan's company description and the exports.

**Built on 2026-11-01 (owner's decision):** (1) the empty Country picker shows the country the browser suggests as a soft hint ("Select a country, for example United Kingdom"), from the language's region, else the time zone, for the six countries only; it is never chosen for the user (`BrowserRegion.ts`); (2) the Registration Date is not asked, not required and not checked where the legal form is a sole trader or a sole proprietorship in the six countries (`registrationDateApplies`); what is already saved stays.

The Founders' questions (the capital tick, each founder's roles, hours and contribution) belong to the next tile of the page, not to this one.

## 4. The layout, the Review and the wording: the design and its reasons

(Moved here from Questions 2, sections 8.5, 8.6a and 8.6, on 2026-11-21: the tile's design and its reasons stand with what was built. The sub-section numbers are Questions 2's, so a citation such as "Questions 2, 8.5" finds its text here.)

### 8.5 The Organisation tile (page 1): layout

> **As built: Questions 7** lists every field of the tile. This section keeps the layout decisions and what was built with it.

Settled with the owner on 2026-10-23; **built 2026-10-24 and 25.** The Organisation is the first tile of page 1 (Definition), in the Description's place; its Notes box is that page's saved Description (the old Main Activity text where nothing was written there). (The Identity System is one page: `specifications/01-identity-system/01-definition.md`, section 1.) The export, the Business Plan and the open items read the new answers: the Activities as codes with the scheme's initials (the export names codes only, not their titles), the dates, the legal form; the open items of the organisation point to page 1.

**Also built with it (the Legal Entity's tiles).** **One-owner forms (2026-10-24):** where the legal form has one owner in law (Sole Proprietorship, Sole Trader, and the like) there is nothing to ask about ownership, so the Founders & Ownership dialog is the founder's card itself, with **no number and no head** (one person needs no number): its first row is **the Name cell and, on the card's second column, the Capital as an optional field** (the tick box and its word `Capital ($)`, the amount cell appearing under it once ticked, as every optional field of the page does: `OptionalField`; **unticked (the default), the tick and its word stand on the Name cell's own line** (centres 0.5px apart: 281.7 and 282.2 px); **ticked, they move up to the Name label's line and the amount cell stands level with the Name cell** (the row is 78px high in both states, so nothing under it moves); the tick's line is the Name label's line, `--label-line`, so the two labels' centres and the two cells' tops and bottoms are on one line: measured 43px cells, tops 260 and bottoms 303 px on both), the Capital over the same column as a skill's kind (14em wide on every row), then the founder's roles, experience, achievements and skills. There is no ownership table and no "Founders contribute capital" tick: the capital's tick switches the capital on, unticking it empties it and switches it off. **The amount cell takes only a figure** (`limitedNumberText` with the money limit, like every cost, price and expense cell: a letter is refused and the box keeps what it had); the cost filter's From and To cells of the capability overview now do the same. **Capital makes no expense** (it had made one: an expense of a ticked requirement whose own expense was missing was made by whatever the next edit was; an expense is now made only when the requirements change, and one the user removes stays removed). **Founders built 2026-10-24:** the Founders & Ownership dialog is a nested card: **the Ownership itself in the opened master tile** (the founders' names, their shares and capital, and the totals), and, **under a divider line** (edge to edge, 12px of space either side), **one tile for each founder named there** (its dialog is the founder's card: roles, experience, achievements, skills); the tile on the page lists **the founders' profiles, each name a link that opens that founder's card in the dialog** (no longer the names with their shares). (The Capability tile that stood beside it is removed: owner, 2026-11-16 20:25.) **The Legal Entity page's frame is headed "Legal Entity"** (the chapter's name, centred over the tiles as the Strategy's "Situation & Direction" is; a page of one chapter has its heading without a number). **One chapter has the size of one of two** (measured at a 1500px window: the frame 688 by 736px, its tiles 325px, 13px of padding, the heading 12px over the tiles: the same as each frame of Definition and Ethics; it had been 700px wide, 12px more). **A page of one chapter stands at the left, as the Strategy's does** (the Legal Entity page, and every column page drawn as tiles with a single frame).

**Not yet built:** the shortlist with "Show all" (every dropdown lists all its entries, in the official order), the completeness rule for the primary activity, and the industry pack of Research 3, 5.6.

**Pages.** Page 1, chapter Definition, has four tiles in this order: **Organisation** (takes the Description's place, first), Early Positioning (named by the business stage, 8.2), Mission, Vision. Ethics is unchanged. Page 2 has one frame with four tiles: **Founders & Ownership** (the founder tiles of the old chapter "Founders & Capability" become sub tiles inside its dialog: Ownership first, then one tile per founder), **Capability** (its own tile for now; it changes when Business is reached), **Registrations** and **Expenses**. Page 2 is named **Legal Entity** (the owner, 2026-10-23; built 2026-10-24: one frame with four tiles, Founders & Ownership, Capability, Registrations, Expenses; the Founders Profile is no page or frame of its own, a hidden section that keeps its saved answer). The chapter hue of Definition is purple (the "Create" work colour, `#8a6bd1`); under the layout rule the Organisation tile takes it and no tile is an exception.

**The dialog** is one smooth scroll, no steps: two columns, a divider line across, and the Notes below.

```
LEFT: where it is                       | RIGHT: what it is and does
Organisation Name                       | Legal Form (+ Name the legal form, only for an older answer saved as Other)
Country (and State or Region)           | Registration Date (not asked for a sole trader or sole proprietorship in the six countries)
Address (free text)                     | Opening Date
                                        | Activities (i)
                                        |   Primary  SIC 62012            [+]
                                        |   Secondary  SIC 74100          [x]
                                        |              Industry, Division, Group, Class  [dropdowns]
-------------------------------------------------------------------- (a divider line across both columns)
Notes (the page's Description)  [auto-growing, the whole width]

(The business stage is not asked here: it follows the Opening Date, 8.2a. Who pays, the kind of market, the audience and the outcome are on the Early Positioning tile, 8.2.)
```

**On the page** the tile shows the name in bold, the legal form, a divider, then the address; until something is written it shows the first line of what the column asks.

**The fields** (every field is a `FieldRow pair`: label above, control below; `nested` after the first):

- **Organisation Name** (`TextBox`), **Country** and **Legal Form** (`OptionPicker`), **Address** (`StrategyTextArea`, class `legal-entity-address`, free text). The country drives the legal forms, the activity scheme and its code name, the registration numbers, the currency and the date format. Legal Form is the country's official list, in the official order, with no "Other" (owner, 2026-10-30; Questions 4, section 9: a legal form saved earlier as "Other" still shows with its typed name), and stays frozen until a country is chosen; it decides what is asked later (a form with one owner in law has no ownership questions).
- **Registration Date** (`DateCellInput`), **not asked for a sole trader or sole proprietorship in the six countries** (owner, 2026-11-01; Questions 7), **and independent of the Registration Number** (owner, 2026-10-26): the date does not need a number and the number does not need the date. It cannot be later than today or later than the Opening Date. The warnings that go with it (a date that has not come; a company formed after the Opening Date) stand under it. The Key dates read it whenever it is filled.
- **Opening Date** (`DateCellInput`, with an "i"), saved in the Global Settings (`openingDate`). It decides the business stage (8.2a), the plan start where it is the earliest date recorded, the key dates and the Review's messages, and it can be changed at any time. Registration Date and Opening Date stand one under the other: side by side they do not fit a column that ends before the x column.
- **Activities:** below.
- **Notes** is the shared optional note, `OptionalNote` (a tick box and the word, the box opening on ticking; bullets and numbered lists, regular weight, grows with its text), named **Notes**, with no placeholder (owner, 2026-11-12). It still saves the page's Description (its field key stays "Description"), which the Business Plan prints.

**How the options react.**

| The user does | What happens |
|---|---|
| Chooses or changes the **Country** | The Legal Form, the State or subdivision, the Address and the activities are cleared (nothing carries over to another country), and so are the registration numbers issued by the country left; the activity scheme, its level names and the postal label change to the new country's. Choosing the same country again changes nothing |
| Has no country yet | Legal Form, the State or subdivision and the Activities are frozen |
| Chooses a **Legal Form** | A one-owner form removes the ownership questions of Founders & Ownership |
| Changes an activity's **level** | Every level below it is emptied, and the code at the end of that activity empties |
| Adds **activities** | Up to four; the "+" disappears at four and returns when one is removed; only the primary is required |
| Fills or empties the Registration Number | Nothing happens to the Registration Date (it is independent) |
| Sets or changes the **Opening Date** | The stage is recalculated (and with it every limit, lock, name and title, 8.2), the plan start may move, the key dates and the Review's messages update |

*Activities, the Performer pattern.* **The first row is the primary activity; Secondary, Tertiary and Quaternary may be added** (no row is required by the app: the section is complete once the main activity is given, Questions 7) (a row exists only once the "+" has added it, and its x takes it away). The "i" of "Activities" says so: "The first is the primary activity; add others, up to four in all. Each one ends in one official code of your country (the SIC code in the UK)." It changes with the country's code name (Research 3, 5.8). The list is the Performer list of an activity (`business-capability-performers` holding one `business-capability-performer` row per activity: 8px between cells, every cell 44px, the box buttons 32px, all on one centre line):
- Each row: the **sub-label** (`FieldLabel`: Primary, Secondary, Tertiary, Quaternary; 92px, the same width on every row), the **cell**, and the **x column**.
- **The "+" is in the first row's x column** (`AddButton shape="box" small`, "Add activity"), as the Performer's is; every other row has the remove x (`RemoveButton`). At four activities the "+" gives way to the empty slot (`business-capability-performer-slot`), so the cells still end at one x.
- **A finished activity** (it has its code) is folded. The **fold arrow** (`FoldArrow`, the label arrow) stands **inside the sub-label, left of its words**, as the label-arrow rule says (its glyph on the content edge, the words 26px from it; arrow, then "Primary"; the arrow points right when folded and down when open, so an open one can be folded too). **The code with its scheme's initials, in bold, stands on the same line, next to the sub-label** ("Primary  SIC 59112"; the code label of the country, Research 3, 5.8: SIC, NACE, NAICS, ANZSIC, BIC), and **under them, from the column's left edge, the last category** (the class, or the sub-class where there is one) as one plain line in regular weight, **not a link and not blue**; a name longer than its place ends in an ellipsis and **slides across as a marquee under the pointer** (the slide the long tile titles and the text links already have; it needs the same small hook for plain text). The code and the name are 6px apart vertically; the arrow, or the folded line, opens it. **Every text of the list is the body size (18px) and the labels' own weight and colour**: the sub-labels and the level names are labels (regular, the label colour), the code is semibold and the name regular in the text colour, as the cells' values are (measured: 18px on all of them; the code and name had been 16px, the dialog's default). **The code stays beside the sub-label while the row is open** (a finished row that is opened to be changed keeps its code in view); what differs between the two states is only what stands under the sub-label (the name, or the dropdowns) and nothing else: **the head row is 44px, a cell's height, in both states**, its arrow, sub-label, code and button on the centre line, so the Primary row is centred on the Organisation Name's box whether it is folded or open (measured: the centres of the box, the row, the sub-label, the code, the arrow and the "+" are one line in both states).
- **An open activity** shows, under its sub-label, the cascade's dropdowns, each as a label above an `OptionPicker` (the country's own level names, the first too: Section, Sector or Division), starting on the column's left edge (the edge of every label and control of the column, the folded lines too) and ending 8px before the x column's left edge, **the edge every control of the right column ends on** (Business stage included: measured 413 to 691 px for the column's labels, the five dropdowns and the Business stage; the "+" and the x from 699 to 731 px). The level labels carry the country's names (Research 3, 5.8); their "i" is not built yet.
- One left edge for everything under a sub-label (the folded lines and the dropdowns) and one right edge; every "+" and x has one right edge (measured in the mock at the 694px dialog: left 389, right 661, x 669 to 701 px).

*Measured in the mock (694px dialog, 3 loops).* Loop 1, alignment: the two columns start on one line; cells 44px, buttons 32px; the centres of the sub-label, cell and x of each row are equal; the "+" and the x have one right edge. Loop 2, behaviour: "+" adds a row up to four and disappears at four; an x removes a row and the "+" returns. Loop 3, widths: no sub-label is clipped; the folded cells and the dropdowns share their edges.

*Columns, divider and rows (owner, 2026-10-24; built as `.legal-entity-grid-organization` in `11-legal-entity.css`).* Two columns of sections, each section a label over its control (6px), the sections **12px apart in both columns** (the rule; no column has a gap the rules do not give it), the columns 25px apart with a 1px divider (`--line-divider`) down the middle and **12px clear on each side of it**. The columns follow the same rhythm, so **the rows are on the same lines without any space put in by hand**: an open activity's head row is as high as a cell (44px), so the Primary row stands beside the Organisation Name's box, the first level beside the Country, the second beside the Address (measured within 1px). The Legal Form now stands beside the Organisation Name (labels at 226 px, cells at 260 px in both columns), the Registration Date beside the Country and the Opening Date beside the Address, the Activities beneath; the vertical divider ends with the columns; the columns are not forced onto each other's lines, which had left holes of 40 to 200px. **A dropdown's list** is as wide as its longest official title (never narrower than the cell, never wider than 560px or the dialog: the picker's own rule, `09-layout-rules.md` section 10) and a title wider than that wraps instead of being cut; it is as tall as the window's room allows, up to 30 options, and scrolls beyond that (the picker's `visibleOptions`, 10 by default).

*Also noted.* The "Activities" label stands 2px lower than "Organisation Name": a label with an "i" sits in its holder (`legal-entity-label-info`); the same 2px exists for every label with an "i" beside one without, so it is the page's existing behaviour and not changed here.

- **At the narrow width (768 px)** the left column is followed by the right: Name, Country, Address, then Legal Form, Registration Date, Opening Date, the activities (each ending in its code), and the Notes under a divider line.
- **The code is at the end of each activity** (the owner, 2026-10-23), in place of the single code row at the bottom of the column: the cascade's final code **generates** it and the user may edit it (in the app, built: the generated code cannot be edited, and a row stopped before the last level is not saved). Its label and its description come from the country (SIC code, NACE code, principal business activity code, industry code, ANZSIC code, BIC code; not built yet: the app shows the scheme's initials, SIC, NACE, NAICS, ANZSIC, BIC). A folded activity shows its path and code on one line. Today's tick ("has a code") goes: the code is always shown once the last level is chosen.
- **Level labels:** every level, the first too, carries the country's own official name (Research 3, 5.7), each with an "i" (the "i" not built yet). **Everything the user reads in this part switches with the country:** the slot labels, the level names, the code label and the "i" (Research 3, 5.8). Built: the level names. Not built yet: the per-country slot labels (the app shows Primary to Quaternary everywhere), the code labels (the app shows SIC, NACE, NAICS, ANZSIC, BIC) and the per-country "i" (one "i" for all six countries).
- **Changing a level resets the levels below it** in that activity, and the code at the end of the activity empties (Research 3, 5.8, rule 3).
- **Options per level (Research 3, 5.9):** each dropdown shows all its children when there are six or fewer, else the shortlist that covers 90% of the businesses under that parent (never more than ten) plus "Show all"; **the options are in the official order of the classification (Research 3, 5.10), never by popularity**; the "i" says how many items businesses of the industry usually list (Research 3, 5.9); the only limit is four codes.
- **Storage (settled 2026-10-23, "codes only"):** the Legal Entity answer holds a list of up to four entries, each the code and the classification edition. The levels and titles are looked up from the code, because codes nest. Today's activity-code field and its tick are read as a fallback for the first entry until it is replaced. A change of level or of country empties the entry or the list.
- **Description** is the former Main Activity box, renamed. Its "i" carries both former Description prompts as general information: "Who are you, and what do you do? What do you create or provide?"; the old line "Name and legal details go in 3. Legal Entity" changes to say they are in this dialog. No label anywhere is "Main Activity".
- **Saved text.** The box saves into the Description's saved value, which the Business Plan prints as its paragraph. The old Main Activity text is read as a fallback until replaced. The Business Plan's Organisation table row "Main activity" becomes "Activities", filled from the cascade (primary first) **[D, label to confirm]**. The export row says "description". **The Notes box is optional, so an empty one is no open item** (the Review's "not answered yet" is for the free texts that are required: Mission, Vision and the Ethics). What the Review says of the Definition is in 8.6a.
- **Answers read elsewhere:** see 8.1. The country, the legal form, the dates and the activities' codes are read by the Legal Entity's tiles, the financials, the Review, the Calendar and the exports; the Segment of Business 1 does not read the Organisation yet (8.2, "What the Segment will read").
- **Impacts to change together:** `PageGroups.ts` (both pages), the Review "go there" places and `MISSING_PLACES`, the rail and arrows, the colour map, `LegalEntityEditor`, the document and export builders that name Main Activity or the founders' profile, `SectionStatus`, the tests that read them.
- **Open:** the audit of lists under rule 14 (section 3), tile by tile. The examples hold the new fields (the Positioning answers: Lumen & Loom a Proxy business selling to gift buyers, a friend buying for a young adult, Quillfield a direct B2B one; the activities' codes: Lumen & Loom 13921, Quillfield 541512; the Positioning answers; the Opening Dates).


### 8.6a What the Review says of the Organisation and the Positioning

- **Organisation:** "1. Definition: Organisation: name, country, address and legal form." for what is empty among them; nothing for the Description (the Notes are optional).
- **Positioning:** "1. Definition: <the tile's name at the stage>: the seller and buyer relationship, the audience, the buyer's category, the purpose, the differentiation and the outcome not chosen yet." for each question with no choice (the audience and the buyer's category are asked of each relationship chosen). The Positioning's Notes are optional: an empty one is no item. The item uses the tile's name, which follows the stage (Early Positioning, Core Market Positioning, Corporate & Portfolio Positioning).
- **Mission, Vision:** "not answered yet" while empty.

### 8.6 The wording of the Organisation tile

What the app says today, what changes, and what is new. Lists come only from official documents (rule 14); the owner's own words are used where the owner gave them. The wording of the choice questions (Market Structure, Seller and Buyer Relationship, the audience and the outcome) and of the business stage is in 8.2 and 8.2a.

| Element | Wording today (in the app) | Wording from now |
|---|---|---|
| The text box label | "Main Activity" | **"Description"** |
| The text box "i" (`INFO.mainActivity`) | "The work the organisation actually does, described factually. Write it as a registry or a bank would expect to read it. Some countries classify it with an official activity code." | "Who are you, and what do you do? What do you create or provide? Write it as a registry or a bank would expect to read it." (the page-1 prompts, one existing sentence kept, the code sentence dropped) |
| The text box placeholder | "What the organisation does, in plain words" | unchanged |
| The activity-code "i" (`INFO.activityCode`) | "The official code for the organisation's main activity: it classifies what the organisation does. Asked for when the organisation is registered, and on its annual filings where they apply." | The country's sentence of Research 3, 5.8, then "Generated from your choices; you can edit it." |
| The code label | the country's code name ("SIC code", and so on) | one label per country, at the end of each activity (Research 3, 5.8) |
| Organisation Name, Country, Address, Subdivision, Legal Form, "Select a legal form", "Name the legal form", the "waiting for country" hint | as in the app | **unchanged** |
| Activity heading, slot labels, level names | none | per country (Research 3, 5.8); every level the scheme's own name |
| Level dropdown placeholders | none | "Select an industry", "Select a division", and so on, with the country's level name (the style of "Select a legal form") (not built yet: the app shows "Select") |
| Buttons and tooltips | none | "+ Add another activity" (the existing add-button style); tooltips "Click to add another activity", "Click to remove this activity", "Click to show all" (not built yet: the app shows a "+" with the tooltip "Add activity", and no "Show all") |
| A long list | none | the last entry "Show all" opens the whole list, in the official order |
| Export row, Business Plan table row, open item, completeness | "Main Activity", "Main activity", "main activity" | "Description" in the export (no open item: the Notes are optional); the Business Plan's table row becomes "Activities" |
| Page names | page 2 "Organisation"; page 1 tile "Description" | page 2 **"Legal Entity"**; the Description tile is removed |
