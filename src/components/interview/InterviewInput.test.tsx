import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import InterviewInput from "./InterviewInput";

const LONG_VALUE = "A long answer that runs on well past the box. ".repeat(20);

// jsdom does no layout, so scrollHeight is always 0 -- stub it to
// stand in for the content height a real browser would measure.
let originalScrollHeight: PropertyDescriptor | undefined;

beforeEach(() => {

    originalScrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight");

    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
        configurable: true,
        get(this: HTMLTextAreaElement) {
            return this.value.length > 100 ? 640 : 120;
        }
    });

});

afterEach(() => {

    cleanup();

    if (originalScrollHeight) {
        Object.defineProperty(HTMLElement.prototype, "scrollHeight", originalScrollHeight);
    }

});

function Field({ autoGrow, initialValue }: { autoGrow?: boolean; initialValue: string }) {

    const [value, setValue] = useState(initialValue);

    return <InterviewInput ariaLabel="Mission" value={value} onChange={setValue} autoGrow={autoGrow} />;

}

describe("InterviewInput autoGrow", () => {

    it("sizes the textarea to its content on mount", () => {

        render(<Field autoGrow initialValue={LONG_VALUE} />);

        const textarea = screen.getByRole("textbox", { name: "Mission" }) as HTMLTextAreaElement;

        expect(textarea.style.height).toBe("640px");
        expect(textarea.style.overflowY).toBe("hidden");

    });

    it("follows the content as the value changes", () => {

        render(<Field autoGrow initialValue="Short" />);

        const textarea = screen.getByRole("textbox", { name: "Mission" }) as HTMLTextAreaElement;

        expect(textarea.style.height).toBe("120px");

        fireEvent.change(textarea, { target: { value: LONG_VALUE } });

        expect(textarea.style.height).toBe("640px");

    });

    it("refits when its width changes", () => {

        // jsdom has no ResizeObserver: capture the callback to fire it
        // by hand, and stand in a narrower box for a narrower window.
        let notify = () => {};

        vi.stubGlobal("ResizeObserver", class {
            constructor(callback: () => void) { notify = callback; }
            observe() {}
            disconnect() {}
        });

        let width = 400;

        const clientWidth = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => width);
        const scrollHeight = vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(() => (width < 400 ? 900 : 640));

        render(<Field autoGrow initialValue={LONG_VALUE} />);

        const textarea = screen.getByRole("textbox", { name: "Mission" }) as HTMLTextAreaElement;

        expect(textarea.style.height).toBe("640px");

        width = 300;
        act(() => notify());

        expect(textarea.style.height).toBe("900px");

        clientWidth.mockRestore();
        scrollHeight.mockRestore();
        vi.unstubAllGlobals();

    });

    it("leaves the height alone with autoGrow off", () => {

        render(<Field autoGrow={false} initialValue={LONG_VALUE} />);

        const textarea = screen.getByRole("textbox", { name: "Mission" }) as HTMLTextAreaElement;

        expect(textarea.style.height).toBe("");

    });

    // Every text box grows with its text unless told not to, so none
    // needs a resize handle (textarea { resize: none }).
    it("grows by default", () => {

        const scrollHeight = vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(() => 640);

        render(<Field initialValue={LONG_VALUE} />);

        expect((screen.getByRole("textbox", { name: "Mission" }) as HTMLTextAreaElement).style.height).toBe("640px");

        scrollHeight.mockRestore();

    });

});
