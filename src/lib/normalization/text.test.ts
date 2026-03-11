import { describe, expect, it } from 'vitest'
import { normalizeKeyToken, normalizeText } from './text'

describe('normalizeText', () => {
  it('recorta y colapsa espacios', () => {
    expect(normalizeText('  Calle   Mayor   1  ')).toBe('Calle Mayor 1')
  })

  it('elimina controles y saltos', () => {
    expect(normalizeText('A\u0007\nB\r\nC')).toBe('A B C')
  })

  it('normaliza token para matching', () => {
    expect(normalizeKeyToken('Código Postal')).toBe('codigopostal')
  })
})
