import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { aboveTipPosition, hueOf, TooltipBox } from "./Tooltip.tsx";

/**
 * THE APP'S TOOLTIP (the rules are in docs/design/25-tooltips.md). The browser draws a `title` as a plain white rectangle with a black frame and letters, in whatever
 * mode the system is in; this host, mounted once, takes the `title` of an element away and shows words in the app's own tooltip (`TooltipBox`) -- but only where a
 * tooltip is of use:
 *  1. only a CONTROL that is pressed (a button, a link, a tab, a menu item, a summary) has one -- never a field (it has its label and its value), a tick (its words), a tile or a card
 *     (they are text), a label or a heading;
 *  2. an ICON with no words of its own (the "i", the ×, the +, an arrow, the funnel) says its name;
 *  3. a control whose words are CUT SHORT by an ellipsis says them whole;
 *  4. a control says what its words do not (a key it answers to, where it goes: three words or more it does not already have);
 *  5. never the words it already shows (its text, its name, its value).
 * The words stay the element's: it keeps its name (`aria-label`) or is described by them (`aria-description`). Escape closes the tip.
 */

/** The words of a text without its marks, to compare two texts. */
const plain = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

/** What is pressed: rule 1. (A field, a tick, a tile, a card, a label is not here.) */
const PRESSED = "button, a[href], summary, [role=button], [role=tab], [role=menuitem], [role=link]";

/** The words an element shows. */
const shown = (element: HTMLElement) => (element.textContent ?? "").trim();

/** Rule 3: the words of the element, or of a part of it, run past its edge and are cut (side to side only; a part drawn only to measure is hidden). */
const isCut = (element: HTMLElement) => [element, ...element.querySelectorAll<HTMLElement>("*")].some(node => {
    const style = getComputedStyle(node);
    return style.overflowX !== "visible" && style.visibility !== "hidden" && node.scrollWidth > node.clientWidth + 1;
});

/**
 * THE WORDS OF A TOOLTIP: what a click does, said the same way everywhere ("Click to remove Offering 2", "Click to learn about Revenue", "Click to search, or press Ctrl+K"). A control's
 * accessible name or title is written as a name ("Remove Offering 2", "Revenue: what this means"); this turns it into the sentence a tooltip says. A name that is already a sentence ("Click to ...") stays.
 */
export function tipWords(text: string): string {
    const clean = text.trim();
    if (/^click to /i.test(clean)) {
        return clean;
    }
    // A key in brackets at the end ("(Ctrl+K)", "(Escape)", "(←)"): said as "or press ...".
    const keyed = /^(.*?)\s*\((Ctrl\+\w+|Escape|Esc|Enter|[←→↑↓])\)$/.exec(clean);
    if (keyed) {
        return tipWords(keyed[1]) + ", or press " + keyed[2];
    }
    const rules: [RegExp, (match: RegExpExecArray) => string][] = [
        [/^(.+): what this means$/i, m => "Click to learn about " + m[1]],
        [/^(?:minimize|fold) (.+)$/i, m => "Click to hide " + m[1]],
        [/^(?:maximize|unfold) (.+)$/i, m => "Click to show " + m[1]],
        [/^previous (.+)$/i, m => "Click to go to the previous " + m[1]],
        [/^next (.+)$/i, m => "Click to go to the next " + m[1]],
        [/^sort$/i, () => "Click to sort"],
        [/^sort (.+)$/i, m => "Click to filter and sort " + m[1]],
        [/^search$/i, () => "Click to search"],
        [/^back$/i, () => "Click to go back"],
        [/^(low to high|high to low)$/i, m => "Click to order the costs from " + m[1].toLowerCase()],
        // The + of Partners & Suppliers adds either.
        [/^add partner to partners & suppliers$/i, () => "Click to add a Partner or Supplier"],
        // An add says what is added, not where (the + is on the list it adds to): "Add Competitor to Competitors" is "Click to add a Competitor".
        [/^add (.+)$/i, m => {
            const what = m[1].replace(/\s+to\s+.*$/i, "").trim();
            return "Click to add " + (/^(another|an?|new|the)\b/i.test(what) ? (/^new\b/i.test(what) ? (/^[aeiou]/i.test(what.slice(4)) ? "an " : "a ") : "") : (/^[aeiou]/i.test(what) ? "an " : "a ")) + what;
        }],
        [/^(remove|delete|open|close|move|show|hide|exit|reset|take|choose|clear|select|expand|collapse|edit|search|follow) (.+)$/i, m => "Click to " + m[1].toLowerCase() + " " + m[2]]
    ];
    for (const [pattern, say] of rules) {
        const match = pattern.exec(clean);
        if (match) {
            return say(match);
        }
    }
    return clean;
}

/** What the tooltip of an element says, or null where it has none (the five rules above). */
export function tipOf(element: HTMLElement): string | null {
    if (!element.matches(PRESSED) || element.matches("input, select, textarea")) {
        return null;
    }
    // 6. A control whose pop-up window is open has none: the window is its answer (the calendar, the "i" card, a menu).
    if (element.getAttribute("aria-expanded") === "true" && element.hasAttribute("aria-haspopup")) {
        return null;
    }
    const given = element.getAttribute("data-tip");
    const name = element.getAttribute("data-tip-named") === null ? element.getAttribute("aria-label") : null;
    const words = shown(element);
    // 2. An icon says its name (the title it was given, else its accessible name).
    if (words.length <= 2) {
        const said = given ?? name;
        return said ? tipWords(said) : null;
    }
    if (!given) {
        return null;
    }
    // 5. Never what it already shows.
    const own = new Set(plain([words, name ?? ""].join(" ")).split(" "));
    const extra = plain(given).split(" ").filter(word => word && !own.has(word));
    if (extra.length === 0) {
        // 3. Unless its words are cut short.
        return isCut(element) ? tipWords(given) : null;
    }
    // 4. What the words do not say.
    return extra.length >= 3 || isCut(element) ? tipWords(given) : null;
}

export default function TitleTooltips() {
    const [tip, setTip] = useState<{ text: string; element: HTMLElement } | null>(null);
    const box = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
    const id = useId();

    useEffect(() => {
        /** Takes the native title away, keeping its words on the element (`data-tip`) and its name or description. */
        const take = (element: HTMLElement) => {
            const title = element.getAttribute("title");
            if (title === null) {
                return;
            }
            element.removeAttribute("title");
            if (!title.trim()) {
                return;
            }
            element.setAttribute("data-tip", title);
            if (!element.hasAttribute("aria-label") && !element.hasAttribute("aria-labelledby")) {
                if (!shown(element)) {
                    element.setAttribute("aria-label", title);
                    element.setAttribute("data-tip-named", "");
                } else if (!element.hasAttribute("aria-description")) {
                    element.setAttribute("aria-description", title);
                }
            }
        };
        const reach = (target: EventTarget | null) => {
            if (!(target instanceof Element)) {
                return null;
            }
            // (Every title under the pointer is taken away, so the browser never draws one; the nearest pressed control may have a tip.)
            const titled = target.closest<HTMLElement>("[title]");
            if (titled) {
                take(titled);
            }
            const element = target.closest<HTMLElement>(PRESSED);
            if (element) {
                take(element);
            }
            return element;
        };
        const over = (event: PointerEvent) => {
            const element = reach(event.target);
            const text = element ? tipOf(element) : null;
            setTip(element && text ? { text, element } : null);
        };
        const focus = (event: FocusEvent) => {
            const element = reach(event.target);
            const text = element ? tipOf(element) : null;
            setTip(element && text ? { text, element } : null);
        };
        const away = () => setTip(null);
        const key = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setTip(null);
            }
        };
        document.addEventListener("pointerover", over, true);
        document.addEventListener("pointerdown", away, true);
        document.addEventListener("pointerleave", away, true);
        document.addEventListener("focusin", focus, true);
        document.addEventListener("focusout", away, true);
        document.addEventListener("keydown", key, true);
        return () => {
            document.removeEventListener("pointerover", over, true);
            document.removeEventListener("pointerdown", away, true);
            document.removeEventListener("pointerleave", away, true);
            document.removeEventListener("focusin", focus, true);
            document.removeEventListener("focusout", away, true);
            document.removeEventListener("keydown", key, true);
        };
    }, []);

    // (A tip over an element that has left the page goes with it; so does one over a control whose pop-up window has opened: the window says what the tip would.)
    useEffect(() => {
        if (!tip) {
            return;
        }
        const timer = window.setInterval(() => setTip(current => current && !current.element.isConnected ? null : current), 400);
        const watcher = new MutationObserver(() => {
            if (tip.element.getAttribute("aria-expanded") === "true") {
                setTip(null);
            }
        });
        watcher.observe(tip.element, { attributes: true, attributeFilter: ["aria-expanded"] });
        return () => {
            window.clearInterval(timer);
            watcher.disconnect();
        };
    }, [tip]);

    useLayoutEffect(() => {
        if (!tip || !box.current) {
            setPosition(null);
            return;
        }
        setPosition(aboveTipPosition(tip.element.getBoundingClientRect(), box.current.getBoundingClientRect()));
    }, [tip]);

    return tip ? <TooltipBox id={id} boxRef={box} position={position} hue={hueOf(tip.element)}>{tip.text}</TooltipBox> : null;
}
