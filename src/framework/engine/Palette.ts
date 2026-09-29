/* ==========================================================
   The palette

   Every colour the app picks for a thing of its own -- a Business
   Segment, a Strategic Theme and its Roadmap bars, a Business
   card, a Financial section -- is one of these seven soft hues,
   never an arbitrary point on the wheel. A hue here is only the
   hue: the stylesheet completes it with the System colour
   families in colors.css (the --theme-*-* "saturation lightness"
   pairs), which is where each role gets its light and its dark
   value:

     ground     --theme-bg-ground    the card or Theme box
     tint       --theme-bg-inner     a panel inside it
     bar fill   --theme-bg-bar       a Roadmap bar
     border     --theme-line-edge    the card's edge
     label ink  --theme-text-ink     the labels on the ground

   so one hue, handed down as --strategy-theme-hue, draws the same
   calm colour in either theme. Palette.test.ts holds every label
   ink above 4.5:1 on every ground of every hue, in both.

   The order is their priority, and the order new things take them
   in: first the hues that sit with the app's own blue (#0b57d0,
   hue 217) and read as the calmest -- sky and periwinkle within 20
   degrees of it, then teal -- then the rest, the cool before the
   warm: sage, lavender, and last rose and terracotta, the two
   furthest from the blue and the least restful. A new thing never
   takes its neighbour's colour (nextPaletteHue), and no two of the
   seven are closer than 28 degrees, so neighbours stay apart.
   (Sand was the eighth; it read as a dull yellow beside the others.
   A hue saved near it is drawn as terracotta, the nearest left.)
========================================================== */

export interface PaletteColour {

    /** What the colour is called, for people. */
    name: string;

    /** Its hue, 0-360. */
    hue: number;

}

export const PALETTE: readonly PaletteColour[] = [
    { name: "sky", hue: 200 },
    { name: "periwinkle", hue: 228 },
    { name: "teal", hue: 172 },
    { name: "sage", hue: 130 },
    { name: "lavender", hue: 262 },
    { name: "rose", hue: 335 },
    { name: "terracotta", hue: 14 }
];

/** How far apart two hues are, going the short way round. */
export function hueDistance(one: number, other: number): number {

    const apart = Math.abs(one - other) % 360;

    return Math.min(apart, 360 - apart);

}

/** The palette colour nearest to a hue (the first one for a hue that is not a number). */
export function nearestPaletteColour(hue: number): PaletteColour {

    if (!Number.isFinite(hue)) {
        return PALETTE[0];
    }

    return PALETTE.reduce((nearest, colour) =>
        hueDistance(colour.hue, hue) < hueDistance(nearest.hue, hue) ? colour : nearest
    );

}

/**
 * The palette hue to DRAW for a hue as stored or derived.
 *
 * Saved answers carry the arbitrary hues the app used to pick
 * (any tenth of a degree); they are never rewritten. Each is
 * drawn as its nearest palette colour instead, at render time,
 * so an old Segment keeps roughly the colour it had -- a green
 * stays a green -- in the calm version of it.
 */
export function paletteHue(hue: number): number {
    return nearestPaletteColour(hue).hue;
}

/** The hue of the palette colour called `name`. */
export function paletteHueNamed(name: string): number {

    const colour = PALETTE.find(entry => entry.name === name);

    if (!colour) {
        throw new Error("No palette colour called " + name);
    }

    return colour.hue;

}

/**
 * The palette hue for a NEW thing, given the hues its siblings
 * already have, in their order (the last is its neighbour: a new
 * thing goes at the end).
 *
 * The palette is taken in turn: the colour after the neighbour's,
 * skipping on to the least-used colours once every one is taken,
 * and never the neighbour's own colour, so the new thing never
 * matches the one beside it. With no siblings it is `first`.
 */
export function nextPaletteHue(taken: number[], first: number = PALETTE[0].hue): number {

    const inUse = taken.filter(hue => Number.isFinite(hue)).map(hue => PALETTE.indexOf(nearestPaletteColour(hue)));

    if (inUse.length === 0) {
        return paletteHue(first);
    }

    const neighbour = inUse[inUse.length - 1];

    const uses = PALETTE.map((_, index) => inUse.filter(used => used === index).length);

    let best = -1;

    for (let step = 1; step <= PALETTE.length; step++) {

        const index = (neighbour + step) % PALETTE.length;

        if (index === neighbour) {
            continue;
        }

        if (best === -1 || uses[index] < uses[best]) {
            best = index;
        }

    }

    return PALETTE[best].hue;

}

/**
 * One palette colour for each of a list of things, by POSITION in
 * the list handed over, taken in the palette's order: the first
 * thing sky, the second periwinkle, and round again after the
 * seventh.
 */
export function paletteHuesInOrder(ids: string[]): Record<string, number> {

    const hues: Record<string, number> = {};

    ids.forEach((id, index) => {
        hues[id] = PALETTE[index % PALETTE.length].hue;
    });

    return hues;

}
