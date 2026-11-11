/**
 * Split out of DynamicTable.tsx (2026-11-11, the folder report's item 6): parts of DynamicTable drawn from the values it hands them
 * (each part's context); DynamicTable keeps a function of the same name that hands them over, so nothing else changed.
 */
import AddButton from "../../controls/AddButton.tsx";
import RemoveButton from "../../controls/RemoveButton.tsx";
import TextBox from "../../controls/TextBox.tsx";
import TextField from "../../controls/TextField.tsx";
import FieldRenderer from "./FieldRenderer";
import OptionPicker from "./OptionPicker.tsx";
import DateCellInput from "./DateCellInput.tsx";
import NotesField from "./NotesField.tsx";
import type { TableColumn, TableRow } from "./DynamicTable.tsx";

export type RenderValueControlContext = {
    disabled: boolean;
    value: TableRow[];
};

// Renders a single value control (whatever `column.type` calls
// for) against one raw value and one change handler -- used
// both for an ordinary (non-list) cell, via `renderCell` below,
// and for each individual entry inside a `repeatable`/
// `repeatableValue` column's own list, via `renderRepeatableList`
// / `renderRepeatableValueList`. `idSuffix` keeps generated ids
// (e.g. an autofill <datalist>'s id) unique per control.
export function renderValueControlPart(ctx: RenderValueControlContext, column: TableColumn, cellValue: unknown, onValueChange: (value: unknown) => void, idSuffix: string) {
const { disabled, value } = ctx;

    // Every control this funnel renders is a bare field with no
    // visible <label> -- the only thing naming it is its column
    // header, which a screen reader never associates automatically.
    // The column title becomes the control's accessible name, so
    // focusing a cell announces "Revenue Stream" rather than an
    // anonymous "edit text". Every Table in every System renders
    // through here, so naming it once covers all of them.
    const cellLabel = column.title;

    switch (column.type) {

        case "field":

            if (!column.field) {

                return null;

            }

            return (

                <FieldRenderer

                    ariaLabel={cellLabel}

                    field={column.field}

                    value={cellValue}

                    disabled={disabled}

                    onChange={onValueChange}

                />

            );

        case "date":

            return (

                <DateCellInput

                    ariaLabel={cellLabel}

                    disabled={disabled}

                    value={String(cellValue ?? "")}

                    onChange={onValueChange}

                />

            );

        case "number":

            return (

                <input

                    type="number"

                    className="interview-input"
                    aria-label={cellLabel}

                    disabled={disabled}

                    value={String(cellValue ?? "")}

                    onChange={(event) => onValueChange(event.target.value)}

                />

            );

        case "dynamic-select": {

            const options = column.options ?? [];

            return (

                <OptionPicker
                    label={cellLabel}
                    placeholder={options.length > 0 ? "Select" : "No options entered yet"}
                    options={options}
                    disabled={disabled}
                    value={String(cellValue ?? "")}
                    onChange={onValueChange}
                />

            );

        }

        case "autofill": {

            // Excel-style autofill: every distinct value
            // already entered anywhere else in this same
            // column becomes a suggestion, so a repeated
            // Category (or similar) can be picked instead
            // of retyped. Each control gets its own
            // <datalist> (same suggestion set, uniquely-
            // scoped id) rather than one shared element, so
            // ids stay unique without any extra plumbing.
            const columnId = column.id;

            const suggestions = Array.from(new Set(

                value

                    .map(candidateRow => String(candidateRow[columnId] ?? "").trim())

                    .filter(text => text.length > 0)

            ));

            const datalistId = `autofill-${columnId}-${idSuffix}`;

            return (

                <>

                    <TextBox

                        list={datalistId}

                        className="interview-input"

                        disabled={disabled}

                        value={String(cellValue ?? "")}

                        onChange={(event) => onValueChange(event.target.value)}

                    />

                    <datalist id={datalistId}>

                        {suggestions.map(option => (
                            <option key={option} value={option} />
                        ))}

                    </datalist>

                </>

            );

        }

        case "notes":

            // A column literally titled "Notes" OR "Description"
            // (see resolveColumnType in AnswerRenderer.tsx) --
            // routed through the SAME shared NotesField component
            // every other Notes-purpose field in the app uses
            // (Operational Log, Roles & Responsibilities, the
            // Organization Calendar's per-task Note), so the
            // bullet/numbered-list authoring and guaranteed
            // regular font-weight are identical here too, instead
            // of this table growing its own slightly-different
            // fourth copy. `.dynamic-table-scroll .interview-input`
            // (conversation.css) already styles width/padding/
            // border/focus for any `.interview-input` in this
            // table, so NotesField needs no extra className here.
            //
            // The placeholder itself still tells the two apart --
            // "Add a description" for a Description column, only
            // NotesField's own default ("Add a note") for an
            // actual Notes column.
            return (

                <NotesField

                    ariaLabel={cellLabel}

                    disabled={disabled}

                    value={String(cellValue ?? "")}

                    onChange={onValueChange}

                    placeholder={
                        column.title.trim().toLowerCase() === "description"
                            ? "Add a description"
                            : undefined
                    }

                />

            );

        case "text":

        default:

            return (

                <TextField className="dynamic-table-textarea"

                    ariaLabel={cellLabel}

                    disabled={disabled}

                    value={String(cellValue ?? "")}

                    onChange={onValueChange}

                />

            );

    }

}

export type RenderRepeatableListContext = {
    getRowList: (row: TableRow, columnId: string) => string[];
    renderValueControl: (column: TableColumn, cellValue: unknown, onValueChange: (value: unknown) => void, idSuffix: string) => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element | null;
    updateMethodEntry: (rowIndex: number, columnId: string, entryIndex: number, entryValue: string) => void;
    disabled: boolean;
    removeMethodEntry: (rowIndex: number, driverColumnId: string, entryIndex: number) => void;
    addMethodEntry: (rowIndex: number, driverColumnId: string) => void;
};

// A `repeatable` driver column (e.g. Revenue Method) renders as
// a vertical list of entries within its own cell, each with its
// own inline "-" remove control, plus one trailing "add
// another" control for the row -- since a Revenue Stream now
// always lives on exactly one table row, this list (not new
// table rows) is how it holds more than one Method.
export function renderRepeatableListPart(ctx: RenderRepeatableListContext, row: TableRow, rowIndex: number, column: TableColumn) {
const { getRowList, renderValueControl, updateMethodEntry, disabled, removeMethodEntry, addMethodEntry } = ctx;

    const list = getRowList(row, column.id);

    return (

        <div className="dynamic-table-repeatable-list">

            {list.map((entryValue, entryIndex) => (

                <div className="dynamic-table-repeatable-item" key={entryIndex}>

                    <div className="dynamic-table-repeatable-item-control">

                        {renderValueControl(

                            column,

                            entryValue,

                            (next) => updateMethodEntry(rowIndex, column.id, entryIndex, String(next ?? "")),

                            `${rowIndex}-${entryIndex}`

                        )}

                    </div>

                    <RemoveButton
                        disabled={disabled}
                        aria-label={`Remove this ${column.title}`}
                        onClick={() => removeMethodEntry(rowIndex, column.id, entryIndex)} />

                </div>

            ))}

            <AddButton
                disabled={disabled}
                aria-label={`Add another ${column.title}`}
                onClick={() => addMethodEntry(rowIndex, column.id)}>
                + Add {column.title}
            </AddButton>

        </div>

    );

}

export type RenderRepeatableValueListContext = {
    getRowList: (row: TableRow, columnId: string) => string[];
    renderValueControl: (column: TableColumn, cellValue: unknown, onValueChange: (value: unknown) => void, idSuffix: string) => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element | null;
    updateMethodEntry: (rowIndex: number, columnId: string, entryIndex: number, entryValue: string) => void;
};

// A `repeatableValue` column (e.g. Method Mix %) renders a
// matching vertical list of entries, one per entry of its
// paired `repeatable` driver column on the same row -- values
// only, no controls of its own, since its list length always
// follows the driver's (see addMethodEntry/removeMethodEntry).
export function renderRepeatableValueListPart(ctx: RenderRepeatableValueListContext, row: TableRow, rowIndex: number, column: TableColumn) {
const { getRowList, renderValueControl, updateMethodEntry } = ctx;

    const list = getRowList(row, column.id);

    return (

        <div className="dynamic-table-repeatable-value-list">

            {list.map((entryValue, entryIndex) => (

                <div className="dynamic-table-repeatable-value-item" key={entryIndex}>

                    {renderValueControl(

                        column,

                        entryValue,

                        (next) => updateMethodEntry(rowIndex, column.id, entryIndex, String(next ?? "")),

                        `${rowIndex}-${entryIndex}`

                    )}

                </div>

            ))}

        </div>

    );

}

export type RemoveMethodEntryContext = {
    value: TableRow[];
    getRowList: (row: TableRow, columnId: string) => string[];
    pairedValueColumnsByDriver: Record<string, TableColumn[]>;
    onChange: (rows: TableRow[]) => void;
};

// Removes one entry (by its position within the list) from a
// `repeatable` driver column's own list on this row, and the
// matching entry from every paired `repeatableValue` column's
// list -- EXCEPT when it's the only entry left, in which case
// removing it outright would leave the row with no Method at
// all. In that one case, this clears the entry's value(s) back
// to blank instead, keeping exactly one (empty) entry, so the
// row always has somewhere to type a replacement Method into.
export function removeMethodEntryPart(ctx: RemoveMethodEntryContext, rowIndex: number, driverColumnId: string, entryIndex: number) {
const { value, getRowList, pairedValueColumnsByDriver, onChange } = ctx;

    const rows = [...value];

    const row = { ...rows[rowIndex] };

    const driverList = getRowList(row, driverColumnId);

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
        const pairedListsBeforeRemove = pairedColumns.map(pairedColumn => getRowList(row, pairedColumn.id));

        row[driverColumnId] = driverList.filter((_entry, i) => i !== entryIndex);

        pairedColumns.forEach((pairedColumn, index) => {
            row[pairedColumn.id] = pairedListsBeforeRemove[index].filter((_entry, i) => i !== entryIndex);
        });

    }

    rows[rowIndex] = row;

    onChange(rows);

}
