export const parameters = [
  ["source", "utm_source"],
  ["medium", "utm_medium"],
  ["campaign", "utm_campaign"],
  ["id", "utm_id"],
  ["term", "utm_term"],
  ["content", "utm_content"],
] as const;
export type Parameter = (typeof parameters)[number][0];
export type FormValues = Record<Parameter | "website", string>;
export const emptyForm: FormValues = {
  website: "",
  source: "",
  medium: "",
  campaign: "",
  id: "",
  term: "",
  content: "",
};
export const example: FormValues = {
  ...emptyForm,
  website: "https://marketingguys.com/nl/strategie/revenue-operations/",
  source: "LinkedIn",
  medium: "cpc",
  campaign: "CamptoGo_Checklist_GedoeVoorkomen",
};
export const conventions = {
  source: [
    "LinkedIn",
    "google",
    "facebook",
    "instagram",
    "newsletter",
    "partner",
    "qr_code",
  ],
  medium: [
    "cpc",
    "paid_social",
    "organic_social",
    "email",
    "referral",
    "qr_code",
  ],
};
export const presets = [
  { name: "LinkedIn Ads", source: "LinkedIn", medium: "cpc" },
  { name: "Google Ads", source: "google", medium: "cpc" },
  { name: "Facebook Ads", source: "facebook", medium: "paid_social" },
  { name: "Instagram Ads", source: "instagram", medium: "paid_social" },
  { name: "Organisch LinkedIn", source: "LinkedIn", medium: "organic_social" },
  { name: "E-mail / nieuwsbrief", source: "newsletter", medium: "email" },
  { name: "QR-code", source: "qr_code", medium: "qr_code" },
  { name: "Partnerlink", source: "partner", medium: "referral" },
];
