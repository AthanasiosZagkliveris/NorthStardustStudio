import { useEffect, useRef, useState } from "react";

import CalendarIcon from "./CalendarIcon.tsx";
import {
    STRATEGY_MONTH_NAMES,
    StrategyMonthValue,
    isMonthSet
} from "../../framework/engine/AnswerUtils.ts";

import { useFloatingPanel } from "../../hooks/useFloatingPanel.ts";

import { consumeKey } from "./consumeKey.ts";

/** Every month number, for testing a year against any of them. */
const MONTHS = Array.from({ length: 12 }, (_entry, index) => index + 1);

/** Years offered at once: the current one and the eight after it. */
const YEAR_GRID = 9;

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

    /** The first year the grid starts from. */
    firstYear: number;

    /**
     * Keeps the label for assistive technology only -- for a picker
     * whose field or column already shows it.
     */
    hideLabel?: boolean;

}

/**
 * One control for a month AND a year.
 *
 * A single button rather than two dropdowns: picking a month from
 * one <select> and a year from another let the two disagree (a month
 * already past, in a year still to come), which then had to be
 * caught and corrected after the fact. Here the two are chosen in
 * order inside one popover -- months first, then years -- so an
 * impossible pair is never offered in the first place.
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

    const [step, setStep] = useState<"month" | "year">("month");

    // Held until BOTH halves are chosen -- nothing is committed on
    // a half-made choice, so cancelling leaves the previous value
    // exactly as it was. Either half may be picked first: a period
    // is often thought of as "some time in 2028" as readily as
    // "March of whenever", and forcing one order made the second
    // way of thinking take an extra step.
    const [pendingMonth, setPendingMonth] = useState<number>(0);
    const [pendingYear, setPendingYear] = useState<number>(0);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    // See useFloatingPanel: the grid opens upwards rather than off
    // the bottom of the window when that is where the room is.
    const { panelRef, panelStyle } = useFloatingPanel(open, triggerRef);

    // Clicking anywhere else, or pressing Escape, abandons the
    // choice. Both are what a popover is expected to do, and without
    // them the only way out would be to complete it.
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

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };

    }, [open]);

    const years = Array.from({ length: YEAR_GRID }, (_entry, offset) => firstYear + offset);

    function start() {
        setStep("month");
        // Opens holding whatever is already set, so reopening to
        // change only the year does not make the month be picked
        // again.
        setPendingMonth(Number(value.month) || 0);
        setPendingYear(Number(value.year) || 0);
        setOpen(true);
    }

    /** Commits once both halves are held, and not before. */
    function commit(month: number, year: number) {

        if (!month || !year) {
            return false;
        }

        onChange({ month: String(month).padStart(2, "0"), year: String(year) });
        setOpen(false);

        return true;

    }

    function chooseMonth(month: number) {

        setPendingMonth(month);

        // Straight to the year grid when that is what is still
        // missing; otherwise the pair is complete and the panel
        // closes.
        if (!commit(month, pendingYear)) {
            setStep("year");
        }

    }

    function chooseYear(year: number) {

        setPendingYear(year);

        if (!commit(pendingMonth, year)) {
            setStep("month");
        }

    }

    const display = isMonthSet(value)
        ? `${STRATEGY_MONTH_NAMES[Number(value.month) - 1]} ${value.year}`
        : "Select";

    return (

        <div className="month-picker" ref={containerRef}>

            {/* Beside the button, not above it: the pair reads as one
                phrase -- "Start October 2026". */}
            {!hideLabel && (
                <span className="field-label strategy-field-label month-picker-label">{label}</span>
            )}

            <button
                ref={triggerRef}
                type="button"
                className="month-picker-trigger"
                aria-label={`${label}: ${display}`}
                aria-expanded={open}
                aria-haspopup="dialog"
                disabled={disabled}
                onClick={() => open ? setOpen(false) : start()}
            >
                <span className="month-picker-value">{display}</span>
                <span className="month-picker-calendar" aria-hidden="true"><CalendarIcon /></span>
            </button>

            {open && (

                <div
                    ref={panelRef}
                    className="month-picker-panel"
                    style={panelStyle}
                    role="dialog"
                    aria-label={label}
                >

                    {/*
                        Both steps are always named, so the panel
                        says where it is rather than leaving the two
                        grids to be told apart by their contents.
                    */}
                    <div className="month-picker-steps">

                        <button
                            type="button"
                            className={
                                "month-picker-step" +
                                (step === "month" ? " month-picker-step-active" : "")
                            }
                            aria-current={step === "month"}
                            onClick={() => setStep("month")}
                        >
                            Month
                        </button>

                        <button
                            type="button"
                            className={
                                "month-picker-step" +
                                (step === "year" ? " month-picker-step-active" : "")
                            }
                            aria-current={step === "year"}
                            onClick={() => setStep("year")}
                        >
                            Year
                        </button>

                    </div>

                    {step === "month" ? (

                        <div className="month-picker-grid month-picker-months">

                            {STRATEGY_MONTH_NAMES.map((name, index) => {

                                const month = index + 1;

                                // Offered when ANY year in the grid
                                // could take it; the year step then
                                // narrows it to the ones that can.
                                const allowed = pendingYear
                                    ? isAllowed(month, pendingYear)
                                    : years.some(year => isAllowed(month, year));

                                return (
                                    <button
                                        key={name}
                                        type="button"
                                        className={
                                            "month-picker-cell" +
                                            (Number(value.month) === month ? " month-picker-cell-current" : "")
                                        }
                                        disabled={!allowed}
                                        onClick={() => chooseMonth(month)}
                                    >
                                        {name.slice(0, 3)}
                                    </button>
                                );

                            })}

                        </div>

                    ) : (

                        <div className="month-picker-grid month-picker-years">

                            {years.map(year => (
                                <button
                                    key={year}
                                    type="button"
                                    className={
                                        "month-picker-cell" +
                                        (Number(value.year) === year ? " month-picker-cell-current" : "")
                                    }
                                    disabled={pendingMonth
                                        ? !isAllowed(pendingMonth, year)
                                        : !MONTHS.some(month => isAllowed(month, year))}
                                    onClick={() => chooseYear(year)}
                                >
                                    {year}
                                </button>
                            ))}

                        </div>

                    )}

                </div>

            )}

        </div>

    );

}
