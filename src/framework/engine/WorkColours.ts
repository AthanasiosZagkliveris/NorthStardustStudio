import { paletteHue } from "./Palette.ts";

/**
 * THE FOUNDATION'S COLOUR MAP (docs/design/core/01-current-design.md, part I): a page's colour says what the user does in it. Applied to the pages drawn as tiles
 * (Identity, Brand, Strategy's Situation & Direction); each is drawn as the palette colour nearest the proposal's.
 */
export type WorkType = "discover" | "define" | "create" | "decide" | "build" | "review" | "connect";

const WORK_HEX: Record<WorkType, string> = {
    discover: "#4a82d9",
    define: "#4fbf8a",
    create: "#8a6bd1",
    decide: "#f0825a",
    build: "#e8b84a",
    review: "#cfc6e6",
    connect: "#3fb5b0"
};

/** The hue of a colour given as #rrggbb, in degrees. */
export function hueOfHex(hex: string): number {
    const [red, green, blue] = [1, 3, 5].map(at => parseInt(hex.slice(at, at + 2), 16) / 255);
    const high = Math.max(red, green, blue);
    const low = Math.min(red, green, blue);
    const span = high - low;
    if (span === 0) {
        return 0;
    }
    const raw = high === red ? ((green - blue) / span) % 6 : high === green ? (blue - red) / span + 2 : (red - green) / span + 4;
    return Math.round(((raw * 60) + 360) % 360);
}

/** The palette hue a page of this kind of work is drawn in. */
export function workHue(type: WorkType): number {
    return paletteHue(hueOfHex(WORK_HEX[type]));
}
