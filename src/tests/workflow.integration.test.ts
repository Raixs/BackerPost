import { describe, expect, it } from 'vitest'
import { parseKickstarterCsvText } from '../lib/csv/parser'
import { buildCorreosTxt, buildNormalizedCsv } from '../features/export/exporters'
import { suggestColumnMapping } from '../features/mapping/suggestions'
import { normalizeAndValidateRows, partitionRows } from '../features/validation/normalizeAndValidate'
import { defaultBatchConfig } from '../app/constants'
import { sampleCsv } from './fixtures/sampleData'

describe('workflow integration', () => {
  it('importa, mapea, valida, corrige y exporta', () => {
    const parsed = parseKickstarterCsvText(sampleCsv, 'backers.csv')
    expect(parsed.dataset).not.toBeNull()

    const dataset = parsed.dataset
    if (!dataset) {
      throw new Error('dataset no disponible')
    }

    const mapping = suggestColumnMapping(dataset.headers)

    const batchConfig = {
      ...defaultBatchConfig,
      tipoEnvio: 'MERCANCIA',
      descripcionContenido: 'Libro',
      pesoGramos: 320,
      valorDeclarado: 15,
      cantidadArticulos: 1,
      paisOrigenMercancia: 'ES',
    }

    const firstPass = normalizeAndValidateRows(dataset.rows, mapping, batchConfig, {})
    const firstPartition = partitionRows(firstPass)

    expect(firstPartition.rejected).toHaveLength(0)
    expect(firstPass[1].status).toBe('warning')

    const fixedOverrides = {
      2: {
        phone: '+447700900123',
        region: 'Greater London',
      },
    }

    const secondPass = normalizeAndValidateRows(dataset.rows, mapping, batchConfig, fixedOverrides)
    const normalizedCsv = buildNormalizedCsv(secondPass)
    const txt = buildCorreosTxt(secondPass, 'strict')

    expect(secondPass[1].status).toBe('valid')
    expect(normalizedCsv).toContain('Greater London')
    expect(txt.txt).toContain('S0410')
    expect(txt.rejectedCount).toBe(0)
  })
})
