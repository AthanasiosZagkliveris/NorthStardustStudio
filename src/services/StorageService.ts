import { InterviewSession } from "../framework/interview";

const INTERVIEW_KEY = "northstardust-interview";

export class StorageService {

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

            const session = InterviewSession.fromJSON(
                JSON.parse(data)
            );

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
