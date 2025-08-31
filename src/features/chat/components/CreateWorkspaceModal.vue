<!-- /src/features/chat/components/CreateWorkspaceModal.vue -->
<template>
  <teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/30" @click="close"></div>

      <div class="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-5">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold">워크스페이스 생성</h3>
          <button class="text-gray-400 hover:text-gray-600" @click="close">✕</button>
        </div>

        <div class="space-y-3">
          <label class="block">
            <span class="text-sm text-gray-600">이름 *</span>
            <input v-model.trim="name" class="mt-1 w-full border rounded-lg px-3 py-2" placeholder="예) 개발팀"/>
          </label>

          <label class="block">
            <span class="text-sm text-gray-600">설명</span>
            <textarea v-model.trim="description" rows="3" class="mt-1 w-full border rounded-lg px-3 py-2"
                      placeholder="선택 입력"></textarea>
          </label>

          <details class="mt-2">
            <summary class="text-sm text-gray-700 cursor-pointer">초대할 이메일(쉼표로 구분, 선택)</summary>
            <input v-model.trim="inviteEmails" class="mt-2 w-full border rounded-lg px-3 py-2"
                   placeholder="a@x.com, b@y.com"/>
          </details>

          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        </div>

        <div class="mt-5 flex justify-end gap-2">
          <button class="px-3 py-1.5 rounded-lg border" @click="close" :disabled="loading">취소</button>
          <button class="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  @click="create" :disabled="loading || !name">
            {{ loading ? '생성 중...' : '생성' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '@/shared/lib/api'

// v-model:open 지원
const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['update:open','created'])

const name = ref('')
const description = ref('')
const inviteEmails = ref('')
const loading = ref(false)
const error = ref('')

// 열릴 때 입력 초기화
watch(() => props.open, v => {
  if (v) { name.value=''; description.value=''; inviteEmails.value=''; error.value='' }
})

function close(){ emit('update:open', false) }

async function create(){
  if (!name.value) { error.value = '이름은 필수입니다.'; return }
  loading.value = true; error.value=''
  try {
    // 1) 워크스페이스 생성
    const { data: ws } = await api.post('/workspaces', {
      name: name.value,
      description: description.value || undefined,
    }) // 백엔드 POST /workspaces

    // 2) 이메일 초대 (선택)
    const emails = inviteEmails.value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    for (const email of emails) {
      try {
        await api.post(`/workspaces/${ws.id}/members/invite-by-email`, { email })
      } catch (e) {
        // 초대 실패는 전체 흐름 막지 않음
        console.warn('invite failed:', email, e?.response?.data || e?.message)
      }
    }

    emit('created', ws)
    close()
  } catch (e) {
    error.value = e?.response?.data?.error || e?.message || '생성 실패'
  } finally {
    loading.value = false
  }
}
</script>
