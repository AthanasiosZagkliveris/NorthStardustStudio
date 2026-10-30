# 18. The reactions

Status: **current design**, updated 2026-10-29.

What the app does when a part of it is pointed at, pressed, focused, ticked, opened or switched off: the kinds of reaction, and which fields and components take which. Written from the stylesheets. The rulebook (`docs/ai/layout-rules.md`, section 6, "Interactions: one set of reactions per kind") holds the same rules as the table the automatic layout check runs against, and fails a kind that does not react as its row says; this document is the lookup: the kinds, and which component takes which.

## 1. The kinds of reaction

| # | Reaction | What is seen | Notes |
|---|---|---|---|
| R1 | **Glow** (pointer on a field) | A soft ring, 4px wide, in the card's glow colour at 18% round the field. No border change. | The field keeps its recessed look; nothing moves. One rule for every field kind: the edge never changes under the pointer (the primary edge is the ring's). |
| R2 | **Ring** (focus, or pressed and held) | The primary edge and a ring 3px wide at 35%, one rule for every cell in every mode (`cell-focus.css`); a box that holds a field (a date cell, the colour cell, a numbered list) draws it round the box, with the cell's corners, and the field inside draws none. | Keyboard focus and the active field; independent of the border colour (accessibility). |
| R3 | **Recess** (rest) | Fields rest recessed: no stroke, the inset shade at the top left and light at the bottom right. Pickers rest raised. | A field that cannot be changed is flat. |
| R4 | **Fill** (the "+" family) | At rest the ground of what it stands on, a 2px stroke and the symbol in the card's darker tone; under the pointer or the keyboard the tone fills the box, the stroke goes, the symbol takes the ground (150ms). | The +, the calendar button, the funnel, the day, month and arrow buttons of the calendar card. The x does the same in danger red. |
| R5 | **Bold and underline** (text links) | The letters thicken (the app's bold, no change of width) and a line 1px under the descenders. | Every text link (the look and the list of kinds are in `19-text-links.md`); list items of a tile are underlined only. |
| R6 | **Marquee** (a long text link) | The text slides across its place to be read whole (about 100px a second, quicker on the way back, `textLinks.ts`). | One row only; at rest an ellipsis. It slides whatever the system's motion setting (only while the pointer is on it; it is the one way to read the cut text). |
| R7 | **Bold** (titles and labels) | The letters thicken, nothing moves (the bold's letter spacing is already there). | Tile titles, buttons, the label of a tick option. A labelled button keeps its size: the thickening takes no room and its tracking stays what it is at rest. |
| R8 | **Grow** (tiles and blocks) | A tile grows about its aimed corner, edge or centre, above its neighbours, a drop shadow growing with it; a colour or image block (6px corners) grows 10% inwards and keeps its inset light and shade. | Page tiles, boxes of a dialog, the blocks of a master tile. |
| R9 | **Grow 20%** (the link symbol) | The symbol is 20% larger about its centre; the box it stands in does not change. | Nothing moves. |
| R10 | **Halo** (the tile that opened a card) | A steady ring 2px and a glow in the opened card's tint (the Completed grey for a completed card) round the tile or box that holds the card now shown, while the card is open; the list line that opens it is bold and underlined. It follows the card when the arrows step. | Not flashing: the flashing glow is only the error. |
| R11 | **Error glow** (an incomplete card) | The tile flashes a red glow; its line in a tile's list is red, bold and flashing and comes first. | A card just made and still open is not flagged. Any other card is flagged in its fields exactly when its tile flashes (one lacking its Name too). |
| R12 | **Deactivated** (disabled, frozen, completed) | Flat, no reaction, the muted ground; the not-allowed cursor. | A **completed card** is the exception: it keeps the shapes of an open card in four greys only (card ground, cells' ground, line, text), its tab, bullets, arrows and halo grey too; only its Completed row is live. |
| R13 | **Close** (a card that pops up) | A click anywhere outside it, and Escape, close it. | Calendars, the colour picker, a dropdown's list, the funnel, notes, the tile views. |
| R14 | **Press** (a control held down) | Every button, tab, menu item, summary and link darkens a little more (`filter: brightness(0.93)`, `cell-focus.css`); a field has its ring. | One rule for every control. |

## 2. By component

| Component | Rest | Pointer | Focus / pressed | Ticked / open / chosen | Disabled |
|---|---|---|---|---|---|
| Text box, text area, name cell | R3 | R1 | R2 | - | flat (R12) |
| Dropdown cell (picker) | raised inset | R1 | R2 | its list opens (R13) | R12 |
| Dropdown list option | plain | its ground | the highlighted row | the chosen row marked | R12 |
| Date cell (day) | R3 | R1 | R2 | its calendar opens (R13) | R12 |
| Month cell (month and year) | R3 | R1 | R2 | its calendar opens (R13) | R12 |
| Calendar button (inside the cell) | R4 at rest | R4 filled | R4 filled and a 2px outline | the calendar is open | 55% |
| Calendar card, its day, month and arrow buttons | transparent, a 2px clear frame | R4 filled | outline | today framed, the chosen day filled | the day dimmed, not chosen |
| Colour box (inside the hex cell) | the colour, no frame | - | R2 on the cell | the colour card opens (R13) | R12 |
| Colour picker card | the square of shades, the hue bar, the code's picker (a short cell) and the hex or R G B / H S L cells, every cell 44px tall | the cells R1 | the cells R2 | - | R12 |
| Tick box | R3, 24px, 4px corners | R1 (and its words underlined) | R2 | flat, filled with the blue, the check centred | 55% |
| Radio (Units / %, the choices of Early Positioning) | the browser's | R1 on the round (drawn 16px, so the ring is round), and its words underlined (as a tick box) | focus ring | the chosen one filled | not-allowed |
| "+" box | R4 at rest | R4 filled | R4 filled and outline | - | 50% |
| x (remove) | transparent, 2px red stroke and X | filled red, X in the ground | outline | - | muted |
| "i" (info) | stroke and letter in the tint | filled with the tint, letter in the ground | the same | its note opens (R13) | n/a |
| Funnel (founder's Responsibilities) | R4 at rest | R4 filled | outline | filled while it leaves something out; its list opens (R13) | n/a |
| Link symbol | a drawn chain in the card's tone | R9 | R9 | - | n/a |
| Text link | R5 at rest: blue, regular, no underline | R5 and R6 | R5 and outline | - | grey |
| Fold arrow (card, 36px) | the ground and the card-line edge | its ground | focus ring | open or closed (information, help and links start closed; content starts open) | n/a |
| Label arrow (beside a label) | the outline triangle | the triangle fills | the same | open or closed (information, help and links start closed; content starts open) | n/a |
| Master tile (page tile) | the tile, its list | R8 | outline | R10 while its card is open | n/a |
| Box in a dialog (subcategory, card, founder, add) | inset light and shade | R1 | outline | R10 while its card is open | n/a |
| Colour or image block of a master tile | a tile (inset light and shade), 6px corners | R8 (10% inwards, inset kept) | outline | R10 | n/a |
| Typeface of the Typography tile | text | underlined | underlined and outline | underlined while its card is open (no halo) | n/a |
| List item of a tile | plain | R5 (underlined) | underlined and outline | - | n/a |
| Page and carousel arrows | the blue triangle | grows 20% along its direction | the same | - | n/a |
| Back button, tool buttons of the header | the ground, a line | R7 | outline | the open one marked | R12 |

## 3. States that change what everything else does

| State | What changes |
|---|---|
| A card just made (still open) | No error indicator (R11 is held back until it is closed). |
| An incomplete card | R11 on its tile and its line in the tile's list. |
| A completed activity | The card is grey (R12) wherever it floats, in four greys; its cells keep their shapes; the Completed row is live. |
| A card that opened another | The tile or box that opened the open card has R10. |
| A card that is open | R13 for what pops up inside it; Escape closes the popup first, then the card. |
| A section with a fold arrow | Starts closed (the fold arrow shows the way). |
