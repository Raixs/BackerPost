import Papa from 'papaparse'
import type { ParsedCsvDataset, RawCsvRow } from '../../types/domain'
import { normalizeMaybe } from '../normalization/text'

export interface CsvParseResult {
  dataset: ParsedCsvDataset | null
  errors: string[]
}

const getDuplicateHeaders = (headers: string[]): string[] => {
  const counts = new Map<string, number>()
  headers.forEach((header) => {
    const key = normalizeMaybe(header)
    if (!key) {
      return
    }
    counts.set(key, (counts.get(key) ?? 0) + 1)
  })

  return [...counts.entries()].filter(([, count]) => count > 1).map(([header]) => header)
}

const normalizeRowValues = (row: Record<string, unknown>): RawCsvRow => {
  const normalized: RawCsvRow = {}

  Object.entries(row).forEach(([key, value]) => {
    normalized[key] = normalizeMaybe(typeof value === 'string' ? value : value?.toString())
  })

  return normalized
}

export const parseKickstarterCsvText = (text: string, fileName: string): CsvParseResult => {
  if (!normalizeMaybe(text)) {
    return {
      dataset: null,
      errors: ['El archivo está vacío.'],
    }
  }

  const headerProbe = Papa.parse<string[]>(text, {
    header: false,
    delimiter: '',
    preview: 1,
    skipEmptyLines: 'greedy',
  })

  const rawHeaders = (headerProbe.data[0] ?? []).map((entry) => normalizeMaybe(String(entry)))

  const parsed = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    delimiter: '',
    skipEmptyLines: 'greedy',
    transformHeader: (header) => normalizeMaybe(header),
  })

  const errors: string[] = []

  if (parsed.errors.length > 0) {
    parsed.errors.forEach((error) => {
      errors.push(`Fila ${error.row}: ${error.message}`)
    })
  }

  const headers = (parsed.meta.fields ?? []).filter(Boolean)

  if (headers.length === 0) {
    errors.push('No se detectaron cabeceras válidas en el CSV.')
  }

  const duplicates = getDuplicateHeaders(rawHeaders)
  if (duplicates.length > 0) {
    errors.push(`Hay cabeceras repetidas: ${duplicates.join(', ')}`)
  }

  const rows = parsed.data
    .map(normalizeRowValues)
    .filter((row) => Object.values(row).some((value) => normalizeMaybe(value)))

  if (rows.length === 0) {
    errors.push('No se detectaron filas de datos en el CSV.')
  }

  if (errors.length > 0) {
    return {
      dataset: null,
      errors,
    }
  }

  return {
    dataset: {
      fileName,
      delimiter: parsed.meta.delimiter || ',',
      headers,
      rows,
      preview: rows.slice(0, 5),
    },
    errors: [],
  }
}

export const readTextFile = async (file: File): Promise<string> => file.text()

export const exportCsvText = <T extends Record<string, unknown>>(rows: T[], columns?: string[]): string =>
  Papa.unparse(rows, {
    columns,
  })
