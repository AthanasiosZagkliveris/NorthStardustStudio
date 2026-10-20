import type { AssetContract } from "../contract.ts";

/**
 * The Back button (.section-tile-back and .carousel-rail-back, with the
 * .back-arrow, in section-tiles.css; rulebook "Back"). Two live forms:
 *   foot   "< Back" at the foot of a dialog (.section-tile-back): the arrow,
 *          a 6px gap, the word; plain at rest, under the pointer or the focus
 *          the tint of the card, thickened, tracked;
 *   rail   the way back standing in the rail's tab after its last option
 *          (.carousel-rail-back), built like a rail item: an arrow box as wide
 *          as a bullet (12px), the item's 12px gap, then the word in capitals;
 *          under the pointer or the focus the "+" box colour, thickened, and
 *          the arrow grows 20%.
 * The rail form's colours are read from the dialog card's frame at run time; the
 * gallery's tab colours are stand-ins, so no contrast is asserted for it.
 * .floating-card-back is no longer drawn (the floating card has no Back); its
 * rules remain in the stylesheet. The tab colours of the rail form stand in the
 * gallery for the colours the app reads from the dialog's card.
 */
export const backButton: AssetContract = {
    name: "Back button",
    kind: "navigation button",
    summary: "The way back out of a dialog or card: a left-pointing triangle and the word Back. Plain at rest; the card's tint, thickened, under the pointer and the focus.",
    component: "src/components/interview/tiles/SectionTiles.tsx (the dialog foot's .section-tile-back, the rail tab's .carousel-rail-back)",
    stylesheet: "src/styles/section-tiles.css",
    alsoStylesheets: ["src/styles/label-arrow.css", "src/styles/global.css"],
    parts: ["button", "back-arrow (a solid left-pointing triangle, 0.8em high)", "the word Back (capitals in the rail form)"],
    states: ["rest", "hover", "focus"],
    variants: [
        { id: "foot", context: "dialog foot", note: "< Back at the foot of a dialog: .section-tile-back" },
        { id: "rail", context: "rail tab", note: "the way back in the rail's tab: .carousel-rail-back, capitals, built like a rail item" }
    ],
    tokens: ["--text-default", "--text-primary", "--hover-bold", "--bold-tracking", "--rest-tracking", "--font-body", "--focus-ring-ink", "--theme-line-accent", "--plus-fill-saturation", "--plus-fill-lightness", "--tab-ink", "--tab-edge", "--gap-6", "--gap-12"],
    geometry: {
        /** The arrow: 22 wide to 28 high, 0.8em high. */
        arrowHeightEm: 0.8,
        arrowRatio: 22 / 28,
        footGap: 6,
        footPaddingY: 6,
        railGap: 12,
        /** As drawn: the rail form's 2px above and below (the later rule's "padding: 0" does not apply). */
        railPaddingY: 2,
        /** The arrow's box in the rail form: as wide as a bullet. */
        railArrowBox: 12,
        railArrowGrow: 1.2,
        outlineWidth: 2,
        outlineOffset: 2,
        minTargetPx: 24,
        tolerancePx: 0.6
    },
    accessibility: {
        contrast: [
            { ink: "the word and arrow at rest against the ground they stand on", ground: "rest", min: 4.5 },
            { ink: "the word and arrow under the pointer and the focus against the ground", ground: "hover", min: 4.5 }
        ],
        focusRing: true,
        accessibleName: "Back (the word, or aria-label and title Back in the rail form)"
    },
    uses: [
        "the foot of every section dialog",
        "the rail tab beside a dialog's card"
    ]
};
