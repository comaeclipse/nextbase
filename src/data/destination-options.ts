import type { FirearmLaw, GovernorParty, MarijuanaStatus } from "@/types/destination";

export const PARTY_OPTIONS: { label: string; value: GovernorParty }[] = [
  { label: "Democrat", value: "democrat" },
  { label: "Republican", value: "republican" },
  { label: "Independent", value: "independent" },
  { label: "Nonpartisan", value: "nonpartisan" },
];

export const MARIJUANA_OPTIONS: { label: string; value: MarijuanaStatus }[] = [
  { label: "Recreational", value: "recreational" },
  { label: "Medical", value: "medical" },
  { label: "Decriminalized", value: "decriminalized" },
  { label: "Illegal", value: "illegal" },
];

export const FIREARM_OPTIONS: { label: string; value: FirearmLaw }[] = [
  { label: "Permissive", value: "permissive" },
  { label: "Moderate", value: "moderate" },
  { label: "Restrictive", value: "restrictive" },
];
