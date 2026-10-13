# The tile, frame and card pattern

One pattern for every tile, frame and card of the app (Identity, Brand, Business, Strategy). A new tile or card takes it from the shared styles (`section-tiles.css`, `card-tile.css`); nothing is drawn for one page alone.

## The page
- A page's frames start and end on the page title's underline, edge to edge, and are centred with it. Frames of one page are 12px apart (`.page-group` for a page of several sections, the Business page's grid for its two).
- A frame: 12px padding, 8px corners, one hairline edge in its hue, its heading on top in capitals, centred, 28px semi-bold (`.answer-column-label`, `.tiles-frame-head`).
- A page's colour says the work done in it (docs/ai/foundation-colour-map.html, `WorkColours.ts`); a tile, its dialog and its floating cards take that hue.

## The tile
- A square in the frame's tint with the box's inset light (top left) and shade (bottom right), the tile corners (`--tile-radius`), and a 110% rise under the pointer, growing inwards.
- The title: capitals, 18px, semi-bold, letter-spaced, centred, its first line 24px from the tile's top on every tile of every size, underlined by a hairline (40% of the text colour). A title of two lines keeps its first line there; its rule and what follows it stand lower.
- What follows the rule: a list or a text, 14px, muted colour, as wide as its longest line and centred as a block, its lines left-aligned.
  - A list of things (founders, resources, registrations, expenses, themes) has a bullet on each line; a list that already numbers its lines (Values, Principles) has none; prose has none; a line that stands alone (a name, a date) is centred; a bold word is a name or a price.
  - Two things on a line (a name and its share) are two columns, the separators in one column. A line between two topics is a hairline.
  - The text ends at a whole line, a line above the foot.
- A picture (colours, typefaces, images, an icon) stands in the same box of its tile, in its middle; the centres of the pictures of tiles side by side are one line.
- A "+" at the lower right adds a card and opens it; where a kind has a fixed number it is hidden when all are there.

## The card that opens from a tile
- Floating, 480px wide, one box: the tile's tint, a hairline in its hue, 8px corners, one shadow, 12px padding. Its head: the name cell with the order number inside it (drawn over its left, the name's text after it), and the ×; everything under the head starts and ends where the name does (the card's own 12px at the left; the × has its own column at the right); a label stands above its control or beside a single short one, to the name's right edge.
- Drop-downs are the app's own; the "i", the Back button and the hover reactions take the tile's tint.
- A Theme's card stands in the centre under its section's title.

## Linkable content, headers and darkness
- A line of a tile that names a card opens it; a block of a picture (colour, image, typeface) opens its card; elsewhere a press opens the tile. Colour and image blocks are squares, evenly spaced, and grow inwards with a drop shadow as a tile does; a typeface is underlined.
- Business card tiles: where it belongs in plain lines, then bulleted status, dates, warranty and cost.
- A floating card does not darken the page behind it and has the same inner light and shade as every card.
- A dialog header is one row: the root name, then the names one size lower; a long trail slides off to the left.

## The two documents
This file is the short, visual brief: what a tile, frame and card look like, for anyone drawing one. `layout-rules.md` is the rulebook: every measured rule, token and class, batch by batch, and the automated check that proves them. A new pattern is written here in a line and in `layout-rules.md` in full.

## Dates and order
- A day is written in the reader's date format everywhere, and entered in the same date cell (text with a calendar button); never a browser's own date box.
- A card is dated today when it is made; ticking an End date, or turning on a Payment Plan, gives it today's date where it has none.
- Where a list of cards has a date, the date defines the order, then the number. A list is read in that order even when it was saved before.
- A Business card tile starts with its dates (both days, or the Start date alone; "From" only for a monthly, quarterly or annual cost), then where it belongs in plain lines, then the status, warranty and cost with bullets.
- A frame's heading is 28px and its tiles start at one distance below it, on every system.

## How a card lays itself out (so a new card needs no hand-placing)
- **One box, one edge pair.** The card has 12px padding. Its name cell (with the order number inside it) and everything under it start at the left padding and end at the name cell's right edge; the × has its own 40px column (32px and 8px) at the right, and what belongs to that column (a stage's ×, an Activity's "+") stands in it.
- **Rows.** A label stands above its control (6px) or beside a single short one in the label column (177px) with the cell after it; rows are 12px apart; every cell is 44px high with 18px text; the cells of a column share one left edge (a label column is as wide as its widest label, never narrower, so an "i" never touches a cell).
- **Parts are not wired.** A card's sections (Offerings, a Journey Stage with its Actions, links, expenses) have no border of their own: spacing and the label's colour say what belongs together (6px inside a part, 12px between parts).
- **A value the app placed** (a Group, a Cost option, a Billing type fixed by a channel or a rule) is presented as the cell it stands in: that cell's height, its one line, its letters where a picker's start, an ellipsis with the whole text as the tooltip.
- **Words are written whole where the cell has room** ("% of revenue", "Per project", "Working Hours"); a short form ("rev.", "proj.") only for a label over 14 characters.
- **The tile of a card** tells what the card holds in one order: its dates (both days, or the start alone), where it belongs, then status, warranty and cost; a Partner or Supplier tile does so as a Resource's and an Activity's do.

## Labels, titles, alignment and scrolling (global rules)
- **A field's label**: the body size (18px), regular, the card's label colour (`--label-color`): a field's name, an optional field's ("Links", "Description"), and a channel card's part labels ("Offerings", "Actions", "Expenses") alike. A tick box's own text is a value (18px, the text colour).
- **A card's title**: a typed name is the cell's value (18px, regular, the order number inside the cell); a name the app wrote (a channel's, a founder's, a delivery card's) is 18px semi-bold, the strong text colour, on the number's line. Never larger than the frame's own headings (a card's title is not a heading).
- **Which way a cell aligns**: text, names, descriptions, dates, links and the chosen value of a picker align LEFT; numbers (amounts, quantities, hours, percentages) align RIGHT, the cell ending where the card's cells end; tile titles and frame headings are CENTRED. One exception, by design: the Strategy System's Start and End month pickers read from the right so two stacked cells end on the same letter. A value the app placed (not typed or picked) takes the alignment of the cell it stands in.
- **A label over its control or beside it**: over, with 6px, for a wide control (a text, a list, a tick list, a field under "Links"); beside, in the label column (as wide as the widest label), for a single short cell.
- **A set of choices is tick boxes** (one or more of these: a channel's Offerings, "Linked to"), listed one per line, "All" first; a dropdown is for one value.
- **A rail's bullets**: a card's bullet says the card's NAME (a tooltip: the user names cards); a tile's bullet (a section of a frame) has its name beside it where the window has room (tile names are given), else the tooltip. The bullets run in the tiles' reading order. A group with one option still has its tile (empty or not), so the arrows that bring the user to it never make a card.
- **Scrolling**: while a dialog or a card is open, the page behind does not scroll (the wheel scrolls what is under the pointer while it can, then the open layer); where a scroller's content is taller than the scroller, its end can be scrolled up to a quarter of the window's height above the bottom (`useScrollRules.ts`).

## Rails as a page tab, the x column, and the rules that are global
- **A rail is a tab**: the Pages and Sections rails of a page, and the rail of any dialog or card that has bullets, stand in a tab attached to the side of the frame, dialog or card (touching it, round at its outer corners) in that layer's own ground, edge and ink; the bullets stand 12px from the layer, level with the arrow above. A page's tab takes the colours of its first (left) and last (right) frame (`useRailTab.ts`); a layer's tab takes its own (`tabColours`, SectionTiles.tsx).
- **Rail names**: a card's bullet says the card's name, from `SectionTile.nameFor`, else the name its tile showed (`cardNames.ts`: every card tile registers its name as it draws), else the tile's line that opens it. A tile's bullet has its name beside it (inside the tab). An inner level of a dialog (the categories of a section, the groups of a category, a dialog's sections) replaces the rail with its own tiles' names while it is open (`useDialogInnerStep(step, rail)`).
- **The x column**: a card's x stands in its own column, 32px wide and 12px from the cell beside it (`--card-x-column: 44px`), 12px from the card's edge; an x never lies on a cell (the layout probe's "a remove x keeps 12px from the cell beside it and never lies on one").
- **A channel and the cards it made share its Offerings**: ticking Offerings on the channel writes them to its Resource, Partner and Provider cards (their "Linked to" is locked there); "All Offerings" is ticked whenever every Offering is.
- **A card's kind label**: a Theme, Goal, Objective and Metric card each carry their kind and its "i" beside the name cell.
- **A fix with a global reach is made as a rule**, in a shared component, token or class (a rail, a head, a label, a scroll), and written here; never for one card only.
- **A wired button has no fill at rest** (the "i", "+", x, an "Add ..." button): transparent, so it takes the colour behind it; its own fill returns under the pointer or when open (`section-tiles.css`, "GLOBAL: A WIRED BUTTON").
- **A floating card has one ground**: round, with its hairline and shadow; the tile content that holds it (`.column-tile-content`, `.brand-style`, `.brand-inventory`) has none, so no square box shows behind its corners.
- **A tab follows the reading mode and takes its edge from the layer's ink where the layer's hairline is a translucent light**; a name in it never changes width (it is lit by a shadow, not a heavier weight) and keeps 14px from its bullet. The Back button of a dialog stands in its tab after the last option, and the dialog's foot has none while the tab does.
- **A channel card is divided into sections by one tint**: Offerings and Links/Expenses on the card's ground, the Actions between them on 12% of the card's label colour, edge to edge, straight lines.
- **A delete x of a block (a Relationship Type) stands at its top right corner**, 12px from both edges.

- **A card stands on its tile's tint** wherever it is drawn (floating over a tile or in a dialog): the Brand cards (a colour, a typeface, an image, the Text Hierarchy's box) too; the page's neutral card ground is for a card on the page only. A channel expense's x (take it off the channel) is twice its size under the pointer.
- **A status pill (Total Ownership) has no fill**: transparent like a wired button; its state is told by line and ink (`section-tiles.css`, "GLOBAL: A STATUS PILL").
- **The page tab stands at the top of its layer**, its top level with the layer's title (a dialog's, a floating card's caption). It never hides the layer's arrow: where the arrow stands in the tab's column, the bullets that would lie under it follow below it, and the arrow alone takes the bullets' tint (`--tab-edge`) so it reads on the tab's ground. The tab takes its ground from the layer's first fully opaque wide box (never a translucent caption pill) and its line from the layer's hairline, or the tile's line accent where that is translucent: every layer's tab looks the same.
- **A linked requirement and expense (Legal Entity) are drawn together only where a link was pressed** (the link symbol, a card's link); opened by its own tile or box, a card is alone.
- **A founder's card narrower than its two pairs** (Salary | Frequency, Working Hours | Delivery Hours) stacks the pairs, each label beside its cell, instead of letting the second pair run out of the card (container query on `cost-fields`).
- **The Back button in a tab** reacts as the dialog's own Back did: its colour and the bold shadow.
- **A Customer Relationship block's first row** is [Type: label over a cell as wide as its longest option] [Purpose: label, then its cell] [x], cells level, 12px apart.
- **A channel card's Expenses and Actions sections** have the "+" above the x column on their heading's line (a divider under the heading); no "Add ..." button; each expense has a regular x beside it.
