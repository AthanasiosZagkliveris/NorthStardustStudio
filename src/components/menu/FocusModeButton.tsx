import { useEffect, useSyncExternalStore } from "react";
import AddButton from "../controls/AddButton.tsx";
import { createPortal } from "react-dom";

import { FocusModeService } from "../../services/FocusModeService";

import "../../styles/focus-mode.css";

/** Whether focus mode is on (FocusModeService). */
export function useFocusMode(): boolean {
    return useSyncExternalStore(FocusModeService.subscribe, FocusModeService.isOn, FocusModeService.isOn);
}

/** Four corners drawn in: the page, closed in on. */
export function FocusIcon({ exit = false }: { exit?: boolean }) {
    return (
        <svg className="header-tool-icon" viewBox="2.43 2.43 15.13 15.13" aria-hidden="true">
            <path
                d={exit
                    ? "M7 3v4H3M13 3v4h4M7 17v-4H3M13 17v-4h4"
                    : "M3 7V3h4M17 7V3h-4M3 13v4h4M17 13v4h-4"}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/**
 * FOCUS MODE, on an interview page: Focus in the Tools menu turns it
 * on (ToolsMenu.tsx); then
 * the rails, the Help, the header and the progress line are hidden,
 * the page is centred at a reading width (focus-mode.css), and one
 * small "Exit focus" button stays in the top-right corner. Escape
 * exits too (Conversation.tsx, after any dialog has closed). The
 * choice is remembered on this device until exited.
 */
export default function FocusModeButton() {

    const on = useFocusMode();

    // The page takes the mode while this, the interview's own tool, is here.
    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("focus-mode", on);
        return () => root.classList.remove("focus-mode");
    }, [on]);

    // (It is turned on from Focus in the Tools menu, ToolsMenu.tsx: owner, 2026-11-21 23:44 UTC+2, "A Tools - Include the Reading Mode".)
    return (
        <>
            {on && createPortal(
                <AddButton className="header-tool focus-mode-exit"
                    title="Exit focus (Escape)"
                    onClick={() => FocusModeService.set(false)}>
                    <FocusIcon exit />
                    <span>Exit focus</span>
                </AddButton>,
                document.body
            )}
        </>
    );

}
