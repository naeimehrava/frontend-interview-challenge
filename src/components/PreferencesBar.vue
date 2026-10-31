<template>
  <v-card
    aria-label="User preferences"
    class="pa-4 mb-6"
    tag="section"
    variant="flat"
  >
    <div class="d-flex flex-wrap justify-space-between align-center ga-4">
      <div class="d-flex align-center flex-wrap ga-2">
        <span id="theme-pref-label" class="text-subtitle-2 font-weight-medium me-1">Theme:</span>
        <v-btn-toggle
          v-model="theme"
          aria-labelledby="theme-pref-label"
          color="primary"
          density="compact"
          mandatory
          variant="outlined"
        >
          <v-btn
            aria-label="Light theme"
            prepend-icon="mdi-weather-sunny"
            value="light"
          >
            Light
          </v-btn>
          <v-btn
            aria-label="Dark theme"
            prepend-icon="mdi-weather-night"
            value="dark"
          >
            Dark
          </v-btn>
        </v-btn-toggle>
      </div>

      <div class="d-flex align-center flex-wrap ga-2">
        <span id="font-size-pref-label" class="text-subtitle-2 font-weight-medium me-1">Font Size:</span>
        <v-btn-toggle
          v-model="fontSize"
          aria-labelledby="font-size-pref-label"
          color="primary"
          density="compact"
          mandatory
          variant="outlined"
        >
          <v-btn
            aria-label="Small font size (87.5%)"
            value="small"
          >
            Small
          </v-btn>
          <v-btn
            aria-label="Medium font size (100%)"
            value="medium"
          >
            Medium
          </v-btn>
          <v-btn
            aria-label="Large font size (112.5%)"
            value="large"
          >
            Large
          </v-btn>
        </v-btn-toggle>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
  import { useUserPreferences } from '@/composables/useUserPreferences'

  const { theme, fontSize } = useUserPreferences()
</script>
