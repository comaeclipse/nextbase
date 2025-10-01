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
  vaResourcesScore: number; // 1-5, proximity and services
  healthcareIndex: number; // 0 - 100 overall quality
  summary: string;
  highlights: string[];
  heroImage: string;
}

export const destinations: Destination[] = [
  {
    id: "tampa-bay-fl",
    name: "Tampa Bay",
    state: "Florida",
    region: "Southeast",
    climate: ["warm", "humid", "coastal"],
    taxBand: "very-low",
    costOfLivingIndex: 95,
    lifestyle: ["coastal living", "tech culture", "family friendly"],
    techPresence: "emerging",
    gunLaws: "permissive",
    vaResourcesScore: 5,
    healthcareIndex: 78,
    summary:
      "Sun-soaked coasts, zero state income tax, and a fast-growing tech corridor make Tampa a popular landing spot for veterans seeking balance.",
    highlights: [
      "MacDill AFB support network",
      "No state income tax on military pensions",
      "Vibrant waterfront communities",
    ],
    heroImage: "/images/destinations/tampa.jpg",
  },
  {
    id: "colorado-springs-co",
    name: "Colorado Springs",
    state: "Colorado",
    region: "Mountain West",
    climate: ["temperate", "mountain"],
    taxBand: "low",
    costOfLivingIndex: 102,
    lifestyle: ["outdoor recreation", "family friendly"],
    techPresence: "emerging",
    gunLaws: "moderate",
    vaResourcesScore: 5,
    healthcareIndex: 82,
    summary:
      "Gateway to the Rockies with four-season recreation, strong VA healthcare, and a proud military legacy anchored by multiple installations.",
    highlights: [
      "U.S. Air Force Academy community",
      "Expansive trail systems and parks",
      "Robust veteran-owned business network",
    ],
    heroImage: "/images/destinations/colorado-springs.jpg",
  },
  {
    id: "asheville-nc",
    name: "Asheville",
    state: "North Carolina",
    region: "Southeast",
    climate: ["temperate", "mountain"],
    taxBand: "moderate",
    costOfLivingIndex: 106,
    lifestyle: ["arts & culture", "outdoor recreation", "historic charm"],
    techPresence: "limited",
    gunLaws: "moderate",
    vaResourcesScore: 4,
    healthcareIndex: 74,
    summary:
      "Blue Ridge mountain town known for its arts scene, craft cuisine, and easy access to the Appalachian Trail.",
    highlights: [
      "Community-driven veteran initiatives",
      "Thriving local art and music scene",
      "Nearby VA Medical Center",
    ],
    heroImage: "/images/destinations/asheville.jpg",
  },
  {
    id: "austin-tx",
    name: "Austin",
    state: "Texas",
    region: "Southwest",
    climate: ["warm"],
    taxBand: "very-low",
    costOfLivingIndex: 112,
    lifestyle: ["tech culture", "arts & culture", "family friendly"],
    techPresence: "established",
    gunLaws: "permissive",
    vaResourcesScore: 4,
    healthcareIndex: 76,
    summary:
      "A cutting-edge tech hub with live music on every corner, zero income tax, and a deep bench of veteran entrepreneurs.",
    highlights: [
      "Capital Factory Veteran in Residence program",
      "Top-ranked VA outpatient clinics",
      "Year-round festivals and trails",
    ],
    heroImage: "/images/destinations/austin.jpg",
  },
  {
    id: "madison-wi",
    name: "Madison",
    state: "Wisconsin",
    region: "Midwest",
    climate: ["temperate", "cold"],
    taxBand: "moderate",
    costOfLivingIndex: 96,
    lifestyle: ["family friendly", "arts & culture", "outdoor recreation"],
    techPresence: "emerging",
    gunLaws: "moderate",
    vaResourcesScore: 5,
    healthcareIndex: 88,
    summary:
      "College-town energy meets lake-life relaxation with excellent healthcare access and strong veteran resource centers.",
    highlights: [
      "Madison VA Hospital research hub",
      "Bike-friendly infrastructure",
      "Diverse seasonal community events",
    ],
    heroImage: "/images/destinations/madison.jpg",
  },
  {
    id: "portland-me",
    name: "Portland",
    state: "Maine",
    region: "Northeast",
    climate: ["coastal", "cold"],
    taxBand: "moderate",
    costOfLivingIndex: 108,
    lifestyle: ["coastal living", "historic charm", "arts & culture"],
    techPresence: "limited",
    gunLaws: "restrictive",
    vaResourcesScore: 4,
    healthcareIndex: 83,
    summary:
      "Scenic harbor city with a renowned culinary scene, rugged coastline, and a tight-knit veteran community.",
    highlights: [
      "Portland VA Medical Center",
      "Ferry access to Casco Bay islands",
      "Walkable arts district",
    ],
    heroImage: "/images/destinations/portland-me.jpg",
  },
  {
    id: "seattle-wa",
    name: "Seattle",
    state: "Washington",
    region: "Pacific Northwest",
    climate: ["temperate", "coastal"],
    taxBand: "low",
    costOfLivingIndex: 124,
    lifestyle: ["tech culture", "coastal living", "arts & culture"],
    techPresence: "established",
    gunLaws: "restrictive",
    vaResourcesScore: 5,
    healthcareIndex: 90,
    summary:
      "A tech-forward city with deep military roots, world-class healthcare, and ferry-linked exploration of the Puget Sound.",
    highlights: [
      "VA Puget Sound Health Care System",
      "Global tech giants with veteran hiring programs",
      "Access to Olympic and Cascade ranges",
    ],
    heroImage: "/images/destinations/seattle.jpg",
  },
  {
    id: "algarve-pt",
    name: "Algarve Coast",
    state: "Portugal",
    region: "International",
    climate: ["warm", "coastal"],
    taxBand: "low",
    costOfLivingIndex: 72,
    lifestyle: ["international adventure", "coastal living", "historic charm"],
    techPresence: "limited",
    gunLaws: "restrictive",
    vaResourcesScore: 3,
    healthcareIndex: 80,
    summary:
      "Sun-drenched European coastline with favorable residency options for veterans seeking international retirement.",
    highlights: [
      "Affordable seaside communities",
      "EU healthcare access",
      "Active expat veteran networks",
    ],
    heroImage: "/images/destinations/algarve.jpg",
  },
];
