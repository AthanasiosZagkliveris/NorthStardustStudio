import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { capabilities } from "../data/capabilities";
import { systems } from "../data/systems";

import { FrameworkSystem } from "../types/system";

import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";

import CapabilityList from "../components/CapabilityList";
import SystemList from "../components/SystemList";
import SystemConfirmation from "../components/SystemConfirmation";

import "../styles/workspace.css";

export default function SystemSelection() {

    const navigate = useNavigate();

    const [activeCapability, setActiveCapability] =
        useState<string | null>(null);

    const [selectedSystem, setSelectedSystem] =
        useState<FrameworkSystem | null>(null);

    const [confirmationOpen, setConfirmationOpen] =
        useState(false);

    const filteredSystems = activeCapability
        ? systems.filter(
              system => system.capability === activeCapability
          )
        : [];

    const capabilityTitle =
        capabilities.find(
            capability => capability.id === activeCapability
        )?.title ?? "";

    function handleSystemSelection(system: FrameworkSystem) {

        setSelectedSystem(system);

        setConfirmationOpen(true);

    }

    function startInterview() {

        if (!selectedSystem)
            return;

        navigate("/conversation", {

            state: {

                system: selectedSystem

            }

        });

    }

    return (

        <div className="workspace">

            <AppHeader />

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

                            <h2 className="workspace-current-capability">

                                {capabilityTitle}

                            </h2>

                            <SystemList
                                systems={filteredSystems}
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

                systemTitle={selectedSystem?.title ?? ""}

                onCancel={() => setConfirmationOpen(false)}

                onStart={startInterview}

            />

        </div>

    );

}