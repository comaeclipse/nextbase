import type {
  ClimateProfile,
  Destination,
  GunLawProfile,
  LifestyleTag,
  Region,
  TaxBand,
  TechPresence,
} from "@/types/destination";

export interface FilterState {
  regions: Region[];
  climates: ClimateProfile[];
  lifestyle: LifestyleTag[];
  taxBands: TaxBand[];
  techPresence: TechPresence[];
  gunLaws: GunLawProfile[];
  maxCostOfLiving: number;
  minVaScore: number;
  search: string;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  regions: [],
  climates: [],
  lifestyle: [],
  taxBands: [],
  techPresence: [],
  gunLaws: [],
  maxCostOfLiving: 130,
  minVaScore: 0,
  search: "",
};

export function filterDestinations(
  destinations: Destination[],
  filters: FilterState,
): Destination[] {
  return destinations.filter((destination) => {
    if (filters.regions.length && !filters.regions.includes(destination.region)) {
      return false;
    }

    if (filters.climates.length && !filters.climates.some((climate) => destination.climate.includes(climate))) {
      return false;
    }

    if (filters.lifestyle.length && !filters.lifestyle.some((tag) => destination.lifestyle.includes(tag))) {
      return false;
    }

    if (filters.taxBands.length && !filters.taxBands.includes(destination.taxBand)) {
      return false;
    }

    if (filters.techPresence.length && !filters.techPresence.includes(destination.techPresence)) {
      return false;
    }

    if (filters.gunLaws.length && !filters.gunLaws.includes(destination.gunLaws)) {
      return false;
    }

    if (destination.costOfLivingIndex > filters.maxCostOfLiving) {
      return false;
    }

    if (destination.vaResourcesScore < filters.minVaScore) {
      return false;
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      const haystack = `${destination.name} ${destination.state} ${destination.summary} ${destination.lifestyle.join(" ")}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

export type ActiveFilter = {
  label: string;
  value: string;
  category:
    | "Region"
    | "Climate"
    | "Lifestyle"
    | "Tax"
    | "Tech"
    | "Gun laws"
    | "Cost of living"
    | "VA resources"
    | "Search";
};

export function describeActiveFilters(filters: FilterState): ActiveFilter[] {
  const pills: ActiveFilter[] = [];

  filters.regions.forEach((value) => pills.push({ category: "Region", label: value, value }));
  filters.climates.forEach((value) => pills.push({ category: "Climate", label: value, value }));
  filters.lifestyle.forEach((value) => pills.push({ category: "Lifestyle", label: value, value }));
  filters.taxBands.forEach((value) => pills.push({ category: "Tax", label: formatLabel(value), value }));
  filters.techPresence.forEach((value) => pills.push({ category: "Tech", label: formatLabel(value), value }));
  filters.gunLaws.forEach((value) => pills.push({ category: "Gun laws", label: formatLabel(value), value }));

  if (filters.maxCostOfLiving < DEFAULT_FILTER_STATE.maxCostOfLiving) {
    pills.push({
      category: "Cost of living",
      label: `<= ${filters.maxCostOfLiving}`,
      value: filters.maxCostOfLiving.toString(),
    });
  }

  if (filters.minVaScore > DEFAULT_FILTER_STATE.minVaScore) {
    pills.push({
      category: "VA resources",
      label: `>= ${filters.minVaScore} stars`,
      value: filters.minVaScore.toString(),
    });
  }

  if (filters.search) {
    pills.push({ category: "Search", label: filters.search, value: filters.search });
  }

  return pills;
}

function formatLabel(value: string) {
  return value
    .split(/[\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
