import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { harvardReference, SOURCES } from "../../../framework/engine/Sources";

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
                    { title: "Source", source: SOURCES.breakEvenPoint }
                ]}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Sales funnel: what this means" }));

        expect(screen.getByText("Formula:")).toBeTruthy();
        expect(screen.getByText("Sales / month = Prospects × Qualified% × Buy%")).toBeTruthy();

        // The full Harvard reference, its address the link.
        expect(document.querySelector(".harvard-reference")?.textContent).toBe(harvardReference(SOURCES.breakEvenPoint));
        expect(document.querySelector(".harvard-reference em")?.textContent).toBe("Calculate your startup costs: break-even point");
        const link = screen.getByRole("link", { name: SOURCES.breakEvenPoint.url });
        expect(link.getAttribute("href")).toBe(SOURCES.breakEvenPoint.url);
        expect(link.getAttribute("target")).toBe("_blank");
        expect(link.getAttribute("rel")).toBe("noreferrer");

    });


    it("never links a source whose domain is not accepted", () => {

        render(
            <InfoNote
                label="Rate"
                points={[
                    "A rate.",
                    {
                        title: "Source",
                        source: {
                            authors: ["Some Blog"],
                            year: "2026",
                            title: "Rate",
                            publisher: "Some Blog",
                            url: "https://example.com/rate",
                            checked: "2026-09-29"
                        }
                    }
                ]}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Rate: what this means" }));

        expect(screen.queryByRole("link")).toBeNull();
        expect(document.querySelector(".harvard-reference")?.textContent).toBe("Some Blog (2026) Rate. Available at: https://example.com/rate (Accessed: 29 September 2026).");

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
