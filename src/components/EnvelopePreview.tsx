import { forwardRef } from 'react'
import { useEnvelope } from '../context/EnvelopeContext'
import { DEFAULT_ZOOM_PERCENT, getEnvelopePixelSize } from '../types/envelope'
import EnvelopeChinese from './EnvelopeChinese'
import EnvelopeBritish from './EnvelopeBritish'

interface EnvelopePreviewProps {
  forceZoomPercent?: number
}

const EnvelopePreview = forwardRef<HTMLDivElement, EnvelopePreviewProps>(
  function EnvelopePreview({ forceZoomPercent }, ref) {
    const { data, layout, size, side, zoomPercent } = useEnvelope()

    const { width: widthPx, height: heightPx } = getEnvelopePixelSize(
      size.widthMm,
      size.heightMm,
      1,
    )

    const effectiveZoom =
      forceZoomPercent !== undefined ? forceZoomPercent : zoomPercent
    const scale = effectiveZoom / DEFAULT_ZOOM_PERCENT
    const EnvelopeComponent = layout === 'chinese' ? EnvelopeChinese : EnvelopeBritish

    return (
      <div
        ref={ref}
        className="inline-block"
        style={{
          width: widthPx,
          height: heightPx,
        }}
      >
        <div
          style={{
            width: widthPx,
            height: heightPx,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          <EnvelopeComponent
            side={side}
            recipient={data.recipient}
            sender={data.sender}
            widthPx={widthPx}
            heightPx={heightPx}
          />
        </div>
      </div>
    )
  },
)

export default EnvelopePreview

export { getEnvelopePixelSize } from '../types/envelope'
