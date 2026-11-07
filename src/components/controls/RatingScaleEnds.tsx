import type { ReactNode } from "react";

import "../../styles/rating-scale.css";

/**
 * THE NUMBERS OF A RATING: 1 to 5, each over its round, said once (owner, 2026-11-04: a word at an end could be long enough to stand over two rounds, so the
 * numbers stand there and the question's "i" says what 1 and 5 mean, first: ratingScaleMeaning). A RatingScale alone draws them over its own rounds; a
 * RatingScaleGroup draws them once, as the column's header, over all its rows. They are read by sight only: each round carries its number and, at an end, its
 * word for a screen reader (see RatingScale).
 */
export default function RatingScaleEnds(_ends: {
    low?: ReactNode;
    high?: ReactNode;
}) {
    return (
        <div className="rating-scale-ends" aria-hidden="true">
            {[1, 2, 3, 4, 5].map(point => <span key={point} className="rating-scale-ends-point">{point}</span>)}
        </div>
    );
}

/** What 1 and 5 mean, the first line of a rated question's "i": "1 = Weak, 5 = Strong." */
export function ratingScaleMeaning(ends: { low: string; high: string }): string {
    return "1 = " + ends.low + ", 5 = " + ends.high + ".";
}
