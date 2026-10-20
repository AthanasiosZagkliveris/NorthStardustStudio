# The tooltips: what has one, and what it says

Status: **current design**, updated 2026-10-20.

A tooltip is a small dark label above a control, in the app's own style (`TooltipBox`, `src/components/controls/Tooltip.tsx`), never the browser's own (a white rectangle with a black frame and letters, in the system's mode). One host draws every one (`TitleTooltips`, `src/components/controls/TitleTooltips.tsx`, mounted once in `App.tsx`): it takes the `title` of an element away and shows its words only by the rules below.

## 1. The rules

1. **Only a control that is pressed has a tooltip**: a button, a link, a tab, a menu item, a summary. Never a field (it has its label and shows its value), a dropdown cell (its value is on it), a tick (its words), a tile or a card (they are text), a label, a heading, a count.
2. **An icon with no words of its own says its name**: the "i", the ×, the "+", the arrows, the funnel, the calendar button, the symbols. Its name is its accessible name (`aria-label`), so no place writes a `title` for it.
3. **A control whose words are cut short says them whole**: a link or a value that runs past its place and is cut (an ellipsis, or a line that moves).
4. **A control says what its words do not**: the key it answers to ("Previous card (←)"), where it goes, what it changes ("Set Computers back to 3 years"); three words or more that it does not already show.
5. **Never what the control already shows**: its text, its name or its value. A `title` that only repeats the name is not written.

A tooltip is one line, at most 360px wide, above the control (below it where there is no room above), its middle under the pointer, kept inside the window. It opens under the pointer and on the keyboard focus, closes on Escape, on a press and when the pointer leaves.

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
| A labelled button (`AddButton` wide, the Export buttons, Refresh) | only by rule 4 | what it does that its word does not ("Set every group back to its default years") |
| A text link (`TextLink`) | only by rule 3 or 4 | the whole text where it is cut |
| A dropdown cell, a date cell, a text box, a number cell | no | (its value is on it; the "i" explains the field) |
| A tick (`TickField`) | no | (its words are the label) |
| A tile, a card, a heading, a label | no | (text) |
| A tab, a segmented option (`SegmentedToggle`) | no, its word is on it | |

## 3. Where it is written

`title` is the way a place gives words to the host (`title="..."` on a button or a link); the host removes it, gives the control its name (`aria-label` where it has no words, `aria-description` where it has) and decides by the rules. A place never writes a `title` that is its `aria-label`. The Roadmap's bars, the card tiles' tips, the action symbols and the noted fields draw their own through `useAboveTip` (the same box, the same placement).
