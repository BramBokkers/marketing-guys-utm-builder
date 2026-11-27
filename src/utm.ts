import { conventions, parameters, type FormValues } from "./config";
export function parseWebsite(value: string): URL | null {
  if (!/^https?:\/\//i.test(value.trim())) return null;
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) && url.hostname
      ? url
      : null;
  } catch {
    return null;
  }
}
export function validate(
  values: FormValues,
): Partial<Record<keyof FormValues, string>> {
  const errors: Partial<Record<keyof FormValues, string>> = {};
  if (!values.website.trim()) errors.website = "Vul een bestemmings-URL in.";
  else if (!parseWebsite(values.website))
    errors.website =
      "Gebruik een geldige URL die begint met https:// of http://.";
  if (!values.source.trim())
    errors.source = "Vul de herkomst van het verkeer in.";
  if (!values.medium.trim()) errors.medium = "Vul het marketingkanaal in.";
  return errors;
}
export function generateUrl(values: FormValues): string | null {
  if (Object.keys(validate(values)).length) return null;
  const url = parseWebsite(values.website)!;
  for (const key of [...url.searchParams.keys()])
    if (key.toLowerCase().startsWith("utm_")) url.searchParams.delete(key);
  for (const [field, key] of parameters)
    if (values[field].trim()) url.searchParams.set(key, values[field]);
  return url.toString();
}
export function warnings(values: FormValues): string[] {
  const messages: string[] = [];
  const url = parseWebsite(values.website);
  if (
    url &&
    [...url.searchParams.keys()].some((key) =>
      key.toLowerCase().startsWith("utm_"),
    )
  )
    messages.push(
      "Deze URL bevat al UTM-tags. Ze worden vervangen door de waarden uit dit formulier.",
    );
  for (const field of ["source", "medium"] as const) {
    const value = values[field];
    const preferred = conventions[field].find(
      (item) => item.toLowerCase() === value.toLowerCase(),
    );
    if (preferred && preferred !== value)
      messages.push(
        `De voorkeurswaarde voor ${field === "source" ? "Source" : "Medium"} is “${preferred}”. Je invoer “${value}” blijft behouden; GA4 onderscheidt hoofdletters.`,
      );
    if (value && value.trim() !== value)
      messages.push(
        `${field === "source" ? "Source" : "Medium"} bevat spaties aan het begin of einde. Controleer de schrijfwijze; je invoer blijft behouden.`,
      );
  }
  return messages;
}
