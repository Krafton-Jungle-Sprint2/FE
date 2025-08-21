<!-- /src/features/chat/components/WorkSpace.vue -->
<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div :class="[
            'w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold',
            workspace?.color || 'bg-blue-500',
          ]">
            {{ wsInitial }}
          </div>
          <div>
            <h1 class="text-xl font-semibold text-gray-900">{{ wsName }}</h1>
            <p class="text-sm text-gray-500">{{ memberCount }}명의 멤버</p>
            <p v-if="workspace?.createdAt" class="text-xs text-gray-400">
              생성일: {{ formatDate(workspace.createdAt) }}
            </p>
            <p v-if="ownerName" class="text-xs text-gray-400">소유자: {{ ownerName }}</p>
          </div>
        </div>

        <!-- 참여자 패널 토글 -->
        <div class="flex items-center space-x-2">
          <button @click="toggleParticipants" aria-label="참여자 패널 열기/닫기" :class="[
            'p-2 rounded-lg transition-colors',
            showParticipants
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
          ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
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
          <form class="flex items-center space-x-2" @submit.prevent="sendMessage">
            <input v-model.trim="newMessage" type="text" placeholder="메시지를 입력하세요..."
              class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <button type="submit"
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              전송
            </button>
          </form>
        </div>
      </div>

      <!-- Participants -->
      <div v-if="showParticipants" class="w-64 bg-white border-l border-gray-200 flex flex-col">
        <!-- 헤더 (초대 버튼) -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">참여자 ({{ memberCount }})</h3>
            <button @click="showInvite = true"
              class="inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="멤버 초대">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              초대
            </button>
          </div>
        </div>

        <!-- 목록 -->
        <div class="flex-1 overflow-y-auto p-4">
          <div class="space-y-3">
            <div v-for="p in participantsDisplay" :key="p.id"
              class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
              <div class="relative">
                <div
                  class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {{ String(p.name || '사용자').charAt(0) }}
                </div>
                <div :class="[
                  'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                  p.online ? 'bg-green-400' : 'bg-gray-300',
                ]" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ p.name || '사용자' }}
                  <span v-if="p.isOwner" class="ml-1 text-[11px] text-blue-600 font-medium">소유자</span>
                </p>
                <p class="text-xs text-gray-500">{{ p.role }}</p>
                <p v-if="p.accepted === false" class="text-[11px] text-amber-600">초대 대기</p>
              </div>
            </div>

            <div v-if="participantsLoading" class="text-xs text-gray-500">불러오는 중…</div>
            <div v-if="participantsError" class="text-xs text-red-600">{{ participantsError }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 초대 모달 -->
    <div v-if="showInvite" class="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true"
      aria-labelledby="invite-title">
      <div class="absolute inset-0 bg-black/40" @click="closeInvite"></div>

      <div class="relative bg-white w-full max-w-md rounded-xl shadow-xl p-5 mx-4">
        <div class="flex items-center justify-between mb-3">
          <h3 id="invite-title" class="text-base font-semibold text-gray-900">멤버 초대</h3>
          <button @click="closeInvite" class="p-2 rounded-lg hover:bg-gray-100" aria-label="닫기">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="submitInvite" class="space-y-3">
          <label class="block text-sm text-gray-600">사용자 ID</label>
          <input v-model.trim="inviteUserId" ref="inviteInputRef" type="text" placeholder="예: 사용자 ID 또는 이메일"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" @click="closeInvite" class="px-3 py-2 rounded-lg text-sm border">
              취소
            </button>
            <button type="submit" :disabled="inviting"
              class="px-3 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
              {{ inviting ? '초대 중…' : '초대 보내기' }}
            </button>
          </div>
        </form>

        <p v-if="inviteError" class="mt-2 text-xs text-red-600">{{ inviteError }}</p>
        <p v-if="inviteSuccess" class="mt-2 text-xs text-green-600">{{ inviteSuccess }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router' // 워크스페이스 ID 폴백용

const props = defineProps({
  workspace: { type: Object, default: null },
})

const API = import.meta.env.VITE_API_URL || '/api'

// 라우트 & WS ID 헬퍼
const route = useRoute()
function getWorkspaceId() {
  return (
    props.workspace?.id ??
    props.workspace?.workspaceId ??
    props.workspace?.wsId ??
    route.params.wsId ??
    route.params.id ??
    null
  )
}

const showParticipants = ref(false)
const newMessage = ref('')
const messages = ref([
  { id: 1, author: '김개발', content: '새로운 기능 개발이 완료되었습니다!', time: '오후 2:30' },
  { id: 2, author: '이디자인', content: 'UI 검토 부탁드립니다.', time: '오후 2:45' },
  { id: 3, author: '박기획', content: '내일 회의 일정 공유드립니다.', time: '오후 3:00' },
])

const participants = ref([])
const participantsLoading = ref(false)
const participantsError = ref('')

const wsName = computed(() => props.workspace?.name || '개발팀')
const wsInitial = computed(() => wsName.value.charAt(0)?.toUpperCase() || '개')
const channelName = computed(() => props.workspace?.name || '일반')

// accepted !== false만 카운트. participants 비었을 때만 폴백(_count.members + 1(owner))
const memberCount = computed(() => {
  if (participants.value.length > 0) {
    return participants.value.filter((p) => p.accepted !== false).length
  }
  const base = props.workspace?._count?.members ?? props.workspace?.memberCount ?? 0
  return base + 1
})

function formatDate(dateString) {
  if (!dateString) return ''
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

const ownerName = computed(() => {
  if (props.workspace?.owner?.nickname) return props.workspace.owner.nickname
  const oid = props.workspace?.ownerId
  if (!oid) return ''
  const hit = participants.value.find((p) => p.isOwner || String(p.userId) === String(oid))
  return hit?.name || ''
})

function authHeaders() {
  const access = localStorage.getItem('accessToken')
  return {
    'Content-Type': 'application/json',
    ...(access ? { Authorization: `Bearer ${access}` } : {}),
  }
}

function toggleParticipants() {
  showParticipants.value = !showParticipants.value
  if (showParticipants.value && participants.value.length === 0) fetchParticipants()
}

let abortCtrl = null
async function fetchParticipants() {
  if (!getWorkspaceId()) return
  if (abortCtrl) abortCtrl.abort()
  abortCtrl = new AbortController()
  participantsLoading.value = true
  participantsError.value = ''
  try {
    const res = await fetch(`${API}/workspaces/${getWorkspaceId()}/members`, {
      headers: authHeaders(),
      signal: abortCtrl.signal,
    })
    if (!res.ok) throw new Error(`멤버 조회 실패 (${res.status})`)
    const list = await res.json()

    const normalized = []
    for (const m of list) {
      const user = m.user || {}
      const isOwner =
        m.role === 'owner' || String(user.id || '') === String(props.workspace?.ownerId || '')

      normalized.push({
        id: m.id ?? `owner:${getWorkspaceId()}:${user.id}`,
        userId: user.id,
        name: user.nickname || user.email || '사용자',
        role: isOwner ? 'owner' : m.role || 'member',
        accepted: m.accepted ?? true,
        joinedAt: m.joinedAt ?? props.workspace?.createdAt ?? null,
        lastLogin: user.lastLogin ?? null,
        avatar: user.avatar ?? null,
        online: false,
        isOwner,
      })
    }

    const hasOwner = normalized.some((p) => p.isOwner)
    if (!hasOwner && (props.workspace?.ownerId || props.workspace?.owner?.id)) {
      const ownerUserId = props.workspace?.owner?.id ?? props.workspace?.ownerId
      normalized.unshift({
        id: `owner:${getWorkspaceId()}:${ownerUserId}`,
        userId: ownerUserId,
        name: props.workspace?.owner?.nickname || props.workspace?.owner?.email || '소유자',
        role: 'owner',
        accepted: true,
        joinedAt: props.workspace?.createdAt ?? null,
        lastLogin: props.workspace?.owner?.lastLogin ?? null,
        avatar: props.workspace?.owner?.avatar ?? null,
        online: false,
        isOwner: true,
      })
    }

    participants.value = normalized
  } catch (e) {
    if (e.name !== 'AbortError') {
      participantsError.value = e.message || '로드 실패'
      await fetchOwnerDetail()
    }
  } finally {
    participantsLoading.value = false
    abortCtrl = null
  }
}

const ownerFallback = ref(null)
async function fetchOwnerDetail() {
  try {
    if (!getWorkspaceId()) return
    const res = await fetch(`${API}/workspaces/${getWorkspaceId()}`, {
      headers: authHeaders(),
    })
    if (!res.ok) return
    const ws = await res.json()
    const ownerUserId = ws?.owner?.id ?? ws?.ownerId
    if (!ownerUserId) return
    ownerFallback.value = {
      id: `owner:${ws.id}:${ownerUserId}`,
      userId: ownerUserId,
      name: ws?.owner?.nickname || ws?.owner?.email || '소유자',
      role: 'owner',
      accepted: true,
      joinedAt: ws?.createdAt ?? null,
      lastLogin: ws?.owner?.lastLogin ?? null,
      avatar: ws?.owner?.avatar ?? null,
      online: false,
      isOwner: true,
    }
  } catch { }
}

const participantsDisplay = computed(() => {
  if (participants.value.length > 0) return participants.value
  if (ownerFallback.value) return [ownerFallback.value]
  const ws = props.workspace
  if (!ws) return []
  const ownerUserId = ws.owner?.id ?? ws.ownerId
  if (!ownerUserId) return []
  return [
    {
      id: `owner:${getWorkspaceId()}:${ownerUserId}`,
      userId: ownerUserId,
      name: ws.owner?.nickname || ws.owner?.email || '소유자',
      role: 'owner',
      accepted: true,
      joinedAt: ws.createdAt ?? null,
      lastLogin: ws.owner?.lastLogin ?? null,
      avatar: ws.owner?.avatar ?? null,
      online: false,
      isOwner: true,
    },
  ]
})

/* --------------------- 초대 모달 상태 & 액션 --------------------- */
const showInvite = ref(false)
const inviteUserId = ref('')
const inviting = ref(false)
const inviteError = ref('')
const inviteSuccess = ref('')
const inviteInputRef = ref(null)

function closeInvite() {
  showInvite.value = false
  inviteError.value = ''
}

watch(showInvite, async (v) => {
  if (v) {
    await nextTick()
    inviteInputRef.value?.focus()
  }
})

function onKeydown(e) {
  if (e.key === 'Escape' && showInvite.value) closeInvite()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

async function submitInvite() {
  inviteError.value = ''
  inviteSuccess.value = ''

  const wsId = getWorkspaceId() // ✅ 안전하게 WS ID 획득
  if (!wsId) {
    inviteError.value = '워크스페이스 ID를 찾을 수 없습니다.'
    return
  }

  const uid = inviteUserId.value
  if (!uid) {
    inviteError.value = '사용자 ID를 입력하세요.'
    return
  }

  inviting.value = true
  try {
    // ✅ 이메일/ID 분기
    const payload = uid.includes('@') ? { email: uid } : { user_id: uid }

    const res = await fetch(`${API}/workspaces/${wsId}/members`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      let msg = `초대 실패 (${res.status})`
      try {
        const j = await res.json()
        if (j?.error) msg = j.error
      } catch { }
      throw new Error(msg)
    }

    inviteSuccess.value = '초대를 전송했습니다.'
    inviteUserId.value = ''
    fetchParticipants?.()
    // setTimeout(() => { closeInvite() }, 800) // 자동닫기 원하면 사용
  } catch (e) {
    inviteError.value = e?.message || '초대에 실패했습니다.'
  } finally {
    inviting.value = false
  }
}
/* --------------------------------------------------------------- */

watch(
  () => props.workspace?.id,
  async () => {
    participants.value = []
    ownerFallback.value = null
    await fetchOwnerDetail()
    if (showParticipants.value) fetchParticipants()
  },
)

onMounted(async () => {
  await fetchOwnerDetail()
  if (getWorkspaceId()) fetchParticipants()
})

function sendMessage() {
  const txt = newMessage.value
  if (!txt) return
  messages.value.push({
    id: messages.value.length + 1,
    author: '나',
    content: txt,
    time: new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  })
  newMessage.value = ''
}
</script>