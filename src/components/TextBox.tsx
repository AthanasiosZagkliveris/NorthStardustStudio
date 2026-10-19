import { InputHTMLAttributes, forwardRef } from "react";

/**
 * THE TEXT BOX: every one-line text cell (a name, a code, a label, a filter) is this one component -- a plain text input. What a place adds is its class (the look: \`interview-input\` for a cell of a card or table; its own for a bare field), its width and its wording. A number is a \`NumberCell\`, a date a \`DateCellInput\`, a choice an \`OptionPicker\`, a longer text a \`TextField\`.
 */
const TextBox = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type">>(function TextBox(props, ref) {
    return <input ref={ref} type="text" {...props} />;
});

export default TextBox;
