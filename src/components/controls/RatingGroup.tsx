import { Fragment, type ReactNode } from "react";

import RatingEnds from "./RatingEnds";
import RatingField, { type Rating } from "./RatingField";
import TickField from "./TickField";

import "../../styles/rating-field.css";

/**
 * THE RATING GROUP: several things rated on one scale, one RatingField per row, each row's words on its left and its five rounds on its right, all rows' rounds
 * in one column. The end words are said ONCE, as the column's header over the first row, not repeated on every row (layout rules, "Noise"). A row left unrated
 * is unanswered.
 *
 * `selectable`: each row starts with a tick (the shared TickField), and its rounds show only once it is ticked (where they are reviewed, then how they are
 * rated); unticking a row clears its rating. `below`: what a row carries under it, across the group (the loyalty ticks under Support & Follow Up).
 */
export default function RatingGroup({ label, name, rows, values, onChange, lowLabel, highLabel, selectable = false, selected = [], onSelect, disabled, className }: {
    /** What the group rates, for a screen reader. */
    label: string;
    /** The group's name: each row's rounds are named from it and the row's id. */
    name: string;
    /** The rows, in order: what is rated (its words, and its words for a screen reader where the shown words are not plain text), and what stands under it. */
    rows: readonly { id: string; label: ReactNode; name?: string; below?: ReactNode }[];
    /** Each row's rating, by id; a row missing here is unrated. */
    values: Readonly<Partial<Record<string, Rating>>>;
    onChange: (id: string, next: Rating | undefined) => void;
    lowLabel: string;
    highLabel: string;
    /** Each row starts with a tick; its rating shows once ticked. */
    selectable?: boolean;
    /** The ticked rows' ids (with `selectable`). */
    selected?: readonly string[];
    /** A row ticked or unticked (with `selectable`). Unticking also clears the row's rating through `onChange`. */
    onSelect?: (id: string, on: boolean) => void;
    disabled?: boolean;
    /** Where it stands. */
    className?: string;
}) {
    return (
        <div className={"rating-group" + (className ? " " + className : "")} role="group" aria-label={label}>
            <RatingEnds low={lowLabel} high={highLabel} />
            {rows.map(row => {
                const words = row.name ?? (typeof row.label === "string" ? row.label : row.id);
                const on = !selectable || selected.includes(row.id);
                return (
                    <Fragment key={row.id}>
                        {selectable
                            ? (
                                <TickField
                                    className="rating-group-label"
                                    checked={on}
                                    disabled={disabled}
                                    onChange={event => {
                                        const ticked = event.currentTarget.checked;
                                        // The rating is cleared first, then the tick: a place that writes both from one snapshot keeps the untick, the last write.
                                        if (!ticked && values[row.id] !== undefined) {
                                            onChange(row.id, undefined);
                                        }
                                        onSelect?.(row.id, ticked);
                                    }}
                                >
                                    {row.label}
                                </TickField>
                            )
                            : <span className="rating-group-label">{row.label}</span>}
                        {on
                            ? (
                                <RatingField
                                    label={words}
                                    name={name + "-" + row.id}
                                    value={values[row.id]}
                                    onChange={next => onChange(row.id, next)}
                                    disabled={disabled}
                                />
                            )
                            // An unticked row keeps its place in the column, with no rounds.
                            : <span className="rating-group-unrated" aria-hidden="true" />}
                        {row.below && <div className="rating-group-below">{row.below}</div>}
                    </Fragment>
                );
            })}
        </div>
    );
}
