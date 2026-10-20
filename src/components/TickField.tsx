import { InputHTMLAttributes, ReactNode } from "react";

import TickBox from "./TickBox.tsx";

/**
 * THE TICK FIELD: a tick and its words, one <label> -- the words are clickable, and the tick is the one `TickBox`. Every tick that has words beside it (a field's, an optional field's, a list option's, a switch's, a filter's) is this. Its words are its children (a `FieldLabel`, or text and what a place adds); a place's class says only where it stands and how its row is laid out. The look of the words is one rule for every tick label (\`cell-focus.css\`): the field label's. Anything that must not toggle the tick (an "i") stands OUTSIDE the label.
 */
export default function TickField({ className, title, children, ...tick }: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "title" | "children"> & {
    /** The label's class (its row's layout). */
    className?: string;
    title?: string;
    children?: ReactNode;
}) {
    return (
        <label className={"tick-field" + (className ? " " + className : "")} title={title}>
            <TickBox {...tick} />
            {children}
        </label>
    );
}
