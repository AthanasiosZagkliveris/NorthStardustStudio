import { CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";
import InterviewHeader from "../components/interview/editors/InterviewHeader";
import CardShell from "../components/interview/cards/CardShell";
import { CarouselArrows } from "../components/interview/tiles/CarouselArrows";
import RadioChoice from "../components/controls/RadioChoice";
import { TABLE_SIZES } from "../components/interview/tiles/CapabilityOverview";
import "../styles/capability-overview.css";
import { DialogHeading } from "../components/interview/tiles/SectionTiles";
import BusinessDocumentsView from "../components/BusinessDocumentsView";
import { workHue } from "../framework/engine/WorkColours";
import ResponsibilityFilter from "../components/interview/fields/ResponsibilityFilter";
import WorkbookTools, { WorkbookToolsSlot } from "../components/WorkbookTools";
import workbookIcon from "../assets/workbook-icon.svg";
import GlossaryList, { YOUR_TERMS_HUE, anchorOf, letterOf, letterRanges, toggled } from "../components/GlossaryList";
import OrganizationReview, { goToReviewPlace } from "../components/OrganizationReview";
import { WorkbookCardNotes, type WorkbookState } from "../components/notepad/Notepad";
import HarvardReference from "../components/references/HarvardReference";
import { harvardReference, referenceList } from "../framework/engine/Sources";
import { OrganizationService } from "../services/OrganizationService";
import { organizationReview } from "../services/ReviewService";

import "../styles/global.css";
import "../styles/workspace.css";
// The funnel (ResponsibilityFilter) and the "i" note links are drawn as they are on the System pages.
import "../styles/conversation.css";
import "../styles/section-tiles.css";
// (The page card's width, --card-width, and the carousel's tab and bullets are the System pages'.)
import "../styles/status-shape.css";
import "../styles/bullet-rail.css";
import "../styles/glossary.css";
import "../styles/review.css";

// (The list and its letter ranges are the shared GlossaryList's; the tests and the search read them here as before.)
export { letterRanges, REFERENCES_PER_RANGE, type LetterRange } from "../components/GlossaryList";
export type { WorkbookState } from "../components/notepad/Notepad";

export type WorkbookTab = NonNullable<WorkbookState["tab"]>;

/** The Workbook's colour: the work done in it is reviewing (WorkColours.ts; docs/design/core/01-current-design.md, part I). */
const WORKBOOK_HUE = workHue("review");

const TAB_LABELS: Record<WorkbookTab, string> = { "card-notes": "Card Notes", review: "Review", glossary: "Glossary", references: "References", documents: "Business Documents" };

/**
 * What the Glossary's and the References' titles' "i" says (doc 39, 3.3: a page title's note, at most three points of at most 160
 * characters; an option's meaning as "Name: meaning"). What the tab is, how to use it, and what its two colours or its style mean:
 * nothing of it repeats the title. (The Card Notes and the Review carry no "i", as before.)
 */
export const GLOSSARY_INFO: Record<"glossary" | "references" | "documents", string[]> = {
    glossary: [
        "Every word the app uses and every name you gave, from A to Z. The funnel shows either kind, or both, and the letter ranges.",
        "App terms, in blue: the app's own words, with what each means here and the source it rests on. Press a source to read it in full.",
        "Your terms, in terracotta: the names you gave your Segments, Profiles, Offerings and the rest. Press \"Open the …\" to go to it."
    ],
    references: [
        "Every source the app cites, from A to Z. The funnel shows the letter ranges you choose.",
        "Written in the Harvard style: the author and year where a source is cited, and the full reference here.",
        "Each address opens in your browser."
    ],
    // (The Business Documents: what they are drawn from is the Plan's own subtitle; how to change them is said here, once.)
    documents: [
        "Your Business Plan, Business Model Canvas and Financial Forecast, written from your Foundation answers each time you open them.",
        "Figures are estimates over the plan's length, from its first month: set them on 3. Business System, 4. Financial Foundation.",
        "To change a line, change the answer it came from. Export each one as Markdown or PDF, and the Forecast as CSV too."
    ]
};

/**
 * THE WORKBOOK (layout rules 22.37): one page, "Workbook" over its rule, its sections in one panel drawn as a dialog of the app, with the carousel
 * arrows and the tab of bullets: Card Notes (WorkbookCardNotes), Review (OrganizationReview), Glossary (GlossaryList), References (Sources.ts as a
 * Harvard list) and Business Documents (BusinessDocumentsView). From the Landing page (`total`), the Review of every Organisation, the Glossary
 * and the References. Escape, and Back, return to where it was opened from.
 */
export default function Workbook() {

    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state as WorkbookState | null) ?? {};
    const [organizationId] = useState(() => OrganizationService.getSelected());
    // Opened from the Landing page (or with no Organisation): its header, the total review, the Glossary and the References.
    const landing = state.total === true || !organizationId;
    // (The Business Documents are one Organisation's, as the Card Notes are: left out on the Landing page.)
    const tabs = useMemo(() => (landing ? ["review", "glossary", "references"] as const : ["card-notes", "review", "glossary", "references", "documents"] as const)
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

    // A section of the Workbook, from its top: a bullet of its tab, or an arrow.
    const show = (next: WorkbookTab) => {
        setTab(next);
        window.scrollTo?.({ top: 0 });
    };

    // THE WORKBOOK IS DRAWN AS A DIALOG OF THE APP (owner, 2026-11-09: "Check an app's card (dialog) style. Is missing navigation arrows, proper side gaps,
    // a proper framing"): its sections in one framed panel (CardShell, as a section dialog), the section's heading in it with its "i", the carousel arrows at
    // its sides going round the sections, and their bullets in the tab attached to the panel (CarouselArrows, as on every dialog).
    const panel = useRef<HTMLDivElement | null>(null);
    // (The row of the title holds the section's buttons at its right end: WorkbookTools.)
    const [toolsSlot, setToolsSlot] = useState<HTMLElement | null>(null);
    // The text size of the section (owner, 2026-11-10: "Add a letter-size option like the Inventory"): the Inventory's three steps, 14, 18 and 24px, kept while
    // the page stays open; the section is drawn at that scale.
    const [textSize, setTextSize] = useState<string>("body");
    // (From under the title's rule down to the footer, where the Back stands (owner, 2026-11-10: "Move the back button out of the tag and back to its previous
    // position"), 12px clear of it: the page itself never scrolls, so its title stays; what is taller scrolls in the panel's body, under its head and tabs.)
    const [panelHeight, setPanelHeight] = useState<number | null>(null);
    useLayoutEffect(() => {
        const measure = () => {
            const node = panel.current;
            const foot = document.querySelector(".workbook .workspace-footer");
            if (!node) {
                return;
            }
            const end = foot ? foot.getBoundingClientRect().top : window.innerHeight;
            const next = Math.max(240, Math.round(end - 12 - (node.getBoundingClientRect().top + window.scrollY)));
            setPanelHeight(current => current === next ? current : next);
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);
    const at = Math.max(0, tabs.findIndex(entry => entry.id === tab));
    const step = {
        what: "section",
        previous: () => show(tabs[(at - 1 + tabs.length) % tabs.length].id),
        next: () => show(tabs[(at + 1) % tabs.length].id),
        items: tabs,
        current: at,
        go: (id: string) => show(id as WorkbookTab)
    };

    return (

        <div
            className="workspace glossary workbook"
            style={{ "--glossary-yours-hue": YOUR_TERMS_HUE } as CSSProperties}
        >

            {/* (Opened from the Landing page: its header, not the selected Organisation's.) */}
            <AppHeader organizationName={!landing && organizationId ? OrganizationService.getSummary(organizationId)?.name ?? "" : ""} totalReview={landing} />

            <main className="glossary-page">

                {/* The top of the page as on a System page: "Workbook" at the top left, over its rule; the section's name is the panel's heading. */}
                <InterviewHeader systemName="Workbook" icon={workbookIcon} />

                <WorkbookToolsSlot.Provider value={toolsSlot}>

                <CardShell ref={panel} className="section-tile-dialog workbook-panel" data-carousel="" style={{ "--strategy-theme-hue": WORKBOOK_HUE, ...(panelHeight === null ? {} : { height: panelHeight }) } as CSSProperties}>

                {/* The section's heading and its buttons in one row at the panel's top (owner, 2026-11-10: "The buttons should be in the same row as the Card's
                    Title"; "should stay in place, not move on scrolling down"): outside the body that scrolls. */}
                <div className="workbook-head">
                    <div className="business-engagement-section-head" role="heading" aria-level={2}>
                        <DialogHeading key={tab} title={title} info={tab === "glossary" || tab === "references" || tab === "documents" ? GLOSSARY_INFO[tab] : undefined} />
                    </div>
                    <div className="workbook-tools" ref={setToolsSlot}>
                        <RadioChoice
                            className="capability-overview-sizes"
                            label="Text size"
                            group="workbook-text-size"
                            options={TABLE_SIZES.map((size, at) => ({ id: size.id, label: <span className="capability-overview-size-aa" data-size={size.id}>Aa</span>, name: ["Smaller text", "Standard text", "Larger text"][at] }))}
                            value={textSize}
                            onChange={setTextSize}
                        />
                    </div>
                </div>

                {/* As a dialog's: the body that holds the section and scrolls. */}
                <div className="section-tile-dialog-body">
                <div className="column-tile-content workbook-section" data-size={textSize}>

                {tab === "card-notes" && <WorkbookCardNotes />}

                {tab === "review" && organisationFunnel && (
                    <WorkbookTools>
                        <ResponsibilityFilter
                            off={organisationsOff}
                            options={[...new Set(reviews.map(section => section.name))]}
                            label="Choose which Organisations show"
                            onToggle={(option) => setOrganisationsOff(current => toggled(current, option))}
                        />
                    </WorkbookTools>
                )}

                {tab === "review" && reviews.length > 0 && reviewsShown.length === 0 && <p className="glossary-empty">No Organisations to show: the funnel leaves them all out.</p>}

                {tab === "review" && reviewsShown.map(section => (
                    <OrganizationReview
                        key={section.id}
                        name={section.name}
                        items={section.items}
                        current={!landing}
                        named={landing}
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

                        <WorkbookTools>
                            <ResponsibilityFilter
                                off={lettersOff}
                                options={ranges.map(range => range.label)}
                                label="Choose which letter ranges show"
                                onToggle={(option) => setLettersOff(current => toggled(current, option))}
                            />
                        </WorkbookTools>

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

                {tab === "documents" && organizationId && <BusinessDocumentsView organizationId={organizationId} />}

                </div>
                </div>

                </CardShell>

                </WorkbookToolsSlot.Provider>

            </main>

            <CarouselArrows target={panel} step={step} hue={WORKBOOK_HUE} side="left" />

            <AppFooter onBack={back} />


        </div>

    );

}

/**
 * The Glossary's and the Review's old addresses (`/glossary`, `/review`): the Workbook on that tab, with what they were opened with
 * (a term, the References, the total review, where to go back to).
 */
export function WorkbookRedirect({ tab }: { tab: "glossary" | "review" | "documents" }) {
    const location = useLocation();
    const state = (location.state as WorkbookState | null) ?? {};
    return <Navigate to="/workbook" replace state={{ ...state, tab: state.tab ?? tab }} />;
}
