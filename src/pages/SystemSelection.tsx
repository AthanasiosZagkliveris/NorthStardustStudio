import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { capabilities, getCapabilityColor } from "../data/capabilities";
import { systems } from "../data/systems";

import { FrameworkSystem } from "../types/system";
import { Capability } from "../types/capability";

import { getCapabilityDescription } from "../framework/engine/CapabilityDescriptions.ts";

import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import OrganizationCalendarPanel from "../components/OrganizationCalendarPanel";

import CapabilityList from "../components/CapabilityList";
import SystemList from "../components/SystemList";
import SystemConfirmation from "../components/SystemConfirmation";
import CapabilityDescriptionDialog from "../components/CapabilityDescriptionDialog";

import { OrganizationService } from "../services/OrganizationService";
import { StorageService } from "../services/StorageService";

import "../styles/workspace.css";

export default function SystemSelection() {

    const navigate = useNavigate();

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

    const [activeCapability, setActiveCapability] =
        useState<string | null>(null);

    const [selectedSystem, setSelectedSystem] =
        useState<FrameworkSystem | null>(null);

    const [confirmationOpen, setConfirmationOpen] =
        useState(false);

    const [openCapability, setOpenCapability] =
        useState<Capability | null>(null);

    // The Framework Navigator rail (Calendar/Capabilities/System)
    // reports its own open/closed state up here so Escape can fold
    // "close the rail" into the same precedence chain as the two
    // dialogs below, without the rail needing to know anything
    // about Escape/Back itself -- see the keydown effect further
    // down. `railCloseSignal` is a counter (not a boolean) bumped
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

    const activeCapabilityColor = getCapabilityColor(activeCapability);

    // Escape acts as "Back" everywhere in the app: close whichever
    // popup/sliding window is currently open first (the "Start
    // Interview" confirmation, then the Capability description,
    // then the Navigator rail itself), and only once nothing is
    // open anymore does it fall through to the same navigation the
    // footer's own "Back" link performs.
    useEffect(() => {

        function handleKeyDown(event: KeyboardEvent) {

            if (event.key !== "Escape") {
                return;
            }

            if (confirmationOpen) {
                setConfirmationOpen(false);
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

            navigate("/");

        }

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);

    }, [confirmationOpen, openCapability, railOpen, navigate]);

    function handleSystemSelection(system: FrameworkSystem) {

        setSelectedSystem(system);

        setConfirmationOpen(true);

    }

    function startInterview() {

        if (!selectedSystem) {
            return;
        }

        setConfirmationOpen(false);

        // After the very first time working through a System, every
        // later "Forward" here should land back on Section 1 -- not
        // wherever the user happened to leave off last time. This
        // only resets the CURRENT position; every Section's saved
        // answer is left exactly as it was. (A plain page reload
        // while already inside the interview does not go through
        // this function, so it still resumes exactly where the user
        // left off -- see Conversation.tsx's loading effect.)
        const organizationId = OrganizationService.getSelected();

        if (organizationId) {

            const existing = StorageService.loadInterview(organizationId, selectedSystem.number);

            if (existing && existing.hasStartedInterview()) {
                existing.goToSection(0);
                StorageService.saveInterview(organizationId, existing);
            }

        }

        navigate("/introduction", {

            state: {
                system: selectedSystem
            }

        });

    }

    // The Calendar's own "Open →" link on a task (see
    // OrganizationCalendarPanel.tsx / CalendarTaskService.ts) --
    // jumps straight into that System's already-existing interview
    // session, landed on the specific Section the task actually
    // came from. Deliberately NOT the same path as `startInterview`
    // above: this must resume the existing session in place (so
    // every other Section's saved answer, and the current position
    // once the person navigates away again, is left untouched) --
    // `startInterview` resets to Section 1 on purpose, which would
    // be wrong here. `targetSectionNumber` is read by Conversation.
    // tsx's own loading effect.
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
                onCapabilityOpen={setOpenCapability}
                onCapabilitySelect={setActiveCapability}
                onSystemOpen={handleSystemSelection}
                onOpenTask={openTask}
                onOpenChange={setRailOpen}
                closeSignal={railCloseSignal}
                suppressClose={confirmationOpen || openCapability !== null}
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
                                onCapabilityOpen={setOpenCapability}
                            />

                        </aside>

                        <section>

                            <h2
                                className="workspace-current-capability"
                                style={{ color: activeCapability ? activeCapabilityColor : undefined }}
                            >

                                {capabilityTitle}

                            </h2>

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

            <SystemConfirmation
                open={confirmationOpen}
                organizationName={organizationName}
                systemTitle={selectedSystem?.title ?? ""}
                onCancel={() => setConfirmationOpen(false)}
                onStart={startInterview}
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
