import type { AssetContract } from "../contract.ts";

/**
 * The label arrow (LabelArrow.tsx, label-arrow.css; rulebook "The label
 * arrow", 2026-10-14): the trial asset of the library. The numbers are
 * the ones the rulebook gives; the runner measures the real component
 * against them.
 */
export const labelArrow: AssetContract = {
    name: "Label arrow",
    kind: "fold arrow",
    summary: "One frameless triangle beside a label or a title that shows or hides what belongs to it. Outline at rest, filled under the pointer and the keyboard focus; right while hidden, down while open.",
    component: "src/components/interview/fields/LabelArrow.tsx",
    stylesheet: "src/styles/label-arrow.css",
    parts: ["button (the hit area)", "triangle (svg polygon, 2px line inside its edge)"],
    states: ["rest", "hover", "focus", "closed", "open"],
    variants: [
        { id: "field-label", context: "field-label", fontSizePx: 18, note: "inside a label, left of the words (a founder's Responsibilities, the Initiatives)" },
        { id: "title-row", context: "title-row", fontSizePx: 28, note: "after a chapter title and its i, at the title's size (--label-arrow-size: --font-h2)" }
    ],
    tokens: ["--label-arrow-size", "--label-arrow-hit", "--strategy-theme-hue", "--plus-fill-saturation", "--plus-fill-lightness"],
    geometry: {
        glyphWidthEm: 0.611,
        glyphHeightEm: 1,
        openShiftEm: 0.1945,
        lineWidthPx: 2,
        minTargetPx: 24,
        tolerancePx: 0.6
    },
    accessibility: {
        contrast: [
            { ink: "the arrow's tint (the + box's colour)", ground: "page", min: 3 },
            { ink: "the arrow's tint (the + box's colour)", ground: "card", min: 3 }
        ],
        focusRing: false,
        accessibleName: "Names what it shows or hides, and says which (Show/Hide ...)"
    },
    uses: [
        "chapter titles of 3. Infrastructure & Capability",
        "a founder's Responsibilities and Completed",
        "a card's Links",
        "the Initiatives of an Objective"
    ]
};
