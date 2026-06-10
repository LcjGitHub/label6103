import { useCallback, useEffect, useState } from 'react'
import {
  ADDRESS_LIST_KEY,
  createEmptyAddress,
  generateAddressId,
  toSavedAddress,
  type Address,
  type SavedAddress,
} from '../types/envelope'

function loadAddressListFromStorage(): SavedAddress[] {
  try {
    const raw = localStorage.getItem(ADDRESS_LIST_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as (Partial<Address> & { id?: string })[]
      return parsed.map((addr) => {
        const completeAddress: SavedAddress = {
          ...createEmptyAddress(),
          ...addr,
          id: addr.id || generateAddressId(),
          tags: addr.tags || [],
        }
        return completeAddress
      })
    }
  } catch {
    /* ignore */
  }
  return []
}

export interface UseAddressListReturn {
  addressList: SavedAddress[]
  addAddress: (address: Address) => void
  addAddresses: (addresses: Address[]) => void
  removeAddress: (id: string) => void
  clearAddressList: () => void
  updateAddressTags: (id: string, tags: string[]) => void
  removeTagFromAddresses: (tagId: string) => void
  setAddressList: React.Dispatch<React.SetStateAction<SavedAddress[]>>
  error: string | null
}

export function useAddressList(): UseAddressListReturn {
  const [addressList, setAddressList] = useState<SavedAddress[]>(loadAddressListFromStorage)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(ADDRESS_LIST_KEY, JSON.stringify(addressList))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存地址列表失败')
    }
  }, [addressList])

  const addAddress = useCallback((address: Address) => {
    setAddressList((prev) => [...prev, toSavedAddress(address)])
    setError(null)
  }, [])

  const addAddresses = useCallback((addresses: Address[]) => {
    setAddressList((prev) => [...prev, ...addresses.map((a) => toSavedAddress(a))])
    setError(null)
  }, [])

  const removeAddress = useCallback((id: string) => {
    setAddressList((prev) => prev.filter((a) => a.id !== id))
    setError(null)
  }, [])

  const clearAddressList = useCallback(() => {
    setAddressList([])
    setError(null)
  }, [])

  const updateAddressTags = useCallback((id: string, tags: string[]) => {
    setAddressList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, tags } : a)),
    )
    setError(null)
  }, [])

  const removeTagFromAddresses = useCallback((tagId: string) => {
    setAddressList((prev) =>
      prev.map((a) => ({
        ...a,
        tags: a.tags.filter((t) => t !== tagId),
      })),
    )
    setError(null)
  }, [])

  return {
    addressList,
    addAddress,
    addAddresses,
    removeAddress,
    clearAddressList,
    updateAddressTags,
    removeTagFromAddresses,
    setAddressList,
    error,
  }
}
