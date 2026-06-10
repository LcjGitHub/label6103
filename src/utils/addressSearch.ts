import { CHINA_REGIONS, type Province, type City } from '../data/chinaRegion'

export interface ProvinceSuggestion {
  type: 'province'
  province: string
  city: string
  district: string
  label: string
}

export interface CitySuggestion {
  type: 'city'
  province: string
  city: string
  district: string
  label: string
}

export interface DistrictSuggestion {
  type: 'district'
  province: string
  city: string
  district: string
  label: string
}

export type AddressSuggestion = ProvinceSuggestion | CitySuggestion | DistrictSuggestion

export function searchProvinces(keyword: string): ProvinceSuggestion[] {
  const trimmed = keyword.trim()
  if (!trimmed) return []
  const lowerKeyword = trimmed.toLowerCase()

  return CHINA_REGIONS
    .filter((p) => p.name.toLowerCase().includes(lowerKeyword))
    .map((p) => ({
      type: 'province' as const,
      province: p.name,
      city: '',
      district: '',
      label: p.name,
    }))
    .slice(0, 20)
}

export function searchCities(keyword: string, provinceName: string): CitySuggestion[] {
  const trimmed = keyword.trim()
  if (!trimmed || !provinceName) return []
  const lowerKeyword = trimmed.toLowerCase()

  const province = CHINA_REGIONS.find((p) => p.name === provinceName)
  if (!province) return []

  return province.cities
    .filter((c) => c.name.toLowerCase().includes(lowerKeyword))
    .map((c) => ({
      type: 'city' as const,
      province: province.name,
      city: c.name,
      district: '',
      label: c.name,
    }))
    .slice(0, 20)
}

export function searchDistricts(
  keyword: string,
  provinceName: string,
  cityName: string,
): DistrictSuggestion[] {
  const trimmed = keyword.trim()
  if (!trimmed || !provinceName || !cityName) return []
  const lowerKeyword = trimmed.toLowerCase()

  const province = CHINA_REGIONS.find((p) => p.name === provinceName)
  const city = province?.cities.find((c) => c.name === cityName)
  if (!city) return []

  return city.districts
    .filter((d) => d.name.toLowerCase().includes(lowerKeyword))
    .map((d) => ({
      type: 'district' as const,
      province: province!.name,
      city: city.name,
      district: d.name,
      label: d.name,
    }))
    .slice(0, 20)
}

export function getCitiesByProvince(provinceName: string): City[] {
  const province = CHINA_REGIONS.find((p) => p.name === provinceName)
  return province?.cities || []
}

export function getDistrictsByCity(provinceName: string, cityName: string): string[] {
  const province = CHINA_REGIONS.find((p) => p.name === provinceName)
  const city = province?.cities.find((c) => c.name === cityName)
  return city?.districts.map((d) => d.name) || []
}

export function getAllProvinces(): Province[] {
  return CHINA_REGIONS
}
