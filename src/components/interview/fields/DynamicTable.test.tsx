import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import DynamicTable, { type TableColumn, type TableRow } from "./DynamicTable";

/*
    WHAT THE TABLE DOES TODAY (written 2026-11-10 before its code is split into files: the owner, "Can you do both?"): its headings, a cell typed
    into, a row added, moved and deleted, and the last row cleared rather than removed. The split must keep every one of these.
*/

const COLUMNS: TableColumn[] = [
    { id: "name", title: "Name", type: "text" },
    { id: "amount", title: "Amount", type: "number" }
];

let latest: TableRow[] = [];

function Held({ start }: { start: TableRow[] }) {
    const [rows, setRows] = useState<TableRow[]>(start);
    latest = rows;
    return <DynamicTable columns={COLUMNS} value={rows} onChange={next => { latest = next; setRows(next); }} />;
}

afterEach(cleanup);

describe("DynamicTable, as it behaves today", () => {

    it("draws a heading for each column and a cell for each column of each row", () => {
        render(<Held start={[{ name: "A", amount: "1" }, { name: "B", amount: "2" }]} />);
        expect(screen.getByRole("columnheader", { name: /Name/ })).toBeTruthy();
        expect(screen.getByRole("columnheader", { name: /Amount/ })).toBeTruthy();
        expect(screen.getAllByRole("textbox", { name: "Name" })).toHaveLength(2);
        expect(screen.getAllByRole("spinbutton", { name: "Amount" })).toHaveLength(2);
    });

    it("writes what is typed into its row and column", () => {
        render(<Held start={[{ name: "A", amount: "1" }]} />);
        fireEvent.change(screen.getByRole("spinbutton", { name: "Amount" }), { target: { value: "42" } });
        expect(latest[0].amount).toBe("42");
        expect(latest[0].name).toBe("A");
    });

    it("adds a row after the one whose + is pressed", () => {
        render(<Held start={[{ name: "A" }, { name: "B" }]} />);
        fireEvent.click(screen.getAllByRole("button", { name: "Add row" })[0]);
        expect(latest).toHaveLength(3);
        expect(latest[0].name).toBe("A");
        expect(latest[2].name).toBe("B");
    });

    it("moves a row down and up", () => {
        render(<Held start={[{ name: "A" }, { name: "B" }]} />);
        fireEvent.click(screen.getAllByRole("button", { name: "Move row down" })[0]);
        expect(latest.map(row => row.name)).toEqual(["B", "A"]);
        fireEvent.click(screen.getAllByRole("button", { name: "Move row up" })[1]);
        expect(latest.map(row => row.name)).toEqual(["A", "B"]);
    });

    it("deletes a row, and clears the last one rather than removing it", () => {
        render(<Held start={[{ name: "A" }, { name: "B" }]} />);
        fireEvent.click(screen.getAllByRole("button", { name: "Delete row" })[0]);
        expect(latest.map(row => row.name)).toEqual(["B"]);
        fireEvent.click(screen.getByRole("button", { name: "Clear row" }));
        expect(latest).toHaveLength(1);
        expect(latest[0].name ?? "").toBe("");
    });

});
