/**
 * THE KEYBOARD STAYS IN AN OPEN CONFIRMATION (Interface 7, P6; WCAG 2.2 AA, 2.4.3 Focus Order and 2.1.2 No Keyboard Trap): while a confirmation is
 * open (`.confirmation-dialog`, every one in the app), Tab and Shift+Tab go round its own buttons and fields and never reach the page behind it.
 * Opened, it takes the focus if nothing inside it has it (its button with autoFocus keeps it); closed, the focus goes back to what had it before,
 * where that is still on the page. One rule for every confirmation, set once here, so no confirmation needs its own (rules at source).
 */
const DIALOG = ".confirmation-dialog";

const FOCUSABLE = "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

/** The open confirmation on top: the last one on the page. */
function openDialog(target: Document): HTMLElement | null {
    const all = target.querySelectorAll<HTMLElement>(DIALOG);
    return all.length > 0 ? all[all.length - 1] : null;
}

/** What the keyboard can reach inside it, in order. */
function reachable(dialog: HTMLElement): HTMLElement[] {
    return [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(node => !node.hasAttribute("disabled") && node.getAttribute("aria-hidden") !== "true");
}

export function installConfirmationFocus(target: Document = document): void {

    let before: HTMLElement | null = null;
    let shown: HTMLElement | null = null;

    // Opened or closed: the focus goes in, and back out to where it was.
    const follow = () => {
        const dialog = openDialog(target);
        if (dialog === shown) {
            return;
        }
        if (dialog && !shown) {
            const active = target.activeElement;
            before = active instanceof HTMLElement && !dialog.contains(active) ? active : null;
        }
        shown = dialog;
        if (dialog) {
            if (!dialog.contains(target.activeElement)) {
                (reachable(dialog)[0] ?? dialog).focus();
            }
            return;
        }
        if (before && before.isConnected) {
            before.focus();
        }
        before = null;
    };
    new MutationObserver(follow).observe(target.body, { childList: true, subtree: true });

    // Tab and Shift+Tab go round the confirmation.
    target.addEventListener("keydown", event => {
        if (event.key !== "Tab") {
            return;
        }
        const dialog = openDialog(target);
        if (!dialog) {
            return;
        }
        const items = reachable(dialog);
        if (items.length === 0) {
            event.preventDefault();
            return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        const active = target.activeElement;
        if (!dialog.contains(active)) {
            event.preventDefault();
            (event.shiftKey ? last : first).focus();
        } else if (event.shiftKey && active === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
        }
    });

}
