# The code map: where things are in `src`

Status: **reference**, updated 2026-10-21.

One line per folder: what is in it and what is not. A file's name is its component's name (PascalCase for a component, camelCase for a module of functions); a test stands beside what it tests, with the same name and `.test`.

## `src`

| Folder | Holds |
|---|---|
| `components/controls/` | The shared controls, each drawn once and used everywhere: `AddButton`, `BackButton`, `FoldHead`, `NavArrow` (also `vertical`: the 32px square of a row's move), `RadioChoice`, `TitleTooltips` (every tooltip: one place, `tipWords` makes the "Click to ..." sentence), `FunnelButton`, `RemoveButton`, `NumberCell`, `TextBox`, `TextField`, `TickBox`, `TickField`, `FieldLabel`, `PopupPanel` (with `usePopupDismiss`), `Tooltip` (`TooltipBox`, `useAboveTip`). A new control that more than one place needs goes here. |
| `components/` | The app's own parts: the header, the footer, the lists of Capabilities and Systems, the calendar, the search, the undo toast, the settings and preferences dialogs. |
| `components/interview/cards/` | The card: `BusinessCard` (in `BusinessCardFields.tsx`), its box (`CardShell`), head (`CardHead`), number (`CardNumber`), name (`NameCell`, `CardNameInput`), the boxes and columns of cards, what a card says folded (`cardSummary`), the cards just made (`freshCards`). |
| `components/interview/tiles/` | The tile and everything that opens from it: `Tile`, `TileGrid`, `TileParts` (the face, the links, the "+", the hover origin), the page tile (`SectionTiles`), the section and category views, the card tile, the dialog's levels, the floating cards and their arrows, the Inventory (`CapabilityOverview`: its table, its filter and sort window, the Tiles / Table and `Aa` radios). |
| `components/interview/fields/` | The cells and what stands around them: the field row and its head (`FieldRow`, `FieldHead`), the field's marks and status, the info note, the dropdown (`OptionPicker`), the date and month (`DateCellInput`, `MonthYearPicker`, `DatePopup`), the colour picker, the lists (`NumberedListInput`, `ListStatic`), the table (`DynamicTable`), the arrows (`FoldArrow` with `variant` card or label, `direction` and `pressed`; `PageArrow`), the text link. |
| `components/interview/editors/` | The editors of the pages and their parts: one `…Editor.tsx` for each page or section (Business Capability, Engagement, Foundation, Financial, Legal Entity, Founders, Brand, Strategy, the Process library, the Operational log), the answer renderer, the channel resources. The pure part of a page (its texts, limits and the functions that change its answer) is in `…Model.ts` beside the editor (`BusinessCapabilityModel`, `BusinessEngagementModel`). They are large: a card kind's own code stays with its editor until it is split. |
| `components/interview/rails/` | The navigation rail (the bullets and their page tags). |
| `components/interview/tests/` | The tests that cross several components (a whole card, a page's rules); a test of one component stands beside it. |
| `components/notepad/` | The Notes panel and the noted fields' hover. |
| `pages/` | The routes: the landing page, the system selection, the conversation (the interview; what it reads and checks before it draws is `conversationHelpers.tsx`), the documents, the review, the global settings, the generator; and, in development only, the library, the inventory and the looks pages. |
| `framework/engine/` | The rules and the data model, with no screen in them: the answers, the cards' completeness, the financial forecast, the generated cards, the exports, the search index. Everything a test can say about the content is tested here first. |
| `hooks/`, `services/` | The React hooks (`useAutoGrow`, `useListAutoFormat`, `useFloatingPanel`…) and the services that keep state (the organizations, the notes, the preferences, the calendar). |
| `styles/` | The stylesheets: `tokens/tokens.ts` generates the colours; `cell-focus.css` loads last and holds the global rules (ring, hover, label, underline); `conversation/` and `section-tiles/` are the big sheets split by topic. A look is a token or a global rule, never a page's own. |
| `library/` | The asset library (contracts, gallery, inventory) and its checks. |
| `data/examples/` | The two example organizations. |

## Rules for a new file

- One component per file; its CSS in the stylesheet of its topic, not in a file of its own, unless it is a control (`back-button.css`).
- A control that two places need is written in `components/controls/` before the second place is written.
- A file over about 1,500 lines is split by card kind or by section before more is added to it.
- `docs/README.md` indexes the documents; `npm run docs:index` rewrites it.
