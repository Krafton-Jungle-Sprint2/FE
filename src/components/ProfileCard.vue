<!-- /src/components/ProfileCard.vue -->
<template>
    <div class="bg-white border rounded-2xl p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
            {{ initial }}
        </div>
        <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-500">프로필</p>
            <p class="text-lg font-semibold truncate">{{ displayName }}</p>
            <p class="text-sm text-gray-600 truncate">{{ me?.email }}</p>
        </div>
        <button class="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50" @click="reload" :disabled="loading">
            {{ loading ? '새로고침 중' : '새로고침' }}
        </button>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const me = ref(null)
const loading = ref(false)

function authHeaders() {
    const access = localStorage.getItem('accessToken')
    return { ...(access ? { Authorization: `Bearer ${access}` } : {}) }
}

async function reload() {
    loading.value = true
    try {
        const res = await fetch(API + '/users/me', { headers: authHeaders() })
        if (res.ok) me.value = await res.json()
        else me.value = null
    } finally {
        loading.value = false
    }
}

const displayName = computed(() => me.value?.nickname || me.value?.email || '알 수 없음')
const initial = computed(() => (displayName.value?.trim()?.charAt(0) || '?').toUpperCase())

reload()
</script>
