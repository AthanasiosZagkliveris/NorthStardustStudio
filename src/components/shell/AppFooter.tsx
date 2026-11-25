import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { railsInBand } from "../../hooks/useVerticalLayout.ts";
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
// (The rails' arrows in the footer's band too: on a phone's Capability page the word stood over the band's left arrow, 2026-11-24.)
const BACK_OBSTACLES = ".conversation-card, .workbook-panel, .section-tiles-completed .section-tile, .business-foundation-input-actions > *, .bullet-rail[data-across], .workspace-footer-actions > *, .bullet-rails .page-arrow";

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
                .map(element => ({ rect: element.getBoundingClientRect(), card: element.matches(".conversation-card, .workbook-panel") }));
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

    // BACK BESIDE THE PAGE'S TITLE ON A TABLET (owner, 2026-11-24 00:21 UTC+2: "For the Back, just place it on the top left side next to the page's title"; "When the
    // Tablet is in portrait, again place the button at the top left side next to the page's title"): where the footer's band holds the rails (railsInBand) on a
    // window wider than a phone's, Back stands first in the page title's row, and the band keeps its room for the rails.
    const [titleRow, setTitleRow] = useState<HTMLElement | null>(null);
    useLayoutEffect(() => {
        const place = () => {
            // (BACK STAYS AT THE FOOT WHERE THE TITLE STANDS IN THE HEADER (owner, 2026-11-24 10:12 UTC+2: "The back button does not move to the header, it stays there"):
            // a phone in landscape alone takes it to the title, as before.)
            const phoneLandscape = typeof window.matchMedia === "function" && window.matchMedia("(orientation: landscape) and (max-height: 479px)").matches;
            const row = railsInBand() && window.innerWidth > 600 && phoneLandscape ? document.querySelector<HTMLElement>(".interview-header-title-row") : null;
            setTitleRow(current => current === row ? current : row);
        };
        place();
        const later = [100, 400, 1000].map(delay => window.setTimeout(place, delay));
        window.addEventListener("resize", place);
        window.addEventListener("tiles-fit", place);
        return () => {
            later.forEach(timer => window.clearTimeout(timer));
            window.removeEventListener("resize", place);
            window.removeEventListener("tiles-fit", place);
        };
    }, []);

    // (Its word where the room left of the page holds it, else its arrow alone, its name in the tooltip.)
    useLayoutEffect(() => {
        const back = titleRow?.querySelector<HTMLElement>(".interview-header-back");
        if (!titleRow || !back) {
            return;
        }
        back.classList.remove("interview-header-back-short");
        if (back.getBoundingClientRect().left < 4) {
            back.classList.add("interview-header-back-short");
        }
    });

    return (

        <footer className="workspace-footer" ref={footer}>

            {titleRow
                ? createPortal(<BackButton className="back-link interview-header-back" onClick={onBack} />, titleRow)
                : <BackButton className="back-link" onClick={onBack} />}

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
