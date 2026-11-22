/*
    THE TABLE'S ROWS (DynamicTable.tsx): a new row, a cell's list of entries, the totals, and every change to the rows (add, clear,
    delete, move, a cell, a list entry), each taking the rows and giving the new rows. Moved out of DynamicTable.tsx (2026-11-22, the
    review of 2026-11-21, C1: one topic per file): the same code, the rows and the column maps passed in instead of read from the
    component; the table calls them and hands the result to onChange.
*/
import type { TableColumn, TableRow } from "./dynamicTableTypes.ts";

// Every `repeatableValue` column is kept in lock-step with the
// nearest PRECEDING `repeatable` column on the same row (e.g.
// Method Mix % pairs with Revenue Method) -- this maps each
// `repeatable` driver column's id to the list of
// `repeatableValue` columns that ride along with it, so removing
// an entry from the driver (see `removeMethodEntry` below) can
// splice the matching entry out of every paired column's own
// list in the same go.
export function pairedValueColumns(columns: TableColumn[]): Record<string, TableColumn[]> {

    const result: Record<string, TableColumn[]> = {};

    let currentDriverId: string | null = null;

    columns.forEach(column => {

        if (column.repeatable) {

            currentDriverId = column.id;
            result[currentDriverId] = [];

        } else if (column.repeatableValue && currentDriverId) {

            result[currentDriverId].push(column);

        }

    });

    return result;

}

// The reverse of the map above: a `repeatableValue` column's own
// id to its paired `repeatable` driver column's id -- used by
// `getRowList` (below) so a `repeatableValue` column's list is
// always READ at exactly its driver's own current length,
// regardless of what its own raw stored value happens to be.
// This is what keeps Method Mix's own list of entries visually
// in step with Revenue Method's, even for a row whose data
// predates this pairing (a legacy/stale saved response, or one
// edited mid-session while the app was reloading) -- rather than
// relying solely on `addMethodEntry`/`removeMethodEntry` to keep
// the two arrays physically the same length at all times, which
// silently stops working the moment anything else touches the
// row's data out of step with them.
export function driverIdsForValueColumns(pairedValueColumnsByDriver: Record<string, TableColumn[]>): Record<string, string> {

    const result: Record<string, string> = {};

    Object.entries(pairedValueColumnsByDriver).forEach(([driverId, pairedColumns]) => {

        pairedColumns.forEach(pairedColumn => {
            result[pairedColumn.id] = driverId;
        });

    });

    return result;

}

export function createRow(columns: TableColumn[]): TableRow {

    const row: TableRow = {};

    columns.forEach(column => {

        // A `repeatable`/`repeatableValue` column's cell holds
        // a LIST of values (rendered as a vertical list within
        // that one row's own cell -- see renderRepeatableList /
        // renderRepeatableValueList) -- it starts with exactly
        // one blank entry, same as every other column starts
        // with one blank value.
        row[column.id] = (column.repeatable || column.repeatableValue) ? [""] : "";

    });

    return row;

}

// Reads a `repeatable`/`repeatableValue` column's list of
// values for one row -- tolerant of a legacy saved response
// that still has a plain scalar there (wraps it as a single-
// entry list) or nothing at all (falls back to one blank
// entry), so an older saved Table never renders broken.
//
// For a `repeatableValue` column specifically, the returned list
// is always padded (with blank entries) or trimmed to exactly
// match its paired `repeatable` driver column's OWN current
// length on this same row -- e.g. Method Mix always shows one
// entry per Revenue Method, even for a row whose two arrays
// happen to have drifted to different lengths (a legacy/stale
// saved response, or a driver add/remove that ran before this
// reconciliation existed) -- so the two lists can never visibly
// disagree on how many entries this row has, no matter how the
// underlying data got into that state.
export function getRowList(row: TableRow, columnId: string, driverIdForValueColumn: Record<string, string>): string[] {

    const raw = row[columnId];

    let list: string[];

    if (Array.isArray(raw)) {
        list = raw.length > 0 ? raw.map(entry => String(entry ?? "")) : [""];
    } else if (raw === undefined || raw === null || raw === "") {
        list = [""];
    } else {
        list = [String(raw)];
    }

    const driverColumnId = driverIdForValueColumn[columnId];

    if (driverColumnId) {

        const driverLength = getRowList(row, driverColumnId, driverIdForValueColumn).length;

        if (list.length < driverLength) {
            list = [...list, ...new Array(driverLength - list.length).fill("")];
        } else if (list.length > driverLength) {
            list = list.slice(0, driverLength);
        }

    }

    return list;

}

export function columnTotal(value: TableRow[], column: TableColumn): number {

    let total = 0;

    value.forEach(row => {

        const raw = row[column.id];
        const parsed = parseFloat(String(raw ?? "").replace(/[^0-9.-]/g, ""));

        if (!Number.isNaN(parsed)) {
            total += parsed;
        }

    });

    return Math.round(total * 100) / 100;

}

// For a `groupSumCheck` column (e.g. Method Mix %), sums just
// this ONE row's own list of values -- every Revenue Stream is
// now a single row, so its Methods' Mix % needs to add up to
// 100 entirely on its own, independent of every other Stream's
// row.
export function rowListTotal(column: TableColumn, row: TableRow, driverIdForValueColumn: Record<string, string>): number {

    const list = getRowList(row, column.id, driverIdForValueColumn);

    let total = 0;

    list.forEach(entry => {

        const parsed = parseFloat(String(entry ?? "").replace(/[^0-9.-]/g, ""));

        if (!Number.isNaN(parsed)) {
            total += parsed;
        }

    });

    return Math.round(total * 100) / 100;

}

// Inserts a fully blank new row directly after `afterIndex`
// (this table's own row-actions "+" -- the one outside the
// scrollable data table, next to Up/Down/Remove -- calls this
// with its own row's index), rather than always appending to
// the very end of the table -- a "+" pressed next to row 2 of
// 6 should add a row near row 2, not somewhere the user has to
// scroll down to find. Omitting afterIndex appends to the end,
// used only as a fallback.
//
// This is the "add a whole new Revenue Stream" action -- one
// row is always exactly one Stream now, so this is also the
// ONLY way a new Stream gets added; adding another Method for
// an EXISTING Stream never touches table rows at all, see
// `addMethodEntry` below.
export function addRow(value: TableRow[], columns: TableColumn[], afterIndex?: number): TableRow[] {

    const newRow = createRow(columns);

    if (afterIndex === undefined) {

        return [...value, newRow];

    }

    const rows = [...value];

    rows.splice(afterIndex + 1, 0, newRow);

    return rows;

}

export function clearRow(value: TableRow[], columns: TableColumn[], index: number): TableRow[] {

    const rows = [...value];

    rows[index] = createRow(columns);

    return rows;

}

export function deleteRow(value: TableRow[], columns: TableColumn[], index: number): TableRow[] {

    // A table always keeps at least one row -- pressing
    // the minus button on the last remaining row clears
    // its contents back to blank instead of doing nothing.
    if (value.length <= 1) {
        return clearRow(value, columns, index);
    }

    return value.filter((_, i) => i !== index);

}

export function moveRow(value: TableRow[], index: number, direction: -1 | 1): TableRow[] | null {

    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= value.length) {
        return null;
    }

    const rows = [...value];

    const [moved] = rows.splice(index, 1);
    rows.splice(targetIndex, 0, moved);

    return rows;

}

export function updateCell(

    value: TableRow[],

    rowIndex: number,

    columnId: string,

    cellValue: unknown

): TableRow[] {

    const rows = [...value];

    rows[rowIndex] = {

        ...rows[rowIndex],

        [columnId]: cellValue

    };

    return rows;

}

// Adds another entry to a `repeatable` driver column's own list
// on this ONE row (e.g. another Revenue Method for this same
// Stream) -- only the driver's own list needs to grow here.
// Every paired `repeatableValue` column (e.g. Method Mix %)
// automatically renders (and, once typed into, saves) one more
// blank entry to match, via `getRowList`'s own driver-length
// reconciliation above -- so there's nothing to keep in step by
// hand here.
export function addMethodEntry(value: TableRow[], driverIdForValueColumn: Record<string, string>, rowIndex: number, driverColumnId: string): TableRow[] {

    const rows = [...value];

    const row = { ...rows[rowIndex] };

    row[driverColumnId] = [...getRowList(row, driverColumnId, driverIdForValueColumn), ""];

    rows[rowIndex] = row;

    return rows;

}

// Removes one entry (by its position within the list) from a
// `repeatable` driver column's own list on this row, and the
// matching entry from every paired `repeatableValue` column's
// list -- EXCEPT when it's the only entry left, in which case
// removing it outright would leave the row with no Method at
// all. In that one case, this clears the entry's value(s) back
// to blank instead, keeping exactly one (empty) entry, so the
// row always has somewhere to type a replacement Method into.
export function removeMethodEntry(value: TableRow[], pairedValueColumnsByDriver: Record<string, TableColumn[]>, driverIdForValueColumn: Record<string, string>, rowIndex: number, driverColumnId: string, entryIndex: number): TableRow[] {

    const rows = [...value];

    const row = { ...rows[rowIndex] };

    const driverList = getRowList(row, driverColumnId, driverIdForValueColumn);

    const pairedColumns = pairedValueColumnsByDriver[driverColumnId] ?? [];

    if (driverList.length <= 1) {

        row[driverColumnId] = [""];

        pairedColumns.forEach(pairedColumn => {
            row[pairedColumn.id] = [""];
        });

    } else {

        // Read each paired column's own list -- padded/trimmed
        // to the driver's CURRENT (pre-removal) length, so entry
        // `entryIndex` of the paired list still lines up with
        // the driver entry actually being removed -- BEFORE
        // shrinking the driver itself. Reading it after would
        // have `getRowList` pad/trim against the already-
        // shortened driver instead, silently dropping the wrong
        // entry off the end rather than the one the user clicked
        // "-" next to.
        const pairedListsBeforeRemove = pairedColumns.map(pairedColumn => getRowList(row, pairedColumn.id, driverIdForValueColumn));

        row[driverColumnId] = driverList.filter((_entry, i) => i !== entryIndex);

        pairedColumns.forEach((pairedColumn, index) => {
            row[pairedColumn.id] = pairedListsBeforeRemove[index].filter((_entry, i) => i !== entryIndex);
        });

    }

    rows[rowIndex] = row;

    return rows;

}

// Updates a single entry (by its position within the list)
// of a `repeatable` or `repeatableValue` column's own list on
// one row -- used for every keystroke/selection inside that
// column's per-entry list items.
export function updateMethodEntry(value: TableRow[], driverIdForValueColumn: Record<string, string>, rowIndex: number, columnId: string, entryIndex: number, entryValue: string): TableRow[] {

    const rows = [...value];

    const row = { ...rows[rowIndex] };

    const list = [...getRowList(row, columnId, driverIdForValueColumn)];

    list[entryIndex] = entryValue;

    row[columnId] = list;

    rows[rowIndex] = row;

    return rows;

}
