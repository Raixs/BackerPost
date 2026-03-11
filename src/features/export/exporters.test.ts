import Papa from 'papaparse'
import { describe, expect, it } from 'vitest'
import { sampleBatchConfig, sampleMapping, sampleRows } from '../../tests/fixtures/sampleData'
import { normalizeAndValidateRows } from '../validation/normalizeAndValidate'
import { buildCorreosTxt, buildNormalizedCsv } from './exporters'

describe('exporters', () => {
  it('genera CSV normalizado con columnas esperadas', () => {
    const rows = normalizeAndValidateRows(sampleRows, sampleMapping, sampleBatchConfig, {})
    const csv = buildNormalizedCsv(rows)

    expect(csv).toContain('recipient_name')
    expect(csv).toContain('country_iso2')
    expect(csv).toContain('Ana Pérez')
  })

  it('genera TXT S0410 en modo estricto sin errores', () => {
    const rows = normalizeAndValidateRows(sampleRows, sampleMapping, sampleBatchConfig, {})
    const result = buildCorreosTxt(rows, 'strict')

    const parsed = Papa.parse<string[]>(result.txt ?? '', {
      delimiter: ',',
      skipEmptyLines: true,
    })

    expect(result.txt).toContain('Posición,Año creación estructura y versión,Código producto,Tipo de Franqueo')
    expect(result.txt).toContain('S0410')
    expect(parsed.data[0]?.length).toBe(186)
    expect(parsed.data[1]?.length).toBe(186)
    expect(result.exportedCount).toBe(2)
    expect(result.rejectedCount).toBe(0)
  })
})
