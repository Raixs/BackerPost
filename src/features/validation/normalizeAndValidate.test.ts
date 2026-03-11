import { describe, expect, it } from 'vitest'
import { defaultBatchConfig } from '../../app/constants'
import { sampleBatchConfig, sampleMapping, sampleRows } from '../../tests/fixtures/sampleData'
import { normalizeAndValidateRow, normalizeAndValidateRows, partitionRows } from './normalizeAndValidate'

describe('normalizeAndValidateRow', () => {
  it('marca error si faltan campos bloqueantes', () => {
    const row = {
      ...sampleRows[0],
      'Backer Name': '',
      'Country Name': 'Unknownland',
      'Address 1': '',
    }

    const result = normalizeAndValidateRow({
      row,
      rowIndex: 1,
      mapping: sampleMapping,
      batchConfig: sampleBatchConfig,
    })

    expect(result.status).toBe('error')
    expect(result.exportable).toBe(false)
    expect(result.issues.some((entry) => entry.code === 'COUNTRY_UNKNOWN')).toBe(true)
  })

  it('marca warning si faltan opcionales', () => {
    const row = {
      ...sampleRows[0],
      Phone: '',
      Email: '',
    }

    const result = normalizeAndValidateRow({
      row,
      rowIndex: 1,
      mapping: sampleMapping,
      batchConfig: sampleBatchConfig,
    })

    expect(result.status).toBe('warning')
    expect(result.exportable).toBe(true)
  })

  it('incluye errores de lote cuando faltan defaults requeridos', () => {
    const result = normalizeAndValidateRow({
      row: sampleRows[0],
      rowIndex: 1,
      mapping: sampleMapping,
      batchConfig: {
        ...defaultBatchConfig,
      },
    })

    expect(result.issues.some((entry) => entry.code === 'BATCH_TIPO_ENVIO_REQUIRED')).toBe(true)
    expect(result.exportable).toBe(false)
  })
})

describe('partitionRows', () => {
  it('separa exportables de rechazados', () => {
    const rows = normalizeAndValidateRows(sampleRows, sampleMapping, sampleBatchConfig, {})
    const partition = partitionRows(rows)

    expect(partition.exportable.length).toBeGreaterThan(0)
    expect(partition.rejected).toHaveLength(0)
  })
})
