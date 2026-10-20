import { describe, expect, it } from "vitest";

import { columnCountFor, distributeAcross } from "./CardColumns.tsx";

describe("CardColumns", () => {

    it("counts as many columns as fit, between one and the most", () => {
        expect(columnCountFor(1331, 410, 12)).toBe(3);
        expect(columnCountFor(1331, 410, 12, 2)).toBe(2);
        expect(columnCountFor(832, 410, 12)).toBe(2);
        expect(columnCountFor(831, 410, 12)).toBe(1);
        expect(columnCountFor(0, 410, 12)).toBe(1);
        expect(columnCountFor(300, 410, 12)).toBe(1);
    });

    it("sends card i to column (i - 1) mod N, so the numbering still counts across", () => {
        expect(distributeAcross([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 4, 7], [2, 5], [3, 6]]);
        expect(distributeAcross([1, 2], 3)).toEqual([[1], [2], []]);
        expect(distributeAcross([1, 2, 3], 1)).toEqual([[1, 2, 3]]);
    });

});
