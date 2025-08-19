<!-- /src/features/todos/pages/TodoPage.vue -->
<template>
  <div class="h-full w-95 bg-white rounded-lg shadow-lg p-4">
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-lg font-semibold text-gray-800">할 일</h1>
      <button @click="isAddingTask = !isAddingTask"
        class="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
        <span class="text-lg">+</span>
      </button>
    </div>

    <!-- 새 과제 추가 -->
    <AddTaskBox v-model:open="isAddingTask" @add="addTask" />

    <!-- 상태 -->
    <div class="text-xs text-gray-500 mb-3">
      할 일 {{ rawTodos.length }}
      <span v-if="loading" class="ml-2 text-gray-400">로딩 중…</span>
      <span v-if="error" class="ml-2 text-red-600">{{ error }}</span>
    </div>

    <!-- 목록: 원본을 그대로 넘김 → TaskList가 '기한 지남/오늘/내일 이후' 3칸으로 분류 -->
    <TaskList :tasks="rawTodos" @toggle="toggleTask" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AddTaskBox from '../components/AddTaskBox.vue'
import TaskList from '../components/TaskList.vue'
import dayjs from '@/shared/lib/dayjs.js'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const isAddingTask = ref(false)
const loading = ref(false)
const error = ref('')
const rawTodos = ref([]) // 서버 스키마 그대로

function authHeaders(json = true) {
  const access = localStorage.getItem('accessToken')
  const base = json ? { 'Content-Type': 'application/json' } : {}
  return { ...base, ...(access ? { Authorization: `Bearer ${access}` } : {}) }
}

async function loadTodos() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(API + '/me/todos', { headers: authHeaders(false) })
    if (!res.ok) throw new Error('할 일 조회 실패')
    rawTodos.value = await res.json()
  } catch (e) {
    error.value = e.message || '로드 실패'
  } finally {
    loading.value = false
  }
}

async function addTask(title) {
  if (!title?.trim()) return
  try {
    const body = {
      title: title.trim(),
      status: 'NOT_STARTED',
      startDate: dayjs().format('YYYY-MM-DD'),
      dueDate: dayjs().format('YYYY-MM-DD') // 기본 오늘 마감
    }
    const res = await fetch(API + '/me/todos', {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error('추가 실패')
    const created = await res.json()
    rawTodos.value = [created, ...rawTodos.value]
    isAddingTask.value = false
  } catch (e) {
    error.value = e.message || '추가 실패'
  }
}

async function toggleTask(id, completed) {
  try {
    const todo = rawTodos.value.find(t => t.id === id)
    if (!todo) return
    const nextStatus = completed ? 'DONE' : 'NOT_STARTED'
    const res = await fetch(API + `/me/todos/${id}`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status: nextStatus })
    })
    if (!res.ok) throw new Error('상태 변경 실패')
    const updated = await res.json()
    rawTodos.value = rawTodos.value.map(t => (t.id === id ? updated : t))
  } catch (e) {
    error.value = e.message || '변경 실패'
  }
}

onMounted(loadTodos)
</script>
