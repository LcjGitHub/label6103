import { useState } from 'react';
import { useEnvelope } from '../context/EnvelopeContext';
import { useLanguage } from '../context/LanguageContext';
import { DEFAULT_TAG_COLORS } from '../types/envelope';
import type { Tag } from '../types/envelope';

interface TagFormState {
  name: string;
  color: string;
}

const emptyForm: TagFormState = {
  name: '',
  color: DEFAULT_TAG_COLORS[0],
};

export default function TagManager() {
  const { tagList, addTag, updateTag, deleteTag, isTagNameDuplicate } = useEnvelope();
  const { t } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TagFormState>(emptyForm);
  const [error, setError] = useState('');

  function startAdd() {
    setForm(emptyForm);
    setError('');
    setEditingId(null);
    setIsAdding(true);
  }

  function startEdit(tag: Tag) {
    setForm({ name: tag.name, color: tag.color });
    setError('');
    setIsAdding(false);
    setEditingId(tag.id);
  }

  function cancel() {
    setIsAdding(false);
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  }

  function handleSubmit() {
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setError(t('tags.emptyNameError'));
      return;
    }
    if (isTagNameDuplicate(trimmedName, editingId ?? undefined)) {
      setError(t('tags.duplicateNameError'));
      return;
    }

    if (isAdding) {
      addTag(trimmedName, form.color);
    } else if (editingId) {
      updateTag(editingId, trimmedName, form.color);
    }
    cancel();
  }

  function handleDelete(id: string) {
    if (confirm(t('tags.deleteConfirm'))) {
      deleteTag(id);
      if (editingId === id) {
        cancel();
      }
    }
  }

  const showForm = isAdding || editingId !== null;

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-800">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            {t('tags.title')}
          </h2>
          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
            {t('common.totalItems', { count: tagList.length })}
          </span>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={startAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t('tags.addTag')}
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-5 rounded-xl border border-violet-200 bg-violet-50/50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-stone-800">
            {isAdding ? t('tags.createTag') : t('tags.editTag')}
          </h3>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-stone-600">
                {t('tags.tagName')}
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('tags.tagNamePlaceholder')}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
              />
              {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
            </div>
            <div className="sm:w-64">
              <label className="mb-1.5 block text-sm font-medium text-stone-600">
                {t('tags.tagColor')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`h-7 w-7 rounded-full border-2 transition ${
                      form.color === color
                        ? 'border-stone-800 scale-110'
                        : 'border-white shadow-sm hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`${t('tags.selectColor')}: ${color}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
              >
                {t('common.save')}
              </button>
              <button
                type="button"
                onClick={cancel}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {tagList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg
            className="mb-3 h-12 w-12 text-stone-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <p className="text-sm text-stone-500">{t('tags.noTags')}</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tagList.map((tag) => (
            <div
              key={tag.id}
              className={`group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                editingId === tag.id ? 'ring-2 ring-violet-400 ring-offset-2' : ''
              }`}
              style={{
                backgroundColor: `${tag.color}15`,
                color: tag.color,
                border: `1px solid ${tag.color}40`,
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
              <span>{tag.name}</span>
              <div className="ml-1 flex items-center gap-0.5 transition md:opacity-0 md:group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => startEdit(tag)}
                  className="rounded p-0.5 transition hover:bg-white/60"
                  title={t('common.rename')}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(tag.id)}
                  className="rounded p-0.5 transition hover:bg-white/60"
                  title={t('common.delete')}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
