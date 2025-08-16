<template>
  <!-- 비동기 로딩 중 안전장치 -->
  <div v-if="todo" class="bg-white border rounded-xl shadow p-4 hover:shadow-md transition">
    <h3 class="font-semibold text-lg">{{ todo.title }}</h3>
    <p class="text-sm text-gray-600 line-clamp-2">{{ todo.description }}</p>

    <div class="flex justify-between items-center mt-3 text-sm text-gray-500">
      <span>📅 {{ todo.date_start }} ~ {{ todo.date_end }}</span>
      <span :class="statusClass">{{ todo.status }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  todo: {
    type: Object,
    required: true,
  },
})

const statusClass = computed(() => {
  const s = props.todo?.status ?? 'not_started'
  switch (s) {
    case 'not_started': return 'text-gray-500'
    case 'in_progress': return 'text-blue-500'
    case 'done': return 'text-green-600'
    case 'blocked': return 'text-red-500'
    default: return 'text-gray-400'
  }
})
</script>
