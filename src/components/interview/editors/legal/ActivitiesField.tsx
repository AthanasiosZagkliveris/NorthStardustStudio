/**
 * THE ACTIVITIES of the Organization tile (design documents 35, 5.7, and 28, 8.5): up to four rows in the pattern of an activity's Performers. Each row is one path of the country's
 * official classification, from the Industry to a final code, and is stored as that code only. The first row is the primary activity (required); the others are optional.
 *
 * Row: the fold arrow and the sub-label (Primary, Secondary, ...) at the left, then, when the row is folded, its code with the scheme's initials in bold on the same line, and the "+" (first row) or the × (the others) in the x column. A folded row shows the last category under its sub-label; an open row shows its dropdowns, each under its level's name.
 */
import { useEffect, useState } from "react";
import AddButton from "../../../controls/AddButton.tsx";
import FieldLabel from "../../../controls/FieldLabel.tsx";
import TextBox from "../../../controls/TextBox.tsx";
import RemoveButton from "../../../controls/RemoveButton.tsx";
import FoldArrow from "../../fields/FoldArrow.tsx";
import { FIRST_VERSION_COUNTRIES } from "../../../../framework/engine/LegalEntityJurisdictions.ts";
import OptionPicker from "../../fields/OptionPicker.tsx";
import { MAX_ACTIVITIES, type LegalEntityActivityValue } from "../../../../framework/engine/AnswerUtils.ts";
import {
    SCHEME_CODE_LABEL,
    childrenOf,
    loadClassification,
    pathOf,
    schemeKeyOf,
    shownTitle,
    type ClassificationItem,
    type ClassificationScheme
} from "../../../../framework/engine/ActivityClassification.ts";

const SUB_LABELS = ["Primary", "Secondary", "Tertiary", "Quaternary"] as const;

interface Row {
    /** The code the row ends in, or "" while it is not finished. */
    code: string;
    /** The code chosen at each level so far, top first (a finished row's are looked up from its code when it is opened). */
    picks: string[];
    open: boolean;
}

/** What a dropdown shows for an entry, as the official document prints it: the code, then the title (so "54" and "541", whose titles are the same, are told apart). */
function optionLabel(item: ClassificationItem): string {
    return item.code + " " + shownTitle(item.title);
}

interface ActivitiesFieldProps {
    country: string;
    activities: LegalEntityActivityValue[];
    onChange: (next: LegalEntityActivityValue[]) => void;
    disabled?: boolean;
}

/** The six countries have their official classification to choose from; any other country is "Other" and its user types the activity and its code (design document 33, section 3). */
export default function ActivitiesField(props: ActivitiesFieldProps) {
    return FIRST_VERSION_COUNTRIES.includes(props.country)
        ? <ClassifiedActivities {...props} />
        : <TypedActivities activities={props.activities} onChange={props.onChange} disabled={props.disabled} />;
}

/** Up to four rows, each the activity in the user's words and its code, typed (a country the app has no classification of). */
function TypedActivities({ activities, onChange, disabled = false }: Omit<ActivitiesFieldProps, "country">) {
    const [rows, setRows] = useState<{ name: string; code: string }[]>(() => activities.length > 0
        ? activities.map(activity => ({ name: activity.name ?? "", code: activity.code }))
        : [{ name: "", code: "" }]);
    /** Saves the rows that hold anything. */
    function commit(next: { name: string; code: string }[]) {
        setRows(next);
        onChange(next
            .filter(row => row.name.trim() !== "" || row.code.trim() !== "")
            .map(row => ({ code: row.code.trim(), edition: "", ...(row.name.trim() !== "" ? { name: row.name.trim() } : {}) })));
    }
    return (
        <div className="business-capability-performers legal-entity-activities">
            {rows.map((row, index) => {
                const name = SUB_LABELS[index];
                return (
                    <div key={index} className="legal-entity-activity-block legal-entity-activity-open">
                        <div className="business-capability-performer">
                            <span className="legal-entity-fold-cell">
                                <FieldLabel className="legal-entity-sublabel">{name}</FieldLabel>
                            </span>
                            {index > 0
                                ? <RemoveButton aria-label={"Remove " + name.toLowerCase() + " activity"} disabled={disabled} onClick={() => commit(rows.filter((_, at) => at !== index))} />
                                : rows.length < MAX_ACTIVITIES
                                    ? <AddButton shape="box" small aria-label="Add activity" title="Add activity" disabled={disabled} onClick={() => commit([...rows, { name: "", code: "" }])} />
                                    : <span className="business-capability-performer-slot" aria-hidden="true" />}
                        </div>
                        <div className="legal-entity-fold-body">
                            <div className="legal-entity-level-pair">
                                <FieldLabel className="legal-entity-label">Activity</FieldLabel>
                                <TextBox
                                    className="interview-input"
                                    aria-label={"Activity of the " + name.toLowerCase() + " activity"}
                                    placeholder="What the organization does"
                                    disabled={disabled}
                                    value={row.name}
                                    onChange={(event) => commit(rows.map((entry, at) => at === index ? { ...entry, name: event.target.value } : entry))}
                                />
                            </div>
                            <div className="legal-entity-level-pair">
                                <FieldLabel className="legal-entity-label">Code</FieldLabel>
                                <TextBox
                                    className="interview-input"
                                    aria-label={"Code of the " + name.toLowerCase() + " activity"}
                                    placeholder="The code your country's register uses"
                                    disabled={disabled}
                                    value={row.code}
                                    onChange={(event) => commit(rows.map((entry, at) => at === index ? { ...entry, code: event.target.value } : entry))}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function ClassifiedActivities({ country, activities, onChange, disabled = false }: ActivitiesFieldProps) {
    const key = schemeKeyOf(country);
    const [scheme, setScheme] = useState<ClassificationScheme | null>(null);
    const [rows, setRows] = useState<Row[]>(() => activities.length > 0
        ? activities.map(activity => ({ code: activity.code, picks: [], open: false }))
        : [{ code: "", picks: [], open: true }]);

    useEffect(() => {
        let live = true;
        setScheme(null);
        void loadClassification(key).then(loaded => {
            if (live) {
                setScheme(loaded);
            }
        });
        return () => {
            live = false;
        };
    }, [key]);

    /** Saves the finished rows (the codes, in the rows' order). */
    function commit(next: Row[]) {
        setRows(next);
        onChange(next.filter(row => row.code !== "").map(row => ({ code: row.code, edition: scheme?.edition ?? "" })));
    }
    function patch(index: number, change: Partial<Row>) {
        commit(rows.map((row, at) => at === index ? { ...row, ...change } : row));
    }
    /** The row's choices at each level: the stored path of a finished row, the picks of one in progress. */
    function picksOf(row: Row): string[] {
        if (row.code !== "" && scheme) {
            return pathOf(scheme, row.code).map(item => item.code);
        }
        return row.picks;
    }
    /** A choice at a level: it empties the levels below it and the code (a change at a higher level resets the rest), and a final code finishes the row, which folds. */
    function choose(index: number, level: number, item: ClassificationItem) {
        const picks = [...picksOf(rows[index]).slice(0, level), item.code];
        patch(index, item.final ? { code: item.code, picks, open: false } : { code: "", picks, open: true });
    }
    function add() {
        commit([...rows, { code: "", picks: [], open: true }]);
    }
    function remove(index: number) {
        commit(rows.filter((_, at) => at !== index));
    }

    return (
        <div className="business-capability-performers legal-entity-activities">
            {rows.map((row, index) => {
                const name = SUB_LABELS[index];
                const picks = picksOf(row);
                const finished = scheme && row.code !== "" ? pathOf(scheme, row.code) : [];
                const last = finished.length > 0 ? finished[finished.length - 1] : undefined;
                return (
                    <div key={index} className={"legal-entity-activity-block" + (row.open ? " legal-entity-activity-open" : "")}>
                        <div className="business-capability-performer">
                            <span className="legal-entity-fold-cell">
                                <FieldLabel className="legal-entity-sublabel">
                                    <FoldArrow open={row.open} variant="label" label={name.toLowerCase() + " activity"} onToggle={() => setRows(rows.map((entry, at) => at === index ? { ...entry, open: !entry.open } : entry))} />
                                    {name}
                                </FieldLabel>
                                {row.code !== "" && <b className="legal-entity-fold-code">{SCHEME_CODE_LABEL[key]} {row.code}</b>}
                            </span>
                            {index > 0
                                ? <RemoveButton aria-label={"Remove " + name.toLowerCase() + " activity"} disabled={disabled} onClick={() => remove(index)} />
                                : rows.length < MAX_ACTIVITIES
                                    ? <AddButton shape="box" small aria-label="Add activity" title="Add activity" disabled={disabled} onClick={add} />
                                    : <span className="business-capability-performer-slot" aria-hidden="true" />}
                        </div>
                        {!row.open && last && (
                            <div className="legal-entity-fold-body">
                                <span className="legal-entity-fold-name marquee-text">{shownTitle(last.title)}</span>
                            </div>
                        )}
                        {row.open && scheme && (
                            <div className="legal-entity-fold-body">
                                {levelsOf(scheme, picks).map(({ level, options, value }) => (
                                    <div key={level} className="legal-entity-level-pair">
                                        <FieldLabel className="legal-entity-label">{scheme.levels[level]}</FieldLabel>
                                        <OptionPicker
                                            label={scheme.levels[level] + " of the " + name.toLowerCase() + " activity"}
                                            fill
                                            visibleOptions={30}
                                            placeholder="Select"
                                            disabled={disabled}
                                            options={options.map(optionLabel)}
                                            value={value ? optionLabel(value) : ""}
                                            onChange={(next) => {
                                                const chosen = options.find(item => optionLabel(item) === next);
                                                if (chosen) {
                                                    choose(index, level, chosen);
                                                }
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/** The dropdowns of a row: one per level down to the first level whose choice is not made (or is a final code). */
function levelsOf(scheme: ClassificationScheme, picks: string[]): { level: number; options: ClassificationItem[]; value: ClassificationItem | undefined }[] {
    const out: { level: number; options: ClassificationItem[]; value: ClassificationItem | undefined }[] = [];
    let parent: string | null = null;
    for (let level = 0; level < scheme.levels.length; level++) {
        const options = childrenOf(scheme, parent);
        if (options.length === 0) {
            break;
        }
        const value = options.find(item => item.code === picks[level]);
        out.push({ level, options, value });
        if (!value || value.final) {
            break;
        }
        parent = value.code;
    }
    return out;
}
