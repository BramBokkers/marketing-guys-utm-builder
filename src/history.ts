import { generateUrl } from "./utm";
import type { FormValues } from "./config";
export type HistoryItem = { url: string; values: FormValues; date: string };
export const historyKey = "marketing-guys-utm-history-v1";
export function readHistory(): HistoryItem[] {
  const raw = localStorage.getItem(historyKey);
  if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) return [];
  return data
    .filter((item): item is HistoryItem => {
      if (
        !item ||
        typeof item !== "object" ||
        typeof item.url !== "string" ||
        typeof item.date !== "string" ||
        !Number.isFinite(Date.parse(item.date)) ||
        !item.values
      )
        return false;
      if (
        ![
          "website",
          "source",
          "medium",
          "campaign",
          "id",
          "term",
          "content",
        ].every((key) => typeof item.values[key] === "string")
      )
        return false;
      return generateUrl(item.values) === item.url;
    })
    .filter(
      (item, index, items) =>
        items.findIndex((other) => other.url === item.url) === index,
    )
    .slice(0, 20);
}
export function addHistory(
  items: HistoryItem[],
  item: HistoryItem,
): HistoryItem[] {
  return [item, ...items.filter((existing) => existing.url !== item.url)].slice(
    0,
    20,
  );
}
