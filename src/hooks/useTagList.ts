import { useCallback, useEffect, useState } from 'react'
import {
  generateTagId,
  TAG_LIST_KEY,
  type Tag,
} from '../types/envelope'

function loadTagListFromStorage(): Tag[] {
  try {
    const raw = localStorage.getItem(TAG_LIST_KEY)
    if (raw) {
      return JSON.parse(raw) as Tag[]
    }
  } catch {
    /* ignore */
  }
  return []
}

export interface UseTagListReturn {
  tagList: Tag[]
  addTag: (name: string, color: string) => Tag
  importTags: (tags: Tag[]) => void
  updateTag: (id: string, name: string, color: string) => void
  removeTag: (id: string) => void
  isTagNameDuplicate: (name: string, excludeId?: string) => boolean
  error: string | null
}

export function useTagList(): UseTagListReturn {
  const [tagList, setTagList] = useState<Tag[]>(loadTagListFromStorage)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(TAG_LIST_KEY, JSON.stringify(tagList))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存标签列表失败')
    }
  }, [tagList])

  const addTag = useCallback(
    (name: string, color: string): Tag => {
      const newTag: Tag = {
        id: generateTagId(),
        name: name.trim(),
        color,
      }
      setTagList((prev) => [...prev, newTag])
      setError(null)
      return newTag
    },
    [],
  )

  const importTags = useCallback((tags: Tag[]) => {
    setTagList((prev) => {
      const existingIds = new Set(prev.map((t) => t.id))
      const existingNames = new Set(prev.map((t) => t.name.trim().toLowerCase()))
      const newTags = tags.filter(
        (t) => !existingIds.has(t.id) && !existingNames.has(t.name.trim().toLowerCase()),
      )
      return [...prev, ...newTags]
    })
    setError(null)
  }, [])

  const updateTag = useCallback((id: string, name: string, color: string) => {
    setTagList((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, name: name.trim(), color } : t,
      ),
    )
    setError(null)
  }, [])

  const removeTag = useCallback((id: string) => {
    setTagList((prev) => prev.filter((t) => t.id !== id))
    setError(null)
  }, [])

  const isTagNameDuplicate = useCallback(
    (name: string, excludeId?: string) => {
      return tagList.some(
        (t) => t.name.trim() === name.trim() && t.id !== excludeId,
      )
    },
    [tagList],
  )

  return {
    tagList,
    addTag,
    importTags,
    updateTag,
    removeTag,
    isTagNameDuplicate,
    error,
  }
}
