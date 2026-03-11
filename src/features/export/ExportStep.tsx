import { useMemo, useState } from 'react'
import { Button, Card, GhostButton } from '../../components/ui'
import { ProgressChecklist } from '../../components/ProgressChecklist'
import { downloadTextFile } from '../../lib/utils/download'
import { useBackerPostStore } from '../../store/useBackerPostStore'
import { buildCorreosTxt, buildIssuesCsv, buildNormalizedCsv, buildProjectSnapshot, buildRejectedCsv } from './exporters'

export const ExportStep = () => {
  const [lastMessage, setLastMessage] = useState('')
  const rows = useBackerPostStore((state) => state.normalizedRows)
  const dataset = useBackerPostStore((state) => state.dataset)
  const exportMode = useBackerPostStore((state) => state.exportMode)
  const setExportMode = useBackerPostStore((state) => state.setExportMode)
  const setCurrentStep = useBackerPostStore((state) => state.setCurrentStep)
  const setFilter = useBackerPostStore((state) => state.setFilter)

  const withErrors = useMemo(() => rows.filter((row) => row.status === 'error').length, [rows])
  const blockingReasons = useMemo(() => {
    const reasonCounter = new Map<string, number>()

    rows.forEach((row) => {
      row.issues
        .filter((entry) => entry.severity === 'error')
        .forEach((entry) => reasonCounter.set(entry.message, (reasonCounter.get(entry.message) ?? 0) + 1))
    })

    return [...reasonCounter.entries()].sort((left, right) => right[1] - left[1]).slice(0, 4)
  }, [rows])

  if (rows.length === 0) {
    return (
      <Card>
        <p className="text-sm text-slate-700 dark:text-slate-200">No hay datos para exportar todavía.</p>
      </Card>
    )
  }

  const txtResult = buildCorreosTxt(rows, exportMode)
  const strictBlocked = exportMode === 'strict' && withErrors > 0

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Exportar resultados</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          El TXT se genera con el formato oficial de Correos (Plantilla Fichero Formato Único, perfil S0410).
          Modo estricto bloquea la exportación si quedan errores; modo asistido exporta solo filas válidas.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <input
              type="radio"
              name="export-mode"
              checked={exportMode === 'strict'}
              onChange={() => setExportMode('strict')}
            />
            <span>
              <strong>Modo estricto</strong>
              <p className="text-xs text-slate-600 dark:text-slate-300">Solo permite TXT cuando no hay errores bloqueantes.</p>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <input
              type="radio"
              name="export-mode"
              checked={exportMode === 'assisted'}
              onChange={() => setExportMode('assisted')}
            />
            <span>
              <strong>Modo asistido</strong>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Exporta TXT con registros válidos y genera archivos de rechazo/incidencias.
              </p>
            </span>
          </label>
        </div>

        {strictBlocked && (
          <p className="mt-3 text-sm text-rose-700 dark:text-rose-300">
            No puedes exportar `correos_s0410.txt` en modo estricto porque hay filas con errores bloqueantes.
          </p>
        )}

        <ProgressChecklist
          className="mt-4"
          title="Vista previa de exportación"
          items={[
            {
              id: 'has-exportable',
              label: `Se exportarán ${txtResult.exportedCount} fila(s) en el TXT`,
              done: txtResult.exportedCount > 0,
              hint: 'Corrige filas para tener al menos un registro exportable.',
            },
            {
              id: 'strict-ready',
              label: 'TXT disponible en modo estricto',
              done: !strictBlocked,
              hint: strictBlocked ? `Hay ${withErrors} fila(s) con bloqueo.` : undefined,
            },
            {
              id: 'rejected-info',
              label: `Quedarán ${txtResult.rejectedCount} fila(s) en rechazados`,
              done: true,
            },
          ]}
        />

        {strictBlocked && blockingReasons.length > 0 && (
          <div className="mt-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-100">
            <p className="font-semibold">Motivos más frecuentes de bloqueo:</p>
            <ul className="mt-1 list-disc pl-5">
              {blockingReasons.map(([reason, count]) => (
                <li key={reason}>
                  {reason} ({count})
                </li>
              ))}
            </ul>
            <GhostButton
              type="button"
              className="mt-2"
              onClick={() => {
                setCurrentStep(3)
                setFilter('errores')
              }}
            >
              Revisar filas con error
            </GhostButton>
          </div>
        )}
      </Card>

      <Card>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            onClick={() => {
              downloadTextFile('envios_normalizados.csv', buildNormalizedCsv(rows), 'text/csv')
              setLastMessage('CSV normalizado exportado.')
            }}
          >
            Descargar envios_normalizados.csv
          </Button>

          <Button
            type="button"
            disabled={strictBlocked || txtResult.txt === null}
            onClick={() => {
              if (!txtResult.txt) {
                return
              }

              downloadTextFile('correos_s0410.txt', txtResult.txt, 'text/plain')
              setLastMessage(
                txtResult.rejectedCount > 0
                  ? 'Se han exportado solo los registros válidos.'
                  : 'TXT de Correos exportado correctamente.',
              )
            }}
          >
            Descargar correos_s0410.txt
          </Button>

          <GhostButton
            type="button"
            onClick={() => {
              downloadTextFile('incidencias.csv', buildIssuesCsv(rows), 'text/csv')
              setLastMessage('Informe de incidencias exportado.')
            }}
          >
            Descargar incidencias.csv
          </GhostButton>

          <GhostButton
            type="button"
            onClick={() => {
              downloadTextFile('rechazados.csv', buildRejectedCsv(rows, dataset), 'text/csv')
              setLastMessage('Listado de rechazados exportado.')
            }}
          >
            Descargar rechazados.csv
          </GhostButton>

          <GhostButton
            type="button"
            onClick={() => {
              const snapshotState = useBackerPostStore.getState()
              const snapshot = buildProjectSnapshot({
                app: {
                  currentStep: snapshotState.currentStep,
                  filter: snapshotState.filter,
                  exportMode: snapshotState.exportMode,
                },
                dataset: snapshotState.dataset,
                mapping: snapshotState.mapping,
                batchConfig: snapshotState.batchConfig,
                rowOverrides: snapshotState.rowOverrides,
              })
              downloadTextFile('proyecto-backerpost.json', JSON.stringify(snapshot, null, 2), 'application/json')
              setLastMessage('Proyecto exportado a JSON.')
            }}
          >
            Descargar proyecto-backerpost.json
          </GhostButton>
        </div>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Exportables: {txtResult.exportedCount} · Rechazados: {txtResult.rejectedCount}
        </p>

        {txtResult.issues.length > 0 && (
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
            Aviso: {txtResult.issues.length} campos fueron truncados para el TXT.
          </p>
        )}

        {lastMessage && <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">{lastMessage}</p>}
      </Card>
    </div>
  )
}
