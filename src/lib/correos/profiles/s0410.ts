import { normalizeKeyToken } from '../../normalization/text'
import type { CorreosFieldContext, CorreosProfile } from '../types'
import { formatoUnicoHeaders } from './formatoUnicoHeaders'

const modeToCode = (modalidadEntrega: string): string => {
  const token = normalizeKeyToken(modalidadEntrega)

  if (token.includes('oficina') || token.includes('office')) {
    return 'LS'
  }

  if (token.includes('citypaq') || token.includes('homepaq')) {
    return 'CP'
  }

  return 'ST'
}

const franqueoToCode = (tipoFranqueo: string): string => {
  const token = normalizeKeyToken(tipoFranqueo)

  if (token === 'fm' || token.includes('maquina')) {
    return 'FM'
  }

  if (token === 'on' || token.includes('online')) {
    return 'ON'
  }

  return 'FP'
}

const shipmentTypeToCode = (tipoEnvio: string): string => {
  const token = normalizeKeyToken(tipoEnvio)

  if (/^[1-7]$/.test(token)) {
    return token
  }

  if (token.includes('document')) return '1'
  if (token.includes('venta') || token.includes('mercancia') || token.includes('merchandise')) return '2'
  if (token.includes('regalo') || token.includes('gift')) return '3'
  if (token.includes('muestra') || token.includes('sample')) return '4'
  if (token.includes('devuelta') || token.includes('returned')) return '5'
  if (token.includes('otro') || token.includes('other')) return '6'
  if (token.includes('peligrosa') || token.includes('dangerous')) return '7'

  return '6'
}

const toIntegerString = (value: number | null | undefined, padLength?: number): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return ''
  }

  const numeric = Math.max(0, Math.round(value))
  const integer = String(numeric)

  if (!padLength) {
    return integer
  }

  return integer.padStart(padLength, '0')
}

const eurosToCentsString = (value: number | null | undefined, padLength?: number): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return ''
  }

  const cents = Math.max(0, Math.round(value * 100))
  const centsString = String(cents)

  if (!padLength) {
    return centsString
  }

  return centsString.padStart(padLength, '0')
}

const fieldValueById: Partial<Record<number, (context: CorreosFieldContext) => string>> = {
  1: (context) => context.rowPosition,
  2: () => '2018v002',
  3: () => 'S0410',
  4: (context) => franqueoToCode(context.row.tipoFranqueo),
  19: (context) => context.row.recipientName,
  26: (context) => context.row.addressLine1,
  27: (context) => context.row.addressLine2,
  34: (context) => context.row.city,
  35: (context) => context.row.region,
  37: (context) => context.row.postalCode,
  38: (context) => context.row.countryIso2,
  42: (context) => context.row.phone,
  43: (context) => context.row.email,
  46: (context) => `BP-${context.row.rowIndex}`,
  49: (context) => modeToCode(context.row.modalidadEntrega),
  50: (context) => toIntegerString(context.row.pesoGramos, 5),
  111: (context) => shipmentTypeToCode(context.row.tipoEnvio),
  112: () => 'N',
  114: () => 'N',
  115: (context) => toIntegerString(context.row.cantidadArticulos, 3),
  116: (context) => context.row.descripcionContenido,
  117: (context) => toIntegerString(context.row.pesoGramos, 5),
  118: (context) => eurosToCentsString(context.row.valorDeclarado, 6),
  121: (context) => context.row.paisOrigenMercancia,
}

const maxLengthById: Partial<Record<number, number>> = {
  1: 1,
  2: 8,
  3: 5,
  4: 2,
  19: 300,
  26: 100,
  27: 100,
  34: 100,
  35: 40,
  37: 10,
  38: 2,
  42: 15,
  43: 100,
  46: 100,
  49: 2,
  50: 5,
  111: 1,
  112: 1,
  114: 1,
  115: 3,
  116: 100,
  117: 5,
  118: 6,
  121: 2,
}

export const s0410Profile: CorreosProfile = {
  code: 'S0410',
  name: 'PAQ STANDARD INTERNACIONAL',
  productCode: 'S0410',
  fieldSeparator: ',',
  includeHeaderRow: true,
  fields: formatoUnicoHeaders.map((header, index) => {
    const id = index + 1

    return {
      key: `f_${String(id).padStart(3, '0')}`,
      header,
      maxLength: maxLengthById[id],
      getValue: (context) => fieldValueById[id]?.(context) ?? '',
    }
  }),
}
