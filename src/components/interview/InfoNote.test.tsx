import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import InfoNote from "./InfoNote";

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

});
