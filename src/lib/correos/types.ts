import type { ExportableRow, ValidationIssue } from '../../types/domain'

export interface CorreosFieldContext {
  row: ExportableRow
  rowPosition: 'C' | 'R' | 'F' | 'U'
  rowNumber: number
  totalRows: number
}

export interface CorreosFieldSpec {
  key: string
  header: string
  maxLength?: number
  getValue: (context: CorreosFieldContext) => string
}

export interface CorreosProfile {
  code: 'S0410'
  name: string
  productCode: string
  fieldSeparator: string
  includeHeaderRow: boolean
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
