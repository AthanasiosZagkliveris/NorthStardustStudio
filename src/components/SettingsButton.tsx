import { type NavigateFunction } from "react-router-dom";

/**
 * Opens the Global Settings screen (Settings in the Tools menu, ToolsMenu.tsx), remembering where it was opened from so Back and Escape return there; on the
 * screen it does nothing.
 */
export function openSettings(navigate: NavigateFunction, location: { pathname: string; state: unknown }): void {
    // Already there: nothing to open.
    if (location.pathname === "/settings") {
        return;
    }
    navigate("/settings", { state: { from: { pathname: location.pathname, state: location.state } } });
}
