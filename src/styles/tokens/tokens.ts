/**
 * The colour tokens: the one source of src/styles/colors.generated.css,
 * of the contrast report and of the DTCG export. Change a colour here
 * and run `npm run tokens`; the generator fails when a pair of colours
 * that meet misses its contrast in any reading mode.
 *
 * The reading modes are light, dark and sepia. Auto is not a fourth
 * set of colours: ThemeService turns it into light or dark by the
 * system's setting before the first paint, so it draws the dark or the
 * light tokens.
 *
 * Every colour the stylesheets draw with is one of these tokens; no
 * rule names a colour of its own. A token is named for its role and
 * what it colours: text-* is text, bg-* a background, line-* a border,
 * rule or ring, shadow-* a shadow. A colour used both as text and as a
 * line has one token per role, so dark mode can lighten the text and
 * keep the fill.
 *
 * What is authored here, in four parts:
 *   modeSources  every token's value, written out for each mode (dark
 *                and sepia only those that differ from light), in the
 *                groups and with the notes the CSS had;
 *   cardTint     the System colour families: a saturation and a
 *                lightness per role and mode, completed at use with
 *                the hue of the card (hue x role x mode);
 *   seeds        the four anchors of a mode: paper, ink, accent and
 *                the neutral card ground;
 *   pairs        which colours meet and the contrast each pair holds.
 *
 * The values were read from the hand-written colors.css of 2026-10-14
 * and proved equal to it (scripts/tokens/compare.mjs). They are not
 * yet derived from the seeds: that would change values.
 */
import { PALETTE } from "../../framework/engine/Palette.ts";

export const MODES = ["light", "dark", "sepia"] as const;
export type Mode = (typeof MODES)[number];

/** One declaration: the token's name (without the leading --) and its value. */
export type TokenEntry = readonly [name: string, value: string];

/** Tokens that sit together in the CSS, under one note. */
export interface TokenGroup {
    readonly note?: string;
    readonly tokens: readonly TokenEntry[];
}

/** One reading mode's block of tokens. */
export interface ModeSource {
    /** The rule's selector. Light also sits on the Business Documents, which stay on white paper in every mode. */
    readonly selector: string;
    /** The block's title (first line) and description. */
    readonly note: string;
    /** Declarations that are not tokens (color-scheme). */
    readonly properties: readonly (readonly [name: string, value: string])[];
    readonly groups: readonly TokenGroup[];
    /** Light only: tokens declared on :root alone, not on the Business Documents (they inherit the page's value in every mode). */
    readonly rootGroups?: readonly TokenGroup[];
}

/** The seven soft hues a card, Segment or Theme can take (one list with the app's). */
export const hues = PALETTE;

export const modeSources: Record<Mode, ModeSource> = {
    light: {
        selector: ":root, .business-document, .business-canvas, .business-forecast-table-wrap",
        note: "Colours\nEvery colour the stylesheets draw with is one of these tokens;\nno rule names a colour of its own. A token is named for its role\nand what it colours:\n--text-*   text           --line-*    borders, rules, rings\n--bg-*     backgrounds    --shadow-*  shadows\nA colour used both as text and as a line (the blue #0b57d0 is a\nlink, a border and a fill) has one token per role, so dark mode\ncan lighten the text and keep the fill.\n--theme-*-* are the System colour families: \"saturation\nlightness\" pairs that a rule completes with the hue of the card,\nSegment or Theme it sits in:\nhsl(var(--strategy-theme-hue, 0) var(--theme-bg-ground))\nThe hue is always one of the seven soft hues of the palette\n(src/framework/engine/Palette.ts: sky, periwinkle, teal, sage,\nlavender, rose, terracotta), so these families,\nlight and dark, are the palette's ground, tint, bar fill,\nborder and label ink.\nThe same values are declared again on the Business Documents\n\"paper\" (the Plan, the Canvas and the Forecast tables): a\ndocument stays a document, on white, in either theme.",
        properties: [],
        groups: [
            {
                note: "Text: body copy, labels, links and coloured words.",
                tokens: [
                    ["text-add", "#1f9254"],
                    ["text-added", "#166534"],
                    ["text-black", "#000"],
                    ["text-body", "#111"],
                    ["text-button-hover", "#0b57d0"],
                    ["text-caution-ink", "#78350f"],
                    ["text-danger", "#b00020"],
                    ["text-danger-alt", "#b3261e"],
                    ["text-danger-deep", "#b91c1c"],
                    ["text-deep", "#1a1a1a"],
                    ["text-default", "#111827"],
                    ["text-completed-ink", "#374151"],
                    ["text-error", "#444"],
                    ["text-error-detail", "#999"],
                    ["text-faint", "#6b7280"],
                    ["text-flag", "#9a3412"],
                    ["text-good", "#0a7d0a"],
                    ["text-holds", "#15803d"],
                    ["text-met-ink", "#14532d"],
                    ["text-muted", "#4b5563"],
                    ["text-navy", "#0f172a"],
                    ["text-note", "#5c4a12"],
                    ["text-on-fill", "#ffffff"],
                    ["text-over", "#8a0016"],
                    ["text-primary", "#0b57d0"],
                    ["text-primary-deep", "#0b3f96"],
                    ["text-primary-ink", "#0b3d91"],
                    ["text-quiet", "#9ca3af"],
                    ["text-readonly", "#3c4043"],
                    ["text-secondary", "#374151"],
                    ["text-short-ink", "#7c2d12"],
                    ["text-soft", "#333333"],
                    ["text-strong", "#1f2937"],
                    ["text-subtle", "#5f6368"],
                    ["text-totals-ok", "#0d652d"],
                    ["text-warn", "#7a2e00"],
                ]
            },
            {
                note: "Backgrounds: the page, surfaces and cards, tints, fills and chart series.",
                tokens: [
                    ["bg-add", "#1f9254"],
                    ["bg-add-tile", "#fafbfc"],
                    ["bg-add-tint", "#eafaf1"],
                    ["bg-budget", "#4f46e5"],
                    ["bg-button-hover", "#eef4ff"],
                    ["bg-canvas-highlight", "#f7f5ee"],
                    ["bg-capacity-ok", "#f1f8f4"],
                    ["bg-capacity-short", "#fdf6e7"],
                    ["bg-caution", "#b45309"],
                    ["bg-caution-tint", "#fffbeb"],
                    ["bg-chart", "#fcfcfb"],
                    ["bg-danger", "#b00020"],
                    ["bg-danger-alt", "#b3261e"],
                    ["bg-danger-deep", "#b91c1c"],
                    ["bg-danger-pressed", "#932019"],
                    ["bg-danger-strong", "#d01818"],
                    ["bg-danger-tint", "#fef2f2"],
                    ["bg-danger-tint-alt", "#fdecea"],
                    ["bg-completed-card", "#f8f9fa"],
                    ["bg-completed-ground", "#eef0f2"],
                    ["bg-completed-hover", "#e2e5e8"],
                    ["bg-faint", "#6b7280"],
                    ["bg-financial-good", "#0ca30c"],
                    ["bg-financial-grid", "#e5e4e0"],
                    ["bg-financial-in", "#2a78d6"],
                    ["bg-financial-out", "#eb6834"],
                    ["bg-financial-risk", "#d03b3b"],
                    ["bg-frost", "rgba(255,255,255,.55)"],
                    ["bg-frost-60", "rgba(255, 255, 255, 0.6)"],
                    ["bg-good", "#0a7d0a"],
                    ["bg-hairline", "#e5e7eb"],
                    ["bg-help", "#fdf9ed"],
                    ["bg-highlight", "#ecfdf3"],
                    ["bg-holds", "#f0fdf4"],
                    ["bg-hover", "#f5f5f5"],
                    ["bg-list-hover", "rgba(15, 23, 42, 0.06)"],
                    ["bg-list-selected", "rgba(15, 23, 42, 0.1)"],
                    ["bg-info", "#226bc2"],
                    ["bg-met", "#1f6b3a"],
                    ["bg-mark-preview", "#ffffff"],
                    ["bg-met-tint", "#e7f6ec"],
                    ["bg-navy", "#0f172a"],
                    ["bg-navy-hover", "#1e293b"],
                    ["bg-neutral", "#f3f4f6"],
                    ["bg-note", "#fdf8ea"],
                    ["bg-over", "#fdecee"],
                    ["bg-overlay", "rgba(0, 0, 0, 0.35)"],
                    ["bg-pace", "#f8fafc"],
                    ["bg-page", "#ffffff"],
                    ["bg-panel", "#fafafa"],
                ]
            },
            {
                note: "The neutral card ground: white boxes stand out on it; every text\ntoken keeps 4.5:1 on it (the faint one as --text-faint-on-tint).",
                tokens: [
                    ["bg-card-tint", "#f3f4f6"],
                    ["text-faint-on-tint", "#666d7a"],
                    ["bg-primary", "#0b57d0"],
                    ["bg-primary-a35", "rgba(11,87,208,.35)"],
                    ["bg-primary-faint", "#f7faff"],
                    ["bg-primary-hover", "#0847ab"],
                    ["bg-primary-hover-alt", "#0847b5"],
                    ["bg-primary-selected", "#dbe9ff"],
                    ["bg-primary-selected-hover", "#cfe1ff"],
                    ["bg-primary-tint", "#eef4ff"],
                    ["bg-primary-tint-head", "#edf4ff"],
                    ["bg-primary-tint-hover", "#eaf2ff"],
                    ["bg-quiet", "#9ca3af"],
                    ["bg-rail-bloom", "#c9ddf8"],
                    ["bg-rail-dot", "#b5d4f4"],
                    ["bg-rail-dot-hover", "#6a9be8"],
                    ["bg-status-ink", "#6485bc"],
                    ["bg-status-ink-hover", "#4f82dc"],
                    ["bg-rail-hover-ring", "#d3e3f9"],
                    ["bg-remove", "#c0392b"],
                    ["bg-remove-disabled", "#e0a29a"],
                    ["bg-retention", "#fff8f0"],
                    ["bg-series-3", "#1baf7a"],
                    ["bg-series-4", "#eda100"],
                    ["bg-series-5", "#e87ba4"],
                    ["bg-short-tint", "#fff1ea"],
                    ["bg-strong", "#1f2937"],
                ]
            },
            {
                note: "THE TOOLTIP (.app-tooltip, the rails' narrow labels, the noted\nfield's notes): a dark slate block on the white page, white\ntext (14.7:1), a soft shadow to lift it.",
                tokens: [
                    ["tooltip-bg", "#1f2937"],
                    ["tooltip-text", "#ffffff"],
                    ["tooltip-border", "#1f2937"],
                    ["tooltip-shadow", "0 4px 14px rgba(17, 24, 39, 0.28)"],
                    ["bg-surface", "#ffffff"],
                    ["bg-table", "#d9d9d9"],
                    ["bg-table-expansion", "#fafbfd"],
                    ["bg-table-head", "#f5f7fb"],
                    ["bg-total", "#f9fafb"],
                    ["bg-totals-ok", "#e6f4ea"],
                    ["bg-totals-warn", "#fce8e6"],
                    ["bg-track", "#e2e2e2"],
                    ["bg-warm", "#faf9f6"],
                    ["bg-warn", "#fdf1e7"],
                ]
            },
            {
                note: "Lines: card and box borders, rules, grid lines and focus rings.",
                tokens: [
                    ["line-add", "#1f9254"],
                    ["line-add-tile", "#b7c3d0"],
                    ["line-box", "#767676"],
                    ["line-calendar", "#e4e4e4"],
                    ["line-capacity-ok", "#2e7d4f"],
                    ["line-capacity-short", "#b7791f"],
                    ["line-card", "#c9c9c9"],
                    ["line-caution", "#b45309"],
                    ["line-chart", "#fcfcfb"],
                    ["line-danger", "#b00020"],
                ]
            },
            {
                note: "A field or card a note links to (notepad.css): calm orange, 4.6:1 on white.",
                tokens: [
                    ["line-noted", "#c05621"],
                ]
            },
            {
                note: "Its soft outer glow: static, the same orange, faint.",
                tokens: [
                    ["glow-noted", "rgba(192, 86, 33, 0.4)"],
                ]
            },
            {
                note: "Its tint: 8% of the orange in the field's white.",
                tokens: [
                    ["bg-noted", "#faf2ed"],
                    ["line-danger-a18", "rgba(176, 0, 32, .18)"],
                    ["line-danger-alt", "#b3261e"],
                    ["line-danger-deep", "#b91c1c"],
                    ["line-danger-strong", "#d01818"],
                    ["line-disabled", "#9aa3ae"],
                    ["line-capability-input", "#767676"],
                    ["line-divider", "#d1d5db"],
                    ["line-completed", "#868c95"],
                    ["line-completed-ink", "#374151"],
                    ["line-faint", "#6b7280"],
                    ["line-financial-balance", "#3f3f3c"],
                    ["line-financial-grid", "#e5e4e0"],
                    ["line-good", "#0a7d0a"],
                    ["line-grid", "#d7d7d7"],
                    ["line-group", "#9aa0a6"],
                    ["line-hairline", "#e5e7eb"],
                    ["line-heading-rule", "#d6d6d6"],
                    ["line-holds", "#15803d"],
                    ["line-input-soft", "#8a8f98"],
                    ["line-met", "#1f6b3a"],
                    ["line-navy", "#0f172a"],
                    ["line-note", "#e0c98a"],
                    ["line-pace", "#c7d2fe"],
                    ["line-picker", "#e3e6ea"],
                    ["line-primary", "#0b57d0"],
                    ["line-primary-a18", "rgba(11, 87, 208, 0.18)"],
                    ["line-primary-a22", "rgba(11,87,208,.22)"],
                    ["line-primary-a25", "rgba(11, 87, 208, 0.25)"],
                    ["line-primary-soft", "#8ab4f8"],
                    ["line-quiet", "#9ca3af"],
                    ["line-retention", "#f0dfc8"],
                    ["line-rule", "#ececec"],
                    ["line-sheet", "#d6d3cc"],
                    ["line-short", "#c2410c"],
                    ["line-slate", "#94a3b8"],
                    ["line-table", "#d9d9d9"],
                    ["line-totals", "#c7cddb"],
                    ["line-warn", "#e8b48f"],
                    ["line-warning-units", "#f0c4cb"],
                ]
            },
            {
                note: "Shadows and their tints.",
                tokens: [
                    ["shadow-08", "rgba(0, 0, 0, .08)"],
                    ["shadow-12", "rgb(0 0 0 / 0.12)"],
                    ["shadow-18", "rgba(0, 0, 0, 0.18)"],
                    ["shadow-ink-08", "rgba(17,24,39,.08)"],
                    ["shadow-ink-12", "rgba(17,24,39,.12)"],
                    ["shadow-ink-16", "rgba(17,24,39,.16)"],
                    ["shadow-ink-18", "rgba(17, 24, 39, .18)"],
                ]
            },
            {
                note: "The second colour of a striped / cross-hatched action mark (global.css, .tint-pattern-*):\nthe opposite end of the lightness scale from the mark ink, >= 3:1 on the card ground.",
                tokens: [
                    ["pattern-alt", "hsl(222 30% 12%)"],
                ]
            },
            {
                note: "A System ground -- a card, a tint inside it, a Roadmap bar --\nis its hue mixed toward the page's paper by this much:\ncolor-mix(in srgb, hsl(hue var(--theme-bg-ground))\nvar(--theme-ground-weight), var(--theme-ground-paper))\nAll of it in light and dark, so the ground is drawn as it is;\nthe sepia theme takes part of it, so each card sits warm on\nthe paper instead of standing on it as a cold tint.",
                tokens: [
                    ["theme-ground-weight", "100%"],
                    ["theme-ground-paper", "#ffffff"],
                ]
            },
            {
                note: "A Capability or System colour used as text or a thin line is\nmixed toward the base by this much: all of it in light mode,\nso the colour is drawn as it is.",
                tokens: [
                    ["capability-ink-weight", "100%"],
                    ["capability-ink-base", "#ffffff"],
                ]
            },
            {
                note: "The same for a System's TITLE (the interview header's), which\nhas to hold 4.5:1 on the page and read as the page's ink:\nin light, the colour as it is.",
                tokens: [
                    ["capability-title-weight", "100%"],
                    ["capability-title-base", "#ffffff"],
                ]
            },
            {
                note: "A Capability or System row's text, in every list of them (the\nCapability and System lists, the rail's flyouts): its colour\ntaken 15% toward black, which holds all six Capability colours\nat 4.8:1 and more on every ground those rows stand on -- white,\nthe rail's light-blue panel, and the hover and selected grounds\nbelow on either.",
                tokens: [
                    ["capability-list-ink-weight", "85%"],
                    ["capability-list-ink-base", "#000000"],
                ]
            },
        ],
        rootGroups: [
            {
                note: "TITLES AND CAPTIONS THAT TIRE THE EYE LEAST (app-wide): the ink of a title (the page title, a column title, a section heading, a tile or box title,\na dialog title) and of a floating card's caption. Not the extremes of the theme (#111827 on white was 17.7:1, #e6e8eb on the dark page 13.8:1, the\ncaption's white on the dark scrim 20:1): a step softer, each about 10:1 to 12:1 on its ground (not over 13:1), never under 4.5:1. Body text keeps\nits own ink (--text-default). docs/ai/layout-rules.md, \"Titles and captions\".",
                tokens: [
                    ["title-ink", "#303a49"],
                ]
            },
        ]
    },
    dark: {
        selector: ":root[data-theme=\"dark\"]",
        note: "Dark\nThe same tokens for the dark theme, set when <html> carries\ndata-theme=\"dark\" (ThemeService: the user's choice, or the\nsystem's under Auto). Dark neutrals, not black: the page at\n#121417 and cards a step lighter; text light enough for 4.5:1 on\nthe grounds it sits on. Every System colour keeps its hue: its\ngrounds and tints go dark, its text and lines go light, and a\nfilled bar or button keeps the fill that carries white text.\ncolor-scheme makes the native parts -- selects, date pickers,\ncheckboxes -- dark too.",
        properties: [["color-scheme", "dark"]],
        groups: [
            {
                note: "Text: body copy, labels, links and coloured words.",
                tokens: [
                    ["text-add", "#60c284"],
                    ["text-added", "#8ad49c"],
                    ["text-black", "#e8e8e8"],
                    ["text-body", "#e3e5e8"],
                    ["text-button-hover", "#e6e8eb"],
                    ["text-caution-ink", "#feb08b"],
                    ["text-danger", "#ff9b96"],
                    ["text-danger-alt", "#fe9688"],
                    ["text-danger-deep", "#ff9588"],
                    ["text-deep", "#e5e5e5"],
                    ["text-default", "#e6e8eb"],
                    ["text-completed-ink", "#d1d5db"],
                    ["text-error", "#c9c9c9"],
                    ["text-error-detail", "#9b9b9b"],
                    ["text-faint", "#acafb5"],
                    ["text-flag", "#ffa084"],
                    ["text-good", "#82cb7d"],
                    ["text-holds", "#71ca86"],
                    ["text-met-ink", "#9cdaad"],
                    ["text-muted", "#bcc0c7"],
                    ["text-navy", "#e1e7f2"],
                    ["text-note", "#d7c38c"],
                    ["text-on-fill", "#ffffff"],
                    ["text-over", "#ffb0aa"],
                    ["text-primary", "#8ab4f8"],
                    ["text-primary-deep", "#aac9fe"],
                    ["text-primary-ink", "#accbfe"],
                    ["text-quiet", "#93969b"],
                    ["text-readonly", "#cbccce"],
                    ["text-secondary", "#c7ccd4"],
                    ["text-short-ink", "#feb097"],
                    ["text-soft", "#d4d4d4"],
                    ["text-strong", "#d6dbe3"],
                    ["text-subtle", "#b6b8ba"],
                    ["text-totals-ok", "#87d697"],
                    ["text-warn", "#feb190"],
                ]
            },
            {
                note: "Backgrounds: the page, surfaces and cards, tints, fills and chart series.",
                tokens: [
                    ["bg-add", "#1f9254"],
                    ["bg-add-tile", "#202021"],
                    ["bg-add-tint", "#202522"],
                    ["bg-budget", "#4f46e5"],
                    ["bg-button-hover", "#1c2940"],
                    ["bg-canvas-highlight", "#242321"],
                    ["bg-capacity-ok", "#212322"],
                    ["bg-capacity-short", "#24221e"],
                    ["bg-caution", "#b45309"],
                    ["bg-caution-tint", "#22201c"],
                    ["bg-chart", "#1d2023"],
                    ["bg-danger", "#b00020"],
                    ["bg-danger-alt", "#b3261e"],
                    ["bg-danger-deep", "#b91c1c"],
                    ["bg-danger-pressed", "#932019"],
                    ["bg-danger-strong", "#d01818"],
                    ["bg-danger-tint", "#262222"],
                    ["bg-danger-tint-alt", "#2a2524"],
                    ["bg-completed-card", "#1f2022"],
                    ["bg-completed-ground", "#25272a"],
                    ["bg-completed-hover", "#2e3135"],
                    ["bg-faint", "#6f7277"],
                    ["bg-financial-good", "#019c03"],
                    ["bg-financial-grid", "#2d2d2c"],
                    ["bg-financial-in", "#2a78d6"],
                    ["bg-financial-out", "#d25117"],
                    ["bg-financial-risk", "#d03b3b"],
                    ["bg-frost", "rgba(18, 20, 23, 0.72)"],
                    ["bg-frost-60", "rgba(26, 29, 33, 0.6)"],
                    ["bg-good", "#0a7d0a"],
                    ["bg-hairline", "#2a2b2c"],
                    ["bg-help", "#22211e"],
                    ["bg-highlight", "#1e2320"],
                    ["bg-holds", "#1f2220"],
                    ["bg-hover", "#232323"],
                    ["bg-list-hover", "rgba(255, 255, 255, 0.06)"],
                    ["bg-list-selected", "rgba(255, 255, 255, 0.1)"],
                    ["bg-info", "#226bc2"],
                    ["bg-met", "#1f6b3a"],
                    ["bg-mark-preview", "#f4f5f7"],
                    ["bg-met-tint", "#222724"],
                    ["bg-navy", "#444851"],
                    ["bg-navy-hover", "#434850"],
                    ["bg-neutral", "#242424"],
                    ["bg-note", "#23221e"],
                    ["bg-over", "#292425"],
                    ["bg-overlay", "rgba(0, 0, 0, 0.6)"],
                    ["bg-pace", "#202121"],
                    ["bg-page", "#121417"],
                    ["bg-panel", "#212121"],
                ]
            },
            {
                note: "The neutral card ground: white boxes stand out on it; every text\ntoken keeps 4.5:1 on it (the faint one as --text-faint-on-tint).",
                tokens: [
                    ["bg-card-tint", "#23272c"],
                    ["text-faint-on-tint", "#acafb5"],
                    ["bg-primary", "#2563d8"],
                    ["bg-primary-a35", "rgba(11, 87, 208, 0.35)"],
                    ["bg-primary-faint", "#202122"],
                    ["bg-primary-hover", "#3b74e0"],
                    ["bg-primary-hover-alt", "#3b74e0"],
                    ["bg-primary-selected", "#272b31"],
                    ["bg-primary-selected-hover", "#202f48"],
                    ["bg-primary-tint", "#222427"],
                    ["bg-primary-tint-head", "#222428"],
                    ["bg-primary-tint-hover", "#232629"],
                    ["bg-quiet", "#7e8085"],
                    ["bg-rail-bloom", "#22334a"],
                    ["bg-rail-dot", "#233a51"],
                    ["bg-rail-dot-hover", "#5b8ce8"],
                    ["bg-status-ink", "#4f6f96"],
                    ["bg-status-ink-hover", "#5b8ce8"],
                    ["bg-rail-hover-ring", "#2b4468"],
                    ["bg-remove", "#c0392b"],
                    ["bg-remove-disabled", "#a96f68"],
                    ["bg-retention", "#23211f"],
                    ["bg-series-3", "#039868"],
                    ["bg-series-4", "#ab7305"],
                    ["bg-series-5", "#c05781"],
                    ["bg-short-tint", "#272321"],
                    ["bg-strong", "#3a414c"],
                ]
            },
            {
                note: "The tooltip in dark: LIGHT on the dark page, so it stands off\nit (a grey block blended in), dark ink on it (14.9:1), a\ndarker shadow under it.",
                tokens: [
                    ["tooltip-bg", "#e6e8eb"],
                    ["tooltip-text", "#111827"],
                    ["tooltip-border", "#ffffff"],
                    ["tooltip-shadow", "0 6px 18px rgba(0, 0, 0, 0.7)"],
                    ["bg-surface", "#1a1d21"],
                    ["bg-table", "#333333"],
                    ["bg-table-expansion", "#202021"],
                    ["bg-table-head", "#222223"],
                    ["bg-total", "#202121"],
                    ["bg-totals-ok", "#232725"],
                    ["bg-totals-warn", "#2c2625"],
                    ["bg-track", "#2e2e2e"],
                    ["bg-warm", "#212120"],
                    ["bg-warn", "#272421"],
                ]
            },
            {
                note: "Lines: card and box borders, rules, grid lines and focus rings.",
                tokens: [
                    ["line-add", "#42ad6d"],
                    ["line-add-tile", "#4d5156"],
                    ["line-box", "#80868f"],
                    ["line-calendar", "#414141"],
                    ["line-capacity-ok", "#63b17f"],
                    ["line-capacity-short", "#be7f28"],
                    ["line-card", "#4d4d4d"],
                    ["line-caution", "#dd7c43"],
                    ["line-chart", "#1d2023"],
                    ["line-danger", "#f07f7a"],
                    ["line-noted", "#e8914a"],
                    ["glow-noted", "rgba(232, 145, 74, 0.28)"],
                    ["bg-noted", "#372d27"],
                    ["line-danger-a18", "rgba(240, 127, 122, 0.18)"],
                    ["line-danger-alt", "#ec7c6e"],
                    ["line-danger-deep", "#eb7b6f"],
                    ["line-danger-strong", "#e47568"],
                    ["line-disabled", "#83868b"],
                    ["line-capability-input", "#686d75"],
                    ["line-divider", "#686d75"],
                    ["line-completed", "#6f747c"],
                    ["line-completed-ink", "#c4c8ce"],
                    ["line-faint", "#979aa0"],
                    ["line-financial-balance", "#b6b6b5"],
                    ["line-financial-grid", "#414140"],
                    ["line-good", "#68b562"],
                    ["line-grid", "#474747"],
                    ["line-group", "#848689"],
                    ["line-hairline", "#3f4041"],
                    ["line-heading-rule", "#474747"],
                    ["line-holds", "#55b56e"],
                    ["line-input-soft", "#898b8e"],
                    ["line-met", "#71ba84"],
                    ["line-navy", "#cbd0db"],
                    ["line-note", "#574b2c"],
                    ["line-pace", "#404663"],
                    ["line-picker", "#3f4042"],
                    ["line-primary", "#7aa7f5"],
                    ["line-primary-a18", "rgba(110, 161, 249, 0.18)"],
                    ["line-primary-a22", "rgba(110, 161, 249, 0.22)"],
                    ["line-primary-a25", "rgba(110, 161, 249, 0.25)"],
                    ["line-primary-soft", "#475874"],
                    ["line-quiet", "#84868b"],
                    ["line-retention", "#47413a"],
                    ["line-rule", "#3d3d3d"],
                    ["line-sheet", "#494846"],
                    ["line-short", "#e17756"],
                    ["line-slate", "#81878f"],
                    ["line-table", "#464646"],
                    ["line-totals", "#494b50"],
                    ["line-warn", "#674a36"],
                    ["line-warning-units", "#613e44"],
                ]
            },
            {
                note: "Shadows and their tints.",
                tokens: [
                    ["shadow-08", "rgba(0, 0, 0, 0.2)"],
                    ["shadow-12", "rgba(0, 0, 0, 0.3)"],
                    ["shadow-18", "rgba(0, 0, 0, 0.45)"],
                    ["shadow-ink-08", "rgba(0, 0, 0, 0.2)"],
                    ["shadow-ink-12", "rgba(0, 0, 0, 0.3)"],
                    ["shadow-ink-16", "rgba(0, 0, 0, 0.4)"],
                    ["shadow-ink-18", "rgba(0, 0, 0, 0.45)"],
                ]
            },
            {
                note: "Borders, rules and rings.",
                tokens: [
                    ["pattern-alt", "hsl(40 20% 94%)"],
                ]
            },
            {
                note: "A Capability's colour (navy, green, brown, blue, orange,\npurple) is dark: as text or a line it is mixed halfway to\nwhite, so it reads on the dark ground and keeps its hue.",
                tokens: [
                    ["capability-ink-weight", "45%"],
                    ["capability-ink-base", "#ffffff"],
                ]
            },
            {
                note: "A System's title: mostly the ink, a fifth of its Capability's\ncolour -- the navy Foundation's came out a mid grey half way to\nwhite. 9.9:1 or more on the page for all six.",
                tokens: [
                    ["capability-title-weight", "20%"],
                    ["capability-title-base", "var(--text-default)"],
                ]
            },
            {
                note: "Taken 65% toward white: the navy Foundation, the darkest, holds\n5.1:1 on the selected ground over the rail's panel.",
                tokens: [
                    ["capability-list-ink-weight", "35%"],
                    ["capability-list-ink-base", "#ffffff"],
                    ["select-chevron", "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' fill='none' stroke='%23e6e8eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")"],
                ]
            },
            {
                tokens: [
                    ["title-ink", "#cdd1d8"],
                    ["floating-caption-ink", "#cdd1d8"],
                ]
            },
        ]
    },
    sepia: {
        selector: ":root[data-theme=\"sepia\"]",
        note: "Sepia\nThe paper theme, set when <html> carries data-theme=\"sepia\" (the\nswitch's Sepia; Auto never picks it). A warm, low-glare reading\nground like natural paper: the page #f4ebdd, cards #fbf5ea, ink\n#3b2f25 and a warm brown for secondary text, every text at 4.5:1\non the grounds it sits on. The app's blue becomes a muted ink blue\n(#3e5f7e, white on it 6.6:1); success, warning and danger go warm\nand muted; neutrals, the completed grey and the highlights take\nthe paper's warmth. Every System colour keeps its hue, its inks\nand lines a little less saturated, and its grounds mixed 38%\ntoward the paper (--theme-ground-weight), so a card sits warm on\nthe page instead of standing on it as a cold pastel. Native\ncontrols stay light.",
        properties: [["color-scheme", "light"]],
        groups: [
            {
                note: "A System's title: four fifths of its Capability's colour, the\nrest the sepia ink -- as drawn, the brown and orange Capability\ncolours fell to 4.3:1 on the paper. 5.2:1 or more for all six.",
                tokens: [
                    ["capability-title-weight", "80%"],
                    ["capability-title-base", "var(--text-default)"],
                ]
            },
            {
                note: "Text: body copy, labels, links and coloured words.",
                tokens: [
                    ["text-add", "#4d845f"],
                    ["text-added", "#33593d"],
                    ["text-black", "#2e241b"],
                    ["text-body", "#3b2f25"],
                    ["text-button-hover", "#3a5a78"],
                    ["text-caution-ink", "#623b28"],
                    ["text-danger", "#8d3837"],
                    ["text-danger-alt", "#91433a"],
                    ["text-danger-deep", "#95423a"],
                    ["text-deep", "#33281f"],
                    ["text-default", "#3b2f25"],
                    ["text-completed-ink", "#5c4f41"],
                    ["text-error", "#5e5143"],
                    ["text-error-detail", "#897b6c"],
                    ["text-faint", "#7a6653"],
                    ["text-flag", "#7d4331"],
                    ["text-good", "#3b6f38"],
                    ["text-holds", "#40734c"],
                    ["text-met-ink", "#294932"],
                    ["text-muted", "#6a5745"],
                    ["text-navy", "#45392c"],
                    ["text-note", "#50462a"],
                    ["text-on-fill", "#ffffff"],
                    ["text-over", "#6d2928"],
                    ["text-primary", "#3a5a78"],
                    ["text-primary-deep", "#234071"],
                    ["text-primary-ink", "#223d6d"],
                    ["text-quiet", "#8e7f71"],
                    ["text-readonly", "#5c4e41"],
                    ["text-secondary", "#5c4f41"],
                    ["text-short-ink", "#643628"],
                    ["text-soft", "#55483a"],
                    ["text-strong", "#3b2f25"],
                    ["text-subtle", "#6e5c4b"],
                    ["text-totals-ok", "#305939"],
                    ["text-warn", "#623623"],
                ]
            },
            {
                note: "Backgrounds: the page, surfaces and cards, tints, fills and chart series.",
                tokens: [
                    ["bg-add", "#4d845f"],
                    ["bg-add-tile", "#f2e5d4"],
                    ["bg-add-tint", "#ece0cf"],
                    ["bg-budget", "#4f55ad"],
                    ["bg-button-hover", "#eadecd"],
                    ["bg-canvas-highlight", "#ecdfcf"],
                    ["bg-capacity-ok", "#ede0d0"],
                    ["bg-capacity-short", "#ede1d0"],
                    ["bg-caution", "#965d3e"],
                    ["bg-caution-tint", "#f1e5d4"],
                    ["bg-chart", "#f8f0e3"],
                    ["bg-danger", "#8d3837"],
                    ["bg-danger-alt", "#91433a"],
                    ["bg-danger-deep", "#95423a"],
                    ["bg-danger-pressed", "#76362e"],
                    ["bg-danger-strong", "#a8493f"],
                    ["bg-danger-tint", "#ecdfcf"],
                    ["bg-danger-tint-alt", "#e7dbca"],
                    ["bg-completed-card", "#f0e3d3"],
                    ["bg-completed-ground", "#e7daca"],
                    ["bg-completed-hover", "#dbcfbf"],
                    ["bg-faint", "#766859"],
                    ["bg-financial-good", "#50934c"],
                    ["bg-financial-grid", "#dbcebe"],
                    ["bg-financial-in", "#4b75ab"],
                    ["bg-financial-out", "#c6795d"],
                    ["bg-financial-risk", "#ab5651"],
                    ["bg-frost", "rgba(244, 235, 221, 0.6)"],
                    ["bg-frost-60", "rgba(251, 245, 234, 0.6)"],
                    ["bg-good", "#3b6f38"],
                    ["bg-hairline", "#ded1c1"],
                    ["bg-help", "#f0e3d3"],
                    ["bg-highlight", "#efe2d2"],
                    ["bg-holds", "#f0e3d3"],
                    ["bg-hover", "#ecdfcf"],
                    ["bg-list-hover", "rgba(59, 47, 37, 0.06)"],
                    ["bg-list-selected", "rgba(59, 47, 37, 0.1)"],
                    ["bg-info", "#41689a"],
                    ["bg-met", "#395f43"],
                    ["bg-mark-preview", "#ffffff"],
                    ["bg-met-tint", "#e8dccb"],
                    ["bg-navy", "#3b2f25"],
                    ["bg-navy-hover", "#4a3b2e"],
                    ["bg-neutral", "#ebdece"],
                    ["bg-note", "#efe2d2"],
                    ["bg-over", "#e7dbcb"],
                    ["bg-overlay", "rgba(40, 28, 16, 0.35)"],
                    ["bg-pace", "#f0e4d3"],
                    ["bg-page", "#f4ebdd"],
                    ["bg-panel", "#f1e4d4"],
                ]
            },
            {
                note: "The neutral card ground: white boxes stand out on it; every text\ntoken keeps 4.5:1 on it (the faint one as --text-faint-on-tint).",
                tokens: [
                    ["bg-card-tint", "#f3e8d8"],
                    ["text-faint-on-tint", "#75614e"],
                    ["bg-primary", "#3e5f7e"],
                    ["bg-primary-a35", "rgba(62, 95, 126, 0.35)"],
                    ["bg-primary-faint", "#f0e4d3"],
                    ["bg-primary-hover", "#334f69"],
                    ["bg-primary-hover-alt", "#334f69"],
                    ["bg-primary-selected", "#ece3d6"],
                    ["bg-primary-selected-hover", "#cfdaec"],
                    ["bg-primary-tint", "#eadecd"],
                    ["bg-primary-tint-head", "#eadecd"],
                    ["bg-primary-tint-hover", "#e8dccb"],
                    ["bg-quiet", "#8e7f71"],
                    ["bg-rail-bloom", "#cad6e6"],
                    ["bg-rail-dot", "#baccdf"],
                    ["bg-rail-dot-hover", "#7996c3"],
                    ["bg-status-ink", "#627e9b"],
                    ["bg-status-ink-hover", "#5e7cb0"],
                    ["bg-rail-hover-ring", "#d8ccbc"],
                    ["bg-remove", "#9d5045"],
                    ["bg-remove-disabled", "#c9a39e"],
                    ["bg-retention", "#f0e3d3"],
                    ["bg-series-3", "#5c9f7f"],
                    ["bg-series-4", "#d0a364"],
                    ["bg-series-5", "#c9879e"],
                    ["bg-short-tint", "#ebdece"],
                    ["bg-strong", "#3b2f25"],
                ]
            },
            {
                note: "The tooltip in sepia: the sepia ink as its ground, the paper\nas its text (12.2:1), a warm shadow.",
                tokens: [
                    ["tooltip-bg", "#3b2f25"],
                    ["tooltip-text", "#fbf5ea"],
                    ["tooltip-border", "#3b2f25"],
                    ["tooltip-shadow", "0 4px 14px rgba(59, 47, 37, 0.32)"],
                    ["bg-surface", "#fbf5ea"],
                    ["bg-table", "#d0c4b4"],
                    ["bg-table-expansion", "#f2e5d5"],
                    ["bg-table-head", "#eee1d1"],
                    ["bg-total", "#f1e4d4"],
                    ["bg-totals-ok", "#e6daca"],
                    ["bg-totals-warn", "#e4d8c7"],
                    ["bg-track", "#d9cdbc"],
                    ["bg-warm", "#f0e3d3"],
                    ["bg-warn", "#eadecd"],
                ]
            },
            {
                note: "Lines: card and box borders, rules, grid lines and focus rings.",
                tokens: [
                    ["line-add", "#4d845f"],
                    ["line-add-tile", "#b9ad9d"],
                    ["line-box", "#8f7b66"],
                    ["line-calendar", "#dbcfbe"],
                    ["line-capacity-ok", "#477155"],
                    ["line-capacity-short", "#9f7a4f"],
                    ["line-card", "#c0b4a4"],
                    ["line-caution", "#965d3e"],
                    ["line-chart", "#f8f0e3"],
                    ["line-danger", "#8d3837"],
                    ["line-noted", "#a8541c"],
                    ["glow-noted", "rgba(168, 84, 28, 0.4)"],
                    ["bg-noted", "#f4e8da"],
                    ["line-danger-a18", "rgba(141, 56, 55, 0.18)"],
                    ["line-danger-alt", "#91433a"],
                    ["line-danger-deep", "#95423a"],
                    ["line-danger-strong", "#a8493f"],
                    ["line-disabled", "#8e7f70"],
                    ["line-capability-input", "#8f7b66"],
                    ["line-divider", "#ccbfaf"],
                    ["line-completed", "#837466"],
                    ["line-completed-ink", "#5c4f41"],
                    ["line-faint", "#766859"],
                    ["line-financial-balance", "#5b4e40"],
                    ["line-financial-grid", "#dbcebe"],
                    ["line-good", "#3b6f38"],
                    ["line-grid", "#cec2b2"],
                    ["line-group", "#8c7e6f"],
                    ["line-hairline", "#ded1c1"],
                    ["line-heading-rule", "#cdc1b1"],
                    ["line-holds", "#40734c"],
                    ["line-input-soft", "#847667"],
                    ["line-met", "#395f43"],
                    ["line-navy", "#45392c"],
                    ["line-note", "#d1c49f"],
                    ["line-pace", "#c6cde7"],
                    ["line-picker", "#ddd0c0"],
                    ["line-primary", "#3e5f7e"],
                    ["line-primary-a18", "rgba(62, 95, 126, 0.18)"],
                    ["line-primary-a22", "rgba(62, 95, 126, 0.22)"],
                    ["line-primary-a25", "rgba(62, 95, 126, 0.25)"],
                    ["line-primary-soft", "#95aed6"],
                    ["line-quiet", "#8e7f71"],
                    ["line-retention", "#d8ccbc"],
                    ["line-rule", "#e2d3bd"],
                    ["line-sheet", "#cabeae"],
                    ["line-short", "#9f553e"],
                    ["line-slate", "#8d7f70"],
                    ["line-table", "#d0c4b4"],
                    ["line-totals", "#c4b8a8"],
                    ["line-warn", "#d2b39d"],
                    ["line-warning-units", "#dec3c7"],
                ]
            },
            {
                note: "Shadows and their tints.",
                tokens: [
                    ["shadow-08", "rgba(43, 31, 19, 0.08)"],
                    ["shadow-12", "rgba(43, 31, 19, 0.12)"],
                    ["shadow-18", "rgba(43, 31, 19, 0.18)"],
                    ["shadow-ink-08", "rgba(70, 57, 44, 0.08)"],
                    ["shadow-ink-12", "rgba(70, 57, 44, 0.12)"],
                    ["shadow-ink-16", "rgba(70, 57, 44, 0.16)"],
                    ["shadow-ink-18", "rgba(70, 57, 44, 0.18)"],
                ]
            },
            {
                note: "Borders, rules and rings.",
                tokens: [
                    ["pattern-alt", "hsl(28 40% 12%)"],
                ]
            },
            {
                note: "A System ground: 62% its hue, the rest the page's paper.",
                tokens: [
                    ["theme-ground-weight", "62%"],
                    ["theme-ground-paper", "#f4ebdd"],
                    ["select-chevron", "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' fill='none' stroke='%233b2f25' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")"],
                ]
            },
            {
                tokens: [
                    ["title-ink", "#3b2f25"],
                ]
            },
        ]
    },
};

export const cardTint: Record<string, Partial<Record<Mode, readonly [saturation: number, lightness: number]>>> = {
    "theme-text-accent-deeper": { light: [45, 26], dark: [45, 83.1], sepia: [34, 25] },
    "theme-text-bar-ink": { light: [90, 20], dark: [45, 87], sepia: [45, 21] },
    "theme-text-ink": { light: [28, 34], dark: [28, 77.9], sepia: [24, 31] },
    "theme-text-ink-deep": { light: [28, 30], dark: [28, 80.5], sepia: [24, 28] },
    "theme-bg-accent-deep": { light: [45, 30], dark: [45, 30], sepia: [32, 32] },
    "theme-bg-bar": { light: [62, 84], dark: [28, 23.8], sepia: [62, 84] },
    "theme-bg-bar-hover": { light: [62, 76], dark: [28, 28.2], sepia: [62, 76] },
    "theme-bg-bar-open": { light: [62, 20], dark: [62, 20], sepia: [40, 24] },
    "theme-bg-card-wash": { light: [40, 98], dark: [18, 16.1], sepia: [40, 98] },
    "theme-bg-edge": { light: [24, 44], dark: [24, 44], sepia: [20, 42] },
    "theme-bg-ground": { light: [62, 96], dark: [28, 17.2], sepia: [62, 96] },
    "theme-bg-ground-alt": { light: [62, 95], dark: [28, 17.8], sepia: [62, 95] },
    "theme-bg-hover": { light: [62, 88], dark: [28, 21.6], sepia: [62, 88] },
    "theme-bg-initiative": { light: [55, 82], dark: [25, 24.9], sepia: [55, 82] },
    "theme-bg-ink": { light: [28, 34], dark: [28, 34], sepia: [24, 33] },
    "theme-bg-inner": { light: [62, 92], dark: [28, 19.4], sepia: [62, 92] },
    "theme-bg-meter": { light: [30, 84], dark: [14, 23.8], sepia: [30, 84] },
    "theme-bg-pill": { light: [62, 93], dark: [28, 18.9], sepia: [62, 93] },
    "theme-bg-raised": { light: [62, 94], dark: [28, 18.3], sepia: [62, 94] },
    "theme-bg-result-wash": { light: [40, 97], dark: [18, 16.6], sepia: [40, 97] },
    "theme-bg-wash": { light: [62, 98], dark: [28, 16.1], sepia: [62, 98] },
    "theme-line-accent": { light: [45, 34], dark: [40, 67.6], sepia: [34, 34] },
    "theme-line-accent-deep": { light: [45, 30], dark: [40, 70], sepia: [34, 30] },
    "theme-line-accent-deeper": { light: [45, 26], dark: [40, 72.4], sepia: [34, 26] },
    "theme-line-bar-edge": { light: [40, 34], dark: [40, 67.6], sepia: [30, 36] },
    "theme-line-bar-open": { light: [62, 20], dark: [40, 76], sepia: [40, 24] },
    "theme-line-edge": { light: [24, 44], dark: [24, 61.6], sepia: [20, 44] },
    "theme-line-edge-light": { light: [24, 70], dark: [14, 42], sepia: [20, 66] },
    "theme-line-edge-soft": { light: [24, 62], dark: [24, 50.8], sepia: [20, 58] },
    "theme-line-ink": { light: [28, 34], dark: [28, 67.6], sepia: [24, 33] },
    "theme-mark-ink": { light: [62, 38], dark: [62, 64], sepia: [55, 36] },
    "theme-line-meter": { light: [30, 84], dark: [18, 33.6], sepia: [24, 78] },
    "theme-line-result-edge": { light: [40, 44], dark: [40, 61.6], sepia: [30, 44] },
    "theme-line-rule": { light: [24, 80], dark: [14, 36], sepia: [20, 76] },
    "theme-line-rule-light": { light: [24, 84], dark: [14, 33.6], sepia: [20, 80] },
};

/**
 * The grounds the stylesheets mix toward the page's paper by
 * --theme-ground-weight (all of it in light and dark, 62% in sepia).
 */
export const mixedGrounds: readonly string[] = [
    "theme-bg-wash", "theme-bg-ground", "theme-bg-ground-alt", "theme-bg-raised", "theme-bg-pill", "theme-bg-inner",
    "theme-bg-hover", "theme-bg-card-wash", "theme-bg-result-wash", "theme-bg-meter", "theme-bg-bar", "theme-bg-bar-hover",
    "theme-bg-initiative"
];

/** The four anchors of each mode, by token name. */
export const seeds: Record<Mode, { paper: string; ink: string; accent: string; neutral: string }> = {
    light: { paper: "bg-page", ink: "text-body", accent: "text-primary", neutral: "bg-card-tint" },
    dark: { paper: "bg-page", ink: "text-body", accent: "text-primary", neutral: "bg-card-tint" },
    sepia: { paper: "bg-page", ink: "text-body", accent: "text-primary", neutral: "bg-card-tint" }
};

/** Two colours that meet: ink drawn on ground. 4.5 for text, 3 for marks and borders. */
export interface Pair {
    readonly id: string;
    readonly ink: string;
    readonly ground: string;
    /** A translucent ground lies on this token (the paper by default). */
    readonly under?: string;
    readonly min: 3 | 4.5;
    readonly kind: "text" | "mark" | "border";
    readonly why: string;
}

/** Two card-tint roles that meet, measured for every palette hue. */
export interface TintPair {
    readonly id: string;
    readonly ink: string;
    readonly ground: string;
    readonly min: 3 | 4.5;
    readonly kind: "text" | "mark" | "border";
    readonly why: string;
}



/* Text is 4.5:1 (WCAG 1.4.3); a mark, a box's border or a ring that has to be seen is 3:1 (1.4.11). */
const text = (ink: string, ground: string, why: string): Pair => ({ id: ink + " on " + ground, ink, ground, min: 4.5, kind: "text", why });
const mark = (ink: string, ground: string, why: string): Pair => ({ id: ink + " on " + ground, ink, ground, min: 3, kind: "mark", why });

export const pairs: readonly Pair[] = [
    text("text-body", "bg-page", "body copy on the page"),
    text("text-body", "bg-surface", "body copy on a surface"),
    text("text-body", "bg-card-tint", "body copy on the neutral card ground"),
    text("text-body", "bg-hover", "body copy on a hovered row"),
    text("text-default", "bg-page", "default text on the page"),
    text("title-ink", "bg-page", "titles and captions on the page"),
    text("text-strong", "bg-page", "strong text on the page"),
    text("text-secondary", "bg-page", "secondary text on the page"),
    text("text-muted", "bg-page", "muted text on the page"),
    text("text-muted", "bg-card-tint", "muted text on the neutral card ground"),
    text("text-subtle", "bg-page", "subtle text on the page"),
    text("text-faint", "bg-page", "faint text on the page"),
    text("text-faint-on-tint", "bg-card-tint", "faint text on the neutral card ground (its own token for this ground)"),
    text("text-primary", "bg-page", "links on the page"),
    text("text-primary", "bg-card-tint", "links on the neutral card ground"),
    text("text-primary", "bg-primary-tint", "links on the blue tint"),
    text("text-danger", "bg-page", "error text on the page"),
    text("text-danger", "bg-card-tint", "error text and the remove x on the neutral card ground"),
    text("text-good", "bg-page", "good-news text on the page"),
    text("text-holds", "bg-page", "'holds' text on the page"),
    text("text-warn", "bg-page", "warning text on the page"),
    text("text-flag", "bg-page", "flag text on the page"),
    text("text-note", "bg-note", "a note's text on its ground"),
    text("text-over", "bg-over", "'over' text on its ground"),
    text("text-caution-ink", "bg-caution-tint", "caution text on its tint"),
    text("text-met-ink", "bg-met-tint", "'met' text on its tint"),
    text("text-completed-ink", "bg-completed-card", "text on a completed card"),
    text("text-on-fill", "bg-primary", "white on the primary fill"),
    text("text-on-fill", "bg-danger", "white on the danger fill"),
    text("text-on-fill", "bg-navy", "white on the navy fill"),
    text("text-on-fill", "bg-good", "white on the good fill"),
    text("text-on-fill", "bg-met", "white on the 'met' fill"),
    text("text-on-fill", "bg-caution", "white on the caution fill"),
    text("text-on-fill", "bg-strong", "white on the strong fill"),
    text("text-on-fill", "bg-info", "white on the info fill"),
    text("text-on-fill", "bg-remove", "white on the remove fill"),
    text("tooltip-text", "tooltip-bg", "the tooltip's text on its block"),
    mark("text-on-fill", "bg-add", "the white + on the green add box"),
    mark("line-box", "bg-page", "a box's border on the page"),
    mark("line-box", "bg-card-tint", "a box's border on the neutral card ground"),
    mark("line-capability-input", "bg-page", "a capability input's border on the page"),
    mark("line-input-soft", "bg-page", "a soft input's border on the page"),
    mark("line-noted", "bg-page", "the ring of a field a note links to"),
    mark("line-primary", "bg-page", "the primary line on the page"),
    mark("line-danger", "bg-page", "the danger line on the page"),
    mark("line-good", "bg-page", "the good line on the page"),
    mark("line-faint", "bg-page", "the faint line on the page"),
    mark("line-add", "bg-page", "the add box's border on the page"),
    mark("line-completed", "bg-page", "a completed card's border on the page"),
    mark("pattern-alt", "bg-card-tint", "the second colour of a striped mark on the neutral card ground")
];

const tintText = (ink: string, ground: string): TintPair => ({
    id: ink + " on " + ground, ink, ground, min: 4.5, kind: "text",
    why: "a System label ink on its card ground (the palette's own rule: 4.5:1 on every ground of every hue)"
});

export const tintPairs: readonly TintPair[] = [
    ...["theme-bg-ground", "theme-bg-ground-alt", "theme-bg-inner", "theme-bg-hover", "theme-bg-wash", "theme-bg-raised", "theme-bg-pill", "theme-bg-card-wash", "theme-bg-result-wash"].map(ground => tintText("theme-text-ink", ground)),
    tintText("theme-text-ink-deep", "theme-bg-ground"),
    tintText("theme-text-ink-deep", "theme-bg-inner"),
    tintText("theme-text-accent-deeper", "theme-bg-ground"),
    tintText("theme-text-accent-deeper", "theme-bg-inner"),
    tintText("theme-text-bar-ink", "theme-bg-bar"),
    tintText("theme-text-bar-ink", "theme-bg-bar-hover"),
    { id: "theme-mark-ink on theme-bg-ground", ink: "theme-mark-ink", ground: "theme-bg-ground", min: 3, kind: "mark", why: "a System mark on the card ground" },
    { id: "theme-line-edge on theme-bg-ground", ink: "theme-line-edge", ground: "theme-bg-ground", min: 3, kind: "border", why: "a System card's edge on the card ground" }
];
