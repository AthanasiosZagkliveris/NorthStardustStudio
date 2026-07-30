import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { capabilities, getCapabilityColor } from "../data/capabilities";
import { systems } from "../data/systems";

import { FrameworkSystem } from "../types/system";
import { Capability } from "../types/capability";

import { getCapabilityDescription } from "../framework/engine/CapabilityDescriptions.ts";

import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";

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

    useEffect(() => {

        const organizationId = OrganizationService.getSelected();

        if (!organizationId) {
            navigate("/");
            return;
        }

        setOrganizationName(OrganizationService.getSummary(organizationId)?.name ?? "");

    }, [navigate]);

    const [activeCapability, setActiveCapability] =
        useState<string | null>(null);

    const [selectedSystem, setSelectedSystem] =
        useState<FrameworkSystem | null>(null);

    const [confirmationOpen, setConfirmationOpen] =
        useState(false);

    const [openCapability, setOpenCapability] =
        useState<Capability | null>(null);

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

    return (

        <div className="workspace">

            <AppHeader organizationName={organizationName} />

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
