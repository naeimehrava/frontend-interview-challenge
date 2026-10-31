<template>
  <v-card flat tag="section">
    <div class="pa-4 pa-sm-6 pa-md-10">
      <h2 class="text-h4 font-weight-bold mb-6">Pricing</h2>
      <v-row align="stretch">
        <v-col
          v-for="plan in PRICING_PLANS"
          :key="plan.id"
          cols="12"
          md="4"
          sm="6"
        >
          <v-card
            class="d-flex flex-column h-100 pa-6"
            :color="plan.featured ? 'primary' : undefined"
            variant="outlined"
          >
            <div class="d-flex justify-space-between align-center mb-2">
              <h3 class="text-h5 font-weight-bold">{{ plan.name }}</h3>
              <v-chip
                v-if="plan.featured"
                color="primary"
                size="small"
                variant="tonal"
              >
                Popular
              </v-chip>
            </div>
            <div class="text-h4 font-weight-bold my-4">
              {{ plan.price }}<span class="text-subtitle-1 text-medium-emphasis">{{ plan.period }}</span>
            </div>
            <p class="text-body-1 text-medium-emphasis mb-6">
              {{ plan.description }}
            </p>
            <v-btn
              :aria-label="`Get started with ${plan.name} plan`"
              class="mt-auto"
              :color="plan.featured ? 'primary' : undefined"
              :variant="plan.featured ? 'flat' : 'outlined'"
            >
              Get Started
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
  import { PRICING_PLANS } from '@/constants/pricing'
</script>
