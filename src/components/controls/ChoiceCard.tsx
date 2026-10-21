import { ButtonHTMLAttributes } from "react";

import "../../styles/choice-card.css";

/**
 * THE CHOICE CARD: one of a few cards, laid in a row and overlapping, that choose which part of an answer is shown below them (the variants of an answer, the parts of a multi-part
 * answer, the cards of a profile). The chosen one (`active`) is lifted and bold; one that already has an answer (`filled`) has its line in the primary tone and a check after its words.
 * It is its own component: not a radio (`RadioChoice`, a round with a bullet) and not a tab (`TabList`).
 */
export default function ChoiceCard({ active = false, filled = false, className, children, ...rest }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
    active?: boolean;
    filled?: boolean;
}) {
    return (
        <button
            type="button"
            aria-pressed={active}
            {...rest}
            className={"choice-card" + (active ? " active" : "") + (filled ? " filled" : "") + (className ? " " + className : "")}
        >
            {children}
            {filled && <span className="choice-card-check">✓</span>}
        </button>
    );
}
