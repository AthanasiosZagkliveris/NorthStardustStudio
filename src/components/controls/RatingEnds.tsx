import type { ReactNode } from "react";

import "../../styles/rating-field.css";

/**
 * THE ENDS OF A RATING: one word at each end of its five rounds, said once: the low end over the first round, the high end over the last; no word in between
 * (owner, 2026-11-04: single indicator words, at the sides only). A RatingField alone draws them over its own rounds; a RatingGroup draws them once, as the
 * column's header, over all its rows. They are read by sight only: each round carries its own words for a screen reader (see RatingField).
 */
export default function RatingEnds({ low, high }: {
    low?: ReactNode;
    high?: ReactNode;
}) {
    return (
        <div className="rating-ends" aria-hidden="true">
            <span className="rating-ends-low">{low}</span>
            <span className="rating-ends-high">{high}</span>
        </div>
    );
}
