/**
 * The model of the assets library (docs/design/08-library-system.md).
 *
 * An asset has a code: three capital letters for its kind, a dot and a three-digit
 * number in the order it was created (BTN.001: the first button). A variant is an
 * edited version of its asset and has a code of the asset's letters, the variant's
 * letters, the asset's number and the variant's number (BTN.DLT.001.001: the first
 * variant, Delete, of BTN.001). A variable is a named property with a fixed list of
 * values; every variable and every value has a name and a description.
 */

export type AssetCategory = "component" | "field" | "card" | "tile" | "frame";

/** The letters of the kinds of asset, and the category each belongs to (the owner approved the list, 2026-10-15). */
export const KINDS = {
    BTN: { name: "button", category: "component" },
    DRP: { name: "dropdown", category: "component" },
    TIK: { name: "tick box", category: "component" },
    TXT: { name: "text input", category: "component" },
    NUM: { name: "number box", category: "component" },
    DAT: { name: "date cell", category: "component" },
    LBL: { name: "label", category: "component" },
    ARW: { name: "arrow", category: "component" },
    RAL: { name: "rail", category: "component" },
    BUL: { name: "bullet", category: "component" },
    FLD: { name: "field", category: "field" },
    TIL: { name: "tile", category: "tile" },
    CRD: { name: "card", category: "card" },
    FRM: { name: "frame", category: "frame" }
} as const satisfies Record<string, { name: string; category: AssetCategory }>;

export type KindLetters = keyof typeof KINDS;

/** One value a variable can take. */
export interface VariableValue {
    name: string;
    description: string;
}

/** A named property of an asset with a fixed list of values. Code: VAR and three digits. */
export interface Variable {
    code: string;
    name: string;
    description: string;
    values: readonly VariableValue[];
}

/** An edited version of the main asset. */
export interface Variant {
    /** BTN.DLT.001.001 */
    code: string;
    name: string;
    description: string;
    /** What this variant edits in the main asset, in plain words. */
    edits: string;
    /** The value of each variable this variant fixes (variable code -> value name). */
    values: Readonly<Record<string, string>>;
}

/** A part an asset is made of: another asset, in a variant, in a role. */
export interface Requirement {
    asset: string;
    variant?: string;
    role: string;
}

export interface Asset {
    /** BTN.001 */
    code: string;
    name: string;
    category: AssetCategory;
    summary: string;
    /** The variables of the asset (variable codes). */
    variables: readonly string[];
    variants: readonly Variant[];
    requires: readonly Requirement[];
    /** The measured contract of src/library/assets this asset is described by, if there is one. */
    contract?: string;
    /** The ids of the catalogue it was made from (docs/design/07-structure-tables.md). */
    catalogue: readonly string[];
}

/** Where an asset stands in the app: a card, under a chapter, a page, a system. */
export interface Placement {
    asset: string;
    variant?: string;
    system: string;
    page?: string;
    chapter?: string;
    tile?: string;
    card?: string;
    position?: number;
}

export interface Library {
    variables: readonly Variable[];
    assets: readonly Asset[];
}

/** One line of the library log: every change to an asset (added, edited, placed, moved, removed). */
export interface LibraryLogEntry {
    date: string;
    asset: string;
    change: "added" | "edited" | "placed" | "moved" | "removed";
    what: string;
    /** Where it is placed, or from where to where it moved, or where it was removed from. */
    where?: string;
}

/** One line of the app structure log: every change of the tables. */
export interface AppLogEntry {
    date: string;
    change: "placed" | "moved" | "removed" | "edited";
    where: string;
    asset?: string;
    /** True when the asset is not in the library (case 3 of docs/design/08-library-system.md). */
    notInLibrary: boolean;
    what: string;
}
