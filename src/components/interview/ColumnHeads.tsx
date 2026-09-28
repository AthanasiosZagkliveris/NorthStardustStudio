import { ReactNode } from "react";

/*
    The column-page heads the Brand and Strategy Foundation editors
    share: each section's numbered heading, and the bullet guidance
    under it (hidden with the page's Help).
*/

/** One section's numbered heading ("1. Colours", or "5. Colours" when numbered continuously). */
export function ColumnHeading({

    offset,

    title,

    startNumber

}: {

    /** The section's place on its page, from 0. */
    offset: number;
    title: string;
    /** The number the page's first section carries. */
    startNumber: number;

}) {

    return (
        <h3 className="answer-column-label brand-section-heading">
            <span className="answer-column-label-number">
                {(startNumber + offset) + "."}
            </span>
            <span className="answer-column-label-text">{title}</span>
        </h3>
    );

}

/** A section's bullet guidance. */
export function GuidanceBullets({ lines, show }: { lines: ReactNode[]; show?: boolean }) {

    // Nothing at all when the page's Help button has hidden the
    // guidance -- an empty block would still take a grid track and
    // its gap.
    if (!show) {
        return null;
    }

    return (
        <div className="answer-column-questions">
            {lines.map((line, index) => (
                <span key={index} className="answer-question-line answer-question-line-bullet">
                    {"• "}{line}
                </span>
            ))}
        </div>
    );

}
