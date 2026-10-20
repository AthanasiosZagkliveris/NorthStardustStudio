import { FocusEvent, HTMLAttributes, KeyboardEvent, ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { consumeKey } from "./consumeKey.ts";
import { useListDrag } from "./ReorderControls.tsx";

import "../../../styles/numbered-list.css";

/**
 * One line of the list.
 *
 * A textarea rather than an input, so a long entry WRAPS instead
 * of scrolling sideways inside a box the width of the column --
 * an initiative or a SWOT point is a sentence, not a word, and
 * text you have to scroll to re-read is text you cannot check.
 * It grows to fit what it holds and never scrolls internally.
 *
 * Enter still belongs to the LIST, not to the field: it opens the
 * next line rather than a new line inside this one, which is what
 * makes the list a list. Wrapping is therefore the only thing
 * that ever puts an entry on two lines.
 */
function ListLine({

    value,

    ariaLabel,

    placeholder,

    disabled,

    autoFocus,

    onFocused,

    onChange,

    onKeyDown,

    onBlur,

    fieldId

}: {

    value: string;
    ariaLabel: string;
    placeholder?: string;
    disabled: boolean;
    autoFocus: boolean;
    /** Called once the caret has been placed, so the request is
        cleared and cannot fire again on a later render. */
    onFocused: () => void;
    onChange: (value: string) => void;
    onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
    onBlur: (event: FocusEvent<HTMLTextAreaElement>) => void;
    /** The line's stable id in its field key (FieldKeys.ts), where it has one. */
    fieldId?: string;

}) {

    const ref = useRef<HTMLTextAreaElement | null>(null);

    // Height follows content: reset first, then take whatever the
    // browser says it needs. Without the reset it could only ever
    // grow.
    const fit = () => {

        const element = ref.current;

        if (!element) {
            return;
        }

        element.style.height = "auto";
        element.style.height = `${element.scrollHeight}px`;

    };

    useLayoutEffect(fit, [value]);

    /* The wrapped height depends on the line's WIDTH, which changes
       with the window and the column around it: measured again then
       (width only, as StrategyTextArea does, so setting the height
       does not set off another measure). */
    const lastWidth = useRef(0);

    useEffect(() => {
        const element = ref.current;
        if (!element || typeof ResizeObserver === "undefined") {
            return;
        }
        const observer = new ResizeObserver(() => {
            if (element.clientWidth === lastWidth.current) {
                return;
            }
            lastWidth.current = element.clientWidth;
            fit();
        });
        observer.observe(element);
        return () => observer.disconnect();
        // Once: fit reads the element each time.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (

        <textarea
            ref={(element) => {
                ref.current = element;
                if (element && autoFocus) {
                    onFocused();
                    element.focus();
                }
            }}
            rows={1}
            className="numbered-list-input"
            data-field-id={fieldId}
            aria-label={ariaLabel}
            placeholder={placeholder}
            disabled={disabled}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
        />

    );

}

interface NumberedListInputProps {

    /** Names each line for assistive technology, e.g. "Strengths". */
    label: string;

    items: string[];

    /**
     * The lines as they now are -- and, for a caller that keeps
     * something of its own beside each line, where each came from:
     * `origins[i]` is the index line i had before this change, or -1
     * for a line just opened. Lines move when one is opened above
     * them, removed, or dragged, and whatever belongs to a line has
     * to move with it. Callers with nothing beside their lines
     * ignore it.
     */
    onChange: (items: string[], origins: number[]) => void;

    disabled?: boolean;

    /** Shown in the first line while it is empty. */
    placeholder?: string;

    /**
     * Each line's own placeholder, for a list whose lines ask
     * different things (see `lineEnd`). Where it is given it
     * decides every line's, the first included; omitted, only the
     * first line has one -- `placeholder`.
     */
    placeholderFor?: (index: number) => string | undefined;

    /**
     * Drawn at the end of each line, inside the list's box -- a
     * control that belongs to that one line, such as the kind of
     * entry it is. It follows its line through `origins`. Omitted,
     * a line is its number and its text, as everywhere else.
     */
    lineEnd?: (index: number) => ReactNode;

    /**
     * Extra attributes for a line's row -- a class, data-* marks, the
     * pointer and focus handlers of a row that is lit by its twins
     * (the Customer Channel's shared actions). The class is added to
     * the row's own.
     */
    rowProps?: (index: number) => HTMLAttributes<HTMLDivElement> & { [mark: `data-${string}`]: string | undefined };

    /**
     * A small muted note UNDER a line's number, at the bottom of the
     * line however many lines its text runs to (the Customer Channel's
     * total action order number, "#12"). Omitted, a line is its number.
     */
    lineOrder?: (index: number) => ReactNode;

    /**
     * Entries already recorded elsewhere that this list could
     * reasonably repeat -- offered as you type, matched on what
     * has been typed so far.
     *
     * For the Business System's Customer Profiles: the needs the
     * other Profiles in the same Segment have listed under the
     * same heading. Two Profiles in one Segment wanting the same
     * thing is the ordinary case, and the second person to say it
     * should not have to type it again -- or, worse, type it
     * nearly the same and have it count as a different need.
     *
     * Omitted everywhere else, and the list behaves exactly as it
     * did before.
     */
    suggestions?: string[];

    /**
     * A suggestion chosen on a line, for a list whose lines refer to
     * something (a Segment's shared channel actions): the caller puts
     * that thing on the line. `typed` is what the line held when it was
     * chosen (a reference such as "#12"). Omitted, choosing one writes
     * its text in.
     */
    onAccept?: (index: number, entry: string, typed: string) => void;

    /**
     * For a list whose lines can name something by a reference rather
     * than by its words (the Customer Channel's "#12", an action's total
     * order number): what a typed text refers to, as the one suggestion
     * to offer for it -- or undefined when it refers to nothing (the text
     * stays as typed and nothing is offered). Needs `onAccept`.
     */
    reference?: (typed: string, index: number) => string | undefined;

    /**
     * A line left EMPTY goes when focus leaves it, so no stray blank line
     * stays after editing (the Customer Channel's action cells). The last
     * line of a list never goes: a list with nothing in it keeps its one
     * empty line, where the first entry is typed. Enter still opens a
     * new line to type in; it goes again if it is left empty.
     */
    dropEmptyOnBlur?: boolean;

    /** Each line's stable id, for its field key: an action's id, say. */
    lineIds?: readonly string[];

    /**
     * The most lines the list takes: Enter on the last one opens no
     * further line once it holds this many. Omitted, it has no cap.
     */
    maxItems?: number;

}

/**
 * A numbered list of single-line entries.
 *
 * The number sits INSIDE each box rather than beside it, so a line
 * is one object on the page instead of a number and a field that
 * happen to be adjacent. There is no add button: Enter opens the
 * next line and Backspace on an empty one takes it away, which is
 * how a list behaves everywhere else in this System.
 *
 * Lines can be dragged to reorder; the numbers are drawn from
 * position, so they follow automatically.
 */
export default function NumberedListInput({

    label,

    items,

    onChange,

    disabled = false,

    placeholder,

    placeholderFor,

    lineEnd,

    rowProps,

    lineOrder,

    suggestions = [],

    onAccept,

    reference,

    dropEmptyOnBlur = false,

    lineIds,

    maxItems

}: NumberedListInputProps) {

    /** Every line where it was: nothing opened, removed or moved. */
    const unmoved = () => items.map((_entry, position) => position);

    /**
     * The line whose suggestions are open, and which of them the
     * keyboard is on.
     *
     * One line at a time: the list that is open belongs to the
     * line being typed into, so moving to another closes it.
     */
    const [openLine, setOpenLine] = useState(-1);
    const [activeSuggestion, setActiveSuggestion] = useState(0);

    /**
     * What to offer for a line: the suggestions that START WITH
     * what has been typed, minus anything this list already has.
     *
     * Starts-with rather than contains, because this is completing
     * a word someone is part way through typing rather than
     * searching. Nothing is offered for an empty line either --
     * the whole list would drop open the moment the caret landed.
     */
    function matches(index: number): string[] {

        // A reference ("#12") offers the one thing it refers to.
        const referred = reference?.(items[index] ?? "", index);

        if (referred !== undefined) {
            return [referred];
        }

        const typed = (items[index] ?? "").trim().toLocaleLowerCase();

        if (typed.length === 0) {
            return [];
        }

        const taken = new Set(
            items
                .filter((_entry, position) => position !== index)
                .map(entry => entry.trim().toLocaleLowerCase())
        );

        return suggestions.filter(entry => {

            const candidate = entry.trim().toLocaleLowerCase();

            return candidate.startsWith(typed)
                // Nothing to offer once it has been typed in full.
                && candidate !== typed
                && !taken.has(candidate);

        });

    }

    function accept(index: number, entry: string) {

        setOpenLine(-1);

        if (onAccept) {
            onAccept(index, entry, items[index] ?? "");
            return;
        }

        const values = [...items];
        values[index] = entry;

        onChange(values, unmoved());

    }

    /* WHERE AN ACTION LINE'S SYMBOLS STAND (ActionMarkers.tsx), set on
       the row as data-marks and drawn by numbered-list.css: one symbol
       under the x; two side by side under it; two stacked under it when
       the text runs to three lines or more; or, when the text is one line
       and both fit beside the x, level with it. The aim is a cell no
       taller, and a text no narrower, than the text itself asks for.
       Decided from the text's measured width and height, which do not
       depend on where the symbols stand, so the choice cannot flip back
       and forth. */
    const rows = useRef<(HTMLDivElement | null)[]>([]);
    const measure = useRef<CanvasRenderingContext2D | null>(null);

    const arrange = useCallback(() => {
        for (const row of rows.current) {
            if (!row || !row.classList.contains("is-action-line")) {
                continue;
            }
            const marks = row.querySelectorAll(".action-symbol").length;
            const field = row.querySelector<HTMLTextAreaElement>("textarea");
            let shape = marks === 0 ? "none" : marks === 1 ? "under" : "pair";
            if (marks === 2 && field && field.clientWidth > 0) {
                const style = getComputedStyle(field);
                const number = row.querySelector<HTMLElement>(".numbered-list-number");
                const end = row.querySelector<HTMLElement>(".numbered-list-line-end");
                const lineHeight = parseFloat(style.lineHeight) || 27;
                // Its height as the text alone asks for it, at the width two symbols under the x leave it
                // (whatever the line is drawn at now, so the choice cannot flip back and forth).
                const height = field.style.height;
                const least = field.style.minHeight;
                const padding = field.style.paddingRight;
                field.style.height = "auto";
                field.style.minHeight = "0";
                field.style.paddingRight = "26px";
                const lines = Math.round((field.scrollHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)) / lineHeight);
                field.style.height = height;
                field.style.minHeight = least;
                field.style.paddingRight = padding;
                if (!measure.current) {
                    measure.current = document.createElement("canvas").getContext("2d");
                }
                const context = measure.current;
                let fitsBeside = false;
                if (context && !/\n/.test(field.value)) {
                    context.font = style.fontStyle + " " + style.fontWeight + " " + style.fontSize + " " + style.fontFamily;
                    const wanted = context.measureText(field.value).width;
                    // The text's room with both symbols beside the x: the row less its number, its end column, the symbols and the text's own padding.
                    const room = row.clientWidth - (number?.offsetWidth ?? 0) - (end?.offsetWidth ?? 0) - 48
                        - parseFloat(style.paddingLeft) - 10;
                    fitsBeside = wanted + 4 <= room;
                }
                shape = fitsBeside ? "beside" : lines >= 3 ? "stack" : "pair";
            }
            if (row.dataset.marks !== shape) {
                row.dataset.marks = shape;
                // The text's width changed with it (padding, not size): its height is fitted again.
                const field = row.querySelector<HTMLTextAreaElement>("textarea");
                if (field) {
                    field.style.height = "auto";
                    field.style.height = `${field.scrollHeight}px`;
                }
            }
        }
    }, []);

    useLayoutEffect(arrange);

    const listRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const list = listRef.current;
        if (!list || typeof ResizeObserver === "undefined") {
            return;
        }
        const observer = new ResizeObserver(() => arrange());
        observer.observe(list);
        return () => observer.disconnect();
    }, [arrange]);

    // Which line to put the caret in after the next render -- Enter
    // opens the line below and moves to it, which only works once
    // the new field exists.
    const pendingFocus = useRef<number>(-1);

    /* AN EMPTY LINE LEFT BEHIND GOES (dropEmptyOnBlur). Checked a moment
       after focus leaves it -- not at once, so that a click on a control
       beside it is not lost to the row closing under the pointer -- and
       then only if it is still empty, still not focused, and not the
       list's last line. Focus that moved to a later line of the list is
       kept on it as the lines close up. */
    const latest = useRef({ items, onChange });
    latest.current = { items, onChange };
    const dropTimers = useRef<number[]>([]);

    useEffect(() => () => dropTimers.current.forEach(timer => window.clearTimeout(timer)), []);

    function dropIfEmpty(index: number) {
        const { items: now, onChange: change } = latest.current;
        const list = listRef.current;
        if ((now[index] ?? "").length > 0 || now.length < 2 || !list) {
            return;
        }
        const fields = [...list.querySelectorAll<HTMLTextAreaElement>("textarea.numbered-list-input")];
        if (document.activeElement === fields[index]) {
            return;
        }
        const focused = fields.indexOf(document.activeElement as HTMLTextAreaElement);
        if (focused > index) {
            pendingFocus.current = focused - 1;
        }
        change(
            now.filter((_entry, position) => position !== index),
            now.map((_entry, position) => position).filter(position => position !== index)
        );
    }

    const drag = useListDrag((from, to) => {
        const next = [...items];
        const origins = unmoved();
        const [moved] = next.splice(from, 1);
        const [movedFrom] = origins.splice(from, 1);
        next.splice(to, 0, moved);
        origins.splice(to, 0, movedFrom);
        onChange(next, origins);
    });

    function keyDown(event: KeyboardEvent<HTMLTextAreaElement>, index: number) {

        /*
            While suggestions are showing they own the arrow keys
            and Enter: Enter takes the highlighted one rather than
            opening the next line, which is what makes the list
            worth offering. Escape puts the keys back without
            taking anything.
        */
        const offered = openLine === index ? matches(index) : [];

        if (offered.length > 0) {

            // A key the list answers is a key the list CONSUMES --
            // see consumeKey, which every floating panel in this
            // app now shares.
            const consume = () => consumeKey(event);

            if (event.key === "ArrowDown" || event.key === "ArrowUp") {

                consume();

                const step = event.key === "ArrowDown" ? 1 : -1;

                setActiveSuggestion(
                    (activeSuggestion + step + offered.length) % offered.length
                );

                return;

            }

            if (event.key === "Enter") {
                consume();
                accept(index, offered[activeSuggestion] ?? offered[0]);
                return;
            }

            if (event.key === "Escape") {
                consume();
                setOpenLine(-1);
                return;
            }

        }

        if (event.key === "Enter") {

            event.preventDefault();

            if (maxItems !== undefined && items.length >= maxItems) {
                return;
            }

            const next = [...items];
            next.splice(index + 1, 0, "");

            const origins = unmoved();
            origins.splice(index + 1, 0, -1);

            pendingFocus.current = index + 1;

            onChange(next, origins);

            return;

        }

        if (event.key === "Backspace" && items[index] === "" && items.length > 1) {

            event.preventDefault();

            pendingFocus.current = Math.max(0, index - 1);

            onChange(
                items.filter((_entry, position) => position !== index),
                unmoved().filter(position => position !== index)
            );

        }

    }

    return (

        <div
            ref={listRef}
            className={
                "numbered-list" +
                /* The box clips itself to its rounded corners, which
                   would clip an open suggestion list out of sight
                   along with them. The clip is dropped only while one
                   is showing -- the corners are as they were the rest
                   of the time, and a list that never offers anything
                   never drops it at all. */
                (openLine >= 0 && matches(openLine).length > 0
                    ? " numbered-list-suggesting"
                    : "")
            }
        >

            {items.map((item, index) => {

                const row = drag.itemProps(index);
                const extra = rowProps?.(index) ?? {};

                return (

                    <div
                        key={index}
                        ref={(element) => { rows.current[index] = element; }}
                        {...extra}
                        className={`numbered-list-row ${row.className}` + (extra.className ? " " + extra.className : "")}
                        draggable={row.draggable}
                        onDragStart={row.onDragStart}
                        onDragOver={row.onDragOver}
                        onDrop={row.onDrop}
                        onDragEnd={row.onDragEnd}
                    >

                        <span className="numbered-list-number" {...drag.handleProps}>
                            {lineOrder?.(index)
                                ? (
                                    <>
                                        <span>{index + 1}.</span>
                                        <span className="numbered-list-order">{lineOrder(index)}</span>
                                    </>
                                )
                                : <>{index + 1}.</>}
                        </span>

                        <ListLine
                            value={item}
                            ariaLabel={`${label} ${index + 1}`}
                            placeholder={placeholderFor
                                ? placeholderFor(index)
                                : index === 0 ? placeholder : undefined}
                            disabled={disabled}
                            autoFocus={pendingFocus.current === index}
                            onFocused={() => { pendingFocus.current = -1; }}
                            onChange={(next) => {
                                const values = [...items];
                                values[index] = next;
                                // Typing reopens the list and starts
                                // again at the top: the entry the
                                // keyboard was on is usually not in
                                // the narrowed list at all.
                                setOpenLine(index);
                                setActiveSuggestion(0);
                                onChange(values, unmoved());
                            }}
                            onKeyDown={(event) => keyDown(event, index)}
                            onBlur={() => {
                                setOpenLine(current => current === index ? -1 : current);
                                if (dropEmptyOnBlur && !disabled) {
                                    dropTimers.current.push(window.setTimeout(() => dropIfEmpty(index), 200));
                                }
                            }}
                            fieldId={lineIds?.[index]}
                        />

                        {lineEnd && (
                            <span className="numbered-list-line-end">
                                {lineEnd(index)}
                            </span>
                        )}

                        {/* What other Profiles have already called
                            this. Built from the same pieces as the
                            app's own picker, so an option looks and
                            answers like an option wherever one is
                            offered.

                            Blur closes it, so the click has to land
                            first: mousedown is the event that can be
                            stopped before focus moves. */}
                        {openLine === index && (() => {

                            const offered = matches(index);

                            if (offered.length === 0) {
                                return null;
                            }

                            return (
                                <div
                                    className="option-picker-list numbered-list-suggestions"
                                    role="listbox"
                                    aria-label={`${label}: already recorded`}
                                >
                                    {offered.map((entry, position) => (
                                        <div
                                            key={entry}
                                            className={
                                                "option-picker-option" +
                                                (position === activeSuggestion
                                                    ? " option-picker-option-active"
                                                    : "")
                                            }
                                            role="option"
                                            aria-selected={position === activeSuggestion}
                                            onMouseEnter={() => setActiveSuggestion(position)}
                                            onMouseDown={(event) => {
                                                event.preventDefault();
                                                accept(index, entry);
                                            }}
                                        >
                                            {entry}
                                        </div>
                                    ))}
                                </div>
                            );

                        })()}

                    </div>

                );

            })}

        </div>

    );

}
