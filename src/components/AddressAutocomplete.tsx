import { useEffect, useRef, useState } from 'react'
import {
  searchProvinces,
  searchCities,
  searchDistricts,
  type AddressSuggestion,
} from '../utils/addressSearch'
import type { Address } from '../types/envelope'

interface AddressAutocompleteProps {
  fieldType: 'province' | 'city' | 'district'
  value: string
  placeholder: string
  accent: 'amber' | 'sky'
  address: Address
  closeVersion: number
  onSelect: (suggestion: AddressSuggestion) => void
  onChange: (value: string) => void
}

const accentMap = {
  amber: 'border-amber-400 focus:ring-amber-400/30',
  sky: 'border-sky-400 focus:ring-sky-400/30',
}

const activeAccentMap = {
  amber: 'bg-amber-50',
  sky: 'bg-sky-50',
}

export default function AddressAutocomplete({
  fieldType,
  value,
  placeholder,
  accent,
  address,
  closeVersion,
  onSelect,
  onChange,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }, [closeVersion])

  useEffect(() => {
    const searchValue = value.trim()
    if (searchValue.length >= 1) {
      let results: AddressSuggestion[] = []
      if (fieldType === 'province') {
        results = searchProvinces(searchValue)
      } else if (fieldType === 'city') {
        results = searchCities(searchValue, address.province)
      } else if (fieldType === 'district') {
        results = searchDistricts(searchValue, address.province, address.city)
      }
      setSuggestions(results)
      setIsOpen(results.length > 0)
      setActiveIndex(-1)
    } else {
      setSuggestions([])
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }, [value, address.province, address.city, fieldType])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => {
        if (prev <= 0) return -1
        return prev - 1
      })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelect(suggestions[activeIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  function handleSelect(suggestion: AddressSuggestion) {
    onSelect(suggestion)
    setIsOpen(false)
    setActiveIndex(-1)
  }

  function highlightMatch(text: string, keyword: string) {
    if (!keyword.trim()) return text
    const idx = text.toLowerCase().indexOf(keyword.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <strong className="font-semibold">{text.slice(idx, idx + keyword.length)}</strong>
        {text.slice(idx + keyword.length)}
      </>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true)
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full rounded-lg border bg-stone-50 px-3 py-2.5 text-stone-800 outline-none transition focus:bg-white focus:ring-2 ${accentMap[accent]}`}
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.province}-${suggestion.city}-${suggestion.district}-${index}`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => handleSelect(suggestion)}
              className={`cursor-pointer px-3 py-2 text-sm text-stone-700 transition-colors ${
                index === activeIndex ? activeAccentMap[accent] : 'hover:bg-stone-50'
              }`}
            >
              {highlightMatch(suggestion.label, value)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
