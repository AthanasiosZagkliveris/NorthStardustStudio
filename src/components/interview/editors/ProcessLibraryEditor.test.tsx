import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import ProcessLibraryEditor from "./ProcessLibraryEditor";
import { createBlankProcess, type ProcessLibraryAnswerValue } from "../../../framework/engine/AnswerUtils.ts";

/*
    WHAT THE PROCESS LIBRARY DOES TODAY (written 2026-11-11 when its code was split into three files: the owner, "can you do them all?"): its rows
    named as typed, a process added after the one whose + is pressed, moved down and up, removed, and the last one cleared rather than removed.
    The same tests pass on the code before the split and after it.
*/

let latest: ProcessLibraryAnswerValue = [];

function Held({ names }: { names: string[] }) {
    const [value, setValue] = useState<ProcessLibraryAnswerValue>(() => names.map(name => ({ ...createBlankProcess(), name })));
    latest = value;
    return <ProcessLibraryEditor value={value} onChange={next => { latest = next; setValue(next); }} />;
}

const names = () => latest.map(process => process.name);

afterEach(cleanup);

describe("ProcessLibraryEditor, as it behaves today", () => {

    it("draws a row for each process, its name in its Process name cell", () => {
        render(<Held names={["Onboarding", "Invoicing"]} />);
        const cells = screen.getAllByRole("textbox", { name: "Process name" }) as HTMLTextAreaElement[];
        expect(cells.map(cell => cell.value)).toEqual(["Onboarding", "Invoicing"]);
    });

    it("writes what is typed into its process", () => {
        render(<Held names={["Onboarding"]} />);
        fireEvent.change(screen.getByRole("textbox", { name: "Process name" }), { target: { value: "Client onboarding" } });
        expect(names()).toEqual(["Client onboarding"]);
    });

    it("adds a process after the one whose + is pressed", () => {
        render(<Held names={["Onboarding", "Invoicing"]} />);
        fireEvent.click(screen.getAllByRole("button", { name: "Add process" })[0]);
        expect(names()).toEqual(["Onboarding", "", "Invoicing"]);
    });

    it("moves a process down and up", () => {
        render(<Held names={["Onboarding", "Invoicing"]} />);
        fireEvent.click(screen.getAllByRole("button", { name: "Move process down" })[0]);
        expect(names()).toEqual(["Invoicing", "Onboarding"]);
        fireEvent.click(screen.getAllByRole("button", { name: "Move process up" })[1]);
        expect(names()).toEqual(["Onboarding", "Invoicing"]);
    });

    it("removes a process, and clears the last one rather than removing it", () => {
        render(<Held names={["Onboarding", "Invoicing"]} />);
        fireEvent.click(screen.getAllByRole("button", { name: "Remove process" })[0]);
        expect(names()).toEqual(["Invoicing"]);
        fireEvent.click(screen.getByRole("button", { name: "Clear process" }));
        expect(latest).toHaveLength(1);
        expect(latest[0].name).toBe("");
    });

});
