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

    lines

}: {

    lines: readonly NumberedListStaticLine[];

}) {

    return (
        <ol className="numbered-list-static">
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
