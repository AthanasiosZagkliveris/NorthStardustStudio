/**
 * The asset contract (docs/archive/plans/2026-10-14-cleanup-and-library-plans.md, 5.13, layer C): one typed record
 * per asset of the library. The gallery (/library, development only)
 * draws the asset from its record, and tools/scripts/library/run.mjs measures
 * what the record says. Data only: no React here, so that Node can read it.
 */

/** The states of an asset. Rest, hover and focus are reactions; open and closed are values. */
export type AssetState = "rest" | "hover" | "focus" | "open" | "closed" | "disabled";

/** A place where the asset stands, drawn in the gallery at the size the app draws it. */
export interface AssetVariant {
    readonly id: string;
    /** What surrounds it: the real class names of the app's own parents. */
    readonly context: string;
    /** The size of the label beside it, in px, as the stylesheets give it. The runner checks the browser agrees. */
    readonly fontSizePx?: number;
    readonly note: string;
}

/** A pair of colours that meet, measured in every reading mode and every palette hue. */
export interface ContrastNeed {
    readonly ink: string;
    readonly ground: string;
    /** 3 for a mark (WCAG 1.4.11), 4.5 for text (1.4.3). */
    readonly min: 3 | 4.5;
}

/** The screen classes of the website's profiles (docs/design/records/05-not-done-yet.md): Tablet 768-1199 wide; Laptop 1200 and wider, under 1250 high; Desktop 1200 and wider, 1250 high and over. */
export const SCREEN_CLASSES = ["tablet", "laptop", "desktop"] as const;
export type ScreenClass = (typeof SCREEN_CLASSES)[number];

/** A size by use and by screen class: one custom property, and its value in each class (the same in every class until the owner sets them apart). */
export interface SizeRow {
    readonly use: string;
    /** The custom property that holds it, when there is one. */
    readonly token?: string;
    readonly unit: "px" | "";
    readonly values: Readonly<Record<ScreenClass, number>>;
    readonly note?: string;
}

/** One part of an asset from top to bottom: what it is, and the gap above it. */
export interface AnatomyPart {
    readonly part: string;
    readonly note: string;
    /** The gap above this part in px, with the custom property that holds it. */
    readonly gapAbove?: { readonly px: number; readonly token: string };
}

/** A WCAG 2.2 success criterion the asset must meet, and how it is met here. */
export interface Criterion {
    readonly id: string;
    readonly name: string;
    readonly how: string;
}

export interface AssetContract {
    readonly name: string;
    readonly kind: string;
    readonly summary: string;
    readonly component: string;
    readonly stylesheet: string;
    /** Other stylesheets that style it (the variants of an asset can live in several). */
    readonly alsoStylesheets?: readonly string[];
    /** The parts of its anatomy. */
    readonly parts: readonly string[];
    readonly states: readonly AssetState[];
    readonly variants: readonly AssetVariant[];
    /** The custom properties its stylesheet reads. */
    readonly tokens: readonly string[];
    /** The numbers the rulebook gives for this asset, by name; each asset's runner module says what each one measures. */
    readonly geometry: Readonly<Record<string, number>>;
    readonly accessibility: {
        readonly contrast: readonly ContrastNeed[];
        /** The focus is shown by the filled triangle; no ring and no outline. */
        /** True when keyboard focus is shown by a ring or outline; false when the asset's own fill shows it. */
        readonly focusRing: boolean;
        readonly accessibleName: string;
        /** The success criteria that apply to the asset as a whole (a card, a dialog), beyond its contrast and focus. */
        readonly criteria?: readonly Criterion[];
    };
    /** Sizes by use and screen class (the asset's own custom properties). */
    readonly sizes?: readonly SizeRow[];
    /** The asset's parts from top to bottom, with the gaps between them. */
    readonly anatomy?: readonly AnatomyPart[];
    readonly uses: readonly string[];
    /**
     * Findings the runner has measured and the owner has not decided on: the
     * app does not meet its own rule or a standard here, and nothing was
     * changed. A check named by a key here is reported as KNOWN instead of
     * failing; if it starts to pass, the runner fails until the entry is removed.
     */
    readonly knownFindings?: Readonly<Record<string, string>>;
}
