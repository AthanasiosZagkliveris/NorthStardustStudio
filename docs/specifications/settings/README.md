# Settings — the screens and choices that set how the app works

Status: **index**, written 2026-11-20. What a founder sets outside the Systems' questions: the **Global Settings** screen, and the two tools that set how the app is read, the **reading mode** and **Focus**. All three are in the header's **Menu** (layout rules, section 6, the Menu; owner, 2026-11-21 23:44 UTC+2: "Include the Reading Mode"; 2026-11-21 03:40: the reading mode is **Appearance**). Each is the one owner of what it sets; the figures and rules behind them are in the documents linked.

| Setting | Where | Specification | Built by |
|---|---|---|---|
| Global Settings | **Menu**, then **Settings** (`/settings`) | [`../global-settings.md`](../global-settings.md) | `src/pages/GlobalSettings.tsx`, `src/framework/engine/GlobalSettings.ts` |
| Appearance (the reading mode) | **Menu**, then **Appearance**'s side menu | this file, below | `src/components/ToolsMenu.tsx` |
| Focus | **Menu**, then **Focus**, on an interview page | this file, below | `src/components/FocusModeButton.tsx`, `src/services/FocusModeService.ts` |

## Global Settings

The rates and limits the calculated lines read, in one place (the cost model, section 6): the business stages with the Opening Date (entered on the Organisation tile) and today's stage (doc 28, 8.2a); the financial plan's own settings; the assets (the capitalisation limit, useful lives, amortisation); the rates (employer on-costs, royalty, affiliate and sales-agent); the reserve (the Startup and Operational Contingency Funds, the target operating reserve, read by the Workbook's Funding Request: `workbook/financial-documents.md`); the Channel Fee Table. Each section a card of fields, every detail in an "i" beside its label (layout rules, section 14). The screen in full: `global-settings.md`.

## Appearance (the reading mode)

Four options in Appearance's side menu, in the Menu, the chosen one marked: **Light**, **Sepia** (warm paper for long reading), **Dark** and **Auto** (follows the system's light or dark; it says "Auto" with the icon of what it comes to now) (`ToolsMenu.tsx`). Every colour is a token of each mode (layout rules, section 2, Tokens; WCAG 2.2 AA in every mode: the contrast checks of the layout probe). The choice is the person's, kept on this device (`ThemeService`), never in an Organisation's answers.

## Focus

On an interview page, **Focus** in the Menu hides the rails, the Help, the header and the progress line and centres the page at a reading width (`focus-mode.css`); one small "Exit focus" button stays in the top-right corner, and Escape exits too, after any dialog has closed. The choice is remembered on this device until exited (`FocusModeService`).
