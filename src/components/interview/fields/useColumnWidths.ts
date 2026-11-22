/*
    THE TABLE'S COLUMN WIDTHS (DynamicTable.tsx): each column's least width (its title), its greatest (its longest entry), the widths
    the user drags, and the width each column is drawn at. Moved out of DynamicTable.tsx (2026-11-22, the review of 2026-11-21, C1:
    one topic per file): the same code in a hook, called by the table where its state and effects stood.
*/
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import type { TableColumn, TableRow } from "./dynamicTableTypes.ts";
import { REPEATABLE_BUTTON_WIDTH, HEADER_CELL_PADDING, MIN_COLUMN_WIDTH, DEFAULT_COLUMN_WIDTH, TYPE_FIXED_WIDTH, isFixedWidthColumn, CONTENT_WIDTH_PADDING, measureTextWidth, CELL_FONT, HEADER_FONT_FALLBACK, computedFont } from "./dynamicTableWidths.ts";

export function useColumnWidths(columns: TableColumn[], value: TableRow[], getRowList: (row: TableRow, columnId: string) => string[]) {

    const headerRefs = useRef<Record<string, HTMLTableCellElement | null>>({});

    const [minWidths, setMinWidths] = useState<Record<string, number>>({});
    const [colWidths, setColWidths] = useState<Record<string, number>>({});

    const dragState = useRef<{

        columnId: string;

        startX: number;

        startWidth: number;

    } | null>(null);

    function columnMinWidth(column: TableColumn): number {

        const titleMin = minWidths[column.id] ?? MIN_COLUMN_WIDTH;

        return Math.max(MIN_COLUMN_WIDTH, titleMin);

    }

    // The widest single line currently held by each
    // resizable (text/number) column, so a column can
    // never be dragged wider than its own content actually
    // needs. A column with nothing typed into it yet has no
    // entry here at all -- with nothing to size against, its
    // cap falls back to the column's own default width (see
    // columnMaxWidth), not an unlimited one: an empty cell
    // should never be draggable past its default length just
    // because there happens to be room in the table for it.
    const contentMaxWidths = useMemo(() => {

        const result: Record<string, number> = {};

        columns.forEach(column => {

            if (isFixedWidthColumn(column)) {
                return;
            }

            let max = 0;
            let hasContent = false;

            value.forEach(row => {

                // A `repeatable`/`repeatableValue` column holds a
                // LIST of values on each row (see getRowList) --
                // measure every one of that row's own entries
                // individually, rather than the array itself, so
                // resize caps reflect the longest single entry
                // actually typed, not "[object Object]"-style noise.
                const texts = column.repeatable || column.repeatableValue
                    ? getRowList(row, column.id)
                    : [String(row[column.id] ?? "")];

                texts.forEach(text => {

                    if (text.trim().length === 0) {
                        return;
                    }

                    hasContent = true;

                    const width = measureTextWidth(text, CELL_FONT);

                    if (width > max) {
                        max = width;
                    }

                });

            });

            if (hasContent) {
                result[column.id] = Math.ceil(max) + CONTENT_WIDTH_PADDING;
            }

        });

        return result;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columns, value]);

    function columnMaxWidth(column: TableColumn): number {

        const contentMax = contentMaxWidths[column.id];

        // No content typed into this column anywhere in the
        // table yet -- there's nothing to justify making it any
        // wider than its own default width, so that default
        // becomes the drag ceiling (it can still be dragged
        // narrower, down to its title's own minimum).
        if (contentMax === undefined) {
            return Math.max(columnMinWidth(column), DEFAULT_COLUMN_WIDTH);
        }

        return Math.max(columnMinWidth(column), contentMax);

    }

    // Measure each header's title text width directly (via
    // canvas, using the header's own actual font) so a
    // column can never be resized narrower than its own
    // title -- deliberately NOT th.scrollWidth, which
    // reflects the column's current *rendered* width
    // (already stretched by the table's auto layout) rather
    // than the title text's true minimum, and used to leave
    // a column stuck unable to shrink much below whatever
    // width it already happened to have.
    useLayoutEffect(() => {

        const next: Record<string, number> = {};

        columns.forEach(column => {

            const th = headerRefs.current[column.id];
            const label = th?.querySelector(".dynamic-table-header-label");

            const font = computedFont(label, HEADER_FONT_FALLBACK);
            const textWidth = measureTextWidth(column.title, font);

            next[column.id] = Math.ceil(textWidth) + HEADER_CELL_PADDING;

        });

        setMinWidths(next);

        // Column set changed (new Section) -- drop any
        // manual widths from the previous table.
        setColWidths({});

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columns.map(column => column.id).join("|")]);

    function handleMouseMove(event: MouseEvent) {

        const drag = dragState.current;

        if (!drag) {
            return;
        }

        const column = columns.find(candidate => candidate.id === drag.columnId);

        if (!column) {
            return;
        }

        const min = columnMinWidth(column);
        const max = columnMaxWidth(column);

        const proposed = Math.round(drag.startWidth + (event.clientX - drag.startX));

        const next = Math.min(max, Math.max(min, proposed));

        setColWidths(prev => ({

            ...prev,

            [drag.columnId]: next

        }));

    }

    function handleMouseUp() {

        dragState.current = null;

        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);

    }

    function startResize(columnId: string, event: React.MouseEvent) {

        event.preventDefault();

        // The table is always rendered with an explicit,
        // deterministic width per column (see columnWidthPx) --
        // there's no separate "natural sizing" state to jump
        // from anymore, so the drag can simply start from
        // whatever that column is showing right now, whether
        // that's its default width or an earlier manual resize.
        const column = columns.find(candidate => candidate.id === columnId);

        const startWidth = column
            ? columnWidthPx(column)
            : MIN_COLUMN_WIDTH;

        dragState.current = {

            columnId,

            startX: event.clientX,

            startWidth

        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

    }

    // Clean up any dangling listeners on unmount (e.g. if the
    // user navigates away mid-drag).
    useEffect(() => {

        return () => {

            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);

        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // A column's rendered width: a fixed control width for
    // Date/Field columns, the user's own manual resize if
    // they've dragged this column, or -- deliberately NOT
    // "whatever the browser's auto layout feels like handing
    // it" -- a fixed default width otherwise. An empty column
    // therefore never balloons out to soak up a wide table's
    // unused space; it just sits at its default width until
    // the user actually drags it wider.
    // A Field/Date/Dynamic-Select column's own fixed control
    // width (TYPE_FIXED_WIDTH), widened up to that column's own
    // title's measured minimum when the title itself is longer
    // than the control needs -- a common rule so a column's
    // header text can never overflow its own column, no matter
    // which control type that column renders (item: "Make a
    // common rule, so the columns should always cover completely
    // their headers", filed against "Communication Frequency"'s
    // Frequency Field column, whose fixed 170px control width
    // was narrower than its own header text).
    function fixedColumnWidth(column: TableColumn): number | undefined {

        const fixed = TYPE_FIXED_WIDTH[column.type];

        if (fixed === undefined) {
            return undefined;
        }

        return Math.max(fixed, columnMinWidth(column));

    }

    function columnWidthPx(column: TableColumn): number {

        const extra = column.repeatable ? REPEATABLE_BUTTON_WIDTH : 0;

        const fixed = fixedColumnWidth(column);

        if (fixed !== undefined) {
            return fixed + extra;
        }

        if (colWidths[column.id] !== undefined) {
            return colWidths[column.id] + extra;
        }

        return Math.max(columnMinWidth(column), DEFAULT_COLUMN_WIDTH) + extra;

    }

    function fixedWidthStyle(column: TableColumn): React.CSSProperties | undefined {

        const fixed = fixedColumnWidth(column);

        if (fixed === undefined) {
            return undefined;
        }

        const width = fixed + (column.repeatable ? REPEATABLE_BUTTON_WIDTH : 0);

        return { width, minWidth: width, maxWidth: width };

    }

    return { headerRefs, minWidths, colWidths, columnWidthPx, fixedWidthStyle, startResize };

}
