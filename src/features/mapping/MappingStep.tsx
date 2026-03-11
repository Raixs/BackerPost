import { mappingLabels } from '../../app/constants'
import { Button, Card, Input, Label, Select } from '../../components/ui'
import { ProgressChecklist } from '../../components/ProgressChecklist'
import { useBackerPostStore } from '../../store/useBackerPostStore'
import type { ColumnMapping } from '../../types/domain'
import { getMissingRequiredBatchFields, getMissingRequiredMappingTargets } from './progress'

const mappingTargets = Object.keys(mappingLabels) as Array<keyof ColumnMapping>

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
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Mapea las columnas del CSV para continuar</h2>
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
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Configuración del envío</h3>

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
            <Input
              value={batchConfig.tipoFranqueo}
              onChange={(event) => setBatchField('tipoFranqueo', event.target.value)}
              placeholder="FRANQUEO_PAGADO"
            />
          </div>
          <div>
            <Label>Tipo de envío (requerido)</Label>
            <Input
              value={batchConfig.tipoEnvio}
              onChange={(event) => setBatchField('tipoEnvio', event.target.value)}
              placeholder="MERCANCIA"
            />
          </div>
          <div>
            <Label>Descripción de contenido (requerido)</Label>
            <Input
              value={batchConfig.descripcionContenido}
              onChange={(event) => setBatchField('descripcionContenido', event.target.value)}
              placeholder="Libro"
            />
          </div>
          <div>
            <Label>Peso por envío en gramos (requerido)</Label>
            <Input
              type="number"
              min="0"
              value={batchConfig.pesoGramos ?? ''}
              onChange={(event) =>
                setBatchField('pesoGramos', event.target.value === '' ? null : Number(event.target.value))
              }
            />
          </div>
          <div>
            <Label>Valor declarado por envío (requerido)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={batchConfig.valorDeclarado ?? ''}
              onChange={(event) =>
                setBatchField('valorDeclarado', event.target.value === '' ? null : Number(event.target.value))
              }
            />
          </div>
          <div>
            <Label>Cantidad de artículos por envío (requerido)</Label>
            <Input
              type="number"
              min="1"
              value={batchConfig.cantidadArticulos ?? ''}
              onChange={(event) =>
                setBatchField('cantidadArticulos', event.target.value === '' ? null : Number(event.target.value))
              }
            />
          </div>
          <div>
            <Label>País de origen de mercancía (requerido)</Label>
            <Input
              value={batchConfig.paisOrigenMercancia}
              onChange={(event) => setBatchField('paisOrigenMercancia', event.target.value.toUpperCase())}
              placeholder="ES"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <Button type="button" disabled={!mappingReady || !batchReady} onClick={() => setCurrentStep(3)}>
            Guardar y revisar filas
          </Button>
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
                      .map((field) => {
                        if (field === 'tipoEnvio') return 'tipo de envío'
                        if (field === 'descripcionContenido') return 'descripción de contenido'
                        if (field === 'pesoGramos') return 'peso por envío'
                        if (field === 'valorDeclarado') return 'valor declarado'
                        if (field === 'cantidadArticulos') return 'cantidad de artículos'
                        if (field === 'paisOrigenMercancia') return 'país de origen de mercancía'
                        return field
                      })
                      .join(', ')}.`
                  : undefined,
            },
          ]}
        />

        {!mappingReady && (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">Completa el mapeo mínimo para continuar.</p>
        )}
      </Card>
    </div>
  )
}
