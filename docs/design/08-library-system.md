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

The owner's wording: the tables are connected to the app so that a change is updated in real time, and the two logs record it. What is connected to what:

**The app** is the running application (its pages, chapters, tiles and cards, and the code in src that builds them). **The Foundation Capability table and the App table** record the structure of the app: for every system, page, chapter, tile and card, which assets stand in it, in which order and in which variant (a placement: asset id, the card, chapter, page and system it stands in, its position, its variant). **The library** records the assets and their variables. The library does not know where an asset is placed; the tables do.

| Change | Where it happens | What is updated | Which log |
|---|---|---|---|
| A new asset is added to the library | The library | The library; the inventory builds it | Library log |
| An asset (new or existing) is placed in a card, under a chapter, page, system | The app | The Foundation Capability table (or the App table) takes the placement | App structure log; and the library log with the extra placement, if the asset is in the library |
| An existing asset is moved or removed | The app | The table takes the new place, or drops the placement | App structure log; and the library log with the move or removal |
| A component is placed in the app that is not in the library | The app | The table takes the placement, marked as not in the library | App structure log only |

**How a change in the app reaches the table.** A sync reads the running app (the same crawl as the scanner: pages, chapters, tiles, cards, their fields and components, by class and kind), compares what it finds with the placements in the table, and for every difference updates the table and writes the app structure log entry (the three cases of section 5). It runs on demand for the whole app, and in watch mode during development: when a file in src changes, the dev server reloads, and the sync re-reads the pages that file affects and updates the table within seconds. The watch mode is the "real time".

**How a change in the library reaches its log.** The checker holds a snapshot of the last logged state of the library and the tables, lists every difference, classifies each as case 1, 2 or 3, and fails when a change has no log entry. An assistant command writes the entries.

**The reverse direction (placing from the table).** Once the assets have replaced the old ones (phase 3), a card kind is described in the table by its placements and the app builds the card from them. Until then the table follows the app, and a placement written in the table first is reported as "in the table, not yet in the app" until the app shows it.

**Open point for the owner:** whether the sync reads the running app (what the user sees: exact, needs the dev server) or the source code (faster, but the cards are written as separate builders, so it cannot yet tell fields and components apart). The recommendation is the running app, with a source check that finds a component or class name that is not in the library.

## 7. The steps (one commit each)

1. This specification, approved by the owner.
2. The data model in code: Variable, Asset, Placement, with their checks (unique key, every placement points to an asset, every asset has its variables described).
3. The Foundation Capability table and the App table as data, generated from documents 06 and 07 (ids kept).
4. The library: every asset once, with variables (id, name, description) and variants, and what each requires. The owner decides the defaults where there are several looks.
5. The two logs and the checker (snapshot, the three cases, the drift list).
6. The inventory: the components built from the library, then the fields, then the cards and tiles, shown on a gallery page.
7. The sync between the app and the tables (on demand, then watch mode), then replacing the assets system by system.

Not in this work: the Customer Engagement, Financial Foundation and Sustainability pages (they will change as a whole), and layout checks (the owner's rule until the library has unified the elements).
