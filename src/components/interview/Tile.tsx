import { ButtonHTMLAttributes, HTMLAttributes, ReactNode, forwardRef } from "react";

type DataAttributes = { [name: `data-${string}`]: string | number | undefined };

/**
 * THE TILE: the slot (the grid item, which is what scales on hover and focus) with the tile's own control in it (a button; a plain box for a tile that opens nothing) and whatever the place puts after it, in its order: the list of what it includes (`TileLinks`), the link dots, the "+" (`TilePlus`), a period. Every tile of the app -- a page tile, a section tile of a dialog, a category's, a card's -- is drawn here, so a tile is always a slot holding its control: the slot's class and attributes (\`slot\`), the control's (the rest), its face (\`face\`: \`TileFace\`) and its picture.
 */
const Tile = forwardRef<HTMLDivElement, {
    frame: HTMLAttributes<HTMLDivElement> & DataAttributes;
    /** A plain box for a tile that opens nothing. */
    as?: "button" | "div";
    face: ReactNode;
    picture?: ReactNode;
    children?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children"> & DataAttributes>(function Tile({ frame, as = "button", face, picture, children, ...primary }, ref) {
    return (
        <div ref={ref} {...frame}>
            {as === "button"
                ? <button type="button" {...primary}>{face}{picture}</button>
                : <div {...(primary as HTMLAttributes<HTMLDivElement>)}>{face}</div>}
            {children}
        </div>
    );
});

export default Tile;
