import { ReactNode } from "react";
import { type SectionTile } from "./SectionTileTypes.ts";
import { shownFrame } from "../../../hooks/shownFrame.ts";
import { BAND_QUERY, verticalAcross } from "../../../hooks/useVerticalLayout.ts";

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
 * THE CARD OF A TILE'S SECTION, WHOLLY IN VIEW where the window has room for it (between the header with the page title under it and the footer): a card cut by
 * the window's foot is scrolled up, one cut by the top scrolled down; a card taller than that room is left where it is (its dialog then covers what shows).
 */
export function revealSection(from: HTMLElement): void {
    const section = from.closest(".section-tiles-completed") ? null : sectionAnchor(from);
    if (!section) {
        return;
    }
    const box = section.getBoundingClientRect();
    const header = Math.max(document.querySelector<HTMLElement>(".app-header")?.getBoundingClientRect().bottom ?? 0, document.querySelector<HTMLElement>(".interview-divider")?.getBoundingClientRect().bottom ?? 0);
    const footer = document.querySelector<HTMLElement>(".workspace-footer")?.getBoundingClientRect().top;
    const bottom = footer !== undefined ? footer - 12 : window.innerHeight;
    if (box.height > bottom - header) {
        return;
    }
    const by = box.bottom > bottom ? box.bottom - bottom : box.top < header ? box.top - header : 0;
    if (by !== 0) {
        window.scrollBy({ top: by, behavior: "instant" as ScrollBehavior });
    }
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
        // (Only where the two stand side by side: below 1200px they stack, and a card keeps the chapter it was opened from -- the one its dialog covers;
        // layout rules section 8, "Placed on the first row"; 2026-11-20.)
        const other = columns[columns[0] === anchor ? 1 : 0];
        const here = anchor.getBoundingClientRect();
        return Math.abs(other.getBoundingClientRect().top - here.top) < here.height ? other : anchor;
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


/** How far under its title a chapter's first row is looked for (FloatingCards: a row more than this under the frame's top is not its first row). */
const CARD_ROOM = 120;

/**
 * THE OTHER HALF, FROM A TILE IN A DIALOG: a card opened from a tile inside a dialog (a category's, the Inventory's, the Completed's) stands over the frame on the half of the
 * page the pressed tile is NOT in -- a tile on the left opens its card on the right, one on the right on the left -- whatever frame the dialog itself covers. Where the
 * chapters stand one under the other (below 1200px) there is no other half: the card stands over the chapter the dialog covers from its top, on its first row.
 */
export function acrossFrom(pressed: HTMLElement | null): HTMLElement | null {
    if (!pressed || !pressed.closest(".section-tile-overlay")) {
        return null;
    }
    const frames = Array.from(document.querySelectorAll<HTMLElement>(".business-foundation-input[data-anchor]"))
        .filter(frame => !frame.closest(".section-tile-overlay") && frame.getBoundingClientRect().width > 0);
    if (frames.length === 1) {
        // (A page of one chapter: its card stands in the empty half beside it -- the next chapter's place -- where there is room; the card places itself there, emptyHalfCentre.)
        return emptyHalfCentre(frames[0]) !== null ? frames[0] : null;
    }
    if (frames.length < 2) {
        return null;
    }
    const boxes = frames.map(frame => frame.getBoundingClientRect());
    const middle = (Math.min(...boxes.map(box => box.left)) + Math.max(...boxes.map(box => box.right))) / 2;
    const here = pressed.getBoundingClientRect();
    const leftHalf = here.left + here.width / 2 < middle;
    // (A frame as wide as the page -- the chapters stacked -- stands on neither half: its centre is the middle.)
    const across = frames.filter((_frame, at) => Math.abs(boxes[at].left + boxes[at].width / 2 - middle) > 1 && (boxes[at].left + boxes[at].width / 2 < middle) !== leftHalf);
    if (across.length > 0) {
        return across[0];
    }
    // (FRAMES ONE UNDER THE OTHER (below 1200px): no other half; the card stands over the chapter its dialog covers, on that chapter's first row -- layout rules
    // section 8, "Placed on the first row"; 2026-11-20, at 768 it stood at the top of the band instead.)
    const dialog = pressed.closest<HTMLElement>(".section-tile-dialog")?.getBoundingClientRect();
    if (!dialog) {
        return null;
    }
    // (The chapter under the dialog's top as it shows -- a dialog taller than the window scrolls in its layer, its own top far above: the chapter it was opened over.)
    const shownTop = Math.max(dialog.top, document.querySelector<HTMLElement>(".interview-divider")?.getBoundingClientRect().bottom ?? 0);
    // (The first chapter that still shows a row under that top (CARD_ROOM, 120px, the room a first row is looked for in): the one the dialog covers from its top --
    // a Segment's part starts under the chapter's head; a chapter scrolled away all but its foot is passed over.)
    const under = frames.map((_frame, at) => at).filter(at => boxes[at].bottom > shownTop + CARD_ROOM).sort((one, other) => boxes[one].top - boxes[other].top)[0] ?? -1;
    if (under >= 0) {
        return frames[under];
    }
    const overlap = (at: number) => Math.max(0, Math.min(boxes[at].bottom, dialog.bottom) - Math.max(boxes[at].top, dialog.top));
    const covered = frames.map((_frame, at) => at).filter(at => overlap(at) > 0).sort((one, other) => overlap(other) - overlap(one));
    return covered.length > 0 ? frames[covered[0]] : null;
}

/**
 * THE EMPTY HALF BESIDE A PAGE'S ONE CHAPTER (owner, 2026-11-12: "the floated cards should appear at the other side (next chapter)"): the centre of the place a second
 * chapter would take -- the chapter's own width, a frame gap (12px) beyond it, on the side of the window with room -- or null where the window has no room for it
 * (a narrow window, where the chapters stack) or the page has more than one chapter.
 */
export function emptyHalfCentre(chapter: HTMLElement): number | null {
    const chapters = Array.from(document.querySelectorAll<HTMLElement>(".business-foundation-input[data-anchor]"))
        .filter(frame => !frame.closest(".section-tile-overlay") && frame.getBoundingClientRect().width > 0);
    if (chapters.length !== 1 || chapters[0] !== chapter) {
        return null;
    }
    const box = chapter.getBoundingClientRect();
    const left = box.left + box.width / 2 < window.innerWidth / 2 ? box.right + 12 : box.left - 12 - box.width;
    return left >= 0 && left + box.width <= window.innerWidth ? left + box.width / 2 : null;
}


/** What an incomplete card lacks, as a tooltip: "Missing: Price, Payment Frequency (not counted until it is fixed)". */
export function incompleteTitle(missing: readonly string[]): string {
    return "Missing: " + [...new Set(missing)].join(", ") + " (not counted until it is fixed)";
}


/**
 * A LIST OF CARDS ONE ADDS TO (a dialog's cards with their Add Card; docs/ai/09-layout-rules.md, "Tile grids"): three in a row however many,
 * the Add Card in the next free place (owner, 2026-11-09: "each row should fit 3 tiles like all the other cards"). Fewer across only where
 * the dialog is too narrow for three.
 */
export const CARD_LIST_COLUMNS = 3;

/**
 * THE ONE SHAPE of every set of tiles or boxes (docs/ai/09-layout-rules.md, "Tile grids"): how many
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

/** A line of a tile's face: a name and what is said of it (a figure, a type), or nothing. */
export type FaceRow = { name: string; under: string };

/**
 * ONE FACE FOR EVERY TILE (owner, 2026-11-18 22:56 and 23:08 UTC+2: "Financial tiles' lists should follow the shared tile list"): each name, then what is said of it
 * in bold under it, and the tile list's own line between one and the next (Sales Forecast, Customer's Relationship, every financial tile). A name with nothing
 * under it stands alone.
 */
export function stackedFace(rows: readonly FaceRow[]): string[] {
    return rows.flatMap((row, at) => [...(at > 0 ? [TILE_DIVIDER] : []), row.name + (row.under ? "\n**" + row.under + "**" : "")]);
}


/**
 * A TILE'S SUB-TITLE, ONLY OVER WHAT IT TITLES (owner, 2026-11-19 22:48 UTC+2: "Titles - only when they have been defined, or already exist."): the sub-title in
 * capitals, centred with no bullet, then its lines, bulleted; with no line under it, no sub-title either (the Segment Description's PROFILES).
 */
export function titledLines(title: string, lines: readonly string[]): { items: string[]; itemMarks: { centre?: boolean; bullet?: boolean }[] } {
    if (lines.length === 0) {
        return { items: [], itemMarks: [] };
    }
    return { items: [title.toLocaleUpperCase(), ...lines], itemMarks: [{ centre: true }, ...lines.map(() => ({ bullet: true }))] };
}


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
 * THE ONE SIDE OF A MASTER TILE (owner, 2026-11-23 19:48 UTC+2: "Can we be consistent and use the same sizes?"; layout rules section 4, "The page's sizes"): the side
 * every page's master tiles -- a chapter's, a Capability's Systems' -- have in a window on a wide screen, worked out from the window alone, never from a page:
 * a chapter's column is half the page title's rule less both rails' room (--rail-inset each side) and the 12px between two chapters; a tile is half that column
 * less the frame's padding and edge (26px) and the 12px between two tiles; and no taller than lets two rows stand between the frame's head (the rule, 12px, the
 * frame's 61px head) and the footer with its 12px gaps. 150px at least. Null where there is no page title.
 */
/**
 * WHERE THE PAGE'S HEAD ENDS: the title's rule; where the title stands in the header (a small laptop, a tablet, a phone in landscape: app-header.css, its rule
 * hidden), the header's foot. The lines of a title that wraps are taken back, so they never lower the tiles.
 */
function headEnd(rule: DOMRect): number {
    if (rule.width === 0 && rule.height === 0) {
        return document.querySelector<HTMLElement>(".app-header")?.getBoundingClientRect().bottom ?? 64;
    }
    const title = document.querySelector<HTMLElement>(".interview-header h1");
    const line = title ? parseFloat(getComputedStyle(title).lineHeight) : NaN;
    const further = title && Number.isFinite(line) && line > 0 ? Math.max(0, Math.round(title.getBoundingClientRect().height / line) - 1) * line : 0;
    return rule.bottom - further;
}

/** Where the page title shows in the header, not under it (app-header.css): the page's head is then the header itself. */
const TITLE_IN_HEADER_QUERY = "(min-width: 601px) and (max-height: 700px), (min-width: 601px) and (max-width: 1100px), (min-width: 601px) and (pointer: coarse)";

/** The page title's row under the header where it shows there (24px to its capitals, the title, 12px to its rule: 70px at 1366, 71 at 1920). */
const TITLE_ROW = 70;

/**
 * THE END OF A PAGE'S HEAD AT THIS WINDOW: its title's rule, measured where a page shows one; where none does -- the Handbook, the Workbook, the Landing --, where
 * a page's would stand at this window (the header's foot, and the title's row under it where the title is not in the header). So every layer of a window reads
 * one arrow level (owner, 2026-11-26 18:05 UTC+2: "The Navigation arrows should be at a specific level per screen size").
 */
function pageHeadEnd(): number {
    const underline = document.querySelector<HTMLElement>(".interview-header .interview-divider") ?? document.querySelector<HTMLElement>(".interview-divider");
    if (underline) {
        return headEnd(underline.getBoundingClientRect());
    }
    const header = document.querySelector<HTMLElement>(".app-header")?.getBoundingClientRect().bottom ?? 64;
    const inHeader = typeof window.matchMedia === "function" && window.matchMedia(TITLE_IN_HEADER_QUERY).matches;
    return header + (inHeader ? 0 : TITLE_ROW);
}

export function masterSide(): number | null {
    // (The Workbook's panel stands for the card on the Workbook and the Handbook: Workbook.tsx.)
    const card = document.querySelector<HTMLElement>(".conversation-card, .workbook-panel")?.getBoundingClientRect();
    if (!card || card.width <= 300) {
        return null;
    }
    const top = pageHeadEnd() + 12 + 61;
    const footer = document.querySelector<HTMLElement>(".workspace-footer")?.offsetHeight ?? 64;
    const inset = railInset();
    // (The room is the window's -- the widest page it allows, 1400px at most, its 56px gutters --, never the page's own width, which follows the tiles.)
    const column = (widestPage() - 2 * inset - 12) / 2;
    const natural = Math.floor((column - 26 - 12) / 2);
    // (On a touch screen side by side, the band holds the rails and the page's buttons -- Inventory, Completed, "+ Add Segment" -- stand in a row above it: the
    // tiles leave that row's room, the band's button and 12px, on every page alike.)
    const buttons = typeof window.matchMedia === "function" && window.matchMedia(BAND_QUERY).matches ? 44 + 12 : 0;
    const tall = Math.floor((window.innerHeight - top - footer - buttons - 12 - 12 - 12 - 12) / 2);
    // (120px at the least: a 640px-tall window, the shortest that keeps chapters side by side, gives 147.)
    return Math.max(120, Math.min(natural, tall));
}

/** The rails' room at each end of the page (--rail-inset, bullet-rail.css). */
function railInset(): number {
    const inset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--rail-inset"));
    // (0 on a touch screen, whose rails stand in the footer's band: bullet-rail.css.)
    return Number.isFinite(inset) ? inset : 54;
}

/** The widest page the window allows: 1400px at most, the window less its 56px gutters (--rail-gutter). */
export function widestPage(): number {
    return Math.min(1400, document.documentElement.clientWidth - 2 * 56);
}

/**
 * THE PAGE FOLLOWS ITS TILES (owner, 2026-11-23 20:58 and 21:05 UTC+2: "The frame chapter should hug its tiles"; "I do not want the user, specially on landscape size
 * screens to scroll down"; "Looks good, let's refine it"; layout rules section 4, "The page's sizes"): a page of tiles is as wide as two chapters of the master side
 * -- each its tiles, the 12px between them and its 13px round them --, the 12px between the chapters and the rails' room at both ends, never wider than the window
 * allows. The page is centred in the window; inside it everything stands at the left.
 */
export function tilesPageWidth(side: number): number {
    return Math.min(widestPage(), 2 * (2 * side + 12 + 26) + 12 + 2 * railInset());
}

/** Sets the page's width from its tiles on the page's root (.conversation-page: --tiles-page-width, data-tiles-page), or takes it away (side null). */
/** Sets the page's width to a measured width (the stacked layout: its one chapter's), or takes it away (null). */
export function setTilesPageWidth(page: HTMLElement | null, width: number | null): void {
    if (!page) {
        return;
    }
    if (width === null) {
        page.removeAttribute("data-tiles-page");
        page.style.removeProperty("--tiles-page-width");
        return;
    }
    const value = Math.ceil(width) + "px";
    if (page.style.getPropertyValue("--tiles-page-width") !== value) {
        page.style.setProperty("--tiles-page-width", value);
        page.setAttribute("data-tiles-page", "");
        window.requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    }
}

export function setTilesPage(page: HTMLElement | null, side: number | null): void {
    if (!page) {
        return;
    }
    if (side === null) {
        page.removeAttribute("data-tiles-page");
        page.style.removeProperty("--tiles-page-width");
        return;
    }
    const width = Math.floor(tilesPageWidth(side)) + "px";
    if (page.style.getPropertyValue("--tiles-page-width") !== width) {
        page.style.setProperty("--tiles-page-width", width);
        page.setAttribute("data-tiles-page", "");
        window.requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    }
}


/**
 * THE ONE ARROW LEVEL (owner, 2026-11-18 21:34 UTC+2: "A: Level page arrows everywhere"; layout rules section 10, "One arrow level"): the viewport's y where every
 * page arrow and every dialog's and floating card's carousel arrow has its centre, the same on every page of a window -- the arrows never move. It is the level of the
 * gap between the two rows of a page of four tiles at this window: the page title's underline where the title is one line (pinned; a long title that wraps, as
 * "Costs, Funding & Position" at 1366, has its further lines taken back, so it does not lower the arrows), the frame's 12px gap and its head
 * (61px), one tile as a page of tiles sizes it (the card's width allows one, the window's height leaves room for two rows above the footer) and half the gap
 * between the rows. Worked out from the window, never measured from a page's own tiles, so no page can move it. Where there is no page title (no page open), the
 * middle of the dialog's frame.
 */
export function arrowLevel(): number | null {
    // (A page's card, or the Workbook's and Handbook's panel, which stands for it: one level for every layer of the window.)
    const card = document.querySelector<HTMLElement>(".conversation-card, .workbook-panel")?.getBoundingClientRect();
    if (card && card.width > 300 && verticalAcross() > 0) {
        // (THE ARROWS STAY IN PLACE IN THE VERTICAL LAYOUT (owner, 2026-11-22 18:58 UTC+2: "The navigation arrow when exist, should stay in place"; layout rules section 23):
        // the tiles there fill their chapter and the page scrolls, so the arrows stand at the middle of the window between the header and the footer, the same on every
        // page whatever its title's lines.)
        const header = Math.max(0, document.querySelector<HTMLElement>(".app-header")?.getBoundingClientRect().bottom ?? 0);
        const footer = document.querySelector<HTMLElement>(".workspace-footer")?.offsetHeight ?? 64;
        return Math.round((header + window.innerHeight - footer) / 2);
    }
    if (card && card.width > 300) {
        const top = pageHeadEnd() + 12 + 61;
        const tile = masterSide() ?? 150;
        const gap = 12;
        // (Whole pixels: the page arrows (--arrow-level) and the carousel arrows read the same number, so they never stand a fraction apart.)
        return Math.round(top + tile + gap / 2);
    }
    const frame = dialogFrame();
    return frame ? Math.round(frame.top + frame.height / 2) : null;
}


/** The least width of a dialog on a touch screen where the page has the room: Material's sheets, up to 640dp. */
const TOUCH_DIALOG_WIDTH = 640;

/**
 * THE DIALOG'S FRAME (docs/ai/09-layout-rules.md, "Section tiles and dialog"): it
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
        // (EVERY DIALOG OPENS AT ITS FRAME'S TOP (owner, 2026-11-19 23:15 UTC+2: "The dialogue cards' level are different on the Segment. Fix it."; layout rules
        // section 23, "Every dialog opens at its frame's top"): its top is the top of the frame as it shows -- a Segment's chapter, whose title band stands over its columns, as the
        // page's frame elsewhere --; its sides and foot are its section's.)
        const own = section.getBoundingClientRect();
        const frame = shownFrame(section).getBoundingClientRect();
        const top0 = frame.top < own.top && frame.bottom >= own.bottom - 1 ? frame.top : own.top;
        const box = { left: own.left, width: own.width, top: top0, bottom: own.bottom, height: own.bottom - top0 };
        // (A DIALOG ON A TOUCH SCREEN IS AT LEAST 640PX WIDE where the page has the room (owner, 2026-11-26 17:04 UTC+2, the touch proposal: "check how the other apps
        // work ... and do it!"): Material's sheets span the window up to 640dp. A tablet in landscape gives a section 396px, its dialog's tiles 115px, too small for
        // their names, which a finger never reads in a tooltip; at 640px they take 196px, their titles and lists, as on a monitor. It stays inside the page's cards,
        // from its own section's edge.)
        if (typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches && box.width < TOUCH_DIALOG_WIDTH) {
            const area = document.querySelector<HTMLElement>(".conversation-card")?.getBoundingClientRect();
            if (area && area.width > box.width) {
                const width = Math.min(TOUCH_DIALOG_WIDTH, area.width);
                box.left = Math.max(area.left, Math.min(box.left, area.right - width));
                box.width = width;
            }
        }
        if (box.width > 200 && box.height > 200) {
            // (A card taller than the window is covered only as far as the window shows: under the header and the page title that stays under it, above the footer.)
            const header = Math.max(document.querySelector<HTMLElement>(".app-header")?.getBoundingClientRect().bottom ?? 0, document.querySelector<HTMLElement>(".interview-divider")?.getBoundingClientRect().bottom ?? 0);
            const footer = document.querySelector<HTMLElement>(".workspace-footer")?.getBoundingClientRect().top;
            // (Where the page is scrolled past the frame's top, the dialog stands where a frame stands at rest: 12px under the page title's underline, never against it;
            // layout rules section 23, "Every dialog opens at its frame's top"; 2026-11-20, a stacked page at 768.)
            const top = Math.max(box.top, header + 12);
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
    // A page-wide dialog (Inventory, Completed) starts where the page's cards start and runs down to the window's foot, 12px above it, over the footer's band
    // (owner, 2026-11-12: "The dialogue card (inventory) should reach the bottom part of the screen").
    const cardsTop = document.querySelector<HTMLElement>(".answer-columns.business-capability > .business-foundation-card")?.getBoundingClientRect().top;
    const top = Math.max(cardsTop ?? underline.getBoundingClientRect().bottom, underline.getBoundingClientRect().bottom, header?.getBoundingClientRect().bottom ?? 0);
    const bottom = window.innerHeight - 12;
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


/**
 * A CHAPTER'S HEADING ON ONE LINE (owner, 2026-11-23 23:21 UTC+2, the responsive layout approved, section 4.2): the chapter frame hugs its tiles, so a long heading
 * ("2. OFFERING'S CAPABILITY") over small tiles may not fit; it steps down from the scale's size, 2px at a time, to 18px at the least, keeping its line's height,
 * until it stands on one line.
 */
export function fitHeading(heading: HTMLElement): void {
    heading.style.removeProperty("font-size");
    heading.style.removeProperty("line-height");
    const line = parseFloat(getComputedStyle(heading).lineHeight) || 0;
    let size = parseFloat(getComputedStyle(heading).fontSize) || 0;
    if (line <= 0 || heading.getBoundingClientRect().height <= line * 1.5) {
        return;
    }
    heading.style.lineHeight = line + "px";
    while (size > 18 && heading.getBoundingClientRect().height > line * 1.5) {
        size -= 2;
        heading.style.fontSize = size + "px";
    }
}

/**
 * EVERY CHAPTER'S HEADING ON A PAGE ONE SIZE (owner, 2026-11-24 03:14 UTC+2: "Be consistent, use only the same size and style for the text per titles"): after
 * each has stepped down to stand on one line (fitHeading), all take the smallest of them.
 */
export function unifyHeadings(card: HTMLElement | null): void {
    if (!card) {
        return;
    }
    const headings = Array.from(card.querySelectorAll<HTMLElement>(".answer-column-label, .tiles-frame-head .field-group-title")).filter(heading => heading.closest(".section-tile-dialog, .section-tile-overlay, [role=dialog], [class*=\"floating\"], .section-tiles-completed") === null && heading.getClientRects().length > 0);
    if (headings.length < 2) {
        return;
    }
    // (The page's chapters alone: a dialog's or a floating card's heading has its own size. What this set before is taken back first; the smallest is the one a
    // heading stepped down to on its own (fitHeading), so a heading of another kind never sets the page's size.)
    headings.filter(heading => heading.hasAttribute("data-heading-unified")).forEach(heading => {
        heading.removeAttribute("data-heading-unified");
        heading.style.removeProperty("font-size");
        heading.style.removeProperty("line-height");
    });
    const stepped = headings.filter(heading => heading.style.fontSize !== "").map(heading => parseFloat(heading.style.fontSize)).filter(size => size > 0);
    if (stepped.length === 0) {
        return;
    }
    const least = Math.min(...stepped);
    headings.forEach(heading => {
        if (heading.style.fontSize === "" && (parseFloat(getComputedStyle(heading).fontSize) || 0) > least + 0.5) {
            const line = parseFloat(getComputedStyle(heading).lineHeight);
            if (Number.isFinite(line)) {
                heading.style.lineHeight = line + "px";
            }
            heading.style.fontSize = least + "px";
            heading.setAttribute("data-heading-unified", "");
        }
    });
}
