/** Country dial-code data for the phone field. Kept dependency-free (no
 *  libphonenumber) — we format by grouping digits and always prefix the
 *  correct international dial code, which is what makes WhatsApp links work
 *  for any nationality. */
export interface Country {
  code: string // ISO 3166-1 alpha-2
  name: string
  dial: string // international dial code, digits only, no '+'
  flag: string // emoji
}

// Focused on a store in Italy: full EU/Europe, the Americas, and the countries
// whose nationals are most commonly served (Maghreb, Balkans, China, etc.).
export const COUNTRIES: Country[] = [
  { code: 'IT', name: 'Italy',          dial: '39',  flag: '🇮🇹' },
  { code: 'AL', name: 'Albania',        dial: '355', flag: '🇦🇱' },
  { code: 'DZ', name: 'Algeria',        dial: '213', flag: '🇩🇿' },
  { code: 'AR', name: 'Argentina',      dial: '54',  flag: '🇦🇷' },
  { code: 'AT', name: 'Austria',        dial: '43',  flag: '🇦🇹' },
  { code: 'BE', name: 'Belgium',        dial: '32',  flag: '🇧🇪' },
  { code: 'BR', name: 'Brazil',         dial: '55',  flag: '🇧🇷' },
  { code: 'BG', name: 'Bulgaria',       dial: '359', flag: '🇧🇬' },
  { code: 'CA', name: 'Canada',         dial: '1',   flag: '🇨🇦' },
  { code: 'CL', name: 'Chile',          dial: '56',  flag: '🇨🇱' },
  { code: 'CN', name: 'China',          dial: '86',  flag: '🇨🇳' },
  { code: 'CO', name: 'Colombia',       dial: '57',  flag: '🇨🇴' },
  { code: 'HR', name: 'Croatia',        dial: '385', flag: '🇭🇷' },
  { code: 'CZ', name: 'Czechia',        dial: '420', flag: '🇨🇿' },
  { code: 'DK', name: 'Denmark',        dial: '45',  flag: '🇩🇰' },
  { code: 'EG', name: 'Egypt',          dial: '20',  flag: '🇪🇬' },
  { code: 'EE', name: 'Estonia',        dial: '372', flag: '🇪🇪' },
  { code: 'FI', name: 'Finland',        dial: '358', flag: '🇫🇮' },
  { code: 'FR', name: 'France',         dial: '33',  flag: '🇫🇷' },
  { code: 'DE', name: 'Germany',        dial: '49',  flag: '🇩🇪' },
  { code: 'GR', name: 'Greece',         dial: '30',  flag: '🇬🇷' },
  { code: 'HU', name: 'Hungary',        dial: '36',  flag: '🇭🇺' },
  { code: 'IN', name: 'India',          dial: '91',  flag: '🇮🇳' },
  { code: 'ID', name: 'Indonesia',      dial: '62',  flag: '🇮🇩' },
  { code: 'IE', name: 'Ireland',        dial: '353', flag: '🇮🇪' },
  { code: 'IL', name: 'Israel',         dial: '972', flag: '🇮🇱' },
  { code: 'JP', name: 'Japan',          dial: '81',  flag: '🇯🇵' },
  { code: 'LV', name: 'Latvia',         dial: '371', flag: '🇱🇻' },
  { code: 'LT', name: 'Lithuania',      dial: '370', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxembourg',     dial: '352', flag: '🇱🇺' },
  { code: 'MT', name: 'Malta',          dial: '356', flag: '🇲🇹' },
  { code: 'MX', name: 'Mexico',         dial: '52',  flag: '🇲🇽' },
  { code: 'MD', name: 'Moldova',        dial: '373', flag: '🇲🇩' },
  { code: 'MA', name: 'Morocco',        dial: '212', flag: '🇲🇦' },
  { code: 'NL', name: 'Netherlands',    dial: '31',  flag: '🇳🇱' },
  { code: 'MK', name: 'North Macedonia',dial: '389', flag: '🇲🇰' },
  { code: 'NO', name: 'Norway',         dial: '47',  flag: '🇳🇴' },
  { code: 'PE', name: 'Peru',           dial: '51',  flag: '🇵🇪' },
  { code: 'PH', name: 'Philippines',    dial: '63',  flag: '🇵🇭' },
  { code: 'PL', name: 'Poland',         dial: '48',  flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal',       dial: '351', flag: '🇵🇹' },
  { code: 'RO', name: 'Romania',        dial: '40',  flag: '🇷🇴' },
  { code: 'RU', name: 'Russia',         dial: '7',   flag: '🇷🇺' },
  { code: 'RS', name: 'Serbia',         dial: '381', flag: '🇷🇸' },
  { code: 'SK', name: 'Slovakia',       dial: '421', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia',       dial: '386', flag: '🇸🇮' },
  { code: 'ES', name: 'Spain',          dial: '34',  flag: '🇪🇸' },
  { code: 'SE', name: 'Sweden',         dial: '46',  flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland',    dial: '41',  flag: '🇨🇭' },
  { code: 'TN', name: 'Tunisia',        dial: '216', flag: '🇹🇳' },
  { code: 'TR', name: 'Turkey',         dial: '90',  flag: '🇹🇷' },
  { code: 'UA', name: 'Ukraine',        dial: '380', flag: '🇺🇦' },
  { code: 'GB', name: 'United Kingdom', dial: '44',  flag: '🇬🇧' },
  { code: 'US', name: 'United States',  dial: '1',   flag: '🇺🇸' },
  { code: 'UY', name: 'Uruguay',        dial: '598', flag: '🇺🇾' },
  { code: 'VE', name: 'Venezuela',      dial: '58',  flag: '🇻🇪' },
]

export const DEFAULT_COUNTRY = 'IT'

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]))

export function findCountry(code: string | null | undefined): Country | undefined {
  return code ? BY_CODE.get(code) : undefined
}

/** Case-insensitive search over country name and dial code (with/without '+'). */
export function searchCountries(query: string): Country[] {
  const q = query.trim().toLowerCase()
  if (!q) return COUNTRIES
  const qDigits = q.replace(/[^\d]/g, '')
  return COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (qDigits.length > 0 && c.dial.startsWith(qDigits)),
  )
}

/** Split a raw phone into { dial, national } for a chosen country. Handles the
 *  number being typed with the country code, with a leading 0 trunk prefix, or
 *  as a bare national number. */
export function splitNumber(phone: string, country: Country): { dial: string; national: string } {
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2) // international 00 prefix
  if (digits.startsWith(country.dial)) {
    digits = digits.slice(country.dial.length)
  }
  // Drop a single national trunk '0' (common in UK/IT-landline/DE etc.)
  if (digits.startsWith('0')) digits = digits.replace(/^0+/, '')
  return { dial: country.dial, national: digits }
}

/** Group a national number into readable chunks: groups of 3, with the final
 *  group absorbing 2–4 digits so we never leave a dangling single digit
 *  (e.g. "3331234567" → "333 123 4567", not "333 123 456 7"). */
function groupNational(national: string): string {
  if (national.length <= 4) return national
  const chunks: string[] = []
  let rest = national
  while (rest.length > 4) {
    chunks.push(rest.slice(0, 3))
    rest = rest.slice(3)
  }
  chunks.push(rest)
  return chunks.join(' ')
}

/** Display a phone in international form for the chosen country:
 *  "+39 333 123 4567". Falls back to the raw input if no country/digits. */
export function formatForCountry(phone: string, countryCode: string | null | undefined): string {
  const country = findCountry(countryCode)
  if (!country) return phone
  const { dial, national } = splitNumber(phone, country)
  if (!national) return `+${dial}`
  return `+${dial} ${groupNational(national)}`
}

/** E.164-ish digits (no '+') for wa.me / tel: links. */
export function toDialString(phone: string, countryCode: string | null | undefined): string {
  const country = findCountry(countryCode)
  if (!country) return phone.replace(/\D/g, '')
  const { dial, national } = splitNumber(phone, country)
  return `${dial}${national}`
}
