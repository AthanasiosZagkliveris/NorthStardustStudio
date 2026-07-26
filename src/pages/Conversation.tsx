import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import InterviewHeader from "../components/InterviewHeader";
import InterviewProgress from "../components/InterviewProgress";
import InterviewSection from "../components/InterviewSection";
import InterviewInput from "../components/InterviewInput";

import { InterviewManager } from "../framework/application";
import { InterviewSession } from "../framework/interview";

import { StorageService } from "../services/StorageService";

import "../styles/conversation.css";
import "../styles/conversation-layout.css";

const interviewManager = new InterviewManager();

export default function Conversation() {

    const location = useLocation();
    const navigate = useNavigate();

    const system = location.state?.system;

    const [session, setSession] = useState<InterviewSession | null>(null);
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [, refresh] = useState(0);

    useEffect(() => {

        if (!system) {
            setLoadingError("No Framework System selected.");
            return;
        }

        try {
            const loadedSession = interviewManager.create(system.id);
            setSession(loadedSession);
        } catch (error) {
            setLoadingError(
                error instanceof Error
                    ? error.message
                    : "Failed to load Framework."
            );
        }

    }, [system]);

    function redraw() {
        refresh(value => value + 1);
    }

    function persistAndRedraw(currentSession: InterviewSession) {
        StorageService.saveInterview(currentSession);
        redraw();
    }

    function startInterview() {

        if (!session) {
            return;
        }

        session.startInterview();
        persistAndRedraw(session);

    }

    function nextSection() {

        if (!session) {
            return;
        }

        if (session.isLastSection()) {
            StorageService.saveInterview(session);
            navigate("/review");
            return;
        }

        session.nextSection();
        persistAndRedraw(session);

    }

    function previousSection() {

        if (!session) {
            return;
        }

        if (session.previousSection()) {
            persistAndRedraw(session);
        }

    }

    function handleAnswerChange(value: string) {

        if (!session) {
            return;
        }

        session.saveCurrentResponse(value);
        persistAndRedraw(session);

    }

    if (loadingError) {
        return <div>{loadingError}</div>;
    }

    if (!session) {
        return <div>Loading...</div>;
    }

    const framework = session.getFramework();
    const introduction = framework.introduction;
    const currentSection = session.getCurrentSection();

    const showIntroduction = !session.hasStartedInterview();

    return (
        <div className="conversation-page">
            <AppHeader />

            <main className="conversation-content">
                <div className="conversation-card">
                    <InterviewHeader
                        systemName={framework.metadata.systemName}
                        capability={framework.metadata.capability}
                    />

                    {showIntroduction ? (
                        <section className="interview-section">
                            <h2 className="interview-section-title">
                                {introduction.title}
                            </h2>

                            {introduction.capability && (
                                <p className="conversation-message">
                                    <strong>Capability:</strong>{" "}
                                    {introduction.capability}
                                </p>
                            )}

                            {introduction.guidingQuestion && (
                                <p className="conversation-message">
                                    <strong>Guiding Question:</strong>{" "}
                                    {introduction.guidingQuestion}
                                </p>
                            )}

                            {introduction.systemScope && (
                                <p className="conversation-message">
                                    <strong>Scope:</strong>{" "}
                                    {introduction.systemScope}
                                </p>
                            )}

                            {introduction.sections.map(section => (
                                <InterviewSection
                                    key={section.number}
                                    section={section}
                                />
                            ))}
                        </section>
                    ) : (
                        <>
                            <InterviewProgress
                                current={session.getCurrentSectionIndex() + 1}
                                total={session.getTotalSections()}
                            />

                            <InterviewSection section={currentSection} />

                            <InterviewInput
                                value={session.getCurrentResponse()}
                                onChange={handleAnswerChange}
                            />
                        </>
                    )}
                </div>
            </main>

            <AppFooter
                onBack={() => navigate("/assistant")}
                secondaryText={
                    showIntroduction ? undefined : "Previous"
                }
                onSecondary={
                    showIntroduction ? undefined : previousSection
                }
                secondaryDisabled={
                    showIntroduction || session.isFirstSection()
                }
                primaryText={
                    showIntroduction
                        ? "Start Interview"
                        : session.isLastSection()
                            ? "Finish"
                            : "Next"
                }
                onPrimary={
                    showIntroduction ? startInterview : nextSection
                }
            />
        </div>
    );
}
