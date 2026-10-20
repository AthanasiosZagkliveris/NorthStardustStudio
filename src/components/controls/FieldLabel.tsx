import { HTMLAttributes, LabelHTMLAttributes } from "react";

/**
 * THE FIELD LABEL: the words that name a cell (regular, the card's label colour, the body size: `.field-label`). Every label of a field, a group of ticks or a list is this one
 * component; the class a place passes says only where it stands (its card's spacing), never what it looks like. `as="label"` where it is the <label> of a control.
 */
export default function FieldLabel({ as = "span", className, ...rest }: (HTMLAttributes<HTMLSpanElement> & LabelHTMLAttributes<HTMLLabelElement>) & { as?: "span" | "label" }) {
    const classes = "field-label" + (className ? " " + className : "");
    return as === "label" ? <label {...rest} className={classes} /> : <span {...rest} className={classes} />;
}
