<script lang="ts">
  import type { ThemeInstance } from 'vuetify'
  import { computed, onBeforeUnmount, ref, watch } from 'vue'
  import { useTheme } from 'vuetify'

  interface ResolvedColorBinding {
    className?: string
    styleColor?: string
  }

  // Real lazy loading: query: '?raw' imports the SVG text as raw string chunks via Vite
  const iconLoaders = import.meta.glob<string>('../assets/icons/*.svg', {
    query: '?raw',
    import: 'default',
  })

  // Pre-index strictly allowed internal icon names from src/assets/icons/*.svg
  // Maps normalized iconName (e.g. 'users', 'close', 'refresh') to its glob loader path
  const availableIcons = new Map<string, string>()
  for (const path of Object.keys(iconLoaders)) {
    const match = path.match(/\/([^/]+)\.svg$/i)
    if (match && match[1]) {
      availableIcons.set(match[1].toLowerCase(), path)
    }
  }

  // Shared in-memory caches across all DynamicIcon instances
  const resolvedIconCache = new Map<string, string>()
  const pendingIconCache = new Map<string, Promise<string>>()

  const VUETIFY_TOKEN_SHAPE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/i
  const MATERIAL_PALETTE_TOKEN_PATTERN = /^(?:(?:red|pink|purple|deep-purple|indigo|blue|light-blue|cyan|teal|green|light-green|lime|yellow|amber|orange|deep-orange)(?:-(?:lighten-[1-5]|darken-[1-4]|accent-[1-4]))?|(?:brown|blue-grey|grey)(?:-(?:lighten-[1-5]|darken-[1-4]))?|black|white)$/i
  const DEFAULT_VUETIFY_THEME_TOKENS = new Set([
    'background',
    'error',
    'info',
    'primary',
    'primary-darken-1',
    'secondary',
    'secondary-darken-1',
    'success',
    'surface',
    'surface-bright',
    'surface-light',
    'surface-variant',
    'warning',
  ])
  const NON_BROWSER_CSS_COLOR_PATTERN = /^(?:#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|var\(\s*--[\w-]+(?:\s*,[^)]+)?\)|[a-z-]+\([^)]+\)|currentcolor|inherit|initial|unset|revert(?:-layer)?|transparent)$/i

  function getOptionalVuetifyTheme (): ThemeInstance | null {
    try {
      return useTheme()
    } catch {
      return null
    }
  }

  function resolveVuetifyToken (value: string, themeColors?: Record<string, string>): string | null {
    if (!VUETIFY_TOKEN_SHAPE.test(value)) return null

    const lower = value.toLowerCase()
    if (lower.startsWith('on-')) return null

    if (themeColors) {
      if (Object.prototype.hasOwnProperty.call(themeColors, value) && !value.startsWith('on-')) {
        return value
      }
      if (Object.prototype.hasOwnProperty.call(themeColors, lower)) {
        return lower
      }
    }

    if (DEFAULT_VUETIFY_THEME_TOKENS.has(lower)) {
      return lower
    }

    if (MATERIAL_PALETTE_TOKEN_PATTERN.test(lower)) {
      return lower
    }

    return null
  }

  function isValidCssColor (value: string): boolean {
    if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
      return CSS.supports('color', value)
    }

    return NON_BROWSER_CSS_COLOR_PATTERN.test(value)
  }

  function resolveColorBinding (rawColor: string | undefined, themeColors?: Record<string, string>): ResolvedColorBinding {
    const trimmed = rawColor?.trim()
    if (!trimmed) return {}

    const vuetifyToken = resolveVuetifyToken(trimmed, themeColors)
    if (vuetifyToken) {
      return { className: `text-${vuetifyToken}` }
    }

    if (isValidCssColor(trimmed)) {
      return { styleColor: trimmed }
    }

    return {}
  }

  function loadIconAsset (path: string, loader: () => Promise<string>): Promise<string> {
    const existingPending = pendingIconCache.get(path)
    if (existingPending) return existingPending

    const request = loader()
      .then(raw => {
        resolvedIconCache.set(path, raw)
        pendingIconCache.delete(path)
        return raw
      })
      .catch(error => {
        pendingIconCache.delete(path)
        throw error
      })

    pendingIconCache.set(path, request)
    return request
  }
</script>

<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      iconName: string
      size?: string | number
      color?: string
      preserveOriginalColors?: boolean
    }>(),
    {
      size: '24px',
      color: undefined,
      preserveOriginalColors: false,
    },
  )

  const svgContent = ref<string>('')
  const hasError = ref(false)

  const vuetifyTheme = getOptionalVuetifyTheme()

  const normalizedSize = computed(() => {
    if (typeof props.size === 'number') {
      return `${props.size}px`
    }
    const raw = props.size?.trim()
    if (!raw) return undefined
    return /^\d+(\.\d+)?$/.test(raw) ? `${raw}px` : raw
  })

  const resolvedColor = computed(() => {
    if (props.preserveOriginalColors) {
      return {}
    }
    return resolveColorBinding(props.color, vuetifyTheme?.current.value.colors)
  })

  const wrapperClasses = computed(() => [
    { 'dynamic-icon--monochrome': !props.preserveOriginalColors },
    resolvedColor.value.className,
  ])

  const wrapperStyle = computed(() => ({
    width: normalizedSize.value,
    height: normalizedSize.value,
    color: resolvedColor.value.styleColor,
  }))

  let currentRequestId = 0

  async function resolveIcon (name: string): Promise<void> {
    const requestId = ++currentRequestId
    const trimmedName = name?.trim() || ''
    hasError.value = false

    if (!trimmedName) {
      svgContent.value = ''
      hasError.value = true
      if (import.meta.env?.DEV) {
        console.warn('[DynamicIcon] Empty iconName provided.')
      }
      return
    }

    const path = availableIcons.get(trimmedName.toLowerCase())
    if (!path || !iconLoaders[path]) {
      svgContent.value = ''
      hasError.value = true
      if (import.meta.env?.DEV) {
        console.warn(`[DynamicIcon] Icon "${trimmedName}" is not available in src/assets/icons.`)
      }
      return
    }

    const cached = resolvedIconCache.get(path)
    if (cached !== undefined) {
      svgContent.value = cached
      return
    }

    svgContent.value = ''

    try {
      const resolved = await loadIconAsset(path, iconLoaders[path]!)
      if (requestId !== currentRequestId) return
      svgContent.value = resolved
    } catch (error) {
      if (requestId !== currentRequestId) return
      svgContent.value = ''
      hasError.value = true
      if (import.meta.env?.DEV) {
        console.error(`[DynamicIcon] Failed to lazy-load icon "${trimmedName}":`, error)
      }
    }
  }

  watch(
    () => props.iconName,
    newName => {
      void resolveIcon(newName)
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    currentRequestId++
  })
</script>

<template>
  <i
    aria-hidden="true"
    class="dynamic-icon d-inline-flex align-center justify-center"
    :class="wrapperClasses"
    :style="wrapperStyle"
    v-html="svgContent"
  />
</template>

<style lang="scss" scoped>
.dynamic-icon {
  flex-shrink: 0;
  line-height: 1;

  :deep(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }
}

.dynamic-icon--monochrome {
  // Apply currentColor fallback when root <svg> omits fill, while preserving hollow stroke roots and paint servers.
  :deep(svg:not([fill='none' i], [fill='transparent' i], [fill='context-fill' i], [fill='context-stroke' i], [fill^='url(' i])) {
    fill: currentColor;
  }

  :deep([fill]:not([fill='none' i], [fill='transparent' i], [fill='context-fill' i], [fill='context-stroke' i], [fill^='url(' i]):not(defs *, mask *, clipPath *, pattern *, symbol *)) {
    fill: currentColor;
  }

  :deep([stroke]:not([stroke='none' i], [stroke='transparent' i], [stroke='context-fill' i], [stroke='context-stroke' i], [stroke^='url(' i]):not(defs *, mask *, clipPath *, pattern *, symbol *)) {
    stroke: currentColor;
  }
}
</style>
