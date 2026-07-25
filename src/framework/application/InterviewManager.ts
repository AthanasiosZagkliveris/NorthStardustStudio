import { FrameworkRegistry } from "../engine/FrameworkRegistry";

import { InterviewSession } from "../interview/InterviewSession";

/**
 * Application entry point for
 * Interview Sessions.
 */
export class InterviewManager {

    private readonly registry =
        new FrameworkRegistry();

    /**
     * Creates a new Interview Session.
     */
    public create(
        systemId: string
    ): InterviewSession {

        const framework =
            this.registry.getFramework(
                systemId
            );

        return new InterviewSession(
            framework
        );

    }

    /**
     * Determines whether a System
     * exists.
     */
    public exists(
        systemId: string
    ): boolean {

        return this.registry.exists(
            systemId
        );

    }

    /**
     * Returns every available
     * Framework.
     */
    public getFrameworks() {

        return this.registry.getAll();

    }

}