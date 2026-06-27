import userEvent from "@testing-library/user-event";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "./page";

describe("Agent product page", () => {
  it("creates an autonomous agent, runs autopilot, and blocks unauthorized submission", async () => {
    const user = userEvent.setup();
    render(<Page />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Autonomous hunter agents/i,
      }),
    ).toBeDefined();
    expect(screen.getByTestId("agent-page")).toBeDefined();
    expect(screen.getByRole("link", { name: /learn more/i }).getAttribute("href")).toBe(
      "/agent/knowledge-base",
    );
    expect(screen.getByRole("heading", { name: /Configure the hunter agent/i })).toBeDefined();
    expect(screen.getByRole("heading", { name: /Every agent action stays auditable/i })).toBeDefined();

    await user.click(screen.getByRole("button", { name: /free create/i }));
    expect(screen.getByText(/Autopilot agent created/i)).toBeDefined();

    await user.click(screen.getAllByRole("button", { name: /run autopilot/i })[0]);
    expect(screen.getByText(/credits left/i)).toBeDefined();
    expect(screen.getAllByText(/Autopilot execution completed/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /try external submit/i }));
    expect(await screen.findByText(/MVP agents cannot apply/i)).toBeDefined();
  });

  it("adds a custom local watcher opportunity without session material", async () => {
    const user = userEvent.setup();
    render(<Page />);

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
