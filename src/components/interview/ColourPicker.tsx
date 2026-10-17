import { CSSProperties, PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";

import { useFloatingPanel } from "../../hooks/useFloatingPanel.ts";
import { consumeKey } from "./consumeKey.ts";
import OptionPicker from "./OptionPicker.tsx";

/**
 * THE COLOUR PICKER: the colour as a 32px box (inside the hex cell), and, opened, a card of the app's own in place of the browser's: a square of the colour's
 * shades (across: how vivid, up: how light), the hues in a bar under it, and the red, green and blue as numbers. Drawn as the date cell's calendar card is:
 * on the ground of the card it opens from, the same corners, the same closing (a click elsewhere, Escape).
 */

interface Hsv { h: number; s: number; v: number }

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

export function hexToRgb(hex: string): [number, number, number] | null {
    const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!match) {
        return null;
    }
    const n = parseInt(match[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map(channel => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0")).join("");
}

export function rgbToHsv(r: number, g: number, b: number): Hsv {
    const red = r / 255, green = g / 255, blue = b / 255;
    const max = Math.max(red, green, blue), min = Math.min(red, green, blue), delta = max - min;
    let h = 0;
    if (delta > 0) {
        if (max === red) { h = ((green - blue) / delta) % 6; }
        else if (max === green) { h = (blue - red) / delta + 2; }
        else { h = (red - green) / delta + 4; }
        h *= 60;
        if (h < 0) { h += 360; }
    }
    return { h, s: max === 0 ? 0 : delta / max, v: max };
}

export function hsvToRgb({ h, s, v }: Hsv): [number, number, number] {
    const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
    const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    const red = r / 255, green = g / 255, blue = b / 255;
    const max = Math.max(red, green, blue), min = Math.min(red, green, blue), delta = max - min;
    const l = (max + min) / 2;
    const { h } = rgbToHsv(r, g, b);
    const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    return [h, s * 100, l * 100];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    const sat = clamp(s, 0, 100) / 100, light = clamp(l, 0, 100) / 100;
    const c = (1 - Math.abs(2 * light - 1)) * sat, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = light - c / 2;
    const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

/** The ways the picker writes a colour's code. */
const CODES = ["HEX", "RGB", "HSL"] as const;
type Code = typeof CODES[number];

export default function ColourPicker({
    value,
    onChange,
    disabled = false,
    ariaLabel
}: {
    /** The colour as "#rrggbb", or "" while there is none. */
    value: string;
    onChange: (hex: string) => void;
    disabled?: boolean;
    ariaLabel: string;
}) {

    const rgb = hexToRgb(value);
    const [open, setOpen] = useState(false);
    const [free, setFree] = useState(false);
    const [code, setCode] = useState<Code>("HEX");

    // The hue is kept apart from the colour: a grey or a black has none of its own, and dragging across one must not lose it.
    const [hsv, setHsv] = useState<Hsv>(() => rgb ? rgbToHsv(...rgb) : { h: 0, s: 0, v: 1 });

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const boxRef = useRef<HTMLDivElement | null>(null);
    const areaRef = useRef<HTMLDivElement | null>(null);
    const hueRef = useRef<HTMLDivElement | null>(null);

    const { panelRef, panelStyle } = useFloatingPanel(open, triggerRef, undefined, free);

    // What is typed in the hex cell beside the box moves the picker too (keeping the hue where the colour has none).
    useEffect(() => {
        const now = hexToRgb(value);
        if (now) {
            setHsv(previous => {
                const next = rgbToHsv(...now);
                return rgbToHex(...hsvToRgb(previous)) === rgbToHex(...now) ? previous : { ...next, h: next.s === 0 || next.v === 0 ? previous.h : next.h };
            });
        }
    }, [value]);

    useEffect(() => {

        if (!open) {
            return;
        }

        const away = (event: MouseEvent) => {
            if (!boxRef.current?.contains(event.target as Node)) {
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

    const commit = (next: Hsv) => {
        setHsv(next);
        onChange(rgbToHex(...hsvToRgb(next)));
    };

    /** A drag on the square or on the bar: the pointer is followed until it is let go, even outside the element. */
    const drag = (target: React.RefObject<HTMLDivElement | null>, apply: (x: number, y: number) => void) => (event: ReactPointerEvent<HTMLDivElement>) => {
        const element = target.current;
        if (!element || disabled) {
            return;
        }
        event.preventDefault();
        const move = (clientX: number, clientY: number) => {
            const box = element.getBoundingClientRect();
            apply(clamp((clientX - box.left) / box.width, 0, 1), clamp((clientY - box.top) / box.height, 0, 1));
        };
        move(event.clientX, event.clientY);
        const onMove = (next: PointerEvent) => move(next.clientX, next.clientY);
        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    const channels = rgb ?? hsvToRgb(hsv).map(Math.round) as [number, number, number];
    const names = ["R", "G", "B"] as const;
    const setChannel = (index: number, text: string) => {
        const next = [...channels] as [number, number, number];
        next[index] = clamp(Number(text.replace(/\D/g, "").slice(0, 3)) || 0, 0, 255);
        const keptHue = rgbToHsv(...next);
        setHsv({ ...keptHue, h: keptHue.s === 0 || keptHue.v === 0 ? hsv.h : keptHue.h });
        onChange(rgbToHex(...next));
    };

    return (
        <div className="colour-picker" ref={boxRef}>

            <button
                ref={triggerRef}
                type="button"
                className={"brand-colour-picker" + (rgb ? "" : " brand-colour-picker-empty")}
                style={rgb ? { background: rgbToHex(...rgb) } : undefined}
                aria-label={ariaLabel}
                aria-expanded={open}
                aria-haspopup="dialog"
                disabled={disabled}
                onClick={() => {
                    if (open) {
                        setOpen(false);
                        return;
                    }
                    setFree(!!triggerRef.current?.closest(".business-capability, .section-tile-overlay, .section-tile-dialog, .strategy-sort-menu"));
                    setOpen(true);
                }}
            />

            {open && (
                <div ref={panelRef} className="date-cell-popup colour-popup" style={panelStyle} role="dialog" aria-label={ariaLabel}>

                    <div
                        ref={areaRef}
                        className="colour-popup-area"
                        style={{ "--colour-hue": hsv.h } as CSSProperties}
                        onPointerDown={drag(areaRef, (x, y) => commit({ h: hsv.h, s: x, v: 1 - y }))}
                    >
                        <span className="colour-popup-handle" style={{ left: hsv.s * 100 + "%", top: (1 - hsv.v) * 100 + "%" }} />
                    </div>

                    <div
                        ref={hueRef}
                        className="colour-popup-hue"
                        onPointerDown={drag(hueRef, (x) => commit({ h: x * 360, s: hsv.s, v: hsv.v }))}
                    >
                        <span className="colour-popup-handle" style={{ left: (hsv.h / 360) * 100 + "%", top: "50%" }} />
                    </div>

                    {/* The code the colour is written in: its hex (# and six digits), its red, green and blue, or its hue, saturation and lightness. */}
                    <div className="colour-popup-code">
                        <OptionPicker
                            label={ariaLabel + " code"}
                            options={[...CODES]}
                            value={code}
                            disabled={disabled}
                            fill
                            onChange={(next) => setCode(next as Code)}
                        />
                    </div>

                    <div className={"colour-popup-channels" + (code === "HEX" ? " colour-popup-channels-one" : "")}>
                        {code === "HEX" && (
                            <label className="colour-popup-channel">
                                <span>HEX</span>
                                <input
                                    type="text"
                                    className="interview-input"
                                    aria-label={ariaLabel + " hex"}
                                    disabled={disabled}
                                    value={rgbToHex(...channels).toUpperCase()}
                                    onChange={(event) => {
                                        const typed = hexToRgb(event.target.value);
                                        if (typed) {
                                            commit(rgbToHsv(...typed));
                                        }
                                    }}
                                />
                            </label>
                        )}
                        {code === "RGB" && names.map((name, index) => (
                            <label key={name} className="colour-popup-channel">
                                <span>{name}</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className="interview-input"
                                    aria-label={ariaLabel + " " + name}
                                    disabled={disabled}
                                    value={String(Math.round(channels[index]))}
                                    onChange={(event) => setChannel(index, event.target.value)}
                                />
                            </label>
                        ))}
                        {code === "HSL" && (["H", "S", "L"] as const).map((name, index) => {
                            const hsl = rgbToHsl(...channels);
                            return (
                                <label key={name} className="colour-popup-channel">
                                    <span>{name}</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className="interview-input"
                                        aria-label={ariaLabel + " " + name}
                                        disabled={disabled}
                                        value={String(Math.round(hsl[index]))}
                                        onChange={(event) => {
                                            const next = [...hsl] as [number, number, number];
                                            next[index] = clamp(Number(event.target.value.replace(/\D/g, "").slice(0, 3)) || 0, 0, index === 0 ? 360 : 100);
                                            onChange(rgbToHex(...hslToRgb(...next)));
                                        }}
                                    />
                                </label>
                            );
                        })}
                    </div>

                </div>
            )}

        </div>
    );

}
