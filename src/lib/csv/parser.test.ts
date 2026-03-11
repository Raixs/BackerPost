import { describe, expect, it } from 'vitest'
import { parseKickstarterCsvText } from './parser'
import { sampleCsv } from '../../tests/fixtures/sampleData'

describe('parseKickstarterCsvText', () => {
  it('parsea un CSV válido y devuelve metadatos', () => {
    const result = parseKickstarterCsvText(sampleCsv, 'backers.csv')

    expect(result.errors).toHaveLength(0)
    expect(result.dataset).not.toBeNull()
    expect(result.dataset?.rows).toHaveLength(2)
    expect(result.dataset?.headers).toContain('Backer Name')
  })

  it('falla con archivo vacío', () => {
    const result = parseKickstarterCsvText('   \n', 'empty.csv')

    expect(result.dataset).toBeNull()
    expect(result.errors[0]).toContain('vacío')
  })

  it('detecta cabeceras repetidas', () => {
    const duplicated = 'Name,Name,City\nAna,Pérez,Madrid\n'
    const result = parseKickstarterCsvText(duplicated, 'dup.csv')

    expect(result.dataset).toBeNull()
    expect(result.errors.join(' ')).toContain('cabeceras repetidas')
  })
})
