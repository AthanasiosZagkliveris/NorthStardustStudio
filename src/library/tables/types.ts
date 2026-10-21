/**
 * The tables of the app (docs/design/08-library-system.md): the Foundation Capability table
 * (systems 1-4: per system, page, chapter, master tile, view and card, card kind, the types,
 * categories, groups and options), the App table (the header, the landing page, the calendar
 * side panel) and the reference tables of the catalogue (components, reactions, fields,
 * functions), which the library replaces with coded assets.
 *
 * A table has a code (S, P, C, MT, V, K, T, CAT, G, O; H, L, CA; CO, R, F, FN) and rows; every row
 * has an id made of the code and a number, and a row points to another table by that id.
 */
export interface TableRow {
    id: string;
    [column: string]: string | number;
}

export interface TableData {
    code: string;
    title: string;
    note: string;
    columns: readonly string[];
    rows: readonly TableRow[];
}
