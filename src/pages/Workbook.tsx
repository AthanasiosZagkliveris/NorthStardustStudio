import { CSSProperties, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";
import InterviewHeader from "../components/interview/editors/InterviewHeader";
import BulletRail from "../components/interview/rails/BulletRail";
import InfoNote from "../components/interview/fields/InfoNote";
import ResponsibilityFilter from "../components/interview/fields/ResponsibilityFilter";
import GlossaryList, { YOUR_TERMS_HUE, anchorOf, letterOf, letterRanges, toggled } from "../components/GlossaryList";
import OrganizationReview, { goToReviewPlace } from "../components/OrganizationReview";
import { WorkbookCardNotes, type WorkbookState } from "../components/notepad/Notepad";
import HarvardReference from "../components/references/HarvardReference";
import { harvardReference, referenceList } from "../framework/engine/Sources";
import useRailTab, { type RailTabColours } from "../hooks/useRailTab";
import { OrganizationService } from "../services/OrganizationService";
import { organizationReview } from "../services/ReviewService";

import "../styles/global.css";
import "../styles/workspace.css";
// The funnel (ResponsibilityFilter) and the "i" note links are drawn as they are on the System pages.
import "../styles/conversation.css";
import "../styles/section-tiles.css";
import "../styles/glossary.css";
import "../styles/review.css";

// (The list and its letter ranges are the shared GlossaryList's; the tests and the search read them here as before.)
export { letterRanges, REFERENCES_PER_RANGE, type LetterRange } from "../components/GlossaryList";
export type { WorkbookState } from "../components/notepad/Notepad";

export type WorkbookTab = NonNullable<WorkbookState["tab"]>;

/**
 * The page tab's colours (useRailTab): the Workbook belongs to no System and has no frame to take them from, so its tab is drawn in the
 * page's own ground with the app's blue for its edge and bullets (the header tools' edge), as tokens, so it follows the reading mode.
 */
const WORKBOOK_TAB: RailTabColours = { bg: "var(--bg-surface)", edge: "var(--line-primary)", ink: "var(--text-strong)" };

const TAB_LABELS: Record<WorkbookTab, string> = { "card-notes": "Card Notes", review: "Review", glossary: "Glossary", references: "References" };

/**
 * What the Glossary's and the References' titles' "i" says (doc 39, 3.3: a page title's note, at most three points of at most 160
 * characters; an option's meaning as "Name: meaning"). What the tab is, how to use it, and what its two colours or its style mean:
 * nothing of it repeats the title. (The Card Notes and the Review carry no "i", as before.)
 */
export const GLOSSARY_INFO: Record<"glossary" | "references", string[]> = {
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
 * THE WORKBOOK (owner, 2026-11-09: "the layout as it was the Glossary, a whole page, not a side panel"; then "match the app's page
 * style"): one page in the System pages' shape: the title at the top left over its rule ("Workbook — Glossary", InterviewHeader),
 * and its tabs as the bullets of a page tab at the left (BulletRail in the `.bullet-rails` band, the tab drawn by useRailTab).
 *
 * Card Notes: the Notes text of every card (WorkbookCardNotes, Notepad.tsx; owner, 2026-11-09: "Card Notes and Notes tool are
 * different. Card Notes in the Workbook, Notes Tool as before": the person's own notes are the header's Notes tool, its side panel).
 * Review: the open Organisation's (OrganizationReview).
 * Glossary: the shared GlossaryList (every term in one A to Z list, in two colours, under one funnel of the kinds and the letter
 * ranges). References: every source the app cites (Sources.ts), as a Harvard reference list, with a funnel of letter ranges.
 *
 * Opened from the header's Workbook: with an Organisation open, and on the Landing page (the same button, `total`: the review of every
 * Organisation, with a funnel of the Organisations, and the Glossary with every Organisation's terms; there no Organisation is open, so
 * the page has the Landing's header and the Card Notes, one Organisation's, are left out), and from a Glossary result of the search.
 * Escape, and Back, return to where it was opened from.
 */
export default function Workbook() {

    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state as WorkbookState | null) ?? {};
    const [organizationId] = useState(() => OrganizationService.getSelected());
    // Opened from the Landing page (or with no Organisation): its header, the total review, the Glossary and the References.
    const landing = state.total === true || !organizationId;
    const tabs = useMemo(() => (landing ? ["review", "glossary", "references"] as const : ["card-notes", "review", "glossary", "references"] as const)
        .map(id => ({ id: id as WorkbookTab, label: TAB_LABELS[id] })), [landing]);
    const first = (wanted?: WorkbookTab): WorkbookTab => wanted && tabs.some(entry => entry.id === wanted) ? wanted : tabs[0].id;
    const [tab, setTab] = useState<WorkbookTab>(() => first(state.tab));
    const [lettersOff, setLettersOff] = useState<ReadonlySet<string>>(new Set());
    // The total review's funnel: the Organisations ticked off (by name; every one shows at first).
    const [organisationsOff, setOrganisationsOff] = useState<ReadonlySet<string>>(new Set());
    const [target, setTarget] = useState<string | undefined>(state.term);

    const back = useMemo(() => () => {
        if (state.from && state.from.pathname !== "/workbook") {
            navigate(state.from.pathname, { state: state.from.state });
        } else {
            navigate(landing ? "/" : "/assistant", landing ? undefined : { state: { capability: "foundation" } });
        }
    }, [state.from, landing, navigate]);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !event.defaultPrevented) {
                back();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [back]);

    // Opened again (a header tool, a search result, a Calendar note while the page is open): its tab, and the funnels start again.
    useEffect(() => {
        setTab(first(state.tab));
        if (state.term) {
            setTarget(state.term);
            setLettersOff(new Set());
        }
    }, [location.key]);

    // The term asked for: in view, and marked for a moment.
    useEffect(() => {
        if (!target || (tab !== "glossary" && tab !== "references")) {
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

    // The Review: the open Organisation alone; the total review, every Organisation in the Landing's order, each its own section.
    // (Worked out again each time the page is opened: an answer given since may close an item.)
    const reviews = useMemo(() => {
        if (tab !== "review") {
            return [];
        }
        const all = OrganizationService.list();
        const shown = landing ? all : all.filter(entry => entry.id === organizationId);
        return shown.map(entry => ({ id: entry.id, name: entry.name, items: organizationReview(entry.id) }));
    }, [tab, organizationId, landing, location.key]);
    // The total review (the Landing page's) has a funnel of the Organisations, as the Glossary's (owner, 2026-11-09), where there are two or more.
    const organisationFunnel = landing && reviews.length > 1;
    const reviewsShown = reviews.filter(section => !organisationsOff.has(section.name));

    const title = tab === "review" && landing ? "Total review" : TAB_LABELS[tab];

    // Whose terms the Glossary lists: the open Organisation's, or on the Landing page every Organisation's.
    const glossaryOrganisations = useMemo(() => landing ? OrganizationService.list().map(entry => entry.id) : organizationId ? [organizationId] : [],
        [landing, organizationId]);

    // The page tab, in the Workbook's own colours (it has no frame to take them from).
    useRailTab(WORKBOOK_TAB);

    // The tab starts 12px under the top of what the page shows under its title (the page tab's rule): the rails' band reads it as
    // --arrow-level (bullet-rail.css), the level a page arrow sets on a System page, 24px over the rails' row.
    const [tabLevel, setTabLevel] = useState<number | null>(null);
    useLayoutEffect(() => {
        const header = document.querySelector(".workbook .interview-header");
        if (!header) {
            return;
        }
        const gap = parseFloat(getComputedStyle(header.parentElement as Element).rowGap) || 0;
        setTabLevel(Math.round(header.getBoundingClientRect().bottom + window.scrollY + gap + 12 - 24));
    }, [tab]);

    // A bullet of the page tab: that tab, from its top.
    const show = (next: WorkbookTab) => {
        setTab(next);
        window.scrollTo?.({ top: 0 });
    };

    return (

        <div
            className="workspace glossary workbook"
            style={{ "--glossary-yours-hue": YOUR_TERMS_HUE, ...(tabLevel === null ? {} : { "--arrow-level": tabLevel + "px" }) } as CSSProperties}
        >

            {/* (Opened from the Landing page: its header, not the selected Organisation's.) */}
            <AppHeader organizationName={!landing && organizationId ? OrganizationService.getSummary(organizationId)?.name ?? "" : ""} totalReview={landing} />

            <main className="glossary-page">

                {/* The top of the page as on a System page: "Workbook — Glossary" at the top left, over its rule. */}
                <InterviewHeader
                    systemName="Workbook"
                    pageTitle={title}
                    note={(tab === "glossary" || tab === "references") && <InfoNote key={tab} label={TAB_LABELS[tab]} points={GLOSSARY_INFO[tab]} />}
                />

                {tab === "card-notes" && <WorkbookCardNotes />}

                {tab === "review" && organisationFunnel && (
                    <div className="glossary-bar">
                        <ResponsibilityFilter
                            off={organisationsOff}
                            options={[...new Set(reviews.map(section => section.name))]}
                            label="Choose which Organisations show"
                            onToggle={(option) => setOrganisationsOff(current => toggled(current, option))}
                        />
                    </div>
                )}

                {tab === "review" && reviews.length > 0 && reviewsShown.length === 0 && <p className="glossary-empty">No Organisations to show: the funnel leaves them all out.</p>}

                {tab === "review" && reviewsShown.map(section => (
                    <OrganizationReview
                        key={section.id}
                        name={section.name}
                        items={section.items}
                        current={!landing}
                        onGo={(place) => goToReviewPlace(navigate, section.id, place)}
                    />
                ))}

                {tab === "glossary" && (
                    <GlossaryList
                        key={location.key}
                        organizationIds={glossaryOrganisations}
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

            {/* The page tab at the left, as on a System page: one bullet for each tab, the one shown lit (after <main>, so the page's
                own content comes first in the tab order; the band is fixed, see bullet-rail.css). */}
            <div className="bullet-rails">
                <div className="bullet-rails-row">
                    <BulletRail side="left" label="Workbook" items={tabs} activeId={tab} onSelect={(id) => show(id as WorkbookTab)} />
                </div>
            </div>

            <AppFooter onBack={back} />

        </div>

    );

}

/**
 * The Glossary's and the Review's old addresses (`/glossary`, `/review`): the Workbook on that tab, with what they were opened with
 * (a term, the References, the total review, where to go back to).
 */
export function WorkbookRedirect({ tab }: { tab: "glossary" | "review" }) {
    const location = useLocation();
    const state = (location.state as WorkbookState | null) ?? {};
    return <Navigate to="/workbook" replace state={{ ...state, tab: state.tab ?? tab }} />;
}
