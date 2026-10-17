# Customer Engagement: the tables and the action markers

The layout of the Customer Engagement page's tables, moved from the layout rulebook (`docs/ai/layout-rules.md`, section 7) on 2026-10-17 so the rulebook holds rules and this holds the page's specification. The rules of the rulebook (sizes, gaps, the one x, the reactions) apply to everything here.

- **Customer Engagement**: "1. Customer Channel" and "2. Customer
  Relationship" hang their fold arrows in the Segment card's arrow column
  (under its arrow), so their numbers stand at the Segment's number. In
  the Customer Channel table every cell (heads, category rows, nested
  channels, cells) has 12px (`--space-field`) between its edge and what
  stands in it, at the sides and top and bottom. While that table has its four
  columns (its box 1300px or wider) JOURNEY STAGE and CHANNEL are FITTED to their
  dropdowns: the Journey Stage picker is as wide as its longest option ("Support &
  Follow Up", hugging, sized for every stage so it does not change width as stages
  are chosen) and its column exactly that picker, the 12px gap, the x and the 12px
  cell padding at both sides; the Channel column fits the widest category or channel
  name preset ("Booking / Registration Page", the nested mark, the "i" and the x
  beside it) the same way; the Journey Stage column is also never narrower than its
  "+ Add Journey Stage" button on ONE line (the button's measured width, 272px at 18px,
  and the cell padding at both sides: 299px). A stage row is ONE block: the dropdown
  FILLS the track from the cell's 12px padding to the x (never narrower than its
  longest option; it does not hug), the x 12px from it, and the Add button spans from the
  dropdown's left edge to the x's right edge, the same widths on every row; OFFERINGS and ACTION share the rest, 45% / 55%. The widths
  are MEASURED in the font the table is drawn in (`useChannelColumns.ts`, sums in
  `ChannelTableColumns.ts`, set as `--col-channel`, `--col-stage`,
  `--col-offerings`, `--col-action` on the table and again on resize), never
  guessed; no picker shows a cut word. They are measured from a hidden copy of one
  stage row, so they are the same whether or not any category is open (a table with
  every category folded has no stage row to read) and the Channel Category picker
  ("Physical Delivery", the widest) never wraps in its category row. Narrower, the table stacks as before. The
  Customer Relationship table keeps its own columns. Under that table, "Channel
  resources" is a fold of its own (the section-head pattern: arrow in the
  card's arrow column, caps title, the table starting at the title's text;
  open by default, not drawn when the Segment has no channel resource): a
  read-only table (`.channel-resource-table`, derived by
  `buildChannelResourceTable`, never stored or counted) on the channel
  table's ground, hairlines and 8px corners, 12px (`--space-field`) from
  every cell's edge to its text, text wrapping, scrolling only inside its
  own box under 1050px; its columns are Resource, Cost,
  Behaviour, Channel, Offerings, Journey stages and Actions (no Status,
  "Where it lives" or "Also reaches" column). A cell holding two or more
  values (the Channel cell: the channel the resource was made on first, then
  each other channel it shows in through an action; Offerings; Journey
  stages) lists them one under the other as bullets
  (`.channel-resource-bullets`: the drawn bullet, `--bullet-size` /
  `--bullet-gap`), every item styled alike; a single value is plain text with
  no bullet, indented by the bullet's width and gap (`.channel-resource-single`)
  so the text of every cell of a column starts at ONE x. The Actions cell has NO
  bullets: its "#N" buttons sit side by side and wrap between buttons
  (`.channel-resource-chips`), each button one line (`white-space:nowrap`). Column
  widths come from the content (`.channel-resource-col-*` minimums; Cost and
  Behaviour on one line); the table fits 1600px with no inner scroll and wraps
  inside its box below that. A row's name carries the
  resource's warm colour
  (4px stripe and dot) and a hover wash, and its footer line is a summary
  of the rows, not a forecast (its Offerings
  column names only the Offerings the card links, "—" for none or for an
  Infrastructure / Workspace card, never "All Offerings"). In
  the Customer Relationship table, an Offering's block starts at the "1."
  of "1. OFFERING -" (the PROFILES: row and the Relationship column's
  cells); the kind word and "PROFILES:" (colon right after, 16px before
  the first link) are caps titles, and the Offering's name is an
  underlined link to it on the Foundation page, like a Profile's name; a Relationship Type's arrow stands under the
  Offering's (the band's 12px inset, the same 36px arrow, its 4px gap),
  and its picker [x], then its Purpose, then "+ Add Relationship Type"
  (from the picker's edge to the x's) start at that number; those cells
  stand 12px apart (the Purpose's label 6px from its box) and the x 12px
  from its picker. The Engagement Strategy
  is two parts (the table's second and third columns): the Journey Stage and
  its Goal / Approach. The stage band (fold arrow, name) and the GOAL (the
  "Goal" label with its "i", then Get / Keep / Grow) are cells of ONE row,
  the Goal centred on the band's 36px line like the stage name (mid-line
  rule), in the band's ground; the Approach (label and text box) follows
  under the Goal in the same column, beside the kind-of-channel lists. Under
  a journey stage, the kind of channel ("Social Media") and its list start at the
  stage's TEXT ("Discover", past its fold arrow and gap): the label's text
  and each bullet's left edge stand on that x. A stage's fold arrow folds ONLY
  those kind-of-channel lists; the Goal and the Approach stay (a folded stage
  keeps one row, with the Approach in the second part). Every Journey Stage band
  STARTS FOLDED (the item folds, `useItemFolds`: closed until opened; the choice is
  kept for the session as the other item folds are).
  The Segment card has NO head row of its own: its fold arrow (which still
  folds the whole card) stands in the card's arrow column next to "1.
  SEGMENT", the first reference column's heading, and the card's body
  (the references, then the two sections) starts at the body edge, as under
  any head. The references stand straight on the card in no box and have no
  Show / Hide button: three columns, 12px apart (`--space-column`), SEGMENT
  (the card's number before it, "1. SEGMENT", number then word at the 8px
  head gap), PROFILES and OFFERINGS, all caps titles, headings on one line
  and baseline; every arrow, the Segment's too, starts folded. Each column
  has ONE left edge: its title's text ("1." / PROFILES / OFFERINGS), every
  link's text and every details block's text (headings and paragraphs)
  start at it. Each link's fold is the ordinary 36px fold arrow at the RIGHT
  of the link's text (8px after it, centred on the link's FIRST line; if
  the name wraps it stays on that first line, at the link box's right edge,
  and never follows the name or the unfolded details down). Its right edge
  never passes the column's right edge, which is 12px (`--space-column`)
  short of the next column's hanging rule (the last column, Offerings: 12px
  short of the Segment card's right side, inside its border -- the same
  12px rule): the link is at most the column less `--reference-arrow-room`
  (36px + 8px) and wraps inside that. Not an arrow in front of it,
  so no arrow column is reserved; the details stand directly under the link,
  and their vertical rule is not content: it hangs 12px before the text
  edge (the Segment's in the card's arrow column; the Profiles' and
  Offerings' in a 12px strip reserved in their tracks). The three contents are equal in
  width, the columns 12px apart. Folded, the card is one row: its arrow, "1. SEGMENT" and the
  Segment's name (so it stays identifiable); its accessible names are the
  arrow's "Segment N" and the card's group name "Segment N: name". In an Action list the x (32 x 32) is pinned to the box's right
  edge on every row, 6px in from the top and right; the row's
  symbols stand under it (see Action markers).
- **Action markers** (Customer Channel, `ActionMarkers.tsx`, `ActionOrder.ts`,
  `numbered-list.css`). SHAPE says the kind of tie, COLOUR says which one.
  A SHARED symbol (link icon) stands on every row of an action placed in more
  than one row; a LINKED-TO-RESOURCE symbol (tag icon) on every action linked
  to a resource (a resource's own card has NO symbol: its summary line says
  "no actions", "action" or "N actions" in words). Each shared action takes one of
  six COOL hues (`--shared-hue-1..6`: teal, blues, violets; position among the
  Segment's shared actions in table order), each resource one of six
  WARM hues (`--resource-hue-1..6`: amber, orange, rust, red, rose, pink;
  position among the Segment's linked resources), as `.tint-shared-N`
  / `.tint-resource-N` (global.css; the card-family tokens `--tint-ink`,
  `--tint-mark`, `--tint-ground`, `--tint-wash` from `--theme-*`, never a
  per-theme value). Glyphs and lines >= 3:1 and chip text >= 4.5:1 in light,
  sepia and dark (greens are left out of the palettes: they fall under 3:1).
  PAST SIX the hues come round in a PATTERN with a contrasting second colour
  (`--pattern-alt`, colors.css: dark ink in light / sepia, light ink in dark, >= 3:1
  on the surface, as every hue's ink is; `actionPattern.test.ts`): the 7th to
  12th place in diagonal 4px STRIPES (`.tint-pattern-stripes`: the hue against
  `--pattern-alt`, repeating-linear-gradient 45deg, 4px bands), the 13th to 18th
  in a CROSS-HATCH (`.tint-pattern-hatch`), then round again (`markHue`,
  `markPattern`, `markTint`, `connectionPaint` in ActionOrder.ts; the paint is
  `--tint-fill`). The pattern is on the symbol (a 2px ring of it round the
  glyph), the 4px lines, the resource card's stripe, its chips' left edge and
  the Channel resources table's stripe and dot.
  The same colour is on the symbol, on a 4px CONNECTION LINE inside the action
  cell (shared action: the RIGHT edge, identical on every row it stands in;
  resource: the LEFT edge, one segment per resource, split top to bottom in equal
  parts when an action has two or more; both lines when it is both) and, for a
  resource, on its card (4px left stripe, tinted chips). Never colour alone:
  the shapes differ and every symbol has an aria-label.
  An ACTION LINE is two text lines high at least (70px), and under its list
  number stands its TOTAL ACTION ORDER NUMBER ("#12", small, muted, bottom of the
  cell): the count of the Segment's DISTINCT actions down the table (category,
  channel, stage, line), a shared action numbered where it first appears and
  showing that SAME number on every row it stands in (1..N, no gaps); numbers
  never change while rows are folded or isolated. Typing "#12" (hash and digits)
  in an action line offers action 12 as its one suggestion and Enter or a click
  shares it there (the same action; a number that refers to nothing, or to an
  action the row already holds, offers nothing and the text stays as typed).
  A line left EMPTY disappears when focus leaves it (a moment later, so a click
  beside it is not lost) unless it is the row's only line, which keeps its one
  empty line; Enter still opens a new line to type in. The x (32 x 32) stays 6px in from the top and right and the
  SYMBOLS (24 x 24 hit area, 16px glyph, absolutely placed so nothing moves on
  hover) stand UNDER it: one symbol directly under; two, text of 1 or 2 lines:
  side by side under it; two, 3+ lines: one under the other; two, one line that
  fits with both beside the x: side by side level with it (the list sets
  `data-marks` = under | pair | stack | beside on the row from the text's measured
  size, at a width that does not depend on the placement, so it cannot flip
  back and forth). The text keeps its full width except the 16px (pair) or 48px
  (beside) the symbols need. Pointing at (or focusing) a symbol shows the app's
  tooltip (`.app-tooltip`) ABOVE its ACTION CELL (the line's box), its RIGHT edge
  on the cell's right edge (below the cell only with no room above, still right
  aligned), nowrap, hugging its one line -- "Shared in N places", "Linked to
  <resource>", "Linked to N resources" -- and Escape closes it.
  A CLICK ISOLATES (one at a time; a second click, Escape (consumed, so it is not
  Back) or the note in the title row restores everything and returns the keyboard
  to the symbol; `aria-pressed` on the pressed one): every action line not
  involved collapses (height and opacity, ~.2s, none under reduced motion; hidden
  to the keyboard once shut), the stage rows, channels and categories left with
  none are not drawn (categories folded shut are shown open meanwhile, their fold
  untouched), and EVERY Add button/row of the Segment's table goes (+ Add
  resource, offering, journey stage, channel, channel category, Link an action).
  NOTHING IS CREATED while a Segment is isolated: no creation path works in its
  table (Enter in an action line opens no new line, the Links tick of a channel
  cannot open a new box and its list takes no new line, a click-to-pick "Link an
  action" in progress ends); the text already there stays editable. A CLICK ON
  EMPTY SPACE also restores everything (focus back on the symbol, as the other
  exits): anywhere that is not a control or a cell's content -- the page's
  background, the table's head, a blank part of a cell. A button, field, action
  line (number, text and symbols), resource card or chip, list, tooltip or label
  keeps the isolation; so does a press that began on one and was let go outside it.
  Shared isolation also hides the resource cards and "Costs: ..." lines not linked
  to the action. Resource isolation (from an action's symbol, or the "action" / "N actions" words
  of a resource card's summary line) draws only the isolated
  resource card(s) in the channel cells (no other card, no cost summary), each
  with ALL its actions as chips, the chip of the action clicked from ringed in
  the resource colour and bolder (none, if clicked from the card). The note at the
  title row's far end names everything, wrapping rather than cutting:
  "Shared: Instagram, Pinterest x" (the channels holding the action, in table
  order) or "Linked: Shopify Basic, Klaviyo x". A resource card's chips read
  "#<total order number> <action words>" on one line, ellipsised (the full text is
  the title); typing "#12" or just "12" in "Link an action" finds an action of the
  Segment's WHOLE table -- any channel's, not only the card's own (the exact number first
  and selected, then numbers that start with it, then words); the click-to-pick takes any
  action line of that Segment's table. A resource may so be linked to an action that stands
  only in another channel: its card stays in its own channel's cell and shows in the cell of
  every channel whose rows hold the action. A card shared into another channel's cell reads
  its name and cost, then "via shared action" under them, in words (no symbol): "shared action" is a
  link (the notepad-text-button style of "# Link an action") that goes to that action's line
  and puts the caret in it, the same jump as the "#N" buttons of the Channel resources table;
  shared through several actions it reads "via shared actions #3 #7", one such link each.
  Isolating a SHARED action shows every card linked to it in every channel kept: at home in
  the channel it was made on, "via shared action" in the others. Starting an isolation takes the top of that Segment's Customer
  Channel section (its title row, with the note) to just under the app header
  (smooth, none under reduced motion); ending one scrolls nothing.
  Pointing at a shared row lights its twins, and at a resource card or symbol its
  actions, on the tint's wash.
- **Demand & Conversion** (Customer Engagement): what the block is for
  and where its Expected Sales are used are the points of one "i" on its
  title, not paragraphs around its fields.
  A Customer Source card's fields stand on one row (Customer Source,
  Estimated, then the figure or the calculation's figures), each as narrow
  as it can be: the pickers hug their longest option, a number takes the
  step its largest value needs (XS to six characters, Code to ten), a cell
  gap apart, labels above, tops aligned; a row too long for the card wraps
  from the same left edge (at 768px every type with a calculation does,
  "Other" does not). The Basis stays under them at the card's width.
  Under the sources and their add button, one row: Customers Buy (its
  picker hugging its longest option) and, for an Offering kept until
  cancelled, Cancel / Month (%) (XS), labels above, tops aligned; then
  the Expected Sales, Assumptions and Channels That Bring Them.
