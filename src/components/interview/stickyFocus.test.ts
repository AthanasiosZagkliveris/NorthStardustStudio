import { afterEach, describe, expect, it, vi } from "vitest";
import { installFocusClearOfStickyTitle } from "./stickyFocus";

const box = (top: number, bottom: number) => ({ top, bottom, left: 0, right: 100, width: 100, height: bottom - top, x: 0, y: top, toJSON: () => ({}) }) as DOMRect;

afterEach(() => { document.body.innerHTML = ""; vi.restoreAllMocks(); });

describe("a focused field is never hidden under the sticky title", () => {

    installFocusClearOfStickyTitle();

    function page(fieldTop: number, fieldBottom: number) {
        document.body.innerHTML = "<div class='interview-header' style='position: sticky'>Title</div><input id='field'>";
        const band = document.querySelector(".interview-header") as HTMLElement;
        const field = document.getElementById("field") as HTMLInputElement;
        vi.spyOn(band, "getBoundingClientRect").mockReturnValue(box(80, 173));
        vi.spyOn(field, "getBoundingClientRect").mockReturnValue(box(fieldTop, fieldBottom));
        const scrollBy = vi.spyOn(window, "scrollBy").mockImplementation(() => undefined);
        return { field, scrollBy };
    }

    it("scrolls a field reached under the band clear of it, 8px below", () => {
        const { field, scrollBy } = page(130, 169);
        field.focus();
        expect(scrollBy).toHaveBeenCalledWith({ top: 130 - 173 - 8, behavior: "auto" });
    });

    it("leaves a field that is already clear where it is", () => {
        const { field, scrollBy } = page(300, 340);
        field.focus();
        expect(scrollBy).not.toHaveBeenCalled();
    });

});
