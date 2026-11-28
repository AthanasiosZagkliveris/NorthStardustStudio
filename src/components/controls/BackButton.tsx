import { ButtonHTMLAttributes } from "react";

/**
 * THE BACK BUTTON: every "Back" in the app (the card tab's, a dialog's foot, the page's footer, the Capability description) is this one component and one look
 * (src/styles/back-button.css): the solid arrow, then the word in capitals, in the tab's own mid tone; bold and the colour of the "+" box under the pointer, the arrow growing 20%.
 * The class a place passes says only where it stands (and keeps the older names the tests and the layout rules use). Escape goes back everywhere, so its tooltip says so
 * ("Click to go back, or press Escape": docs/design/interface/08-tooltips.md, rule 4).
 */
export default function BackButton({ className, children, title, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
    const name = typeof children === "string" ? children : "Back";
    return (
        <button type="button" aria-label={name} aria-keyshortcuts="Escape" title={title ?? name + " (Escape)"} {...rest} className={"back-button" + (className ? " " + className : "")}>
            <span className="back-arrow" aria-hidden="true" />
            <span className="back-button-word">{children ?? "Back"}</span>
        </button>
    );
}
