import { ReactNode } from "react";
import { type SectionTile } from "./SectionTileTypes.ts";

/**
 * ONE WAY TO PRESENT A CARD: the cards of these tiles (Resource, Activity, Partner, Provider; their channel and finished ones) are only ever FLOATING cards,
 * on their section part of the page. Their dialog is a navigation grid (subcategory boxes, card boxes) that closes when a card is chosen; a tile that holds
 * exactly one card opens that card directly, and one that holds none makes one blank card and opens it.
 */
export function cardsFloatOnly(tile: SectionTile): boolean {
    return !!tile.cardFor && !tile.direct && !tile.keepDialog && (tile.cardKind ?? "card") === "card";
}


/** The part of the page a tile's floating cards stand over: its section's card (the Completed tile, outside both, stands over Offering's Capability's card above it). */
export function sectionAnchor(from: HTMLElement): HTMLElement | null {
    const completed = from.closest<HTMLElement>(".section-tiles-completed");
    if (completed) {
        return completed.previousElementSibling as HTMLElement | null;
    }
    return from.closest<HTMLElement>(".business-foundation-input");
}


/**
 * WHERE A FLOATING CARD STANDS: over the OTHER section's column -- a card of Infrastructure pops up centred over Offering's Capability's card, one of Offering's
 * over Infrastructure's -- at the level of the first row of that column's tiles, so it never covers the tiles it was opened from.
 */
export function otherColumn(anchor: HTMLElement | null): HTMLElement | null {
    if (!anchor) {
        return anchor;
    }
    const columns = Array.from(document.querySelectorAll<HTMLElement>(".answer-columns.business-capability > .business-foundation-card"));
    if (columns.length === 2 && columns.includes(anchor)) {
        return columns[columns[0] === anchor ? 1 : 0];
    }
    // EVERY OTHER PAGE: the page is divided, inside, into a left and a right half, and a card opens on the half its tile is NOT in: over the frame on the other half
    // (the Brand System's Ambassador and Style, the Identity System's frames). A page of one frame, or frames one under the other, keeps its frame.
    const frames = Array.from(document.querySelectorAll<HTMLElement>(".business-foundation-input[data-anchor]"))
        .filter(frame => !frame.closest(".section-tile-overlay") && frame.getBoundingClientRect().width > 0);
    if (frames.length < 2 || !frames.includes(anchor)) {
        return anchor;
    }
    const boxes = frames.map(frame => frame.getBoundingClientRect());
    const middle = (Math.min(...boxes.map(box => box.left)) + Math.max(...boxes.map(box => box.right))) / 2;
    const here = anchor.getBoundingClientRect();
    const leftHalf = here.left + here.width / 2 < middle;
    const across = frames.filter((_frame, at) => (boxes[at].left + boxes[at].width / 2 < middle) !== leftHalf && Math.abs(boxes[at].top - here.top) < here.height);
    return across[0] ?? anchor;
}


/**
 * THE OTHER HALF, FROM A TILE IN A DIALOG: a card opened from a tile inside a dialog (a category's, the Inventory's, the Completed's) stands over the frame on the half of the
 * page the pressed tile is NOT in -- a tile on the left opens its card on the right, one on the right on the left -- whatever frame the dialog itself covers.
 */
export function acrossFrom(pressed: HTMLElement | null): HTMLElement | null {
    if (!pressed || !pressed.closest(".section-tile-overlay")) {
        return null;
    }
    const frames = Array.from(document.querySelectorAll<HTMLElement>(".business-foundation-input[data-anchor]"))
        .filter(frame => !frame.closest(".section-tile-overlay") && frame.getBoundingClientRect().width > 0);
    if (frames.length < 2) {
        return null;
    }
    const boxes = frames.map(frame => frame.getBoundingClientRect());
    const middle = (Math.min(...boxes.map(box => box.left)) + Math.max(...boxes.map(box => box.right))) / 2;
    const here = pressed.getBoundingClientRect();
    const leftHalf = here.left + here.width / 2 < middle;
    const across = frames.filter((_frame, at) => (boxes[at].left + boxes[at].width / 2 < middle) !== leftHalf);
    return across[0] ?? null;
}


/** What an incomplete card lacks, as a tooltip: "Missing: Price, Payment Frequency (not counted until it is fixed)". */
export function incompleteTitle(missing: readonly string[]): string {
    return "Missing: " + [...new Set(missing)].join(", ") + " (not counted until it is fixed)";
}


/**
 * THE ONE SHAPE of every set of tiles or boxes (docs/ai/layout-rules.md, "Tile grids"): how many
 * across for `count` of them -- 1 to 3 in a single row, exactly 4 as a 2 x 2 square, 5 or more in
 * two rows (ceil(count / 2) across, the last row possibly shorter).
 */
export function gridColumns(count: number): number {
    if (count <= 3) {
        return Math.max(1, count);
    }
    return count === 4 ? 2 : Math.ceil(count / 2);
}


/**
 * WHERE THE TAIL TILE GOES (Infrastructure's grey Completed tile, a declared exception to the one shape): not counted
 * in the shape of the `count` others (`columns` across), it takes the first free cell of their LAST row, beside the
 * last of them. A last row that is full gives it a place in the same row only for the 2 x 2 square (a third column:
 * "Completed" right of "Sales & Customer", the first row's third cell empty); with three across or more it starts a new row.
 */
export function tailPlacement(count: number, columns: number): { row: number; column: number; columns: number } {
    const rows = Math.max(1, Math.ceil(count / columns));
    if (count % columns !== 0) {
        return { row: rows, column: (count % columns) + 1, columns };
    }
    return columns === 2 ? { row: rows, column: 3, columns: 3 } : { row: rows + 1, column: 1, columns };
}


/**
 * A tile's accessible name: its title and, after it, what it lists, joined (the first six, cut
 * at about 140 characters): "Utilities, Electricity, Internet, Heating & Gas".
 */
/** An item that is a LINE between two topics of a tile's list (a founder's roles, then the skills). */
export const TILE_DIVIDER = "---";


export function tileName(title: string, items: readonly string[] = []): string {
    const listed = items.map(item => plainTitle(item).replace(/\*\*/g, "").trim()).filter(item => item.length > 0 && item !== TILE_DIVIDER).slice(0, 6);
    title = plainTitle(title);
    if (listed.length === 0) {
        return title;
    }
    const whole = title + ", " + listed.join(", ");
    return whole.length <= 140 ? whole + (items.length > listed.length ? ", and more" : "") : whole.slice(0, 137).replace(/[ ,]+\S*$/, "") + "…";
}


/**
 * THE GAP BETWEEN THE TWO ROWS OF TILES: the viewport's y of the middle of the space between the first row of a page card's four tiles and the second. The page arrows
 * stand level with it (the Pages and Sections rails follow them), and the carousel arrows beside a card stand at the page arrows' own level.
 */
export function tileGapLevel(): number | null {
    const slots = Array.from(document.querySelectorAll<HTMLElement>(".section-tiles-quad .section-tile-slot"));
    // (Measured where the tiles are laid out, not where they are drawn: a tile grown under the pointer must not move the arrows.)
    const laidOut = (slot: HTMLElement) => {
        const parent = slot.offsetParent as HTMLElement | null;
        const top = (parent ? parent.getBoundingClientRect().top + parent.clientTop - parent.scrollTop : 0) + slot.offsetTop;
        return { top, bottom: top + slot.offsetHeight };
    };
    const first = slots[0] ? laidOut(slots[0]) : undefined;
    const second = first ? slots.map(laidOut).find(box => box.top > first.bottom - 4) : undefined;
    if (first && second) {
        return (first.bottom + second.top) / 2;
    }
    // A page with no tiles (a long page of lists): the level a page of tiles has at this width -- the heading's underline, the frame's 12px gap and its head (61px), one tile, and half the gap between rows.
    const underline = document.querySelector<HTMLElement>(".interview-divider")?.getBoundingClientRect();
    const card = document.querySelector<HTMLElement>(".conversation-card")?.getBoundingClientRect();
    if (underline && card && card.width > 300) {
        // (As a page of tiles sizes its tiles: the card's width allows one, the window's height leaves room for two rows above the footer; the gap follows them down from 12px.)
        const top = underline.bottom + window.scrollY + 12 + 61;
        const footer = document.querySelector<HTMLElement>(".workspace-footer")?.offsetHeight ?? 64;
        const natural = (Math.floor((card.width - 12) / 2) - 26 - 12) / 2;
        const tile = Math.min(natural, Math.max(Math.floor((window.innerHeight - top - footer - 36) / 2), 150));
        const gap = natural > 0 ? Math.max(6, Math.min(12, Math.round(12 * tile / natural))) : 12;
        return top + tile + gap / 2;
    }
    const frame = dialogFrame();
    return frame ? frame.top + frame.height / 2 : null;
}


/** The level the carousel arrows stand at: the page arrows' own. */
export function arrowLevel(): number | null {
    const page = document.querySelector<HTMLElement>(".page-arrow:not(.carousel-arrow)");
    if (page) {
        const box = page.getBoundingClientRect();
        if (box.height > 0) {
            return box.top + box.height / 2;
        }
    }
    const frame = dialogFrame();
    return frame ? frame.top + frame.height / 2 : null;
}


/**
 * THE DIALOG'S FRAME (docs/ai/layout-rules.md, "Section tiles and dialog"): it
 * spans from the page heading's underline (`.interview-divider`, never above the
 * fixed header) down to the footer's top (`.workspace-footer`, the fixed band at
 * the bottom of the window; the window's bottom without one). EVERY dialog has this
 * one frame: that height, and the width of the page's card area
 * (`.conversation-card`, what the two page cards share), at most 92% of the
 * window's. Null where the page has no such lines (the CSS fallback: the least of
 * 92vw and 1400px wide, 88vh high, centred).
 */
export function dialogFrame(opener?: HTMLElement | null): { width: number; height: number; top: number; left?: number } | null {
    // A dialog covers the area of the card of its section (its left and right edges, top and height), not the page.
    // (Inventory and Completed stand outside both sections: their dialogs keep the page's full width.)
    const section = opener && !opener.closest(".section-tiles-completed") ? sectionAnchor(opener) : null;
    if (section) {
        const box = section.getBoundingClientRect();
        if (box.width > 200 && box.height > 200) {
            // (A card taller than the window is covered only as far as the window shows: under the header, above the footer.)
            const header = document.querySelector<HTMLElement>(".app-header")?.getBoundingClientRect().bottom ?? 0;
            const footer = document.querySelector<HTMLElement>(".workspace-footer")?.getBoundingClientRect().top;
            const top = Math.max(box.top, header);
            const bottom = Math.min(box.bottom, footer !== undefined ? footer - 12 : window.innerHeight);
            if (bottom - top > 200 && (top > box.top || bottom < box.bottom)) {
                return { width: box.width, height: bottom - top, top, left: box.left };
            }
            return { width: box.width, height: box.height, top: box.top, left: box.left };
        }
    }
    const underline = document.querySelector<HTMLElement>(".interview-divider");
    if (!underline) {
        return null;
    }
    const header = document.querySelector<HTMLElement>(".app-header");
    const footer = document.querySelector<HTMLElement>(".workspace-footer");
    // A page-wide dialog (Inventory, Completed) starts where the page's cards start and ends 12px above the footer.
    const cardsTop = document.querySelector<HTMLElement>(".answer-columns.business-capability > .business-foundation-card")?.getBoundingClientRect().top;
    const top = Math.max(cardsTop ?? underline.getBoundingClientRect().bottom, underline.getBoundingClientRect().bottom, header?.getBoundingClientRect().bottom ?? 0);
    const bottom = footer ? footer.getBoundingClientRect().top - 12 : window.innerHeight;
    const space = bottom - top;
    if (!(space >= 200)) {
        return null;
    }
    const most = window.innerWidth * 0.92;
    const card = document.querySelector<HTMLElement>(".conversation-card")?.getBoundingClientRect().width ?? most;
    return { width: Math.min(card, most), height: space, top };
}


/**
 * A title as it is DRAWN in a tile or a dialog: an "&" never ends a line, it is joined
 * to the word after it with a no-break space ("External Professionals & Partners"
 * wraps as "External / Professionals / & Partners"). The accessible name stays the
 * plain title (the tile's `aria-label`).
 */
export function drawnTitle(title: string): string {
    return title.replace(/ & /g, " & ");
}


/**
 * A title or a list item may carry a FORCED LINE BREAK ("\n": "Cooling & Air\nConditioning"): it is drawn on two lines there,
 * whatever the room. Everywhere else (an accessible name, a tooltip, a crumb of the dialog's header) the break is a space.
 */
export function plainTitle(text: string): string {
    return text.replace(/[\n\u0001]/g, " ");
}


/** The parts of a title or item between its forced line breaks (an "&" that starts one is joined to the word after it: it never ends a line). */
export function brokenLines(text: string): string[] {
    return text.split("\n").map(part => part.replace(/^& /, "& "));
}


/** A line's words, with what stands between two pairs of asterisks in bold. */
export function boldWords(text: string): ReactNode {
    return text.split("**").map((part, at) => at % 2 === 1 ? <strong key={at}>{part}</strong> : part);
}


/** The hue of a tile made from a Customer Channel (the palette's teal). */
export const CHANNEL_TILE_HUE = 172;


/**
 * THE POINT A TILE SCALES FROM (150% on hover): the corner of the group it stands in (the left column from its left edge, the
 * right from its right, the middle from the centre; the top row from the top, the bottom from the bottom; a single row or
 * column from the centre), moved toward the centre as far as it takes to keep the scaled tile inside `room` (its card's
 * scrolling body) where the room is narrow. Returns a CSS transform-origin.
 */
export function scaleOrigin(
    box: { left: number; right: number; top: number; bottom: number; width: number; height: number },
    room: { left: number; right: number; top: number; bottom: number } | null,
    at: { row: number; column: number },
    columns: number,
    rows: number,
    scale = 1.1
): string {
    const axis = (index: number, count: number, near: number, far: number, size: number, low: number, high: number) => {
        // 0 = scaled from the near edge (it grows away from it), 1 = from the far edge, 0.5 = the centre.
        let fraction = count <= 1 ? 0.5 : index <= 0 ? 0 : index >= count - 1 ? 1 : 0.5;
        if (Number.isFinite(low) && Number.isFinite(high)) {
            const grow = (scale - 1) * size;
            // The near edge moves back by fraction x grow, the far edge on by (1 - fraction) x grow.
            const most = grow > 0 ? Math.min(1, (near - low) / grow) : 1;
            const least = grow > 0 ? Math.max(0, 1 - (high - far) / grow) : 0;
            fraction = least > most ? (least + most) / 2 : Math.min(most, Math.max(least, fraction));
        }
        return Math.round(fraction * 1000) / 10 + "%";
    };
    const x = axis(at.column, columns, box.left, box.right, box.width, room ? room.left : NaN, room ? room.right : NaN);
    const y = axis(at.row, rows, box.top, box.bottom, box.height, room ? room.top : NaN, room ? room.bottom : NaN);
    return x + " " + y;
}
