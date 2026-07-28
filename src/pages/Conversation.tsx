import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import InterviewHeader from "../components/interview/InterviewHeader";
import InterviewProgress from "../components/InterviewProgress";
import InterviewSection from "../components/InterviewSection";
import AnswerRenderer from "../components/interview/AnswerRenderer";

import { InterviewManager, ReviewManager } from "../framework/application";
import { InterviewSession } from "../framework/interview";
import { ValidationIssue } from "../framework/model";

import { StorageService } from "../services/StorageService";

import "../styles/conversation.css";
import "../styles/conversation-layout.css";
import "../styles/system-confirmation.css";

const interviewManager = new InterviewManager();
const reviewManager = new ReviewManager();

type ExportStep = "none" | "warning" | "options";
type CapabilityChoice = "original" | "other";

/**
 * Splits a block of introduction text into one
 * sentence per entry, so the introduction can be
 * rendered as one short paragraph per sentence
 * instead of one large block of text.
 */
function splitIntoSentences(text: string): string[] {

    const collapsed = text.replace(/\s+/g, " ").trim();

    if (collapsed.length === 0) {
        return [];
    }

    const matches = collapsed.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g);

    if (!matches) {
        return [collapsed];
    }

    return matches
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 0);

}

export default function Conversation() {

    const location = useLocation();
    const navigate = useNavigate();

    const system = location.state?.system;

    const [session, setSession] = useState<InterviewSession | null>(null);
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [, refresh] = useState(0);

    // Export flow -- replaces the old, separate Review/Validation
    // page. Pressing "Finish" on the last Section validates the
    // Interview inline and opens one of these popups instead of
    // navigating away.
    const [exportStep, setExportStep] = useState<ExportStep>("none");
    const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
    const [capabilityChoice, setCapabilityChoice] = useState<CapabilityChoice>("original");
    const [otherCapabilityName, setOtherCapabilityName] = useState("");
    const [includeMd, setIncludeMd] = useState(true);
    const [includePdf, setIncludePdf] = useState(false);

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

    // Every Section/Introduction change should present the new
    // page starting at its top, rather than keeping whatever
    // scroll position the previous (possibly taller) Section left
    // the window at.
    function scrollToTop() {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    function startInterview() {

        if (!session) {
            return;
        }

        session.startInterview();
        persistAndRedraw(session);
        scrollToTop();

    }

    function nextSection() {

        if (!session) {
            return;
        }

        if (session.isLastSection()) {

            StorageService.saveInterview(session);

            const validation = reviewManager.validate(session);

            if (!validation.valid) {
                setValidationIssues(validation.issues);
                setExportStep("warning");
            } else {
                setExportStep("options");
            }

            return;

        }

        session.nextSection();
        persistAndRedraw(session);
        scrollToTop();

    }

    function previousSection() {

        if (!session) {
            return;
        }

        if (session.previousSection()) {
            persistAndRedraw(session);
            scrollToTop();
        }

    }

    function goToIntroduction() {

        if (!session) {
            return;
        }

        session.viewIntroduction();
        persistAndRedraw(session);
        scrollToTop();

    }

    function handleAnswerChange(value: unknown) {

        if (!session) {
            return;
        }

        session.saveCurrentResponse(value);
        persistAndRedraw(session);

    }

    function handleContinueToOptions() {

        setExportStep("options");

    }

    function handleFinalExport() {

        if (!session) {
            return;
        }

        const framework = session.getFramework();

        const capabilityLabel =
            capabilityChoice === "original"
                ? framework.metadata.capability
                : otherCapabilityName;

        if (includeMd) {
            reviewManager.exportMarkdown(session, capabilityLabel);
        }

        if (includePdf) {
            reviewManager.exportPdf(session, capabilityLabel);
        }

        setExportStep("none");

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

    const canConfirmCapability =
        capabilityChoice === "original" || otherCapabilityName.trim().length > 0;
    const canExport = includeMd || includePdf;

    return (
        <div className="conversation-page">
            <AppHeader />

            <main className="conversation-content">
                <div className="conversation-card">
                    <InterviewHeader
                        systemNumber={String(framework.metadata.systemNumber)}
                        systemName={framework.metadata.systemName}
                        capabilityId={system?.capability}
                    />

                    {showIntroduction ? (
                        <section className="interview-section">
                            <div className="interview-block-content">
                                {splitIntoSentences(introduction.introductionText).map((sentence, index) => (
                                    <p key={index} className="intro-sentence">
                                        {sentence}
                                    </p>
                                ))}
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
                            <InterviewSection section={currentSection} />

                            <InterviewProgress
                                current={session.getCurrentSectionIndex() + 1}
                                total={session.getTotalSections()}
                            />

                            <AnswerRenderer
                                key={currentSection.number}
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

            {exportStep === "warning" && (
                <div className="confirmation-overlay">
                    <div className="confirmation-dialog">
                        <h2 className="confirmation-title">
                            Sections Incomplete
                        </h2>

                        <ul className="confirmation-warning-list">
                            {validationIssues.map(issue => (
                                <li key={issue.sectionNumber}>
                                    {issue.sectionNumber}. {issue.sectionTitle}
                                </li>
                            ))}
                        </ul>

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
