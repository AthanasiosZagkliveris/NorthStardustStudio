import type { AssetContract } from "../contract.ts";
import { lookHeight } from "../componentTokens.ts";

/**
 * The fold arrow (FoldArrow.tsx, .strategy-box-toggle in fold-arrow.css):
 * the standard 36px arrow every folding card, group and section head carries.
 * The outlined triangle of every page (the one the founder's Responsibilities head has): a 1.5px outline in the ink colour, 11 x 18 pointing right
 * while folded and 18 x 11 pointing down while open, a mask over the ink colour from the button's middle; filled under the pointer and the keyboard focus,
 * with no ground and no ring under the pointer; the keyboard focus turns the stroke primary. Not to be confused with the label arrow,
 * which stands beside a label or a title. The numbers are the rulebook's.
 */
export const foldArrow: AssetContract = {
    name: "Fold arrow",
    kind: "fold arrow",
    summary: "The standard 36px fold arrow: an outlined triangle, right while folded and down while open, filled under the pointer and the keyboard focus (no ground, no ring under the pointer); a primary stroke on the button under the keyboard focus.",
    component: "src/components/interview/fields/FoldArrow.tsx",
    stylesheet: "src/styles/fold-arrow.css",
    alsoStylesheets: ["src/styles/card-folding.css"],
    parts: ["button (36px square, 1px stroke, transparent at rest)", "triangle (::before, an outlined mask from the button's middle, filled under the pointer)"],
    states: ["rest", "hover", "focus", "open", "closed"],
    variants: [
        { id: "plain", context: "any head", note: "the arrow on its own; in a card head it also takes the body size and an invisible fallback glyph (card-folding.css)" }
    ],
    tokens: ["--text-default", "--line-primary", "--glow-color", "--radius-md"],
    geometry: {
        size: lookHeight("ARW.002"),
        triangleLong: 18,
        triangleShort: 11,
        strokeWidth: 1,
        radius: 6,
        /** The triangle's computed centre against the button's centre. */
        centreTolerancePx: 0.01,
        minTargetPx: 24,
        tolerancePx: 0.5
    },
    accessibility: {
        contrast: [
            { ink: "the triangle (the text colour) against the ground it stands on", ground: "page", min: 3 },
            { ink: "the triangle (the text colour) against the ground it stands on", ground: "card", min: 3 }
        ],
        focusRing: true,
        accessibleName: "Minimize <what> / Maximize <what> (aria-label), with aria-expanded"
    },
    uses: [
        "every folding card, group and section head",
        "the Segment card's arrow column, the Relationship Type rows, the Customer Engagement reference rows"
    ]
};
