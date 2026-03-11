import { useMemo } from 'react'
import { Stepper } from './components/Stepper'
import { Card, GhostButton } from './components/ui'
import { ExportStep } from './features/export/ExportStep'
import { ImportStep } from './features/import/ImportStep'
import { MappingStep } from './features/mapping/MappingStep'
import { ReviewStep } from './features/review/ReviewStep'
import { useBackerPostStore } from './store/useBackerPostStore'

const StepView = ({ step }: { step: number }) => {
  switch (step) {
    case 1:
      return <ImportStep />
    case 2:
      return <MappingStep />
    case 3:
      return <ReviewStep />
    case 4:
      return <ExportStep />
    default:
      return <ImportStep />
  }
}

function App() {
  const currentStep = useBackerPostStore((state) => state.currentStep)
  const rows = useBackerPostStore((state) => state.normalizedRows)
  const exportMode = useBackerPostStore((state) => state.exportMode)
  const setCurrentStep = useBackerPostStore((state) => state.setCurrentStep)
  const setFilter = useBackerPostStore((state) => state.setFilter)
  const setSelectedRowIndex = useBackerPostStore((state) => state.setSelectedRowIndex)

  const metrics = useMemo(() => {
    const total = rows.length
    const exportable = rows.filter((row) => row.exportable).length
    const rejected = rows.filter((row) => !row.exportable).length
    const firstError = rows.find((row) => row.status === 'error') ?? null

    return {
      total,
      exportable,
      rejected,
      firstError,
    }
  }, [rows])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-emerald-50/40 to-sky-100/40 px-4 py-6 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 dark:text-slate-50">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">BackerPost · PoC</p>
          <h1 className="text-3xl font-semibold leading-tight">Kickstarter CSV a Correos Mi Oficina</h1>
          <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">
            Importa, mapea, valida, corrige y exporta envíos internacionales S0410 sin salir del navegador.
          </p>
        </header>

        <Card className="border-emerald-200 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-900/20">
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            Tus archivos se procesan localmente en el navegador. No se envían datos a servidores externos.
          </p>
        </Card>

        <Card className="sticky top-2 z-20 border-slate-200/80 bg-white/95 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-semibold text-slate-700 dark:text-slate-200">
                Lote: {metrics.total} fila(s) · Exportables: {metrics.exportable} · Rechazados: {metrics.rejected}
              </p>
              <p className="text-slate-500 dark:text-slate-300">Modo de exportación: {exportMode === 'strict' ? 'Estricto' : 'Asistido'}</p>
            </div>
            <GhostButton
              type="button"
              disabled={!metrics.firstError}
              onClick={() => {
                if (!metrics.firstError) {
                  return
                }
                setCurrentStep(3)
                setFilter('errores')
                setSelectedRowIndex(metrics.firstError.rowIndex)
              }}
            >
              Ir al primer error
            </GhostButton>
          </div>
        </Card>

        <Stepper currentStep={currentStep} onStepChange={setCurrentStep} />

        <StepView step={currentStep} />
      </div>
    </main>
  )
}

export default App
