import type { BatchConfig, ColumnMapping } from '../types/domain'

export const wizardSteps = [
  'Importar CSV',
  'Mapear columnas',
  'Revisar y corregir',
  'Exportar',
] as const

export const mappingLabels: Record<keyof ColumnMapping, string> = {
  nombre_destinatario: 'Nombre destinatario',
  direccion_1: 'Dirección 1',
  direccion_2: 'Dirección 2 (opcional)',
  ciudad: 'Ciudad',
  region_provincia: 'Región / Provincia (opcional)',
  codigo_postal: 'Código postal (opcional)',
  pais: 'País',
  email: 'Email (opcional)',
  telefono: 'Teléfono (opcional)',
}

export const requiredMappingTargets: Array<keyof ColumnMapping> = [
  'nombre_destinatario',
  'direccion_1',
  'ciudad',
  'pais',
]

export const defaultMapping: ColumnMapping = {
  nombre_destinatario: null,
  direccion_1: null,
  direccion_2: null,
  ciudad: null,
  region_provincia: null,
  codigo_postal: null,
  pais: null,
  email: null,
  telefono: null,
}

export const defaultBatchConfig: BatchConfig = {
  productoCorreos: 'S0410',
  nombreProducto: 'PAQ STANDARD INTERNACIONAL',
  modalidadEntrega: 'domicilio',
  tipoFranqueo: 'FRANQUEO_PAGADO',
  tipoEnvio: '',
  descripcionContenido: '',
  pesoGramos: null,
  valorDeclarado: null,
  cantidadArticulos: null,
  paisOrigenMercancia: 'ES',
}

export const requiredBatchFields: Array<keyof BatchConfig> = [
  'tipoEnvio',
  'descripcionContenido',
  'pesoGramos',
  'valorDeclarado',
  'cantidadArticulos',
  'paisOrigenMercancia',
]
