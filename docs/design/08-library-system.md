# The library system: tables, library, inventory and logs

Status: **specification for the owner's approval (2026-10-15).** Nothing here is built yet. It records the owner's requirements as stated in chat, and how they will be met, step by step. The starting data is the catalogue (the card scan, the probes and document 01 Part F), printed in documents 06 and 07.

## 1. What a variable is

A **variable** is a named property of an asset that takes one value out of a fixed list. Every variable has an **id, a name and a description** (what it controls, in plain words), and its list of values, each with a name. A **variant** is one chosen combination of the values of an asset's variables. One asset therefore covers many looks, and a look is never built twice.

Variables of this app, by kind (the first set, to be confirmed by the owner): kind (the "i", "+" or x), state (rest, hover, focus, active, selected, disabled), tint (the card's colour), reading mode (light, dark, sepia), size per screen class (tablet, laptop, desktop), content (empty, filled, long), requirement (required, optional, automatic), place (page, dialog, floating card, nested card).

## 2. The six things

| Thing | What it holds | Source of the data |
|---|---|---|
| **Foundation Capability table** | Per system, page, chapter, master tile, master card, sub tile, sub card, nested tile, nested card and floating card: its fields and components, characteristics, functions, types, categories, groups, links, reactions and effects (the four systems: 1. Identity, 2. Brand, 3. Business, 4. Strategy) | Document 07 (structure tables) |
| **App table** | The app header (and its tags), the calendar, the landing page, the system selection page | Document 07 (H, L, CA) |
| **Assets library** | Every asset once, with its variables and variants, and what it requires | Documents 06 and 07; the contracts in src/library |
| **Assets inventory** | The assets built from the library: every component, then every field from components, then every card and tile from fields and components | The library |
| **Library log** | One entry per change of the library | Kept by the checker |
| **App structure log** | One entry per change of the Foundation Capability table or the App table (where an asset is placed in the app) | Kept by the checker |

## 3. Ids and unique assets

Every component, field, card type, tile, variable and chapter has an **id (a number) and a name**, for example CO012 x button, F031 Start date, K007 Resource card, VAR004 state.

Categories of asset: **component** (x, "+", "i", dropdown, tick box, text area, rail bullet, arrow, Back...), **field** (a label with its components: Start date, Category, Price...), **card type** (made of fields and components), **tile** (master tile, tile, open tile, add tile), **frame** (chapter, page, dialog view).

**Every asset is unique.** An asset's key is its category plus its name. If the same asset appears more than once in the scan it is one asset, and the places it appears are recorded as placements, not as copies. Where one asset has more than one look today (the text area has 22 looks, the label 8, the text box 6) those looks are listed with their counts and the owner decides which is the default; the others become variants or are retired.

## 4. Adding or changing something: the order

A new component, field, card, tile or variable follows this order:
1. **Check** that it does not already exist, as an asset or as a variant.
2. Place it in the **library** (with its variables), and write the **library log** entry.
3. Create it in the **inventory**.
4. Place it in a card, under a chapter, page and system: update the **Foundation Capability table** (or the **App table**) and write the **app structure log** entry.

## 5. The three cases of logging

| Case | What happened | Library log | App structure log |
|---|---|---|---|
| 1. A new asset, placed | The asset is new: added to the library, built in the inventory, placed in a card | Entry: asset added | Entry: placed in card / chapter / page / system |
| 2. An existing asset, placed, moved or removed | The asset exists; it is placed in a card, moved, or removed | Entry: the extra placement (or the move, or the removal) of the asset | Entry: the placement, move or removal |
| 3. A new component placed directly, without the library | By speed, accident or mistake a component is placed in a card that is not in the library | **No entry** (the library did not change) | Entry: placed, marked **not in the library** |

Case 3 keeps the record honest: the app log shows the asset, the library log does not, and the checker reports every such asset as a **drift** until it is added to the library (then case 1 applies to it).

## 6. How the tables are connected to the app

The owner's wording: the table is connected to the app so that changes are updated in real time. Assets are placed in the **Foundation Capability table** (or the **App table**): an asset is placed in a card, under a chapter, a page and a system. The app is connected to these tables: when a placement in a table changes, the app shows the change at once.

**What each part holds.** The library holds every asset and its variables, and not where it is placed. The inventory holds the assets built from the library. The tables hold the placements: for every system, page, chapter, tile and card, which assets stand in it, in which order and in which variant. The app is built from the tables, the library and the inventory.

**The two logs.** The **library log** records the changes of the library, and the placements of library assets (an extra placement, a move, a removal). The **app structure log** records the changes of the tables, that is, of the structure of the app.

| What the owner does | Library | Library log | Table (and so the app) | App structure log |
|---|---|---|---|---|
| 1. Adds a new asset to the library, creates it in the inventory, places it in a card, under a chapter, page, system | New asset added | Entry: asset added (and where it is placed) | Placement added | Entry: placed |
| 2. Places an existing asset in a card, or moves it, or removes it | Unchanged | Entry: the extra placement, the move or the removal of that asset | Placement added, moved or removed | Entry: placed, moved or removed |
| 3. By speed, accident or mistake, places a new component directly in a card, without placing it in the library first | Unchanged | **No entry** | Placement added | Entry: placed, marked **not in the library** |

The checker lists every placement whose asset is not in the library (case 3) until the asset is added to the library; the library log then gets its entry and the app structure log notes that the asset is now in the library.

**Real time.** The tables are data files read by the app. The dev server reloads when a table, the library or the inventory changes, so a placement written in a table shows in the app within seconds.

**The transition.** Today the app is built by hand: its cards are separate builders. A system is moved to being built from the tables one at a time (step 7). Until a system has been moved, its table describes it and does not drive it, and the checker compares the table with what the scan finds in the app.

**Checker.** npm run library:check (to be built) holds a snapshot of the last logged state of the library and the tables, lists every difference, classifies each as case 1, 2 or 3, and fails when a change has no log entry. An assistant command writes the entries.

## 7. The steps (one commit each)

1. This specification, approved by the owner.
2. The data model in code: Variable, Asset, Placement, with their checks (unique key, every placement points to an asset, every asset has its variables described).
3. The Foundation Capability table and the App table as data, generated from documents 06 and 07 (ids kept).
4. The library: every asset once, with variables (id, name, description) and variants, and what each requires. The owner decides the defaults where there are several looks.
5. The two logs and the checker (snapshot, the three cases, the drift list).
6. The inventory: the components built from the library, then the fields, then the cards and tiles, shown on a gallery page.
7. The app built from the tables, the library and the inventory: one system at a time (the dev server reloads when a table changes), then replacing the assets system by system.

Not in this work: the Customer Engagement, Financial Foundation and Sustainability pages (they will change as a whole), and layout checks (the owner's rule until the library has unified the elements).
