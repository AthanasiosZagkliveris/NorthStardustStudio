import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import OptionPicker, { controlStep } from "./OptionPicker";
import { stylesheet } from "../../../test/stylesheet";

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    document.documentElement.style.cssText = "";
});

/** A trigger whose options measure `widths` px, with 8 + 24 px of padding and 1px borders. */
function triggerWith(widths: number[]): HTMLElement {
    const trigger = document.createElement("button");
    trigger.style.cssText = "padding-left:8px;padding-right:24px;border-left:1px solid;border-right:1px solid";
    widths.forEach(() => {
        const span = document.createElement("span");
        span.className = "option-picker-sizer";
        span.textContent = "x";
        trigger.append(span);
    });
    let call = 0;
    vi.spyOn(document, "createRange").mockImplementation(() => ({
        selectNodeContents: () => undefined,
        getBoundingClientRect: () => ({ width: widths[call++] ?? 0 })
    }) as unknown as Range);
    document.documentElement.style.cssText = "--control-s:220px;--control-m:300px;--control-l:420px";
    return trigger;
}

describe("one control-sizing rule for pickers", () => {

    it("takes the smallest standard width that fits its widest option", () => {
        // 34px of padding and border beside the widest option.
        expect(controlStep(triggerWith([120, 186]))).toBe("s");
        expect(controlStep(triggerWith([187]))).toBe("m");
        expect(controlStep(triggerWith([300]))).toBe("l");
        expect(controlStep(triggerWith([387]))).toBe("full");
    });

    it("says its step on the picker", () => {
        const { container } = render(
            <OptionPicker label="Funding Schedule" options={["One-time", "Periodic"]} value="" onChange={() => {}} />
        );
        expect(container.querySelector(".option-picker")?.getAttribute("data-size")).toMatch(/^(s|m|l|full)$/);
    });

    it("defines the steps once and sizes by them, never a width of its own", () => {
        const css = stylesheet("global.css");
        expect(css).toContain("--control-s: 220px; --control-m: 300px; --control-l: 420px;");
        expect(css).toContain(":where(.option-picker[data-size=\"m\"]) { width: min(100%, var(--control-m)); }");
        expect(stylesheet("conversation.css")).toContain("width:min(100%, var(--control-s));");
    });

});

describe("one option is a record, not a dropdown (owner, 2026-11-14 14:21 and 14:26)", () => {

    it("shows the one option read only and saves it; a second option makes a dropdown again", () => {
        const onChange = vi.fn();
        const { rerender } = render(<OptionPicker label="Group" options={["Devices & Tools"]} value="" onChange={onChange} />);
        const record = screen.getByRole("textbox", { name: "Group: Devices & Tools" });
        expect(record.getAttribute("aria-readonly")).toBe("true");
        expect(screen.queryByRole("button")).toBeNull();
        expect(onChange).toHaveBeenCalledWith("Devices & Tools");
        rerender(<OptionPicker label="Group" options={["Devices & Tools", "Production Machinery"]} value="Devices & Tools" onChange={onChange} />);
        expect(screen.getByRole("button", { name: /^Group: / })).toBeTruthy();
    });

    it("keeps a dropdown where none is an answer too (an optional link), and for an option that does something", () => {
        const onChange = vi.fn();
        render(<><OptionPicker label="Resource" options={["Kiln"]} value="" keepChoice onChange={onChange} /><OptionPicker label="Add" options={["+ Add"]} value="" onChange={onChange} /></>);
        expect(screen.getByRole("button", { name: /^Resource: / })).toBeTruthy();
        expect(screen.getByRole("button", { name: /^Add: / })).toBeTruthy();
        expect(onChange).not.toHaveBeenCalled();
    });

});
