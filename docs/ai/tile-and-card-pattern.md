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
- Floating, 480px wide, one box: the tile's tint, a hairline in its hue, 8px corners, one shadow, 12px padding. Its head: the number, the name, the ×; everything under the head starts and ends where the name does; a label stands above its control or beside a single short one, to the name's right edge.
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
