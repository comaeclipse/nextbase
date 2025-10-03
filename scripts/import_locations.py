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
}

STATE_FIXES = {
    "Tennesee": "Tennessee",
}

CITY_FIXES = {
    "Lousville": "Louisville",
}

DEFAULT_BENEFIT = "No state-specific veteran benefit noted."


def slugify(value: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return cleaned


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
    state = STATE_FIXES.get(row.get("State", ""), row.get("State", "")).strip()
    city = CITY_FIXES.get(row.get("City", ""), row.get("City", "")).strip()
    party_code = (row.get("Governor") or "").strip().upper()
    governor_party = PARTY_MAP.get(party_code, "independent")

    cost_raw = parse_int(row.get("COL"))
    cost_of_living = cost_raw if cost_raw else 95
    cost_of_living_label = classify_cost_of_living(cost_of_living)

    sunny_days = parse_int(row.get("Sun"))

    climate_text = (row.get("Climate") or "").strip()
    climate = climate_text
    if sunny_days:
        climate = f"{climate_text} with roughly {sunny_days} sunny days per year."

    veteran_benefits = (row.get("Veterans Benefits") or "").strip() or DEFAULT_BENEFIT

    gifford_score = (row.get("Gifford Score") or "").strip()

    destination = {
        "id": slugify(f"{city}-{state}"),
        "city": city,
        "state": state,
        "governorParty": governor_party,
        "population": parse_int(row.get("Population")),
        "lgbtqScore": parse_int(row.get("LGBTQ")),
        "salesTax": parse_decimal(row.get("Sales Tax")),
        "incomeTax": parse_decimal(row.get("Income")),
        "marijuanaStatus": (row.get("Marijuana") or "Unknown").strip().lower(),
        "firearmLaws": grade_to_firearm(gifford_score),
        "giffordScore": gifford_score or "Unknown",
        "veteranBenefits": veteran_benefits,
        "climate": climate,
        "snowfall": parse_decimal(row.get("Snow")),
        "rainfall": parse_decimal(row.get("Rain")),
        "gasPrice": parse_float(row.get("Gas Price")),
        "costOfLiving": cost_of_living,
        "costOfLivingLabel": cost_of_living_label,
        "sunnyDays": sunny_days,
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
