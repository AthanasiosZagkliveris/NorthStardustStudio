import { useEffect, useRef, useState } from "react";

import { consumeKey } from "./consumeKey.ts";

/** What a founder's Responsibilities can be told apart by: where they stand (Infrastructure, Offerings) and what they are (Resources, Activities, Legal). */
export const RESPONSIBILITY_FILTER_OPTIONS = ["Infrastructure", "Offerings", "Resources", "Activities", "Legal"] as const;

/**
 * THE FUNNEL: a box button in the "+"'s style (the card's tone, filled under the pointer) at the right of the Responsibilities row. It opens a short list of
 * ticks, one for each option; an option ticked off leaves out the responsibilities it names. Closes on Escape and on a click elsewhere.
 */
export default function ResponsibilityFilter({
    off,
    onToggle,
    label
}: {
    /** The options ticked off. */
    off: ReadonlySet<string>;
    onToggle: (option: string) => void;
    label: string;
}) {

    const [open, setOpen] = useState(false);
    const box = useRef<HTMLDivElement | null>(null);

    useEffect(() => {

        if (!open) {
            return;
        }

        const away = (event: MouseEvent) => {
            if (!box.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const escape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                consumeKey(event);
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", away, true);
        document.addEventListener("keydown", escape);

        return () => {
            document.removeEventListener("mousedown", away, true);
            document.removeEventListener("keydown", escape);
        };

    }, [open]);

    return (
        <div className="responsibility-filter" ref={box}>

            <button
                type="button"
                className="plus-box plus-box-small funnel-box"
                aria-label={label}
                title={label}
                aria-expanded={open}
                aria-haspopup="true"
                data-active={off.size > 0 ? "" : undefined}
                onClick={() => setOpen(current => !current)}
            >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                    <path d="M4 5h16l-6.2 7.4V19l-3.6-2v-4.6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                </svg>
            </button>

            {open && (
                <div className="responsibility-filter-panel" role="group" aria-label={label}>
                    {RESPONSIBILITY_FILTER_OPTIONS.map(option => (
                        <label key={option} className="responsibility-filter-option">
                            <input type="checkbox" checked={!off.has(option)} onChange={() => onToggle(option)} />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            )}

        </div>
    );

}
