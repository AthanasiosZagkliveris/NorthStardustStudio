import { CSSProperties, Fragment, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";
import TabList from "../components/controls/TabList";
import TextLink from "../components/interview/fields/TextLink";
import ResponsibilityFilter from "../components/interview/fields/ResponsibilityFilter";
import { openCard } from "../components/notepad/notepadPlaces";
import HarvardReference from "../components/references/HarvardReference";
import { PALETTE } from "../framework/engine/Palette";
import { harvardCitation, referenceList, SOURCES, type SourceId } from "../framework/engine/Sources";
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

/** One row of the list: an app term or one of yours. */
interface Entry {
    key: string;
    kind: GlossaryKind;
    term: string;
    /** What it is: "App term", or the kind of card ("Segment"). */
    tag: string;
    meaning: string;
    sources: readonly SourceId[];
    open?: () => void;
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
 * terracotta -- with a funnel that shows either kind or both. An app
 * term's meaning is followed by its Harvard citations, each a link to
 * its full reference; one of your terms opens its card.
 *
 * References: every source the app cites (Sources.ts), as a Harvard
 * reference list, in alphabetical order. Escape, and Back, return to
 * where the page was opened from.
 */
export default function Glossary() {

    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state as GlossaryState | null) ?? {};
    const [organizationId] = useState(() => OrganizationService.getSelected());
    const [tab, setTab] = useState<GlossaryTab>(state.tab ?? "glossary");
    const [off, setOff] = useState<ReadonlySet<string>>(new Set());
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

    const shown = entries.filter(entry => !off.has(GLOSSARY_KINDS.find(kind => kind.id === entry.kind)!.label));

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

    const letters = [...new Set(shown.map(entry => entry.term.charAt(0).toLocaleUpperCase("en-GB")))];

    return (

        <div className="workspace glossary" style={{ "--glossary-yours-hue": YOUR_TERMS_HUE } as CSSProperties}>

            <AppHeader organizationName={organizationId ? OrganizationService.getSummary(organizationId)?.name ?? "" : ""} />

            <main className="glossary-page">

                <h1 className="workspace-title glossary-title">{tab === "glossary" ? "Glossary" : "References"}</h1>

                <TabList label="Glossary or references" tabs={TABS} value={tab} onChange={setTab} className="glossary-tabs" />

                {tab === "glossary" && (
                    <section className="glossary-section" aria-label="Glossary">

                        <div className="glossary-bar">
                            <p className="glossary-legend">
                                <span className="glossary-key glossary-key-app">App terms</span>
                                <span className="glossary-legend-text">the app's own words</span>
                                <span className="glossary-key glossary-key-yours">Your terms</span>
                                <span className="glossary-legend-text">the names you gave</span>
                            </p>
                            <ResponsibilityFilter
                                off={off}
                                options={GLOSSARY_KINDS.map(kind => kind.label)}
                                label="Choose which terms show"
                                onToggle={(option) => setOff(current => {
                                    const next = new Set(current);
                                    if (!next.delete(option)) {
                                        next.add(option);
                                    }
                                    return next;
                                })}
                            />
                        </div>

                        {shown.length === 0 && <p className="glossary-empty">No terms to show: the funnel leaves them all out.</p>}

                        {letters.map(letter => (
                            <section className="glossary-letter" key={letter} aria-label={letter}>
                                <h2 className="glossary-letter-title">{letter}</h2>
                                <dl className="glossary-list">
                                    {shown.filter(entry => entry.term.charAt(0).toLocaleUpperCase("en-GB") === letter).map(entry => (
                                        <div
                                            key={entry.kind + entry.key}
                                            id={anchorOf(entry.key)}
                                            className={"glossary-entry glossary-entry-" + entry.kind + (target === entry.key ? " glossary-entry-target" : "")}
                                        >
                                            <dt className="glossary-term">
                                                <span className="glossary-term-name">{entry.term}</span>
                                                <span className="glossary-term-tag">{entry.tag}</span>
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
                        <p className="glossary-intro">
                            Every source the app cites, in the Harvard style: the author and year are cited in the text, and the full reference is here. Each address opens in your browser.
                        </p>
                        <ol className="references-list">
                            {referenceList().map(({ id, source }) => (
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
