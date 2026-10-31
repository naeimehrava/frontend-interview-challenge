<template>
  <i class="dynamic-icon d-inline-flex align-center justify-center">
    <InlineSvg
      v-if="icon"
      :height="props.size"
      :src="icon"
      :width="props.size"
    />
  </i>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import InlineSvg from 'vue-inline-svg'
  import close from '@/assets/icons/close.svg'
  import refresh from '@/assets/icons/refresh.svg'
  import users from '@/assets/icons/users.svg'

  const props = withDefaults(
    defineProps<{
      iconName: string
      size?: string
    }>(),
    {
      size: '24px',
    },
  )

  const icons: Record<string, string> = {
    close,
    refresh,
    users,
  }

  const icon = computed(() => icons[props.iconName])
</script>

<style lang="scss" scoped>
.dynamic-icon {
  flex-shrink: 0;
  line-height: 1;
}
</style>
