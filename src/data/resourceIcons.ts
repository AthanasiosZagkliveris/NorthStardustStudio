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
