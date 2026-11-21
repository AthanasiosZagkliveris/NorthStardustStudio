import { lazy, Suspense, useEffect, useRef, useState } from "react";

import { OrganizationService } from "../../services/OrganizationService";

import "../../styles/search.css";

// The dialog, and the index it builds from every System's pages and
// answers, are loaded when the search first opens, never with the page.
const SearchDialog = lazy(() => import("./SearchDialog"));

/** What opens the search from the Tools menu (ToolsMenu.tsx). */
const OPEN_SEARCH = "search:open";

/** Opens the search, as Ctrl+K does. */
export function openSearch(): void {
    window.dispatchEvent(new CustomEvent(OPEN_SEARCH));
}

/**
 * THE SEARCH, wherever an Organisation is open: Search in the Tools menu
 * (ToolsMenu.tsx, openSearch), or Ctrl+K / ⌘K anywhere, opens it
 * (SearchDialog); focus returns where it was when the search closes
 * without opening anything.
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
        function onAsk() {
            if (!open) {
                start();
            }
        }
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener(OPEN_SEARCH, onAsk);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener(OPEN_SEARCH, onAsk);
        };
    }, [open]);

    const organizationId = OrganizationService.getSelected();

    return open && organizationId ? (
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
    ) : null;

}
