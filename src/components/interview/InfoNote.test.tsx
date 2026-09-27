import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import InfoNote, { InfoText } from "./InfoNote";

afterEach(cleanup);

describe("InfoNote", () => {

    it("renders a Formula point and a source link", () => {

        render(
            <InfoNote
                label="Sales funnel"
                points={[
                    { title: "Formula", text: "Sales / month = Prospects × Qualified% × Buy%" },
                    "Not every prospect is a real buyer.",
                    {
                        title: "Based on",
                        text: "CFI, \"Lead-to-Customer Conversion Rate\"",
                        href: "https://corporatefinanceinstitute.com/resources/valuation/lead-to-customer-conversion-rate/"
                    }
                ]}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Sales funnel: what this means" }));

        expect(screen.getByText("Formula:")).toBeTruthy();
        expect(screen.getByText("Sales / month = Prospects × Qualified% × Buy%")).toBeTruthy();

        const link = screen.getByRole("link", { name: "CFI, \"Lead-to-Customer Conversion Rate\"" });
        expect(link.getAttribute("href")).toBe(
            "https://corporatefinanceinstitute.com/resources/valuation/lead-to-customer-conversion-rate/"
        );
        expect(link.getAttribute("target")).toBe("_blank");
        expect(link.getAttribute("rel")).toBe("noreferrer");

    });


    it("glues the i to the last word of its label", () => {

        const { container } = render(
            <span>
                <InfoText text="Working Hours per Client">
                    <InfoNote label="Working hours" points={["Hours a month."]} />
                </InfoText>
            </span>
        );

        const glue = container.querySelector(".info-note-glue");

        expect(glue).toBeTruthy();
        expect(glue!.firstChild!.textContent).toBe("Client");
        expect(glue!.querySelector(".info-note")).toBeTruthy();
        expect(container.firstElementChild!.firstChild!.textContent).toBe("Working Hours per ");

    });

    it("leaves a label without a note as plain text", () => {

        const { container } = render(
            <span>
                <InfoText text="Price">{false}</InfoText>
            </span>
        );

        expect(container.querySelector(".info-note-glue")).toBeNull();
        expect(container.textContent).toBe("Price");

    });

});
