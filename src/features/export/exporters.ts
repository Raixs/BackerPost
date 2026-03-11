import { exportCsvText } from '../../lib/csv/parser'
import { adaptRowsToCorreosProfile } from '../../lib/correos/adapter'
import { s0410Profile } from '../../lib/correos/profiles/s0410'
import { serializeCorreosTxt } from '../../lib/correos/serializer'
import type { ExportMode, NormalizedShipmentRow, ParsedCsvDataset, ProjectSnapshot } from '../../types/domain'
import { partitionRows } from '../validation/normalizeAndValidate'

export const buildNormalizedCsv = (rows: NormalizedShipmentRow[]): string => {
  const data = rows.map((row) => ({
    recipient_name: row.recipientName,
    address_line_1: row.addressLine1,
    address_line_2: row.addressLine2,
    city: row.city,
    region: row.region,
    postal_code: row.postalCode,
    country_name: row.countryName,
    country_iso2: row.countryIso2,
    email: row.email,
    phone: row.phone,
    normalized_status: row.status,
    issues_summary: row.issueSummary,
  }))

  return exportCsvText(data)
}

export const buildIssuesCsv = (rows: NormalizedShipmentRow[]): string => {
  const data = rows.flatMap((row) =>
    row.issues.map((entry) => ({
      row_index: row.rowIndex,
      severity: entry.severity,
      issue_code: entry.code,
      issue_message: entry.message,
    })),
  )

  return exportCsvText(data, ['row_index', 'severity', 'issue_code', 'issue_message'])
}

export const buildRejectedCsv = (rows: NormalizedShipmentRow[], dataset: ParsedCsvDataset | null): string => {
  const rejected = rows.filter((row) => !row.exportable)

  const baseHeaders = dataset?.headers ?? []

  const records = rejected.map((row) => {
    const base: Record<string, string> = {
      row_index: String(row.rowIndex),
      issue_summary: row.issueSummary,
    }

    baseHeaders.forEach((header) => {
      base[`raw_${header}`] = row.raw[header] ?? ''
    })

    return base
  })

  return exportCsvText(records)
}

export const buildCorreosTxt = (rows: NormalizedShipmentRow[], mode: ExportMode) => {
  const { exportable, rejected } = partitionRows(rows)

  if (mode === 'strict' && rejected.length > 0) {
    return {
      txt: null,
      issues: [],
      exportedCount: 0,
      rejectedCount: rejected.length,
    }
  }

  const adapted = adaptRowsToCorreosProfile(exportable, s0410Profile)

  return {
    txt: serializeCorreosTxt(adapted.records, s0410Profile),
    issues: adapted.issues,
    exportedCount: exportable.length,
    rejectedCount: rejected.length,
  }
}

export const buildProjectSnapshot = (
  partial: Omit<ProjectSnapshot, 'version' | 'savedAt'>,
): ProjectSnapshot => ({
  version: 1,
  savedAt: new Date().toISOString(),
  ...partial,
})
