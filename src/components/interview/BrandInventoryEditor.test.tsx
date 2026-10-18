import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import BrandInventoryEditor from "./BrandInventoryEditor";
import { BrandInventoryAnswerValue, asBrandInventoryValue } from "../../framework/engine/AnswerUtils";

afterEach(cleanup);

const svg = { dataUrl: "data:image/svg+xml;base64,PHN2Zy8+", fileName: "old-icon.svg" };
const png = { dataUrl: "data:image/png;base64,AA", fileName: "old-logo.png" };

function renderWith(initial: unknown) {
    let saved: BrandInventoryAnswerValue = asBrandInventoryValue(initial);
    function Harness() {
        const [value, setValue] = useState<unknown>(initial);
        return <BrandInventoryEditor value={value} onChange={(next) => { saved = next; setValue(next); }} />;
    }
    const view = render(<Harness />);
    return { ...view, saved: () => saved };
}

const fileInput = (container: HTMLElement, index: number) =>
    container.querySelectorAll<HTMLInputElement>(".brand-file-input")[index];

describe("BrandInventoryEditor, Icon & Logo", () => {

    it("asks for one icon and one logo, each an SVG or a PNG", () => {
        const { container } = renderWith(undefined);
        const labels = [...container.querySelectorAll(".brand-slot-label")].map(label => label.textContent);
        // The Logo first, on its own row, then the Icon.
        expect(labels.slice(0, 2)).toEqual(["Logo", "Icon"]);
        expect(labels).not.toContain("Icon PNG");
        expect(screen.getByRole("button", { name: "Upload Icon" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Upload Logo" })).toBeTruthy();
        expect(fileInput(container, 0).accept).toBe("image/svg+xml,image/png");
        expect([...container.querySelectorAll(".brand-slot-hint")].map(hint => hint.textContent)).toEqual(["SVG or PNG, up to 50 KB", "SVG or PNG, up to 50 KB"]);
    });

    it("shows a second set's files in the one set while it is empty", () => {
        const { container } = renderWith({ icon: { png: { dataUrl: "data:image/png;base64,CC", fileName: "icon.png" }, svg }, logo: { png } });
        expect(screen.getByRole("button", { name: "Replace Icon" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Replace Logo" })).toBeTruthy();
        expect([...container.querySelectorAll(".brand-slot-hint")].map(hint => hint.textContent)).toEqual(["old-logo.png", "old-icon.svg"]);
    });

    it("removes with the ×, keeping an older file saved but not shown", () => {
        const { saved } = renderWith({ icon: { svg }, logo: {} });
        fireEvent.click(screen.getByRole("button", { name: "Remove Icon" }));
        expect(saved().icon.file).toBeNull();
        expect(saved().icon.svg).toEqual(svg);
        expect(screen.getByRole("button", { name: "Upload Icon" })).toBeTruthy();
    });

    it("refuses a file that is not an SVG or a PNG, or is over 50 KB, with a message", async () => {
        const { container, saved } = renderWith(undefined);
        fireEvent.change(fileInput(container, 0), { target: { files: [new File(["x"], "photo.jpg", { type: "image/jpeg" })] } });
        expect((await screen.findByRole("alert")).textContent).toBe("\"photo.jpg\" is not an SVG or a PNG. The icon and the logo each take one SVG or PNG file.");
        fireEvent.change(fileInput(container, 1), { target: { files: [new File([new Uint8Array(51 * 1024)], "big.png", { type: "image/png" })] } });
        expect((await screen.findByRole("alert")).textContent).toBe("\"big.png\" is 51KB. The limit is 50KB.");
        expect(saved().logo.file).toBeUndefined();
    });

    it("stores an uploaded PNG as the mark's one file", async () => {
        const { container, saved } = renderWith({ logo: { svg } });
        fireEvent.change(fileInput(container, 0), { target: { files: [new File(["png"], "logo.png", { type: "image/png" })] } });
        await waitFor(() => expect(saved().logo.file?.fileName).toBe("logo.png"));
        expect(saved().logo.svg).toEqual(svg);
    });

    it("keeps a description of the logo and icon, a Notes field behind its tick", () => {
        const { saved } = renderWith(undefined);
        expect(screen.queryByRole("textbox", { name: "Icon and logo description" })).toBeNull();
        fireEvent.click(screen.getByRole("checkbox", { name: /Notes/ }));
        const box = screen.getByRole("textbox", { name: "Icon and logo description" });
        expect(box.getAttribute("placeholder")).toBe("What the logo and icon show, what they mean, and how they should be used");
        fireEvent.change(box, { target: { value: "A quill: writing, care." } });
        expect(saved().markDescription).toBe("A quill: writing, care.");
    });

    it("explains SVG, PNG and PDF at the end of the upload bullet", () => {
        render(<BrandInventoryEditor value={undefined} onChange={() => {}} />);
        const note = screen.getByRole("button", { name: /Image formats & their purposes/ });
        // The "i" is glued to the last word of that bullet's own text.
        const bullet = note.closest(".info-note-glue")?.parentElement;
        expect(bullet?.textContent).toContain("Upload your icon and logo in PNG or SVG formats, with a maximum file size of 50 KB each.");
    });

});

describe("BrandInventoryEditor layout", () => {

    it("puts each image beside ONE holder of its name and description", () => {
        const { container } = renderWith(undefined);
        const holders = container.querySelectorAll(".brand-asset-slot-image .brand-image-text");
        expect(holders).toHaveLength(2);
        holders.forEach(holder => {
            expect(holder.querySelector("input.brand-image-name")).not.toBeNull();
            expect(holder.querySelector("textarea.brand-image-note")).not.toBeNull();
        });
    });

    it("sets the Icon's description beside the Icon, and shares the rows across the columns", () => {
        const { container } = renderWith({ images: [{ dataUrl: "data:image/png;base64,AA", fileName: "a", name: "", description: "" }, { dataUrl: "data:image/png;base64,AA", fileName: "b", name: "", description: "" }, { dataUrl: "data:image/png;base64,AA", fileName: "c", name: "", description: "" }] });
        const icon = container.querySelector(".brand-asset-slot-icon")!;
        expect(icon.querySelector(".brand-slot-aside .optional-field input[type=checkbox]")).not.toBeNull();
        // Three images and the slot for a fourth: four rows, on both sides.
        container.querySelectorAll<HTMLElement>(".brand-inventory-rows").forEach(column => expect(column.style.getPropertyValue("--inventory-rows")).toBe("4"));
    });

});
