# 1. Current design of the Foundation capability

Status of this document: **current**, written 2026-10-14. It is the single description of what the Foundation capability (Identity, Brand, Business and Strategy Systems) is and what has been decided for it. It replaces the design drafts that were kept as HTML and PDF files (those were converted into the parts below, and only the current version of each was kept).

**Since 2026-10-14** (newest first; the changes themselves are in document 4, the log): on 2026-10-19 the repeated parts of the interface became shared components (the back, remove, funnel, add and tick controls, the number, text and one-line cells, the field label, the free text, the card head and outer box, the name cell, the tooltip, the tile grid, the dropdown and the date popup), and `SectionTiles.tsx` was split into its parts; what is shared and what is left is in document 23. The tables of elements below are the 2026-10-14 reading; where a file or class named here has moved, document 23 and the code are right.

The five documents of this set:

| Document | Holds |
|---|---|
| 1. Current design (this one) | What the app is, how it is built, the decided design |
| 2. References | The sources the app and the documents rely on, the source rule |
| 3. Research | The research behind the design decisions |
| 4. Log | History: what changed and when, version history, decisions |
| 5. Not done yet | What is still to do, in order, with open decisions |

Other current Markdown documents in the project that this one points to and does not repeat: `docs/ai/layout-rules.md` (the measured layout rulebook and the automatic check), `docs/ai/tile-and-card-pattern.md`, `docs/ai/card-kinds.md`, `docs/ai/app-guide.md`, `docs/specifications/business-system/*.md` (the page specifications), `docs/ai/framework-dsl-grammar.md` and `docs/ai/framework-conventions-and-patterns.md` (the framework).

## Contents

- Part A. What the app does
- Part B. How the Foundation is organised
- Part C. The interface elements
- Part D. The cost model
- Part E. The automatic rules
- Part F. Card structure: what the user can reach in each card
- Part G. Card access by type
- Part H. Help texts
- Part I. Colour map (work types)

## Part A. What the app does

The app does six things (the owner's description, 2026-10-14):

| # | Function | In the app |
|---|---|---|
| 1 | **Requests specific information** by different methods (text, multiple choice, filling a field, numbers and so on), with the necessary help | Questions per System and page; field types; help notes ("i"); limits on numbers |
| 2 | **Stores and connects** this information with the relevant parts, and creates further requests accordingly | Answers saved per organization; cards linked by choice; generated cards (channel expenses, insurance); frozen answers that wait for the one they depend on |
| 3 | **Calculates** the inputs, records and presents the results in different forms (tables, diagrams, per time schedule, per category) | Demand and capacity, costs by nature, Funding Need, Financial Position, Break Even, forecast statements, Calendar, the Inventory view |
| 4 | **Proves and validates** the results | Completeness rules and open items, the Review page, capacity check, date checks, Stress Test, "What It Would Take" |
| 5 | **Helps the user** with different methods | Help and instructions, resources, pre-filled information (from connected or existing data); Note and Calendar tools; messages, errors, reminders, confirmations, limits; smart navigation (rails of page, tile and card; arrows; clear requests) |
| 6 | **Generates and exports Business Documents** | Business Plan, Business Model Canvas, Forecast; PDF and Markdown |

## Part B. How the Foundation is organised

### B.1 Systems, pages and chapters

A page of a System can be a **compound page**: several sections drawn as chapters (frames) of one page, defined in `src/framework/engine/PageGroups.ts`. The saved answers still use the original section numbers.

| System | Page | Chapters (frames) and their Master Tiles |
|---|---|---|
| 1. Identity | 1. Definition and Ethics | Chapter 1 Definition: Description, Mission, Positioning, Vision. Chapter 2 Ethics: Philosophy, Values, Principles, Manifesto. |
| 1. Identity | 2. Organization | Chapter 1 Legal Entity: Organization, Founders & Ownership, Formation & Registration, Tax & Business Registration, Additional Legal Requirements, Legal Entity Expenses. Chapter 2 Founders & Capability: Founders; Capability (Gaps and Cover). |
| 2. Brand | Brand System (one page) | Chapter 1 Ambassador: Aesthetics, Body Language, Communication & Voice, Imprint. Chapter 2 Style: Colours, Typography, Text Hierarchy, Icon & Logo, Brand Images (the former Inventory page is folded in). |
| 3. Business | 1. Foundation | One chapter per Segment: Customer Segment and Profile, Competitor and Alternative, Value Proposition, Offering. |
| 3. Business | 2. Customer Engagement | Customer Channel (tiles per Segment); Customer Relationship; Demand & Conversion (these two still folding sections, see document 5). |
| 3. Business | 3. Infrastructure & Capability | Chapter Infrastructure: Founders, Resources, Activities, Partners & Suppliers. Chapter Offering's Capability: Resources, Activities, Partners & Suppliers, Delivery. Chapter Inventory: the Inventory help tile and the Completed help tile. |
| 3. Business | 4. Financial Foundation | Costs, Funding Need, Capital & Funding, Financial Position (folding cards, not tiles yet; see document 5). |
| 3. Business | 5. Sustainability | Revenue, Break Even (folding cards, not tiles yet). |
| 4. Strategy | Strategy System: Situation & Direction (one page) | Current Situation Analysis, SWOT Analysis, Strategic Compass, Strategic Period (with the Roadmap and the Theme, Goal, Objective, Metric cards inside it). Sections 2 (Goals & Objectives) and 3 (Roadmap) are hidden pages; their saved data is kept. |

Eleven of the thirteen chapters of the Foundation are drawn as Master Tiles. The two Financial pages and the lower sections of Customer Engagement are not yet (document 5).

### B.2 Reading modes, screens and accessibility

- **Reading modes:** light, sepia, dark and auto, chosen from one picker in the header (`data-theme`; colours are tokens in `src/styles/colors.css`).
- **Minimum supported width: 768 px** (decided 2026-10-14). Screen classes follow the website (`NorthStardustStudioWebsite`): Tablet 768–1199 px; Laptop 1200 px and wider with height under 1250 px; Desktop 1200 px and wider with height of 1250 px or more. Height 900 is the second reference line (shared with Material's expanded height class).
- **Accessibility target: WCAG 2.2 level AA** (decided 2026-10-14). Focus Appearance (2.4.13) is level AAA and out of scope.
- **Audience:** early-stage entrepreneurs, one person to a small team, often freelancers working from home. English only.

### B.3 Where the rules are kept

| Subject | File |
|---|---|
| Layout tokens, sizes, alignment, interactions, the automatic layout check | `docs/ai/layout-rules.md` |
| Tile and card pattern | `docs/ai/tile-and-card-pattern.md` |
| Card kinds | `docs/ai/card-kinds.md` |
| Page specifications (Business System) | `docs/specifications/business-system/` |
| Where each part of the app is | `docs/ai/app-guide.md` |
| How to verify a change | `docs/ai/verification-and-regression-playbook.md` |

## Part C. The interface elements

This part records every kind of element the Foundation capability is built from, by layer, so that nothing is missing when the asset library is written (document 5). It comes from a read of the code on 2026-10-14. It was verified for structure and exports; CSS classes and runtime behaviour were not each checked. Paths: `I/` is `src/components/interview/`, `C/` is `src/components/`.

Global rules that apply to every element (2026-10-14; the sizes and states are in the rulebook `docs/ai/layout-rules.md` and in the contracts under `src/library`): an "i" stands 6px after its label's last word (`--info-gap`); text that goes bold under the pointer, or is bold by default, is 0.05em wider (`--bold-tracking`); a wired button (the "i", the "+" box, the remove x, an "Add ..." button) has no fill at rest.

### C.0 The owner's vocabulary

| Term | Meaning |
|---|---|
| **Page** | One screen of a System, with its title and rails |
| **Chapter** | A frame that contains Master Tiles |
| **Master Tile** | A large tile on the main page (the `SectionTile` square drawn by `SectionTiles`, through `TileSlot` and `TileFace`) |
| **Help tile** | A tile that holds no direct information and only filters and presents records (a cost table, linked Tiles and so on). **The Inventory tile and the Completed tile are help tiles, not Master Tiles.** |
| **Diagram tile** | A category of Master Tile of its own (2026-10-14): a tile that stands for a drawing opening in its dialog, not for a list. Today the Roadmap (a Gantt diagram): a wide banner with a large title and no list. |
| **Card** | An opened tile (an opened Activity tile is an Activity Card) |
| **Floating Card** | A Card placed over the page; a placement, not a type |
| **Nested Cards** | A Theme Card with Goal, Objective and Metric Cards and an Initiative list |
| **Tables, Sections, panels** | As named in the layers below |

Note from the code: a help tile is not a separate kind in the code. "Completed" is a normal `SectionTile` marked `completed: true`, and "Inventory" is recognised by its id (`overview`). There is no `help` or `filter` field on `SectionTile`. Making the help tile a real kind is a task in document 5.

### C.1 What the Foundation is made of

Pages come from `src/assets/SystemAnswers/01..04_*.md`. Each page's `Structure` selects an `AnswerType`, and `I/AnswerRenderer.tsx` switches on it.

| System | Pages | AnswerType and renderer |
|---|---|---|
| 1 Identity | Definition, Ethics | Free Text drawn as column tiles (`AnswerRenderer`, `ColumnFields`, `ColumnHeads`) |
| 1 Identity | Legal Entity | `LegalEntityEditor` |
| 1 Identity | Founders Profile | `FoundersProfileEditor` |
| 2 Brand | Ambassador (with the Imprint field) | Free Text, column tiles |
| 2 Brand | Style | `BrandStyleEditor` plus `BrandInventoryEditor` |
| 3 Business | 1 Foundation | `BusinessFoundationEditor` |
| 3 Business | 2 Customer Engagement | `BusinessEngagementEditor` |
| 3 Business | 3 Infrastructure & Capability | `BusinessCapabilityEditor` |
| 3 Business | 4 Financial Foundation | `FinancialFoundationEditor` |
| 3 Business | 5 Sustainability | `FinancialSustainabilityEditor` |
| 4 Strategy | 1 Situation & Direction | `StrategyFoundationEditor` |
| 4 Strategy | 2 Goals & Objectives, 3 Roadmap | `StrategicPeriodEditor`, `StrategicRoadmapEditor` (hidden as pages; used inside the Strategic Period tile) |

### C.2 Layer A: application frame

| Element | Contains and does | File | Used on |
|---|---|---|---|
| App header | Logo, save status, reading-mode picker, Focus mode, Search, Notes, Review, Settings, undo toast, organization name | `C/AppHeader.tsx` | All pages |
| Header tools | Icon plus word: Search (Ctrl+K), Notes, Review (with open-item count), Settings, Focus mode | `SearchButton`, `notepad/Notepad.tsx`, `ReviewButton`, `SettingsButton`, `FocusModeButton` | With an organization open |
| Save status | Saved or failed-save hint | `C/SaveStatus.tsx` | Header |
| Theme switch | Reading mode | `C/ThemeSwitch.tsx` | Header |
| Footer | Back button | `C/AppFooter.tsx` | Interview, Review, Documents, Settings |
| Landing | Organization list, add button, cards, delete confirmation, first-run preferences | `pages/Landing.tsx`, `C/UserPreferencesDialog.tsx` | `/` |
| System selection | Capability list, System list, Continue, Documents button | `pages/SystemSelection.tsx`, `CapabilityList`, `SystemList`, `SystemItem` | `/assistant` |
| Calendar panel | Slide-in rail with month view, task notes and times, periods, date-format toggle, funnel | `C/OrganizationCalendarPanel.tsx`, `CalendarFunnel.tsx`, `services/CalendarPeriods.ts` | System selection |
| Notepad panel | Right slide-in; notes linked to fields or cards; "pick" banner; empty state; marks on linked fields | `C/notepad/Notepad.tsx`, `NotedHover.tsx` | All pages with an organization |
| Search dialog | Results open a System, page, field (card unfolded) or answer | `C/SearchDialog.tsx`, `services/SearchService.ts` | Header |
| Undo toast | One toast for the app, after a removal | `C/UndoToast.tsx`, `services/UndoService.ts` | Header |
| Review page | Three groups (Still open, Worth a second look, Missing from the documents), each item with "Go there" | `pages/Review.tsx` | `/review` |
| Global Settings page | Financial plan, pay and tax, assets (useful life, amortisation), Channel Fee table | `pages/GlobalSettings.tsx`, `FinancialPlanSettings.tsx` | `/settings` |
| Business Documents page | Tabs (Business Plan, Business Model Canvas, Financial Forecast), period picker, downloads | `pages/BusinessDocuments.tsx` | `/documents` |
| Confirmation dialog | Overlay, title, message, action buttons | Markup repeated in `Conversation.tsx`, `Landing.tsx` and others (6 uses; no shared component) | Delete, strategy prompt, export steps |
| Export dialogs | Two steps: options, then Markdown or PDF | `Conversation.tsx` | Last page |
| Error screen | Message with a clear-saved-data action | `C/ErrorBoundary.tsx` | App-wide |
| Interview progress line | Thin bar, switched off | `C/InterviewProgress.tsx` | Hidden |

### C.3 Layer B: page furniture

| Element | Contains and does | File |
|---|---|---|
| Interview header | System number and name, em dash, page title; capability colour and icon | `I/InterviewHeader.tsx` |
| Introduction page | Guiding question, what it covers (numbered list of page links), what it uses from earlier, thinking time, Start Interview arrow | `Conversation.tsx` |
| Bullet rail | Bullets with names or tooltips and status shape; the active bullet blooms; the left Pages rail (Introduction first) and the right Sections rail. The rails are one system: a bullet and a label in one button, the lit item bold, a hovered item only underlined, below 1700px the bullets alone with the name as a tooltip | `I/rails/BulletRail.tsx`, `railItems.ts`, `useActiveRailSection.ts`, `styles/bullet-rail.css`; contract `src/library/assets/rails.ts` (the rails in a dialog's tab are not in the contract yet) |
| Page arrow | Previous and next arrow above each rail; ← and → keys | `I/PageArrow.tsx` |
| Title help arrow | Arrow that folds a title's guidance: the label arrow after the column title and its "i" | `I/LabelArrow.tsx`, `CardTitleHelp.tsx`, `ColumnHeads.tsx` |
| Label arrow | One frameless triangle in the label's colour and size beside a label or a title (outline at rest, filled under the pointer and the focus): the chapter titles of page 3, a founder's Responsibilities and Completed, a card's Links, the Initiatives. Every other fold arrow is the standard 36px arrow | `I/LabelArrow.tsx`, `styles/label-arrow.css`; contract `src/library/assets/labelArrow.ts` |
| Help toggle | "Hide Help" or "Need Help?" | `Conversation.tsx` |
| Back button of a dialog | "< Back" at the dialog's foot, or built like a rail item (an arrow on the bullets' line, the word in capitals) in the dialog's tab after the last option | `SectionTiles.tsx` (`.section-tile-back`, `.carousel-rail-back`); contract `src/library/assets/backButton.ts` |
| Page group | Several frames side by side on one page | `Conversation.tsx` (`.page-group`), `PageGroups.ts` |
| Field status line | Small status or hint under a field | `I/FieldStatusLine.tsx`, `fieldMarks.tsx` |
| Fold all | Expand all or Collapse all for a group of cards | `I/FoldAllToggle.tsx`, `useItemFolds.ts` |

### C.4 Layer C: chapter (frame) types

A "Chapter" has no named type in the code. Frames are classes:

| Frame | Class and file | Used on |
|---|---|---|
| Tiles frame (heading plus tiles) | `.answer-columns … column-tiles-page`, `.tiles-frame-head` (`AnswerRenderer`) | Identity Definition and Ethics, Brand Ambassador |
| Single wide frame | `column-tiles-page-wide` | Strategy Roadmap |
| Single frame | `strategy-single-frame` | Strategy 1 |
| Two section cards | `.business-foundation-card` with `CardTitleHelp` and `.card-scroll` | Business 3 |
| Numbered subsection frames | `heads[]` in `BusinessFoundationEditor` and `BusinessEngagementEditor` | Business 1 and 2 |
| Financial section cards | `FinancialSectionCard`, `FinancialPageHead`, `FinancialBlock` | Business 4 and 5 (no tile frame yet) |
| Settings section | `.settings-section` | Global Settings |

### C.5 Layer D: Master Tiles, help tiles and tile dialogs

| Tile | Holds | Notes |
|---|---|---|
| Large column tile | Identity Definition, Ethics, Brand Ambassador; Legal Entity Organization, Founders & Ownership, Registrations, Expenses | `large: true`; `view: true` gives a dialog of sub tiles |
| Brand picture tiles | Colours, Typography & Text Hierarchy, Icon & Logo, Brand Images | `picture` property |
| Founders Profile tile | Capability and the founder card tiles | `FoundersProfileEditor` |
| Business Foundation tiles | Segment Description, Value Proposition and card boxes (Profile, Competitor, Offering) | `BusinessFoundationEditor` |
| Engagement tiles | One per channel and subchannel (teal hue); `inactive` for an unused channel | `SectionTiles` |
| Infrastructure group tiles | Founders; Resources, Activities, Partners & Suppliers (per chapter); Delivery; Workspace (`direct`) | `BusinessCapabilityEditor` |
| **Diagram tile** | The Roadmap: a wide banner (442 × 102 px) with a 36 px title and no list; its dialog covers the page | `SectionTile.diagram`, `StrategicPeriodEditor` |
| Strategy tiles | Current Situation, SWOT Analysis, Strategic Compass, Strategic Period; Goals and Objectives; Roadmap | `StrategyFoundationEditor`, `StrategicPeriodEditor` |
| **Help tile: Inventory** | Counts of resources, activities, partners & suppliers; its dialog (`CapabilityOverview`) shows tiles or a cost table with a funnel, count bar and link legend | `BusinessCapabilityEditor`, `CapabilityOverview.tsx`, `capabilityFloor.ts` |
| **Help tile: Completed** | Grey; lists completed activities; exists only while one is completed | `BusinessCapabilityEditor` |
| Sub tile | A section tile inside a dialog (the three Registrations tiles) | `I/SubTiles.tsx` |
| Card tile | The tile for a card: 215 px, number, name, lines, link circles, red glow if incomplete, grey if finished, faded if unused, drag to reorder | `I/CardTile.tsx` |
| Picture box | A dialog's picture tile (colour, typeface, image) | `I/PictureBoxes.tsx` |
| Add tile | Dashed "+" tile after the last card | `SectionView.tsx` |
| Subcategory box | A dialog's category tile | `SectionView.tsx` |
| Figure tile | Label, value, detail (financial figures) | `FigureTiles` in `FinancialParts.tsx` |

Tile dialogs (`SectionTiles.tsx`): header with a trail and Back (`DialogHeading`, `useDialogInnerBack`, `useDialogInnerStep`, `InnerLevel`, `DialogRail`); frame sizing (`dialogFrame`, `useDialogTileSize`). Dialog kinds: a navigation grid of boxes that closes on choosing a card; a section view of category tiles; a section content dialog; a wide dialog (Roadmap).

### C.6 Layer E: cards and their parts

`docs/ai/card-kinds.md` lists 16 kinds: Resource; Activity; Partner, Provider or Professional; Offering delivery; Founder (Infrastructure); Channel and subchannel; Segment Profile, Competitor, Offering; Segment Description and Value Proposition; Legal requirement; Legal expense; Founders' profile; Brand colour; Brand typeface; Brand image; Strategy Theme, Goal, Objective, Metric; Initiatives (not a card).

**Card kinds in the code that `card-kinds.md` does not list:** the Workspace (a Resource of the category Workspace); the Brand Text Hierarchy box; Strategy Situation and SWOT boxes and the Strategic Compass; the parts of a channel card (Actions, Expenses, channel Resource card); the Customer Relationship block; Financial cost, funding need and revenue stream cards; Global Settings asset rows; the Infrastructure card; the founder's Responsibilities card.

| Card part | Component |
|---|---|
| Card head | `.fold-card-head`; `BusinessCard` (`BusinessCardFields.tsx`) |
| Name cell | `CardNameInput.tsx` |
| Fold arrow | `FoldArrow.tsx` (the standard 36px arrow; an arrow beside a label or a title is the label arrow, above) |
| Order number | `CardNumber.tsx` |
| Remove × | `BusinessRemove`, `.strategy-box-remove`, `removal-marks`; contract `src/library/assets/removeX.ts` |
| Link symbol and dots | `LinkSymbol`, `Dots` and `SYMBOLS` (`CardTile.tsx`), `ActionMarkers.tsx` |
| Dates | `DateCellInput` |
| Status | `status-shape.css`, `ResourceStatuses` |
| Quantity, price, groups | `BusinessField`, `BusinessGroup` |
| Strategy card navigation | `CardNav.tsx`, `groupView.ts` |
| Strategy box actions | `BoxActions` in `ReorderControls.tsx` (remove, sort funnel, drag, keyboard move) |
| Missing-answer marks | `MissingScope`, `missingFor`, `CardCompleteness.ts` |
| Founder cards | `FounderCards.tsx` (at most 8 open, 4 per row) |
| Floating card | `FloatingCards` in `SectionTiles.tsx` (also pair mode: parent above, child below) |

### C.7 Layer F: fields and controls

| Control | Component |
|---|---|
| Text, one or several lines | `InterviewInput`, `StrategyTextArea`, `BusinessText`, `CardNameInput` |
| Suggested text | `SuggestedInput` |
| Note | `NotesField`, `BusinessNote` |
| Optional field (tick plus growing box) | `OptionalField`, `OptionalNote` |
| Numbered list, input and static | `NumberedListInput`, `NumberedListStatic`, `NumberedTextList` |
| Bullet list, static | `BulletListStatic` |
| Imprint (two text parts) | `ImprintFields` |
| Number and money | `numberInput.ts`, `Amounts.ts`, `FinancialParts` |
| Date, month and year, plan month | `DateCellInput`, `MonthYearPicker`, `PlanMonthField` |
| Picker (dropdown) | `OptionPicker.tsx` |
| Tick list and multi-tick | `BusinessTicks` |
| Toggle (date format) | `date-format-toggle.css` |
| Funnel menus | `CapabilityOverview` (`FunnelPicker`, `MenuHead`), `CalendarFunnel`, the sort funnel in `BoxActions` |
| "+" box | `BusinessAddButton`; `AddThemeMenu`; `TileAdd`; the `.plus-box` button of the tiles; contract `src/library/assets/plusBox.ts` |
| Step control | `BusinessStep` |
| × | `.strategy-box-remove` |
| Field kinds, searchable fields | `fieldKindOf` in `FieldRenderer.tsx`; `FieldRegistry`, `FieldKeys` (used by Notepad and Search) |

### C.8 Layer G: tables

| Table | File | Used on |
|---|---|---|
| `DynamicTable` (text, notes, number, field, date, dynamic-select, autofill columns) | `I/DynamicTable.tsx` | Other Systems; no Foundation page uses it |
| Customer channel table (`business-channel-table`) | `BusinessEngagementEditor` | Business 2 |
| Customer Relationship table (`business-relationship-table`) and strategy tab | `BusinessEngagementEditor` | Business 2 (near-copy of the channel table class) |
| Channel resource table | `ChannelResourceTable.tsx` | Business 2 |
| Delivery budget table | `BusinessCapabilityEditor` | Business 3 Delivery |
| Inventory cost table | `CapabilityOverview` (`TABLE_COLUMNS`) | Inventory help tile |
| Financial costs ledger | `FinancialFoundationEditor` | Business 4 |
| Figure table | `FigureTable` (`FinancialParts.tsx`) | Business 4 and 5 |
| Settings tables (Assets, Channel Fee) | `GlobalSettings.tsx` | Settings |
| Forecast table | `BusinessDocuments.tsx` | Documents |

### C.9 Layer H: panels, popups, menus, tooltips and info notes

| Element | File | Notes |
|---|---|---|
| Info note ("i"): up to 3 points (text, title and text, or a cited source); `fullList` lifts the cap. It stands 6px (`--info-gap`) after its label's last word, on that line's centre; a wired button (no fill at rest) | `I/InfoNote.tsx`, `InfoText`; contract `src/library/assets/infoNote.ts` | About 100 uses |
| Tooltip | `C/Tooltip.tsx` (`useAboveTip`, `TooltipBox`; since 2026-10-19 every tooltip box is `TooltipBox`: the icons, the action symbols, the Roadmap bars, the noted fields) | Also native `title` tooltips and the rail labels |
| Floating panel hook | `hooks/useFloatingPanel.ts` | Used by funnel menus |
| Option picker list | `OptionPicker.tsx` (`hug`, `tight`, `sizeFor`) | |
| Funnel menu | `CapabilityOverview`, `CalendarFunnel` | Two separate funnels |
| Card title help | `CardTitleHelp.tsx` | Guidance over the card |
| Rail tab | `useRailTab.ts` | |
| Scroll rules | `useScrollRules.ts` | |

### C.10 Layer I: messages

| Kind | Where |
|---|---|
| Empty states | `section-tile-empty`, `strategy-empty-note`, `legal-entity-empty-note`, `BusinessEmpty`, `review-empty`, `search-empty`, `notepad-empty`, `option-picker-empty`, `roadmap-empty-row` and others |
| Missing or incomplete | Red glowing tile, `missingWords`, `incompleteTitle`, `capability-overview-incomplete` |
| Alerts | `legal-entity-total-alert`, `settings-alarm`, `brand-inventory-error`, the `FrozenUntil` hint |
| Open items | Review page, `OpenItems.ts`, `ReviewItems.ts` |
| Signals | `SignalList` (risk, caution, good, info) |
| Isolation notes | `IsolationNote` |
| Limits | The 3-point cap on info notes; the open-founder cap; "Already uses this subchannel" |
| Confirmations | `confirmation-warning-*` |
| Hints | `organization-hint`, `settings-hint` |
| Toast and banner | `UndoToast`; `notepad-pick-banner` |

### C.11 Layer J: generated outputs

| Output | Source |
|---|---|
| Business Plan, Business Model Canvas, Financial Forecast (annual, quarterly, monthly), with CSV and PDF | `pages/BusinessDocuments.tsx`, `engine/BusinessDocuments.ts`, `FinancialForecast.ts` |
| Export (Markdown and PDF) | `ExportContentBuilder.ts`, `MarkdownExporter.ts`, `PdfExporter.ts`, `ExportRenderers.ts` |
| Calendar items from card dates (Opening Date, Warranty ends, Payment due, Contract or supply ends, Activity deadline, Legal fee, Starts, Activity starts, Founder starts, Formation) | `CalendarCardDates.ts`, `CalendarTaskService.ts` |
| Charts | `CashTimelineChart` (`FinancialParts.tsx`); Strategic Roadmap (`StrategicRoadmapEditor`, `roadmapZoom.ts`, `roadmapTooltip.ts`) |
| Review list | `ReviewService.ts` |
| Palette | `Palette.ts` |

### C.12 What the record shows

- **In code, not named in `tile-and-card-pattern.md` or `card-kinds.md`:** `SubTiles`, `PictureBoxes`, `CardBoxes`, `SectionView`, `SubcategoryBoxes`, `AddTile`, `CardNav`, `BoxActions`, `FoldAllToggle`, `FigureTiles`, `SignalList`, `CashTimelineChart`, the Introduction page, the status line, Focus mode, the undo toast, the Notepad, the search dialog, the Inventory funnel, "Completed".
- **Named in documents, not in code:** "Master Tile", "Chapter" and "help tile" are the owner's words and have no code counterpart. "Marker column" is gone, as `card-kinds.md` says.
- **Unused:** `I/CardColumns.tsx` is imported only by its own test; `InterviewProgress` is switched off.
- **Near-duplicates to merge in the asset library:** the two funnels (`CapabilityOverview`, `CalendarFunnel`); the confirmation-dialog markup repeated in six places; `business-channel-table` and `business-relationship-table`; the three rails (`BulletRail`, `CardNav`, the dialog rail); several "empty note" classes.


## Part D. Cost model

Pink = Infrastructure, brown = Offering. This document holds only what has been decided.

### 1. The structure

| Level | Content |
|---|---|
| Places | Infrastructure (what runs the company), Offering (what makes and delivers each offering), Channel (the teal cards a customer channel creates, in the Offering place), Legal Entity (registrations and their expenses only) and the financial foundation (calculated lines). |
| Types | Resources, Activities, Partners and Suppliers. The Founders tile stays and maps to Human Resources > Founders & Owners. |
| Resource categories (9) | Workspace, Utilities, Workstation, Equipment, Vehicles, Digital Infrastructure, Materials & Inventory, Documents & Rights, Human Resources. |
| Groups | 21 in Infrastructure and 26 in Offering, 47 in all. Partners and Suppliers use their groups as categories. |
| Activity groups | Infrastructure: Pre-Operational (with a type, Capital Expenditure or Start-up Expenses, which is not shown as a category) and Operational. Offering: Production, Marketing, Sales & Customer. No special card kinds. |
| Drivers (7), labelled Frequency on the card | One-time, Monthly, Quarterly, Annually, Per unit (with a unit name), Per project, % of Rev. A card's behaviour is worked out from the driver and the billing type. |
| Billing types | For Platforms & Payments, Revenue Partners, Royalties, Insurances and Licences: Percentage, Fixed amount or Lump sum (section 5). |
| Cost nature | Start-up, CapEx, OpEx, COGS, and Contingency draws. Set automatically by the rules in section 4; the user can change it on the card. |

### 2. What each card contains

| Card | What it contains |
|---|---|
| Every card | Name; Start date and End date (two Calendars straight after the name: Start date is required, End date is optional, and a founder has a Start date only); Place; Type; Category and Group (fixed lists, with no “Other…”; a dropdown with only one option is shown as text); Status (resource cards: Exists / Free, Partners & Suppliers, Activity (a list of the activities not yet ended, or “Other…” to create one), Costs; a space or vehicle: Exists / Free, Rent, Activity, Buy; people cards: Needs Activity and Needs Investigation as well), with a + button that adds another status row; Qty (optional, before the price, on resource cards); Price and Currency; Frequency (the 7 drivers; a Per unit frequency needs a unit; a frequency with one option is shown as text, and a One-time frequency is not shown); Payment Plan (Per project only); Linked offerings (required on an Offering card, with a percentage for each when several are ticked, totalling 100%); Description (notes: each is stamped with an automatic record date and time, and an Add Date button adds a date). A link to another card is the link symbol beside a name chosen from a dropdown. A card generated by another card has no symbol: its name is the link. Behaviour and cost nature are worked out and hidden. No card has a purpose option. |
| Resource card | The common fields. A space or a vehicle (Premises, Workshop & Storage, Company Vehicles, Delivery Vehicles) has the status Rent or Buy. Rent opens a name dropdown limited to one supplier group (Property, Vehicles & Facilities in Infrastructure; Landlords, Leasing & Warehouses in Offering), whose card holds the rent or lease and its extras. Buy shows the price: One-time for a space, Per unit for a vehicle. An asset card shows Useful life only when its status is Costs or Buy and the price of one unit, with its linked services, is at or above the capitalisation limit. A people card (Founders, Admin Team, Delivery Team) has an optional Allowance input for people who work from home. An Equipment card has an optional Warranty checkbox with its date beside it, and no servicing field. Insurances and Certificates keep their details in the Description: the renewal or expiry date is the End date, and the insurer or issuer is added with the + status. |
| Partner and Supplier card | The common fields without Qty; the organisation, contact and terms are written in the Description. A Revenue Partner has a Rate override. A landlord or leasing supplier shows its extras by what is connected: a workspace shows Deposit, Service charge and Commercial property tax (and Handling per pallet in Offering); a vehicle shows Qty before the price and Road tax. |
| Activity card | Belongs to one activity group (section 13). Start date and End date come straight after the name; the end is optional, and an activity without one counts as one day. The dates stay inside the period of the group. After the Performer, a Resources tick box opens a list of resources of the place, each with a unit number when it has units. A linked card's start date cannot be after the activity's start date when the activity has no end date, or after its end date when it has one. The cost shows after the last linked resource, and is named Total when more than 2 linked cards carry values. The card holds no price and no cost nature. |
| Insurance card (generated) | Created from a vehicle, premises, workshop, machine, event or channel. The renewal date is its End date, the insurer is added with the + status, and the cover limit, grade and other details are written in the Description. |
| Channel expense card | Has the layout of its group's card, with the price blank, so it is incomplete until priced. It has no link symbol: its name is the link to the channel, and it is removed from the channel. The user can create the same card without a channel. |
| Repair (a later batch) | Unlocked with actual data: a dated record linking a resource and a Technical Support supplier. It draws on the Contingency Fund and allows plan against actual. |
| Legal Entity expense | Registrations and their expenses only. Each expense has one required link to a registration or requirement, and no more than one. |

#### Quantity and the driver

| Driver | Quantity | Examples |
|---|---|---|
| Qty | Optional on resource cards, placed before the price: whole numbers, with decimals only when the unit is hour, metre, litre or kWh. A new card starts at 1. Total = Qty × price | 3 laptops at 1,000 each; 2 baristas at 1,200 a month; 4 coworking seats at 200 a month |
| Per unit | Qty × price per unit; a unit name is required. An asset purchase is priced Per unit | Materials & Stock: 500 kg at 2. A laptop: 1 item at 1,500 |
| Premises, Insurances, Legal documents | Qty stays empty | Rent 1,500 a month; an insurance 600 a year; legal drafting 800 once |
| % of Rev | The calculation follows the revenue of the line; Qty is not used | Royalties, Revenue Partners, Platforms & Payments percentage |
| Activity cards | No Qty: they hold no price |  |

A new card starts with a quantity of 1. Choosing a Per unit driver moves the focus to the quantity and requires a unit name. A % of Rev driver makes the quantity read-only.

#### Fields shown by card

The app unlocks a field only where it is needed, to keep the card quiet.

| Card | Fields shown | Fields hidden |
|---|---|---|
| Asset groups: Equipment, Vehicles, Furniture & Fittings, Fixtures & Displays | Qty; Useful life (when the status is Costs or Buy and one unit's price is at or above the limit); Warranty checkbox (Equipment only, optional) | Import duties, rates |
| Supplier card of Producers & Wholesalers | Minimum order, Customs duty, Clearance and handling, Other duties | Warranty, useful life |
| Billing type Percentage (Royalties, Revenue Partners, Platforms & Payments) | Billing type and Rate override | Everything else |
| Premises, Workshop & Storage, Company Vehicles, Delivery Vehicles | Status: Rent (a name from one supplier group) or Buy (the price) | Useful life when rented |
| Landlord or leasing supplier | By what is connected: a workspace shows Deposit, Service charge, Commercial property tax; a vehicle shows Qty and Road tax | The extras of the other kind |
| A Per unit frequency | A unit chosen from a dropdown of the group's units (always including “unit”; bill and order work too), with no label, like the currency |  |

### 3. The groups

#### 3.1 Infrastructure: Resources

| Category | Group | What the user writes (the "i" text) | Drivers | Behaviour | Cost nature | Extras or options | Links and generated cards |
|---|---|---|---|---|---|---|---|
| Workspace | Premises | The space where the team works, owned, rented through a landlord or at home, e.g. Studio rent, Shared-space seat, Home-office allowance, Owned office. | One-time (bought) | Step | CapEx (status Buy). Rent: the cost sits on the supplier's card | Commercial property tax, Service charge (when bought) | Rent links a supplier in Property, Vehicles & Facilities, which holds the rent and its extras. Generates an Insurances card |
| Utilities | Premises Utilities | The services the daily operation consumes, e.g. Electricity, Gas heating, Broadband line, Mobile plan. | Monthly | Fixed or semi-variable | OpEx | None; usage is inside the bill | Property, Vehicles & Facilities; Goods & Equipment |
| Workstation | Furniture & Fittings | The furniture and fittings of the work areas, e.g. Standing desk, Drawing table, Ergonomic chair, Filing cabinet. | Per unit (items) | Step (a purchase) | CapEx when one unit's price is at or above the capitalisation limit; OpEx below | None | Goods & Equipment (Supplier) |
| Equipment | Devices & Tools | The devices and tools the team uses for its own work, bought or leased, e.g. Laptop, Label printer, Mirrorless camera, Vehicle tracker, Protective goggles. | Per unit (purchase); Monthly (lease) | Step; Fixed | CapEx or OpEx by the limit on one unit's price; OpEx (lease) | None; Warranty checkbox (optional) | Goods & Equipment |
| Vehicles | Company Vehicles | Cars and bikes the company owns or leases for general use, e.g. Sales car, Cargo bike, Minibus lease. | Per unit (bought) | Step | CapEx or OpEx by the limit on one unit's price. Rent: the cost sits on the supplier's card | Road tax (when bought) | Rent links a supplier in Property, Vehicles & Facilities, which holds the lease. Generates an Insurances card |
| Vehicles | Vehicle Running Costs | Fuel and the everyday running costs of company vehicles, e.g. Petrol, Electric charging, Car wash, Washer fluid. | Per unit (km); Monthly | Variable; Fixed | OpEx | None | The vehicle; Goods & Equipment |
| Digital Infrastructure | Software & Web | Software subscriptions and the public website, e.g. Bookkeeping software, Company website, Shared mailbox, Fleet tracking. | Per unit (a licence or seat); Monthly; Annually | Variable; Fixed | OpEx | None | Creative & IT Services for building |
| Digital Infrastructure | Cloud & Security | Storage, back-up and protection of files and data, e.g. Cloud drive, Nightly back-up, Password vault, Antivirus. | Monthly | Fixed; usage inside the plan | OpEx | None | Software & Web |
| Materials & Inventory | Business Consumables | Everyday items the business uses up and replaces, e.g. Copy paper, Dish soap, Coffee beans. | Monthly; Per unit | Fixed; Variable | OpEx | None | Goods & Equipment |
| Documents & Rights | Insurances | Policies that cover the company's liability, premises and people, e.g. Public liability, Cyber, Key person, Directors and officers. | Annually; Monthly (premium) | Fixed | OpEx (fixed amount); a calculated OpEx line per employee for key-person and health cover | None; billing type | Generated by vehicles, premises and assets; the insurer or broker is a Business Services Supplier. The renewal date is the End date; cover limit and grade go in the Description |
| Documents & Rights | Licences | Paid permissions: the right to use another's work and permits from authorities, e.g. Stock photo licence, Typeface rights, Image library, Staff parking permit. | One-time; Annually; Per unit (seats) | Fixed | Initial permit: Start-up (lump sum). Annual renewal, also per seat: OpEx (fixed amount) | None; billing type | Software & Web, Creative & IT Services |
| Documents & Rights | Certificates | Certificates and inspections of the premises and the team, e.g. Gas safety certificate, Fire-risk assessment, First-aid award, Energy rating. | One-time; Annually (renewal) | Step; Fixed | Start-up before the opening; OpEx after it | None | Technical Support for inspections. The expiry date is the End date; the issuer is added with the + status; the outcome goes in the Description |
| Documents & Rights | Tickets & Trip Costs | The fares and stops of trips that serve the whole company, e.g. Conference train fare, Hotel for a seminar, Airport taxi, Car park. | Per unit (trip); Per project | Variable | OpEx | None | Business Services (travel agents). Travel for the whole company, with tolls and parking |
| Human Resources | Founders & Owners | Owners who work in the company and draw pay from it, e.g. Founder salary, Part-time director fee. | Monthly | Fixed | OpEx (months before launch count as pre-launch fixed costs) | Commission, Bonus; Allowance (an optional input) | Kept as the Founders tile (salary, hours, delivery share) and mapped to this group. The owner's own hours are covered here |
| Human Resources | Admin Team | Staff and helpers who handle the company's administration, e.g. Operations manager, Bookkeeper, Receptionist, Intern. | Monthly | Fixed; step with a hire | OpEx | Commission, Bonus; Allowance (an optional input) | None |

#### 3.2 Offering: Resources

| Category | Group | What the user writes (the "i" text) | Drivers | Behaviour | Cost nature | Extras or options | Links and generated cards |
|---|---|---|---|---|---|---|---|
| Workspace | Site Hire | The site rented for one event or job, e.g. Market pitch fee, Stand levy, Marquee frame, Rehearsal room slot. | Per project (event or job) | Step | COGS | None | An activity card for the event; generated Insurances card |
| Workspace | Workshop & Storage | The permanent base where the product is made or stored, e.g. Warehouse bay, Container yard, Shared-kitchen membership, Chiller space. | One-time (bought) | Step | CapEx (status Buy). Rent: the cost sits on the supplier's card | Commercial property tax, Service charge (when bought) | Rent links a supplier in Landlords, Leasing & Warehouses, which holds the rent and its extras. Generates an Insurances card |
| Utilities | Process Utilities | The energy, water and waste services that production consumes, e.g. Firing power, Rinse water, Chemical disposal. | Per unit (kWh, litre) | Variable | COGS | None | Workshop & Storage |
| Workstation | Fixtures & Displays | Fixed installations in your premises for making or showing the product, e.g. Workbench, Pallet racking, Showcase shelves, Sign board. | Per unit (items) | Step (a purchase) | CapEx when one unit's price is at or above the capitalisation limit; OpEx below | None | Workshop & Storage |
| Equipment | Production Machinery | Machines that turn raw materials into finished goods, e.g. Floor loom, Industrial oven, Laser cutter. | Per unit (machines) | Step (a purchase) | CapEx when one unit's price is at or above the capitalisation limit; OpEx below | None; Warranty checkbox (optional) | Its installation is a Technical Support supplier card, added to the asset. Generates an Insurances card |
| Equipment | Devices & Tools | The tools, instruments and gear used to make or deliver the offering, besides its machines, e.g. Card reader, Stall display kit, Tripod rig, Hard hat, Moisture meter. | Per unit (purchase); Annually | Step; Fixed | CapEx or OpEx by the limit on one unit's price; OpEx (annual) | None; Warranty checkbox (optional) | Created by a channel for display kit or hardware (T6) |
| Vehicles | Delivery Vehicles | Vans and trucks that carry or install the product, e.g. Transit van, Refrigerated truck, Short-term hire. | Per unit (bought) | Step | CapEx or OpEx by the limit on one unit's price. Rent: the cost sits on the supplier's card | Road tax (when bought) | Rent links a supplier in Landlords, Leasing & Warehouses, which holds the lease. Generates an Insurances card |
| Vehicles | Delivery Running Costs | Fuel and the everyday running costs of delivery vehicles, e.g. Diesel, AdBlue, Van valet, Cab air freshener. | Per unit (km, delivery) | Variable | COGS | None | Delivery Vehicles |
| Digital Infrastructure | Sales & Delivery Tools | Software that takes orders, bookings and payments, then delivers the result, e.g. Web shop, Booking app, Newsletter tool, File transfer. | Monthly; Annually | Fixed | OpEx | None | Created by a channel (T1) |
| Digital Infrastructure | Platforms & APIs | Online services your product calls, billed per use, e.g. AI text service, Maps lookup, Address check, Speech transcription. | Per unit (call, token) | Variable | COGS | None | None |
| Materials & Inventory | Materials & Stock | The materials, parts, packaging and resale goods that each sale uses, e.g. Yarn, Brass fittings, Mailer boxes, Gift wrap, Sample swatches, Resale mugs. | Per unit | Variable | COGS as units are sold; before the opening, Inventory (a current asset) funded by a separate cash line | None | Created by a channel for packaging and samples (T8); Producers & Wholesalers |
| Documents & Rights | Insurances | Policies that cover products, jobs and events, e.g. Product recall, Carriage of goods, Event cancellation, Customer default. | Annually; Per project | Fixed; step per project | OpEx (fixed amount); COGS when per project | None; billing type | Generated by the vehicle, workshop, event or channel (T12) |
| Documents & Rights | Licences | Paid permissions for the offering: the right to use another's work and permits from authorities, e.g. Licensed artwork, Backing track, Patented method, Parking-bay suspension. | One-time; Annually; Per unit (seats) | Fixed or variable | Lump sum: Start-up. Annual renewal: OpEx. Percentage: calculated COGS line | None; billing type | None |
| Documents & Rights | Royalties | Payments that follow the sales or use of another's creation, e.g. Author royalty, Franchise percentage, Patent share, Master-rights split. | % of Rev; Monthly or Annually (fixed); One-time (lump sum) | Variable (percentage); fixed (amount); step (lump sum) | Percentage: calculated COGS line. Fixed amount: OpEx line. Lump sum at the start: intangible asset in the Pre-operational period, amortised automatically | None; billing type | None |
| Documents & Rights | Certificates | Certificates, inspections and the tests behind them, needed to sell or use an offering, e.g. CE-mark testing, Organic certification, Flame trial, Food-safety swab. | Per project; Annually | Step; Fixed | COGS for the first certification; OpEx for renewals and audits | None | Accreditation Bodies. The expiry date is the End date; the issuer is added with the + status; the outcome goes in the Description |
| Documents & Rights | Tickets & Trip Costs | The fares, stops and tolls of trips that the work requires, e.g. Coach ticket, Ferry crossing, Toll bridge, Loading-bay fee. | Per unit (trip); Per project | Variable | COGS | None | Created by a channel for travel (T7) |
| Human Resources | Delivery Team | The people who make the product or serve the customer, e.g. Weaver, Instructor, Installer, Barista. | Monthly; Per unit (hour) | Fixed or variable | COGS | Commission, Bonus; Allowance (an optional input) | None |

#### 3.3 Infrastructure: Partners and Suppliers

| Category | Group | What the user writes (the "i" text) | Drivers | Behaviour | Cost nature | Extras or options | Links and generated cards |
|---|---|---|---|---|---|---|---|
| Partners | Alliances & Networks | Organisations you join for the benefit of the whole company, e.g. Trade association, Buying group, Start-up accelerator, Producers cooperative. | Annually | Fixed | OpEx | None | None |
| Suppliers | Goods & Equipment | Sellers of furniture, devices and consumables for the company, e.g. Furniture dealer, Stationery merchant, Computer reseller, Water-cooler rental. | Per unit (order) | Variable | OpEx | None | Furniture & Fittings, Devices & Tools, Business Consumables |
| Suppliers | Business Services | Firms that run the administrative side, e.g. Accountant, Lawyer, Insurance broker, Payroll bureau, Business bank, Web host. | Monthly; Annually; Per project | Fixed; Variable | OpEx | None | An insurance broker links to Insurances |
| Suppliers | Creative & IT Services | Freelancers and small agencies for design, branding, content or technology work, e.g. Web builder, Brand identity house, Photographer, IT support, Copywriter. | Per project; Monthly (retainer) | Variable; Fixed | OpEx | None | Software & Web |
| Suppliers | Property, Vehicles & Facilities | Owners and caretakers of the premises, and lessors of vehicles, e.g. Landlord, Coworking operator, Cleaner, Car lessor. | Monthly (rent, lease, service contract) | Fixed | OpEx | When a workspace is connected: Deposit, Service charge, Commercial property tax. When a vehicle is connected: Qty before the price and Road tax | Holds the rent of a rented Premises card, or the lease of a Company Vehicles card, and shows the link to it |
| Suppliers | Technical Support | Outsourced technicians who maintain, repair and install the company's assets, e.g. Electrical engineer, Plumber, Boiler fitter, Network cabling. An installation is linked to the asset it installs. | Per project; Per unit (hour, visit); Annually (service contract) | Variable | A service that builds or installs an asset is added to the asset (rule 2). Otherwise: Start-up expense before the opening; OpEx after it | None | A supplier card with a start date; it takes no cost nature from an activity card |

#### 3.4 Offering: Partners and Suppliers

| Category | Group | What the user writes (the "i" text) | Drivers | Behaviour | Cost nature | Extras or options | Links and generated cards |
|---|---|---|---|---|---|---|---|
| Partners | Revenue Partners | Parties who sell for you or send customers, and take a cut of each sale, e.g. Boutique stockist, Distributor, Referral partner, Affiliate blogger, Co-teacher. | % of Rev; Per project | Variable | Calculated COGS line (the rate comes from Global Settings) | None; billing type | Created by a channel (T10) |
| Partners | Accreditation Bodies | Bodies whose approval gives your work credibility, e.g. Weavers' guild, Craft standards panel, Culinary institute. | Annually (membership) | Fixed | OpEx | None | Assessments and audits are Certificates cards |
| Suppliers | Producers & Wholesalers | Producers and wholesalers that sell the materials and parts in the product, e.g. Wool mill, Box maker, Fabric importer, Flour miller. | Per unit | Variable | COGS | Minimum order, Customs duty, Clearance and handling, Other duties | Materials & Stock |
| Suppliers | Logistics & Fulfilment | Carriers and warehouses that deliver orders to buyers, e.g. Courier, National post, Fulfilment centre, Freight forwarder. | Per unit (parcel); Monthly | Semi-variable | COGS | Cost options, one per card: flat per parcel, by weight or zone, monthly flat fee, fulfilment per item | Created by a channel (T9) |
| Suppliers | Contractors & Advisers | Outsourced specialists who do part of an offering's job or guide it, e.g. Dye works, Freelance developer, Product-safety adviser, Electrician. | Per project; Per unit (hour) | Variable | COGS | None | Outsourced work on an offering |
| Suppliers | Agencies & Influencers | Firms and creators paid to spread the word, e.g. Marketing agency, Instagram creator, Poster press, Podcast sponsor. | Per project; Monthly | Variable | OpEx (marketing) | Cost options, one per card: campaign fee, monthly budget, retainer, per post | Created by a channel (T4) |
| Suppliers | Venues & Organisers | Hosts of the places and events where you sell, e.g. Fair organiser, Exhibition hall, Show promoter. | Per project (event) | Step | COGS | None | Site Hire |
| Suppliers | Landlords, Leasing & Warehouses | Owners of premises used for making or storing stock, and lessors of vehicles, e.g. Estate owner, Depot firm, Chilled-storage outfit, Van leasing specialist. | Monthly (rent, lease) | Fixed | OpEx | When a workspace is connected: Deposit, Service charge, Commercial property tax, Handling per pallet. When a vehicle is connected: Qty before the price and Road tax | Holds the rent of a rented Workshop & Storage card, or the lease of a Delivery Vehicles card, and shows the link to it |
| Suppliers | Platforms & Payments | Intermediaries between you and the customer who charge a fee, e.g. Online marketplace, Payment processor, App store, Reservation portal. | % of Rev; Per unit (order); Monthly | Semi-variable | Payment gateways and marketplaces: calculated COGS line. SaaS e-commerce platform: fixed OpEx line | None; billing type | Created by a channel (T2, T3) |

### 4. Cost nature, set automatically

The first rule that fits sets the cost nature. The capitalisation limit is the user's own figure.

| No. | When the card | Cost nature |
|---|---|---|
| 1 | The cost is dated before the opening date, except a Percentage cost (rule 5) and opening stock (rule 10), which sits outside the contingency base | Counts in the Total Pre-operational Budget: Start-up, or CapEx for an asset. The same card from the opening date follows the other rules. A manual change of cost nature never stops this split |
| 2 | A supplier's or partner's service (installation, a build, a design) that passes three tests (an identifiable asset, owned or controlled by the company, expected to bring future benefit) and whose card is linked to that asset, whether it is paid before or after the opening | Capitalised: added to the value of the asset it builds or installs, so a machine and its installation are one asset, whoever is paid and whenever. A partner's time, general advice, early research, or a service with no link to an asset is expensed: a Start-up expense before the opening |
| 3 | A lump sum in Documents & Rights, Platforms & Payments or Revenue Partners: legal documents, an initial operating licence, a set-up fee, a franchise or master licence fee | Pre-operational budget: Start-up expense, or an intangible asset (CapEx) amortised automatically over the period the user sets, typically 5 to 10 years for a franchise or master licence; a franchise bought after the opening is amortised from its purchase date. This rule overrides rule 4: the capitalisation limit never applies to an intangible right |
| 4 | A purchase, priced Per unit, in a physical asset group (Furniture & Fittings, Devices & Tools, Fixtures & Displays, Production Machinery, Vehicles), or a bought Premises or Workshop & Storage | CapEx when the price of one unit is at or above the capitalisation limit the user sets; below it, OpEx (a Start-up expense before the opening) |
| 5 | The billing type is Percentage (a commission, a payment, marketplace or delivery-platform fee, a royalty on sales), or the driver is % of Rev | A calculated line in COGS, linked to the revenue it follows, whatever its date: it overrides rule 1, so a fee on pre-sales before the opening is COGS and never charged to the startup fund. If the sale does not take place, it is zero |
| 6 | A recurring fixed cost (Monthly, Quarterly or Annually) in Infrastructure, or in Offering when rule 7 does not apply; or a Fixed amount: rent, a subscription, an insurance premium, an annual licence, a fixed royalty, a platform's monthly fee | OpEx |
| 7 | A card in the Offering place with a Per unit or Per project driver, or in Materials, Delivery Team, Delivery Running Costs or Site Hire | COGS |
| 8 | Employer on-costs, and key-person or health insurance per employee | A calculated line in OpEx, from the gross salaries and the rate in Global Settings |
| 9 | A repair (a later batch, with actual data): a dated record that links a resource and a Technical Support supplier. In the forecast there is no repair card; the Operational Contingency reservation covers failures | Drawn from the Contingency Fund |
| 10 | A Materials & Stock card dated before the opening (opening stock) | Opening stock: the cash is a separate line of the cash needed before the opening, labelled as the initial cash outflow for opening inventory (working capital). It is added after the contingency calculation, outside the contingency base, and it is not a Start-up expense. On the first day it becomes Inventory, a current asset, and it reaches COGS only as units are sold, following the sales volume forecast. |
| 11 | A cost after the opening that no rule above covers: an Infrastructure card with a Per unit or Per project frequency, a One-time Infrastructure cost that is neither an asset nor a lump sum, or a One time Legal Entity expense | OpEx. It keeps the company running and is not related to an offering. In the Offering place the same kinds of cost are COGS (rule 7) |
| 12 | A pre-launch cost that is not capitalised, not opening stock and not a Percentage cost | A cost dated before the opening that is not capitalised, not opening stock and not a percentage cost is a pre-launch expense. A one-time cost is a Startup Expense (legal and incorporation fees, licences, brand identity and logo, a domain). A monthly or otherwise time-dependent cost is a Pre-Operating Expense (rent during works, pre-launch utilities, salaries of staff hired early, pre-launch marketing). Neither is an asset: both are written off, never capitalised. In the cash flow each falls in the month it occurs; on the income statement they appear as one row in the first operating month, “Accumulated Start-up & Pre-Operating Expenses”, which carries the total of the earlier months. Pre-Operating is the behaviour of a Start-up expense with a Monthly frequency, not a separate type. |

#### Capitalising a supplier's or partner's service

A service is recorded as an asset only when it passes three tests: **identifiability** (it results in a specific, identifiable resource, such as a machine, a software code repository or a trade mark), **control** (the company owns or controls the result, for example it owns the code the supplier wrote) and **future economic benefit** (the result is expected to bring revenue or savings once operations begin). A partner's time or general advice cannot be capitalised: it is an expense, a Start-up expense before the opening.

**The link decides.** A supplier or partner service is capitalised only when its card is linked to the asset it builds or installs (the asset card has the status Costs or Buy and a Partners & Suppliers status row naming that supplier). The link is the only data: there is no category tag and no purpose field. A linked service is bundled into the asset whatever its own invoice size, even 50, because the capitalisation limit is tested on the asset's combined cost (a machine of 20,000 and an installation of 1,500 are one asset of 21,500). A service that is not linked is never capitalised: it is a Start-up expense before the opening and OpEx after it, so for it the limit changes nothing. The service card shows no Useful life and no capitalisation limit: it needs only the link.

The amount also decides:

- **Materiality.** The limit is tested on the combined cost of the asset, never on the invoice of a linked service.
- **Research and development.** Payments for brainstorming, concepts or testing alternatives are expensed, however large. Once the work is technically feasible and builds the actual asset (a final prototype, production-ready software), the user links it to that asset and it is capitalised with it.
- **Combined costs.** When one payment covers a service and an asset (a machine of 20,000 and the technician's installation), the service is linked to the asset and added to its value: the whole amount is capitalised. The value for depreciation is the sum: an oven of 4,000 and an electrician's installation of 800 give 4,800, depreciated together over the oven's useful life.

### 5. Billing types and cost options

A card in Platforms & Payments, Revenue Partners, Royalties, Insurances or Licences asks for a ready-made option. The option sets the billing type, the billing type sets the driver, and the financial engine routes the cost.

#### How option, billing type, driver and cost nature connect

| Billing type | Cost options | Driver | Routing |
|---|---|---|---|
| Percentage | Payment gateway, marketplace or delivery platform, royalty on sales, affiliate or agent commission | The billing type is locked to Percentage; the driver becomes % of Rev | Rule 5: a calculated COGS line linked to the revenue. Zero if no sale |
| Fixed amount | Commercial property insurance, annual licence, fixed royalty, SaaS platform | The billing type is Fixed amount; the driver is Monthly or Annually | Rule 6: an OpEx line |
| Lump sum | Upfront franchise fee, legal drafting, set-up fee, initial operating licence | The billing type is Lump sum; the driver is One-time | Rule 3 (or Rule 1 when dated before the opening): a Start-up expense, or an intangible asset amortised automatically |

#### Billing type and routing

| Billing type | What the user enters | Routing in the app |
|---|---|---|
| Percentage (%) | A rate, and the channel, product or partner it follows | A calculated line in COGS, linked to the revenue it follows |
| Fixed amount | An amount per month or per year | A line in OpEx, monthly or yearly |
| Lump sum | One amount at the start | The Pre-operational budget: a Startup expense, or an intangible asset (CapEx) with automatic amortisation |

#### Cost options by category

The ranges are indicative and not verified.

| Category | Option | Billing type | Routing | Model and range |
|---|---|---|---|---|
| Platforms & Payments | Payment gateway (Stripe, PayPal, Viva) | Percentage | Calculated COGS line | Channel revenue × (2 to 3.5% + a fixed fee per transaction) |
| Platforms & Payments | Marketplace and delivery platform (Wolt, e-food, Booking.com, Amazon) | Percentage | Calculated COGS line | Channel revenue × 15 to 30% |
| Platforms & Payments | SaaS e-commerce platform (Shopify, WooCommerce subscription) | Fixed amount | OpEx line | An amount a month, for example 39 |
| Documents & Rights: Royalties | Royalty on sales | Percentage | Calculated COGS line | Product revenue × 5 to 15% |
| Documents & Rights: Royalties | Fixed royalty | Fixed amount | OpEx line | An amount per month or year |
| Documents & Rights: Royalties | Upfront franchise or master licence fee | Lump sum | Intangible asset (CapEx), amortised automatically | One amount at the start, amortised over 5 to 10 years |
| Documents & Rights: Licences | Initial operating licence (operating, health) | Lump sum | Startup expense | Fees and engineers, once, in the pre-operational period |
| Documents & Rights: Licences | Annual renewals, music rights, municipal taxes | Fixed amount | OpEx line | An amount each year |
| Documents & Rights | Legal documents drafting (articles of association, GDPR terms) | Lump sum | Startup expense | One exit in the pre-operational period |
| Documents & Rights: Insurances | Commercial property and liability | Fixed amount | OpEx line | An amount a year or a month |
| Documents & Rights: Insurances | Key-person or employee health | Fixed amount per employee | Calculated OpEx line (employer on-costs) | Added automatically for each employee |
| Revenue Partners | Affiliate networks and influencer commissions | Percentage | Calculated COGS line | Revenue from the referral link × 10 to 20% |
| Revenue Partners | Sales agents and B2B brokers | Percentage | Calculated COGS line | Contracts closed × 5 to 15% |

#### Cases that had extras, without extras

| Case | What the user selects | Routing |
|---|---|---|
| A royalty contract with a minimum guarantee | Fixed amount | An OpEx line, a safe forecast of the cost |
| An advance paid on royalties | Lump sum, in the Pre-operational period | A Startup expense in the pre-operational budget |
| A set-up fee in sales software | Lump sum, on a second card | A Startup expense before opening, or a one-time OpEx after it |
| An add-on or higher plan | Fixed amount, with the total on the main card | The same OpEx line, with a larger amount (for example 59 a month in place of 39) |
| A monthly minimum on an API or platform | Fixed amount, on a parallel card in Sales & Delivery Tools | An OpEx line; the usage card measures net usage only |

### 6. Global Settings

Global Settings is its own central screen, reached from the main menu or from the top of the Financial Foundation. It is not part of the Legal Entity. The settings hold the rates in one place, so that when a rate changes every calculated line follows. The user never calculates on-costs or fees by hand.

| Setting | Holds | Used by | Example |
|---|---|---|---|
| Employer on-cost coefficient | One percentage for the country | Human Resources cards: the calculated OpEx line | For example +25%; it differs by country |
| Channel Fee Table | For each channel: a commission, a fixed fee per order and a chargeback or risk allowance | The revenue and orders of each channel: the calculated COGS lines | Stripe 2.0%, 0.25, 0.5% (see the table below) |
| Royalty and commission rates | A default rate for each option | Royalties and Revenue Partners; a card may override it for its contract | 5 to 15% royalty; 10 to 20% affiliate |
| Capitalisation limit | An amount | A one-time purchase: CapEx above it, OpEx below | For example 500 |
| Default useful life per asset group | Years | The depreciation line, unless the card sets its own | Computers 3, Vehicles 5, Machinery 10 |
| Opening Date | A date, entered on the Financial Foundation next to Plan Start | Rule 1: the split of every card by period | 1 April |
| Target operating reserve months | A number of months of OpEx | The Operational Contingency Fund | 3 by default; an investor may ask for 6 |
| Insurance per employee | An amount | The calculated OpEx line for key-person and health cover | An amount a month |
| Corporate income tax rate | A percentage | The income tax line, calculated on net profit | A rate on profit |

#### Channel Fee Table

| Channel | Commission (%) | Fixed fee (per order) | Chargeback or risk allowance (%) | Note |
|---|---|---|---|---|
| Stripe | 2.0% | 0.25 | 0.5% | The default rate for bad debts |
| PayPal | 3.5% | 0.35 | 1.0% | Higher risk |
| Wolt, Amazon | 25.0% | 0.00 | 0.0% | The platform carries the risk |

**Total channel cost = Revenue × (Commission % + Chargeback %) + Fixed fee × Orders.** Example for Stripe: revenue 100,000 and 4,000 orders give commission 2,000, a chargeback allowance of 500 and fixed fees of 1,000, a total of 3,500. The user does not see the word chargeback on a card. The rates are examples; the user edits them once in Global Settings.

### 7. Calculated lines in the financial foundation

| Line | Formula | Goes to | Note |
|---|---|---|---|
| Employer on-costs | Sum of gross salaries × on-cost % | OpEx | The HR card asks only for the gross salary |
| Inventory | Opening stock on the balance sheet, less the cost of the units sold each month (sales volume × unit cost) | COGS, as sold | A current asset: the cash is in the pre-operational budget, the cost reaches COGS only when sold |
| Accumulated Start-up & Pre-Operating Expenses | The sum of the Startup and Pre-Operating Expenses dated before the Opening Date | OpEx, as one row in the first operating month | The cash flow keeps each cost in the month it falls |
| Channel fees | Revenue of channel X × (commission % + chargeback %) + fixed fee × orders | COGS | Gross profit stays accurate and the sales card stays simple |
| Royalties | Revenue of the product × the rate | COGS | Zero when the sale does not take place |
| Partner commissions | Revenue from the link or contracts closed × the rate | COGS | Paid only on results |
| Amortisation | Lump-sum asset ÷ the amortisation period | Non-cash expense | Starts at the opening |
| Depreciation | CapEx cost ÷ useful life | Non-cash expense | From the asset cards |
| Returns and warranty | A percentage of revenue or a cost per unit | COGS | No card |
| Income tax, interest | Rates on profit and loans | Below operating profit | No cards. VAT is a later batch |

#### Depreciation and amortisation

| Line | Applies to | Formula | Where it appears |
|---|---|---|---|
| Depreciation | A card in an asset group whose price is at or above the capitalisation limit | (Cost of the asset + its linked services) ÷ useful life (the card's own, or the default of its group in Global Settings) | A non-cash expense line in the profit and loss; added back in the cash flow, because the cash left when the asset was bought. Depreciation starts at the Opening Date for an asset bought before it (it is kept on the balance sheet, with no income statement effect, until then), and in the month the asset is installed and ready to run for an asset bought after it. It lands in COGS for an asset that helps to make or deliver the offering (the Offering place) and in OpEx for an asset that does not (Infrastructure). An optional End date (a planned sale or retirement) stops the line and removes the asset from the balance sheet. |
| Amortisation | A Lump sum in Documents & Rights, Platforms & Payments or Revenue Partners (for example an upfront franchise fee) | Lump sum ÷ the amortisation period, which the user always enters | A non-cash expense line, starting at the Opening Date. |

### 8. Extras: required or optional, and how they combine

**Adds** = counted on top. **Floor** = pay the larger of the two. Human Resources cards have Commission and Bonus as their only extras.

| Group | Extra | Required or optional | How it combines | Driver | What it is |
|---|---|---|---|---|---|
| Property, Vehicles & Facilities; Landlords, Leasing & Warehouses (when a workspace is connected) | Deposit | Optional | Adds. A refundable cash amount, not an expense | One-time | A sum held by the landlord until the space is returned. |
| Premises, Workshop & Storage (bought, status Costs); the two leasing supplier groups (when a workspace is connected) | Commercial property tax | Optional | Adds | Annually | The local tax on commercial premises: the assessed value times a rate. Reliefs exist for small premises. |
| Same groups | Service charge | Optional | Adds | Monthly | What the building charges for shared services beside the rent. |
| Company Vehicles, Delivery Vehicles (bought, status Costs); the two leasing supplier groups (when a vehicle is connected) | Road tax | Optional | Adds | Annually | The yearly tax for using the vehicle on the road. |
| Founders & Owners, Admin Team, Delivery Team | Commission | Optional | Adds | % of Rev | A share of sales paid to the person who made them. |
| Founders & Owners, Admin Team, Delivery Team | Bonus | Optional | Adds | Annually | A payment above pay. |
| Landlords, Leasing & Warehouses (when a Workshop & Storage card is connected) | Handling per pallet | Optional | Adds | Per unit (pallet) | The charge for each pallet moved in or out. Typical rates are about 3.50 to 12 per pallet. |
| Producers & Wholesalers | Minimum order | Optional | Floor: if a purchase is needed and the planned volume of a month is below it, that month's COGS and cash use the minimum; the excess carries over as inventory and reduces the next month's demand before the floor is checked again | Per unit (minimum) | The smallest order the seller accepts. |
| Producers & Wholesalers | Customs duty | Optional | Adds | % of cost | The customs value times the duty rate of the goods' tariff code. |
| Producers & Wholesalers | Clearance and handling | Optional | Adds | Per project (shipment) | Customs-broker, port and inspection fees for a shipment. |
| Producers & Wholesalers | Other duties | Optional | Adds | % of cost or Per unit | Excise, anti-dumping and levies such as packaging taxes. |

### 9. Taxes and fees: where each sits

If a tax or fee depends on one card, it is an extra on that card. If it is a rate on a figure the financial foundation already holds (pay, revenue, profit), the foundation calculates it.

| Tax or fee | Kind | Default driver | Where it sits | How it is formed |
|---|---|---|---|---|
| Commercial property tax | Tax | Annually | Card extra: Premises, Workshop & Storage (bought); the supplier's card when rented | Value of the premises times a local rate |
| Road tax | Tax | Annually | Card extra: vehicles | Vehicle class, weight or emissions |
| Customs duty | Tax | % of cost | Card extra: Producers & Wholesalers | Customs value times the duty rate of the tariff code |
| Other duties (excise, anti-dumping, packaging levy) | Tax | % of cost or Per unit | Card extra: Producers & Wholesalers | A rate on the goods, or an amount per unit |
| Import VAT | Tax | % of cost plus duty | Financial foundation, with VAT: a later batch | (Customs value + duty) times the VAT rate |
| Employer on-costs | Tax | % of pay | Financial foundation: calculated OpEx line | Employer contributions on gross salaries |
| Income or corporate tax | Tax | Annually | Financial foundation, calculated from profit with the rate in Global Settings | A rate on net profit |
| VAT or sales tax on sales and purchases | Tax | % of Rev | Financial foundation: a later batch, not calculated in the first release | A rate on the sale; purchases are deducted |
| Channel fees: commission, fixed fee per order, chargeback allowance | Fee | % of Rev and Per unit (order) | Financial foundation: calculated COGS line from the Channel Fee Table | A rate on each sale plus a flat amount per order |
| Service charge | Fee | Monthly | Card extra: bought premises, or the supplier's card | A flat amount for shared services |
| Deposit | Refundable sum | One-time | The landlord's Supplier card only | A flat amount returned later |
| Handling per pallet | Fee | Per unit (pallet) | Card extra: Workshop & Storage | An amount per pallet moved |
| Customs clearance and handling | Fee | Per project (shipment) | Card extra: Producers & Wholesalers | An amount per shipment |
| Permit application or parking-bay suspension | Fee | One-time or Per project | Licences card (Documents & Rights) | An amount set by the authority |
| Company registration and renewal fees | Fee | One-time or Annually | Legal Entity | An amount set by the register |
| Commission and bonus | Pay | % of Rev or Annually | Card extra: Human Resources | A share of sales, or a set payment |

### 10. Import taxes and duties

They are not one tax. The model uses three lines on the Producers & Wholesalers card: **Customs duty** (% of cost: the customs value, which is the goods price plus shipping and insurance, times the duty rate of the goods' tariff code), **Clearance and handling** (per shipment) and **Other duties** (excise, anti-dumping, levies such as packaging taxes). Import VAT is charged on the customs value plus the duty and is usually recoverable, so it sits with VAT in the financial foundation, which is a later batch.

Example: goods 1,000, shipping and insurance 100, so customs value 1,100. At a 5% duty rate the duty is 55. VAT at 20% is (1,100 + 55) × 20% = 231, recoverable. Clearance 40. The cost counted is 1,100 + 55 + 40 = 1,195, and 231 goes to VAT.

### 11. Channels

Channel categories include Retail & Wholesale, and Referral & Affiliates. A channel creates its expense cards from a template, in the teal colour, with the price blank, and incomplete until priced. A template card is one card: it lives in its group (a courier in Logistics & Fulfilment) and shows in the channel's colour, so the user does not need to search for the group. An item the company already has is offered as Link existing. A card made by a channel has no link symbol: its name is the link to the channel.

| No. | Channel expense type | Group where the card is created | Card type | Extras or options | Drivers |
|---|---|---|---|---|---|
| T1 | Platform or tool subscription | Offering > Digital Infrastructure > Sales & Delivery Tools | Resource | None | Monthly or Annually |
| T2 | Payment processing fees | Offering > Platforms & Payments | Supplier | None. Billing type Percentage: a calculated COGS line from the channel fee table; a set-up fee is a Lump sum card | % of Rev |
| T3 | Marketplace fees and commission | Offering > Platforms & Payments | Supplier | None. Percentage: a calculated COGS line; a monthly plan is a Fixed amount card in OpEx | % of Rev or Monthly |
| T4 | Ads and influencers | Offering > Agencies & Influencers | Supplier | Cost options, one per card: campaign fee, monthly budget, retainer, per post. No share of sales (that is T10). Campaign details: objective, platform, dates, audience, linked offerings, target result | Per project or Monthly budget |
| T5 | Stall, pitch, stand or event fee | Offering > Workspace > Site Hire | Resource | None. One price per event | Per project (event) |
| T6 | Display kit or hardware | Offering > Equipment > Devices & Tools | Resource | None. One price | One-time |
| T7 | Travel and van hire | Offering > Documents & Rights > Tickets & Trip Costs; Offering > Vehicles > Delivery Vehicles (short-term hire) | Resource | None. One price per trip or project | Per unit (trip) or Per project |
| T8 | Packaging and samples | Offering > Materials & Inventory > Materials & Stock | Resource | None. One price per unit | Per unit |
| T9 | Courier, postal, fulfilment | Offering > Logistics & Fulfilment | Supplier | Cost options, one per card: flat per parcel, by weight or zone, monthly flat fee, fulfilment per item. The fuel surcharge and account fee are part of the price entered | Per unit (parcel) or Monthly |
| T10 | Referral or reseller commission | Offering > Revenue Partners | Partner | None. Percentage: a calculated COGS line from the channel fee table | % of Rev |
| T12 | Event or transit insurance | Offering > Documents & Rights > Insurances | Resource (generated) | None. One price per project | Per project |

### 12. Dates and the four periods

| Date | Meaning |
|---|---|
| Plan Start | The day the company is established and pre-operational expenses begin (for example 1 January). It is entered on the Financial Foundation. |
| Opening Date | A field entered on the Financial Foundation next to Plan Start: the day the business opens and issues its first receipt (for example 1 April). Its value is stored in the Global Settings store, so the engine can compare it with the start date of every card. The gap between the two defines the pre-operational period. |
| Start date of a card | A Calendar straight after the card's name. Required on every card. Rule 1 puts any cost dated before the Opening Date in the Total Pre-operational Budget. |
| End date of a card | A Calendar. Always optional. A lease or subscription that ends in month 6 stops its OpEx from that month. With the start date it splits a card by period. |

A card that starts before the opening and continues after it splits by date: its early months count in the pre-operational budget and its later months are OpEx or COGS. The lengths of pre-launch and launch are information, not a rule.

| Period | Dates | Typical costs | Rule in the model |
|---|---|---|---|
| Pre-operational | From the establishment of the company to the day before opening | Machines bought (CapEx), leases signed, permits issued, installations made, the fixed costs of the period, testing and training, and the launch event | All of it counts in the Total Pre-operational Budget, the base of the 10 to 15% Startup Contingency. A card needs a start date. |
| Pre-launch | Usually the last 1 to 3 months before opening (information, not a rule) | Teaser marketing, the e-shop in teaser form, the soft opening | Part of the pre-operational period: Start-up expenses. |
| Launch | Usually from the opening date for a few days to 2 to 4 weeks (information, not a rule) | The grand opening and the first wave of advertising | Start-up expenses. A launch event card counts in the pre-operational budget even when held on day 1 or 2, so the first month's profit and loss is not distorted. |
| Operational | From the opening onward | Sales, service, rent, pay, materials, maintenance | OpEx and COGS apply. The Operational Contingency contributions are added on top of the startup fund. |

### 13. Activity groups and the payment plan

An activity card connects several resources, activities and partners. It records them and presents their estimated cost and total. It holds no price and carries no cost nature, and no card takes its cost nature from it. The user names the card. The dates of an activity stay inside the period of its group.

| Place | Activity group | What its cards link |
|---|---|---|
| Infrastructure | Pre-Operational | Period: Plan Start to the Opening Date. Anything that runs before opening, with a type (Capital Expenditure or Start-up Expenses), such as machinery and its installation by Technical Support, legal and accounting, a Testing & Training card, a launch event |
| Infrastructure | Operational | Period: from the Opening Date. Daily operation of the company, such as air conditioning maintenance or service, administration, a team party |
| Offering | Production | Period: from Plan Start. Making the offering: a production run that links machinery, materials, people and a contractor |
| Offering | Marketing | Period: from Plan Start. Advertising and promotion, such as an Instagram campaign or a promotional event |
| Offering | Sales & Customer | Period: from the Opening Date. Activities for and during the sale, such as taking part in a trade fair or a courier route |

#### Payment plan for a Per project driver

A card with a Per project driver has a Payment Plan tick box, placed after the dates; its type is chosen from a dropdown. The plan sets when the money leaves, not what the cost is. The percentages total 100%, each payment has a date, and the card cannot be saved (it shows the red glow) while the total is not 100%.

| Plan | How it works | Example |
|---|---|---|
| Paid in full | The Payment Plan box is not ticked: one payment on the Start date | Small purchases |
| Deposit & Balance | A percentage paid at the Start date, and the balance on a second date (the End date by default, or any date, such as a stage) | A venue booked with 50% now and 50% on the day |
| Instalments | Needs the Start and End dates and a number of instalments. The app sets equal dates and amounts; the user may move the dates and round the amounts | A contractor paid in three equal parts |
| Milestones | A title, a percentage and a date for each stage, set by the user, until the total is 100%. More detail goes in the Description | A certification paid at application, at audit and at issue |

### 14. Funds

#### The pre-operational schedule

| Line | What it holds | Goes to |
|---|---|---|
| Capital Expenditure (CapEx) | Machines, vehicles, equipment, a bought workspace, and the services bundled into them | Balance sheet assets |
| Pre-launch expenses: Startup Expenses | One-time costs: legal and incorporation fees, licences, brand identity, a domain | Written off, never capitalised |
| Pre-launch expenses: Pre-Operating Expenses | Time-dependent costs: rent during works, pre-launch utilities, early salaries, pre-launch marketing | Written off, never capitalised |
| Total Pre-operational Budget | The three lines above; the base of the contingency |  |
| Startup Contingency Fund | 10 to 15% of the Total Pre-operational Budget | Cash reserve |
| Opening Inventory | The cash for opening stock, added after the contingency | Balance sheet: a current asset |
| Cash to raise before the opening | Budget + contingency + opening inventory |  |

#### Startup Contingency Fund

10 to 15% of the Total Pre-operational Budget, which adds CapEx, Startup Expenses and Pre-Operating Expenses. The cash for opening inventory is added after the contingency calculation, as a flat line outside the base. Example: CapEx 30,000, pre-operational expenses 5,000 and fixed costs 9,000 give 44,000, so the fund is 4,400 at 10% and 6,600 at 15%. It is already held when operations start.

#### Operational Contingency Fund

After launch, each month 3 to 5% of OpEx is added on top of the startup fund, until the total fund equals the target reserve months of OpEx (3 by default, a setting in Global Settings). The contribution is a cash set-aside, not an expense. Months to reach the target = (target months × monthly OpEx − startup fund) ÷ (rate × monthly OpEx). If the startup fund already equals the target, no contribution is made. A repair becomes an expense when it happens and the fund pays it; the contribution then restarts until the target is reached again. Stock loss and spoilage are covered by the fund.

| Monthly OpEx 4,000, target 12,000 | At 3% a month (120) | At 5% a month (200) | At 10% a month (400) |
|---|---|---|---|
| Startup fund 4,400 already held | 64 months | 38 months | 19 months |
| Startup fund 6,600 already held | 45 months | 27 months | 14 months |

## Part E. The rules that calculate and categorise automatically

From the cost model. The numbers are worked examples.

### 1. The hierarchy, in order of evaluation

The engine reads a card from the top. At each step it asks one question. Where the answer ends the evaluation, the step says stop. Where a step has several rules, the first that fits wins.

| Step | Question | Rules | If yes |
|---|---|---|---|
| 0 | Is the card complete: status Costs or Buy, a price, valid dates, and a linked offering for a card of the Offering place? | V1 to V8, V10 to V14 | No: it is excluded from every total, shows the red glow, and is listed on the Review page. Evaluation stops. |
| 1 | Does a billing type or cost option lock the driver? | V9 | Yes: Percentage gives % of Rev, Fixed amount gives Monthly or Annually, Lump sum gives One-time. |
| 2 | Is the billing type Percentage? | C5 | Yes: a calculated COGS line, whatever the date. Evaluation stops. |
| 3 | Is it a stock loss, or (in a later batch, with actual data) a repair? | C11, C12 | Yes: drawn from the Contingency Fund; not in the forecast. Evaluation stops. |
| 4 | Is the cost dated before the Opening Date? | C1, then C2, C3, C4 | Yes: it goes to the Total Pre-operational Budget (cash). Opening stock is a separate cash line outside the contingency base, and becomes Inventory, a current asset, moved to COGS as it is sold (C14). A service that builds or installs an asset is added to the asset (C2). A lump sum: by its cost option, a Start-up expense or an intangible asset. A physical asset at or above the capitalisation limit: CapEx; otherwise a Start-up expense. |
| 5 | From the Opening Date, or with no date: which rule fits first? | C3, C4, C7, C6, C8, C15 | A lump sum: a one-time OpEx, or an asset amortised from the purchase date. A physical asset: CapEx at or above the limit, OpEx below. An Offering card with Per unit or Per project, or in Materials, Delivery Team, Delivery Running Costs, Site Hire: COGS. A recurring fixed cost: OpEx. Any other company cost, and a One time Legal Entity expense: OpEx (C15). |
| 6 | Has the user changed the cost nature? | C13 | Yes: the change applies from the Opening Date only. The months before it stay in the Pre-operational Budget. |
| 7 | Then behaviour, calculation, funds and generation | B1 to B6, X1 to X10, F1 to F5, G1 to G5 | The cost nature feeds the calculated lines and the contingency funds. |

### 2. The flow

*Diagram, labels in order:* 0. Complete card? · status Costs or Buy, a price, valid dates · No: excluded, red glow, stop · 1. Billing type or option locks the driver · Percentage, Fixed amount, Lump sum · 2. Percentage? · C5, any date · Yes: calculated COGS line, stop · 3. Repair or stock loss? · C11, C12 · Yes: Contingency Fund, stop · 4. Dated before the Opening Date? · C1 · Yes: Total Pre-operational Budget · A service that builds an asset: added to it (C2) · Lump sum: by option, Start-up or asset (C3) · Physical asset at or above the limit: CapEx; · otherwise Start-up (C4) · 5. From the opening, or no date · First rule that fits: · Lump sum: one-time OpEx (C3) · Physical asset: CapEx at or above limit, OpEx below (C4) · Offering per unit, per project, materials, team, site: COGS (C7) · Recurring fixed cost: OpEx (C6, C8) · Any other company cost: OpEx (C15) · 6. Manual change by the user (C13) · applies after the opening only · 7. Behaviour, calculation, funds, generation · B1 to B6, X1 to X10, F1 to F5, G1 to G5 · No

### 3. Priority ranking

A lower number beats a higher number. The reasons follow.

| Rank | Rules | What | Why it holds its place |
|---|---|---|---|
| 1 | V1 to V14 | Gate and locks | Beats everything: an incomplete card is not categorised. |
| 2 | C5 | Percentage billing | Overrides C1: a fee on pre-sales is COGS, never charged to the startup fund. |
| 3 | C11, C12 | Repair, stock loss | Draw on the Contingency Fund before any period rule. |
| 4 | C1 | Date before the opening | Overrides C13 for the months before the opening. |
| 4a | C14 | Opening stock | Inside C1: a separate cash line outside the contingency base; the nature is Inventory, released to COGS as it is sold. |
| 5 | C2 | A service that builds an asset | Before and after the opening: added to the asset, or expensed. |
| 6 | C3 | Lump sum by cost option | Overrides C4: the capitalisation limit never applies to an intangible right. |
| 7 | C4 | Physical asset purchase | Applies only to physical asset groups. |
| 8 | C9 | A link to an activity card | No effect: no card takes its cost nature from an activity card. |
| 9 | C7 | Offering per unit, per project, materials, team, site | COGS. |
| 10 | C6, C8 | Recurring fixed cost | OpEx. |
| 10a | C15 | Any other company cost after the opening | OpEx: the last rule; it applies only when nothing above does. |
| 10b | C16 | Pre-launch expense | Inside C1: Startup Expense (one-time) or Pre-Operating Expense (time-dependent), both written off. |
| 11 | C13 | Manual change | Last: it applies after the opening only. |
| Parallel | C10 | Employer on-costs, insurance per employee | Generated lines, not cards: they do not compete with the rules above. |

### 4. The four precedence decisions

| Decision | Rule | Example | Why |
|---|---|---|---|
| C5 over C1 | A Percentage cost is COGS even before the opening | A card payment fee of 2.5% on pre-orders taken in the pre-launch period | Percentage costs follow revenue; with no sale they are zero, so they should not inflate the startup fund. |
| C3 over C4 | A lump sum is routed by its cost option, with no limit test | A set-up fee of 300 against a limit of 500 | The limit is for physical assets. A set-up fee is a Start-up expense and is never amortised; an upfront franchise fee is an asset. |
| C1 over C13 | A manual change never moves a pre-opening month out of the budget | A card dated 3 months before opening, changed from OpEx to COGS | The date split protects the cash flow and the Total Pre-operational Budget. |
| Cost option over limit | The option, not the price, says Start-up or asset | Franchise fee 20,000: an asset. Legal drafting 800: a Start-up expense | The price cannot tell a lost cost from a permanent right. |

### 5. Categorise: cost nature

| No. | When | Result | Example |
|---|---|---|---|
| C1 | Cost dated before the Opening Date, except a Percentage cost (C5); opening stock (C14) is cash outside the contingency base and is not a Start-up expense | The cost counts in the Total Pre-operational Budget: Start-up, or CapEx for an asset. A card that runs past the opening splits by date: its early months are pre-operational, its later months follow C3 to C9. A manual change of cost nature (C13) never stops this split. | Rent of 1,500 from 3 months before opening: 4,500 in the pre-operational budget, then OpEx from the opening month. |
| C2 | A supplier's or partner's service that builds or installs an asset: it passes three tests (an identifiable asset, owned or controlled by the company, expected to bring future benefit) and its card is linked to that asset, whether it is paid before or after the opening | Capitalised: added to the value of the asset it builds or installs (a machine and its installation are one asset), whoever is paid and whenever. A service with no link to an asset, a partner's time, general advice or early research is expensed: a Start-up expense before the opening. | A machine of 20,000 with a technician's installation of 1,500 is one asset of 21,500. An oven of 4,000 with an electrician's installation of 800 is one asset of 4,800, depreciated together. With no link, the installation is a Start-up expense, charged once and never depreciated. |
| C3 | A lump sum in Documents & Rights, Platforms & Payments or Revenue Partners | Pre-operational: a Start-up expense, or an intangible asset (CapEx) amortised automatically (rule X2), as its cost option says: a set-up fee, legal drafting or an initial operating licence is a Start-up expense (charged once, never amortised); an upfront franchise or master licence fee is an intangible asset, amortised from the Opening Date. C3 overrides C4: the capitalisation limit never applies to an intangible right. | A set-up fee of 300 is a Start-up expense whatever the limit. An upfront franchise fee of 20,000 is an asset. |
| C4 | A purchase priced Per unit in a physical asset group (Furniture & Fittings, Devices & Tools, Fixtures & Displays, Production Machinery, Vehicles), or a bought Premises or Workshop & Storage | CapEx when the price of one unit is at or above the capitalisation limit; below it OpEx (a Start-up expense before the opening). The limit applies only to these physical assets. | A laptop at 1,500 with a limit of 500 is CapEx; 3 stools at 120 each are OpEx. |
| C5 | Billing type Percentage, or the driver % of Rev (commission, payment or marketplace fee, royalty on sales), whatever its date | A calculated line in COGS, linked to the revenue it follows. Zero when the sale does not take place. C5 overrides C1: a fee on pre-sales taken before the opening is COGS, and is never charged to the startup fund. | A gateway at 2.5% of channel revenue, also on pre-orders paid before the opening. |
| C6 | Billing type Fixed amount, recurring (rent, subscription, insurance premium, annual licence, fixed royalty, a platform's monthly fee) | A line in OpEx, monthly or yearly. | A SaaS platform at 39 a month. |
| C7 | A card in the Offering place with a Per unit or Per project driver, or in Materials, Delivery Team, Delivery Running Costs or Site Hire | COGS. | 500 kg of material at 2. |
| C8 | A recurring fixed cost in the Offering place; an Infrastructure card that is a lease, subscription, retainer or rent | OpEx. | A workshop rent; an office software plan. |
| C9 | A card is linked to an activity card | Nothing changes: no card takes its cost nature from an activity card, and the activity card carries no cost nature. Each card follows its own rules. |  |
| C10 | Employer on-costs, and key-person or health insurance per employee | A calculated line in OpEx from gross salaries and the rate in Global Settings. | Gross salaries 6,000 × 25%. |
| C11 | A repair (a later batch, with actual data): a dated record that links a resource and a Technical Support supplier | Drawn from the Contingency Fund. In the forecast there is no repair card: the Operational Contingency reservation covers failures, and a scheduled service is a Technical Support supplier card with a start date. | Plan against actual becomes possible when actuals arrive. |
| C12 | Stock loss and spoilage | Covered by the Contingency Fund. |  |
| C13 | The user changes a cost nature on a card | The change stands; the rules do not overwrite it. It applies only to the months from the Opening Date: the months dated before it stay in the Pre-operational Budget (C1). | A card moved from OpEx to COGS changes its post-opening months only. |
| C14 | A Materials & Stock card dated before the opening (opening stock) | Opening stock: the cash is a separate line of the cash needed before the opening, labelled as the initial cash outflow for opening inventory (working capital). It is added after the contingency calculation, outside the contingency base, and it is not a Start-up expense. On the first day it becomes Inventory, a current asset, and it reaches COGS only as units are sold, following the sales volume forecast. | Stock of 8,000 bought in month −1: 8,000 of cash in the budget; Inventory of 8,000 on day 1; if 3,000 is sold in month 1, 3,000 reaches COGS. |
| C15 | A cost after the opening that no rule above covers: an Infrastructure card with a Per unit or Per project frequency, a One-time Infrastructure cost that is neither an asset nor a lump sum, or a One time Legal Entity expense | OpEx. It keeps the company running and is not related to an offering. (In the Offering place the same kinds of cost are COGS, by C7.) An independent supplier follows the same logic as a strategic partner: a contract is not needed. | Fuel by the km; a lawyer's fee per project; an IT supplier fixing office laptops. |
| C16 | A pre-launch cost that is not capitalised, not opening stock and not a Percentage cost | A cost dated before the opening that is not capitalised, not opening stock and not a percentage cost is a pre-launch expense. A one-time cost is a Startup Expense (legal and incorporation fees, licences, brand identity and logo, a domain). A monthly or otherwise time-dependent cost is a Pre-Operating Expense (rent during works, pre-launch utilities, salaries of staff hired early, pre-launch marketing). Neither is an asset: both are written off, never capitalised. In the cash flow each falls in the month it occurs; on the income statement they appear as one row in the first operating month, “Accumulated Start-up & Pre-Operating Expenses”, which carries the total of the earlier months. Pre-Operating is the behaviour of a Start-up expense with a Monthly frequency, not a separate type. | A lawyer's incorporation fee of 1,200 is a Startup Expense; 3 months of rent at 1,500 during works are Pre-Operating Expenses. |

### 6. Derive the behaviour

The user never chooses fixed, variable, semi-variable or step.

| No. | When | Behaviour | Note |
|---|---|---|---|
| B1 | Driver One-time | Step |  |
| B2 | Driver Monthly, Quarterly or Annually, or billing type Fixed amount | Fixed |  |
| B3 | Driver Per unit or % of Rev | Variable | Cost follows volume or revenue. |
| B4 | A channel or supplier card with a percentage and a fixed fee per order, or a monthly fee and a per-parcel price | Semi-variable | A fixed part and a variable part. |
| B5 | Driver Per project | The behaviour is set per group: Step for Site Hire, Venues & Organisers and Certificates (a job-sized amount); Variable for Contractors & Advisers, Technical Support, Agencies & Influencers, Creative & IT Services and Tickets & Trip Costs (the cost grows with the number of jobs) | One behaviour for the whole driver would make Site Hire inaccurate. |
| B7 | Driver Per unit in a physical asset group (a purchase) | Step (a purchase: Qty × unit price) | An asset is bought once, whatever the quantity. |

### 7. Calculate

| No. | Line | Formula | Worked example |
|---|---|---|---|
| X1 | Depreciation | (Cost of the asset + its linked services) ÷ useful life, for an asset at or above the capitalisation limit. The useful life is the card's own, or the default of its group in Global Settings. Depreciation starts at the Opening Date for an asset bought before it (it is kept on the balance sheet, with no income statement effect, until then), and in the month the asset is installed and ready to run for an asset bought after it. It lands in COGS for an asset that helps to make or deliver the offering (the Offering place) and in OpEx for an asset that does not (Infrastructure). | 1,500 ÷ 3 years = 500 a year, a non-cash line, added back in the cash flow. A machine of 10,000 over 10 years puts 1,000 a year into COGS; an office laptop puts its share into OpEx. An optional End date stops it and removes the asset from the balance sheet. |
| X2 | Amortisation | Lump sum ÷ the amortisation period the user enters, starting at the Opening Date, or at the purchase date when the asset is bought after it. | 20,000 ÷ 8 years = 2,500 a year, a non-cash line. |
| X3 | Employer on-costs | Sum of gross salaries × the on-cost coefficient in Global Settings. | 6,000 × 25% = 1,500 a month, an OpEx line. |
| X4 | Channel fees | Revenue × (commission % + chargeback %) + fixed fee × orders, from the Channel Fee Table. | Stripe: commission 2,000 + chargeback 500 + fixed 1,000 = 3,500 in COGS. |
| X5 | Royalties and partner commissions | Revenue of the product, link or contracts × the rate (the default in Global Settings, or the card's override). | 40,000 × 10% = 4,000 in COGS. |
| X6 | Minimum order, as a floor | Each month, the demand is first met from stock carried over. If a purchase is still needed and the net volume is below the minimum, the month's COGS and cash use the minimum. The excess is carried over as inventory to the next month, and reduces that month's demand before the floor is checked again. No purchase is made when stock covers the demand. | Minimum 500 at 2. Month 1: demand 300, buy 500 (1,000), carry 200. Month 2: demand 300, 200 from stock, net 100 is below the floor, buy 500 (1,000), carry 400. Month 3: demand 300 from stock, buy none (0). |
| X7 | Customs duty | Customs value (goods + shipping + insurance) × the duty rate of the tariff code. Clearance and other duties are added. | Customs value 1,100 × 5% = 55. Import VAT of 231 is a later batch. |
| X8 | Quantity | Total = Qty × price. Qty is optional on resource cards, placed before the price: whole numbers, with decimals only when the unit is hour, metre, litre or kWh; a new card starts at 1. A Per unit frequency needs a unit name. A % of Rev frequency does not use Qty. | 3 laptops at 1,000 = 3,000. |
| X9 | Payment plan | A Per project card with the Payment Plan ticked splits its price by the plan; the percentages total 100% and each payment has a date. Unticked, the price is paid in full on the Start date. The plan moves the cash, not the cost. | 2,000 on a 50/50 plan: 1,000 at the start and 1,000 on delivery. |
| X10 | Currency, and monthly and yearly equivalents | The currency follows the Legal Entity country. Monthly equivalent: monthly as entered, quarterly ÷ 3, annually ÷ 12; yearly is × 12. The smoothing allows OpEx to be compared month by month and feeds the target reserve months. Per unit, per project and % of Rev are scheduled by the forecast from the sales volume. | Quarterly 120 is 40 a month; annually 1,200 is 100 a month. |
| X11 | Inventory | Opening stock enters the balance sheet on the first day as a current asset; each month the cost of the units sold (the sales volume forecast × the unit cost) moves from Inventory to COGS. Stock bought after the opening follows the same flow; the minimum order carry-over of X6 is part of it. | Stock of 8,000; 3,000 sold in month 1: 3,000 in COGS, 5,000 left in Inventory. |
| X12 | Accumulated Start-up & Pre-Operating Expenses | The sum of every Startup and Pre-Operating Expense dated before the Opening Date, shown as one row in the first operating month of the income statement. The cash flow keeps each cost in the month it falls. | Legal fees of 1,200 in month −3 and rent of 4,500 over months −3 to −1: cash in those months; 5,700 in one row in month 1. |

### 8. Funds

| No. | What | Rule | Example |
|---|---|---|---|
| F1 | Total Pre-operational Budget | CapEx + Startup Expenses + Pre-Operating Expenses (everything dated before the Opening Date, except opening stock). It is the contingency base. | 30,000 + 5,000 + 9,000 = 44,000. |
| F2 | Startup Contingency Fund | 10 to 15% of the Total Pre-operational Budget; already held when operations start. | 4,400 at 10%, 6,600 at 15%. |
| F3 | Operational Contingency Fund | Each month, 3 to 5% of OpEx is added on top of the startup fund until the total equals the target reserve months of OpEx (3 by default, a setting). The contribution is a cash set-aside, not an expense. | OpEx 4,000: target 12,000; startup fund 4,400; at 4% a month 160 is added for 48 months. |
| F4 | Months to reach the target | (target months × monthly OpEx − startup fund) ÷ (rate × monthly OpEx). Zero if the startup fund already equals the target. |  |
| F5 | Using the fund | A repair or a stock loss is an expense when it happens; the fund pays it, and the contribution restarts until the target is reached again. |  |
| F6 | Cash to raise before the opening | Total Pre-operational Budget + Startup Contingency Fund + the cash for opening inventory, added as a flat line after the contingency calculation. | 44,000 + 4,400 + 8,000 of opening stock = 56,400. |

### 9. Validate

| No. | When | Result |
|---|---|---|
| V1 | A card has no price at status Costs | Incomplete: red glow, left out of every total, listed on the Review page. |
| V2 | A card has no Start date | The card cannot be completed. |
| V3 | End date before start date | Not accepted. |
| V4 | The status Rent on a space or vehicle card, or Partners & Suppliers, with no name chosen | The card cannot be completed: the supplier holds the rent or the lease. |
| V5 | A Per unit driver with no unit name | Not accepted. |
| V6 | A Payment Plan whose percentages do not total 100% | The card cannot be saved: red glow. |
| V7 | A Lump sum asset with no amortisation period | Not accepted: the user always enters it. |
| V8 | A % of Rev driver | Quantity is read-only, and the rate defaults from Global Settings. |
| V9 | A billing type or cost option is chosen | It locks the driver: Percentage gives % of Rev, Fixed amount gives Monthly or Annually, Lump sum gives One-time. |
| V10 | A card of the Offering place (Resource, Partner or Supplier) has no linked offering | Incomplete: red glow, left out of every total. Without the link the financial foundation cannot attribute the cost to a product, and so cannot show the profitability of each offering. |
| V11 | More than one offering is ticked on a card of the Offering place | A percentage box appears beside each; the percentages must total 100%, or the card glows red and is not saved. The engine sends each share of the cost to its offering. |
| V12 | An activity's dates | Start date is required; End date is optional, and an activity without one counts as one day. The end is not before the start. Both dates stay inside the period of the group: Pre-Operational from Plan Start to the Opening Date; Operational and Sales & Customer from the Opening Date; Production and Marketing from Plan Start. |
| V13 | A resource linked to an activity | The resource's start date cannot be after the activity's start date when the activity has no end date, or after its end date when it has one. The units used cannot exceed the units the resource has; performers follow the same limit. |
| V14 | A Legal Entity expense | It requires exactly one linked registration or requirement. |

### 10. Generate

| No. | When | Result |
|---|---|---|
| G1 | A vehicle, premises, workshop, machine, event or channel is created | An Insurances card is generated and linked. Its End date is the renewal date; the insurer is added with the + status; the cover limit and grade are written in the Description. |
| G2 | The user presses "Typical costs for this channel" | A template item is created only if it passes three tests: it disappears without the channel, it is caused by the channel's actions, and it is not already company-wide. The price is blank. |
| G3 | A template item already exists as a card | It is offered as Link existing, with no second price. |
| G4 | A card is created from a template | It appears in the channel's teal colour, incomplete until priced. It has no link symbol: its name is the link to the channel. |
| G5 | A card is added to an activity group | The group takes nothing from it and gives nothing to it: the card presents the estimated cost of its links and their total, and holds no price and no cost nature. |

### 11. Place a tax or fee

| No. | Question | Rule |
|---|---|---|
| P1 | Extras on a card | A tax or fee that depends on one card is an extra on that card (commercial property tax, road tax, customs duty, handling per pallet, commission, bonus). |
| P2 | Rates on pay, revenue or profit | The financial foundation calculates them from Global Settings (on-costs, channel fees, royalties, income tax). |
| P3 | A rented workspace | The landlord Supplier holds the rent, deposit, commercial property tax and service charge. |
| P4 | Which extras exist | Only those on the list of the specification. Everything else is a second card (a set-up fee is a Lump sum card; a monthly minimum is a parallel Fixed amount card). |
| P5 | How extras combine | Adds (counted on top), floor (the larger of two) or offsets; each extra says whether it is required or optional. |
| P6 | VAT | Not calculated in the first release (a later batch). |

### 12. Capitalising a supplier's or partner's service

A service is recorded as an asset only when it passes three tests: **identifiability** (it results in a specific, identifiable resource, such as a machine, a software code repository or a trade mark), **control** (the company owns or controls the result, for example it owns the code the supplier wrote) and **future economic benefit** (the result is expected to bring revenue or savings once operations begin). A partner's time or general advice cannot be capitalised: it is an expense, a Start-up expense before the opening.

**The link decides.** A supplier or partner service is capitalised only when its card is linked to the asset it builds or installs (the asset card has the status Costs or Buy and a Partners & Suppliers status row naming that supplier). The link is the only data: there is no category tag and no purpose field. A linked service is bundled into the asset whatever its own invoice size, even 50, because the capitalisation limit is tested on the asset's combined cost (a machine of 20,000 and an installation of 1,500 are one asset of 21,500). A service that is not linked is never capitalised: it is a Start-up expense before the opening and OpEx after it, so for it the limit changes nothing. The service card shows no Useful life and no capitalisation limit: it needs only the link.

The amount also decides:

- **Materiality.** The limit is tested on the combined cost of the asset, never on the invoice of a linked service.
- **Research and development.** Payments for brainstorming, concepts or testing alternatives are expensed, however large. Once the work is technically feasible and builds the actual asset (a final prototype, production-ready software), the user links it to that asset and it is capitalised with it.
- **Combined costs.** When one payment covers a service and an asset (a machine of 20,000 and the technician's installation), the service is linked to the asset and added to its value: the whole amount is capitalised. The value for depreciation is the sum: an oven of 4,000 and an electrician's installation of 800 give 4,800, depreciated together over the oven's useful life.

## Part F. Card structure: what the user can reach in each card, and why

Each card is described on its own, by place, section, category and group, from the top row to the bottom row.

> **How to read an entry.** The title gives the path. **Purpose** is the help text of the group. The strip gives the frequencies, extras and links. In the table, one row is one line of the card on screen, and the fields that sit side by side on that line are listed together, left to right. **Field** is the element of the row; **Label shown** is the text written beside it on the card. **Action** is what the user does (type, select, tick, pick a date, click, or none). **Function** is the control (text box, dropdown, number box, Calendar, checkbox, button, read-only text). **Status** is coloured: **Required** (red) means the user has to act (type, select) to complete the card; **Optional** (orange) means the card is complete without it; **Automatic** (green) means the app fills it, so the user does nothing; a **Button** (grey) is an action and is neither required nor optional. A field that appears only in some cases says so in its description. **General rule:** a dropdown with only one option is not a dropdown: the option is shown as text (Group, Frequency). A Frequency of One-time is implied and is not shown at all. Below each table, **Behind the scenes** shows the behaviour and cost nature the engine gives the card; they are hidden from the user and estimated from the rules. A card linked to another by choosing it from a dropdown shows the link symbol 🔗 beside the name; a card generated by another card has no symbol, and its name is the link. A link is never required.

### Display rules

- **Links.** A card connected to another by choosing it from a dropdown shows the link symbol beside the choice. A card generated by another card (a channel-made card, an activity made from a status) has no symbol: its name turns into the link.
- **Tooltips** appear above the icon they belong to by default.
- **Numbers** align to the right, and most of all in tables. In a table of costs the currency is written once, in the header of the column, not in every row.
- **All Tiles** hides the completed activities by default; the Completed status filter shows them.
- **Categories and groups** are fixed lists: there is no “Other…” to add a new one. “Other…” remains only where it creates a card (a supplier or partner name, an activity).
- **A dropdown with one option** is shown as text, not as a dropdown.

### The order of rows, the same on every card

| # | Row | What it holds |
|---|---|---|
| 1 | Head | The number, the name and × |
| 2 | Start date and End date | Two Calendars, side by side, straight after the name (founders: Start date only) |
| 3 | Category | Dropdown |
| 4 | Group | A dropdown, or the group name as text when there is only one |
| 5 | Status and + | The status dropdown with the + button, on one row (resources) |
| 6 | Link rows | Under the status: Category, Group and Name of a partner or supplier (or Rent, or Activity), each followed by the link symbol. A further status adds the same rows |
| 7 | Group-specific rows | Cost option and billing type |
| 8 | The cost row | Qty, Price, Currency, Frequency, Unit, side by side |
| 9 | Allowance | People cards only |
| 10 | Payment in stages | When the Frequency is Per project: the tick box, the plan and its lines |
| 11 | Group-specific rows (lower) | Rate override, amortisation period, useful life, warranty |
| 12 | Extras | One row for each, all optional |
| 13 | Notes | Optional notes, each with an automatic record date and time and an Add Date button |
| 14 | Linked to (offerings) | Required on a card of the Offering place |

### Infrastructure

#### Resources

#### Category: Workspace

##### Infrastructure > Resources > Workspace > Premises

**Purpose:** The space where the team works, owned, rented through a landlord or at home, e.g. Studio rent, Shared-space seat, Home-office allowance, Owned office.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| One-time | Commercial property tax (when bought); Service charge (when bought) | a rented space uses the status Partners & Suppliers with a supplier in Property, Vehicles & Facilities, which holds the rent and its extras; an Insurances card is generated |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Workspace. Changing it moves the card | Places the card in its tile |
| 4 | Group | Premises | None | Subtitle (text) | Automatic | “Premises”, shown directly under the Category | A dropdown with one option is not used |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Rent; Activity; Buy. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Rent<br>Link symbol | Rent<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Rent:** Shown when the status is Rent. Opens or creates a card only in Property, Vehicles & Facilities; its card holds the rent and its extras<br>**Link symbol:** Beside the chosen name; a click opens the card | A rented space or vehicle is a supplier's service |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Price<br>Currency | Price<br>(none) | Type<br>Select | Number box (decimal)<br>Searchable dropdown, no label | Required / Automatic | **Price:** Shown when the status is Buy. A purchase, priced One-time. For Rent the price is on the supplier's card<br>**Currency:** The user may change it. The organisation's currency by default | One line. A card without a price is incomplete: red glow, left out of every total. The Frequency One-time is implied, so it is not shown |
| 10 | Extra: Commercial property tax (when bought) | Commercial property tax (when bought) | Tick, then type | Checkbox and number box | Optional | The local tax on commercial premises: the assessed value times a rate (frequency Annually) | It depends on this one card, so it sits here |
| 11 | Extra: Service charge (when bought) | Service charge (when bought) | Tick, then type | Checkbox and number box | Optional | Shared services of a shared building (frequency Monthly) | It depends on this one card, so it sits here |
| 12 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| One-time | Step | CapEx at or above the capitalisation limit; OpEx below it | CapEx at or above the capitalisation limit; Start-up expense below it |

Rented (status Partners & Suppliers): the cost sits on the supplier's card. Bought (status Costs): a one-time purchase, CapEx.

#### Category: Utilities

##### Infrastructure > Resources > Utilities > Premises Utilities

**Purpose:** The services the daily operation consumes, e.g. Electricity, Gas heating, Broadband line, Mobile plan.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Monthly | None | Premises |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Utilities. Changing it moves the card | Places the card in its tile |
| 4 | Group | Premises Utilities | None | Subtitle (text) | Automatic | “Premises Utilities”, shown directly under the Category | A dropdown with one option is not used |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Alliances & Networks (partner); Goods & Equipment, Business Services, Creative & IT Services, Property, Vehicles & Facilities, Technical Support (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency | Qty<br>Price<br>(none)<br>Monthly | Type<br>Type<br>Select<br>None (shown) | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text | Optional / Required / Automatic / Automatic | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Monthly. A list with one option is shown as text | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Monthly | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

#### Category: Workstation

##### Infrastructure > Resources > Workstation > Furniture & Fittings

**Purpose:** The furniture and fittings of the work areas, e.g. Standing desk, Drawing table, Ergonomic chair, Filing cabinet.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per unit | None | Goods & Equipment (Supplier) |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Workstation. Changing it moves the card | Places the card in its tile |
| 4 | Group | Furniture & Fittings | None | Subtitle (text) | Automatic | “Furniture & Fittings”, shown directly under the Category | A dropdown with one option is not used |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Alliances & Networks (partner); Goods & Equipment, Business Services, Creative & IT Services, Property, Vehicles & Facilities, Technical Support (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency<br>Unit | Qty<br>Price<br>(none)<br>Per unit<br>(none) | Type<br>Type<br>Select<br>None (shown)<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text<br>Dropdown, no label | Optional / Required / Automatic / Automatic / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Per unit. A list with one option is shown as text<br>**Unit:** Shown when Frequency is Per unit. item, set, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Useful life | Useful life | Type | Number box (years) | Optional | Shown when the status is Costs and the price of one unit, with its linked services, is at or above the capitalisation limit. It is how long the asset stays useful to the business, not how long it lasts. Prefilled with the default of the group from Global Settings; the user may change it. Depreciation starts when the asset is ready for use | Feeds the depreciation line |
| 11 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per unit | Step (a purchase: Qty × unit price) | CapEx when the price of one unit is at or above the capitalisation limit; OpEx below it | CapEx when the price of one unit is at or above the capitalisation limit; Start-up expense below it |

**Depreciation:** Starts at the Opening Date for an asset bought before it, and in the month the asset is installed and ready to run for an asset bought after it. It lands in OpEx, because the asset is not related to an offering.

#### Category: Equipment

##### Infrastructure > Resources > Equipment > Devices & Tools

**Purpose:** The devices and tools the team uses for its own work, bought or leased, e.g. Laptop, Label printer, Mirrorless camera, Vehicle tracker, Protective goggles.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per unit, Monthly | None | Goods & Equipment |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Equipment. Changing it moves the card | Places the card in its tile |
| 4 | Group | Devices & Tools | None | Subtitle (text) | Automatic | “Devices & Tools”, shown directly under the Category | A dropdown with one option is not used |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Alliances & Networks (partner); Goods & Equipment, Business Services, Creative & IT Services, Property, Vehicles & Facilities, Technical Support (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency<br>Unit | Qty<br>Price<br>(none)<br>Frequency<br>(none) | Type<br>Type<br>Select<br>Select<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown<br>Dropdown, no label | Optional / Required / Automatic / Required / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Shown when the status is Costs. Per unit (purchase), Monthly (lease)<br>**Unit:** Shown when Frequency is Per unit. item, set, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Useful life | Useful life | Type | Number box (years) | Optional | Shown when the status is Costs and the price of one unit, with its linked services, is at or above the capitalisation limit. It is how long the asset stays useful to the business, not how long it lasts. Prefilled with the default of the group from Global Settings; the user may change it. Depreciation starts when the asset is ready for use | Feeds the depreciation line |
| 11 | Warranty<br>Warranty until | Warranty<br>(none) | Tick<br>Pick a date | Checkbox<br>Calendar, no label | Optional / Optional | **Warranty:** Information only: it locks nothing<br>**Warranty until:** Appears next to the checkbox when it is ticked | Shows how long the warranty lasts |
| 12 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per unit | Step (a purchase: Qty × unit price) | CapEx when the price of one unit is at or above the capitalisation limit; OpEx below it | CapEx when the price of one unit is at or above the capitalisation limit; Start-up expense below it |
| Monthly | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

**Depreciation:** Starts at the Opening Date for an asset bought before it, and in the month the asset is installed and ready to run for an asset bought after it. It lands in OpEx, because the asset is not related to an offering.

#### Category: Vehicles

##### Infrastructure > Resources > Vehicles > Company Vehicles

**Purpose:** Cars and bikes the company owns or leases for general use, e.g. Sales car, Cargo bike, Minibus lease.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per unit | Road tax (when bought) | a leased vehicle uses the status Partners & Suppliers with a supplier in Property, Vehicles & Facilities, which holds the lease; an Insurances card is generated |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Vehicles. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Company Vehicles, Vehicle Running Costs | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Rent; Activity; Buy. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Rent<br>Link symbol | Rent<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Rent:** Shown when the status is Rent. Opens or creates a card only in Property, Vehicles & Facilities; its card holds the rent and its extras<br>**Link symbol:** Beside the chosen name; a click opens the card | A rented space or vehicle is a supplier's service |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency<br>Unit | Qty<br>Price<br>(none)<br>Per unit<br>vehicle | Type<br>Type<br>Select<br>None (shown)<br>None (shown) | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text<br>Read-only text | Optional / Required / Automatic / Automatic / Automatic | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Buy. A purchase, priced Per unit. For Rent the price is on the supplier's card<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Per unit. A list with one option is shown as text<br>**Unit:** vehicle. Shown when Frequency is Per unit; one option besides “unit”, so it is text | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Useful life | Useful life | Type | Number box (years) | Optional | Shown when the status is Costs and the price of one unit, with its linked services, is at or above the capitalisation limit. It is how long the asset stays useful to the business, not how long it lasts. Prefilled with the default of the group from Global Settings; the user may change it. Depreciation starts when the asset is ready for use | Feeds the depreciation line |
| 11 | Extra: Road tax (when bought) | Road tax (when bought) | Tick, then type | Checkbox and number box | Optional | The yearly tax for using the vehicle; when leased it is on the supplier's card (frequency Annually) | It depends on this one card, so it sits here |
| 12 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per unit | Step (a purchase: Qty × unit price) | CapEx when the price of one unit is at or above the capitalisation limit; OpEx below it | CapEx when the price of one unit is at or above the capitalisation limit; Start-up expense below it |

**Depreciation:** Starts at the Opening Date for an asset bought before it, and in the month the asset is installed and ready to run for an asset bought after it. It lands in OpEx, because the asset is not related to an offering.

Leased (status Partners & Suppliers): the cost sits on the supplier's card, as a rent does. Bought (status Costs): a purchase priced per unit.

##### Infrastructure > Resources > Vehicles > Vehicle Running Costs

**Purpose:** Fuel and the everyday running costs of company vehicles, e.g. Petrol, Electric charging, Car wash, Washer fluid.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per unit, Monthly | None | the vehicle |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Vehicles. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Company Vehicles, Vehicle Running Costs | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Alliances & Networks (partner); Goods & Equipment, Business Services, Creative & IT Services, Property, Vehicles & Facilities, Technical Support (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency<br>Unit | Qty<br>Price<br>(none)<br>Frequency<br>(none) | Type<br>Type<br>Select<br>Select<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown<br>Dropdown, no label | Optional / Required / Automatic / Required / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Shown when the status is Costs. Per unit, Monthly<br>**Unit:** Shown when Frequency is Per unit. km, litre, kWh, bill, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per unit | Variable | OpEx (a company running cost, not related to an offering) | Startup Expense (one-time): written off, never capitalised |
| Monthly | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

#### Category: Digital Infrastructure

##### Infrastructure > Resources > Digital Infrastructure > Software & Web

**Purpose:** Software subscriptions and the public website, e.g. Bookkeeping software, Company website, Shared mailbox, Fleet tracking.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per unit, Monthly, Annually | None | Creative & IT Services for building |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Digital Infrastructure. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Software & Web, Cloud & Security | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Alliances & Networks (partner); Goods & Equipment, Business Services, Creative & IT Services, Property, Vehicles & Facilities, Technical Support (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency<br>Unit | Qty<br>Price<br>(none)<br>Frequency<br>(none) | Type<br>Type<br>Select<br>Select<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown<br>Dropdown, no label | Optional / Required / Automatic / Required / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Shown when the status is Costs. Per unit (a licence or seat bought once or per period), Monthly, Annually<br>**Unit:** Shown when Frequency is Per unit. seat, licence, user, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per unit | Variable | OpEx (a company running cost, not related to an offering) | Startup Expense (one-time): written off, never capitalised |
| Monthly | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |
| Annually | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

##### Infrastructure > Resources > Digital Infrastructure > Cloud & Security

**Purpose:** Storage, back-up and protection of files and data, e.g. Cloud drive, Nightly back-up, Password vault, Antivirus.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Monthly | None | Software & Web |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Digital Infrastructure. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Software & Web, Cloud & Security | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Alliances & Networks (partner); Goods & Equipment, Business Services, Creative & IT Services, Property, Vehicles & Facilities, Technical Support (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency | Qty<br>Price<br>(none)<br>Monthly | Type<br>Type<br>Select<br>None (shown) | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text | Optional / Required / Automatic / Automatic | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Monthly. A list with one option is shown as text | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Monthly | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

#### Category: Materials & Inventory

##### Infrastructure > Resources > Materials & Inventory > Business Consumables

**Purpose:** Everyday items the business uses up and replaces, e.g. Copy paper, Dish soap, Coffee beans.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Monthly, Per unit | None | Goods & Equipment |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Materials & Inventory. Changing it moves the card | Places the card in its tile |
| 4 | Group | Business Consumables | None | Subtitle (text) | Automatic | “Business Consumables”, shown directly under the Category | A dropdown with one option is not used |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Alliances & Networks (partner); Goods & Equipment, Business Services, Creative & IT Services, Property, Vehicles & Facilities, Technical Support (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency<br>Unit | Qty<br>Price<br>(none)<br>Frequency<br>(none) | Type<br>Type<br>Select<br>Select<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown<br>Dropdown, no label | Optional / Required / Automatic / Required / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Shown when the status is Costs. Monthly, Per unit<br>**Unit:** Shown when Frequency is Per unit. box, kg, litre, bill, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Monthly | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |
| Per unit | Variable | OpEx (a company running cost, not related to an offering) | Startup Expense (one-time): written off, never capitalised |

#### Category: Documents & Rights

##### Infrastructure > Resources > Documents & Rights > Insurances

**Purpose:** Policies that cover the company's liability, premises and people, e.g. Public liability, Cyber, Key person, Directors and officers.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Annually, Monthly | Cost option and billing type | Generated by vehicles, premises and assets; the insurer is a Business Services supplier |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** The renewal date of the policy | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Documents & Rights. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Insurances, Licences, Certificates, Tickets & Trip Costs | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Alliances & Networks (partner); Goods & Equipment, Business Services, Creative & IT Services, Property, Vehicles & Facilities, Technical Support (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Cost option<br>Billing type | Cost option<br>Billing type | Select<br>None (shown) | Dropdown<br>Read-only text | Required / Automatic | **Cost option:** Commercial property and liability (Fixed amount); Key-person or employee health (Fixed amount per employee, a calculated OpEx line)<br>**Billing type:** Percentage, Fixed amount or Lump sum, locked by the option; it locks the Frequency | One choice routes the cost |
| 10 | Qty<br>Price<br>Currency<br>Frequency | Qty<br>Price<br>(none)<br>Frequency | Type<br>Type<br>Select<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown | Optional / Required / Automatic / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Shown when the status is Costs. Annually, Monthly | One line. A card without a price is incomplete: red glow, left out of every total |
| 11 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** The cover limit, the grade (mandatory, recommended, optional) and any other detail may be written here. The insurer is added with +, as a Business Services supplier<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Annually | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |
| Monthly | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

##### Infrastructure > Resources > Documents & Rights > Licences

**Purpose:** Paid permissions: the right to use another's work and permits from authorities, e.g. Stock photo licence, Typeface rights, Image library, Staff parking permit.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| One-time, Annually, Per unit | Cost option and billing type | Software & Web, Creative & IT Services |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Documents & Rights. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Insurances, Licences, Certificates, Tickets & Trip Costs | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Alliances & Networks (partner); Goods & Equipment, Business Services, Creative & IT Services, Property, Vehicles & Facilities, Technical Support (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Cost option<br>Billing type | Cost option<br>Billing type | Select<br>None (shown) | Dropdown<br>Read-only text | Required / Automatic | **Cost option:** Initial permit (Lump sum); Annual renewal, music rights, municipal taxes (Fixed amount)<br>**Billing type:** Percentage, Fixed amount or Lump sum, locked by the option; it locks the Frequency | One choice routes the cost |
| 10 | Qty<br>Price<br>Currency<br>Frequency<br>Unit | Qty<br>Price<br>(none)<br>Frequency<br>(none) | Type<br>Type<br>Select<br>Select<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown<br>Dropdown, no label | Optional / Required / Automatic / Required / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Shown when the status is Costs. One-time, Annually, Per unit<br>**Unit:** Shown when Frequency is Per unit. seat, licence, user, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 11 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| One-time | Step | One-time OpEx (an initial permit) | Startup Expense (one-time): written off, never capitalised |
| Annually | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |
| Per unit | Variable | OpEx (a company running cost, not related to an offering) | Startup Expense (one-time): written off, never capitalised |

##### Infrastructure > Resources > Documents & Rights > Certificates

**Purpose:** Certificates and inspections of the premises and the team, e.g. Gas safety certificate, Fire-risk assessment, First-aid award, Energy rating.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| One-time, Annually | None | Technical Support for inspections. Inputs: issued by, valid until, outcome |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** The date the document expires | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Documents & Rights. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Insurances, Licences, Certificates, Tickets & Trip Costs | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Alliances & Networks (partner); Goods & Equipment, Business Services, Creative & IT Services, Property, Vehicles & Facilities, Technical Support (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency | Qty<br>Price<br>(none)<br>Frequency | Type<br>Type<br>Select<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown | Optional / Required / Automatic / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Shown when the status is Costs. One-time, Annually | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** The outcome (certificate, test report, permit) and any other detail may be written here. The issuing body or inspector is added with +, as a supplier<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| One-time | Step | OpEx (a company running cost, not related to an offering) | Startup Expense (one-time): written off, never capitalised |
| Annually | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

##### Infrastructure > Resources > Documents & Rights > Tickets & Trip Costs

**Purpose:** The fares and stops of trips that serve the whole company, e.g. Conference train fare, Hotel for a seminar, Airport taxi, Car park.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per unit, Per project | None | Travel for the whole company, with tolls and parking |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Documents & Rights. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Insurances, Licences, Certificates, Tickets & Trip Costs | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Alliances & Networks (partner); Goods & Equipment, Business Services, Creative & IT Services, Property, Vehicles & Facilities, Technical Support (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency<br>Unit | Qty<br>Price<br>(none)<br>Frequency<br>(none) | Type<br>Type<br>Select<br>Select<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown<br>Dropdown, no label | Optional / Required / Automatic / Required / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Shown when the status is Costs. Per unit, Per project<br>**Unit:** Shown when Frequency is Per unit. trip, ticket, night, person, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Payment Plan<br>Plan | Payment Plan<br>(none) | Tick<br>Select | Checkbox<br>Dropdown, no label | Optional / Required | **Payment Plan:** Shown when the Frequency is Per project. Unticked means paid in full. Ticking it opens the plan<br>**Plan:** Shown when ticked: Deposit & Balance; Instalments; Milestones | It decides when the cash leaves, not the cost |
| 11 | Deposit %<br>Balance date | Deposit %<br>Balance date | Type<br>Pick a date | Number box (%)<br>Calendar | Required / Required | **Deposit %:** Shown for Deposit & Balance. The share paid at the Start date; the rest is the balance<br>**Balance date:** Shown for Deposit & Balance. Defaults to the End date; it can be any date, for example a stage | Two dates: the first is the Start date |
| 12 | Instalments<br>Instalment lines | Instalments<br>Instalment lines | Type<br>Pick a date | Number box (whole numbers)<br>Calendars and number boxes | Required / Automatic | **Instalments:** Shown for Instalments. The number of fixed payments between the Start and End dates; both dates are needed<br>**Instalment lines:** The app sets equal dates and amounts; the user may move the dates and edit or round the amounts | Equal payments over the period, adjustable |
| 13 | Milestone<br>Milestone %<br>Milestone date<br>+ | Milestone<br>Milestone %<br>Milestone date<br>+ | Type<br>Type<br>Pick a date<br>Click | Text box<br>Number box (%)<br>Calendar<br>Button | Required / Required / Required / Button | **Milestone:** Shown for Milestones. The title of a stage; more detail goes in the Description<br>**Milestone %:** The share paid at this stage<br>**Milestone date:** Set by the user, beside the %<br>**+:** Adds another milestone, until the total is 100% | Payment tied to stages of the work |
| 14 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per unit | Variable | OpEx (a company running cost, not related to an offering) | Startup Expense (one-time): written off, never capitalised |
| Per project | Variable (grows with the number of jobs) | OpEx (a company running cost, not related to an offering) | Startup Expense (one-time): written off, never capitalised |

#### Category: Human Resources

##### Infrastructure > Resources > Human Resources > Admin Team

**Purpose:** Staff and helpers who handle the company's administration, e.g. Operations manager, Bookkeeper, Receptionist, Intern.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Monthly | Commission; Bonus | None |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Human Resources. Changing it moves the card | Places the card in its tile |
| 4 | Group | Admin Team | None | Subtitle (text) | Automatic | “Admin Team”, shown directly under the Category | A dropdown with one option is not used |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Needs Activity; Needs Investigation; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Alliances & Networks (partner); Goods & Equipment, Business Services, Creative & IT Services, Property, Vehicles & Facilities, Technical Support (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Needs Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency | Qty<br>Price<br>(none)<br>Monthly | Type<br>Type<br>Select<br>None (shown) | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text | Optional / Required / Automatic / Automatic | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The gross salary of one person; employer on-costs are a calculated line<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Monthly. A list with one option is shown as text | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Allowance<br>Frequency | Allowance<br>Monthly | Type<br>None (shown) | Number box<br>Read-only text | Optional / Automatic | **Allowance:** An allowance given to people who work from home<br>**Frequency:** Monthly | The allowance is a payment to the person, so it sits on the people cards |
| 11 | Extra: Commission | Commission | Tick, then type | Checkbox and number box | Optional | A share of sales paid to the person (frequency % of Rev) | It depends on this one card, so it sits here |
| 12 | Extra: Bonus | Bonus | Tick, then type | Checkbox and number box | Optional | A payment above pay (frequency Annually) | It depends on this one card, so it sits here |
| 13 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Monthly | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

##### Infrastructure > Resources > Human Resources > Founders & Owners (the Founders tile)

**Purpose:** Owners who work in the company and draw pay from it, e.g. Founder salary, Part-time director fee.

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>None (shown)<br>Click | Read-only number<br>Read-only text<br>Button | Automatic / Automatic / Button | **Number:** The card number<br>**Name:** From the Legal Entity page<br>**Remove ×:** Not offered | Founders are defined once, on the Legal Entity page |
| 2 | Start date | Start date | Pick a date | Calendar | Required | When the pay starts. A founder has no end date | Places the pay in time |
| 3 | Roles | Roles | None (shown) | Read-only bullet list | Automatic | From the Founders Profile | Shows what each founder does |
| 4 | Salary<br>Frequency | Salary<br>Frequency | Type<br>Select | Number box<br>Dropdown | Required / Required | **Salary:** The label carries the organisation's currency<br>**Frequency:** Weekly, Monthly or Annually (default Monthly); it also sets the period of the hours | The pay is the cost; the tile keeps its own period list |
| 5 | Working Hrs<br>Delivery Hrs | Working Hrs<br>Delivery Hrs | Type<br>Type | Number box<br>Number box | Required / Required | **Working Hrs:** Hours in the chosen period<br>**Delivery Hrs:** Cannot exceed working hours; a muted line shows the percentage of working hours | Feed the capacity and the cost per offering |
| 6 | Allowance<br>Frequency | Allowance<br>Monthly | Type<br>None (shown) | Number box<br>Read-only text | Optional / Automatic | **Allowance:** An allowance given to people who work from home<br>**Frequency:** Monthly | The allowance is a payment to the person, so it sits on the people cards |
| 7 | Extra: Commission | Commission | Tick, then type | Checkbox and number box | Optional | A share of sales paid to the person (frequency % of Rev) | It depends on this one card, so it sits here |
| 8 | Extra: Bonus | Bonus | Tick, then type | Checkbox and number box | Optional | A payment above pay (frequency Annually) | It depends on this one card, so it sits here |
| 9 | Responsibilities | Responsibilities | None (shown) | Read-only list with a Completed fold | Automatic | The activities this founder is responsible for | Shows the founder's load |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Weekly, Monthly or Annually | Fixed | OpEx; employer on-costs are a calculated OpEx line | Start-up expense (pre-launch fixed costs of the pre-operational period) |

#### Activities

##### Infrastructure > Activities > Pre-Operational

**What it holds:** Anything that runs before the opening: machinery and its installation by Technical Support, legal and accounting, a Testing & Training card, a launch event. It has a type (Capital Expenditure or Start-up Expenses), but the type is not shown as a category.

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Activity name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Between the Plan Start and the Opening Date. Inside the limits of its category<br>**End date:** Not before the start date, and inside the limits of its category. Left empty, the activity counts as one day | Placed after the name; set by the user |
| 3 | Group | Group | Select | Dropdown | Required | Pre-Operational (from the Plan Start to the Opening Date); Operational (from the Opening Date). Each category shows its period, taken from the Plan Start and the Opening Date | The group files the activity; it gives no cost nature to anything linked |
| 4 | Type | Type | Select | Dropdown | Required | Capital Expenditure; Start-up Expenses. It is not shown as a category or a tile | The type sets which pre-operational line the activity serves |
| 5 | Performer<br>Link symbol<br>+ | Performer<br>🔗<br>+ | Select<br>Click<br>Click | Dropdown<br>Link<br>Button | Required / Automatic / Button | **Performer:** Founders first, then partners and suppliers of the same place. When a performer card stands for several people, a number box picks how many take part, never more than the card holds<br>**Link symbol:** Beside a partner or supplier; a click opens its card<br>**+:** Adds another performer | Someone must carry it out |
| 6 | Resources<br>Resource<br>Units<br>Link symbol<br>+ | Resources<br>Resource<br>Units<br>🔗<br>+ | Tick<br>Select<br>Type<br>Click<br>Click | Checkbox<br>Dropdown<br>Number box (whole numbers)<br>Link<br>Button | Optional / Required / Optional / Automatic / Button | **Resources:** Ticking it opens the resource list<br>**Resource:** Shown when ticked: the resources of the place. A linked card's start date cannot be after the activity's start date when the activity has no end date, or after its end date when it has one<br>**Units:** Shown beside a resource that has units, never more than the resource has<br>**Link symbol:** Beside the resource; a click opens its card<br>**+:** Adds another resource | An activity depends on the resources it uses |
| 7 | Cost | Cost | None (shown) | Read-only text | Automatic | Shown after the last linked resource, with the estimated cost of each. It is named Total when more than 2 linked cards carry values. The card holds no price and no quantity | It presents; it does not hold |
| 8 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must answer for it |
| 9 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 10 | Completed | Completed | Tick | Checkbox | Optional | Ticking it freezes the card and files it under the grey Completed tile; All Tiles hides it by default | Closes finished work |

###### Behind the scenes (not shown on the card)

The activity card carries no cost and no cost nature, and no card takes its cost nature from it. The group is only a filing and a date rule. For reference, the nature usually met in that group: Start-up expense (CapEx for an asset).

##### Infrastructure > Activities > Operational

**What it holds:** The daily running of the company: air conditioning service, administration, a team party, scheduled maintenance linked to Technical Support.

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Activity name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** The Opening Date or later. Inside the limits of its category<br>**End date:** Not before the start date, and inside the limits of its category. Left empty, the activity counts as one day | Placed after the name; set by the user |
| 3 | Group | Group | Select | Dropdown | Required | Pre-Operational (from the Plan Start to the Opening Date); Operational (from the Opening Date). Each category shows its period, taken from the Plan Start and the Opening Date | The group files the activity; it gives no cost nature to anything linked |
| 4 | Performer<br>Link symbol<br>+ | Performer<br>🔗<br>+ | Select<br>Click<br>Click | Dropdown<br>Link<br>Button | Required / Automatic / Button | **Performer:** Founders first, then partners and suppliers of the same place. When a performer card stands for several people, a number box picks how many take part, never more than the card holds<br>**Link symbol:** Beside a partner or supplier; a click opens its card<br>**+:** Adds another performer | Someone must carry it out |
| 5 | Resources<br>Resource<br>Units<br>Link symbol<br>+ | Resources<br>Resource<br>Units<br>🔗<br>+ | Tick<br>Select<br>Type<br>Click<br>Click | Checkbox<br>Dropdown<br>Number box (whole numbers)<br>Link<br>Button | Optional / Required / Optional / Automatic / Button | **Resources:** Ticking it opens the resource list<br>**Resource:** Shown when ticked: the resources of the place. A linked card's start date cannot be after the activity's start date when the activity has no end date, or after its end date when it has one<br>**Units:** Shown beside a resource that has units, never more than the resource has<br>**Link symbol:** Beside the resource; a click opens its card<br>**+:** Adds another resource | An activity depends on the resources it uses |
| 6 | Cost | Cost | None (shown) | Read-only text | Automatic | Shown after the last linked resource, with the estimated cost of each. It is named Total when more than 2 linked cards carry values. The card holds no price and no quantity | It presents; it does not hold |
| 7 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must answer for it |
| 8 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 9 | Completed | Completed | Tick | Checkbox | Optional | Ticking it freezes the card and files it under the grey Completed tile; All Tiles hides it by default | Closes finished work |

###### Behind the scenes (not shown on the card)

The activity card carries no cost and no cost nature, and no card takes its cost nature from it. The group is only a filing and a date rule. For reference, the nature usually met in that group: OpEx.

#### Partners

##### Infrastructure > Partners > Alliances & Networks > Alliances & Networks

**Purpose:** Organisations you join for the benefit of the whole company, e.g. Trade association, Buying group, Start-up accelerator, Producers cooperative.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Annually | None | None |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Partner name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Group | Alliances & Networks | None | Subtitle (text) | Automatic | “Alliances & Networks”, shown directly under the Category | A dropdown with one option is not used |
| 4 | Price<br>Currency<br>Frequency | Price<br>(none)<br>Annually | Type<br>Select<br>None (shown) | Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text | Required / Automatic / Automatic | **Price:** The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Annually. A list with one option is shown as text | One line. A card without a price is incomplete: red glow, left out of every total |
| 5 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must coordinate the work |
| 6 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** The organisation, the contact and the terms of the agreement may be written here<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Annually | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

#### Suppliers

##### Infrastructure > Suppliers > Goods & Equipment > Goods & Equipment

**Purpose:** Sellers of furniture, devices and consumables for the company, e.g. Furniture dealer, Stationery merchant, Computer reseller, Water-cooler rental.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per unit | None | Furniture & Fittings, Devices & Tools, Business Consumables |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Supplier name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Group | Group | Select | Dropdown | Required | Goods & Equipment, Business Services, Creative & IT Services, Property, Vehicles & Facilities, Technical Support | The group sets the defaults of the card |
| 4 | Price<br>Currency<br>Frequency<br>Unit | Price<br>(none)<br>Per unit<br>(none) | Type<br>Select<br>None (shown)<br>Select | Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text<br>Dropdown, no label | Required / Automatic / Automatic / Required | **Price:** The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Per unit. A list with one option is shown as text<br>**Unit:** Shown when Frequency is Per unit. order, bill, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 5 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must coordinate the work |
| 6 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** The supplier, the contact, the terms and the lead time may be written here<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per unit | Variable | OpEx (a company running cost, not related to an offering) | Startup Expense (one-time): written off, never capitalised |

##### Infrastructure > Suppliers > Business Services > Business Services

**Purpose:** Firms that run the administrative side, e.g. Accountant, Lawyer, Insurance broker, Payroll bureau, Business bank, Web host.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Monthly, Annually, Per project | None | an insurance broker links to Insurances cards |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Supplier name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Group | Group | Select | Dropdown | Required | Goods & Equipment, Business Services, Creative & IT Services, Property, Vehicles & Facilities, Technical Support | The group sets the defaults of the card |
| 4 | Price<br>Currency<br>Frequency | Price<br>(none)<br>Frequency | Type<br>Select<br>Select | Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown | Required / Automatic / Required | **Price:** The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Monthly, Annually, Per project | One line. A card without a price is incomplete: red glow, left out of every total |
| 5 | Payment Plan<br>Plan | Payment Plan<br>(none) | Tick<br>Select | Checkbox<br>Dropdown, no label | Optional / Required | **Payment Plan:** Shown when the Frequency is Per project. Unticked means paid in full. Ticking it opens the plan<br>**Plan:** Shown when ticked: Deposit & Balance; Instalments; Milestones | It decides when the cash leaves, not the cost |
| 6 | Deposit %<br>Balance date | Deposit %<br>Balance date | Type<br>Pick a date | Number box (%)<br>Calendar | Required / Required | **Deposit %:** Shown for Deposit & Balance. The share paid at the Start date; the rest is the balance<br>**Balance date:** Shown for Deposit & Balance. Defaults to the End date; it can be any date, for example a stage | Two dates: the first is the Start date |
| 7 | Instalments<br>Instalment lines | Instalments<br>Instalment lines | Type<br>Pick a date | Number box (whole numbers)<br>Calendars and number boxes | Required / Automatic | **Instalments:** Shown for Instalments. The number of fixed payments between the Start and End dates; both dates are needed<br>**Instalment lines:** The app sets equal dates and amounts; the user may move the dates and edit or round the amounts | Equal payments over the period, adjustable |
| 8 | Milestone<br>Milestone %<br>Milestone date<br>+ | Milestone<br>Milestone %<br>Milestone date<br>+ | Type<br>Type<br>Pick a date<br>Click | Text box<br>Number box (%)<br>Calendar<br>Button | Required / Required / Required / Button | **Milestone:** Shown for Milestones. The title of a stage; more detail goes in the Description<br>**Milestone %:** The share paid at this stage<br>**Milestone date:** Set by the user, beside the %<br>**+:** Adds another milestone, until the total is 100% | Payment tied to stages of the work |
| 9 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must coordinate the work |
| 10 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** The supplier, the contact, the terms and the lead time may be written here<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Monthly | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |
| Annually | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |
| Per project | Variable (grows with the number of jobs) | OpEx (a company running cost, not related to an offering) | Startup Expense (one-time): written off, never capitalised |

##### Infrastructure > Suppliers > Creative & IT Services > Creative & IT Services

**Purpose:** Freelancers and small agencies for design, branding, content or technology work, e.g. Web builder, Brand identity house, Photographer, IT support, Copywriter.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per project, Monthly | None | Software & Web |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Supplier name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Group | Group | Select | Dropdown | Required | Goods & Equipment, Business Services, Creative & IT Services, Property, Vehicles & Facilities, Technical Support | The group sets the defaults of the card |
| 4 | Price<br>Currency<br>Frequency | Price<br>(none)<br>Frequency | Type<br>Select<br>Select | Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown | Required / Automatic / Required | **Price:** The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Per project, Monthly | One line. A card without a price is incomplete: red glow, left out of every total |
| 5 | Payment Plan<br>Plan | Payment Plan<br>(none) | Tick<br>Select | Checkbox<br>Dropdown, no label | Optional / Required | **Payment Plan:** Shown when the Frequency is Per project. Unticked means paid in full. Ticking it opens the plan<br>**Plan:** Shown when ticked: Deposit & Balance; Instalments; Milestones | It decides when the cash leaves, not the cost |
| 6 | Deposit %<br>Balance date | Deposit %<br>Balance date | Type<br>Pick a date | Number box (%)<br>Calendar | Required / Required | **Deposit %:** Shown for Deposit & Balance. The share paid at the Start date; the rest is the balance<br>**Balance date:** Shown for Deposit & Balance. Defaults to the End date; it can be any date, for example a stage | Two dates: the first is the Start date |
| 7 | Instalments<br>Instalment lines | Instalments<br>Instalment lines | Type<br>Pick a date | Number box (whole numbers)<br>Calendars and number boxes | Required / Automatic | **Instalments:** Shown for Instalments. The number of fixed payments between the Start and End dates; both dates are needed<br>**Instalment lines:** The app sets equal dates and amounts; the user may move the dates and edit or round the amounts | Equal payments over the period, adjustable |
| 8 | Milestone<br>Milestone %<br>Milestone date<br>+ | Milestone<br>Milestone %<br>Milestone date<br>+ | Type<br>Type<br>Pick a date<br>Click | Text box<br>Number box (%)<br>Calendar<br>Button | Required / Required / Required / Button | **Milestone:** Shown for Milestones. The title of a stage; more detail goes in the Description<br>**Milestone %:** The share paid at this stage<br>**Milestone date:** Set by the user, beside the %<br>**+:** Adds another milestone, until the total is 100% | Payment tied to stages of the work |
| 9 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must coordinate the work |
| 10 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** The supplier, the contact, the terms and the lead time may be written here<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per project | Variable (grows with the number of jobs) | OpEx (a company running cost, not related to an offering) | Startup Expense (one-time): written off, never capitalised |
| Monthly | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

A build that results in an identifiable asset the company owns (a website, code), linked to that asset, is capitalised with it; design time, advice and research are expensed. Before the opening a service that is not capitalised is a Start-up expense.

##### Infrastructure > Suppliers > Property, Vehicles & Facilities > Property, Vehicles & Facilities

**Purpose:** Owners and caretakers of the premises, and lessors of vehicles, e.g. Landlord, Coworking operator, Cleaner, Vehicle lessor.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Monthly | Deposit; Service charge; Commercial property tax; Road tax (by what is connected) | holds the rent of a rented Premises card, or the lease of a Company Vehicles card, and shows the link to it |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Supplier name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Group | Group | Select | Dropdown | Required | Goods & Equipment, Business Services, Creative & IT Services, Property, Vehicles & Facilities, Technical Support | The group sets the defaults of the card |
| 4 | Qty<br>Price<br>Currency<br>Frequency | Qty<br>Price<br>(none)<br>Monthly | Type<br>Type<br>Select<br>None (shown) | Number box (whole numbers)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text | Required / Required / Automatic / Automatic | **Qty:** Shown when a vehicle is connected. The number of vehicles leased; placed before the price<br>**Price:** The rent or lease of the connected space or vehicle<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Monthly. A list with one option is shown as text | One line. A card without a price is incomplete: red glow, left out of every total |
| 5 | Extra: Deposit | Deposit | Tick, then type | Checkbox and number box | Optional | A refundable sum held until the space is returned (frequency One-time). Appears when a Premises card is connected | It depends on the connected workspace |
| 6 | Extra: Service charge | Service charge | Tick, then type | Checkbox and number box | Optional | Shared services beside the rent (frequency Monthly). Appears when a Premises card is connected | It depends on the connected workspace |
| 7 | Extra: Commercial property tax | Commercial property tax | Tick, then type | Checkbox and number box | Optional | The local tax on commercial premises (frequency Annually). Appears when a Premises card is connected | It depends on the connected workspace |
| 8 | Extra: Road tax | Road tax | Tick, then type | Checkbox and number box | Optional | The yearly tax for using a leased vehicle (frequency Annually). Appears when a Company Vehicles card is connected | A leased vehicle has no utilities or property tax, so only the road tax shows |
| 9 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must coordinate the work |
| 10 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** The supplier, the contact, the terms and the lead time may be written here<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Monthly | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

##### Infrastructure > Suppliers > Technical Support > Technical Support

**Purpose:** Outsourced technicians who maintain, repair and install the company's assets, e.g. Electrical engineer, Plumber, Boiler fitter, Network cabling. An installation is linked to the asset it installs.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per project, Per unit, Annually | None | a supplier card with a start date. It takes no cost nature from an activity card |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Supplier name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Group | Group | Select | Dropdown | Required | Goods & Equipment, Business Services, Creative & IT Services, Property, Vehicles & Facilities, Technical Support | The group sets the defaults of the card |
| 4 | Price<br>Currency<br>Frequency<br>Unit | Price<br>(none)<br>Frequency<br>(none) | Type<br>Select<br>Select<br>Select | Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown<br>Dropdown, no label | Required / Automatic / Required / Required | **Price:** The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Per project, Per unit, Annually<br>**Unit:** Shown when Frequency is Per unit. hour, visit, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 5 | Payment Plan<br>Plan | Payment Plan<br>(none) | Tick<br>Select | Checkbox<br>Dropdown, no label | Optional / Required | **Payment Plan:** Shown when the Frequency is Per project. Unticked means paid in full. Ticking it opens the plan<br>**Plan:** Shown when ticked: Deposit & Balance; Instalments; Milestones | It decides when the cash leaves, not the cost |
| 6 | Deposit %<br>Balance date | Deposit %<br>Balance date | Type<br>Pick a date | Number box (%)<br>Calendar | Required / Required | **Deposit %:** Shown for Deposit & Balance. The share paid at the Start date; the rest is the balance<br>**Balance date:** Shown for Deposit & Balance. Defaults to the End date; it can be any date, for example a stage | Two dates: the first is the Start date |
| 7 | Instalments<br>Instalment lines | Instalments<br>Instalment lines | Type<br>Pick a date | Number box (whole numbers)<br>Calendars and number boxes | Required / Automatic | **Instalments:** Shown for Instalments. The number of fixed payments between the Start and End dates; both dates are needed<br>**Instalment lines:** The app sets equal dates and amounts; the user may move the dates and edit or round the amounts | Equal payments over the period, adjustable |
| 8 | Milestone<br>Milestone %<br>Milestone date<br>+ | Milestone<br>Milestone %<br>Milestone date<br>+ | Type<br>Type<br>Pick a date<br>Click | Text box<br>Number box (%)<br>Calendar<br>Button | Required / Required / Required / Button | **Milestone:** Shown for Milestones. The title of a stage; more detail goes in the Description<br>**Milestone %:** The share paid at this stage<br>**Milestone date:** Set by the user, beside the %<br>**+:** Adds another milestone, until the total is 100% | Payment tied to stages of the work |
| 9 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must coordinate the work |
| 10 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** The supplier, the contact, the terms and the lead time may be written here<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per project | Variable (grows with the number of jobs) | OpEx (a company running cost, not related to an offering) | Startup Expense (one-time): written off, never capitalised |
| Per unit | Variable | OpEx (a company running cost, not related to an offering) | Startup Expense (one-time): written off, never capitalised |
| Annually | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

A service that builds or installs an asset (a machine and its installation) passes the three tests and is added to the asset's value when the amount is at or above the capitalisation limit; time, advice or research is expensed. Before the opening it is a Start-up expense; after it, OpEx.

### Offering

#### Resources

#### Category: Workspace

##### Offering > Resources > Workspace > Site Hire

**Purpose:** The site rented for one event or job, e.g. Market pitch fee, Stand levy, Marquee frame, Rehearsal room slot.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per project | None | an Insurances card for the event is generated |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Workspace. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Site Hire, Workshop & Storage | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Revenue Partners, Accreditation Bodies (partners); Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency | Qty<br>Price<br>(none)<br>Per project | Type<br>Type<br>Select<br>None (shown) | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text | Optional / Required / Automatic / Automatic | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Per project. A list with one option is shown as text | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Payment Plan<br>Plan | Payment Plan<br>(none) | Tick<br>Select | Checkbox<br>Dropdown, no label | Optional / Required | **Payment Plan:** Shown when the Frequency is Per project. Unticked means paid in full. Ticking it opens the plan<br>**Plan:** Shown when ticked: Deposit & Balance; Instalments; Milestones | It decides when the cash leaves, not the cost |
| 11 | Deposit %<br>Balance date | Deposit %<br>Balance date | Type<br>Pick a date | Number box (%)<br>Calendar | Required / Required | **Deposit %:** Shown for Deposit & Balance. The share paid at the Start date; the rest is the balance<br>**Balance date:** Shown for Deposit & Balance. Defaults to the End date; it can be any date, for example a stage | Two dates: the first is the Start date |
| 12 | Instalments<br>Instalment lines | Instalments<br>Instalment lines | Type<br>Pick a date | Number box (whole numbers)<br>Calendars and number boxes | Required / Automatic | **Instalments:** Shown for Instalments. The number of fixed payments between the Start and End dates; both dates are needed<br>**Instalment lines:** The app sets equal dates and amounts; the user may move the dates and edit or round the amounts | Equal payments over the period, adjustable |
| 13 | Milestone<br>Milestone %<br>Milestone date<br>+ | Milestone<br>Milestone %<br>Milestone date<br>+ | Type<br>Type<br>Pick a date<br>Click | Text box<br>Number box (%)<br>Calendar<br>Button | Required / Required / Required / Button | **Milestone:** Shown for Milestones. The title of a stage; more detail goes in the Description<br>**Milestone %:** The share paid at this stage<br>**Milestone date:** Set by the user, beside the %<br>**+:** Adds another milestone, until the total is 100% | Payment tied to stages of the work |
| 14 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 15 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per project | Step (a job-sized amount) | COGS | Startup Expense (one-time): written off, never capitalised |

##### Offering > Resources > Workspace > Workshop & Storage

**Purpose:** The permanent base where the product is made or stored, e.g. Warehouse bay, Container yard, Shared-kitchen membership, Chiller space.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| One-time | Commercial property tax (when bought); Service charge (when bought) | a rented space uses the status Partners & Suppliers with a supplier in Landlords, Leasing & Warehouses, which holds the rent and its extras, including Handling per pallet; an Insurances card is generated |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Workspace. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Site Hire, Workshop & Storage | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Rent; Activity; Buy. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Rent<br>Link symbol | Rent<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Rent:** Shown when the status is Rent. Opens or creates a card only in Landlords, Leasing & Warehouses; its card holds the rent and its extras<br>**Link symbol:** Beside the chosen name; a click opens the card | A rented space or vehicle is a supplier's service |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Price<br>Currency | Price<br>(none) | Type<br>Select | Number box (decimal)<br>Searchable dropdown, no label | Required / Automatic | **Price:** Shown when the status is Buy. A purchase, priced One-time. For Rent the price is on the supplier's card<br>**Currency:** The user may change it. The organisation's currency by default | One line. A card without a price is incomplete: red glow, left out of every total. The Frequency One-time is implied, so it is not shown |
| 10 | Extra: Commercial property tax (when bought) | Commercial property tax (when bought) | Tick, then type | Checkbox and number box | Optional | The local tax on commercial premises (frequency Annually) | It depends on this one card, so it sits here |
| 11 | Extra: Service charge (when bought) | Service charge (when bought) | Tick, then type | Checkbox and number box | Optional | Shared services of a shared building (frequency Monthly) | It depends on this one card, so it sits here |
| 12 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 13 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| One-time | Step | CapEx at or above the capitalisation limit; OpEx below it | CapEx at or above the capitalisation limit; Start-up expense below it |

Rented (status Partners & Suppliers): the cost sits on the supplier's card. Bought (status Costs): a one-time purchase, CapEx.

#### Category: Utilities

##### Offering > Resources > Utilities > Process Utilities

**Purpose:** The energy, water and waste services that production consumes, e.g. Firing power, Rinse water, Chemical disposal.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per unit | None | Workshop & Storage |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Utilities. Changing it moves the card | Places the card in its tile |
| 4 | Group | Process Utilities | None | Subtitle (text) | Automatic | “Process Utilities”, shown directly under the Category | A dropdown with one option is not used |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Revenue Partners, Accreditation Bodies (partners); Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency<br>Unit | Qty<br>Price<br>(none)<br>Per unit<br>(none) | Type<br>Type<br>Select<br>None (shown)<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text<br>Dropdown, no label | Optional / Required / Automatic / Automatic / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Per unit. A list with one option is shown as text<br>**Unit:** Shown when Frequency is Per unit. kWh, litre, m³, bill, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 11 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per unit | Variable | COGS | Startup Expense (one-time): written off, never capitalised |

#### Category: Workstation

##### Offering > Resources > Workstation > Fixtures & Displays

**Purpose:** Fixed installations in your premises for making or showing the product, e.g. Workbench, Pallet racking, Showcase shelves, Sign board.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per unit | None | Workshop & Storage |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Workstation. Changing it moves the card | Places the card in its tile |
| 4 | Group | Fixtures & Displays | None | Subtitle (text) | Automatic | “Fixtures & Displays”, shown directly under the Category | A dropdown with one option is not used |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Revenue Partners, Accreditation Bodies (partners); Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency<br>Unit | Qty<br>Price<br>(none)<br>Per unit<br>(none) | Type<br>Type<br>Select<br>None (shown)<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text<br>Dropdown, no label | Optional / Required / Automatic / Automatic / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Per unit. A list with one option is shown as text<br>**Unit:** Shown when Frequency is Per unit. item, set, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Useful life | Useful life | Type | Number box (years) | Optional | Shown when the status is Costs and the price of one unit, with its linked services, is at or above the capitalisation limit. It is how long the asset stays useful to the business, not how long it lasts. Prefilled with the default of the group from Global Settings; the user may change it. Depreciation starts when the asset is ready for use | Feeds the depreciation line |
| 11 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 12 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per unit | Step (a purchase: Qty × unit price) | CapEx when the price of one unit is at or above the capitalisation limit; OpEx below it | CapEx when the price of one unit is at or above the capitalisation limit; Start-up expense below it |

**Depreciation:** Starts at the Opening Date for an asset bought before it, and in the month the asset is installed and ready to run for an asset bought after it. It lands in COGS, because the asset helps to make or deliver the offering.

#### Category: Equipment

##### Offering > Resources > Equipment > Production Machinery

**Purpose:** Machines that turn raw materials into finished goods, e.g. Floor loom, Industrial oven, Laser cutter.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per unit | None | its installation is a Technical Support supplier card; an Insurances card is generated |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Equipment. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Production Machinery, Devices & Tools | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Revenue Partners, Accreditation Bodies (partners); Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency<br>Unit | Qty<br>Price<br>(none)<br>Per unit<br>(none) | Type<br>Type<br>Select<br>None (shown)<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text<br>Dropdown, no label | Optional / Required / Automatic / Automatic / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Per unit. A list with one option is shown as text<br>**Unit:** Shown when Frequency is Per unit. machine, item, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Useful life | Useful life | Type | Number box (years) | Optional | Shown when the status is Costs and the price of one unit, with its linked services, is at or above the capitalisation limit. It is how long the asset stays useful to the business, not how long it lasts. Prefilled with the default of the group from Global Settings; the user may change it. Depreciation starts when the asset is ready for use | Feeds the depreciation line |
| 11 | Warranty<br>Warranty until | Warranty<br>(none) | Tick<br>Pick a date | Checkbox<br>Calendar, no label | Optional / Optional | **Warranty:** Information only: it locks nothing<br>**Warranty until:** Appears next to the checkbox when it is ticked | Shows how long the warranty lasts |
| 12 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 13 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per unit | Step (a purchase: Qty × unit price) | CapEx when the price of one unit is at or above the capitalisation limit; OpEx below it | CapEx when the price of one unit is at or above the capitalisation limit; Start-up expense below it |

**Depreciation:** Starts at the Opening Date for an asset bought before it, and in the month the asset is installed and ready to run for an asset bought after it. It lands in COGS, because the asset helps to make or deliver the offering.

##### Offering > Resources > Equipment > Devices & Tools

**Purpose:** The tools, instruments and gear used to make or deliver the offering, besides its machines, e.g. Card reader, Stall display kit, Tripod rig, Hard hat, Moisture meter.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per unit, Annually | None | channel template T6 creates this card for display kit or hardware |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Equipment. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Production Machinery, Devices & Tools | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Revenue Partners, Accreditation Bodies (partners); Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency<br>Unit | Qty<br>Price<br>(none)<br>Frequency<br>(none) | Type<br>Type<br>Select<br>Select<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown<br>Dropdown, no label | Optional / Required / Automatic / Required / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Shown when the status is Costs. Per unit (purchase), Annually<br>**Unit:** Shown when Frequency is Per unit. item, set, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Useful life | Useful life | Type | Number box (years) | Optional | Shown when the status is Costs and the price of one unit, with its linked services, is at or above the capitalisation limit. It is how long the asset stays useful to the business, not how long it lasts. Prefilled with the default of the group from Global Settings; the user may change it. Depreciation starts when the asset is ready for use | Feeds the depreciation line |
| 11 | Warranty<br>Warranty until | Warranty<br>(none) | Tick<br>Pick a date | Checkbox<br>Calendar, no label | Optional / Optional | **Warranty:** Information only: it locks nothing<br>**Warranty until:** Appears next to the checkbox when it is ticked | Shows how long the warranty lasts |
| 12 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 13 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per unit | Step (a purchase: Qty × unit price) | CapEx when the price of one unit is at or above the capitalisation limit; OpEx below it | CapEx when the price of one unit is at or above the capitalisation limit; Start-up expense below it |
| Annually | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

**Depreciation:** Starts at the Opening Date for an asset bought before it, and in the month the asset is installed and ready to run for an asset bought after it. It lands in COGS, because the asset helps to make or deliver the offering.

#### Category: Vehicles

##### Offering > Resources > Vehicles > Delivery Vehicles

**Purpose:** Vans and trucks that carry or install the product, e.g. Transit van, Refrigerated truck, Short-term hire.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per unit | Road tax (when bought) | a leased vehicle uses the status Partners & Suppliers with a supplier in Landlords, Leasing & Warehouses, which holds the lease; an Insurances card is generated |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Vehicles. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Delivery Vehicles, Delivery Running Costs | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Rent; Activity; Buy. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Rent<br>Link symbol | Rent<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Rent:** Shown when the status is Rent. Opens or creates a card only in Landlords, Leasing & Warehouses; its card holds the rent and its extras<br>**Link symbol:** Beside the chosen name; a click opens the card | A rented space or vehicle is a supplier's service |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency<br>Unit | Qty<br>Price<br>(none)<br>Per unit<br>vehicle | Type<br>Type<br>Select<br>None (shown)<br>None (shown) | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text<br>Read-only text | Optional / Required / Automatic / Automatic / Automatic | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Buy. A purchase, priced Per unit. For Rent the price is on the supplier's card<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Per unit. A list with one option is shown as text<br>**Unit:** vehicle. Shown when Frequency is Per unit; one option besides “unit”, so it is text | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Useful life | Useful life | Type | Number box (years) | Optional | Shown when the status is Costs and the price of one unit, with its linked services, is at or above the capitalisation limit. It is how long the asset stays useful to the business, not how long it lasts. Prefilled with the default of the group from Global Settings; the user may change it. Depreciation starts when the asset is ready for use | Feeds the depreciation line |
| 11 | Extra: Road tax (when bought) | Road tax (when bought) | Tick, then type | Checkbox and number box | Optional | The yearly tax for using the vehicle; when leased it is on the supplier's card (frequency Annually) | It depends on this one card, so it sits here |
| 12 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 13 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per unit | Step (a purchase: Qty × unit price) | CapEx when the price of one unit is at or above the capitalisation limit; OpEx below it | CapEx when the price of one unit is at or above the capitalisation limit; Start-up expense below it |

**Depreciation:** Starts at the Opening Date for an asset bought before it, and in the month the asset is installed and ready to run for an asset bought after it. It lands in COGS, because the asset helps to make or deliver the offering.

Leased (status Partners & Suppliers): the cost sits on the supplier's card. Bought (status Costs): a purchase priced per unit.

##### Offering > Resources > Vehicles > Delivery Running Costs

**Purpose:** Fuel and the everyday running costs of delivery vehicles, e.g. Diesel, AdBlue, Van valet, Windscreen cleaner.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per unit | None | Delivery Vehicles |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Vehicles. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Delivery Vehicles, Delivery Running Costs | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Revenue Partners, Accreditation Bodies (partners); Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency<br>Unit | Qty<br>Price<br>(none)<br>Per unit<br>(none) | Type<br>Type<br>Select<br>None (shown)<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text<br>Dropdown, no label | Optional / Required / Automatic / Automatic / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Per unit. A list with one option is shown as text<br>**Unit:** Shown when Frequency is Per unit. km, litre, delivery, bill, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 11 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per unit | Variable | COGS | Startup Expense (one-time): written off, never capitalised |

#### Category: Digital Infrastructure

##### Offering > Resources > Digital Infrastructure > Sales & Delivery Tools

**Purpose:** Software that takes orders, bookings and payments, then delivers the result, e.g. Web shop, Booking app, Newsletter tool, File transfer.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Monthly, Annually | None | channel template T1 creates this card |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Digital Infrastructure. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Sales & Delivery Tools, Platforms & APIs | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Revenue Partners, Accreditation Bodies (partners); Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency | Qty<br>Price<br>(none)<br>Frequency | Type<br>Type<br>Select<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown | Optional / Required / Automatic / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Shown when the status is Costs. Monthly, Annually | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 11 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Monthly | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |
| Annually | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

##### Offering > Resources > Digital Infrastructure > Platforms & APIs

**Purpose:** Online services your product calls, billed per use, e.g. AI text service, Maps lookup, Address check, Speech transcription.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per unit | None | None |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Digital Infrastructure. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Sales & Delivery Tools, Platforms & APIs | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Revenue Partners, Accreditation Bodies (partners); Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency<br>Unit | Qty<br>Price<br>(none)<br>Per unit<br>(none) | Type<br>Type<br>Select<br>None (shown)<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text<br>Dropdown, no label | Optional / Required / Automatic / Automatic / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Per unit. A list with one option is shown as text<br>**Unit:** Shown when Frequency is Per unit. call, token, request, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 11 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per unit | Variable | COGS | Startup Expense (one-time): written off, never capitalised |

#### Category: Materials & Inventory

##### Offering > Resources > Materials & Inventory > Materials & Stock

**Purpose:** The materials, parts, packaging and resale goods that each sale uses, e.g. Yarn, Brass fittings, Mailer boxes, Gift wrap, Sample swatches, Resale mugs.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per unit | None | channel template T8 creates this card for packaging and samples |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Materials & Inventory. Changing it moves the card | Places the card in its tile |
| 4 | Group | Materials & Stock | None | Subtitle (text) | Automatic | “Materials & Stock”, shown directly under the Category | A dropdown with one option is not used |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Revenue Partners, Accreditation Bodies (partners); Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency<br>Unit | Qty<br>Price<br>(none)<br>Per unit<br>(none) | Type<br>Type<br>Select<br>None (shown)<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text<br>Dropdown, no label | Optional / Required / Automatic / Automatic / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Per unit. A list with one option is shown as text<br>**Unit:** Shown when Frequency is Per unit. kg, metre, litre, piece, box, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 11 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per unit | Variable | COGS as units are sold: the stock is held as Inventory and drains month by month | A separate cash line (opening inventory, working capital), outside the contingency base. Not a Start-up expense: on the first day it becomes Inventory, a current asset, reaching COGS as units are sold |

#### Category: Documents & Rights

##### Offering > Resources > Documents & Rights > Insurances

**Purpose:** Policies that cover products, jobs and events, e.g. Product recall, Carriage of goods, Event cancellation, Customer default.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Annually, Per project | Cost option and billing type | Generated by a vehicle, workshop, event or channel (T12) |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** The renewal date of the policy | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Documents & Rights. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Insurances, Licences, Royalties, Certificates, Tickets & Trip Costs | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Revenue Partners, Accreditation Bodies (partners); Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Cost option<br>Billing type | Cost option<br>Billing type | Select<br>None (shown) | Dropdown<br>Read-only text | Required / Automatic | **Cost option:** Commercial property and liability; Key-person or employee health<br>**Billing type:** Percentage, Fixed amount or Lump sum, locked by the option; it locks the Frequency | One choice routes the cost |
| 10 | Qty<br>Price<br>Currency<br>Frequency | Qty<br>Price<br>(none)<br>Frequency | Type<br>Type<br>Select<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown | Optional / Required / Automatic / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Shown when the status is Costs. Annually, Per project | One line. A card without a price is incomplete: red glow, left out of every total |
| 11 | Payment Plan<br>Plan | Payment Plan<br>(none) | Tick<br>Select | Checkbox<br>Dropdown, no label | Optional / Required | **Payment Plan:** Shown when the Frequency is Per project. Unticked means paid in full. Ticking it opens the plan<br>**Plan:** Shown when ticked: Deposit & Balance; Instalments; Milestones | It decides when the cash leaves, not the cost |
| 12 | Deposit %<br>Balance date | Deposit %<br>Balance date | Type<br>Pick a date | Number box (%)<br>Calendar | Required / Required | **Deposit %:** Shown for Deposit & Balance. The share paid at the Start date; the rest is the balance<br>**Balance date:** Shown for Deposit & Balance. Defaults to the End date; it can be any date, for example a stage | Two dates: the first is the Start date |
| 13 | Instalments<br>Instalment lines | Instalments<br>Instalment lines | Type<br>Pick a date | Number box (whole numbers)<br>Calendars and number boxes | Required / Automatic | **Instalments:** Shown for Instalments. The number of fixed payments between the Start and End dates; both dates are needed<br>**Instalment lines:** The app sets equal dates and amounts; the user may move the dates and edit or round the amounts | Equal payments over the period, adjustable |
| 14 | Milestone<br>Milestone %<br>Milestone date<br>+ | Milestone<br>Milestone %<br>Milestone date<br>+ | Type<br>Type<br>Pick a date<br>Click | Text box<br>Number box (%)<br>Calendar<br>Button | Required / Required / Required / Button | **Milestone:** Shown for Milestones. The title of a stage; more detail goes in the Description<br>**Milestone %:** The share paid at this stage<br>**Milestone date:** Set by the user, beside the %<br>**+:** Adds another milestone, until the total is 100% | Payment tied to stages of the work |
| 15 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** The cover limit, the grade (mandatory, recommended, optional) and any other detail may be written here. The insurer is added with +, as a Business Services supplier<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 16 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Annually | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |
| Per project | Variable (grows with the number of jobs) | COGS | Startup Expense (one-time): written off, never capitalised |

##### Offering > Resources > Documents & Rights > Licences

**Purpose:** Paid permissions for the offering: the right to use another's work and permits from authorities, e.g. Licensed artwork, Backing track, Patented method, Parking-bay suspension.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| One-time, Annually, Per unit | Cost option and billing type | None |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Documents & Rights. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Insurances, Licences, Royalties, Certificates, Tickets & Trip Costs | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Revenue Partners, Accreditation Bodies (partners); Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Cost option<br>Billing type | Cost option<br>Billing type | Select<br>None (shown) | Dropdown<br>Read-only text | Required / Automatic | **Cost option:** Initial operating licence (Lump sum); Annual renewal (Fixed amount)<br>**Billing type:** Percentage, Fixed amount or Lump sum, locked by the option; it locks the Frequency | One choice routes the cost |
| 10 | Qty<br>Price<br>Currency<br>Frequency<br>Unit | Qty<br>Price<br>(none)<br>Frequency<br>(none) | Type<br>Type<br>Select<br>Select<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown<br>Dropdown, no label | Optional / Required / Automatic / Required / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Shown when the status is Costs. One-time, Annually, Per unit<br>**Unit:** Shown when Frequency is Per unit. seat, licence, user, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 11 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 12 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| One-time | Step | One-time OpEx (an initial permit) | Startup Expense (one-time): written off, never capitalised |
| Annually | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |
| Per unit | Variable | COGS | Startup Expense (one-time): written off, never capitalised |

##### Offering > Resources > Documents & Rights > Royalties

**Purpose:** Payments that follow the sales or use of another's creation, e.g. Author royalty, Franchise percentage, Patent share, Master-rights split.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| % of Rev, Monthly, Annually, One-time | Cost option and billing type | None |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Documents & Rights. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Insurances, Licences, Royalties, Certificates, Tickets & Trip Costs | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Revenue Partners, Accreditation Bodies (partners); Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Cost option<br>Billing type | Cost option<br>Billing type | Select<br>None (shown) | Dropdown<br>Read-only text | Required / Automatic | **Cost option:** Royalty on sales (Percentage); Fixed royalty (Fixed amount); Upfront franchise or master licence fee (Lump sum)<br>**Billing type:** Percentage, Fixed amount or Lump sum, locked by the option; it locks the Frequency | One choice routes the cost |
| 10 | Qty<br>Price<br>Currency<br>Frequency | Qty<br>Price<br>(none)<br>Frequency | Type<br>Type<br>Select<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown | Optional / Required / Automatic / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Shown when the status is Costs. % of Rev, Monthly, Annually, One-time | One line. A card without a price is incomplete: red glow, left out of every total |
| 11 | Rate override | Rate override | Type | Number box (%) | Optional | Shown when the billing type is Percentage; the default comes from Global Settings | A special contract may differ |
| 12 | Amortisation period | Amortisation period | Type | Number box (years) | Required | Usually 5 to 10 | It spreads the cost of an intangible asset |
| 13 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 14 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| % of Rev | Variable | COGS: a calculated line linked to the revenue | COGS: a calculated line (a fee on pre-sales is never charged to the startup fund) |
| Monthly | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |
| Annually | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |
| One-time | Step | An intangible asset amortised from the purchase date (an upfront franchise or master licence fee); a set-up fee is a one-time OpEx | An intangible asset amortised from the Opening Date, or a Start-up expense by its cost option |

##### Offering > Resources > Documents & Rights > Certificates

**Purpose:** Certificates, inspections and the tests behind them, needed to sell or use an offering, e.g. CE-mark testing, Organic certification, Flame trial, Food-safety swab.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per project, Annually | None | Accreditation Bodies. Inputs: issued by, valid until, outcome (certificate, test report, permit) |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** The date the document expires | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Documents & Rights. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Insurances, Licences, Royalties, Certificates, Tickets & Trip Costs | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Revenue Partners, Accreditation Bodies (partners); Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency | Qty<br>Price<br>(none)<br>Frequency | Type<br>Type<br>Select<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown | Optional / Required / Automatic / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Shown when the status is Costs. Per project, Annually | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Payment Plan<br>Plan | Payment Plan<br>(none) | Tick<br>Select | Checkbox<br>Dropdown, no label | Optional / Required | **Payment Plan:** Shown when the Frequency is Per project. Unticked means paid in full. Ticking it opens the plan<br>**Plan:** Shown when ticked: Deposit & Balance; Instalments; Milestones | It decides when the cash leaves, not the cost |
| 11 | Deposit %<br>Balance date | Deposit %<br>Balance date | Type<br>Pick a date | Number box (%)<br>Calendar | Required / Required | **Deposit %:** Shown for Deposit & Balance. The share paid at the Start date; the rest is the balance<br>**Balance date:** Shown for Deposit & Balance. Defaults to the End date; it can be any date, for example a stage | Two dates: the first is the Start date |
| 12 | Instalments<br>Instalment lines | Instalments<br>Instalment lines | Type<br>Pick a date | Number box (whole numbers)<br>Calendars and number boxes | Required / Automatic | **Instalments:** Shown for Instalments. The number of fixed payments between the Start and End dates; both dates are needed<br>**Instalment lines:** The app sets equal dates and amounts; the user may move the dates and edit or round the amounts | Equal payments over the period, adjustable |
| 13 | Milestone<br>Milestone %<br>Milestone date<br>+ | Milestone<br>Milestone %<br>Milestone date<br>+ | Type<br>Type<br>Pick a date<br>Click | Text box<br>Number box (%)<br>Calendar<br>Button | Required / Required / Required / Button | **Milestone:** Shown for Milestones. The title of a stage; more detail goes in the Description<br>**Milestone %:** The share paid at this stage<br>**Milestone date:** Set by the user, beside the %<br>**+:** Adds another milestone, until the total is 100% | Payment tied to stages of the work |
| 14 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** The outcome (certificate, test report, permit) and any other detail may be written here. The issuing body or inspector is added with +, as a supplier<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 15 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per project | Step (a job-sized amount) | COGS | Startup Expense (one-time): written off, never capitalised |
| Annually | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

##### Offering > Resources > Documents & Rights > Tickets & Trip Costs

**Purpose:** The fares, stops and tolls of trips that the work requires, e.g. Coach ticket, Ferry crossing, Toll bridge, Loading-bay fee.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per unit, Per project | None | channel template T7 creates this card for travel |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Documents & Rights. Changing it moves the card | Places the card in its tile |
| 4 | Group | Group | Select | Dropdown | Required | Insurances, Licences, Royalties, Certificates, Tickets & Trip Costs | The group sets the defaults of the card |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Activity; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Revenue Partners, Accreditation Bodies (partners); Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency<br>Unit | Qty<br>Price<br>(none)<br>Frequency<br>(none) | Type<br>Type<br>Select<br>Select<br>Select | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown<br>Dropdown, no label | Optional / Required / Automatic / Required / Required | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Shown when the status is Costs. Per unit, Per project<br>**Unit:** Shown when Frequency is Per unit. trip, ticket, night, person, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Payment Plan<br>Plan | Payment Plan<br>(none) | Tick<br>Select | Checkbox<br>Dropdown, no label | Optional / Required | **Payment Plan:** Shown when the Frequency is Per project. Unticked means paid in full. Ticking it opens the plan<br>**Plan:** Shown when ticked: Deposit & Balance; Instalments; Milestones | It decides when the cash leaves, not the cost |
| 11 | Deposit %<br>Balance date | Deposit %<br>Balance date | Type<br>Pick a date | Number box (%)<br>Calendar | Required / Required | **Deposit %:** Shown for Deposit & Balance. The share paid at the Start date; the rest is the balance<br>**Balance date:** Shown for Deposit & Balance. Defaults to the End date; it can be any date, for example a stage | Two dates: the first is the Start date |
| 12 | Instalments<br>Instalment lines | Instalments<br>Instalment lines | Type<br>Pick a date | Number box (whole numbers)<br>Calendars and number boxes | Required / Automatic | **Instalments:** Shown for Instalments. The number of fixed payments between the Start and End dates; both dates are needed<br>**Instalment lines:** The app sets equal dates and amounts; the user may move the dates and edit or round the amounts | Equal payments over the period, adjustable |
| 13 | Milestone<br>Milestone %<br>Milestone date<br>+ | Milestone<br>Milestone %<br>Milestone date<br>+ | Type<br>Type<br>Pick a date<br>Click | Text box<br>Number box (%)<br>Calendar<br>Button | Required / Required / Required / Button | **Milestone:** Shown for Milestones. The title of a stage; more detail goes in the Description<br>**Milestone %:** The share paid at this stage<br>**Milestone date:** Set by the user, beside the %<br>**+:** Adds another milestone, until the total is 100% | Payment tied to stages of the work |
| 14 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 15 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per unit | Variable | COGS | Startup Expense (one-time): written off, never capitalised |
| Per project | Variable (grows with the number of jobs) | COGS | Startup Expense (one-time): written off, never capitalised |

#### Category: Human Resources

##### Offering > Resources > Human Resources > Delivery Team

**Purpose:** The people who make the product or serve the customer, e.g. Weaver, Instructor, Installer, Barista.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Monthly, Per unit | Commission; Bonus | None |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Resource name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Category | Category | Select | Dropdown | Required | The categories of this place; this card is in Human Resources. Changing it moves the card | Places the card in its tile |
| 4 | Group | Delivery Team | None | Subtitle (text) | Automatic | “Delivery Team”, shown directly under the Category | A dropdown with one option is not used |
| 5 | Status<br>+ | Status<br>+ | Select<br>Click | Dropdown<br>Button | Required / Button | **Status:** Exists / Free; Partners & Suppliers; Needs Activity; Needs Investigation; Costs. The first status shows the options of this card; Buy or Costs shows the price<br>**+:** Adds another status row below | The price matters only when the card is a cost; a card can depend on several things |
| 6 | Category<br>Group<br>Name<br>Link symbol | Category<br>Group<br>Name<br>🔗 | Select<br>Select<br>Select<br>Click | Dropdown<br>Dropdown<br>Dropdown, with “Other…”<br>Link | Required / Required / Required / Automatic | **Category:** Shown when the status is Partners & Suppliers: Partners or Suppliers<br>**Group:** The groups of that category in this place: Revenue Partners, Accreditation Bodies (partners); Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments (suppliers)<br>**Name:** The cards of the chosen group, or a new card made with “Other…”<br>**Link symbol:** Beside the chosen name; a click opens the card | Three steps lead to the exact card: category, group, name |
| 7 | Activity<br>Link symbol | Activity<br>🔗 | Select<br>Click | Dropdown, with “Other…”<br>Link | Required / Automatic | **Activity:** Shown when the status is Needs Activity. The activities that have not ended at this card's Start date, with their category; an ended activity or category cannot be selected. When there is none, the list holds only “Other…”, which creates a new activity<br>**Link symbol:** Beside the chosen activity; a click opens it | The card is used by an activity |
| 8 | Status<br>Remove × | Status<br>× | Select<br>Click | Dropdown<br>Button | Optional / Button | **Status:** Added by +; the same options. Its own Category, Group, Name or Activity cells follow it, as above<br>**Remove ×:** Removes this status row and the cells that follow it | A card can depend on several things |
| 9 | Qty<br>Price<br>Currency<br>Frequency<br>Unit | Qty<br>Price<br>(none)<br>Frequency<br>hour | Type<br>Type<br>Select<br>Select<br>None (shown) | Number box (whole numbers, with decimals only when the unit is hour, metre, litre or kWh)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown<br>Read-only text | Optional / Required / Automatic / Required / Automatic | **Qty:** The number of identical items or people; a new card starts at 1. Total = Qty × price<br>**Price:** Shown when the status is Costs. The gross salary of one person; employer on-costs are a calculated line<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Shown when the status is Costs. Monthly, Per unit<br>**Unit:** hour. Shown when Frequency is Per unit; one option besides “unit”, so it is text | One line. A card without a price is incomplete: red glow, left out of every total |
| 10 | Allowance<br>Frequency | Allowance<br>Monthly | Type<br>None (shown) | Number box<br>Read-only text | Optional / Automatic | **Allowance:** An allowance given to people who work from home<br>**Frequency:** Monthly | The allowance is a payment to the person, so it sits on the people cards |
| 11 | Extra: Commission | Commission | Tick, then type | Checkbox and number box | Optional | A share of sales paid to the person (frequency % of Rev) | It depends on this one card, so it sits here |
| 12 | Extra: Bonus | Bonus | Tick, then type | Checkbox and number box | Optional | A payment above pay (frequency Annually) | It depends on this one card, so it sits here |
| 13 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 14 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Monthly | Fixed | COGS | Pre-Operating Expense (time-dependent): written off, never capitalised |
| Per unit | Variable | COGS | Startup Expense (one-time): written off, never capitalised |

#### Activities

##### Offering > Activities > Production

**What it holds:** Making the offering: a production run linking machinery, materials, people and a contractor.

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Activity name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** From the Plan Start (before and after the opening). Inside the limits of its category<br>**End date:** Not before the start date, and inside the limits of its category. Left empty, the activity counts as one day | Placed after the name; set by the user |
| 3 | Group | Group | Select | Dropdown | Required | Production (Plan Start onward); Marketing (Plan Start onward); Sales & Customer (Opening Date onward). Each category shows its period, taken from the Plan Start and the Opening Date | The group files the activity; it gives no cost nature to anything linked |
| 4 | Performer<br>Link symbol<br>+ | Performer<br>🔗<br>+ | Select<br>Click<br>Click | Dropdown<br>Link<br>Button | Required / Automatic / Button | **Performer:** Founders first, then partners and suppliers of the same place. When a performer card stands for several people, a number box picks how many take part, never more than the card holds<br>**Link symbol:** Beside a partner or supplier; a click opens its card<br>**+:** Adds another performer | Someone must carry it out |
| 5 | Resources<br>Resource<br>Units<br>Link symbol<br>+ | Resources<br>Resource<br>Units<br>🔗<br>+ | Tick<br>Select<br>Type<br>Click<br>Click | Checkbox<br>Dropdown<br>Number box (whole numbers)<br>Link<br>Button | Optional / Required / Optional / Automatic / Button | **Resources:** Ticking it opens the resource list<br>**Resource:** Shown when ticked: the resources of the place. A linked card's start date cannot be after the activity's start date when the activity has no end date, or after its end date when it has one<br>**Units:** Shown beside a resource that has units, never more than the resource has<br>**Link symbol:** Beside the resource; a click opens its card<br>**+:** Adds another resource | An activity depends on the resources it uses |
| 6 | Cost | Cost | None (shown) | Read-only text | Automatic | Shown after the last linked resource, with the estimated cost of each. It is named Total when more than 2 linked cards carry values. The card holds no price and no quantity | It presents; it does not hold |
| 7 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must answer for it |
| 8 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 9 | Linked to | Linked to | Tick | Checkboxes, one per offering | Optional | The offerings the activity serves | Connects the activity to its offerings |
| 10 | Completed | Completed | Tick | Checkbox | Optional | Ticking it freezes the card and files it under the grey Completed tile; All Tiles hides it by default | Closes finished work |

###### Behind the scenes (not shown on the card)

The activity card carries no cost and no cost nature, and no card takes its cost nature from it. The group is only a filing and a date rule. For reference, the nature usually met in that group: COGS.

##### Offering > Activities > Marketing

**What it holds:** Advertising and promotion: a campaign, a promotional event.

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Activity name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** From the Plan Start (before and after the opening). Inside the limits of its category<br>**End date:** Not before the start date, and inside the limits of its category. Left empty, the activity counts as one day | Placed after the name; set by the user |
| 3 | Group | Group | Select | Dropdown | Required | Production (Plan Start onward); Marketing (Plan Start onward); Sales & Customer (Opening Date onward). Each category shows its period, taken from the Plan Start and the Opening Date | The group files the activity; it gives no cost nature to anything linked |
| 4 | Performer<br>Link symbol<br>+ | Performer<br>🔗<br>+ | Select<br>Click<br>Click | Dropdown<br>Link<br>Button | Required / Automatic / Button | **Performer:** Founders first, then partners and suppliers of the same place. When a performer card stands for several people, a number box picks how many take part, never more than the card holds<br>**Link symbol:** Beside a partner or supplier; a click opens its card<br>**+:** Adds another performer | Someone must carry it out |
| 5 | Resources<br>Resource<br>Units<br>Link symbol<br>+ | Resources<br>Resource<br>Units<br>🔗<br>+ | Tick<br>Select<br>Type<br>Click<br>Click | Checkbox<br>Dropdown<br>Number box (whole numbers)<br>Link<br>Button | Optional / Required / Optional / Automatic / Button | **Resources:** Ticking it opens the resource list<br>**Resource:** Shown when ticked: the resources of the place. A linked card's start date cannot be after the activity's start date when the activity has no end date, or after its end date when it has one<br>**Units:** Shown beside a resource that has units, never more than the resource has<br>**Link symbol:** Beside the resource; a click opens its card<br>**+:** Adds another resource | An activity depends on the resources it uses |
| 6 | Cost | Cost | None (shown) | Read-only text | Automatic | Shown after the last linked resource, with the estimated cost of each. It is named Total when more than 2 linked cards carry values. The card holds no price and no quantity | It presents; it does not hold |
| 7 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must answer for it |
| 8 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 9 | Linked to | Linked to | Tick | Checkboxes, one per offering | Optional | The offerings the activity serves | Connects the activity to its offerings |
| 10 | Completed | Completed | Tick | Checkbox | Optional | Ticking it freezes the card and files it under the grey Completed tile; All Tiles hides it by default | Closes finished work |

###### Behind the scenes (not shown on the card)

The activity card carries no cost and no cost nature, and no card takes its cost nature from it. The group is only a filing and a date rule. For reference, the nature usually met in that group: OpEx.

##### Offering > Activities > Sales & Customer

**What it holds:** Activities for and during the sale: a trade fair, a courier route.

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Activity name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** The Opening Date or later. Inside the limits of its category<br>**End date:** Not before the start date, and inside the limits of its category. Left empty, the activity counts as one day | Placed after the name; set by the user |
| 3 | Group | Group | Select | Dropdown | Required | Production (Plan Start onward); Marketing (Plan Start onward); Sales & Customer (Opening Date onward). Each category shows its period, taken from the Plan Start and the Opening Date | The group files the activity; it gives no cost nature to anything linked |
| 4 | Performer<br>Link symbol<br>+ | Performer<br>🔗<br>+ | Select<br>Click<br>Click | Dropdown<br>Link<br>Button | Required / Automatic / Button | **Performer:** Founders first, then partners and suppliers of the same place. When a performer card stands for several people, a number box picks how many take part, never more than the card holds<br>**Link symbol:** Beside a partner or supplier; a click opens its card<br>**+:** Adds another performer | Someone must carry it out |
| 5 | Resources<br>Resource<br>Units<br>Link symbol<br>+ | Resources<br>Resource<br>Units<br>🔗<br>+ | Tick<br>Select<br>Type<br>Click<br>Click | Checkbox<br>Dropdown<br>Number box (whole numbers)<br>Link<br>Button | Optional / Required / Optional / Automatic / Button | **Resources:** Ticking it opens the resource list<br>**Resource:** Shown when ticked: the resources of the place. A linked card's start date cannot be after the activity's start date when the activity has no end date, or after its end date when it has one<br>**Units:** Shown beside a resource that has units, never more than the resource has<br>**Link symbol:** Beside the resource; a click opens its card<br>**+:** Adds another resource | An activity depends on the resources it uses |
| 6 | Cost | Cost | None (shown) | Read-only text | Automatic | Shown after the last linked resource, with the estimated cost of each. It is named Total when more than 2 linked cards carry values. The card holds no price and no quantity | It presents; it does not hold |
| 7 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must answer for it |
| 8 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 9 | Linked to | Linked to | Tick | Checkboxes, one per offering | Optional | The offerings the activity serves | Connects the activity to its offerings |
| 10 | Completed | Completed | Tick | Checkbox | Optional | Ticking it freezes the card and files it under the grey Completed tile; All Tiles hides it by default | Closes finished work |

###### Behind the scenes (not shown on the card)

The activity card carries no cost and no cost nature, and no card takes its cost nature from it. The group is only a filing and a date rule. For reference, the nature usually met in that group: COGS.

#### Partners

##### Offering > Partners > Revenue Partners > Revenue Partners

**Purpose:** Parties who sell for you or send customers, and take a cut of each sale, e.g. Boutique stockist, Distributor, Referral partner, Affiliate blogger, Co-teacher.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| % of Rev, Per project | Cost option and billing type | created by channel template T10 |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Partner name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Group | Group | Select | Dropdown | Required | Revenue Partners, Accreditation Bodies | The group sets the defaults of the card |
| 4 | Cost option<br>Billing type | Cost option<br>Billing type | Select<br>None (shown) | Dropdown<br>Read-only text | Required / Automatic | **Cost option:** Affiliate networks and influencer commissions (Percentage); Sales agents and B2B brokers (Percentage)<br>**Billing type:** Percentage, Fixed amount or Lump sum, locked by the option; it locks the Frequency | One choice routes the cost |
| 5 | Price<br>Currency<br>Frequency | Price<br>(none)<br>Frequency | Type<br>Select<br>Select | Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown | Required / Automatic / Required | **Price:** The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** % of Rev, Per project | One line. A card without a price is incomplete: red glow, left out of every total |
| 6 | Payment Plan<br>Plan | Payment Plan<br>(none) | Tick<br>Select | Checkbox<br>Dropdown, no label | Optional / Required | **Payment Plan:** Shown when the Frequency is Per project. Unticked means paid in full. Ticking it opens the plan<br>**Plan:** Shown when ticked: Deposit & Balance; Instalments; Milestones | It decides when the cash leaves, not the cost |
| 7 | Deposit %<br>Balance date | Deposit %<br>Balance date | Type<br>Pick a date | Number box (%)<br>Calendar | Required / Required | **Deposit %:** Shown for Deposit & Balance. The share paid at the Start date; the rest is the balance<br>**Balance date:** Shown for Deposit & Balance. Defaults to the End date; it can be any date, for example a stage | Two dates: the first is the Start date |
| 8 | Instalments<br>Instalment lines | Instalments<br>Instalment lines | Type<br>Pick a date | Number box (whole numbers)<br>Calendars and number boxes | Required / Automatic | **Instalments:** Shown for Instalments. The number of fixed payments between the Start and End dates; both dates are needed<br>**Instalment lines:** The app sets equal dates and amounts; the user may move the dates and edit or round the amounts | Equal payments over the period, adjustable |
| 9 | Milestone<br>Milestone %<br>Milestone date<br>+ | Milestone<br>Milestone %<br>Milestone date<br>+ | Type<br>Type<br>Pick a date<br>Click | Text box<br>Number box (%)<br>Calendar<br>Button | Required / Required / Required / Button | **Milestone:** Shown for Milestones. The title of a stage; more detail goes in the Description<br>**Milestone %:** The share paid at this stage<br>**Milestone date:** Set by the user, beside the %<br>**+:** Adds another milestone, until the total is 100% | Payment tied to stages of the work |
| 10 | Rate override | Rate override | Type | Number box (%) | Optional | Shown when the billing type is Percentage; the default comes from Global Settings | A special deal may differ |
| 11 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must coordinate the work |
| 12 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** The organisation, the contact and the terms of the agreement may be written here<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 13 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| % of Rev | Variable | COGS: a calculated line linked to the revenue | COGS: a calculated line (a fee on pre-sales is never charged to the startup fund) |
| Per project | Variable (grows with the number of jobs) | COGS | Startup Expense (one-time): written off, never capitalised |

##### Offering > Partners > Accreditation Bodies > Accreditation Bodies

**Purpose:** Bodies whose approval gives your work credibility, e.g. Weavers' guild, Craft standards panel, Culinary institute.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Annually | None | assessments and audits are Certificates cards |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Partner name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Group | Group | Select | Dropdown | Required | Revenue Partners, Accreditation Bodies | The group sets the defaults of the card |
| 4 | Price<br>Currency<br>Frequency | Price<br>(none)<br>Annually | Type<br>Select<br>None (shown) | Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text | Required / Automatic / Automatic | **Price:** The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Annually. A list with one option is shown as text | One line. A card without a price is incomplete: red glow, left out of every total |
| 5 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must coordinate the work |
| 6 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** The organisation, the contact and the terms of the agreement may be written here<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 7 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Annually | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

#### Suppliers

##### Offering > Suppliers > Producers & Wholesalers > Producers & Wholesalers

**Purpose:** Producers and wholesalers that sell the materials and parts in the product, e.g. Wool mill, Box maker, Fabric importer, Flour miller.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per unit | Minimum order; Customs duty; Clearance and handling; Other duties | feeds Materials & Stock |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Supplier name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Group | Group | Select | Dropdown | Required | Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments | The group sets the defaults of the card |
| 4 | Price<br>Currency<br>Frequency<br>Unit | Price<br>(none)<br>Per unit<br>(none) | Type<br>Select<br>None (shown)<br>Select | Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text<br>Dropdown, no label | Required / Automatic / Automatic / Required | **Price:** The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Per unit. A list with one option is shown as text<br>**Unit:** Shown when Frequency is Per unit. kg, metre, piece, order, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 5 | Extra: Minimum order | Minimum order | Tick, then type | Checkbox and number box | Optional | A floor: if a purchase is needed and the volume is below it, the month uses the minimum; the excess carries over as stock (frequency Per unit (minimum)) | It depends on this one card, so it sits here |
| 6 | Extra: Customs duty | Customs duty | Tick, then type | Checkbox and number box | Optional | Customs value × the duty rate of the tariff code (frequency % of cost) | It depends on this one card, so it sits here |
| 7 | Extra: Clearance and handling | Clearance and handling | Tick, then type | Checkbox and number box | Optional | Customs-broker, port and inspection fees (frequency Per project (shipment)) | It depends on this one card, so it sits here |
| 8 | Extra: Other duties | Other duties | Tick, then type | Checkbox and number box | Optional | Excise, anti-dumping and levies (frequency % of cost or Per unit) | It depends on this one card, so it sits here |
| 9 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must coordinate the work |
| 10 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** The supplier, the contact, the terms and the lead time may be written here<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 11 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per unit | Variable | COGS | Startup Expense (one-time): written off, never capitalised |

##### Offering > Suppliers > Logistics & Fulfilment > Logistics & Fulfilment

**Purpose:** Carriers and warehouses that deliver orders to buyers, e.g. Courier, National post, Fulfilment centre, Freight forwarder.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per unit, Monthly | Cost options, one per card | created by channel template T9 with the price blank |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Supplier name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Group | Group | Select | Dropdown | Required | Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments | The group sets the defaults of the card |
| 4 | Cost options | Cost options | Select | Dropdown | Required | Flat per parcel; By weight or zone; Monthly flat fee; Fulfilment per item. The fuel surcharge and account fee are part of the price entered | A courier or a campaign is priced one way per card |
| 5 | Price<br>Currency<br>Frequency<br>Unit | Price<br>(none)<br>Frequency<br>(none) | Type<br>Select<br>Select<br>Select | Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown<br>Dropdown, no label | Required / Automatic / Required / Required | **Price:** The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Per unit, Monthly<br>**Unit:** Shown when Frequency is Per unit. parcel, pallet, order, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 6 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must coordinate the work |
| 7 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** The supplier, the contact, the terms and the lead time may be written here<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 8 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per unit | Variable | COGS | Startup Expense (one-time): written off, never capitalised |
| Monthly | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

Semi-variable when a percentage and a fixed part are both present on the card.

##### Offering > Suppliers > Contractors & Advisers > Contractors & Advisers

**Purpose:** Outsourced specialists who do part of an offering's job or guide it, e.g. Dye works, Freelance developer, Product-safety adviser, Electrician.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per project, Per unit | None | Outsourced work on an offering |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Supplier name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Group | Group | Select | Dropdown | Required | Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments | The group sets the defaults of the card |
| 4 | Price<br>Currency<br>Frequency<br>Unit | Price<br>(none)<br>Frequency<br>(none) | Type<br>Select<br>Select<br>Select | Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown<br>Dropdown, no label | Required / Automatic / Required / Required | **Price:** The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Per project, Per unit<br>**Unit:** Shown when Frequency is Per unit. hour, day, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 5 | Payment Plan<br>Plan | Payment Plan<br>(none) | Tick<br>Select | Checkbox<br>Dropdown, no label | Optional / Required | **Payment Plan:** Shown when the Frequency is Per project. Unticked means paid in full. Ticking it opens the plan<br>**Plan:** Shown when ticked: Deposit & Balance; Instalments; Milestones | It decides when the cash leaves, not the cost |
| 6 | Deposit %<br>Balance date | Deposit %<br>Balance date | Type<br>Pick a date | Number box (%)<br>Calendar | Required / Required | **Deposit %:** Shown for Deposit & Balance. The share paid at the Start date; the rest is the balance<br>**Balance date:** Shown for Deposit & Balance. Defaults to the End date; it can be any date, for example a stage | Two dates: the first is the Start date |
| 7 | Instalments<br>Instalment lines | Instalments<br>Instalment lines | Type<br>Pick a date | Number box (whole numbers)<br>Calendars and number boxes | Required / Automatic | **Instalments:** Shown for Instalments. The number of fixed payments between the Start and End dates; both dates are needed<br>**Instalment lines:** The app sets equal dates and amounts; the user may move the dates and edit or round the amounts | Equal payments over the period, adjustable |
| 8 | Milestone<br>Milestone %<br>Milestone date<br>+ | Milestone<br>Milestone %<br>Milestone date<br>+ | Type<br>Type<br>Pick a date<br>Click | Text box<br>Number box (%)<br>Calendar<br>Button | Required / Required / Required / Button | **Milestone:** Shown for Milestones. The title of a stage; more detail goes in the Description<br>**Milestone %:** The share paid at this stage<br>**Milestone date:** Set by the user, beside the %<br>**+:** Adds another milestone, until the total is 100% | Payment tied to stages of the work |
| 9 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must coordinate the work |
| 10 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** The supplier, the contact, the terms and the lead time may be written here<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 11 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per project | Variable (grows with the number of jobs) | COGS | Startup Expense (one-time): written off, never capitalised |
| Per unit | Variable | COGS | Startup Expense (one-time): written off, never capitalised |

##### Offering > Suppliers > Agencies & Influencers > Agencies & Influencers

**Purpose:** Firms and creators paid to spread the word, e.g. Marketing agency, Instagram creator, Poster press, Podcast sponsor.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per project, Monthly | Cost options, one per card | created by channel template T4 with the price blank |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Supplier name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Group | Group | Select | Dropdown | Required | Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments | The group sets the defaults of the card |
| 4 | Cost options | Cost options | Select | Dropdown | Required | Campaign fee; Monthly budget; Retainer; Per post. Campaign details: objective, platform, dates, audience, target result may be written in the Description | A courier or a campaign is priced one way per card |
| 5 | Price<br>Currency<br>Frequency | Price<br>(none)<br>Frequency | Type<br>Select<br>Select | Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown | Required / Automatic / Required | **Price:** The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Per project, Monthly | One line. A card without a price is incomplete: red glow, left out of every total |
| 6 | Payment Plan<br>Plan | Payment Plan<br>(none) | Tick<br>Select | Checkbox<br>Dropdown, no label | Optional / Required | **Payment Plan:** Shown when the Frequency is Per project. Unticked means paid in full. Ticking it opens the plan<br>**Plan:** Shown when ticked: Deposit & Balance; Instalments; Milestones | It decides when the cash leaves, not the cost |
| 7 | Deposit %<br>Balance date | Deposit %<br>Balance date | Type<br>Pick a date | Number box (%)<br>Calendar | Required / Required | **Deposit %:** Shown for Deposit & Balance. The share paid at the Start date; the rest is the balance<br>**Balance date:** Shown for Deposit & Balance. Defaults to the End date; it can be any date, for example a stage | Two dates: the first is the Start date |
| 8 | Instalments<br>Instalment lines | Instalments<br>Instalment lines | Type<br>Pick a date | Number box (whole numbers)<br>Calendars and number boxes | Required / Automatic | **Instalments:** Shown for Instalments. The number of fixed payments between the Start and End dates; both dates are needed<br>**Instalment lines:** The app sets equal dates and amounts; the user may move the dates and edit or round the amounts | Equal payments over the period, adjustable |
| 9 | Milestone<br>Milestone %<br>Milestone date<br>+ | Milestone<br>Milestone %<br>Milestone date<br>+ | Type<br>Type<br>Pick a date<br>Click | Text box<br>Number box (%)<br>Calendar<br>Button | Required / Required / Required / Button | **Milestone:** Shown for Milestones. The title of a stage; more detail goes in the Description<br>**Milestone %:** The share paid at this stage<br>**Milestone date:** Set by the user, beside the %<br>**+:** Adds another milestone, until the total is 100% | Payment tied to stages of the work |
| 10 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must coordinate the work |
| 11 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** The supplier, the contact, the terms and the lead time may be written here<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 12 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per project | Variable (grows with the number of jobs) | COGS | Startup Expense (one-time): written off, never capitalised |
| Monthly | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

##### Offering > Suppliers > Venues & Organisers > Venues & Organisers

**Purpose:** Hosts of the places and events where you sell, e.g. Fair organiser, Exhibition hall, Show promoter.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Per project | None | Site Hire |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Supplier name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Group | Group | Select | Dropdown | Required | Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments | The group sets the defaults of the card |
| 4 | Price<br>Currency<br>Frequency | Price<br>(none)<br>Per project | Type<br>Select<br>None (shown) | Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text | Required / Automatic / Automatic | **Price:** The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Per project. A list with one option is shown as text | One line. A card without a price is incomplete: red glow, left out of every total |
| 5 | Payment Plan<br>Plan | Payment Plan<br>(none) | Tick<br>Select | Checkbox<br>Dropdown, no label | Optional / Required | **Payment Plan:** Shown when the Frequency is Per project. Unticked means paid in full. Ticking it opens the plan<br>**Plan:** Shown when ticked: Deposit & Balance; Instalments; Milestones | It decides when the cash leaves, not the cost |
| 6 | Deposit %<br>Balance date | Deposit %<br>Balance date | Type<br>Pick a date | Number box (%)<br>Calendar | Required / Required | **Deposit %:** Shown for Deposit & Balance. The share paid at the Start date; the rest is the balance<br>**Balance date:** Shown for Deposit & Balance. Defaults to the End date; it can be any date, for example a stage | Two dates: the first is the Start date |
| 7 | Instalments<br>Instalment lines | Instalments<br>Instalment lines | Type<br>Pick a date | Number box (whole numbers)<br>Calendars and number boxes | Required / Automatic | **Instalments:** Shown for Instalments. The number of fixed payments between the Start and End dates; both dates are needed<br>**Instalment lines:** The app sets equal dates and amounts; the user may move the dates and edit or round the amounts | Equal payments over the period, adjustable |
| 8 | Milestone<br>Milestone %<br>Milestone date<br>+ | Milestone<br>Milestone %<br>Milestone date<br>+ | Type<br>Type<br>Pick a date<br>Click | Text box<br>Number box (%)<br>Calendar<br>Button | Required / Required / Required / Button | **Milestone:** Shown for Milestones. The title of a stage; more detail goes in the Description<br>**Milestone %:** The share paid at this stage<br>**Milestone date:** Set by the user, beside the %<br>**+:** Adds another milestone, until the total is 100% | Payment tied to stages of the work |
| 9 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must coordinate the work |
| 10 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** The supplier, the contact, the terms and the lead time may be written here<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 11 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Per project | Step (a job-sized amount) | COGS | Startup Expense (one-time): written off, never capitalised |

##### Offering > Suppliers > Landlords, Leasing & Warehouses > Landlords, Leasing & Warehouses

**Purpose:** Owners of premises used for making or storing stock, and lessors of vehicles, e.g. Estate owner, Depot firm, Chilled-storage outfit, Van lessor.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| Monthly | Deposit; Service charge; Commercial property tax; Handling per pallet; Road tax (by what is connected) | holds the rent of a rented Workshop & Storage card, or the lease of a Delivery Vehicles card, and shows the link to it |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Supplier name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Group | Group | Select | Dropdown | Required | Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments | The group sets the defaults of the card |
| 4 | Qty<br>Price<br>Currency<br>Frequency | Qty<br>Price<br>(none)<br>Monthly | Type<br>Type<br>Select<br>None (shown) | Number box (whole numbers)<br>Number box (decimal)<br>Searchable dropdown, no label<br>Read-only text | Required / Required / Automatic / Automatic | **Qty:** Shown when a vehicle is connected. The number of vehicles leased; placed before the price<br>**Price:** The rent or lease of the connected space or vehicle<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** Monthly. A list with one option is shown as text | One line. A card without a price is incomplete: red glow, left out of every total |
| 5 | Extra: Deposit | Deposit | Tick, then type | Checkbox and number box | Optional | A refundable sum held until the space is returned (frequency One-time). Appears when a Workshop & Storage card is connected | It depends on the connected workspace |
| 6 | Extra: Service charge | Service charge | Tick, then type | Checkbox and number box | Optional | Shared services beside the rent (frequency Monthly). Appears when a Workshop & Storage card is connected | It depends on the connected workspace |
| 7 | Extra: Commercial property tax | Commercial property tax | Tick, then type | Checkbox and number box | Optional | The local tax on commercial premises (frequency Annually). Appears when a Workshop & Storage card is connected | It depends on the connected workspace |
| 8 | Extra: Handling per pallet | Handling per pallet | Tick, then type | Checkbox and number box | Optional | The charge for each pallet moved in or out (frequency Per unit (pallet)). Appears when a Workshop & Storage card is connected | It depends on the connected workspace |
| 9 | Extra: Road tax | Road tax | Tick, then type | Checkbox and number box | Optional | The yearly tax for using a leased vehicle (frequency Annually). Appears when a Delivery Vehicles card is connected | A leased vehicle has no utilities or property tax, so only the road tax shows |
| 10 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must coordinate the work |
| 11 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** The supplier, the contact, the terms and the lead time may be written here<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 12 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| Monthly | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

##### Offering > Suppliers > Platforms & Payments > Platforms & Payments

**Purpose:** Intermediaries between you and the customer who charge a fee, e.g. Online marketplace, Payment processor, App store, Reservation portal.

| Frequencies offered | Extras or options | Links and generated cards |
|---|---|---|
| % of Rev, Per unit, Monthly | Cost option and billing type | the rates come from the Channel Fee Table; created by channel templates T2 and T3 |

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Supplier name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Start date<br>End date | Start date<br>End date | Pick a date<br>Pick a date | Calendar<br>Calendar | Required / Optional | **Start date:** Places the cost in a month of the cash flow<br>**End date:** When a subscription or lease ends, or an asset is sold (depreciation stops) | Placed after the name; places the cost in time |
| 3 | Group | Group | Select | Dropdown | Required | Producers & Wholesalers, Logistics & Fulfilment, Contractors & Advisers, Agencies & Influencers, Venues & Organisers, Landlords, Leasing & Warehouses, Platforms & Payments | The group sets the defaults of the card |
| 4 | Cost option<br>Billing type | Cost option<br>Billing type | Select<br>None (shown) | Dropdown<br>Read-only text | Required / Automatic | **Cost option:** Payment gateway (Percentage); Marketplace or delivery platform (Percentage); SaaS e-commerce platform (Fixed amount)<br>**Billing type:** Percentage, Fixed amount or Lump sum, locked by the option; it locks the Frequency | One choice routes the cost |
| 5 | Price<br>Currency<br>Frequency<br>Unit | Price<br>(none)<br>Frequency<br>(none) | Type<br>Select<br>Select<br>Select | Number box (decimal)<br>Searchable dropdown, no label<br>Dropdown<br>Dropdown, no label | Required / Automatic / Required / Required | **Price:** The price of one unit, one item or one period<br>**Currency:** The user may change it. The organisation's currency by default<br>**Frequency:** % of Rev, Per unit, Monthly<br>**Unit:** Shown when Frequency is Per unit. order, transaction, unit. The list follows the group and always includes “unit” | One line. A card without a price is incomplete: red glow, left out of every total |
| 6 | Responsible | Responsible | Tick, then select | Checkbox, then a dropdown of founders | Required | Hidden when there is one founder | Someone must coordinate the work |
| 7 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** The supplier, the contact, the terms and the lead time may be written here<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |
| 8 | Linked to | Linked to | Tick, then type | Checkboxes, with a number box (%) beside each when more than one is ticked | Required | The percentages must total 100%, or the card glows red and is not saved. Example: a monthly cost of 1,000 at 70% and 30% sends 700 and 300 to the two offerings | The cost is attributed to each product, so the profitability of each is exact |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| % of Rev | Variable | COGS: a calculated line linked to the revenue | COGS: a calculated line (a fee on pre-sales is never charged to the startup fund) |
| Per unit | Variable | COGS | Startup Expense (one-time): written off, never capitalised |
| Monthly | Fixed | OpEx | Pre-Operating Expense (time-dependent): written off, never capitalised |

Semi-variable when a percentage and a fixed part are both present on the card.

### Channel cards

#### How a channel-made card looks in the app

The app has no per-template cards yet: the only generator on page 2 is the “+ Add expenses” button of a channel. It makes one blank Resource card in Offering > Resources, linked to the channel. Name, price, frequency and status are all empty. On page 3 the card is teal and has these differences from a card the user makes:

- The name is not typed on page 3: it is a button that opens the channel on page 2, where the name is edited.
- There is no × (remove); the card is removed from the channel cell on page 2, which also removes it from page 3.
- There is no Category row (the Category tile is “Channel”) and the Group is “Channel”, not a group of the list above.
- Status, Qty, price, Frequency, Linked to and Description behave as on any Offering resource.
- On page 2 the channel shows the card with its name, its cost button (for example “£150 a month” or “No cost yet”) and its linked actions.

#### What the templates below would add

A card made from a channel template would have the layout of its group's card above. It would differ only in two ways: its price is blank, so it is incomplete until priced, and it carries a link to the channel and its actions, with the channel's colour. The user can also create the same card directly, with no channel at all: the channel link is an extra, not a condition. The link to the channel is shown as the link symbol 🔗 beside the name, like every other link.

| No. | Template | Group whose card layout it uses |
|---|---|---|
| T1 | Platform or tool subscription | Offering > Resources > Digital Infrastructure > Sales & Delivery Tools |
| T2 | Payment processing fees | Offering > Suppliers > Platforms & Payments |
| T3 | Marketplace fees and commission | Offering > Suppliers > Platforms & Payments |
| T4 | Ads and influencers | Offering > Suppliers > Agencies & Influencers |
| T5 | Stall, pitch, stand or event fee | Offering > Resources > Workspace > Site Hire |
| T6 | Display kit or hardware | Offering > Resources > Equipment > Devices & Tools |
| T7 | Travel and van hire | Offering > Resources > Documents & Rights > Tickets & Trip Costs; Offering > Resources > Vehicles > Delivery Vehicles |
| T8 | Packaging and samples | Offering > Resources > Materials & Inventory > Materials & Stock |
| T9 | Courier, postal, fulfilment | Offering > Suppliers > Logistics & Fulfilment |
| T10 | Referral or reseller commission | Offering > Partners > Revenue Partners |
| T12 | Event or transit insurance | Offering > Resources > Documents & Rights > Insurances |

### Legal Entity expense card

Shown in All Tiles under “Legal expenses”. It records registrations and their expenses only. It belongs to the company, not to an offering, so it has no Linked to row. Insurance, licences and certificates are cards of Documents & Rights.

| # | Field, left to right | Label shown | Action | Function | Status | What it contains | Why |
|---|---|---|---|---|---|---|---|
| 1 | Number<br>Name<br>Remove × | Number<br>Name<br>× | None (shown)<br>Type<br>Click | Read-only number<br>Text box<br>Button | Automatic / Required / Button | **Number:** The card number<br>**Name:** The name of the card (“Expense name”)<br>**Remove ×:** Removes the card | A card without a name cannot be found or linked |
| 2 | Date | Date | Pick a date | Calendar | Required | Places the cost in a month of the cash flow | Placed after the name |
| 3 | Cost<br>Frequency | Cost<br>Frequency | Type<br>Select | Number box<br>Dropdown | Required / Required | **Cost:** The label carries the organisation's currency<br>**Frequency:** One time; Monthly; Annually | The amount and how often it recurs |
| 4 | Responsibility | Responsibility | Select | Dropdown of founders | Required | Shown when there is more than one founder. Hidden when there is one founder | Someone answers for it |
| 5 | Linked registration | Linked registration | Select | Dropdown | Required | The registration and tax numbers and the requirements already recorded on the page. Only one can be chosen | Every expense pays for one registration |
| 6 | Notes<br>Record date and time<br>Add Date | Notes<br>Record date and time<br>Add Date | Type<br>None (shown)<br>Click | Text box, auto-growing, opened by a tick<br>Read-only text<br>Button | Optional / Automatic / Button | **Notes:** A note; nothing is calculated from it<br>**Record date and time:** Each note is stamped with the date and time it was recorded<br>**Add Date:** Adds a date to the note | A dated note |

###### Behind the scenes (not shown on the card)

| Frequency | Behaviour | Cost nature from the opening | Cost nature before the opening |
|---|---|---|---|
| One time | Step | OpEx | Start-up expense |
| Monthly, Annually | Fixed | OpEx | Start-up expense |

### Task 1: resources linked to partners and suppliers of the same place

Each resource group is matched with the groups of partners and suppliers it can use, in the same place. These are the groups offered in the Group step of the status (Partners & Suppliers), and the groups whose Name list opens when the link is chosen. A proposal, to confirm.

#### Infrastructure

| Resource group | Partner and supplier groups it can link to |
|---|---|
| Premises | Property, Vehicles & Facilities (Rent: its card holds the rent and extras); Technical Support (repairs and inspections) |
| Premises Utilities | Property, Vehicles & Facilities; Goods & Equipment |
| Furniture & Fittings | Goods & Equipment (bought or leased) |
| Devices & Tools | Goods & Equipment (bought or leased); Technical Support (repair, set-up) |
| Company Vehicles | Property, Vehicles & Facilities (lease); Goods & Equipment (dealer); Technical Support (servicing) |
| Vehicle Running Costs | Goods & Equipment (fuel and supplies); it is also tied to its vehicle |
| Software & Web | Creative & IT Services (a custom build, linked to the asset); Goods & Equipment (licence vendor) |
| Cloud & Security | Creative & IT Services; Technical Support |
| Business Consumables | Goods & Equipment |
| Insurances | Business Services (broker, insurer) |
| Licences | Business Services (agent, lawyer); Alliances & Networks (a membership licence) |
| Certificates | Technical Support (inspection, testing); Business Services |
| Tickets & Trip Costs | Business Services (travel agents) |
| Admin Team | Business Services (payroll, recruiter); Alliances & Networks (shared staff) |
| Founders & Owners | None: the people are the founders |

#### Offering

| Resource group | Partner and supplier groups it can link to |
|---|---|
| Site Hire | Venues & Organisers |
| Workshop & Storage | Landlords, Leasing & Warehouses (Rent); Contractors & Advisers (repairs) |
| Process Utilities | No direct connection |
| Fixtures & Displays | Producers & Wholesalers (bought); Contractors & Advisers (made or installed) |
| Production Machinery | Producers & Wholesalers (the machine); Contractors & Advisers (its installation, linked to the asset). Gap: leasing a machine has no supplier group |
| Devices & Tools | Producers & Wholesalers; Contractors & Advisers |
| Delivery Vehicles | Landlords, Leasing & Warehouses (lease); Contractors & Advisers (servicing) |
| Delivery Running Costs | No direct connection; it is tied to its vehicle |
| Sales & Delivery Tools | Platforms & Payments (e-commerce platform); Contractors & Advisers |
| Platforms & APIs | Platforms & Payments |
| Materials & Stock | Producers & Wholesalers; Logistics & Fulfilment (delivery of stock) |
| Insurances | Contractors & Advisers (broker). Gap: the Offering place has no Business Services group |
| Licences | Contractors & Advisers; Accreditation Bodies (partner) |
| Royalties | Revenue Partners (the franchisor or licensor) |
| Certificates | Accreditation Bodies (partner); Contractors & Advisers |
| Tickets & Trip Costs | Venues & Organisers (entry fees); Logistics & Fulfilment |
| Delivery Team | Contractors & Advisers (freelancers) |

#### Gaps found

- The Offering place has no Business Services group, so Insurances, Licences and similar cards use Contractors & Advisers.
- Leasing a machine, rather than a space or a vehicle, has no supplier group.

### Task 2: activities, and the partners, suppliers and resources that could link to them

A performer is a founder, then a partner or supplier of the same place. A resource is added with the Resources tick box. Nothing linked gives its cost nature to the activity or takes it from it.

| Place | Activity group | Partners and suppliers that could perform it | Resources that could be linked |
|---|---|---|---|
| Infrastructure | Pre-Operational | Technical Support (installation); Property, Vehicles & Facilities (works on the premises); Creative & IT Services (website, software); Business Services (legal, accounting); partner: Alliances & Networks | Premises, Furniture & Fittings, Devices & Tools, Company Vehicles, Software & Web, Cloud & Security, Licences, Certificates, Insurances, Business Consumables, Admin Team |
| Infrastructure | Operational | Technical Support (scheduled maintenance); Goods & Equipment (supplies); Business Services; Creative & IT Services (updates); partner: Alliances & Networks | Premises Utilities, Vehicle Running Costs, Company Vehicles, Devices & Tools, Software & Web, Cloud & Security, Business Consumables, Insurances, Licences, Tickets & Trip Costs, Admin Team |
| Offering | Production | Producers & Wholesalers; Contractors & Advisers; Logistics & Fulfilment (stock in); partner: Accreditation Bodies | Workshop & Storage, Process Utilities, Production Machinery, Fixtures & Displays, Devices & Tools, Materials & Stock, Licences, Royalties, Certificates, Insurances, Delivery Team |
| Offering | Marketing | Agencies & Influencers; Venues & Organisers; partner: Revenue Partners | Site Hire, Fixtures & Displays, Devices & Tools, Sales & Delivery Tools, Platforms & APIs, Materials & Stock (samples), Tickets & Trip Costs, Insurances (event), Delivery Team (promoters) |
| Offering | Sales & Customer | Logistics & Fulfilment; Platforms & Payments; Venues & Organisers; Contractors & Advisers; partner: Revenue Partners | Delivery Vehicles, Delivery Running Costs, Delivery Team, Site Hire, Sales & Delivery Tools, Platforms & APIs, Materials & Stock, Devices & Tools, Tickets & Trip Costs, Insurances |

### Points to decide

- None open.

## Part G. Card access by type: principles and access of each field

*Written from version 25 of the specification on 2026-10-08. Part F is later and prevails where they differ.*

From the decided specification, version 25. Nothing is changed in the app. Colours: red = required, green = automatic, blue-grey = shown, orange = optional, grey = hidden.

> **Four principles.** (1) A field is shown only when the engine needs it to calculate. (2) Anything that can be calculated moves to Global Settings or the financial foundation, so the user types only basic numbers. (3) A field is required when the engine cannot place the cost without it. (4) Everything else is hidden, so a card stays quiet.

### 1. Fields on every card

| Field | Access | Why |
|---|---|---|
| Name | Required | A card without a name cannot be found in All Tiles or linked from another card. |
| Description | Optional | A note for the user; nothing is calculated from it. |
| Status | Shown (as in the app today) | The status decides what else appears: price and driver show only at Costs, a provider link at Partners & Providers. |
| Price | Required (at Costs) | A card without a price is incomplete: it shows the red glow and is not counted anywhere. |
| Currency | Automatic, editable | It follows the country of the Legal Entity, so the user rarely touches it. |
| Quantity | Shown, starts at 1 | It is the number of objects or people, or the units of a Per unit driver. It is read-only when the driver is % of Rev, because the calculation follows revenue. |
| Driver | Required | One of the 8 drivers. Locked when a billing type or cost option sets it (for example a payment gateway is always % of Rev). |
| Unit name | Required for Per unit | Quantity × price is meaningless without the unit (kg, km, kWh, seat, order). |
| Behaviour | Automatic | Fixed, variable, semi-variable or step is worked out from the driver and the billing type, so the user never chooses it. |
| Cost nature | Automatic, editable | Start-up, CapEx, OpEx or COGS is set by the 11 rules from place, group, driver, date and purchase or lease. The user may correct it. |
| Start date | Required if the cost falls before the Opening Date | The engine cannot place a cost in the pre-operational budget, or in a month of the cash flow, without it. |
| End date | Optional | A lease or subscription that ends in month 6 stops its cost; a planned sale stops depreciation. |
| Payment plan | Shown for Per project | It sets when the money leaves (full, deposit and balance, instalments, milestones). The percentages must total 100% or the card shows the red glow. |
| Linked offerings | Optional | It lets All Tiles and the Financial Foundation attribute the cost to an offering. |
| Linked actions | Optional | It ties the card to the actions of a channel or a journey stage. |
| Key flag | Optional | It marks a card the business cannot run without. |

### 2. What changes by card

#### A. Asset cards: Furniture & Fittings, Devices & Tools (both places), Fixtures & Displays, Production Machinery, Company Vehicles, Delivery Vehicles

| Field | Access | Why |
|---|---|---|
| Useful life | Shown | It feeds the depreciation line. The default of the group comes from Global Settings, so the user types it only to override. |
| Warranty checkbox, and Warranty until | Shown on Equipment cards only (Devices & Tools, Production Machinery) | Information only: it shows how long the warranty lasts and locks nothing. |
| Supplier link | Optional | It names the seller; Technical Support is linked through an activity card, not here. |
| Extras | Road tax on vehicles only | Road tax depends on the one vehicle. Insurance is a generated Insurances card, not an extra. |
| Billing type, rate override, customs fields, Held as | Hidden | None of them applies to a purchased or leased asset. |

#### B. Premises (Infrastructure) and Workshop & Storage (Offering)

| Field | Access | Why |
|---|---|---|
| Held as | Required | Rent, Own or Home decides where the cost sits and how it is routed. |
| Landlord link | Required when Rent | The landlord Supplier holds the rent, the deposit, the commercial property tax and the service charge, so the workspace card stays clean. |
| Price | Shown when Own or Home | Own is a one-time purchase routed to CapEx; Home is an allowance. When Rent, the price is on the landlord card. |
| Useful life | Shown when Own | An owned building is an asset that depreciates. |
| Extras | Commercial property tax and service charge when Own; Handling per pallet on Workshop & Storage | They depend on this one place. When Rent they sit on the landlord. |
| Deposit | Hidden | A deposit exists only with a rent, so it is on the landlord card. |

#### C. Site Hire (Offering)

| Field | Access | Why |
|---|---|---|
| Driver | Per project | A site is hired for one event or job. |
| Payment plan | Shown | Venues often take a deposit and a balance. |
| Start and end date | Shown | The dates of the event or job place the cost in a month. |
| Generated Insurances card | Automatic | Event cover is created from the site and linked to it. |
| Useful life, warranty, Held as, extras | Hidden | A hired site is not an asset and has no landlord relationship to track. |

#### D. Usage cards: Premises Utilities, Process Utilities, Vehicle Running & Maintenance, Delivery Running Costs, Business Consumables, Materials & Stock, Tickets & Trip Costs

| Field | Access | Why |
|---|---|---|
| Quantity and unit name | Required for Per unit | Consumption is the core of the cost: 500 kg, 1,200 km, kWh, litres. |
| Supplier link | Optional (Materials & Stock links to Producers & Wholesalers) | It shows who sells the input. |
| Useful life, warranty, extras, billing type | Hidden | These are consumed items, not assets, and carry no extras. |

#### E. Digital cards: Software & Web, Cloud & Security, Sales & Delivery Tools, Platforms & APIs

| Field | Access | Why |
|---|---|---|
| Driver | Monthly or Annually; Per unit for Platforms & APIs (calls, tokens) | A subscription recurs; an API bills per use. |
| Extras | Hidden | A set-up fee is a second Lump sum card, an add-on goes into the amount, and a monthly minimum is a parallel Fixed amount card. |
| Created by a channel | Sales & Delivery Tools (T1) | The channel template makes the card with the price blank. |

#### F. Documents & Rights: Insurances, Licences, Royalties, Certificates, Tickets & Trip Costs (see D)

| Field | Access | Why |
|---|---|---|
| Billing type and cost option | Required for Insurances, Licences and Royalties | One choice decides routing: Percentage to COGS, Fixed amount to OpEx, Lump sum to the pre-operational budget. |
| Rate override | Shown when Percentage (Royalties) | The default rate is in Global Settings; a special contract may differ. |
| Insurances: insurer, cover limit, renewal date, grade | Shown | The renewal date and the grade (mandatory, recommended or optional) are what a user needs to keep cover in force. Most are generated from a vehicle, premises, workshop, machine, event or channel. |
| Licences: quantity as seats | Shown | A software licence is priced per seat; a permit is a lump sum or a yearly amount. |
| Certificates: issued by, valid until, outcome | Shown | The outcome (certificate, test report or permit) and the expiry are the facts of the document. The fee is per project or yearly. |
| Amortisation period | Required for Lump sum assets | The user always enters it, because it depends on the contract (5 to 10 years for a franchise). |

#### G. Human Resources: Admin Team and Delivery Team cards, and the Founders tile

| Field | Access | Why |
|---|---|---|
| Gross salary, with Monthly and quantity as the number of people | Required | Everything else (on-costs, overtime, recruitment) is calculated or left to the financial foundation. |
| Extras | Commission and Bonus only | They are agreed person by person and cannot come from a global coefficient. |
| Founders tile: salary, period, hours, delivery share | Shown (as today) | The tile keeps the founders' fields, which cards do not hold; it maps to Founders & Owners. |
| On-costs, overtime, recruitment | Hidden | On-costs are a calculated line from Global Settings. |

#### H. Partner cards: Alliances & Networks, Accreditation Bodies, Revenue Partners

| Field | Access | Why |
|---|---|---|
| Organisation name, contact, agreement dates, what it brings | Shown | A partner is a relationship, not just a price. |
| Billing type, rate override | Shown on Revenue Partners (Percentage) | A commission follows results; the default rate is in Global Settings and the card may override it. |
| Extras | Hidden | An onboarding fee is a Lump sum card; a minimum is a Fixed amount card. |
| Created by a channel | Revenue Partners (T10) | The referral template creates the card. |

#### I. Supplier cards

| Field | Access | Why |
|---|---|---|
| Supplier name, contact, terms, lead time | Shown | A supplier is a relationship with terms. |
| Landlords (Property & Facilities, Landlords & Warehouses): rent, deposit, commercial property tax, service charge, link to the workspace | Shown | The landlord holds the cost of a rented space. |
| Producers & Wholesalers: Minimum order, Customs duty, Clearance and handling, Other duties | Shown | They depend on what is bought and from where. Useful life and warranty are hidden. |
| Platforms & Payments: option and billing type | Required | Rates come from the Channel Fee Table, so the card has no extras. |
| Logistics & Fulfilment, Agencies & Influencers: cost options | One per card | A courier or a campaign is priced one way per card: flat, by band, monthly, per item; or campaign fee, budget, retainer, per post. |
| Contractors & Advisers, Venues & Organisers, Technical Support: Per project or hourly, Payment plan | Shown | Work is paid by the job or the hour, often in stages. |
| Technical Support: link to a resource | Shown | The link, and whether the supplier sits inside an Operational activity card or in no group, tells maintenance (OpEx) from a repair (Contingency Fund). |

#### J. Activity cards (Pre-Operational with Capital Expenditure and Start-up Expenses; Operational; Production; Marketing; Sales & Customer)

| Field | Access | Why |
|---|---|---|
| Name, start and end date, description | Shown | The user names the card as they wish; there are no special kinds. |
| Linked resources, activities and partners | Required to be useful | The card exists to connect them. |
| Estimated cost of each link, and the total | Automatic | The card presents; it holds no price. |
| Price, quantity, driver, payment plan | Hidden | An activity has no price; its cost is that of its links. |
| Cost nature | Automatic from the group | There is no purpose option, so the group decides. |

#### K. Channel expense cards (teal)

| Field | Access | Why |
|---|---|---|
| Channel and actions | Shown, linked | The card exists because the channel needs it. |
| Price | Required | The template creates the card with the price blank, so it is incomplete until priced. |
| Link existing | Offered | An item the company already has is linked, with no second price. |

#### L. Repair

| Field | Access | Why |
|---|---|---|
| Date, linked resource, linked Technical Support supplier | Required | A repair is recognised by these links, with no field, kind or tick. |
| Activity group | None | Outside any activity group it draws on the Contingency Fund; inside an Operational activity card the same supplier is maintenance (OpEx). |
| Forecast | Not included | A repair is recorded when it happens. |

#### M. Legal Entity expense

| Field | Access | Why |
|---|---|---|
| Name, responsibility, cost, frequency (One time, Monthly, Annually), links, description | Shown (as today) | It records a registration and its fees only: filing, renewal and agent fees. |
| Insurance, licences, certificates | Hidden | They are Insurances, Licences and Certificates cards. |

## Part H. Categories, groups and "i" texts

*This part is the source of these texts: the test `PartnerGroupHelp.test.ts` reads it and checks that the app shows them word for word.*

Pink = Infrastructure, brown = Offering.

> The texts were checked by script: no negative wording and no repeated example or word across the 47 texts.

### 1. Resources

| Category | Place | Groups | Text shown in the app |
|---|---|---|---|
| Workspace | Infrastructure | Premises | The space where the team works, owned, rented through a landlord or at home, e.g. Studio rent, Shared-space seat, Home-office allowance, Owned office. |
| Utilities | Infrastructure | Premises Utilities | The services the daily operation consumes, e.g. Electricity, Gas heating, Broadband line, Mobile plan. |
| Workstation | Infrastructure | Furniture & Fittings | The furniture and fittings of the work areas, e.g. Standing desk, Drawing table, Ergonomic chair, Filing cabinet. |
| Equipment | Infrastructure | Devices & Tools | The devices and tools the team uses for its own work, bought or leased, e.g. Laptop, Label printer, Mirrorless camera, Vehicle tracker, Protective goggles. |
| Vehicles | Infrastructure | Company Vehicles<br>Vehicle Running Costs | • **Company Vehicles:** cars and bikes the company owns or leases for general use, e.g. Sales car, Cargo bike, Minibus lease.<br>• **Vehicle Running Costs:** fuel and the everyday running costs of company vehicles, e.g. Petrol, Electric charging, Car wash, Washer fluid. |
| Digital Infrastructure | Infrastructure | Software & Web<br>Cloud & Security | • **Software & Web:** software subscriptions and the public website, e.g. Bookkeeping software, Company website, Shared mailbox, Fleet tracking.<br>• **Cloud & Security:** storage, back-up and protection of files and data, e.g. Cloud drive, Nightly back-up, Password vault, Antivirus. |
| Materials & Inventory | Infrastructure | Business Consumables | Everyday items the business uses up and replaces, e.g. Copy paper, Dish soap, Coffee beans. |
| Documents & Rights | Infrastructure | Insurances<br>Licences<br>Certificates<br>Tickets & Trip Costs | • **Insurances:** policies that cover the company's liability, premises and people, e.g. Public liability, Cyber, Key person, Directors and officers.<br>• **Licences:** paid permissions: the right to use another's work and permits from authorities, e.g. Stock photo licence, Typeface rights, Image library, Staff parking permit.<br>• **Certificates:** certificates and inspections of the premises and the team, e.g. Gas safety certificate, Fire-risk assessment, First-aid award, Energy rating.<br>• **Tickets & Trip Costs:** the fares and stops of trips that serve the whole company, e.g. Conference train fare, Hotel for a seminar, Airport taxi, Car park. |
| Human Resources | Infrastructure | Founders & Owners<br>Admin Team | • **Founders & Owners:** owners who work in the company and draw pay from it, e.g. Founder salary, Part-time director fee.<br>• **Admin Team:** staff and helpers who handle the company's administration, e.g. Operations manager, Bookkeeper, Receptionist, Intern. |
| Workspace | Offering | Site Hire<br>Workshop & Storage | • **Site Hire:** the site rented for one event or job, e.g. Market pitch fee, Stand levy, Marquee frame, Rehearsal room slot.<br>• **Workshop & Storage:** the permanent base where the product is made or stored, e.g. Warehouse bay, Container yard, Shared-kitchen membership, Chiller space. |
| Utilities | Offering | Process Utilities | The energy, water and waste services that production consumes, e.g. Firing power, Rinse water, Chemical disposal. |
| Workstation | Offering | Fixtures & Displays | Fixed installations in your premises for making or showing the product, e.g. Workbench, Pallet racking, Showcase shelves, Sign board. |
| Equipment | Offering | Production Machinery<br>Devices & Tools | • **Production Machinery:** machines that turn raw materials into finished goods, e.g. Floor loom, Industrial oven, Laser cutter.<br>• **Devices & Tools:** the tools, instruments and gear used to make or deliver the offering, besides its machines, e.g. Card reader, Stall display kit, Tripod rig, Hard hat, Moisture meter. |
| Vehicles | Offering | Delivery Vehicles<br>Delivery Running Costs | • **Delivery Vehicles:** vans and trucks that carry or install the product, e.g. Transit van, Refrigerated truck, Short-term hire.<br>• **Delivery Running Costs:** fuel and the everyday running costs of delivery vehicles, e.g. Diesel, AdBlue, Van valet, Cab air freshener. |
| Digital Infrastructure | Offering | Sales & Delivery Tools<br>Platforms & APIs | • **Sales & Delivery Tools:** software that takes orders, bookings and payments, then delivers the result, e.g. Web shop, Booking app, Newsletter tool, File transfer.<br>• **Platforms & APIs:** online services your product calls, billed per use, e.g. AI text service, Maps lookup, Address check, Speech transcription. |
| Materials & Inventory | Offering | Materials & Stock | The materials, parts, packaging and resale goods that each sale uses, e.g. Yarn, Brass fittings, Mailer boxes, Gift wrap, Sample swatches, Resale mugs. |
| Documents & Rights | Offering | Insurances<br>Licences<br>Royalties<br>Certificates<br>Tickets & Trip Costs | • **Insurances:** policies that cover products, jobs and events, e.g. Product recall, Carriage of goods, Event cancellation, Customer default.<br>• **Licences:** paid permissions for the offering: the right to use another's work and permits from authorities, e.g. Licensed artwork, Backing track, Patented method, Parking-bay suspension.<br>• **Royalties:** payments that follow the sales or use of another's creation, e.g. Author royalty, Franchise percentage, Patent share, Master-rights split.<br>• **Certificates:** certificates, inspections and the tests behind them, needed to sell or use an offering, e.g. CE-mark testing, Organic certification, Flame trial, Food-safety swab.<br>• **Tickets & Trip Costs:** the fares, stops and tolls of trips that the work requires, e.g. Coach ticket, Ferry crossing, Toll bridge, Loading-bay fee. |
| Human Resources | Offering | Delivery Team | The people who make the product or serve the customer, e.g. Weaver, Instructor, Installer, Barista. |

### 2. Partners and Suppliers (the categories play the part of groups)

| Type | Place | Groups | Text shown in the app |
|---|---|---|---|
| Partners | Infrastructure | Alliances & Networks | Organisations you join for the benefit of the whole company, e.g. Trade association, Buying group, Start-up accelerator, Producers cooperative. |
| Suppliers | Infrastructure | Goods & Equipment<br>Business Services<br>Creative & IT Services<br>Property, Vehicles & Facilities<br>Technical Support | • **Goods & Equipment:** sellers of furniture, devices and consumables for the company, e.g. Furniture dealer, Stationery merchant, Computer reseller, Water-cooler rental.<br>• **Business Services:** firms that run the administrative side, e.g. Accountant, Lawyer, Insurance broker, Payroll bureau, Business bank, Web host.<br>• **Creative & IT Services:** freelancers and small agencies for design, branding, content or technology work, e.g. Web builder, Brand identity house, Photographer, IT support, Copywriter.<br>• **Property, Vehicles & Facilities:** owners and caretakers of the premises, and lessors of vehicles, e.g. Landlord, Coworking operator, Cleaner, Car lessor.<br>• **Technical Support:** outsourced technicians who maintain, repair and install the company's assets, e.g. Electrical engineer, Plumber, Boiler fitter, Network cabling. An installation is linked to the asset it installs. |
| Partners | Offering | Revenue Partners<br>Accreditation Bodies | • **Revenue Partners:** parties who sell for you or send customers, and take a cut of each sale, e.g. Boutique stockist, Distributor, Referral partner, Affiliate blogger, Co-teacher.<br>• **Accreditation Bodies:** bodies whose approval gives your work credibility, e.g. Weavers' guild, Craft standards panel, Culinary institute. |
| Suppliers | Offering | Producers & Wholesalers<br>Logistics & Fulfilment<br>Contractors & Advisers<br>Agencies & Influencers<br>Venues & Organisers<br>Landlords, Leasing & Warehouses<br>Platforms & Payments | • **Producers & Wholesalers:** producers and wholesalers that sell the materials and parts in the product, e.g. Wool mill, Box maker, Fabric importer, Flour miller.<br>• **Logistics & Fulfilment:** carriers and warehouses that deliver orders to buyers, e.g. Courier, National post, Fulfilment centre, Freight forwarder.<br>• **Contractors & Advisers:** outsourced specialists who do part of an offering's job or guide it, e.g. Dye works, Freelance developer, Product-safety adviser, Electrician.<br>• **Agencies & Influencers:** firms and creators paid to spread the word, e.g. Marketing agency, Instagram creator, Poster press, Podcast sponsor.<br>• **Venues & Organisers:** hosts of the places and events where you sell, e.g. Fair organiser, Exhibition hall, Show promoter.<br>• **Landlords, Leasing & Warehouses:** owners of premises used for making or storing stock, and lessors of vehicles, e.g. Estate owner, Depot firm, Chilled-storage outfit, Van leasing specialist.<br>• **Platforms & Payments:** intermediaries between you and the customer who charge a fee, e.g. Online marketplace, Payment processor, App store, Reservation portal. |

### 3. Open point: group names that repeat a category word

A group name that repeats its category's word reads twice on screen. These still do it:

- Utilities > Premises Utilities
- Vehicles > Company Vehicles
- Utilities > Process Utilities
- Vehicles > Delivery Vehicles
- Materials & Inventory > Materials & Stock
- Partners > Revenue Partners

## Part I. Foundation colour map: Identity, Brand, Business, Strategy

*The code applies these work colours through `src/framework/engine/WorkColours.ts`. The original draft said "proposal, not applied"; it is applied.*

Colour = what the user does in the section (work type). Proposal, not applied in the app.

### Work types

| Colour | Work type | What the user does |
|---|---|---|
| Blue `#4a82d9` | Discover | Find and understand information |
| Green `#4fbf8a` | Define | State facts about the organisation/person |
| Purple `#8a6bd1` | Create | Imagine and express something new |
| Orange `#f0825a` | Decide | Make choices and establish an approach |
| Yellow `#e8b84a` | Build | Combine existing information into a structured outcome |
| Lavender `#cfc6e6` | Review | Examine, validate and refine what has been created |
| Teal `#3fb5b0` | Connect | Items that come from, or link to, another section |

### Systems and sections

| Section | Work type | Colour |
|---|---|---|
| 1. Identity |  |  |
| Definition (Description, Mission, Positioning, Vision) | Create | Purple |
| Ethics (Philosophy, Values, Principles, Manifesto) | Decide | Orange |
| Legal Entity | Define | Green |
| Founders Profile | Define | Green |
| 2. Brand |  |  |
| Ambassador (Aesthetics, Attitude, Voice, Imprint) | Create | Purple |
| Style | Create | Purple |
| Inventory | Define | Green |
| 3. Business |  |  |
| 1. Foundation: Customer Segments and Profiles | Discover | Blue |
| 1. Foundation: Competitors and Alternatives | Discover | Blue |
| 1. Foundation: Value Proposition | Decide | Orange |
| 1. Foundation: Offerings | Decide | Orange |
| 2. Customer Engagement: Channels | Decide | Orange |
| 2. Customer Engagement: Channel resources and partners | Connect | Teal |
| 2. Customer Engagement: Customer Relationships | Create | Purple |
| 3. Infrastructure & Capability: Resources | Define | Green |
| 3. Infrastructure & Capability: Activities | Decide | Orange |
| 3. Infrastructure & Capability: Partners & Providers | Discover | Blue |
| 3. Infrastructure & Capability: Delivery | Build | Yellow |
| 3. Infrastructure & Capability: Completed | Review | Lavender |
| 4. Financial Foundation: Costs (auto-generated table) | Build | Yellow |
| 4. Financial Foundation: Funding Need | Decide | Orange |
| 4. Financial Foundation: Revenue and other sections | Build | Yellow |
| 5. Sustainability: Break-even and checks | Review | Lavender |
| 4. Strategy |  |  |
| Situation & Direction | Discover | Blue |
| Goals & Objectives | Decide | Orange |
| Roadmap | Decide | Orange |

