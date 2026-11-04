import RatingEnds from "./RatingEnds";

import "../../styles/radio-choice.css";
import "../../styles/rating-field.css";

/** A rating: 1 (low) to 5 (high). Unrated is `undefined`: there is no "Not sure". */
export type Rating = 1 | 2 | 3 | 4 | 5;

/** The five points, low to high, left to right. */
export const RATING_POINTS: readonly Rating[] = [1, 2, 3, 4, 5];

/** What a screen reader says for one round: "1 of 5", and the end's word where the round is an end ("1 of 5, Weak"). */
export function ratingPointName(point: Rating, ends: { low?: string; high?: string }): string {
    const word = point === 1 ? ends.low : point === 5 ? ends.high : undefined;
    return point + " of 5" + (word ? ", " + word : "");
}

/**
 * THE RATING FIELD: five rounds of the radio choice in a row, low (1) on the left and high (5) on the right, the rounds of RadioChoice drawn by its own stylesheet
 * (radio-choice.css: the recess, the glow, the ring, the blue with its white bullet), so a rating looks and reacts as every radio does. One row is one radio group,
 * named by `label`; its rounds share `name`, so the arrows move along the row and Space chooses. Pressing the chosen round again clears it: the row is then
 * unrated, which is how a rating says "I cannot judge this" (there is no "Not sure").
 *
 * Alone, it draws its end words over its rounds (`lowLabel`, `highLabel`: one word each, at the sides only); in a RatingGroup the group draws them once for all its rows.
 */
export default function RatingField({ label, name, value, onChange, lowLabel, highLabel, disabled, className }: {
    /** What is rated, for a screen reader (in a group, the row's words). */
    label: string;
    /** The rounds' shared name: one per row on the page. */
    name: string;
    value?: Rating;
    /** The new rating, or `undefined` when the chosen round is pressed again. */
    onChange: (next: Rating | undefined) => void;
    /** The low end's word (over 1), e.g. "Weak". */
    lowLabel?: string;
    /** The high end's word (over 5), e.g. "Strong". */
    highLabel?: string;
    disabled?: boolean;
    /** Where it stands (a place's class says only that). */
    className?: string;
}) {
    const ends = { low: lowLabel, high: highLabel };
    const drawsEnds = lowLabel !== undefined || highLabel !== undefined;
    return (
        <div className={"rating-field" + (className ? " " + className : "")}>
            {drawsEnds && <RatingEnds low={lowLabel} high={highLabel} />}
            <div className="radio-choice rating-field-points" role="radiogroup" aria-label={label}>
                {RATING_POINTS.map(point => (
                    <label key={point} className="radio-choice-option">
                        <input
                            type="radio"
                            name={name}
                            aria-label={ratingPointName(point, ends)}
                            disabled={disabled}
                            checked={value === point}
                            onChange={() => onChange(point)}
                            // The chosen round pressed again: no change event fires, so the press itself clears the rating.
                            onClick={() => {
                                if (value === point) {
                                    onChange(undefined);
                                }
                            }}
                        />
                    </label>
                ))}
            </div>
        </div>
    );
}
