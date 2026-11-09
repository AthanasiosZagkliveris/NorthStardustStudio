import { CSSProperties, Fragment, ReactNode, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TextLink from "./interview/fields/TextLink";
import ResponsibilityFilter from "./interview/fields/ResponsibilityFilter";
import { openCard } from "./notepad/notepadPlaces";
import { PALETTE } from "../framework/engine/Palette";
import { harvardCitation, SOURCES, type SourceId } from "../framework/engine/Sources";
import { GLOSSARY_KINDS, GlossaryService, type GlossaryKind } from "../services/GlossaryService";

// The funnel (ResponsibilityFilter) is drawn as it is on the System pages.
// (The sheets in the order the System pages load them, section-tiles.css before conversation.css: the Workbook loads this with the header, first, so its order is the
// app's, and rules of the same weight in the two sheets resolve as on the pages they were written for.)
import "../styles/section-tiles.css";
import "../styles/conversation.css";
import "../styles/glossary.css";

/** Your terms are drawn in this palette hue, the app's in the app's own blue: one colour for each kind (glossary.css). */
export const YOUR_TERMS_HUE = PALETTE.find(colour => colour.name === "terracotta")?.hue ?? 14;

/** One row of the list: an app term or one of yours. */
interface Entry {
    key: string;
    kind: GlossaryKind;
    term: string;
    /** What it is: "App term" (never shown: an app term is told by its colour and by having no tag), or the kind of card ("Segment"). */
    tag: string;
    meaning: string;
    sources: readonly SourceId[];
    open?: () => void;
}

/** The letter a term or a reference is filed under: its first letter. */
export const letterOf = (text: string) => text.charAt(0).toLocaleUpperCase("en-GB");

/** A funnel's options ticked off, with one option turned over. */
export const toggled = (current: ReadonlySet<string>, option: string) => {
    const next = new Set(current);
    if (!next.delete(option)) {
        next.add(option);
    }
    return next;
};

/** About this many references to a range of the References' funnel. */
export const REFERENCES_PER_RANGE = 20;

/** One option of the References' funnel: a run of first letters ("A–I") and the letters it holds. */
export interface LetterRange {
    label: string;
    letters: readonly string[];
}

/**
 * The References' funnel options: the first letters of the references (one per reference, in A to Z order) cut into
 * ceil(count / perRange) runs, as even as the letters allow, each cut between two letters (a letter is never split).
 * The first run starts at A and the last ends at Z ("A–I", "K–Z"); more runs appear on their own as the references grow.
 */
export function letterRanges(letters: readonly string[], perRange = REFERENCES_PER_RANGE): LetterRange[] {
    const distinct = [...new Set(letters)].sort((one, other) => one.localeCompare(other, "en-GB"));
    if (distinct.length === 0) {
        return [];
    }
    const counts = distinct.map(letter => letters.filter(each => each === letter).length);
    const groups = Math.min(distinct.length, Math.max(1, Math.ceil(letters.length / perRange)));
    const mean = letters.length / groups;
    // best[g][i]: the least sum of squared distances from the mean for the first i letters in g runs; cut[g][i]: where its last run starts.
    const best = Array.from({ length: groups + 1 }, () => new Array<number>(distinct.length + 1).fill(Infinity));
    const cut = Array.from({ length: groups + 1 }, () => new Array<number>(distinct.length + 1).fill(0));
    best[0][0] = 0;
    for (let g = 1; g <= groups; g++) {
        for (let i = g; i <= distinct.length; i++) {
            let size = 0;
            for (let start = i - 1; start >= g - 1; start--) {
                size += counts[start];
                const cost = best[g - 1][start] + (size - mean) ** 2;
                if (cost < best[g][i]) {
                    best[g][i] = cost;
                    cut[g][i] = start;
                }
            }
        }
    }
    const runs: string[][] = [];
    for (let g = groups, end = distinct.length; g > 0; g--) {
        const start = cut[g][end];
        runs.unshift(distinct.slice(start, end));
        end = start;
    }
    return runs.map((run, at) => {
        const first = at === 0 ? "A" : run[0];
        const last = at === runs.length - 1 ? "Z" : run[run.length - 1];
        return { label: first === last ? first : first + "–" + last, letters: run };
    });
}

export const anchorOf = (key: string) => "glossary-term-" + key.replace(/[^A-Za-z0-9-]+/g, "-");

/**
 * THE GLOSSARY'S LIST (the Glossary page's first tab, and the Workbook panel's Glossary): every term in one A to Z list, in two
 * colours -- the app's own words in the app's blue, YOUR TERMS (the names you gave your Segments, Profiles, Offerings ...) in
 * terracotta, each of yours with its kind ("Segment") -- under ONE funnel: the kinds of term, then the letter ranges (about twenty
 * terms a range, cut as the References' are). An app term's meaning is followed by its Harvard citations (`onCitation` shows the
 * full reference); one of your terms opens its card.
 */
export default function GlossaryList({ organizationId, target, onCitation, lead }: {
    organizationId: string | null;
    /** The term asked for (an app term's id, or one of yours by its card id): marked for a moment. */
    target?: string;
    onCitation: (source: SourceId) => void;
    /** What stands at the start of the funnel's row (the Workbook panel's link to the References). */
    lead?: ReactNode;
}) {

    const navigate = useNavigate();
    const [off, setOff] = useState<ReadonlySet<string>>(new Set());
    // The Glossary's own letter ranges (owner, 2026-11-05: "add a letter range filter similarly to the references").
    const [lettersOff, setLettersOff] = useState<ReadonlySet<string>>(new Set());

    const entries = useMemo<Entry[]>(() => {
        const app: Entry[] = GlossaryService.appTerms().map(term => ({
            key: term.id, kind: "app", term: term.term, tag: "App term", meaning: term.meaning, sources: term.sources ?? []
        }));
        const yours: Entry[] = organizationId
            ? GlossaryService.userTerms(organizationId).map(term => ({
                key: term.cardId || "organisation",
                kind: "yours",
                term: term.name,
                tag: term.kind,
                meaning: term.description,
                sources: [],
                open: () => openCard(navigate, organizationId, term.systemNumber, term.sectionNumber, term.cardId)
            }))
            : [];
        return [...app, ...yours].sort((one, other) => one.term.localeCompare(other.term, "en-GB", { sensitivity: "base" }));
    }, [organizationId, navigate]);

    const kinds = GLOSSARY_KINDS.map(kind => kind.label);
    // The terms' letter ranges, cut from all the terms as the References' are (about twenty a range).
    const ranges = useMemo(() => letterRanges(entries.map(entry => letterOf(entry.term))), [entries]);
    const rangeOf = (letter: string) => ranges.find(range => range.letters.includes(letter))?.label ?? "";
    const shown = entries.filter(entry => !off.has(GLOSSARY_KINDS.find(kind => kind.id === entry.kind)!.label) && !lettersOff.has(rangeOf(letterOf(entry.term))));
    const letters = [...new Set(shown.map(entry => letterOf(entry.term)))];

    return (
        <section className="glossary-section" aria-label="Glossary" style={{ "--glossary-yours-hue": YOUR_TERMS_HUE } as CSSProperties}>

            <div className="glossary-bar">
                {lead}
                {/* ONE funnel: the kinds of term, then the letter ranges (where there is more than one); each tick goes to its own set. */}
                <ResponsibilityFilter
                    off={new Set([...off, ...lettersOff])}
                    options={[...kinds, ...(ranges.length > 1 ? ranges.map(range => range.label) : [])]}
                    label="Choose which terms show"
                    onToggle={(option) => kinds.includes(option)
                        ? setOff(current => toggled(current, option))
                        : setLettersOff(current => toggled(current, option))}
                />
            </div>

            {shown.length === 0 && <p className="glossary-empty">No terms to show: the funnel leaves them all out.</p>}

            {letters.map(letter => (
                <section className="glossary-letter" key={letter} aria-label={letter}>
                    <h2 className="glossary-letter-title">{letter}</h2>
                    <dl className="glossary-list">
                        {shown.filter(entry => letterOf(entry.term) === letter).map(entry => (
                            <div
                                key={entry.kind + entry.key}
                                id={anchorOf(entry.key)}
                                className={"glossary-entry glossary-entry-" + entry.kind + (target === entry.key ? " glossary-entry-target" : "")}
                            >
                                <dt className="glossary-term">
                                    <span className="glossary-term-name">{entry.term}</span>
                                    {/* Only your terms say what they are ("Segment"); an app term is told by its colour and by having no tag. */}
                                    {entry.kind === "yours" && <span className="glossary-term-tag">{entry.tag}</span>}
                                </dt>
                                <dd className="glossary-meaning">
                                    {entry.meaning}
                                    {entry.sources.length > 0 && (
                                        <span className="glossary-citations">
                                            {" "}
                                            {entry.sources.map((id, at) => (
                                                <Fragment key={id}>
                                                    {at > 0 && " "}
                                                    <TextLink
                                                        className="glossary-citation"
                                                        title={"Show the full reference"}
                                                        onClick={() => onCitation(id)}
                                                    >
                                                        {harvardCitation(SOURCES[id])}
                                                    </TextLink>
                                                </Fragment>
                                            ))}
                                        </span>
                                    )}
                                    {entry.open && (
                                        <>
                                            {entry.meaning ? " " : ""}
                                            <TextLink className="glossary-open" onClick={entry.open}>
                                                {"Open the " + entry.tag.toLocaleLowerCase("en-GB")}
                                            </TextLink>
                                        </>
                                    )}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>
            ))}

        </section>
    );

}
