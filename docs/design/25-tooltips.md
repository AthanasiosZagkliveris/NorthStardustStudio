# The tooltips: what has one, and what it says

Status: **current design**, updated 2026-10-21.

A tooltip is a small dark label above a control, in the app's own style (`TooltipBox`, `src/components/controls/Tooltip.tsx`), never the browser's own (a white rectangle with a black frame and letters, in the system's mode). One host draws every one (`TitleTooltips`, `src/components/controls/TitleTooltips.tsx`, mounted once in `App.tsx`): it takes the `title` of an element away and shows its words only by the rules below.

## 1. The rules

1. **Only a control that is pressed has a tooltip**: a button, a link, a tab, a menu item, a summary. Never a field (it has its label and shows its value), a dropdown cell (its value is on it), a tick (its words), a tile or a card (they are text), a label, a heading, a count.
2. **An icon with no words of its own says its name**: the "i", the ×, the "+", the arrows, the funnel, the calendar button, the symbols. Its name is its accessible name (`aria-label`), so no place writes a `title` for it.
3. **A control whose words are cut short says them whole**: a link or a value that runs past its place and is cut (an ellipsis, or a line that moves).
4. **A control says what its words do not**: the key it answers to ("Previous card (←)"), where it goes, what it changes ("Reset Computers to 3 years"); three words or more that it does not already show.
5. **Never what the control already shows**: its text, its name or its value. A `title` that only repeats the name is not written.

A tooltip is one line, at most 360px wide, **in one place for every control**: its bottom 6px over the control's top and its left edge on the control's left edge (where every pop-up cell starts) (its right edge on the control's right edge where the control says so), under the control (6px) only where there is no room above, kept inside the window. It **never follows the pointer**. It opens under the pointer and on the keyboard focus, closes on Escape, on a press and when the pointer leaves. (This is the same place for the keyboard and the pointer: `aboveTipPosition`, `Tooltip.tsx`.)

### How its words are written (2026-10-21)

A tooltip says what a click does, in one sentence that begins "Click to ...": "Click to remove Offering 2", "Click to show Include", "Click to learn about Revenue", "Click to search, or press Ctrl+K". A control's name or title is written as a name (what a screen reader says: "Remove Offering 2", "Revenue: what this means"); one function (`tipWords`, `TitleTooltips.tsx`) turns it into the sentence, so no place writes its own and no two say the same thing two ways.

| The name or title | The tooltip says |
|---|---|
| X: what this means (the "i") | Click to learn about X |
| Minimize X, Fold X | Click to hide X |
| Maximize X, Unfold X | Click to show X |
| Remove X, Delete X, Add X, Open X, Close X, Move X up, Show X, Hide X, Reset X, Exit X ... | Click to remove X, delete, add, open, close, move, show, hide, reset, exit ... |
| Previous X, Next X | Click to go to the previous X, Click to go to the next X |
| Sort X (the funnel) | Click to filter and sort X |
| Low to high, High to low (the cost order) | Click to order the costs from low to high, from high to low |
| a name followed by a key: Search (Ctrl+K), Exit focus (Escape), Previous card (←) | the sentence, then ", or press Ctrl+K" |

The app's own terms keep their capitals (Offering, Resource, Status, page names); no full stop; one line. A tile's circle says what it is, then what a click does: "Supplier: Hackney. Click to show only what Loom is connected to."

## 2. The list: which controls have one, and what it says

| Control | Has one | Says |
|---|---|---|
| The "i" (`InfoNote`) | yes (rule 2) | "<label>: what this means" |
| The × (`RemoveButton`) | yes (rule 2) | "Remove <what>" |
| The "+" box (`AddButton` box) | yes (rule 2) | "Add <what>" |
| The fold arrow (`FoldArrow`), the label arrow | yes (rule 2) | "Minimize <what>" / "Maximize <what>" |
| The navigation arrows (`NavArrow`) | yes where it says more | the key: "Previous card (←)"; a page arrow only where it goes somewhere that is not a page |
| The funnel (`FunnelButton`) | yes (rule 2) | what it filters |
| A header tool (`header-tool`) | no, its word is on it | (an icon-only header, under 1100px, says its word) |
| A labelled button (`AddButton` wide, the Export buttons, Refresh) | only by rule 4 | what it does that its word does not ("Reset every group to its default years") |
| A text link (`TextLink`) | only by rule 3 or 4 | the whole text where it is cut |
| A dropdown cell, a date cell, a text box, a number cell | no | (its value is on it; the "i" explains the field) |
| A tick (`TickField`) | no | (its words are the label) |
| A tile, a card, a heading, a label | no | (text) |
| A tab, a segmented option (`SegmentedToggle`) | no, its word is on it | |

## 3. Where it is written

`title` is the way a place gives words to the host (`title="..."` on a button or a link); the host removes it, gives the control its name (`aria-label` where it has no words, `aria-description` where it has) and decides by the rules. A place never writes a `title` that is its `aria-label`. The Roadmap's bars, the card tiles' tips, the action symbols and the noted fields draw their own through `useAboveTip` (the same box, the same placement).

## 4. The tooltips the code writes itself (a `title`), as of 2026-10-21

The icons' tooltips (the "i", the ×, the +, the arrows, the funnel, the fold arrows) are their accessible names turned into the sentence of section 3 by `tipWords`. The words a place writes by hand are names too, and are said the same way:

| Where | Written as | Said |
|---|---|---|
| Focus button (header) | Show the page alone | Click to show the page alone |
| Focus button, while on | Exit focus (Escape) | Click to exit focus, or press Escape |
| Search button | Search (Ctrl+K) | Click to search, or press Ctrl+K |
| A card a channel made, in the channel's list | Open the card created by the channel <channel> | Click to open the card created by the channel <channel> |
| A card taken off a channel | Take it off the channel, and its card off Offering's Capability | Click to take it off the channel, and its card off Offering's Capability |
| Global Settings, a group's years | Reset <group> to <n> years | Click to reset <group> to <n> years |
| Global Settings, every group | Reset every group to its default years | Click to reset every group to its default years |
| A name that opens a card or a page | Open <name> | Click to open <name> |
| A step of the carousel | Previous <what> (←) / Next <what> (→) | Click to go to the previous <what>, or press ← |
| The Inventory's funnel | Sort all tiles | Click to filter and sort all tiles |
| The Inventory's chip × | Show all tiles again | Click to show all tiles again |
| A fold arrow of the funnel | Unfold Include | Click to show Include |
| A tile's circle | <symbol>: <name> | <symbol>: <name>. Click to show only what <card> is connected to |

### Look of a tooltip

One pop-up cell of the 32px pitch (the words centred, 12px at each side), the small size (14px) at weight 500, the tooltip's own ground; over a card its ground and line are mixed with the card's hue (the pop-ups' rule, `review-criteria.md` section 6).
