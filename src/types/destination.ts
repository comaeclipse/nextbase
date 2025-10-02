export type GovernorParty = "democrat" | "republican" | "independent" | "nonpartisan";

export type MarijuanaStatus = "recreational" | "medical" | "decriminalized" | "illegal";

export type FirearmLaw = "permissive" | "moderate" | "restrictive";

export interface Destination {
  id: string;
  city: string;
  state: string;
  governorName: string;
  governorParty: GovernorParty;
  salesTax: number;
  incomeTax: number;
  marijuanaStatus: MarijuanaStatus;
  firearmLaws: FirearmLaw;
  veteranBenefits: string;
  climate: string;
  snowfall: number;
  rainfall: number;
  gasPrice: number;
  costOfLiving: number;
}
