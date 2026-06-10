import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createEmptyAddress,
  ENVELOPE_SIZES,
  STORAGE_KEY,
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
  setData: (data: EnvelopeData) => void
  updateSender: (field: keyof EnvelopeData['sender'], value: string) => void
  updateRecipient: (field: keyof EnvelopeData['recipient'], value: string) => void
  setLayout: (layout: LayoutStyle) => void
  setSizeId: (id: string) => void
  setSide: (side: EnvelopeSide) => void
  loadMockData: () => void
  resetData: () => void
  persist: () => void
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

export function EnvelopeProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<EnvelopeData>(loadFromStorage)
  const [layout, setLayout] = useState<LayoutStyle>('chinese')
  const [sizeId, setSizeId] = useState(ENVELOPE_SIZES[1].id)
  const [side, setSide] = useState<EnvelopeSide>('front')

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

  const value = useMemo(
    () => ({
      data,
      layout,
      size,
      side,
      setData,
      updateSender,
      updateRecipient,
      setLayout,
      setSizeId,
      setSide,
      loadMockData,
      resetData,
      persist,
    }),
    [
      data,
      layout,
      size,
      side,
      setData,
      updateSender,
      updateRecipient,
      loadMockData,
      resetData,
      persist,
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
