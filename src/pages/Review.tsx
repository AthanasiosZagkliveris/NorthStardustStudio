import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import InterviewHeader from "../components/interview/InterviewHeader";
import InterviewProgress from "../components/InterviewProgress";
import { ReviewManager } from "../framework/application";
import { StorageService } from "../services/StorageService";

import "../styles/system-confirmation.css";

const reviewManager = new ReviewManager();

export default function Review() {
    const navigate = useNavigate();
    const session = StorageService.loadInterview();
    const [showExportWarning, setShowExportWarning] = useState(false);

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

    function handleExportClick() {

        if (!validation.valid) {
            setShowExportWarning(true);
            return;
        }

        reviewManager.exportMarkdown(activeSession);

    }

    function handleExportAnyway() {

        setShowExportWarning(false);
        reviewManager.exportMarkdown(activeSession);

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

            {showExportWarning && (
                <div className="confirmation-overlay">
                    <div className="confirmation-dialog">
                        <h2 className="confirmation-title">
                            Export with incomplete Sections?
                        </h2>

                        <p>
                            {validation.issues.length} Section
                            {validation.issues.length === 1 ? "" : "s"} still
                            {" "}need{validation.issues.length === 1 ? "s" : ""} a
                            response. You can export this Interview anyway.
                        </p>

                        <div className="confirmation-actions">
                            <button
                                className="confirmation-button secondary"
                                onClick={() => setShowExportWarning(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="confirmation-button primary"
                                onClick={handleExportAnyway}
                            >
                                Export Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
