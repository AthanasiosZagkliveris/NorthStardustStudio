import { Section } from "../framework/model";

interface InterviewSectionProps {

    section: Section;

}

export default function InterviewSection({

    section

}: InterviewSectionProps) {

    return (

        <section className="interview-section">

            <h2>

                {section.number}. {section.title}

            </h2>

            {

                section.blocks.map(

                    (block, index) => (

                        <div

                            key={index}

                            className="section-block"

                        >

                            <h3>

                                {block.heading}

                            </h3>

                            <p>

                                {block.content}

                            </p>

                        </div>

                    )

                )

            }

        </section>

    );

}