import { useCallback, useEffect, useState } from 'react';
import {
  createEmptyAddress,
  TEMPLATE_LIST_KEY,
  type Address,
  type EnvelopeTemplate,
} from '../types/envelope';

function loadTemplateListFromStorage(): EnvelopeTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATE_LIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as (EnvelopeTemplate & {
        data?: { sender?: Partial<Address>; recipient?: Partial<Address> };
      })[];
      return parsed.map((template) => ({
        ...template,
        data: {
          sender: { ...createEmptyAddress(), ...(template.data?.sender || {}) },
          recipient: { ...createEmptyAddress(), ...(template.data?.recipient || {}) },
        },
      }));
    }
  } catch {
    /* ignore */
  }
  return [];
}

export interface UseTemplateListReturn {
  templateList: EnvelopeTemplate[];
  addTemplate: (template: EnvelopeTemplate) => void;
  updateTemplate: (id: string, name: string) => void;
  deleteTemplate: (id: string) => void;
  isTemplateNameDuplicate: (name: string, excludeId?: string) => boolean;
  findTemplate: (id: string) => EnvelopeTemplate | undefined;
  error: string | null;
}

export function useTemplateList(): UseTemplateListReturn {
  const [templateList, setTemplateList] = useState<EnvelopeTemplate[]>(loadTemplateListFromStorage);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(TEMPLATE_LIST_KEY, JSON.stringify(templateList));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存模板列表失败');
    }
  }, [templateList]);

  const addTemplate = useCallback((template: EnvelopeTemplate) => {
    setTemplateList((prev) => [...prev, template]);
    setError(null);
  }, []);

  const updateTemplate = useCallback((id: string, name: string) => {
    setTemplateList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: name.trim(), updatedAt: Date.now() } : t)),
    );
    setError(null);
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplateList((prev) => prev.filter((t) => t.id !== id));
    setError(null);
  }, []);

  const isTemplateNameDuplicate = useCallback(
    (name: string, excludeId?: string) => {
      return templateList.some((t) => t.name.trim() === name.trim() && t.id !== excludeId);
    },
    [templateList],
  );

  const findTemplate = useCallback(
    (id: string) => {
      return templateList.find((t) => t.id === id);
    },
    [templateList],
  );

  return {
    templateList,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    isTemplateNameDuplicate,
    findTemplate,
    error,
  };
}
