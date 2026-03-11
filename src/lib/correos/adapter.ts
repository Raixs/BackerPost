import type { ExportableRow, ValidationIssue } from '../../types/domain'
import type { CorreosAdaptResult, CorreosProfile, CorreosRecord } from './types'

const issue = (rowIndex: number, code: string, message: string, field?: string): ValidationIssue => ({
  rowIndex,
  code,
  message,
  severity: 'warning',
  field,
})

const truncate = (value: string, maxLength?: number): { value: string; truncated: boolean } => {
  if (!maxLength || value.length <= maxLength) {
    return { value, truncated: false }
  }

  return {
    value: value.slice(0, maxLength),
    truncated: true,
  }
}

export const adaptRowsToCorreosProfile = (
  rows: ExportableRow[],
  profile: CorreosProfile,
): CorreosAdaptResult => {
  const issues: ValidationIssue[] = []
  const sortedRows = rows.slice().sort((a, b) => a.rowIndex - b.rowIndex)

  const records: CorreosRecord[] = sortedRows.map((row, index) => {
    const totalRows = sortedRows.length
    const rowPosition: 'C' | 'R' | 'F' | 'U' =
      totalRows === 1 ? 'U' : index === 0 ? 'C' : index === totalRows - 1 ? 'F' : 'R'

    const context = {
      row,
      rowPosition,
      rowNumber: index + 1,
      totalRows,
    }

    const values: Record<string, string> = {}

    profile.fields.forEach((field) => {
      const raw = field.getValue(context) ?? ''
      const { value, truncated } = truncate(raw, field.maxLength)
      values[field.key] = value

      if (truncated) {
        issues.push(
          issue(
            row.rowIndex,
            'FIELD_TRUNCATED',
            `El campo ${field.header} fue truncado para cumplir el formato de exportación.`,
            field.key,
          ),
        )
      }
    })

    return {
      rowIndex: row.rowIndex,
      values,
    }
  })

  return {
    records,
    issues,
  }
}
