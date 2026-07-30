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
 *
 * Only the raw Markdown (cheap text the bundler
 * already ships) is read up front. Turning that
 * Markdown into a fully-parsed FrameworkDocument is
 * deferred until a System is actually opened, and the
 * result is cached from then on -- a session only ever
 * works with one System at a time, so there is no
 * reason to pay the parsing cost for the other 23 on
 * every app start.
 */
export class FrameworkRegistry {

    /**
     * Framework interpreter.
     */
    private readonly interpreter =
        new FrameworkInterpreter();

    /**
     * Raw source Markdown per System, keyed by System id.
     * Cheap to hold in memory -- no parsing has happened yet.
     */
    private readonly sources =
        new Map<string, FrameworkSource>();

    /**
     * Already-interpreted Frameworks, keyed by System id.
     * Populated lazily, on first access, by getFramework().
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

            this.sources.set(
                system.id,
                source
            );
        }
    }

    public getAll(): readonly FrameworkDocument[] {

        for (const systemId of this.sources.keys()) {

            this.getFramework(systemId);

        }

        return Array.from(this.frameworks.values());

    }

    public getFramework(
        systemId: string
    ): FrameworkDocument {

        const cached = this.frameworks.get(systemId);

        if (cached) {
            return cached;
        }

        const source = this.sources.get(systemId);

        if (!source) {

            throw new Error(
                `Unknown Framework "${systemId}".`
            );

        }

        const framework =
            this.interpreter.interpret(source);

        this.frameworks.set(
            systemId,
            framework
        );

        return framework;

    }

    public exists(
        systemId: string
    ): boolean {

        return this.sources.has(systemId);

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

/**
 * One shared `FrameworkRegistry` for the whole app, rather than
 * every caller constructing (and separately caching) its own --
 * `StorageService` and `InterviewManager` used to each hold a
 * private instance, so opening a System for the very first time
 * (parsed via one registry's cache) and then reopening it once a
 * session existed for it (read via the other registry's cache)
 * paid the Markdown-interpretation cost twice instead of once.
 */
export const frameworkRegistry = new FrameworkRegistry();
