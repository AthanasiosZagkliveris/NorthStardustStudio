import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

import CardNumber from "./CardNumber";

afterEach(cleanup);

describe("CardNumber", () => {

    it("is just the number in a list whose title names its cards", () => {

        const { container } = render(<CardNumber number={1} />);

        expect(container.textContent).toBe("1.");

    });

    it("says the kind in a list that nests kinds", () => {

        const { container } = render(<CardNumber number={2} kind="Goal" />);

        expect(container.textContent).toBe("2. Goal");

    });

    it("stands the number alone in the list-number column, the kind after it", () => {

        const { container } = render(<CardNumber number={10} kind="Goal" />);

        expect(container.querySelector(".strategy-box-number > .list-number")?.textContent).toBe("10.");

    });

});
