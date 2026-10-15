import { useState, type ReactNode } from "react";

import CardNameInput from "../../components/interview/CardNameInput";
import DateCellInput from "../../components/interview/DateCellInput";
import FoldArrow from "../../components/interview/FoldArrow";
import InfoNote, { InfoText } from "../../components/interview/InfoNote";
import LabelArrow from "../../components/interview/LabelArrow";
import NumberedListInput from "../../components/interview/NumberedListInput";
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
const TextSample = ({ size, weight, italic, underline, capitals, done }: { size: number; weight: number; italic?: boolean; underline?: boolean; capitals?: boolean; done?: boolean }) => (
    <span style={{ fontSize: size, fontWeight: weight, fontStyle: italic ? "italic" : "normal", textDecoration: underline ? "underline" : done ? "line-through" : "none", textTransform: capitals ? "uppercase" : "none", color: done ? "var(--text-muted)" : undefined }}>Sample text</span>
);

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
    "BTN.007": () => <Box><span className="inventory-link-button" role="img" aria-label="Link">{"↗"}</span></Box>,
    "BTN.HUG.004.001": () => <Box><button type="button" className="strategy-add-button">+ Add channel</button></Box>,
    "BTN.ROW.004.002": () => <Box><button type="button" className="strategy-add-button card-list-add">+ Add registration number</button></Box>,
    "BTN.SML.004.003": () => <Box><button type="button" className="strategy-add-button notepad-add">+ Add note</button></Box>,
    "TXS.001": () => <Box><div className="inventory-text-styles"><div key="TXS.BDY.001.001"><small>Body (18px, 400)</small><br /><TextSample size={18} weight={400} italic={false} underline={false} capitals={false} done={false} /></div><div key="TXS.BMD.001.002"><small>Body medium (18px, 500)</small><br /><TextSample size={18} weight={500} italic={false} underline={false} capitals={false} done={false} /></div><div key="TXS.BBD.001.003"><small>Body bold (18px, 700)</small><br /><TextSample size={18} weight={700} italic={false} underline={false} capitals={false} done={false} /></div><div key="TXS.BUL.001.004"><small>Body underlined (18px, 400)</small><br /><TextSample size={18} weight={400} italic={false} underline={true} capitals={false} done={false} /></div><div key="TXS.BUC.001.005"><small>Body bold underlined capitals (18px, 700)</small><br /><TextSample size={18} weight={700} italic={false} underline={true} capitals={true} done={false} /></div><div key="TXS.BBC.001.006"><small>Body bold capitals (18px, 700)</small><br /><TextSample size={18} weight={700} italic={false} underline={false} capitals={true} done={false} /></div><div key="TXS.BMC.001.007"><small>Body medium capitals (18px, 500)</small><br /><TextSample size={18} weight={500} italic={false} underline={false} capitals={true} done={false} /></div><div key="TXS.BDN.001.008"><small>Body done (18px, 400)</small><br /><TextSample size={18} weight={400} italic={false} underline={false} capitals={false} done={true} /></div><div key="TXS.SML.001.009"><small>Small (14px, 400)</small><br /><TextSample size={14} weight={400} italic={false} underline={false} capitals={false} done={false} /></div><div key="TXS.SCP.001.010"><small>Small capitals (14px, 400)</small><br /><TextSample size={14} weight={400} italic={false} underline={true} capitals={false} done={false} /></div><div key="TXS.SBI.001.011"><small>Small bold italic (14px, 700)</small><br /><TextSample size={14} weight={700} italic={true} underline={false} capitals={false} done={false} /></div><div key="TXS.HTB.001.012"><small>Heading 3 bold (24px, 700)</small><br /><TextSample size={24} weight={700} italic={false} underline={false} capitals={false} done={false} /></div><div key="TXS.HTC.001.013"><small>Heading 3 bold capitals (24px, 700)</small><br /><TextSample size={24} weight={700} italic={false} underline={false} capitals={true} done={false} /></div><div key="TXS.HTI.001.014"><small>Heading 3 medium italic (24px, 500)</small><br /><TextSample size={24} weight={500} italic={true} underline={false} capitals={false} done={false} /></div><div key="TXS.HDC.001.015"><small>Heading 2 bold capitals (28px, 700)</small><br /><TextSample size={28} weight={700} italic={false} underline={false} capitals={true} done={false} /></div><div key="TXS.HOB.001.016"><small>Heading 1 bold (36px, 700)</small><br /><TextSample size={36} weight={700} italic={false} underline={false} capitals={false} done={false} /></div><div key="TXS.HOC.001.017"><small>Heading 1 capitals (36px, 400)</small><br /><TextSample size={36} weight={400} italic={false} underline={false} capitals={true} done={false} /></div><div key="TXS.HOR.001.018"><small>Heading 1 (36px, 400)</small><br /><TextSample size={36} weight={400} italic={false} underline={false} capitals={false} done={false} /></div></div></Box>,
    "TXS.BDY.001.001": () => <Box><TextSample size={18} weight={400} italic={false} underline={false} capitals={false} done={false} /></Box>,
    "TXS.BMD.001.002": () => <Box><TextSample size={18} weight={500} italic={false} underline={false} capitals={false} done={false} /></Box>,
    "TXS.BBD.001.003": () => <Box><TextSample size={18} weight={700} italic={false} underline={false} capitals={false} done={false} /></Box>,
    "TXS.BUL.001.004": () => <Box><TextSample size={18} weight={400} italic={false} underline={true} capitals={false} done={false} /></Box>,
    "TXS.BUC.001.005": () => <Box><TextSample size={18} weight={700} italic={false} underline={true} capitals={true} done={false} /></Box>,
    "TXS.BBC.001.006": () => <Box><TextSample size={18} weight={700} italic={false} underline={false} capitals={true} done={false} /></Box>,
    "TXS.BMC.001.007": () => <Box><TextSample size={18} weight={500} italic={false} underline={false} capitals={true} done={false} /></Box>,
    "TXS.BDN.001.008": () => <Box><TextSample size={18} weight={400} italic={false} underline={false} capitals={false} done={true} /></Box>,
    "TXS.SML.001.009": () => <Box><TextSample size={14} weight={400} italic={false} underline={false} capitals={false} done={false} /></Box>,
    "TXS.SCP.001.010": () => <Box><TextSample size={14} weight={400} italic={false} underline={true} capitals={false} done={false} /></Box>,
    "TXS.SBI.001.011": () => <Box><TextSample size={14} weight={700} italic={true} underline={false} capitals={false} done={false} /></Box>,
    "TXS.HTB.001.012": () => <Box><TextSample size={24} weight={700} italic={false} underline={false} capitals={false} done={false} /></Box>,
    "TXS.HTC.001.013": () => <Box><TextSample size={24} weight={700} italic={false} underline={false} capitals={true} done={false} /></Box>,
    "TXS.HTI.001.014": () => <Box><TextSample size={24} weight={500} italic={true} underline={false} capitals={false} done={false} /></Box>,
    "TXS.HDC.001.015": () => <Box><TextSample size={28} weight={700} italic={false} underline={false} capitals={true} done={false} /></Box>,
    "TXS.HOB.001.016": () => <Box><TextSample size={36} weight={700} italic={false} underline={false} capitals={false} done={false} /></Box>,
    "TXS.HOC.001.017": () => <Box><TextSample size={36} weight={400} italic={false} underline={false} capitals={true} done={false} /></Box>,
    "TXS.HOR.001.018": () => <Box><TextSample size={36} weight={400} italic={false} underline={false} capitals={false} done={false} /></Box>,
    "DRP.001": () => <Box><Picker label="Choice" options={["Annually", "Monthly", "Quarterly"]} /></Box>,
    "DRP.SRC.001.001": () => <Box><Picker label="Currency" options={["USD", "EUR", "GBP"]} /></Box>,
    "TIK.001": () => <Box><label><input type="checkbox" className="brand-tick-box" defaultChecked /> End date</label></Box>,
    "TXT.001": () => <Box><input className="interview-input" defaultValue="Text" aria-label="Text" /></Box>,
    "TXT.BOX.001.001": () => <Box><input className="interview-input" defaultValue="Text box" aria-label="Text box" /></Box>,
    "TXT.ARE.001.002": () => <Box><textarea className="interview-input" defaultValue="A text area that grows with its words." aria-label="Text area" rows={2} /></Box>,
    "TXT.WHL.001.004": () => <Box><input className="interview-input" inputMode="numeric" defaultValue="12" aria-label="Whole number" /></Box>,
    "TXT.DEC.001.005": () => <Box><input className="interview-input" inputMode="decimal" defaultValue="12.5" aria-label="Decimal" /></Box>,
    "TXT.SQR.001.006": () => <Box><input className="interview-input" inputMode="numeric" defaultValue="40" aria-label="Percent" style={{ width: 44, height: 44, paddingLeft: 4, paddingRight: 4, textAlign: "center" }} /> % <span style={{ marginLeft: 16 }} /> <input className="interview-input" inputMode="numeric" defaultValue="5" aria-label="Years" style={{ width: 44, height: 44, paddingLeft: 4, paddingRight: 4, textAlign: "center" }} /> years <span style={{ marginLeft: 16 }} /> <input className="interview-input" inputMode="numeric" defaultValue="3" aria-label="Months" style={{ width: 44, height: 44, paddingLeft: 4, paddingRight: 4, textAlign: "center" }} /> months</Box>,
    "TXT.NAM.001.003": () => <Box><Name /></Box>,
    "LST.001": () => <Box><EditableList /></Box>,
    "DAT.001": () => <Box><Date /></Box>,
    "DAT.CAL.001.001": () => <Box><Date /><DayPopup /></Box>,
    "DAT.MON.001.002": () => <Box><Date month /><MonthPopup /></Box>,
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
    "ICN.001": () => <Box><span className="inventory-icon" role="img" aria-label="System icon">36 px icon</span></Box>,
    "DIV.001": () => <Box><hr className="inventory-divider" /></Box>,
    "DIV.HOR.001.001": () => <Box><hr className="inventory-divider" /></Box>,
    "DIV.VER.001.002": () => <Box><span className="inventory-divider-vertical" /></Box>,
    "FRM.001": () => <Box><span className="inventory-frame">A rounded surface, 8 px corners</span></Box>,
    "FRM.CHP.001.001": () => <Box><span className="inventory-frame">Chapter</span></Box>,
    "FRM.MTL.001.002": () => <Box><span className="inventory-frame">Master tile</span></Box>,
    "FRM.NTL.001.003": () => <Box><span className="inventory-frame">Nested tile</span></Box>,
    "FRM.FLC.001.004": () => <Box><span className="inventory-frame">Floating card</span></Box>,
    "FRM.NSC.001.005": () => <Box><span className="inventory-frame">Nested card</span></Box>,
    "FRM.TAG.001.006": () => <Box><span className="inventory-frame">Tag</span></Box>,
    "FRM.TIL.001.007": () => <Box><span className="inventory-frame">Tile</span></Box>,
    "FRM.CRD.001.008": () => <Box><span className="inventory-frame">Card</span></Box>,
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
};

/** The part of an asset's variant if it has its own, else the asset's. */
export function part(asset: string, variant?: string, text?: string): ReactNode {
    const make = (variant && parts[variant]) || parts[asset];
    return make ? make(text) : null;
}
