import {
  ADDRESS_HISTORY_KEY,
  MAX_HISTORY_ITEMS,
  createEmptyAddress,
  generateHistoryId,
  getAddressKey,
  type Address,
  type AddressHistoryItem,
} from '../types/envelope'

export function loadAddressHistory(): AddressHistoryItem[] {
  try {
    const raw = localStorage.getItem(ADDRESS_HISTORY_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as (Omit<AddressHistoryItem, 'address'> & {
        address?: Partial<Address>
      })[]
      return parsed
        .map((item) => ({
          ...item,
          address: {
            ...createEmptyAddress(),
            ...(item.address || {}),
            tags: item.address?.tags || [],
          },
        }))
        .sort((a, b) => b.lastUsedAt - a.lastUsedAt)
    }
  } catch {
    /* ignore */
  }
  return []
}

function saveHistory(history: AddressHistoryItem[]) {
  localStorage.setItem(ADDRESS_HISTORY_KEY, JSON.stringify(history))
}

export function addAddressToHistory(address: Address): AddressHistoryItem[] {
  const history = loadAddressHistory()
  const key = getAddressKey(address)
  const now = Date.now()

  const existingIndex = history.findIndex(
    (item) => getAddressKey(item.address) === key,
  )

  if (existingIndex !== -1) {
    history[existingIndex].lastUsedAt = now
    history[existingIndex].address = { ...address }
  } else {
    history.unshift({
      id: generateHistoryId(),
      address: { ...address },
      lastUsedAt: now,
    })
  }

  const sorted = history.sort((a, b) => b.lastUsedAt - a.lastUsedAt)
  const trimmed = sorted.slice(0, MAX_HISTORY_ITEMS)
  saveHistory(trimmed)
  return trimmed
}

export function removeAddressFromHistory(id: string): AddressHistoryItem[] {
  const history = loadAddressHistory()
  const filtered = history.filter((item) => item.id !== id)
  saveHistory(filtered)
  return filtered
}

export function clearAddressHistory(): AddressHistoryItem[] {
  saveHistory([])
  return []
}

export function formatLastUsed(timestamp: number, language: 'zh' | 'en' = 'zh'): string {
  const now = Date.now()
  const diff = now - timestamp

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return language === 'zh' ? '刚刚' : 'Just now'
  }
  if (diff < hour) {
    const mins = Math.floor(diff / minute)
    return language === 'zh' ? `${mins} 分钟前` : `${mins} min ago`
  }
  if (diff < day) {
    const hours = Math.floor(diff / hour)
    return language === 'zh' ? `${hours} 小时前` : `${hours} hour${hours > 1 ? 's' : ''} ago`
  }
  if (diff < 7 * day) {
    const days = Math.floor(diff / day)
    return language === 'zh' ? `${days} 天前` : `${days} day${days > 1 ? 's' : ''} ago`
  }

  const date = new Date(timestamp)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  if (language === 'zh') {
    return `${y}-${m}-${d}`
  }
  return `${m}/${d}/${y}`
}

export function isAddressEmpty(address: Address): boolean {
  return (
    !address.name.trim() &&
    !address.phone.trim() &&
    !address.province.trim() &&
    !address.city.trim() &&
    !address.district.trim() &&
    !address.street.trim() &&
    !address.postcode.trim()
  )
}
