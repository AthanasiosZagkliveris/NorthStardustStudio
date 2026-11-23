import { useLayoutEffect, useRef } from "react";
import BackButton from "../controls/BackButton.tsx";
import AddButton from "../controls/AddButton.tsx";
import "../../styles/workspace.css";

interface AppFooterProps {

    onBack?: () => void;

    primaryText?: string;

    onPrimary?: () => void;

    primaryDisabled?: boolean;

    secondaryText?: string;

    onSecondary?: () => void;

    secondaryDisabled?: boolean;

}

/** What the footer's Back may never stand over, word and all: the page's card (its left edge runs down to the footer), the Inventory and Completed row and the footer's own buttons. */
const BACK_OBSTACLES = ".conversation-card, .section-tiles-completed .section-tile, .business-foundation-input-actions > *, .bullet-rail[data-across], .workspace-footer-actions > *";

/** The room kept between the Back, word and all, and the nearest thing beside it. */
const BACK_CLEARANCE = 12;

/**
 * Whether the footer's Back, with its word, would stand over something (`BACK_OBSTACLES`): measured with the word shown. The page card counts by its left edge alone, as
 * it runs down beside the footer; the others where they meet the Back's box.
 */
export function backWordCovers(back: DOMRect, obstacles: readonly { rect: DOMRect; card: boolean }[]): boolean {
    return obstacles.some(({ rect, card }) => {
        if (rect.width === 0 || rect.height === 0) {
            return false;
        }
        // (THE CARD COUNTS WHERE IT IS DRAWN (owner, 2026-11-23 22:44 UTC+2: "As long as there is space for the BACK button, do not remove it"): a page of tiles ends
        // above the footer's band, so its card no longer stands beside the Back; a long page that runs down under the band still does.)
        if (card) {
            return back.right + BACK_CLEARANCE > rect.left && back.left < rect.right && back.bottom > rect.top && back.top < rect.bottom + BACK_CLEARANCE;
        }
        return back.right + BACK_CLEARANCE > rect.left && back.left < rect.right + BACK_CLEARANCE && back.bottom > rect.top && back.top < rect.bottom;
    });
}

export default function AppFooter({

    onBack,

    primaryText,

    onPrimary,

    primaryDisabled = false,

    secondaryText,

    onSecondary,

    secondaryDisabled = false

}: AppFooterProps) {

    // THE BACK KEEPS ITS WORD WHEREVER THERE IS ROOM FOR IT (owner, 2026-11-22 18:58 UTC+2: "If there is nothing to hide the BACK (word) at the footing, there is no
    // reason to hide the word"): measured with the word shown; where it would stand over the page's card or what stands in the footer's band, the arrow alone stays
    // (back-button.css, `.workspace-footer-back-short`), its name in the tooltip.
    const footer = useRef<HTMLElement | null>(null);
    useLayoutEffect(() => {
        const node = footer.current;
        if (!node) {
            return;
        }
        const fit = () => {
            const back = node.querySelector<HTMLElement>(".back-button");
            if (!back) {
                return;
            }
            node.classList.remove("workspace-footer-back-short");
            const rect = back.getBoundingClientRect();
            const obstacles = Array.from(document.querySelectorAll<HTMLElement>(BACK_OBSTACLES))
                .filter(element => !element.contains(back))
                .map(element => ({ rect: element.getBoundingClientRect(), card: element.matches(".conversation-card") }));
            node.classList.toggle("workspace-footer-back-short", backWordCovers(rect, obstacles));
        };
        fit();
        // (The page's card and tiles settle a little after the page is drawn: measured again until they have.)
        const later = [100, 300, 800, 1500].map(delay => window.setTimeout(fit, delay));
        window.addEventListener("resize", fit);
        window.addEventListener("tiles-fit", fit);
        const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(fit);
        observer?.observe(document.body);
        return () => {
            later.forEach(timer => window.clearTimeout(timer));
            window.removeEventListener("resize", fit);
            window.removeEventListener("tiles-fit", fit);
            observer?.disconnect();
        };
    }, []);

    return (

        <footer className="workspace-footer" ref={footer}>

            <BackButton className="back-link" onClick={onBack} />

            <div className="workspace-footer-actions">

                {secondaryText && (

                    <AddButton look="secondary-button"
                        onClick={onSecondary}
                        disabled={secondaryDisabled}>
                        {secondaryText}
                    </AddButton>

                )}

                {primaryText && (

                    <AddButton look="primary-button"
                        onClick={onPrimary}
                        disabled={primaryDisabled}>
                        {primaryText}
                    </AddButton>

                )}

            </div>

        </footer>

    );

}
