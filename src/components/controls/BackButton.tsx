import { ButtonHTMLAttributes } from "react";

/**
 * THE BACK BUTTON: every "Back" in the app (the card tab's, a dialog's foot, the page's footer, the Capability description) is this one component and one look
 * (src/styles/back-button.css): the solid arrow, then the word in capitals, in the tab's own mid tone; bold and the colour of the "+" box under the pointer, the arrow growing 20%.
 * The class a place passes says only where it stands (and keeps the older names the tests and the layout rules use).
 */
export default function BackButton({ className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button type="button" {...rest} className={"back-button" + (className ? " " + className : "")}>
            <span className="back-arrow" aria-hidden="true" />
            <span className="back-button-word">{children ?? "Back"}</span>
        </button>
    );
}
