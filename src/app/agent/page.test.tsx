import userEvent from "@testing-library/user-event";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "./page";

describe("Agent product page", () => {
  it("runs allowed agent work and blocks external submission", async () => {
    const user = userEvent.setup();
    render(<Page />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Hunter agent workbench/i,
      }),
    ).toBeDefined();

    await user.click(screen.getAllByRole("button", { name: /run discovery/i })[0]);
    expect(screen.getByText(/credits left/i)).toBeDefined();
    expect(screen.getAllByText(/Opportunity discovery completed/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /try external submit/i }));
    expect(await screen.findByText(/MVP agents cannot apply/i)).toBeDefined();
  });

  it("adds a custom local watcher opportunity without session material", async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.click(screen.getByRole("button", { name: /configure watcher/i }));
    await user.clear(await screen.findByLabelText(/target url/i));
    await user.type(
      screen.getByLabelText(/target url/i),
      "https://private-board.test/tasks/research-ai-tools",
    );
    await user.type(screen.getByLabelText(/keywords/i), "AI research, pricing");
    await user.click(screen.getByRole("button", { name: /sync local source/i }));

    const sourcePanel = screen.getByTestId("watcher-results");
    expect(within(sourcePanel).getAllByText(/research-ai-tools/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/No third-party cookies stored/i)).toBeDefined();
  });
});
