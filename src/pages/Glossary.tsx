import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";
import TabList from "../components/controls/TabList";
import InfoNote from "../components/interview/fields/InfoNote";
import ResponsibilityFilter from "../components/interview/fields/ResponsibilityFilter";
import GlossaryList, { YOUR_TERMS_HUE, anchorOf, letterOf, letterRanges, toggled } from "../components/GlossaryList";
import HarvardReference from "../components/references/HarvardReference";
import { harvardReference, referenceList } from "../framework/engine/Sources";
import { OrganizationService } from "../services/OrganizationService";

import "../styles/global.css";
import "../styles/workspace.css";
// The funnel (ResponsibilityFilter) and the "i" note links are drawn as they are on the System pages.
import "../styles/conversation.css";
import "../styles/section-tiles.css";
import "../styles/glossary.css";

// (The list and its letter ranges are the shared GlossaryList's; the tests and the search read them here as before.)
export { letterRanges, REFERENCES_PER_RANGE, type LetterRange } from "../components/GlossaryList";

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

/**
 * What each title's "i" says (doc 39, 3.3: a page title's note, at most three points of at most 160 characters; an option's meaning as
 * "Name: meaning"). What the page is, how to use it, and what its two colours or its style mean: nothing of it repeats the title.
 */
export const GLOSSARY_INFO: Record<GlossaryTab, string[]> = {
    glossary: [
        "Every word the app uses and every name you gave, from A to Z. The funnel shows either kind, or both, and the letter ranges.",
        "App terms, in blue: the app's own words, with what each means here and the source it rests on. Press a source to read it in full.",
        "Your terms, in terracotta: the names you gave your Segments, Profiles, Offerings and the rest. Press \"Open the …\" to go to it."
    ],
    references: [
        "Every source the app cites, from A to Z. The funnel shows the letter ranges you choose.",
        "Written in the Harvard style: the author and year where a source is cited, and the full reference here.",
        "Each address opens in your browser."
    ]
};

/**
 * THE GLOSSARY AND THE REFERENCES, one page with two tabs, opened from the Workbook panel's Glossary (its References link), from the
 * Landing page's Glossary and from a Glossary result of the search.
 *
 * Glossary: the shared GlossaryList (every term in one A to Z list, in two colours, under one funnel of the kinds and the letter
 * ranges). The two kinds are named once, in the funnel, and their colours once, in the title's "i": no key on the page.
 *
 * References: every source the app cites (Sources.ts), as a Harvard reference list, in alphabetical order, with a funnel of letter
 * ranges (letterRanges: "A–I", "K–Z"). Escape, and Back, return to where the page was opened from.
 */
export default function Glossary() {

    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state as GlossaryState | null) ?? {};
    const [organizationId] = useState(() => OrganizationService.getSelected());
    const [tab, setTab] = useState<GlossaryTab>(state.tab ?? "glossary");
    const [lettersOff, setLettersOff] = useState<ReadonlySet<string>>(new Set());
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

    // Opened again for another term (a search result while the page is open): the funnels start again (the list is drawn anew, its own with it).
    useEffect(() => {
        if (state.term) {
            setTab(state.tab ?? "glossary");
            setTarget(state.term);
            setLettersOff(new Set());
        }
    }, [location.key]);

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
                    <GlossaryList
                        key={location.key}
                        organizationId={organizationId}
                        target={target}
                        onCitation={(id) => {
                            setTab("references");
                            setLettersOff(new Set());
                            setTarget(id);
                        }}
                    />
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
