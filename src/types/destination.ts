export type Region =
  | "Pacific Northwest"
  | "Mountain West"
  | "Southwest"
  | "Southeast"
  | "Midwest"
  | "Northeast"
  | "International";

export type ClimateProfile =
  | "temperate"
  | "warm"
  | "humid"
  | "coastal"
  | "desert"
  | "mountain"
  | "cold";

export type LifestyleTag =
  | "coastal living"
  | "outdoor recreation"
  | "urban convenience"
  | "tech culture"
  | "family friendly"
  | "historic charm"
  | "international adventure"
  | "arts & culture";

export type TaxBand = "very-low" | "low" | "moderate" | "high";
export type GunLawProfile = "permissive" | "moderate" | "restrictive";
export type TechPresence = "established" | "emerging" | "limited";

export interface Destination {
  id: string;
  name: string;
  state: string;
  region: Region;
  climate: ClimateProfile[];
  taxBand: TaxBand;
  costOfLivingIndex: number;
  lifestyle: LifestyleTag[];
  techPresence: TechPresence;
  gunLaws: GunLawProfile;
  vaResourcesScore: number;
  healthcareIndex: number;
  summary: string;
  highlights: string[];
  heroImage: string;
}
