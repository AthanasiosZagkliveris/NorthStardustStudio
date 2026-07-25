import { InterviewSession } from "../framework/interview";

const INTERVIEW_KEY = "northstardust-interview";

export class StorageService {

    static saveInterview(session: InterviewSession): void {

        localStorage.setItem(
            INTERVIEW_KEY,
            JSON.stringify(session)
        );

    }

    static loadInterview(): InterviewSession | null {

        const data = localStorage.getItem(INTERVIEW_KEY);

        if (!data)
            return null;

        return JSON.parse(data) as InterviewSession;

    }

    static clearInterview(): void {

        localStorage.removeItem(INTERVIEW_KEY);

    }

}