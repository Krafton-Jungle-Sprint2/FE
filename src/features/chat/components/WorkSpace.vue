<!-- /src/features/chat/components/WorkSpace.vue -->
<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div :class="['w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold',
            workspace?.color || 'bg-blue-500']">
            {{ (workspace?.name || '개발')[0]?.toUpperCase() }}
          </div>
          <div>
            <h1 class="text-xl font-semibold text-gray-900">{{ workspace?.name || '개발팀' }}</h1>
            <p class="text-sm text-gray-500">
              {{ memberCount }}명의 멤버
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button @click="toggleParticipants" :class="['p-2 rounded-lg transition-colors',
            showParticipants ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100']">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </button>
          <button class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="flex-1 flex">
      <!-- Chat Area -->
      <div class="flex-1 flex flex-col">
        <div class="border-b border-gray-200 bg-white p-4">
          <div class="flex items-center space-x-2">
            <span class="text-gray-400">#</span>
            <h2 class="font-semibold text-gray-900">{{ channelName }}</h2>
            <span class="text-sm text-gray-500">{{ memberCount }}명</span>
          </div>
        </div>

        <!-- Messages -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <div v-for="message in messages" :key="message.id" class="flex space-x-3">
            <div
              class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {{ message.author.charAt(0) }}
            </div>
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <span class="font-medium text-gray-900">{{ message.author }}</span>
                <span class="text-xs text-gray-500">{{ message.time }}</span>
              </div>
              <p class="text-gray-700">{{ message.content }}</p>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="border-t border-gray-200 bg-white p-4">
          <div class="flex items-center space-x-2">
            <input v-model="newMessage" @keyup.enter="sendMessage" type="text" placeholder="메시지를 입력하세요..."
              class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <button @click="sendMessage"
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              전송
            </button>
          </div>
        </div>
      </div>

      <!-- Participants -->
      <div v-if="showParticipants" class="w-64 bg-white border-l border-gray-200 flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <h3 class="text-sm font-semibold text-gray-900">참여자 ({{ memberCount }})</h3>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
          <div class="space-y-3">
            <div v-for="p in participants" :key="p.id"
              class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
              <div class="relative">
                <div
                  class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {{ p.name.charAt(0) }}
                </div>
                <div :class="['absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                  p.online ? 'bg-green-400' : 'bg-gray-300']"></div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ p.name }}</p>
                <p class="text-xs text-gray-500">{{ p.role }}</p>
              </div>
            </div>
            <div v-if="participantsLoading" class="text-xs text-gray-500">불러오는 중…</div>
            <div v-if="participantsError" class="text-xs text-red-600">{{ participantsError }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  workspace: { type: Object, default: null }
})

const API = import.meta.env.VITE_API_URL || '/api'

const showParticipants = ref(false)
const newMessage = ref('')
const messages = ref([
  { id: 1, author: '김개발', content: '새로운 기능 개발이 완료되었습니다!', time: '오후 2:30' },
  { id: 2, author: '이디자인', content: 'UI 검토 부탁드립니다.', time: '오후 2:45' },
  { id: 3, author: '박기획', content: '내일 회의 일정 공유드립니다.', time: '오후 3:00' }
])

const participants = ref([])
const participantsLoading = ref(false)
const participantsError = ref('')

const memberCount = computed(() => participants.value.length || props.workspace?.memberCount || 0)
const channelName = computed(() => props.workspace?.name || '일반')

function authHeaders() {
  const access = localStorage.getItem('accessToken')
  return { 'Content-Type': 'application/json', ...(access ? { Authorization: `Bearer ${access}` } : {}) }
}

function toggleParticipants() {
  showParticipants.value = !showParticipants.value
  if (showParticipants.value && participants.value.length === 0) fetchParticipants()
}

async function fetchParticipants() {
  if (!props.workspace?.id) return
  participantsLoading.value = true
  participantsError.value = ''
  try {
    const res = await fetch(`${API}/workspaces/${props.workspace.id}/members`, { headers: authHeaders() })
    if (!res.ok) throw new Error('멤버 조회 실패')
    const list = await res.json()
    // 예상 스키마: [{id, email, nickname, role, status}, ...]
    participants.value = list.map(m => ({
      id: m.id,
      name: m.nickname || m.email || '사용자',
      role: m.role || 'member',
      online: false
    }))
  } catch (e) {
    participantsError.value = e.message || '로드 실패'
  } finally {
    participantsLoading.value = false
  }
}

watch(() => props.workspace?.id, () => {
  participants.value = []
  if (showParticipants.value) fetchParticipants()
})

onMounted(() => {
  // 초기 자동 로드 선택 시:
  // fetchParticipants()
})

function sendMessage() {
  const txt = newMessage.value.trim()
  if (!txt) return
  messages.value.push({
    id: messages.value.length + 1,
    author: '나',
    content: txt,
    time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true })
  })
  newMessage.value = ''
}
</script>
