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
    };
    readonly uses: readonly string[];
    /**
     * Findings the runner has measured and the owner has not decided on: the
     * app does not meet its own rule or a standard here, and nothing was
     * changed. A check named by a key here is reported as KNOWN instead of
     * failing; if it starts to pass, the runner fails until the entry is removed.
     */
    readonly knownFindings?: Readonly<Record<string, string>>;
}
