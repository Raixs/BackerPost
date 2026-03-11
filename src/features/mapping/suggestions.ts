import { defaultMapping } from '../../app/constants'
import type { ColumnMapping } from '../../types/domain'
import { normalizeKeyToken } from '../../lib/normalization/text'

const targetOrder: Array<keyof ColumnMapping> = [
  'nombre_destinatario',
  'direccion_1',
  'direccion_2',
  'ciudad',
  'region_provincia',
  'codigo_postal',
  'pais',
  'email',
  'telefono',
]

const includesToken = (token: string, values: string[]): boolean => values.some((value) => token.includes(value))

const scoreHeaderForTarget = (target: keyof ColumnMapping, token: string): number => {
  let score = 0

  if (
    token.includes('addon') ||
    token.includes('sku') ||
    token.endsWith('count') ||
    token.includes('reward') ||
    token.includes('pledge') ||
    token.includes('backingminimum')
  ) {
    score -= 120
  }

  if (token.includes('billing')) {
    score -= 90
  }

  switch (target) {
    case 'nombre_destinatario':
      if (includesToken(token, ['shippingname', 'recipientname', 'receivername'])) score += 260
      if (includesToken(token, ['fullname', 'name'])) score += 90
      if (token.includes('backername')) score += 90
      if (includesToken(token, ['countryname', 'rewardname', 'projectname'])) score -= 180
      break
    case 'direccion_1':
      if (includesToken(token, ['shippingaddress1', 'addressline1'])) score += 260
      if (includesToken(token, ['address1', 'direccion1'])) score += 190
      if (token.includes('address') && !token.includes('address2')) score += 90
      if (includesToken(token, ['address2', 'shippingaddress2'])) score -= 130
      break
    case 'direccion_2':
      if (includesToken(token, ['shippingaddress2', 'addressline2', 'address2', 'direccion2'])) score += 260
      if (includesToken(token, ['address1', 'shippingaddress1'])) score -= 130
      break
    case 'ciudad':
      if (includesToken(token, ['shippingcity'])) score += 260
      if (includesToken(token, ['city', 'town', 'ciudad'])) score += 170
      break
    case 'region_provincia':
      if (includesToken(token, ['shippingstate', 'shippingprovince', 'shippingregion'])) score += 250
      if (includesToken(token, ['state', 'province', 'region', 'provincia'])) score += 170
      break
    case 'codigo_postal':
      if (includesToken(token, ['shippingpostalcode', 'shippingzipcode', 'shippingpostcode'])) score += 260
      if (includesToken(token, ['postalcode', 'zipcode', 'postcode', 'postal', 'zip', 'codigopostal'])) score += 170
      break
    case 'pais':
      if (token.includes('shippingcountryname')) score += 280
      if (token.includes('shippingcountrycode')) score += 250
      if (token.includes('shippingcountry')) score += 220
      if (token.includes('countryname')) score += 150
      if (token.includes('countrycode')) score += 130
      if (token.includes('country')) score += 90
      if (token.includes('billingcountry')) score -= 220
      break
    case 'email':
      if (includesToken(token, ['email'])) score += 260
      if (includesToken(token, ['mail', 'correo'])) score += 160
      break
    case 'telefono':
      if (token.includes('shippingphonenumber')) score += 280
      if (includesToken(token, ['phone', 'telefono', 'mobile', 'tel'])) score += 180
      break
    default:
      break
  }

  if (token.includes('shipping') && target !== 'email') {
    score += 20
  }

  return score
}

export const suggestColumnMapping = (headers: string[]): ColumnMapping => {
  const mapping: ColumnMapping = { ...defaultMapping }
  const usedHeaders = new Set<string>()

  const normalizedHeaders = headers.map((header) => ({
    original: header,
    token: normalizeKeyToken(header),
  }))

  targetOrder.forEach((target) => {
    const found = normalizedHeaders
      .filter((header) => !usedHeaders.has(header.original))
      .map((header) => ({
        header,
        score: scoreHeaderForTarget(target, header.token),
      }))
      .sort((left, right) => right.score - left.score)
      .find((candidate) => candidate.score > 0)

    if (!found) {
      mapping[target] = null
      return
    }

    mapping[target] = found.header.original
    usedHeaders.add(found.header.original)
  })

  return mapping
}

export const hasRequiredMapping = (mapping: ColumnMapping): boolean =>
  Boolean(mapping.nombre_destinatario && mapping.direccion_1 && mapping.ciudad && mapping.pais)
