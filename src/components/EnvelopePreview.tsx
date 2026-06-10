import { forwardRef } from 'react'
import { useEnvelope } from '../context/EnvelopeContext'
import EnvelopeChinese from './EnvelopeChinese'
import EnvelopeBritish from './EnvelopeBritish'

const MM_TO_PX = 3.78

interface EnvelopePreviewProps {
  scale?: number
}

const EnvelopePreview = forwardRef<HTMLDivElement, EnvelopePreviewProps>(
  function EnvelopePreview({ scale = 1 }, ref) {
    const { data, layout, size, side } = useEnvelope()

    const widthPx = Math.round(size.widthMm * MM_TO_PX * scale)
    const heightPx = Math.round(size.heightMm * MM_TO_PX * scale)

    const EnvelopeComponent = layout === 'chinese' ? EnvelopeChinese : EnvelopeBritish

    return (
      <div ref={ref} className="inline-block">
        <EnvelopeComponent
          side={side}
          recipient={data.recipient}
          sender={data.sender}
          widthPx={widthPx}
          heightPx={heightPx}
        />
      </div>
    )
  },
)

export default EnvelopePreview

export function getEnvelopePixelSize(widthMm: number, heightMm: number, scale = 1) {
  return {
    width: Math.round(widthMm * MM_TO_PX * scale),
    height: Math.round(heightMm * MM_TO_PX * scale),
  }
}
