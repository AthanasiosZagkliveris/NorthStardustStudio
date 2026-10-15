import { foundationTables } from "./foundation.generated.ts";
import { appTables } from "./app.generated.ts";
import { referenceTables } from "./reference.generated.ts";
import type { TableData, TableRow } from "./types.ts";

export { foundationTables, appTables, referenceTables };
export type { TableData, TableRow };

/** Every table, by its code (S, P, C, MT, V, K, T, CAT, G, O, H, L, CA, CO, R, F, FN). */
export const tables: readonly TableData[] = [...foundationTables, ...appTables, ...referenceTables];

export function table(code: string): TableData {
    const found = tables.find(t => t.code === code);
    if (!found) throw new Error("no table " + code);
    return found;
}

export function row(code: string, id: string): TableRow | undefined {
    return table(code).rows.find(r => r.id === id);
}
