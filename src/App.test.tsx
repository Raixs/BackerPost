import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('Wizard UI', () => {
  it('renderiza el flujo principal y cambia de paso', () => {
    render(<App />)

    expect(screen.getByText('Kickstarter CSV a Correos Mi Oficina')).toBeInTheDocument()
    expect(screen.getByText('Importar CSV de Kickstarter')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Paso 2/i }))
    expect(screen.getByText('Primero debes importar un CSV para mapear columnas.')).toBeInTheDocument()
  })
})
