import { useEffect, useRef, useState } from "react";
import DateCellInput from "./interview/DateCellInput";

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

/** A drop-down cell with a check box for each of its options (what is shown is counted on the cell). */
function MultiPick<T extends string>({
    label,
    options,
    selected,
    onChange
}: {
    label: string;
    options: readonly { id: T; label: string }[];
    selected: ReadonlySet<T>;
    onChange: (next: ReadonlySet<T>) => void;
}) {
    const [open, setOpen] = useState(false);
    const box = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }
        const close = (event: MouseEvent) => {
            if (!box.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, [open]);

    return (
        <div className="org-calendar-multi" ref={box}>
            <button
                type="button"
                className="interview-input org-calendar-dropdown"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={label}
                onClick={() => setOpen(current => !current)}
            >
                {label}: {selected.size === options.length ? "All" : selected.size + " of " + options.length}
            </button>
            {open && (
                <div className="org-calendar-multi-list" role="group" aria-label={label}>
                    <div className="org-calendar-multi-actions">
                        <button type="button" className="org-calendar-chip" onClick={() => onChange(new Set(options.map(option => option.id)))}>All</button>
                        <button type="button" className="org-calendar-chip" onClick={() => onChange(new Set())}>None</button>
                    </div>
                    {options.map(option => (
                        <label key={option.id} className="org-calendar-funnel-kind">
                            <input
                                type="checkbox"
                                checked={selected.has(option.id)}
                                onChange={(event) => {
                                    const next = new Set(selected);
                                    if (event.target.checked) {
                                        next.add(option.id);
                                    } else {
                                        next.delete(option.id);
                                    }
                                    onChange(next);
                                }}
                            />
                            <span>{option.label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

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

            <div className="org-calendar-funnel-row">
                <label className="org-calendar-funnel-field">
                    <span className="org-calendar-funnel-label">Show</span>
                    <select
                        className="interview-input org-calendar-dropdown"
                        aria-label="Period"
                        value={current}
                        onChange={(event) => {
                            const next = event.target.value;
                            if (next === NEW) {
                                setAdding(true);
                                return;
                            }
                            onPeriod(next === MONTH ? null : periods.find(period => period.label === next)?.id ?? null);
                        }}
                    >
                        {labels.map(label => <option key={label} value={label}>{label}</option>)}
                    </select>
                </label>
                {chosen?.custom && (
                    <button
                        type="button"
                        className="org-calendar-chip"
                        aria-label={"Remove the period " + chosen.label}
                        onClick={() => onRemovePeriod(chosen.id)}
                    >
                        Remove
                    </button>
                )}
            </div>

            {adding && (
                <div className="org-calendar-funnel-form">
                    <input
                        type="text"
                        className="interview-input"
                        aria-label="Period name"
                        placeholder="Name (optional)"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                    <DateCellInput ariaLabel="Period from" value={from} onChange={setFrom} />
                    <DateCellInput ariaLabel="Period to" value={to} onChange={setTo} />
                    <button type="button" className="org-calendar-chip" disabled={!from || !to} onClick={save}>Save</button>
                    <button type="button" className="org-calendar-chip" onClick={() => setAdding(false)}>Cancel</button>
                </div>
            )}

            <div className="org-calendar-funnel-row">
                <MultiPick
                    label="Dates"
                    options={CARD_DATE_KINDS.map(kind => ({ id: kind.id, label: kind.label }))}
                    selected={kinds}
                    onChange={onKinds}
                />
                <MultiPick
                    label="Include"
                    options={CALENDAR_INCLUDES.map(entry => ({ id: entry.id, label: entry.label }))}
                    selected={includes}
                    onChange={onIncludes}
                />
            </div>

        </div>
    );
}
