import { InterviewSession } from "../framework/interview";
import { FrameworkRegistry } from "../framework/engine/FrameworkRegistry";
import { systems } from "../data/systems";

const INTERVIEW_KEY = "northstardust-interview";

export class StorageService {

    /**
     * Resolves the CURRENT Framework structure for a
     * restored session -- constructed fresh here (not
     * reused from any long-lived singleton) so every call
     * reflects whatever Questions/Answers/Help content and
     * Table/Card structure is presently bundled, never a
     * snapshot from whenever a session was first saved.
     */
    private static readonly registry = new FrameworkRegistry();

    static saveInterview(session: InterviewSession): void {

        localStorage.setItem(
            INTERVIEW_KEY,
            JSON.stringify(session.toJSON())
        );

    }

    static loadInterview(): InterviewSession | null {

        const data = localStorage.getItem(INTERVIEW_KEY);

        if (!data) {
            return null;
        }

        try {

            const raw = JSON.parse(data);

            // Older saved sessions persisted the entire parsed
            // Framework (`raw.framework`) instead of just
            // `systemNumber` -- fall back to reading it out of
            // that legacy shape so an in-progress session isn't
            // discarded outright just because the storage format
            // changed. Either way, only the *number* is trusted;
            // the structure itself is always re-resolved below.
            const systemNumber: number | undefined =
                raw.systemNumber ?? raw.framework?.metadata?.systemNumber;

            const system = systems.find(
                candidate => candidate.number === systemNumber
            );

            if (!system) {

                console.warn(
                    "Saved interview session does not reference a " +
                    "known Framework System. Discarding it."
                );

                this.clearInterview();

                return null;

            }

            const framework = this.registry.getFramework(system.id);

            const session = InterviewSession.fromJSON(raw, framework);

            if (!this.isCompatible(session)) {

                console.warn(
                    "Saved interview session is from an older, " +
                    "incompatible version of the Framework. Discarding it."
                );

                this.clearInterview();

                return null;

            }

            return session;

        } catch (error) {

            console.error(
                "Failed to restore interview session.",
                error
            );

            this.clearInterview();

            return null;

        }

    }

    static clearInterview(): void {

        localStorage.removeItem(INTERVIEW_KEY);

    }

    /**
     * Verifies that a restored session's Framework
     * still matches the shape the current app
     * expects.
     *
     * A session saved by an older build of the app
     * may be missing fields (such as each Section's
     * Answer Definition) that the current renderer
     * requires. Resuming such a session would crash
     * the Interview page rather than displaying it,
     * so any structurally incompatible session is
     * treated the same as "no saved session".
     */
    private static isCompatible(session: InterviewSession): boolean {

        try {

            const framework = session.getFramework();

            return framework.sections.every(
                section =>
                    !!section.answer &&
                    typeof section.answer.type === "string"
            );

        } catch {

            return false;

        }

    }

}
