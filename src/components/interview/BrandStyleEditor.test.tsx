import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BrandStyleEditor from "./BrandStyleEditor";
import { asBrandStyleValue, brandStyleSectionsEmpty } from "../../framework/engine/AnswerUtils";

afterEach(cleanup);

function typeInto(input: HTMLInputElement, text: string) {
    for (let length = 1; length <= text.length; length++) {
        fireEvent.change(input, { target: { value: text.slice(0, length) } });
    }
}

function Harness() {
    const [value, setValue] = useState<unknown>(() => {
        const style = asBrandStyleValue(undefined);
        const first = Object.keys(style.hierarchy)[0];
        return {
            ...style,
            colours: style.colours.map((colour, index) => index === 0 ? { ...colour, enabled: true } : colour),
            hierarchy: { ...style.hierarchy, [first]: { ...style.hierarchy[first], enabled: true } }
        };
    });
    return <BrandStyleEditor value={value} onChange={setValue} />;
}

describe("BrandStyleEditor limits", () => {

    it("refuses a size over 120 px and anything but hex in a HEX box", () => {

        render(<Harness />);

        const size = screen.getAllByLabelText(/size in pixels/)[0] as HTMLInputElement;
        typeInto(size, "121");
        expect(size.value).toBe("12");

        const hex = screen.getAllByLabelText(/ HEX$/)[0] as HTMLInputElement;
        typeInto(hex, "#1a2g");
        expect(hex.value).toBe("#1a2");
        typeInto(hex, "#1a2b3c4");
        expect(hex.value).toBe("#1a2b3c");

    });

});

describe("brandStyleSectionsEmpty", () => {

    function style(hex: string, size: string) {
        const base = asBrandStyleValue(undefined);
        const first = Object.keys(base.hierarchy)[0];
        return {
            ...base,
            colours: base.colours.map((colour, index) => ({ ...colour, enabled: index === 0, hex })),
            hierarchy: Object.fromEntries(Object.entries(base.hierarchy).map(([id, level]) =>
                [id, { ...level, enabled: id === first, size }]))
        };
    }

    it("counts a colour only with a whole HEX, and a size only from 8 px", () => {
        expect(brandStyleSectionsEmpty(style("#1a2b3c", "16"))[0]).toBe(false);
        expect(brandStyleSectionsEmpty(style("#abc", "16"))[0]).toBe(false);
        expect(brandStyleSectionsEmpty(style("#1a2b", "16"))[0]).toBe(true);
        expect(brandStyleSectionsEmpty(style("#1a2b3c", "8"))[2]).toBe(false);
        expect(brandStyleSectionsEmpty(style("#1a2b3c", "7"))[2]).toBe(true);
    });

});
