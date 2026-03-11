const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

export const stripControlChars = (value: string): string => value.replace(CONTROL_CHARS_REGEX, '')

export const normalizeLineBreaks = (value: string): string => value.replace(/\r\n?/g, '\n')

export const collapseWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim()

export const normalizeText = (value: string): string => {
  const normalized = normalizeLineBreaks(stripControlChars(value))
  return collapseWhitespace(normalized.replace(/\n+/g, ' '))
}

export const normalizeMaybe = (value: string | null | undefined): string => {
  if (!value) {
    return ''
  }
  return normalizeText(value)
}

export const normalizeKeyToken = (value: string): string =>
  normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
    .toLowerCase()
