import { afterEach, describe, expect, it, vi } from "vitest";
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

        importFile({ formatVersion: 4, name: "Future", systems: {}, products: [] });

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

describe("Landing reload", () => {

    it("offers a Reload tool in the header that reloads the app view and keeps the data", () => {

        const reload = vi.fn();
        const original = window.location;
        Object.defineProperty(window, "location", { configurable: true, value: { ...original, reload } });

        try {
            render(<MemoryRouter><Landing /></MemoryRouter>);
            const button = screen.getByRole("button", { name: /^Reload the app/ });
            expect(button.closest("header.app-header")).toBeTruthy();
            fireEvent.click(button);
            expect(reload).toHaveBeenCalledTimes(1);
        } finally {
            Object.defineProperty(window, "location", { configurable: true, value: original });
        }

    });


    it("refreshes the saved examples from the current example files, and no other Organization", async () => {

        const reload = vi.fn();
        const original = window.location;
        Object.defineProperty(window, "location", { configurable: true, value: { ...original, reload } });

        try {
            const { OrganizationService } = await import("../services/OrganizationService");
            const lumen = (await import("../../docs/examples/lumen-and-loom-studio.json")).default as { id: string };
            // An old copy of the example (and an Organization of the user's own) are saved.
            localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: lumen.id, name: "Lumen & Loom Studio", createdAt: 1 }, { id: "mine", name: "Mine", createdAt: 2 }]));
            localStorage.setItem("northstardust-organization-" + lumen.id, JSON.stringify({ id: lumen.id, name: "Lumen & Loom Studio", createdAt: 1, systems: { old: true }, products: [] }));
            localStorage.setItem("northstardust-organization-mine", JSON.stringify({ id: "mine", name: "Mine", createdAt: 2, systems: { mine: true }, products: [] }));
            render(<MemoryRouter><Landing /></MemoryRouter>);
            fireEvent.click(screen.getByRole("button", { name: /^Reload the app/ }));
            expect(reload).toHaveBeenCalledTimes(1);
            const refreshed = OrganizationService.loadDocument(lumen.id)!;
            expect(Object.keys(refreshed.systems)).not.toContain("old");
            expect(OrganizationService.loadDocument("mine")!.systems).toEqual({ mine: true });
            expect(OrganizationService.list().map(entry => entry.id).sort()).toEqual([lumen.id, "mine"].sort());
        } finally {
            Object.defineProperty(window, "location", { configurable: true, value: original });
        }

    });

});
