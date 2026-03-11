import Papa from 'papaparse'
import type { CorreosProfile, CorreosRecord } from './types'

const sanitizeValue = (value: string): string => value.replace(/[\r\n]+/g, ' ').trim()

export const serializeCorreosTxt = (records: CorreosRecord[], profile: CorreosProfile): string => {
  const data = records.map((record) => profile.fields.map((field) => sanitizeValue(record.values[field.key] ?? '')))
  const fields = profile.includeHeaderRow ? profile.fields.map((field) => field.header) : undefined

  const options = {
    delimiter: profile.fieldSeparator,
    newline: '\r\n',
    quotes: false,
  } as const

  if (fields) {
    return Papa.unparse({ fields, data }, options)
  }

  return Papa.unparse(data, options)
}
