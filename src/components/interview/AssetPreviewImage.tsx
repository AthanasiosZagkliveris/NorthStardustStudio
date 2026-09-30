import { useEffect, useState } from "react";

/*
    A BRAND FILE'S PREVIEW, WHOLE (Brand › Inventory).

    The box shows the whole picture (object-fit: contain). An SVG can
    still lose part of itself: what it draws past its own viewBox --
    a wordmark set wider than the frame its maker gave it -- is cut
    off by the SVG itself, whatever box it is shown in. So an SVG is
    previewed with its viewBox widened to everything it draws (its
    drawing's bounding box, measured once, off screen). Only the
    preview: the file kept, exported and printed is the one uploaded.
*/

const SVG_PREFIX = /^data:image\/svg\+xml(;base64)?,/;

/** The SVG's markup from its data URL, or null when it is not one. */
function svgMarkup(dataUrl: string): string | null {
    const match = SVG_PREFIX.exec(dataUrl);
    if (!match) {
        return null;
    }
    const body = dataUrl.slice(match[0].length);
    try {
        return match[1] ? atob(body) : decodeURIComponent(body);
    } catch {
        return null;
    }
}

/** The SVG with its viewBox taking in everything it draws; null when it cannot be measured. */
export function wholeSvg(markup: string): string | null {

    if (typeof document === "undefined" || typeof DOMParser === "undefined") {
        return null;
    }

    const parsed = new DOMParser().parseFromString(markup, "image/svg+xml");
    const root = parsed.documentElement;
    if (!root || root.nodeName.toLowerCase() !== "svg" || parsed.getElementsByTagName("parsererror").length > 0) {
        return null;
    }

    // Drawn off screen to be measured; nothing in it runs (an SVG in
    // the page's DOM runs no script it holds unless it is executed,
    // and this one is never shown).
    const holder = document.createElement("div");
    holder.style.cssText = "position:absolute;left:-10000px;top:0;width:0;height:0;overflow:hidden;visibility:hidden";
    const live = document.importNode(root, true) as unknown as SVGSVGElement;
    live.querySelectorAll("script").forEach(script => script.remove());
    holder.appendChild(live);
    document.body.appendChild(holder);

    try {
        const box = typeof live.getBBox === "function" ? live.getBBox() : null;
        if (!box || box.width <= 0 || box.height <= 0) {
            return null;
        }
        const view = (root.getAttribute("viewBox") ?? "").split(/[\s,]+/).map(Number);
        const [x, y, width, height] = view.length === 4 && view.every(Number.isFinite)
            ? view
            : [0, 0, box.width, box.height];
        const left = Math.min(x, box.x);
        const top = Math.min(y, box.y);
        const right = Math.max(x + width, box.x + box.width);
        const bottom = Math.max(y + height, box.y + box.height);
        if (left === x && top === y && right === x + width && bottom === y + height) {
            return null;
        }
        const copy = root.cloneNode(true) as Element;
        copy.setAttribute("viewBox", [left, top, right - left, bottom - top].map(value => Math.round(value * 100) / 100).join(" "));
        // Its own size would keep the old proportions.
        copy.removeAttribute("width");
        copy.removeAttribute("height");
        return new XMLSerializer().serializeToString(copy);
    } catch {
        return null;
    } finally {
        holder.remove();
    }

}

/** The preview image of a brand file: an SVG widened to all it draws, anything else as it is. */
export default function AssetPreviewImage({ dataUrl }: { dataUrl: string }) {

    const [shown, setShown] = useState(dataUrl);

    useEffect(() => {
        const markup = svgMarkup(dataUrl);
        const whole = markup ? wholeSvg(markup) : null;
        setShown(whole ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(whole) : dataUrl);
    }, [dataUrl]);

    return <img src={shown} alt="" />;

}
