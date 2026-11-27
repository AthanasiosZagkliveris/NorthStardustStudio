import { useLocation, useNavigate } from "react-router-dom";
import TextLink from "../components/interview/fields/TextLink.tsx";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getCapabilityIcon } from "../data/capabilityIcons";

import { capabilities, getCapabilityColor } from "../data/capabilities";
import { systems } from "../data/systems";

import { FrameworkSystem } from "../types/system";
import { Capability } from "../types/capability";

import { getCapabilityDescription } from "../framework/engine/CapabilityDescriptions.ts";
import FoldArrow from "../components/interview/fields/FoldArrow.tsx";
import "../styles/title-arrow.css";
import "../styles/capability-description.css";

import AppHeader from "../components/shell/AppHeader";
import AppFooter from "../components/shell/AppFooter";
import OrganizationCalendarPanel from "../components/calendar/OrganizationCalendarPanel";

import CapabilityDescriptionDialog from "../components/capabilities/CapabilityDescriptionDialog";
import InterviewHeader from "../components/interview/editors/InterviewHeader";
import SectionTiles, { type SectionTile } from "../components/interview/tiles/SectionTiles";
import Tile from "../components/interview/tiles/Tile";
import { SymbolMark, TileList, TileTitle } from "../components/interview/tiles/TileParts";
import { systemContents } from "../components/systems/systemContents";
import BulletRail from "../components/interview/rails/BulletRail";
import useRailTab from "../hooks/useRailTab.ts";
import PageArrow from "../components/interview/fields/PageArrow";
import { masterSide, setTilesPage, setTilesPageWidth } from "../components/interview/tiles/SectionTileGeometry.tsx";
import { isPhone, masterAcross, ROW_OF_FOUR_QUERY, verticalAcross } from "../hooks/useVerticalLayout.ts";
import { getSystemIcon } from "../data/systemIcons";
import "../styles/status-shape.css";
import "../styles/system-list.css";
// (A Capability's dialog carries the rail of every dialog: its tab of bullets, as the System pages and the Workbook draw it.)
import "../styles/status-shape.css";
import "../styles/bullet-rail.css";
import { PAGE_STATUS_WORDS } from "../framework/engine/status/PageStatus";

/** A colour's hue (0 to 360), for a tile drawn in a Capability's colour (its hex in data/capabilities.ts). */
function hueOf(hex: string): number {
    const value = hex.replace("#", "");
    const [r, g, b] = [0, 2, 4].map(at => parseInt(value.slice(at, at + 2), 16) / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max === min) {
        return 0;
    }
    const d = max - min;
    const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return Math.round((h * 60 + 360) % 360);
}

import { OrganizationService } from "../services/OrganizationService";
import { continuePlace, systemPages, systemProgress, type ContinuePlace } from "../services/ProgressService";
import type { PageStatus } from "../framework/engine/status/PageStatus";

import "../styles/workspace.css";
// (The page of tiles is drawn as a System's page is: its card, frame and tiles; owner, 2026-11-22.)
import "../styles/conversation.css";
import "../styles/conversation-layout.css";

export default function SystemSelection() {

    const navigate = useNavigate();
    const location = useLocation();

    // The Landing page is the only place an Organization gets
    // selected (item 3) -- this page just trusts that selection
    // and bounces back to Landing if, for whatever reason
    // (direct URL, cleared storage), none is set.
    const [organizationName, setOrganizationName] = useState("");
    const [organizationId, setOrganizationId] = useState<string | null>(null);

    useEffect(() => {

        const selectedOrganizationId = OrganizationService.getSelected();

        if (!selectedOrganizationId) {
            navigate("/");
            return;
        }

        setOrganizationId(selectedOrganizationId);
        setOrganizationName(OrganizationService.getSummary(selectedOrganizationId)?.name ?? "");

    }, [navigate]);

    // Coming Back from a System (or the Business Documents page)
    // passes the Capability it belonged to, so the list reopens on
    // that Capability instead of making the user pick it again.
    // (THE CAPABILITY'S OWN PAGE (owner, 2026-11-22 21:09 UTC+2: "When you click on a Capability, It should open a page (Title with proper size, capitals, symbols.).
    // Its help text should be the previous one"): the Capability shown, or none (the Capabilities); Back from a System brings its Capability's page back.)
    const [shownCapability, setActiveCapability] =
        useState<string | null>(() => location.state?.capability ?? null);
    const shownCapabilityRef = useRef(shownCapability);
    shownCapabilityRef.current = shownCapability;

    const [openCapability, setOpenCapability] =
        useState<Capability | null>(null);

    // The Framework Navigator rail (Calendar/Capabilities/System)
    // reports its own open/closed state up here so Escape can fold
    // "close the rail" into the same precedence chain as the
    // Capability description dialog below, without the rail needing
    // to know anything about Escape/Back itself -- see the keydown
    // effect further down. `railCloseSignal` is a counter (not a boolean) bumped
    // to force the rail closed from here; the rail's own effect
    // reacts to it changing, not to any particular value.
    const [railOpen, setRailOpen] = useState(false);
    const [railCloseSignal, setRailCloseSignal] = useState(0);

    // Where to go on: the last place worked, or the next page not yet
    // defined (see continuePlace) -- one "Continue" or "Next" line.
    // Read after rendering, not during it: reading a System's saved
    // answers can bring them up to date and save them, and a save
    // re-renders the header's saved signal -- which React refuses in
    // the middle of rendering this page.
    const [lastPlace, setLastPlace] = useState<ContinuePlace | null>(null);

    useEffect(() => {
        setLastPlace(organizationId ? continuePlace(organizationId) : null);
    }, [organizationId]);

    function continueWhereLeftOff() {

        if (!lastPlace) {
            return;
        }

        navigate("/introduction", {

            state: {
                system: lastPlace.system,
                targetSectionNumber: lastPlace.sectionNumber,
                resume: { anchor: lastPlace.anchor }
            }

        });

    }

    // Each listed System's status for this Organization -- the same
    // shapes the Pages rail draws, derived from the System's pages.
    // Read after rendering too, for the same reason as lastPlace.
    const [systemStatuses, setSystemStatuses] = useState<Record<number, PageStatus | null>>({});

    // (Each System's sections' statuses, for the status bullets of what its tile lists: owner, 2026-11-23 16:19 UTC+2.)
    const [sectionStatuses, setSectionStatuses] = useState<Record<number, ReadonlyMap<number, PageStatus>>>({});

    useEffect(() => {

        setSectionStatuses(organizationId
            ? Object.fromEntries(systems.map(system => [system.number, new Map((systemPages(organizationId, system) ?? []).map(page => [page.number, page.status]))]))
            : {});

        setSystemStatuses(organizationId
            ? Object.fromEntries(
                systems.map(system => [system.number, systemProgress(organizationId, system)])
            )
            : {});

        // filteredSystems follows activeCapability.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organizationId]);

    // (THE CAPABILITY'S HELP UNDER ITS TITLE (owner, 2026-11-23 16:19 UTC+2: "Adjust the capabilities discription to fit the size of the other pop up help cells.
    // instead of i use an arrow. Use the idea of the Infrastructure arrow, text size and position, but maintain its original design"): the title arrow drops the
    // Capability's description -- its tagline, its paragraphs and its core principle, as the description had them -- in a help panel the size of a chapter's.)
    const [helpOpen, setHelpOpen] = useState(false);
    const helpOpenRef = useRef(helpOpen);
    helpOpenRef.current = helpOpen;
    const helpBlock = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        setHelpOpen(false);
    }, [shownCapability]);
    useEffect(() => {
        if (!helpOpen) {
            return;
        }
        const press = (event: MouseEvent) => {
            const header = document.querySelector(".conversation-card .interview-header");
            if (event.target instanceof Node && !helpBlock.current?.contains(event.target) && !header?.contains(event.target)) {
                setHelpOpen(false);
            }
        };
        document.addEventListener("mousedown", press);
        return () => document.removeEventListener("mousedown", press);
    }, [helpOpen]);

    // Escape acts as "Back" everywhere in the app: close whichever
    // popup/sliding window is currently open first (the Capability
    // description, then the Navigator rail itself), and only once
    // nothing is open anymore does it fall through to the same
    // navigation the footer's own "Back" link performs.
    useEffect(() => {

        function handleKeyDown(event: KeyboardEvent) {

            // (THE LEFT AND RIGHT KEYS TURN A CAPABILITY'S PAGES (owner, 2026-11-23 16:19 UTC+2: "Fix the keys left and right to work with turn pages"), as a System's
            // pages turn: the arrow keys alone, where nothing else uses them.)
            if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && shownCapabilityRef.current && !event.defaultPrevented && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
                const inside = event.target instanceof Element ? event.target : null;
                if (inside?.closest("input, textarea, select, [contenteditable=true], [role=listbox], [role=menu], [role=slider], .option-picker")) {
                    return;
                }
                const at = capabilities.findIndex(capability => capability.id === shownCapabilityRef.current);
                event.preventDefault();
                // (Round as a carousel: before the first, the last; after the last, the first.)
                setActiveCapability(capabilities[(at + (event.key === "ArrowLeft" ? capabilities.length - 1 : 1)) % capabilities.length].id);
                return;
            }

            if (event.key !== "Escape") {
                return;
            }

            if (helpOpenRef.current) {
                setHelpOpen(false);
                return;
            }

            if (openCapability) {
                setOpenCapability(null);
                return;
            }

            if (railOpen) {
                setRailCloseSignal(previous => previous + 1);
                return;
            }

            // (A Capability's page goes back to the Capabilities first.)
            if (shownCapabilityRef.current) {
                setActiveCapability(null);
                return;
            }

            navigate("/");

        }

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);

    }, [openCapability, railOpen, navigate]);

    // Opens the System straight away and resumes wherever the user
    // last left it (Conversation.tsx's loading effect restores the
    // saved position). There used to be a "Begin …?" confirmation
    // here that also reset the position to Section 1; without the
    // dialog a reset would silently lose the user's place, so the
    // saved position is simply kept.
    // (THE MASTER TILES' SIDE (SectionTiles' fit): what the window's height leaves for two rows under the tiles' top, above the footer and its 12px; 150px at least.)
    const tilesBox = useRef<HTMLDivElement | null>(null);
    const [tileSide, setTileSide] = useState<number | null>(null);
    // (Where the chapters stack, the Systems stand in the page's row of master tiles: two, or four on a phone in landscape -- masterAcross.)
    const [stackedRow, setStackedRow] = useState<number | null>(null);
    // (A SYSTEM'S TILE SHORT OF ROOM SHOWS ITS TITLE ALONE, CENTRED (owner, 2026-11-24 03:14 UTC+2: "When there is not enough space in the tiles, let only the
    // titles, and place them in the centre"), as a page's master tiles do (TileList, data-no-room): where what it holds would run past the tile's foot, less 12px,
    // it is not shown, and the title (its name and symbol) stands in the tile's middle.)
    useLayoutEffect(() => {
        const box = tilesBox.current;
        if (!box) {
            return;
        }
        // (THE CAPABILITY'S POP-UP OVER THE SYSTEMS' FRAME (owner, 2026-11-24 10:31 UTC+2: "And the pop up window's position"): its left edge and its width the
        // frame's, so it opens exactly over the chapter it describes, never over the rail.)
        const frame = box.querySelector<HTMLElement>(".capability-systems-frame")?.getBoundingClientRect();
        const block = document.querySelector<HTMLElement>(".capability-help-block");
        if (frame && block && frame.width > 0) {
            block.style.setProperty("--help-left", Math.round(frame.left - block.getBoundingClientRect().left) + "px");
            block.style.setProperty("--help-width", Math.round(frame.width) + "px");
            // (No taller than the room down to 12px over the footer: what is longer scrolls inside it.)
            const footer = document.querySelector<HTMLElement>(".workspace-footer")?.offsetHeight ?? 64;
            block.style.setProperty("--help-height", Math.max(200, Math.round(window.innerHeight - footer - 12 - frame.top)) + "px");
        }
        box.querySelectorAll<HTMLElement>(".capability-system-slot").forEach(slot => {
            const body = slot.querySelector<HTMLElement>(".capability-system-body");
            const tile = slot.querySelector<HTMLElement>(":scope > .section-tile");
            const title = tile?.querySelector<HTMLElement>(".section-tile-title");
            if (!body || !tile || !title) {
                return;
            }
            body.removeAttribute("data-no-room");
            slot.style.removeProperty("--title-centre");
            // (A SYSTEM'S TILE IS ITS TITLE AND SYMBOL ALONE (owner, 2026-11-24 05:32 UTC+2: "from the System Tiles, hide their content. Keep only their Titles and
            // icons"): what it holds is never shown on the tile -- the System's Introduction lists it --, and the title and symbol stand in the tile's middle.)
            {
                body.setAttribute("data-no-room", "");
                // (ITS TITLE IN THE TILE'S LOWER THIRD, ITS SYMBOL LARGE ABOVE IT (owner, 2026-11-24 10:25 UTC+2: "On the capability page, when there is enough space,
                // the tiles have title and icons. So place at the 1/3 bottom the title, and scale up the icon, so it can be easier readable and recognisable"): the
                // symbol, 40% of the tile (workspace.css), above the words.)
                const words = (title.querySelector<HTMLElement>(".section-tile-title-words") ?? title).getBoundingClientRect();
                const box = tile.getBoundingClientRect();
                // (Its rule a third of the tile up from its foot (owner, 2026-11-24 10:46 UTC+2: "place the title to the 1/3 from the bottom, and then the icon above
                // the title").)
                // (The title's TOP a third of the tile up from its foot (owner, 2026-11-25: "The title's top part should reach the 1/3 of the card from its bottom").)
                const line = box.top + box.height * 2 / 3;
                slot.style.setProperty("--title-centre", Math.round(line - words.top) + "px");
            }
        });
    });
    useLayoutEffect(() => {
        const fit = () => {
            const box = tilesBox.current;
            if (!box) {
                return;
            }
            const top = box.getBoundingClientRect().top + window.scrollY;
            // (A PHONE TURNED TO LANDSCAPE has no footer band, its arrows at the window's corners: its two rows of tiles take the height down to the window's foot, as small
            // as 96px a side, so both rows stand on the screen -- owner, 2026-11-27 14:07 UTC+2, the Capabilities on a phone turned sideways: "Check the tiles' layout".)
            const sideways = typeof window.matchMedia === "function" && window.matchMedia(ROW_OF_FOUR_QUERY).matches;
            const footer = sideways ? 0 : document.querySelector<HTMLElement>(".workspace-footer")?.offsetHeight ?? 64;
            // (On a Capability's page, the frame's edge and padding (13px), its heading and the 12px under it come before the tiles.)
            const head = box.querySelector<HTMLElement>(".capability-systems-frame > .tiles-frame-head");
            const above = head ? 13 + head.offsetHeight + 12 : 0;
            const tall = Math.max(sideways ? 96 : 150, Math.floor((window.innerHeight - top - footer - 12 - 12 - 12 - 12 - above) / 2));
            // (A CAPABILITY'S SYSTEMS AS A CHAPTER (owner, 2026-11-23 17:52 UTC+2: "Align them to the left"; "Fix the size of the tiles and the 'chapter' frame, to
            // hug the tiles"): two across stand in half the page, as a chapter does (half the page less 6px), three across in the whole; the tiles as large as
            // that room and the window's height allow, the frame round them.)
            const count = shownCapabilityRef.current ? systems.filter(system => system.capability === shownCapabilityRef.current).length : 0;
            if (count > 0) {
                const across = count >= 3 && count <= 4 ? 2 : Math.min(count, 3);
                // (The title's rule; where the title stands in the header and its rule is hidden, the page's card.)
                const ruleWidth = document.querySelector<HTMLElement>(".interview-header .interview-divider")?.getBoundingClientRect().width ?? 0;
                const page = ruleWidth > 0 ? ruleWidth : document.querySelector<HTMLElement>(".conversation-card")?.getBoundingClientRect().width ?? box.clientWidth;
                const pad = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--card-padding")) || 12;
                const room = (across === 2 ? page / 2 - 6 : page) - 2 * pad - 2 - (across - 1) * 12;
                // (THE SAME SIDE AS EVERY PAGE'S MASTER TILES (owner, 2026-11-23 19:48 UTC+2: "Can we be consistent and use the same sizes?"): masterSide, the side
                // the window gives a chapter's tiles, so the SYSTEMS frame is a chapter's frame and the arrows stand between its rows as on every page.)
                const master = masterSide();
                // (THE SAME TILES AS EVERY PAGE OF THE WINDOW WHERE THE CHAPTERS STACK (owner, 2026-11-24 10:12 UTC+2: "Same screen, 2 columns both, different tile sizes.
                // Why?"): there a chapter takes the page's whole width, its tiles two across up to 260px (SectionTiles), so the Systems' frame does too.)
                // (THE SAME SIDE AS THE PAGES' MASTER TILES ON A PHONE TOO (owner, 2026-11-25 15:51 UTC+2: "Consistency accross all the pages per screen size"; a phone
                // in portrait drew the Systems at 120px beside the pages' 160px, one in landscape at 260px beside their 171px): the stacked side of SectionTiles -- the
                // window's room less its gutters and the frame round the tiles, the page's row (two, four on a phone in landscape), 260px at most but on a phone.)
                const stacked = verticalAcross() > 0;
                const row = stacked ? Math.min(count, masterAcross()) : across;
                const gutterValue = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--rail-gutter"));
                const windowRoom = Math.min(1400, document.documentElement.clientWidth - 2 * (Number.isFinite(gutterValue) ? gutterValue : 16));
                const fill = Math.floor((windowRoom - 2 * pad - 2 - (masterAcross() - 1) * 12) / masterAcross());
                const side = stacked
                    ? Math.max(72, isPhone() ? fill : Math.min(fill, 260))
                    : Math.max(120, Math.min(tall, Math.floor(room / across), master ?? Infinity));
                setStackedRow(stacked ? row : null);
                // (The page as wide as its tiles, as every page of tiles: tilesPageWidth; where the chapters stack, as wide as the frame, as a stacked chapter's page.)
                if (stacked) {
                    setTilesPageWidth(document.querySelector<HTMLElement>(".conversation-page"), row * side + (row - 1) * 12 + 2 * pad + 2);
                } else {
                    setTilesPage(document.querySelector<HTMLElement>(".conversation-page"), master);
                }
                setTileSide(side);
                return;
            }
            setTilesPage(document.querySelector<HTMLElement>(".conversation-page"), null);
            setTileSide(tall);
        };
        fit();
        // (The arrow level settles with the page title: measured again until it has, as the page arrows do.)
        const later = [100, 250, 500, 900].map(delay => window.setTimeout(fit, delay));
        window.addEventListener("resize", fit);
        return () => {
            later.forEach(timer => window.clearTimeout(timer));
            window.removeEventListener("resize", fit);
        };
    }, [shownCapability]);

    // (THE MASTER TILES' TYPE (owner, 2026-11-23 16:19 UTC+2: "Check the text size (Titles and listed items)"): from 250px a side the lists take the body step, 18px,
    // as a page's master tiles' do (data-large, SectionTiles' fit); under it 14px.)
    useLayoutEffect(() => {
        const box = tilesBox.current;
        const tile = box?.querySelector<HTMLElement>(".section-tile");
        if (box && tile) {
            box.toggleAttribute("data-large", tile.offsetWidth >= 250);
        }
    });

    // (The rail's tab in the frame's colours, 12px under its top, as a page's: useRailTab.)
    useRailTab();

    // (THE RAIL BESIDE THE SYSTEMS' FRAME: the frame's span, centred on the window, as a page of chapters gives its rails (SectionTiles' railsBesideFrames).)
    const systemsFrame = useRef<HTMLDivElement | null>(null);
    useLayoutEffect(() => {
        const frame = systemsFrame.current;
        const page = frame?.closest<HTMLElement>(".conversation-page");
        if (!frame || !page) {
            document.querySelector<HTMLElement>(".conversation-page")?.style.removeProperty("--rail-frame-span");
            return;
        }
        const r = frame.getBoundingClientRect();
        const middle = window.innerWidth / 2;
        const span = Math.ceil(2 * Math.max(middle - r.left, r.right - middle)) + "px";
        if (page.style.getPropertyValue("--rail-frame-span") !== span) {
            page.style.setProperty("--rail-frame-span", span);
            window.requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
        }
    });

    // (One tile a Capability, in its colour (the Framework's own, data/capabilities.ts) and with its icon; its Systems its list and its dialog's tiles.)
    const shown = capabilities.find(capability => capability.id === shownCapability) ?? null;
    const shownSystems = shown ? systems.filter(system => system.capability === shown.id) : [];

    const capabilityTiles: SectionTile[] = capabilities.map(capability => {
        const own = systems.filter(system => system.capability === capability.id);
        return {
            id: capability.id,
            title: capability.title,
            hue: hueOf(getCapabilityColor(capability.id)),
            colour: getCapabilityColor(capability.id),
            // (Its icon under its title, the logo's size: owner, 2026-11-22 21:39 UTC+2, "Make the Icon same size as the Logo icon (Tiles), and place them under the
            // capability title".)
            titleMark: getCapabilityIcon(capabilities.indexOf(capability) + 1),
            empty: own.length === 0,
            // (Its Systems by name alone: the tile says they are Systems -- owner, 2026-11-22 21:11 UTC+2, "remove the System word".)
            items: own.map(system => system.title.replace(/ System$/, "")),
            // (EACH SYSTEM'S STATUS AS ITS BULLET (owner, 2026-11-23 15:32 UTC+2: "On the Capabilities Tiles, next to the systems place bullets"; "Use the previous
            // bullet system, to define when a system, is defined, not started, etc."): ○ not started, ◐ in progress, ● defined, as the Pages rail and the System list drew them.)
            itemMarks: own.map(system => ({ status: systemStatuses[system.number] ?? "not-started" })),
            // (EACH SYSTEM ON THE TILE IS A LINK TO IT (owner, 2026-11-22 21:00 UTC+2: "Fix links"), as a line of every tile is to what it names.)
            links: own.map(system => ({ go: () => handleSystemSelection(system) })),
            // (Pressed, it opens its Capability's page: press, not a dialog.)
            press: () => setActiveCapability(capability.id),
            content: () => null
        };
    });

    /** A System's tile on its Capability's page. */
    /** Where a System's tile grows from: its outer corner in the grid (scaleOrigin's rule for a chapter's master tiles). */
    function originOf(index: number): string {
        const across = shownSystems.length >= 3 && shownSystems.length <= 4 ? 2 : Math.min(shownSystems.length, 3);
        const rows = Math.ceil(shownSystems.length / across);
        const column = index % across;
        const row = Math.floor(index / across);
        const x = across <= 1 ? "50%" : column === 0 ? "0%" : column === across - 1 ? "100%" : "50%";
        const y = rows <= 1 ? "0%" : row === 0 ? "0%" : row === rows - 1 ? "100%" : "50%";
        return x + " " + y;
    }

    function systemTile(system: FrameworkSystem) {
        const status = systemStatuses[system.number];
        const contents = systemContents(system, sectionStatuses[system.number]);
        // (A System's tile (owner, 2026-11-22 21:00 and 2026-11-23 17:28 UTC+2): its name -- its order number kept in its accessible name and the documents,
        // not drawn ("Hide the Systems order numbers on their tiles, and titles") --, its icon under it, then what it holds under a heading, each line's bullet
        // its status; no status word ("Remove the note (not started, defines) under their symbols": the Handbook's App Guide says what the shapes mean).)
        return (
            <Tile
                key={system.id}
                // (THE TILE GROWS FROM ITS OUTER CORNER (owner, 2026-11-23 17:52 UTC+2: "Fix the direction the Tiles scale up"), as a chapter's master tiles do: a
                // tile at the frame's left grows to the right, one at its right to the left, the top row down, the bottom row up -- never out of the frame.)
                frame={{ className: "section-tile-slot capability-system-slot", style: { transformOrigin: originOf(shownSystems.indexOf(system)) } }}
                className="section-tile"
                aria-label={String(system.number).padStart(2, "0") + ". " + system.title + (status ? ", " + PAGE_STATUS_WORDS[status] : "")}
                face={(
                    <>
                        {/* (Its number and name, whole, on as many lines as it takes; "System" is the dialog's word for all of them, so a tile says the name
                            alone -- "07. Product" -- and its accessible name says it whole. ITS ICON UNDER THE NAME AS A CAPABILITY'S IS (owner,
                            2026-11-23 15:32 UTC+2: "Place each system's icon, to look like the capabilities (size, colour and position)"): the logo's size, in its
                            Capability's colour (the icon's own).) */}
                        <TileTitle className="section-tile-title-broken">
                            {/* (Its name on one line where the tile holds it, "Social Media"; between its words where it does not: owner, 2026-11-23 18:03 UTC+2.) */}
                            <span className="section-tile-title-words">{system.title.replace(/ System$/, "")}</span>
                            {getSystemIcon(system.number) && <SymbolMark src={getSystemIcon(system.number)!} className="section-tile-title-mark" />}
                        </TileTitle>
                    </>
                )}
                onClick={() => handleSystemSelection(system)}
            >
                {/* (WHAT IT HOLDS, UNDER ITS HEADING (owner, 2026-11-23 17:28 UTC+2): its PAGES, the CHAPTERS of its one page, or the SECTIONS of its one chapter --
                    systemContents --, EACH A LINK THERE (18:27 UTC+2: "Add links also, so by clicking on a page to get there"): laid over the tile as every tile's
                    links are (section-tile-links-layer), so the tile's own press stays the System's.) */}
                {contents.lines.length > 0 && (
                    <div className="section-tile-links-layer capability-system-links">
                        <div className="capability-system-body">
                            <span className="capability-system-kind">{contents.kind}</span>
                            <TileList
                                items={contents.lines.map(line => line.label)}
                                marks={contents.lines.map(line => ({ status: line.status, tip: line.full }))}
                                links={contents.lines.map(line => line.target ? { go: () => openPlace(system, line.target!) } : undefined)}
                                onLink={(link) => { if ("go" in link) link.go(); }}
                            />
                        </div>
                    </div>
                )}
            </Tile>
        );
    }

    /** A line of a System's tile: its page, and the place on it to scroll to. */
    function openPlace(system: FrameworkSystem, target: { section: number; anchor?: string }) {
        navigate("/introduction", { state: { system, targetSectionNumber: target.section, ...(target.anchor ? { resume: { anchor: target.anchor } } : {}) } });
    }

    function handleSystemSelection(system: FrameworkSystem) {

        navigate("/introduction", {

            state: {
                system
            }

        });

    }

    // The Calendar's own "Open →" link on a task (see
    // OrganizationCalendarPanel.tsx / CalendarTaskService.ts) --
    // jumps straight into that System's already-existing interview
    // session, landed on the specific Section the task actually
    // came from, unlike `handleSystemSelection` above which just
    // resumes wherever the interview was last left.
    // `targetSectionNumber` is read by Conversation.tsx's own
    // loading effect.
    function openTask(systemNumber: number, sectionNumber: number) {

        const system = systems.find(candidate => candidate.number === systemNumber);

        if (!system) {
            return;
        }

        navigate("/introduction", {

            state: {
                system,
                targetSectionNumber: sectionNumber
            }

        });

    }

    return (

        <div className="workspace conversation-page">

            <AppHeader organizationName={organizationName} />

            <OrganizationCalendarPanel
                organizationId={organizationId}
                capabilities={capabilities}
                systems={systems}
                onCapabilityOpen={setOpenCapability}
                onCapabilitySelect={setActiveCapability}
                onSystemOpen={handleSystemSelection}
                onOpenTask={openTask}
                onOpenChange={setRailOpen}
                closeSignal={railCloseSignal}
                suppressClose={openCapability !== null}
            />

            <main className="conversation-content">

                {/* (The title arrow's ink, as a chapter's, from the Capability's hue: the shared LabelArrow reads --strategy-theme-hue.) */}
                <div className="conversation-card" style={shown ? { "--strategy-theme-hue": hueOf(getCapabilityColor(shown.id)) } as React.CSSProperties : undefined}>

                    {/* CAPABILITIES AS MASTER TILES (owner, 2026-11-22 20:35 UTC+2: "Rename the title to capabilities. Make Master Tiles (Capabilities to their related
                        colour), and each Master Tile will have its own Tiles (systems)"): the page's title over its rule as on a System's page, one frame of a tile for each
                        Capability in its own colour, listing its Systems; pressed, its dialog holds a tile for each System, with its status, that opens it. */}
                    {shown ? (
                        // (THE CAPABILITY'S NAME ALONE (owner, 2026-11-23 15:32 UTC+2: "Remove the Capabilities word on the title"), in capitals, with its icon.)
                        <InterviewHeader
                            systemName={shown.title}
                            capabilityId={shown.id}
                            nameCapitals
                            icon={getCapabilityIcon(capabilities.indexOf(shown) + 1)}
                            iconFull
                            note={(
                                <FoldArrow variant="label"
                                    open={helpOpen}
                                    name={(helpOpen ? "Hide help for " : "Show help for ") + shown.title}
                                    controls="capability-help"
                                    onToggle={() => setHelpOpen(current => !current)}
                                />
                            )}
                        />
                    ) : (
                        <InterviewHeader systemName="Capabilities" nameCapitals /* (In capitals, as a Capability's name: owner, 2026-11-24 10:33 UTC+2, "Change the Word Capabilities to capitals".) */ />
                    )}

                    {/* (THE CAPABILITY'S DESCRIPTION, A POP-UP OF THE PAGE TITLE (owner, 2026-11-23 19:12 UTC+2: "This is a pop up window, not part of the chapter/systems!"):
                        dropped by the title's arrow, floating over the page under the title's rule at the page's left; it moves nothing.) */}
                    {shown && (() => {
                        const description = getCapabilityDescription(shown.title);
                        return (
                            <div className="card-title-block capability-help-block" ref={helpBlock}>
                                {helpOpen && (
                                    <div className="answer-column-questions card-title-help capability-help" id="capability-help" role="region" aria-label={"Help for " + shown.title} style={{ "--capability-color": shown.color } as React.CSSProperties}>
                                        {description?.tagline && <p className="capability-description-tagline">{description.tagline}</p>}
                                        <div className="capability-description-body">
                                            {(description?.paragraphs ?? []).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                                            {!description && <p>A description of this Capability is on its way.</p>}
                                        </div>
                                        {description?.corePrinciple && (
                                            <div className="capability-description-principle">
                                                <span className="capability-description-principle-label">Core principle</span>
                                                <p>{description.corePrinciple}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* Back to the last place worked, when there is one. */}
                    {lastPlace && (
                        <div className="workspace-continue">
                            <TextLink className="workspace-continue-button" onClick={continueWhereLeftOff}>
                                {lastPlace.prefix}: {lastPlace.label}
                            </TextLink>
                        </div>
                    )}

                    {/* (NO FRAME (owner, 2026-11-22 20:58 UTC+2: "the capability tiles do not need to be in a frame"): the six tiles, two rows of three, each the
                        master tiles' size (`--capability-side`, the side a page's 2 x 2 has in this window), centred under the title.) */}
                    <div ref={tilesBox} className="capability-tiles" style={{ "--strategy-theme-hue": hueOf(getCapabilityColor(shown?.id ?? "foundation")), ...(tileSide ? { "--capability-side": tileSide + "px" } : {}),
                        // (FOUR TILES STAND TWO BY TWO (owner, 2026-11-22 21:37 UTC+2: "If there are 4 tiles make the layout 2 x 2"), as a chapter's four; else three a row.)
                        // (And three, two by two, the fourth place empty: owner, 2026-11-23 17:28 UTC+2, "If there are 3 tiles the lay out should still be 2 x 2".)
                        ...(stackedRow ? { "--capability-across": stackedRow } : shown && shownSystems.length >= 3 && shownSystems.length <= 4 ? { "--capability-across": 2 } : {}) } as React.CSSProperties}>
                        {shown
                            ? (
                                // (The Capability's Systems, a tile each, as the Capabilities are, in its colour; IN ONE FRAME WITH NO TITLE, THE TILES FROM ITS LEFT
                                // (owner, 2026-11-23 17:28 UTC+2: "Place all the system tiles in a frame without title, so the rail system to have a proper design";
                                // "Align all the tiles to the left side"): the frame a chapter's, the rail at its edge.)
                                <div className="section-tiles-box capability-systems-frame" ref={systemsFrame} style={{ "--tile-colour": getCapabilityColor(shown.id) } as React.CSSProperties}>
                                    {/* (ITS HEADING, AS EVERY CHAPTER'S (owner, 2026-11-23 18:02 UTC+2: "Add to all of the capability chapters, SYSTEMS as title"): the chapters' own
                                        heading -- business-engagement-section-head, tiles-frame-head --.) */}
                                    <div className="business-engagement-section-head tiles-frame-head"><span className="field-group-title business-foundation-subhead">Systems</span></div>
                                    <div className="section-tiles" role="group" aria-label={shown.title + " Systems"} style={{ "--tile-colour": getCapabilityColor(shown.id) } as React.CSSProperties}>
                                        {shownSystems.length === 0
                                            ? <p className="legal-entity-empty-note">No Systems in this Capability yet.</p>
                                            : shownSystems.map(systemTile)}
                                    </div>
                                </div>
                            )
                            : <SectionTiles label="Capabilities" hue={hueOf(getCapabilityColor("foundation"))} tiles={capabilityTiles} />}
                    </div>

                </div>

            </main>

            {/* THE CAPABILITIES' ARROWS AND RAIL (owner, 2026-11-23 15:32 UTC+2: "Add Navigation Arrows and rail system (to visit and read the other capabilities"):
                on a Capability's page, the page rail at the left lists the six, this one lit, each with its own page; the arrows go to the one before and the one after,
                as a System's pages do (layout rules section 10, the page's rails). */}
            {shown && (() => {
                const at = capabilities.indexOf(shown);
                // (THE ARROWS GO ROUND (owner, 2026-11-23 17:28 UTC+2: "Their navigation arrows should work as carousel, after the first it should move to the last").)
                const before = capabilities[(at + capabilities.length - 1) % capabilities.length];
                const after = capabilities[(at + 1) % capabilities.length];
                return (
                    <div className="bullet-rails">
                        <div className="bullet-rails-row">
                            <BulletRail
                                side="left"
                                label="Capabilities"
                                items={capabilities.map(capability => ({ id: capability.id, label: capability.title }))}
                                activeId={shown.id}
                                onSelect={id => setActiveCapability(id)}
                                arrow={<PageArrow direction="previous" label={"Previous Capability: " + before.title} onClick={() => setActiveCapability(before.id)} />}
                            />
                            <BulletRail
                                side="right"
                                label="Capabilities"
                                items={[]}
                                activeId={null}
                                onSelect={() => undefined}
                                arrow={<PageArrow direction="next" label={"Next Capability: " + after.title} onClick={() => setActiveCapability(after.id)} />}
                            />
                        </div>
                    </div>
                );
            })()}

            <AppFooter
                onBack={() => shown ? setActiveCapability(null) : navigate("/")}
            />

            <CapabilityDescriptionDialog
                open={openCapability !== null}
                capability={openCapability}
                description={
                    openCapability
                        ? getCapabilityDescription(openCapability.title) ?? null
                        : null
                }
                onBack={() => setOpenCapability(null)}
            />

        </div>

    );

}
