import { useEffect, useState } from "react";

import { DateFormat, PreferencesService } from "../../services/PreferencesService.ts";

interface DateCellInputProps {

    value: string;

    onChange: (value: string) => void;

    disabled?: boolean;

}

/**
 * Converts an ISO date ("YYYY-MM-DD", the value the
 * Framework always stores) into the user's preferred
 * on-screen presentation.
 */
function isoToDisplay(iso: string, format: DateFormat): string {

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
 * A date cell that displays and accepts dates in the
 * user's preferred presentation (US MM/DD/YYYY or EU
 * DD/MM/YYYY, toggled from the app header), while the
 * underlying stored value always stays ISO
 * ("YYYY-MM-DD") for consistent data/export.
 */
export default function DateCellInput({

    value,

    onChange,

    disabled = false

}: DateCellInputProps) {

    const [format, setFormat] = useState<DateFormat>(PreferencesService.getDateFormat());
    const [text, setText] = useState<string>(() => isoToDisplay(value, format));

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

    return (

        <input
            type="text"
            inputMode="numeric"
            className="interview-input"
            placeholder={format === "US" ? "MM/DD/YYYY" : "DD/MM/YYYY"}
            disabled={disabled}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onBlur={commit}
        />

    );

}
