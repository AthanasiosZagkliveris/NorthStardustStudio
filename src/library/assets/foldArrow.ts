import type { AssetContract } from "../contract.ts";
import { lookHeight } from "../componentTokens.ts";

/**
 * The fold arrow (FoldArrow.tsx, .strategy-box-toggle in conversation.css):
 * the standard 36px arrow every folding card, group and section head carries.
 * A triangle drawn with borders from the button's middle (11 x 18 pointing
 * right while folded, 18 x 11 pointing down while open), in the text colour;
 * under the pointer a white ground and a stroke in the card line; the keyboard
 * focus turns the stroke primary. Not to be confused with the label arrow,
 * which stands beside a label or a title. The numbers are the rulebook's.
 */
export const foldArrow: AssetContract = {
    name: "Fold arrow",
    kind: "fold arrow",
    summary: "The standard 36px fold arrow: a solid triangle, right while folded and down while open. A ground and a card-line stroke under the pointer; a primary stroke under the keyboard focus.",
    component: "src/components/interview/FoldArrow.tsx",
    stylesheet: "src/styles/conversation.css",
    alsoStylesheets: ["src/styles/card-folding.css"],
    parts: ["button (36px square, 1px stroke, transparent at rest)", "triangle (::before, drawn with borders from the button's middle)"],
    states: ["rest", "hover", "focus", "open", "closed"],
    variants: [
        { id: "plain", context: "any head", note: "the arrow on its own; in a card head it also takes the body size and an invisible fallback glyph (card-folding.css)" }
    ],
    tokens: ["--text-default", "--line-card", "--bg-surface", "--line-primary", "--glow-color", "--radius-md"],
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
