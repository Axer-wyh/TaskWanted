import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Page from "./page";

describe("Profile page", () => {
  it("renders the signed-in user center with task and agent records", async () => {
    const user = userEvent.setup();
    render(<Page />);

    expect(screen.getByRole("heading", { level: 1, name: /Profile center/i })).toBeDefined();
    expect(screen.getByTestId("fluid-cube-stage")).toBeDefined();

    await user.click(screen.getByRole("tab", { name: /Tasks/i }));
    expect(screen.getByText(/My posted bounties/i)).toBeDefined();
    expect(screen.getByText(/Agent tracked opportunities/i)).toBeDefined();

    await user.click(screen.getByRole("tab", { name: /Payouts/i }));
    expect(screen.getByRole("heading", { level: 2, name: /Payout records/i })).toBeDefined();

    await user.click(screen.getByRole("tab", { name: /Sources/i }));
    expect(
      screen.getByRole("heading", { level: 2, name: /Local watcher status/i }),
    ).toBeDefined();
  });
});
