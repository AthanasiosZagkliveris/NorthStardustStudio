import { ButtonHTMLAttributes, ReactNode } from "react";

import "../../styles/chip.css";

/**
 * THE CHIP'S BUTTON: the pressed part of a chip (a link of a note to a field, a resource of a channel, an action linked to it) is this one component: two lines in the accent, the
 * tag (what and where it is, in numbers) over its description. The chip itself is the `notepad-chip` list item that holds it, with a remove button after it where the chip can be taken away.
 */
export default function ChipOpen({ tag, description, className, ...rest }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children"> & {
    tag: ReactNode;
    description?: ReactNode;
}) {
    return (
        <button type="button" {...rest} className={"notepad-chip-open" + (className ? " " + className : "")}>
            <span className="notepad-chip-tag">{tag}</span>
            <span className="notepad-chip-description">{description}</span>
        </button>
    );
}
