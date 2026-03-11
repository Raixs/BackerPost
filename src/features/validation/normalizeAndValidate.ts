import type {
  BatchConfig,
  ColumnMapping,
  ExportableRow,
  NormalizedShipmentRow,
  RawCsvRow,
  RejectedRow,
  RowOverrides,
  ValidationIssue,
} from '../../types/domain'
import { normalizeAddressParts } from '../../lib/normalization/address'
import { normalizeMaybe } from '../../lib/normalization/text'
import { mapCountry } from '../../lib/countries/countryMapper'

const maybeNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

const issue = (
  rowIndex: number,
  code: string,
  message: string,
  severity: 'warning' | 'error',
  field?: string,
): ValidationIssue => ({
  rowIndex,
  code,
  message,
  severity,
  field,
})

const mappedValue = (row: RawCsvRow, header: string | null): string => {
  if (!header) {
    return ''
  }
  return normalizeMaybe(row[header])
}

const summarizeIssues = (issues: ValidationIssue[]): string => {
  if (issues.length === 0) {
    return 'Sin incidencias'
  }

  return issues
    .slice(0, 2)
    .map((entry) => entry.message)
    .join(' | ')
}

const validateRequiredBatch = (rowIndex: number, batchConfig: BatchConfig): ValidationIssue[] => {
  const issues: ValidationIssue[] = []

  if (!normalizeMaybe(batchConfig.tipoEnvio)) {
    issues.push(issue(rowIndex, 'BATCH_TIPO_ENVIO_REQUIRED', 'Falta el tipo de envío del lote.', 'error', 'tipoEnvio'))
  }

  if (!normalizeMaybe(batchConfig.descripcionContenido)) {
    issues.push(
      issue(
        rowIndex,
        'BATCH_DESCRIPCION_REQUIRED',
        'Falta la descripción de contenido del lote.',
        'error',
        'descripcionContenido',
      ),
    )
  }

  if (!batchConfig.pesoGramos || batchConfig.pesoGramos <= 0) {
    issues.push(issue(rowIndex, 'BATCH_PESO_REQUIRED', 'El peso por envío debe ser mayor que 0.', 'error', 'pesoGramos'))
  }

  if (batchConfig.valorDeclarado === null || batchConfig.valorDeclarado < 0) {
    issues.push(
      issue(
        rowIndex,
        'BATCH_VALOR_DECLARADO_REQUIRED',
        'El valor declarado debe ser un número igual o mayor que 0.',
        'error',
        'valorDeclarado',
      ),
    )
  }

  if (!batchConfig.cantidadArticulos || batchConfig.cantidadArticulos <= 0) {
    issues.push(
      issue(
        rowIndex,
        'BATCH_CANTIDAD_REQUIRED',
        'La cantidad de artículos debe ser mayor que 0.',
        'error',
        'cantidadArticulos',
      ),
    )
  }

  if (!normalizeMaybe(batchConfig.paisOrigenMercancia)) {
    issues.push(
      issue(
        rowIndex,
        'BATCH_PAIS_ORIGEN_REQUIRED',
        'Falta el país de origen de mercancía del lote.',
        'error',
        'paisOrigenMercancia',
      ),
    )
  }

  return issues
}

const validateOverrideNumbers = (rowIndex: number, overrides?: RowOverrides): ValidationIssue[] => {
  if (!overrides) {
    return []
  }

  const issues: ValidationIssue[] = []

  const numericFields: Array<keyof RowOverrides> = ['pesoGramos', 'valorDeclarado', 'cantidadArticulos']

  numericFields.forEach((field) => {
    const value = overrides[field]
    if (value === undefined || value === null || value === '') {
      return
    }

    const parsed = maybeNumber(value)
    if (parsed === null || parsed < 0 || (field !== 'valorDeclarado' && parsed <= 0)) {
      issues.push(
        issue(rowIndex, 'ROW_OVERRIDE_INVALID', `El campo ${field} tiene un override inválido.`, 'error', field),
      )
    }
  })

  return issues
}

interface NormalizeRowInput {
  row: RawCsvRow
  rowIndex: number
  mapping: ColumnMapping
  batchConfig: BatchConfig
  overrides?: RowOverrides
}

export const normalizeAndValidateRow = ({
  row,
  rowIndex,
  mapping,
  batchConfig,
  overrides,
}: NormalizeRowInput): NormalizedShipmentRow => {
  const rawMapped: Record<string, string> = {
    nombre_destinatario: mappedValue(row, mapping.nombre_destinatario),
    direccion_1: mappedValue(row, mapping.direccion_1),
    direccion_2: mappedValue(row, mapping.direccion_2),
    ciudad: mappedValue(row, mapping.ciudad),
    region_provincia: mappedValue(row, mapping.region_provincia),
    codigo_postal: mappedValue(row, mapping.codigo_postal),
    pais: mappedValue(row, mapping.pais),
    email: mappedValue(row, mapping.email),
    telefono: mappedValue(row, mapping.telefono),
  }

  const address = normalizeAddressParts(rawMapped.direccion_1, rawMapped.direccion_2)

  const recipientName = normalizeMaybe(overrides?.recipientName ?? rawMapped.nombre_destinatario)
  const addressLine1 = normalizeMaybe(overrides?.addressLine1 ?? address.line1)
  const addressLine2 = normalizeMaybe(overrides?.addressLine2 ?? address.line2)
  const city = normalizeMaybe(overrides?.city ?? rawMapped.ciudad)
  const region = normalizeMaybe(overrides?.region ?? rawMapped.region_provincia)
  const postalCode = normalizeMaybe(overrides?.postalCode ?? rawMapped.codigo_postal)
  const countryInput = normalizeMaybe(overrides?.countryInput ?? rawMapped.pais)
  const email = normalizeMaybe(overrides?.email ?? rawMapped.email)
  const phone = normalizeMaybe(overrides?.phone ?? rawMapped.telefono)

  const modalidadEntrega = normalizeMaybe(batchConfig.modalidadEntrega)
  const tipoFranqueo = normalizeMaybe(batchConfig.tipoFranqueo)
  const tipoEnvio = normalizeMaybe(overrides?.tipoEnvio ?? batchConfig.tipoEnvio)
  const descripcionContenido = normalizeMaybe(overrides?.descripcionContenido ?? batchConfig.descripcionContenido)
  const pesoGramos = maybeNumber(overrides?.pesoGramos ?? batchConfig.pesoGramos)
  const valorDeclarado = maybeNumber(overrides?.valorDeclarado ?? batchConfig.valorDeclarado)
  const cantidadArticulos = maybeNumber(overrides?.cantidadArticulos ?? batchConfig.cantidadArticulos)
  const paisOrigenMercancia = normalizeMaybe(overrides?.paisOrigenMercancia ?? batchConfig.paisOrigenMercancia).toUpperCase()

  const issues: ValidationIssue[] = [
    ...validateRequiredBatch(rowIndex, batchConfig),
    ...validateOverrideNumbers(rowIndex, overrides),
  ]

  if (!recipientName) {
    issues.push(issue(rowIndex, 'RECIPIENT_REQUIRED', 'Falta el nombre del destinatario.', 'error', 'recipientName'))
  }

  if (!addressLine1) {
    issues.push(issue(rowIndex, 'ADDRESS1_REQUIRED', 'Falta la dirección principal.', 'error', 'addressLine1'))
  }

  if (!city) {
    issues.push(issue(rowIndex, 'CITY_REQUIRED', 'Falta la ciudad.', 'error', 'city'))
  }

  if (!countryInput) {
    issues.push(issue(rowIndex, 'COUNTRY_REQUIRED', 'Falta el país.', 'error', 'countryInput'))
  }

  const country = countryInput ? mapCountry(countryInput) : null

  if (!country && countryInput) {
    issues.push(
      issue(
        rowIndex,
        'COUNTRY_UNKNOWN',
        'No se pudo mapear el país a un ISO2 soportado.',
        'error',
        'countryInput',
      ),
    )
  }

  if (!postalCode) {
    issues.push(issue(rowIndex, 'POSTAL_MISSING', 'No hay código postal.', 'warning', 'postalCode'))
  }

  if (!phone) {
    issues.push(issue(rowIndex, 'PHONE_MISSING', 'No hay teléfono.', 'warning', 'phone'))
  }

  if (!email) {
    issues.push(issue(rowIndex, 'EMAIL_MISSING', 'No hay email.', 'warning', 'email'))
  }

  if (!region) {
    issues.push(issue(rowIndex, 'REGION_MISSING', 'No hay región o provincia.', 'warning', 'region'))
  }

  if (addressLine1.length > 70 || addressLine2.length > 70) {
    issues.push(
      issue(
        rowIndex,
        'ADDRESS_LONG',
        'La dirección es larga y puede truncarse en el TXT de exportación.',
        'warning',
        'addressLine1',
      ),
    )
  }

  if (addressLine1.length > 0 && addressLine1.length < 5) {
    issues.push(
      issue(rowIndex, 'ADDRESS_TOO_SHORT', 'La dirección es demasiado corta y podría ser inválida.', 'warning', 'addressLine1'),
    )
  }

  if (/[|;<>]/.test(`${recipientName} ${addressLine1} ${city}`)) {
    issues.push(
      issue(
        rowIndex,
        'SPECIAL_CHARS',
        'Hay caracteres que podrían ser problemáticos para la exportación.',
        'warning',
      ),
    )
  }

  if (!tipoEnvio) {
    issues.push(issue(rowIndex, 'ROW_TIPO_ENVIO_REQUIRED', 'Falta tipo de envío efectivo.', 'error', 'tipoEnvio'))
  }

  if (!tipoFranqueo) {
    issues.push(issue(rowIndex, 'ROW_FRANQUEO_REQUIRED', 'Falta tipo de franqueo.', 'error', 'tipoFranqueo'))
  }

  if (!descripcionContenido) {
    issues.push(
      issue(
        rowIndex,
        'ROW_DESCRIPCION_REQUIRED',
        'Falta descripción de contenido efectiva.',
        'error',
        'descripcionContenido',
      ),
    )
  }

  if (!pesoGramos || pesoGramos <= 0) {
    issues.push(issue(rowIndex, 'ROW_PESO_INVALID', 'El peso efectivo debe ser mayor que 0.', 'error', 'pesoGramos'))
  }

  if (valorDeclarado === null || valorDeclarado < 0) {
    issues.push(
      issue(
        rowIndex,
        'ROW_VALOR_DECLARADO_INVALID',
        'El valor declarado efectivo debe ser igual o mayor que 0.',
        'error',
        'valorDeclarado',
      ),
    )
  }

  if (!cantidadArticulos || cantidadArticulos <= 0) {
    issues.push(
      issue(
        rowIndex,
        'ROW_CANTIDAD_INVALID',
        'La cantidad de artículos efectiva debe ser mayor que 0.',
        'error',
        'cantidadArticulos',
      ),
    )
  }

  if (!paisOrigenMercancia) {
    issues.push(
      issue(
        rowIndex,
        'ROW_PAIS_ORIGEN_REQUIRED',
        'Falta país de origen de mercancía efectivo.',
        'error',
        'paisOrigenMercancia',
      ),
    )
  }

  const hasError = issues.some((entry) => entry.severity === 'error')
  const hasWarning = issues.some((entry) => entry.severity === 'warning')

  return {
    rowIndex,
    raw: row,
    rawMapped,
    recipientName,
    addressLine1,
    addressLine2,
    city,
    region,
    postalCode,
    countryInput,
    countryName: country?.nameEs ?? '',
    countryIso2: country?.iso2 ?? '',
    email,
    phone,
    modalidadEntrega,
    tipoFranqueo,
    tipoEnvio,
    descripcionContenido,
    pesoGramos,
    valorDeclarado,
    cantidadArticulos,
    paisOrigenMercancia,
    issues,
    status: hasError ? 'error' : hasWarning ? 'warning' : 'valid',
    exportable: !hasError,
    issueSummary: summarizeIssues(issues),
  }
}

export const normalizeAndValidateRows = (
  rows: RawCsvRow[],
  mapping: ColumnMapping,
  batchConfig: BatchConfig,
  rowOverrides: Record<number, RowOverrides>,
): NormalizedShipmentRow[] =>
  rows.map((row, index) =>
    normalizeAndValidateRow({
      row,
      rowIndex: index + 1,
      mapping,
      batchConfig,
      overrides: rowOverrides[index + 1],
    }),
  )

export const partitionRows = (rows: NormalizedShipmentRow[]): { exportable: ExportableRow[]; rejected: RejectedRow[] } => {
  const exportable = rows.filter((row): row is ExportableRow => row.exportable)
  const rejected = rows.filter((row): row is RejectedRow => !row.exportable)

  return { exportable, rejected }
}

export const filterRows = (rows: NormalizedShipmentRow[], filter: string): NormalizedShipmentRow[] => {
  switch (filter) {
    case 'validos':
      return rows.filter((row) => row.status === 'valid')
    case 'avisos':
      return rows.filter((row) => row.status === 'warning')
    case 'errores':
      return rows.filter((row) => row.status === 'error')
    case 'exportables':
      return rows.filter((row) => row.exportable)
    case 'rechazados':
      return rows.filter((row) => !row.exportable)
    case 'todos':
    default:
      return rows
  }
}
