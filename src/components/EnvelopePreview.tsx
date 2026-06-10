import { forwardRef } from 'react'
import { useEnvelope } from '../context/EnvelopeContext'
import { getEnvelopePixelSize } from '../types/envelope'
import EnvelopeChinese from './EnvelopeChinese'
import EnvelopeBritish from './EnvelopeBritish'

interface EnvelopePreviewProps {
  scale?: number
}

const EnvelopePreview = forwardRef<HTMLDivElement, EnvelopePreviewProps>(
  function EnvelopePreview({ scale = 1 }, ref) {
    const { data, layout, size, side } = useEnvelope()

    const { width: widthPx, height: heightPx } = getEnvelopePixelSize(
      size.widthMm,
      size.heightMm,
      scale,
    )

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

export { getEnvelopePixelSize } from '../types/envelope'
