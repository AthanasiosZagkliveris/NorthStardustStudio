import { ButtonHTMLAttributes } from "react";

import "../../styles/day-button.css";

/**
 * THE DAY BUTTON: every button of a day or a month that is pressed to choose it (the calendar's days, the date cell's popup days and months) is this one component. It carries the
 * reactions and the states, and the place says only the size and the look at rest: under the pointer or the keyboard it has the add button's reaction (accent line, hover ground, the
 * line thickened by 1px inside, the letters thickened); the chosen one (`selected`, `aria-pressed`) keeps it with a 2px line; today (`today`) is framed and bold.
 */
export default function DayButton({ selected = false, today = false, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & {
    selected?: boolean;
    today?: boolean;
}) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            {...rest}
            className={"day-button" + (selected ? " day-button-selected" : "") + (today ? " day-button-today" : "") + (className ? " " + className : "")}
        />
    );
}
