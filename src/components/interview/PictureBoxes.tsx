import { CSSProperties, ReactNode, useContext, useMemo, useRef } from "react";

import { OpenCardContext } from "./SectionTiles.tsx";
import { pageTileSide, useTilesAcross, inwardOrigin } from "./CardTile.tsx";
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

}

/**
 * THE BOXES OF A DIALOG THAT ARE PICTURES (the Brand's colours, typefaces and images): the page's tile -- its size, its edge, its hover -- covered by what
 * the card holds. Pressing one closes the dialog and opens THAT card floating on its section part of the page (OpenCardContext), as a card tile does; the
 * add box (dashed, last) adds a card and opens it at once.
 */
export default function PictureBoxes({ items, label, add }: { items: readonly PictureBox[]; label: string; add?: CardBoxAdd }) {

    const openCard = useContext(OpenCardContext);
    const grid = useRef<HTMLDivElement | null>(null);
    const side = useMemo(pageTileSide, []);
    const across = useTilesAcross(grid, side);

    return (
        <div className="card-boxes picture-boxes">
            <div
                ref={grid}
                className="section-tiles card-tile-grid"
                role="group"
                aria-label={label}
                style={{ "--section-tile-size": side + "px", gridTemplateColumns: "repeat(" + across + ", " + side + "px)", maxWidth: "none" } as CSSProperties}
            >
                {items.map((item, index) => (
                    <div key={item.id} className="section-tile-slot" style={{ transformOrigin: inwardOrigin(index, items.length, across) }}>
                        <button
                            type="button"
                            className={"section-tile picture-box" + (item.className ? " " + item.className : "")}
                            aria-label={item.label}
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
                        onAdd={(pointer) => {
                            if (openCard) {
                                openCard(add.onAdd(), undefined, add, pointer, true);
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );

}
