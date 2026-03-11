import { wizardSteps } from '../app/constants'
import { cn } from '../lib/utils/cn'

interface StepperProps {
  currentStep: number
  onStepChange: (step: number) => void
}

export const Stepper = ({ currentStep, onStepChange }: StepperProps) => (
  <ol className="grid gap-2 sm:grid-cols-4" aria-label="Pasos del asistente">
    {wizardSteps.map((label, index) => {
      const step = index + 1
      const isCurrent = currentStep === step
      const isCompleted = currentStep > step

      return (
        <li key={label}>
          <button
            type="button"
            onClick={() => onStepChange(step)}
            className={cn(
              'w-full rounded-xl border px-3 py-2 text-left transition',
              isCurrent && 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-900/30',
              isCompleted && 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-700 dark:bg-emerald-900/10',
              !isCurrent && !isCompleted && 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
            )}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Paso {step}</p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</p>
          </button>
        </li>
      )
    })}
  </ol>
)
