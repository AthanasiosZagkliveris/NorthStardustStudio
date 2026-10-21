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

const frames = new WeakMap<HTMLElement, number>();

/** Slides a link's text to `target` (its scroll), about 100px a second, the way back quicker: the same slide as a tile's long title, drawn by the scroll of the box, not by an indent. */
function slide(link: HTMLElement, target: number): void {
    cancelAnimationFrame(frames.get(link) ?? 0);
    const from = link.scrollLeft;
    const distance = Math.abs(target - from);
    if (distance < 1) {
        return;
    }
    const duration = Math.min(2500, Math.max(target === 0 ? 220 : 350, distance * (target === 0 ? 4 : 10)));
    const began = performance.now() + (target === 0 ? 0 : 200);
    const step = (now: number) => {
        const t = Math.min(1, Math.max(0, (now - began) / duration));
        link.scrollLeft = from + (target - from) * t;
        if (t < 1) {
            frames.set(link, requestAnimationFrame(step));
        }
    };
    frames.set(link, requestAnimationFrame(step));
}

/** Listens once, for the whole page, for the pointer arriving on a text link and leaving it. */
export function installTextLinkMarquee(): void {
    if (installed || typeof document === "undefined") {
        return;
    }
    installed = true;
    const linkOf = (event: Event) => (event.target as Element | null)?.closest?.<HTMLElement>(TEXT_LINK_SELECTOR) ?? null;
    document.addEventListener("mouseover", (event) => {
        const link = linkOf(event);
        if (link && !link.contains(event.relatedTarget as Node | null)) {
            const room = link.scrollWidth - link.clientWidth;
            link.style.setProperty("--link-shift", Math.max(0, room) + "px");
            if (room > 1) {
                slide(link, Math.ceil(room));
            }
        }
    });
    document.addEventListener("mouseout", (event) => {
        const link = linkOf(event);
        if (link && !link.contains(event.relatedTarget as Node | null)) {
            slide(link, 0);
        }
    });
}
