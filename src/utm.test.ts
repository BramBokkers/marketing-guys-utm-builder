import { describe, expect, it } from "vitest";
import { emptyForm, example, parameters, presets } from "./config";
import { generateUrl, parseWebsite, validate, warnings } from "./utm";
import { addHistory, historyKey, readHistory } from "./history";

describe("UTM-generator", () => {
  it("genereert exact het Marketing Guys-voorbeeld", () => {
    expect(generateUrl(example)).toBe(
      "https://marketingguys.com/nl/strategie/revenue-operations/?utm_source=LinkedIn&utm_medium=cpc&utm_campaign=CamptoGo_Checklist_GedoeVoorkomen",
    );
  });
  it.each(["website", "source", "medium"] as const)("vereist %s", (field) => {
    expect(validate({ ...example, [field]: "  " })[field]).toBeTruthy();
    expect(generateUrl({ ...example, [field]: "" })).toBeNull();
  });
  it("laat lege optionele parameters weg", () => {
    expect(
      generateUrl({
        ...emptyForm,
        website: "https://example.com",
        source: "LinkedIn",
        medium: "cpc",
        campaign: "  ",
      }),
    ).toBe("https://example.com/?utm_source=LinkedIn&utm_medium=cpc");
  });
  it("behoudt herhaalde niet-UTM-queryparameters en het fragment", () => {
    const result = new URL(
      generateUrl({
        ...example,
        website:
          "https://example.com/path?category=a&category=b&search=a%26b#download",
      })!,
    );
    expect(result.searchParams.getAll("category")).toEqual(["a", "b"]);
    expect(result.searchParams.get("search")).toBe("a&b");
    expect(result.hash).toBe("#download");
  });
  it("vervangt dubbele, onbekende en afwijkend geschreven UTM-parameters", () => {
    const result = new URL(
      generateUrl({
        ...example,
        campaign: "",
        website:
          "https://example.com/?utm_source=old&utm_source=duplicate&utm_campaign=old&utm_custom=x&UTM_MEDIUM=old&keep=1",
      })!,
    );
    expect([...result.searchParams.keys()]).toEqual([
      "keep",
      "utm_source",
      "utm_medium",
    ]);
    expect(result.searchParams.getAll("utm_source")).toEqual(["LinkedIn"]);
  });
  it("gebruikt de voorgeschreven parametervolgorde", () => {
    const result = new URL(
      generateUrl({ ...example, id: "123", term: "term", content: "content" })!,
    );
    expect([...result.searchParams.keys()]).toEqual(
      parameters.map(([, key]) => key),
    );
  });
  it("codeert speciale tekens en spaties zonder hoofdletters te wijzigen", () => {
    const values = {
      ...example,
      source: "LinkedIn",
      campaign: "Zomer & Café + 50% / 日本語 #1",
      content: " A B ",
    };
    const result = new URL(generateUrl(values)!);
    expect(result.searchParams.get("utm_campaign")).toBe(values.campaign);
    expect(result.searchParams.get("utm_content")).toBe(values.content);
    expect(result.searchParams.get("utm_source")).toBe("LinkedIn");
    expect(result.hash).toBe("");
  });
  it.each([
    "",
    "example.com",
    "javascript:alert(1)",
    "ftp://example.com",
    "https://",
    "/relative",
    "http:example.com",
    "https://bad host.com",
  ])("weigert ongeldige URL %s", (website) => {
    expect(parseWebsite(website)).toBeNull();
    expect(generateUrl({ ...example, website })).toBeNull();
  });
  it.each([
    "http://localhost:3000/page",
    "https://example.com",
    "HTTPS://EXAMPLE.COM",
  ])("accepteert http(s) %s", (website) =>
    expect(generateUrl({ ...example, website })).toBeTruthy(),
  );
  it("waarschuwt voor bestaande tags en afwijkende schrijfwijzen", () => {
    expect(
      warnings({
        ...example,
        website: "https://example.com/?utm_medium=old",
        source: "linkedin",
        medium: "CPC",
      }),
    ).toHaveLength(3);
    expect(warnings(example)).toEqual([]);
  });
  it.each(presets)("genereert geldige links voor $name", (preset) => {
    const result = new URL(
      generateUrl({ ...emptyForm, website: "https://example.com", ...preset })!,
    );
    expect(result.searchParams.get("utm_source")).toBe(preset.source);
    expect(result.searchParams.get("utm_medium")).toBe(preset.medium);
  });
  it("configureert LinkedIn Ads volgens de bestaande werkwijze", () =>
    expect(presets.find((preset) => preset.name === "LinkedIn Ads")).toEqual({
      name: "LinkedIn Ads",
      source: "LinkedIn",
      medium: "cpc",
    }));
});
describe("lokale geschiedenis", () => {
  const item = {
    url: generateUrl(example)!,
    values: example,
    date: "2026-11-05T10:00:00.000Z",
  };
  it("voorkomt duplicaten en bewaart maximaal 20 items", () => {
    const items = Array.from({ length: 20 }, (_, index) => ({
      ...item,
      url: `${item.url}&n=${index}`,
    }));
    const result = addHistory(items, item);
    expect(result).toHaveLength(20);
    expect(
      addHistory(result, item).filter((entry) => entry.url === item.url),
    ).toHaveLength(1);
  });
  it("leest geldige geschiedenis en filtert onveilige of beschadigde items", () => {
    localStorage.setItem(
      historyKey,
      JSON.stringify([
        item,
        item,
        { ...item, url: "javascript:alert(1)" },
        { ...item, values: {} },
        null,
      ]),
    );
    expect(readHistory()).toEqual([item]);
    localStorage.clear();
  });
});
