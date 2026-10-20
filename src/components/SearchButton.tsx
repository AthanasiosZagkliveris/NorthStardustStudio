import { lazy, Suspense, useEffect, useRef, useState } from "react";

import AddButton from "./controls/AddButton.tsx";
import { OrganizationService } from "../services/OrganizationService";

import "../styles/search.css";

// The dialog, and the index it builds from every System's pages and
// answers, are loaded when the search first opens, never with the page.
const SearchDialog = lazy(() => import("./SearchDialog"));

/**
 * The header's Search button, beside Notes and Review and like them:
 * a magnifier and the word (the magnifier alone in a narrow header).
 * It, or Ctrl+K / ⌘K anywhere, opens the search (SearchDialog); focus
 * returns where it was when the search closes without opening anything.
 */
export default function SearchButton() {

    const [open, setOpen] = useState(false);
    const returnTo = useRef<HTMLElement | null>(null);

    function start() {
        returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setOpen(true);
    }

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "k") {
                event.preventDefault();
                if (!open) {
                    start();
                }
            }
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open]);

    const organizationId = OrganizationService.getSelected();

    return (
        <>
            <AddButton className="header-tool"
                aria-label="Search"
                aria-keyshortcuts="Control+K Meta+K"
                title="Search (Ctrl+K)"
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={start}>
                <svg className="header-tool-icon" viewBox="0 0 20 20" aria-hidden="true">
                    <circle cx="8.5" cy="8.5" r="5.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12.5 12.5l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="header-tool-word">Search</span>
            </AddButton>

            {open && organizationId && (
                <Suspense fallback={null}>
                    <SearchDialog
                        organizationId={organizationId}
                        onClose={(opened) => {
                            setOpen(false);
                            if (!opened) {
                                returnTo.current?.focus({ preventScroll: true });
                            }
                        }}
                    />
                </Suspense>
            )}
        </>
    );

}
