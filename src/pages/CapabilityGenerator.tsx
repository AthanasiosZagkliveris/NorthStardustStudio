import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import CapabilityInput from "../components/CapabilityInput";

import "../styles/capability-generator.css";

export default function CapabilityGenerator() {

    const navigate = useNavigate();

    const [requestedCapability, setRequestedCapability] = useState("");

    function handleBack() {

        navigate("/");

    }

    function handleAnalyze() {

        if (!requestedCapability.trim()) return;

        // Temporary
        console.log("Requested Capability:", requestedCapability);

        // Next phase:
        // navigate("/generator/analysis");

    }

    return (

        <div className="capability-generator">

            <AppHeader />

            <main className="capability-main">

                <CapabilityInput

                    value={requestedCapability}

                    onChange={setRequestedCapability}

                />

            </main>

            <AppFooter

                onBack={handleBack}

                primaryText="Analyze Capability"

                onPrimary={handleAnalyze}

                primaryDisabled={!requestedCapability.trim()}

            />

        </div>

    );

}