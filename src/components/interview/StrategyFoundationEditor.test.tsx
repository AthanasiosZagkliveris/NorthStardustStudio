import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

import StrategyFoundationEditor from "./StrategyFoundationEditor";
import { sectionRailItems } from "./rails/railItems";
import { AnswerType } from "../../framework/enums/AnswerType";
import type { AnswerDefinition } from "../../framework/model/AnswerDefinition";

afterEach(cleanup);

describe("StrategyFoundationEditor data-rail markers", () => {

    it("marks every sub-section with the id the section rail expects", () => {

        const { container } = render(
            <StrategyFoundationEditor value={undefined} onChange={() => {}} />
        );

        const ids = [...container.querySelectorAll("[data-rail]")].map(
            element => element.getAttribute("data-rail")
        );

        const expected = sectionRailItems(
            { type: AnswerType.StrategyFoundation } as AnswerDefinition
        ).map(item => item.id);

        expect(ids).toEqual(expected);

    });

});
