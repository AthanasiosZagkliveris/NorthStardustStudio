import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Landing from "./Landing";

afterEach(() => {
    cleanup();
    localStorage.clear();
});

function importFile(contents: unknown) {

    const input = screen.getByLabelText("Organization file to import");

    fireEvent.change(input, {
        target: { files: [new File([JSON.stringify(contents)], "organization.json", { type: "application/json" })] }
    });

}

describe("Landing import of an Organization file", () => {

    it("says plainly that a file from a newer version cannot be imported", async () => {

        render(<MemoryRouter><Landing /></MemoryRouter>);

        importFile({ formatVersion: 3, name: "Future", systems: {}, products: [] });

        expect((await screen.findByRole("alert")).textContent)
            .toBe("That file was saved by a newer version of North Stardust. Update the app, then import it again.");
        expect(screen.queryByDisplayValue("Future")).toBeNull();

    });

    it("imports a version 1 file as before", async () => {

        render(<MemoryRouter><Landing /></MemoryRouter>);

        importFile({ name: "Quillfield", systems: {}, products: [] });

        expect(await screen.findByDisplayValue("Quillfield")).toBeTruthy();
        expect(screen.queryByRole("alert")).toBeNull();

    });

});
