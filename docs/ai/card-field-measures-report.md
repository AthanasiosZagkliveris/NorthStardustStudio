# Card fields: sizes and set-up, measured

Status: **snapshot**, updated 2026-10-12.

Measured in the browser on the Lumen & Loom example (an opened card, 480px wide, 18px text). Positions are from the left edge of the card's name cell; widths and heights in px.

## The standard (what most cards already do)
- **Name cell** 388 wide, 44 high. **Every cell** 44 high, 18px text.
- **Side-label rows** (Start date, End date, Category, Group, Rent, Supplier name, Performer, Resources, Responsible, Useful life, Warranty): the label in the 177px column, the cell at **+189**, **199** wide.
- **Pair rows** (Qty | Price | currency | Frequency): Qty 56 at 0, Price 109 at 68, currency 79 at 189, Frequency 120 at 268.
- **Description / Usage** text boxes: 388 wide.

## Business cards (8 kinds: software resource, rented resource, offering resource, channel resource, activity, partner, workspace, founder), 50 controls
| Field | How many | Left / width / height | Matches | Change |
|---|---|---|---|---|
| Start / End / Warranty date | 10 | 189 / 199 / **40** | position and width yes, height no | height 40 -> 44 (all 10) |
| Category, Group, Rent, Supplier name, Performer, Resources, Responsible, Useful life | 19 | 189 / 199 / 44 | all 19 | none |
| Status | 5 | 189 / 159 / 44 | yes: the picker plus its "+" in the x column (40) is the 199 | none (by design) |
| Qty, Price, currency, Frequency | 4 cards | as the standard | 4 of 4 (the channel card's Frequency is 107: that card is 12px narrower all through) | channel cards: take the 12px back |
| Founder: Salary, Frequency, Working, Delivery | 4 | 108 / 44, two columns | own grid (by design) | none |
| Founder: Start date | 1 | 120 / **299** / **40** | starts where Frequency starts (as asked); wider than the 108 pair | width: stays (needs 146px for the day) |

Result: **40 of 50 fields match exactly; 10 date cells differ by height (40, not 44); 5 Status cells differ by width.** Those are two shared rules, not 15 separate fixes.

## Legal Entity: expense card (5 controls)
Name 380 (Business 388). Date at 196 / 184 / 40 and Frequency, Responsible at 196 / 184 / 44, Cost 0 / 184. Business puts these at 189 / 199.
**None of the 5 match** the Business geometry: label column 7px further right, cells 15px narrower, name 8px narrower, Date 40 high. They are consistent with each other (two 184 columns). **Change:** name 388, side-label cells 189 / 199, Date 44 high; Cost stays in the left half.

## Brand cards (colour, typeface, image)
- Colour: Role at **99** / 290; the colour-code box is 44 wide with **14px** text (everything else 18px).
- Typeface: Role at **79** / 309: a different label column from the colour card's.
- Image: name **453** wide (no number column) against 388.
**None match the Business cards; the colour and typeface cards do not match each other.** **Change:** Role at 189 / 199 on both; the colour-code text 18px; image name 388.

## Not measured
The Legal requirement card and the Strategy theme card (my browser run did not open them). By eye the requirement's Type picker is 282 wide, not 199.

## Proposed order of work
1. Date cell height 44 (one rule, fixes 10 + 3).
2. Status picker 199 wide (one rule, fixes 5).
3. Legal expense and requirement cards onto the Business label column and widths.
4. Brand cards onto the same label column; the colour-code text size; the image name width.
5. The channel cards' 12px.
