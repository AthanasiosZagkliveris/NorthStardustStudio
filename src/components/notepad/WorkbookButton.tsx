import AddButton from "../controls/AddButton.tsx";
import { useLocation, useNavigate, type NavigateFunction } from "react-router-dom";

/* The Workbook's header button and the way every place opens the Workbook page (pages/Workbook.tsx), in a file of their own so the
   header, which every page draws, does not bring the Notes panel (Notepad.tsx) into the first load. */

/** Where the Workbook page is opened with: its tab, the total review (the Landing page's), a term, and where to go back to. */
export interface WorkbookState {
    tab?: "card-notes" | "review" | "glossary" | "references" | "documents" | "financial-documents" | "guide" | "specs" | "future";
    /** A Financial Document's tab to open on (a link made to a record moved there: Questions 20, section 14). */
    document?: "forecast" | "funding" | "financial-plan";
    total?: boolean;
    term?: string;
    from?: { pathname: string; state?: unknown };
}

/** Opens the Workbook page, remembering where it was opened from (on the page itself, the place it was first opened from), so Back and Escape return there. */
export function openWorkbook(navigate: NavigateFunction, location: { pathname: string; state: unknown }, state: Omit<WorkbookState, "from"> = {}): void {
    const here = location.pathname === "/workbook";
    const from = here ? (location.state as WorkbookState | null)?.from : { pathname: location.pathname, state: location.state };
    navigate("/workbook", { state: { ...state, from }, replace: here });
}

/**
 * The header's Workbook button: icon and word (icon alone when narrow), with no count (owner, 2026-11-09). It opens the Workbook page;
 * on it, it does nothing. Its icon is a closed notebook with a bookmark, its own among the header tools (the reading mode's Sepia is the
 * open book, the Notes' the page). One button for every header (owner, 2026-11-09: "The workbook should exist on landing page"): with
 * an Organisation open, the Card Notes, Review, Glossary and References; on the Landing page (`total`, no Organisation open), the review
 * of every Organisation, the Glossary and the References.
 */
export function WorkbookButton({ total = false }: { total?: boolean }) {

    const navigate = useNavigate();
    const location = useLocation();
    const here = location.pathname === "/workbook";

    return (
        <AddButton className="header-tool"
            aria-current={here ? "page" : undefined}
            aria-label={total ? "Handbook: app guide, specs, future features, glossary and references" : "Workbook: documents, review, glossary and card notes"}
            onClick={() => {
                if (!here) {
                    openWorkbook(navigate, location, total ? { total: true } : {});
                }
            }}>
            <svg className="header-tool-icon" viewBox="3.47 2.97 14.05 14.05" aria-hidden="true">
                <path d="M5 3.5h10a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5zM7.5 3.5v13M11 3.5v5l1.5-1.2 1.5 1.2v-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            {/* (THE HANDBOOK ON THE ORGANISATIONS SCREEN (owner, 2026-11-22 18:58 and 19:31 UTC+2): the app's own book, apart from an Organisation's Workbook.) */}
            <span className="header-tool-word">{total ? "Handbook" : "Workbook"}</span>
        </AddButton>
    );

}
