import { useEffect, useRef, useState } from "react";

import { relativeLuminance } from "../../framework/engine/AnswerUtils.ts";
import { NUMBER_LIMITS, limitedNumberText } from "./numberInput.ts";

/*
    Two pieces of the Brand Style page (BrandStyleEditor): a folded
    colour card's tint, and a Text Hierarchy level's px box.
*/

/* ---------- A folded colour card, tinted with its colour ---------- */

type Rgb = [number, number, number];

/** "#1a2b3c", "#abc" or "rgb(1, 2, 3)" as 0-255 channels; null when unreadable. */
export function readColour(text: string): Rgb | null {
    const value = text.trim();
    const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
    if (hex) {
        const digits = hex[1].length === 3 ? hex[1].split("").map(digit => digit + digit).join("") : hex[1];
        return [0, 2, 4].map(start => parseInt(digits.slice(start, start + 2), 16)) as Rgb;
    }
    const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(value);
    return rgb ? [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])] : null;
}

function luminanceOf(colour: Rgb): number {
    return relativeLuminance(colour.map(channel => channel / 255) as Rgb);
}

/** WCAG contrast between two colours, 1 to 21. */
export function contrastBetween(one: Rgb, other: Rgb): number {
    const [light, dark] = [luminanceOf(one), luminanceOf(other)].sort((a, b) => b - a);
    return (light + 0.05) / (dark + 0.05);
}

/** The card's ground and the texts drawn on it, as the theme has them now. */
export interface CardInk {
    ground: Rgb;
    texts: Rgb[];
}

/** Reads the card tokens, again whenever the theme changes. */
export function useCardInk(): CardInk | null {
    const read = (): CardInk | null => {
        if (typeof document === "undefined") {
            return null;
        }
        const style = getComputedStyle(document.documentElement);
        const token = (name: string) => readColour(style.getPropertyValue(name));
        // The Brand Style cards' own ground (conversation.css: --bg-panel).
        const ground = token("--bg-panel");
        const texts = ["--text-default", "--text-muted", "--text-subtle"].map(token).filter((colour): colour is Rgb => colour !== null);
        return ground && texts.length > 0 ? { ground, texts } : null;
    };
    const [ink, setInk] = useState<CardInk | null>(read);
    useEffect(() => {
        const observer = new MutationObserver(() => setInk(read()));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        return () => observer.disconnect();
    }, []);
    return ink;
}

/**
 * A gentle mix of a colour into the card's ground: as much of it as
 * keeps every text on the card at 4.5:1 or better, up to 30%. A colour
 * too close to the text's own takes less (a lighter mix on a light
 * theme, a darker one on a dark), and none at all if even 5% would
 * not do. Null for no tint.
 */
export function cardTint(hex: string | undefined, ink: CardInk | null): string | null {
    const colour = hex ? readColour(hex) : null;
    if (!colour || !ink) {
        return null;
    }
    for (let share = 0.3; share >= 0.05 - 1e-9; share -= 0.05) {
        const mix = ink.ground.map((channel, index) => Math.round(channel * (1 - share) + colour[index] * share)) as Rgb;
        if (ink.texts.every(text => contrastBetween(text, mix) >= 4.5)) {
            return "rgb(" + mix.join(", ") + ")";
        }
    }
    return null;
}

/* ---------- A Text Hierarchy level's px box ---------- */

/** "36–48" as its two ends, or null when it is not a range. */
export function pixelRange(range: string): { min: number; max: number } | null {
    const match = /^(\d+)\s*[–-]\s*(\d+)$/.exec(range.trim());
    return match ? { min: Number(match[1]), max: Number(match[2]) } : null;
}

/** A size kept within its range: the nearest end where it is outside, "" left empty. */
export function clampedSize(size: string, range: { min: number; max: number }): string {
    const value = Number(size);
    if (size.trim() === "" || !Number.isFinite(value)) {
        return size.trim() === "" ? "" : String(range.min);
    }
    return String(Math.min(range.max, Math.max(range.min, Math.round(value))));
}

/**
 * The px box of one level. Typed as any whole number, and kept within
 * the level's range (the same range its "i" states) when the box is
 * left, with a quiet line saying so. While it has the focus, ↑ and ↓ --
 * or the mouse wheel over it -- step the size by 1 (5 with Shift),
 * within the range; the wheel then turns the size, not the page.
 */
export function LevelSize({

    label,

    range,

    value,

    disabled = false,

    onChange

}: {

    label: string;
    /** "36–48", as the level's "i" says it. */
    range: string;
    value: string;
    disabled?: boolean;
    onChange: (next: string) => void;

}) {

    const bounds = pixelRange(range);
    const box = useRef<HTMLInputElement | null>(null);
    const [kept, setKept] = useState(false);

    /* The latest value and handler, for the wheel's own listener. */
    const latest = useRef({ value, onChange, bounds });
    latest.current = { value, onChange, bounds };

    function stepped(current: string, by: number): string {
        const range = latest.current.bounds;
        if (!range) {
            return current;
        }
        const start = Number(current);
        const base = current.trim() === "" || !Number.isFinite(start)
            ? (by > 0 ? range.min - by : range.max - by)
            : start;
        return String(Math.min(range.max, Math.max(range.min, Math.round(base) + by)));
    }

    /* A wheel listener that may cancel the page's scroll (React's own is passive). */
    useEffect(() => {
        const element = box.current;
        if (!element) {
            return;
        }
        function onWheel(event: WheelEvent) {
            if (document.activeElement !== element || event.deltaY === 0) {
                return;
            }
            event.preventDefault();
            const by = (event.shiftKey ? 5 : 1) * (event.deltaY < 0 ? 1 : -1);
            setKept(false);
            latest.current.onChange(stepped(latest.current.value, by));
        }
        element.addEventListener("wheel", onWheel, { passive: false });
        return () => element.removeEventListener("wheel", onWheel);
    }, []);

    return (
        <span className="brand-hierarchy-size-holder">

            <span className="brand-hierarchy-size">

                <input
                    ref={box}
                    type="text"
                    inputMode="numeric"
                    className="interview-input brand-size-input"
                    aria-label={`${label} size in pixels, recommended ${range}`}
                    // No range written inside: a square holds three digits,
                    // not "36–48". It is in the box's name, its tooltip
                    // and the section's "i".
                    title={"Recommended " + range + " px"}
                    disabled={disabled}
                    value={value}
                    onChange={(event) => {
                        setKept(false);
                        // Whole pixels -- "px" is printed beside the
                        // box, so a typed "24px" is refused, not doubled.
                        onChange(limitedNumberText(event.target.value, value, NUMBER_LIMITS.pixels));
                    }}
                    onKeyDown={(event) => {
                        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
                            return;
                        }
                        event.preventDefault();
                        setKept(false);
                        onChange(stepped(value, (event.shiftKey ? 5 : 1) * (event.key === "ArrowUp" ? 1 : -1)));
                    }}
                    onBlur={() => {
                        if (!bounds) {
                            return;
                        }
                        const next = clampedSize(value, bounds);
                        if (next !== value) {
                            setKept(true);
                            onChange(next);
                        }
                    }}
                />

                <span className="brand-hierarchy-unit" aria-hidden="true">px</span>

            </span>

            {kept && bounds && (
                <span className="brand-hierarchy-kept" role="status">
                    {"Kept within " + range + " px."}
                </span>
            )}

        </span>
    );

}
