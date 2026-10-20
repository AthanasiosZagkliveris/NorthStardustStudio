import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { aboveTipPosition, TooltipBox } from "./Tooltip.tsx";

/**
 * THE TOOLTIP OF EVERY `title` (docs/design/23-shared-components.md): a `title` attribute is drawn by the browser as a plain white rectangle with a black
 * frame and letters, in whatever the system's mode is, whatever the app's reading mode is. This host, mounted once, takes the `title` of an element the
 * pointer or the keyboard reaches and shows its words in the app's own tooltip (`TooltipBox`: its letters, size, frame and place), so no place draws a
 * native one. The words stay the element's: an element with no text of its own is named by them (`aria-label`), any other is described by them
 * (`aria-description`), and `data-tip` keeps them for the next time. Escape closes the tip.
 */
export default function TitleTooltips() {
    const [tip, setTip] = useState<{ text: string; element: HTMLElement; x: number | null } | null>(null);
    const box = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
    const id = useId();

    useEffect(() => {
        const take = (element: HTMLElement): string | null => {
            const title = element.getAttribute("title");
            if (title !== null) {
                element.removeAttribute("title");
                if (title.trim()) {
                    element.setAttribute("data-tip", title);
                    if (!element.hasAttribute("aria-label") && !element.hasAttribute("aria-labelledby")) {
                        if (!(element.textContent ?? "").trim()) {
                            element.setAttribute("aria-label", title);
                        } else if (!element.hasAttribute("aria-description")) {
                            element.setAttribute("aria-description", title);
                        }
                    }
                }
            }
            return element.getAttribute("data-tip");
        };
        const reach = (target: EventTarget | null) => (target instanceof Element ? target.closest<HTMLElement>("[title], [data-tip]") : null);
        const over = (event: PointerEvent) => {
            const element = reach(event.target);
            const text = element ? take(element) : null;
            setTip(element && text ? { text, element, x: event.clientX } : null);
        };
        const move = (event: PointerEvent) => {
            setTip(current => current && current.x !== null && current.element.contains(event.target as Node) ? { ...current, x: event.clientX } : current);
        };
        const focus = (event: FocusEvent) => {
            const element = reach(event.target);
            const text = element ? take(element) : null;
            setTip(element && text ? { text, element, x: null } : null);
        };
        const away = () => setTip(null);
        const key = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setTip(null);
            }
        };
        document.addEventListener("pointerover", over, true);
        document.addEventListener("pointermove", move, true);
        document.addEventListener("pointerdown", away, true);
        document.addEventListener("pointerleave", away, true);
        document.addEventListener("focusin", focus, true);
        document.addEventListener("focusout", away, true);
        document.addEventListener("keydown", key, true);
        return () => {
            document.removeEventListener("pointerover", over, true);
            document.removeEventListener("pointermove", move, true);
            document.removeEventListener("pointerdown", away, true);
            document.removeEventListener("pointerleave", away, true);
            document.removeEventListener("focusin", focus, true);
            document.removeEventListener("focusout", away, true);
            document.removeEventListener("keydown", key, true);
        };
    }, []);

    // (A tip over an element that has left the page goes with it.)
    useEffect(() => {
        if (!tip) {
            return;
        }
        const timer = window.setInterval(() => setTip(current => current && !current.element.isConnected ? null : current), 400);
        return () => window.clearInterval(timer);
    }, [tip]);

    useLayoutEffect(() => {
        if (!tip || !box.current) {
            setPosition(null);
            return;
        }
        setPosition(aboveTipPosition(tip.element.getBoundingClientRect(), box.current.getBoundingClientRect(), tip.x === null ? null : { x: tip.x }));
    }, [tip]);

    return tip ? <TooltipBox id={id} boxRef={box} position={position}>{tip.text}</TooltipBox> : null;
}
