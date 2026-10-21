import { InputHTMLAttributes, forwardRef } from "react";

/**
 * THE TICK BOX: every tick (a field's, an optional field's, a list option's, a filter's) is this one component -- the drawn 24px box (`.brand-tick-box`, global.css: recessed, the glow under
 * the pointer, filled with the blue and the check when ticked). Its words are a <label> or a FieldLabel beside it; a place's class says only where it stands.
 */
const TickBox = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type">>(function TickBox({ className, ...rest }, ref) {
    return <input ref={ref} type="checkbox" {...rest} className={"brand-tick-box" + (className ? " " + className : "")} />;
});

export default TickBox;
