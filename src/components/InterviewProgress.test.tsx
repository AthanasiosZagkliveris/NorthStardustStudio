import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

import InterviewProgress, { SHOW_PROGRESS_LINE } from "./InterviewProgress";

afterEach(cleanup);

describe("the progress line", () => {

    it("is hidden for now by ONE switch (SHOW_PROGRESS_LINE), which draws nothing, not even a gap", () => {
        expect(SHOW_PROGRESS_LINE).toBe(false);
        const { container } = render(<InterviewProgress current={2} total={5} />);
        expect(container.innerHTML).toBe("");
    });

});
