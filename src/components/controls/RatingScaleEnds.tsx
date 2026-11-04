import type { ReactNode } from "react";

import "../../styles/rating-scale.css";

/**
 * THE ENDS OF A RATING: one word at each end of its five rounds, said once: the low end over the first round, the high end over the last; no word in between
 * (owner, 2026-11-04: single indicator words, at the sides only). A RatingScale alone draws them over its own rounds; a RatingScaleGroup draws them once, as the
 * column's header, over all its rows. They are read by sight only: each round carries its own words for a screen reader (see RatingScale).
 */
export default function RatingScaleEnds({ low, high }: {
    low?: ReactNode;
    high?: ReactNode;
}) {
    return (
        <div className="rating-scale-ends" aria-hidden="true">
            <span className="rating-scale-ends-low">{low}</span>
            <span className="rating-scale-ends-high">{high}</span>
        </div>
    );
}
