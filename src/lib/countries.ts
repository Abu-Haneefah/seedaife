import countries from 'country-list';

export interface CountryItem {
  code: string;
  name: string;
  flag: string;
}

/**
 * Generate a Unicode flag emoji from a 2-letter ISO country code.
 */
export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Clean up official ISO suffixes for friendlier user display
 * (e.g. "United States of America (the)" -> "United States")
 */
function cleanCountryName(code: string, rawName: string): string {
  if (code === 'US') return 'United States';
  if (code === 'GB') return 'United Kingdom';
  if (code === 'AE') return 'United Arab Emirates';
  if (code === 'KR') return 'South Korea';
  if (code === 'KP') return 'North Korea';
  if (code === 'CD') return 'DR Congo';
  if (code === 'CG') return 'Republic of the Congo';
  if (code === 'TZ') return 'Tanzania';
  if (code === 'VN') return 'Vietnam';
  if (code === 'RU') return 'Russia';
  if (code === 'IR') return 'Iran';
  if (code === 'SY') return 'Syria';
  if (code === 'BO') return 'Bolivia';
  if (code === 'VE') return 'Venezuela';
  if (code === 'TW') return 'Taiwan';

  return rawName
    .replace(/ \(the\)$/i, '')
    .replace(/ \(the Republic of\)$/i, '')
    .replace(/ \(the Federation of\)$/i, '');
}

// Popular / high-priority countries pinned at the top of the picker
const POPULAR_CODES = [
  'NG', // Nigeria
  'US', // United States
  'GB', // United Kingdom
  'CA', // Canada
  'GH', // Ghana
  'KE', // Kenya
  'ZA', // South Africa
  'AE', // UAE
  'DE', // Germany
  'AU', // Australia
  'IN', // India
  'IE', // Ireland
  'FR', // France
];

let cachedCountryList: CountryItem[] | null = null;

export function getAllCountries(): CountryItem[] {
  if (cachedCountryList) return cachedCountryList;

  const rawData = countries.getData();
  const allList: CountryItem[] = rawData.map((item) => ({
    code: item.code,
    name: cleanCountryName(item.code, item.name),
    flag: getCountryFlag(item.code),
  }));

  // Separate popular vs others
  const popularMap = new Map<string, CountryItem>();
  const others: CountryItem[] = [];

  allList.forEach((c) => {
    if (POPULAR_CODES.includes(c.code)) {
      popularMap.set(c.code, c);
    } else {
      others.push(c);
    }
  });

  // Sort others alphabetically
  others.sort((a, b) => a.name.localeCompare(b.name));

  // Maintain POPULAR_CODES order
  const popularList: CountryItem[] = [];
  POPULAR_CODES.forEach((code) => {
    const found = popularMap.get(code);
    if (found) popularList.push(found);
  });

  cachedCountryList = [...popularList, ...others];
  return cachedCountryList;
}

export function findCountryByName(name: string): CountryItem | undefined {
  const all = getAllCountries();
  const lower = name.toLowerCase().trim();
  return all.find((c) => c.name.toLowerCase() === lower || c.code.toLowerCase() === lower);
}
