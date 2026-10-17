import { createContext, CSSProperties, Fragment, MouseEvent as ReactMouseEvent, ReactNode, RefObject, useContext, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { freshCards } from "./freshCards.ts";
import { createPortal } from "react-dom";

import { consumeKey } from "./consumeKey.ts";
import InfoNote, { InfoPoint, InfoText } from "./InfoNote.tsx";
import { cardNameOf } from "./cardNames.ts";

import "../../styles/section-tiles.css";

/**
 * One tile of a SectionTiles grid (docs/ai/layout-rules.md, "Section tiles
 * and dialog").
 */
export interface SectionTile {

    id: string;

    /** The section's name: the tile's one centred title. */
    title: string;

    /**
     * The tile's cards are shown in their dialog (Delivery's cards, in the dialog itself) instead of ONLY as floating cards. Every other kind of card
     * (Resource, Activity, Partner, Provider, channel and finished ones) is presented one way: floating (see `cardsFloatOnly`).
     */
    keepDialog?: boolean;

    /** For each line of `items`, what an incomplete card behind it lacks (a tile of counts -- Inventory --, which has no links to read it from). */
    itemAlerts?: readonly (readonly string[] | undefined)[];

    /** Whether a card of this tile was made by / is linked from a Customer Channel: its floating card then takes the channel's colour (CHANNEL_TILE_HUE). */
    isChannelCard?: (cardId: string) => boolean;

    /** A section tile whose dialog is a VIEW of category tiles (SectionView): it always opens that view, whatever number of cards it holds. */
    view?: boolean;


    /** The section's content, drawn only while its dialog is open. */
    content: () => ReactNode;

    /** The title in sentence case (only its first letter a capital), not in capitals. */
    sentence?: boolean;

    /** One of a page's LARGE tiles (two of them side by side, as large as the four of a 2 x 2 page): every tile of the set carries it. */
    large?: boolean;

    /** The tile's own picture, drawn under its title in place of a list (a colour as a square block, a typeface's specimen). */
    picture?: ReactNode;

    /**
     * A tile of cards made from a Customer Channel: its own hue (the tile
     * and its dialog), apart from the user's own cards.
     */
    channel?: boolean;

    /** What a link calls this tile (see jumpTo.ts): `data-anchor`, space separated. */
    anchor?: string;

    /** The id of the Sections rail's item that stands for this tile (a column page drawn as tiles): `data-rail`. */
    rail?: string;

    /** The ids of the cards inside, so a link to one of them opens this tile (`data-holds`). */
    holds?: readonly string[];

    /**
     * The section holds no cards yet: a small "+" is drawn under the title (decorative; the
     * tile is described as "No items yet"). Opening it shows the creation interface.
     */
    empty?: boolean;

    /**
     * What the section includes, listed under the title in small text (the founders and their
     * rates, the subcategories, the cards' names ...): a decoration of the tile, said again in
     * its accessible name. Not drawn while the tile is `empty`.
     */
    items?: readonly string[];

    /** How each line of `items` is drawn (same order): an empty one (no card in it) is faded; the Channel line is teal; a line with cards a channel made carries a second, teal bullet. */
    itemMarks?: readonly (ItemMark | undefined)[];

    /**
     * The grey tile of the finished ones (Infrastructure's Completed activities): a neutral grey ground and border
     * and grey text, as everything completed is drawn; its dialog is grey too.
     */
    completed?: boolean;

    /**
     * Placed AFTER the others, beside the last of them in the final row (Infrastructure's Completed tile, right of "Sales &
     * Customer"), and not counted in the group's shape: see tailPlacement.
     */
    tail?: boolean;

    /**
     * Where each item of `items` leads when it is pressed (the lists on the tiles are real controls): `{ card }` opens that
     * card ALONE as a floating card, `{ box }` opens the section's dialog on that subcategory; an item without one (or a tile
     * without `links`) is plain text. (A list holds every item and scrolls; there is no "+N more".)
     */
    links?: readonly (TileLink | undefined)[];

    /** The ids of the cards behind each subcategory a `{ box }` link names (so a tile can tell which of its lines hold an incomplete card). */
    boxHolds?: Readonly<Record<string, readonly string[]>>;

    /** The card `{ card }` names, drawn in the floating card; null once it is gone (the floating card closes). */
    cardFor?: (id: string) => ReactNode;

    /** What the tile's floating cards are called above them (their group: "Profiles", "Competitors"), where it is not the tile's own title. */
    group?: string;

    /** The same, by card, where a tile's cards are of several groups. */
    groupFor?: (id: string) => string;

    /** A card's own name as its name cell holds it ("" where it has none yet): what its bullet in the carousel's rail says. */
    nameFor?: (id: string) => string;

    /** A card that has a parent or a child (a requirement and the expense it made) is drawn with it: the parent above, the child under it, whichever was pressed. */
    pairOf?: (id: string) => { parent: { id: string; caption: string }; child: { id: string; caption: string } } | null;

    /** The look of its floating cards: a founder's (the founder's card width), the Workspace's form, any other card (480px). */
    cardKind?: "card" | "founder";

    /** The look of ONE card where the tile holds cards of several looks (the "Inventory" tile: a founder's, the Workspace's form, any other). */
    kindFor?: (id: string) => "card" | "founder";

    /**
     * Pressing the tile opens this card alone as a floating card, with no dialog around it (the Workspace: its form,
     * centred over its group of tiles).
     */
    direct?: string;

    /** A tile that is not in use yet (a channel not chosen): faded; pressing it does `press` instead of opening a dialog. */
    inactive?: boolean;
    /** Its dialog covers the page (the Roadmap's), as wide as the widest dialogs are, not the width of the card the tile stands in. */
    wide?: boolean;
    /**
     * A DIAGRAM TILE: a category of its own among the Master Tiles. It stands for a drawing that opens in its dialog (the Roadmap, a Gantt diagram),
     * not for a list of what the section holds: a wide banner with a large title and no list, not a square of the page's tile size.
     */
    diagram?: boolean;
    press?: () => void;

    /** The "+" makes the card and opens the tile's DIALOG on it (its box is the new card's id): the card stands where the dialog shows its cards, with no floating card. */
    addOpensDialog?: boolean;

    /** A "+" at the tile's lower right that does this (adds what the tile holds, then the tile opens), for a tile whose items are not cards. */
    plus?: () => void;

    /** A "+" box at the tile's lower right adds a card here and opens it as a floating card (never on an empty-to-be tile of another kind). */
    add?: TileAdd;

    /** Called when a floating card of this tile opens (a founder's Responsibilities start folded). */
    opening?: () => void;

    /** The tile's "i" note: said after the caption of its floating cards (its dialog's header carries it as well). */
    note?: InfoPoint[];

    /** A card's own note where it differs from the tile's (a resource group: the note of the subcategory the card is in). */
    noteFor?: (id: string) => InfoPoint[] | undefined;

}

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
    return columns.length === 2 && columns.includes(anchor) ? columns[columns[0] === anchor ? 1 : 0] : anchor;
}

/** What an incomplete card lacks, as a tooltip: "Missing: Price, Payment Frequency (not counted until it is fixed)". */
export function incompleteTitle(missing: readonly string[]): string {
    return "Missing: " + [...new Set(missing)].join(", ") + " (not counted until it is fixed)";
}

/** Where an item of a tile's list leads. */
export type TileLink = { card: string } | { box: string };

/** What a tile can add: a card of its own kind, appended to its list. */
export interface TileAdd {

    /** What is added, title case: "Activity" (the box is named "Add Activity to <tile>"). */
    label: string;

    disabled?: boolean;

    /** Creates a blank card and returns its id (it is opened at once). */
    onAdd: () => string;

    /** Where a card made by the "+" tile is opened where no floating card is (a card shown in its place among the others): it is given the new id. */
    onOpen?: (id: string) => void;

    /** True while the card still holds nothing the user wrote. */
    isBlank: (id: string) => boolean;

    /** Removes these cards (a blank one is removed when its floating card is closed). */
    onRemove: (ids: string[]) => void;

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
    const first = slots[0]?.getBoundingClientRect();
    const second = first ? slots.map(slot => slot.getBoundingClientRect()).find(box => box.top > first.bottom - 4) : undefined;
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
function brokenLines(text: string): string[] {
    return text.split("\n").map(part => part.replace(/^& /, "& "));
}

/**
 * THE FOCUS COMES BACK to the control that opened a dialog or a floating card -- so the keyboard continues from where it was.
 * The focus is restored QUIETLY, however the opener was opened (a mouse click or Enter): no ring on the opener (`data-focus-quiet`) until the
 * next key is used or the focus moves on (the owner's rule, 2026-10-14: the ring does not exist after Escape or Back). `pointer` is kept for
 * the callers; it no longer changes the result.
 */
function restoreFocus(target: HTMLElement | null, pointer: boolean) {
    if (!target || !target.isConnected) {
        return;
    }
    void pointer;
    {
        target.setAttribute("data-focus-quiet", "");
        const release = () => {
            target.removeAttribute("data-focus-quiet");
            target.removeEventListener("blur", release);
            window.removeEventListener("keydown", release, true);
        };
        target.addEventListener("blur", release);
        window.addEventListener("keydown", release, true);
    }
    target.focus({ preventScroll: true });
}

/** Where the pointer last was (the page tiles settle only until it really moves). */
let lastPointer = { x: -1, y: -1 };
let pointerTracked = false;
let releaseSettled: (() => void) | null = null;

/**
 * THE DEFAULT PAGE AGAIN, after a dialog or a floating card closes (Escape, Back, a click outside): no tile is grown, though the pointer
 * may be resting on one -- the grow waits (`data-tiles-settled` on the root, section-tiles.css) until the pointer really moves.
 */
function settlePage() {
    const root = document.documentElement;
    releaseSettled?.();
    const at = { ...lastPointer };
    root.setAttribute("data-tiles-settled", "");
    const release = () => {
        root.removeAttribute("data-tiles-settled");
        window.removeEventListener("pointermove", onMove, true);
        releaseSettled = null;
    };
    const onMove = (event: PointerEvent) => {
        if (Math.hypot(event.clientX - at.x, event.clientY - at.y) > 3) {
            release();
        }
    };
    window.addEventListener("pointermove", onMove, true);
    releaseSettled = release;
}

/** Tracks the pointer for settlePage (once, for the whole page). */
function trackPointer() {
    if (pointerTracked || typeof window === "undefined") {
        return;
    }
    pointerTracked = true;
    window.addEventListener("pointermove", (event) => { lastPointer = { x: event.clientX, y: event.clientY }; }, true);
}

/**
 * A view INSIDE a dialog that Back and Escape leave first (the Founders'
 * closed boxes, once one is open: its card replaces the grid): the content
 * registers the way back while it is shown; the dialog's Back button and
 * Escape take it before closing the dialog.
 */
interface InnerBackApi {
    /** Registers (or, with a null back, clears) the way back of the view at `depth`. */
    set: (depth: number, back: (() => void) | null, subtitle?: string, note?: CrumbNote) => void;
    /** A function the dialog calls when it is CLOSED (a card still blank is removed). */
    onClose: (fn: () => void) => () => void;
    /** The side of the tile that opened the dialog, in px (0 where unknown): a box never exceeds it. */
    tileSize: number;
    /** Registers (or clears) what the carousel arrows do first while an inner view is open: it steps within the dialog and says whether it did. */
    setStep: (depth: number, step: ((direction: 1 | -1) => boolean) | null, rail?: DialogRail | null) => void;
}

/** The rail of an inner level of a dialog (the categories of a section, the groups of a category, a dialog's sections): its bullets say the names of the level's own tiles, and replace the page's while the level is open. */
export interface DialogRail {
    items: readonly { id: string; label: string }[];
    current: number;
    go: (id: string) => void;
}

const InnerBackContext = createContext<InnerBackApi | null>(null);

/** How deep in the dialog's inner views a component stands (0 = the dialog's own content). */
const InnerDepthContext = createContext(0);

/** What is drawn inside an inner view (a subcategory, a card): one level deeper than the view that shows it. */
export function InnerLevel({ children }: { children: ReactNode }) {
    const depth = useContext(InnerDepthContext);
    return <InnerDepthContext.Provider value={depth + 1}>{children}</InnerDepthContext.Provider>;
}

/**
 * `subtitle` names the inner view (a subcategory, a card); the dialog's accessible
 * name is then "<section> › <subtitle>" (nested views joined in order).
 * Views nest: the one drawn inside another registers one level deeper (InnerLevel), and Back
 * and Escape take the deepest one first.
 */
export function useDialogInnerBack(back: (() => void) | null, subtitle?: string, note?: CrumbNote) {
    const context = useContext(InnerBackContext);
    const depth = useContext(InnerDepthContext);
    // (The way back is read when it is taken, so a new function on every render does not register the view again.)
    const latest = useRef(back);
    latest.current = back;
    const active = back !== null;
    // (The note is data compared by value: the caller builds it afresh on every render.)
    const noteKey = note ? note.label + "\u0000" + JSON.stringify(note.points) : "";
    const noted = useRef(note);
    noted.current = note;
    useLayoutEffect(() => {
        context?.set(depth, active ? () => latest.current?.() : null, subtitle, noted.current);
        return () => context?.set(depth, null);
    }, [context, depth, active, subtitle, noteKey]);
}

/**
 * The carousel arrows of a dialog whose content has sections of its own (the Registrations' three): while one is open, the arrows go to the next or the previous of
 * THEM first; at their end (the handler says it did nothing) they go on to the neighbouring tile of the page.
 */
export function useDialogInnerStep(step: ((direction: 1 | -1) => boolean) | null, rail?: DialogRail | null) {
    const context = useContext(InnerBackContext);
    const depth = useContext(InnerDepthContext);
    const latest = useRef(step);
    latest.current = step;
    const latestRail = useRef(rail);
    latestRail.current = rail;
    const active = step !== null;
    // (The rail is data compared by value: its tiles' ids and names, and the one lit.)
    const railKey = rail ? rail.current + "|" + rail.items.map(item => item.id + ":" + item.label).join("|") : "";
    useLayoutEffect(() => {
        const shown = latestRail.current;
        context?.setStep(depth, active ? (direction) => latest.current?.(direction) ?? false : null, active && shown ? { items: shown.items, current: shown.current, go: (id) => latestRail.current?.go(id) } : null);
        return () => context?.setStep(depth, null, null);
    }, [context, depth, active, railKey]);
}

/** The "i" note a view carries in the dialog's header: what it is called and its points (InfoNote). */
export interface CrumbNote {
    label: string;
    points: InfoPoint[];
}

/** One step down in a dialog's header: the name of the view shown ("Software", a card's name) and the "i" note it carries. */
interface Crumb {
    name: string;
    note?: CrumbNote;
}

const CrumbsContext = createContext<readonly Crumb[] | null>(null);

/** What a box inside a dialog calls to open a card it made floating (TileDialog's `onOpenCard`). */
export const OpenCardContext = createContext<((id: string, caption: string | undefined, remover: TileAdd | undefined, pointer: boolean, fresh: boolean) => void) | null>(null);

/** The subcategory box a dialog opens on, if its tile was opened from a list item that names one. */
export const InitialBoxContext = createContext<string | null>(null);

/**
 * A DIALOG'S TITLE (docs/ai/layout-rules.md, "The dialog header"): the section's heading, and -- on the SAME
 * line -- each view shown inside it after a slash: "6. Digital Infrastructure / Software", "Utilities / Electricity /
 * Studio electricity". The title keeps the title style; the slash (8px either side) and the names are the same size, regular,
 * muted; the "i" note stands after the last name (the nearest one that has a note), and a long header cuts the names with an
 * ellipsis (the full name is the tooltip). Outside a dialog, or with nothing opened in it, it is the plain heading.
 */
export function DialogHeading({ title, info, noteSize }: { title: string; info?: InfoPoint[]; noteSize?: "standard" | "wide" | "double" }) {
    const crumbs = useContext(CrumbsContext);
    if (!crumbs || crumbs.length === 0) {
        return info
            ? (
                <span className="business-foundation-label-info">
                    <span className="field-group-title business-foundation-subhead">
                        <InfoText text={drawnTitle(title)}>
                            <InfoNote label={title} points={info} fullList size={noteSize} />
                        </InfoText>
                    </span>
                </span>
            )
            : <span className="field-group-title business-foundation-subhead">{drawnTitle(title)}</span>;
    }
    const note = [...crumbs].reverse().find(crumb => crumb.note)?.note ?? (info ? { label: title, points: info } : null);
    const trailing = note ? <InfoNote label={note.label} points={note.points} fullList size={noteSize} /> : null;
    return (
        <span className="business-foundation-label-info dialog-heading">
            <span className="field-group-title business-foundation-subhead dialog-heading-line">
                <span className="dialog-heading-title">{drawnTitle(title)}</span>
                {crumbs.length > 0 && (
                    // (One row: where the names are too long for it, the line slides to the left -- the root keeps its place, the last name stays in view.)
                    <span className="dialog-heading-trail">
                        <span className="dialog-heading-trail-text">
                            {crumbs.map((crumb, at) => (
                                <Fragment key={at}>
                                    <span className="dialog-heading-slash" aria-hidden="true">/</span>
                                    <span className="dialog-heading-sub" title={crumb.name}>{crumb.name}</span>
                                </Fragment>
                            ))}
                        </span>
                    </span>
                )}
            </span>
            {trailing}
        </span>
    );
}

/** THE OVERALL NUMBER OF ACTIVE CARDS next to a dialog's title (Activities): "ACTIVE 11". */
export function ActiveCount({ overall }: { overall: number }) {
    return <span className="dialog-heading-count" aria-live="polite">{"Active " + overall}</span>;
}

/** The side, in px, of the tile that opened the dialog (0 where unknown). */
export function useDialogTileSize(): number {
    return useContext(InnerBackContext)?.tileSize ?? 0;
}

/** Registers what to do when the dialog is closed (the latest function is called). */
export function useDialogClosing(fn: () => void) {
    const context = useContext(InnerBackContext);
    const latest = useRef(fn);
    latest.current = fn;
    useEffect(() => context?.onClose(() => latest.current()), [context]);
}

/** The marks of one line of a tile's list (see SectionTile.itemMarks). */
export interface ItemMark {
    /** The category or group holds no card: its line (text and bullet) is drawn 75% transparent. */
    empty?: boolean;
    /** The Channel line of Offering's Resources: its text and bullet in the channel's teal. */
    teal?: boolean;
    /** The line holds cards made by a Customer Channel: a second bullet, in the channel's teal, beside the first. */
    channel?: boolean;
    /** On a column page's tile (text, no bullets): this line is one of a list, so it has its bullet. */
    bullet?: boolean;
    /** On a column page's tile: this line is centred, with no bullet (a name alone, a date). */
    centre?: boolean;
    /** This line has no bullet (the state a list starts with). */
    plain?: boolean;
    /** A hairline stands under this line: it ends one topic of the list and the next begins (the Strategic Period's dates, then its Themes). */
    rule?: boolean;
}

/** A line's words, with what stands between two pairs of asterisks in bold. */
function boldWords(text: string): ReactNode {
    return text.split("**").map((part, at) => at % 2 === 1 ? <strong key={at}>{part}</strong> : part);
}

/** The hue of a tile made from a Customer Channel (the palette's teal). */
export const CHANNEL_TILE_HUE = 172;

/**
 * A GRID OF SECTION TILES, each opening its section in a dialog.
 *
 * A tile is a square button with the section's name centred. Pressing
 * it opens the section's own content in a dialog at the centre of the
 * screen, the page behind it dimmed and inert; Escape, the Back button
 * (lower left) or a click on the dimmed space outside it closes it, and the page is as it was: the scroll position
 * is the page's own (nothing scrolls), the focus returns to the tile, and
 * the folds are kept (they live above, in the editor). Which tile is open
 * is view-only state, never saved; only one dialog is open at a time.
 */
export default function SectionTiles({

    tiles,

    hue,

    label,

    blank,

    incomplete,

    small = false,

    trailing

}: {

    /** Something that stands in the grid after the last tile, as a tile does (the Strategic Period's "Add Card"). */
    trailing?: ReactNode;

    /** The tiles keep the page's small size, whatever their number (four are not drawn as the 2 x 2 of large tiles). */
    small?: boolean;

    tiles: readonly SectionTile[];
    /**
     * The cards that lack a required answer, by id, with what each lacks (CardCompleteness.ts): in a tile's list its line is red, flashing and FIRST, and the tile
     * has the red flashing glow while it holds one.
     */
    incomplete?: ReadonlyMap<string, readonly string[]>;
    /**
     * Who knows, as of NOW, whether a card is still completely blank and takes it away: asked when a floating card made a moment ago is closed (the
     * adds a tile or a box carries were drawn before the card existed, and cannot see it).
     */
    blank?: Pick<TileAdd, "isBlank" | "onRemove">;
    /** The hue of the card the tiles sit in: the dialog is drawn in it. */
    hue: number;
    /** What the tiles are, for assistive technology: "Resources". */
    label: string;

}) {

    const [openId, setOpenId] = useState<string | null>(null);
    // The subcategory the dialog opens on (a list item of "Utilities" that names one), if any.
    const [openBox, setOpenBox] = useState<string | null>(null);
    const [floating, setFloating] = useState<FloatingOpen | null>(null);

    // (A card just made and still open is not flagged: freshCards.ts.)
    useSyncExternalStore(freshCards.subscribe, freshCards.snapshot);
    const shownIncomplete = incomplete ? new Map([...incomplete].filter(([id]) => !freshCards.has(id))) : undefined;

    // A card made a moment ago and still open carries no error indicator (freshCards.ts).
    const freshId = floating?.fresh ? floating.id : null;
    useEffect(() => {
        if (!freshId) {
            return;
        }
        freshCards.add(freshId);
        return () => freshCards.remove(freshId);
    }, [freshId]);
    const opener = useRef<HTMLElement | null>(null);
    // Whether what is open was opened with the pointer (a mouse click) or the keyboard: the focus comes back to its opener
    // with a visible ring only after the keyboard.
    const openedByPointer = useRef(false);

    // THE FOUR TILES OF A PAGE CARD (2 x 2) are as large as the card's width allows, but never so large that the card and the footer do not both stand in the
    // window: the side is also held to what the window's height leaves under the card's title (measured at the page's top).
    const quadBox = useRef<HTMLDivElement | null>(null);
    // (Two large tiles stand side by side, in one row of the same squares.)
    const big = !small && (tiles.length === 4 || (tiles.length > 0 && tiles.length <= 2 && tiles.every(tile => tile.large)));
    const bigRows = tiles.length === 4 ? 2 : 1;
    useLayoutEffect(() => {
        const box = quadBox.current;
        if (!box || !big) {
            return;
        }
        const fit = () => {
            const top = box.getBoundingClientRect().top + window.scrollY;
            const footer = document.querySelector<HTMLElement>(".workspace-footer")?.offsetHeight ?? 64;
            // (the footer and its 12px, the card's 12px padding, the gap between the two rows)
            // (A page with the Inventory and Completed row under its cards keeps the least of that row in the window: the row is squeezed, the cards keep their size.)
            const below = document.querySelector<HTMLElement>(".section-tiles-completed");
            const reserved = below ? SQUEEZED_ROW_MIN + 12 : 0;
            const side = Math.floor((window.innerHeight - top - footer - 12 - 12 - 12 - reserved) / bigRows);
            box.style.setProperty("--quad-max-side", Math.max(side, 150) + "px");
            // The type of the four tiles from the type scale by their size: 24px titles and 18px lists from 250px a side, else 18px and 14px.
            const actual = Math.min((box.clientWidth - 12) / 2, Math.max(side, 150));
            // (Where the window's height makes the tiles smaller than the width would, the gap between them follows, from 12px: the same proportion.)
            const natural = (box.clientWidth - 12) / 2;
            const gap = natural > 0 ? Math.max(6, Math.min(12, Math.round(12 * actual / natural))) : 12;
            box.style.setProperty("--space-card", gap + "px");
            if (actual >= 250) {
                box.setAttribute("data-large", "");
            } else {
                box.removeAttribute("data-large");
            }
        };
        fit();
        window.addEventListener("resize", fit);
        return () => window.removeEventListener("resize", fit);
    }, [big, bigRows]);

    const open = tiles.find(tile => tile.id === openId) ?? null;
    const openRef = useRef(open);
    openRef.current = open;

    // The shape counts every tile but the tail one (if any), which is placed beside the last of them.
    const others = tiles.filter(tile => !tile.tail);
    const shape = gridColumns(others.length);
    const placement = others.length < tiles.length ? tailPlacement(others.length, shape) : null;
    const columns = placement ? placement.columns : shape;
    const rows = placement ? Math.max(placement.row, Math.ceil(others.length / shape)) : Math.ceil(others.length / shape);

    // Focus goes back to the tile that opened the dialog.
    const wasOpen = useRef(false);
    useLayoutEffect(() => {
        if (open) {
            wasOpen.current = true;
        } else if (wasOpen.current) {
            wasOpen.current = false;
            restoreFocus(opener.current, openedByPointer.current);
        }
    }, [open]);

    const latest = useRef(tiles);
    latest.current = tiles;

    useEffect(() => { trackPointer(); }, []);

    const openDialog = (tile: SectionTile, from: HTMLElement | null, box: string | null = null, pointer = false) => {
        tile.opening?.();
        opener.current = from;
        openedByPointer.current = pointer;
        setOpenBox(box);
        setOpenId(tile.id);
    };

    /* A floating card: THAT card alone, centred (FloatingCard). `centre` says over what: the page's card area, the card of the
       page the tile stands in (a card just added), or the tile's group (the Workspace). */
    const openFloating = (tile: SectionTile, id: string, from: HTMLElement, centre: FloatingCentre, fresh = false, pointer = false, linked = false) => {
        tile.opening?.();
        openedByPointer.current = pointer;
        // The column of the page the tile stands in (Infrastructure's card or Offering's Capability's), or -- the Workspace -- its tile group.
        const anchor = centre === "group"
            ? from.closest<HTMLElement>(".section-tiles-box")
            : otherColumn(sectionAnchor(from));
        setFloating({ tileId: tile.id, id, opener: from, anchor, fresh, linked });
    };

    /** What pressing a tile opens: its card (a tile of one), a new blank card (a tile of none), or its dialog. */
    const openTile = (tile: SectionTile, from: HTMLElement, pointer: boolean) => {
        if (tile.press) {
            tile.press();
            return;
        }
        if (tile.direct && tile.cardFor) {
            openFloating(tile, tile.direct, from, "group", false, pointer);
        } else if (cardsFloatOnly(tile) && !tile.view && tile.holds && tile.holds.length === 1) {
            // A tile connected with exactly ONE card opens that card, floating.
            openFloating(tile, tile.holds[0], from, "column", false, pointer);
        } else if (cardsFloatOnly(tile) && !tile.view && tile.holds && tile.holds.length === 0 && tile.add) {
            // A tile with none: one blank card is made and opened (taken away again if left blank).
            openFloating(tile, tile.add.onAdd(), from, "column", true, pointer);
        } else {
            openDialog(tile, from, null, pointer);
        }
    };

    // The dialog this set of tiles stands in was opened on one of them (a link or a "+" of the tile above it names it): that one opens at once.
    const initialBox = useContext(InitialBoxContext);
    const initialOpened = useRef(false);
    // (Until it has opened, the dialog these tiles stand in is not shown: the card asked for is the first thing seen.)
    const [initialPending, setInitialPending] = useState(initialBox !== null);
    useEffect(() => {
        const timer = window.setTimeout(() => setInitialPending(false), 800);
        return () => window.clearTimeout(timer);
    }, []);
    useEffect(() => {
        if (initialOpened.current || !initialBox) {
            return;
        }
        const found = latest.current.find(tile => tile.id === initialBox);
        if (found) {
            initialOpened.current = true;
            // (After the dialog it stands in has taken its place and size.)
            window.setTimeout(() => {
                // (From its own tile, as if pressed: the dialog takes its place and size from it.)
                const from = document.querySelector<HTMLElement>(`.section-tile[data-tile="${CSS.escape(found.id)}"]`) ?? opener.current ?? document.body;
                openTile(found, from, false);
                setInitialPending(false);
            }, 0);
        }
    });

    // A card or a section asked for from another card (OPEN_EVENT).
    useEffect(() => {
        const answer = (event: Event) => {
            const request = (event as CustomEvent<OpenRequest>).detail;
            const found = latest.current.find(tile => tile.id === request.tile) ?? latest.current.find(tile => !!request.card && tile.holds?.includes(request.card));
            if (!found) {
                return;
            }
            const from = opener.current ?? document.body;
            if (request.card && found.cardFor) {
                // (Over the other column of the tile that holds it, where it stands on the page: at the one level of every card.)
                openFloating(found, request.card, document.querySelector<HTMLElement>(`.section-tile[data-tile="${CSS.escape(found.id)}"]`) ?? from, "column", request.fresh === true, false, true);
            } else if (request.box) {
                setFloating(null);
                // (From its own tile where it stands on screen: the dialog takes its place and size from it, not from the page.)
                openDialog(found, document.querySelector<HTMLElement>(`.section-tile[data-tile="${CSS.escape(found.id)}"]`) ?? from, request.box);
            }
        };
        document.addEventListener(OPEN_EVENT, answer);
        return () => document.removeEventListener(OPEN_EVENT, answer);
    });

    const closeFloating = () => {
        const current = floating;
        setFloating(null);
        if (!current) {
            return;
        }
        const tile = latest.current.find(candidate => candidate.id === current.tileId);
        // A card added by the "+" and left completely blank is removed again.
        const remover = blank ?? current.remover ?? tile?.add;
        if (current.fresh && remover?.isBlank(current.id)) {
            remover.onRemove([current.id]);
        }
        // (The focus goes back once the page is no longer inert: after this render. Where a dialog is still open under the card, it is the dialog's.)
        refocus.current = openRef.current ? null : current.opener;
    };
    const refocus = useRef<HTMLElement | null>(null);
    useEffect(() => {
        if (!floating && refocus.current) {
            restoreFocus(refocus.current, openedByPointer.current);
            refocus.current = null;
        }
    }, [floating]);

    const floatingTile = floating ? tiles.find(tile => tile.id === floating.tileId) ?? null : null;
    const floatingCard = floating && floatingTile?.cardFor ? floatingTile.cardFor(floating.id) : null;

    // The button last pressed, kept so that a card opened from a dialog's box knows which box it was.
    const lastPressed = useRef<HTMLElement | null>(null);
    useEffect(() => {
        const press = (event: MouseEvent) => {
            lastPressed.current = (event.target as HTMLElement | null)?.closest?.<HTMLElement>("button, [role=button]") ?? null;
        };
        document.addEventListener("click", press, true);
        return () => document.removeEventListener("click", press, true);
    }, []);

    // THE TILE THAT OPENED A CARD stands out while the card is open: a steady halo in the card's tint (the incomplete card's glow, not flashing), and a link
    // that opened it is bold.
    const openerHue = floatingTile?.channel || (floating && floatingTile?.isChannelCard?.(floating.id)) ? CHANNEL_TILE_HUE : hue;
    const openerEl = floating?.pressed?.isConnected ? floating.pressed : floating?.opener ?? null;
    const floatingId = floating?.id ?? null;
    useEffect(() => {
        if (!openerEl || !openerEl.isConnected) {
            return;
        }
        // The tile or box that holds the card now open (it follows the card when the arrows step to another): found by the card's id; else the control that opened it.
        // (A founder's card is held as "founder-" and its id; its box and its line are named by the id alone.)
        const keys = floatingId ? [floatingId, floatingId.replace(/^founder-/, "")].map(id => CSS.escape(id)) : [];
        const find = (build: (key: string) => string) => keys.map(key => document.querySelector<HTMLElement>(build(key))).find(element => !!element) ?? null;
        const box = find(key => `[data-card-box="${key}"]`);
        const block = find(key => `.section-tile [data-card="${key}"]`);
        // The line of a tile's list that opens this card: the underline moves with the card as the arrows step.
        const line = find(key => `.section-tile [data-link="${key}"]`);
        const own = openerEl.closest<HTMLElement>(".section-tile") ?? openerEl.closest(".section-tile-slot")?.querySelector<HTMLElement>(".section-tile") ?? null;
        const tile = box ?? line?.closest<HTMLElement>(".section-tile") ?? own;
        const marked = [tile, block].filter((element): element is HTMLElement => !!element);
        marked.forEach(element => {
            element.setAttribute("data-opener-tile", "");
            element.style.setProperty("--opener-hue", String(openerHue));
        });
        const link = box ? null : line ?? openerEl;
        link?.setAttribute("data-opener", "");
        return () => {
            marked.forEach(element => {
                element.removeAttribute("data-opener-tile");
                element.style.removeProperty("--opener-hue");
            });
            link?.removeAttribute("data-opener");
        };
    }, [openerEl, openerHue, floatingId]);

    // THE CAROUSEL: the arrows beside the layer opened last. A floating card goes through the cards of its tile (or of its box, where it was opened from one); a
    // dialog goes through the tiles of the section, the ones that have something to open (a tile of none would make a blank card).
    const boxCards = floating && floatingTile ? Object.values(floatingTile.boxHolds ?? {}).find(ids => ids.includes(floating.id)) : undefined;
    const siblingCards = floating && floatingTile ? (boxCards ?? floatingTile.holds ?? []) : [];
    const goFloating = (nextId: string) => {
        if (!floating || siblingCards.length < 2) {
            return;
        }
        // (A card made a moment ago and left blank is taken away, as on closing it.)
        const remover = blank ?? floating.remover ?? floatingTile?.add;
        if (floating.fresh && remover?.isBlank(floating.id)) {
            remover.onRemove([floating.id]);
        }
        setFloating({ ...floating, id: nextId, fresh: false, linked: false });
    };
    const stepFloating = (direction: 1 | -1) => {
        if (!floating || siblingCards.length < 2) {
            return;
        }
        const at = siblingCards.findIndex(item => item === floating.id || item === "founder-" + floating.id);
        goFloating(siblingCards[(at + direction + siblingCards.length) % siblingCards.length]);
    };
    // (A card's bullet says its place: the tile's own name for its cards, and its number.)
    // (A card's bullet says its NAME, as its name cell holds it -- the tile's own name for it, or the line of the tile that opens it -- and, while it has none, its group and number.)
    const cardName = (id: string): string => {
        const named = floatingTile?.nameFor?.(id)?.trim() || cardNameOf(id);
        if (named) {
            return named;
        }
        const at = floatingTile?.links?.findIndex(link => !!link && "card" in link && link.card === id) ?? -1;
        const line = at >= 0 ? floatingTile?.items?.[at] : undefined;
        return line ? plainTitle(line).replace(/\*\*/g, "").trim() : "";
    };
    const floatingItems = siblingCards.map((id, at) => ({ id, label: cardName(id) || (floatingTile?.groupFor?.(id) ?? floatingTile?.group ?? "Card") + " " + (at + 1) }));
    const floatingAt = floating ? siblingCards.findIndex(item => item === floating.id || item === "founder-" + floating.id) : -1;
    const steppable = tiles.filter(tile => !(cardsFloatOnly(tile) && !tile.view && tile.holds && tile.holds.length === 0 && tile.add) && !tile.direct);
    const goDialog = (next: SectionTile) => {
        const from = opener.current ?? document.body;
        setOpenId(null);
        openTile(next, from, openedByPointer.current);
    };
    const stepDialog = (direction: 1 | -1) => {
        if (!open || steppable.length < 2) {
            return;
        }
        const at = steppable.findIndex(tile => tile.id === open.id);
        goDialog(steppable[(at + direction + steppable.length) % steppable.length]);
    };

    // The card is gone (its x was pressed) after it was shown: nothing floats any more.
    const shown = useRef<string | null>(null);
    useEffect(() => {
        const key = floating ? floating.tileId + ":" + floating.id : null;
        if (key !== null && floatingCard) {
            shown.current = key;
        } else if (key !== null && shown.current === key) {
            shown.current = null;
            setFloating(null);
        } else if (key === null) {
            shown.current = null;
        }
    }, [floating, floatingCard]);

    return (
        <>

            {/* The box is the size container the tiles measure (a third of its width, less
                the gaps); the group inside is the grid. */}
            <div ref={quadBox} className={"section-tiles-box" + (big ? " section-tiles-quad" : "") + (small ? " section-tiles-small" : "")}>
            <div
                className="section-tiles"
                data-initial-pending={initialPending ? "" : undefined}
                role="group"
                aria-label={label}
                style={{ "--tile-columns": columns } as CSSProperties}
            >
                {tiles.map(tile => {
                    const at = tile.tail && placement
                        ? { row: placement.row - 1, column: placement.column - 1 }
                        : { row: Math.floor(others.indexOf(tile) / shape), column: others.indexOf(tile) % shape };
                    return (
                        <TileSlot
                            key={tile.id}
                            tile={tile}
                            incomplete={shownIncomplete}
                            at={at}
                            columns={columns}
                            rows={rows}
                            style={{
                                ...(tile.channel ? { "--strategy-theme-hue": CHANNEL_TILE_HUE } : {}),
                                // (With a tail tile every tile is placed by hand: the tail's cell may be the shape's extra column.)
                                ...(placement ? { gridRow: at.row + 1, gridColumn: at.column + 1 } : {})
                            } as CSSProperties}
                            onOpen={(from, pointer) => openTile(tile, from, pointer)}
                            onLink={(link, from, pointer) => {
                                if ("box" in link) {
                                    openDialog(tile, from, link.box, pointer);
                                } else {
                                    openFloating(tile, link.card, from, "column", false, pointer);
                                }
                            }}
                            onAdd={(from, pointer) => {
                                if (tile.add && tile.cardFor) {
                                    openFloating(tile, tile.add.onAdd(), from, "column", true, pointer);
                                } else if (tile.add && tile.addOpensDialog) {
                                    openDialog(tile, from, tile.add.onAdd(), pointer);
                                }
                            }}
                        />
                    );
                })}
                {trailing}
            </div>
            </div>

            {open && (
                <TileDialog
                    key={open.id}
                    tile={open}
                    opener={opener.current}
                    initialBox={openBox}
                    hue={open.channel ? CHANNEL_TILE_HUE : hue}
                    step={steppable.length > 1 && steppable.some(tile => tile.id === open.id) ? { what: "section", previous: () => stepDialog(-1), next: () => stepDialog(1), items: steppable.map(tile => ({ id: tile.id, label: tile.title })), current: steppable.findIndex(tile => tile.id === open.id), go: (id: string) => { const target = steppable.find(tile => tile.id === id); if (target && target.id !== open.id) { goDialog(target); } } } : undefined}
                    onClose={() => setOpenId(null)}
                    onOpenCard={cardsFloatOnly(open) ? (id, caption, remover, pointer, fresh) => {
                        // A card chosen in the dialog's grid (or made by a box's "+"): the dialog closes and the card floats on its section part,
                        // under the box's name (the tile's where none is given).
                        // (The dialog STAYS under the card: Back returns to it, as to the view the card was opened from; Escape closes every layer.)
                        const from = opener.current ?? document.body;
                        openedByPointer.current = pointer;
                        open.opening?.();
                        setFloating({ tileId: open.id, id, opener: from, pressed: lastPressed.current, anchor: otherColumn(sectionAnchor(from)), fresh, caption, remover });
                    } : null}
                />
            )}

            {floating && floatingTile && floatingCard && (
                // (A card chosen on a floating card -- an Objective on its Goal's card -- takes its place: the tile that holds both answers.)
                <OpenCardContext.Provider value={(id, caption, remover, pointer, fresh) => {
                    openedByPointer.current = pointer;
                    setFloating(current => current ? { ...current, id, caption, remover, fresh, linked: true } : current);
                }}>
                <FloatingCards
                    key={floating.tileId + ":" + floating.id}
                    anchor={floating.anchor}
                    fresh={floating.fresh}
                    hue={floatingTile.channel || floatingTile.isChannelCard?.(floating.id) ? CHANNEL_TILE_HUE : hue}
                    label={floatingTile.title}
                    attrs={{ "data-floating": floating.tileId, "data-card-id": floating.id }}
                    step={!floating.fresh && siblingCards.length > 1 && siblingCards.some(item => item === floating.id || item === "founder-" + floating.id) ? { what: "card", previous: () => stepFloating(-1), next: () => stepFloating(1), items: floatingItems, current: floatingAt, go: (id: string) => { if (id !== floating.id) { goFloating(id); } } } : undefined}
                    cards={(() => {
                        // (A requirement and the expense it made are drawn together only where a LINK was pressed -- the tile's link, a card's link symbol; opened by its own tile or box, a card is alone.)
                        const pair = floating.linked ? floatingTile.pairOf?.(floating.id) : null;
                        const one = (id: string, caption: string, node: ReactNode) => ({ key: id, caption, kind: floatingTile.kindFor?.(id) ?? floatingTile.cardKind ?? "card" as const, node, note: floatingTile.noteFor?.(id) ?? floatingTile.note });
                        if (pair) {
                            const parent = floatingTile.cardFor?.(pair.parent.id);
                            const child = floatingTile.cardFor?.(pair.child.id);
                            if (parent && child) {
                                return [one(pair.parent.id, pair.parent.caption, parent), one(pair.child.id, pair.child.caption, child)];
                            }
                        }
                        return [one(floating.id, floating.caption ?? floatingTile.groupFor?.(floating.id) ?? floatingTile.group ?? floatingTile.title, floatingCard)];
                    })()}
                    onClose={closeFloating}
                />
                </OpenCardContext.Provider>
            )}

        </>
    );

}

/** Where a floating card is centred: the card of the page the tile stands in (its column), or -- the Workspace -- the tile's group. */
type FloatingCentre = "column" | "group";

interface FloatingOpen {
    tileId: string;
    id: string;
    /** The control that opened it: the focus returns to it. */
    opener: HTMLElement;
    /** The button pressed to open it where that was inside a dialog (a card's box): the one that carries the halo while the card is open. */
    pressed?: HTMLElement | null;
    /** What it is centred over. */
    anchor: HTMLElement | null;
    /** Opened by pressing a LINK (a tile's link line, a card's link symbol) rather than its own tile or box: a linked pair is then drawn together. */
    linked?: boolean;
    /** Added by the "+" box a moment ago: removed again on closing while it is still completely blank. */
    fresh: boolean;
    /** What the box name above the card says where it is not the tile's title (a subcategory's name). */
    caption?: string;
    /** Who removes the card again when it is left blank, where it was not the tile's own "+" (a subcategory box's). */
    remover?: TileAdd;
}

/**
 * A PAGE TILE (docs/ai/layout-rules.md, "Tile anatomy" and "Reactions"): the tile's own button (title, the "+" of an empty
 * section), the list of what it includes as real controls laid over it, and -- on the tiles that take new cards -- a "+"
 * box at the lower right. They stand in one slot, the grid item, which is what scales on hover and focus: 150%, the other
 * tiles staying where they are, from the corner (or edge) that keeps it inside its card.
 */
function TileSlot({
    tile, at, columns, rows, style, onOpen, onLink, onAdd, incomplete
}: {
    tile: SectionTile;
    incomplete?: ReadonlyMap<string, readonly string[]>;
    /** Its cell in the group (0 based). */
    at: { row: number; column: number };
    columns: number;
    rows: number;
    style: CSSProperties;
    onOpen: (from: HTMLElement, pointer: boolean) => void;
    onLink: (link: TileLink, from: HTMLElement, pointer: boolean) => void;
    onAdd: (from: HTMLElement, pointer: boolean) => void;
}) {
    const slot = useRef<HTMLDivElement | null>(null);
    // Whether the pointer has been on the tile since it came: its origin is set ONCE for that stay, never again while the pointer is on it.
    const pointed = useRef(false);

    /* THE POINT IT SCALES FROM, set once when the pointer arrives: the corner, edge or centre of its place in the group; moved
       to fit if the card is too narrow. It is measured as the tile RESTS -- its scale and its transition off for the moment --
       and never again while the pointer stays: a press on a list item moves the focus, and measuring then (the tile already
       at 150%, the transition's first frame still the scaled one) took the grown tile for its size, set another origin and
       slid the tile under the pointer between the press and the release, so the click never landed. */
    const aim = () => {
        const node = slot.current;
        if (!node || pointed.current) {
            return;
        }
        pointed.current = true;
        const transform = node.style.transform;
        const transition = node.style.transition;
        node.style.transition = "none";
        node.style.transform = "none";
        const box = node.getBoundingClientRect();
        node.style.transform = transform;
        node.style.transition = transition;
        const room = (node.closest<HTMLElement>(".card-scroll") ?? node.closest<HTMLElement>(".section-tiles-box"))?.getBoundingClientRect();
        node.style.transformOrigin = scaleOrigin(box, room ?? null, at, columns, rows);
    };

    // The lines that hold an incomplete card go FIRST (the order of the links follows), each with what is missing.
    const baseItems = !tile.empty && tile.items && tile.items.length > 0 ? tile.items : null;
    const missingOf = (link: TileLink | undefined): readonly string[] | undefined => {
        if (!link || !incomplete) {
            return undefined;
        }
        if ("card" in link) {
            return incomplete.get(link.card);
        }
        const inside = (tile.boxHolds?.[link.box] ?? []).filter(id => incomplete.has(id));
        return inside.length > 0 ? inside.flatMap(id => incomplete.get(id) ?? []) : undefined;
    };
    const missingAt = (index: number) => tile.itemAlerts?.[index] ?? missingOf(tile.links?.[index]);
    const order = baseItems ? baseItems.map((_, index) => index).sort((one, other) => Number(!!missingAt(other)) - Number(!!missingAt(one)) || one - other) : [];
    const items = baseItems ? order.map(index => baseItems[index]) : null;
    const orderedLinks = baseItems && tile.links ? order.map(index => tile.links![index]) : tile.links;
    const alerts = baseItems ? order.map(index => missingAt(index)) : undefined;
    const marks = baseItems && tile.itemMarks ? order.map(index => tile.itemMarks![index]) : undefined;
    // (A card the tile holds that is not on a line of it -- one with no name yet -- lights the tile all the same.)
    const held = [...(tile.holds ?? []), ...Object.values(tile.boxHolds ?? {}).flat()];
    const anyAlert = (!!alerts && alerts.some(entry => !!entry)) || (!!incomplete && held.some(id => incomplete.has(id)));

    return (
        <div
            ref={slot}
            className={"section-tile-slot" + (tile.diagram ? " section-tile-slot-diagram" : "") + (tile.inactive ? " section-tile-slot-empty" : "") + ((tile.add && tile.cardFor) || tile.plus ? " section-tile-slot-plus" : "") + (tile.sentence ? " section-tile-slot-sentence" : "") + (anyAlert ? " card-tile-incomplete" : "")}
            style={style}
            data-column={at.column}
            data-row={at.row}
            onPointerEnter={aim}
            onPointerMove={aim}
            onPointerLeave={() => { pointed.current = false; }}
            onPointerCancel={() => { pointed.current = false; }}
        >
            <button
                type="button"
                className={"section-tile" + (tile.diagram ? " section-tile-diagram" : "") + (tile.inactive ? " section-tile-inactive" : "") + (tile.channel ? " section-tile-channel" : "") + (tile.completed ? " section-tile-completed" : "")}
                data-tile={tile.id}
                data-anchor={tile.anchor}
                data-rail={tile.rail}
                data-holds={tile.holds && tile.holds.length > 0 ? tile.holds.join(" ") : undefined}
                aria-haspopup="dialog"
                aria-label={tileName(tile.title, tile.empty ? [] : tile.items)}
                data-tail={tile.tail ? "" : undefined}
                onClick={(event) => {
                    // A block of the tile's picture (a colour, an image, a typeface) that names its card opens that card.
                    const hit = (event.target as HTMLElement).closest<HTMLElement>("[data-card]");
                    if (hit?.dataset.card && tile.cardFor) {
                        onLink({ card: hit.dataset.card }, hit, event.detail > 0);
                        return;
                    }
                    onOpen(event.currentTarget, event.detail > 0);
                }}
            >
                <TileFace title={tile.title} empty={tile.empty} glyph={!(tile.add && tile.cardFor)} />
                {tile.picture && <span className="section-tile-picture" aria-hidden="true">{tile.picture}</span>}
            </button>
            {items && (
                <div className="section-tile-links-layer">
                    <TileList
                        items={items}
                        links={orderedLinks}
                        alerts={alerts}
                        marks={marks}
                        title={tile.title}
                        onLink={onLink}
                        onPlain={(event) => {
                            // (Text that scrolls is under the pointer, not the tile's button: a press on it is a press on the tile.)
                            const button = (event.currentTarget as HTMLElement).closest(".section-tile-slot")?.querySelector<HTMLElement>(":scope > .section-tile");
                            if (button) {
                                onOpen(button, event.detail > 0);
                            }
                        }}
                    />
                </div>
            )}
            {tile.add && (tile.cardFor || tile.addOpensDialog) && (
                <button
                    type="button"
                    className="plus-box section-tile-plus"
                    aria-label={"Add " + tile.add.label.charAt(0).toUpperCase() + tile.add.label.slice(1) + " to " + plainTitle(tile.title)}
                    disabled={tile.add.disabled}
                    onClick={(event) => onAdd(event.currentTarget, event.detail > 0)}
                />
            )}
            {tile.plus && (
                <button
                    type="button"
                    className="plus-box section-tile-plus"
                    aria-label={"Add Subchannel to " + plainTitle(tile.title)}
                    onClick={(event) => { tile.plus?.(); if (!tile.press) { onOpen(event.currentTarget.parentElement?.querySelector<HTMLElement>(":scope > .section-tile") ?? event.currentTarget, event.detail > 0); } }}
                />
            )}
        </div>
    );
}

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
 * What a tile or a box shows: its title, centred, and -- while the section holds nothing yet --
 * a small "+" under the title (decorative; the button is described as "No items yet").
 */
export function TileFace({ title, empty, items, glyph = true, alerts, marks }: { title: string; empty?: boolean; items?: readonly string[]; glyph?: boolean; alerts?: readonly (readonly string[] | undefined)[]; marks?: readonly (ItemMark | undefined)[] }) {
    return (
        <>
            {/* (A title with a forced break is drawn on its lines: the one title that is allowed two.) */}
            {title.includes("\n")
                ? <TileTitle className="section-tile-title-broken">{brokenLines(title).map((part, at) => <Fragment key={at}>{at > 0 && <br />}{drawnTitle(part)}</Fragment>)}</TileTitle>
                : <TileTitle>{drawnTitle(plainTitle(title))}</TileTitle>}
            {empty && (
                <>
                    {/* (A tile that has the "+" box does not draw this glyph as well.) */}
                    {glyph && <span className="section-tile-empty" aria-hidden="true">+</span>}
                    <span className="section-tile-empty-note">No items yet</span>
                </>
            )}
            {!empty && items && items.length > 0 && <TileList items={items} alerts={alerts} marks={marks} />}
        </>
    );
}

/**
 * THE LONG TITLE'S SLIDE: a title cut by an ellipsis slides to the left under the pointer (over its tile) to show its whole name, and slides back when the pointer
 * leaves. The title keeps its box -- its size, its place and its rule do not change, only what the box shows (its scroll). Nothing moves for people who ask for
 * reduced motion (the full name is still the title's tooltip).
 */
export function useTitleSlide(ref: RefObject<HTMLElement | null>) {
    useEffect(() => {
        const node = ref.current;
        const host = node?.closest<HTMLElement>(".section-tile-slot") ?? node?.closest<HTMLElement>("button, .section-tile");
        if (!node || !host || typeof requestAnimationFrame === "undefined") {
            return;
        }
        let frame = 0;
        // (While it slides the title shows its text to the very end: the ellipsis is off, and comes back when the title is home.)
        const slideTo = (target: number) => {
            cancelAnimationFrame(frame);
            const from = node.scrollLeft;
            const distance = Math.abs(target - from);
            if (distance < 1) {
                if (target === 0) {
                    node.style.textOverflow = "";
                }
                return;
            }
            // (About 100px a second, at least a third of a second and at most a second and a half; the way back is quicker.)
            const duration = Math.min(1500, Math.max(target === 0 ? 220 : 350, distance * (target === 0 ? 4 : 10)));
            const began = performance.now();
            const step = (now: number) => {
                const t = Math.min(1, (now - began) / duration);
                node.scrollLeft = from + (target - from) * (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
                if (t < 1) {
                    frame = requestAnimationFrame(step);
                } else if (target === 0) {
                    node.style.textOverflow = "";
                }
            };
            frame = requestAnimationFrame(step);
        };
        const enter = () => {
            const room = node.scrollWidth - node.clientWidth;
            if (room > 1 && !(typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches)) {
                node.style.textOverflow = "clip";
                // (The distance is measured now, so a resize or a font change is always counted: the last letter ends at the title's right edge.)
                slideTo(Math.ceil(node.scrollWidth - node.clientWidth));
            }
        };
        const leave = () => slideTo(0);
        host.addEventListener("pointerenter", enter);
        host.addEventListener("pointerleave", leave);
        return () => {
            cancelAnimationFrame(frame);
            host.removeEventListener("pointerenter", enter);
            host.removeEventListener("pointerleave", leave);
            node.scrollLeft = 0;
            node.style.textOverflow = "";
        };
    }, [ref]);
}

/**
 * A TILE'S TITLE (docs/ai/layout-rules.md, "Tile anatomy"): its last line stands on the line one third
 * down the square, so a long title grows upward. The room above that line holds three lines of the title
 * size at the usual tile; where a title does not fit it (a narrow tile, a long word), it drops to the small
 * size of the type scale -- that title only -- so its first line stays 12px or more from the square's top.
 */
export function TileTitle({ children, className }: { children: ReactNode; className?: string }) {
    const title = useRef<HTMLSpanElement | null>(null);
    useTitleSlide(title);
    useLayoutEffect(() => {
        const node = title.current;
        const tile = node?.closest<HTMLElement>(".section-tile");
        if (!node || !tile) {
            return;
        }
        // ONE LINE, ONE SIZE, ONE PLACE for every title of every tile: no wrapping and no size step; a title too long is cut with an ellipsis and its full text
        // is the tooltip. The list under it starts the same distance under the rule on every tile of a size.
        const apply = () => {
            tile.removeAttribute("data-title-small");
            tile.closest<HTMLElement>(".section-tile-slot")?.removeAttribute("data-title-small");
            // The distance from the title's rule to the foot of the title's row: the list under it comes up by that (or goes down, a title of two lines).
            const row = parseFloat(getComputedStyle(tile).gridTemplateRows.split(" ")[0]) || 0;
            const standing = String(row > 0 ? Math.round((row - (node.offsetTop + node.offsetHeight + tile.clientTop)) * 10) / 10 : parseFloat(getComputedStyle(node).marginBottom) || 0) + "px";
            tile.style.setProperty("--tile-lift", standing);
            tile.closest<HTMLElement>(".section-tile-slot")?.style.setProperty("--tile-lift", standing);
            // The list stands exactly one gap (12px) under the rule: what the layout leaves over is taken off (not while the tile is scaled by the pointer).
            const slot = tile.closest<HTMLElement>(".section-tile-slot");
            const list = slot?.querySelector<HTMLElement>(".section-tile-list");
            const box = tile.getBoundingClientRect();
            if (slot && list && Math.abs(box.height - tile.offsetHeight) < 0.5) {
                const extra = list.getBoundingClientRect().top - node.getBoundingClientRect().bottom - 12;
                if (Math.abs(extra) > 0.2 && Math.abs(extra) < 6) {
                    const corrected = String(Math.round((parseFloat(standing) + extra) * 10) / 10) + "px";
                    tile.style.setProperty("--tile-lift", corrected);
                    slot.style.setProperty("--tile-lift", corrected);
                }
            }
            node.title = node.textContent ?? "";
        };
        apply();
        if (typeof ResizeObserver === "undefined") {
            return;
        }
        const observer = new ResizeObserver(apply);
        observer.observe(tile);
        return () => observer.disconnect();
    });
    return <span ref={title} className={"section-tile-title" + (className ? " " + className : "")}>{children}</span>;
}

/**
 * WHAT A SECTION INCLUDES, under its tile's title (docs/ai/layout-rules.md, "Tile anatomy"): a
 * bulleted list in small muted text, one line per item cut by an ellipsis, as many lines as the room
 * under the title holds (measured) and then "+N more" as the last line. On a page tile the items that lead
 * somewhere are real controls (`links`: a button each, underlined under the pointer and the focus, opening
 * that card alone or the section on that subcategory; "+N more" opens the section); the list of a tile
 * without links is decoration -- it says again what the tile's accessible name says -- and hidden from
 * assistive technology.
 */
export function TileList({
    items, links, alerts, marks, onLink, onPlain
}: {
    items: readonly string[];
    /** For each line, how it is drawn: faded (empty), teal (the Channel), a second teal bullet (it holds a channel's cards). */
    marks?: readonly (ItemMark | undefined)[];
    links?: readonly (TileLink | undefined)[];
    /** For each line, what an incomplete card behind it lacks (the line is then red, flashing). */
    alerts?: readonly (readonly string[] | undefined)[];
    title?: string;
    onLink?: (link: TileLink, from: HTMLElement, pointer: boolean) => void;
    /** A press on a list that has no links (text): what it does. */
    onPlain?: (event: ReactMouseEvent<HTMLUListElement>) => void;
}) {
    const list = useRef<HTMLUListElement | null>(null);
    // The list holds EVERY item and scrolls when they do not all fit under the title (and above the "+" box): a thin themed scrollbar, the wheel scrolls it
    // (not the card behind, until its end), the keyboard walks the links and scrolls them into view. Marked while it scrolls (its layer then takes the wheel).
    const [scrolls, setScrolls] = useState(false);
    useLayoutEffect(() => {
        const node = list.current;
        if (!node) {
            return;
        }
        // HEIGHT DECIDES, NOT LENGTH: on a page tile the list is as tall as the whole items that fit in the room under the title (the layer's second row, less the
        // list's own top margin): it ends at the foot of the last item that fits entirely, so no line is ever cut in half; the rest scrolls.
        const layer = node.parentElement?.classList.contains("section-tile-links-layer") ? node.parentElement : null;
        const snap = () => {
            if (!layer) {
                return;
            }
            const rows = getComputedStyle(layer).gridTemplateRows.split(" ").map(parseFloat);
            // (The list may run 5px past the layer's second row, as far as the top of the "+" box and never under it, and ends 4px under its last line so a
            // descender (g, y, p) is never cut.)
            const room = rows.length > 1 && Number.isFinite(rows[1]) ? rows[1] - (parseFloat(getComputedStyle(node).marginTop) || 0) + 5 : 0;
            if (room <= 0) {
                return;
            }
            node.style.height = "auto";
            node.style.maxHeight = "none";
            let fit = 0;
            for (const child of Array.from(node.children) as HTMLElement[]) {
                // (Its bottom within the LIST: the list is not the child's offset parent, so the list's own place in the layer is taken away -- else every line looked that much lower and the list was cut a line short.)
                const bottom = child.offsetTop - (child.offsetParent === node ? 0 : node.offsetTop) + child.offsetHeight;
                if (bottom <= room + 0.5) {
                    fit = bottom;
                } else {
                    break;
                }
            }
            // (A column page's tile shows text: it ends at a whole LINE, not at a whole item.)
            const lineHeight = parseFloat(getComputedStyle(node).lineHeight) || 0;
            const byLines = !!node.closest(".column-tiles-page") && lineHeight > 0;
            const whole = byLines
                ? Math.floor(room / lineHeight) * lineHeight
                : Array.from(node.children).length > 0 && fit > 0 ? fit : room;
            node.style.height = Math.min(byLines ? whole : whole + 4, room) + "px";
        };
        const measure = () => {
            snap();
            setScrolls(node.scrollHeight > node.clientHeight + 1);
        };
        measure();
        if (typeof ResizeObserver === "undefined") {
            return;
        }
        const observer = new ResizeObserver(measure);
        observer.observe(layer ?? node);
        return () => observer.disconnect();
    }, [items]);
    const shown = items;
    const live = !!onLink && !!links && links.some(link => link !== undefined);
    return (
        <ul className={"section-tile-list" + (shown.some(item => item.includes("\u0001")) ? " section-tile-list-pairs" : "")} ref={list} onClick={!live ? onPlain : undefined} aria-hidden={live ? undefined : "true"} data-scrolls={scrolls ? "" : undefined} tabIndex={scrolls ? 0 : undefined}>
            {shown.map((item, position) => {
                if (item === TILE_DIVIDER) {
                    return <li key={position} className="section-tile-divider" aria-hidden="true" />;
                }
                const link = live ? links?.[position] : undefined;
                // (A space between the lines, which are blocks: the item reads as one phrase to the text and to assistive technology.)
                if (item.includes("\u0001")) {
                    // Two parts set in two columns (a name and its share): the second column starts where every line's does.
                    const [left, right] = item.split("\u0001");
                    return (
                        <li key={position} title={plainTitle(item)}>
                            <span className="section-tile-pair-left">{boldWords(left)}</span>
                            <span className="section-tile-pair-right">{boldWords(right)}</span>
                        </li>
                    );
                }
                const drawn = brokenLines(item).map((part, at, parts) => <Fragment key={at}><span className="section-tile-list-line">{boldWords(part)}</span>{at < parts.length - 1 && " "}</Fragment>);
                return (
                    <li
                        key={position}
                        className={[
                            alerts?.[position] ? "section-tile-list-alert" : "",
                            marks?.[position]?.empty ? "section-tile-list-empty" : "",
                            marks?.[position]?.teal ? "section-tile-list-teal" : "",
                            marks?.[position]?.channel ? "section-tile-list-channel" : "",
                            marks?.[position]?.bullet ? "section-tile-list-bullet" : "",
                            marks?.[position]?.centre ? "section-tile-list-centre" : "",
                            marks?.[position]?.plain ? "section-tile-list-plain" : "",
                            marks?.[position]?.rule ? "section-tile-list-rule" : ""
                        ].filter(Boolean).join(" ") || undefined}
                        title={alerts?.[position] ? plainTitle(item).replace(/\*\*/g, "") + ": " + incompleteTitle(alerts[position]!) : plainTitle(item).replace(/\*\*/g, "")}
                    >
                        {link && onLink
                            ? (
                                <button
                                    type="button"
                                    className="section-tile-link"
                                    data-link={"card" in link ? link.card : link.box}
                                    onClick={(event) => onLink(link, event.currentTarget, event.detail > 0)}
                                >
                                    {drawn}
                                </button>
                            )
                            : drawn}
                    </li>
                );
            })}
        </ul>
    );
}

/** What the arrows beside a card or a dialog do: go to the previous or the next one (a carousel, round the ends). */
export interface CarouselStep {
    /** What is stepped through ("card", "section"): the arrows' names. */
    what: string;
    previous: () => void;
    next: () => void;
    /**
     * Every one of the list, in its order, with the name its bullet's tooltip says: the rail of bullets under the arrows (one for each; this one's lit),
     * as the page's own rails -- any arrows that step through a list carry one.
     */
    items?: readonly { id: string; label: string }[];
    /** This one's place in `items`. */
    current?: number;
    /** Goes to the one of `items` with this id. */
    go?: (id: string) => void;
}

/** The carousel arrow's box: the page arrow's (24 x 44), 10% larger. */
const CAROUSEL_ARROW_WIDTH = 24;
/** The least side of the squeezed Inventory and Completed tiles under the page's two cards. */
export const SQUEEZED_ROW_MIN = 56;

/** How far under the top of a page column's frame every floating card starts (the height of the column's title and its gap): all cards start at one level. */
const CARD_LEVEL = 62;

/** The space between a carousel arrow and the card or dialog it stands beside. */
const CAROUSEL_ARROW_GAP = 12;

/**
 * THE CAROUSEL ARROWS: a "‹" at the left and a "›" at the right of the card (or the opened section) that was opened last, which go to the previous or the next one of
 * the same list, in the list's own order and round its ends. They are measured from the box they flank and stand over the page, so they take no room in it.
 * (Alt + the left or right arrow does the same from the keyboard.)
 */
/** The ground, the edge and the ink of the card or dialog a carousel stands beside: its rail's tab takes them (the page tab's rule, on every layer). */
/** A colour with an alpha under 1 (a caption's dark pill, a card's inner light): never a layer's ground. */
function translucentColour(colour: string): boolean {
    return /\/\s*0?\.\d+\)$|rgba\([^)]*,\s*0?\.\d+\)$/.test(colour);
}

/** What marks a completed activity's card. */
const COMPLETED_CARD = ".business-capability-activity-completed";

function tabColours(node: HTMLElement): { bg: string; edge: string; ink: string } | null {
    const opaque = (colour: string) => colour !== "" && colour !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(colour);
    // The layer's own ground: the first element, from the layer inward (a few levels), that has an opaque background and is as wide as a card -- a dialog's panel, a card's box.
    // (A floating card is searched inside its own body: its caption and the tooltips are no ground.)
    let level: HTMLElement[] = [node.querySelector<HTMLElement>(".floating-card-body") ?? node];
    let ground: HTMLElement | null = null;
    for (let depth = 0; depth < 14 && !ground && level.length > 0; depth += 1) {
        ground = level.find(candidate => opaque(getComputedStyle(candidate).backgroundColor) && !translucentColour(getComputedStyle(candidate).backgroundColor) && candidate.getBoundingClientRect().width >= 200) ?? null;
        level = level.flatMap(candidate => [...candidate.children].filter((child): child is HTMLElement => child instanceof HTMLElement));
    }
    if (!ground) {
        return null;
    }
    const style = getComputedStyle(ground);
    // A completed card is grey, and so is what stands with it (the tab, its bullets, the arrows): the Completed line, whatever hue the tile gives its neighbours.
    if (node.querySelector(COMPLETED_CARD)) {
        const root = getComputedStyle(document.documentElement);
        return { bg: style.backgroundColor, edge: root.getPropertyValue("--line-completed").trim() || style.borderTopColor, ink: root.getPropertyValue("--text-completed-ink").trim() || style.color };
    }
    // (A hairline that is a translucent light -- a card's inner light -- is no colour to draw a tab or its bullets in: the layer's own line accent is, as a dialog's tab has it.)
    const translucent = /\/\s*0?\.\d+\)$|rgba\([^)]*,\s*0?\.\d+\)$/.test(style.borderTopColor);
    return { bg: style.backgroundColor, edge: opaque(style.borderTopColor) && !translucent && parseFloat(style.borderTopWidth) > 0 ? style.borderTopColor : "hsl(var(--strategy-theme-hue, 0) var(--theme-line-accent))", ink: style.color };
}

/** Where a layer's page tab starts: 12px under the top of the frame it is attached to (a floating card's own frame, never the box name above it; a dialog's panel). */
const TAB_DROP = 12;

function titleTopOf(node: HTMLElement): number {
    const frame = node.querySelector<HTMLElement>(".floating-card-body") ?? node;
    return frame.getBoundingClientRect().top + TAB_DROP;
}

function CarouselArrows({ target, step, hue, back }: { target: RefObject<HTMLElement | null>; step: CarouselStep; hue: number; back?: () => void }) {
    const [at, setAt] = useState<{ left: number; right: number; top: number; edge: number; leftEdge: number; side: "left" | "right"; titleTop: number; tab: { bg: string; edge: string; ink: string } | null } | null>(null);

    // The tab's colours follow the reading mode (light, sepia, dark, auto) while the layer stays open: measured again when it changes.
    const [modeCount, setModeCount] = useState(0);
    useEffect(() => {
        const again = () => window.requestAnimationFrame(() => window.requestAnimationFrame(() => setModeCount(count => count + 1)));
        const observer = new MutationObserver(again);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
        const query = window.matchMedia?.("(prefers-color-scheme: dark)");
        query?.addEventListener?.("change", again);
        return () => {
            observer.disconnect();
            query?.removeEventListener?.("change", again);
        };
    }, []);

    const tabCache = useRef<{ key: string; value: ReturnType<typeof tabColours> } | null>(null);
    const measureTick = useRef(0);

    useLayoutEffect(() => {
        const node = target.current;
        if (!node) {
            return;
        }
        const box = node.getBoundingClientRect();
        // (At the page arrows' own level; the arrows never leave the window.)
        const top = arrowLevel() ?? window.innerHeight / 2;
        const left = Math.max(4, box.left - CAROUSEL_ARROW_GAP - CAROUSEL_ARROW_WIDTH);
        const right = Math.max(4, window.innerWidth - box.right - CAROUSEL_ARROW_GAP - CAROUSEL_ARROW_WIDTH);
        // (The tab's colours walk the layer's boxes and read their styles: kept until the layer is resized, the reading mode changes or the layer is another, not read again at every render -- typing in a card renders it at every key.)
        const key = (node.querySelector(COMPLETED_CARD) ? "done:" : "") + modeCount + ":" + measureTick.current + ":" + Math.round(box.width) + ":" + node.className;
        if (tabCache.current?.key !== key) {
            tabCache.current = { key, value: tabColours(node) };
        }
        const tab = tabCache.current.value;
        const titleTop = titleTopOf(node);
        // (The tab stands on the side of the layer that is nearer its end of the page: a layer in the left half has it at its left, one in the right half at its right.)
        const side: "left" | "right" = box.left + box.width / 2 < window.innerWidth / 2 ? "left" : "right";
        setAt(previous => previous && Math.abs(previous.left - left) < 0.5 && Math.abs(previous.right - right) < 0.5 && Math.abs(previous.top - top) < 0.5 && Math.abs(previous.titleTop - titleTop) < 0.5 && previous.side === side && Math.abs(previous.leftEdge - box.left) < 0.5 && previous.tab?.bg === tab?.bg && previous.tab?.edge === tab?.edge && previous.tab?.ink === tab?.ink ? previous : { left, right, top, edge: box.right, leftEdge: box.left, side, titleTop, tab });
    });

    // (Measured again whenever the box or the window changes size.)
    const [, measureAgain] = useState(0);
    useEffect(() => {
        const node = target.current;
        const again = () => {
            measureTick.current += 1;
            measureAgain(count => count + 1);
        };
        window.addEventListener("resize", again);
        const observer = typeof ResizeObserver === "undefined" || !node ? null : new ResizeObserver(again);
        if (node) {
            observer?.observe(node);
        }
        return () => {
            window.removeEventListener("resize", again);
            observer?.disconnect();
        };
    }, [target]);

    const stepRef = useRef(step);
    stepRef.current = step;
    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) {
                return;
            }
            // (The arrow keys alone, where nothing else uses them: not in a field, a picker, a list or a menu.)
            const inside = event.target instanceof Element ? event.target : null;
            if (!event.altKey && inside?.closest("input, textarea, select, [contenteditable=true], [role=listbox], [role=menu], [role=slider], .option-picker, .date-cell, .month-picker")) {
                return;
            }
            // (Only the topmost layer answers.)
            const layers = document.querySelectorAll("[data-carousel]");
            if (layers[layers.length - 1]?.contains(target.current)) {
                event.preventDefault();
                (event.key === "ArrowLeft" ? stepRef.current.previous : stepRef.current.next)();
            }
        }
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [target]);

    // THE TAB STANDS AT THE TOP OF ITS LAYER, level with the layer's title, and never hides the arrow: where the arrow stands in the tab's column, the bullets that would lie under it follow below it (a gap the arrow's size is left in the list).
    const railRef = useRef<HTMLElement | null>(null);
    const [gap, setGap] = useState<{ index: number; size: number } | null>(null);
    const [arrowOnTab, setArrowOnTab] = useState(false);
    const itemCount = step.items?.length ?? 0;
    // (The tab measured again whenever it, or the window, changes size: names arriving, fonts loading, the layer moving.)
    const [railSize, setRailSize] = useState(0);
    useEffect(() => {
        const rail = railRef.current;
        const again = () => setRailSize(count => count + 1);
        window.addEventListener("resize", again);
        const observer = typeof ResizeObserver === "undefined" || !rail ? null : new ResizeObserver(again);
        if (rail) {
            observer?.observe(rail);
        }
        return () => {
            window.removeEventListener("resize", again);
            observer?.disconnect();
        };
    }, [at?.edge, at?.tab]);
    const railTop = at?.tab ? at.titleTop : null;
    const arrowTop = at?.top ?? 0;
    useLayoutEffect(() => {
        const rail = railRef.current;
        if (!rail || railTop === null) {
            setGap(null);
            setArrowOnTab(false);
            return;
        }
        // (Every line of the tab -- the bullets, then Back -- as it stands without the gap: its measured top, less what the gap itself moved it.)
        const lines = [...rail.querySelectorAll<HTMLElement>("ol > li, .carousel-rail-back")];
        const from = arrowTop - 22 - 8;
        const to = arrowTop + 22 + 8;
        let index = -1;
        let naturalTop = 0;
        for (let position = 0; position < lines.length; position += 1) {
            const box = lines[position].getBoundingClientRect();
            const top = box.top - (gap && position >= gap.index ? gap.size : 0);
            if (index < 0 && top + box.height > from) {
                index = position;
                naturalTop = top;
            }
        }
        const size = index < 0 ? 0 : Math.max(0, to - naturalTop);
        const next = index >= 0 && size > 0 ? { index, size } : null;
        setGap(previous => previous?.index === next?.index && Math.abs((previous?.size ?? 0) - (next?.size ?? 0)) < 0.5 ? previous : next);
        setArrowOnTab(index >= 0 && naturalTop < to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [railTop, arrowTop, itemCount, at?.edge, back, gap?.index, gap?.size, railSize]);

    // Only the topmost layer shows its arrows and rail: the one under it stands at the same place, and its bullets would overlap the top one's.
    const [topmost, setTopmost] = useState(true);
    useEffect(() => {
        const check = () => {
            const layers = document.querySelectorAll("[data-carousel]");
            setTopmost(layers.length === 0 || !!layers[layers.length - 1]?.contains(target.current));
        };
        check();
        const observer = typeof MutationObserver === "undefined" ? null : new MutationObserver(check);
        observer?.observe(document.body, { childList: true });
        return () => observer?.disconnect();
    }, [target]);

    if (!at || !topmost) {
        return null;
    }
    return (
        <>
            <button
                type="button"
                className={"page-arrow carousel-arrow" + (arrowOnTab && at.side === "left" ? " carousel-arrow-on-tab" : "")}
                data-completed={target.current?.querySelector(COMPLETED_CARD) ? "" : undefined}
                data-direction="previous"
                aria-label={"Previous " + step.what}
                title={"Previous " + step.what + " (←)"}
                style={{ left: at.left, top: at.top, "--strategy-theme-hue": hue, ...(at.tab ? { "--tab-edge": at.tab.edge } : {}) } as CSSProperties}
                onClick={step.previous}
            >
                ‹
            </button>
            <button
                type="button"
                className={"page-arrow carousel-arrow" + (arrowOnTab && at.side === "right" ? " carousel-arrow-on-tab" : "")}
                data-completed={target.current?.querySelector(COMPLETED_CARD) ? "" : undefined}
                data-direction="next"
                aria-label={"Next " + step.what}
                title={"Next " + step.what + " (→)"}
                style={{ right: at.right, top: at.top, "--strategy-theme-hue": hue, ...(at.tab ? { "--tab-edge": at.tab.edge } : {}) } as CSSProperties}
                onClick={step.next}
            >
                ›
            </button>
            {step.items && step.items.length > 1 && step.go && (
                // The rail under the arrows (the right one's): a bullet for each of the list, this one's lit. A card's bullet says its name in a tooltip (a card is named by the user); a SECTION'S bullet has its name beside it (the tiles' names are given), where the window has the room for it.
                <nav
                    ref={railRef}
                    className={"carousel-rail" + (step.what === "section" && (at.tab && at.side === "left" ? at.left : at.right) >= 160 ? " carousel-rail-named" : "") + (at.tab ? " carousel-rail-tab" : "") + (at.tab && at.side === "left" ? " carousel-rail-tab-left" : "")}
                    aria-label={"Go to a " + step.what}
                    style={{ ...(at.tab && at.side === "left" ? { right: window.innerWidth - at.leftEdge } : { left: at.edge }), top: at.tab ? at.titleTop : at.top + 36, "--rail-label-room": Math.max(0, (at.tab && at.side === "left" ? at.left : at.right) - 8 - 24) + "px", "--strategy-theme-hue": hue, ...(at.tab ? { "--tab-bg": at.tab.bg, "--tab-edge": at.tab.edge, "--tab-ink": at.tab.ink } : {}) } as unknown as CSSProperties}
                >
                    <ol className="bullet-rail-list">
                        {step.items.map((item, position) => (
                            <li key={item.id} style={gap?.index === position ? { marginTop: gap.size } : undefined}>
                                <button
                                    type="button"
                                    className={"bullet-rail-item" + (position === step.current ? " active" : "")}
                                    aria-current={position === step.current ? "true" : undefined}
                                    aria-label={item.label}
                                    onClick={() => step.go?.(item.id)}
                                >
                                    <span className="bullet-rail-dot status-shape" aria-hidden="true" />
                                    <span className="strategy-card-nav-tip" aria-hidden="true">{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ol>
                    {/* The way back stands in the tab, after the last option (the dialog's own foot no longer has it while the tab does). */}
                    {back && (
                        <button type="button" className="carousel-rail-back" style={gap && gap.index === itemCount ? { marginTop: 12 + gap.size } : undefined} onClick={back} aria-label="Back" title="Back">
                            <span className="back-arrow" aria-hidden="true" />
                            <span className="carousel-rail-back-word">Back</span>
                        </button>
                    )}
                </nav>
            )}
        </>
    );
}

/** One card of a floating stack: the box name above it (its caption), its kind (its width) and the card. */
export interface FloatingItem {
    key: string;
    /** The name of the tile or box the card belongs to ("Operational", "Providers"): drawn centred ABOVE the card, outside it. */
    caption: string;
    kind: "card" | "founder";
    node: ReactNode;
    /** The card's own colour where it differs from its stack's (a card of Offering's Capability opened from a founder's card keeps the Offering's). */
    hue?: number;
    /** The box's "i" note, after the caption's words (what the dialog's header carries when the box is opened that way). */
    note?: InfoPoint[];
}

/**
 * The Escape that is typed in the app header (the Notes panel, the reading-version menu, Search) belongs to what is open there: the layers of the page leave it
 * alone and the next Escape, once nothing is open in the header, closes them.
 */
function headerOwnsEscape(event: KeyboardEvent): boolean {
    const target = event.target as HTMLElement | null;
    return !!target?.closest?.(".app-header") && !!document.querySelector(".app-header .notepad-panel, .app-header .theme-switch-list, .app-header .search-overlay, .app-header [aria-expanded=\"true\"]");
}

/**
 * ASKS THE PAGE'S TILES TO OPEN SOMETHING: a card of a tile (`card`, floating) or a section inside a tile's dialog (`tile` and `box`). A card that is linked to another
 * (a Legal expense to its registration, a registration to its expense) says so with this; the tiles that hold it answer.
 */
export const OPEN_EVENT = "section-tiles:open";
export interface OpenRequest { card?: string; tile?: string; box?: string; /** A card just made: left blank, it is taken away when it is closed. */ fresh?: boolean }

/** Closes every dialog and floating card of the page tiles (a card opened from another one, the parent and its child, starts afresh). */
export const CLOSE_TILES_EVENT = "section-tiles:close";

/**
 * FLOATING CARDS (docs/ai/layout-rules.md, "Floating cards"): one card alone -- a founder's, a resource's, an activity's, a
 * partner's, the Workspace form -- or a PAIR stacked (a parent card above its child), over the dimmed page (inert), each with its box
 * name centred above it (the caption, on the backdrop, outside the card), a drop shadow, and a Back button under the stack. Escape,
 * Back and a click on the dimmed space close it. It stands centred over its anchor: the card of the page it belongs to
 * (Infrastructure's or Offering's Capability's) or, the Workspace, the group of tiles; vertically on the middle of the part of the
 * anchor in view between the page heading's underline and the footer, or on the middle of that band where the stack is taller than
 * that part of the anchor.
 */
export function FloatingCards({
    cards, anchor, fresh = false, pair = false, hue, label, attrs, step, onClose
}: {
    cards: FloatingItem[];
    /** The arrows beside the card that go to the previous or the next card of its list (none where it stands alone). */
    step?: CarouselStep;
    anchor: HTMLElement | null;
    fresh?: boolean;
    /** A pair opened from a card (it is not closed by the opening of itself). */
    pair?: boolean;
    hue: number;
    label: string;
    attrs?: Record<string, string>;
    onClose: () => void;
}) {
    const overlay = useRef<HTMLDivElement | null>(null);
    const panel = useRef<HTMLDivElement | null>(null);
    const [place, setPlace] = useState<{ left: number; top: number; band: number } | null>(null);
    const closeRef = useRef(onClose);
    closeRef.current = onClose;
    const anchorRef = useRef(anchor);
    anchorRef.current = anchor;
    useEffect(() => () => settlePage(), []);

    useLayoutEffect(() => {
        const node = panel.current;
        if (!node) {
            return;
        }
        const position = () => {
            const width = node.offsetWidth;
            const frame = dialogFrame();
            // (Only the app header cuts a floating card: it scrolls under it, nothing else clips it.)
            const bandTop = document.querySelector<HTMLElement>(".app-header")?.getBoundingClientRect().bottom ?? (frame ? frame.top : 0);
            // (Only the header cuts a card: it runs to the window's bottom, never to the footer.)
            const bandBottom = window.innerHeight - 8;
            const where = anchorRef.current;
            // Across: centred over the anchor (the page's column, or the Workspace's group of tiles).
            const centreX = where ? where.getBoundingClientRect().left + where.getBoundingClientRect().width / 2 : window.innerWidth / 2;
            // Down: the TOP of the first card stands on the top of the first row of tiles of the page's column as the page rests (scrolled up) --
            // that row's top now, plus how far the column's body is scrolled. Its box name stands above that line; a taller stack extends
            // downward and scrolls inside the host (the Back button stays in view at its foot).
            const row = where?.querySelector<HTMLElement>(".section-tile-slot") ?? null;
            const body = node.querySelector<HTMLElement>(".floating-card-body");
            // (Its place in the host's own layout, not its place on the screen: the host may be scrolled.)
            const bodyOffset = body ? body.offsetTop - (body.offsetParent === node ? 0 : (body.offsetParent as HTMLElement | null)?.offsetTop ?? 0) : 0;
            let top: number;
            if (where && body) {
                // EVERY card starts at one level: the first row of tiles of its column (a Workspace group's too) where that stands under the column's title, else where it would stand -- the frame's top plus the height of the title, whatever the column holds (a table, a dialog over it).
                const frameTop = where.getBoundingClientRect().top;
                const rowTop = row ? row.getBoundingClientRect().top : null;
                top = (rowTop !== null && rowTop - frameTop >= 0 && rowTop - frameTop <= 120 ? rowTop : frameTop + CARD_LEVEL) - bodyOffset;
            } else {
                top = bandTop + (bandBottom - bandTop - Math.min(node.scrollHeight, bandBottom - bandTop)) / 2;
            }
            // (Where the first row is out of view -- the cards stacked under 1100px, the page scrolled -- the stack stands at the top of the band instead:
            // under the page heading's underline, never below the point where 200px of it would still show.)
            top = Math.min(Math.max(top, bandTop + 8), Math.max(bandTop + 8, bandBottom - 200));
            const left = Math.max(8, Math.min(centreX - width / 2, window.innerWidth - 8 - width));
            setPlace(previous => previous && Math.abs(previous.band - bandTop) < 0.5 && Math.abs(previous.left - left) < 0.5 && Math.abs(previous.top - top) < 0.5 ? previous : { left, top, band: bandTop });
        };
        position();
        window.addEventListener("resize", position);
        if (typeof ResizeObserver === "undefined") {
            return () => window.removeEventListener("resize", position);
        }
        const observer = new ResizeObserver(position);
        observer.observe(node);
        return () => {
            window.removeEventListener("resize", position);
            observer.disconnect();
        };
    }, []);

    // A new card takes the focus in its name; any other the stack itself, so Escape reaches it.
    // (Once it is placed and shown: a hidden element cannot take the focus.)
    const focused = useRef(false);
    useEffect(() => {
        if (!place || focused.current) {
            return;
        }
        focused.current = true;
        // (A stack taller than the band between the heading and the footer scrolls inside: it always opens at its top, the name of the first card in view.)
        if (panel.current) {
            panel.current.scrollTop = 0;
        }
        const field = fresh ? panel.current?.querySelector<HTMLElement>("textarea.card-name-input") : null;
        (field ?? panel.current)?.focus({ preventScroll: true });
    }, [place, fresh]);

    // The tiles area behind a card stays USABLE (the scrim is only a tint: it takes no clicks). A press anywhere OUTSIDE the card closes it -- on empty space that
    // is the whole effect (back to the view it was opened from); on a tile the press goes on to open that tile in its place. Only the topmost card answers.
    useEffect(() => {
        function onPress(event: MouseEvent) {
            const target = event.target as HTMLElement | null;
            const overlays = document.querySelectorAll(".floating-overlay");
            if (!target || overlays[overlays.length - 1] !== overlay.current) {
                return;
            }
            if (overlay.current?.contains(target) || target.closest("[role=listbox], [role=menu], .app-header")) {
                return;
            }
            closeRef.current();
        }
        document.addEventListener("mousedown", onPress);
        return () => document.removeEventListener("mousedown", onPress);
    }, []);

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key !== "Escape" || event.defaultPrevented || headerOwnsEscape(event)) {
                return;
            }
            consumeKey(event);
            const popup = openPopup(panel.current);
            if (popup) {
                popup.click();
                return;
            }
            // ESCAPE leaves every layer at once (the cards, the dialogs under them): back to the page.
            document.dispatchEvent(new CustomEvent(CLOSE_TILES_EVENT));
        }
        const onCloseAll = () => {
            closeRef.current();
        };
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener(CLOSE_TILES_EVENT, onCloseAll);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener(CLOSE_TILES_EVENT, onCloseAll);
        };
    }, [pair]);

    return createPortal(
        <div
            ref={overlay}
            className="section-tile-overlay floating-overlay business-foundation business-engagement business-capability"
            data-carousel={step ? "" : undefined}
            // (The overlay starts under the app header and scrolls: the header is the only edge that cuts a card.)
            style={place ? { top: place.band } : undefined}
        >
            {step && place && <CarouselArrows target={panel} step={step} hue={hue} />}
            <div
                ref={panel}
                className={"floating-card-host floating-card-" + cards[0].kind}
                role="dialog"
                aria-modal="true"
                aria-label={label}
                tabIndex={-1}
                {...attrs}
                style={{
                    "--strategy-theme-hue": hue,
                    "--floating-hue": hue,
                    left: place ? place.left : 0,
                    top: place ? place.top - place.band : 0,
                    visibility: place ? "visible" : "hidden"
                } as CSSProperties}
            >
                <div className="floating-card-stack">
                    {cards.map(card => (
                        <div className="floating-card-item" key={card.key} data-kind={card.kind} style={card.hue !== undefined ? { "--strategy-theme-hue": card.hue, "--floating-hue": card.hue } as CSSProperties : undefined}>
                            <div className="floating-card-caption">
                                <InfoText text={card.caption}>
                                    {card.note && card.note.length > 0 && <InfoNote label={card.caption} points={card.note} fullList />}
                                </InfoText>
                            </div>
                            <div className={"floating-card-body floating-card-" + card.kind + (card.kind === "card" ? " card-box-open" : "")}>{card.node}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
}

/**
 * The control of a popup of the dialog's own (a list, an "i") that is open: it
 * takes Escape first.
 */
function openPopup(dialog: HTMLElement | null): HTMLElement | null {
    return dialog?.querySelector<HTMLElement>('[aria-haspopup][aria-expanded="true"]') ?? null;
}

function TileDialog({

    tile,

    hue,

    opener,

    initialBox,

    onClose: close,

    onOpenCard,

    step

}: {

    tile: SectionTile;
    /** The arrows beside the dialog: the previous or the next tile of the section. */
    step?: CarouselStep;
    /** The subcategory box the dialog opens on (a list item that named one). */
    initialBox: string | null;
    hue: number;
    /** The tile that opened the dialog: a box inside never exceeds its side. */
    opener: HTMLElement | null;
    onClose: () => void;
    /** A card chosen inside (a card box pressed, a subcategory box that holds one card, a "+" box): it is opened floating, outside the dialog. Null for a tile that keeps its cards in the dialog. */
    onOpenCard: ((id: string, caption: string | undefined, remover: TileAdd | undefined, pointer: boolean, fresh: boolean) => void) | null;

}) {

    // Closing first lets what is inside tidy up (a card left completely blank is removed).
    const closing = useRef(new Set<() => void>());
    const closeRef = useRef(close);
    closeRef.current = close;
    const onClose = () => {
        closing.current.forEach(fn => fn());
        closeRef.current();
    };
    const [tileSize] = useState(() => opener?.getBoundingClientRect().width ?? 0);

    const panel = useRef<HTMLDivElement | null>(null);
    const nameId = useId();

    // The square between the heading's underline and the footer; measured on opening and
    // whenever the window changes size.
    // (Measured when first drawn, not after: the text boxes inside size themselves to the
    // width they are first laid out at.)
    const [square, setSquare] = useState<{ width: number; height: number; top: number; left?: number } | null>(() => dialogFrame(opener));
    useLayoutEffect(() => {
        const onResize = () => setSquare(dialogFrame(opener));
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // The way back inside the dialog's content, if it has one shown (useDialogInnerBack).
    const innerBack = useRef<(() => void) | null>(null);
    const [subtitle, setSubtitle] = useState<string | undefined>(undefined);
    const [crumbs, setCrumbs] = useState<readonly Crumb[]>([]);
    const levels = useRef<({ back: () => void; name?: string; note?: CrumbNote } | null)[]>([]);
    const innerStep = useRef<((direction: 1 | -1) => boolean) | null>(null);
    const stepLevels = useRef<(((direction: 1 | -1) => boolean) | null)[]>([]);
    const railLevels = useRef<(DialogRail | null)[]>([]);
    const [innerRail, setInnerRail] = useState<DialogRail | null>(null);
    const innerContext = useRef<InnerBackApi>({
        set: (depth, back, name, note) => {
            levels.current[depth] = back ? { back, name, note } : null;
            const shown = levels.current.filter((level): level is { back: () => void; name?: string; note?: CrumbNote } => level !== null);
            innerBack.current = shown.length > 0 ? shown[shown.length - 1].back : null;
            const named = shown.filter(level => !!level.name && level.name.trim().length > 0);
            setSubtitle(named.length > 0 ? named.map(level => level.name).join(", ") : undefined);
            // (Kept as it was where nothing changed: a view registers again on every render, and a new array each time would loop.)
            setCrumbs(previous => previous.length === named.length && previous.every((crumb, at) => crumb.name === named[at].name && JSON.stringify(crumb.note) === JSON.stringify(named[at].note))
                ? previous
                : named.map(level => ({ name: level.name as string, note: level.note })));
        },
        onClose: (fn) => {
            closing.current.add(fn);
            return () => { closing.current.delete(fn); };
        },
        tileSize,
        // (Each inner view registers its own way of stepping at its depth; the deepest one answers the arrows.)
        setStep: (depth, next, rail) => {
            stepLevels.current[depth] = next;
            railLevels.current[depth] = next ? rail ?? null : null;
            const shown = stepLevels.current.filter((level): level is (direction: 1 | -1) => boolean => level !== null && level !== undefined);
            innerStep.current = shown.length > 0 ? shown[shown.length - 1] : null;
            // (The deepest level that has a rail of its own answers.)
            const rails = railLevels.current.filter((level): level is DialogRail => level !== null && level !== undefined);
            const deepest = rails.length > 0 ? rails[rails.length - 1] : null;
            setInnerRail(previous => (previous === null && deepest === null) || (previous && deepest && previous.current === deepest.current && previous.items.length === deepest.items.length && previous.items.every((item, at) => item.id === deepest.items[at].id && item.label === deepest.items[at].label))
                ? previous
                : deepest);
        }
    });
    const back = () => (innerBack.current ? innerBack.current() : onClose());

    // A press that starts on the dimmed backdrop and ends on it closes the dialog; one that
    // starts inside the dialog (a text drag) and ends outside never does.
    const pressedBackdrop = useRef(false);

    // Opened with the keyboard on the dialog itself, so Escape reaches it.
    useLayoutEffect(() => {
        panel.current?.focus({ preventScroll: true });
    }, []);

    // (Closed, the page is the default page: no tile grown under a resting pointer.)
    useEffect(() => () => settlePage(), []);

    // The page behind is inert while the dialog is open.
    const host = useRef<HTMLDivElement | null>(null);
    useLayoutEffect(() => {
        const inerted: Element[] = [];
        // (The app header -- the reading version, Notes, Search, Review, Reload -- stays live: a box around it is entered, and only what is beside it made inert.)
        const header = document.querySelector(".app-header");
        const quiet = (parent: Element) => {
            for (const child of Array.from(parent.children)) {
                if (child === host.current || child === header || child.hasAttribute("inert")) {
                    continue;
                }
                if (header && child.contains(header)) {
                    quiet(child);
                    continue;
                }
                child.setAttribute("inert", "");
                inerted.push(child);
            }
        };
        quiet(document.body);
        return () => inerted.forEach(child => child.removeAttribute("inert"));
    }, []);

    // Another card is opened from a card (the parent and its child): this dialog gives way (a blank card is removed, as on closing).
    const closeAll = useRef(onClose);
    closeAll.current = onClose;
    useEffect(() => {
        const handler = () => closeAll.current();
        document.addEventListener(CLOSE_TILES_EVENT, handler);
        return () => document.removeEventListener(CLOSE_TILES_EVENT, handler);
    }, []);

    // Escape closes the dialog, and only it: the key goes no further (it
    // is the page's Back otherwise; see consumeKey). A popup open inside
    // takes its own Escape first (one that has focus answers it itself and
    // the key never gets here); for one that has not, this closes the popup,
    // not the dialog.
    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key !== "Escape" || event.defaultPrevented || headerOwnsEscape(event)) {
                return;
            }
            // (A card floating over this dialog takes the key: it closes every layer.)
            if (document.querySelector(".floating-overlay")) {
                return;
            }
            consumeKey(event);
            const popup = openPopup(panel.current);
            if (popup) {
                popup.click();
                return;
            }
            // ESCAPE closes the dialog whatever view of it is open (group, category, section): back to the page.
            onClose();
        }
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
        // onClose is a fresh function each render; closing is all it does.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return createPortal(
        <div
            ref={host}
            className={"section-tile-overlay business-foundation business-engagement business-capability" + (square ? " section-tile-overlay-measured" : "") + (square?.left !== undefined ? " section-tile-overlay-placed" : "") + (tile.wide ? " section-tile-overlay-wide" : "")}
            data-carousel={step ? "" : undefined}
            style={square ? { "--section-dialog-width": square.width + "px", "--section-dialog-height": square.height + "px", "--section-dialog-top": square.top + "px", ...(square.left !== undefined ? { "--section-dialog-left": square.left + "px" } : {}) } as CSSProperties : undefined}
            // (A press on the empty space with a card floating over this dialog closes the card only: the card answers it.)
            onMouseDown={(event) => { pressedBackdrop.current = event.target === event.currentTarget && !document.querySelector(".floating-overlay"); }}
            onClick={(event) => {
                if (event.target === event.currentTarget && pressedBackdrop.current) {
                    back();
                }
                pressedBackdrop.current = false;
            }}
        >
            <div
                ref={panel}
                className={"section-tile-dialog business-foundation-input business-foundation-card" + (tile.channel ? " section-tile-dialog-channel" : "") + (tile.completed ? " section-tile-dialog-completed" : "")}
                role="dialog"
                aria-modal="true"
                aria-labelledby={nameId}
                tabIndex={-1}
                style={{ "--strategy-theme-hue": hue } as CSSProperties}
            >

                <span id={nameId} className="section-tile-dialog-name">{subtitle ? tile.title + ", " + subtitle : tile.title}</span>

                <div className="section-tile-dialog-body">
                    <InnerBackContext.Provider value={innerContext.current}>
                        <CrumbsContext.Provider value={crumbs}>
                            <InitialBoxContext.Provider value={initialBox}>
                                <OpenCardContext.Provider value={onOpenCard}>
                                    {tile.content()}
                                </OpenCardContext.Provider>
                            </InitialBoxContext.Provider>
                        </CrumbsContext.Provider>
                    </InnerBackContext.Provider>
                </div>

                <div className="section-tile-dialog-foot">
                    <button type="button" className="section-tile-back" onClick={back}>
                        <span className="back-arrow" aria-hidden="true" />
                        {" Back"}
                    </button>
                </div>

            </div>

            {step && <CarouselArrows target={panel} step={{ ...step, ...(innerRail ? { items: innerRail.items, current: innerRail.current, go: innerRail.go } : {}), previous: () => { if (!innerStep.current?.(-1)) { step.previous(); } }, next: () => { if (!innerStep.current?.(1)) { step.next(); } } }} hue={hue} back={back} />}
        </div>,
        document.body
    );

}
