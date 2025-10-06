import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = Path(r"C:\\Users\\Meeter\\Downloads\\Locations.csv")
OUTPUT_PATH = ROOT / "src" / "data" / "destinations.json"

PARTY_MAP = {
    "R": "republican",
    "D": "democrat",
    "I": "independent",
    "N": "nonpartisan",
    "M": "nonpartisan",
}

STATE_NAMES = {
    "AK": "Alaska",
    "AL": "Alabama",
    "AR": "Arkansas",
    "AZ": "Arizona",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DC": "District of Columbia",
    "DE": "Delaware",
    "FL": "Florida",
    "GA": "Georgia",
    "HI": "Hawaii",
    "IA": "Iowa",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "MA": "Massachusetts",
    "MD": "Maryland",
    "ME": "Maine",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MO": "Missouri",
    "MS": "Mississippi",
    "MT": "Montana",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "NE": "Nebraska",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NV": "Nevada",
    "NY": "New York",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PA": "Pennsylvania",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VA": "Virginia",
    "VT": "Vermont",
    "WA": "Washington",
    "WI": "Wisconsin",
    "WV": "West Virginia",
    "WY": "Wyoming",
}

CITY_FIXES = {
    "Lousville": "Louisville",
    "Tuscon": "Tucson",
}

DEFAULT_BENEFIT = "No state-specific veteran benefit noted."


def slugify(value: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return cleaned


def party_from(code: str) -> str:
    key = (code or "").strip().upper()
    return PARTY_MAP.get(key, "independent")


def grade_to_firearm(grade: str) -> str:
    if not grade:
        return "moderate"
    normalized = grade.strip().upper()
    if normalized[0] in {"A", "B"}:
        return "restrictive"
    if normalized[0] == "C":
        return "moderate"
    return "permissive"


def parse_float(value: str) -> float:
    value = (value or "").replace("$", "").replace(",", "").strip()
    if not value or value == "?":
        return 0.0
    return round(float(value), 2)


def parse_int(value: str) -> int:
    value = (value or "").replace(",", "").strip()
    if not value or value == "?":
        return 0
    return int(float(value))


def parse_decimal(value: str) -> float:
    value = (value or "").replace(",", "").strip()
    if not value or value == "?":
        return 0.0
    return round(float(value), 2)


def parse_percent(value: str) -> float:
    raw = (value or "").replace("%", "").strip()
    if not raw:
        return 0.0
    return round(float(raw), 2)


def parse_bool(value: str) -> bool:
    normalized = (value or "").strip().lower()
    return normalized in {"y", "yes", "true"}


def classify_cost_of_living(index: int) -> str:
    if index <= 90:
        return "Low"
    if index <= 97:
        return "Low/Medium"
    if index <= 105:
        return "Medium"
    if index <= 120:
        return "High"
    return "Very High"


def build_destination(row: dict) -> dict:
    state_code = (row.get("State") or "").strip()
    state = STATE_NAMES.get(state_code, state_code)
    county = (row.get("County") or "").strip()

    city_raw = (row.get("City") or "").strip()
    city = CITY_FIXES.get(city_raw, city_raw)

    state_party = party_from(row.get("StateParty"))
    governor_party = party_from(row.get("Governor"))
    mayor_party = party_from(row.get("Mayor"))

    cost_index = parse_int(row.get("COL"))
    cost_of_living = cost_index if cost_index else 95
    cost_of_living_label = classify_cost_of_living(cost_of_living)

    sunny_days = parse_int(row.get("Sun"))

    climate_text = (row.get("Climate") or "").strip()
    climate = climate_text
    if sunny_days:
        climate = f"{climate_text} with roughly {sunny_days} sunny days per year."

    veteran_benefits = (row.get("Veterans Benefits") or "").strip() or DEFAULT_BENEFIT

    gifford_score = (row.get("Gifford") or "").strip()

    destination = {
        "id": slugify(f"{city}-{state}"),
        "stateCode": state_code,
        "city": city,
        "county": county,
        "state": state,
        "stateParty": state_party,
        "governorParty": governor_party,
        "mayorParty": mayor_party,
        "population": parse_int(row.get("Population")),
        "density": parse_int(row.get("Density")),
        "salesTax": parse_decimal(row.get("Sales Tax")),
        "incomeTax": parse_decimal(row.get("Income")),
        "marijuanaStatus": (row.get("Marijuana") or "Unknown").strip().lower(),
        "firearmLaws": grade_to_firearm(gifford_score),
        "giffordScore": gifford_score or "Unknown",
        "veteranBenefits": veteran_benefits,
        "climate": climate,
        "snowfall": parse_decimal(row.get("Snow")),
        "rainfall": parse_decimal(row.get("Rain")),
        "gasPrice": parse_float(row.get("Gas")),
        "costOfLiving": cost_of_living,
        "costOfLivingLabel": cost_of_living_label,
        "sunnyDays": sunny_days,
        "lgbtqScore": parse_int(row.get("LGBTQ")),
        "techHub": parse_bool(row.get("Tech")),
        "vaSupport": parse_bool(row.get("VA")),
        "tciScore": parse_int(row.get("TCI")),
        "alwScore": parse_int(row.get("ALW")),
        "ahsScore": parse_int(row.get("AHS")),
        "election2016Winner": (row.get("2016Election") or "").strip(),
        "election2016Percent": parse_percent(row.get("2016PresidentPercent")),
        "election2024Winner": (row.get("2024 Election") or "").strip(),
        "election2024Percent": parse_percent(row.get("2024PresidentPercent")),
        "electionChange": (row.get("ElectionChange") or "").strip(),
    }

    return destination


def main() -> None:
    if not CSV_PATH.exists():
        raise SystemExit(f"CSV file not found: {CSV_PATH}")

    with CSV_PATH.open(newline="", encoding="utf-8") as source:
        reader = csv.DictReader(source)
        destinations = [build_destination(row) for row in reader]

    destinations = [destination for destination in destinations if destination["city"]]
    destinations.sort(key=lambda item: (item["city"], item["state"]))

    payload = json.dumps(destinations, indent=2) + "\n"
    OUTPUT_PATH.write_text(payload, encoding="utf-8")

    print(f"Wrote {len(destinations)} destinations to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
