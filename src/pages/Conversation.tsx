import { useEffect, useState } from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";

import InterviewHeader from "../components/InterviewHeader";
import InterviewProgress from "../components/InterviewProgress";
import InterviewSection from "../components/InterviewSection";
import InterviewInput from "../components/InterviewInput";

import { InterviewManager } from "../framework/application";
import { InterviewSession } from "../framework/interview";

import "../styles/conversation.css";
import "../styles/conversation-layout.css";

/**
 * Application Interview Manager.
 */
const interviewManager =
    new InterviewManager();

export default function Conversation() {

    const location =
        useLocation();

    const navigate =
        useNavigate();

    const system =
        location.state?.system;

    const [session, setSession] =
        useState<InterviewSession | null>(
            null
        );

    const [loadingError, setLoadingError] =
        useState<string | null>(
            null
        );

    /**
     * Used only to force a React
     * re-render after the Interview
     * Session changes.
     */
    const [, refresh] =
        useState(0);

    useEffect(() => {

        if (!system) {

            setLoadingError(

                "No Framework System selected."

            );

            return;

        }

        try {

            const interview =
                interviewManager.create(
                    system.id
                );

            setSession(
                interview
            );

        }
        catch (error) {

            setLoadingError(

                error instanceof Error

                    ? error.message

                    : "Failed to load Framework."

            );

        }

    }, [system]);

    function refreshView() {

        refresh(

            value => value + 1

        );

    }

    function updateResponse(
        value: string
    ) {

        if (!session)
            return;

        session.saveCurrentResponse(
            value
        );

        refreshView();

    }

    function previousSection() {

        if (!session)
            return;

        if (!session.previousSection())
            return;

        refreshView();

    }

    function nextSection() {

        if (!session)
            return;

        if (session.isLastSection()) {

            navigate(

                "/review",

                {

                    state: {

                        session

                    }

                }

            );

            return;

        }

        session.nextSection();

        refreshView();

    }

    if (loadingError) {

        return (

            <div className="conversation-page">

                <AppHeader />

                <main className="conversation-content">

                    <div className="conversation-card">

                        <h2>

                            Unable to Load Framework

                        </h2>

                        <p>

                            {loadingError}

                        </p>

                    </div>

                </main>

                <AppFooter

                    onBack={() =>

                        navigate(-1)

                    }

                />

            </div>

        );

    }

    if (!session) {

        return (

            <div className="conversation-page">

                <AppHeader />

                <main className="conversation-content">

                    <div className="conversation-card">

                        <p>

                            Loading Framework...

                        </p>

                    </div>

                </main>

            </div>

        );

    }

    const framework =
        session.getFramework();

    const currentSection =
        session.getCurrentSection();

    return (

        <div className="conversation-page">

            <AppHeader />

            <main className="conversation-content">

                <div className="conversation-card">

                    <InterviewHeader

                        systemName={
                            framework.metadata.systemName
                        }

                        capability={
                            framework.metadata.capability
                        }

                    />

                    <InterviewProgress

                        current={
                            session.getCurrentSectionIndex() + 1
                        }

                        total={
                            session.getTotalSections()
                        }

                    />

                    <InterviewSection

                        section={
                            currentSection
                        }

                    />

                    <InterviewInput

                        value={
                            session.getCurrentResponse()
                        }

                        onChange={
                            updateResponse
                        }

                    />

                </div>

            </main>

            <AppFooter

                onBack={() =>

                    navigate(-1)

                }

                secondaryText="Previous"

                onSecondary={
                    previousSection
                }

                secondaryDisabled={
                    session.isFirstSection()
                }

                primaryText={
                    session.isLastSection()

                        ? "Finish"

                        : "Next"
                }

                onPrimary={
                    nextSection
                }

            />

        </div>

    );

}