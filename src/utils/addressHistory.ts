import {
  MAX_HISTORY_ITEMS,
  RECIPIENT_HISTORY_KEY,
  SENDER_HISTORY_KEY,
  createEmptyAddress,
  generateHistoryId,
  getAddressKey,
  type Address,
  type AddressHistoryItem,
  type AddressSide,
} from '../types/envelope';

type HistoryChangeListener = (side: AddressSide) => void;

const listeners = new Set<HistoryChangeListener>();

function getStorageKey(side: AddressSide): string {
  return side === 'sender' ? SENDER_HISTORY_KEY : RECIPIENT_HISTORY_KEY;
}

function notifyListeners(side: AddressSide) {
  listeners.forEach((fn) => fn(side));
}

export function subscribeHistoryChange(fn: HistoryChangeListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function loadAddressHistory(side: AddressSide): AddressHistoryItem[] {
  try {
    const raw = localStorage.getItem(getStorageKey(side));
    if (raw) {
      const parsed = JSON.parse(raw) as (Omit<AddressHistoryItem, 'address'> & {
        address?: Partial<Address>;
      })[];
      return parsed
        .map((item) => ({
          ...item,
          address: {
            ...createEmptyAddress(),
            ...(item.address || {}),
            tags: item.address?.tags || [],
          },
        }))
        .sort((a, b) => b.lastUsedAt - a.lastUsedAt);
    }
  } catch {
    /* ignore */
  }
  return [];
}

function saveHistory(side: AddressSide, history: AddressHistoryItem[]) {
  localStorage.setItem(getStorageKey(side), JSON.stringify(history));
}

export function addAddressToHistory(side: AddressSide, address: Address): AddressHistoryItem[] {
  const history = loadAddressHistory(side);
  const key = getAddressKey(address);
  const now = Date.now();

  const existingIndex = history.findIndex((item) => getAddressKey(item.address) === key);

  if (existingIndex !== -1) {
    history[existingIndex].lastUsedAt = now;
    history[existingIndex].address = { ...address };
  } else {
    history.unshift({
      id: generateHistoryId(),
      address: { ...address },
      lastUsedAt: now,
    });
  }

  const sorted = history.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
  const trimmed = sorted.slice(0, MAX_HISTORY_ITEMS);
  saveHistory(side, trimmed);
  notifyListeners(side);
  return trimmed;
}

export function markHistoryUsed(side: AddressSide, id: string): AddressHistoryItem[] {
  const history = loadAddressHistory(side);
  const now = Date.now();
  const item = history.find((h) => h.id === id);
  if (item) {
    item.lastUsedAt = now;
    const sorted = history.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
    saveHistory(side, sorted);
    notifyListeners(side);
    return sorted;
  }
  return history;
}

export function removeAddressFromHistory(side: AddressSide, id: string): AddressHistoryItem[] {
  const history = loadAddressHistory(side);
  const filtered = history.filter((item) => item.id !== id);
  saveHistory(side, filtered);
  notifyListeners(side);
  return filtered;
}

export function clearAddressHistory(side: AddressSide): AddressHistoryItem[] {
  saveHistory(side, []);
  notifyListeners(side);
  return [];
}

interface FormatTimeParams {
  justNow: string;
  minutesAgo: (count: number) => string;
  hoursAgo: (count: number) => string;
  daysAgo: (count: number) => string;
  dateFormat: (year: string, month: string, day: string) => string;
}

export function formatLastUsed(timestamp: number, t: FormatTimeParams): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return t.justNow;
  }
  if (diff < hour) {
    const mins = Math.floor(diff / minute);
    return t.minutesAgo(mins);
  }
  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return t.hoursAgo(hours);
  }
  if (diff < 7 * day) {
    const days = Math.floor(diff / day);
    return t.daysAgo(days);
  }

  const date = new Date(timestamp);
  const y = String(date.getFullYear());
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return t.dateFormat(y, m, d);
}

export function isAddressEmpty(address: Address): boolean {
  return (
    !address.name.trim() &&
    !address.phone.trim() &&
    !address.province.trim() &&
    !address.city.trim() &&
    !address.district.trim() &&
    !address.street.trim() &&
    !address.postcode.trim()
  );
}

export function formatAddressDisplay(addr: Address, noInfoText: string): string {
  const parts = [addr.province, addr.city, addr.district, addr.street, addr.postcode].filter(
    Boolean,
  );
  return parts.join(' · ') || noInfoText;
}
