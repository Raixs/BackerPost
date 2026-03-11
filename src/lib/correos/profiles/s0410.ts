import type { CorreosProfile } from '../types'

export const s0410Profile: CorreosProfile = {
  code: 'S0410',
  name: 'PAQ STANDARD INTERNACIONAL',
  productCode: 'S0410',
  fieldSeparator: ';',
  fields: [
    { key: 'producto', getValue: () => 'S0410' },
    { key: 'modalidad_entrega', getValue: (row) => row.modalidadEntrega },
    { key: 'tipo_franqueo', getValue: (row) => row.tipoFranqueo },
    { key: 'destinatario', maxLength: 60, getValue: (row) => row.recipientName },
    { key: 'direccion_1', maxLength: 70, getValue: (row) => row.addressLine1 },
    { key: 'direccion_2', maxLength: 70, getValue: (row) => row.addressLine2 },
    { key: 'ciudad', maxLength: 40, getValue: (row) => row.city },
    { key: 'region', maxLength: 40, getValue: (row) => row.region },
    { key: 'codigo_postal', maxLength: 20, getValue: (row) => row.postalCode },
    { key: 'pais_iso2', maxLength: 2, getValue: (row) => row.countryIso2 },
    { key: 'email', maxLength: 80, getValue: (row) => row.email },
    { key: 'telefono', maxLength: 30, getValue: (row) => row.phone },
    { key: 'tipo_envio', maxLength: 30, getValue: (row) => row.tipoEnvio },
    { key: 'descripcion_contenido', maxLength: 80, getValue: (row) => row.descripcionContenido },
    { key: 'peso_gramos', getValue: (row) => String(row.pesoGramos ?? '') },
    { key: 'valor_declarado', getValue: (row) => String(row.valorDeclarado ?? '') },
    { key: 'cantidad_articulos', getValue: (row) => String(row.cantidadArticulos ?? '') },
    { key: 'pais_origen_mercancia', maxLength: 2, getValue: (row) => row.paisOrigenMercancia },
  ],
}
