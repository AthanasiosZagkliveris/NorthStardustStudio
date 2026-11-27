import { describe, expect, it } from "vitest";
import { BETA_QUESTIONNAIRE, SUS_STATEMENTS, allBetaQuestions, isAnswered, susScore } from "./betaQuestionnaire";

/** The Beta questionnaire's list (Research 8): its numbers, its shapes and what counts as answered. */
describe("the Beta questionnaire", () => {
    const questions = allBetaQuestions();

    it("numbers every question once", () => {
        const numbers = questions.map(question => question.number);
        expect(new Set(numbers).size).toBe(numbers.length);
    });

    it("asks questions 1 to 26 of Research 8 and the usability statements", () => {
        const numbers = questions.map(question => question.number).filter(number => number <= 26).sort((a, b) => a - b);
        expect(numbers).toEqual(Array.from({ length: 26 }, (_, index) => index + 1));
        expect(questions.filter(question => question.kind === "sus")).toHaveLength(1);
        expect(SUS_STATEMENTS).toHaveLength(10);
    });

    it("gives every choice question its options, and every scale its range", () => {
        for (const question of questions) {
            if (question.kind === "single" || question.kind === "multi") expect(question.options?.length ?? 0).toBeGreaterThan(1);
            if (question.kind === "scale") expect(question.from !== undefined && question.to !== undefined && question.from < question.to).toBe(true);
        }
    });

    it("requires every question but the contact consent", () => {
        expect(questions.filter(question => question.optional).map(question => question.number)).toEqual([2]);
    });

    it("starts with the consent and keeps every section filled", () => {
        expect(BETA_QUESTIONNAIRE[0].questions[0].number).toBe(1);
        for (const section of BETA_QUESTIONNAIRE) expect(section.questions.length).toBeGreaterThan(0);
    });

    it("counts an answer only when it fits its question", () => {
        const byNumber = (number: number) => questions.find(question => question.number === number)!;
        expect(isAnswered(byNumber(1), true)).toBe(true);
        expect(isAnswered(byNumber(1), false)).toBe(false);
        expect(isAnswered(byNumber(3), "An idea")).toBe(true);
        expect(isAnswered(byNumber(9), "   ")).toBe(false);
        expect(isAnswered(byNumber(22), ["Answering by voice"])).toBe(true);
        expect(isAnswered(byNumber(22), ["a", "b", "c", "d"])).toBe(false);
        expect(isAnswered(byNumber(25), 0)).toBe(true);
        expect(isAnswered(byNumber(25), 11)).toBe(false);
        expect(isAnswered(byNumber(27), [3, 3, 3, 3, 3, 3, 3, 3, 3])).toBe(false);
    });

    it("scores the usability statements as published", () => {
        expect(susScore([5, 1, 5, 1, 5, 1, 5, 1, 5, 1])).toBe(100);
        expect(susScore([1, 5, 1, 5, 1, 5, 1, 5, 1, 5])).toBe(0);
        expect(susScore([3, 3, 3, 3, 3, 3, 3, 3, 3, 3])).toBe(50);
    });
});
