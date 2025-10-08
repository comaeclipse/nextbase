import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

type MarijuanaStatus = "recreational" | "medical" | "decriminalized" | "illegal";
type FirearmLaw = "restrictive" | "moderate" | "permissive";
type Party = "democrat" | "republican" | "independent" | "nonpartisan";

type GunLawInfo = {
  magazineLimit: string;
  ghostGunBan: boolean;
  assaultWeaponBan: boolean;
  giffordScore: string;
};

type Destination = {
  id: string;
  stateCode: string;
  city: string;
  county: string;
  state: string;
  stateParty: Party;
  governorParty: Party;
  mayorParty: Party;
  cityPoliticalLean: string;
  population: number;
  density: number;
  salesTax: number;
  incomeTax: number;
  marijuanaStatus: MarijuanaStatus;
  firearmLaws: FirearmLaw;
  giffordScore: string;
  magazineLimit: string;
  ghostGunBan: boolean;
  assaultWeaponBan: boolean;
  veteranBenefits: string;
  climate: string;
  snowfall: number;
  rainfall: number;
  gasPrice: number;
  costOfLiving: number;
  costOfLivingLabel: "Low" | "Low/Medium" | "Medium" | "High" | "Very High";
  sunnyDays: number;
  lgbtqScore: number;
  techHub: boolean;
  militaryHub: boolean;
  vaSupport: boolean;
  nearestVA: string;
  distanceToVA: string;
  humiditySummer: number;
  description: string;
  tciScore: number;
  alwScore: number;
  ahsScore: number;
  election2016Winner: string;
  election2016Percent: number;
  election2024Winner: string;
  election2024Percent: number;
  electionChange: string;
};

const STATE_CODES: Record<string, string> = {
  AK: "Alaska",
  AL: "Alabama",
  AR: "Arkansas",
  AZ: "Arizona",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  IA: "Iowa",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  MA: "Massachusetts",
  MD: "Maryland",
  ME: "Maine",
  MI: "Michigan",
  MN: "Minnesota",
  MO: "Missouri",
  MS: "Mississippi",
  MT: "Montana",
  NC: "North Carolina",
  ND: "North Dakota",
  NE: "Nebraska",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NV: "Nevada",
  NY: "New York",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WI: "Wisconsin",
  WV: "West Virginia",
  WY: "Wyoming",
};

const PARTY_MAP: Record<string, Party> = {
  R: "republican",
  D: "democrat",
  M: "nonpartisan",
  I: "independent",
  N: "nonpartisan",
};

const DEFAULT_MAGAZINE_LIMIT = "No state restrictions on magazine capacity";
const DEFAULT_VETERAN_BENEFIT = "No state-specific veteran benefit noted.";

function parseParty(code: string): Party {
  const normalized = (code || "").trim().toUpperCase();
  return PARTY_MAP[normalized] ?? "independent";
}

function parseMarijuana(status: string): MarijuanaStatus {
  const normalized = (status || "").trim().toLowerCase();
  if (normalized.startsWith("rec")) {
    return "recreational";
  }
  if (normalized.startsWith("med")) {
    return "medical";
  }
  if (normalized.startsWith("dec")) {
    return "decriminalized";
  }
  return "illegal";
}

function determineFirearmLaws(giffordScore: string): FirearmLaw {
  const grade = (giffordScore || "").trim().toUpperCase();
  if (!grade) {
    return "moderate";
  }
  const letter = grade.charAt(0);
  if (letter === "A" || letter === "B") {
    return "restrictive";
  }
  if (letter === "C") {
    return "moderate";
  }
  return "permissive";
}

function getCostOfLivingLabel(col: number): Destination["costOfLivingLabel"] {
  if (col <= 90) return "Low";
  if (col <= 96) return "Low/Medium";
  if (col <= 110) return "Medium";
  if (col <= 130) return "High";
  return "Very High";
}

function generateId(city: string, state: string): string {
  return `${city}-${state}`.toLowerCase().replace(/\s+/g, "-");
}

function parseNumber(value: string): number {
  const cleaned = (value || "").replace(/[$,%]/g, "").replace(/,/g, "").trim();
  if (!cleaned || cleaned === "NA" || cleaned === "?") {
    return 0;
  }
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseBoolean(value: string): boolean {
  const normalized = (value || "").trim().toLowerCase();
  return normalized === "y" || normalized === "yes" || normalized === "true";
}

function sanitizeText(value: string): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

function normalizeCityPoliticalLean(value: string): string {
  const cleaned = sanitizeText(value);
  return cleaned || "Not specified";
}

function normalizeAvailability(value: string): string {
  const cleaned = sanitizeText(value);
  if (!cleaned) {
    return "";
  }
  if (cleaned.toUpperCase() === "NA") {
    return "";
  }
  return cleaned;
}

function parseGunLawsCSV(csvPath: string): Map<string, GunLawInfo> {
  const content = readFileSync(csvPath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());
  const gunLawsMap = new Map<string, GunLawInfo>();

  for (let i = 1; i < lines.length; i += 1) {
    const values = lines[i].split(",").map((entry) => entry.trim());
    if (values.length < 5) {
      continue;
    }

    const stateCode = values[0];
    const magazineLimit = values[1] || DEFAULT_MAGAZINE_LIMIT;
    const giffordScore = values[2] || "Unknown";
    const ghostGunBan = values[3]?.toUpperCase() === "Y";
    const assaultWeaponBan = values[4]?.toUpperCase() === "Y";

    gunLawsMap.set(stateCode, {
      magazineLimit,
      ghostGunBan,
      assaultWeaponBan,
      giffordScore,
    });
  }

  return gunLawsMap;
}

function parseCSV(csvPath: string, gunLawsMap: Map<string, GunLawInfo>) {
  const content = readFileSync(csvPath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());
  if (lines.length === 0) {
    throw new Error("Locations CSV is empty.");
  }

  const headers = lines[0].split(",").map((header) => header.trim());
  const destinations: Destination[] = [];
  const issues: string[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of line) {
      if (char === "\"") {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (values.length < headers.length) {
      issues.push(`Line ${i + 1}: expected ${headers.length} columns, found ${values.length}`);
      continue;
    }

    const get = (field: string) => {
      const idx = headers.indexOf(field);
      return idx >= 0 ? values[idx] : "";
    };

    const stateCode = get("State");
    const cityRaw = get("City");
    const city = cityRaw === "Tuscon" ? "Tucson" : cityRaw;
    const county = get("County");
    const population = parseNumber(get("Population"));
    const density = parseNumber(get("Density"));
    const lgbtqRaw = get("LGBTQ");
    const lgbtqScore = parseNumber(lgbtqRaw);
    const cityPoliticalLean = normalizeCityPoliticalLean(get("CityPolitics"));
    const mayorCode = get("Mayor");
    const nearestVA = normalizeAvailability(get("NearestVA"));
    const distanceToVA = normalizeAvailability(get("DistanceToVA"));
    const humiditySummer = parseNumber(get("HumiditySummer"));
    const militaryHub = parseBoolean(get("MilitaryHub"));
    const description = sanitizeText(get("Description"));

    if (!population) {
      issues.push(`${city || "Unknown city"}, ${stateCode}: missing population value`);
    }
    if (!density) {
      issues.push(`${city || "Unknown city"}, ${stateCode}: missing density value`);
    }
    if (lgbtqRaw === "?") {
      issues.push(`${city || "Unknown city"}, ${stateCode}: LGBTQ score reported as '?'`);
    }

    const gunLaws = gunLawsMap.get(stateCode) ?? {
      magazineLimit: DEFAULT_MAGAZINE_LIMIT,
      ghostGunBan: false,
      assaultWeaponBan: false,
      giffordScore: "Unknown",
    };

    const sunnyDays = parseNumber(get("Sun"));
    const climateDescription = (get("Climate") || "").trim();
    const climate = sunnyDays
      ? `${climateDescription} with roughly ${sunnyDays} sunny days per year.`
      : climateDescription;

    const veteranBenefits = sanitizeText(get("Veterans Benefits")) || DEFAULT_VETERAN_BENEFIT;
    const costOfLiving = parseNumber(get("COL"));
    const costOfLivingLabel = getCostOfLivingLabel(costOfLiving || 95);

    const destination: Destination = {
      id: generateId(city, STATE_CODES[stateCode] || stateCode),
      stateCode,
      city,
      county,
      state: STATE_CODES[stateCode] || stateCode,
      stateParty: parseParty(get("StateParty")),
      governorParty: parseParty(get("Governor")),
      mayorParty: mayorCode ? parseParty(mayorCode) : "nonpartisan",
      cityPoliticalLean,
      population,
      density,
      salesTax: parseNumber(get("Sales Tax")),
      incomeTax: parseNumber(get("Income")),
      marijuanaStatus: parseMarijuana(get("Marijuana")),
      firearmLaws: determineFirearmLaws(gunLaws.giffordScore),
      giffordScore: gunLaws.giffordScore,
      magazineLimit: gunLaws.magazineLimit,
      ghostGunBan: gunLaws.ghostGunBan,
      assaultWeaponBan: gunLaws.assaultWeaponBan,
      veteranBenefits,
      climate,
      snowfall: parseNumber(get("Snow")),
      rainfall: parseNumber(get("Rain")),
      gasPrice: parseNumber(get("Gas")),
      costOfLiving,
      costOfLivingLabel,
      sunnyDays,
      lgbtqScore,
      techHub: parseBoolean(get("TechHub") || get("Tech")),
      militaryHub,
      vaSupport: parseBoolean(get("VA")),
      nearestVA,
      distanceToVA,
      humiditySummer,
      description,
      tciScore: parseNumber(get("TCI")),
      alwScore: parseNumber(get("ALW")),
      ahsScore: parseNumber(get("AHS")),
      election2016Winner: get("2016Election"),
      election2016Percent: parseNumber(get("2016PresidentPercent")),
      election2024Winner: get("2024 Election"),
      election2024Percent: parseNumber(get("2024PresidentPercent")),
      electionChange: get("ElectionChange"),
    };

    destinations.push(destination);
  }

  return { destinations, issues };
}

const csvPath = resolve("C:\\Users\\Meeter\\Downloads\\Locations.csv");
const gunLawsPath = resolve("C:\\Users\\Meeter\\Downloads\\Gunlaws.csv");
const outputPath = resolve(process.cwd(), "src", "data", "destinations.json");

const gunLawsMap = parseGunLawsCSV(gunLawsPath);
const { destinations, issues } = parseCSV(csvPath, gunLawsMap);

console.log("\n=== Import Summary ===");
console.log(`Total destinations: ${destinations.length}`);
console.log("\n=== Issues Found ===");
if (issues.length > 0) {
  issues.forEach((issue) => console.log(`- ${issue}`));
} else {
  console.log("- No issues found");
}

writeFileSync(outputPath, JSON.stringify(destinations, null, 2) + "\n", "utf-8");
console.log(`\nData written to ${outputPath}`);
