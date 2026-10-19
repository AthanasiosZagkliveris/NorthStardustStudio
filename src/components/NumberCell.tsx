import { InputHTMLAttributes, forwardRef } from "react";

/**
 * THE NUMBER CELL: every cell that takes a number (a price, a quantity, hours, a percent, a share, a size) is this one component -- the app's text cell with the numeric keyboard and its number
 * aligned to the right. `kind` is the keyboard: "int" (digits) or "decimal" (digits and a point). The class a place passes says only its width and where it stands.
 */
const NumberCell = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "inputMode"> & { kind?: "int" | "decimal"; /** Where the place computes it (from the number's limits): it replaces `kind`. */ inputMode?: "numeric" | "decimal" }>(function NumberCell({ kind = "decimal", inputMode, className, ...rest }, ref) {
    return (
        <input
            ref={ref}
            type="text"
            inputMode={inputMode ?? (kind === "int" ? "numeric" : "decimal")}
            {...rest}
            className={"interview-input number-cell" + (className ? " " + className : "")}
        />
    );
});

export default NumberCell;
