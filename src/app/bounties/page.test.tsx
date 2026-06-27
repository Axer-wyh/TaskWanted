import userEvent from "@testing-library/user-event";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "./page";

describe("Bounties product page", () => {
  it("creates a funded bounty and accepts a blind submission", async () => {
    const user = userEvent.setup();
    render(<Page />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Bounty Board/i,
      }),
    ).toBeDefined();
    expect(screen.getByTestId("fluid-cube-stage")).toBeDefined();
    expect(screen.getByRole("tab", { name: /Trending/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /Submissions/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /Mine/i })).toBeDefined();

    await user.click(screen.getByRole("tab", { name: /Create/i }));
    await user.clear(await screen.findByLabelText(/title/i));
    await user.type(screen.getByLabelText(/title/i), "Score agent safety traces");
    await user.clear(screen.getByLabelText(/budget/i));
    await user.type(screen.getByLabelText(/budget/i), "2100");
    await user.selectOptions(screen.getByLabelText(/judging mode/i), "subjective");

    expect(screen.getByText(/High risk fee/i)).toBeDefined();
    expect(screen.getAllByText(/3%/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /create funded bounty/i }));
    expect(screen.getAllByText(/Score agent safety traces/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("tab", { name: /Detail/i }));
    const submitButtons = await screen.findAllByRole("button", {
      name: /Submit blind work/i,
    });
    await user.click(submitButtons[0]);
    await user.type(
      await screen.findByLabelText(/submission note/i),
      "Trace audit attached with reproducible findings.",
    );
    await user.click(screen.getByRole("button", { name: /send blind submission/i }));

    await user.click(screen.getByRole("tab", { name: /Submissions/i }));
    const activity = screen.getByTestId("bounty-activity");
    expect(within(activity).getByText(/blind submission received/i)).toBeDefined();
  });
});
