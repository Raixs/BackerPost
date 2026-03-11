import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge, Button, Card, GhostButton, Input, Label } from '../../components/ui'
import { ProgressChecklist } from '../../components/ProgressChecklist'
import { filterRows } from '../validation/normalizeAndValidate'
import { useBackerPostStore } from '../../store/useBackerPostStore'
import type { NormalizedShipmentRow, ReviewFilter, RowOverrides } from '../../types/domain'

const filterLabels: Record<ReviewFilter, string> = {
  todos: 'Todos',
  validos: 'Válidos',
  avisos: 'Con avisos',
  errores: 'Con errores',
  exportables: 'Solo exportables',
  rechazados: 'Solo rechazados',
}

const statusBadgeTone = {
  valid: 'success',
  warning: 'warning',
  error: 'danger',
} as const

const statusLabel = {
  valid: 'Válido',
  warning: 'Avisos',
  error: 'Error',
} as const

const summary = (rows: NormalizedShipmentRow[]) => {
  const valid = rows.filter((row) => row.status === 'valid').length
  const warning = rows.filter((row) => row.status === 'warning').length
  const error = rows.filter((row) => row.status === 'error').length

  return {
    total: rows.length,
    valid,
    warning,
    error,
  }
}

const toNumberOrNull = (value: string): number | null => {
  if (value.trim() === '') {
    return null
  }

  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

const getFirstBlockingField = (row: NormalizedShipmentRow): string => {
  const firstBlockingIssue = row.issues.find((entry) => entry.severity === 'error' && entry.field)
  return firstBlockingIssue?.field ?? 'recipientName'
}

const RowDrawer = ({ row, onClose }: { row: NormalizedShipmentRow; onClose: () => void }) => {
  const setRowOverride = useBackerPostStore((state) => state.setRowOverride)
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const [form, setForm] = useState<RowOverrides>({
    recipientName: row.recipientName,
    addressLine1: row.addressLine1,
    addressLine2: row.addressLine2,
    city: row.city,
    region: row.region,
    postalCode: row.postalCode,
    countryInput: row.countryInput,
    email: row.email,
    phone: row.phone,
    tipoEnvio: row.tipoEnvio,
    descripcionContenido: row.descripcionContenido,
    pesoGramos: row.pesoGramos,
    valorDeclarado: row.valorDeclarado,
    cantidadArticulos: row.cantidadArticulos,
    paisOrigenMercancia: row.paisOrigenMercancia,
  })

  const setFieldRef = (field: string) => (node: HTMLInputElement | null) => {
    fieldRefs.current[field] = node
  }

  const focusField = (field: string) => {
    const target = fieldRefs.current[field] ?? fieldRefs.current.recipientName
    target?.focus()
    target?.scrollIntoView({ block: 'nearest' })
  }

  useEffect(() => {
    setForm({
      recipientName: row.recipientName,
      addressLine1: row.addressLine1,
      addressLine2: row.addressLine2,
      city: row.city,
      region: row.region,
      postalCode: row.postalCode,
      countryInput: row.countryInput,
      email: row.email,
      phone: row.phone,
      tipoEnvio: row.tipoEnvio,
      descripcionContenido: row.descripcionContenido,
      pesoGramos: row.pesoGramos,
      valorDeclarado: row.valorDeclarado,
      cantidadArticulos: row.cantidadArticulos,
      paisOrigenMercancia: row.paisOrigenMercancia,
    })

    const field = getFirstBlockingField(row)
    requestAnimationFrame(() => {
      focusField(field)
    })
  }, [row])

  return (
    <aside className="fixed inset-y-0 right-0 z-30 w-full max-w-xl overflow-y-auto border-l border-slate-300 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Fila #{row.rowIndex}</h3>
        <GhostButton type="button" onClick={onClose}>
          Cerrar
        </GhostButton>
      </div>

      {row.status === 'error' && (
        <p className="mt-3 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-200">
          Esta fila no puede exportarse todavía. Corrige los campos marcados y vuelve a validar.
        </p>
      )}

      <div className="mt-4 space-y-4">
        <Card>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Valores originales</h4>
          <dl className="mt-2 grid gap-1 text-xs text-slate-600 dark:text-slate-300">
            {Object.entries(row.rawMapped).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <dt className="w-32 font-medium text-slate-500">{key}</dt>
                <dd className="break-all">{value || '-'}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Corregir y revalidar</h4>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <Label>Nombre</Label>
              <Input
                ref={setFieldRef('recipientName')}
                value={form.recipientName ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, recipientName: event.target.value }))}
              />
            </div>
            <div>
              <Label>País</Label>
              <Input
                ref={setFieldRef('countryInput')}
                value={form.countryInput ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, countryInput: event.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Dirección 1</Label>
              <Input
                ref={setFieldRef('addressLine1')}
                value={form.addressLine1 ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, addressLine1: event.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Dirección 2</Label>
              <Input
                ref={setFieldRef('addressLine2')}
                value={form.addressLine2 ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, addressLine2: event.target.value }))}
              />
            </div>
            <div>
              <Label>Ciudad</Label>
              <Input
                ref={setFieldRef('city')}
                value={form.city ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
              />
            </div>
            <div>
              <Label>Región</Label>
              <Input
                ref={setFieldRef('region')}
                value={form.region ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, region: event.target.value }))}
              />
            </div>
            <div>
              <Label>Código postal</Label>
              <Input
                ref={setFieldRef('postalCode')}
                value={form.postalCode ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, postalCode: event.target.value }))}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                ref={setFieldRef('email')}
                value={form.email ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                ref={setFieldRef('phone')}
                value={form.phone ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </div>
            <div>
              <Label>Tipo envío</Label>
              <Input
                ref={setFieldRef('tipoEnvio')}
                value={form.tipoEnvio ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, tipoEnvio: event.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Descripción contenido</Label>
              <Input
                ref={setFieldRef('descripcionContenido')}
                value={form.descripcionContenido ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, descripcionContenido: event.target.value }))}
              />
            </div>
            <div>
              <Label>Peso (g)</Label>
              <Input
                ref={setFieldRef('pesoGramos')}
                type="number"
                value={form.pesoGramos ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, pesoGramos: toNumberOrNull(event.target.value) }))}
              />
            </div>
            <div>
              <Label>Valor declarado</Label>
              <Input
                ref={setFieldRef('valorDeclarado')}
                type="number"
                value={form.valorDeclarado ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, valorDeclarado: toNumberOrNull(event.target.value) }))}
              />
            </div>
            <div>
              <Label>Cantidad artículos</Label>
              <Input
                ref={setFieldRef('cantidadArticulos')}
                type="number"
                value={form.cantidadArticulos ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, cantidadArticulos: toNumberOrNull(event.target.value) }))}
              />
            </div>
            <div>
              <Label>País origen mercancía</Label>
              <Input
                ref={setFieldRef('paisOrigenMercancia')}
                value={form.paisOrigenMercancia ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, paisOrigenMercancia: event.target.value.toUpperCase() }))}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => {
                setRowOverride(row.rowIndex, form)
              }}
            >
              Revalidar fila
            </Button>
            <GhostButton type="button" onClick={() => focusField(getFirstBlockingField(row))}>
              Ir al primer campo con error
            </GhostButton>
          </div>
        </Card>

        <Card>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Mensajes de validación</h4>
          <ul className="mt-2 space-y-2 text-xs">
            {row.issues.length === 0 ? (
              <li className="text-emerald-700 dark:text-emerald-300">Sin incidencias</li>
            ) : (
              row.issues.map((entry, index) => (
                <li
                  key={`${entry.code}-${index}`}
                  className={`rounded-lg px-2 py-1 ${
                    entry.severity === 'error'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
                  }`}
                >
                  {entry.message}
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </aside>
  )
}

export const ReviewStep = () => {
  const rows = useBackerPostStore((state) => state.normalizedRows)
  const filter = useBackerPostStore((state) => state.filter)
  const selectedRowIndex = useBackerPostStore((state) => state.selectedRowIndex)
  const setSelectedRowIndex = useBackerPostStore((state) => state.setSelectedRowIndex)
  const setFilter = useBackerPostStore((state) => state.setFilter)
  const setCurrentStep = useBackerPostStore((state) => state.setCurrentStep)

  const metrics = summary(rows)
  const filteredRows = useMemo(() => filterRows(rows, filter), [rows, filter])
  const selectedRow = rows.find((row) => row.rowIndex === selectedRowIndex) ?? null
  const errorRows = useMemo(
    () => rows.filter((row) => row.status === 'error').sort((left, right) => left.rowIndex - right.rowIndex),
    [rows],
  )

  if (rows.length === 0) {
    return (
      <Card>
        <p className="text-sm text-slate-700 dark:text-slate-200">No hay filas para revisar todavía.</p>
      </Card>
    )
  }

  const goToNextError = () => {
    if (errorRows.length === 0) {
      return
    }

    const currentErrorPosition = errorRows.findIndex((row) => row.rowIndex === selectedRowIndex)
    const nextError =
      currentErrorPosition >= 0 && currentErrorPosition < errorRows.length - 1
        ? errorRows[currentErrorPosition + 1]
        : errorRows[0]

    setFilter('errores')
    setSelectedRowIndex(nextError.rowIndex)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{metrics.total}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Válidos</p>
          <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300">{metrics.valid}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Con avisos</p>
          <p className="text-2xl font-semibold text-amber-700 dark:text-amber-300">{metrics.warning}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Con errores</p>
          <p className="text-2xl font-semibold text-rose-700 dark:text-rose-300">{metrics.error}</p>
        </Card>
      </div>

      <ProgressChecklist
        title="Checklist de revisión"
        items={[
          {
            id: 'has-exportable',
            label: 'Hay al menos una fila exportable',
            done: rows.some((row) => row.exportable),
            hint: 'Revisa mapeo y datos si todas las filas están rechazadas.',
          },
          {
            id: 'blocking-errors',
            label: 'Sin errores bloqueantes',
            done: metrics.error === 0,
            hint: metrics.error > 0 ? `Quedan ${metrics.error} fila(s) con errores.` : undefined,
          },
        ]}
      />

      <Card>
        <div className="flex flex-wrap justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(filterLabels) as ReviewFilter[]).map((filterValue) => (
              <GhostButton
                key={filterValue}
                type="button"
                className={filterValue === filter ? 'border-emerald-500 text-emerald-700 dark:text-emerald-300' : ''}
                onClick={() => setFilter(filterValue)}
              >
                {filterLabels[filterValue]}
              </GhostButton>
            ))}
          </div>

          <GhostButton type="button" onClick={goToNextError} disabled={errorRows.length === 0}>
            Siguiente fila con error
          </GhostButton>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
                <th className="border-b border-slate-200 px-2 py-2 dark:border-slate-700">Fila</th>
                <th className="border-b border-slate-200 px-2 py-2 dark:border-slate-700">Nombre</th>
                <th className="border-b border-slate-200 px-2 py-2 dark:border-slate-700">País</th>
                <th className="border-b border-slate-200 px-2 py-2 dark:border-slate-700">Ciudad</th>
                <th className="border-b border-slate-200 px-2 py-2 dark:border-slate-700">CP</th>
                <th className="border-b border-slate-200 px-2 py-2 dark:border-slate-700">Estado</th>
                <th className="border-b border-slate-200 px-2 py-2 dark:border-slate-700">Incidencias</th>
                <th className="border-b border-slate-200 px-2 py-2 dark:border-slate-700">Resumen</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.rowIndex}
                  className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                  onClick={() => setSelectedRowIndex(row.rowIndex)}
                >
                  <td className="px-2 py-2">{row.rowIndex}</td>
                  <td className="px-2 py-2">{row.recipientName || '-'}</td>
                  <td className="px-2 py-2">{row.countryIso2 || '-'}</td>
                  <td className="px-2 py-2">{row.city || '-'}</td>
                  <td className="px-2 py-2">{row.postalCode || '-'}</td>
                  <td className="px-2 py-2">
                    <Badge tone={statusBadgeTone[row.status]}>{statusLabel[row.status]}</Badge>
                  </td>
                  <td className="px-2 py-2">{row.issues.length}</td>
                  <td className="max-w-xs truncate px-2 py-2" title={row.issueSummary}>
                    {row.issueSummary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="button" onClick={() => setCurrentStep(4)}>
            Continuar a exportación
          </Button>
        </div>
      </Card>

      {selectedRow && <RowDrawer row={selectedRow} onClose={() => setSelectedRowIndex(null)} />}
    </div>
  )
}
