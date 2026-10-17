import { CSSProperties, DragEvent, RefObject, useLayoutEffect, useRef, useState } from "react";
import { stableCardHue } from "../../framework/engine/AnswerUtils.ts";
import { CHANNEL_TILE_HUE, TileFace, TileList, incompleteTitle, type ItemMark } from "./SectionTiles.tsx";
import { useAboveTip } from "./AboveTip.tsx";
import type { FloorLink, FloorTone } from "./capabilityFloor.ts";
import { rememberCardName } from "./cardNames.ts";
import "../../styles/card-tile.css";

/*
    THE CARD TILE: the ONE tile a card is shown as wherever cards are shown as tiles -- the Inventory overlay and every grid of cards in a dialog
    (Resources, Activities, Partners, Providers, a category's, a channel's, the Completed activities). A page tile's make (TileFace: the name, its rule,
    a list of lines), 215px, in the colour of the section it stands in; the lines say where it belongs, its status and its cost; a small coloured circle
    for each link; the page tile's hover (lift, glow, transition) grown to 110% INWARDS (from the side of the grid it stands on). One component, one
    stylesheet (card-tile.css): a change here changes every place at once.
*/

export const SYMBOLS: Record<FloorLink["type"], string> = {
    activity: "Activity",
    investigation: "Investigate",
    partner: "Partner",
    provider: "Supplier",
    resource: "Resource",
    expense: "Expense",
    registration: "Registration"
};

/** The hue a tile keeps from the section it stands in on the page (a legal expense has none: the Legal Entity's neutral ground). */
export function toneHue(tone: FloorTone): number {
    return tone === "offering" ? stableCardHue("offering-capability") : tone === "channel" ? CHANNEL_TILE_HUE : stableCardHue("infrastructure");
}

/** The side of a tile on the page itself. */
export function pageTileSide(): number {
    const tile = document.querySelector<HTMLElement>(".answer-columns.business-capability .section-tile-slot > .section-tile");
    // (The four tiles of a page card are scaled up to fill it, two by two: the tile of every dialog is the one a card of three across would have.)
    const quad = tile?.closest<HTMLElement>(".section-tiles-quad");
    if (quad && quad.clientWidth > 0) {
        return Math.floor((quad.clientWidth - 2 * 12) / 3 - 0.01);
    }
    return tile && tile.offsetWidth > 0 ? tile.offsetWidth : 215;
}

/** The gap between tiles (--space-card). */
export const TILE_GAP = 12;

/** How many tiles stand across a grid as wide as `ref` (as many as fit at the page's size and gap). */
export function useTilesAcross(ref: RefObject<HTMLElement | null>, side: number): number {
    const [across, setAcross] = useState(1);
    useLayoutEffect(() => {
        const node = ref.current;
        if (!node) {
            return;
        }
        const measure = () => setAcross(Math.max(1, Math.floor((node.clientWidth + TILE_GAP + 2) / (side + TILE_GAP))));
        measure();
        if (typeof ResizeObserver === "undefined") {
            return;
        }
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        return () => observer.disconnect();
    });
    return across;
}

/** The transform-origin that makes a tile grow INWARDS: toward the middle of the grid it stands in. */
export function inwardOrigin(index: number, count: number, across: number): string {
    const column = index % across;
    const lastRow = Math.floor((count - 1) / across);
    const row = Math.floor(index / across);
    return (across <= 1 ? "50%" : column === 0 ? "0%" : column === across - 1 ? "100%" : "50%") + " " +
        (lastRow === 0 ? "50%" : row === 0 ? "0%" : row === lastRow ? "100%" : "50%");
}

/** A tile's circles: one per link. With `onFocus` they are buttons (a press shows only what the tile is connected to). */
export function Dots({ id, name, links, focusId, onFocus }: {
    id: string;
    name: string;
    links: readonly FloorLink[];
    focusId?: string | null;
    onFocus?: () => void;
}) {
    if (links.length === 0) {
        return null;
    }
    return (
        <span className="card-tile-symbols">
            {links.map(link => <Dot key={link.type + link.id} link={link} id={id} name={name} focusId={focusId} onFocus={onFocus} />)}
        </span>
    );
}

/** One circle: its tooltip stands above it (the app's tooltip), not wherever the browser puts a title. */
function Dot({ link, id, name, focusId, onFocus }: { link: FloorLink; id: string; name: string; focusId?: string | null; onFocus?: () => void }) {
    const text = SYMBOLS[link.type] + ": " + link.name;
    const button = useAboveTip<HTMLButtonElement>(text + " (show only what " + name + " is connected to)");
    const plain = useAboveTip<HTMLSpanElement>(text);
    return onFocus
        ? (
            <>
                <button
                    type="button"
                    {...button.props}
                    className={"card-tile-symbol card-tile-symbol-" + link.type}
                    aria-pressed={focusId === id}
                    aria-label={text + ", show only what " + name + " is connected to"}
                    onClick={onFocus}
                />
                {button.node}
            </>
        )
        : (
            <>
                <span
                    {...plain.props}
                    className={"card-tile-symbol card-tile-symbol-" + link.type}
                    role="img"
                    aria-label={text}
                />
                {plain.node}
            </>
        );
}

export interface CardTileProps {
    /** The card's id (the tile's `data-anchor`). */
    id: string;
    name: string;
    /** What an unnamed card is called. */
    unnamed?: string;
    /** The card's number in its list, said before its name where it has one. */
    number?: number;
    /** Which of its lines are LINKS (each opens what it names), and what a press on one does. */
    linkedLines?: readonly boolean[];
    onLine?: (index: number, pointer: boolean) => void;
    /** What the tile lists under its name. */
    lines: readonly string[];
    /** The mark of each line (a plain line has no bullet). */
    marks?: readonly (ItemMark | undefined)[];
    links?: readonly FloorLink[];
    tone: FloorTone;

    /** Keeps the hue of the card the tile stands in (see CardBox.own). */
    own?: boolean;

    /** Its lines are centred, with no bullets. */
    centred?: boolean;
    /** A finished card (a completed activity): the grey of everything completed. */
    inactive?: boolean;
    /** Not used yet (a subchannel the category offers): half transparent, as every tile with no card in it. */
    faded?: boolean;
    /** What the card lacks, when it is incomplete (CardCompleteness.ts): the tile glows red, flashing, and says so in its tooltip. */
    missing?: readonly string[];
    /** The tile's accessible name. */
    label: string;
    /** Pressing the tile. Without it the tile is only shown (a legal expense). */
    onOpen?: (pointer: boolean) => void;
    /** Where it grows from on hover (inwardOrigin). */
    origin?: string;
    /** A press on one of its circles. */
    focusId?: string | null;
    onFocus?: () => void;
    /** Its title where it differs from the tile's tooltip. */
    title?: string;
    /** A grid that orders its tiles by dragging one onto another. */
    drag?: {
        dragging: boolean;
        over: boolean;
        onDragStart: (event: DragEvent) => void;
        onDragOver: (event: DragEvent) => void;
        onDrop: (event: DragEvent) => void;
        onDragEnd: () => void;
    };
}

export default function CardTile({ id, name, unnamed = "", number, linkedLines, onLine, lines, marks, links = [], tone, own, centred, inactive, faded, missing, label, onOpen, origin, focusId, onFocus, title, drag }: CardTileProps) {
    const onCircle = useRef(false);
    const shown = name.trim() || unnamed;
    rememberCardName(id, shown);
    const style = { ...(tone === "legal" || own ? {} : { "--strategy-theme-hue": toneHue(tone) }), transformOrigin: origin } as CSSProperties;
    const className = "section-tile card-tile" +
        (tone === "channel" ? " section-tile-channel" : "") +
        (tone === "legal" ? " card-tile-legal" : "") +
        (centred ? " card-tile-centred" : "") +
        (inactive ? " section-tile-completed" : "");
    const linked = !!linkedLines && !!onLine && linkedLines.some(Boolean);
    // (A tile with linked lines draws its list in a layer of its own over the tile, as a page tile does: a line is a control, the tile's button cannot hold it.)
    const face = <TileFace title={(number !== undefined ? number + ". " : "") + shown} items={linked ? undefined : lines} marks={marks} />;
    return (
        <div
            className={"section-tile-slot card-tile-slot" + (faded ? " section-tile-slot-empty" : "") + (missing && missing.length > 0 ? " card-tile-incomplete" : "") + (drag ? " card-tile-movable" : "") + (drag?.dragging ? " card-tile-dragged" : "") + (drag?.over ? " card-tile-drop" : "")}
            style={style}
            draggable={drag ? true : undefined}
            // A press on a circle never starts a drag of the tile (the circle is a pointer, not a handle).
            onPointerDownCapture={(event) => { onCircle.current = !!(event.target as HTMLElement).closest?.(".card-tile-symbols"); }}
            onDragStart={drag ? (event) => { if (onCircle.current) { event.preventDefault(); } else { drag.onDragStart(event); } } : undefined}
            onDragOver={drag?.onDragOver}
            onDrop={drag?.onDrop}
            onDragEnd={drag?.onDragEnd}
        >
            {onOpen
                ? (
                    <button
                        type="button"
                        className={className}
                        data-own={own ? "" : undefined}
                        data-anchor={id}
                        data-card-box={id}
                        data-opens=""
                        aria-label={label}
                        aria-description={missing && missing.length > 0 ? incompleteTitle(missing) : undefined}
                        title={(title ?? shown) + (missing && missing.length > 0 ? ". " + incompleteTitle(missing) : "")}
                        onClick={(event) => onOpen(event.detail > 0)}
                    >
                        {face}
                    </button>
                )
                : <div className={className} data-anchor={id} data-card-box={id} role="group" aria-label={label} title={(title ?? shown) + (missing && missing.length > 0 ? ". " + incompleteTitle(missing) : "")}>{face}</div>}
            <Dots id={id} name={shown} links={links} focusId={focusId} onFocus={onFocus} />
            {linked && (
                <div className="section-tile-links-layer">
                    <TileList
                        items={lines}
                        marks={marks}
                        links={lines.map((_, at) => linkedLines?.[at] ? { card: String(at) } : undefined)}
                        title={shown}
                        onLink={(link, _from, pointer) => onLine?.(Number((link as { card: string }).card), pointer)}
                        onPlain={(event) => { (event.currentTarget as HTMLElement).closest(".section-tile-slot")?.querySelector<HTMLElement>(":scope > .section-tile")?.click(); }}
                    />
                </div>
            )}
        </div>
    );
}
