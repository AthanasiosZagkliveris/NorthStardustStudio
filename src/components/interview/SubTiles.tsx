import { CSSProperties, ReactNode, useContext, useMemo, useRef, useState } from "react";

import { InitialBoxContext, InnerLevel, OpenCardContext, TileFace, TileList, useDialogInnerBack, useDialogInnerStep, type ItemMark, type TileAdd, type TileLink } from "./SectionTiles.tsx";
import { Dots, inwardOrigin, pageTileSide, useTilesAcross } from "./CardTile.tsx";
import type { FloorLink } from "./capabilityFloor.ts";

import "../../styles/section-tiles.css";

/** What the carousel's left arrow asks of a dialog of sections it enters from the tile after it: open on its last section. */
export const LAST_SECTION = "@last";

/** One tile of a dialog that holds several sections (the Registrations': its three). */
export interface SubTile {

    id: string;

    /** Its name: a sub tile's title is one line (capitals, as every category tile's). */
    title: string;

    /** What it lists under its name. */
    items?: readonly string[];
    itemMarks?: readonly (ItemMark | undefined)[];

    /** For each line, the card it names: a press on the line opens that card. */
    links?: readonly (TileLink | undefined)[];

    /** Its circles (what it is linked to), at its lower left. */
    circles?: readonly FloorLink[];

    /** A card the tile stands for: pressing the tile opens that card, floating, instead of a section. */
    card?: string;

    /** A "+" at the tile's lower right adds a card and opens it, floating. */
    add?: TileAdd;

    /** The section, drawn only while the tile is open. */
    content: () => ReactNode;

}

/**
 * THE SECTIONS OF A DIALOG AS TILES (the Business System's category tiles, one level in): the dialog's grid shows a tile for each section; pressing one opens
 * that section in the dialog, with its name after the dialog's title and Back returning to the grid. Its lines may be links to cards.
 */
export default function SubTiles({ tiles, label }: { tiles: readonly SubTile[]; label: string }) {

    const initial = useContext(InitialBoxContext);
    // ("@last": the dialog was entered from the tile after it by the carousel's left arrow, so it opens on its last section.)
    const [openId, setOpenId] = useState<string | null>(initial === LAST_SECTION && tiles.length > 0 ? tiles[tiles.length - 1].id : initial && tiles.some(tile => tile.id === initial) ? initial : null);
    const open = tiles.find(tile => tile.id === openId) ?? null;
    const openCard = useContext(OpenCardContext);

    useDialogInnerBack(open ? () => setOpenId(null) : null, open?.title);
    // The carousel arrows go through these sections first (Formation, Tax, Additional requirements); past the last or the first they go on to the next tile of the page.
    // The arrows go round the sections only while one is open; the grid itself leaves for the page's next tile.
    useDialogInnerStep(open
        ? (direction) => {
            setOpenId(tiles[(tiles.findIndex(tile => tile.id === open.id) + direction + tiles.length) % tiles.length].id);
            return true;
        }
        : null,
        // (The rail follows the names of the dialog's sections while one is open.)
        open ? { items: tiles.map(tile => ({ id: tile.id, label: tile.title })), current: tiles.findIndex(tile => tile.id === open.id), go: (id: string) => setOpenId(id) } : null);

    const grid = useRef<HTMLDivElement | null>(null);
    const side = useMemo(pageTileSide, []);
    const across = useTilesAcross(grid, side);

    if (open) {
        return <InnerLevel>{open.content()}</InnerLevel>;
    }

    return (
        <div className="card-boxes">
            <div
                ref={grid}
                className="section-tiles card-tile-grid"
                role="group"
                aria-label={label}
                style={{ "--section-tile-size": side + "px", gridTemplateColumns: "repeat(" + across + ", " + side + "px)", maxWidth: "none" } as CSSProperties}
            >
                {tiles.map((tile, index) => (
                    <div
                        key={tile.id}
                        className="section-tile-slot card-tile-slot"
                        style={{ transformOrigin: inwardOrigin(index, tiles.length, across) }}
                    >
                        <button
                            type="button"
                            className="section-tile section-tile-category"
                            data-tile={tile.id}
                            data-opens=""
                            aria-haspopup="dialog"
                            aria-label={tile.title}
                            onClick={(event) => { if (tile.card) { openCard?.(tile.card, undefined, undefined, event.detail > 0, false); } else { setOpenId(tile.id); } }}
                        >
                            <TileFace title={tile.title} glyph={false} />
                        </button>
                        {tile.items && tile.items.length > 0 && (
                            <div className="section-tile-links-layer">
                                <TileList
                                    items={tile.items}
                                    marks={tile.itemMarks}
                                    links={tile.links}
                                    title={tile.title}
                                    onLink={(link, _from, pointer) => { if ("card" in link) { openCard?.(link.card, undefined, undefined, pointer, false); } }}
                                    onPlain={() => setOpenId(tile.id)}
                                />
                            </div>
                        )}
                        {tile.circles && tile.circles.length > 0 && <Dots id={tile.id} name={tile.title} links={tile.circles} />}
                        {tile.add && (
                            <button
                                type="button"
                                className="plus-box section-tile-plus"
                                aria-label={"Add " + tile.add.label.charAt(0).toUpperCase() + tile.add.label.slice(1) + " to " + tile.title}
                                disabled={tile.add.disabled}
                                onClick={(event) => { if (tile.add) { openCard?.(tile.add.onAdd(), undefined, undefined, event.detail > 0, true); } }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

}
