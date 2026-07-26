import { systems } from "../../data/systems";

import { FrameworkInterpreter, FrameworkSource } from "./FrameworkInterpreter";

import { FrameworkDocument } from "../model/FrameworkDocument";

/**
 * Registry containing every Framework
 * bundled with the application.
 *
 * Frameworks are assembled from the
 * dedicated introduction, questions,
 * help and answer documents.
 */
export class FrameworkRegistry {

    /**
     * Framework interpreter.
     */
    private readonly interpreter =
        new FrameworkInterpreter();

    /**
     * Registered Frameworks.
     */
    private readonly frameworks =
        new Map<string, FrameworkDocument>();

    constructor() {

        const introductionMarkdown =
            this.firstMarkdown(
                import.meta.glob(
                    "../../assets/SystemsIntroduction.md",
                    {
                        eager: true,
                        import: "default",
                        query: "?raw"
                    }
                ) as Record<string, string>
            );

        const fieldsMarkdown =
            this.firstMarkdown(
                import.meta.glob(
                    "../../assets/Status_Scale_Frequency_Fields.md",
                    {
                        eager: true,
                        import: "default",
                        query: "?raw"
                    }
                ) as Record<string, string>
            );

        const questionFiles =
            import.meta.glob(
                "../../assets/SystemQuestions/*.md",
                {
                    eager: true,
                    import: "default",
                    query: "?raw"
                }
            ) as Record<string, string>;

        const helpFiles =
            import.meta.glob(
                "../../assets/SystemHelp/*.md",
                {
                    eager: true,
                    import: "default",
                    query: "?raw"
                }
            ) as Record<string, string>;

        const answerFiles =
            import.meta.glob(
                "../../assets/SystemAnswers/*.md",
                {
                    eager: true,
                    import: "default",
                    query: "?raw"
                }
            ) as Record<string, string>;

        for (const system of systems) {

            const questionFile =
                this.findFilenameByPrefix(
                    questionFiles,
                    system.number
                );

            if (!questionFile) {

                console.warn(
                    `Framework Questions not found for "${system.id}".`
                );

                continue;
            }

            const helpFile =
                this.findFilenameByPrefix(
                    helpFiles,
                    system.number
                );

            if (!helpFile) {
                console.warn(
                    `Framework Help not found for "${system.id}".`
                );
            }

            const answerFile =
                this.findFilenameByPrefix(
                    answerFiles,
                    system.number
                );

            if (!answerFile) {
                console.warn(
                    `Framework Answer not found for "${system.id}".`
                );
            }

            const source: FrameworkSource = {
                introductionMarkdown,
                questionsMarkdown: questionFiles[questionFile],
                helpMarkdown: helpFile ? helpFiles[helpFile] : "",
                answersMarkdown: answerFile ? answerFiles[answerFile] : "",
                fieldsMarkdown
            };

            const framework =
                this.interpreter.interpret(source);

            this.frameworks.set(
                system.id,
                framework
            );
        }
    }

    public getAll(): readonly FrameworkDocument[] {

        return Array.from(this.frameworks.values());

    }

    public getFramework(
        systemId: string
    ): FrameworkDocument {

        const framework =
            this.frameworks.get(systemId);

        if (!framework) {

            throw new Error(
                `Unknown Framework "${systemId}".`
            );

        }

        return framework;

    }

    public exists(
        systemId: string
    ): boolean {

        return this.frameworks.has(systemId);

    }

    /**
     * Finds the Markdown file corresponding
     * to a System.
     *
     * Matches the filename prefix exactly
     * (e.g. "01_").
     */
    private findFilenameByPrefix(
        files: Record<string, string>,
        systemNumber: number
    ): string | undefined {

        const expectedPrefix =
            `${systemNumber.toString().padStart(2, "0")}_`;

        return Object.keys(files).find(file => {

            const filename =
                file.split("/").pop() ?? "";

            return filename.startsWith(expectedPrefix);

        });

    }

    /**
     * Extracts a single Markdown string
     * from a glob result that only
     * contains one file.
     */
    private firstMarkdown(
        files: Record<string, string>
    ): string {

        return Object.values(files)[0] ?? "";

    }

}
