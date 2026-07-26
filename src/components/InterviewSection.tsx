import { Section } from "../framework/model";

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

export default function InterviewSection({ section }: InterviewSectionProps) {

    const visibleBlocks = section.blocks.filter(
        block => !HIDDEN_HEADINGS.has(block.heading.trim())
    );

    return (
        <section className="interview-section">

            <h2 className="interview-section-title">
                {section.number}. {section.title}
            </h2>

            {visibleBlocks.map((block, index) => (
                <div key={index} className="interview-block">

                    {block.heading.trim() && (
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

        </section>
    );
}
