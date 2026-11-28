# 8. The tooltips: what has one, and what it says

Status: **current design**, written 2026-10-20, updated 2026-11-27. This document owns the tip (its place, words and look) and the shortcut keys it names (section 5); `07-popups.md` (category P4) points here.

A tooltip is a small dark label above a control, in the app's own style (`TooltipBox`, `src/components/controls/Tooltip.tsx`), never the browser's own (a white rectangle with a black frame and letters, in the system's mode). One host draws every one (`TitleTooltips`, `src/components/controls/TitleTooltips.tsx`, mounted once in `App.tsx`): it takes the `title` of an element away and shows its words only by the rules below.

## 1. The rules

1. **Only a control that is pressed has a tooltip**: a button, a link, a tab, a menu item, a summary. Never a field (it has its label and shows its value), a dropdown cell (its value is on it), a tick (its words), a tile or a card (they are text; a tile's own title is the one exception, rule 3), a label, a heading, a count.
2. **An icon with no words of its own says its name** (words hidden with `display: none`, as a Back's word in a narrow window, are not words it shows): the "i", the ×, the "+", the arrows, the funnel, the calendar button, the symbols. Its name is its accessible name (`aria-label`), so no place writes a `title` for it.
3. **A control whose words are cut short says them whole**: a link or a value that runs past its place and is cut (an ellipsis, or a line that moves), and a tile whose title is cut by an ellipsis (the tile says the title whole; a title that fits has no tip).
4. **A control says what its words do not**: the key it answers to ("Previous card (←)", "Undo (Ctrl+Z)", "Back (Escape)"), which is reason enough on its own while its words do not show the key (owner, 2026-11-27); where it goes, what it changes ("Reset Computers to 3 years"); three words or more that it does not already show.
5. **Never what the control already shows**: its text, its name or its value. A `title` that only repeats the name is not written.
6. **A control whose pop-up window is open has none**: the calendar button, the "i", a menu. The window is the answer, so the tip goes the moment the control says `aria-expanded="true"` (with `aria-haspopup`), whatever opened it, and does not come back while the window stays open. One rule in `TitleTooltips`, not one per control.
7. **One tooltip at a time** (owner, 2026-11-14 12:40: two "Linked to 2 resources" tips at once). A control that draws its own tip (`useAboveTip`: the action symbols, the chips) has no title tip besides (`data-own-tip`); a tip opening closes the one before, of either kind. **Every tip stands in the one place below, whatever stands there** (owner, 2026-11-21 16:02 UTC+2: "Tooltips should have the same style, and use the same rules about how and where they appear"): until then a tip that would cover a control moved under its box or beside it, so tips stood in three places; it shows only while the pointer or the focus is on its control (`tipPlace`, `Tooltip.tsx`).

A tooltip is one line, at most 360px wide, **in one place for every control**: its bottom 6px over the control's top and its left edge on the control's left edge, where every pop-up cell starts (its right edge on the control's right edge where the control says so); under the control (6px) only where there is no room above; kept 8px inside the window. A bullet's name shown as a tooltip -- every rail where the names do not stand beside the bullets: the page's Pages and Sections rails under 1700px or compact, a dialog's or card's tab, an Objective's or Goal's rail in its card -- is the same tooltip, in the same place, over its bullet, and is never underlined (owner, 2026-11-10; 2026-11-21: no rail draws a tip of its own, `BulletRail`, `CardNav`). It **stands over every layer** (a dialog, a floating card, the header over them, a question asked in one: `.app-tooltip`, `z-index` 1200), and a bullet's name shown as a tooltip is the app's one tooltip (`TitleTooltips`, the bullet's name), never a tip drawn in its tab, which stands behind its layer (owner, 2026-11-18 22:05 UTC+2: "Tooltips are behind the cards"). A tile's symbol, which grows 10% under the pointer and stands on a tile of its own 2px larger all round (layout rules, section 4), has its tip placed for that tile from the start, 6px over the tile's top and on the tile's left edge (the page tile's own growth counted too), so the tip opens in its one place and never moves as the symbol grows (owner, 2026-11-26 23:04 UTC+2: "Tooltips should appear on specific position, not to change after the icon's scale"; 2026-11-27, the hover tile; `tipPlace`, `grownBox`, `Tooltip.tsx`). It **never follows the pointer**. It opens under the pointer and on the keyboard focus, closes on Escape, on a press and when the pointer leaves. (This is the same place for the keyboard and the pointer: `aboveTipPosition`, `Tooltip.tsx`.)

### How its words are written

A tooltip says what a click does, in one sentence that begins "Click to ...": "Click to remove Offering 2", "Click to show Include", "Click to learn about Revenue", "Click to search, or press Ctrl+K". A control's name or title is written as a name (what a screen reader says: "Remove Offering 2", "Revenue: what this means"); one function (`tipWords`, `TitleTooltips.tsx`) turns it into the sentence, so no place writes its own and no two say the same thing two ways.

| The name or title | The tooltip says |
|---|---|
| X: what this means (the "i") | Click to learn about X |
| Minimise X, Fold X | Click to hide X |
| Maximise X, Unfold X | Click to show X |
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
| The fold arrow (`FoldArrow`), the label arrow | yes (rule 2) | "Minimise <what>" / "Maximise <what>" |
| The navigation arrows (`NavArrow`) | yes where it says more | the key: "Previous card (←)", "Next page (→)"; a page arrow also says where it goes where that is not a page ("Previous page: the Introduction (←)") |
| The funnel (`FunnelButton`) | yes (rule 2) | what it filters |
| The Back button (`BackButton`) | yes (rule 4: the key; rule 2 while its word is hidden) | "Click to go back, or press Escape" |
| The Undo of a removal (`UndoToast`) | yes (rule 4: the key) | "Click to undo, or press Ctrl+Z" |
| A header tool (`header-tool`) | no, its word is on it | (an icon-only header, under 1100px, says its word) |
| A labelled button (`AddButton` wide, the Export buttons, Refresh) | only by rule 4 | what it does that its word does not ("Reset every group to its default years") |
| A text link (`TextLink`) | only by rule 3 or 4 | the whole text where it is cut |
| A dropdown cell, a date cell, a text box, a number cell | no | (its value is on it; the "i" explains the field) |
| A tick (`TickField`) | no | (its words are the label) |
| A tile, a card, a heading, a label | no | (text) |
| A tab | no, its word is on it | |

## 3. Where it is written

`title` is the way a place gives words to the host (`title="..."` on a button or a link); the host removes it, gives the control its name (`aria-label` where it has no words, `aria-description` where it has) and decides by the rules. A place never writes a `title` that is its `aria-label`. The Roadmap's bars, the card tiles' tips, the action symbols and the noted fields draw their own through `useAboveTip` (the same box, the same placement).

## 4. The tooltips the code writes itself (a `title`)

The icons' tooltips (the "i", the ×, the +, the arrows, the funnel, the fold arrows) are their accessible names turned into the sentence of section 1 by `tipWords`. The words a place writes by hand are names too, and are said the same way:

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
| A page arrow | Previous page (←) / Next page (→) | Click to go to the previous page, or press ← |
| Back (`BackButton`) | Back (Escape) | Click to go back, or press Escape |
| Undo (the removal message) | Undo (Ctrl+Z) | Click to undo, or press Ctrl+Z |
| The Inventory's funnel | Sort all tiles | Click to filter and sort all tiles |
| The Inventory's chip × | Show all tiles again | Click to show all tiles again |
| A fold arrow of the funnel | Unfold Include | Click to show Include |
| A tile's circle | <symbol>: <name> | <symbol>: <name>. Click to show only what <card> is connected to |

### Look of a tooltip

One pop-up cell of the 32px pitch (the words centred, 12px at each side), the small size (14px) at weight 500, the tooltip's own ground; over a card its ground is mixed with the card's hue (78% of the tooltip's own ground) and its line is the card's accent line (the pop-ups' rule, `ai/02-review.md` section 6).

## 5. The shortcut keys

Every shortcut is a modifier and a key, or a key that types nothing (Escape, the arrows): no shortcut is a character alone (WCAG 2.2, 2.1.4), and none is one the browser, the system or a screen reader keeps (WAI-ARIA Authoring Practices, Developing a Keyboard Interface). A key is said the way the device says it: **Ctrl+K on Windows, Linux and Android, ⌘K on a Mac, an iPad and an iPhone** (Apple, Human Interface Guidelines, Keyboards), by one module (`keyLabel`, `isShortcut`, `keyShortcuts` in `src/components/controls/keys.ts`); both answer to Ctrl and to ⌘. A control that answers to a key names it in its tooltip (rule 4) and in `aria-keyshortcuts`; a Menu row shows it beside its word.

| Key | Does | Where it is named |
|---|---|---|
| Ctrl+K (⌘K) | Opens Search, wherever an Organisation is open | The Menu's Search row |
| Ctrl+, (⌘,) | Opens Settings, wherever an Organisation is open, as the comma opens the settings of most apps (Apple, Mac keyboard shortcuts); on a Mac's web browser ⌘, opens the browser's own settings, so there it works in the installed app | The Menu's Settings row |
| Ctrl+Z (⌘Z) | Undoes a removal while its message shows (in a text field it undoes the typing) | The Undo's tooltip |
| Escape | Closes the top layer, exits Focus, goes back | Back's tooltip, Exit focus's tooltip |
| ← → | The previous and next page, card or Capability, where nothing else uses the arrows | The page arrows' and the carousel's tooltips |

**Kept free, as each clashes somewhere:** Ctrl+N, T, W, L, D, H, J, P, S, R, F and 1 to 9 (the browser: Google Chrome Help, Chrome keyboard shortcuts); Alt and a letter (the browser's menus on Windows; a letter typed on a Mac); Ctrl+Alt (AltGr on Greek and other European keyboards); a letter alone (WCAG 2.1.4). Notes, Calendar, Workbook and Focus have no common key, so none is given.

References: W3C, Understanding WCAG 2.2, Success Criterion 2.1.4 Character Key Shortcuts, https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts; W3C, WAI-ARIA Authoring Practices Guide, Developing a Keyboard Interface, https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/; Apple, Human Interface Guidelines, Keyboards, https://developer.apple.com/design/human-interface-guidelines/keyboards; Apple Support, Mac keyboard shortcuts, https://support.apple.com/102650; Google, Chrome keyboard shortcuts, https://support.google.com/chrome/answer/157179; Microsoft, Keyboard accelerators, https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-accelerators.
