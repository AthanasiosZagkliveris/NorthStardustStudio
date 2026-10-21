/**
 * The rulebook's section on the assets, written from the asset contracts
 * (src/library): the parts, states, variants, numbers, accessibility needs,
 * known findings and uses of each asset. The contract is the one home of
 * these facts; the library runner measures the app against it, so this text
 * cannot say what the app does not do. Pure function; the script and the test
 * use it.
 */
import type { AssetContract } from "../../../src/library/contract.ts";

export const BEGIN = "<!-- generated:assets (from src/library; do not edit; run npm run docs:assets) -->";
export const END = "<!-- /generated:assets -->";

const cell = (text: string) => text.replace(/\|/g, "\|").replace(/\n/g, " ");

export function renderAsset(asset: AssetContract): string {
    const out: string[] = [];
    out.push("### " + asset.name, "");
    out.push(asset.summary, "");
    out.push("- **Kind:** " + asset.kind + ". **Code:** `" + asset.component.replace(/^\(|\)$/g, "") + "`. **Stylesheet:** `" + asset.stylesheet + "`" + (asset.alsoStylesheets?.length ? " (also " + asset.alsoStylesheets.map(s => "`" + s + "`").join(", ") + ")" : "") + ".");
    out.push("- **Parts:** " + asset.parts.join("; ") + ".");
    out.push("- **States:** " + asset.states.join(", ") + ".");
    out.push("- **Used in:** " + asset.uses.join("; ") + ".");
    out.push("- **Custom properties it reads:** " + asset.tokens.map(t => "`" + t + "`").join(", ") + ".");
    out.push("", "| Variant | Where | Note |", "|---|---|---|");
    for (const variant of asset.variants) out.push("| " + cell(variant.id) + (variant.fontSizePx ? " (" + variant.fontSizePx + "px label)" : "") + " | " + cell(variant.context) + " | " + cell(variant.note) + " |");
    out.push("", "| Number | Value |", "|---|---|");
    for (const [name, value] of Object.entries(asset.geometry)) out.push("| " + name + " | " + String(Math.round(value * 1e4) / 1e4) + " |");
    if (asset.sizes) {
        out.push("", "**Sizes by screen class** (one custom property each; the same in every class until the owner sets them apart):", "", "| Use | Property | Tablet | Laptop | Desktop |", "|---|---|---|---|---|");
        for (const row of asset.sizes) {
            const value = (n: number) => n + row.unit;
            out.push("| " + cell(row.use + (row.note ? " (" + row.note + ")" : "")) + " | " + (row.token ? "`" + row.token + "`" : "(none yet)") + " | " + value(row.values.tablet) + " | " + value(row.values.laptop) + " | " + value(row.values.desktop) + " |");
        }
    }
    if (asset.anatomy) {
        out.push("", "**From top to bottom:**", "");
        asset.anatomy.forEach((part, index) => out.push((index + 1) + ". **" + part.part + "**" + (part.gapAbove ? " (" + part.gapAbove.px + "px above, `" + part.gapAbove.token + "`)" : "") + ": " + part.note));
    }
    out.push("", "**Accessibility.** " + (asset.accessibility.focusRing ? "Keyboard focus is shown by a ring or outline." : "Keyboard focus is shown by the asset's own fill; no ring or outline.") + " Name: " + asset.accessibility.accessibleName + ". Contrast it must hold:");
    for (const need of asset.accessibility.contrast) out.push("- " + need.ink + " (" + need.ground + "): at least " + need.min + ":1.");
    if (asset.accessibility.criteria) {
        out.push("", "**WCAG 2.2 criteria it must meet:**");
        for (const criterion of asset.accessibility.criteria) out.push("- **" + criterion.id + " " + criterion.name + ".** " + criterion.how);
    }
    if (asset.knownFindings) {
        out.push("", "**Known findings** (measured, not changed; to decide):");
        for (const [key, text] of Object.entries(asset.knownFindings)) out.push("- `" + key + "`: " + text);
    }
    out.push("");
    return out.join("\n");
}

export function renderAssets(assets: readonly AssetContract[]): string {
    return [
        BEGIN,
        "",
        "Written from the asset contracts in `src/library`; the library runner (`npm run library`) measures the app against them in light, dark and sepia at 768, 1440 and 1920 px wide. A number here is the contract's, so it is the app's.",
        "",
        ...assets.map(renderAsset),
        END
    ].join("\n");
}
