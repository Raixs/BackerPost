import type { ReactNode } from 'react'
import { mappingLabels } from '../../app/constants'
import { Button, Card, Input, Label, Select } from '../../components/ui'
import { ProgressChecklist } from '../../components/ProgressChecklist'
import { useBackerPostStore } from '../../store/useBackerPostStore'
import type { BatchConfig, ColumnMapping } from '../../types/domain'
import { getMissingRequiredBatchFields, getMissingRequiredMappingTargets } from './progress'

const mappingTargets = Object.keys(mappingLabels) as Array<keyof ColumnMapping>
const franqueoOptions = [
  { value: 'FP', label: 'FP · Franqueo pagado' },
  { value: 'FM', label: 'FM · Franqueo máquina' },
  { value: 'ON', label: 'ON · Pago online' },
]

const tipoEnvioOptions = [
  { value: '1', label: '1 · Documentos' },
  { value: '2', label: '2 · Venta de mercancías' },
  { value: '3', label: '3 · Regalo' },
  { value: '4', label: '4 · Muestra comercial' },
  { value: '5', label: '5 · Mercancía devuelta' },
  { value: '6', label: '6 · Otro' },
]

const batchFieldLabels: Record<'tipoEnvio' | 'descripcionContenido' | 'pesoGramos' | 'valorDeclarado' | 'cantidadArticulos' | 'paisOrigenMercancia', string> = {
  tipoEnvio: 'Tipo de envío',
  descripcionContenido: 'Descripción de contenido',
  pesoGramos: 'Peso por envío (gramos)',
  valorDeclarado: 'Valor declarado por envío',
  cantidadArticulos: 'Cantidad de artículos por envío',
  paisOrigenMercancia: 'País de origen de mercancía',
}

const isMissingRequiredBatchField = (
  missing: Array<keyof BatchConfig>,
  field: keyof BatchConfig,
): boolean => missing.includes(field)

const RequiredFieldBlock = ({
  title,
  missing,
  children,
}: {
  title: string
  missing: boolean
  children: ReactNode
}) => (
  <div
    className={`rounded-xl border p-2 transition ${
      missing
        ? 'border-rose-300 bg-rose-50/70 dark:border-rose-800 dark:bg-rose-900/20'
        : 'border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-950/30'
    }`}
  >
    <Label className={missing ? 'text-rose-700 dark:text-rose-300' : ''}>{title} (requerido)</Label>
    {missing && <p className="mb-1 text-xs font-medium text-rose-700 dark:text-rose-300">Pendiente de confirmar</p>}
    {children}
  </div>
)

export const MappingStep = () => {
  const dataset = useBackerPostStore((state) => state.dataset)
  const mapping = useBackerPostStore((state) => state.mapping)
  const batchConfig = useBackerPostStore((state) => state.batchConfig)
  const setMappingField = useBackerPostStore((state) => state.setMappingField)
  const setBatchField = useBackerPostStore((state) => state.setBatchField)
  const setCurrentStep = useBackerPostStore((state) => state.setCurrentStep)

  if (!dataset) {
    return (
      <Card>
        <p className="text-sm text-slate-700 dark:text-slate-200">Primero debes importar un CSV para mapear columnas.</p>
      </Card>
    )
  }

  const missingMapping = getMissingRequiredMappingTargets(mapping)
  const missingBatch = getMissingRequiredBatchFields(batchConfig)
  const mappingReady = missingMapping.length === 0
  const batchReady = missingBatch.length === 0

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Configuración del envío</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Primero define la configuración base del lote. Te marcamos lo obligatorio pendiente para que sea más fácil.
        </p>

        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/40">
          {missingBatch.length > 0 ? (
            <>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Campos obligatorios pendientes:</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-200">
                {missingBatch
                  .map((field) => batchFieldLabels[field as keyof typeof batchFieldLabels] ?? field)
                  .join(', ')}
              </p>
            </>
          ) : (
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Configuración obligatoria completa. Puedes continuar cuando acabes el mapeo.
            </p>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Producto Correos</Label>
            <Input value={`${batchConfig.productoCorreos} · ${batchConfig.nombreProducto}`} readOnly />
          </div>
          <div>
            <Label>Modalidad de entrega</Label>
            <Input value={batchConfig.modalidadEntrega} readOnly />
          </div>
          <div>
            <Label>Tipo de franqueo</Label>
            <Select
              value={batchConfig.tipoFranqueo}
              onChange={(event) => setBatchField('tipoFranqueo', event.target.value)}
            >
              {franqueoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <RequiredFieldBlock title={batchFieldLabels.tipoEnvio} missing={isMissingRequiredBatchField(missingBatch, 'tipoEnvio')}>
            <Select
              value={batchConfig.tipoEnvio}
              onChange={(event) => setBatchField('tipoEnvio', event.target.value)}
            >
              <option value="">Selecciona un tipo</option>
              {tipoEnvioOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </RequiredFieldBlock>

          <div className="sm:col-span-2">
            <RequiredFieldBlock
              title={batchFieldLabels.descripcionContenido}
              missing={isMissingRequiredBatchField(missingBatch, 'descripcionContenido')}
            >
              <Input
                value={batchConfig.descripcionContenido}
                onChange={(event) => setBatchField('descripcionContenido', event.target.value)}
                placeholder="Libro de tapa dura"
              />
            </RequiredFieldBlock>
          </div>

          <RequiredFieldBlock title={batchFieldLabels.pesoGramos} missing={isMissingRequiredBatchField(missingBatch, 'pesoGramos')}>
            <Input
              type="number"
              min="0"
              value={batchConfig.pesoGramos ?? ''}
              onChange={(event) => setBatchField('pesoGramos', event.target.value === '' ? null : Number(event.target.value))}
            />
          </RequiredFieldBlock>

          <RequiredFieldBlock
            title={batchFieldLabels.valorDeclarado}
            missing={isMissingRequiredBatchField(missingBatch, 'valorDeclarado')}
          >
            <Input
              type="number"
              min="0"
              step="0.01"
              value={batchConfig.valorDeclarado ?? ''}
              onChange={(event) =>
                setBatchField('valorDeclarado', event.target.value === '' ? null : Number(event.target.value))
              }
            />
          </RequiredFieldBlock>

          <RequiredFieldBlock
            title={batchFieldLabels.cantidadArticulos}
            missing={isMissingRequiredBatchField(missingBatch, 'cantidadArticulos')}
          >
            <Input
              type="number"
              min="1"
              value={batchConfig.cantidadArticulos ?? ''}
              onChange={(event) =>
                setBatchField('cantidadArticulos', event.target.value === '' ? null : Number(event.target.value))
              }
            />
          </RequiredFieldBlock>

          <RequiredFieldBlock
            title={batchFieldLabels.paisOrigenMercancia}
            missing={isMissingRequiredBatchField(missingBatch, 'paisOrigenMercancia')}
          >
            <Input
              value={batchConfig.paisOrigenMercancia}
              onChange={(event) => setBatchField('paisOrigenMercancia', event.target.value.toUpperCase())}
              placeholder="ES"
            />
          </RequiredFieldBlock>
        </div>

        <ProgressChecklist
          title="Checklist de configuración"
          className="mt-3"
          items={[
            {
              id: 'batch-required',
              label: 'Configuración base del lote completa',
              done: missingBatch.length === 0,
              hint:
                missingBatch.length > 0
                  ? `Faltan: ${missingBatch
                      .map((field) => batchFieldLabels[field as keyof typeof batchFieldLabels] ?? field)
                      .join(', ')}.`
                  : undefined,
            },
          ]}
        />
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Mapea las columnas del CSV para continuar</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          BackerPost intentó sugerir columnas automáticamente. Puedes revisar y ajustar.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {mappingTargets.map((target) => (
            <div key={target}>
              <Label>{mappingLabels[target]}</Label>
              <Select
                value={mapping[target] ?? ''}
                onChange={(event) => setMappingField(target, event.target.value || null)}
                aria-label={mappingLabels[target]}
              >
                <option value="">Sin mapear</option>
                {dataset.headers.map((header) => (
                  <option key={`${target}-${header}`} value={header}>
                    {header}
                  </option>
                ))}
              </Select>
            </div>
          ))}
        </div>

        <ProgressChecklist
          title="Checklist de mapeo"
          className="mt-4"
          items={[
            {
              id: 'map-required',
              label: 'Campos obligatorios mapeados (nombre, dirección 1, ciudad, país)',
              done: missingMapping.length === 0,
              hint:
                missingMapping.length > 0
                  ? `Faltan: ${missingMapping.map((item) => mappingLabels[item]).join(', ')}.`
                  : undefined,
            },
          ]}
        />

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <Button type="button" disabled={!mappingReady || !batchReady} onClick={() => setCurrentStep(3)}>
            Guardar y revisar filas
          </Button>
        </div>

        {!mappingReady && (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">Completa el mapeo mínimo para continuar.</p>
        )}
      </Card>
    </div>
  )
}
