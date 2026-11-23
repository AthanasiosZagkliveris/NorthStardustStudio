import { ReactNode, useRef, useState } from "react";
import AddButton from "../controls/AddButton.tsx";
import TextBox from "../controls/TextBox.tsx";
import RemoveButton from "../controls/RemoveButton.tsx";
import TickField from "../controls/TickField.tsx";
import RadioChoice from "../controls/RadioChoice.tsx";
import FunnelButton from "../controls/FunnelButton.tsx";
import { usePopupDismiss } from "../controls/PopupPanel.tsx";
import MenuHead from "../interview/tiles/MenuHead.tsx";
import DateCellInput from "../interview/fields/DateCellInput";
import type { DateFormat } from "../../services/PreferencesService";
import "../../styles/capability-overview.css";

import { CARD_DATE_KINDS, type CardDateKind } from "../../framework/engine/cards/CalendarCardDates";
import { newCustomPeriod, type CalendarPeriod } from "../../services/CalendarPeriods";

/** The kinds of card a date can belong to, as the funnel's "Include" lists them. */
export const CALENDAR_INCLUDES: readonly { id: string; label: string; nouns: readonly string[] }[] = [
    { id: "resources", label: "Resources", nouns: ["Resource"] },
    { id: "activities", label: "Activities", nouns: ["Activity"] },
    { id: "partners", label: "Partners & Suppliers", nouns: ["Partner", "Supplier"] },
    { id: "founders", label: "Founders", nouns: ["Founder"] },
    { id: "legal", label: "Legal & Organisation", nouns: ["Expense", "Organisation"] }
];

/** A list of ticks headed by All, the default: while All is ticked, a tick on one shows that one alone; the last one taken away is All again (MultiPicker's rule). */
function AllTicks<T extends string>({ label, options, selected, onChange }: { label: string; options: readonly { id: T; label: string }[]; selected: ReadonlySet<T>; onChange: (next: ReadonlySet<T>) => void }) {
    const all = options.every(option => selected.has(option.id));
    return (
        <div className="org-calendar-funnel-ticks" role="group" aria-label={label}>
            <TickField checked={all} onChange={() => onChange(new Set(options.map(option => option.id)))}><span>All</span></TickField>
            {options.map(option => (
                <TickField key={option.id} checked={!all && selected.has(option.id)} onChange={(event) => {
                    if (all) {
                        onChange(new Set([option.id]));
                        return;
                    }
                    const next = new Set(selected);
                    if (event.target.checked) {
                        next.add(option.id);
                    } else {
                        next.delete(option.id);
                    }
                    onChange(next.size === 0 ? new Set(options.map(entry => entry.id)) : next);
                }}><span>{option.label}</span></TickField>
            ))}
        </div>
    );
}

/**
 * THE CALENDAR'S FUNNEL (owner, 2026-11-23 17:47 UTC+2: "On the calendar, use a funnel button, and optimise all the different options ... place it [the date
 * presentation] also on the filter"): ONE funnel button, as the Inventory's, whose panel holds four folded groups -- Show (the month grid alone, a preset period,
 * or one the user made, with Add), Dates (the kinds of date, All first), Calendars on the user's own Calendar or Include on an Organisation's (All first), and
 * Date presentation (MM/DD or DD/MM). Beside the button, what it shows now, in words.
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
    onIncludes,
    calendars,
    dateFormat,
    onDateFormat
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
    /** The user's own Calendar (UserCalendar.ts): which calendars show, their notes and each Organisation's, in the place of the Organisation's "Include". */
    calendars?: { options: readonly { id: string; label: string }[]; shown: ReadonlySet<string>; onChange: (next: ReadonlySet<string>) => void };
    dateFormat: DateFormat;
    onDateFormat: (next: DateFormat) => void;
}) {
    const [open, setOpen] = useState(false);
    const [unfolded, setUnfolded] = useState<ReadonlySet<string>>(new Set(["Show"]));
    const [adding, setAdding] = useState(false);
    const [name, setName] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const box = useRef<HTMLDivElement | null>(null);
    usePopupDismiss(open, [box], () => setOpen(false), { capture: true });

    const MONTH = "month";
    const OTHER = "other";
    const chosen = periods.find(period => period.id === periodId);
    const sources = calendars ? calendars.options : CALENDAR_INCLUDES.map(entry => ({ id: entry.id, label: entry.label }));
    const sourcesShown = calendars ? calendars.shown : includes;
    const onSources = calendars ? calendars.onChange : onIncludes;
    const sourcesName = calendars ? "Calendars" : "Include";
    const count = (shown: ReadonlySet<string>, all: readonly { id: string; label: string }[]) =>
        all.every(option => shown.has(option.id)) ? "All" : shown.size === 1 ? all.find(option => shown.has(option.id))?.label ?? "" : shown.size + " of " + all.length;

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

    const group = (title: string, body: ReactNode) => {
        const here = unfolded.has(title);
        return (
            <div key={title} className="capability-overview-menu-group">
                <MenuHead title={title} open={here} onToggle={() => setUnfolded(current => {
                    const next = new Set(current);
                    if (!next.delete(title)) {
                        next.add(title);
                    }
                    return next;
                })} />
                {here && <div className="capability-overview-menu-body">{body}</div>}
            </div>
        );
    };

    return (
        <div className="org-calendar-funnel" ref={box}>

            {/* (What it shows now, in words, and the one funnel.) */}
            <div className="org-calendar-funnel-row">
                <span className="org-calendar-funnel-summary">
                    {(chosen?.label ?? "Month") + " · Dates: " + count(kinds, CARD_DATE_KINDS) + " · " + sourcesName + ": " + count(sourcesShown, sources) + " · " + (dateFormat === "EU" ? "DD/MM" : "MM/DD")}
                </span>
                <FunnelButton
                    aria-label="Choose what the Calendar shows"
                    aria-expanded={open}
                    aria-haspopup="true"
                    // (Filled, as every funnel, only while it leaves out something its start shows: the user's own Calendar starts on their own notes alone.)
                    active={!!chosen || !CARD_DATE_KINDS.every(kind => kinds.has(kind.id)) || (calendars ? !(sourcesShown.size === 1 && sourcesShown.has("")) : !sources.every(option => sourcesShown.has(option.id)))}
                    onClick={() => setOpen(current => !current)}
                />
            </div>

            {open && (
                <div className="org-calendar-funnel-panel capability-overview-menu" role="group" aria-label="Choose what the Calendar shows">
                    {group("Show", (
                        <>
                            {/* (OTHER, THE LAST CHOICE (owner, 2026-11-23 18:24 UTC+2: "change the Add period with an Other option"): it opens a span of the user's own;
                                a span made stands in the list with its x on its line.) */}
                            <RadioChoice
                                label="Show"
                                group="org-calendar-period"
                                options={[
                                    { id: MONTH, label: "Month" },
                                    ...periods.map(period => ({
                                        id: period.id,
                                        label: period.custom
                                            ? <span className="org-calendar-funnel-custom">{period.label}<RemoveButton aria-label={"Remove the period " + period.label} onClick={(event) => { event.preventDefault(); onRemovePeriod(period.id); }} /></span>
                                            : period.label,
                                        name: period.label
                                    })),
                                    { id: OTHER, label: "Other" }
                                ]}
                                value={adding ? OTHER : periodId ?? MONTH}
                                onChange={(next) => {
                                    if (next === OTHER) {
                                        setAdding(true);
                                        return;
                                    }
                                    setAdding(false);
                                    onPeriod(next === MONTH ? null : next);
                                }}
                            />
                            {adding && (
                                <div className="org-calendar-funnel-form">
                                    <TextBox className="interview-input" aria-label="Period name" placeholder="Name (optional)" value={name} onChange={(event) => setName(event.target.value)} />
                                    <DateCellInput ariaLabel="Period from" value={from} onChange={setFrom} />
                                    <DateCellInput ariaLabel="Period to" value={to} onChange={setTo} />
                                    <AddButton disabled={!from || !to} onClick={save}>Save</AddButton>
                                    <AddButton onClick={() => setAdding(false)}>Cancel</AddButton>
                                </div>
                            )}
                        </>
                    ))}
                    {group("Dates", <AllTicks label="Dates" options={CARD_DATE_KINDS.map(kind => ({ id: kind.id, label: kind.label }))} selected={kinds} onChange={onKinds} />)}
                    {group(sourcesName, <AllTicks label={sourcesName} options={sources} selected={sourcesShown} onChange={onSources} />)}
                    {group("Date presentation", (
                        <RadioChoice
                            label="Date presentation"
                            group="org-calendar-date-format"
                            options={[{ id: "US" as DateFormat, label: "MM/DD (US)" }, { id: "EU" as DateFormat, label: "DD/MM (EU)" }]}
                            value={dateFormat}
                            onChange={onDateFormat}
                        />
                    ))}
                </div>
            )}

        </div>
    );
}
