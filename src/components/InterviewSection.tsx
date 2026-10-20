import { useMemo, useState } from "react";
import AddButton from "./controls/AddButton.tsx";
import { Section, SectionBlock } from "../framework/model";
import { questionLineClass } from "./interview/editors/AnswerRenderer.tsx";

interface InterviewSectionProps {
    section: Section;

    /**
     * Set for a page whose title has moved up into the Interview
     * Header (see InterviewHeader's `pageTitle`), so it isn't
     * repeated here. When that leaves this component with nothing
     * else to show -- no visible blocks and no help -- it renders
     * nothing at all rather than an empty <section>, which would
     * otherwise add one more of the interview card's 30px gaps
     * between the header and the answer below it.
     */
    hideTitle?: boolean;
}

const HIDDEN_HEADINGS = new Set([
    "Purpose",
    "Example",
    "Examples",
    "Recommended Length",
    "Notes",
    "Note",
    "Outcome",
    "Related Systems",
    "When to Use"
]);

const HELP_HEADINGS = new Set([
    "Help",
    "Guidance",
    "Need Help",
    "Instructions",
    "Support"
]);

function normalizeHeading(value: string): string {
    return value.trim();
}

function isVisibleBlock(block: SectionBlock): boolean {
    const heading = normalizeHeading(block.heading);
    return !HIDDEN_HEADINGS.has(heading) && !HELP_HEADINGS.has(heading);
}

function isHelpBlock(block: SectionBlock): boolean {
    const heading = normalizeHeading(block.heading);
    return HELP_HEADINGS.has(heading);
}

/**
 * Renders one interview section in a way that is compatible with both the
 * current block-based Framework and the newer question/help driven flow.
 */
export default function InterviewSection({ section, hideTitle }: InterviewSectionProps) {
    const [helpOpen, setHelpOpen] = useState(false);

    const { visibleBlocks, helpBlocks } = useMemo(() => {
        const visibleBlocks = section.blocks.filter(isVisibleBlock);
        const helpBlocks = section.blocks.filter(isHelpBlock);

        return { visibleBlocks, helpBlocks };
    }, [section]);

    const hasHelp = helpBlocks.length > 0;

    // A column-layout Section carries its questions on its individual
    // parts (see AnswerPartDefinition.questions) rather than in a
    // Section-level block, so it can legitimately have no blocks at
    // all here while still having plenty to show -- just further down
    // the page, beside each column's own editor. Without this, such a
    // Section would render the "no visible content" notice directly
    // above a fully-populated set of columns.
    const hasPartQuestions = (section.answer?.parts ?? []).some(
        part => (part.questions ?? "").trim().length > 0
    );

    // Same reasoning, for a Section whose answer is ONE bespoke
    // Structure rather than a set of parts: the Business System's
    // Foundation page and the Identity System's Legal Entity page
    // both carry their guidance inside their own editor, so their
    // Questions section is deliberately a bare heading. A Section
    // holding an answer has content by definition -- the editor --
    // so the notice below is only ever right when there is no
    // answer at all.
    const hasAnswer = section.answer !== undefined;

    if (hideTitle && visibleBlocks.length === 0 && !hasHelp) {
        return null;
    }

    return (
        <section className="interview-section">
            {!hideTitle && (
                <h2 className="interview-section-title">
                    {section.number}. {section.title}
                </h2>
            )}

            {visibleBlocks.map((block, index) => (
                <div key={index} className="interview-block">
                    {block.heading.trim().length > 0 && (
                        <h3 className="interview-block-heading">
                            {block.heading}
                        </h3>
                    )}

                    <div className="interview-block-content">
                        {/*
                            One block per line rather than a single
                            "pre-line" run, so a wrapped bullet can
                            hang-indent under its own text while an
                            explanation line stays flush to the margin
                            (see questionLineClass).
                        */}
                        {block.content.split("\n").map((line, lineIndex) => (
                            <span
                                key={lineIndex}
                                className={questionLineClass(line)}
                            >
                                {line}
                            </span>
                        ))}
                    </div>
                </div>
            ))}

            {hasHelp && (
                <div className="interview-help">
                    <AddButton look="interview-help-toggle"
                        onClick={() => setHelpOpen(value => !value)}
                        aria-expanded={helpOpen}>
                        {helpOpen ? "Hide Help" : "Need Help?"}
                    </AddButton>

                    {helpOpen && (
                        <div className="interview-help-panel">
                            {helpBlocks.map((block, index) => (
                                <div key={index} className="interview-help-block">
                                    {block.heading.trim().length > 0 && (
                                        <h3 className="interview-help-heading">
                                            {block.heading}
                                        </h3>
                                    )}

                                    <div
                                        className="interview-help-content"
                                        style={{ whiteSpace: "pre-line" }}
                                    >
                                        {block.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {visibleBlocks.length === 0 && !hasHelp && !hasPartQuestions && !hasAnswer && (
                <div className="interview-empty-state">
                    This section has no visible content.
                </div>
            )}
        </section>
    );
}
