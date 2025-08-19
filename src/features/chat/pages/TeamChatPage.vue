<!-- /src/features/chat/pages/TeamChatPage.vue -->
<template>
  <div class="w-full h-full flex">
    <div class="flex-1 relative">
      <!-- 항상 WorkSpace 렌더. workspace가 없으면 기본 UI 표시(WorkSpace가 fallback 처리함). -->
      <WorkSpace :workspace="workspace" />

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
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WorkSpace from '@/features/chat/components/WorkSpace.vue'

const route = useRoute()
const router = useRouter()
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const workspace = ref(null)
const list = ref([])
const loading = ref(false)
const error = ref('')

function authHeaders() {
  const access = localStorage.getItem('accessToken')
  return { 'Content-Type': 'application/json', ...(access ? { Authorization: `Bearer ${access}` } : {}) }
}

async function loadList() {
  loading.value = true; error.value = ''
  try {
    const res = await fetch(API + '/workspaces', { headers: authHeaders() })
    if (res.status === 401) { router.push('/login'); return }
    if (!res.ok) throw new Error('워크스페이스 조회 실패')
    list.value = await res.json()
    selectByRoute()
  } catch (e) {
    error.value = e.message || '로드 실패'
  } finally {
    loading.value = false
  }
}

function selectByRoute() {
  const wsId = route.params.wsId || route.query.wsId
  if (!Array.isArray(list.value) || list.value.length === 0) { workspace.value = null; return }
  workspace.value = wsId
    ? list.value.find(w => String(w.id) === String(wsId)) || list.value[0]
    : list.value[0]
}

// 라우트가 바뀌면 선택만 변경(리스트는 캐시 유지)
watch(() => [route.params.wsId, route.query.wsId], () => selectByRoute())

onMounted(loadList)
</script>
