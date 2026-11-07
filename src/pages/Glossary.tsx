import { CSSProperties, Fragment, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";
import TabList from "../components/controls/TabList";
import InfoNote from "../components/interview/fields/InfoNote";
import TextLink from "../components/interview/fields/TextLink";
import ResponsibilityFilter from "../components/interview/fields/ResponsibilityFilter";
import { openCard } from "../components/notepad/notepadPlaces";
import HarvardReference from "../components/references/HarvardReference";
import { PALETTE } from "../framework/engine/Palette";
import { harvardCitation, harvardReference, referenceList, SOURCES, type SourceId } from "../framework/engine/Sources";
import { GLOSSARY_KINDS, GlossaryService, type GlossaryKind } from "../services/GlossaryService";
import { OrganizationService } from "../services/OrganizationService";

import "../styles/global.css";
import "../styles/workspace.css";
// The funnel (ResponsibilityFilter) and the "i" note links are drawn as they are on the System pages.
import "../styles/conversation.css";
import "../styles/section-tiles.css";
import "../styles/glossary.css";

export type GlossaryTab = "glossary" | "references";

const TABS: readonly { id: GlossaryTab; label: string }[] = [
    { id: "glossary", label: "Glossary" },
    { id: "references", label: "References" }
];

/** What the Glossary is opened with: the tab, a term to show (an app term's id, or one of yours by its card id), and where to go back to. */
export interface GlossaryState {
    tab?: GlossaryTab;
    term?: string;
    from?: { pathname: string; state?: unknown };
}

/** Your terms are drawn in this palette hue, the app's in the app's own blue: one colour for each kind (glossary.css). */
const YOUR_TERMS_HUE = PALETTE.find(colour => colour.name === "terracotta")?.hue ?? 14;

/**
 * What each title's "i" says (doc 39, 3.3: a page title's note, at most three points of at most 160 characters; an option's meaning as
 * "Name: meaning"). What the page is, how to use it, and what its two colours or its style mean: nothing of it repeats the title.
 */
export const GLOSSARY_INFO: Record<GlossaryTab, string[]> = {
    glossary: [
        "Every word the app uses and every name you gave, from A to Z. The funnel shows either kind, or both.",
        "App terms, in blue: the app's own words, with what each means here and the source it rests on. Press a source to read it in full.",
        "Your terms, in terracotta: the names you gave your Segments, Profiles, Offerings and the rest. Press \"Open the …\" to go to it."
    ],
    references: [
        "Every source the app cites, from A to Z. The funnel shows the letter ranges you choose.",
        "Written in the Harvard style: the author and year where a source is cited, and the full reference here.",
        "Each address opens in your browser."
    ]
};

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
const letterOf = (text: string) => text.charAt(0).toLocaleUpperCase("en-GB");

/** A funnel's options ticked off, with one option turned over. */
const toggled = (current: ReadonlySet<string>, option: string) => {
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

const anchorOf = (key: string) => "glossary-term-" + key.replace(/[^A-Za-z0-9-]+/g, "-");

/**
 * THE GLOSSARY AND THE REFERENCES, one page with two tabs, opened from
 * the header's Glossary (beside Search) and from a Glossary result of
 * the search.
 *
 * Glossary: every term in one A to Z list, in two colours -- the app's
 * own words (APP_TERMS) in the app's blue, YOUR TERMS (the names you
 * gave your Segments, Profiles, Offerings ..., GlossaryService) in
 * terracotta, each of yours with its kind ("Segment") -- with a funnel
 * that shows either kind or both. The two kinds are named once, in the
 * funnel, and their colours once, in the title's "i": no key on the
 * page. An app term's meaning is followed by its Harvard citations,
 * each a link to its full reference; one of your terms opens its card.
 *
 * References: every source the app cites (Sources.ts), as a Harvard
 * reference list, in alphabetical order, with a funnel of letter
 * ranges (letterRanges: "A–I", "K–Z"). Escape, and Back, return to
 * where the page was opened from.
 */
export default function Glossary() {

    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state as GlossaryState | null) ?? {};
    const [organizationId] = useState(() => OrganizationService.getSelected());
    const [tab, setTab] = useState<GlossaryTab>(state.tab ?? "glossary");
    const [off, setOff] = useState<ReadonlySet<string>>(new Set());
    const [lettersOff, setLettersOff] = useState<ReadonlySet<string>>(new Set());
    // The Glossary's own letter ranges (owner, 2026-11-05: "add a letter range filter similarly to the references").
    const [termLettersOff, setTermLettersOff] = useState<ReadonlySet<string>>(new Set());
    const [target, setTarget] = useState<string | undefined>(state.term);

    const back = useMemo(() => () => {
        if (state.from && state.from.pathname !== "/glossary") {
            navigate(state.from.pathname, { state: state.from.state });
        } else {
            navigate("/assistant", { state: { capability: "foundation" } });
        }
    }, [state.from, navigate]);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !event.defaultPrevented) {
                back();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [back]);

    // Opened again for another term (a search result while the page is open).
    useEffect(() => {
        if (state.term) {
            setTab(state.tab ?? "glossary");
            setTarget(state.term);
            setOff(new Set());
            setLettersOff(new Set());
            setTermLettersOff(new Set());
        }
    }, [location.key]);

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

    // The terms' letter ranges, cut from all the terms as the References' are (about twenty a range).
    const termRanges = useMemo(() => letterRanges(entries.map(entry => letterOf(entry.term))), [entries]);
    const termRangeOf = (letter: string) => termRanges.find(range => range.letters.includes(letter))?.label ?? "";
    const shown = entries.filter(entry => !off.has(GLOSSARY_KINDS.find(kind => kind.id === entry.kind)!.label) && !termLettersOff.has(termRangeOf(letterOf(entry.term))));

    // The term asked for: in view, and marked for a moment.
    useEffect(() => {
        if (!target) {
            return;
        }
        const node = document.getElementById(tab === "references" ? "reference-" + target : anchorOf(target));
        node?.scrollIntoView?.({ block: "center" });
        const timer = window.setTimeout(() => setTarget(undefined), 2400);
        return () => window.clearTimeout(timer);
    }, [target, tab]);

    const letters = [...new Set(shown.map(entry => letterOf(entry.term)))];

    // The References are filed by the first letter of each reference (its first author); the funnel shows the letter ranges ticked.
    const references = useMemo(() => referenceList().map(entry => ({ ...entry, letter: letterOf(harvardReference(entry.source)) })), []);
    const ranges = useMemo(() => letterRanges(references.map(entry => entry.letter)), [references]);
    const rangeOf = (letter: string) => ranges.find(range => range.letters.includes(letter))?.label ?? "";
    const referencesShown = references.filter(entry => !lettersOff.has(rangeOf(entry.letter)));

    return (

        <div className="workspace glossary" style={{ "--glossary-yours-hue": YOUR_TERMS_HUE } as CSSProperties}>

            <AppHeader organizationName={organizationId ? OrganizationService.getSummary(organizationId)?.name ?? "" : ""} />

            <main className="glossary-page">

                <h1 className="workspace-title glossary-title">
                    {tab === "glossary" ? "Glossary" : "References"}
                    <InfoNote key={tab} label={tab === "glossary" ? "Glossary" : "References"} points={GLOSSARY_INFO[tab]} />
                </h1>

                <TabList label="Glossary or references" tabs={TABS} value={tab} onChange={setTab} className="glossary-tabs" />

                {tab === "glossary" && (
                    <section className="glossary-section" aria-label="Glossary">

                        <div className="glossary-bar">
                            <ResponsibilityFilter
                                off={off}
                                options={GLOSSARY_KINDS.map(kind => kind.label)}
                                label="Choose which terms show"
                                onToggle={(option) => setOff(current => toggled(current, option))}
                            />
                            {termRanges.length > 1 && (
                                <ResponsibilityFilter
                                    off={termLettersOff}
                                    options={termRanges.map(range => range.label)}
                                    label="Choose which letter ranges show"
                                    onToggle={(option) => setTermLettersOff(current => toggled(current, option))}
                                />
                            )}
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
                                                                    onClick={() => {
                                                                        setTab("references");
                                                                        setLettersOff(new Set());
                                                                        setTarget(id);
                                                                    }}
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
                )}

                {tab === "references" && (
                    <section className="glossary-section" aria-label="References">

                        <div className="glossary-bar">
                            <ResponsibilityFilter
                                off={lettersOff}
                                options={ranges.map(range => range.label)}
                                label="Choose which letter ranges show"
                                onToggle={(option) => setLettersOff(current => toggled(current, option))}
                            />
                        </div>

                        {referencesShown.length === 0 && <p className="glossary-empty">No references to show: the funnel leaves them all out.</p>}

                        <ol className="references-list">
                            {referencesShown.map(({ id, source }) => (
                                <li key={id} id={"reference-" + id} className={"references-entry" + (target === id ? " glossary-entry-target" : "")}>
                                    <HarvardReference source={source} />
                                </li>
                            ))}
                        </ol>
                    </section>
                )}

            </main>

            <AppFooter onBack={back} />

        </div>

    );

}
