/**
 * THE TEXT LINKS: every element the app draws as a link in text (a name that opens another card, a "Show as table", a registration number that opens its
 * expense...). One look for all of them (src/styles/text-links.css): the default blue, regular, the bold's letter spacing, no underline; under the pointer bold
 * and underlined; one row, and a text longer than its place moves across it, right to left, under the pointer, to be read whole.
 *
 * TEXT_LINK_SELECTOR lists their classes (text-links.css lists the same, and a test says they agree). The marquee is measured when the pointer arrives: how far
 * the text is wider than its place, set as --link-shift on the link.
 */
export const TEXT_LINK_CLASSES = [
    "text-link",
    "business-engagement-link",
    "channel-resource-open",
    "notepad-text-button",
    "legal-entity-name-link",
    "business-capability-link",
    "business-capability-child-name",
    "business-capability-responsibility-link"
] as const;

export const TEXT_LINK_SELECTOR = TEXT_LINK_CLASSES.map(name => "." + name).join(", ");

let installed = false;

/** Listens once, for the whole page, for the pointer arriving on a text link. */
export function installTextLinkMarquee(): void {
    if (installed || typeof document === "undefined") {
        return;
    }
    installed = true;
    document.addEventListener("mouseover", (event) => {
        const link = (event.target as Element | null)?.closest?.<HTMLElement>(TEXT_LINK_SELECTOR);
        if (link) {
            link.style.setProperty("--link-shift", Math.max(0, link.scrollWidth - link.clientWidth) + "px");
        }
    });
}
