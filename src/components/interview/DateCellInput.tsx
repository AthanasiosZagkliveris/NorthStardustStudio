import { useEffect, useRef, useState } from "react";

import { useFloatingPanel } from "../../hooks/useFloatingPanel.ts";
import { DateFormat, PreferencesService } from "../../services/PreferencesService.ts";
import CalendarIcon from "./CalendarIcon.tsx";
import { consumeKey } from "./consumeKey.ts";

interface DateCellInputProps {

    value: string;

    onChange: (value: string) => void;

    disabled?: boolean;

    /** The latest day it takes (an ISO day): a later one is refused. */
    max?: string;

    /** The earliest day it takes (an ISO day): an earlier one is refused. */
    min?: string;

    /**
     * Accessible name for the date text field -- see
     * InterviewInput.ariaLabel. Sourced from the Table column
     * title by DynamicTable; the field's own placeholder only
     * states the expected format, never which date it is.
     */
    ariaLabel?: string;

}

/**
 * Converts an ISO date ("YYYY-MM-DD", the value the
 * Framework always stores) into the user's preferred
 * on-screen presentation. Exported for read-only date
 * displays elsewhere (OperationalLogEditor.tsx's own
 * read-only Date column, OrganizationCalendarPanel.tsx)
 * that need the same US/EU formatting but not this
 * component's editable text field.
 */
export function isoToDisplay(iso: string, format: DateFormat): string {

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());

    if (!match) {
        return "";
    }

    const [, year, month, day] = match;

    return format === "US" ? `${month}/${day}/${year}` : `${day}/${month}/${year}`;

}

/**
 * Parses a typed date back into ISO ("YYYY-MM-DD"),
 * interpreting the two leading numbers according to
 * the user's preferred presentation. Returns null when
 * the text isn't (yet) a complete, valid date.
 */
function displayToIso(display: string, format: DateFormat): string | null {

    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(display.trim());

    if (!match) {
        return null;
    }

    const [, first, second, year] = match;

    const month = format === "US" ? first : second;
    const day = format === "US" ? second : first;

    const mm = month.padStart(2, "0");
    const dd = day.padStart(2, "0");

    const monthNum = Number(mm);
    const dayNum = Number(dd);

    if (monthNum < 1 || monthNum > 12) {
        return null;
    }

    // Real days-in-month, not a flat "1-31" -- catches things like
    // 04/31 (April only has 30 days) or 02/30 (never a real day),
    // and correctly allows/rejects Feb 29 depending on whether
    // `year` is actually a leap year. `new Date(year, monthNum, 0)`
    // is the standard trick for this: the Date constructor's own
    // month argument is 0-indexed, so passing `monthNum` (already
    // 1-indexed here) names the NEXT month, and day 0 of that next
    // month rolls back to the last real day of the month the user
    // actually typed -- leap years fall out of this for free since
    // it's the same `Date` engine every other date computation in
    // this app already relies on.
    const daysInMonth = new Date(Number(year), monthNum, 0).getDate();

    if (dayNum < 1 || dayNum > daysInMonth) {
        return null;
    }

    return `${year}-${mm}-${dd}`;

}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const pad = (n: number) => String(n).padStart(2, "0");
const isoOf = (year: number, month: number, day: number) => `${year}-${pad(month)}-${pad(day)}`;

/**
 * A date cell: one long cell with
 *  - the date typed straight into it, shown in whichever presentation is selected;
 *  - the calendar button INSIDE the cell, at its right end, where a dropdown has its arrow (a 32px box button);
 *  - a popup of its own under the cell, a calendar list that works as a dropdown does (it opens on the cell, closes
 *    on a choice, on Escape and on a click elsewhere). The browser's own date picker is not used.
 *
 * The US (MM/DD/YYYY) / EU (DD/MM/YYYY) toggle lives once on the column's header; this component just reacts to it.
 * The stored value always stays ISO ("YYYY-MM-DD").
 */
export default function DateCellInput({

    value,

    onChange,

    disabled = false,

    max,

    min,

    ariaLabel

}: DateCellInputProps) {

    const [format, setFormat] = useState<DateFormat>(PreferencesService.getDateFormat());
    const [text, setText] = useState<string>(() => isoToDisplay(value, format));
    const [open, setOpen] = useState(false);
    const [free, setFree] = useState(false);

    // The month the popup shows (the first of it), not yet a choice.
    const [shown, setShown] = useState<{ year: number; month: number }>(() => monthOf(value));

    const containerRef = useRef<HTMLDivElement | null>(null);
    const cellRef = useRef<HTMLDivElement | null>(null);

    const { panelRef, panelStyle } = useFloatingPanel(open, cellRef, undefined, free);

    useEffect(() => {

        return PreferencesService.subscribe(() => {
            setFormat(PreferencesService.getDateFormat());
        });

    }, []);

    useEffect(() => {

        setText(isoToDisplay(value, format));

    }, [value, format]);

    // A date field shows the current day by default: an empty one takes today (or the nearest day it allows) when it appears.
    useEffect(() => {

        if (value || disabled) {
            return;
        }

        const now = new Date();
        let day = isoOf(now.getFullYear(), now.getMonth() + 1, now.getDate());

        if (max && day > max) {
            day = max;
        }

        if (min && day < min) {
            day = min;
        }

        onChange(day);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {

        if (!open) {
            return;
        }

        function onPointerDown(event: MouseEvent) {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                consumeKey(event);
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", onPointerDown, true);
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("mousedown", onPointerDown, true);
            document.removeEventListener("keydown", onKeyDown);
        };

    }, [open]);

    function commit() {

        if (text.trim().length === 0) {
            onChange("");
            return;
        }

        const iso = displayToIso(text, format);

        if (iso && !(max && iso > max) && !(min && iso < min)) {
            onChange(iso);
        } else {
            // Not a complete/valid date -- revert to the last
            // known-good value rather than storing garbage.
            setText(isoToDisplay(value, format));
        }

    }

    function toggle() {

        if (disabled) {
            return;
        }

        if (open) {
            setOpen(false);
            return;
        }

        setShown(monthOf(value));
        setFree(!!cellRef.current?.closest(".business-capability, .section-tile-overlay, .section-tile-dialog, .strategy-sort-menu"));
        setOpen(true);

    }

    function choose(iso: string) {
        onChange(iso);
        setOpen(false);
    }

    function step(months: number) {

        setShown(previous => {
            const index = previous.year * 12 + (previous.month - 1) + months;
            return { year: Math.floor(index / 12), month: (index % 12) + 1 };
        });

    }


    // Monday first: the weekday of the 1st, then the days of the month.
    const lead = (new Date(shown.year, shown.month - 1, 1).getDay() + 6) % 7;
    const days = new Date(shown.year, shown.month, 0).getDate();
    const cells: (number | null)[] = [
        ...Array.from({ length: lead }, () => null),
        ...Array.from({ length: days }, (_entry, index) => index + 1)
    ];

    const todayNow = new Date();
    const todayIso = isoOf(todayNow.getFullYear(), todayNow.getMonth() + 1, todayNow.getDate());

    const refused = (iso: string) => !!((max && iso > max) || (min && iso < min));

    return (

        <div className="date-cell" ref={containerRef}>

            <div className="date-cell-field" ref={cellRef}>

                <input

                    type="text"

                    inputMode="numeric"

                    className="date-cell-input"

                    aria-label={ariaLabel}

                    placeholder={format === "US" ? "MM/DD/YYYY" : "DD/MM/YYYY"}

                    disabled={disabled}

                    value={text}

                    onChange={(event) => setText(event.target.value)}

                    onBlur={commit}

                />

                <button

                    type="button"

                    className="date-cell-calendar-button"

                    aria-label="Open calendar"

                    title="Open calendar"

                    aria-expanded={open}

                    aria-haspopup="dialog"

                    disabled={disabled}

                    onClick={toggle}

                >
                    <CalendarIcon />
                </button>

            </div>

            {open && (

                <div ref={panelRef} className="date-cell-popup" style={panelStyle} role="dialog" aria-label="Calendar">

                    <div className="date-cell-popup-head">

                        <button type="button" className="date-cell-popup-step" aria-label="Previous year" onClick={() => step(-12)}>«</button>
                        <button type="button" className="date-cell-popup-step" aria-label="Previous month" onClick={() => step(-1)}>‹</button>

                        <span className="date-cell-popup-title" aria-live="polite">{MONTH_NAMES[shown.month - 1]} {shown.year}</span>

                        <button type="button" className="date-cell-popup-step" aria-label="Next month" onClick={() => step(1)}>›</button>
                        <button type="button" className="date-cell-popup-step" aria-label="Next year" onClick={() => step(12)}>»</button>

                    </div>

                    <div className="date-cell-popup-grid" role="grid">

                        {WEEKDAYS.map(name => (
                            <span key={name} className="date-cell-popup-weekday" role="columnheader">{name}</span>
                        ))}

                        {cells.map((day, index) => {

                            if (day === null) {
                                return <span key={"blank-" + index} />;
                            }

                            const iso = isoOf(shown.year, shown.month, day);

                            return (
                                <button
                                    key={iso}
                                    type="button"
                                    className={
                                        "date-cell-popup-day" +
                                        (iso === value ? " date-cell-popup-day-current" : "") +
                                        (iso === todayIso ? " date-cell-popup-day-today" : "")
                                    }
                                    aria-pressed={iso === value}
                                    disabled={refused(iso)}
                                    onClick={() => choose(iso)}
                                >
                                    {day}
                                </button>
                            );

                        })}

                    </div>


                </div>

            )}

        </div>

    );

}

/** The month a value falls in (this month when it holds no day). */
function monthOf(iso: string): { year: number; month: number } {

    const match = /^(\d{4})-(\d{2})-\d{2}$/.exec((iso ?? "").trim());

    if (match) {
        return { year: Number(match[1]), month: Number(match[2]) };
    }

    const now = new Date();

    return { year: now.getFullYear(), month: now.getMonth() + 1 };

}
