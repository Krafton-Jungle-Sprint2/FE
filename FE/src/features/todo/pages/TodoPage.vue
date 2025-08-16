<template>
  <div class="h-full w-95 mx-auto bg-white rounded-lg shadow-lg p-4">
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-lg font-semibold text-gray-800">기한 초과</h1>
      <button
        @click="isAddingTask = !isAddingTask"
        class="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
      >
        <span class="text-lg">+</span>
      </button>
    </div>

    <!-- 새 과제 추가 (v-model:open) -->
    <AddTaskBox v-model:open="isAddingTask" @add="addTask" />

    <!-- 할일 개수 -->
    <div class="text-xs text-gray-500 mb-3">
      할일 {{ tasks.length }}
    </div>

    <!-- 할일 목록 -->
    <TaskList :tasks="tasks" @toggle="toggleTask" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AddTaskBox from '../components/AddTaskBox.vue'
import TaskList from '../components/TaskList.vue'

const isAddingTask = ref(false)

const tasks = ref([
  { id: 1, title: '주택청약 저축', status: '8월 2일', completed: false },
  { id: 2, title: '과제', status: '어제', completed: false },
  { id: 3, title: '중요', status: '어제', completed: false }
])

const addTask = (title) => {
  tasks.value.push({
    id: Date.now(),
    title,
    status: '오늘',
    completed: false
  })
}

const toggleTask = (id, completed) => {
  const t = tasks.value.find((x) => x.id === id)
  if (t) t.completed = completed
}
</script>
