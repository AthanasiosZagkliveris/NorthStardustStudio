import { useEffect, useRef, useState } from "react";

import { useFloatingPanel } from "../../hooks/useFloatingPanel.ts";

import { consumeKey } from "./consumeKey.ts";

/**
 * One point of a note.
 *
 * A plain string is a sentence. The object form is a named
 * parameter -- the shape the Business System's Foundation page
 * uses, where each point is a heading and the question behind it
 * ("Demographics: What are their age range..."). The title is
 * drawn bold so a list of five can be scanned rather than read,
 * and the separator is supplied here rather than typed into the
 * content, so every list on the page punctuates the same way.
 */
/**
 * One entry: a sentence, or a title and its text. With `onOpen`, the
 * title is a link that opens the page it names.
 */
export type InfoPoint = string | { title: string; text: string; onOpen?: () => void };

interface InfoNoteProps {

    /**
     * What the note is about, as the field beside it is labelled.
     * Read out as part of the button's own name, so a screen reader
     * user knows which field the explanation belongs to.
     */
    label: string;

    /**
     * At most three, each one thing the reader actually needs.
     *
     * Three is the cap because this is a footnote, not a manual: a
     * field that needs four is a field whose own label is wrong.
     * Anything beyond the third is dropped rather than shown, so
     * the cap cannot be exceeded by accident.
     */
    points: InfoPoint[];

    /**
     * Lifts that cap, for the one case it has to be: a
     * specification that dictates the list verbatim. The Business
     * System's Foundation page carries several -- "the information
     * section must present all the parameters the user should take
     * into account", followed by five of them -- and silently
     * dropping the last two would be dropping required content.
     *
     * Not a general escape. A note that sets this without a
     * specification behind it is a note that should be shorter.
     */
    fullList?: boolean;

    /**
     * Draws the note as a REFERENCE rather than as an explanation.
     *
     * For the one kind of note whose content is not a sentence
     * somebody wrote for it but an answer read from elsewhere: the
     * Business System's Customer Relationships table opens what
     * Page 1 records about a Customer Profile or an Offering this
     * way.
     *
     * Two things change, both because the content is an answer and
     * not a footnote:
     *
     *   Each point's heading goes on its own line with the answer
     *   under it, the way the same sections were drawn when they
     *   sat in the table's own column. Run together as "Heading:
     *   answer" a four-line answer starts mid-sentence and the
     *   headings stop being findable.
     *
     *   The line breaks inside the answer are kept. Page 1's boxes
     *   hold lists -- bulleted, numbered, or one item a line -- and
     *   collapsed, a list reads as a paragraph nobody can take
     *   anything out of.
     *
     * Off by default: a note written as prose is a footnote, and
     * reads as one sentence wrapping to the panel.
     */
    asReference?: boolean;

}

/**
 * The "i" beside a field, and the short note it opens.
 *
 * For the handful of answers on the Legal Entity page that a
 * founder cannot be expected to know cold -- what a legal form
 * decides, what counts as capital, what this page means by a link
 * -- where the alternative was either a label nobody understands
 * or a paragraph of help everybody scrolls past.
 *
 * Deliberately NOT a tooltip: it opens on click and stays open, so
 * it is reachable by keyboard and by touch, and can be read at the
 * reader's own pace rather than for as long as a pointer happens
 * to rest somewhere. Escape and a click outside both close it, and
 * focus goes back to the button it came from.
 *
 * Placement is the same as every other panel in this app: below if
 * it fits, above if it does not, capped and scrolling if neither
 * (see useFloatingPanel). A note that opened under the window edge
 * would be a note nobody reads.
 */
export default function InfoNote({
    label, points, fullList, asReference
}: InfoNoteProps) {

    const [open, setOpen] = useState(false);

    const containerRef = useRef<HTMLSpanElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    // No ceiling: three bullets are short by construction, so the
    // only cap that should ever apply is the window's own, which
    // the hook supplies when the note will not otherwise fit.
    const { panelRef, panelStyle } = useFloatingPanel(open, buttonRef);

    // Clicking anywhere else closes it, as a popover is expected to.
    useEffect(() => {

        if (!open) {
            return;
        }

        function onPointerDown(event: MouseEvent) {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", onPointerDown);

        return () => document.removeEventListener("mousedown", onPointerDown);

    }, [open]);

    // The note takes focus when it opens, so a screen reader reads
    // it rather than leaving the reader on a button whose page has
    // silently changed. `preventScroll` for the reason OptionPicker
    // documents: focusing scrolls, and scrolling moves the anchor
    // the placement was just measured against.
    useEffect(() => {

        if (open) {
            panelRef.current?.focus({ preventScroll: true });
        }

    }, [open, panelRef]);

    const shown = fullList ? points : points.slice(0, 3);

    function close() {
        setOpen(false);
        buttonRef.current?.focus({ preventScroll: true });
    }

    return (
        <span className="info-note" ref={containerRef}>

            <button
                type="button"
                className="info-note-button"
                ref={buttonRef}
                aria-label={label + ": what this means"}
                aria-expanded={open}
                aria-haspopup="dialog"
                onClick={() => setOpen(current => !current)}
            >
                i
            </button>

            {open && (
                <div
                    className="info-note-panel"
                    ref={panelRef}
                    style={panelStyle}
                    role="dialog"
                    aria-label={label}
                    tabIndex={-1}
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            // Consumed, or it closes the note and
                            // leaves the page in one press (see
                            // consumeKey).
                            consumeKey(event);
                            close();
                        }
                    }}
                >
                    {/* One point is a sentence, not a list. */}
                    {shown.length === 1 && typeof shown[0] === "string"
                        ? (
                            <p
                                className={"info-note-single" +
                                    (asReference ? " info-note-pre-line" : "")}
                            >
                                {shown[0]}
                            </p>
                        )
                        : (
                            <ul
                                className={"info-note-points" +
                                    (asReference
                                        ? " info-note-points-reference"
                                        : "")}
                            >
                                {shown.map(point => (
                                    typeof point === "string"
                                        ? <li key={point}>{point}</li>
                                        : asReference
                                        ? (
                                            /* THE HEADING, THEN WHAT IS
                                               RECORDED UNDER IT -- the
                                               shape these sections had
                                               when they were drawn in
                                               the table itself. */
                                            <li key={point.title}>
                                                <span className="info-note-point-heading">
                                                    {point.title}
                                                </span>
                                                <p className="info-note-point-text">
                                                    {point.text}
                                                </p>
                                            </li>
                                        )
                                        : point.onOpen
                                        ? (
                                            /* A link to where it is answered. */
                                            <li key={point.title}>
                                                <button
                                                    type="button"
                                                    className="business-engagement-link info-note-link"
                                                    onClick={point.onOpen}
                                                >
                                                    {point.title}
                                                </button>
                                                {point.text ? " " + point.text : ""}
                                            </li>
                                        )
                                        : (
                                            <li key={point.title}>
                                                <strong className="info-note-point-title">
                                                    {point.title + ":"}
                                                </strong>
                                                {" " + point.text}
                                            </li>
                                        )
                                ))}
                            </ul>
                        )}
                </div>
            )}

        </span>
    );

}
