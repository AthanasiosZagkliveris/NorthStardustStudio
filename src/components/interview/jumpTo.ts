/*
    A link that opens another page lands on the card it names, not
    on the top of the page.

    Every card, section and fold a link can point at carries its
    name in a `data-anchor` attribute: one or more space-separated
    tokens, so a wrapper can answer to several ("resource-group-
    utilities resource-group-workspace"). A jump is a PATH, innermost
    first: the card, then what holds it, then what holds that.

    Pages render after a moment, and a folded section does not render
    what it holds, so the jump waits for the page, and opens folds from
    the inside out -- the innermost container that exists and is
    folded is opened -- until the card itself appears. Then it is
    scrolled to just below the app header and briefly highlighted.
*/

/** Opens another page; with a path, at the card it names (see jumpTo). */
export type OpenPage = (path?: readonly string[]) => void;

const STEP_MS = 60;
const GIVE_UP_MS = 4000;
const HIGHLIGHT_MS = 1800;

function find(token: string): HTMLElement | null {
    return document.querySelector<HTMLElement>('[data-anchor~="' + CSS.escape(token) + '"]');
}

/** A container's own fold arrow: not one belonging to something inside it. */
function ownToggle(element: HTMLElement): HTMLButtonElement | null {
    return [...element.querySelectorAll<HTMLButtonElement>(".strategy-box-toggle")]
        .find(toggle => toggle.closest("[data-anchor]") === element) ?? null;
}

/** Clear of the fixed app header, with a little room above. */
function headerClearance(): number {
    const header = document.querySelector<HTMLElement>(".app-header");
    return (header?.getBoundingClientRect().height ?? 0) + 24;
}

function scrollToElement(element: HTMLElement) {
    window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY - headerClearance(),
        left: 0,
        behavior: "auto"
    });
}

function land(element: HTMLElement) {
    /* Instant, and once more after the page settles: a page still
       laying itself out can move the card after the first scroll. */
    scrollToElement(element);
    window.setTimeout(() => scrollToElement(element), 250);
    element.classList.remove("jump-highlight");
    // Restarts the animation when the same card is jumped to twice.
    void element.offsetWidth;
    element.classList.add("jump-highlight");
    window.setTimeout(() => element.classList.remove("jump-highlight"), HIGHLIGHT_MS);
}

/**
 * Scrolls to the first token of `path`, opening whatever folds above
 * it; falls back to the innermost container found, or to the top of
 * the page when nothing is.
 */
export function jumpTo(path: readonly string[]) {

    const started = Date.now();

    const attempt = () => {

        const target = find(path[0]);

        if (target) {
            // A folded card is opened too: the point is to see it.
            const toggle = ownToggle(target);
            if (toggle?.getAttribute("aria-expanded") === "false") {
                toggle.click();
            }
            window.setTimeout(() => land(target), STEP_MS);
            return;
        }

        const container = path.slice(1).map(find).find((element): element is HTMLElement => element !== null);

        if (container) {
            const toggle = ownToggle(container);
            if (toggle?.getAttribute("aria-expanded") === "false") {
                toggle.click();
            }
        }

        if (Date.now() - started > GIVE_UP_MS) {
            if (container) {
                land(container);
            } else {
                window.scrollTo({ top: 0, left: 0, behavior: "auto" });
            }
            return;
        }

        window.setTimeout(attempt, STEP_MS);

    };

    window.setTimeout(attempt, STEP_MS);

}

/** The data-anchor value for an element that answers to several names. */
export function anchors(...tokens: (string | false | null | undefined)[]): string {
    return tokens.filter((token): token is string => Boolean(token)).join(" ");
}
