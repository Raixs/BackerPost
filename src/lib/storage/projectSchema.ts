import { z } from 'zod'

const rawRowSchema = z.record(z.string(), z.string())

const parsedDatasetSchema = z.object({
  fileName: z.string(),
  delimiter: z.string(),
  headers: z.array(z.string()),
  rows: z.array(rawRowSchema),
  preview: z.array(rawRowSchema),
})

const mappingSchema = z.object({
  nombre_destinatario: z.string().nullable(),
  direccion_1: z.string().nullable(),
  direccion_2: z.string().nullable(),
  ciudad: z.string().nullable(),
  region_provincia: z.string().nullable(),
  codigo_postal: z.string().nullable(),
  pais: z.string().nullable(),
  email: z.string().nullable(),
  telefono: z.string().nullable(),
})

const batchSchema = z.object({
  productoCorreos: z.literal('S0410'),
  nombreProducto: z.literal('PAQ STANDARD INTERNACIONAL'),
  modalidadEntrega: z.literal('domicilio'),
  tipoFranqueo: z.string(),
  tipoEnvio: z.string(),
  descripcionContenido: z.string(),
  pesoGramos: z.number().nullable(),
  valorDeclarado: z.number().nullable(),
  cantidadArticulos: z.number().nullable(),
  paisOrigenMercancia: z.string(),
})

const rowOverridesSchema = z.record(
  z.string(),
  z.object({
    recipientName: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    postalCode: z.string().optional(),
    countryInput: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    tipoEnvio: z.string().optional(),
    descripcionContenido: z.string().optional(),
    pesoGramos: z.number().nullable().optional(),
    valorDeclarado: z.number().nullable().optional(),
    cantidadArticulos: z.number().nullable().optional(),
    paisOrigenMercancia: z.string().optional(),
  }),
)

export const projectSnapshotSchema = z.object({
  version: z.literal(1),
  savedAt: z.string(),
  app: z.object({
    currentStep: z.number().min(1).max(4),
    filter: z.enum(['todos', 'validos', 'avisos', 'errores', 'exportables', 'rechazados']),
    exportMode: z.enum(['strict', 'assisted']),
  }),
  dataset: parsedDatasetSchema.nullable(),
  mapping: mappingSchema,
  batchConfig: batchSchema,
  rowOverrides: rowOverridesSchema,
})

export type ProjectSnapshotInput = z.infer<typeof projectSnapshotSchema>

export const LOCAL_STORAGE_KEY = 'backerpost:poc:v1'
