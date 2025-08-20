<template>
  <div class="mb-4">
    <!-- 접힌 카드 -->
    <div v-if="!open" @click="openBox"
      class="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
      <span class="text-gray-400 text-lg">+</span>
      <span class="text-gray-500 text-sm">새 과제</span>
      <div class="ml-auto flex items-center">
        <span class="w-4 h-4 bg-red-500 rounded text-white text-xs flex items-center justify-center">📅</span>
        <span class="text-gray-400 text-xs ml-1">▼</span>
      </div>
    </div>

    <!-- 펼친 입력창 -->
    <div v-else class="flex items-center gap-2 px-3 py-2 border-2 border-blue-500 rounded-md">
      <span class="text-blue-500 text-lg">+</span>
      <input ref="taskInput" v-model="title" @keyup.enter="submit" @keyup.esc="cancel" placeholder="할일 제목을 입력하세요"
        class="flex-1 outline-none text-sm" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'add'])

const title = ref('')
const taskInput = ref(null)

watch(
  () => props.open,
  async (val) => {
    if (val) {
      await nextTick()
      taskInput.value?.focus()
    }
  }
)

const openBox = () => emit('update:open', true)

const submit = () => {
  const t = title.value.trim()
  if (!t) return
  emit('add', t)
  title.value = ''
  emit('update:open', false)
}

const cancel = () => {
  title.value = ''
  emit('update:open', false)
}
</script>