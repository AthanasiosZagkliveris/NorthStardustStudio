import { Fragment, type ReactNode } from "react";

import RatingEnds from "./RatingEnds";
import RatingField, { type Rating } from "./RatingField";

import "../../styles/rating-field.css";

/**
 * THE RATING GROUP: several things rated on one scale, one RatingField per row, each row's words on its left and its five rounds on its right, all rows' rounds
 * in one column. The end words are said ONCE, as the column's header over the first row, not repeated on every row (layout rules, "Noise"). A row left unrated
 * is unanswered.
 */
export default function RatingGroup({ label, name, rows, values, onChange, lowLabel, midLabel, highLabel, disabled, className }: {
    /** What the group rates, for a screen reader. */
    label: string;
    /** The group's name: each row's rounds are named from it and the row's id. */
    name: string;
    /** The rows, in order: what is rated (its words, and its words for a screen reader where the shown words are not plain text). */
    rows: readonly { id: string; label: ReactNode; name?: string }[];
    /** Each row's rating, by id; a row missing here is unrated. */
    values: Readonly<Partial<Record<string, Rating>>>;
    onChange: (id: string, next: Rating | undefined) => void;
    lowLabel: string;
    midLabel?: string;
    highLabel: string;
    disabled?: boolean;
    /** Where it stands. */
    className?: string;
}) {
    return (
        <div className={"rating-group" + (className ? " " + className : "")} role="group" aria-label={label}>
            <RatingEnds low={lowLabel} mid={midLabel} high={highLabel} />
            {rows.map(row => {
                const words = row.name ?? (typeof row.label === "string" ? row.label : row.id);
                return (
                    <Fragment key={row.id}>
                        <span className="rating-group-label">{row.label}</span>
                        <RatingField
                            label={words}
                            name={name + "-" + row.id}
                            value={values[row.id]}
                            onChange={next => onChange(row.id, next)}
                            disabled={disabled}
                        />
                    </Fragment>
                );
            })}
        </div>
    );
}
