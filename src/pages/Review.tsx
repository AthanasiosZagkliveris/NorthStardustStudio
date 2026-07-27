import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import InterviewHeader from "../components/interview/InterviewHeader";
import InterviewProgress from "../components/InterviewProgress";
import { ReviewManager } from "../framework/application";
import { StorageService } from "../services/StorageService";

const reviewManager = new ReviewManager();

export default function Review() {
    const navigate = useNavigate();
    const session = StorageService.loadInterview();

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

    const framework = session.getFramework();
    const validation = useMemo(() => reviewManager.validate(session), [session]);

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
                onPrimary={() => reviewManager.exportMarkdown(session)}
                primaryDisabled={!validation.valid}
            />
        </div>
    );
}
