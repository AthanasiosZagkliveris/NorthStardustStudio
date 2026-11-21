/**
 * The words for the size, text, shape and spacing of a component, shared by the documents, the PDF and the
 * spreadsheets, so that every one of them says the same.
 */
export const px = n => (n === null || n === undefined ? "" : n + " px");

/** Sizes measured by the scan for components that have no look of their own. */
export const EXTRA = {
    "ARW.001": { height: "44 px", width: "24 px", note: "measured by the scan: page arrow and carousel arrow; each grows 1.2 times on hover" },
    "BUL.001": { height: "12 px (17.4 px when selected)", width: "12 px (17.4 px when selected)", note: "measured by the scan; the one bullet of every page tag" },
    "CAL.001": { height: "160 px (the handle)", width: "44 px (the handle)", note: "measured by the scan: the handle of the side panel" },
    "CAL.HND.001.001": { height: "160 px", width: "44 px", note: "measured by the scan" }
};
/** The width of the components whose width is not a number of their own. */
export const WIDTH = {
    "BTN.001": "32 px (a square)", "BTN.002": "24 px (a circle)", "BTN.004": "fills its column", "BTN.005": "107.5 px (a square)", "BTN.006": "follows its words (100 to 135 px)",
    "DRP.001": "control = 'dropdown' and function not like '%Searchable%'", "DRP.SRC.001.001": "control = 'dropdown' and function like '%Searchable%'",
    "PCK.001": "44 px (a square)", "IMG.001": "448 px (the width of the card less its padding)", "DIV.001": "fills its column", "LBL.001": "fits its words", "TTL.001": "fits its words", "LNK.001": "fits its words", "HLP.001": "fits its words", "MSG.001": "fits its words",
    "ARW.002": "36 px (the fold arrow)", "ARW.LAB.002.001": "24 px", "ARW.TTL.002.002": "28 px", "ICN.001": "36 px",
    "FRM.CHP.001.001": "the width of the page (1400 px)", "FRM.MTL.001.002": "328 px", "FRM.NTL.001.003": "214 px", "FRM.FLC.001.004": "492 px (a founder's 297 px)", "FRM.NSC.001.005": "the width of the chapter (624, 554, 484 px by depth)", "FRM.TAG.001.006": "hugs its content (adjustable): 37 px with bullets only", "FRM.TIL.001.007": "set by the layout", "FRM.CRD.001.008": "set by the layout",
    "FRM.002": "the width of the page", "FRM.003": "the width of the page", "FRM.001": "per variant"
};
/** The height of what has no height of its own. */
export const HEIGHT = {
    "FRM.CHP.001.001": "follows its contents", "FRM.MTL.001.002": "328 px (a square)", "FRM.NTL.001.003": "214 px (a square)", "FRM.FLC.001.004": "follows its contents", "FRM.NSC.001.005": "follows its contents", "FRM.TAG.001.006": "hugs its content (adjustable)",
    "FRM.TIL.001.007": "set by the layout", "FRM.CRD.001.008": "follows its contents", "FRM.002": "follows its contents", "FRM.003": "follows its contents", "FRM.001": "per variant", "DAT.002": "fits its calendar", "DAT.DAY.002.001": "fits its calendar", "DAT.MON.002.002": "fits its calendar",
    "CAL.PNL.001.002": "not measured"
};
WIDTH["CAL.PNL.001.002"] = "not measured";

/** The text size of what has no look of its own (a symbol has none; the side panel's handle is off the scale). */
export const TEXT = { "ARW.001": "no text (a symbol)", "BUL.001": "no text (a dot)", "LNK.SYM.001.003": "no text (a symbol)", "CAL.001": "16 px (off the scale)", "CAL.HND.001.001": "16 px (off the scale)", "FRM.002": "the texts inside", "FRM.003": "the texts inside" };
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
    return { height: HEIGHT[a.code] ?? ex?.height ?? "not measured", width: WIDTH[a.code] ?? ex?.width ?? "not measured", corners: "–", text: TEXT[a.code] ?? "not measured" };
}

/** The same for a variant: its own look, else the asset's. */
export function variantSizeOf(a, v) {
    const l = v.look ?? a.look;
    const ex = EXTRA[v.code];
    if (l) return { height: heightText(l, v.code), width: widthText(l, v.code, a.code), corners: corner(l), text: textSize(l) };
    const p = sizeOf(a);
    const own = (x, y) => (/^(not measured|per variant)/.test(x) ? "not measured" : x + (y ? " (as the asset)" : ""));
    return { height: HEIGHT[v.code] ?? ex?.height ?? own(p.height, true), width: WIDTH[v.code] ?? ex?.width ?? own(p.width, true), corners: p.corners.split(", ").length > 1 ? "–" : p.corners, text: TEXT[v.code] ?? TEXT[a.code] ?? own(p.text, true) };
}

/** Which rows of the catalogue's card tables (docs/design/records/07-structure-tables.md) use a component or variant. */
const FIELDS = {
    "DRP.001": "control = 'dropdown' and function not like '%Searchable%'", "DRP.SRC.001.001": "control = 'dropdown' and function like '%Searchable%'",
    "TXT.001": "control = 'text box' and field <> 'Name'", "TXT.NAM.001.002": "control = 'text box' and field = 'Name'", "TXT.ARE.001.001": "control = 'optional note'",
    "TXT.WHL.001.003": "control = 'number box' and function like '%whole%'", "TXT.DEC.001.004": "control = 'number box' and function like '%decimal%'", "TXT.SQR.001.005": "control = 'number box' and (instr(function, '(%)') > 0 or instr(function, '(years)') > 0)",
    "DAT.001": "control = 'date cell'", "TIK.001": "control in ('tick box', 'tick list (+ number)', 'extra (tick + number)', 'tick + dropdown')", "BTN.007": "control = 'link symbol'",
    "BTN.001": "control = 'x'", "BTN.ADD.001.001": "control = 'plus'", "BTN.SML.004.002": "control = 'button'"
};
export const fieldsOf = (db, code) => {
    if (!FIELDS[code]) return null;
    const rows = db.prepare("select field, count(*) n from variant_rows where " + FIELDS[code] + " group by field order by n desc").all();
    if (!rows.length) return null;
    const names = rows.slice(0, 12).map(r => r.field);
    return names.join(", ") + (rows.length > 12 ? " and " + (rows.length - 12) + " more" : "");
};


/** What happens under the pointer and the keyboard, in words (measured: docs/design/records/06-catalogue-record.md). */
export const REACTION = {
    "BTN.001": "Hover and focus: the box fills with its colour and the symbol turns light.",
    "BTN.002": "Hover and focus: the circle fills with its colour and the i turns light.",
    "BTN.003": "Hover and focus: the text turns blue.",
    "BTN.004": "Hover: the ground takes its hover tone and a 4px glow (18%) appears. Focus: the glow only (28%), no outline. Disabled: faint words, the card's line, the not-allowed cursor.",
    "BTN.005": "Hover and focus: the dashed line goes, the ground becomes 16% of the tile's colour, the plus and the words take the card's dark tint; nothing scales. Disabled: 60% opaque, not-allowed cursor.",
    "BTN.007": "Not read yet.",
    "DRP.001": "Hover: the inset edge glows. Focus: a blue ring. In use: the glow and a wire in the contrast colour.",
    "TIK.001": "Hover: a blue ring inside the box. Focus: the browser's outline.",
    "TXT.001": "Hover: the inset edge glows. Focus: a blue ring. While typing: the glow and a wire in the contrast colour. A number box: no change under the pointer.",
    "LST.001": "Like the holders: the edge glows under the pointer, a blue ring on focus; Enter opens the next row.",
    "DAT.001": "The calendar button fills with a light blue and takes a blue border on hover.",
    "DAT.002": "Not read yet.",
    "DIV.001": "None.",
    "LBL.001": "None.",
    "TTL.001": "None, except the card title: it is a link (underlined and bolder under the pointer and the focus).",
    "LNK.001": "Underlined and bolder under the pointer and the focus.",
    "HLP.001": "None.",
    "ARW.001": "Hover and focus: the arrow grows 1.2 times; focus adds a 2 px blue outline.",
    "ARW.002": "Outline at rest; filled under the pointer and the focus.",
    "BUL.001": "Rest 12px. Hover and focus: 15.6px, a darker fill, a 3px ring, the label underlined (a tooltip in the compact tag). Selected: 17.4px, a 4px bloom (25px in all), a bold label. All in 0.2s."
};

/** Where the options of a dropdown come from. */
export const SOURCE = {
    Status: "prefilled", Frequency: "prefilled", Currency: "prefilled", Unit: "prefilled", Plan: "prefilled", "Cost option": "prefilled", "Cost options": "prefilled", Type: "prefilled", Category: "prefilled",
    Group: "dependent", Activity: "generated", Performer: "generated", Resource: "generated", Responsibility: "generated", "Linked registration": "generated", Name: "prefilled suggestions; the option Other opens a text box", Rent: "generated; the option Other opens a text box"
};
export const DETAIL = {
    Group: "The groups of the chosen Category in this place (the list depends on the Category).", Category: "The categories of this place.", Activity: "The activities that have not ended at the card's Start date, with their category (generated from the activities of the place).",
    Performer: "The founders first, then the partners and suppliers of the same place (generated from the founders and the partners).", Resource: "The resources of the place (generated from the Resources).", Responsibility: "The founders; shown when there is more than one founder.",
    "Linked registration": "The registrations and requirements already recorded on the page; only one can be chosen.", Rent: "The suppliers in Property, Vehicles & Facilities; opens or creates a card; Other adds a new one.", Name: "Suggested partners or suppliers of the chosen group; Other adds a name.",
    Status: "Exists / Free; Rent; Activity; Buy (the options follow the card).", Frequency: "Weekly, Monthly or Annually (a project: Per project).", Currency: "A searchable list of currencies.", Unit: "The units of a quantity.", Plan: "The payment plan options.", "Cost option": "The cost options of the group (Percentage, Fixed amount, Lump sum...).", Type: "Capital Expenditure; Start-up Expenses."
};
