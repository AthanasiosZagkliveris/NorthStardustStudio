/**
 * The asset contract (docs/design/05, 5.13, layer C): one typed record
 * per asset of the library. The gallery (/library, development only)
 * draws the asset from its record, and scripts/library/run.mjs measures
 * what the record says. Data only: no React here, so that Node can read it.
 */

/** The states of an asset. Rest, hover and focus are reactions; open and closed are values. */
export type AssetState = "rest" | "hover" | "focus" | "open" | "closed" | "disabled";

/** A place where the asset stands, drawn in the gallery at the size the app draws it. */
export interface AssetVariant {
    readonly id: string;
    /** What surrounds it: the real class names of the app's own parents. */
    readonly context: "field-label" | "title-row";
    /** The size of the label beside it, in px, as the stylesheets give it. The runner checks the browser agrees. */
    readonly fontSizePx: number;
    readonly note: string;
}

/** A pair of colours that meet, measured in every reading mode and every palette hue. */
export interface ContrastNeed {
    readonly ink: string;
    readonly ground: "page" | "card";
    /** 3 for a mark (WCAG 1.4.11), 4.5 for text (1.4.3). */
    readonly min: 3 | 4.5;
}

export interface ArrowGeometry {
    /** The triangle's base and depth, in em of the label: 0.611 deep, 1 high pointing right. */
    readonly glyphWidthEm: number;
    readonly glyphHeightEm: number;
    /** Open, the triangle is turned a quarter and shifted by this much (em) so its left edge keeps the content edge. */
    readonly openShiftEm: number;
    /** The line, inside the shape's edge. */
    readonly lineWidthPx: number;
    /** The button is never smaller than this (WCAG 2.2, 2.5.8). */
    readonly minTargetPx: number;
    /** How far a measurement may differ from the rule, in px. */
    readonly tolerancePx: number;
}

export interface AssetContract {
    readonly name: string;
    readonly kind: string;
    readonly summary: string;
    readonly component: string;
    readonly stylesheet: string;
    /** The parts of its anatomy. */
    readonly parts: readonly string[];
    readonly states: readonly AssetState[];
    readonly variants: readonly AssetVariant[];
    /** The custom properties its stylesheet reads. */
    readonly tokens: readonly string[];
    readonly geometry: ArrowGeometry;
    readonly accessibility: {
        readonly contrast: readonly ContrastNeed[];
        /** The focus is shown by the filled triangle; no ring and no outline. */
        readonly focusRing: false;
        readonly accessibleName: string;
    };
    readonly uses: readonly string[];
}
