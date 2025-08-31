<!-- /src/features/chat/pages/TeamChatPage.vue -->
<template>
  <div class="w-full h-full flex">
    <div class="flex-1 relative">
      <!-- 항상 WorkSpace 렌더. workspace가 없으면 기본 UI 표시(WorkSpace가 fallback 처리함). -->
      <RoomWorkspace :workspace="selectedWorkspace || wsDetail" />

      <!-- 상태 배지 -->
      <div v-if="loading" class="absolute top-2 right-2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
        로딩 중…
      </div>
      <div v-else-if="error" class="absolute top-2 right-2 text-xs text-red-600 bg-white/80 px-2 py-1 rounded">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/shared/lib/api'
import RoomWorkspace from '../components/RoomWorkspace.vue'

const props = defineProps({ selectedWorkspace: { type: Object, default: null } })

const route = useRoute()
const wsDetail = ref(null)

// 라우트 파라미터 우선, 없으면 props 사용
const currentWsId = computed(() => route.params.wsId || props.selectedWorkspace?.id || null)

async function load () {
  const id = currentWsId.value
  if (!id) { wsDetail.value = null; return }
  try {
    const { data } = await api.get(`/workspaces/${id}`)
    wsDetail.value = data
  } catch {
    wsDetail.value = null
  }
}

// 둘 다 감시 + 즉시 실행
watch([() => route.params.wsId, () => props.selectedWorkspace?.id], load, { immediate: true })
</script>
