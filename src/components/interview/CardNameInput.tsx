import { useLayoutEffect, useRef } from "react";

import { useAutoGrow } from "../../hooks/useAutoGrow.ts";

/**
 * A card's name, asked in its head: an Activity, a resource, a
 * Profile, a Competitor, an Offering, a cost, a Segment, a Goal...
 *
 * A name is one line of data, but it can be a long one ("Investigate
 * Password and credential vault for client logins"), and a text
 * input cut it off at the box's edge. So it is a textarea that grows
 * to fit (useAutoGrow): a long name WRAPS onto a second line in the
 * head instead of being clipped, and the head's arrow, number and ×
 * stay on its first line (.fold-card-head).
 *
 * A name takes TWO rows at most: past them the box keeps its height and
 * scrolls (the one rule of every name cell).
 *
 * Still one line of data: Enter does not add a line, and a pasted
 * line break becomes a space. It opens one line high, the height of
 * the text input it replaces, and keeps that input's classes -- the
 * same box, the same focus ring.
 */
export default function CardNameInput({

    ariaLabel,

    placeholder,

    disabled = false,

    value,

    onChange

}: {

    ariaLabel: string;

    placeholder: string;

    disabled?: boolean;

    value: string;

    onChange: (value: string) => void;

}) {

    const element = useRef<HTMLTextAreaElement | null>(null);

    useAutoGrow(element, value);

    // Two rows at most: the height of two lines of the name's own text, its padding and its edge; past them the box scrolls.
    useLayoutEffect(() => {
        const box = element.current;
        if (!box) {
            return;
        }
        const style = getComputedStyle(box);
        const line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.25;
        const room = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
        box.style.maxHeight = (2 * line + room) + "px";
        box.style.overflowY = box.scrollHeight > box.clientHeight + 1 ? "auto" : "hidden";
    }, [value]);

    return (
        <textarea
            ref={element}
            rows={1}
            className="interview-input strategy-name-input card-name-input"
            aria-label={ariaLabel}
            placeholder={placeholder}
            disabled={disabled}
            value={value}
            onChange={(event) => onChange(event.target.value.replace(/\r?\n/g, " "))}
            onKeyDown={(event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                }
            }}
        />
    );

}
