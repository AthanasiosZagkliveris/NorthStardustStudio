# Pop-ups: six categories

Everything in the app that appears over the page when something is pressed, pointed at or happens, gathered from the code as of 2026-10-18 and placed in **six categories**. Each category has one set of characteristics (position, trigger, size, style, how it closes); a new pop-up joins the category it fits and takes its characteristics, it does not invent its own. The reactions of what is inside a pop-up are in `20-reactions.md`.

## 1. The six categories

| # | Category | What it is for | Position | Trigger | Size | Style | Closes |
|---|---|---|---|---|---|---|---|
| P1 | **List** | Choosing one value from several | Under the cell that opened it (above, where there is no room below); its left and right edges are the cell's | A press on a picker, a typed letter in a suggested input | Exactly the cell's width; as tall as its options, then scrolls | The card's light surface, 8px corners, no stroke, the drop shadow; the chosen row marked, the highlighted row filled | A choice, Escape, a press outside |
| P2 | **Panel** | Choosing or setting something that is more than a list (a day, a month, a colour, a set of filters, a menu of actions) | Under the control that opened it, left edges level (kept inside the window) | A press on the cell's button (the calendar button, the colour box, the funnel, the sort and add menus) | Its content's own: the calendar and the colour card are 260px wide; a menu is as wide as its longest line | The calendar card's surface: the card ground, 8px corners, 12px padding, 12px gaps, the drop shadow; its cells are **one size, 44px tall** | A choice, Escape, a press outside |
| P3 | **Note** | Saying what a thing means (the "i", the help of a card) | Under its "i", the text glued to the label's last word | A press on the "i" | Up to a text column wide, grows with its bullets | The surface of a list; bullets; no controls inside | A second press, Escape, a press outside |
| P4 | **Tip** | Naming or measuring what is pointed at (a long name, a bullet of a rail, a record time, a roadmap bar) | Over or beside what it names; never covers the pointer | The pointer on it, or the keyboard's focus; nothing to press | One line (a roadmap tip a few) | Dark ground, light text, small corners; no controls | The pointer leaves |
| P5 | **Layer** | Working in a larger place without leaving the page: a tile's dialog, a floating card, the search, the Notes panel, the calendar | Over the page: a dialog over its section, a floating card over the other half of the page (or under the card above it), the search centred, the Notes panel from the right edge | A press on a tile, a link, a button of the header | A dialog: its section's width; a card: 328 to 668px; search 640px; Notes panel `--notepad-width` | The card's own hue; the page behind shaded (the shade covers the tiles under a floating card, fixed to the window); a card shows its record time | Back, Escape (closes every layer at once), a press outside |
| P6 | **Message** | Saying what happened or asking before it does | A confirmation: centred over a shade; an undo toast: the page's foot; a status line: where it happened | A change that needs asking about (a generated card left without use, a removal), an action that can be undone, a result | A confirmation 460px wide; a toast one line | A confirmation: the surface, two buttons (Continue, Cancel), `role="alertdialog"`; a toast: dark, one action | A button, Escape; a toast after a few seconds |

## 2. Where each one is made today

| Pop-up | Category | Component |
|---|---|---|
| Dropdown cell's list (Status, Group, Frequency, Currency, Role...) | P1 | `OptionPicker` |
| Suggestions under a name or a list line | P1 | `SuggestedInput`, `NumberedListInput` |
| Theme switch list (the header's Auto / Light / Dark) | P1 | `ThemeSwitch` |
| Channel resource list | P1 | `ChannelResources` |
| Notes picker (which field a note links to) | P1 | `NotepadPicker` |
| Calendar (day) | P2 | `DateCellInput` |
| Month and year | P2 | `MonthYearPicker` |
| Colour picker (square, hue bar, code picker, HEX / R G B / H S L cells) | P2 | `ColourPicker` |
| Founder's Responsibilities funnel | P2 | `ResponsibilityFilter` |
| Calendar funnel | P2 | `CalendarFunnel` |
| Reorder menu, sort menu, add Theme menu | P2 | `ReorderControls`, `AddThemeMenu` |
| The "i" of a label, a title, a figure | P3 | `InfoNote` |
| A card's guidance (the arrow that drops it down) | P3 | `CardTitleHelp` |
| A long name's full text, a bullet's name in a rail | P4 | `useAboveTip` (`Tooltip.tsx`), the rail's bullet tip |
| A roadmap bar's dates, an action marker's tie, a noted field's note | P4 | `StrategicRoadmapEditor`, `ActionMarkers`, `NotedHover` |
| A tile's dialog (its cards as tiles or a table) | P5 | `SectionTiles` (`SectionTileDialog`) |
| A floating card, or a pair, with its rail and arrows | P5 | `SectionTiles` (`FloatingCards`) |
| Search | P5 | `SearchDialog` |
| Notes panel (and Card notes) | P5 | `NotepadPanel` |
| The Organization's calendar | P5 | `OrganizationCalendarPanel` |
| Generated card left without use: Continue / Cancel | P6 | `BusinessCapabilityEditor` (alertdialog) |
| Removal, leave and delete confirmations | P6 | `SystemConfirmation` |
| Undo toast | P6 | `UndoToast` |
| Status lines (documents, a list's count) | P6 | `role="status"` lines |

## 3. What every pop-up shares

- It is a layer over the page and never moves what is under it; a P1 to P4 pop-up is cut by nothing but the window.
- Escape closes the innermost first; a press outside closes a P1 to P4; a P5 closes by Back.
- A P2 and a P5 hold the keyboard while open, and give it back to what opened them.
- What is inside follows the reactions: a cell glows under the pointer and rings when focused (`20-reactions.md`, R1, R2), a button is a header-tool button or a "+" family button, a Back is **the Back button** (`BackButton`, one component and one look everywhere).

## 4. Decisions for the owner

- P2's panels are 260px wide today for the calendar and the colour card; a menu is as wide as its longest line. One width for every P2 panel would be simpler: say if wanted.
- A P4 tip is not announced to a screen reader except by the control's own label; the label already says it.

## 5. Where each category appears: placement and the order of fallbacks

Words: **below / above** (vertical, outside the control), **beside** (left or right of it), **inwards** (over what stands behind it, towards the middle of the page), **outwards** (towards the nearest edge of the window), **inside the border** (within the frame of its owner: a card, a dialog, a chapter), **overlay** (over the page, shading it).

| Category | Content | Preferred place | Aligned to | If there is not room (in this order) | Never |
|---|---|---|---|---|---|
| P1 List | Structure: a column of options | Below its cell | Its cell's left and right edges | 1. above the cell; 2. below, capped to the window and scrolling | Wider than its cell (a long option wraps); covering its own cell |
| P2 Panel | Content: a calendar, a colour card, filters, a menu | Below its control | Its control's left edge | 1. above; 2. shifted inwards until it is inside the window (its width never changes); 3. capped and scrolling | Moving the page; covering its control |
| P3 Note | Content: text and bullets | Below its "i", the text glued to the label | The label's left edge | 1. above; 2. inwards (the nearest edge of its owner or the window); 3. capped and scrolling | Controls inside; staying open when another opens |
| P4 Tip | Content: one line | Above the pointer or its target | Centred on the target | 1. below; 2. beside, on the side with room; 3. shifted inwards | Covering the pointer; taking a press |
| P5 Layer: dialog | Structure: a section's tiles | Overlay, over the area of its section (inside its chapter's border) | The section's edges | 1. the part of the section the window shows (under the header, above the footer); 2. the whole window | Covering the app header |
| P5 Layer: floating card | Content: one card or a pair, its rail and arrows | Over the OTHER half of the page than its tile (outwards from its tile), its top on the first row of tiles | Centred on that half | 1. the other half's nearest column; 2. below the header (the stack scrolls inside); 3. the window, centred | Covering its own tile's half; moving the page |
| P5 Layer: side panel (Notes) | Content: a list | Overlay from the right edge, full height | The window's right edge | 1. its own width (`--notepad-width`); 2. the window's width minus 32px | Pushing the page |
| P5 Layer: search | Content: a field and its results | Centred, overlay | The window's centre | 1. 640px; 2. the window's width | |
| P6 Message: confirmation | Content: a question and two buttons | Centred over a shade | The window's centre | 460px, then the window's width minus the gutters | Anything but a button closing it |
| P6 Message: toast | Content: one line and an action | The foot of the page, inside the window | The left gutter | Stacked, newest on top | Covering a field being written in |

**The hierarchy of restrictions**, the same for every category, from the strongest:
1. **The window**: nothing stands outside it (nothing is cut by the left, right or bottom edge; only the app header cuts a layer).
2. **The owner's frame**: a pop-up of a card stays inside the card's chapter or dialog where it can; it leaves it only to stay inside the window.
3. **Its control**: it never covers the control that opened it (a List and a Panel go above when below has no room).
4. **Its own size**: its width is kept; its height is capped and scrolls when no side has room.
5. **The reading order**: where two places are free, the one below or to the right (the way the page is read) wins.
