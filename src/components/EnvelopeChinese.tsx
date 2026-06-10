import type { Address } from '../types/envelope';
import { formatChineseAddress } from '../types/envelope';
import { useLanguage } from '../context/LanguageContext';

interface EnvelopeChineseProps {
  side: 'front' | 'back';
  recipient: Address;
  sender: Address;
  widthPx: number;
  heightPx: number;
}

function PostcodeBoxes({ code }: { code: string }) {
  const digits = (code.replace(/\s/g, '').slice(0, 6) + '      ').slice(0, 6).split('');
  return (
    <div className="flex gap-0.5">
      {digits.map((d, i) => (
        <span key={i} className="postcode-box">
          {d.trim() || '\u00A0'}
        </span>
      ))}
    </div>
  );
}

export default function EnvelopeChinese({
  side,
  recipient,
  sender,
  widthPx,
  heightPx,
}: EnvelopeChineseProps) {
  const { t } = useLanguage();
  const recipientLines = formatChineseAddress(recipient);
  const senderLines = formatChineseAddress(sender);

  if (side === 'back') {
    return (
      <div
        className="envelope-paper relative overflow-hidden font-serif text-stone-800"
        style={{ width: widthPx, height: heightPx }}
      >
        <div className="absolute inset-0 border border-stone-300/50" />
        <div className="absolute bottom-[8%] left-[6%] max-w-[55%] space-y-1 text-[clamp(10px,2.2vw,13px)] leading-relaxed">
          <p className="text-[10px] tracking-widest text-stone-500">
            {t('envelope.chinese.senderLabel')}
          </p>
          {senderLines.length > 0 ? (
            senderLines.map((line, i) => <p key={i}>{line}</p>)
          ) : (
            <p className="text-stone-400">{t('envelope.chinese.senderPlaceholder')}</p>
          )}
        </div>
        <div className="absolute right-[5%] top-[5%] stamp-area flex h-[14%] w-[18%] items-center justify-center text-[9px] text-stone-400">
          {t('envelope.chinese.stampLabel')}
        </div>
      </div>
    );
  }

  return (
    <div
      className="envelope-paper relative overflow-hidden font-serif text-stone-800"
      style={{ width: widthPx, height: heightPx }}
    >
      <div className="absolute inset-0 border border-stone-300/50" />

      {/* 邮编框 — 左上 */}
      <div className="absolute left-[5%] top-[5%]">
        <PostcodeBoxes code={recipient.postcode} />
      </div>

      {/* 邮票区 — 右上 */}
      <div className="absolute right-[5%] top-[5%] stamp-area flex h-[14%] w-[18%] flex-col items-center justify-center gap-0.5 text-[8px] text-stone-400">
        <span>{t('envelope.chinese.stampArea')}</span>
      </div>

      {/* 收件人 — 右侧居中偏下（中式标准） */}
      <div className="absolute bottom-[18%] right-[8%] max-w-[58%] text-right">
        <div className="inline-block text-left space-y-1.5 text-[clamp(11px,2.4vw,15px)] leading-relaxed tracking-wide">
          {recipientLines.length > 0 ? (
            recipientLines.map((line, i) => (
              <p key={i} className={i === 0 ? 'text-[1.15em] font-semibold' : ''}>
                {line}
              </p>
            ))
          ) : (
            <p className="text-stone-400">{t('envelope.chinese.recipientPlaceholder')}</p>
          )}
        </div>
      </div>

      {/* 装饰线 */}
      <div className="pointer-events-none absolute bottom-[12%] left-[5%] right-[5%] border-b border-stone-300/40" />
    </div>
  );
}
