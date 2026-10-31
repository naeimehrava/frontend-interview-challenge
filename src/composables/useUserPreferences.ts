import { computed, nextTick, ref, watch } from 'vue'

export const THEME_OPTIONS = ['light', 'dark'] as const
export type ThemePreference = (typeof THEME_OPTIONS)[number]

export const FONT_SIZE_OPTIONS = ['small', 'medium', 'large'] as const
export type FontSizePreference = (typeof FONT_SIZE_OPTIONS)[number]

export interface UserPreferences {
  theme: ThemePreference
  fontSize: FontSizePreference
}

export const STORAGE_KEY = 'dashboard:user-preferences'

export const DEFAULT_PREFERENCES: Readonly<UserPreferences> = {
  theme: 'dark',
  fontSize: 'medium',
}

export const FONT_SCALE_MAP: Readonly<Record<FontSizePreference, string>> = {
  small: '87.5%',
  medium: '100%',
  large: '112.5%',
}

export function isTheme (value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_OPTIONS as readonly string[]).includes(value)
}

export function isFontSize (value: unknown): value is FontSizePreference {
  return typeof value === 'string' && (FONT_SIZE_OPTIONS as readonly string[]).includes(value)
}

export function parsePreferences (raw: string | null): UserPreferences {
  if (!raw) {
    return { ...DEFAULT_PREFERENCES }
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) {
      return { ...DEFAULT_PREFERENCES }
    }
    const record = parsed as Record<string, unknown>
    return {
      theme: isTheme(record.theme) ? record.theme : DEFAULT_PREFERENCES.theme,
      fontSize: isFontSize(record.fontSize) ? record.fontSize : DEFAULT_PREFERENCES.fontSize,
    }
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

export function safeReadStorage (): UserPreferences {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_PREFERENCES }
  }
  try {
    return parsePreferences(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

let initialSnapshot: UserPreferences | null = null
let lastPersistedJson = ''

export function getInitialPreferences (): UserPreferences {
  if (!initialSnapshot) {
    initialSnapshot = safeReadStorage()
    lastPersistedJson = JSON.stringify(initialSnapshot)
  }
  return { ...initialSnapshot }
}

export function safeWriteStorage (prefs: UserPreferences): void {
  if (typeof window === 'undefined') {
    return
  }
  const payload = JSON.stringify(prefs)
  if (payload === lastPersistedJson) {
    return
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, payload)
    lastPersistedJson = payload
  } catch (error) {
    if (import.meta.env?.DEV) {
      console.warn('[useUserPreferences] Failed to persist preferences:', error)
    }
  }
}

// Module-level singleton state ensures all consumers share the same reactive instances
const initial = getInitialPreferences()
const theme = ref<ThemePreference>(initial.theme)
const fontSize = ref<FontSizePreference>(initial.fontSize)
const fontScale = computed(() => FONT_SCALE_MAP[fontSize.value])

let isSynchronizingFromStorage = false

// Non-immediate watcher: only write to localStorage on deliberate user updates
watch([theme, fontSize], ([newTheme, newFontSize]) => {
  if (isSynchronizingFromStorage) {
    return
  }
  safeWriteStorage({
    theme: newTheme,
    fontSize: newFontSize,
  })
}, { immediate: false })

// Cross-tab synchronization via browser storage event (handles updates, deletions, and clear)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) {
      return
    }
    const incoming = parsePreferences(event.newValue)
    isSynchronizingFromStorage = true
    lastPersistedJson = event.newValue === null ? '' : JSON.stringify(incoming)
    try {
      if (theme.value !== incoming.theme) {
        theme.value = incoming.theme
      }
      if (fontSize.value !== incoming.fontSize) {
        fontSize.value = incoming.fontSize
      }
    } finally {
      void nextTick(() => {
        isSynchronizingFromStorage = false
      })
    }
  })
}

export function useUserPreferences () {
  function setTheme (newTheme: ThemePreference) {
    if (isTheme(newTheme) && theme.value !== newTheme) {
      theme.value = newTheme
    }
  }

  function setFontSize (newFontSize: FontSizePreference) {
    if (isFontSize(newFontSize) && fontSize.value !== newFontSize) {
      fontSize.value = newFontSize
    }
  }

  function toggleTheme () {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return {
    theme,
    fontSize,
    setTheme,
    setFontSize,
    toggleTheme,
    fontScale,
  }
}
