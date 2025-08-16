<template>
  <div class="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-xl border">
    <!-- 기간 필터 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">기간</label>
      <div class="flex gap-2">
        <input v-model="start" type="date" class="border rounded px-2 py-1" />
        <span>~</span>
        <input v-model="end" type="date" class="border rounded px-2 py-1" />
      </div>
    </div>

    <!-- 중요도 필터 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">중요도</label>
      <select v-model="priority" class="border rounded px-2 py-1">
        <option value="">전체</option>
        <option value="high">높음</option>
        <option value="medium">보통</option>
        <option value="low">낮음</option>
      </select>
    </div>

    <!-- 카테고리 필터 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
      <select v-model="category" class="border rounded px-2 py-1">
        <option value="">전체</option>
        <option value="work">업무</option>
        <option value="personal">개인</option>
        <option value="etc">기타</option>
      </select>
    </div>

    <button
      @click="applyFilters"
      class="ml-auto bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
    >
      적용
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const start = ref('')
const end = ref('')
const priority = ref('')
const category = ref('')

const emit = defineEmits(['filter'])

const applyFilters = () => {
  emit('filter', { start: start.value, end: end.value, priority: priority.value, category: category.value })
}
</script>
