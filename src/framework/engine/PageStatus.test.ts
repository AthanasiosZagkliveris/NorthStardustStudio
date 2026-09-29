import { describe, expect, test } from "vitest";

import { InterviewSession } from "../interview";
import { AnswerType } from "../enums/AnswerType.ts";
import { systems } from "../../data/systems";
import { frameworkRegistry } from "./FrameworkRegistry.ts";
import { InterviewValidator } from "./InterviewValidator.ts";
import { hasAnyAnswer, pageStatuses, systemStatus } from "./PageStatus.ts";
import quillfieldText from "../../../docs/examples/quillfield-automation-llc.json?raw";

type SavedState = Parameters<typeof InterviewSession.fromJSON>[0];

const quill = JSON.parse(quillfieldText) as { systems: Record<string, SavedState> };

function quillSession(id: string, number: number) {
    return InterviewSession.fromJSON(quill.systems[String(number)], frameworkRegistry.getFramework(id));
}

describe("page status", () => {

    test("every page of every untouched System is not started", () => {

        for (const system of systems) {

            const session = new InterviewSession(frameworkRegistry.getFramework(system.id));
            const statuses = Array.from(pageStatuses(session).values());

            expect(statuses.every(status => status === "not-started"), system.title).toBe(true);
            expect(systemStatus(statuses)).toBe("not-started");

        }

    });

    test("a page with some answers but a required one missing is in progress", () => {

        const session = new InterviewSession(frameworkRegistry.getFramework("identity"));

        session.saveResponse(1, { description: "We automate small offices." });

        const statuses = pageStatuses(session);

        expect(statuses.get(1)).toBe("in-progress");
        expect(statuses.get(2)).toBe("not-started");
        expect(systemStatus(Array.from(statuses.values()))).toBe("in-progress");

    });

    test("a page is defined exactly when the validator has nothing to report on it", () => {

        const session = quillSession("identity", 1);
        const validation = new InterviewValidator().validate(session);
        const statuses = pageStatuses(session);

        expect(validation.valid).toBe(true);
        expect(Array.from(statuses.values()).every(status => status === "defined")).toBe(true);
        expect(systemStatus(Array.from(statuses.values()))).toBe("defined");

        // Emptying one column of Definition leaves the page answered but unfinished.
        const definition = session.getResponse(1) as Record<string, unknown>;
        session.saveResponse(1, { ...definition, mission: "" });

        expect(new InterviewValidator().validate(session).valid).toBe(false);
        expect(pageStatuses(session).get(1)).toBe("in-progress");

    });

    test("the Roadmap, which asks nothing, follows the Strategy pages it is drawn from", () => {

        const empty = new InterviewSession(frameworkRegistry.getFramework("strategy"));
        const roadmap = empty.getSections().find(section => section.answer?.type === AnswerType.StrategicRoadmap);

        expect(roadmap).toBeTruthy();
        expect(pageStatuses(empty).get(roadmap!.number)).toBe("not-started");

        const answered = quillSession("strategy", 4);
        const statuses = pageStatuses(answered);
        const others = Array.from(statuses.entries())
            .filter(([number]) => number !== roadmap!.number)
            .map(([, status]) => status);

        expect(statuses.get(roadmap!.number)).toBe(systemStatus(others));

    });

    test("ids and untouched defaults are not answers; a word or a number is", () => {

        const table = { type: AnswerType.Table, table: { columns: [{ id: "name", title: "Name" }] } } as never;

        expect(hasAnyAnswer(table, [{ id: "row-1", name: " " }])).toBe(false);
        expect(hasAnyAnswer(table, [{ id: "row-1", name: "Ada" }])).toBe(true);
        expect(hasAnyAnswer({ type: AnswerType.FreeText }, 12)).toBe(true);

    });

    test("a System is needs review if any page is, and defined only when every page is", () => {

        expect(systemStatus(["defined", "needs-review", "not-started"])).toBe("needs-review");
        expect(systemStatus(["defined", "defined"])).toBe("defined");
        expect(systemStatus(["defined", "not-started"])).toBe("in-progress");
        expect(systemStatus([])).toBe("not-started");

    });

});
