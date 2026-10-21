import { ButtonHTMLAttributes, ReactNode } from "react";

import "../../styles/option-picker.css";
import "../../styles/menu-option.css";

/**
 * THE MENU OPTION: a row of a menu that is pressed to choose it (the orders of a sort menu, the suggestions of a list) is this one component: the dropdown list's own row
 * (`option-picker-option`: its type, its glow under the pointer, its bold chosen row), as a button. `chosen` marks the order in use (bold, and a bullet in front where the
 * menu marks it, `marked`).
 */
export default function MenuOption({ chosen = false, marked = false, className, children, ...rest }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "role"> & {
    chosen?: boolean;
    /** The menu marks the order in use with a bullet in front of its words (a column is kept for it on every row). */
    marked?: boolean;
    children?: ReactNode;
}) {
    return (
        <button
            type="button"
            role="menuitem"
            aria-current={chosen ? "true" : undefined}
            className={"option-picker-option menu-option" + (chosen ? " option-picker-option-chosen" : "") + (className ? " " + className : "")}
            {...rest}
        >
            {marked && <span className="menu-option-bullet" aria-hidden="true">{chosen ? "•" : ""}</span>}
            {children}
        </button>
    );
}
