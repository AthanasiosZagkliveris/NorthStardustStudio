import { describe, expect, it } from "vitest";

import { NUMBER_LIMITS, limitedHexText, limitedNumberText, numberInputMode } from "./numberInput.ts";

describe("limitedNumberText", () => {

    const percent = NUMBER_LIMITS.percent;

    it("keeps digits and one point within the limits", () => {
        expect(limitedNumberText("12", "1", percent)).toBe("12");
        expect(limitedNumberText("12.", "12", percent)).toBe("12.");
        expect(limitedNumberText("12.5", "12.", percent)).toBe("12.5");
        expect(limitedNumberText(".5", ".", percent)).toBe(".5");
        expect(limitedNumberText("100", "10", percent)).toBe("100");
        expect(limitedNumberText("", "5", percent)).toBe("");
    });

    it("blocks letters", () => {
        expect(limitedNumberText("12a", "12", percent)).toBe("12");
        expect(limitedNumberText("€", "", NUMBER_LIMITS.money)).toBe("");
    });

    it("blocks a minus sign", () => {
        expect(limitedNumberText("-", "", percent)).toBe("");
        expect(limitedNumberText("-5", "5", percent)).toBe("5");
    });

    it("blocks a second point", () => {
        expect(limitedNumberText("1.2.", "1.2", percent)).toBe("1.2");
    });

    it("blocks going over the maximum", () => {
        expect(limitedNumberText("150", "15", percent)).toBe("15");
        expect(limitedNumberText("100.5", "100.", percent)).toBe("100.");
        expect(limitedNumberText("601", "60", NUMBER_LIMITS.payments)).toBe("60");
        expect(limitedNumberText("99.9", "99.", NUMBER_LIMITS.cancelPercent)).toBe("99.9");
        expect(limitedNumberText("99.91", "99.9", NUMBER_LIMITS.cancelPercent)).toBe("99.9");
    });

    it("blocks more decimals than allowed", () => {
        expect(limitedNumberText("12.555", "12.55", percent)).toBe("12.55");
        expect(limitedNumberText("33.333", "33.33", NUMBER_LIMITS.ownership)).toBe("33.333");
        expect(limitedNumberText("33.3333", "33.333", NUMBER_LIMITS.ownership)).toBe("33.333");
        expect(limitedNumberText("1.", "1", NUMBER_LIMITS.payments)).toBe("1");
        expect(limitedNumberText("8.25", "8.2", NUMBER_LIMITS.unitHours)).toBe("8.2");
    });

    it("refuses pasted text the same way, whole", () => {
        expect(limitedNumberText("250", "", percent)).toBe("");
        expect(limitedNumberText("2x 30", "", NUMBER_LIMITS.perMonth)).toBe("");
        expect(limitedNumberText("1,200", "", NUMBER_LIMITS.money)).toBe("");
        expect(limitedNumberText("45.5", "", percent)).toBe("45.5");
    });

    it("lets a value saved before the limits be deleted a character at a time", () => {
        expect(limitedNumberText("1,20", "1,200", NUMBER_LIMITS.money)).toBe("1,20");
        expect(limitedNumberText("1,2000", "1,200", NUMBER_LIMITS.money)).toBe("1,200");
    });

    it("asks for the keypad that suits the box", () => {
        expect(numberInputMode(NUMBER_LIMITS.payments)).toBe("numeric");
        expect(numberInputMode(percent)).toBe("decimal");
    });

});

describe("limitedHexText", () => {

    it("keeps a # and up to six hex characters", () => {
        expect(limitedHexText("#", "")).toBe("#");
        expect(limitedHexText("#1a2b3c", "#1a2b3")).toBe("#1a2b3c");
        expect(limitedHexText("1a2", "1a")).toBe("1a2");
        expect(limitedHexText("", "#abc")).toBe("");
    });

    it("blocks anything else", () => {
        expect(limitedHexText("#1a2b3c4", "#1a2b3c")).toBe("#1a2b3c");
        expect(limitedHexText("#12g", "#12")).toBe("#12");
        expect(limitedHexText("##", "#")).toBe("#");
    });

});
