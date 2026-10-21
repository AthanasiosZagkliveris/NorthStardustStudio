import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useItemFolds } from "./useItemFolds";

describe("useItemFolds", () => {

    it("starts with every item closed", () => {

        const { result } = renderHook(() => useItemFolds());

        expect(result.current.isOpen("a")).toBe(false);

    });

    it("toggles one item and expands a new one", () => {

        const { result } = renderHook(() => useItemFolds());

        act(() => result.current.toggle("a"));
        expect(result.current.isOpen("a")).toBe(true);

        act(() => result.current.toggle("a"));
        expect(result.current.isOpen("a")).toBe(false);

        act(() => result.current.expand("b"));
        act(() => result.current.expand("b"));
        expect(result.current.isOpen("b")).toBe(true);

    });

    it("opens and closes a whole group", () => {

        const { result } = renderHook(() => useItemFolds());

        act(() => result.current.setAll(["a", "b"], true));
        expect(result.current.allOpen(["a", "b"])).toBe(true);

        act(() => result.current.setAll(["a"], false));
        expect(result.current.isOpen("a")).toBe(false);
        expect(result.current.isOpen("b")).toBe(true);
        expect(result.current.allOpen(["a", "b"])).toBe(false);

    });

    it("treats an empty group as not all open", () => {

        const { result } = renderHook(() => useItemFolds());

        expect(result.current.allOpen([])).toBe(false);

    });

});
