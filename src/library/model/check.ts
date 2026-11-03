import { KINDS, NOT_IN_LIBRARY, type Library, type Placement } from "./types.ts";

export const ASSET_CODE = /^([A-Z]{3})\.(\d{3})$/;
export const VARIANT_CODE = /^([A-Z]{3})\.([A-Z]{3})\.(\d{3})\.(\d{3})$/;
export const VARIABLE_CODE = /^VAR\d{3}$/;

/** The components placed in the app that are not in the library (case 3), by their name. */
export const driftOf = (placements: readonly Placement[]): Placement[] => placements.filter(p => p.asset.startsWith(NOT_IN_LIBRARY));

const normal = (text: string) => text.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * The checks of the library (docs/design/library/08-library-system.md): every code well formed
 * and unique, every asset unique by its category and name, every variable and value
 * named and described, every variant an edit of its own asset with values of the
 * asset's variables, every requirement and placement pointing at something that exists.
 * Returns the list of problems; an empty list is a sound library.
 */
export function checkLibrary(library: Library, placements: readonly Placement[] = []): string[] {
    const problems: string[] = [];
    const variables = new Map<string, (typeof library.variables)[number]>();
    for (const variable of library.variables) {
        if (!VARIABLE_CODE.test(variable.code)) problems.push("variable code is not VAR and three digits: " + variable.code);
        if (variables.has(variable.code)) problems.push("variable code used twice: " + variable.code);
        variables.set(variable.code, variable);
        if (!variable.name.trim()) problems.push(variable.code + ": a variable needs a name");
        if (!variable.description.trim()) problems.push(variable.code + ": a variable needs a description");
        if (variable.values.length === 0) problems.push(variable.code + ": a variable needs values");
        const seen = new Set<string>();
        for (const value of variable.values) {
            if (!value.name.trim()) problems.push(variable.code + ": a value needs a name");
            if (!value.description.trim()) problems.push(variable.code + " = " + value.name + ": a value needs a description");
            if (seen.has(normal(value.name))) problems.push(variable.code + ": value named twice: " + value.name);
            seen.add(normal(value.name));
        }
    }

    const assets = new Map<string, (typeof library.assets)[number]>();
    const unique = new Map<string, string>();
    const variantCodes = new Set<string>();
    for (const asset of library.assets) {
        const match = ASSET_CODE.exec(asset.code);
        if (!match) { problems.push("asset code is not three capital letters, a dot and three digits: " + asset.code); continue; }
        if (assets.has(asset.code)) problems.push("asset code used twice: " + asset.code);
        assets.set(asset.code, asset);
        const kind = KINDS[match[1] as keyof typeof KINDS];
        if (!kind) problems.push(asset.code + ": the letters " + match[1] + " are not a kind of asset");
        else if (kind.category !== asset.category) problems.push(asset.code + ": the letters " + match[1] + " are " + kind.category + " assets, not " + asset.category);
        const key = asset.category + "|" + normal(asset.name);
        if (unique.has(key)) problems.push("asset is not unique: " + asset.code + " and " + unique.get(key) + " are both " + asset.category + " " + asset.name);
        unique.set(key, asset.code);
        if (!asset.name.trim()) problems.push(asset.code + ": an asset needs a name");
        if (!asset.summary.trim()) problems.push(asset.code + ": an asset needs a summary");
        for (const code of asset.variables) if (!variables.has(code)) problems.push(asset.code + ": variable " + code + " does not exist");

        const letters = new Set<string>();
        asset.variants.forEach((variant, index) => {
            const m = VARIANT_CODE.exec(variant.code);
            if (!m) { problems.push(asset.code + ": variant code is not asset letters, variant letters, asset number, variant number: " + variant.code); return; }
            if (m[1] !== match[1] || m[3] !== match[2]) problems.push(variant.code + ": belongs to " + m[1] + "." + m[3] + ", not to " + asset.code);
            if (Number(m[4]) !== index + 1) problems.push(variant.code + ": the variant number should be " + String(index + 1).padStart(3, "0") + " (variants are numbered in order)");
            if (variantCodes.has(variant.code)) problems.push("variant code used twice: " + variant.code);
            variantCodes.add(variant.code);
            if (letters.has(m[2])) problems.push(asset.code + ": the variant letters " + m[2] + " are used twice");
            letters.add(m[2]);
            if (!variant.name.trim()) problems.push(variant.code + ": a variant needs a name");
            if (!variant.description.trim()) problems.push(variant.code + ": a variant needs a description");
            if (!variant.edits.trim()) problems.push(variant.code + ": a variant must say what it edits in the main asset");
            for (const [code, valueName] of Object.entries(variant.values)) {
                const variable = variables.get(code);
                if (!variable) problems.push(variant.code + ": variable " + code + " does not exist");
                else if (!asset.variables.includes(code)) problems.push(variant.code + ": variable " + code + " is not a variable of " + asset.code);
                else if (!variable.values.some(value => normal(value.name) === normal(valueName))) problems.push(variant.code + ": " + valueName + " is not a value of " + code);
            }
        });
    }

    for (const asset of library.assets) {
        const needs = [...asset.requires, ...asset.variants.flatMap(variant => variant.requires ?? [])];
        for (const need of needs) {
            const target = assets.get(need.asset);
            if (!target) { problems.push(asset.code + ": requires " + need.asset + ", which does not exist"); continue; }
            if (need.variant && !target.variants.some(variant => variant.code === need.variant)) problems.push(asset.code + ": requires " + need.variant + ", which is not a variant of " + need.asset);
            if (!need.role.trim()) problems.push(asset.code + ": a requirement of " + need.asset + " needs a role");
        }
    }
    // The families and groups: every component has a group, and what a level shares is shared by its components.
    const groups = new Map<string, { family: (typeof library.families & {})[number]; group: (typeof library.families & {})[number]["groups"][number] }>();
    for (const family of library.families ?? []) {
        if (!/^[A-Z]{3,5}$/.test(family.code)) problems.push("family code is not three to five capital letters: " + family.code);
        for (const group of family.groups) {
            if (!group.code.startsWith(family.code + ".")) problems.push("group " + group.code + " does not start with its family code " + family.code);
            if (groups.has(group.code)) problems.push("group code used twice: " + group.code);
            groups.set(group.code, { family, group });
            if (!group.name.trim() || !group.description.trim()) problems.push(group.code + ": a group needs a name and a description");
        }
        if (!family.name.trim() || !family.description.trim() || family.characteristics.length === 0) problems.push(family.code + ": a family needs a name, a description and its characteristics");
    }
    if (library.families) {
        for (const asset of library.assets) {
            if (asset.category !== "component" && !asset.group) continue;
            const home = asset.group ? groups.get(asset.group) : undefined;
            if (!home) { problems.push(asset.code + ": a component needs a group of a family" + (asset.group ? " (" + asset.group + " does not exist)" : "")); continue; }
            const shared = { ...home.family.shared, ...home.group.shared } as Record<string, string | number>;
            const looks = [["", asset.look], ...asset.variants.map(v => [v.code, v.look] as const)] as const;
            for (const [code, look] of looks) {
                if (!look) continue;
                for (const [key, value] of Object.entries(shared)) {
                    const have = (look as unknown as Record<string, string | number>)[key];
                    if (have !== value) problems.push((code || asset.code) + ": " + key + " is " + have + ", but every component of " + home.group.code + " shares " + value);
                }
            }
        }
    }
    for (const placement of placements) {
        if (placement.asset.startsWith(NOT_IN_LIBRARY)) continue; // case 3: a drift, listed by driftOf, not an error
        const target = assets.get(placement.asset);
        if (!target) { problems.push("placement of " + placement.asset + " in " + placement.system + ": the asset is not in the library"); continue; }
        if (placement.variant && !target.variants.some(variant => variant.code === placement.variant)) problems.push("placement of " + placement.variant + ": not a variant of " + placement.asset);
    }
    return problems;
}
