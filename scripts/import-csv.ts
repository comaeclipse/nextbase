import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const STATE_CODES: Record<string, string> = {
  'AK': 'Alaska', 'AL': 'Alabama', 'AR': 'Arkansas', 'AZ': 'Arizona',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'IA': 'Iowa',
  'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'MA': 'Massachusetts', 'MD': 'Maryland',
  'ME': 'Maine', 'MI': 'Michigan', 'MN': 'Minnesota', 'MO': 'Missouri',
  'MS': 'Mississippi', 'MT': 'Montana', 'NC': 'North Carolina', 'ND': 'North Dakota',
  'NE': 'Nebraska', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico',
  'NV': 'Nevada', 'NY': 'New York', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WI': 'Wisconsin',
  'WV': 'West Virginia', 'WY': 'Wyoming'
};

function parseParty(code: string): string {
  const map: Record<string, string> = {
    'R': 'republican',
    'D': 'democrat',
    'M': 'nonpartisan',
    'I': 'independent'
  };
  return map[code.toUpperCase()] || 'nonpartisan';
}

function parseMarijuana(status: string): string {
  return status.toLowerCase() as any;
}

function determineFirearmLaws(giffordScore: string): string {
  const grade = giffordScore.trim().toUpperCase().charAt(0);
  if (grade === 'A' || grade === 'B') return 'restrictive';
  if (grade === 'C' || grade === 'D') return 'moderate';
  return 'permissive';
}

function getCostOfLivingLabel(col: number): string {
  if (col < 90) return 'Low';
  if (col < 95) return 'Low/Medium';
  if (col < 110) return 'Medium';
  if (col < 130) return 'High';
  return 'Very High';
}

function generateId(city: string, state: string): string {
  return `${city}-${state}`.toLowerCase().replace(/\s+/g, '-');
}

function parseNumber(value: string): number {
  const cleaned = value.replace(/[,$]/g, '');
  return parseFloat(cleaned) || 0;
}

function parseGunLawsCSV(csvPath: string): Map<string, { magazineLimit: string; ghostGunBan: boolean; assaultWeaponBan: boolean }> {
  const content = readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const gunLawsMap = new Map();

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < 4) continue;

    const stateCode = values[0];
    const magazineLimit = values[1] || 'No state restrictions on magazine capacity';
    const ghostGunBan = values[2]?.toUpperCase() === 'Y';
    const assaultWeaponBan = values[3]?.toUpperCase() === 'Y';

    gunLawsMap.set(stateCode, { magazineLimit, ghostGunBan, assaultWeaponBan });
  }

  return gunLawsMap;
}

function parseCSV(csvPath: string, gunLawsMap: Map<string, any>) {
  const content = readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());

  const destinations = [];
  const issues = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (values.length < headers.length) {
      issues.push(`Line ${i + 1}: Insufficient columns`);
      continue;
    }

    const get = (field: string) => {
      const idx = headers.indexOf(field);
      return idx >= 0 ? values[idx] : '';
    };

    const stateCode = get('State');
    const city = get('City');
    const county = get('County');
    const population = parseNumber(get('Population'));
    const density = parseNumber(get('Density'));

    // Report issues
    if (!population) {
      issues.push(`${city}, ${stateCode}: Missing population`);
    }
    if (!density) {
      issues.push(`${city}, ${stateCode}: Missing density`);
    }
    if (city === 'Tuscon') {
      issues.push(`${city}, ${stateCode}: City name misspelled (should be Tucson)`);
    }

    const lgbtqRaw = get('LGBTQ');
    const lgbtqScore = lgbtqRaw === '?' ? 0 : parseNumber(lgbtqRaw);

    const gunLaws = gunLawsMap.get(stateCode) || {
      magazineLimit: 'No state restrictions on magazine capacity',
      ghostGunBan: false,
      assaultWeaponBan: false
    };

    const destination = {
      id: generateId(city, STATE_CODES[stateCode] || stateCode),
      stateCode,
      city,
      county,
      state: STATE_CODES[stateCode] || stateCode,
      stateParty: parseParty(get('StateParty')),
      governorParty: parseParty(get('Governor')),
      mayorParty: parseParty(get('Mayor')),
      population,
      density,
      salesTax: parseNumber(get('Sales Tax')),
      incomeTax: parseNumber(get('Income')),
      marijuanaStatus: parseMarijuana(get('Marijuana')),
      firearmLaws: determineFirearmLaws(get('Gifford')),
      giffordScore: get('Gifford'),
      magazineLimit: gunLaws.magazineLimit,
      ghostGunBan: gunLaws.ghostGunBan,
      assaultWeaponBan: gunLaws.assaultWeaponBan,
      veteranBenefits: get('Veterans Benefits') || 'No state-specific veteran benefit noted.',
      climate: `${get('Climate')} with roughly ${get('Sun')} sunny days per year.`,
      snowfall: parseNumber(get('Snow')),
      rainfall: parseNumber(get('Rain')),
      gasPrice: parseNumber(get('Gas')),
      costOfLiving: parseNumber(get('COL')),
      costOfLivingLabel: getCostOfLivingLabel(parseNumber(get('COL'))),
      sunnyDays: parseNumber(get('Sun')),
      lgbtqScore,
      techHub: get('Tech').toUpperCase() === 'Y',
      vaSupport: get('VA').toLowerCase() === 'yes',
      tciScore: parseNumber(get('TCI')),
      alwScore: parseNumber(get('ALW')),
      ahsScore: parseNumber(get('AHS')),
      election2016Winner: get('2016Election'),
      election2016Percent: parseNumber(get('2016PresidentPercent')),
      election2024Winner: get('2024 Election'),
      election2024Percent: parseNumber(get('2024PresidentPercent')),
      electionChange: get('ElectionChange')
    };

    destinations.push(destination);
  }

  return { destinations, issues };
}

const csvPath = resolve('C:\\Users\\Meeter\\Downloads\\Locations.csv');
const gunLawsPath = resolve('C:\\Users\\Meeter\\Downloads\\Gunlaws.csv');
const outputPath = resolve(process.cwd(), 'src', 'data', 'destinations.json');

const gunLawsMap = parseGunLawsCSV(gunLawsPath);
const { destinations, issues } = parseCSV(csvPath, gunLawsMap);

console.log(`\n=== Import Summary ===`);
console.log(`Total destinations: ${destinations.length}`);
console.log(`\n=== Issues Found ===`);
if (issues.length > 0) {
  issues.forEach(issue => console.log(`⚠️  ${issue}`));
} else {
  console.log('✅ No issues found');
}

writeFileSync(outputPath, JSON.stringify(destinations, null, 2) + '\n', 'utf-8');
console.log(`\n✅ Data written to ${outputPath}`);
