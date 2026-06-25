import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "@/components/site-header";
import Page from "./page";

describe("TaskWanted landing app", () => {
  it("renders a routed product home with account controls", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SiteHeader />
        <Page />
      </>,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /TaskWanted/i,
      }),
    ).toBeDefined();

    expect(
      screen.getByRole("link", { name: /open bounty board/i }).getAttribute("href"),
    ).toBe("/bounties");
    expect(
      screen.getByRole("link", { name: /agent workbench/i }).getAttribute("href"),
    ).toBe("/agent");
    expect(screen.getByRole("button", { name: /connect wallet/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /switch language/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /switch theme/i })).toBeDefined();

    await user.click(screen.getByRole("button", { name: /connect wallet/i }));
    expect(screen.getByText(/0xA17/i)).toBeDefined();
    expect(screen.getByText(/External Bounty Agent Lite/i)).toBeDefined();
    expect(screen.getByText(/0.1% \/ 1% \/ 3%/i)).toBeDefined();
  });
});
