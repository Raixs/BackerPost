import type { CountryMatch } from '../../types/domain'
import { normalizeMaybe } from '../normalization/text'

interface CountryDef {
  iso2: string
  iso3: string
  nameEs: string
  aliases: string[]
}

const countries: CountryDef[] = [
  {
    iso2: 'ES',
    iso3: 'ESP',
    nameEs: 'España',
    aliases: ['ES', 'Spain', 'España', 'Espana'],
  },
  {
    iso2: 'GB',
    iso3: 'GBR',
    nameEs: 'Reino Unido',
    aliases: ['GB', 'UK', 'United Kingdom', 'Reino Unido', 'Great Britain'],
  },
  {
    iso2: 'US',
    iso3: 'USA',
    nameEs: 'Estados Unidos',
    aliases: ['US', 'USA', 'United States', 'Estados Unidos', 'EEUU'],
  },
  {
    iso2: 'DE',
    iso3: 'DEU',
    nameEs: 'Alemania',
    aliases: ['DE', 'Germany', 'Alemania', 'Deutschland'],
  },
  {
    iso2: 'FR',
    iso3: 'FRA',
    nameEs: 'Francia',
    aliases: ['FR', 'France', 'Francia'],
  },
  {
    iso2: 'PT',
    iso3: 'PRT',
    nameEs: 'Portugal',
    aliases: ['PT', 'Portugal'],
  },
  {
    iso2: 'IT',
    iso3: 'ITA',
    nameEs: 'Italia',
    aliases: ['IT', 'Italy', 'Italia'],
  },
  {
    iso2: 'CN',
    iso3: 'CHN',
    nameEs: 'China',
    aliases: ['CN', 'China', "People's Republic of China", 'PRC', 'Mainland China', 'Republica Popular China'],
  },
  {
    iso2: 'CA',
    iso3: 'CAN',
    nameEs: 'Canadá',
    aliases: ['CA', 'Canada', 'Canadá', 'Canadá (CA)'],
  },
  {
    iso2: 'AU',
    iso3: 'AUS',
    nameEs: 'Australia',
    aliases: ['AU', 'Australia'],
  },
  {
    iso2: 'NL',
    iso3: 'NLD',
    nameEs: 'Países Bajos',
    aliases: ['NL', 'Netherlands', 'Holland', 'Países Bajos', 'Paises Bajos'],
  },
  {
    iso2: 'BE',
    iso3: 'BEL',
    nameEs: 'Bélgica',
    aliases: ['BE', 'Belgium', 'Bélgica', 'Belgica'],
  },
  {
    iso2: 'CH',
    iso3: 'CHE',
    nameEs: 'Suiza',
    aliases: ['CH', 'Switzerland', 'Suiza'],
  },
  {
    iso2: 'AT',
    iso3: 'AUT',
    nameEs: 'Austria',
    aliases: ['AT', 'Austria'],
  },
  {
    iso2: 'IE',
    iso3: 'IRL',
    nameEs: 'Irlanda',
    aliases: ['IE', 'Ireland', 'Irlanda'],
  },
  {
    iso2: 'SE',
    iso3: 'SWE',
    nameEs: 'Suecia',
    aliases: ['SE', 'Sweden', 'Suecia'],
  },
  {
    iso2: 'NO',
    iso3: 'NOR',
    nameEs: 'Noruega',
    aliases: ['NO', 'Norway', 'Noruega'],
  },
  {
    iso2: 'DK',
    iso3: 'DNK',
    nameEs: 'Dinamarca',
    aliases: ['DK', 'Denmark', 'Dinamarca'],
  },
  {
    iso2: 'PL',
    iso3: 'POL',
    nameEs: 'Polonia',
    aliases: ['PL', 'Poland', 'Polonia'],
  },
  {
    iso2: 'CZ',
    iso3: 'CZE',
    nameEs: 'Chequia',
    aliases: ['CZ', 'Czech Republic', 'Czechia', 'Chequia', 'Republica Checa'],
  },
  {
    iso2: 'GR',
    iso3: 'GRC',
    nameEs: 'Grecia',
    aliases: ['GR', 'Greece', 'Grecia'],
  },
  {
    iso2: 'JP',
    iso3: 'JPN',
    nameEs: 'Japón',
    aliases: ['JP', 'Japan', 'Japón', 'Japon'],
  },
  {
    iso2: 'KR',
    iso3: 'KOR',
    nameEs: 'Corea del Sur',
    aliases: ['KR', 'Korea', 'South Korea', 'Corea del Sur', 'Republic of Korea'],
  },
  {
    iso2: 'MX',
    iso3: 'MEX',
    nameEs: 'México',
    aliases: ['MX', 'Mexico', 'México'],
  },
  {
    iso2: 'BR',
    iso3: 'BRA',
    nameEs: 'Brasil',
    aliases: ['BR', 'Brazil', 'Brasil'],
  },
  {
    iso2: 'AR',
    iso3: 'ARG',
    nameEs: 'Argentina',
    aliases: ['AR', 'Argentina'],
  },
  {
    iso2: 'CL',
    iso3: 'CHL',
    nameEs: 'Chile',
    aliases: ['CL', 'Chile'],
  },
  {
    iso2: 'CO',
    iso3: 'COL',
    nameEs: 'Colombia',
    aliases: ['CO', 'Colombia'],
  },
  {
    iso2: 'PE',
    iso3: 'PER',
    nameEs: 'Perú',
    aliases: ['PE', 'Peru', 'Perú'],
  },
  {
    iso2: 'IN',
    iso3: 'IND',
    nameEs: 'India',
    aliases: ['IN', 'India'],
  },
  {
    iso2: 'TR',
    iso3: 'TUR',
    nameEs: 'Turquía',
    aliases: ['TR', 'Turkey', 'Turquía', 'Turquia'],
  },
]

const aliasToCountry = new Map<string, CountryMatch>()
const iso2ToCountry = new Map<string, CountryMatch>()
const iso3ToCountry = new Map<string, CountryMatch>()

const STOP_WORDS = new Set([
  'the',
  'of',
  'republic',
  'democratic',
  'federal',
  'peoples',
  'people',
  'state',
  'states',
  'kingdom',
  'mainland',
  'popular',
  'popularchina',
  'la',
  'el',
  'de',
  'del',
  'los',
  'las',
])

const normalizeCountryWords = (value: string): string[] =>
  normalizeMaybe(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)

const compactToken = (value: string): string => normalizeCountryWords(value).join('')

const removeStopWordsToken = (value: string): string =>
  normalizeCountryWords(value)
    .filter((word) => !STOP_WORDS.has(word))
    .join('')

countries.forEach((country) => {
  const match = {
    iso2: country.iso2,
    nameEs: country.nameEs,
  }

  iso2ToCountry.set(country.iso2, match)
  iso3ToCountry.set(country.iso3, match)

  for (const alias of country.aliases) {
    aliasToCountry.set(compactToken(alias), match)
    const noStopToken = removeStopWordsToken(alias)
    if (noStopToken) {
      aliasToCountry.set(noStopToken, match)
    }
  }
})

export const mapCountry = (value: string): CountryMatch | null => {
  const normalized = normalizeMaybe(value)
  if (!normalized) {
    return null
  }

  const uppercase = normalized.toUpperCase()
  const byIso2 = iso2ToCountry.get(uppercase)
  if (byIso2) {
    return byIso2
  }

  const byIso3 = iso3ToCountry.get(uppercase)
  if (byIso3) {
    return byIso3
  }

  const byAlias = aliasToCountry.get(compactToken(normalized))
  if (byAlias) {
    return byAlias
  }

  const byAliasNoStopwords = aliasToCountry.get(removeStopWordsToken(normalized))
  if (byAliasNoStopwords) {
    return byAliasNoStopwords
  }

  const inputToken = compactToken(normalized)
  const byContains = [...aliasToCountry.entries()].find(([aliasToken]) => {
    if (inputToken.length < 6 || aliasToken.length < 4) {
      return false
    }

    return inputToken.includes(aliasToken) || aliasToken.includes(inputToken)
  })

  if (byContains) {
    return byContains[1]
  }

  return null
}
