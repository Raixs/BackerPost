export type ValidationSeverity = 'warning' | 'error'

export interface ValidationIssue {
  rowIndex: number
  code: string
  message: string
  severity: ValidationSeverity
  field?: string
}

export type RawCsvRow = Record<string, string>

export interface ParsedCsvDataset {
  fileName: string
  delimiter: string
  headers: string[]
  rows: RawCsvRow[]
  preview: RawCsvRow[]
}

export interface ColumnMapping {
  nombre_destinatario: string | null
  direccion_1: string | null
  direccion_2: string | null
  ciudad: string | null
  region_provincia: string | null
  codigo_postal: string | null
  pais: string | null
  email: string | null
  telefono: string | null
}

export interface BatchConfig {
  productoCorreos: 'S0410'
  nombreProducto: 'PAQ STANDARD INTERNACIONAL'
  modalidadEntrega: 'domicilio'
  tipoFranqueo: string
  tipoEnvio: string
  descripcionContenido: string
  pesoGramos: number | null
  valorDeclarado: number | null
  cantidadArticulos: number | null
  paisOrigenMercancia: string
}

export interface CountryMatch {
  iso2: string
  nameEs: string
}

export interface RowOverrides {
  recipientName?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  region?: string
  postalCode?: string
  countryInput?: string
  email?: string
  phone?: string
  tipoEnvio?: string
  descripcionContenido?: string
  pesoGramos?: number | null
  valorDeclarado?: number | null
  cantidadArticulos?: number | null
  paisOrigenMercancia?: string
}

export interface NormalizedShipmentRow {
  rowIndex: number
  raw: RawCsvRow
  rawMapped: Record<string, string>
  recipientName: string
  addressLine1: string
  addressLine2: string
  city: string
  region: string
  postalCode: string
  countryInput: string
  countryName: string
  countryIso2: string
  email: string
  phone: string
  modalidadEntrega: string
  tipoFranqueo: string
  tipoEnvio: string
  descripcionContenido: string
  pesoGramos: number | null
  valorDeclarado: number | null
  cantidadArticulos: number | null
  paisOrigenMercancia: string
  issues: ValidationIssue[]
  status: 'valid' | 'warning' | 'error'
  exportable: boolean
  issueSummary: string
}

export type ExportableRow = NormalizedShipmentRow & { exportable: true }
export type RejectedRow = NormalizedShipmentRow & { exportable: false }

export type ReviewFilter =
  | 'todos'
  | 'validos'
  | 'avisos'
  | 'errores'
  | 'exportables'
  | 'rechazados'

export type ExportMode = 'strict' | 'assisted'

export interface ProjectSnapshot {
  version: 1
  savedAt: string
  app: {
    currentStep: number
    filter: ReviewFilter
    exportMode: ExportMode
  }
  dataset: ParsedCsvDataset | null
  mapping: ColumnMapping
  batchConfig: BatchConfig
  rowOverrides: Record<number, RowOverrides>
}
