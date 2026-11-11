# Layout assets: the numbers of each shared part

Status: **rules**, written 2026-11-11, generated. The section of the layout rulebook (`layout-rules.md`, section 19) on the assets, in a file of its own so the rulebook stays short to read. Everything between the markers is written from the asset contracts in `src/library` by `npm run docs:assets`; do not edit it by hand.

<!-- generated:assets (from src/library; do not edit; run npm run docs:assets) -->

Written from the asset contracts in `src/library`; the library runner (`npm run library`) measures the app against them in light, dark and sepia at 768, 1440 and 1920 px wide. A number here is the contract's, so it is the app's.

### Label arrow

One frameless triangle beside a label or a title that shows or hides what belongs to it. Outline at rest, filled under the pointer and the keyboard focus; right while hidden, down while open.

- **Kind:** fold arrow. **Code:** `src/components/interview/fields/FoldArrow.tsx`. **Stylesheet:** `src/styles/label-arrow.css`.
- **Parts:** button (the hit area); triangle (svg polygon, 2px line inside its edge).
- **States:** rest, hover, focus, closed, open.
- **Used in:** chapter titles of 3. Infrastructure & Capability; a founder's Responsibilities and Completed; a card's Links; the Initiatives of an Objective.
- **Custom properties it reads:** `--label-arrow-size`, `--label-arrow-hit`, `--strategy-theme-hue`, `--plus-fill-saturation`, `--plus-fill-lightness`.

| Variant | Where | Note |
|---|---|---|
| field-label (18px label) | field-label | inside a label, left of the words (a founder's Responsibilities, the Initiatives) |
| title-row (28px label) | title-row | after a chapter title and its i, at the title's size (--label-arrow-size: --font-h2) |

| Number | Value |
|---|---|
| glyphWidthEm | 0.611 |
| glyphHeightEm | 1 |
| openShiftEm | 0.1945 |
| lineWidthPx | 2 |
| minTargetPx | 24 |
| tolerancePx | 0.6 |

**Accessibility.** Keyboard focus is shown by the asset's own fill; no ring or outline. Name: Names what it shows or hides, and says which (Show/Hide ...). Contrast it must hold:
- the arrow's tint (the + box's colour) (page): at least 3:1.
- the arrow's tint (the + box's colour) (card): at least 3:1.

### Plus box

A square button with a drawn plus that adds a card or a row. A swap of two colours between rest and hover or focus (transparent with a stroke at rest, filled under the pointer); it never changes size.

- **Kind:** add button. **Code:** `a <button className="plus-box"> in SectionTiles.tsx, SectionView.tsx, SubTiles.tsx, BusinessCapabilityEditor.tsx`. **Stylesheet:** `src/styles/section-tiles.css`.
- **Parts:** button (the square, 2px stroke); two bars (::before, ::after) drawn from the middle of the box.
- **States:** rest, hover, focus, disabled.
- **Used in:** page tiles that take new cards (Operational, Production, Marketing, Utilities, Equipment ...); Offering's Capability: Resources, Activities, Partners & Suppliers; the Activity card's Add Performer (small).
- **Custom properties it reads:** `--plus-ground`, `--plus-fill`, `--plus-size`, `--plus-bar`, `--plus-fill-saturation`, `--plus-fill-lightness`, `--strategy-theme-hue`, `--theme-bg-inner`, `--focus-ring-ink`, `--card-padding`.

| Variant | Where | Note |
|---|---|---|
| tile | tile | 32px, bars 14px, at the lower right of a page tile, 12px from the edges (.plus-box.section-tile-plus) |
| small | inline | 32px (the x's size), bars 14px, beside a row (.plus-box.plus-box-small: the Activity card's Add Performer) |

| Number | Value |
|---|---|
| sizeTile | 32 |
| sizeSmall | 32 |
| barTile | 14 |
| barSmall | 14 |
| barThickness | 2 |
| strokeWidth | 2 |
| radius | 6 |
| insetTile | 12 |
| transitionMs | 150 |
| disabledOpacity | 0.5 |
| outlineWidth | 2 |
| outlineOffset | 2 |
| centreTolerancePx | 0.01 |
| tolerancePx | 0.5 |

**Accessibility.** Keyboard focus is shown by a ring or outline. Name: Add <Item> to <tile>. Contrast it must hold:
- the plus and the stroke (the darker tone) against the page the box stands on (page): at least 3:1.
- the plus and the stroke (the darker tone) against the card the box stands on (card): at least 3:1.
- under the pointer: the plus (the ground colour) against the fill (fill): at least 3:1.

### Info note

A 24px round "i" after a label that opens a note. A swap of two colours under the pointer (the disc filled, the letter in the ground colour); it never changes size.

- **Kind:** round button. **Code:** `src/components/interview/fields/InfoNote.tsx`. **Stylesheet:** `src/styles/conversation.css` (also `src/styles/section-tiles.css`, `src/styles/page-3-edges.css`, `src/styles/global.css`).
- **Parts:** button (24px disc with a stroke); the letter i (bold italic, small size); an invisible 24px hit area (::after).
- **States:** rest, hover, focus, open.
- **Used in:** after the label of nearly every field and every section or column title; dialog headers and the box names over a floating card; a tick box's label (outside it).
- **Custom properties it reads:** `--info-gap`, `--font-small`, `--line-primary`, `--text-primary`, `--bg-surface`, `--bg-primary`, `--text-on-fill`, `--theme-line-accent`, `--info-ink`, `--info-fill`, `--glow-color`, `--strategy-theme-hue`.

| Variant | Where | Note |
|---|---|---|
| plain | page | the base look: blue stroke and letter on a white disc, in a label outside any card of a hue |
| tinted | hue | inside a card or tile of a hue: stroke and letter in the card's tint (section-tiles.css) |
| page-3 | answer-columns business-capability | the page-3 card look: ground fill, 1.5px stroke, letter in --info-ink, a full swap on hover, focus and open (page-3-edges.css) |

| Number | Value |
|---|---|
| disc | 24 |
| hitArea | 24 |
| gap | 6 |
| strokePlain | 1 |
| strokePage3 | 1.5 |
| fontSizeVar | 14 |
| fontWeight | 700 |
| centreTolerancePx | 0.6 |
| tolerancePx | 0.5 |

**Accessibility.** Keyboard focus is shown by a ring or outline. Name: <label>: what this means (aria-expanded, aria-haspopup=dialog). Contrast it must hold:
- the letter against the disc at rest (rest): at least 3:1.
- the letter against the disc under the pointer, the focus and while open (swapped): at least 3:1.

**Known findings** (measured, not changed; to decide):
- `tinted-rule-overridden`: The rule that gives an "i" the tint of its card (section-tiles.css, ":where(.section-tile-overlay, [style*=--strategy-theme-hue]) .info-note-button", about line 3869) has the same specificity as the base ".info-note-button" rule in conversation.css, which the app loads after it, so the base wins: an "i" in a card of a hue that has no page-3 rule is drawn in the page blue, at rest and under the pointer. Measured with the stylesheets in the order the interview page loads them. Not changed; to decide.

### Remove x

A 32px square with a drawn X that removes a card or a row. Red stroke and X at rest, filled red under the pointer and the focus; it never changes size.

- **Kind:** remove button. **Code:** `src/components/interview/cards/BusinessCardFields.tsx (RemoveButton) and the other cards that use .strategy-box-remove`. **Stylesheet:** `src/styles/remove-button.css` (also `src/styles/section-tiles.css`, `src/styles/global.css`).
- **Parts:** button (the square, 2px stroke); two bars (::before, ::after) turned +45 and -45 degrees, drawn from the middle of the box.
- **States:** rest, hover, focus, disabled.
- **Used in:** every card's delete and every row's remove (performers, milestones, costs, partners ...); the older removes that share its look: profile cards, brand holder clear, legal entity field remove.
- **Custom properties it reads:** `--x-red`, `--x-ground`, `--bg-surface`, `--text-danger`, `--text-faint`, `--line-card`, `--radius-md`, `--focus-ring-ink`, `--line-primary`.

| Variant | Where | Note |
|---|---|---|
| cell | row | an x beside a row inside a card's cell (a performer, a milestone): .strategy-box-remove |
| card | card | a card's own delete: .strategy-box-remove.card-remove |

| Number | Value |
|---|---|
| size | 32 |
| barLength | 14 |
| barThickness | 2 |
| strokeWidth | 2 |
| radius | 6 |
| disabledStrokeWidth | 1 |
| outlineWidth | 2 |
| outlineOffset | 2 |
| centreTolerancePx | 0.01 |
| tolerancePx | 0.5 |

**Accessibility.** Keyboard focus is shown by a ring or outline. Name: Remove <what> (aria-label and title). Contrast it must hold:
- the red stroke and X against the ground behind the box (page): at least 3:1.
- the red stroke and X against the ground behind the box (card): at least 3:1.
- under the pointer: the X (the ground colour) against the red fill (fill): at least 3:1.

### Rails

The Pages and Sections rails: a column of items, each a bullet and a label in one button. Rest, lit and hover looks; bullets only below 1700px with the name as a tooltip, labels inline from 1700px.

- **Kind:** navigation rail. **Code:** `src/components/interview/rails/BulletRail.tsx`. **Stylesheet:** `src/styles/bullet-rail.css` (also `src/styles/status-shape.css`, `src/styles/global.css`).
- **Parts:** nav (the rail); list (18px between items); item button (label, 12px gap, bullet; 2px padding above and below); bullet (a plain dot, or a page status shape); label (tooltip below 1700px, inline from 1700px).
- **States:** rest, hover, focus, open.
- **Used in:** the Pages rail (left) and the Sections rail (right) beside the interview card.
- **Custom properties it reads:** `--rail-dot`, `--rail-dot-active`, `--rail-bloom`, `--rail-dot-hover`, `--rail-hover-ring`, `--rail-status`, `--rail-status-hover`, `--text-subtle`, `--text-strong`, `--text-primary`, `--hover-bold`, `--bold-tracking`, `--line-primary`, `--tooltip-bg`, `--tooltip-text`, `--tooltip-border`.

| Variant | Where | Note |
|---|---|---|
| pages-left | left | the Pages rail: label then bullet; page status shapes (not started, in progress, defined) and the Introduction in capitals; one lit item |
| sections-right | right | the Sections rail: bullet then label; plain bullets; one lit item |

| Number | Value |
|---|---|
| bullet | 12 |
| itemGap | 12 |
| itemPaddingY | 2 |
| listGap | 18 |
| activeScale | 1.45 |
| hoverScale | 1.3 |
| activeRing | 4 |
| hoverRing | 3 |
| outlineWidth | 2 |
| outlineOffset | 4 |
| wideFrom | 1700 |
| tooltipOffset | 24 |
| minTargetPx | 24 |
| underlineOffsetEm | 0.2 |
| tolerancePx | 0.5 |

**Accessibility.** Keyboard focus is shown by a ring or outline. Name: The label (with the status word on the Pages rail); aria-current on the lit item. Contrast it must hold:
- a page status shape (its ink) against the page (status): at least 3:1.
- the label against the page, where labels stand inline (from 1700px) (label): at least 4.5:1.
- the label under the pointer (the link colour) against the page (hover): at least 4.5:1.
- the tooltip text against the tooltip block (tooltip): at least 4.5:1.

### Back button

The way back out of a dialog or card: a left-pointing triangle and the word Back. Plain at rest; the card's tint, thickened, under the pointer and the focus.

- **Kind:** navigation button. **Code:** `src/components/interview/tiles/SectionTiles.tsx (the dialog foot's .section-tile-back, the rail tab's .carousel-rail-back`. **Stylesheet:** `src/styles/section-tiles.css` (also `src/styles/label-arrow.css`, `src/styles/global.css`).
- **Parts:** button; back-arrow (a solid left-pointing triangle, 0.8em high); the word Back (capitals in the rail form).
- **States:** rest, hover, focus.
- **Used in:** the foot of every section dialog; the rail tab beside a dialog's card.
- **Custom properties it reads:** `--text-default`, `--text-primary`, `--hover-bold`, `--bold-tracking`, `--rest-tracking`, `--font-body`, `--focus-ring-ink`, `--theme-line-accent`, `--plus-fill-saturation`, `--plus-fill-lightness`, `--tab-ink`, `--tab-edge`, `--gap-6`, `--gap-12`.

| Variant | Where | Note |
|---|---|---|
| foot | dialog foot | < Back at the foot of a dialog: .section-tile-back |
| rail | rail tab | the way back in the rail's tab: .carousel-rail-back, capitals, built like a rail item |

| Number | Value |
|---|---|
| arrowHeightEm | 0.8 |
| arrowRatio | 0.7857 |
| footGap | 6 |
| footPaddingY | 6 |
| railGap | 12 |
| railPaddingY | 2 |
| railArrowBox | 12 |
| railArrowGrow | 1.2 |
| outlineWidth | 2 |
| outlineOffset | 2 |
| minTargetPx | 24 |
| tolerancePx | 0.6 |

**Accessibility.** Keyboard focus is shown by a ring or outline. Name: Back (the word, or aria-label and title Back in the rail form). Contrast it must hold:
- the word and arrow at rest against the ground they stand on (rest): at least 4.5:1.
- the word and arrow under the pointer and the focus against the ground (hover): at least 4.5:1.

### Fold arrow

The standard 36px fold arrow: an outlined triangle, right while folded and down while open, filled under the pointer and the keyboard focus (no ground, no ring under the pointer); a primary stroke on the button under the keyboard focus.

- **Kind:** fold arrow. **Code:** `src/components/interview/fields/FoldArrow.tsx`. **Stylesheet:** `src/styles/fold-arrow.css` (also `src/styles/card-folding.css`).
- **Parts:** button (36px square, 1px stroke, transparent at rest); triangle (::before, an outlined mask from the button's middle, filled under the pointer).
- **States:** rest, hover, focus, open, closed.
- **Used in:** every folding card, group and section head; the Segment card's arrow column, the Relationship Type rows, the Customer Engagement reference rows.
- **Custom properties it reads:** `--text-default`, `--line-primary`, `--glow-color`, `--radius-md`.

| Variant | Where | Note |
|---|---|---|
| plain | any head | the arrow on its own; in a card head it also takes the body size and an invisible fallback glyph (card-folding.css) |

| Number | Value |
|---|---|
| size | 36 |
| triangleLong | 18 |
| triangleShort | 11 |
| strokeWidth | 1 |
| radius | 6 |
| centreTolerancePx | 0.01 |
| minTargetPx | 24 |
| tolerancePx | 0.5 |

**Accessibility.** Keyboard focus is shown by a ring or outline. Name: Minimise <what> / Maximise <what> (aria-label), with aria-expanded. Contrast it must hold:
- the triangle (the text colour) against the ground it stands on (page): at least 3:1.
- the triangle (the text colour) against the ground it stands on (card): at least 3:1.

### Dropdown

A drawn dropdown: a 44px trigger in one of the standard widths (or hugging its widest option) with a chevron, and a floating list of 43px options exactly as wide as the trigger.

- **Kind:** dropdown. **Code:** `src/components/interview/fields/OptionPicker.tsx`. **Stylesheet:** `src/styles/option-picker.css` (also `src/styles/global.css`, `src/styles/conversation.css`).
- **Parts:** trigger (button.interview-input with the value, a hidden copy of every option, and a drawn chevron); list (role listbox, floating under the trigger); option (role option; the chosen one bold, aria-selected).
- **States:** rest, hover, focus, open, disabled.
- **Used in:** every choice of one value on the Foundation pages and in the cards; frequencies, statuses, types, currencies, countries (searchable).
- **Custom properties it reads:** `--control-s`, `--control-m`, `--control-l`, `--control-square`, `--select-padding-left`, `--select-padding-right`, `--select-chevron`, `--select-chevron-inset`, `--bg-surface`, `--text-default`, `--text-faint`, `--line-card`, `--glow-color`, `--box-inset`.

| Variant | Where | Note |
|---|---|---|
| step-s | step s | short options (Yes / No): the trigger is --control-s wide |
| step-m | step m | a typical choice ("No tax at business level"): --control-m wide |
| step-l | step l | a long choice ("Private Company Limited by Shares"): --control-l wide |
| hug | hug | as wide as its widest option exactly, no wider (a side-label picker's allowed exception) |
| disabled | disabled | a disabled trigger: faint text, the card-line edge, not-allowed cursor |

| Number | Value |
|---|---|
| height | 44 |
| stepS | 220 |
| stepM | 300 |
| stepL | 420 |
| chevronWidth | 12 |
| chevronHeight | 8 |
| fontSize | 18 |
| listGap | 6 |
| listPadding | 4 |
| listRadius | 8 |
| optionHeight | 43 |
| optionPaddingY | 8 |
| optionPaddingX | 10 |
| chosenWeight | 700 |
| minTargetPx | 24 |
| hugTolerancePx | 2 |
| tolerancePx | 0.6 |

**Accessibility.** Keyboard focus is shown by a ring or outline. Name: <label>: <value> (aria-label), aria-haspopup=listbox, aria-expanded. Contrast it must hold:
- the value against the trigger's ground (page): at least 4.5:1.
- the value against the trigger's ground (card): at least 4.5:1.
- an option against the list's surface (list): at least 4.5:1.

### Floating card

The one surface every floating card stands on: 492px wide (a founder's 297px), 8px corners, 12px padding and 12px between everything, a height that follows its contents, an inset light and shade edge and a drop shadow, in the tint of its tile and the colours of the reading mode.

- **Kind:** card base. **Code:** `src/components/interview/tiles/SectionTiles.tsx, the FloatingCards component`. **Stylesheet:** `src/styles/section-tiles.css` (also `src/styles/page-3-edges.css`, `src/styles/global.css`).
- **Parts:** host (a dialog over the dimmed page, placed by its tile); stack (one card, or a parent above its child); item (the box name, then the card); caption (the box name, with the box's "i"); body (the card: its ground, edge and shadow).
- **States:** rest, open.
- **Used in:** every floating card on the Foundation pages (Identity, Brand, Business, Strategy); the Resource, Activity, Partner, Provider, Founder, Legal Entity and Brand cards.
- **Custom properties it reads:** `--open-card-width`, `--founder-card-min`, `--radius-lg`, `--card-padding`, `--space-field`, `--space-label`, `--control-square`, `--card-label-col`, `--theme-bg-inner`, `--theme-ground-weight`, `--theme-ground-paper`, `--theme-line-edge`, `--theme-line-accent`, `--strategy-theme-hue`, `--shadow-18`, `--shadow-12`, `--box-inset`.

| Variant | Where | Note |
|---|---|---|
| card | kind card | a Resource, Activity, Partner, Provider or any other card: --open-card-width wide |
| founder | kind founder | a founder's card: --founder-card-min wide |

| Number | Value |
|---|---|
| cardWidth | 492 |
| founderWidth | 297 |
| radius | 8 |
| padding | 12 |
| gap | 12 |
| labelGap | 6 |
| cellHeight | 44 |
| labelColumn | 177 |
| windowMargin | 16 |
| tolerancePx | 0.6 |

**Sizes by screen class** (one custom property each; the same in every class until the owner sets them apart):

| Use | Property | Tablet | Laptop | Desktop |
|---|---|---|---|---|
| Card width (kind card) (at most the window less the window margin) | `--open-card-width` | 492px | 492px | 492px |
| Founder card width | `--founder-card-min` | 297px | 297px | 297px |
| Card corners | `--radius-lg` | 8px | 8px | 8px |
| Card padding, side, top and bottom | `--card-padding` | 12px | 12px | 12px |
| Gap between rows, and between the box name and the card | `--space-field` | 12px | 12px | 12px |
| Gap from a label to the control it names | `--space-label` | 6px | 6px | 6px |
| Height of a single-line control (a cell) | `--control-square` | 44px | 44px | 44px |
| Label column of a side-label row | `--card-label-col` | 177px | 177px | 177px |
| Window margin (a card is never closer to the window's edge) (written in the width rule as calc(100vw - 16px), not a custom property yet) | (none yet) | 16px | 16px | 16px |

**From top to bottom:**

1. **Box name**: A centred caption above the card, outside it: the name of the tile or box the card belongs to, with the box's "i" where the box has a note.
2. **Card top padding** (12px above, `--card-padding`): The card's own padding above its first row.
3. **Head row**: The order number inside the name cell (44px high), then the x (32px) 12px from the cell. Everything under the head starts and ends where the name cell does.
4. **Rows** (12px above, `--space-field`): One row per field, 12px apart: a side-label row (the label in the 177px column, then the control), a label above its control (6px), a tick row (the tick and its words on one line), an optional field (the tick, then a growing box under it), a tick list (one tick per line, 12px box to box).
5. **Groups** (12px above, `--space-field`): Two groups are divided by a rule, 12px either side of it.
6. **Completed row (Activity cards)** (12px above, `--space-field`): A divider line stands above the Completed tick, 12px either side of it, and the Links (Linked to) come last, after Completed (the owner, 2026-10-15).
7. **Card bottom padding** (12px above, `--card-padding`): The card's own padding under its last row; the height follows the contents.

**Accessibility.** Keyboard focus is shown by a ring or outline. Name: role dialog, aria-modal, aria-label (the box name). Contrast it must hold:
- the card's text against the card's ground (card): at least 4.5:1.
- a control's border and marks against the card's ground (card): at least 3:1.

**WCAG 2.2 criteria it must meet:**
- **1.4.3 Contrast (minimum).** Every text holds 4.5:1 on the card ground in light, dark and sepia.
- **1.4.11 Non-text contrast.** Every border, mark and ring that identifies a control holds 3:1 on the card ground.
- **2.4.7 Focus visible.** Every control shows its keyboard focus (a ring, or the asset's filled state).
- **2.5.8 Target size (minimum).** Every control is at least 24px, or has the spacing exception.
- **1.4.10 Reflow.** The card is never wider than the window less the window margin and its content wraps; the 768px floor is a declared exception until the owner rules on 320px (docs/design/05, 5.8).
- **4.1.2 Name, role, value.** The host is a dialog with aria-modal and a name; the focus returns to the control that opened it; Escape and a press outside close it.

### Rating Scale

A rating from 1 to 5: five radio rounds from low to high, the numbers 1 to 5 over them. Alone, the rounds fill the width under the question; in a group, the right half beside each row's words.

- **Kind:** choice control. **Code:** `src/components/controls/RatingScale.tsx, RatingScaleGroup.tsx, RatingScaleEnds.tsx`. **Stylesheet:** `src/styles/rating-scale.css` (also `src/styles/radio-choice.css`).
- **Parts:** the row's words, or a tick and its words (a group's row); the track: five radio rounds, spread evenly; the numbers 1 to 5, once per group, each over its round.
- **States:** rest, hover, focus, disabled.
- **Used in:** the Segment card: household income, gender mix, kind of area, online comfort (and the end user's), market growth, crowding (doc 35); the Profile card: B1 and E1 to E3, the Emotional and Social needs (doc 36); the Competitor card: K4 and K6 to K9, K8 and K9 banded (doc 41).
- **Custom properties it reads:** `--space-label`, `--space-cell`, `--space-row`, `--font-small`, `--font-body`, `--gap-8`.

| Variant | Where | Note |
|---|---|---|
| vertical (14px label) | a single question: the rounds under it, across the whole width (the Segment's online comfort, market growth and crowding; the Competitor's K4) | RatingScale with its numbers: the track fills its place |
| horizontal (18px label) | a group: the words in the left half, the rounds in the right half (the Competitor's K7 to K9, the Profile's B1) | RatingScaleGroup: the numbers once, over the rounds' half |
| selectable (18px label) | a group whose rows are ticked first; the rounds show once a row is ticked (the Competitor's K6, the Profile's B1, E1 to E3 and the Needs) | RatingScaleGroup selectable: unticking a row clears its rating |
| chosen and disabled (18px label) | the chosen round, and a group that cannot be changed | the chosen round is the app's blue with a white bullet; a disabled group is drawn faint |

| Number | Value |
|---|---|
| round | 16 |
| groupRoundsShare | 0.5 |
| endsGap | 6 |
| columnGap | 12 |
| endsFontPx | 14 |
| rowFontPx | 18 |

**Accessibility.** Keyboard focus is shown by a ring or outline. Name: each row a radio group named by its words; each round "1 of 5, [low word]" to "5 of 5, [high word]". Contrast it must hold:
- a round's --text-muted edge at rest against the band it stands on (rest): at least 3:1.
- the chosen round's fill against the band (rest): at least 3:1.
- the numbers and the row's words against the band (rest): at least 4.5:1.

<!-- /generated:assets -->
