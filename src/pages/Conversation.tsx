import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import InterviewHeader from "../components/interview/InterviewHeader";
import InterviewProgress from "../components/InterviewProgress";
import InterviewSection from "../components/InterviewSection";
import AnswerRenderer from "../components/interview/AnswerRenderer";

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
            // Resume a previously saved Interview Session for this
            // same System (e.g. after a page reload), rather than
            // discarding the user's progress. A saved session for a
            // *different* System is ignored so switching Systems
            // always starts a fresh Interview.
            const savedSession = StorageService.loadInterview();

            const loadedSession =
                savedSession &&
                savedSession.getFramework().metadata.systemNumber === system.number
                    ? savedSession
                    : interviewManager.create(system.id);

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

    function goToIntroduction() {

        if (!session) {
            return;
        }

        session.viewIntroduction();
        persistAndRedraw(session);

    }

    function handleAnswerChange(value: unknown) {

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
                        systemNumber={String(framework.metadata.systemNumber)}
                        systemName={framework.metadata.systemName}
                    />

                    {showIntroduction ? (
                        <section className="interview-section">
                            <div
                                className="interview-block-content"
                                style={{ whiteSpace: "pre-line" }}
                            >
                                {introduction.introductionText}
                            </div>

                            <div className="interview-nav">
                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={startInterview}
                                >
                                    Start Interview
                                </button>
                            </div>
                        </section>
                    ) : (
                        <>
                            <InterviewProgress
                                current={session.getCurrentSectionIndex() + 1}
                                total={session.getTotalSections()}
                            />

                            <InterviewSection section={currentSection} />

                            <div className="answer-divider" />

                            <AnswerRenderer
                                definition={currentSection.answer}
                                value={session.getCurrentResponse()}
                                onChange={handleAnswerChange}
                            />

                            <div className="interview-nav">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        session.isFirstSection()
                                            ? goToIntroduction
                                            : previousSection
                                    }
                                >
                                    {session.isFirstSection() ? "Introduction" : "Previous"}
                                </button>

                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={nextSection}
                                >
                                    {session.isLastSection() ? "Finish" : "Next"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <AppFooter
                onBack={() => navigate("/assistant")}
            />
        </div>
    );
}
