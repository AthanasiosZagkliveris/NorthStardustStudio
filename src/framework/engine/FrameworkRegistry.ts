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
                    markdownFiles[filename]
                );

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
     * Finds the Markdown file
     * corresponding to a System.
     *
     * Matches the filename exactly
     * (e.g. "01_Identity.md") instead of
     * using a fragile substring search.
     */
    private findFilename(
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

}
