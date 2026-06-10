import { useState, useImperativeHandle, forwardRef } from 'react';
import type { Address, AddressSide } from '../types/envelope';
import AddressAutocomplete from './AddressAutocomplete';
import TagSelector from './TagSelector';
import AddressHistoryDropdown from './AddressHistoryDropdown';
import type { AddressSuggestion } from '../utils/addressSearch';
import { useLanguage } from '../context/LanguageContext';
import { addAddressToHistory, isAddressEmpty } from '../utils/addressHistory';

interface AddressFormProps {
  title: string;
  side: AddressSide;
  accent: 'amber' | 'sky';
  address: Address;
  onChange: (field: keyof Address, value: string) => void;
  onTagsChange?: (tags: string[]) => void;
  showTags?: boolean;
}

export interface AddressFormRef {
  saveToHistory: () => void;
}

const accentMap = {
  amber: 'border-amber-400 focus:ring-amber-400/30',
  sky: 'border-sky-400 focus:ring-sky-400/30',
};

const AddressForm = forwardRef<AddressFormRef, AddressFormProps>(function AddressForm(
  { title, side, accent, address, onChange, onTagsChange, showTags = true },
  ref,
) {
  const [closeVersion, setCloseVersion] = useState(0);
  const [provinceConfirmed, setProvinceConfirmed] = useState(false);
  const [cityConfirmed, setCityConfirmed] = useState(false);
  const { t } = useLanguage();

  useImperativeHandle(ref, () => ({
    saveToHistory: () => {
      if (!isAddressEmpty(address)) {
        addAddressToHistory(side, address);
      }
    },
  }));

  function closeAllDropdowns() {
    setCloseVersion((v) => v + 1);
  }

  function handleProvinceSelect(suggestion: AddressSuggestion) {
    if (suggestion.type !== 'province') return;
    onChange('province', suggestion.province);
    onChange('city', '');
    onChange('district', '');
    setProvinceConfirmed(true);
    setCityConfirmed(false);
    closeAllDropdowns();
  }

  function handleCitySelect(suggestion: AddressSuggestion) {
    if (suggestion.type !== 'city') return;
    onChange('city', suggestion.city);
    onChange('district', '');
    setCityConfirmed(true);
    closeAllDropdowns();
  }

  function handleDistrictSelect(suggestion: AddressSuggestion) {
    if (suggestion.type !== 'district') return;
    onChange('district', suggestion.district);
    closeAllDropdowns();
  }

  function handleProvinceManualInput() {
    if (provinceConfirmed || address.city || address.district) {
      setProvinceConfirmed(false);
      setCityConfirmed(false);
      onChange('city', '');
      onChange('district', '');
    }
  }

  function handleCityManualInput() {
    if (cityConfirmed || address.district) {
      setCityConfirmed(false);
      onChange('district', '');
    }
  }

  function handleHistorySelect(historyAddress: Address) {
    const fields: (keyof Address)[] = [
      'name',
      'phone',
      'province',
      'city',
      'district',
      'street',
      'postcode',
    ];
    fields.forEach((field) => {
      onChange(field, historyAddress[field] as string);
    });
    if (onTagsChange && historyAddress.tags) {
      onTagsChange(historyAddress.tags);
    }
    if (historyAddress.province) setProvinceConfirmed(true);
    if (historyAddress.city) setCityConfirmed(true);
    closeAllDropdowns();
  }

  const cityPlaceholder = provinceConfirmed
    ? t('form.placeholders.citySelect')
    : t('form.placeholders.city');
  const districtPlaceholder =
    provinceConfirmed && cityConfirmed
      ? t('form.placeholders.districtSelect')
      : t('form.placeholders.district');

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-800">
          <span
            className={`h-2 w-2 rounded-full ${accent === 'amber' ? 'bg-amber-500' : 'bg-sky-500'}`}
          />
          {title}
        </h2>
        <AddressHistoryDropdown side={side} accent={accent} onSelect={handleHistorySelect} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-stone-600">{t('common.name')}</span>
          <input
            type="text"
            value={address.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder={t('form.placeholders.name')}
            className={`rounded-lg border bg-stone-50 px-3 py-2.5 text-stone-800 outline-none transition focus:bg-white focus:ring-2 ${accentMap[accent]}`}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-stone-600">{t('common.phone')}</span>
          <input
            type="text"
            value={address.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder={t('form.placeholders.phone')}
            className={`rounded-lg border bg-stone-50 px-3 py-2.5 text-stone-800 outline-none transition focus:bg-white focus:ring-2 ${accentMap[accent]}`}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-stone-600">{t('common.province')}</span>
          <AddressAutocomplete
            fieldType="province"
            value={address.province}
            placeholder={t('form.placeholders.province')}
            accent={accent}
            address={address}
            closeVersion={closeVersion}
            onSelect={handleProvinceSelect}
            onChange={(val) => onChange('province', val)}
            onManualInput={handleProvinceManualInput}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-stone-600">{t('common.city')}</span>
          <AddressAutocomplete
            fieldType="city"
            value={address.city}
            placeholder={cityPlaceholder}
            accent={accent}
            address={address}
            closeVersion={closeVersion}
            onSelect={handleCitySelect}
            onChange={(val) => onChange('city', val)}
            onManualInput={handleCityManualInput}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-stone-600">{t('common.district')}</span>
          <AddressAutocomplete
            fieldType="district"
            value={address.district}
            placeholder={districtPlaceholder}
            accent={accent}
            address={address}
            closeVersion={closeVersion}
            onSelect={handleDistrictSelect}
            onChange={(val) => onChange('district', val)}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
          <span className="font-medium text-stone-600">{t('common.street')}</span>
          <input
            type="text"
            value={address.street}
            onChange={(e) => onChange('street', e.target.value)}
            placeholder={t('form.placeholders.street')}
            className={`rounded-lg border bg-stone-50 px-3 py-2.5 text-stone-800 outline-none transition focus:bg-white focus:ring-2 ${accentMap[accent]}`}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-stone-600">{t('common.postcode')}</span>
          <input
            type="text"
            value={address.postcode}
            onChange={(e) => onChange('postcode', e.target.value)}
            placeholder={t('form.placeholders.postcode')}
            className={`rounded-lg border bg-stone-50 px-3 py-2.5 text-stone-800 outline-none transition focus:bg-white focus:ring-2 ${accentMap[accent]}`}
          />
        </label>

        {showTags && onTagsChange && (
          <div className="flex flex-col gap-1.5 text-sm sm:col-span-2">
            <span className="font-medium text-stone-600">{t('tags.tags')}</span>
            <div className="mt-1">
              <TagSelector
                addressId={title}
                selectedTags={address.tags}
                onChange={onTagsChange}
                compact={false}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

export default AddressForm;
