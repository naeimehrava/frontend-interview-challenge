<template>
  <v-card class="mb-12" flat tag="section">
    <v-card-title class="d-flex flex-wrap justify-space-between align-center ga-3 text-wrap">
      <span>List of All users ({{ usersCount }})</span>
      <div class="d-flex flex-wrap ga-2">
        <v-btn
          color="primary"
          :disabled="isFetching || usersCount === 0"
          variant="outlined"
          @click="areEmailsVisible = true"
        >
          <DynamicIcon icon-name="users" size="24px" />
          <span class="ms-2">User Emails</span>
        </v-btn>
        <v-btn
          color="primary"
          :disabled="isFetching"
          :loading="isFetching"
          @click="fetchUsers"
        >
          <DynamicIcon icon-name="refresh" size="24px" />
          <span class="ms-2">Refresh Users</span>
        </v-btn>
      </div>
    </v-card-title>

    <v-alert
      v-if="fetchError && !isFetching"
      class="mx-4 mb-4"
      density="compact"
      type="error"
      variant="tonal"
    >
      {{ fetchError }}
    </v-alert>

    <div v-if="isFetching && users.length === 0" aria-busy="true" aria-label="Loading users">
      <v-skeleton-loader v-for="i in 10" :key="i" type="list-item" />
    </div>
    <v-list v-else-if="users.length > 0" aria-label="Users list">
      <v-list-item v-for="(user, userIndex) in users" :key="user.id">
        {{ userIndex + 1 }}. {{ user.name }}
      </v-list-item>
    </v-list>
    <v-card-text v-else-if="!fetchError" class="text-center text-medium-emphasis py-6">
      No users found.
    </v-card-text>
  </v-card>

  <PricingSection />
  <EmailsDialog v-model="areEmailsVisible" :users="users" />
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import EmailsDialog from '@/components/EmailsDialog.vue'
  import PricingSection from '@/components/PricingSection.vue'
  import { useUsers } from '@/composables/useUsers'

  const areEmailsVisible = ref(false)
  const { users, usersCount, isFetching, fetchError, fetchUsers } = useUsers()
</script>
