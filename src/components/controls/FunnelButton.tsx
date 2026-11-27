import { ButtonHTMLAttributes, forwardRef } from "react";
// (Its look travels with it: the "+" family's box (section-tiles.css) and the funnel's own lines (conversation.css). Without them the Calendar opened from the
// Organisations screen drew the browser's own grey button -- owner, 2026-11-27 22:39 UTC+2, phone round 4, point 1.)
import "../../styles/section-tiles.css";
import "../../styles/conversation.css";

/**
 * THE FUNNEL BUTTON: the one button that opens a filter or a sort (a founder's Responsibilities, the card notes, the Inventory's filters and orders, a section's sort). It is a "+"-family
 * box (the 32px box, the card's tone, filled under the pointer) with the one drawn funnel; filled while what it opens leaves something out (`active`).
 */
const FunnelButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }>(function FunnelButton({ active = false, className, ...rest }, ref) {
    return (
        <button
            ref={ref}
            type="button"
            {...rest}
            className={"plus-box plus-box-small funnel-box" + (className ? " " + className : "")}
            data-active={active ? "" : undefined}
        >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
                <path d="M4 5h16l-6.2 7.4V19l-3.6-2v-4.6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
        </button>
    );
});

export default FunnelButton;
