import { describe, expect, it } from 'vitest'
import { hasRequiredMapping, suggestColumnMapping } from './suggestions'

describe('suggestColumnMapping', () => {
  it('sugiere mapeos por nombre de columna', () => {
    const mapping = suggestColumnMapping([
      'Backer Name',
      'Address 1',
      'Address 2',
      'City',
      'Postal Code',
      'Country Name',
      'Email',
      'Phone',
    ])

    expect(mapping.nombre_destinatario).toBe('Backer Name')
    expect(mapping.direccion_1).toBe('Address 1')
    expect(mapping.pais).toBe('Country Name')
  })

  it('confirma si los campos mínimos están mapeados', () => {
    const mapping = suggestColumnMapping(['Name', 'Address1', 'City', 'Country'])
    expect(hasRequiredMapping(mapping)).toBe(true)
  })
})
