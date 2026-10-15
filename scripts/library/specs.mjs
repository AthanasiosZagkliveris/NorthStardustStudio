/**
 * The words for the size, text, shape and spacing of a component, shared by the documents, the PDF and the
 * spreadsheets, so that every one of them says the same.
 */
export const px = n => (n === null || n === undefined ? "" : n + " px");

/** Sizes measured by the scan for components that have no look of their own. */
export const EXTRA = {
    "BTN.003": { height: "25 px", width: "76 px", note: "measured by the scan: the Back button and its word" },
    "ARW.001": { height: "44 px", width: "24 px", note: "measured by the scan: page arrow and carousel arrow; each grows 1.2 times on hover" },
    "BUL.001": { height: "12 px (17.4 px when selected)", width: "12 px (17.4 px when selected)", note: "measured by the scan; the one bullet of every page tag" },
    "CAL.001": { height: "160 px (the handle)", width: "44 px (the handle)", note: "measured by the scan: the handle of the side panel" },
    "CAL.HND.001.001": { height: "160 px", width: "44 px", note: "measured by the scan" }
};
/** The width of the components whose width is not a number of their own. */
export const WIDTH = {
    "BTN.001": "32 px (a square)", "BTN.002": "24 px (a circle)", "BTN.003": "76 px", "BTN.004": "fills its column", "BTN.005": "107.5 px (a square)", "BTN.006": "follows its words (100 to 135 px)",
    "DRP.001": "set by the layout (fills its column)", "TIK.001": "24 px (a square)", "TXT.001": "set by the layout (fills its column)", "LST.001": "fills its column", "DAT.001": "set by the layout", "DAT.002": "fits its calendar",
    "PCK.001": "44 px (a square)", "IMG.001": "448 px (the width of the card less its padding)", "DIV.001": "fills its column", "LBL.001": "fits its words", "TTL.001": "fits its words", "LNK.001": "fits its words", "HLP.001": "fits its words", "MSG.001": "fits its words",
    "ARW.002": "36 px (the fold arrow)", "ARW.LAB.002.001": "24 px", "ARW.TTL.002.002": "28 px", "ICN.001": "36 px",
    "FRM.CHP.001.001": "the width of the page (1400 px)", "FRM.MTL.001.002": "328 px", "FRM.NTL.001.003": "214 px", "FRM.FLC.001.004": "492 px (a founder's 297 px)", "FRM.NSC.001.005": "the width of the chapter (624, 554, 484 px by depth)", "FRM.TAG.001.006": "37 px (bullets only)", "FRM.TIL.001.007": "set by the layout", "FRM.CRD.001.008": "set by the layout",
    "FRM.002": "the width of the page", "FRM.003": "the width of the page", "FRM.001": "per variant"
};
/** The height of what has no height of its own. */
export const HEIGHT = {
    "FRM.CHP.001.001": "follows its contents", "FRM.MTL.001.002": "328 px (a square)", "FRM.NTL.001.003": "214 px (a square)", "FRM.FLC.001.004": "follows its contents", "FRM.NSC.001.005": "follows its contents", "FRM.TAG.001.006": "follows the items (76 to 351 px)",
    "FRM.TIL.001.007": "set by the layout", "FRM.CRD.001.008": "follows its contents", "FRM.002": "follows its contents", "FRM.003": "follows its contents", "FRM.001": "per variant", "DAT.002": "fits its calendar", "DAT.DAY.002.001": "fits its calendar", "DAT.MON.002.002": "fits its calendar",
    "CAL.PNL.001.002": "not measured"
};

export const heightText = (l, code) => (HEIGHT[code] ?? (l.height === null ? "follows the words" + (l.minHeight ? ", at least " + l.minHeight + " px" : "") : px(l.height)));
export const widthText = (l, code, parent) => (l.width ? px(l.width) : WIDTH[code] ?? (parent ? WIDTH[parent] : undefined) ?? "set by the layout");
export const textSize = l => (l.fontSize ? l.fontSize + " px (" + l.scale + ")" : "no text (a symbol)");
export const corner = l => (parseFloat(l.corners) === 0 ? "–" : l.corners.replace("px", " px"));

/** The height and the width an asset shows in a table: its own, else its variants', else what was measured, else "not measured". */
export function sizeOf(a) {
    const l = a.look;
    const ex = EXTRA[a.code];
    if (l) return { height: heightText(l, a.code), width: widthText(l, a.code), corners: corner(l), text: textSize(l) };
    const own = a.variants.filter(v => v.look);
    if (own.length) {
        const range = (list, unit = " px") => { const n = list.filter(x => typeof x === "number"); return n.length ? (Math.min(...n) === Math.max(...n) ? Math.min(...n) : Math.min(...n) + " to " + Math.max(...n)) + unit : "per variant"; };
        const sizes = [...new Set(own.map(v => corner(v.look)))];
        return { height: HEIGHT[a.code] ?? range(own.map(v => v.look.height)), width: WIDTH[a.code] ?? range(own.map(v => v.look.width ?? null)), corners: sizes.join(", "), text: [...new Set(own.map(v => v.look.fontSize ? v.look.fontSize + " px" : "no text"))].join(", ") };
    }
    return { height: HEIGHT[a.code] ?? ex?.height ?? "not measured", width: WIDTH[a.code] ?? ex?.width ?? "not measured", corners: "–", text: "not measured" };
}

/** The same for a variant: its own look, else the asset's. */
export function variantSizeOf(a, v) {
    const l = v.look ?? a.look;
    const ex = EXTRA[v.code];
    if (l) return { height: heightText(l, v.code), width: widthText(l, v.code, a.code), corners: corner(l), text: textSize(l) };
    const p = sizeOf(a);
    const own = (x, y) => (/^(not measured|per variant)/.test(x) ? "not measured" : x + (y ? " (as the asset)" : ""));
    return { height: HEIGHT[v.code] ?? ex?.height ?? own(p.height, true), width: WIDTH[v.code] ?? ex?.width ?? own(p.width, true), corners: p.corners.split(", ").length > 1 ? "–" : p.corners, text: own(p.text, true) };
}
