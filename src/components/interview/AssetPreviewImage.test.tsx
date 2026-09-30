import { afterEach, describe, expect, it } from "vitest";

import { wholeSvg } from "./AssetPreviewImage";

const proto = (globalThis as unknown as { SVGElement: { prototype: Record<string, unknown> } }).SVGElement.prototype;
const original = proto.getBBox;

afterEach(() => {
    proto.getBBox = original;
});

describe("a brand file's preview, whole", () => {

    it("widens an SVG's viewBox to everything it draws, a wordmark past its frame included", () => {
        proto.getBBox = () => ({ x: 0, y: 0, width: 341.58, height: 64 });
        const whole = wholeSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 64" width="320"><text x="80" y="42">LUMEN &amp; LOOM</text></svg>');
        expect(whole).toContain('viewBox="0 0 341.58 64"');
        expect(whole).not.toContain('width="320"');
    });

    it("leaves an SVG that draws inside its frame as it is", () => {
        proto.getBBox = () => ({ x: 4, y: 4, width: 100, height: 40 });
        expect(wholeSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 64"><rect x="4" y="4" width="100" height="40"/></svg>')).toBeNull();
    });

});
