import { ButtonHTMLAttributes } from "react";

/**
 * THE REMOVE BUTTON: the app's one remove control, the 32px × every card, row and holder carries (.strategy-box-remove, src/styles/remove-button.css).
 * The class a place passes says only where it stands. Its name (aria-label) says what it removes.
 */
export default function RemoveButton({ className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button type="button" {...rest} className={"strategy-box-remove" + (className ? " " + className : "")}>
            ×
        </button>
    );
}
