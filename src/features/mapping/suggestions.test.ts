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
    expect(mapping.nombre_destinatario).toBe('Name')
    expect(mapping.direccion_1).toBe('Address1')
    expect(mapping.ciudad).toBe('City')
    expect(mapping.pais).toBe('Country')
    expect(hasRequiredMapping(mapping)).toBe(true)
  })

  it('prioriza columnas Shipping en export real de Kickstarter', () => {
    const mapping = suggestColumnMapping([
      'Backer Name',
      'Billing Country',
      'Shipping Name',
      'Shipping Address 1',
      'Shipping Address 2',
      'Shipping City',
      'Shipping State',
      'Shipping Postal Code',
      'Shipping Country Name',
      'Shipping Country Code',
      'Shipping Phone Number',
      'Email',
    ])

    expect(mapping.nombre_destinatario).toBe('Shipping Name')
    expect(mapping.direccion_1).toBe('Shipping Address 1')
    expect(mapping.direccion_2).toBe('Shipping Address 2')
    expect(mapping.ciudad).toBe('Shipping City')
    expect(mapping.region_provincia).toBe('Shipping State')
    expect(mapping.codigo_postal).toBe('Shipping Postal Code')
    expect(mapping.pais).toBe('Shipping Country Name')
    expect(mapping.telefono).toBe('Shipping Phone Number')
    expect(mapping.email).toBe('Email')
  })
})
