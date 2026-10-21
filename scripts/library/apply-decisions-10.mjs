/**
 * The owner's decisions of 2026-10-15, tenth set, applied to the library once (a migration, kept as the record;
 * the changes are then logged with npm run library:log):
 *
 *   - The Calendar Box is the calendar of the side panel (the organisation calendar), with the Calendar,
 *     Capabilities and Systems handles. Recorded only, as the owner asked; there will be one calendar.
 *   - The frame also has a regular tile and a regular card; the tag is the page tag.
 *   - The bullets are navigation controls, with the arrows that move between pages and cards.
 *
 *   node scripts/library/apply-decisions-10.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../src/library/data/library.ts";

const DATE = "owner, 2026-10-15";
const assets = structuredClone(library.assets);
const families = structuredClone(library.families);
const asset = code => assets.find(a => a.code === code);
const note = (a, text) => { a.lookNotes = [...(a.lookNotes ?? []), text]; };
const V = (code, name, description, edits, look) => ({ code, name, description, edits, values: {}, ...(look ? { look } : {}) });

// ---- the bullets are navigation controls
const ctrl = families.find(f => f.code === "CTRL");
ctrl.groups = [
    { code: "CTRL.BTN", name: "Buttons", description: "The buttons: the box button (delete, add, shrink), the info button, Back, the add buttons, the tool buttons.", characteristics: ["An outlined box or a word, with no fill at rest"] },
    { code: "CTRL.NAV", name: "Navigation controls", description: "What moves a person between pages, sections, views and cards: the bullets of the page tags and the arrows.", characteristics: ["Shows where the person is and moves them on", "The arrow grows under the pointer; the bullet changes colour or opacity, and the selected bullet is larger"] },
    { code: "CTRL.FLD", name: "Fold controls", description: "The triangles that fold and unfold a card, a list or a label.", characteristics: ["A triangle; outline at rest, filled under the pointer"] }
];
const mark = families.find(f => f.code === "MARK");
mark.groups = mark.groups.filter(g => g.code !== "MARK.BUL");
asset("BUL.001").group = "CTRL.NAV";
asset("ARW.001").group = "CTRL.NAV";
asset("ARW.002").group = "CTRL.FLD";
note(asset("BUL.001"), "the bullets are navigation controls (the owner, " + DATE + "): they move between pages, sections, views and cards, like the page and carousel arrows.");

// ---- the frame: a regular tile and a regular card, and the page tag
const frame = asset("FRM.001");
const surface = { height: null, fontSize: 0, fontWeight: "400", corners: "8px", paddingLeft: 12, paddingTop: 12, border: 0, scale: "symbol, no text", found: 0 };
frame.variants.find(v => v.code === "FRM.TAG.001.006").description = "The surface of the page tag (the tab behind the bullets of a page tag): bullets only, a 37px tab.";
frame.variants.find(v => v.code === "FRM.TAG.001.006").edits = "A tab at the side of a page or a card; it holds the page tag. Not measured.";
frame.variants.push(
    V("FRM.TIL.001.007", "Tile", "The regular tile: a rounded, coloured surface that carries a title and what it holds. The master tile and the nested tile are its variants by where they stand.", "The regular tile surface; 8px corners.", { ...surface }),
    V("FRM.CRD.001.008", "Card", "The regular card: a rounded, coloured surface that carries fields and tools. The floating card and the nested card are its variants by where they stand.", "The regular card surface; 8px corners.", { ...surface, border: 1 })
);
note(frame, "the frame also has a regular tile and a regular card, and the tag is the page tag (the owner, " + DATE + ").");

// ---- the calendar box
families.find(f => f.code === "FRAME").groups.push({ code: "FRAME.PNL", name: "Side panels", description: "The panels at the side of the app that open over the page: the calendar box (with the Capabilities and Systems handles).", characteristics: ["Opens from a handle at the side of the window"] });
const calendar = {
    code: "CAL.001", name: "calendar box", category: "component", group: "FRAME.PNL",
    summary: "The calendar of the side panel (the organisation calendar), opened from a handle at the left of the window. Recorded only: there will be one calendar, and the handles of Calendar, Capabilities and Systems are to be replaced later (the owner, " + DATE + ").",
    variables: ["VAR001", "VAR003", "VAR004"], catalogue: ["CA01", "CA02", "CA03"],
    variants: [
        V("CAL.HND.001.001", "Handle", "The handle that opens a section of the side panel (Calendar, Capabilities, Systems): a tab 44px wide and 160px high, with its word written sideways.", "A tab at the left edge of the window."),
        V("CAL.PNL.001.002", "Panel", "The panel that opens: the calendar of the organisation, the capabilities or the systems. Its content was not recorded.", "The opened side panel; not measured.")
    ],
    requires: [],
    lookNotes: ["handles measured: 44 by 160px, 16px type; the calendar content is not recorded (the owner: record only, no library work until the single calendar is designed)."]
};
assets.splice(assets.findIndex(a => a.code === "ICN.001") + 1, 0, calendar);

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by scripts/library/seed-library.mjs from the catalogue (docs/design/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, families, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("decisions applied");
