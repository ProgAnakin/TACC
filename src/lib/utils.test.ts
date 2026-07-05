import { describe, it, expect } from 'vitest'
import { parseLocalDate, buildWhatsAppUrl, formatPhone } from './utils'

describe('parseLocalDate', () => {
  it('parses a date-only string as LOCAL midnight (no UTC off-by-one)', () => {
    const d = parseLocalDate('2026-07-10')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(6) // July (0-indexed)
    expect(d.getDate()).toBe(10)
    expect(d.getHours()).toBe(0)
  })
  it('falls back to the native parser for full timestamps', () => {
    const iso = '2026-07-10T15:30:00.000Z'
    expect(parseLocalDate(iso).getTime()).toBe(new Date(iso).getTime())
  })
})

describe('buildWhatsAppUrl', () => {
  it('uses the chosen country dial code', () => {
    const url = buildWhatsAppUrl('333 1234567', 'arrival', 'Marco', null, 'IT')
    expect(url.startsWith('https://wa.me/393331234567?text=')).toBe(true)
  })
  it('handles a non-Italian country correctly', () => {
    const url = buildWhatsAppUrl('11 91234-5678', 'lead', 'João', null, 'BR')
    expect(url.startsWith('https://wa.me/5511912345678?text=')).toBe(true)
  })
  it('falls back to Italian detection when no country is given', () => {
    const url = buildWhatsAppUrl('3331234567', 'arrival', 'Marco', null)
    expect(url.startsWith('https://wa.me/393331234567?text=')).toBe(true)
  })
  it('personalises the message with the first name', () => {
    const url = buildWhatsAppUrl('3331234567', 'arrival', 'Marco Rossi', null, 'IT')
    expect(decodeURIComponent(url)).toContain('Marco')
    expect(decodeURIComponent(url)).not.toContain('Rossi')
  })
})

describe('formatPhone', () => {
  it('formats with the country dial code when provided', () => {
    expect(formatPhone('3331234567', 'IT')).toBe('+39 333 123 4567')
  })
  it('keeps the legacy Brazilian grouping without a country', () => {
    expect(formatPhone('11912345678')).toBe('(11) 91234-5678')
  })
})
