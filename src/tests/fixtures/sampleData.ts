import { defaultBatchConfig } from '../../app/constants'
import type { BatchConfig, ColumnMapping, RawCsvRow } from '../../types/domain'

export const sampleCsv = `Backer Name,Address 1,Address 2,City,State,Postal Code,Country Name,Email,Phone
Ana Pérez,Calle Mayor 1,,Madrid,Madrid,28013,Spain,ana@example.com,+34111111111
John Doe,221B Baker Street,Flat 2,London,,NW16XE,United Kingdom,john@example.com,
`

export const sampleRows: RawCsvRow[] = [
  {
    'Backer Name': 'Ana Pérez',
    'Address 1': 'Calle Mayor 1',
    'Address 2': '',
    City: 'Madrid',
    State: 'Madrid',
    'Postal Code': '28013',
    'Country Name': 'Spain',
    Email: 'ana@example.com',
    Phone: '+34111111111',
  },
  {
    'Backer Name': 'John Doe',
    'Address 1': '221B Baker Street',
    'Address 2': 'Flat 2',
    City: 'London',
    State: '',
    'Postal Code': 'NW16XE',
    'Country Name': 'United Kingdom',
    Email: 'john@example.com',
    Phone: '',
  },
]

export const sampleMapping: ColumnMapping = {
  nombre_destinatario: 'Backer Name',
  direccion_1: 'Address 1',
  direccion_2: 'Address 2',
  ciudad: 'City',
  region_provincia: 'State',
  codigo_postal: 'Postal Code',
  pais: 'Country Name',
  email: 'Email',
  telefono: 'Phone',
}

export const sampleBatchConfig: BatchConfig = {
  ...defaultBatchConfig,
  tipoEnvio: 'MERCANCIA',
  descripcionContenido: 'Libro',
  pesoGramos: 350,
  valorDeclarado: 12,
  cantidadArticulos: 1,
  paisOrigenMercancia: 'ES',
}
