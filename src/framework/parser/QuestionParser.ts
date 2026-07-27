import {
    QuestionDefinition,
} from "../model/index.ts";

import { AnswerParser } from "./AnswerParser.ts";

/**
 * Parses Framework questions
 * from Markdown.
 */
export class QuestionParser {

    /**
     * Parses all questions contained
     * within a Framework System.
     */
    public parse(markdown: string): QuestionDefinition[] {

        const questions: QuestionDefinition[] = [];

        const regex = /^##\s+(\d+)\.\s+(.+)$/gm;

        const matches = [...markdown.matchAll(regex)];

        for (let i = 0; i < matches.length; i++) {

            const current = matches[i];

            const next = matches[i + 1];

            const start = current.index!;

            const end = next
                ? next.index!
                : markdown.length;

            const block = markdown.substring(start, end);

            questions.push(this.parseQuestion(block));

        }

        return questions;

    }

    /**
     * Parses a single question.
     */
    private parseQuestion(block: string): QuestionDefinition {

        const header = block.match(/^##\s+(\d+)\.\s+(.+)$/m);

        if (!header) {

            throw new Error("Invalid question header.");

        }

        const answerParser = new AnswerParser();

        return {

            number: Number(header[1]),

            title: header[2].trim(),

            answer: answerParser.parse(block)

        };

    }

}
