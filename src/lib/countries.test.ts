import { describe, it, expect } from 'vitest'
import {
  findCountry,
  searchCountries,
  splitNumber,
  formatForCountry,
  toDialString,
  COUNTRIES,
} from './countries'

describe('findCountry', () => {
  it('resolves a known ISO code', () => {
    expect(findCountry('IT')?.dial).toBe('39')
    expect(findCountry('BR')?.dial).toBe('55')
  })
  it('returns undefined for unknown/empty', () => {
    expect(findCountry('ZZ')).toBeUndefined()
    expect(findCountry(null)).toBeUndefined()
    expect(findCountry(undefined)).toBeUndefined()
  })
})

describe('searchCountries', () => {
  it('returns everything for an empty query', () => {
    expect(searchCountries('')).toHaveLength(COUNTRIES.length)
  })
  it('matches by name (case-insensitive)', () => {
    expect(searchCountries('ital').map((c) => c.code)).toContain('IT')
    expect(searchCountries('GERM').map((c) => c.code)).toContain('DE')
  })
  it('matches by dial code with or without +', () => {
    expect(searchCountries('+39').map((c) => c.code)).toContain('IT')
    expect(searchCountries('351').map((c) => c.code)).toContain('PT')
  })
  it('returns empty for nonsense', () => {
    expect(searchCountries('zzzzz')).toHaveLength(0)
  })
})

describe('splitNumber', () => {
  const it_ = findCountry('IT')!
  it('strips the dial code when the user typed it', () => {
    expect(splitNumber('+39 333 1234567', it_).national).toBe('3331234567')
  })
  it('handles a 00 international prefix', () => {
    expect(splitNumber('0039 333 1234567', it_).national).toBe('3331234567')
  })
  it('keeps a bare national number', () => {
    expect(splitNumber('333 1234567', it_).national).toBe('3331234567')
  })
  it('drops a national trunk 0', () => {
    const uk = findCountry('GB')!
    expect(splitNumber('020 7946 0018', uk).national).toBe('2079460018')
  })
})

describe('formatForCountry', () => {
  it('prefixes the dial code and groups digits', () => {
    expect(formatForCountry('3331234567', 'IT')).toBe('+39 333 123 4567')
  })
  it('is idempotent when the code is already present', () => {
    expect(formatForCountry('+39 333 123 4567', 'IT')).toBe('+39 333 123 4567')
  })
  it('returns the raw input when no country is known', () => {
    expect(formatForCountry('3331234567', null)).toBe('3331234567')
  })
})

describe('toDialString', () => {
  it('produces E.164-ish digits for wa.me links', () => {
    expect(toDialString('333 1234567', 'IT')).toBe('393331234567')
    expect(toDialString('+55 (11) 91234-5678', 'BR')).toBe('5511912345678')
  })
})
