import { normalizeMaybe } from './text'

export const normalizeAddressParts = (line1: string, line2: string) => {
  const a1 = normalizeMaybe(line1)
  const a2 = normalizeMaybe(line2)

  if (!a1) {
    return {
      line1: '',
      line2: a2,
    }
  }

  return {
    line1: a1,
    line2: a2,
  }
}
