import { ReactNode } from "react";

import "../../styles/numbered-list.css";

/** One line of a BulletListStatic. */
export interface BulletListStaticLine {

    key: string;

    text: ReactNode;

}

/**
 * A bulleted list that is shown, not asked -- a founder's Roles recalled from
 * the Founders Profile. The app's drawn bullet (--bullet-size, --bullet-gap):
 * its left edge is the list's left edge and the text stands --bullet-gap from
 * its right edge; the text the size and colour of a NumberedListStatic's.
 * An ordinary <ul> named by `label`, so a screen reader announces it.
 */
export default function BulletListStatic({

    lines,

    label

}: {

    lines: readonly BulletListStaticLine[];
    /** What the list is, for assistive technology ("Roles"): the list shows no label of its own. */
    label: string;

}) {

    return (
        <ul className="bullet-list-static" aria-label={label}>
            {lines.map(line => (
                <li key={line.key}>
                    <span className="bullet-list-static-text">{line.text}</span>
                </li>
            ))}
        </ul>
    );

}
