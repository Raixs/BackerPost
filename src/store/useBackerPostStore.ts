import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultBatchConfig, defaultMapping } from '../app/constants'
import { suggestColumnMapping } from '../features/mapping/suggestions'
import { normalizeAndValidateRows } from '../features/validation/normalizeAndValidate'
import { LOCAL_STORAGE_KEY } from '../lib/storage/projectSchema'
import type {
  BatchConfig,
  ColumnMapping,
  ExportMode,
  NormalizedShipmentRow,
  ParsedCsvDataset,
  ProjectSnapshot,
  ReviewFilter,
  RowOverrides,
} from '../types/domain'

interface AppState {
  currentStep: number
  filter: ReviewFilter
  exportMode: ExportMode
  dataset: ParsedCsvDataset | null
  mapping: ColumnMapping
  batchConfig: BatchConfig
  rowOverrides: Record<number, RowOverrides>
  normalizedRows: NormalizedShipmentRow[]
  parseErrors: string[]
  selectedRowIndex: number | null
  setParseErrors: (errors: string[]) => void
  setDataset: (dataset: ParsedCsvDataset | null) => void
  setMappingField: (field: keyof ColumnMapping, value: string | null) => void
  setBatchField: <K extends keyof BatchConfig>(field: K, value: BatchConfig[K]) => void
  setRowOverride: (rowIndex: number, patch: RowOverrides) => void
  setCurrentStep: (step: number) => void
  setFilter: (filter: ReviewFilter) => void
  setExportMode: (mode: ExportMode) => void
  setSelectedRowIndex: (rowIndex: number | null) => void
  resetSession: () => void
  loadProjectSnapshot: (snapshot: ProjectSnapshot) => void
}

const clampStep = (step: number): number => Math.min(4, Math.max(1, step))

const recomputeRows = (
  dataset: ParsedCsvDataset | null,
  mapping: ColumnMapping,
  batchConfig: BatchConfig,
  rowOverrides: Record<number, RowOverrides>,
): NormalizedShipmentRow[] => {
  if (!dataset) {
    return []
  }

  return normalizeAndValidateRows(dataset.rows, mapping, batchConfig, rowOverrides)
}

const parseNumericInput = (field: keyof BatchConfig, value: BatchConfig[keyof BatchConfig]): BatchConfig[keyof BatchConfig] => {
  if (field !== 'pesoGramos' && field !== 'valorDeclarado' && field !== 'cantidadArticulos') {
    return value
  }

  const raw = value as string | number | null
  if (raw === '' || raw === null) {
    return null
  }

  const numeric = Number(raw)
  return Number.isFinite(numeric) ? numeric : null
}

export const useBackerPostStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      filter: 'todos',
      exportMode: 'strict',
      dataset: null,
      mapping: { ...defaultMapping },
      batchConfig: { ...defaultBatchConfig },
      rowOverrides: {},
      normalizedRows: [],
      parseErrors: [],
      selectedRowIndex: null,
      setParseErrors: (errors) => set({ parseErrors: errors }),
      setDataset: (dataset) => {
        const mapping = dataset ? suggestColumnMapping(dataset.headers) : { ...defaultMapping }
        const rowOverrides = {}
        const batchConfig = { ...get().batchConfig }

        set({
          dataset,
          mapping,
          rowOverrides,
          normalizedRows: recomputeRows(dataset, mapping, batchConfig, rowOverrides),
          parseErrors: [],
          currentStep: dataset ? 2 : 1,
          selectedRowIndex: null,
        })
      },
      setMappingField: (field, value) => {
        const nextMapping = {
          ...get().mapping,
          [field]: value,
        }

        set({
          mapping: nextMapping,
          normalizedRows: recomputeRows(get().dataset, nextMapping, get().batchConfig, get().rowOverrides),
        })
      },
      setBatchField: (field, value) => {
        const batchConfig = {
          ...get().batchConfig,
          [field]: parseNumericInput(field, value) as BatchConfig[typeof field],
        }

        set({
          batchConfig,
          normalizedRows: recomputeRows(get().dataset, get().mapping, batchConfig, get().rowOverrides),
        })
      },
      setRowOverride: (rowIndex, patch) => {
        const current = get().rowOverrides[rowIndex] ?? {}
        const rowOverrides = {
          ...get().rowOverrides,
          [rowIndex]: {
            ...current,
            ...patch,
          },
        }

        set({
          rowOverrides,
          normalizedRows: recomputeRows(get().dataset, get().mapping, get().batchConfig, rowOverrides),
        })
      },
      setCurrentStep: (step) => set({ currentStep: clampStep(step) }),
      setFilter: (filter) => set({ filter }),
      setExportMode: (exportMode) => set({ exportMode }),
      setSelectedRowIndex: (selectedRowIndex) => set({ selectedRowIndex }),
      resetSession: () =>
        set({
          currentStep: 1,
          filter: 'todos',
          exportMode: 'strict',
          dataset: null,
          mapping: { ...defaultMapping },
          batchConfig: { ...defaultBatchConfig },
          rowOverrides: {},
          normalizedRows: [],
          parseErrors: [],
          selectedRowIndex: null,
        }),
      loadProjectSnapshot: (snapshot) => {
        const rowOverrides = Object.entries(snapshot.rowOverrides).reduce<Record<number, RowOverrides>>(
          (accumulator, [key, value]) => {
            accumulator[Number(key)] = value
            return accumulator
          },
          {},
        )

        set({
          currentStep: clampStep(snapshot.app.currentStep),
          filter: snapshot.app.filter,
          exportMode: snapshot.app.exportMode,
          dataset: snapshot.dataset,
          mapping: snapshot.mapping,
          batchConfig: snapshot.batchConfig,
          rowOverrides,
          normalizedRows: recomputeRows(snapshot.dataset, snapshot.mapping, snapshot.batchConfig, rowOverrides),
          parseErrors: [],
          selectedRowIndex: null,
        })
      },
    }),
    {
      name: LOCAL_STORAGE_KEY,
      partialize: (state) => ({
        currentStep: state.currentStep,
        filter: state.filter,
        exportMode: state.exportMode,
        dataset: state.dataset,
        mapping: state.mapping,
        batchConfig: state.batchConfig,
        rowOverrides: state.rowOverrides,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return
        }

        state.normalizedRows = recomputeRows(state.dataset, state.mapping, state.batchConfig, state.rowOverrides)
        state.parseErrors = []
        state.selectedRowIndex = null
      },
    },
  ),
)
