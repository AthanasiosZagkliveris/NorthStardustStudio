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
| A long name's full text, a bullet's name in a rail | P4 | `AboveTip`, the rail's bullet tip |
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
