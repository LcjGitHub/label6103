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
  STORAGE_KEY,
  type Address,
  type EnvelopeData,
  type EnvelopeSide,
  type EnvelopeSize,
  type LayoutStyle,
} from '../types/envelope'
import { mockEnvelopeData } from '../data/mockData'

interface EnvelopeContextValue {
  data: EnvelopeData
  layout: LayoutStyle
  size: EnvelopeSize
  side: EnvelopeSide
  addressList: Address[]
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
  removeAddress: (index: number) => void
  clearAddressList: () => void
  setRecipientFromList: (index: number) => void
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

function loadAddressListFromStorage(): Address[] {
  try {
    const raw = localStorage.getItem(ADDRESS_LIST_KEY)
    if (raw) return JSON.parse(raw) as Address[]
  } catch {
    /* ignore */
  }
  return []
}

export function EnvelopeProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<EnvelopeData>(loadFromStorage)
  const [layout, setLayout] = useState<LayoutStyle>('chinese')
  const [sizeId, setSizeId] = useState(ENVELOPE_SIZES[1].id)
  const [side, setSide] = useState<EnvelopeSide>('front')
  const [addressList, setAddressList] = useState<Address[]>(loadAddressListFromStorage)

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
    setDataState({
      sender: createEmptyAddress(),
      recipient: createEmptyAddress(),
    })
  }, [])

  const persist = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const addAddress = useCallback((address: Address) => {
    setAddressList((prev) => [...prev, address])
  }, [])

  const addAddresses = useCallback((addresses: Address[]) => {
    setAddressList((prev) => [...prev, ...addresses])
  }, [])

  const removeAddress = useCallback((index: number) => {
    setAddressList((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearAddressList = useCallback(() => {
    setAddressList([])
  }, [])

  const setRecipientFromList = useCallback((index: number) => {
    setAddressList((prev) => {
      const address = prev[index]
      if (address) {
        setDataState((prevData) => ({
          ...prevData,
          recipient: { ...address },
        }))
      }
      return prev
    })
  }, [])

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
