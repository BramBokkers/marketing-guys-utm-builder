import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { historyKey } from "./history";

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("belangrijkste gebruikersacties", () => {
  it("maakt de lynx blij bij een geldige link en rustig na wissen of ongeldige invoer", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole("img", { name: "Lynx wacht op je UTM-link" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Eerst even proberen/ }));
    expect(screen.getByRole("img", { name: "Blije lynx: je UTM-link is klaar" })).toBeTruthy();
    await user.clear(screen.getByLabelText(/^Medium/));
    expect(screen.getByRole("img", { name: "Lynx wacht op je UTM-link" })).toBeTruthy();
    await user.type(screen.getByLabelText(/^Medium/), "email");
    expect(screen.getByRole("img", { name: "Blije lynx: je UTM-link is klaar" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Wis velden/ }));
    expect(screen.getByRole("img", { name: "Lynx wacht op je UTM-link" })).toBeTruthy();
    expect(localStorage.getItem(historyKey)).toBeNull();
  });
  it("blijft werken bij beschadigde en geblokkeerde browseropslag", async () => {
    localStorage.setItem(historyKey, "ongeldige json");
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Opslag geblokkeerd", "QuotaExceededError");
    });
    render(<App />);
    await user.click(screen.getByRole("button", { name: /Eerst even proberen/ }));
    await user.click(screen.getByRole("button", { name: /Kopieer URL/ }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Verwijder CamptoGo/ })).toBeTruthy();
  });
  it("verwerkt geavanceerde invoer direct in de preview", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /Eerst even proberen/ }));
    const summary = screen.getByText("Geavanceerde opties");
    expect(summary.closest("details")?.open).toBe(false);
    await user.click(summary);
    await user.type(screen.getByLabelText(/^Campaign Content/), "variant_A");
    expect(screen.getByRole("link", { name: /Open URL/ }).getAttribute("href")).toContain("utm_content=variant_A");
    expect(localStorage.getItem(historyKey)).toBeNull();
  });
  it("laadt het voorbeeld, kopieert, voorkomt duplicaten en verwijdert geschiedenis", async () => {
    const user = userEvent.setup();
    const clipboard = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue();
    render(<App />);
    expect(
      (screen.getByRole("button", { name: /Kopieer URL/ }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    await user.click(
      screen.getByRole("button", { name: /Eerst even proberen/ }),
    );
    expect(localStorage.getItem(historyKey)).toBeNull();
    await user.click(screen.getByRole("button", { name: /Kopieer URL/ }));
    expect(clipboard).toHaveBeenCalledWith(
      expect.stringContaining("utm_source=LinkedIn"),
    );
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem(historyKey)!)).toHaveLength(1),
    );
    await user.click(screen.getByRole("button", { name: /Kopieer URL/ }));
    expect(JSON.parse(localStorage.getItem(historyKey)!)).toHaveLength(1);
    await user.click(
      screen.getByRole("button", { name: /Verwijder CamptoGo/ }),
    );
    expect(JSON.parse(localStorage.getItem(historyKey)!)).toHaveLength(0);
  });
  it("past presets toe, laat eigen waarden toe en wist het formulier", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(
      screen.getByLabelText(/Snelle instellingen/),
      "LinkedIn Ads",
    );
    expect((screen.getByLabelText(/^Source/) as HTMLInputElement).value).toBe(
      "LinkedIn",
    );
    expect((screen.getByLabelText(/^Medium/) as HTMLInputElement).value).toBe(
      "cpc",
    );
    await user.clear(screen.getByLabelText(/^Source/));
    await user.type(screen.getByLabelText(/^Source/), "eigen_partner");
    expect(
      (screen.getByLabelText(/Snelle instellingen/) as HTMLSelectElement).value,
    ).toBe("Aangepast");
    await user.click(screen.getByRole("button", { name: /Wis velden/ }));
    expect((screen.getByLabelText(/^Source/) as HTMLInputElement).value).toBe(
      "",
    );
  });
  it("slaat een geopende link op en kan de volledige geschiedenis wissen", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: /Eerst even proberen/ }),
    );
    const link = screen.getByRole("link", { name: /Open URL/ });
    expect(link.getAttribute("target")).toBe("_blank");
    await user.click(link);
    expect(JSON.parse(localStorage.getItem(historyKey)!)).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: /Wis geschiedenis/ }));
    expect(JSON.parse(localStorage.getItem(historyKey)!)).toHaveLength(0);
  });
  it("toont een fout bij geweigerde klembordtoegang zonder geschiedenis op te slaan", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new Error("denied"),
    );
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: /Eerst even proberen/ }),
    );
    await user.click(screen.getByRole("button", { name: /Kopieer URL/ }));
    expect(await screen.findByText(/Kopiëren is niet gelukt/)).toBeTruthy();
    expect(localStorage.getItem(historyKey)).toBeNull();
  });
});
