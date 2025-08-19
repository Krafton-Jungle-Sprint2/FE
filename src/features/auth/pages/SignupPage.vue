<!-- /src/features/auth/pages/SignUpPage.vue -->
<template>
  <div class="min-h-[70vh] flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow p-8">
      <h1 class="text-2xl font-bold mb-6 text-center">회원가입</h1>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="block text-sm font-medium mb-1">이메일</label>
          <input v-model="email" type="email" autocomplete="email" required :disabled="loading"
            class="w-full rounded-xl border px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">닉네임</label>
          <input v-model="nickname" type="text" required :disabled="loading"
            class="w-full rounded-xl border px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">비밀번호</label>
          <input v-model="password" type="password" autocomplete="new-password" required :disabled="loading"
            class="w-full rounded-xl border px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" />
        </div>

        <button :disabled="loading"
          class="w-full bg-gray-900 text-white rounded-xl py-2 hover:bg-gray-800 transition disabled:opacity-60">
          {{ loading ? '가입 중...' : '회원가입' }}
        </button>

        <p v-if="error" class="text-center text-sm text-red-600">{{ error }}</p>
        <p v-if="success" class="text-center text-sm text-green-600">가입 완료. 워크스페이스로 이동합니다.</p>
      </form>

      <p class="text-center text-sm text-gray-600 mt-4">
        이미 계정이 있으신가요?
        <router-link to="/login" class="text-blue-600 hover:underline">로그인</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const email = ref('')
const nickname = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

async function signupRequest(payload) {
  const res = await fetch(API + '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    let msg = '회원가입에 실패했습니다.'
    try {
      const j = await res.json()
      msg = j.error || j.message || msg
    } catch { }
    throw new Error(msg)
  }
  return res.json()
}

const onSubmit = async () => {
  error.value = ''
  success.value = false

  const emailVal = email.value.trim().toLowerCase()
  const nickVal = nickname.value.trim()
  const passVal = password.value

  if (!emailVal || !nickVal || !passVal) {
    error.value = '모든 필드를 입력해주세요.'
    return
  }
  if (passVal.length < 8) {
    error.value = '비밀번호는 8자 이상이어야 합니다.'
    return
  }

  loading.value = true
  try {
    const { user, accessToken, refreshToken } = await signupRequest({
      email: emailVal,
      password: passVal,
      nickname: nickVal
    })
    // 토큰 저장
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    // 성공 안내 후 이동
    success.value = true
    setTimeout(() => router.push('/workspaces'), 500)
  } catch (e) {
    error.value = e.message || '회원가입에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script>
