import { useLocation, useNavigate } from "react-router-dom";
import TextLink from "../components/interview/fields/TextLink.tsx";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getCapabilityIcon } from "../data/capabilityIcons";

import { capabilities, getCapabilityColor } from "../data/capabilities";
import { systems } from "../data/systems";

import { FrameworkSystem } from "../types/system";
import { Capability } from "../types/capability";

import { getCapabilityDescription } from "../framework/engine/CapabilityDescriptions.ts";

import AppHeader from "../components/shell/AppHeader";
import AppFooter from "../components/shell/AppFooter";
import OrganizationCalendarPanel from "../components/calendar/OrganizationCalendarPanel";

import CapabilityDescriptionDialog from "../components/capabilities/CapabilityDescriptionDialog";
import InterviewHeader from "../components/interview/editors/InterviewHeader";
import SectionTiles, { type SectionTile } from "../components/interview/tiles/SectionTiles";
import Tile from "../components/interview/tiles/Tile";
import { TileTitle } from "../components/interview/tiles/TileParts";
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
import { continuePlace, systemProgress, type ContinuePlace } from "../services/ProgressService";
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

    useEffect(() => {

        setSystemStatuses(organizationId
            ? Object.fromEntries(
                systems.map(system => [system.number, systemProgress(organizationId, system)])
            )
            : {});

        // filteredSystems follows activeCapability.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organizationId]);

    // Escape acts as "Back" everywhere in the app: close whichever
    // popup/sliding window is currently open first (the Capability
    // description, then the Navigator rail itself), and only once
    // nothing is open anymore does it fall through to the same
    // navigation the footer's own "Back" link performs.
    useEffect(() => {

        function handleKeyDown(event: KeyboardEvent) {

            if (event.key !== "Escape") {
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
    useLayoutEffect(() => {
        const fit = () => {
            const box = tilesBox.current;
            if (!box) {
                return;
            }
            const top = box.getBoundingClientRect().top + window.scrollY;
            const footer = document.querySelector<HTMLElement>(".workspace-footer")?.offsetHeight ?? 64;
            setTileSide(Math.max(150, Math.floor((window.innerHeight - top - footer - 12 - 12 - 12 - 12) / 2)));
        };
        fit();
        window.addEventListener("resize", fit);
        return () => window.removeEventListener("resize", fit);
    }, []);

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
            // (Its icon before its title, on its line: owner, 2026-11-22 21:10 UTC+2, "The symbols next to their titles".)
            titleIcon: getCapabilityIcon(capabilities.indexOf(capability) + 1),
            empty: own.length === 0,
            items: own.map(system => system.title),
            // (Each System's own symbol before its name, smaller than the title's: owner, 2026-11-22 21:10 UTC+2, "Add symbols to the systems too, in smaller size".)
            itemMarks: own.map(system => ({ icon: getSystemIcon(system.number) || undefined })),
            // (EACH SYSTEM ON THE TILE IS A LINK TO IT (owner, 2026-11-22 21:00 UTC+2: "Fix links"), as a line of every tile is to what it names.)
            links: own.map(system => ({ go: () => handleSystemSelection(system) })),
            // (Pressed, it opens its Capability's page: press, not a dialog.)
            press: () => setActiveCapability(capability.id),
            content: () => null
        };
    });

    /** A System's tile on its Capability's page. */
    function systemTile(system: FrameworkSystem) {
        const status = systemStatuses[system.number];
        // (A System's tile as the list had it (owner, 2026-11-22 21:00 UTC+2: "Fix links, text and tile sizes"): its number and name, its
        // status by its shape and word (status-shape.css), its icon at the foot; the dialog's tile size.)
        return (
            <Tile
                key={system.id}
                frame={{ className: "section-tile-slot capability-system-slot" }}
                className="section-tile"
                aria-label={String(system.number).padStart(2, "0") + ". " + system.title + (status ? ", " + PAGE_STATUS_WORDS[status] : "")}
                face={(
                    <>
                        {/* (Its number and name, whole, on as many lines as it takes; "System" is the dialog's word for all of them, so a tile says the name
                            alone -- "07. Product Development" -- and its accessible name says it whole.) */}
                        <TileTitle className="section-tile-title-broken">
                            {getSystemIcon(system.number) && <img className="section-tile-title-icon" src={getSystemIcon(system.number)} alt="" />}
                            {(() => {
                                // (A name of two words or more on two lines, broken before its last word: "07. Product / Development".)
                                const name = system.title.replace(/ System$/, "");
                                const cut = name.lastIndexOf(" ");
                                const number = String(system.number).padStart(2, "0") + ". ";
                                return cut > 0 ? <>{number + name.slice(0, cut)}<br />{name.slice(cut + 1)}</> : number + name;
                            })()}
                        </TileTitle>
                        {status && (
                            <span className="system-status capability-system-status">
                                <span className="status-shape" data-status={status} aria-hidden="true" />
                                <span className="system-status-word">{PAGE_STATUS_WORDS[status]}</span>
                            </span>
                        )}
                    </>
                )}
                onClick={() => handleSystemSelection(system)}
            />
        );
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

                <div className="conversation-card">

                    {/* CAPABILITIES AS MASTER TILES (owner, 2026-11-22 20:35 UTC+2: "Rename the title to capabilities. Make Master Tiles (Capabilities to their related
                        colour), and each Master Tile will have its own Tiles (systems)"): the page's title over its rule as on a System's page, one frame of a tile for each
                        Capability in its own colour, listing its Systems; pressed, its dialog holds a tile for each System, with its status, that opens it. */}
                    {shown ? (
                        <InterviewHeader
                            systemName="Capabilities"
                            pageTitle={shown.title}
                            pageTitleCapitals
                            icon={getCapabilityIcon(capabilities.indexOf(shown) + 1)}
                            note={(
                                <button
                                    type="button"
                                    className="info-note-button capability-page-info"
                                    aria-label={shown.title + ": what this means"}
                                    aria-haspopup="dialog"
                                    onClick={() => setOpenCapability(shown)}
                                >
                                    i
                                </button>
                            )}
                        />
                    ) : (
                        <InterviewHeader systemName="Capabilities" />
                    )}

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
                    <div ref={tilesBox} className="capability-tiles" style={{ "--strategy-theme-hue": hueOf(getCapabilityColor(shown?.id ?? "foundation")), ...(tileSide ? { "--capability-side": tileSide + "px" } : {}) } as React.CSSProperties}>
                        {shown
                            ? (
                                // (The Capability's Systems, a tile each, as the Capabilities are: two rows of three at the master tiles' size, in its colour.)
                                <div className="section-tiles-box">
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
