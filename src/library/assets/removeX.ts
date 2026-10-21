import type { AssetContract } from "../contract.ts";
import { lookHeight } from "../componentTokens.ts";

/**
 * The remove x (.strategy-box-remove in remove-button.css; rulebook "The x,
 * the last look"): the app's one remove button, on every card and row. A swap
 * of two colours like the "+" box: a 2px stroke and the X in the danger red
 * (--x-red), the card's ground behind; under the pointer or the keyboard focus
 * the stroke is gone and the two swap (filled red, the X in the ground). Size
 * and place never change. The numbers are the rulebook's.
 */
export const removeX: AssetContract = {
    name: "Remove x",
    kind: "remove button",
    summary: "A 32px square with a drawn X that removes a card or a row. Red stroke and X at rest, filled red under the pointer and the focus; it never changes size.",
    component: "src/components/interview/cards/BusinessCardFields.tsx (RemoveButton) and the other cards that use .strategy-box-remove",
    stylesheet: "src/styles/remove-button.css",
    alsoStylesheets: ["src/styles/section-tiles.css", "src/styles/global.css"],
    parts: ["button (the square, 2px stroke)", "two bars (::before, ::after) turned +45 and -45 degrees, drawn from the middle of the box"],
    states: ["rest", "hover", "focus", "disabled"],
    variants: [
        { id: "cell", context: "row", note: "an x beside a row inside a card's cell (a performer, a milestone): .strategy-box-remove" },
        { id: "card", context: "card", note: "a card's own delete: .strategy-box-remove.card-remove" }
    ],
    tokens: ["--x-red", "--x-ground", "--bg-surface", "--text-danger", "--text-faint", "--line-card", "--radius-md", "--focus-ring-ink", "--line-primary"],
    geometry: {
        size: lookHeight("BTN.001"),
        barLength: 14,
        barThickness: 2,
        strokeWidth: 2,
        radius: 6,
        disabledStrokeWidth: 1,
        outlineWidth: 2,
        outlineOffset: 2,
        /** The bars' computed centre against the box's centre. */
        centreTolerancePx: 0.01,
        tolerancePx: 0.5
    },
    accessibility: {
        contrast: [
            { ink: "the red stroke and X against the ground behind the box", ground: "page", min: 3 },
            { ink: "the red stroke and X against the ground behind the box", ground: "card", min: 3 },
            { ink: "under the pointer: the X (the ground colour) against the red fill", ground: "fill", min: 3 }
        ],
        focusRing: true,
        accessibleName: "Remove <what> (aria-label and title)"
    },
    uses: [
        "every card's delete and every row's remove (performers, milestones, costs, partners ...)",
        "the older removes that share its look: profile cards, brand holder clear, legal entity field remove"
    ]
};
