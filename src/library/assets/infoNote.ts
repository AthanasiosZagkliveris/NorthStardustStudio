import type { AssetContract } from "../contract.ts";

/**
 * The "i" (InfoNote.tsx, .info-note-button in conversation.css, section-tiles.css
 * and page-3-edges.css; rulebook "An i" and "The i of a coloured card"): the
 * small round button after a label that opens a note. One rule for the gap and
 * the centre line (an "i" stands 6px, --info-gap, after its label's last word,
 * on that line's centre); three looks by where it stands:
 *   plain    the page's blue (line-primary, 1px stroke, white ground);
 *   tinted   in a card or tile of a hue: its edge and letter take the card's tint;
 *   page-3   on the page-3 cards: no fill at rest (a wired button: the ground of
 *            the surface shows through), a stroke (1.5px declared, drawn as 1px at
 *            100% zoom on a 1x screen) and the letter in the card's darker tint, swapping
 *            under the pointer, the focus and while its note is open.
 * The numbers are the rulebook's.
 */
export const infoNote: AssetContract = {
    name: "Info note",
    kind: "round button",
    summary: "A 22px round \"i\" after a label that opens a note. A swap of two colours under the pointer (the disc filled, the letter in the ground colour); it never changes size.",
    component: "src/components/interview/InfoNote.tsx",
    stylesheet: "src/styles/conversation.css",
    alsoStylesheets: ["src/styles/section-tiles.css", "src/styles/page-3-edges.css", "src/styles/global.css"],
    parts: ["button (22px disc with a stroke)", "the letter i (bold italic, small size)", "an invisible 24px hit area (::after)"],
    states: ["rest", "hover", "focus", "open"],
    variants: [
        { id: "plain", context: "page", note: "the base look: blue stroke and letter on a white disc, in a label outside any card of a hue" },
        { id: "tinted", context: "hue", note: "inside a card or tile of a hue: stroke and letter in the card's tint (section-tiles.css)" },
        { id: "page-3", context: "answer-columns business-capability", note: "the page-3 card look: ground fill, 1.5px stroke, letter in --info-ink, a full swap on hover, focus and open (page-3-edges.css)" }
    ],
    tokens: ["--info-gap", "--font-small", "--line-primary", "--text-primary", "--bg-surface", "--bg-primary", "--text-on-fill", "--theme-line-accent", "--info-ink", "--info-fill", "--glow-color", "--strategy-theme-hue"],
    geometry: {
        disc: 22,
        hitArea: 24,
        /** The gap from the label's last word to the disc. */
        gap: 6,
        strokePlain: 1,
        strokePage3: 1.5,
        fontSizeVar: 14,
        fontWeight: 700,
        /** The disc's centre against the label line's centre. */
        centreTolerancePx: 0.6,
        tolerancePx: 0.5
    },
    accessibility: {
        contrast: [
            { ink: "the letter against the disc at rest", ground: "rest", min: 3 },
            { ink: "the letter against the disc under the pointer, the focus and while open", ground: "swapped", min: 3 }
        ],
        focusRing: true,
        accessibleName: "<label>: what this means (aria-expanded, aria-haspopup=dialog)"
    },
    knownFindings: {
        "tinted-rule-overridden": "The rule that gives an \"i\" the tint of its card (section-tiles.css, \":where(.section-tile-overlay, [style*=--strategy-theme-hue]) .info-note-button\", about line 3869) has the same specificity as the base \".info-note-button\" rule in conversation.css, which the app loads after it, so the base wins: an \"i\" in a card of a hue that has no page-3 rule is drawn in the page blue, at rest and under the pointer. Measured with the stylesheets in the order the interview page loads them. Not changed; to decide."
    },
    uses: [
        "after the label of nearly every field and every section or column title",
        "dialog headers and the box names over a floating card",
        "a tick box's label (outside it)"
    ]
};
