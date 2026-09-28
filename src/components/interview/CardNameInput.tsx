import { useRef } from "react";

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
