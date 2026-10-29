# 8. The library system: tables, library, inventory and logs

Status: **requirements and plan**, updated 2026-10-29. Approved by the owner on 2026-10-15; steps 1 to 6 (section 7) are built, step 7 (the sync) is not. It records the owner's requirements as stated in chat, and how they are met, step by step. The starting data is the catalogue (the card scan, the probes and document 01 Part F), printed in documents 06 and 07.

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

## 3. Codes and unique assets

**Asset code:** three capital letters for the kind of asset, a dot, and a three-digit number in the order the assets were created, for example BTN.001: the first button asset that was created.

**Variant code:** the asset's letters, the variant's three capital letters, then the asset's number and the variant's number: BTN.DLT.001.001 is the first variant (Delete) of the first button asset BTN.001. A variant is an **edited version of the main asset**; it belongs to that asset.

**What is one asset and what is a variant.** The x (Delete) and the "+" (Add) are the same box button with a different function and symbol: one asset, BTN.001, with the variants BTN.DLT.001.001 and BTN.ADD.001.002. The "i" in a circle is **not** the same asset: it has a different function, shape and purpose, so it is another asset (for example BTN.002). The x box button and the circle "i" share their hover reaction, and nothing else: a shared reaction does not connect assets (the reaction is a variable of each).

**Letters of the kinds (approved by the owner; the list is `KINDS` in `src/library/model/types.ts`):** BTN button, DRP dropdown, TIK tick box, TXT text input (box and area), LST list, DIV divider, TXS text, SYM card symbol, PCK picker, IMG image holder, ICN icon, DAT date cell, ARW arrow, BUL bullet (all components); FLD field; TIL tile; CRD card; FRM frame (chapter, page, dialog view). There is no rail kind: the rail is the page tag, a field. A new kind of asset gets a new three-letter code, written in the library first.

Every variable has an id, a name and a description (VAR followed by a three-digit number until the owner decides otherwise). The ids in document 07 (CO, F, K...) are working ids of the catalogue; the library assigns the codes above.

Categories of asset: **component**, **field** (a label with its components), **card type** (made of fields and components), **tile** (master tile, tile, open tile, add tile), **frame** (chapter, page, dialog view).

**Every asset is unique.** An asset's key is its code. If the same asset appears more than once in the scan it is one asset, and the places it appears are recorded as placements, not as copies. Where one asset has more than one look today (in the first scan the text area had 22 looks, the label 8, the text box 6) those looks are listed with their counts and the owner decides which is the default; the others become variants or are retired.

## 4. Adding or changing something: the order

A new component, field, card, tile or variable follows this order:
1. **Check** that it does not already exist, as an asset or as a variant.
2. Place it in the **library** (with its variables), and write the **library log** entry.
3. Create it in the **inventory**.
4. Place it in a card, under a chapter, page and system: update the **Foundation Capability table** (or the **App table**) and write the **app structure log** entry.

## 5. The three cases of logging

**Every change is a change:** adding, editing, moving and removing. The **library log states every change to an asset** of the library: it is added, its variable or variant is edited, it is placed (and where), it is moved (from where to where), it is removed.

| Case | What happened | Library log | App structure log |
|---|---|---|---|
| 1. A new asset, placed | The asset is new: added to the library, built in the inventory, placed in a card, under a chapter, page, system | Entry: asset added (its code), and where it is placed (card, chapter, page, system) | Entry: placed, and where |
| 2. An existing asset, placed, moved or removed | The asset exists; it is placed in a card, under a chapter, page, system, or moved, or removed | Entry: the extra asset and **where it is placed**, or where it moved from and to, or where it was removed from | Entry: placed, moved or removed, and where |
| 3. A new component placed directly, without the library | By speed, accident or mistake a component is placed in a card that is not in the library | **No entry** (the library did not change) | Entry: placed, marked **not in the library** |

Case 3 keeps the record honest: the app log shows the asset, the library log does not, and the checker reports every such asset as a **drift** until it is added to the library (then case 1 applies to it).

## 6. How the tables are connected to the app

The owner's decision: **the app changes the table.** The table follows the app in real time: when the app changes (an asset is placed in a card, under a chapter, page, system; moved; removed), the Foundation Capability table (or the App table) is updated, and the logs record it.

**What each part holds.** The **Foundation Capability table** holds all the information of the four systems (per system, page, chapter, master tile, master card, sub tile, sub card, nested tile, nested card and floating card): its name, type, category, group, function, characteristics, fields and components, links, reactions and effects, and which assets stand in it (in which order and variant). The **App table** holds the same for the header and its tags, the calendar, the landing page and the system selection page. The **library** holds every asset and its variables and variants. The **inventory** holds the assets built from the library.

**The two logs.** The **library log** states every change to the assets of the library (section 5). The **app structure log** records every change of the tables, that is, of the structure of the app (what stands where).

**How a change in the app reaches the table (step 7; not built).** A sync reads the app, compares what it finds with the table, and for every difference updates the table and writes the app structure log entry. It runs on demand for the whole app, and in watch mode during development: when a file in src changes and the dev server reloads, the sync re-reads the pages that file affects and updates the table within seconds. That is the "real time".

**How the three cases are told apart (the same step).** For every asset the sync finds in the app, it looks the asset up in the library. Found: case 1 or 2 (the library log has, or gets, its entry with where it is placed). Not found: case 3 (app structure log only, marked not in the library, and listed as a drift).

**Checker (built).** `npm run library:check` holds a snapshot of the last logged state of the library and the tables, lists every difference, classifies it, and fails when a change has no log entry. `npm run library:log` writes the entries (docs 10 and 11) and stores the state.

**What the sync reads (recommendation for step 7; the owner may change it).** The running app: what the user sees, exact, and it needs the dev server running. A check of the source finds a component or class name that is in the app and not in the library. Reading only the source is faster, but the cards are separate builders today, so it cannot yet tell fields from components.

**Later.** Once an asset has replaced the old one (phase 3), the app is built from the library for that asset, and the sync then finds the asset where the library put it.

## 6a. From the library to the app: one source for a size (2026-10-16)

The size of a component is written once, in the library (the look of the asset or of its variant). Three things follow from it, and the app is not allowed to say otherwise:

1. **The tokens.** `src/library/componentTokens.ts` reads the looks and gives the custom properties the stylesheets read with var(): the height of a cell (--card-cell-height, from TXT.001), of a box button (--size-box-button, BTN.001), of a mark (--size-mark, BTN.002, which TIK.001 and BTN.007 must equal), the square number (--control-square), the corners of a cell (--box-radius), the wide add button (--add-button-height), the tool button, the fold arrow (--fold-arrow-size) and the card symbol. `npm run library:tokens` writes them into `src/styles/components.generated.css`; no other stylesheet defines them. Two components that share a size and disagree in the library stop the generator.
2. **The contracts.** The older asset contracts of `src/library/assets` (plus box, info note, remove x, fold arrow, dropdown, floating card) take their sizes from the same place, so a size is not written twice there either.
3. **The comparison.** `npm run library:compare` (`tools/scripts/library/app-compare.mjs`) puts the library's look of every component beside what the walk of the running app measured, and writes `docs/design/library/15-library-vs-app.md`; with the flag check it fails when the app differs from the library and the difference is not a known one. The walk is `tools/scripts/catalogue/app-crawl.mjs`.

To change a size: change the look in the library (section 4), run `npm run library:tokens`, walk the app and run the comparison. A component that differs is fixed in the stylesheet at the root (the one rule that draws it), not by a rule on top of it.

## 7. The steps

1. This specification, approved by the owner. Built.
2. Built: the data model in code: Variable, Asset, Placement, with their checks (unique key, every placement points to an asset, every asset has its variables described).
3. Built: the Foundation Capability table and the App table as data, generated from documents 06 and 07 (ids kept).
4. Built: the library, every asset once, with variables (id, name, description) and variants, and what each requires. The owner decides the defaults where there are several looks.
5. Built: the two logs and the checker (snapshot, the three cases, the drift list).
6. Built: the inventory, the components built from the library, then the fields, then the cards and tiles, shown on a gallery page.
7. Not built: the sync between the app and the tables (on demand, then watch mode), then replacing the assets system by system.

Not in this work: the Customer Engagement, Financial Foundation and Sustainability pages (they will change as a whole), and layout checks (the owner's rule until the library has unified the elements).
