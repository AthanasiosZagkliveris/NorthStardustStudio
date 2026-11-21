import logo from "../assets/organization-framework.svg";

import { lazy, Suspense } from "react";
import AddButton from "./controls/AddButton.tsx";
import SaveStatus from "./SaveStatus";
import { WorkbookButton } from "./notepad/WorkbookButton";
import FocusModeButton from "./FocusModeButton";
import SearchButton from "./SearchButton";
import ToolsMenu from "./ToolsMenu";
import { useLocation, useNavigate } from "react-router-dom";
import { systems } from "../data/systems";
import { OrganizationService } from "../services/OrganizationService";
import UndoToast from "./UndoToast";

import "../styles/app-header.css";

/* The Notes panel and the Calendar's rail are loaded when an Organisation is open, after the page is drawn: they read the whole
   engine (every System's questions, the documents, the forecast), which the Landing page and the first paint do not need. */
const NotepadPanel = lazy(() => import("./notepad/Notepad").then(module => ({ default: module.NotepadPanel })));
const NotepadPicker = lazy(() => import("./notepad/Notepad").then(module => ({ default: module.NotepadPicker })));
const OrganizationCalendarPanel = lazy(() => import("./OrganizationCalendarPanel"));

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

    return (

        <header className="app-header">

            <img
                src={logo}
                alt="North Stardust Organisation Framework"
                className="app-logo"
            />

            {/* Whether the open Organization's edits are saved --
                only where one is open. */}
            {organizationName && <SaveStatus />}

            {/* THE TOOLS (owner, 2026-11-21 00:56 and 23:44 UTC+2): one menu for Search, Notes, Calendar, Focus, Settings and the reading mode (ToolsMenu.tsx);
                the reading mode alone where no Organisation is open. */}
            <ToolsMenu organizationOpen={!!organizationName} focusable={!!organizationName && focusable} />

            {reloadable && (
                <AddButton className="header-tool app-reload"
                    aria-label="Reload the app and refresh the examples"
                    onClick={async () => { await onReload?.(); window.location.reload(); }}>
                    <svg className="header-tool-icon" viewBox="2.97 2.47 14.05 14.05" aria-hidden="true">
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
            {organizationName && <Suspense fallback={null}><NotepadPanel /><NotepadPicker /></Suspense>}

            {/* THE CALENDAR ON THIS PAGE (owner, 2026-11-21 04:05 UTC+2): Calendar in the Menu opens the Calendar's rail here, as Notes opens its panel; System
                Selection holds the whole rail itself. An item pressed opens its page, as there. */}
            {organizationId && location.pathname !== "/assistant" && (
                <Suspense fallback={null}>
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
                </Suspense>
            )}

            {/* Undo after a removal: one toast for the whole app. */}
            {organizationName && <UndoToast />}

            {organizationName && (
                <h1 className="app-header-organization-name" title={organizationName}>
                    {organizationName}
                </h1>
            )}

        </header>

    );

}
