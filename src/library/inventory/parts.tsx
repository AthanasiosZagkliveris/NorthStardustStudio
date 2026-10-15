import { useState, type ReactNode } from "react";

import CardNameInput from "../../components/interview/CardNameInput";
import DateCellInput from "../../components/interview/DateCellInput";
import FoldArrow from "../../components/interview/FoldArrow";
import InfoNote, { InfoText } from "../../components/interview/InfoNote";
import LabelArrow from "../../components/interview/LabelArrow";
import BulletListStatic from "../../components/interview/BulletListStatic";
import NumberedListInput from "../../components/interview/NumberedListInput";
import NumberedListStatic from "../../components/interview/NumberedListStatic";
import OptionPicker from "../../components/interview/OptionPicker";
import BulletRail from "../../components/interview/rails/BulletRail";
import type { RailItem } from "../../components/interview/rails/railItems";

/**
 * THE INVENTORY OF COMPONENTS: every component asset of the library (src/library/data/library.ts),
 * and each of its variants, built from the app's own components and classes. A part is found by
 * the code of the asset (BTN.002) or of the variant (BTN.DLT.001.001); the library says what
 * exists, this file says how it is drawn. src/library/inventory/inventory.test.ts fails when an
 * asset or variant of the library has no part here.
 */

const PAGES: RailItem[] = [
    { id: "introduction", label: "Introduction", capitals: true },
    { id: "definition", label: "1. Definition", status: "defined" },
    { id: "organization", label: "2. Organization", status: "in-progress" }
];
const SECTIONS: RailItem[] = [{ id: "one", label: "1. First" }, { id: "two", label: "2. Second" }, { id: "three", label: "3. Third" }];

function Picker({ options, label }: { options: string[]; label: string }) {
    const [value, setValue] = useState(options[0]);
    return <OptionPicker label={label} options={options} value={value} onChange={setValue} />;
}

function EditableList() {
    const [items, setItems] = useState(["Reusable templates", "A standard handover"]);
    return <NumberedListInput label="Initiatives" items={items} onChange={setItems} />;
}

function Name() {
    const [value, setValue] = useState("Cloud backup");
    return <div className="fold-card-head"><CardNameInput ariaLabel="Resource 1 name" placeholder="Name" value={value} onChange={setValue} /></div>;
}

function Date({ month }: { month?: boolean }) {
    const [value, setValue] = useState("2027-01-01");
    return month ? <span className="date-cell">January 2027</span> : <DateCellInput ariaLabel="Start date" value={value} onChange={setValue} />;
}

function Fold({ label }: { label: boolean }) {
    const [open, setOpen] = useState(true);
    return label ? <span className="field-label"><LabelArrow open={open} label="Responsibilities" onToggle={() => setOpen(!open)} />Responsibilities</span> : <FoldArrow open={open} label="Initiatives" onToggle={() => setOpen(!open)} />;
}

function DayPopup() {
    const days = Array.from({ length: 35 }, (_, i) => i + 1);
    return <div className="inventory-popup"><strong>October 2026</strong><div className="inventory-popup-grid">{days.map(d => <span key={d} className={d === 15 ? "inventory-popup-day inventory-popup-day-on" : "inventory-popup-day"}>{d > 31 ? d - 31 : d}</span>)}</div></div>;
}

function MonthPopup() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return <div className="inventory-popup"><strong>MONTH | YEAR</strong><div className="inventory-popup-grid inventory-popup-months">{months.map(m => <span key={m} className={m === "Sep" ? "inventory-popup-day inventory-popup-day-on" : "inventory-popup-day"}>{m}</span>)}</div></div>;
}

const Box = ({ children }: { children: ReactNode }) => <div className="inventory-part">{children}</div>;

/** The part of an asset or variant, by code. */
export const parts: Record<string, (text?: string) => ReactNode> = {
    "BTN.001": () => <Box><button type="button" className="strategy-box-remove card-remove" aria-label="Remove" /> <button type="button" className="plus-box plus-box-small" aria-label="Add" /></Box>,
    "BTN.DLT.001.001": () => <Box><button type="button" className="strategy-box-remove card-remove" aria-label="Remove" /></Box>,
    "BTN.ADD.001.002": () => <Box><button type="button" className="plus-box plus-box-small" aria-label="Add" /></Box>,
    "BTN.002": () => <Box><span className="field-label"><InfoText text="Legal form"><InfoNote label="Legal form" points={["A short note."]} /></InfoText></span></Box>,
    "BTN.003": () => <Box><button type="button" className="section-tile-back"><span className="back-arrow" aria-hidden="true" />{" Back"}</button></Box>,
    "BTN.MAN.003.001": () => <Box><button type="button" className="back-link" style={{ position: "static", margin: 0 }}>{"← Back"}</button></Box>,
    "BTN.SEC.003.002": () => <Box><button type="button" className="section-tile-back"><span className="back-arrow" aria-hidden="true" />{" Back"}</button></Box>,
    "BTN.004": () => <Box><button type="button" className="business-add-button">+ Add channel</button></Box>,
    "DRP.001": () => <Box><Picker label="Choice" options={["Annually", "Monthly", "Quarterly"]} /></Box>,
    "DRP.SRC.001.001": () => <Box><Picker label="Currency" options={["USD", "EUR", "GBP"]} /></Box>,
    "DRP.GEN.001.002": () => <Box><Picker label="Activity" options={["Design the brand", "Ship the first order", "Other…"]} /></Box>,
    "TIK.001": () => <Box><label><input type="checkbox" className="brand-tick-box" defaultChecked /> End date</label></Box>,
    "TXT.001": () => <Box><input className="interview-input" defaultValue="Text" aria-label="Text" /></Box>,
    "TXT.BOX.001.001": () => <Box><input className="interview-input" defaultValue="Text box" aria-label="Text box" /></Box>,
    "TXT.ARE.001.002": () => <Box><textarea className="interview-input" defaultValue="A text area that grows with its words." aria-label="Text area" rows={2} /></Box>,
    "TXT.WHL.001.004": () => <Box><input className="interview-input" inputMode="numeric" defaultValue="12" aria-label="Whole number" /></Box>,
    "TXT.DEC.001.005": () => <Box><input className="interview-input" inputMode="decimal" defaultValue="12.5" aria-label="Decimal" /></Box>,
    "TXT.SQR.001.006": () => <Box><input className="interview-input" inputMode="numeric" defaultValue="40" aria-label="Percent" style={{ width: 44, height: 44, paddingLeft: 4, paddingRight: 4, textAlign: "center" }} /> % <span style={{ marginLeft: 16 }} /> <input className="interview-input" inputMode="numeric" defaultValue="5" aria-label="Years" style={{ width: 44, height: 44, paddingLeft: 4, paddingRight: 4, textAlign: "center" }} /> years <span style={{ marginLeft: 16 }} /> <input className="interview-input" inputMode="numeric" defaultValue="3" aria-label="Months" style={{ width: 44, height: 44, paddingLeft: 4, paddingRight: 4, textAlign: "center" }} /> months</Box>,
    "LNK.UND.001.001": () => <Box><button type="button" className="section-tile-link">Workspace</button></Box>,
    "LNK.BLU.001.002": () => <Box><button type="button" className="intro-page-link">Definition and Ethics</button></Box>,
    "LNK.SYM.001.003": () => <Box><span className="inventory-link-symbol" aria-label="link">&#128279;</span></Box>,
    "TXT.NAM.001.003": () => <Box><Name /></Box>,
    "LST.001": () => <Box><EditableList /></Box>,
    "DAT.001": () => <Box><Date /></Box>,
    "DAT.CAL.001.001": () => <Box><Date /></Box>,
    "DAT.MON.001.002": () => <Box><Date month /></Box>,
    "DAT.002": () => <Box><DayPopup /> <MonthPopup /></Box>,
    "DAT.DAY.002.001": () => <Box><DayPopup /></Box>,
    "DAT.MON.002.002": () => <Box><MonthPopup /></Box>,
    "HLP.001": () => <Box><span className="inventory-help">A text that is already there and helps.</span></Box>,
    "HLP.INF.001.001": () => <Box><span className="field-label"><InfoText text="Legal form"><InfoNote label="Legal form" points={["A short note."]} /></InfoText></span></Box>,
    "HLP.BUL.001.002": () => <Box><BulletListStatic label="Includes" lines={[{ key: "a", text: "Workspace" }, { key: "b", text: "Utilities" }]} /></Box>,
    "HLP.NUM.001.003": () => <Box><NumberedListStatic lines={[{ key: "a", text: "Founder and consultant" }, { key: "b", text: "Solutions architect" }]} /></Box>,
    "HLP.SUM.001.004": () => <Box><span className="inventory-help">01/01/2027 · Infrastructure · Exists / Free</span></Box>,
    "HLP.VAL.001.005": () => <Box><span className="field-value">Premises</span></Box>,
    "TTL.001": () => <Box><span className="inventory-title" style={{ fontSize: 24, fontWeight: 700 }}>Resources</span></Box>,
    "TTL.PAG.001.001": () => <Box><span className="inventory-title" style={{ fontSize: 36 }}>3. Business System &#8212; 3. Infrastructure</span></Box>,
    "TTL.CHP.001.002": () => <Box><span className="inventory-title inventory-title-moves" style={{ fontSize: 28 }}>1. Infrastructure &amp; Capability</span></Box>,
    "TTL.DLG.001.003": () => <Box><span className="inventory-title" style={{ fontSize: 24, fontWeight: 700 }}>Resources / Digital Infrastructure</span></Box>,
    "TTL.BOX.001.004": () => <Box><span className="inventory-title" style={{ fontSize: 24, fontWeight: 700 }}>Activities</span></Box>,
    "TTL.MTL.001.005": () => <Box><span className="inventory-title inventory-title-wraps" style={{ fontSize: 18, fontWeight: 600 }}>Typography &amp; Text Hierarchy</span></Box>,
    "TTL.TIL.001.006": () => <Box><span className="inventory-title inventory-title-moves" style={{ fontSize: 18, fontWeight: 600 }}>Brooklyn coworking space (hot desk membership)</span></Box>,
    "TTL.CRD.001.007": () => <Box><button type="button" className="inventory-title inventory-title-cut section-tile-link" style={{ fontSize: 18, fontWeight: 600 }}>Brooklyn coworking space (hot desk membership)</button></Box>,
    "TTL.OPT.001.008": () => <Box><span className="inventory-title inventory-title-cut" style={{ fontSize: 18 }}>Brooklyn coworking space (hot desk membership)</span></Box>,
    "LNK.001": () => <Box><button type="button" className="section-tile-link">Workspace</button></Box>,
    "BTN.SHR.001.003": () => <Box><button type="button" className="strategy-box-tiles" aria-label="Show as tiles" /></Box>,
    "BTN.005": () => <Box><button type="button" className="add-card-tile"><span className="add-card-plus" aria-hidden="true">+</span><span className="add-card-words">Add Card</span></button></Box>,
    "BTN.006": () => <Box><button type="button" className="header-tool"><span className="header-tool-word">Search</span></button></Box>,
    "BTN.RDM.006.001": () => <Box><button type="button" className="header-tool"><span className="header-tool-word">Light</span></button></Box>,
    "BTN.FCS.006.002": () => <Box><button type="button" className="header-tool"><span className="header-tool-word">Focus</span></button></Box>,
    "BTN.SRC.006.003": () => <Box><button type="button" className="header-tool"><span className="header-tool-word">Search</span></button></Box>,
    "BTN.NTS.006.004": () => <Box><button type="button" className="header-tool"><span className="header-tool-word">Notes</span></button></Box>,
    "BTN.RVW.006.005": () => <Box><button type="button" className="header-tool"><span className="header-tool-word">Review</span> <span className="header-tool-count">6</span></button></Box>,
    "BTN.SET.006.006": () => <Box><button type="button" className="header-tool"><span className="header-tool-word">Settings</span></button></Box>,
    "BTN.RFR.006.007": () => <Box><button type="button" className="header-tool app-reload"><span className="header-tool-word">Reload</span></button></Box>,
    "BTN.STR.006.008": () => <Box><button type="button" className="primary-button start-arrow-button">Start Interview</button></Box>,
    "PCK.001": () => <Box><input type="color" className="brand-colour-picker" aria-label="Colour picker" defaultValue="#3e847a" /> <input className="interview-input brand-hex-input" placeholder="#000000" aria-label="Hex" defaultValue="#3E847A" /></Box>,
    "IMG.001": () => <Box><span className="inventory-image" role="img" aria-label="A picture">448 by 252 px picture</span></Box>,
    "IMG.LOG.001.001": () => <Box><span className="inventory-image" role="img" aria-label="Logo, 668 by 216 px" style={{ width: 334, height: 108 }}>Logo, 668 by 216 px</span></Box>,
    "IMG.ICO.001.002": () => <Box><span className="inventory-image" role="img" aria-label="Icon, 249 by 249 px" style={{ width: 125, height: 125 }}>Icon, 249 by 249 px</span></Box>,
    "IMG.BRD.001.003": () => <Box><span className="inventory-image" role="img" aria-label="Brand image, 448 by 252 px" style={{ width: 224, height: 126 }}>Brand image, 448 by 252 px</span></Box>,
    "MSG.001": () => <Box><span className="inventory-help">The payments must total 100%.</span></Box>,
    "MSG.VER.001.001": () => <Box><span className="business-field-missing-note">The payments must total 100%.</span></Box>,
    "MSG.IND.001.002": () => <Box><input className="interview-input" inputMode="numeric" defaultValue="3" aria-label="Months" style={{ width: 44, height: 44, paddingLeft: 4, paddingRight: 4, textAlign: "center" }} /> months</Box>,
    "MSG.REM.001.003": () => <Box><span className="field-label">Financial Plan:</span> <strong>Jan 2027 &#8211; Dec 2029</strong></Box>,
    "ICN.001": () => <Box><span className="inventory-icon" role="img" aria-label="System icon">36 px icon</span></Box>,
    "DIV.001": () => <Box><hr className="inventory-divider" /></Box>,
    "DIV.HOR.001.001": () => <Box><hr className="inventory-divider" /></Box>,
    "DIV.VER.001.002": () => <Box><span className="inventory-divider-vertical" /></Box>,
    "HLP.BGR.001.006": () => <Box><input className="interview-input" placeholder="Resource name" aria-label="Background text" /></Box>,
    "HLP.GEN.001.007": () => <Box><span className="inventory-help">Founders' delivery capacity: about 96 hours a month.</span></Box>,
    "HLP.LIN.001.008": () => <Box><ul className="inventory-lined"><li>Workspace</li><li>Utilities</li></ul></Box>,
    "HLP.INT.001.009": () => <Box><span className="intro-sentence">First, sets out what your organization does. <strong>Definition</strong> comes first.</span></Box>,
    "TTL.SYS.001.009": () => <Box><span className="inventory-title" style={{ fontSize: 36, fontWeight: 700 }}>4. Strategy System</span></Box>,
    "TTL.INT.001.010": () => <Box><span className="intro-guiding-question">Who are we, and why do we exist?</span></Box>,
    "LBL.SUB.001.002": () => <Box><span className="intro-fact-label">What it covers</span></Box>,
    "FRM.001": () => <Box><span className="inventory-frame">A rounded surface, 8 px corners</span></Box>,
    "FRM.CHP.001.001": () => <Box><span className="inventory-frame">Chapter</span></Box>,
    "FRM.MTL.001.002": () => <Box><span className="inventory-frame">Master tile</span></Box>,
    "FRM.NTL.001.003": () => <Box><span className="inventory-frame">Nested tile</span></Box>,
    "FRM.FLC.001.004": () => <Box><span className="inventory-frame">Floating card</span></Box>,
    "FRM.NSC.001.005": () => <Box><span className="inventory-frame">Nested card</span></Box>,
    "FRM.TAG.001.006": () => <Box><span className="inventory-frame">Tag</span></Box>,
    "CAL.001": () => <Box><span className="inventory-frame">Calendar, Capabilities, Systems</span></Box>,
    "CAL.HND.001.001": () => <Box><span className="inventory-frame">Calendar</span></Box>,
    "CAL.PNL.001.002": () => <Box><span className="inventory-frame">The side panel</span></Box>,
    "FRM.TIL.001.007": () => <Box><span className="inventory-frame">Tile</span></Box>,
    "FRM.CRD.001.008": () => <Box><span className="inventory-frame">Card</span></Box>,
    "LBL.001": text => <Box><span className="field-label">{text ?? "Start date"}</span></Box>,
    "LBL.HEA.001.001": text => <Box><span className="field-label field-label-heading">{text ?? "Description"}</span></Box>,
    "ARW.001": () => <Box><button type="button" className="page-arrow" aria-label="Next page" /> <button type="button" className="page-arrow carousel-arrow" aria-label="Next card" /></Box>,
    "ARW.PAG.001.001": () => <Box><button type="button" className="page-arrow" aria-label="Next page" /></Box>,
    "ARW.CAR.001.002": () => <Box><button type="button" className="page-arrow carousel-arrow" aria-label="Next card" /></Box>,
    "ARW.002": () => <Box><Fold label={false} /></Box>,
    "ARW.LAB.002.001": () => <Box><Fold label /></Box>,
    "ARW.TTL.002.002": () => <Box><h3 className="answer-column-label"><Fold label={false} /><span className="answer-column-label-text">Infrastructure &amp; Capability</span></h3></Box>,
    "BUL.001": () => <Box><span className="bullet-rail-dot status-shape" aria-hidden="true" /> <span className="bullet-rail-dot status-shape" aria-hidden="true" style={{ transform: "scale(1.45)" }} /></Box>,
    "FLD.PAG.106.001": () => <Box><BulletRail items={PAGES} activeId="organization" onSelect={() => undefined} side="left" label="Pages" /></Box>,
    "FLD.SEC.106.002": () => <Box><BulletRail items={SECTIONS} activeId="one" onSelect={() => undefined} side="right" label="Sections" /></Box>,
    "FLD.CAR.106.003": () => <Box><BulletRail items={SECTIONS} activeId="two" onSelect={() => undefined} side="right" label="Views" /></Box>,
    "FLD.NST.106.004": () => <Box><BulletRail items={SECTIONS.slice(0, 2)} activeId="one" onSelect={() => undefined} side="right" label="Objectives" /></Box>,
    "TIL.001": () => <Box><div className="section-tile-slot"><button type="button" className="section-tile"><span className="section-tile-title">Resources</span><span>Workspace, Utilities</span></button></div></Box>,
    "TIL.002": () => <Box><div className="section-tile-slot"><button type="button" className="section-tile"><span className="section-tile-title">Electricity</span><span>01/01/2027</span></button></div></Box>,
    "FRM.002": () => <Box><h1 className="inventory-page-title">3. Business System &#8212; 3. Infrastructure &amp; Capability</h1></Box>,
    "FRM.003": () => <Box><div className="section-tile-dialog-foot"><button type="button" className="section-tile-back"><span className="back-arrow" aria-hidden="true" />{" Back"}</button></div></Box>,
};

/** The part of an asset's variant if it has its own, else the asset's. */
export function part(asset: string, variant?: string, text?: string): ReactNode {
    const make = (variant && parts[variant]) || parts[asset];
    return make ? make(text) : null;
}
