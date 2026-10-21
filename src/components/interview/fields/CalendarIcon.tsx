/**
 * The calendar symbol of a date cell: it takes the place of the dropdown arrow, inside the cell, on a 32px box button
 * (the calendar button of DateCellInput and the trigger of MonthYearPicker draw it the same).
 */
export default function CalendarIcon() {

    return (
        <svg className="calendar-icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
            <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M3.5 10h17M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );

}
