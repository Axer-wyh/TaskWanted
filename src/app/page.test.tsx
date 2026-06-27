import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "@/components/site-header";
import Page from "./page";

describe("TaskWanted landing app", () => {
  it("renders a Fluid Cube home with routed account controls", async () => {
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
    expect(screen.getByRole("link", { name: /free create/i }).getAttribute("href")).toBe(
      "/agent",
    );
    expect(screen.getByRole("link", { name: /ecosystem/i }).getAttribute("href")).toBe(
      "/#ecosystem",
    );
    expect(screen.getByRole("link", { name: /about/i }).getAttribute("href")).toBe(
      "/#about",
    );
    expect(screen.getByRole("button", { name: /connect wallet/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /switch language/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /switch theme/i })).toBeDefined();
    const stage = screen.getByTestId("fluid-cube-stage");
    expect(stage).toBeDefined();
    expect(screen.getByText(/How TaskWanted closes a bounty/i)).toBeDefined();
    await user.click(screen.getByRole("tab", { name: /Ecosystem/i }));
    expect(stage.getAttribute("data-active-face")).toBe("ecosystem");
    await user.click(screen.getByRole("tab", { name: /About/i }));
    expect(stage.getAttribute("data-active-face")).toBe("about");

    await user.click(screen.getByRole("button", { name: /connect wallet/i }));
    expect(screen.getByText(/0xA17/i)).toBeDefined();
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByRole("link", { name: /open profile/i }).getAttribute("href")).toBe(
      "/profile",
    );
  });
});
