// THE TILES LOGO (owner, 2026-11-22 18:58 UTC+2: "Replace the North Stardust logo with the Tiles logo"): the approved flat logo, the nine-tile T on its midnight
// board (project Library, designs/tiles-logo/final), the same in every reading mode.
import logo from "../../assets/tiles-logo.svg";

import { lazy, Suspense, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AddButton from "../controls/AddButton.tsx";
import SaveStatus from "./SaveStatus";
import { WorkbookButton } from "../notepad/WorkbookButton";
import FocusModeButton from "../menu/FocusModeButton";
import SearchButton from "../menu/SearchButton";
import ToolsMenu from "../menu/ToolsMenu";
import { useLocation, useNavigate } from "react-router-dom";
import { systems } from "../../data/systems";
import { USER_CALENDAR_ID } from "../../services/UserCalendar";
import { OrganizationService } from "../../services/OrganizationService";
import UndoToast from "./UndoToast";

import "../../styles/app-header.css";

/* The Notes panel and the Calendar's rail are loaded when an Organisation is open, after the page is drawn: they read the whole
   engine (every System's questions, the documents, the forecast), which the Landing page and the first paint do not need. */
const NotepadPanel = lazy(() => import("../notepad/Notepad").then(module => ({ default: module.NotepadPanel })));
const NotepadPicker = lazy(() => import("../notepad/Notepad").then(module => ({ default: module.NotepadPicker })));
const OrganizationCalendarPanel = lazy(() => import("../calendar/OrganizationCalendarPanel"));
// (The Organisation's own mark, from its Brand System: BrandMark.tsx.)
const BrandMark = lazy(() => import("./BrandMark"));

interface AppHeaderProps {
    /**
     * The active Organization's name -- shown on the
     * opposite side of the header from the logo, on every
     * page that has one selected (System Selection,
     * Introduction, Interview). Omitted entirely (e.g. on
     * the Landing page, where there may be several
     * Organizations and none is "the" one yet) the header
     * renders exactly as before, logo only.
     */
    organizationName?: string;
    /** An interview page: the Focus tool (FocusModeButton) is offered. */
    focusable?: boolean;
    /** The landing page: a Reload tool beside the theme switch (the app's view is drawn again; the data is kept: it is on disk). */
    reloadable?: boolean;
    /** The landing page: the Workbook is offered with the review of every Organization (none is open), the Glossary and the References. */
    totalReview?: boolean;
    /** Called before the reload (the Landing page refreshes the saved examples from the current example files). */
    onReload?: () => void | Promise<unknown>;
}

export default function AppHeader({ organizationName, focusable = false, reloadable = false, totalReview = false, onReload }: AppHeaderProps) {

    const location = useLocation();
    const navigate = useNavigate();
    const organizationId = organizationName ? OrganizationService.getSelected() : null;
    // (THE SIDE PANELS IN THE HEADER'S OWN LAYER (owner, 2026-11-23 17:43 UTC+2: "check and fix the hierachy"): drawn beside the header, in the page's stack that
    // holds it -- not inside the header, where they painted over its shadow, nor at the document's root, where a page that is a layer of its own (the Workbook)
    // left the header and its Menu under them.)
    const header = useRef<HTMLElement | null>(null);
    const [layer, setLayer] = useState<Element | null>(null);
    useLayoutEffect(() => setLayer(header.current?.parentElement ?? null), []);

    return (

        <header className="app-header" ref={header}>

            {/* THE TILES LOGO AND ITS NAME (owner, 2026-11-22 19:55 UTC+2: "Next to the Icon of the Tiles, add also the name TILES, in capital, semi bold with the
                proper letter spacing that I have assigned for the bold text. use the Inter fond. the gap between the Icon and the Word should be 12 px"): the word
                names the app, so the picture beside it says nothing more to a screen reader. */}
            <div className="app-brand">
                <img
                    src={logo}
                    alt=""
                    className="app-logo"
                />
                <span className="app-brand-name">Tiles</span>
            </div>

            {/* THE BUTTONS AT THE HEADER'S RIGHT END (owner, 2026-11-22 18:58 UTC+2: "Place the headers button at the right side"): the Organisation's name stands
                before the saved signal and the tools, against them (app-header.css). */}
            {/* (THE ORGANISATION'S NAME IN THE HEADER'S CENTRE (owner, 2026-11-24 10:29 UTC+2: "When the organization name is displayed on the header, it should be in
                the centre"): the name on the header's middle, the saved signal after it (app-header.css).) */}
            {organizationName && (
                <div className="app-header-centre">
                <h1 className="app-header-organization-name" title={organizationName}>
                    {organizationName}
                </h1>
                <SaveStatus />
                </div>
            )}

            {/* Whether the open Organization's edits are saved --
                only where one is open. */}

            {/* (The Organisation's own square mark before the header's buttons, where the page title stands in the header: BrandMark.tsx; owner, 2026-11-24 10:12
                UTC+2, "if there is logo icon, place it before the header's buttons".) */}
            {organizationId && organizationName && <Suspense fallback={null}><BrandMark organizationId={organizationId} organizationName={organizationName} /></Suspense>}

            {/* THE TOOLS (owner, 2026-11-21 00:56 and 23:44 UTC+2): one menu for Search, Notes, Calendar, Focus, Settings and the reading mode (ToolsMenu.tsx);
                the reading mode alone where no Organisation is open. */}
            <ToolsMenu organizationOpen={!!organizationName} focusable={!!organizationName && focusable} userCalendar={!organizationName && totalReview} />

            {reloadable && (
                <AddButton className="header-tool app-reload"
                    aria-label="Reload the app and refresh the examples"
                    onClick={async () => { await onReload?.(); window.location.reload(); }}>
                    <svg className="header-tool-icon" viewBox="2 2 16 16" aria-hidden="true">
                        <path d="M16 10a6 6 0 1 1-2-4.5M16 3v3.5h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="header-tool-word">Reload</span>
                </AddButton>
            )}

            {/* Focus mode, on an interview page: the page's look and its Exit focus button (turned on from the Tools menu). */}
            {organizationName && focusable && <FocusModeButton />}

            {/* The search (opened from the Tools menu or with Ctrl+K), the Workbook (the Card Notes, the Review, the Glossary and the References: one page, /workbook; owner, 2026-11-09) and the person's own notes (the Notes tool, its side panel, as before: "Card Notes and Notes tool are different"): wherever an Organization is open. */}
            {organizationName && <SearchButton />}
            {/* The Workbook: the same button on the Landing page (owner, 2026-11-09), there with the review of every Organisation, the Glossary and the References. */}
            {(organizationName || totalReview) && <WorkbookButton total={!organizationName} />}
            {/* (THE SIDE PANELS UNDER THE HEADER'S SHADOW (owner, 2026-11-23 17:28 UTC+2: "The headers shadow should shade both ... any page and panel, in any part of the
                app"): drawn outside the header, in the page's layer, so the header's shadow falls over them as over the page; inside the header they painted over it.) */}
            {organizationName && layer && createPortal(<Suspense fallback={null}><NotepadPanel /><NotepadPicker /></Suspense>, layer)}

            {/* THE CALENDAR ON THIS PAGE (owner, 2026-11-21 04:05 UTC+2): Calendar in the Menu opens the Calendar's rail here, as Notes opens its panel; System
                Selection holds the whole rail itself. An item pressed opens its page, as there. */}
            {organizationId && layer && location.pathname !== "/assistant" && (
                createPortal(<Suspense fallback={null}>
                    <OrganizationCalendarPanel
                        alone
                        organizationId={organizationId}
                        capabilities={[]}
                        systems={systems}
                        onCapabilityOpen={() => undefined}
                        onCapabilitySelect={() => undefined}
                        onSystemOpen={() => undefined}
                        onOpenTask={(systemNumber, sectionNumber) => {
                            const system = systems.find(candidate => candidate.number === systemNumber);
                            if (system) {
                                navigate("/introduction", { state: { system, targetSectionNumber: sectionNumber } });
                            }
                        }}
                    />
                </Suspense>, layer)
            )}

            {/* THE USER'S OWN CALENDAR ON THE LANDING PAGE (owner, 2026-11-23 15:32 UTC+2: "Place a Calendar option in the Menu, in the landing page. This will be the
                App Users Calendar"): every Organisation has its own; the user's holds their general dated notes and their own words (UserCalendar.ts). */}
            {!organizationId && totalReview && layer && (
                createPortal(<Suspense fallback={null}>
                    <OrganizationCalendarPanel
                        alone
                        organizationId={USER_CALENDAR_ID}
                        capabilities={[]}
                        systems={[]}
                        onCapabilityOpen={() => undefined}
                        onCapabilitySelect={() => undefined}
                        onSystemOpen={() => undefined}
                        onOpenTask={(systemNumber, sectionNumber, owner) => {
                            // (A date of an Organisation opens that Organisation, on the page it comes from.)
                            const system = systems.find(candidate => candidate.number === systemNumber);
                            if (owner && system) {
                                OrganizationService.setSelected(owner);
                                navigate("/introduction", { state: { system, targetSectionNumber: sectionNumber } });
                            }
                        }}
                    />
                </Suspense>, layer)
            )}

            {/* Undo after a removal: one toast for the whole app. */}
            {organizationName && <UndoToast />}

        </header>

    );

}
