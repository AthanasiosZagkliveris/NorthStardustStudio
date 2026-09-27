import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { capabilities, getCapabilityColor } from "../data/capabilities";
import { systems } from "../data/systems";

import { FrameworkSystem } from "../types/system";

import { getCapabilityDescription } from "../framework/engine/CapabilityDescriptions.ts";

import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import OrganizationCalendarPanel from "../components/OrganizationCalendarPanel";

import CapabilityList from "../components/CapabilityList";
import SystemList from "../components/SystemList";

import { OrganizationService } from "../services/OrganizationService";

import "../styles/workspace.css";

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
    const [activeCapability, setActiveCapability] =
        useState<string | null>(() => location.state?.capability ?? null);

    // The Framework Navigator rail (Calendar/Capabilities/System)
    // reports its own open/closed state up here so Escape can close
    // it before falling through to Back -- see the keydown effect
    // further down. `railCloseSignal` is a counter (not a boolean) bumped
    // to force the rail closed from here; the rail's own effect
    // reacts to it changing, not to any particular value.
    const [railOpen, setRailOpen] = useState(false);
    const [railCloseSignal, setRailCloseSignal] = useState(0);

    const filteredSystems = activeCapability
        ? systems.filter(
              system => system.capability === activeCapability
          )
        : [];

    const capabilityTitle =
        capabilities.find(
            capability => capability.id === activeCapability
        )?.title ?? "";

    const activeDescription = capabilityTitle
        ? getCapabilityDescription(capabilityTitle) ?? null
        : null;

    const activeCapabilityColor = getCapabilityColor(activeCapability);

    // Escape acts as "Back" everywhere in the app: close the
    // Navigator rail first, then act as Back -- only once the rail
    // isn't open anymore does it fall through to the same
    // navigation the footer's own "Back" link performs.
    useEffect(() => {

        function handleKeyDown(event: KeyboardEvent) {

            if (event.key !== "Escape") {
                return;
            }

            if (railOpen) {
                setRailCloseSignal(previous => previous + 1);
                return;
            }

            navigate("/");

        }

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);

    }, [railOpen, navigate]);

    // Opens the System straight away and resumes wherever the user
    // last left it (Conversation.tsx's loading effect restores the
    // saved position). There used to be a "Begin …?" confirmation
    // here that also reset the position to Section 1; without the
    // dialog a reset would silently lose the user's place, so the
    // saved position is simply kept.
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

        <div className="workspace">

            <AppHeader organizationName={organizationName} />

            <OrganizationCalendarPanel
                organizationId={organizationId}
                capabilities={capabilities}
                systems={systems}
                onCapabilitySelect={setActiveCapability}
                onSystemOpen={handleSystemSelection}
                onOpenTask={openTask}
                onOpenChange={setRailOpen}
                closeSignal={railCloseSignal}
            />

            <div className="workspace-main">

                <div className="workspace-center">

                    <div className="workspace-message">

                        <h1 className="workspace-title">

                            Select a Framework System

                        </h1>

                    </div>

                    <div className="workspace-content">

                        <aside>

                            <h2 className="workspace-subtitle">

                                Capabilities

                            </h2>

                            <CapabilityList
                                capabilities={capabilities}
                                activeCapability={activeCapability}
                                onActiveCapabilityChange={setActiveCapability}
                            />

                        </aside>

                        <section>

                            <h2
                                className="workspace-current-capability"
                                style={{ color: activeCapability ? activeCapabilityColor : undefined }}
                            >

                                {capabilityTitle}

                            </h2>

                            {/* The Capability's description, inline rather than
                                in a popup that opened on every click. The
                                tagline is always visible; the full text is
                                one native disclosure away. */}
                            {activeDescription && (
                                <div className="workspace-capability-description">
                                    <p className="workspace-capability-tagline">
                                        {activeDescription.tagline}
                                    </p>
                                    <details className="workspace-capability-details">
                                        <summary>About {capabilityTitle}</summary>
                                        {activeDescription.paragraphs.map((paragraph, index) => (
                                            <p key={index}>{paragraph}</p>
                                        ))}
                                        {activeDescription.corePrinciple && (
                                            <p className="workspace-capability-principle">
                                                {activeDescription.corePrinciple}
                                            </p>
                                        )}
                                    </details>
                                </div>
                            )}

                            <SystemList
                                systems={filteredSystems}
                                color={activeCapability ? activeCapabilityColor : undefined}
                                onSystemClick={handleSystemSelection}
                            />

                            {/* What the four Foundation Systems add up to. */}
                            {activeCapability === "foundation" && (
                                <div className="workspace-documents">
                                    <p className="workspace-documents-text">
                                        Turn the Foundation answers into a Business Plan, a Business Model Canvas and a Financial Forecast.
                                    </p>
                                    <button
                                        type="button"
                                        className="workspace-documents-button"
                                        onClick={() => navigate("/documents")}
                                    >
                                        Business Documents
                                    </button>
                                </div>
                            )}

                        </section>

                    </div>

                </div>

            </div>

            <AppFooter
                onBack={() => navigate("/")}
            />

        </div>

    );

}
