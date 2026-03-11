import { defaultMapping } from '../../app/constants'
import type { ColumnMapping } from '../../types/domain'
import { normalizeKeyToken } from '../../lib/normalization/text'

const aliases: Record<keyof ColumnMapping, string[]> = {
  nombre_destinatario: ['name', 'fullname', 'recipientname', 'shippingname', 'nombre', 'destinatario'],
  direccion_1: ['address1', 'addressline1', 'shippingaddress1', 'direccion1', 'address'],
  direccion_2: ['address2', 'addressline2', 'shippingaddress2', 'direccion2'],
  ciudad: ['city', 'town', 'ciudad'],
  region_provincia: ['region', 'state', 'province', 'provincia'],
  codigo_postal: ['postal', 'postcode', 'zipcode', 'zip', 'codigopostal'],
  pais: ['country', 'pais', 'nation'],
  email: ['email', 'mail', 'correo'],
  telefono: ['phone', 'telefono', 'mobile', 'tel'],
}

export const suggestColumnMapping = (headers: string[]): ColumnMapping => {
  const mapping: ColumnMapping = { ...defaultMapping }

  const normalizedHeaders = headers.map((header) => ({
    original: header,
    token: normalizeKeyToken(header),
  }))

  ;(Object.keys(mapping) as Array<keyof ColumnMapping>).forEach((target) => {
    const candidates = aliases[target]
    const found = normalizedHeaders.find((header) =>
      candidates.some((candidate) => header.token.includes(normalizeKeyToken(candidate))),
    )

    mapping[target] = found?.original ?? null
  })

  return mapping
}

export const hasRequiredMapping = (mapping: ColumnMapping): boolean =>
  Boolean(mapping.nombre_destinatario && mapping.direccion_1 && mapping.ciudad && mapping.pais)
