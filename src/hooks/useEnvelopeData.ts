import { useCallback, useState } from 'react';
import {
  createEmptyAddress,
  STORAGE_KEY,
  type Address,
  type EnvelopeData,
} from '../types/envelope';
import { mockEnvelopeData } from '../data/mockData';

function loadFromStorage(): EnvelopeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<EnvelopeData>;
      return {
        sender: { ...createEmptyAddress(), ...(parsed.sender || {}) },
        recipient: { ...createEmptyAddress(), ...(parsed.recipient || {}) },
      };
    }
  } catch {
    /* ignore */
  }
  return {
    sender: createEmptyAddress(),
    recipient: createEmptyAddress(),
  };
}

function saveToStorage(data: EnvelopeData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export interface UseEnvelopeDataReturn {
  data: EnvelopeData;
  setData: (data: EnvelopeData) => void;
  setDataAndPersist: (data: EnvelopeData) => void;
  updateSender: (field: keyof Address, value: string) => void;
  updateRecipient: (field: keyof Address, value: string) => void;
  updateSenderTags: (tags: string[]) => void;
  updateRecipientTags: (tags: string[]) => void;
  loadMockData: () => void;
  resetData: () => void;
  persist: () => void;
  error: string | null;
}

export function useEnvelopeData(): UseEnvelopeDataReturn {
  const [data, setDataState] = useState<EnvelopeData>(loadFromStorage);
  const [error, setError] = useState<string | null>(null);

  const setData = useCallback((next: EnvelopeData) => {
    setDataState(next);
    setError(null);
  }, []);

  const setDataAndPersist = useCallback((next: EnvelopeData) => {
    try {
      setDataState(next);
      saveToStorage(next);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存数据失败');
    }
  }, []);

  const updateSender = useCallback((field: keyof Address, value: string) => {
    setDataState((prev) => ({
      ...prev,
      sender: { ...prev.sender, [field]: value },
    }));
    setError(null);
  }, []);

  const updateRecipient = useCallback((field: keyof Address, value: string) => {
    setDataState((prev) => ({
      ...prev,
      recipient: { ...prev.recipient, [field]: value },
    }));
    setError(null);
  }, []);

  const updateSenderTags = useCallback((tags: string[]) => {
    setDataState((prev) => ({
      ...prev,
      sender: { ...prev.sender, tags },
    }));
    setError(null);
  }, []);

  const updateRecipientTags = useCallback((tags: string[]) => {
    setDataState((prev) => ({
      ...prev,
      recipient: { ...prev.recipient, tags },
    }));
    setError(null);
  }, []);

  const loadMockData = useCallback(() => {
    try {
      setDataState(mockEnvelopeData);
      saveToStorage(mockEnvelopeData);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载示例数据失败');
    }
  }, []);

  const resetData = useCallback(() => {
    try {
      const empty = {
        sender: createEmptyAddress(),
        recipient: createEmptyAddress(),
      };
      setDataState(empty);
      saveToStorage(empty);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '重置数据失败');
    }
  }, []);

  const persist = useCallback(() => {
    try {
      saveToStorage(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存数据失败');
    }
  }, [data]);

  return {
    data,
    setData,
    setDataAndPersist,
    updateSender,
    updateRecipient,
    updateSenderTags,
    updateRecipientTags,
    loadMockData,
    resetData,
    persist,
    error,
  };
}
