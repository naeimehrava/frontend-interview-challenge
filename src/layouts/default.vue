<template>
  <v-main>
    <v-container>
      <PreferencesBar />
      <router-view />
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
  import PreferencesBar from '@/components/PreferencesBar.vue'
</script>
