import { useRef, useState } from "react";

import { DatePopupHead, useDatePopup } from "./DatePopup.tsx";
import FieldLabel from "../FieldLabel.tsx";
import CalendarIcon from "./CalendarIcon.tsx";
import {
    STRATEGY_MONTH_NAMES,
    StrategyMonthValue,
    isMonthSet
} from "../../framework/engine/AnswerUtils.ts";



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


    // The year the calendar shows, not yet a choice.
    const [shownYear, setShownYear] = useState<number>(0);

    const triggerRef = useRef<HTMLButtonElement | null>(null);

    // The popup's opening, closing and placement: see DatePopup.
    const { open, close, toggle: togglePopup, containerRef, panelRef, panelStyle } = useDatePopup(triggerRef);

    function toggle() {
        // Opens on the year already set, so reopening to change only the month does not start from somewhere else.
        togglePopup(() => setShownYear(Number(value.year) || firstYear));
    }

    function choose(month: number, year: number) {
        onChange({ month: String(month).padStart(2, "0"), year: String(year) });
        close();
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

                    <DatePopupHead
                        title={shownYear}
                        backLong={{ label: "Previous 10 years", onClick: () => setShownYear(year => year - 10) }}
                        back={{ label: "Previous year", onClick: () => setShownYear(year => year - 1) }}
                        forward={{ label: "Next year", onClick: () => setShownYear(year => year + 1) }}
                        forwardLong={{ label: "Next 10 years", onClick: () => setShownYear(year => year + 10) }}
                    />

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
