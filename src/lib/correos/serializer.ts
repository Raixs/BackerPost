import type { CorreosProfile, CorreosRecord } from './types'

const sanitizeValue = (value: string): string => value.replace(/[\r\n]+/g, ' ').trim()

export const serializeCorreosTxt = (records: CorreosRecord[], profile: CorreosProfile): string => {
  const header = `#PROFILE${profile.fieldSeparator}${profile.code}${profile.fieldSeparator}${profile.name}`

  const lines = records.map((record) =>
    profile.fields
      .map((field) => sanitizeValue(record.values[field.key] ?? ''))
      .join(profile.fieldSeparator),
  )

  return [header, ...lines].join('\n')
}
