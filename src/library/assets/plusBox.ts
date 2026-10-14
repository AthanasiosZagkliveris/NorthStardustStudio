import type { AssetContract } from "../contract.ts";

/**
 * The "+" box (.plus-box in section-tiles.css; rulebook 5a, "The + box"):
 * the small square that makes a new card or row. A swap of two colours
 * (150ms): at rest a 2px stroke and a "+" in the darker tone of the hue
 * (the box itself is transparent: the global rule for wired buttons, section
 * tiles stylesheet, "A WIRED BUTTON ... HAS NO FILL AT REST", overrides the
 * rulebook's older "the ground colour"; a disabled box keeps it); under the
 * pointer or the focus filled with the darker tone, no stroke, the "+" in the
 * ground colour. The box never changes size. The numbers are the rulebook's.
 */
export const plusBox: AssetContract = {
    name: "Plus box",
    kind: "add button",
    summary: "A square button with a drawn plus that adds a card or a row. A swap of two colours between rest and hover or focus (transparent with a stroke at rest, filled under the pointer); it never changes size.",
    component: "(a <button className=\"plus-box\"> in SectionTiles.tsx, SectionView.tsx, SubTiles.tsx, BusinessCapabilityEditor.tsx)",
    stylesheet: "src/styles/section-tiles.css",
    parts: ["button (the square, 2px stroke)", "two bars (::before, ::after) drawn from the middle of the box"],
    states: ["rest", "hover", "focus", "disabled"],
    variants: [
        { id: "tile", context: "tile", note: "36px, bars 16px, at the lower right of a page tile, 12px from the edges (.plus-box.section-tile-plus)" },
        { id: "small", context: "inline", note: "32px (the x's size), bars 14px, beside a row (.plus-box.plus-box-small: the Activity card's Add Performer)" }
    ],
    tokens: ["--plus-ground", "--plus-fill", "--plus-size", "--plus-bar", "--plus-fill-saturation", "--plus-fill-lightness", "--strategy-theme-hue", "--theme-bg-inner", "--focus-ring-ink", "--card-padding"],
    geometry: {
        sizeTile: 36,
        sizeSmall: 32,
        barTile: 16,
        barSmall: 14,
        barThickness: 2,
        strokeWidth: 2,
        radius: 8,
        /** Distance of a tile's box from the tile's right and bottom edges. */
        insetTile: 12,
        transitionMs: 150,
        disabledOpacity: 0.5,
        outlineWidth: 2,
        outlineOffset: 2,
        /** The bars' computed centre against the box's centre. */
        centreTolerancePx: 0.01,
        tolerancePx: 0.5
    },
    accessibility: {
        contrast: [
            { ink: "the plus and the stroke (the darker tone) against the page the box stands on", ground: "page", min: 3 },
            { ink: "the plus and the stroke (the darker tone) against the card the box stands on", ground: "card", min: 3 },
            { ink: "under the pointer: the plus (the ground colour) against the fill", ground: "fill", min: 3 }
        ],
        focusRing: true,
        accessibleName: "Add <Item> to <tile>"
    },
    uses: [
        "page tiles that take new cards (Operational, Production, Marketing, Utilities, Equipment ...)",
        "Offering's Capability: Resources, Activities, Partners & Suppliers",
        "the Activity card's Add Performer (small)"
    ]
};
