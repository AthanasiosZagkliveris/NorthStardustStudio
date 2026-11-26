/**
 * THE RESOURCES' SYMBOLS (owner, 2026-11-23 23:21 UTC+2, the responsive layout approved: docs/proposals/responsive-layout-2026-11-23.md, section 4.4): one
 * symbol for each of the nine Resource categories (approved 2026-11-26; Interface 11, section 11): one adaptive SVG each, its eight drawings (20 to 120px)
 * chosen inside the file by the size it is shown at. A Resources tile too small to list its categories shows these instead (TileList, data-symbols), and its
 * dialog where the titles do not fit, each named in its tooltip; drawn by SymbolMark in their card's hue (Interface 11, section 8.1), in Infrastructure and the Offering alike.
 *
 * Icons live in assets/resource-icons, one SVG per category, named after it ("documents-rights.svg" for "Documents & Rights").
 */
const iconFiles = import.meta.glob(
    "../assets/resource-icons/*.svg",
    {
        eager: true,
        import: "default"
    }
) as Record<string, string>;

/** The file name a category's symbol has: its words in lower case, joined by hyphens ("Materials & Inventory" -> "materials-inventory"). */
export function resourceIconName(category: string): string {
    return category.toLowerCase().replace(/&/g, " ").trim().split(/[^a-z0-9]+/).filter(Boolean).join("-");
}

/** The symbol of a Resource category, or undefined for a category of the founder's own. */
export function getResourceIcon(category: string): string | undefined {
    const name = resourceIconName(category);
    const found = Object.entries(iconFiles).find(([path]) => path.endsWith("/" + name + ".svg"));
    return found?.[1];
}

/**
 * A SYMBOL'S SOLID OUTLINE, for its glow (owner, 2026-11-27 00:31 UTC+2: "add the glowing effect only"; 2026-11-26 23:56: the glow outwards only, the symbol's inside
 * as at rest): the same drawing with its light fills made full, so the glow can be cut out wherever the symbol stands. Keyed by the symbol's own address.
 */
const iconTexts = import.meta.glob(
    "../assets/resource-icons/*.svg",
    {
        eager: true,
        query: "?raw",
        import: "default"
    }
) as Record<string, string>;

/*
 * (Every shape is filled solid, its inside too -- a frame's, a head's circle -- so the glow cut round it lights only the outer side of each line: owner, 2026-11-27
 * 00:46 UTC+2, "The glow should be along the lines, glowing outwards only! I cycle (head) should glow only outwards". The drawings' own masks are left as they are.)
 */
const SOLID = "<style>:is(path, circle, rect, ellipse, polygon):not(mask *) { fill: #000 !important; fill-opacity: 1 !important; }</style>";

const outlines = new Map(Object.entries(iconFiles).map(([path, src]) => [src, "data:image/svg+xml," + encodeURIComponent((iconTexts[path] ?? "").replace(/<svg\b[^>]*>/, open => open + SOLID))]));

/** The solid outline of a Resource symbol, from its address (getResourceIcon's), or undefined for any other picture. */
export function resourceIconOutline(src: string): string | undefined {
    return outlines.get(src);
}
