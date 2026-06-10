import { useEffect, useState } from 'react';
import { useEnvelope } from '../context/EnvelopeContext';
import { useLanguage } from '../context/LanguageContext';

interface SaveTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function SaveTemplateDialog({ open, onClose, onSaved }: SaveTemplateDialogProps) {
  const { saveTemplate, isTemplateNameDuplicate } = useEnvelope();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName('');
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('template.emptyNameError'));
      return;
    }
    if (isTemplateNameDuplicate(trimmed)) {
      setError(t('template.duplicateNameError'));
      return;
    }
    saveTemplate(trimmed);
    onSaved?.();
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-stone-900">
          {t('template.saveAsTemplate')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              {t('template.templateName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder={t('template.templateNamePlaceholder')}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
              autoFocus
            />
            {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
