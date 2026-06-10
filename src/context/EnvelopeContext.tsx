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
  createCustomSize,
  createEmptyAddress,
  CUSTOM_SIZE_ID,
  DEFAULT_CUSTOM_HEIGHT,
  DEFAULT_CUSTOM_WIDTH,
  ENVELOPE_SIZES,
  generateAddressId,
  generateTagId,
  generateTemplateId,
  STORAGE_KEY,
  TAG_LIST_KEY,
  TEMPLATE_LIST_KEY,
  UI_SETTINGS_KEY,
  toSavedAddress,
  type Address,
  type CustomSizeSettings,
  type EnvelopeData,
  type EnvelopeSide,
  type EnvelopeSize,
  type EnvelopeTemplate,
  type EnvelopeUiSettings,
  type LayoutStyle,
  type SavedAddress,
  type Tag,
} from '../types/envelope'
import { mockEnvelopeData } from '../data/mockData'

interface EnvelopeContextValue {
  data: EnvelopeData
  layout: LayoutStyle
  size: EnvelopeSize
  side: EnvelopeSide
  customSize: CustomSizeSettings
  addressList: SavedAddress[]
  templateList: EnvelopeTemplate[]
  tagList: Tag[]
  setData: (data: EnvelopeData) => void
  updateSender: (field: keyof EnvelopeData['sender'], value: string) => void
  updateRecipient: (field: keyof EnvelopeData['recipient'], value: string) => void
  updateSenderTags: (tags: string[]) => void
  updateRecipientTags: (tags: string[]) => void
  setLayout: (layout: LayoutStyle) => void
  setSizeId: (id: string) => void
  setCustomSize: (size: Partial<CustomSizeSettings>) => void
  setSide: (side: EnvelopeSide) => void
  loadMockData: () => void
  resetData: () => void
  persist: () => void
  addAddress: (address: Address) => void
  addAddresses: (addresses: Address[]) => void
  removeAddress: (id: string) => void
  clearAddressList: () => void
  setRecipientFromList: (id: string) => void
  updateAddressTags: (id: string, tags: string[]) => void
  saveTemplate: (name: string) => EnvelopeTemplate
  updateTemplate: (id: string, name: string) => void
  deleteTemplate: (id: string) => void
  applyTemplate: (id: string) => void
  isTemplateNameDuplicate: (name: string, excludeId?: string) => boolean
  addTag: (name: string, color: string) => Tag
  importTags: (tags: Tag[]) => void
  updateTag: (id: string, name: string, color: string) => void
  deleteTag: (id: string) => void
  isTagNameDuplicate: (name: string, excludeId?: string) => boolean
}

const EnvelopeContext = createContext<EnvelopeContextValue | null>(null)

function loadFromStorage(): EnvelopeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<EnvelopeData>
      return {
        sender: { ...createEmptyAddress(), ...(parsed.sender || {}) },
        recipient: { ...createEmptyAddress(), ...(parsed.recipient || {}) },
      }
    }
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

function loadTemplateListFromStorage(): EnvelopeTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATE_LIST_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as (EnvelopeTemplate & {
        data?: { sender?: Partial<Address>; recipient?: Partial<Address> }
      })[]
      return parsed.map((template) => ({
        ...template,
        data: {
          sender: { ...createEmptyAddress(), ...(template.data?.sender || {}) },
          recipient: { ...createEmptyAddress(), ...(template.data?.recipient || {}) },
        },
      }))
    }
  } catch {
    /* ignore */
  }
  return []
}

function loadTagListFromStorage(): Tag[] {
  try {
    const raw = localStorage.getItem(TAG_LIST_KEY)
    if (raw) {
      return JSON.parse(raw) as Tag[]
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
      const validSizeIds = ENVELOPE_SIZES.map((s) => s.id)
      const sizeId = validSizeIds.includes(parsed.sizeId ?? '')
        ? parsed.sizeId!
        : ENVELOPE_SIZES[1].id
      return {
        layout: parsed.layout === 'british' ? 'british' : 'chinese',
        sizeId,
        side: parsed.side === 'back' ? 'back' : 'front',
        customSize: {
          widthMm: parsed.customSize?.widthMm ?? DEFAULT_CUSTOM_WIDTH,
          heightMm: parsed.customSize?.heightMm ?? DEFAULT_CUSTOM_HEIGHT,
        },
      }
    }
  } catch {
    /* ignore */
  }
  return {
    layout: 'chinese',
    sizeId: ENVELOPE_SIZES[1].id,
    side: 'front',
    customSize: {
      widthMm: DEFAULT_CUSTOM_WIDTH,
      heightMm: DEFAULT_CUSTOM_HEIGHT,
    },
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
  const [customSize, setCustomSizeState] = useState<CustomSizeSettings>(initialUi.customSize)
  const [addressList, setAddressList] = useState<SavedAddress[]>(loadAddressListFromStorage)
  const [templateList, setTemplateList] = useState<EnvelopeTemplate[]>(loadTemplateListFromStorage)
  const [tagList, setTagList] = useState<Tag[]>(loadTagListFromStorage)

  useEffect(() => {
    localStorage.setItem(ADDRESS_LIST_KEY, JSON.stringify(addressList))
  }, [addressList])

  useEffect(() => {
    localStorage.setItem(TEMPLATE_LIST_KEY, JSON.stringify(templateList))
  }, [templateList])

  useEffect(() => {
    localStorage.setItem(TAG_LIST_KEY, JSON.stringify(tagList))
  }, [tagList])

  useEffect(() => {
    saveUiSettingsToStorage({ layout, sizeId, side, customSize })
  }, [layout, sizeId, side, customSize])

  const setCustomSize = useCallback((next: Partial<CustomSizeSettings>) => {
    setCustomSizeState((prev) => ({ ...prev, ...next }))
  }, [])

  const size = useMemo(() => {
    if (sizeId === CUSTOM_SIZE_ID) {
      return createCustomSize(customSize.widthMm, customSize.heightMm)
    }
    return ENVELOPE_SIZES.find((s) => s.id === sizeId) ?? ENVELOPE_SIZES[1]
  }, [sizeId, customSize])

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

  const updateSenderTags = useCallback((tags: string[]) => {
    setDataState((prev) => ({
      ...prev,
      sender: { ...prev.sender, tags },
    }))
  }, [])

  const updateRecipientTags = useCallback((tags: string[]) => {
    setDataState((prev) => ({
      ...prev,
      recipient: { ...prev.recipient, tags },
    }))
  }, [])

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

  const updateAddressTags = useCallback((id: string, tags: string[]) => {
    setAddressList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, tags } : a)),
    )
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
        customSize: sizeId === CUSTOM_SIZE_ID ? { ...customSize } : undefined,
      }
      setTemplateList((prev) => [...prev, newTemplate])
      return newTemplate
    },
    [data, layout, sizeId, side, customSize],
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
        if (template.customSize) {
          setCustomSizeState(template.customSize)
        }
      }
      return prev
    })
  }, [])

  const isTagNameDuplicate = useCallback(
    (name: string, excludeId?: string) => {
      return tagList.some(
        (t) => t.name.trim() === name.trim() && t.id !== excludeId,
      )
    },
    [tagList],
  )

  const addTag = useCallback(
    (name: string, color: string): Tag => {
      const newTag: Tag = {
        id: generateTagId(),
        name: name.trim(),
        color,
      }
      setTagList((prev) => [...prev, newTag])
      return newTag
    },
    [],
  )

  const importTags = useCallback((tags: Tag[]) => {
    setTagList((prev) => {
      const existingIds = new Set(prev.map((t) => t.id))
      const existingNames = new Set(prev.map((t) => t.name.trim().toLowerCase()))
      const newTags = tags.filter(
        (t) => !existingIds.has(t.id) && !existingNames.has(t.name.trim().toLowerCase()),
      )
      return [...prev, ...newTags]
    })
  }, [])

  const updateTag = useCallback((id: string, name: string, color: string) => {
    setTagList((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, name: name.trim(), color } : t,
      ),
    )
  }, [])

  const deleteTag = useCallback((id: string) => {
    setTagList((prev) => prev.filter((t) => t.id !== id))
    setAddressList((prev) =>
      prev.map((a) => ({
        ...a,
        tags: a.tags.filter((tagId) => tagId !== id),
      })),
    )
  }, [])

  const value = useMemo(
    () => ({
      data,
      layout,
      size,
      side,
      customSize,
      addressList,
      templateList,
      tagList,
      setData,
      updateSender,
      updateRecipient,
      updateSenderTags,
      updateRecipientTags,
      setLayout,
      setSizeId,
      setCustomSize,
      setSide,
      loadMockData,
      resetData,
      persist,
      addAddress,
      addAddresses,
      removeAddress,
      clearAddressList,
      setRecipientFromList,
      updateAddressTags,
      saveTemplate,
      updateTemplate,
      deleteTemplate,
      applyTemplate,
      isTemplateNameDuplicate,
      addTag,
      importTags,
      updateTag,
      deleteTag,
      isTagNameDuplicate,
    }),
    [
      data,
      layout,
      size,
      side,
      customSize,
      addressList,
      templateList,
      tagList,
      setData,
      updateSender,
      updateRecipient,
      setCustomSize,
      loadMockData,
      resetData,
      persist,
      addAddress,
      addAddresses,
      removeAddress,
      clearAddressList,
      setRecipientFromList,
      updateAddressTags,
      saveTemplate,
      updateTemplate,
      deleteTemplate,
      applyTemplate,
      isTemplateNameDuplicate,
      addTag,
      importTags,
      updateTag,
      deleteTag,
      isTagNameDuplicate,
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
