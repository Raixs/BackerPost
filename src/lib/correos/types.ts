import type { ExportableRow, ValidationIssue } from '../../types/domain'

export interface CorreosFieldSpec {
  key: string
  maxLength?: number
  getValue: (row: ExportableRow) => string
}

export interface CorreosProfile {
  code: 'S0410'
  name: string
  productCode: string
  fieldSeparator: string
  fields: CorreosFieldSpec[]
}

export interface CorreosRecord {
  rowIndex: number
  values: Record<string, string>
}

export interface CorreosAdaptResult {
  records: CorreosRecord[]
  issues: ValidationIssue[]
}
