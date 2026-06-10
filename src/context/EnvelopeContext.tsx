import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  ADDRESS_LIST_KEY,
  createEmptyAddress,
  ENVELOPE_SIZES,
  generateAddressId,
  STORAGE_KEY,
  toSavedAddress,
  type Address,
  type EnvelopeData,
  type EnvelopeSide,
  type EnvelopeSize,
  type LayoutStyle,
  type SavedAddress,
} from '../types/envelope'
import { mockEnvelopeData } from '../data/mockData'

interface EnvelopeContextValue {
  data: EnvelopeData
  layout: LayoutStyle
  size: EnvelopeSize
  side: EnvelopeSide
  addressList: SavedAddress[]
  setData: (data: EnvelopeData) => void
  updateSender: (field: keyof EnvelopeData['sender'], value: string) => void
  updateRecipient: (field: keyof EnvelopeData['recipient'], value: string) => void
  setLayout: (layout: LayoutStyle) => void
  setSizeId: (id: string) => void
  setSide: (side: EnvelopeSide) => void
  loadMockData: () => void
  resetData: () => void
  persist: () => void
  addAddress: (address: Address) => void
  addAddresses: (addresses: Address[]) => void
  removeAddress: (id: string) => void
  clearAddressList: () => void
  setRecipientFromList: (id: string) => void
}

const EnvelopeContext = createContext<EnvelopeContextValue | null>(null)

function loadFromStorage(): EnvelopeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as EnvelopeData
  } catch {
    /* ignore */
  }
  return {
    sender: createEmptyAddress(),
    recipient: createEmptyAddress(),
  }
}

function loadAddressListFromStorage(): SavedAddress[] {
  try {
    const raw = localStorage.getItem(ADDRESS_LIST_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as (Address & { id?: string })[]
      return parsed.map((addr) => {
        if (addr.id) return addr as SavedAddress
        return { ...addr, id: generateAddressId() }
      })
    }
  } catch {
    /* ignore */
  }
  return []
}

function saveToStorage(data: EnvelopeData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function EnvelopeProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<EnvelopeData>(loadFromStorage)
  const [layout, setLayout] = useState<LayoutStyle>('chinese')
  const [sizeId, setSizeId] = useState(ENVELOPE_SIZES[1].id)
  const [side, setSide] = useState<EnvelopeSide>('front')
  const [addressList, setAddressList] = useState<SavedAddress[]>(loadAddressListFromStorage)

  useEffect(() => {
    localStorage.setItem(ADDRESS_LIST_KEY, JSON.stringify(addressList))
  }, [addressList])

  const size = useMemo(
    () => ENVELOPE_SIZES.find((s) => s.id === sizeId) ?? ENVELOPE_SIZES[1],
    [sizeId],
  )

  const setData = useCallback((next: EnvelopeData) => {
    setDataState(next)
  }, [])

  const updateSender = useCallback(
    (field: keyof EnvelopeData['sender'], value: string) => {
      setDataState((prev) => ({
        ...prev,
        sender: { ...prev.sender, [field]: value },
      }))
    },
    [],
  )

  const updateRecipient = useCallback(
    (field: keyof EnvelopeData['recipient'], value: string) => {
      setDataState((prev) => ({
        ...prev,
        recipient: { ...prev.recipient, [field]: value },
      }))
    },
    [],
  )

  const loadMockData = useCallback(() => {
    setDataState(mockEnvelopeData)
  }, [])

  const resetData = useCallback(() => {
    const empty = {
      sender: createEmptyAddress(),
      recipient: createEmptyAddress(),
    }
    setDataState(empty)
    saveToStorage(empty)
  }, [])

  const persist = useCallback(() => {
    saveToStorage(data)
  }, [data])

  const addAddress = useCallback((address: Address) => {
    setAddressList((prev) => [...prev, toSavedAddress(address)])
  }, [])

  const addAddresses = useCallback((addresses: Address[]) => {
    setAddressList((prev) => [...prev, ...addresses.map((a) => toSavedAddress(a))])
  }, [])

  const removeAddress = useCallback((id: string) => {
    setAddressList((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const clearAddressList = useCallback(() => {
    setAddressList([])
  }, [])

  const setRecipientFromList = useCallback((id: string) => {
    setAddressList((prev) => {
      const address = prev.find((a) => a.id === id)
      if (address) {
        const { id: _id, ...recipientData } = address
        const nextData = {
          ...data,
          recipient: recipientData,
        }
        setDataState(nextData)
        saveToStorage(nextData)
      }
      return prev
    })
  }, [data])

  const value = useMemo(
    () => ({
      data,
      layout,
      size,
      side,
      addressList,
      setData,
      updateSender,
      updateRecipient,
      setLayout,
      setSizeId,
      setSide,
      loadMockData,
      resetData,
      persist,
      addAddress,
      addAddresses,
      removeAddress,
      clearAddressList,
      setRecipientFromList,
    }),
    [
      data,
      layout,
      size,
      side,
      addressList,
      setData,
      updateSender,
      updateRecipient,
      loadMockData,
      resetData,
      persist,
      addAddress,
      addAddresses,
      removeAddress,
      clearAddressList,
      setRecipientFromList,
    ],
  )

  return (
    <EnvelopeContext.Provider value={value}>{children}</EnvelopeContext.Provider>
  )
}

export function useEnvelope() {
  const ctx = useContext(EnvelopeContext)
  if (!ctx) throw new Error('useEnvelope must be used within EnvelopeProvider')
  return ctx
}
