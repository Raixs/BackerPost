import { describe, expect, it } from 'vitest'
import { mapCountry } from './countryMapper'

describe('mapCountry', () => {
  it('mapea alias conocidos en inglés y español', () => {
    expect(mapCountry('España')?.iso2).toBe('ES')
    expect(mapCountry('United Kingdom')?.iso2).toBe('GB')
    expect(mapCountry('USA')?.nameEs).toBe('Estados Unidos')
    expect(mapCountry('Canadá')?.iso2).toBe('CA')
    expect(mapCountry('China')?.iso2).toBe('CN')
  })

  it('mapea códigos ISO2 e ISO3', () => {
    expect(mapCountry('CA')?.nameEs).toBe('Canadá')
    expect(mapCountry('CAN')?.iso2).toBe('CA')
    expect(mapCountry('CHN')?.iso2).toBe('CN')
  })

  it('mapea variantes largas de nombre de país', () => {
    expect(mapCountry("People's Republic of China")?.iso2).toBe('CN')
    expect(mapCountry('China Mainland')?.iso2).toBe('CN')
  })

  it('devuelve null si no reconoce el país', () => {
    expect(mapCountry('Planeta X')).toBeNull()
  })
})
