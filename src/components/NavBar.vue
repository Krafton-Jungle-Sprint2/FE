<!-- /src/components/NavBar.vue -->
<template>
  <!-- header를 fixed position으로 변경 -->
  <header class="top-0 left-0 right-0 h-14 bg-emerald-600 border-b z-50">
    <div class="h-full max-w-full container px-4 flex items-center justify-between">
      <div class="flex items-center gap-1">
        <!-- 모바일: 사이드바 토글 -->
        <button class="md:hidden p-2 rounded hover:bg-gray-100" @click="$emit('toggle-sidebar')"
          aria-label="Toggle sidebar">
          <svg viewBox="0 0 24 24" class="w-6 h-6" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <RouterLink to="/" class="font-bold text-white">Codea</RouterLink>
      </div>

      <div class="flex items-center gap-3 relative">
        <!-- 비로그인 -->
        <RouterLink v-if="!me" to="/login" class="text-sm text-white font-bold hover:underline">로그인</RouterLink>

        <!-- 로그인: 아바타 -->
        <button v-else ref="avatarBtn" @click="toggleMenu"
          class="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center select-none">
          <span class="text-sm font-semibold text-gray-700">{{ avatarInitial }}</span>
        </button>

        <!-- 드롭다운 -->
        <div v-if="menuOpen" ref="menuEl"
          class="absolute right-0 top-12 w-52 bg-white border rounded-xl shadow-md py-1">
          <div class="px-3 py-2 text-xs text-gray-500 border-b">
            {{ me.nickname || me.email }}
          </div>
          <button class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm" @click="openProfile">개인 정보 변경</button>
          <button class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm" @click="openFriends">친구 목록 보기</button>
          <button class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm" @click="openAddFriend">친구 추가</button>
          <button class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-red-600" @click="logout">로그아웃</button>
        </div>
      </div>
    </div>

    <!-- 프로필 수정 모달 -->
    <div v-if="profileOpen" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
      <div class="w-full max-w-md bg-white rounded-2xl p-6 shadow">
        <h2 class="text-lg font-semibold mb-4">개인 정보 변경</h2>
        <form class="space-y-3" @submit.prevent="submitProfile">
          <div>
            <label class="block text-sm mb-1">닉네임</label>
            <input v-model="form.nickname" class="w-full border rounded-xl px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm mb-1">비밀번호 변경(선택)</label>
            <input v-model="form.password" type="password" class="w-full border rounded-xl px-3 py-2"
              placeholder="변경 시 입력" />
          </div>
          <div class="flex gap-2 justify-end pt-2">
            <button type="button" @click="profileOpen = false" class="px-3 py-2 rounded-xl border">취소</button>
            <button type="submit" :disabled="saving"
              class="px-3 py-2 rounded-xl bg-gray-900 text-white disabled:opacity-60">
              {{ saving ? '저장 중...' : '저장' }}
            </button>
          </div>
          <p v-if="errMsg" class="text-sm text-red-600 mt-1">{{ errMsg }}</p>
        </form>
      </div>
    </div>

    <!-- 친구 목록 모달 -->
    <div v-if="friendsOpen" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
      <div class="w-full max-w-lg bg-white rounded-2xl p-6 shadow">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">친구 목록</h2>
          <button @click="friendsOpen = false" class="p-2 rounded hover:bg-gray-100">닫기</button>
        </div>
        <div v-if="friendsLoading" class="text-sm text-gray-500">불러오는 중…</div>
        <ul v-else class="space-y-2 max-h-80 overflow-auto">
          <li v-for="f in friends" :key="f.id" class="flex items-center justify-between border rounded-xl px-3 py-2">
            <div>
              <div class="text-sm font-medium">{{ f.nickname || f.email }}</div>
              <div class="text-xs text-gray-500">{{ f.status }}</div>
            </div>
            <button v-if="f.status === 'pending'" @click="acceptFriend(f.id)"
              class="text-sm px-2 py-1 rounded bg-blue-600 text-white">수락</button>
          </li>
        </ul>
        <p v-if="errMsg" class="text-sm text-red-600 mt-2">{{ errMsg }}</p>
      </div>
    </div>

    <!-- 친구 추가 모달 -->
    <div v-if="addFriendOpen" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
      <div class="w-full max-w-md bg-white rounded-2xl p-6 shadow">
        <h2 class="text-lg font-semibold mb-4">친구 추가</h2>
        <form class="space-y-3" @submit.prevent="submitAddFriend">
          <div>
            <label class="block text-sm mb-1">상대 사용자 ID</label>
            <input v-model="addFriendUserId" class="w-full border rounded-xl px-3 py-2" placeholder="user_id" />
          </div>
          <div class="flex gap-2 justify-end pt-2">
            <button type="button" @click="addFriendOpen = false" class="px-3 py-2 rounded-xl border">취소</button>
            <button type="submit" :disabled="saving"
              class="px-3 py-2 rounded-xl bg-gray-900 text-white disabled:opacity-60">
              {{ saving ? '추가 중...' : '추가' }}
            </button>
          </div>
          <p v-if="errMsg" class="text-sm text-red-600 mt-1">{{ errMsg }}</p>
        </form>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const me = ref(null)
const menuOpen = ref(false)
const profileOpen = ref(false)
const friendsOpen = ref(false)
const addFriendOpen = ref(false)
const saving = ref(false)
const errMsg = ref('')

const form = ref({ nickname: '', password: '' })
const friends = ref([])
const friendsLoading = ref(false)
const addFriendUserId = ref('')

const avatarBtn = ref(null)
const menuEl = ref(null)

const avatarInitial = computed(() => {
  const n = me.value?.nickname || me.value?.email || ''
  return n.trim().charAt(0)?.toUpperCase() || '?'
})

function authHeaders() {
  const access = localStorage.getItem('accessToken')
  return { 'Content-Type': 'application/json', ...(access ? { Authorization: `Bearer ${access}` } : {}) }
}

async function fetchMe() {
  try {
    const res = await fetch(API + '/users/me', { headers: authHeaders() })
    if (!res.ok) return
    me.value = await res.json()
  } catch { }
}

function toggleMenu() { menuOpen.value = !menuOpen.value }

function openProfile() {
  menuOpen.value = false
  profileOpen.value = true
  errMsg.value = ''
  form.value.nickname = me.value?.nickname || ''
  form.value.password = ''
}

async function submitProfile() {
  errMsg.value = ''
  saving.value = true
  try {
    const body = {}
    if (form.value.nickname) body.nickname = form.value.nickname
    if (form.value.password) body.password = form.value.password
    const res = await fetch(API + '/users/me', {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error('프로필 업데이트 실패')
    me.value = await res.json()
    profileOpen.value = false
  } catch (e) {
    errMsg.value = e.message || '실패했습니다.'
  } finally {
    saving.value = false
  }
}

function openFriends() {
  menuOpen.value = false
  friendsOpen.value = true
  errMsg.value = ''
  loadFriends()
}
async function loadFriends() {
  friendsLoading.value = true
  try {
    // 전체 목록 조회(accepted + pending)
    const res = await fetch(API + '/friends', { headers: authHeaders() })
    if (!res.ok) throw new Error('친구 목록 조회 실패')
    friends.value = await res.json()
  } catch (e) {
    errMsg.value = e.message || '실패했습니다.'
  } finally {
    friendsLoading.value = false
  }
}

async function acceptFriend(friendId) {
  try {
    const res = await fetch(API + `/friends/${friendId}`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ relation: 'accepted' })
    })
    if (!res.ok) throw new Error('수락 실패')
    await loadFriends()
  } catch (e) { errMsg.value = e.message || '실패했습니다.' }
}

function openAddFriend() {
  menuOpen.value = false
  addFriendOpen.value = true
  errMsg.value = ''
  addFriendUserId.value = ''
}
async function submitAddFriend() {
  if (!addFriendUserId.value) { errMsg.value = '사용자 ID를 입력하세요.'; return }
  saving.value = true
  try {
    const res = await fetch(API + '/friends', {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ user_id: addFriendUserId.value })
    })
    if (!res.ok) throw new Error('친구 요청 실패')
    addFriendOpen.value = false
  } catch (e) { errMsg.value = e.message || '실패했습니다.' }
  finally { saving.value = false }
}

async function logout() {
  try { await fetch(API + '/auth/logout', { method: 'POST', headers: authHeaders() }) } catch { }
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  me.value = null
  menuOpen.value = false
  router.push('/login')
}

function onDocClick(e) {
  if (!menuOpen.value) return
  const a = avatarBtn.value, m = menuEl.value
  if (a && a.contains(e.target)) return
  if (m && m.contains(e.target)) return
  menuOpen.value = false
}

onMounted(() => {
  fetchMe()
  document.addEventListener('click', onDocClick)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
})
</script>