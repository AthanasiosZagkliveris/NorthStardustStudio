import type { AssetContract } from "../contract.ts";

/**
 * The rails (BulletRail.tsx, bullet-rail.css, status-shape.css; rulebook
 * "Navigation rails"): the Pages rail on the left and the Sections rail on the
 * right, a column of bullets beside the interview card. One item is a button
 * of a label and a 12px bullet (a page status shape on the Pages rail): ice
 * blue at rest, the label in the subtle ink; the lit (active) item has the
 * app's blue bullet with a 4px bloom, grown 45%, and a bold label; under the
 * pointer or the keyboard focus the label takes the link colour and is
 * underlined and the bullet takes the hover blue with a 3px ring, grown 30%.
 * Below 1700px the rail shows its bullets only and the label is a tooltip on
 * hover and focus; from 1700px the labels stand beside the bullets.
 * This contract covers BulletRail (the pages and sections rails) only; the
 * carousel rails in dialogs and the rail tab are not covered yet.
 */
export const rails: AssetContract = {
    name: "Rails",
    kind: "navigation rail",
    summary: "The Pages and Sections rails: a column of items, each a bullet and a label in one button. Rest, lit and hover looks; bullets only below 1700px with the name as a tooltip, labels inline from 1700px.",
    component: "src/components/interview/rails/BulletRail.tsx",
    stylesheet: "src/styles/bullet-rail.css",
    alsoStylesheets: ["src/styles/status-shape.css", "src/styles/global.css"],
    parts: ["nav (the rail)", "list (18px between items)", "item button (label, 12px gap, bullet; 2px padding above and below)", "bullet (a plain dot, or a page status shape)", "label (tooltip below 1700px, inline from 1700px)"],
    states: ["rest", "hover", "focus", "open"],
    variants: [
        { id: "pages-left", context: "left", note: "the Pages rail: label then bullet; page status shapes (not started, in progress, defined) and the Introduction in capitals; one lit item" },
        { id: "sections-right", context: "right", note: "the Sections rail: bullet then label; plain bullets; one lit item" }
    ],
    tokens: [
        "--rail-dot", "--rail-dot-active", "--rail-bloom", "--rail-dot-hover", "--rail-hover-ring", "--rail-status", "--rail-status-hover",
        "--text-subtle", "--text-strong", "--text-primary", "--hover-bold", "--bold-tracking", "--line-primary", "--tooltip-bg", "--tooltip-text", "--tooltip-border"
    ],
    geometry: {
        bullet: 12,
        /** Gap between the label and the bullet. */
        itemGap: 12,
        itemPaddingY: 2,
        listGap: 18,
        activeScale: 1.45,
        hoverScale: 1.3,
        activeRing: 4,
        hoverRing: 3,
        outlineWidth: 2,
        outlineOffset: 4,
        /** The viewport width from which labels stand beside the bullets. */
        wideFrom: 1700,
        /** A label as a tooltip stands this far from the bullet. */
        tooltipOffset: 24,
        /** WCAG 2.2 (2.5.8): a target smaller than this needs the spacing exception. */
        minTargetPx: 24,
        underlineOffsetEm: 0.2,
        tolerancePx: 0.5
    },
    accessibility: {
        contrast: [
            { ink: "a page status shape (its ink) against the page", ground: "status", min: 3 },
            { ink: "the label against the page, where labels stand inline (from 1700px)", ground: "label", min: 4.5 },
            { ink: "the label under the pointer (the link colour) against the page", ground: "hover", min: 4.5 },
            { ink: "the tooltip text against the tooltip block", ground: "tooltip", min: 4.5 }
        ],
        focusRing: true,
        accessibleName: "The label (with the status word on the Pages rail); aria-current on the lit item"
    },
    knownFindings: {
        "plain-bullet-contrast": "The plain (no status) bullets are ice blue (--rail-dot) at rest and the lit one the app's blue; the ice blue holds less than 3:1 against the page. The rule for unlit rail bullets was proposed and dropped by the owner (docs/design/05, 5.12), so nothing was changed; the status shapes do hold 3:1."
    },
    uses: [
        "the Pages rail (left) and the Sections rail (right) beside the interview card"
    ]
};
