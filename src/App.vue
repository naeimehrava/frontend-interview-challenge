<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
  import { onBeforeUnmount, watch } from 'vue'
  import { useTheme } from 'vuetify'
  import { useUserPreferences } from '@/composables/useUserPreferences'

  const vuetifyTheme = useTheme()
  const { theme, fontScale } = useUserPreferences()

  watch(theme, nextTheme => {
    if (vuetifyTheme.global.name.value !== nextTheme) {
      vuetifyTheme.global.name.value = nextTheme
    }
    if (typeof document !== 'undefined') {
      document.documentElement.style.colorScheme = nextTheme
    }
  }, { immediate: true })

  watch(fontScale, scale => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = scale
    }
  }, { immediate: true })

  onBeforeUnmount(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = ''
      document.documentElement.style.colorScheme = ''
    }
  })
</script>
