import type { Address } from '../types/envelope'
import { formatBritishAddress } from '../types/envelope'

interface EnvelopeBritishProps {
  side: 'front' | 'back'
  recipient: Address
  sender: Address
  widthPx: number
  heightPx: number
}

export default function EnvelopeBritish({
  side,
  recipient,
  sender,
  widthPx,
  heightPx,
}: EnvelopeBritishProps) {
  const recipientLines = formatBritishAddress(recipient)
  const senderLines = formatBritishAddress(sender)

  if (side === 'back') {
    return (
      <div
        className="envelope-paper relative overflow-hidden font-sans text-stone-800"
        style={{ width: widthPx, height: heightPx }}
      >
        <div className="absolute inset-0 border border-stone-300/50" />
        <div className="absolute left-[8%] top-[8%] max-w-[50%] space-y-0.5 text-[clamp(9px,2vw,12px)] leading-snug">
          <p className="mb-1 text-[9px] uppercase tracking-wider text-stone-500">
            Return Address
          </p>
          {senderLines.length > 0 ? (
            senderLines.map((line, i) => (
              <p key={i}>{line}</p>
            ))
          ) : (
            <p className="text-stone-400">Sender address</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="envelope-paper relative overflow-hidden font-sans text-stone-800"
      style={{ width: widthPx, height: heightPx }}
    >
      <div className="absolute inset-0 border border-stone-300/50" />

      {/* Stamp — top right */}
      <div className="absolute right-[6%] top-[6%] stamp-area flex h-[16%] w-[20%] items-center justify-center text-[8px] uppercase tracking-wide text-stone-400">
        Stamp
      </div>

      {/* Recipient — center-right, British convention */}
      <div className="absolute bottom-[22%] left-[10%] right-[10%]">
        <div className="mx-auto max-w-[75%] space-y-1 text-[clamp(11px,2.3vw,14px)] leading-snug">
          {recipientLines.length > 0 ? (
            recipientLines.map((line, i) => (
              <p
                key={i}
                className={
                  i === recipientLines.length - 2 && recipient.postcode
                    ? 'text-[1.1em] font-bold tracking-widest'
                    : i === 0
                      ? 'font-semibold'
                      : ''
                }
              >
                {line}
              </p>
            ))
          ) : (
            <p className="text-stone-400">Recipient address</p>
          )}
        </div>
      </div>
    </div>
  )
}
