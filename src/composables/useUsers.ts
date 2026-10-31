import type { User } from '@/types/user'
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

export const USERS_API_URL = 'https://jsonplaceholder.typicode.com/users'

export interface UseUsersOptions {
  immediate?: boolean
  apiUrl?: string
}

export function isUser (value: unknown): value is User {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const candidate = value as Record<string, unknown>
  return typeof candidate.id === 'number'
    && typeof candidate.name === 'string'
    && typeof candidate.email === 'string'
}

export function useUsers (options: UseUsersOptions = {}) {
  const { immediate = true, apiUrl = USERS_API_URL } = options

  const users = shallowRef<User[]>([])
  const usersCount = computed(() => users.value.length)
  const isFetching = ref<boolean>(false)
  const fetchError = ref<string | null>(null)

  let latestFetchId = 0
  let activeAbortController: AbortController | null = null

  async function fetchUsers (): Promise<void> {
    const fetchId = ++latestFetchId
    activeAbortController?.abort()
    const controller = new AbortController()
    activeAbortController = controller

    isFetching.value = true
    fetchError.value = null

    try {
      const response = await fetch(apiUrl, {
        signal: controller.signal,
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch (${response.status})`)
      }
      const data: unknown = await response.json()
      if (fetchId !== latestFetchId) {
        return
      }
      users.value = Array.isArray(data)
        ? data.filter((item): item is User => isUser(item))
        : []
    } catch (error) {
      if (controller.signal.aborted || fetchId !== latestFetchId) {
        return
      }
      fetchError.value = error instanceof Error ? error.message : 'Failed to fetch'
      console.error('[useUsers] Fetch error:', error)
    } finally {
      if (fetchId === latestFetchId) {
        isFetching.value = false
        activeAbortController = null
      }
    }
  }

  if (getCurrentInstance()) {
    if (immediate) {
      onMounted(() => {
        void fetchUsers()
      })
    }

    onBeforeUnmount(() => {
      latestFetchId++
      activeAbortController?.abort()
    })
  } else if (immediate) {
    void fetchUsers()
  }

  return {
    users,
    usersCount,
    isFetching,
    fetchError,
    fetchUsers,
  }
}
