<template>
    <div class="min-h-[70vh] flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-white rounded-2xl shadow p-8">
            <h1 class="text-2xl font-bold mb-6 text-center">로그인</h1>

            <form class="space-y-4" @submit.prevent="onSubmit">
                <div>
                    <label class="block text-sm font-medium mb-1">이메일</label>
                    <input v-model="email" type="email" autocomplete="email"
                        class="w-full rounded-xl border px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                </div>

                <div>
                    <label class="block text-sm font-medium mb-1">비밀번호</label>
                    <input v-model="password" type="password" autocomplete="current-password"
                        class="w-full rounded-xl border px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" />
                </div>

                <button :disabled="loading"
                    class="w-full bg-blue-600 text-white rounded-xl py-2 hover:bg-blue-700 transition disabled:opacity-60">
                    {{ loading ? '로그인 중...' : '로그인' }}
                </button>

                <p v-if="error" class="text-center text-sm text-red-600">{{ error }}</p>
            </form>

            
            <p class="text-center text-sm text-gray-600 mt-4">
                계정이 없으신가요?
                <router-link to="/signup" class="text-blue-600 hover:underline">회원가입</router-link>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// import { api } from '@/shared/lib/api'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const onSubmit = async () => {
    error.value = ''
    if (!email.value || !password.value) {
        error.value = '이메일과 비밀번호를 입력해주세요.'
        return
    }
    loading.value = true
    try {
        const res = await api.post('/auth/login', { email: email.value, password: password.value })
        localStorage.setItem('accessToken', res.accessToken)
        localStorage.setItem('user', JSON.stringify(res.user))
        router.push('/todos')
    } catch (e) {
        error.value = e.message || '로그인에 실패했습니다.'
    } finally {
        loading.value = false
    }
}
</script>
