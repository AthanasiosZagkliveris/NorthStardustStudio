import { useEffect, useRef, useState } from "react";

import FieldLabel from "../FieldLabel.tsx";
import CalendarIcon from "./CalendarIcon.tsx";
import {
    STRATEGY_MONTH_NAMES,
    StrategyMonthValue,
    isMonthSet
} from "../../framework/engine/AnswerUtils.ts";

import { useFloatingPanel } from "../../hooks/useFloatingPanel.ts";

import { consumeKey } from "./consumeKey.ts";

/** The months as the calendar and the cell write them: short, and June, July and Sept in four or more letters. */
export const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

interface MonthYearPickerProps {

    label: string;

    value: StrategyMonthValue;

    onChange: (value: StrategyMonthValue) => void;

    disabled?: boolean;

    /**
     * Whether a month/year pair may be chosen. Months and years the
     * answer cannot legally take are shown but not selectable, so
     * the range on offer stays visible rather than silently
     * shrinking.
     */
    isAllowed: (month: number, year: number) => boolean;

    /** The year the calendar opens on when no month is set yet. */
    firstYear: number;

    /**
     * Keeps the label for assistive technology only -- for a picker
     * whose field or column already shows it.
     */
    hideLabel?: boolean;

}

/**
 * One control for a month AND a year: the date cell's other form (DateCellInput), the same cell and the same calendar.
 *
 * The cell is a button that shows the month and year, with the calendar button inside it at its right end. It opens the
 * calendar list of the date cell (the same card, size, arrows, keys and closing): the year's months in a grid, the arrows
 * stepping the year (the double arrows ten years), and a choice closing it. A pair that is not allowed is shown but cannot
 * be chosen, so an impossible pair is never offered.
 */
export default function MonthYearPicker({

    label,

    value,

    onChange,

    disabled = false,

    isAllowed,

    firstYear,

    hideLabel = false

}: MonthYearPickerProps) {

    const [open, setOpen] = useState(false);
    const [free, setFree] = useState(false);

    // The year the calendar shows, not yet a choice.
    const [shownYear, setShownYear] = useState<number>(0);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    // See useFloatingPanel: the calendar opens upwards rather than off
    // the bottom of the window when that is where the room is.
    const { panelRef, panelStyle } = useFloatingPanel(open, triggerRef, undefined, free);

    // Clicking anywhere else, or pressing Escape, closes it.
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
                // Consumed, or it closes the picker and leaves the
                // page in one press (see consumeKey).
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

    function toggle() {

        if (open) {
            setOpen(false);
            return;
        }

        // Opens on the year already set, so reopening to change only
        // the month does not start from somewhere else.
        setShownYear(Number(value.year) || firstYear);
        setFree(!!triggerRef.current?.closest(".business-capability, .section-tile-overlay, .section-tile-dialog, .strategy-sort-menu"));
        setOpen(true);

    }

    function choose(month: number, year: number) {
        onChange({ month: String(month).padStart(2, "0"), year: String(year) });
        setOpen(false);
    }

    const display = isMonthSet(value)
        ? `${MONTH_LABELS[Number(value.month) - 1]} ${value.year}`
        : "Select";
    const spoken = isMonthSet(value)
        ? `${STRATEGY_MONTH_NAMES[Number(value.month) - 1]} ${value.year}`
        : "Select";

    return (

        <div className="month-picker" ref={containerRef}>

            {/* Beside the button, not above it: the pair reads as one
                phrase -- "Start October 2026". */}
            {!hideLabel && (
                <FieldLabel className="strategy-field-label month-picker-label">{label}</FieldLabel>
            )}

            <button
                ref={triggerRef}
                type="button"
                className="date-cell-input month-picker-trigger"
                aria-label={`${label}: ${spoken}`}
                aria-expanded={open}
                aria-haspopup="dialog"
                disabled={disabled}
                onClick={toggle}
            >
                <span className="month-picker-value">{display}</span>
                <span className="date-cell-calendar-button month-picker-calendar" aria-hidden="true"><CalendarIcon /></span>
            </button>

            {open && (

                <div
                    ref={panelRef}
                    className="date-cell-popup"
                    style={panelStyle}
                    role="dialog"
                    aria-label={label}
                >

                    <div className="date-cell-popup-head">

                        <button type="button" className="date-cell-popup-step" aria-label="Previous 10 years" onClick={() => setShownYear(year => year - 10)}>«</button>
                        <button type="button" className="date-cell-popup-step" aria-label="Previous year" onClick={() => setShownYear(year => year - 1)}>‹</button>

                        <span className="date-cell-popup-title" aria-live="polite">{shownYear}</span>

                        <button type="button" className="date-cell-popup-step" aria-label="Next year" onClick={() => setShownYear(year => year + 1)}>›</button>
                        <button type="button" className="date-cell-popup-step" aria-label="Next 10 years" onClick={() => setShownYear(year => year + 10)}>»</button>

                    </div>

                    <div className="date-cell-popup-grid date-cell-popup-months" role="grid">

                        {STRATEGY_MONTH_NAMES.map((name, index) => {

                            const month = index + 1;
                            const current = Number(value.month) === month && Number(value.year) === shownYear;

                            return (
                                <button
                                    key={name}
                                    type="button"
                                    className={"date-cell-popup-day" + (current ? " date-cell-popup-day-current" : "")}
                                    aria-pressed={current}
                                    aria-label={name + " " + shownYear}
                                    disabled={!isAllowed(month, shownYear)}
                                    onClick={() => choose(month, shownYear)}
                                >
                                    {MONTH_LABELS[index]}
                                </button>
                            );

                        })}

                    </div>


                </div>

            )}

        </div>

    );

}
