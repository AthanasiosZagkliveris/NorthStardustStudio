import { Children, ReactNode, useEffect, useRef, useState } from "react";

import { openUrl } from "@tauri-apps/plugin-opener";

import { useFloatingPanel } from "../../hooks/useFloatingPanel.ts";

import { isAcceptedUrl, Source, sourceLabel } from "../../framework/engine/Sources.ts";

import { consumeKey } from "./consumeKey.ts";

/**
 * Opens a source link in the reader's own browser, never inside the
 * app window: a citation is somewhere to leave to, not a page to
 * navigate the app away from. `openUrl` is the Tauri opener plugin,
 * already a dependency; outside Tauri (a plain browser tab in
 * development, or a test) its `invoke` call rejects, and the
 * `window.open` in the `.catch` stands in. The anchor's own default
 * navigation is always prevented.
 */
function openExternal(href: string) {
    openUrl(href).catch(() => window.open(href, "_blank", "noreferrer"));
}

/**
 * One point of a note: a sentence, or a title and its text
 * ("Demographics: What are their age range..."). The title is drawn
 * bold so a list of five can be scanned rather than read, and the
 * separator is supplied here rather than typed into the content, so
 * every list punctuates the same way.
 *
 * With `onOpen`, the title is a link that opens the page it names.
 * With `source` instead, the point is a citation: the title names
 * what it is ("Source" / "Based on") and the publisher and page title
 * are the link, opened in the reader's own browser rather than inside
 * the app (see openExternal). A citation is always a `Source` from
 * Sources.ts, so every reference passes the accepted-sources rule;
 * one whose URL fails it is shown as plain text, never as a link.
 */
export type InfoPoint =
    | string
    | { title: string; text: string; onOpen?: () => void }
    | { title: string; source: Source };

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
     * The note's width: the one standard width, or "wide" (1.5 times
     * it, still held inside the window) for a note that lists many
     * named things, each with a line of explanation -- the Customer
     * Channel categories and their channels -- which the standard
     * width made long and narrow.
     */
    size?: "standard" | "wide";

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
 * A label's words with its "i" GLUED TO THE LAST ONE.
 *
 * The "i" is an inline box after the text, and a line may break on
 * either side of an inline box -- so a label that wrapped could leave
 * the "i" alone on a line of its own, or a narrow one put it under
 * the label instead of after it. The last word and the "i" go in one
 * `white-space: nowrap` span (.info-note-glue): the label still wraps
 * wherever it likes, and the "i" always ends its last line.
 *
 * Every label renderer that draws an "i" after words uses this, so the
 * rule is the same wherever an "i" appears. Without a note (`children`
 * empty) the text is returned as it is.
 */
export function InfoText({ text, children }: { text: string; children?: ReactNode }) {

    if (Children.toArray(children).length === 0) {
        return <>{text}</>;
    }

    const trimmed = text.trimEnd();
    const at = trimmed.lastIndexOf(" ") + 1;

    return (
        <>
            {trimmed.slice(0, at)}
            <span className="info-note-glue">
                {trimmed.slice(at)}
                {children}
            </span>
        </>
    );

}

/**
 * The "i" beside a field, and the short note it opens.
 *
 * For the answers a founder cannot be expected to know cold -- what
 * a legal form decides, how a figure is worked out, where a number
 * comes from -- on the Business, Financial, Brand and Strategy pages
 * as well as the Legal Entity, where the alternative was either a
 * label nobody understands or a paragraph of help everybody scrolls
 * past.
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
    label, points, fullList, asReference, size = "standard"
}: InfoNoteProps) {

    const [open, setOpen] = useState(false);

    const containerRef = useRef<HTMLSpanElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    // No ceiling: three bullets are short by construction, so the
    // only cap that should ever apply is the window's own, which
    // the hook supplies when the note will not otherwise fit.
    // Free of the boxes around it (a table's scroller, a one-line label).
    const { panelRef, panelStyle } = useFloatingPanel(open, buttonRef, undefined, true);

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
                    className={"info-note-panel" + (size === "wide" ? " info-note-panel-wide" : "")}
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
                                        : "source" in point
                                        ? (
                                            /* A citation: the title names
                                               what it is ("Source",
                                               "Based on"), the publisher
                                               and page are the link,
                                               opened in the reader's own
                                               browser, never the app's. */
                                            <li key={point.title}>
                                                <strong className="info-note-point-title">
                                                    {point.title + ":"}
                                                </strong>
                                                {" "}
                                                {isAcceptedUrl(point.source.url)
                                                    ? (
                                                        <a
                                                            className="business-engagement-link info-note-link"
                                                            href={point.source.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                openExternal(point.source.url);
                                                            }}
                                                        >
                                                            {sourceLabel(point.source)}
                                                        </a>
                                                    )
                                                    : sourceLabel(point.source)}
                                            </li>
                                        )
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
