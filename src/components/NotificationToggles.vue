<!-- /src/components/NotificationToggles.vue -->
<template>
    <div class="bg-white border rounded-2xl p-4 max-w-lg">
        <h2 class="text-base font-semibold mb-3">알림 설정</h2>
        <div class="space-y-3">
            <ToggleRow label="이메일 알림" v-model="prefs.email" @change="save" />
            <ToggleRow label="채팅 새 메시지" v-model="prefs.chat" @change="save" />
            <ToggleRow label="Todo 마감 임박" v-model="prefs.todoDue" @change="save" />
        </div>
        <p v-if="saved" class="text-sm text-green-600 mt-3">저장됨</p>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'

const STORAGE_KEY = 'notif_prefs'
const prefs = reactive({ email: true, chat: true, todoDue: true })
const saved = ref(false)

function load() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) Object.assign(prefs, JSON.parse(raw))
    } catch { }
}
function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    saved.value = true
    setTimeout(() => (saved.value = false), 800)
}

onMounted(load)
</script>

<script>
export default {
    components: {
        ToggleRow: {
            props: { label: String, modelValue: Boolean },
            emits: ['update:modelValue', 'change'],
            template: `
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-800">{{ label }}</span>
          <button
            :class="['w-12 h-6 rounded-full relative transition-colors',
                     modelValue ? 'bg-blue-600' : 'bg-gray-300']"
            @click="$emit('update:modelValue', !modelValue); $emit('change')">
            <span
              :class="['absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                       modelValue ? 'translate-x-6' : 'translate-x-1']">
            </span>
          </button>
        </div>
      `
        }
    }
}
</script>
