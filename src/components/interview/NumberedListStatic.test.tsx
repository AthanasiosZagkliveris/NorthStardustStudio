import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import NumberedListStatic from "./NumberedListStatic";

afterEach(cleanup);

describe("NumberedListStatic", () => {

    it("is an ordered list, one item a line, in order", () => {

        render(<NumberedListStatic lines={[
            { key: "a", text: "Founder & Automation Consultant" },
            { key: "b", text: "Solutions Architect" }
        ]} />);

        const list = screen.getByRole("list");

        expect(list.tagName).toBe("OL");
        expect(screen.getAllByRole("listitem").map(item => item.textContent)).toEqual([
            "Founder & Automation Consultant",
            "Solutions Architect"
        ]);

    });

    it("puts a line's badge at the end of the same line, after its text", () => {

        render(<NumberedListStatic lines={[
            {
                key: "a",
                text: "Form the LLC and get an EIN",
                className: "done",
                end: <span>Completed</span>
            },
            { key: "b", text: "Open a business bank account" }
        ]} />);

        const [done, open] = screen.getAllByRole("listitem");

        expect(done.className).toBe("done");
        expect([...done.children].map(child => child.className)).toEqual([
            "numbered-list-static-text",
            "numbered-list-static-end"
        ]);
        expect(done.lastElementChild?.textContent).toBe("Completed");
        expect(open.querySelector(".numbered-list-static-end")).toBeNull();

    });

});
