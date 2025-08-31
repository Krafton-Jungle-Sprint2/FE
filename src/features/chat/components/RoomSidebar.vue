<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900">워크스페이스</h2>
      <button class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        @click="showCreate = true">
        + 생성
      </button>
    </div>

    <!-- Workspace List -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-2 space-y-2">
        <div v-if="error" class="text-xs text-red-600 px-2">{{ error }}</div>

        <template v-if="loading">
          <div v-for="i in 4" :key="i" class="h-14 bg-gray-100 rounded-lg animate-pulse" />
        </template>

        <template v-else>
          <div v-for="ws in workspaces" :key="ws.id" @click="selectWorkspace(ws)" :class="[
            'p-3 rounded-lg cursor-pointer transition-colors',
            selectedWorkspace?.id === ws.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
          ]">
            <div class="flex items-center space-x-3">
              <div :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold',
                ws.colorClass
              ]">
                {{ ws.name?.charAt(0)?.toUpperCase() || '?' }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-gray-900 truncate">{{ ws.name }}</h3>
                <div class="flex items-center mt-1">
                  <span class="text-xs text-gray-400">{{ ws.memberCount }}명</span>
                  <span v-if="ws.unreadCount > 0" class="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{{
                    ws.unreadCount }}</span>
                </div>
              </div>
            </div>
          </div>

          <p v-if="!workspaces.length" class="text-xs text-gray-500 px-2">
            워크스페이스가 없습니다. 우측 상단 <b>+ 생성</b> 버튼으로 만들어 보세요.
          </p>
        </template>
      </div>
    </div>

    <!-- Footer 버튼(선택): 상단 버튼이 있으니 필요 없으면 제거 -->
    <div class="p-4 border-t border-gray-200">
      <button @click="showCreate = true"
        class="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
        + 새 워크스페이스 추가
      </button>
    </div>

    <!-- Create Modal -->
    <CreateWorkspaceModal v-model:open="showCreate" @created="onCreated" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/shared/lib/api'
import CreateWorkspaceModal from './CreateWorkspaceModal.vue'
import { useRouter } from 'vue-router'

const workspaces = ref([])
const loading = ref(false)
const error = ref('')
const router = useRouter()

const selectedWorkspace = ref(null)
const showCreate = ref(false)

const emit = defineEmits(['workspace-selected'])

function colorById(id = '') {
  const palette = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500']
  const n = String(id).split('').reduce((a, c) => (a + c.charCodeAt(0)) % 997, 0)
  return palette[n % palette.length]
}

function normalize(ws) {
  return {
    id: ws.id,
    name: ws.name,
    memberCount: (ws._count?.members ?? 0) + 1, // owner 포함
    unreadCount: ws.unreadChatCount ?? 0,
    colorClass: ws.color ? ws.color : colorById(ws.id),
    raw: ws,
  }
}

async function fetchWorkspaces() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/workspaces')
    workspaces.value = (Array.isArray(data) ? data : []).map(normalize)
    if (!selectedWorkspace.value && workspaces.value.length) {
      selectWorkspace(workspaces.value[0])
    }
  } catch (e) {
    error.value = e?.response?.data?.error || e?.message || '목록을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

function selectWorkspace(ws) {
  selectedWorkspace.value = ws
  emit('workspace-selected', ws.raw ?? ws)
  router.push(`/chat/${ws.id}`)           // ✅ 상세로 이동
}

async function onCreated(newWs) {
  showCreate.value = false
  await fetchWorkspaces()
  router.push(`/chat/${newWs.id}`)        // ✅ 생성 직후 이동
}

onMounted(fetchWorkspaces)
</script>
