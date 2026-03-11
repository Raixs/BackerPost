import { requiredBatchFields, requiredMappingTargets } from '../../app/constants'
import type { BatchConfig, ColumnMapping } from '../../types/domain'

export const getMissingRequiredMappingTargets = (mapping: ColumnMapping): Array<keyof ColumnMapping> =>
  requiredMappingTargets.filter((target) => !mapping[target])

export const getMissingRequiredBatchFields = (batchConfig: BatchConfig): Array<keyof BatchConfig> =>
  requiredBatchFields.filter((field) => {
    const value = batchConfig[field]

    if (field === 'valorDeclarado') {
      return typeof value !== 'number' || value < 0
    }

    if (field === 'pesoGramos' || field === 'cantidadArticulos') {
      return typeof value !== 'number' || value <= 0
    }

    return String(value ?? '').trim().length === 0
  })
