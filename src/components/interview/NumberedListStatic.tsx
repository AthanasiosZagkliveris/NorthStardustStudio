import { ReactNode } from "react";

import "../../styles/numbered-list.css";

/** One line of a NumberedListStatic. */
export interface NumberedListStaticLine {

    key: string;

    text: ReactNode;

    /** Drawn at the end of the line's first line: a "Completed" badge. */
    end?: ReactNode;

    className?: string;

}

/**
 * A numbered list that is shown, not asked -- a founder's Roles
 * recalled from the Founders Profile, a Segment's needs recalled
 * from its Profiles. The numbered list's own form without the box
 * (see .numbered-list-static): the number the size and colour of
 * its text and on its first line, the text of every line starting
 * at the same x, and anything a line carries at the end of it.
 *
 * An ordinary <ol>, so a screen reader announces how many there
 * are.
 */
export default function NumberedListStatic({

    lines,

    start = 1,

    flush = false

}: {

    lines: readonly NumberedListStaticLine[];
    /** The first line's number, for a list that continues another (a Completed fold). */
    start?: number;
    /** The numbers at the list's left edge (no 12px inset): a list that stands in a card's content edge. */
    flush?: boolean;

}) {

    return (
        <ol
            className={"numbered-list-static" + (flush ? " numbered-list-static-flush" : "")}
            start={start}
            style={start !== 1 ? { counterReset: "numbered-list-static " + (start - 1) } : undefined}
        >
            {lines.map(line => (
                <li key={line.key} className={line.className}>
                    <span className="numbered-list-static-text">{line.text}</span>
                    {line.end && (
                        <span className="numbered-list-static-end">{line.end}</span>
                    )}
                </li>
            ))}
        </ol>
    );

}
