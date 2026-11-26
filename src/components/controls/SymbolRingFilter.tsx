/**
 * THE GLOW ALONG A ROUGH OUTLINE ROUND A SYMBOL UNDER THE POINTER (owner, 2026-11-27 00:57 UTC+2: "Around eash icon's silhouette let 2 px gap and after that gap create a wire";
 * 01:07: "Make the outline 1 px ... Increase the gap to 3 px or make the outline more smooth and organic without all the details"; 01:17: "Fix also the marked
 * parts"; 01:23: "blue mark - needs some space; red mark - the opposite, needs to follow a bit more the silhouette. The idea is to get a rough outliner, and place
 * the glow there"): one filter for the whole app, used by every symbol's wire (TileParts, SymbolGlow; 01-tiles-and-dialog.css).
 *
 * 1. A rough outline: the symbol's solid shape with its small hollows bridged (grown, then shrunk back: the gap between a plug's prongs, a wrench's jaw, the room
 *    between two wheels, up to 10px across), so the wire passes over them and keeps to the larger hollows (between a head and a gear).
 * 2. The wire: that outline grown by 3px and by 4px, each growth rounded (three growths, wide, tall and square, then softened and cut back at its middle, which keeps
 *    the distance and rounds the corners); the band between them is a 1px wire 3px clear of the outline everywhere, at a corner or a line's end too.
 * 3. The glow: the wire softened; only the glow is drawn, the wire itself hidden (01:27: "Can you improve a bit the outliner shapes, hide the line and keep only
 *    the glow effect?"); the outline is a little rounder for it.
 * The wire and its glow take the card's ink from the symbol itself (the outline spread wide, kept only where they are). Sizes are in CSS pixels.
 */
const BRIDGE = 5;
// (The outline 2px out: owner, 01:41, "tight it 1 px inwards"; it was 3px.)
const GAP = 2, WIRE = 1;
// (The glow soft and wide, owner 01:35: "Blur it more, but it should not effect the icons"; brought up to keep its strength.)
// (Softer again, 01:44: "blur further the glow".)
const ROUND = 2.2, GLOW = 4.5, GLOW_STRENGTH = 7;

function Grown({ by, name }: { by: number; name: string }) {
    const near = (by * 0.414).toFixed(2), corner = (by * 0.707).toFixed(2);
    return (
        <>
            <feMorphology in="bridged" operator="dilate" radius={`${by} ${near}`} result={name + "-wide"} />
            <feMorphology in="bridged" operator="dilate" radius={`${near} ${by}`} result={name + "-tall"} />
            <feMorphology in="bridged" operator="dilate" radius={`${corner} ${corner}`} result={name + "-square"} />
            <feMerge result={name + "-merged"}>
                <feMergeNode in={name + "-wide"} />
                <feMergeNode in={name + "-tall"} />
                <feMergeNode in={name + "-square"} />
            </feMerge>
            <feGaussianBlur in={name + "-merged"} stdDeviation={ROUND} result={name + "-soft"} />
            {/* (Cut back at the middle of the softened edge, so the growth keeps its distance: 0 under 37.5% opacity, full over 62.5%.) */}
            <feComponentTransfer in={name + "-soft"} result={name}>
                <feFuncA type="linear" slope="4" intercept="-1.5" />
            </feComponentTransfer>
        </>
    );
}

export default function SymbolRingFilter() {
    return (
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
            <filter id="symbol-ring" x="-100%" y="-100%" width="300%" height="300%" colorInterpolationFilters="sRGB">
                <feMorphology in="SourceAlpha" operator="dilate" radius={BRIDGE} result="closing" />
                <feMorphology in="closing" operator="erode" radius={BRIDGE} result="bridged" />
                <Grown by={GAP + WIRE} name="outer" />
                <Grown by={GAP} name="inner" />
                <feComposite in="outer" in2="inner" operator="out" result="band" />
                {/* (Only the glow is drawn, the wire itself hidden: owner, 01:27, "hide the line and keep only the glow effect". Softened, then brought up so its
                    middle is nearly full.) */}
                <feGaussianBlur in="band" stdDeviation={GLOW} result="halo" />
                <feComponentTransfer in="halo" result="bright">
                    <feFuncA type="linear" slope={GLOW_STRENGTH} intercept="0" />
                </feComponentTransfer>
                {/* (Never over the drawing itself: the glow is cut where the symbol stands.) */}
                <feComposite in="bright" in2="SourceAlpha" operator="out" result="lit" />
                <feMorphology in="SourceGraphic" operator="dilate" radius="24" result="ink" />
                <feComposite in="ink" in2="lit" operator="in" />
            </filter>
        </svg>
    );
}
