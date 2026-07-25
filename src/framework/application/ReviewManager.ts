import { InterviewSession } from "../interview";

import { ValidationResult } from "../model";

import { InterviewValidator } from "../engine/InterviewValidator";
import { MarkdownExporter } from "../engine/MarkdownExporter";

/**
 * Application entry point for
 * reviewing completed Interview
 * Sessions.
 *
 * The UI communicates only with this
 * class and never directly with the
 * Framework Engine.
 */
export class ReviewManager {

    /**
     * Interview Validator.
     */
    private readonly validator =
        new InterviewValidator();

    /**
     * Markdown Exporter.
     */
    private readonly exporter =
        new MarkdownExporter();

    /**
     * Validates an Interview Session.
     */
    public validate(
        session: InterviewSession
    ): ValidationResult {

        return this.validator.validate(
            session
        );

    }

    /**
     * Converts an Interview Session
     * into Markdown.
     */
    public toMarkdown(
        session: InterviewSession
    ): string {

        return this.exporter.toMarkdown(
            session
        );

    }

    /**
     * Exports an Interview Session
     * as a Markdown file.
     */
    public exportMarkdown(
        session: InterviewSession
    ): void {

        const markdown =
            this.toMarkdown(
                session
            );

        const framework =
            session.getFramework();

        const filename =
            framework.metadata.systemName
                .replace(/\s+/g, "-")
                .toLowerCase() + ".md";

        const blob =
            new Blob(

                [markdown],

                {

                    type:
                        "text/markdown;charset=utf-8"

                }

            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href =
            url;

        link.download =
            filename;

        document.body.appendChild(
            link
        );

        link.click();

        document.body.removeChild(
            link
        );

        URL.revokeObjectURL(
            url
        );

    }

}