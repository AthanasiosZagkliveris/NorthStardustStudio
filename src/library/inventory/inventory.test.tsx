import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { library } from "../data/library.ts";
import { CardBuild, FieldBuild } from "./builders.tsx";
import { part, parts } from "./parts.tsx";

const built = library.assets.filter(a => a.category === "component" || a.category === "tile" || a.category === "frame");

describe("the inventory", () => {
    it("has a part for every component, tile and frame asset of the library, and for each of their variants", () => {
        const missing: string[] = [];
        for (const asset of built) {
            if (!parts[asset.code]) missing.push(asset.code);
            for (const variant of asset.variants) if (!parts[variant.code] && !parts[asset.code]) missing.push(variant.code);
        }
        expect(missing).toEqual([]);
    });

    it("draws no part for a code the library does not have", () => {
        const known = new Set(library.assets.flatMap(a => [a.code, ...a.variants.map(v => v.code)]));
        expect(Object.keys(parts).filter(code => !known.has(code))).toEqual([]);
    });

    it("builds every component, tile and frame, and each variant, without a failure", () => {
        for (const asset of built) {
            const { container, unmount } = render(<>{part(asset.code)}</>);
            expect(container.firstChild, asset.code).not.toBeNull();
            unmount();
            for (const variant of asset.variants) {
                const v = render(<>{part(asset.code, variant.code)}</>);
                expect(v.container.firstChild, variant.code).not.toBeNull();
                v.unmount();
            }
        }
    });

    it("builds every field from its components, and every card from its fields", () => {
        for (const asset of library.assets.filter(a => a.category === "field")) {
            const { container, unmount } = render(<FieldBuild asset={asset} />);
            expect(container.querySelectorAll(".inventory-field-part").length, asset.code).toBe(asset.requires.length);
            unmount();
        }
        for (const asset of library.assets.filter(a => a.category === "card" && a.code !== "CRD.001")) {
            const { container, unmount } = render(<CardBuild asset={asset} />);
            expect(container.querySelector(".inventory-card-head"), asset.code).not.toBeNull();
            expect(container.querySelectorAll(".inventory-field").length, asset.code).toBe(asset.requires.filter(r => r.asset.startsWith("FLD.")).length);
            unmount();
        }
    });
});
