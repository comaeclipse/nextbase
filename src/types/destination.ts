export type GovernorParty = "democrat" | "republican" | "independent" | "nonpartisan";

export type MarijuanaStatus = "recreational" | "medical" | "decriminalized" | "illegal";

export type FirearmLaw = "permissive" | "moderate" | "restrictive";

export type CostOfLivingLabel = "Low" | "Low/Medium" | "Medium" | "High" | "Very High";

export interface Destination {
  id: string;
  stateCode: string;
  city: string;
  county: string;
  state: string;
  stateParty: GovernorParty;
  governorParty: GovernorParty;
  mayorParty: GovernorParty;
  population: number;
  density: number;
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
  lgbtqScore: number;
  techHub: boolean;
  vaSupport: boolean;
  tciScore: number;
  alwScore: number;
  ahsScore: number;
  election2016Winner: string;
  election2016Percent: number;
  election2024Winner: string;
  election2024Percent: number;
  electionChange: string;
}
