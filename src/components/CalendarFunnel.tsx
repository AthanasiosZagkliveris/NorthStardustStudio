import { useState } from "react";
import AddButton from "./controls/AddButton.tsx";
import TextBox from "./controls/TextBox.tsx";
import RemoveButton from "./controls/RemoveButton.tsx";
import OptionPicker, { MultiPicker } from "./interview/fields/OptionPicker.tsx";
import DateCellInput from "./interview/fields/DateCellInput";

import { CARD_DATE_KINDS, type CardDateKind } from "../framework/engine/CalendarCardDates";
import { newCustomPeriod, type CalendarPeriod } from "../services/CalendarPeriods";

/** The kinds of card a date can belong to, as the funnel's "Include" lists them. */
export const CALENDAR_INCLUDES: readonly { id: string; label: string; nouns: readonly string[] }[] = [
    { id: "resources", label: "Resources", nouns: ["Resource"] },
    { id: "activities", label: "Activities", nouns: ["Activity"] },
    { id: "partners", label: "Partners & Suppliers", nouns: ["Partner", "Supplier"] },
    { id: "founders", label: "Founders", nouns: ["Founder"] },
    { id: "legal", label: "Legal & Organization", nouns: ["Expense", "Organization"] }
];

/**
 * THE CALENDAR'S FUNNEL, three drop-down cells: the PERIOD listed (the month grid alone, Today, Tomorrow, This week, Next week, This month, This year, Xmas, or one the
 * user made), the KINDS of date shown (the recommended ones, all, or chosen), and the cards the dates are INCLUDED from (Resources, Activities, Partners & Suppliers ...).
 */
export default function CalendarFunnel({
    periods,
    periodId,
    onPeriod,
    onAddPeriod,
    onRemovePeriod,
    kinds,
    onKinds,
    includes,
    onIncludes
}: {
    periods: readonly CalendarPeriod[];
    periodId: string | null;
    onPeriod: (id: string | null) => void;
    onAddPeriod: (period: CalendarPeriod) => void;
    onRemovePeriod: (id: string) => void;
    kinds: ReadonlySet<CardDateKind>;
    onKinds: (next: ReadonlySet<CardDateKind>) => void;
    includes: ReadonlySet<string>;
    onIncludes: (next: ReadonlySet<string>) => void;
}) {
    const [adding, setAdding] = useState(false);
    const [name, setName] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const MONTH = "Month";
    const NEW = "+ ADD";
    const labels = [MONTH, ...periods.map(period => period.label), NEW];
    const current = periods.find(period => period.id === periodId)?.label ?? MONTH;

    function save() {
        const made = newCustomPeriod(name, from, to);
        if (made) {
            onAddPeriod(made);
            onPeriod(made.id);
            setAdding(false);
            setName("");
            setFrom("");
            setTo("");
        }
    }

    const chosen = periods.find(period => period.id === periodId);

    return (
        <div className="org-calendar-funnel">

            {/* THE THREE CHOICES IN ONE ROW: the period shown, the kinds of date, what is included. */}
            <div className="org-calendar-funnel-row">
                <OptionPicker
                    label="Show"
                    hug
                    keepWidth
                    options={labels}
                    value={current}
                    onChange={(next) => {
                        if (next === NEW) {
                            setAdding(true);
                            return;
                        }
                        onPeriod(next === MONTH ? null : periods.find(period => period.label === next)?.id ?? null);
                    }}
                />
                {chosen?.custom && (
                    <RemoveButton aria-label={"Remove the period " + chosen.label} onClick={() => onRemovePeriod(chosen.id)} />
                )}
                <MultiPicker
                    label="Dates"
                    options={CARD_DATE_KINDS.map(kind => ({ id: kind.id, label: kind.label }))}
                    selected={kinds}
                    onChange={onKinds}
                />
                <MultiPicker
                    label="Include"
                    options={CALENDAR_INCLUDES.map(entry => ({ id: entry.id, label: entry.label }))}
                    selected={includes}
                    onChange={onIncludes}
                />
            </div>

            {adding && (
                <div className="org-calendar-funnel-form">
                    <TextBox
                        className="interview-input"
                        aria-label="Period name"
                        placeholder="Name (optional)"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                    <DateCellInput ariaLabel="Period from" value={from} onChange={setFrom} />
                    <DateCellInput ariaLabel="Period to" value={to} onChange={setTo} />
                    <AddButton
                        disabled={!from || !to}
                        onClick={save}>Save</AddButton>
                    <AddButton
                        onClick={() => setAdding(false)}>Cancel</AddButton>
                </div>
            )}


        </div>
    );
}
