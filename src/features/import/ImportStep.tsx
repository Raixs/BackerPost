import { useRef, useState } from 'react'
import { Card, GhostButton } from '../../components/ui'
import { parseKickstarterCsvText, readTextFile } from '../../lib/csv/parser'
import { projectSnapshotSchema } from '../../lib/storage/projectSchema'
import type { ProjectSnapshot } from '../../types/domain'
import { useBackerPostStore } from '../../store/useBackerPostStore'
import { ProgressChecklist } from '../../components/ProgressChecklist'

export const ImportStep = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const projectInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dataset = useBackerPostStore((state) => state.dataset)
  const parseErrors = useBackerPostStore((state) => state.parseErrors)
  const setDataset = useBackerPostStore((state) => state.setDataset)
  const setParseErrors = useBackerPostStore((state) => state.setParseErrors)
  const resetSession = useBackerPostStore((state) => state.resetSession)
  const loadProjectSnapshot = useBackerPostStore((state) => state.loadProjectSnapshot)

  const handleFile = async (file: File) => {
    const text = await readTextFile(file)
    const result = parseKickstarterCsvText(text, file.name)
    if (result.dataset) {
      setDataset(result.dataset)
      setParseErrors([])
      return
    }

    setParseErrors(result.errors)
  }

  const handleProjectFile = async (file: File) => {
    const text = await readTextFile(file)

    try {
      const parsed = JSON.parse(text)
      const snapshot = projectSnapshotSchema.parse(parsed) as ProjectSnapshot
      loadProjectSnapshot(snapshot)
    } catch {
      setParseErrors(['No se pudo importar el proyecto JSON. Verifica el archivo.'])
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Importar CSV de Kickstarter</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Arrastra el archivo o selecciónalo desde tu equipo. Se procesa localmente.
        </p>

        <div
          className={`mt-4 rounded-2xl border-2 border-dashed p-8 text-center transition ${
            isDragging
              ? 'border-emerald-500 bg-emerald-100/60 dark:bg-emerald-900/20'
              : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50'
          }`}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            setIsDragging(false)
          }}
          onDrop={(event) => {
            event.preventDefault()
            setIsDragging(false)
            const droppedFile = event.dataTransfer.files?.[0]
            if (droppedFile) {
              void handleFile(droppedFile)
            }
          }}
        >
          <p className="text-sm text-slate-600 dark:text-slate-300">Suelta aquí el CSV o usa el selector</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <GhostButton type="button" onClick={() => fileInputRef.current?.click()}>
              Seleccionar CSV
            </GhostButton>
            <GhostButton type="button" onClick={() => projectInputRef.current?.click()}>
              Importar proyecto JSON
            </GhostButton>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            data-testid="csv-input"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0]
              if (selectedFile) {
                void handleFile(selectedFile)
              }
            }}
          />
          <input
            ref={projectInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            data-testid="project-input"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0]
              if (selectedFile) {
                void handleProjectFile(selectedFile)
              }
            }}
          />
        </div>

        {parseErrors.length > 0 && (
          <div className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-100">
            <p className="font-semibold">No se pudo procesar el archivo:</p>
            <ul className="mt-1 list-disc pl-5">
              {parseErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <ProgressChecklist
          className="mt-4"
          title="Checklist de importación"
          items={[
            {
              id: 'csv-loaded',
              label: 'Archivo cargado',
              done: Boolean(dataset),
              hint: 'Carga un CSV de Kickstarter o un proyecto JSON.',
            },
            {
              id: 'rows-detected',
              label: 'Filas detectadas',
              done: Boolean(dataset && dataset.rows.length > 0),
              hint: 'El archivo debe contener cabecera y al menos una fila.',
            },
            {
              id: 'ready-next',
              label: 'Listo para mapear columnas',
              done: Boolean(dataset && parseErrors.length === 0),
            },
          ]}
        />
      </Card>

      {dataset && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Archivo cargado</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <strong>{dataset.fileName}</strong> · {dataset.rows.length} filas
              </p>
            </div>
            <GhostButton type="button" onClick={resetSession}>
              Reiniciar e importar otro
            </GhostButton>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="text-slate-500 dark:text-slate-300">
                <tr>
                  {dataset.headers.slice(0, 8).map((header) => (
                    <th key={header} className="border-b border-slate-200 px-2 py-2 dark:border-slate-700">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataset.preview.map((row, index) => (
                  <tr key={index} className="odd:bg-slate-50 dark:odd:bg-slate-900/60">
                    {dataset.headers.slice(0, 8).map((header) => (
                      <td key={`${index}-${header}`} className="border-b border-slate-100 px-2 py-2 dark:border-slate-800">
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
