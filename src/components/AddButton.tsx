import { ButtonHTMLAttributes, forwardRef } from "react";

/**
 * THE ADD BUTTON: everything that adds a card, a row or a line is this one component, in one of three shapes (the same control, drawn to its place):
 *  - "wide": the "+ Add ..." button under a list (\`.strategy-add-button\`), its words as children;
 *  - "box": the "+" box of a tile or a status row (\`.plus-box\`; \`small\` is the 32px one), drawn by the box itself;
 *  - "tile": the dashed "Add Card" tile at the end of a grid of tiles.
 * The class a place passes says only where it stands; what each shape looks like and how it reacts is in layout-rules.md (section 6) and 20-reactions.md (R4).
 */
type AddShape = "wide" | "box" | "tile";

const AddButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { shape?: AddShape; small?: boolean }>(function AddButton({ shape = "wide", small = false, className, children, ...rest }, ref) {
    if (shape === "tile") {
        return (
            <button ref={ref} type="button" {...rest} className={"add-card-tile" + (className ? " " + className : "")}>
                <span className="add-card-plus" aria-hidden="true">+</span>
                <span className="add-card-words">Add Card</span>
            </button>
        );
    }
    if (shape === "box") {
        return <button ref={ref} type="button" {...rest} className={"plus-box" + (small ? " plus-box-small" : "") + (className ? " " + className : "")} />;
    }
    return <button ref={ref} type="button" {...rest} className={"strategy-add-button" + (className ? " " + className : "")}>{children}</button>;
});

export default AddButton;
