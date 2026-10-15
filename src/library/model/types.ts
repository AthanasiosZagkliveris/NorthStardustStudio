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
    LST: { name: "list", category: "component" },
    DIV: { name: "divider", category: "component" },
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

/**
 * The look an asset has by default: the most used one that the card scan measured. The text
 * hierarchy of the app is 14 (small), 18 (body), 24 (h3), 28 (h2) and 36 (h1); scale says where
 * the type size stands against it.
 */
export interface Look {
    /** null when the height follows the words. */
    height: number | null;
    /** Set where the height follows the words but is never less than this (a free text, a name cell). */
    minHeight?: number;
    /** Set where the width is part of the look (a square box); otherwise the width follows the layout. */
    width?: number;
    fontSize: number;
    fontWeight: string;
    corners: string;
    paddingLeft: number;
    paddingTop: number;
    border: number;
    /** "body 18", "small 14", or "off the scale: 16". */
    scale: string;
    /** How many of this look the scan found. */
    found: number;
}

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
    /** The default look of this variant, where it differs from the asset's. */
    look?: Look;
    /** The parts this variant has that differ from the main asset (a card kind's own fields, for example). */
    requires?: readonly Requirement[];
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
    /** The default look of the asset (the most used one measured). */
    look?: Look;
    /** The other looks measured: merged into the default (a few uses, within 2px) or kept (the owner decides). */
    lookNotes?: readonly string[];
    /** The measured contracts of src/library/assets that describe this asset (by their names), if there are any. */
    contracts?: readonly string[];
    /** The ids of the catalogue it was made from (docs/design/07-structure-tables.md). */
    catalogue: readonly string[];
}

/** The marker of a component placed in the app that is not in the library: Placement.asset is NEW: and the component's name (case 3 of docs/design/08-library-system.md). */
export const NOT_IN_LIBRARY = "NEW:";

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
