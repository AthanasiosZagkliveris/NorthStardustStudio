import { useEffect, useRef, useState } from "react";

import { DateFormat, PreferencesService } from "../../services/PreferencesService.ts";

interface DateCellInputProps {

    value: string;

    onChange: (value: string) => void;

    disabled?: boolean;

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

    if (Number(mm) < 1 || Number(mm) > 12 || Number(dd) < 1 || Number(dd) > 31) {
        return null;
    }

    return `${year}-${mm}-${dd}`;

}

/**
 * A date cell with:
 *  - a text field the user can type into directly, shown
 *    in whichever presentation is currently selected;
 *  - a calendar button that opens the browser's own
 *    native date picker (via a visually-hidden
 *    <input type="date"> and its showPicker() API).
 *
 * The US (MM/DD/YYYY) / EU (DD/MM/YYYY) toggle itself
 * lives once on the column's header, not repeated on
 * every cell -- this component just reacts to it, the
 * same way every date cell everywhere in the app does.
 *
 * Formatting is done in JS rather than relying on the
 * browser's own locale handling of type="date" inputs,
 * so the toggle is guaranteed to actually change what's
 * displayed. The underlying stored value always stays
 * ISO ("YYYY-MM-DD") for consistent data/export.
 */
export default function DateCellInput({

    value,

    onChange,

    disabled = false

}: DateCellInputProps) {

    const [format, setFormat] = useState<DateFormat>(PreferencesService.getDateFormat());
    const [text, setText] = useState<string>(() => isoToDisplay(value, format));

    const pickerRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {

        return PreferencesService.subscribe(() => {
            setFormat(PreferencesService.getDateFormat());
        });

    }, []);

    useEffect(() => {

        setText(isoToDisplay(value, format));

    }, [value, format]);

    function commit() {

        if (text.trim().length === 0) {
            onChange("");
            return;
        }

        const iso = displayToIso(text, format);

        if (iso) {
            onChange(iso);
        } else {
            // Not a complete/valid date -- revert to the last
            // known-good value rather than storing garbage.
            setText(isoToDisplay(value, format));
        }

    }

    function openCalendar() {

        if (disabled) {
            return;
        }

        const picker = pickerRef.current;

        if (!picker) {
            return;
        }

        if (typeof picker.showPicker === "function") {

            try {
                picker.showPicker();
            } catch {
                picker.focus();
            }

        } else {

            picker.focus();

        }

    }

    return (

        <div className="date-cell">

            <input

                type="text"

                inputMode="numeric"

                className="date-cell-input"

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

                disabled={disabled}

                onClick={openCalendar}

            >
                📅
            </button>

            <input

                ref={pickerRef}

                type="date"

                tabIndex={-1}

                aria-hidden="true"

                className="date-cell-native-picker"

                disabled={disabled}

                value={value ?? ""}

                onChange={(event) => onChange(event.target.value)}

            />

        </div>

    );

}
