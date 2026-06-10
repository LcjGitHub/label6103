import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import {
  CUSTOM_SIZE_ID,
  generateTemplateId,
  type Address,
  type CustomSizeSettings,
  type EnvelopeData,
  type EnvelopeSide,
  type EnvelopeSize,
  type EnvelopeTemplate,
  type LayoutStyle,
  type SavedAddress,
  type Tag,
} from '../types/envelope'
import { useEnvelopeData } from '../hooks/useEnvelopeData'
import { useAddressList } from '../hooks/useAddressList'
import { useTagList } from '../hooks/useTagList'
import { useTemplateList } from '../hooks/useTemplateList'
import { useUiSettings } from '../hooks/useUiSettings'

interface EnvelopeContextValue {
  data: EnvelopeData
  layout: LayoutStyle
  size: EnvelopeSize
  side: EnvelopeSide
  customSize: CustomSizeSettings
  zoomPercent: number
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
  setZoomPercent: (percent: number) => void
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

export function EnvelopeProvider({ children }: { children: ReactNode }) {
  const envelopeData = useEnvelopeData()
  const addressListHook = useAddressList()
  const tagListHook = useTagList()
  const templateListHook = useTemplateList()
  const uiSettings = useUiSettings()

  const setRecipientFromList = useCallback(
    (id: string) => {
      const address = addressListHook.addressList.find((a) => a.id === id)
      if (address) {
        const { id: _id, ...recipientData } = address
        envelopeData.setDataAndPersist({
          ...envelopeData.data,
          recipient: recipientData,
        })
      }
    },
    [addressListHook.addressList, envelopeData.data, envelopeData.setDataAndPersist],
  )

  const saveTemplate = useCallback(
    (name: string): EnvelopeTemplate => {
      const now = Date.now()
      const newTemplate: EnvelopeTemplate = {
        id: generateTemplateId(),
        name: name.trim(),
        createdAt: now,
        updatedAt: now,
        data: JSON.parse(JSON.stringify(envelopeData.data)),
        layout: uiSettings.layout,
        sizeId: uiSettings.sizeId,
        side: uiSettings.side,
        customSize: uiSettings.sizeId === CUSTOM_SIZE_ID ? { ...uiSettings.customSize } : undefined,
      }
      templateListHook.addTemplate(newTemplate)
      return newTemplate
    },
    [envelopeData.data, uiSettings.layout, uiSettings.sizeId, uiSettings.side, uiSettings.customSize, templateListHook.addTemplate],
  )

  const applyTemplate = useCallback(
    (id: string) => {
      const template = templateListHook.findTemplate(id)
      if (template) {
        envelopeData.setDataAndPersist(template.data)
        uiSettings.applyUiFromTemplate(template)
      }
    },
    [templateListHook.findTemplate, envelopeData.setDataAndPersist, uiSettings.applyUiFromTemplate],
  )

  const deleteTag = useCallback(
    (id: string) => {
      tagListHook.removeTag(id)
      addressListHook.removeTagFromAddresses(id)
    },
    [tagListHook.removeTag, addressListHook.removeTagFromAddresses],
  )

  const value = useMemo(
    () => ({
      data: envelopeData.data,
      layout: uiSettings.layout,
      size: uiSettings.size,
      side: uiSettings.side,
      customSize: uiSettings.customSize,
      zoomPercent: uiSettings.zoomPercent,
      addressList: addressListHook.addressList,
      templateList: templateListHook.templateList,
      tagList: tagListHook.tagList,
      setData: envelopeData.setData,
      updateSender: envelopeData.updateSender,
      updateRecipient: envelopeData.updateRecipient,
      updateSenderTags: envelopeData.updateSenderTags,
      updateRecipientTags: envelopeData.updateRecipientTags,
      setLayout: uiSettings.setLayout,
      setSizeId: uiSettings.setSizeId,
      setCustomSize: uiSettings.setCustomSize,
      setSide: uiSettings.setSide,
      setZoomPercent: uiSettings.setZoomPercent,
      loadMockData: envelopeData.loadMockData,
      resetData: envelopeData.resetData,
      persist: envelopeData.persist,
      addAddress: addressListHook.addAddress,
      addAddresses: addressListHook.addAddresses,
      removeAddress: addressListHook.removeAddress,
      clearAddressList: addressListHook.clearAddressList,
      setRecipientFromList,
      updateAddressTags: addressListHook.updateAddressTags,
      saveTemplate,
      updateTemplate: templateListHook.updateTemplate,
      deleteTemplate: templateListHook.deleteTemplate,
      applyTemplate,
      isTemplateNameDuplicate: templateListHook.isTemplateNameDuplicate,
      addTag: tagListHook.addTag,
      importTags: tagListHook.importTags,
      updateTag: tagListHook.updateTag,
      deleteTag,
      isTagNameDuplicate: tagListHook.isTagNameDuplicate,
    }),
    [
      envelopeData.data,
      envelopeData.setData,
      envelopeData.updateSender,
      envelopeData.updateRecipient,
      envelopeData.updateSenderTags,
      envelopeData.updateRecipientTags,
      envelopeData.loadMockData,
      envelopeData.resetData,
      envelopeData.persist,
      uiSettings.layout,
      uiSettings.size,
      uiSettings.side,
      uiSettings.customSize,
      uiSettings.zoomPercent,
      uiSettings.setLayout,
      uiSettings.setSizeId,
      uiSettings.setCustomSize,
      uiSettings.setSide,
      uiSettings.setZoomPercent,
      addressListHook.addressList,
      addressListHook.addAddress,
      addressListHook.addAddresses,
      addressListHook.removeAddress,
      addressListHook.clearAddressList,
      addressListHook.updateAddressTags,
      addressListHook.removeTagFromAddresses,
      templateListHook.templateList,
      templateListHook.addTemplate,
      templateListHook.updateTemplate,
      templateListHook.deleteTemplate,
      templateListHook.isTemplateNameDuplicate,
      templateListHook.findTemplate,
      tagListHook.tagList,
      tagListHook.addTag,
      tagListHook.importTags,
      tagListHook.updateTag,
      tagListHook.removeTag,
      tagListHook.isTagNameDuplicate,
      setRecipientFromList,
      saveTemplate,
      applyTemplate,
      deleteTag,
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
