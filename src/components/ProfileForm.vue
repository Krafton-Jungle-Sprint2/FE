<!-- /src/components/ProfileForm.vue -->
<template>
    <form class="bg-white border rounded-2xl p-4 space-y-3 max-w-lg" @submit.prevent="onSubmit">
        <h2 class="text-base font-semibold">개인 정보 변경</h2>

        <div>
            <label class="block text-sm text-gray-600 mb-1">닉네임</label>
            <input v-model="nickname"
                class="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none" />
        </div>

        <div>
            <label class="block text-sm text-gray-600 mb-1">비밀번호 변경(선택)</label>
            <input v-model="password" type="password" autocomplete="new-password"
                class="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none" />
        </div>

        <div class="flex items-center gap-2">
            <button :disabled="loading" class="px-4 py-2 rounded-xl bg-gray-900 text-white disabled:opacity-60">
                {{ loading ? '저장 중' : '저장' }}
            </button>
            <span v-if="msg" class="text-sm" :class="ok ? 'text-green-600' : 'text-red-600'">{{ msg }}</span>
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const nickname = ref('')
const password = ref('')
const loading = ref(false)
const msg = ref('')
const ok = ref(false)

function authHeaders(json = true) {
    const access = localStorage.getItem('accessToken')
    const base = json ? { 'Content-Type': 'application/json' } : {}
    return { ...base, ...(access ? { Authorization: `Bearer ${access}` } : {}) }
}

async function loadMe() {
    const res = await fetch(API + '/users/me', { headers: authHeaders(false) })
    if (res.ok) {
        const u = await res.json()
        nickname.value = u?.nickname || ''
    }
}

async function onSubmit() {
    msg.value = ''; ok.value = false
    loading.value = true
    try {
        const body = {}
        if (nickname.value) body.nickname = nickname.value
        if (password.value) body.password = password.value
        const res = await fetch(API + '/users/me', { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body) })
        if (!res.ok) throw new Error('업데이트 실패')
        await res.json()
        ok.value = true
        msg.value = '저장됨'
        password.value = ''
    } catch (e) {
        ok.value = false
        msg.value = e.message || '실패'
    } finally {
        loading.value = false
    }
}

onMounted(loadMe)
</script>
