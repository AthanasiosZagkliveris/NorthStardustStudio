import { CSSProperties, ReactNode, useMemo, useRef } from "react";

import { pageTileSide, useTilesAcross } from "./CardTile.tsx";

import "../../styles/section-tiles.css";

/**
 * THE TILE GRID of a dialog or page view (a section's tiles, a category's, a group's, a picture's boxes): the page's own tile size, as many across as fit, the tiles growing inwards (`inwardOrigin`). It draws the grid's box and gives its tiles the number across; the tiles are `children`, a function of it. `columns` is for a grid whose boxes keep their places: while the window has room for all those columns, they are the number across (`placed`); with less room the boxes follow one another.
 */
export default function TileGrid({ label, className, columns, children }: {
    label: string;
    /** Added to the grid's outer `card-boxes` box. */
    className?: string;
    columns?: number;
    children: (grid: { across: number; placed: boolean }) => ReactNode;
}) {
    const grid = useRef<HTMLDivElement | null>(null);
    const side = useMemo(pageTileSide, []);
    const fitting = useTilesAcross(grid, side);
    const placed = columns !== undefined && fitting >= columns;
    const across = placed ? columns : fitting;
    return (
        <div className={"card-boxes" + (className ? " " + className : "")}>
            <div
                ref={grid}
                className="section-tiles card-tile-grid"
                role="group"
                aria-label={label}
                style={{ "--section-tile-size": side + "px", gridTemplateColumns: "repeat(" + across + ", " + side + "px)", maxWidth: "none" } as CSSProperties}
            >
                {children({ across, placed })}
            </div>
        </div>
    );
}
