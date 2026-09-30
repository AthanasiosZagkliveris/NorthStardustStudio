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

/*
    OPENING ONE FIELD (Review's "Go there", search results, the lender
    check, "Changed in scenario"): the card it sits in is jumped to as
    above -- folds opened from the inside out -- and then the field
    itself, marked `data-field-key` by the shared label components
    (see FieldKeys.ts), is scrolled to, its control focused and the
    field briefly highlighted. Without the card path the field is
    looked for on the page as it stands.
*/

function findField(key: string): HTMLElement | null {
    return document.querySelector<HTMLElement>('[data-field-key="' + CSS.escape(key) + '"]');
}

/** The control a person types or chooses in, inside a field. */
function controlOf(field: HTMLElement): HTMLElement | null {
    const controls = "input:not([type=hidden]), textarea, select, .option-picker-trigger, .month-picker-trigger";
    // A field marked on its control itself (fieldMarks.tsx) is that control.
    return field.matches(controls) ? field : field.querySelector<HTMLElement>(controls);
}

/** Scrolls to, focuses and highlights the field `key` names on the page open now. */
export function focusField(key: string, anchors: readonly string[] = []) {

    if (anchors.length > 0) {
        jumpTo(anchors);
    }

    const started = Date.now();

    const attempt = () => {

        const field = findField(key);

        if (field) {
            // A folded card: opened first, so its first control can
            // take the focus.
            const toggle = !controlOf(field) && field.matches("[data-anchor]") ? ownToggle(field) : null;
            if (toggle?.getAttribute("aria-expanded") === "false" && Date.now() - started <= GIVE_UP_MS) {
                toggle.click();
                window.setTimeout(attempt, STEP_MS);
                return;
            }
            // A holder that draws no box of its own (display:
            // contents) is landed on by its first part.
            land(getComputedStyle(field).display === "contents" ? (field.firstElementChild as HTMLElement | null) ?? field : field);
            controlOf(field)?.focus({ preventScroll: true });
            return;
        }

        if (Date.now() - started <= GIVE_UP_MS) {
            window.setTimeout(attempt, STEP_MS);
        }

    };

    window.setTimeout(attempt, STEP_MS * 2);

}

/*
    OPENING AN ANSWER (a search result, "Your answers"): the cards it
    is in are named by their ids, innermost first, and a card's anchor
    holds its id ("profile-<id>", or the id itself) -- so the innermost
    one on the page is unfolded, then the next, until a control holding
    the text shows. That control is scrolled to, focused and briefly
    highlighted; failing that, the innermost card found is landed on.
*/

/** Lower case, accents off: how an answer's text is looked for. */
function folded(text: string): string {
    return text.normalize("NFD").replace(/\p{M}+/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}

/** The element whose anchor holds a card's id, or null. */
function cardWithId(id: string): HTMLElement | null {
    for (const element of document.querySelectorAll<HTMLElement>("[data-anchor]")) {
        const tokens = (element.dataset.anchor ?? "").split(/\s+/);
        if (tokens.some(token => token === id || token.endsWith("-" + id))) {
            return element;
        }
    }
    return null;
}

/** A shown control whose answer holds `text`. */
function controlHolding(text: string, within: ParentNode): HTMLElement | null {
    const wanted = folded(text);
    for (const control of within.querySelectorAll<HTMLElement>("input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea, .option-picker-trigger, .month-picker-trigger, [contenteditable=true]")) {
        if (control.offsetParent === null) {
            continue;
        }
        const value = control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement
            ? control.value
            : control.textContent ?? "";
        if (folded(value).includes(wanted)) {
            return control;
        }
    }
    return null;
}

/** Scrolls to, focuses and highlights the control holding `text`, in the cards `ids` names (innermost first). */
export function focusText(text: string, ids: readonly string[] = []) {

    const started = Date.now();

    const attempt = () => {

        const cards = ids.map(cardWithId);
        const innermost = cards.find((card): card is HTMLElement => card !== null) ?? null;
        const control = controlHolding(text, cards[0] ?? document);

        if (control) {
            land(control);
            control.focus({ preventScroll: true });
            return;
        }

        // Unfold the innermost card there is, and look again.
        const toggle = innermost ? ownToggle(innermost) : null;
        if (toggle?.getAttribute("aria-expanded") === "false") {
            toggle.click();
        }

        if (Date.now() - started > GIVE_UP_MS) {
            if (innermost) {
                land(innermost);
            }
            return;
        }

        window.setTimeout(attempt, STEP_MS);

    };

    window.setTimeout(attempt, STEP_MS * 2);

}
