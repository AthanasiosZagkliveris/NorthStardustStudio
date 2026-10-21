import type { AssetContract } from "../contract.ts";
import { lookHeight } from "../componentTokens.ts";

/**
 * The floating card base (FloatingCards in SectionTiles.tsx; the model is the
 * Resource card): the one surface every floating card stands on. A card opens
 * over the dimmed page with its box name above it, and is made of the same
 * parts from top to bottom: the name, the head row, the rows, the groups. Its
 * width, corners, padding and gaps are the values below, written once, so a
 * change here changes every card. Its colours are the card's tint tokens and
 * follow the reading mode (light, dark, sepia).
 *
 * Phase 1 (2026-10-15): the contract and the layout are written down with
 * today's values; the stylesheet and the card kinds are moved onto the base in
 * the steps after. Phase 2: the owner sets the sizes per screen class in the
 * table below (today every class has the same value).
 */
export const floatingCard: AssetContract = {
    name: "Floating card",
    kind: "card base",
    summary: "The one surface every floating card stands on: 492px wide (a founder's 297px), 8px corners, 12px padding and 12px between everything, a height that follows its contents, an inset light and shade edge and a drop shadow, in the tint of its tile and the colours of the reading mode.",
    component: "src/components/interview/tiles/SectionTiles.tsx, the FloatingCards component",
    stylesheet: "src/styles/section-tiles.css",
    alsoStylesheets: ["src/styles/page-3-edges.css", "src/styles/global.css"],
    parts: [
        "host (a dialog over the dimmed page, placed by its tile)",
        "stack (one card, or a parent above its child)",
        "item (the box name, then the card)",
        "caption (the box name, with the box's \"i\")",
        "body (the card: its ground, edge and shadow)"
    ],
    states: ["rest", "open"],
    variants: [
        { id: "card", context: "kind card", note: "a Resource, Activity, Partner, Provider or any other card: --open-card-width wide" },
        { id: "founder", context: "kind founder", note: "a founder's card: --founder-card-min wide" }
    ],
    tokens: [
        "--open-card-width", "--founder-card-min", "--radius-lg", "--card-padding", "--space-field", "--space-label", "--control-square", "--card-label-col",
        "--theme-bg-inner", "--theme-ground-weight", "--theme-ground-paper", "--theme-line-edge", "--theme-line-accent", "--strategy-theme-hue", "--shadow-18", "--shadow-12", "--box-inset"
    ],
    geometry: {
        cardWidth: 492,
        founderWidth: 297,
        radius: 8,
        padding: 12,
        gap: 12,
        labelGap: 6,
        cellHeight: lookHeight("TXT.001"),
        labelColumn: 177,
        /** A card never stands closer than this to the window's edge. */
        windowMargin: 16,
        tolerancePx: 0.6
    },
    sizes: [
        { use: "Card width (kind card)", token: "--open-card-width", unit: "px", values: { tablet: 492, laptop: 492, desktop: 492 }, note: "at most the window less the window margin" },
        { use: "Founder card width", token: "--founder-card-min", unit: "px", values: { tablet: 297, laptop: 297, desktop: 297 } },
        { use: "Card corners", token: "--radius-lg", unit: "px", values: { tablet: 8, laptop: 8, desktop: 8 } },
        { use: "Card padding, side, top and bottom", token: "--card-padding", unit: "px", values: { tablet: 12, laptop: 12, desktop: 12 } },
        { use: "Gap between rows, and between the box name and the card", token: "--space-field", unit: "px", values: { tablet: 12, laptop: 12, desktop: 12 } },
        { use: "Gap from a label to the control it names", token: "--space-label", unit: "px", values: { tablet: 6, laptop: 6, desktop: 6 } },
        { use: "Height of a single-line control (a cell)", token: "--control-square", unit: "px", values: { tablet: lookHeight("TXT.001"), laptop: lookHeight("TXT.001"), desktop: lookHeight("TXT.001") } },
        { use: "Label column of a side-label row", token: "--card-label-col", unit: "px", values: { tablet: 177, laptop: 177, desktop: 177 } },
        { use: "Window margin (a card is never closer to the window's edge)", unit: "px", values: { tablet: 16, laptop: 16, desktop: 16 }, note: "written in the width rule as calc(100vw - 16px), not a custom property yet" }
    ],
    anatomy: [
        { part: "Box name", note: "A centred caption above the card, outside it: the name of the tile or box the card belongs to, with the box's \"i\" where the box has a note." },
        { part: "Card top padding", note: "The card's own padding above its first row.", gapAbove: { px: 12, token: "--card-padding" } },
        { part: "Head row", note: "The order number inside the name cell (44px high), then the x (32px) 12px from the cell. Everything under the head starts and ends where the name cell does." },
        { part: "Rows", note: "One row per field, 12px apart: a side-label row (the label in the 177px column, then the control), a label above its control (6px), a tick row (the tick and its words on one line), an optional field (the tick, then a growing box under it), a tick list (one tick per line, 12px box to box).", gapAbove: { px: 12, token: "--space-field" } },
        { part: "Groups", note: "Two groups are divided by a rule, 12px either side of it.", gapAbove: { px: 12, token: "--space-field" } },
        { part: "Completed row (Activity cards)", note: "A divider line stands above the Completed tick, 12px either side of it, and the Links (Linked to) come last, after Completed (the owner, 2026-10-15).", gapAbove: { px: 12, token: "--space-field" } },
        { part: "Card bottom padding", note: "The card's own padding under its last row; the height follows the contents.", gapAbove: { px: 12, token: "--card-padding" } }
    ],
    accessibility: {
        contrast: [
            { ink: "the card's text against the card's ground", ground: "card", min: 4.5 },
            { ink: "a control's border and marks against the card's ground", ground: "card", min: 3 }
        ],
        focusRing: true,
        accessibleName: "role dialog, aria-modal, aria-label (the box name)",
        criteria: [
            { id: "1.4.3", name: "Contrast (minimum)", how: "Every text holds 4.5:1 on the card ground in light, dark and sepia." },
            { id: "1.4.11", name: "Non-text contrast", how: "Every border, mark and ring that identifies a control holds 3:1 on the card ground." },
            { id: "2.4.7", name: "Focus visible", how: "Every control shows its keyboard focus (a ring, or the asset's filled state)." },
            { id: "2.5.8", name: "Target size (minimum)", how: "Every control is at least 24px, or has the spacing exception." },
            { id: "1.4.10", name: "Reflow", how: "The card is never wider than the window less the window margin and its content wraps; the 768px floor is a declared exception until the owner rules on 320px (docs/design/05, 5.8)." },
            { id: "4.1.2", name: "Name, role, value", how: "The host is a dialog with aria-modal and a name; the focus returns to the control that opened it; Escape and a press outside close it." }
        ]
    },
    uses: [
        "every floating card on the Foundation pages (Identity, Brand, Business, Strategy)",
        "the Resource, Activity, Partner, Provider, Founder, Legal Entity and Brand cards"
    ]
};
