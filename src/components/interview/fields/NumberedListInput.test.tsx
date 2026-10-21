import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import NumberedListInput from "./NumberedListInput";

afterEach(cleanup);

const line = (n: number) => screen.getByLabelText("Items " + n) as HTMLTextAreaElement;

describe("NumberedListInput's origins: where each line came from", () => {

    it("keeps every line where it was while one is typed into", () => {
        const onChange = vi.fn();
        render(<NumberedListInput label="Items" items={["a", "b"]} onChange={onChange} />);
        fireEvent.change(line(2), { target: { value: "bc" } });
        expect(onChange).toHaveBeenLastCalledWith(["a", "bc"], [0, 1]);
    });

    it("marks a line opened by Enter as new, and moves the ones under it down", () => {
        const onChange = vi.fn();
        render(<NumberedListInput label="Items" items={["a", "b", "c"]} onChange={onChange} />);
        fireEvent.keyDown(line(1), { key: "Enter" });
        expect(onChange).toHaveBeenLastCalledWith(["a", "", "b", "c"], [0, -1, 1, 2]);
    });

    it("drops a line removed by Backspace, and moves the ones under it up", () => {
        const onChange = vi.fn();
        render(<NumberedListInput label="Items" items={["a", "", "c"]} onChange={onChange} />);
        fireEvent.keyDown(line(2), { key: "Backspace" });
        expect(onChange).toHaveBeenLastCalledWith(["a", "c"], [0, 2]);
    });

    it("follows a line dragged to another place", () => {
        const onChange = vi.fn();
        render(<NumberedListInput label="Items" items={["a", "b", "c"]} onChange={onChange} />);
        const rows = [...document.querySelectorAll(".numbered-list-row")] as HTMLElement[];
        const dataTransfer = { setData: () => {}, effectAllowed: "", dropEffect: "" };
        fireEvent.mouseDown(rows[0].querySelector(".numbered-list-number")!);
        fireEvent.dragStart(rows[0], { dataTransfer });
        fireEvent.dragOver(rows[2], { dataTransfer });
        fireEvent.drop(rows[2], { dataTransfer });
        expect(onChange).toHaveBeenLastCalledWith(["b", "c", "a"], [1, 2, 0]);
    });

    it("draws each line's own end and placeholder where asked, and only the first placeholder where not", () => {
        render(
            <NumberedListInput
                label="Items"
                items={["", ""]}
                onChange={() => undefined}
                placeholderFor={(index) => "Line " + (index + 1)}
                lineEnd={(index) => <button type="button">End {index + 1}</button>}
            />
        );
        expect(line(1).placeholder).toBe("Line 1");
        expect(line(2).placeholder).toBe("Line 2");
        expect(screen.getByRole("button", { name: "End 2" }).closest(".numbered-list-line-end")).toBeTruthy();

        cleanup();
        render(<NumberedListInput label="Items" items={["", ""]} onChange={() => undefined} placeholder="First" />);
        expect(line(1).placeholder).toBe("First");
        expect(line(2).placeholder).toBe("");
        expect(document.querySelector(".numbered-list-line-end")).toBeNull();
    });

});
