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

const Box = ({ children }: { children: ReactNode }) => <div className="inventory-part">{children}</div>;

/** The part of an asset or variant, by code. */
export const parts: Record<string, (text?: string) => ReactNode> = {
    "BTN.001": () => <Box><button type="button" className="strategy-box-remove card-remove" aria-label="Remove" /> <button type="button" className="plus-box plus-box-small" aria-label="Add" /></Box>,
    "BTN.DLT.001.001": () => <Box><button type="button" className="strategy-box-remove card-remove" aria-label="Remove" /></Box>,
    "BTN.ADD.001.002": () => <Box><button type="button" className="plus-box plus-box-small" aria-label="Add" /></Box>,
    "BTN.002": () => <Box><span className="field-label"><InfoText text="Legal form"><InfoNote label="Legal form" points={["A short note."]} /></InfoText></span></Box>,
    "BTN.003": () => <Box><button type="button" className="section-tile-back"><span className="back-arrow" aria-hidden="true" />{" Back"}</button></Box>,
    "BTN.004": () => <Box><button type="button" className="business-add-button">+ Add channel</button></Box>,
    "DRP.001": () => <Box><Picker label="Choice" options={["Annually", "Monthly", "Quarterly"]} /></Box>,
    "DRP.SRC.001.001": () => <Box><Picker label="Currency" options={["USD", "EUR", "GBP"]} /></Box>,
    "DRP.OTH.001.002": () => <Box><Picker label="Group" options={["Revenue Partners", "Other…"]} /></Box>,
    "TIK.001": () => <Box><label><input type="checkbox" className="brand-tick-box" defaultChecked /> End date</label></Box>,
    "TXT.001": () => <Box><input className="interview-input" defaultValue="Text" aria-label="Text" /></Box>,
    "TXT.BOX.001.001": () => <Box><input className="interview-input" defaultValue="Text box" aria-label="Text box" /></Box>,
    "TXT.ARE.001.002": () => <Box><textarea className="interview-input" defaultValue="A text area that grows with its words." aria-label="Text area" rows={2} /></Box>,
    "TXT.NAM.001.003": () => <Box><Name /></Box>,
    "TXT.TTL.001.006": () => <Box><input className="interview-input business-foundation-frame-name" defaultValue="1. Infrastructure & Capability" aria-label="Chapter title" style={{ fontSize: 28, border: "none", background: "transparent", width: 360 }} /></Box>,
    "TXT.LST.001.005": () => <Box><textarea className="numbered-list-input" defaultValue="One entry of a numbered list, a sentence that wraps." aria-label="List line" rows={2} /></Box>,
    "LST.001": () => <Box><EditableList /></Box>,
    "LST.EDT.001.001": () => <Box><EditableList /></Box>,
    "LST.NUM.001.002": () => <Box><NumberedListStatic lines={[{ key: "a", text: "Founder and consultant" }, { key: "b", text: "Solutions architect" }]} /></Box>,
    "LST.BUL.001.003": () => <Box><BulletListStatic label="Includes" lines={[{ key: "a", text: "Workspace" }, { key: "b", text: "Utilities" }]} /></Box>,
    "TXT.RDO.001.004": text => <Box><span className="field-value">{text ?? "Read-only text"}</span></Box>,
    "NUM.001": () => <Box><input className="interview-input" inputMode="decimal" defaultValue="12" aria-label="Number" /></Box>,
    "NUM.WHL.001.001": () => <Box><input className="interview-input" inputMode="numeric" defaultValue="12" aria-label="Whole number" /></Box>,
    "NUM.DEC.001.002": () => <Box><input className="interview-input" inputMode="decimal" defaultValue="12.5" aria-label="Decimal" /></Box>,
    "NUM.PCT.001.003": () => <Box><input className="interview-input" inputMode="decimal" defaultValue="40" aria-label="Percent" style={{ width: 44, height: 44, paddingLeft: 4, paddingRight: 4, textAlign: "center" }} /> %</Box>,
    "NUM.YRS.001.004": () => <Box><input className="interview-input" inputMode="numeric" defaultValue="5" aria-label="Years" /> years</Box>,
    "DAT.001": () => <Box><Date /></Box>,
    "DAT.CAL.001.001": () => <Box><Date /></Box>,
    "DAT.MON.001.002": () => <Box><Date month /></Box>,
    "LBL.001": text => <Box><span className="field-label">{text ?? "Start date"}</span></Box>,
    "LBL.SID.001.001": text => <Box><span className="field-label">{text ?? "Start date"}</span></Box>,
    "LBL.ABV.001.002": text => <Box><span className="field-label">{text ?? "Price"}</span></Box>,
    "LBL.HEA.001.003": text => <Box><span className="field-label field-label-heading">{text ?? "Description"}</span></Box>,
    "ARW.001": () => <Box><button type="button" className="page-arrow" aria-label="Next page" /> <button type="button" className="page-arrow carousel-arrow" aria-label="Next card" /></Box>,
    "ARW.PAG.001.001": () => <Box><button type="button" className="page-arrow" aria-label="Next page" /></Box>,
    "ARW.CAR.001.002": () => <Box><button type="button" className="page-arrow carousel-arrow" aria-label="Next card" /></Box>,
    "ARW.002": () => <Box><Fold label={false} /></Box>,
    "ARW.LAB.002.001": () => <Box><Fold label /></Box>,
    "ARW.TTL.002.002": () => <Box><h3 className="answer-column-label"><Fold label={false} /><span className="answer-column-label-text">Infrastructure &amp; Capability</span></h3></Box>,
    "BUL.001": () => <Box><span className="bullet-rail-dot status-shape" aria-hidden="true" /> <span className="bullet-rail-dot status-shape" aria-hidden="true" style={{ transform: "scale(1.45)" }} /></Box>,
    "RAL.001": () => <Box><BulletRail items={SECTIONS} activeId="one" onSelect={() => undefined} side="right" label="Sections" /></Box>,
    "RAL.PAG.001.001": () => <Box><BulletRail items={PAGES} activeId="organization" onSelect={() => undefined} side="left" label="Pages" /></Box>,
    "RAL.SEC.001.002": () => <Box><BulletRail items={SECTIONS} activeId="one" onSelect={() => undefined} side="right" label="Sections" /></Box>,
    "RAL.NAM.001.003": () => <Box><BulletRail items={SECTIONS} activeId="two" onSelect={() => undefined} side="right" label="Sections (named)" /></Box>,
    "RAL.NST.001.004": () => <Box><BulletRail items={SECTIONS.slice(0, 2)} activeId="one" onSelect={() => undefined} side="right" label="Objectives" /></Box>,
    "TIL.001": () => <Box><div className="section-tile-slot"><button type="button" className="section-tile"><span className="section-tile-title">Resources</span><span>Workspace, Utilities</span></button></div></Box>,
    "TIL.002": () => <Box><div className="section-tile-slot"><button type="button" className="section-tile"><span className="section-tile-title">Electricity</span><span>01/01/2027</span></button></div></Box>,
    "TIL.003": () => <Box><button type="button" className="section-tile section-tile-add" aria-label="Add card">+ ADD CARD</button></Box>,
    "TIL.004": () => <Box><button type="button" className="section-tile-link">Workspace</button></Box>,
    "FRM.001": () => <Box><section className="answer-column"><h2 className="answer-column-label"><span className="answer-column-label-number">1.</span> <span className="answer-column-label-text">Infrastructure</span></h2></section></Box>,
    "FRM.002": () => <Box><h1 className="inventory-page-title">3. Business System &#8212; 3. Infrastructure &amp; Capability</h1></Box>,
    "FRM.003": () => <Box><div className="section-tile-dialog-foot"><button type="button" className="section-tile-back"><span className="back-arrow" aria-hidden="true" />{" Back"}</button></div></Box>,
    "FRM.004": () => <Box><div className="floating-card-caption">Resources</div></Box>
};

/** The part of an asset's variant if it has its own, else the asset's. */
export function part(asset: string, variant?: string, text?: string): ReactNode {
    const make = (variant && parts[variant]) || parts[asset];
    return make ? make(text) : null;
}
