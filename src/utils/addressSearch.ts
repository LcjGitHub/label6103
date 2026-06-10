import { CHINA_REGIONS, type Province, type City } from '../data/chinaRegion'

export interface AddressSuggestion {
  type: 'province' | 'city' | 'district'
  province: string
  city: string
  district: string
  label: string
}

export function searchAddresses(keyword: string): AddressSuggestion[] {
  const trimmed = keyword.trim()
  if (!trimmed) return []

  const results: AddressSuggestion[] = []
  const lowerKeyword = trimmed.toLowerCase()

  for (const province of CHINA_REGIONS) {
    const provinceMatch = province.name.toLowerCase().includes(lowerKeyword)
    if (provinceMatch) {
      for (const city of province.cities) {
        for (const district of city.districts) {
          results.push({
            type: 'district',
            province: province.name,
            city: city.name,
            district: district.name,
            label: `${province.name} ${city.name} ${district.name}`,
          })
        }
      }
    } else {
      for (const city of province.cities) {
        const cityMatch = city.name.toLowerCase().includes(lowerKeyword)
        if (cityMatch) {
          for (const district of city.districts) {
            results.push({
              type: 'district',
              province: province.name,
              city: city.name,
              district: district.name,
              label: `${province.name} ${city.name} ${district.name}`,
            })
          }
        } else {
          for (const district of city.districts) {
            if (district.name.toLowerCase().includes(lowerKeyword)) {
              results.push({
                type: 'district',
                province: province.name,
                city: city.name,
                district: district.name,
                label: `${province.name} ${city.name} ${district.name}`,
              })
            }
          }
        }
      }
    }
  }

  return results.slice(0, 20)
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
