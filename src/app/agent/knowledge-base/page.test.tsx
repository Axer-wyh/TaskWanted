import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Page from "./page";

describe("Agent knowledge base page", () => {
  it("explains autonomous agent capability and boundaries", async () => {
    const user = userEvent.setup();
    render(<Page />);

    expect(
      screen.getByRole("heading", { level: 1, name: /Agent knowledge base/i }),
    ).toBeDefined();
    expect(screen.getByTestId("fluid-cube-stage")).toBeDefined();
    expect(screen.getByText(/Autonomous discovery/i)).toBeDefined();
    expect(screen.getByText(/Autopilot execution/i)).toBeDefined();

    await user.click(screen.getByRole("tab", { name: /Capabilities/i }));
    expect(screen.getByText(/Passive bounty income/i)).toBeDefined();

    await user.click(screen.getByRole("tab", { name: /Boundaries/i }));
    expect(
      screen.getByRole("heading", { level: 2, name: /No CAPTCHA solving/i }),
    ).toBeDefined();
  });
});
