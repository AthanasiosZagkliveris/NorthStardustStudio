# The tooltips: what has one, and what it says

Status: **current design**, updated 2026-10-20.

A tooltip is a small dark label above a control, in the app's own style (`TooltipBox`, `src/components/controls/Tooltip.tsx`), never the browser's own (a white rectangle with a black frame and letters, in the system's mode). One host draws every one (`TitleTooltips`, `src/components/controls/TitleTooltips.tsx`, mounted once in `App.tsx`): it takes the `title` of an element away and shows its words only by the rules below.

## 1. The rules

1. **Only a control that is pressed has a tooltip**: a button, a link, a tab, a menu item, a summary. Never a field (it has its label and shows its value), a dropdown cell (its value is on it), a tick (its words), a tile or a card (they are text), a label, a heading, a count.
2. **An icon with no words of its own says its name**: the "i", the ×, the "+", the arrows, the funnel, the calendar button, the symbols. Its name is its accessible name (`aria-label`), so no place writes a `title` for it.
3. **A control whose words are cut short says them whole**: a link or a value that runs past its place and is cut (an ellipsis, or a line that moves).
4. **A control says what its words do not**: the key it answers to ("Previous card (←)"), where it goes, what it changes ("Reset Computers to 3 years"); three words or more that it does not already show.
5. **Never what the control already shows**: its text, its name or its value. A `title` that only repeats the name is not written.

A tooltip is one line, at most 360px wide, **in one place for every control**: its bottom 6px over the control's top and its middle on the control's middle (its right edge on the control's right edge where the control says so), under the control (6px) only where there is no room above, kept inside the window. It **never follows the pointer**. It opens under the pointer and on the keyboard focus, closes on Escape, on a press and when the pointer leaves. (This is the same place for the keyboard and the pointer: `aboveTipPosition`, `Tooltip.tsx`.)

### How its words are written

1. A verb first, in the imperative, for what a press does ("Show the page alone", "Reset every group to its default years", "Take it off the channel"); a noun phrase for what a control is or shows ("Number of instalments, from 1 to 99", "Recommended size: 36 to 48 px").
2. The app's own terms are capitalised as everywhere else in the app (Offering, Resource, Status, Infrastructure & Capability, page names); no other word is.
3. No full stop, no colon that joins a verb to its object, no brackets for a sentence (a comma instead). Brackets only for a key: "Search (Ctrl+K)", "Exit focus (Escape)", "Previous card (←)".
4. "Reset ... to ..." for a return to a default; "Show ..." / "Hide ..." for what a control reveals; "Open ..." for what a press opens; "Add ..." and "Remove ..." for the + and the ×; "Created by ..." for the origin of a card.
5. One line, no longer than it has to be.

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

## 4. Every tooltip the code writes itself (a `title`), as of 2026-10-21

The icons' tooltips (the "i", the ×, the +, the arrows, the funnel) are their accessible names (rule 2), written where each control is made; they are not repeated here. This is the list of the words a place writes by hand, with what each said before the review of 2026-10-21.

| Where | Says now | Said before |
|---|---|---|
| Focus button (header) | Show the page alone | Focus: the page alone |
| Focus button, while on | Exit focus (Escape) | (same) |
| Search button | Search (Ctrl+K) | (same) |
| "+" of Theme, Status, Performer, Resource, milestone | Add Theme / Add Status / Add Performer / Add Resource / Add milestone | (same) |
| A box that holds a size (Brand style) | Recommended size: <range> px | Recommended <range> px |
| The number of instalments | Number of instalments, from 1 to 99 | Number of instalments (1 to 99) |
| A card a channel made, in the channel's list | Created by the channel <channel> | Created on <channel> |
| A card taken off a channel | Take it off the channel, and its card off Offering's Capability | Take it off the channel (and its card off Offering's Capability) |
| Show only the actions of a resource | Show only the actions of this resource / Show every action again | (same) |
| A name that opens a card or a page | Open <name> / Open <name> on 3. Infrastructure & Capability | (same) |
| A step of the carousel | Previous <what> (←) / Next <what> (→) | (same) |
| Global Settings, a group's years | Reset <group> to <n> years | Set <group> back to <n> years |
| Global Settings, every group | Reset every group to its default years | Set every group back to its default years |
| Global Settings, the link to the page | Open the Infrastructure & Capability page | (same) |
| The Inventory's funnel | Sort all tiles | Sort all tiles (filter and sort) |
| The Inventory's chip × | Show all tiles again | Clear: show all tiles again |
| A tile's symbol | <symbol> (show only what <name> is connected to) | (same, to be reviewed with the card tiles) |
