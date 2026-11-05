# 21. Shared components: which are shared, which are not

Status: **current design**, written 2026-10-17, updated 2026-11-04, checked against the code (`src/components/controls/`, `src/components/interview/`). Which component draws each kind of control, card, tile and field, and what is still hand-made.

The aim of the owner: all similar things share ONE component, and no place draws its own markup for them (rule 22.24 of `docs/ai/layout-rules.md`). A place passes a class that says only where the thing stands and how wide it is; the look and the reactions belong to the component. The looks of the library agree with the app (`15-library-vs-app.md`).

A shared control loads its own stylesheet (it imports it), never only a page's sheet, because the Notes panel and the header are on every page.

## The controls

| Component | File | What it is | Props that matter | Where it stands |
|---|---|---|---|---|
| `RadioChoice` | `controls/RadioChoice.tsx` | A choice of one among a few, drawn as a round with a bullet and its word. Each option is a native radio (arrows move, Space chooses). **It is drawn as a tick box is**: the same fill, recess, glow (`--choice-glow`) and ring (`--choice-ring`), the glow and the ring defined once in `global.css` for both, so a change there changes both; the round is 16px (`--size-radio`), the tick box 24px (`--size-mark`), and the shape (a circle) and the mark (a bullet) differ. | `label` (for a screen reader), `group` (the radios' name), `options` (`id`, `label`, optional `name`), `value`, `onChange`, `disabled` | The one component for rounds: Units / %, Tiles / Table, the table's text size ("Aa" in three sizes). |
| `RatingScale`, `RatingScaleGroup`, `RatingScaleEnds` | `controls/RatingScale.tsx`, `controls/RatingScaleGroup.tsx`, `controls/RatingScaleEnds.tsx` | A rating from 1 (low) to 5 (high): five rounds of `RadioChoice` in a row, low on the left, drawn by `radio-choice.css` (its own sheet, `rating-scale.css`, only places them); every round has its `--text-muted` edge in every state (3:1 on every band, measured 4.67 to 7.86 on 2026-11-04). The numbers 1 to 5 over the rounds; what 1 and 5 mean first in the "i". Each row is a radio group (arrows move, Space chooses; each round says "1 of 5" and its end's words); the chosen round pressed again clears it, so a row can be unrated (there is no "Not sure"). The numbers 1 to 5 are said once: over a lone field's rounds, or as a group's header over all its rows' rounds; the end words name each round for a screen reader and the question's "i" says them first. A group can be `selectable`: each row starts with the shared `TickField`, its rounds show once it is ticked, and unticking clears its rating. A row can carry ticks of its own under it (`below`), or be `fixed` (no tick, its rounds always shown: a row written under Other). | `RatingScale`: `label`, `name`, `value` (1 to 5 or none), `onChange` (none when cleared), `lowLabel`, `highLabel`, `disabled`. `RatingScaleGroup`: `label`, `name`, `rows` (`id`, `label`, optional `below`, `fixed` and `tone`), `values`, `onChange(id, next)`, the two end words, `selectable`, `selected`, `onSelect(id, on)` | Placed (2026-11-04): the Segment's household income, gender mix, kind of area, online comfort, market growth and crowding (doc 35); the Profile's B1 and E1 to E3, ticked and rated (doc 36); the Profile's Emotional and Social needs (doc 36, section 10); the Competitor's K4 and K6 to K9 (doc 41). The whole component: "Rating Scale" below. |
| `MenuOption` | `controls/MenuOption.tsx` | A row of a menu pressed to choose it: the dropdown list's own row (`option-picker-option`: its type, its glow under the pointer, its bold chosen row) as a button; `chosen` marks the order in use, `marked` keeps a column for its bullet. | `chosen`, `marked`, the button's own props | The orders of the sort menus (a section's funnel, the Inventory's window). |
| `ChipOpen` | `controls/ChipOpen.tsx` | The pressed part of a chip: two lines in the accent, a tag (what and where, in numbers) over its description. The chip is the `notepad-chip` list item that holds it. | `tag`, `description`, the button's own props | A note's link to a field, a channel's resource, an action linked to a resource. |
| `SuggestionOption` | `controls/SuggestionOption.tsx` | A row of a short list pressed to take it: its words and, under them, where it is. | `label`, `place`, the button's own props | The places a note can link to, a channel's typical costs, the actions to link. |
| `DayButton` | `controls/DayButton.tsx` | A button of a day or a month pressed to choose it: the reactions and the states (the add button's reaction under the pointer or the keyboard, the chosen one with a 2px line, today framed and bold); the place gives the size and the look at rest. | `selected`, `today`, the button's own props | The calendar panel's days and the date cell's popup days and months. |
| `TabList` | `controls/TabList.tsx` | A row of tabs along a rule, one chosen and lifted onto the page's ground; the arrow keys, Home and End move between them. | `label`, `tabs` (`id`, `label`), `value`, `onChange` | The Business Documents' three documents. |
| `ChoiceCard` | `controls/ChoiceCard.tsx` | One of a few cards laid in a row, overlapping, that choose the part of an answer shown below; the chosen one lifted and bold, a filled one marked with a check. | `active`, `filled`, the button's own props | The variants, parts and cards of an answer (three places in `AnswerRenderer.tsx`). Its own component: not a `RadioChoice` and not a `TabList`. |
| `CurrencyPicker` | `fields/CurrencyPicker.tsx` | The one dropdown of currency codes: three letters wide, searchable by code and name, the search word "Type". | `label`, `value`, `onChange`, `disabled` | The cost cards of the Business System and the money metrics of the Strategic Period. |
| `PressRow` | `controls/PressRow.tsx` | A row or handle pressed to open or choose something that holds more than a button's words: a `div` or `li` with `role="button"`, a place in the tab order, Enter and Space as the keys of a button. | `pressed`, `onPress`, `onReach` (pointer entering or focus), `ownKeysOnly`, `as` (`div`, `li`) | The landing's capability items and System rows, the calendar panel's three vertical handles, the Organisation row. |
| `FoldArrow` | `interview/fields/FoldArrow.tsx` | The one arrow that folds and unfolds: an outlined triangle in the ink colour, filled under the pointer and the keyboard focus. | `open`, `variant` (`card`, 36px, the default; or `label`, which stands inside a label or after a title in the label's own colour and size), `label` or `name` (the accessible name), `controls`, `onToggle`; for the label variant also `direction` (`up` or `down`) and `pressed`, which make it a chooser instead of a folder (the cost order of the Inventory: pressed is filled) | There is no `LabelArrow` component: the label arrow is this one. Used by card heads, groups, labels, the title help, `FoldHead`. Still typed: the rows of the Process library (a page not reachable in this app version). |
| `FoldHead` | `controls/FoldHead.tsx` | The head of a folding group outside the cards: the fold arrow, the name, the count and a rule under them. Clicking the name folds too. | `open`, `label`, `name`, `count`, `onToggle`, `children` | The Review's Organisations and the Notes panel's groups. |
| `NavArrow` | `controls/NavArrow.tsx` | Every arrow that goes to the previous or the next of something. | `direction` (`previous` or `next`), `label` (the name and the tooltip), `long` ("«" "»"), `vertical` (the 32px square with "▲" "▼" for the move of a row) | Page arrows (`PageArrow`), the carousel's, the card navigation's, the calendar's month arrows, the date popup's steps, the Notes panel's close arrow, the row moves. The cost order is no longer a `NavArrow`: it is a label `FoldArrow` with `direction` and `pressed`. |
| `TextLink` | `interview/fields/TextLink.tsx` | Every text that acts when pressed. One look (`text-links.css`). | `as` (`button`, or `a` for an address), the usual button or anchor props; `aria-pressed` passes through (the Inventory's legend: the chosen one is underlined and bold) | About 22 files. The long-text slide is the scroll of the link's box (`textLinks.ts`). |
| `OptionPicker` | `interview/fields/OptionPicker.tsx` | Every dropdown. No native `<select>` is drawn anywhere. | `label`, `options`, `value`, `onChange`, `searchable`, `currency`, `searchAliases`, `hug` (as wide as the longest option), `keepWidth` (a hugging picker alone in its row keeps that width instead of taking the row), `tight` (hug, with the placeholder not counted), `fill`, `sizeFor`, `placeholder` | `ValuePicker` (same file) is the same dropdown where the value is not the words; `MultiPicker` is the one of several choices (the calendar funnel). The cells' height is one (44px). |
| `TextBox` | `controls/TextBox.tsx` | Every one-line text cell: a plain text input. | The input's own props; the class a place passes is the look | Used in about 22 files. Left on purpose: the date cell's own text, the picker's search box, the search dialog's combobox, native number and time inputs, the library's demo parts. |
| `FittingRadioChoice` | `interview/editors/foundation/FittingRadioChoice.tsx` | A `RadioChoice` of short options that stands in ONE row where the whole row fits its column and in ONE column where it does not (never a row that wraps). It measures the row once and follows the column's width. | The props of `RadioChoice` (without `className`) | The Segment and Profile cards' radios of short options (`segmentRowChoice` decides which). |
| `OptionalNote` | `interview/cards/BusinessCardFields.tsx` | The Note every card ends a part with: a tick and the word "Notes", the text box behind it, ticked where it holds words, unticked it empties. | `label`, `fieldId` (the key of a renamed label), `value`, `onChange`, `info`, `ariaLabel`, `placeholder`, `className`, `disabled` | Every card's notes, the Organisation dialog's Notes, the Segment and Profile cards' parts (the last band of each), the Competitor card's two SWOT notes, one under each rating, and the Profile's Emotional and Social needs notes (2026-11-05). Used in about 23 files. |
| `NumberCell` | `controls/NumberCell.tsx` | Every number cell, with the numeric keyboard and the number aligned right. | `kind` (`int` or `decimal`), `inputMode` (where the place computes it) | Width and alignment from the place's class. |
| `TextField` | `controls/TextField.tsx` | Every free-text cell: a text area that grows with its words and never scrolls inside itself, with list writing ("- " or "1. " at the line start). | `value`, `onChange`, `rows` (the floor), `list` (off for a name), `grow`, `maxLines`, `onKeyDown`, `elementRef`, `ariaLabel`, `placeholder` | A card's name is a `TextField` with `maxLines={2}` (`CardNameInput`). Not joined: `NumberedListInput` and `SuggestedInput` (editors with their own keys). |
| `TickField` | `controls/TickField.tsx` | A tick and its words as one `<label>`. | The input's props, `title`, `children` (the words) | About 10 files. `TickBox` is the bare tick. |
| `InfoNote` | `interview/fields/InfoNote.tsx` | The "i" and its note, drawn in a `PopupPanel`. | `label`, `points`, `size`, `fullList`, `asReference` | About 35 files. |
| `TitleTooltips`, `tipWords` | `controls/TitleTooltips.tsx` | The one host of tooltips, mounted once in `App`: it takes an element's `title` away, keeps its name (`aria-label` or `aria-description`) and shows the words in `TooltipBox` only where they say something new (`24-tooltips.md`). `tipWords` turns a name into the sentence a tooltip says ("Click to remove Offering 2"). | none (a component without props); `tipWords(text)`, `tipOf(element)` | Escape closes the tip. Tests that render a component alone still see the `title`. |
| `TooltipBox`, `useAboveTip`, `aboveTipPosition` | `controls/Tooltip.tsx` | The one dark box every tooltip is drawn in, placed above the element 6px over it (under it where there is no room). | `TooltipBox`: `position`, `hue`, `className`; `useAboveTip(text, { box, alignRight })` for an icon | The card tiles' and the channel resources' tips, the action symbols, the Roadmap bars. |
| `FunnelButton` | `controls/FunnelButton.tsx` | The one button that opens a filter or a sort: the 32px box with the drawn funnel. | `active` (filled while it leaves something out) | Responsibilities, the card notes, the Inventory, a section's sort. |
| `AddButton` | `controls/AddButton.tsx` | Everything that adds a card, a row or a line. | `shape` (`wide`, `box`, `tile`), `small`, `look` (another of the app's button looks for the wide shape) | The accent-button rule set (`accent-button.css`, loaded once in `App`) is also the look of the header's tools, the Business Documents' buttons and the calendar's controls. |
| `RemoveButton` | `controls/RemoveButton.tsx` | The 32px x of cards, rows and notes. | Button props | Every x. |
| `BackButton` | `controls/BackButton.tsx` | Every Back: the solid arrow and the word in capitals; the word goes (the arrow stays, with its name and a tooltip, `24-tooltips.md`) in a rail with under 160px beside the card and in the page footer at 1100px and narrower (`back-button.css`). | Button props | All Backs (card tab, dialog foot, page footer, Capability description). |
| `PopupPanel`, `usePopupDismiss` | `controls/PopupPanel.tsx` | `usePopupDismiss`: a press outside closes a popup, Escape closes it. `PopupPanel`: a panel drawn outside the boxes around its control. | `open`, `onClose` | `PopupPanel`: the info note and the colour picker. `usePopupDismiss`: those and the option picker, the date and month popups, the calendar menus and others. The floating card, the Notes panel and the calendar panel close a layer, not a popup, and keep their own. |
| `FieldLabel`, `TickBox` | `controls/FieldLabel.tsx`, `controls/TickBox.tsx` | The field label (`as` span or label); the bare tick. | | Every field label; every tick. |
| `BusinessTicks` | `interview/cards/BusinessCardFields.tsx` | A group of tick options with an optional limit `max` (the rest are locked and grey, without a warning) and a `blocked` option. | `max`, `blocked`, `meaning` | Every card that asks for several choices (the Segment and Profile cards, Positioning, the Financial Foundation). |
| `NotesField` | `interview/fields/NotesField.tsx` | The shared Notes field: a growing text with list writing and the default placeholder "Add a note". | `value`, `onChange`, `placeholder`, `disabled`, `className`, `ariaLabel` | Notes columns and cards. |
| `BoxActions`, `useMovableBox`, `useListDrag` | `interview/fields/ReorderControls.tsx` | What a reorderable box carries: the remove button and an optional funnel that sorts its contents; `useMovableBox` moves a selected box with the arrow keys or by dragging, `useListDrag` drags a list's rows. | `label`, `disabled`, `onRemove`, `onAdd` | Boxes and lists of cards. |
| `BulletRail` | `interview/rails/BulletRail.tsx` | The column of bullets beside the card: pages on the left, the current page's sections on the right, the current one grown and bold, a status shape (not started, in progress, defined) in the bullet. | `RailItem` list (`railItems.ts`) | Every page of sections. |
| `FoldAllToggle` | `interview/fields/FoldAllToggle.tsx` | "Expand all" / "Collapse all" for one group of item cards (a `TextLink`); hidden for a group of fewer than two. | `ids`, `nested` | The lists of cards. |

### Rating Scale

**Name and purpose.** The Rating Scale (owner, 2026-11-04) rates a thing from 1 (low) to 5 (high) where the thing has degrees and the middle counts. Components: `RatingScale` (one rating), `RatingScaleGroup` (several on one scale), `RatingScaleEnds` (the numbers over the rounds, and `ratingScaleMeaning`, the "i" line); sheet `rating-scale.css`; the rounds are `radio-choice.css`'s own.

**Anatomy.** A row's words, or a tick and its words (a selectable group); the track: five radio rounds, spread evenly from the first to the last; the numbers 1 to 5, each over its round, said once per group (over the rounds) or once over a single rating. What 1 and 5 mean is the first line of the question's "i", "1 = Weak, 5 = Strong." (owner, 2026-11-04: an end word could be long enough to stand over two rounds). A row can carry a band (`tone`, below).

**Why numbers, with the meaning in the "i".** The research is mixed: fully labelled scales often give better data [FUN-70], but a review of 17 studies found no clear advantage of full labels over end labels, and numbers alone gave the same results as full words in one test [FUN-71]. The numbers 1 to 5 are all positive, so 1 reads as "little of it", not "the opposite" [FUN-68]; how points are labelled with words, numbers or both is weighed by Krosnick and Presser [FUN-69]. Because words at the ends help people read a scale [FUN-70], the meaning is kept easy to find: the first line of the "i", in the question's own words.

**Layout** (owner, 2026-11-04), from the place it stands in (its column or card body), never a fixed width:
- *Horizontal* (a group: a row's words and its rounds on one row): the words take the left half and wrap; the rounds take the right half, spread evenly; the numbers stand once over that half. The Competitor's K6 to K9, the Profile's B1, E1 to E3 and the Needs.
- *Vertical* (a single question, its words over it): the rounds take the whole width under the question, spread evenly, the numbers over them. The Segment's household income, gender mix, kind of area, online comfort (and the end user's), market growth and crowding; the Competitor's K4.

**Bands** (`tone` on a group's row; owner, 2026-11-04): one colour, light to dark, in four steps defined once as tokens in `global.css`, `--tint-importance-1` to `-4` (the app's blue, `--bg-primary`, at 14%, 24%, 34% and 44%; on sepia 12%, 21%, 30% and 39%), the same for every banded question so a level always shows the same shade. The cards' alternating question band is the lightest of the same family, `--tint-row-band` (6%; it replaced the grey of the label colour at 12%, owner, 2026-11-04), used by `.legal-entity-audience .legal-entity-org-band` in every card with question bands (Segment, Profile, Competitor, Positioning). In a floating card a band runs edge to edge, as the card's section bands do, and banded rows touch. Used by the Competitor's K8 (doc 41): the step is the number of Profiles that chose the value (`bandTone`: 1, 2, 3, 4 or more), and its "i" adds "The darker the band, the more of your Profiles chose it."

**Contrast of this round's colours** (WCAG 2.2 AA: text 4.5:1, a mark 3:1, SC 1.4.11), measured in the app on 2026-11-04, the Competitor card, in each of the app's three reading modes (it has no high-contrast or forced-colours mode):

| What | Against | Light | Sepia | Dark |
|---|---|---|---|---|
| Question text | `--tint-row-band` | 5.44 | 5.11 | 7.48 |
| Row words | `--tint-importance-1` | 12.14 | 8.91 | 10.10 |
| Row words | `--tint-importance-2` | 10.46 | 7.85 | 9.21 |
| Row words | `--tint-importance-3` | 8.96 | 6.87 | 8.37 |
| Row words | `--tint-importance-4` | 7.63 | 5.98 | 7.58 |
| A round's edge | `--tint-importance-1` | 4.86 | 4.71 | 6.98 |
| A round's edge | `--tint-importance-2` | 4.19 | 4.15 | 6.37 |
| A round's edge | `--tint-importance-3` | 3.59 | 3.64 | 5.79 |
| A round's edge | `--tint-importance-4` | 3.06 | 3.16 (2.92 at 44%: sepia's steps set closer) | 5.24 |
| A round's edge | the band, no tint | 5.92 | 5.53 | 7.85 |
| The numbers 1 to 5 | the band | 14.78 | 10.45 | 11.35 |
| A sub-channel dropdown's border (K5) | the band | 4.08 | 4.73 | 6.52 |
| A sub-channel dropdown's text (K5) | its box | 17.74 | 11.95 | 13.78 |
| A tick box's edge (K5) | the band | 5.92 | 5.53 | 7.85 |

**Sizes** (page 3 type scale and spacing): the round 16px (`--size-radio`); the numbers `--font-small` (14px), each as wide as a round and centred over it; a row's words `--font-body` (18px); numbers to rounds `--space-label` (6px); words to rounds `--space-cell` (12px); between rows `--space-row` (a banded group's rows carry it as their own padding); a tick and its words `--gap-8`. Measured on 2026-11-04 at 1280px wide: a group in the Profile and Competitor cards 422px, its rounds 205px (the right half less the gap); a single rating in one of the Segment card's columns 263px, the column's whole width, as wide as the column's other fields.

**States and contrast.** Rest: every round has its `--text-muted` edge (3:1 on every band: 4.67 to 7.86 measured on the light, sepia and dark themes, 2026-11-04). On the bands, measured 2026-11-04: the words 5.89 or more and the rounds' edges 3.11 or more on every step, in light, sepia and dark. Hover and keyboard focus: the radio choice's own ring. Chosen: the app's blue with a white bullet. Disabled: drawn faint, as every disabled radio. A selectable row unticked shows no rounds.

**Behaviour.** Each row is one radio group (the arrows move along it, Space chooses; each round reads "1 of 5, [low word]" to "5 of 5, [high word]"). Pressing the chosen round again clears it: the row is unrated (there is no "Not sure"). In a selectable group, unticking a row clears its rating first. Kept as `<id>-rating`, each entry "option:point" (a single rating as its point).

**When to use it.** A question of comfort or of degree (how comfortable, how much it is changing, how crowded, how well they do), with a word for each end; not where the answers have their own named kinds (a size of organisation, the type of a business): a plain choice says those better. The Segment's household income, gender mix and kind of area are ratings at the owner's request (2026-11-04), their bands and shares kept in the "i". Where it fits and where it does not, place by place: below.

**Where it is used today.** Segment (doc 35): `income`, `gender`, `area`, `comfort`, `u-comfort`, `trajectory`, `competition` (vertical). Profile (doc 36): B1, E1, E2, E3, `emotional`, `emotional-b2b`, `social`, `social-b2b` (horizontal, selectable). Competitor (doc 41): K4 (vertical); K6 (horizontal, selectable); K7 and K9 (horizontal); K8 (horizontal, banded).

**Prototype.** The library's gallery, development only: `npm run dev`, then `/library`, section "Rating Scale" (contract `src/library/assets/ratingScale.ts`, samples `src/library/gallery/RatingScaleSamples.tsx`): vertical in a one-column card and in one of the Segment card's two columns; horizontal, selectable, and chosen and disabled, on the page and card grounds; the theme follows the app's setting.

### A choice with its own sub-choices (the Competitor's K5)

Built 2026-11-04 (owner): a tick per channel in the left half; once ticked, an `OptionPicker` of its sub-channels in the right half, every dropdown the same width; the `AddButton` box "+" in the card's x column adds a row under it, each added row with a `BusinessStep` remove (its x) in the same column; a sub-channel chosen in one row is not offered in the next. Existing components only (`TickField`, `OptionPicker`, `AddButton`, `BusinessStep`); its grid is `.business-competitor-channels` (13-business-foundation.css).

### The Rating Scale: where it fits

A rating beats ticks where a thing has degrees and the middle counts (a value done fairly well is still an opening), and beats text where the answers are compared or scored. It fits where the App User can judge from what they see; it does not fit where it would be a guess or where a plain choice says it better.

**Where it fits:**

| Place | What is rated (rows) | What 1 and 5 mean | Why a rating |
|---|---|---|---|
| Competitor, K8 (doc 41) | every value of L1, the Profiles' highest rated first, banded by how many Profiles chose it | Weak to Strong | One scale gives strengths and weaknesses at once, and a 3 still counts (owner, 2026-11-04) |
| Competitor, K9 (doc 41) | each of the Segment's changes, those the Segment ticks first | Threat to Opportunity | One scale gives opportunities and threats at once |
| Competitor, K6 (doc 41) | each review platform (L18), ticked first (`selectable`) | Poor to Excellent (1 to 5 stars) | Review sites rate in stars already: the answer is copied, not judged; the tick says where they are reviewed |
| Competitor, K7 (doc 41) | each Journey Stage (`BUSINESS_JOURNEY_STAGES`) | Hard to Easy | Shows where along the journey they are weak, not only whether |
| Profile, B1 and E1 to E3 (doc 36, section 11) | each tick (`selectable`) | Optional to Essential; Minor to Main; Mild to Severe; Minor to Blocking | Built: the ticks keep a Profile focused, the ratings rank them and weigh K10 of doc 41 |
| Profile, Emotional and Social needs (doc 36, section 10) | each tick (`selectable`) | Mild to Strong | Built: Bain's elements ticked, each rated, the list kept as the note |
| Strategy, SWOT (the App User's own) | each Strength, Weakness, Opportunity or Threat written | Minor to Major | Orders a long list by weight, so the plan starts with what matters most; the App User knows their own business |

**Where it does not fit:**

| Place | Why not |
|---|---|
| Facts: a competitor's size and area (doc 41, K2 and K3), a Segment's market size (doc 35, Box 5) | A plain choice of a few named answers is clearer than a number |
| A competitor's channels (doc 41, K5) | Removed 2026-11-04 (owner): how active they are is a guess; which sub-channels they use, against the customers', says more |
| Anything compared with the App User's own Offerings, prices or size | A start-up may have none yet (doc 41, "The purpose") |
| How sure the App User is of an answer | Withdrawn (owner, 2026-11-04): it rates the App User's evidence, not the thing |
| How many customers come back to a competitor, or its share of the market | Cannot be seen from outside: a rating would only be a guess |

## The cards, tiles and fields built on them

| Component | File | What it is |
|---|---|---|
| `CardHead`, `NameCell`, `CardShell` | `interview/cards/` | The head of a folding card (fold arrow, number, mark, name, actions, summary), the name in it (asked, a link, or text), and the outer box of every card and section panel. |
| `BusinessCard` | `interview/cards/BusinessCardFields.tsx` | The shared card; with `legal` it draws the Legal Entity page's requirement, expense and founder cards (the CSS of the two stays separate on purpose: merging it moved the number and the glass ground). |
| `Tile`, `TileGrid`, `TileParts` | `interview/tiles/` | Every tile, every tile grid (the Inventory's is `bare`), and the shared parts: links layer, "+", hover origin. |
| `FieldRow`, `FieldHead` | `interview/fields/FieldRow.tsx` | A label with its control as a cell of the Legal Entity grid; `FieldHead` draws the label with "i", mark and status line for the Business fields too. |
| `DatePopup`, `CalendarIcon`, `ListStatic` | `interview/fields/` | The popup of the date cell and the month picker (`useDatePopup`); the calendar symbol that takes the place of the dropdown arrow in a date cell (`DateCellInput`, `MonthYearPicker`); the read-only numbered or bulleted list. |

A card opened from another card that stays open stands below it as a pair (`StackUnderContext`, `DialogLevels.tsx`). The Inventory's card is alone.

## What is hand-made, read one by one

Each item below is checked in the code against the components above.

- **Not hand-made (they are built from shared components):** the Strategy boxes' heads (`NumberedName`, `InfoNote`, `AddButton`, `RemoveButton`); the Brand column headings (`ColumnHeading`, `GuidanceBullets`); the sub-channel head (`SuggestedInput` or `OptionPicker`, `BusinessRemove`); `NumberedListInput` (one component, six editors); `SuggestedInput` (a text cell with suggestions: it fills in, so it is an input, and it wears the dropdown list's classes); the Brand picture tiles (tiles) and the image holder (a file drop-zone button, with `BusinessRemove` for its ×).
- **The one real duplication, `PressRow`:** the `role="button"` row with its Enter and Space handler is one component.
- **Out of reach:** the Process library's expand toggles and typed arrows (a page not reachable in this app version).
