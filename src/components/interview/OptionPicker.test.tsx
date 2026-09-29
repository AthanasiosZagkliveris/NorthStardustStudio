import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

import OptionPicker, { controlStep } from "./OptionPicker";
import { stylesheet } from "../../test/stylesheet";

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
    document.documentElement.style.cssText = "--control-s:200px;--control-m:300px;--control-l:420px";
    return trigger;
}

describe("one control-sizing rule for pickers", () => {

    it("takes the smallest standard width that fits its widest option", () => {
        // 34px of padding and border beside the widest option.
        expect(controlStep(triggerWith([120, 166]))).toBe("s");
        expect(controlStep(triggerWith([167]))).toBe("m");
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
        expect(css).toContain("--control-s: 200px; --control-m: 300px; --control-l: 420px;");
        expect(css).toContain(":where(.option-picker[data-size=\"m\"]) { width: min(100%, var(--control-m)); }");
        expect(stylesheet("conversation.css")).toContain("width:min(100%, var(--control-s));");
    });

});
