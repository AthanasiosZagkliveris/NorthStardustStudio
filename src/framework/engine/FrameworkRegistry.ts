import { systems } from "../../data/systems";

import { FrameworkInterpreter } from "./FrameworkInterpreter";

import { FrameworkDocument } from "../model/FrameworkDocument";

/**
 * Registry containing every Framework
 * bundled with the application.
 *
 * Frameworks are loaded, interpreted
 * and cached during initialization.
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

        const markdownFiles =
            import.meta.glob(
                "../../assets/OrganizationalSystems/**/*.md",
                {
                    eager: true,
                    import: "default",
                    query: "?raw"
                }
            ) as Record<string, string>;

        for (const system of systems) {

            const filename =
                this.findFilename(
                    markdownFiles,
                    system.number
                );

            if (!filename) {

                console.warn(

                    `Framework Markdown not found for "${system.id}".`

                );

                continue;

            }

            const framework =
                this.interpreter.interpret(

                    markdownFiles[
                        filename
                    ]

                );

            this.frameworks.set(

                system.id,

                framework

            );

        }

    }

    /**
     * Returns every registered
     * Framework.
     */
    public getAll(): readonly FrameworkDocument[] {

        return Array.from(

            this.frameworks.values()

        );

    }

    /**
     * Returns one Framework.
     */
    public getFramework(
        systemId: string
    ): FrameworkDocument {

        const framework =
            this.frameworks.get(
                systemId
            );

        if (!framework) {

            throw new Error(

                `Unknown Framework "${systemId}".`

            );

        }

        return framework;

    }

    /**
     * Determines whether a Framework
     * exists.
     */
    public exists(
        systemId: string
    ): boolean {

        return this.frameworks.has(
            systemId
        );

    }

    /**
     * Finds the Markdown file
     * corresponding to a System.
     */
    private findFilename(

        files: Record<string, string>,

        systemNumber: number

    ): string | undefined {

        const prefix =
            systemNumber
                .toString()
                .padStart(2, "0") + "_";

        return Object.keys(files).find(

            file =>

                file.includes(
                    prefix
                )

        );

    }

}