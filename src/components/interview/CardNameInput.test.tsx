import { afterEach, describe, expect, it } from "vitest";
import { cleanup, createEvent, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";

import CardNameInput from "./CardNameInput";

function Harness({ initial = "" }: { initial?: string }) {

    const [name, setName] = useState(initial);

    return (
        <>
            <CardNameInput
                ariaLabel="Activity 1 name"
                placeholder="Activity name"
                value={name}
                onChange={setName}
            />
            <output>{name}</output>
        </>
    );

}

afterEach(cleanup);

describe("CardNameInput", () => {

    it("asks the name in a one-line textarea under its label", () => {

        render(<Harness initial="Publish three case studies" />);

        const field = screen.getByLabelText("Activity 1 name");

        expect(field.tagName).toBe("TEXTAREA");
        expect(field.getAttribute("rows")).toBe("1");
        expect(field.className).toContain("strategy-name-input");
        expect((field as HTMLTextAreaElement).value).toBe("Publish three case studies");

    });

    it("does not add a line on Enter", () => {

        render(<Harness initial="Name" />);

        const field = screen.getByLabelText("Activity 1 name");

        const enter = createEvent.keyDown(field, { key: "Enter" });

        fireEvent(field, enter);

        expect(enter.defaultPrevented).toBe(true);

    });

    it("turns a pasted line break into a space", () => {

        render(<Harness />);

        fireEvent.change(screen.getByLabelText("Activity 1 name"), {
            target: { value: "Investigate Password\nand credential vault" }
        });

        expect(screen.getByRole("status").textContent).toBe("Investigate Password and credential vault");

    });

    it("grows to fit a name that wraps", () => {

        const scrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight");

        Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
            configurable: true,
            get() { return 71; }
        });

        try {

            render(<Harness initial="Investigate Password and credential vault for client logins" />);

            expect((screen.getByLabelText("Activity 1 name") as HTMLTextAreaElement).style.height).toBe("71px");

        } finally {

            if (scrollHeight) {
                Object.defineProperty(HTMLElement.prototype, "scrollHeight", scrollHeight);
            } else {
                delete (HTMLElement.prototype as { scrollHeight?: number }).scrollHeight;
            }

        }

    });

});
