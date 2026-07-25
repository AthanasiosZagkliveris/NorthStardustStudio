import { useMemo } from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";

import { ReviewManager } from "../framework/application";
import { InterviewSession } from "../framework/interview";

import InterviewHeader from "../components/InterviewHeader";
import InterviewProgress from "../components/InterviewProgress";

/**
 * Application Review Manager.
 */
const reviewManager =
    new ReviewManager();

export default function Review() {

    const navigate =
        useNavigate();

    const location =
        useLocation();

    const state =
        location.state as {

            session?: InterviewSession;

        } | undefined;

    if (!state?.session) {

        return (

            <div className="conversation-page">

                <AppHeader />

                <main className="conversation-content">

                    <div className="conversation-card">

                        <h2>

                            No Interview Session

                        </h2>

                        <p>

                            Unable to review the interview.

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

    const session =
        state.session;

    const framework =
        session.getFramework();

    const validation =
        useMemo(

            () =>

                reviewManager.validate(
                    session
                ),

            [session]

        );

    function exportInterview() {

        reviewManager.exportMarkdown(
            session
        );

    }

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

                    <hr />

                    {

                        validation.valid ? (

                            <div>

                                <h2>

                                    Validation

                                </h2>

                                <p>

                                    ✓ This Framework is ready for export.

                                </p>

                            </div>

                        ) : (

                            <div>

                                <h2>

                                    Validation Issues

                                </h2>

                                <p>

                                    Complete the following sections before exporting.

                                </p>

                                <ul>

                                    {

                                        validation.issues.map(

                                            issue => (

                                                <li

                                                    key={
                                                        issue.sectionNumber
                                                    }

                                                >

                                                    <strong>

                                                        {

                                                            issue.sectionNumber

                                                        }.

                                                        {" "}

                                                        {

                                                            issue.sectionTitle

                                                        }

                                                    </strong>

                                                </li>

                                            )

                                        )

                                    }

                                </ul>

                            </div>

                        )

                    }

                    <hr />

                    {

                        session.getSections().map(

                            section => (

                                <section

                                    key={
                                        section.number
                                    }

                                    style={{

                                        marginBottom: "3rem"

                                    }}

                                >

                                    <h2>

                                        {

                                            section.number

                                        }.

                                        {" "}

                                        {

                                            section.title

                                        }

                                    </h2>

                                    {

                                        section.blocks.map(

                                            (

                                                block,

                                                index

                                            ) => (

                                                <div

                                                    key={
                                                        index
                                                    }

                                                    style={{

                                                        marginBottom: "1.5rem"

                                                    }}

                                                >

                                                    <h3>

                                                        {

                                                            block.heading

                                                        }

                                                    </h3>

                                                    <p>

                                                        {

                                                            block.content

                                                        }

                                                    </p>

                                                </div>

                                            )

                                        )

                                    }

                                    <h3>

                                        Response

                                    </h3>

                                    <p>

                                        {

                                            session

                                                .getResponse(

                                                    section.number

                                                )

                                                .trim()

                                            ||

                                            "(No response)"

                                        }

                                    </p>

                                </section>

                            )

                        )

                    }

                </div>

            </main>

            <AppFooter

                onBack={() =>

                    navigate(-1)

                }

                secondaryText="Back"

                onSecondary={() =>

                    navigate(-1)

                }

                primaryText="Export"

                onPrimary={
                    exportInterview
                }

                primaryDisabled={
                    !validation.valid
                }

            />

        </div>

    );

}