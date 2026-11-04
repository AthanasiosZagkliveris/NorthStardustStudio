import type { AssetContract } from "../contract.ts";

/**
 * The Rating Scale (RatingScale, RatingScaleGroup and RatingScaleEnds in src/components/controls/, rating-scale.css; doc 21, "Rating Scale"): five rounds of the
 * radio choice from 1 (low) to 5 (high), the numbers 1 to 5 over them (what 1 and 5 mean is the first line of the question's "i"). Two layouts:
 *   vertical    a single rating under its question: the rounds spread evenly across the whole width of their place, the numbers over them;
 *   horizontal  a group: each row's words (or a tick and its words) in the left half, its rounds in the right half, the numbers said once over that half; a row can carry a band, light to dark (--tint-importance-1 to -3).
 * The rounds are radio-choice.css's own: 16px, the --text-muted edge in every state, the app's blue with a white bullet when chosen.
 */
export const ratingScale: AssetContract = {
    name: "Rating Scale",
    kind: "choice control",
    summary: "A rating from 1 to 5: five radio rounds from low to high, the numbers 1 to 5 over them. Alone, the rounds fill the width under the question; in a group, the right half beside each row's words.",
    component: "src/components/controls/RatingScale.tsx, RatingScaleGroup.tsx, RatingScaleEnds.tsx",
    stylesheet: "src/styles/rating-scale.css",
    alsoStylesheets: ["src/styles/radio-choice.css"],
    parts: ["the row's words, or a tick and its words (a group's row)", "the track: five radio rounds, spread evenly", "the numbers 1 to 5, once per group, each over its round"],
    states: ["rest", "hover", "focus", "disabled"],
    variants: [
        { id: "vertical", context: "a single question: the rounds under it, across the whole width (the Segment's online comfort, market growth and crowding; the Competitor's K4)", fontSizePx: 14, note: "RatingScale with its numbers: the track fills its place" },
        { id: "horizontal", context: "a group: the words in the left half, the rounds in the right half (the Competitor's K7 to K9, the Profile's B1)", fontSizePx: 18, note: "RatingScaleGroup: the numbers once, over the rounds' half" },
        { id: "selectable", context: "a group whose rows are ticked first; the rounds show once a row is ticked (the Competitor's K6, the Profile's B1, E1 to E3 and the Needs)", fontSizePx: 18, note: "RatingScaleGroup selectable: unticking a row clears its rating" },
        { id: "chosen and disabled", context: "the chosen round, and a group that cannot be changed", fontSizePx: 18, note: "the chosen round is the app's blue with a white bullet; a disabled group is drawn faint" }
    ],
    tokens: ["--space-label", "--space-cell", "--space-row", "--font-small", "--font-body", "--gap-8"],
    geometry: {
        /** The round (--size-radio, radio-choice.css). */
        round: 16,
        /** In a group, the share of the width the rounds take. */
        groupRoundsShare: 0.5,
        /** Between the numbers and the rounds (--space-label). */
        endsGap: 6,
        /** Between a row's words and its rounds (--space-cell). */
        columnGap: 12,
        /** The numbers (--font-small) and a row's words (--font-body). */
        endsFontPx: 14,
        rowFontPx: 18
    },
    accessibility: {
        contrast: [
            { ink: "a round's --text-muted edge at rest against the band it stands on", ground: "rest", min: 3 },
            { ink: "the chosen round's fill against the band", ground: "rest", min: 3 },
            { ink: "the numbers and the row's words against the band", ground: "rest", min: 4.5 }
        ],
        focusRing: true,
        accessibleName: "each row a radio group named by its words; each round \"1 of 5, [low word]\" to \"5 of 5, [high word]\""
    },
    uses: [
        "the Segment card: household income, gender mix, kind of area, online comfort (and the end user's), market growth, crowding (doc 35)",
        "the Profile card: B1 and E1 to E3, the Emotional and Social needs (doc 36)",
        "the Competitor card: K4 and K6 to K9, K8 and K9 banded (doc 41)"
    ]
};
