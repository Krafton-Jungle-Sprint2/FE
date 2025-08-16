<script setup>
import { document } from "postcss"
import { ref } from "vue"

const email = ref("")
const password = ref("")

const handleLogin = () => {
    console.log("로그인 시도:", email.value, password.value)
    // 👉 여기서 API 호출 로직 추가 가능
}
</script>

<template>
    <document>Login</document>
    <div class="bg-blue-500 h-screen w-full flex items-center justify-center">
        <div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">로그인</h2>
            <form @submit.prevent="handleLogin" class="space-y-4">
                <!-- 이메일 -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                    <input v-model="email" type="email" placeholder="you@example.com"
                        class="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                </div>

                <!-- 비밀번호 -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                    <input v-model="password" type="password" placeholder="********"
                        class="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                </div>

                <!-- 버튼 -->
                <button type="submit"
                    class="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition">
                    로그인
                </button>
            </form>

            <!-- 회원가입 / 비밀번호 찾기 -->
            <p class="text-sm text-gray-600 text-center mt-4">
                아직 계정이 없으신가요?
                <a href="/signup" class="text-blue-500 hover:underline">회원가입</a>
            </p>
        </div>
    </div>
</template>

<style scoped></style>
