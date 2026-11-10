import { CSSProperties, ReactNode, useLayoutEffect, useMemo, useRef, useState } from "react";

import { TILE_GAP, pageTileSide, useTilesAcross } from "./CardTile.tsx";

import "../../../styles/section-tiles.css";

/**
 * THE TILE GRID of a dialog or page view (a section's tiles, a category's, a group's, a picture's boxes): the page's own tile size, as many across as fit, the tiles growing inwards (`inwardOrigin`). It draws the grid's box and gives its tiles the number across; the tiles are `children`, a function of it. `threeAcross` sizes the tiles to the card they stand in: three across, however wide it is (the Strategy cards' Goals, Objectives and Metrics), the tile a third of the width less the two gaps. `columns` is for a grid whose boxes keep their places: while the window has room for all those columns, they are the number across (`placed`); with less room the boxes follow one another.
 */
export default function TileGrid({ label, className, columns, threeAcross = false, bare = false, fill = false, children }: {
    label: string;
    /** Added to the grid's outer `card-boxes` box. */
    className?: string;
    columns?: number;
    threeAcross?: boolean;
    /** Only the grid's own box, with no `card-boxes` box round it and the columns left to the stylesheet (the Inventory's grid, in its own scroll). */
    bare?: boolean;
    /** The tiles, as many across as fit at the page's size, grow to fill the row to its last pixel (the Inventory: its last tile 12px before the bar; owner, 2026-11-10). */
    fill?: boolean;
    children: (grid: { across: number; placed: boolean }) => ReactNode;
}) {
    const grid = useRef<HTMLDivElement | null>(null);
    const pageSide = useMemo(pageTileSide, []);
    const fitting = useTilesAcross(grid, pageSide);
    const [fitSide, setFitSide] = useState<number | null>(null);
    useLayoutEffect(() => {
        const node = grid.current;
        if (!(threeAcross || fill) || !node) {
            return;
        }
        const measure = () => {
            if (fill) {
                const across = Math.max(1, Math.floor((node.clientWidth + TILE_GAP) / (pageSide + TILE_GAP)));
                setFitSide((node.clientWidth - (across - 1) * TILE_GAP) / across - 0.01);
            } else {
                setFitSide(Math.max(72, Math.floor((node.clientWidth - 2 * TILE_GAP) / 3)));
            }
        };
        measure();
        if (typeof ResizeObserver === "undefined") {
            return;
        }
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        return () => observer.disconnect();
    }, [threeAcross, fill, pageSide]);
    const side = (threeAcross || fill) && fitSide ? fitSide : pageSide;
    const placed = !threeAcross && columns !== undefined && fitting >= columns;
    const across = threeAcross ? 3 : placed ? columns : fitting;
    const box = (
        <div
            ref={grid}
            className="section-tiles card-tile-grid"
            role="group"
            aria-label={label}
            style={(bare ? { "--section-tile-size": side + "px" } : { "--section-tile-size": side + "px", gridTemplateColumns: "repeat(" + across + ", " + side + "px)", maxWidth: "none" }) as unknown as CSSProperties}
        >
            {children({ across, placed })}
        </div>
    );
    return bare ? box : <div className={"card-boxes" + (className ? " " + className : "")}>{box}</div>;
}
