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
  generateTemplateId,
  STORAGE_KEY,
  TEMPLATE_LIST_KEY,
  UI_SETTINGS_KEY,
  toSavedAddress,
  type Address,
  type EnvelopeData,
  type EnvelopeSide,
  type EnvelopeSize,
  type EnvelopeTemplate,
  type EnvelopeUiSettings,
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
  templateList: EnvelopeTemplate[]
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
  saveTemplate: (name: string) => EnvelopeTemplate
  updateTemplate: (id: string, name: string) => void
  deleteTemplate: (id: string) => void
  applyTemplate: (id: string) => void
  isTemplateNameDuplicate: (name: string, excludeId?: string) => boolean
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

function loadTemplateListFromStorage(): EnvelopeTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATE_LIST_KEY)
    if (raw) {
      return JSON.parse(raw) as EnvelopeTemplate[]
    }
  } catch {
    /* ignore */
  }
  return []
}

function saveToStorage(data: EnvelopeData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function loadUiSettingsFromStorage(): EnvelopeUiSettings {
  try {
    const raw = localStorage.getItem(UI_SETTINGS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<EnvelopeUiSettings>
      return {
        layout: parsed.layout === 'british' ? 'british' : 'chinese',
        sizeId: ENVELOPE_SIZES.some((s) => s.id === parsed.sizeId)
          ? parsed.sizeId!
          : ENVELOPE_SIZES[1].id,
        side: parsed.side === 'back' ? 'back' : 'front',
      }
    }
  } catch {
    /* ignore */
  }
  return {
    layout: 'chinese',
    sizeId: ENVELOPE_SIZES[1].id,
    side: 'front',
  }
}

function saveUiSettingsToStorage(settings: EnvelopeUiSettings) {
  localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(settings))
}

export function EnvelopeProvider({ children }: { children: ReactNode }) {
  const initialUi = loadUiSettingsFromStorage()
  const [data, setDataState] = useState<EnvelopeData>(loadFromStorage)
  const [layout, setLayout] = useState<LayoutStyle>(initialUi.layout)
  const [sizeId, setSizeId] = useState<string>(initialUi.sizeId)
  const [side, setSide] = useState<EnvelopeSide>(initialUi.side)
  const [addressList, setAddressList] = useState<SavedAddress[]>(loadAddressListFromStorage)
  const [templateList, setTemplateList] = useState<EnvelopeTemplate[]>(loadTemplateListFromStorage)

  useEffect(() => {
    localStorage.setItem(ADDRESS_LIST_KEY, JSON.stringify(addressList))
  }, [addressList])

  useEffect(() => {
    localStorage.setItem(TEMPLATE_LIST_KEY, JSON.stringify(templateList))
  }, [templateList])

  useEffect(() => {
    saveUiSettingsToStorage({ layout, sizeId, side })
  }, [layout, sizeId, side])

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

  const isTemplateNameDuplicate = useCallback(
    (name: string, excludeId?: string) => {
      return templateList.some(
        (t) => t.name.trim() === name.trim() && t.id !== excludeId,
      )
    },
    [templateList],
  )

  const saveTemplate = useCallback(
    (name: string): EnvelopeTemplate => {
      const now = Date.now()
      const newTemplate: EnvelopeTemplate = {
        id: generateTemplateId(),
        name: name.trim(),
        createdAt: now,
        updatedAt: now,
        data: JSON.parse(JSON.stringify(data)),
        layout,
        sizeId,
        side,
      }
      setTemplateList((prev) => [...prev, newTemplate])
      return newTemplate
    },
    [data, layout, sizeId, side],
  )

  const updateTemplate = useCallback((id: string, name: string) => {
    setTemplateList((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, name: name.trim(), updatedAt: Date.now() } : t,
      ),
    )
  }, [])

  const deleteTemplate = useCallback((id: string) => {
    setTemplateList((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const applyTemplate = useCallback((id: string) => {
    setTemplateList((prev) => {
      const template = prev.find((t) => t.id === id)
      if (template) {
        setDataState(template.data)
        saveToStorage(template.data)
        setLayout(template.layout)
        setSizeId(template.sizeId)
        setSide(template.side)
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
      templateList,
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
      saveTemplate,
      updateTemplate,
      deleteTemplate,
      applyTemplate,
      isTemplateNameDuplicate,
    }),
    [
      data,
      layout,
      size,
      side,
      addressList,
      templateList,
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
      saveTemplate,
      updateTemplate,
      deleteTemplate,
      applyTemplate,
      isTemplateNameDuplicate,
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
