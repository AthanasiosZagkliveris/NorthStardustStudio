import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import InterviewHeader from "../components/interview/InterviewHeader";
import InterviewProgress from "../components/InterviewProgress";
import { ReviewManager } from "../framework/application";
import { StorageService } from "../services/StorageService";
import { OrganizationService } from "../services/OrganizationService";

import "../styles/system-confirmation.css";

type ExportStep = "none" | "warning" | "options";
type CapabilityChoice = "original" | "other";

const reviewManager = new ReviewManager();

export default function Review() {
    const navigate = useNavigate();

    // This page isn't currently reachable from any route, but is
    // kept compiling: it now needs an Organization + System pair
    // (see OrganizationService / item 6) rather than one single
    // global saved session, so it falls back to the selected
    // Organization's first saved System, if any.
    const organizationId = OrganizationService.getSelected();
    const [firstSystemNumber] = organizationId
        ? OrganizationService.listSystemNumbers(organizationId)
        : [];
    const session =
        organizationId && firstSystemNumber !== undefined
            ? StorageService.loadInterview(organizationId, firstSystemNumber)
            : null;

    const [exportStep, setExportStep] = useState<ExportStep>("none");
    const [capabilityChoice, setCapabilityChoice] = useState<CapabilityChoice>("original");
    const [otherCapabilityName, setOtherCapabilityName] = useState("");
    const [includeMd, setIncludeMd] = useState(true);
    const [includePdf, setIncludePdf] = useState(false);

    if (!session) {
        return (
            <div className="conversation-page">
                <AppHeader />
                <main className="conversation-content">
                    <div className="conversation-card">
                        <h2>No Interview Session</h2>
                        <p>There is no saved interview to review yet.</p>
                    </div>
                </main>
                <AppFooter onBack={() => navigate(-1)} />
            </div>
        );
    }

    // Rebind to a non-null local: TypeScript does not carry the
    // `if (!session) return` narrowing above into the nested
    // closures below.
    const activeSession = session;

    const framework = activeSession.getFramework();
    const validation = useMemo(() => reviewManager.validate(activeSession), [activeSession]);

    const canConfirmCapability =
        capabilityChoice === "original" || otherCapabilityName.trim().length > 0;
    const canExport = includeMd || includePdf;

    function handleExportClick() {

        if (!validation.valid) {
            setExportStep("warning");
            return;
        }

        setExportStep("options");

    }

    function handleContinueToOptions() {

        setExportStep("options");

    }

    function handleFinalExport() {

        const capabilityLabel =
            capabilityChoice === "original"
                ? framework.metadata.capability
                : otherCapabilityName;

        if (includeMd) {
            reviewManager.exportMarkdown(activeSession, capabilityLabel);
        }

        if (includePdf) {
            reviewManager.exportPdf(activeSession, capabilityLabel);
        }

        setExportStep("none");

    }

    return (
        <div className="conversation-page">
            <AppHeader />
            <main className="conversation-content">
                <div className="conversation-card">
                    <InterviewHeader
                        systemNumber={String(framework.metadata.systemNumber)}
                        systemName={framework.metadata.systemName}
                    />
                    <InterviewProgress
                        current={session.getCurrentSectionIndex() + 1}
                        total={session.getTotalSections()}
                    />
                    <h2 className="interview-section-title">Validation</h2>
                    <p>
                        {validation.valid
                            ? "All Sections are complete. Ready for export."
                            : `${validation.issues.length} Section${validation.issues.length === 1 ? "" : "s"} still need${validation.issues.length === 1 ? "s" : ""} a response before this Interview can be exported.`}
                    </p>
                    {!validation.valid && (
                        <ul className="validation-issue-list">
                            {validation.issues.map(issue => (
                                <li key={issue.sectionNumber}>
                                    {issue.sectionNumber}. {issue.sectionTitle}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
            <AppFooter
                onBack={() => navigate(-1)}
                secondaryText="Back"
                onSecondary={() => navigate(-1)}
                primaryText="Export"
                onPrimary={handleExportClick}
            />

            {exportStep === "warning" && (
                <div className="confirmation-overlay">
                    <div className="confirmation-dialog">
                        <h2 className="confirmation-title">
                            Export with incomplete Sections?
                        </h2>

                        <p className="confirmation-warning-text">
                            {validation.issues.length} Section
                            {validation.issues.length === 1 ? "" : "s"} still
                            {" "}need{validation.issues.length === 1 ? "s" : ""} a response.
                        </p>

                        <div className="confirmation-actions">
                            <button
                                className="confirmation-button secondary"
                                onClick={() => setExportStep("none")}
                            >
                                Cancel
                            </button>

                            <button
                                className="confirmation-button primary"
                                onClick={handleContinueToOptions}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {exportStep === "options" && (
                <div className="confirmation-overlay">
                    <div className="confirmation-dialog export-options-dialog">
                        <h2 className="confirmation-title">
                            Export Options
                        </h2>

                        <div className="export-options-group">
                            <div className="export-options-label">Capability</div>

                            <label className="export-options-radio">
                                <input
                                    type="radio"
                                    name="capability-choice"
                                    checked={capabilityChoice === "original"}
                                    onChange={() => setCapabilityChoice("original")}
                                />
                                Original ({framework.metadata.capability})
                            </label>

                            <label className="export-options-radio">
                                <input
                                    type="radio"
                                    name="capability-choice"
                                    checked={capabilityChoice === "other"}
                                    onChange={() => setCapabilityChoice("other")}
                                />
                                Another Capability
                            </label>

                            {capabilityChoice === "other" && (
                                <input
                                    type="text"
                                    className="export-options-text-input"
                                    placeholder="Capability name"
                                    value={otherCapabilityName}
                                    onChange={(event) => setOtherCapabilityName(event.target.value)}
                                />
                            )}
                        </div>

                        <div className="export-options-group">
                            <div className="export-options-label">Format</div>

                            <label className="export-options-checkbox">
                                <input
                                    type="checkbox"
                                    checked={includeMd}
                                    onChange={(event) => setIncludeMd(event.target.checked)}
                                />
                                Markdown (.md)
                            </label>

                            <label className="export-options-checkbox">
                                <input
                                    type="checkbox"
                                    checked={includePdf}
                                    onChange={(event) => setIncludePdf(event.target.checked)}
                                />
                                PDF
                            </label>
                        </div>

                        <div className="confirmation-actions">
                            <button
                                className="confirmation-button secondary"
                                onClick={() => setExportStep("none")}
                            >
                                Cancel
                            </button>

                            <button
                                className="confirmation-button primary"
                                onClick={handleFinalExport}
                                disabled={!canExport || !canConfirmCapability}
                            >
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
