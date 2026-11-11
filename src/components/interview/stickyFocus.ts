/**
 * A FOCUSED FIELD IS NEVER HIDDEN UNDER THE STICKY TITLE (WCAG 2.2 AA, 2.4.11 Focus Not Obscured; owner, 2026-11-11). The page's title band
 * (`.interview-header`, sticky under the 80px app header, 01-interview.css) covers the top of the window; when the keyboard reaches a field
 * from below (Shift+Tab), the browser scrolls only until the field touches the window's top, which leaves it under the band. Then the page is
 * scrolled on by just what the band covers, plus 8px, so the field stands clear under it. A field already clear is left alone, so nothing
 * moves for the mouse or for a jump to a field (those centre it).
 */
const CLEARANCE = 8;

export function installFocusClearOfStickyTitle(target: Document = document): void {

    target.addEventListener("focusin", event => {

        const field = event.target;
        const band = target.querySelector<HTMLElement>(".interview-header");

        if (!(field instanceof HTMLElement) || !band || band.contains(field) || getComputedStyle(band).position !== "sticky") {
            return;
        }

        // (A field inside a dialog or a floating card scrolls in its own box, which the band does not cover.)
        if (field.closest(".section-tile-overlay, .floating-card-host, [role=dialog]")) {
            return;
        }

        const cover = band.getBoundingClientRect().bottom;
        const top = field.getBoundingClientRect().top;

        if (top < cover && field.getBoundingClientRect().bottom > 0) {
            window.scrollBy({ top: top - cover - CLEARANCE, behavior: "auto" });
        }

    });

}
