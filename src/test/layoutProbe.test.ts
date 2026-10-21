import { beforeAll, describe, expect, it } from "vitest";

import probe from "../../tools/scripts/layout-check/layout-probe.js?raw";

/*
    The layout check's pure helpers (tools/scripts/layout-check/layout-probe.js,
    docs/ai/layout-rules.md): the parts of the probe that decide what is
    "equal", what is "one row" and what is misaligned, tested away from
    a browser. The in-page checks themselves are run by the layout check.
*/

interface Box { top: number; left: number; label?: string }

interface Rules {
    near(one: number, other: number, tolerance?: number): boolean;
    rowsOf(boxes: Box[], tolerance?: number): Box[][];
    distinct(values: number[]): { value: number; count: number }[];
    misalignedLefts(boxes: Box[], tolerance?: number): (Box & { expected: number })[];
}

let rules: Rules;

beforeAll(() => {
    new Function(probe)();
    rules = (globalThis as unknown as { __layoutRules: Rules }).__layoutRules;
});

describe("the layout probe's rules", () => {

    it("counts two measures as equal within the tolerance, and a hundredth over for rounding", () => {
        expect(rules.near(12, 12.5, 0.5)).toBe(true);
        expect(rules.near(12, 12.51, 0.5)).toBe(true);
        expect(rules.near(12, 12.52, 0.5)).toBe(false);
        expect(rules.near(44.33, 45, 1)).toBe(true);
    });

    it("groups boxes whose tops are close into one row, top to bottom", () => {
        const rows = rules.rowsOf([{ top: 50, left: 0 }, { top: 10, left: 0 }, { top: 12, left: 5 }], 6);
        expect(rows.map(row => row.map(box => box.top))).toEqual([[10, 12], [50]]);
    });

    it("lists the distinct values in use, the commonest first", () => {
        expect(rules.distinct([8, 8, 8.04, 26.5])).toEqual([{ value: 8, count: 3 }, { value: 26.5, count: 1 }]);
    });

    it("names the controls of a column whose left edge is not the first's", () => {
        const off = rules.misalignedLefts([{ top: 0, left: 100, label: "a" }, { top: 50, left: 100.3, label: "b" }, { top: 99, left: 118.5, label: "c" }], 0.5);
        expect(off).toEqual([{ top: 99, left: 118.5, label: "c", expected: 100 }]);
    });

});
