import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  clampSize,
  clampZoom,
  createCustomSize,
  CUSTOM_SIZE_ID,
  DEFAULT_CUSTOM_HEIGHT,
  DEFAULT_CUSTOM_WIDTH,
  DEFAULT_ZOOM_PERCENT,
  ENVELOPE_SIZES,
  UI_SETTINGS_KEY,
  type CustomSizeSettings,
  type EnvelopeSide,
  type EnvelopeSize,
  type EnvelopeTemplate,
  type EnvelopeUiSettings,
  type LayoutStyle,
} from '../types/envelope'

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
        zoomPercent: clampZoom(parsed.zoomPercent ?? DEFAULT_ZOOM_PERCENT),
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
    zoomPercent: DEFAULT_ZOOM_PERCENT,
  }
}

function saveUiSettingsToStorage(settings: EnvelopeUiSettings) {
  try {
    localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    /* ignore */
  }
}

export interface UseUiSettingsReturn {
  layout: LayoutStyle
  sizeId: string
  size: EnvelopeSize
  side: EnvelopeSide
  customSize: CustomSizeSettings
  zoomPercent: number
  setLayout: (layout: LayoutStyle) => void
  setSizeId: (id: string) => void
  setCustomSize: (size: Partial<CustomSizeSettings>) => void
  setSide: (side: EnvelopeSide) => void
  setZoomPercent: (percent: number) => void
  applyUiFromTemplate: (template: EnvelopeTemplate) => void
  error: string | null
}

export function useUiSettings(): UseUiSettingsReturn {
  const initialUi = useMemo(loadUiSettingsFromStorage, [])
  const [layout, setLayout] = useState<LayoutStyle>(initialUi.layout)
  const [sizeId, setSizeId] = useState<string>(initialUi.sizeId)
  const [side, setSide] = useState<EnvelopeSide>(initialUi.side)
  const [customSize, setCustomSizeState] = useState<CustomSizeSettings>(initialUi.customSize)
  const [zoomPercent, setZoomPercentState] = useState<number>(initialUi.zoomPercent)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      saveUiSettingsToStorage({ layout, sizeId, side, customSize, zoomPercent })
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存UI设置失败')
    }
  }, [layout, sizeId, side, customSize, zoomPercent])

  const setCustomSize = useCallback((next: Partial<CustomSizeSettings>) => {
    setCustomSizeState((prev) => ({ ...prev, ...next }))
    setError(null)
  }, [])

  const setZoomPercent = useCallback((percent: number) => {
    setZoomPercentState(clampZoom(percent))
    setError(null)
  }, [])

  const size = useMemo(() => {
    if (sizeId === CUSTOM_SIZE_ID) {
      const clampedWidth = clampSize(customSize.widthMm)
      const clampedHeight = clampSize(customSize.heightMm)
      return createCustomSize(clampedWidth, clampedHeight)
    }
    return ENVELOPE_SIZES.find((s) => s.id === sizeId) ?? ENVELOPE_SIZES[1]
  }, [sizeId, customSize])

  const applyUiFromTemplate = useCallback((template: EnvelopeTemplate) => {
    try {
      setLayout(template.layout)
      setSizeId(template.sizeId)
      setSide(template.side)
      if (template.customSize) {
        setCustomSizeState(template.customSize)
      }
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '应用模板UI设置失败')
    }
  }, [])

  return {
    layout,
    sizeId,
    size,
    side,
    customSize,
    zoomPercent,
    setLayout,
    setSizeId,
    setCustomSize,
    setSide,
    setZoomPercent,
    applyUiFromTemplate,
    error,
  }
}
