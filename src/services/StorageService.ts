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

            return InterviewSession.fromJSON(
                JSON.parse(data)
            );

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

}
