import { CSSProperties, ReactNode, useContext, useSyncExternalStore } from "react";

import TileGrid from "./TileGrid.tsx";
import { freshCards } from "./freshCards.ts";
import { OpenCardContext } from "./SectionTiles.tsx";
import { inwardOrigin } from "./CardTile.tsx";
import { AddTile } from "./SectionView.tsx";
import type { CardBoxAdd } from "./CardBoxes.tsx";

import "../../styles/section-tiles.css";

/** One box of a dialog's grid that is a PICTURE: a colour, a typeface, an image. */
export interface PictureBox {

    id: string;

    /** The box's name for assistive technology: "Colour 1: Loom Indigo". */
    label: string;

    /** Its extra classes (an image's box). */
    className?: string;

    /** The box's ground (a colour, or an image: `background`), and the ink its texts take. */
    style?: CSSProperties;

    /** What is drawn on the box: its texts. */
    children: ReactNode;

    /** Its place in a grid whose boxes keep their places (the Colours: a column for each of Primary, Secondary and Neutral, its A over its B). */
    cell?: { column: number; row: number };

    /** What the card behind it still lacks (SystemCardCompleteness.ts): the box glows red, flashing, while the card has something written and is not complete. */
    missing?: readonly string[];

}

/**
 * THE BOXES OF A DIALOG THAT ARE PICTURES (the Brand's colours, typefaces and images): the page's tile -- its size, its edge, its hover -- covered by what
 * the card holds. Pressing one closes the dialog and opens THAT card floating on its section part of the page (OpenCardContext), as a card tile does; the
 * add box (dashed, last) adds a card and opens it at once.
 */
export default function PictureBoxes({ items, label, add, columns, addCell }: { items: readonly PictureBox[]; label: string; add?: CardBoxAdd; /** The columns the boxes' own places (`cell`) divide the grid into, while the window has the room for them all. */ columns?: number; /** Where the add box stands: the place of the box it will add. */ addCell?: { column: number; row: number } }) {

    const openCard = useContext(OpenCardContext);
    useSyncExternalStore(freshCards.subscribe, freshCards.snapshot);
    const rows = Math.max(1, ...items.map(item => item.cell?.row ?? 1));

    return (
        <TileGrid label={label} className="picture-boxes" columns={columns}>
            {({ across, placed }) => (
            <>
                {items.map((item, index) => (
                    <div key={item.id} className={"section-tile-slot" + (item.missing && item.missing.length > 0 && !freshCards.has(item.id) ? " card-tile-incomplete" : "")} style={{ transformOrigin: placed && item.cell ? inwardOrigin((item.cell.row - 1) * across + item.cell.column - 1, rows * across, across) : inwardOrigin(index, items.length, across), ...(placed && item.cell ? { gridColumn: item.cell.column, gridRow: item.cell.row } : {}) }}>
                        <button
                            type="button"
                            className={"section-tile picture-box" + (item.className ? " " + item.className : "")}
                            aria-label={item.label}
                            data-card-box={item.id}
                            style={item.style}
                            onClick={(event) => openCard?.(item.id, undefined, undefined, event.detail > 0, false)}
                        >
                            {item.children}
                        </button>
                    </div>
                ))}
                {add && (
                    <AddTile
                        label={add.label}
                        disabled={add.disabled}
                        across={across}
                        column={placed ? addCell?.column : undefined}
                        row={placed ? addCell?.row : undefined}
                        onAdd={(pointer) => {
                            if (openCard) {
                                openCard(add.onAdd(), undefined, add, pointer, true);
                            }
                        }}
                    />
                )}
    </>
    )}
        </TileGrid>
    );

}
