import { useEffect, useRef, useState, useLayoutEffect } from "react";

import FunnelButton from "../FunnelButton.tsx";
import { consumeKey } from "./consumeKey.ts";

/** What a founder's Responsibilities can be told apart by: where they stand (Infrastructure, Offerings) and what they are (Activities, Partners & Suppliers, Legal). */
export const RESPONSIBILITY_FILTER_OPTIONS = ["Infrastructure", "Offerings", "Activities", "Partners & Suppliers", "Legal"] as const;

/**
 * THE FUNNEL: a box button in the "+"'s style (the card's tone, filled under the pointer) at the right of the Responsibilities row. It opens a short list of
 * ticks, one for each option; an option ticked off leaves out the responsibilities it names. Closes on Escape and on a click elsewhere.
 */
export default function ResponsibilityFilter({
    off,
    onToggle,
    label,
    options = RESPONSIBILITY_FILTER_OPTIONS
}: {
    /** The choices (a founder's Responsibilities by default). */
    options?: readonly string[];
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

    // THE FUNNEL ENDS WHERE THE CALENDAR BOX ENDS: its right edge on the right edge of the founder's Start date box (moved by a transform: the row it stands in does not change).
    useLayoutEffect(() => {
        const node = box.current;
        const card = node?.closest<HTMLElement>(".business-founder-open");
        if (!node || !card) {
            return;
        }
        const align = () => {
            node.style.transform = "";
            const calendar = card.querySelector<HTMLElement>(".date-cell-field");
            const right = calendar ? calendar.getBoundingClientRect().right : 0;
            const mine = node.getBoundingClientRect().right;
            if (right > 0 && mine > right + 0.5) {
                node.style.transform = "translateX(" + -Math.round(mine - right) + "px)";
            }
        };
        align();
        if (typeof ResizeObserver === "undefined") {
            return;
        }
        const observer = new ResizeObserver(align);
        observer.observe(card);
        return () => observer.disconnect();
    });

    return (
        <div className="responsibility-filter" ref={box}>

            <FunnelButton
                aria-label={label}
                title={label}
                aria-expanded={open}
                aria-haspopup="true"
                active={off.size > 0}
                onClick={() => setOpen(current => !current)}
            />

            {open && (
                <div className="responsibility-filter-panel" role="group" aria-label={label}>
                    {options.map(option => (
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
