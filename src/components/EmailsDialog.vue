<template>
  <v-dialog
    v-model="modelValue"
    max-width="600"
  >
    <v-card class="pa-8">
      <div class="d-flex justify-space-between align-center mb-8">
        <h3>Email</h3>
        <v-btn
          aria-label="Close user emails dialog"
          icon
          size="small"
          variant="text"
          @click="modelValue = false"
        >
          <DynamicIcon icon-name="close" size="24px" />
        </v-btn>
      </div>
      <template v-if="props.users.length > 0">
        <p v-for="user in props.users" :key="user.id" class="mb-1 text-break">
          {{ user.email }}
        </p>
      </template>
      <p v-else class="text-medium-emphasis text-center py-4">
        No user emails available.
      </p>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import type { User } from '@/types/user'

  const modelValue = defineModel<boolean>({ default: false })

  const props = withDefaults(defineProps<{
    users?: User[]
  }>(), {
    users: () => [],
  })
</script>

<style scoped>
h3 {
  font-size: 2rem;
}
</style>
