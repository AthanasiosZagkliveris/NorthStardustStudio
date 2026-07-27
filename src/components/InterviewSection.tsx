import { useMemo, useState } from "react";
import { Section, SectionBlock } from "../framework/model";

interface InterviewSectionProps {
    section: Section;
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
export default function InterviewSection({ section }: InterviewSectionProps) {
    const [helpOpen, setHelpOpen] = useState(false);

    const { visibleBlocks, helpBlocks } = useMemo(() => {
        const visibleBlocks = section.blocks.filter(isVisibleBlock);
        const helpBlocks = section.blocks.filter(isHelpBlock);

        return { visibleBlocks, helpBlocks };
    }, [section]);

    const hasHelp = helpBlocks.length > 0;

    return (
        <section className="interview-section">
            <h2 className="interview-section-title">
                {section.number}. {section.title}
            </h2>

            {visibleBlocks.map((block, index) => (
                <div key={index} className="interview-block">
                    {block.heading.trim().length > 0 && (
                        <h3 className="interview-block-heading">
                            {block.heading}
                        </h3>
                    )}

                    <div
                        className="interview-block-content"
                        style={{ whiteSpace: "pre-line" }}
                    >
                        {block.content}
                    </div>
                </div>
            ))}

            {hasHelp && (
                <div className="interview-help">
                    <button
                        type="button"
                        className="interview-help-toggle"
                        onClick={() => setHelpOpen(value => !value)}
                        aria-expanded={helpOpen}
                    >
                        {helpOpen ? "Hide Help" : "Need Help?"}
                    </button>

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

            {visibleBlocks.length === 0 && !hasHelp && (
                <div className="interview-empty-state">
                    This section has no visible content.
                </div>
            )}
        </section>
    );
}
