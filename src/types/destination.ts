export type GovernorParty = "democrat" | "republican" | "independent" | "nonpartisan";

export type MarijuanaStatus = "recreational" | "medical" | "decriminalized" | "illegal";

export type FirearmLaw = "permissive" | "moderate" | "restrictive";

export type CostOfLivingLabel = "Low" | "Low/Medium" | "Medium" | "High" | "Very High";

export interface Destination {
  id: string;
  city: string;
  state: string;
  governorParty: GovernorParty;
  population: number;
  lgbtqScore: number;
  salesTax: number;
  incomeTax: number;
  marijuanaStatus: MarijuanaStatus;
  firearmLaws: FirearmLaw;
  giffordScore: string;
  veteranBenefits: string;
  climate: string;
  snowfall: number;
  rainfall: number;
  gasPrice: number;
  costOfLiving: number;
  costOfLivingLabel: CostOfLivingLabel;
  sunnyDays: number;
}
