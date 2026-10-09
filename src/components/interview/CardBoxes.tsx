import { ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { OpenCardContext } from "./SectionTiles.tsx";
import CardTile, { inwardOrigin, pageTileSide, useTilesAcross } from "./CardTile.tsx";
import { AddTile } from "./SectionView.tsx";
import type { FloorLink, FloorTone } from "./capabilityFloor.ts";

import "../../styles/section-tiles.css";

/** One card of a list, drawn as a CARD TILE (CardTile.tsx) until it is opened. */
export interface CardBox {

    id: string;

    /** The card's number in its list. */
    number: number;

    /** The card's name as written ("" while unnamed). */
    name: string;

    /** What an unnamed card is called: "Unnamed resource". */
    unnamed: string;

    /** One muted line (the folded card's summary): the tile's one line where it has no more to say. */
    summary?: string;

    /** What the tile lists under its name: where it belongs, its status and its cost (the same lines as in All Tiles). */
    lines?: readonly string[];

    /** Its links to other cards, one circle each. */
    links?: readonly FloorLink[];

    /** The colour of the section it stands in. */
    tone?: FloorTone;

    /** A finished card (a completed activity): drawn grey. */
    inactive?: boolean;

    /** What the card lacks, when it is incomplete: the tile glows red. */
    missing?: readonly string[];

    /** The card itself, fully editable, drawn only while its box is open. */
    content: () => ReactNode;

}

/** What a list can add: a half-size box after the last card. */
export interface CardBoxAdd {

    /** What is added, lower case: "resource" (the box reads "Add resource"). */
    label: string;

    disabled?: boolean;

    /** Creates a blank card and returns its id (it is opened at once). */
    onAdd: () => string;

    /** True while the card still holds nothing the user wrote. */
    isBlank: (id: string) => boolean;

    /** Removes these cards (blank ones left behind). */
    onRemove: (ids: string[]) => void;

}

/**
 * A LIST OF CARDS AS CARD TILES (docs/ai/layout-rules.md, "Card tiles").
 *
 * Each card is a CardTile -- the one tile of the All Tiles overlay: its number and name, where it belongs, its status and cost, a circle per link,
 * 215px; pressing it closes the dialog and opens THAT card as a FLOATING card on its section part of the page (OpenCardContext) -- the grid only lets
 * the user choose; a card is never shown inside the dialog. A list with nothing in it makes ONE new blank card and opens it floating, its name focused;
 * left while it is still completely blank, the card is removed again. The add box (dashed, half the side, last in the flow) adds a card and opens it at once.
 */
export default function CardBoxes({

    items,

    label,

    what,

    add,

    onReorder,

    className

}: {

    items: readonly CardBox[];
    /** What the boxes are, for assistive technology: "Resources". */
    label: string;
    /** One card, for assistive technology: "Resource". */
    what: string;
    add?: CardBoxAdd;
    /**
     * A list the user orders (the activities): a tile can be DRAGGED onto another to move it there (the cards are
     * renumbered). Pressing a tile still opens its card.
     */
    onReorder?: (from: number, to: number) => void;
    /** On the list's root (the grid, or the open card): the grey of the finished ones. */
    className?: string;

}) {

    const openCard = useContext(OpenCardContext);
    // The tile being dragged and the one it is over.
    const [drag, setDrag] = useState<{ from: number; over: number | null } | null>(null);

    const root = useRef<HTMLDivElement | null>(null);
    const grid = useRef<HTMLDivElement | null>(null);
    const latest = useRef({ items, add });
    latest.current = { items, add };

    // A new blank card is opened floating; left completely blank, the floating card's closing takes it away again.
    const create = (pointer = false) => {
        const adder = latest.current.add;
        if (!adder || !openCard) {
            return;
        }
        const id = adder.onAdd();
        openCard(id, undefined, adder, pointer, true);
    };

    // A list with nothing in it makes one blank card and opens it (once: the guard survives a strict-mode remount).
    const started = useRef(false);
    useEffect(() => {
        if (!started.current && items.length === 0 && add) {
            started.current = true;
            create();
        }
        // On opening only.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // The page's own tile size, and as many across as fit: a tile grows inwards.
    const side = useMemo(pageTileSide, []);
    const across = useTilesAcross(grid, side);

    return (
        <div className={"card-boxes" + (className ? " " + className : "")} ref={root}>
            <div
                ref={grid}
                className="section-tiles card-tile-grid"
                role="group"
                aria-label={label}
                style={{ "--section-tile-size": side + "px", gridTemplateColumns: "repeat(" + across + ", " + side + "px)", maxWidth: "none" } as CSSProperties}
            >
                {items.map((item, index) => {
                    const name = item.name.trim() || item.unnamed;
                    return (
                        <CardTile
                            key={item.id}
                            id={item.id}
                            name={item.name}
                            unnamed={item.unnamed}
                            number={item.number}
                            lines={item.lines ?? (item.summary && item.summary.trim().length > 0 ? [item.summary] : [])}
                            links={item.links}
                            tone={item.tone ?? "infrastructure"}
                            inactive={item.inactive}
                            missing={item.missing}
                            label={what + " " + item.number + ": " + name}
                            origin={inwardOrigin(index, items.length, across)}
                            onOpen={(pointer) => openCard?.(item.id, undefined, undefined, pointer, false)}
                            drag={onReorder ? {
                                dragging: drag?.from === index,
                                over: !!drag && drag.over === index && drag.from !== index,
                                onDragStart: (event) => {
                                    // (Some browsers refuse to start a drag without data.)
                                    event.dataTransfer.setData("text/plain", String(index));
                                    event.dataTransfer.effectAllowed = "move";
                                    setDrag({ from: index, over: null });
                                },
                                onDragOver: (event) => {
                                    if (drag) {
                                        event.preventDefault();
                                        event.dataTransfer.dropEffect = "move";
                                        setDrag(current => current && current.over !== index ? { ...current, over: index } : current);
                                    }
                                },
                                onDrop: (event) => {
                                    event.preventDefault();
                                    if (drag && drag.from !== index) {
                                        onReorder(drag.from, index);
                                    }
                                    setDrag(null);
                                },
                                onDragEnd: () => setDrag(null)
                            } : undefined}
                        />
                    );
                })}
                {add && <AddTile label={add.label} disabled={add.disabled} across={across} onAdd={(pointer) => create(pointer)} />}
            </div>
        </div>
    );

}
