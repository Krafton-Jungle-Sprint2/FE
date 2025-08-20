<!-- /src/features/todos/pages/TodoPage.vue -->
<template>
  <div class="h-full flex bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- 서브 사이드바 추가 -->
    <div class="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      <!-- 서브 사이드바 헤더 -->
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-800">할 일</h2>
      </div>

      <!-- 카테고리 목록 -->
      <div class="flex-1 p-2">
        <nav class="space-y-1">
          <button v-for="category in categories" :key="category.key" @click="selectedCategory = category.key" :class="[
            'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors',
            selectedCategory === category.key
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-100'
          ]">
            <div class="flex items-center gap-3">
              <span :class="category.iconClass">{{ category.icon }}</span>
              <span>{{ category.name }}</span>
            </div>
            <span v-if="category.count > 0" class="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
              {{ category.count }}
            </span>
          </button>
        </nav>
      </div>
    </div>

    <!-- 메인 콘텐츠 영역 -->
    <div class="flex-1 flex flex-col">
      <!-- 메인 헤더 -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-gray-800">{{ currentCategoryName }}</h1>
            <p class="text-sm text-gray-500 mt-1">
              할 일 {{ filteredTodos.length }}개
              <span v-if="loading" class="ml-2">로딩 중…</span>
              <span v-if="error" class="ml-2 text-red-600">{{ error }}</span>
            </p>
          </div>
          <button @click="isAddingTask = !isAddingTask"
            class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
            <span class="text-lg">+</span>
            <span>새 과제</span>
          </button>
        </div>
      </div>

      <!-- 메인 콘텐츠 -->
      <div class="flex-1 p-4 overflow-y-auto">
        <!-- 새 과제 추가 -->
        <AddTaskBox v-model:open="isAddingTask" @add="addTask" class="mb-4" />

        <!-- 선택된 카테고리에 따른 할 일 표시 -->
        <div class="space-y-4">
          <div v-if="selectedCategory === 'inbox'" class="space-y-6">
            <!-- 기본함: 모든 섹션 표시 -->
            <div v-for="section in groupedTodos" :key="section.key" class="space-y-3">
              <h3 class="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <span :class="section.iconClass">{{ section.icon }}</span>
                {{ section.title }}
                <span class="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{{ section.items.length }}</span>
              </h3>
              <div class="space-y-2">
                <TaskItem v-for="task in section.items" :key="task.id" :task="task" @toggle="toggleTask" />
                <p v-if="!section.items.length" class="text-sm text-gray-400 py-4">할 일이 없습니다</p>
              </div>
            </div>
          </div>

          <div v-else class="space-y-2">
            <!-- 특정 카테고리: 해당 할 일만 표시 -->
            <TaskItem v-for="task in filteredTodos" :key="task.id" :task="task" @toggle="toggleTask" />
            <p v-if="!filteredTodos.length" class="text-sm text-gray-400 py-8 text-center">할 일이 없습니다</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AddTaskBox from '../components/AddTaskBox.vue'
import TaskItem from '../components/TaskItem.vue'
import dayjs from '@/shared/lib/dayjs.js'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const isAddingTask = ref(false)
const loading = ref(false)
const error = ref('')
const rawTodos = ref([])
const selectedCategory = ref('today') // 기본 선택을 오늘로 변경

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

const categories = computed(() => {
  const today = dayjs().startOf('day')
  const next7Days = today.add(7, 'day')

  const todayTodos = rawTodos.value.filter(t => {
    const due = t.dueDate ? dayjs(t.dueDate).startOf('day') : null
    return due && due.isSame(today, 'day')
  })

  const next7DaysTodos = rawTodos.value.filter(t => {
    const due = t.dueDate ? dayjs(t.dueDate).startOf('day') : null
    return due && due.isAfter(today) && due.isBefore(next7Days)
  })

  return [
    {
      key: 'today',
      name: '오늘',
      icon: '☀️',
      iconClass: 'text-orange-500',
      count: todayTodos.length
    },
    {
      key: 'next7days',
      name: '다음 7일',
      icon: '📅',
      iconClass: 'text-blue-500',
      count: next7DaysTodos.length
    },
    {
      key: 'inbox',
      name: '기본함',
      icon: '📥',
      iconClass: 'text-gray-500',
      count: rawTodos.value.length
    }
  ]
})

const currentCategoryName = computed(() => {
  const category = categories.value.find(c => c.key === selectedCategory.value)
  return category ? category.name : '할 일'
})

const filteredTodos = computed(() => {
  const today = dayjs().startOf('day')
  const next7Days = today.add(7, 'day')

  const toTaskItem = (t) => ({
    id: t.id,
    title: t.title,
    completed: t.status === 'DONE',
    dueDate: t.dueDate,
    status: t.status
  })

  switch (selectedCategory.value) {
    case 'today':
      return rawTodos.value
        .filter(t => {
          const due = t.dueDate ? dayjs(t.dueDate).startOf('day') : null
          return due && due.isSame(today, 'day')
        })
        .map(toTaskItem)

    case 'next7days':
      return rawTodos.value
        .filter(t => {
          const due = t.dueDate ? dayjs(t.dueDate).startOf('day') : null
          return due && due.isAfter(today) && due.isBefore(next7Days)
        })
        .map(toTaskItem)

    case 'inbox':
    default:
      return rawTodos.value.map(toTaskItem)
  }
})

const groupedTodos = computed(() => {
  const today = dayjs().startOf('day')
  const overdue = [], todayArr = [], future = []

  for (const t of rawTodos.value) {
    const due = t.dueDate ? dayjs(t.dueDate).startOf('day') : null
    if (!due) continue

    const taskItem = {
      id: t.id,
      title: t.title,
      completed: t.status === 'DONE',
      dueDate: t.dueDate,
      status: t.status
    }

    if (due.isBefore(today)) overdue.push(taskItem)
    else if (due.isSame(today, 'day')) todayArr.push(taskItem)
    else future.push(taskItem)
  }

  return [
    {
      key: 'overdue',
      title: '기한 초과',
      icon: '⚠️',
      iconClass: 'text-red-500',
      items: overdue
    },
    {
      key: 'today',
      title: '오늘',
      icon: '☀️',
      iconClass: 'text-orange-500',
      items: todayArr
    },
    {
      key: 'upcoming',
      title: '예정',
      icon: '📅',
      iconClass: 'text-blue-500',
      items: future
    }
  ].filter(section => section.items.length > 0)
})

function authHeaders(json = true) {
  const access = localStorage.getItem('accessToken')
  const base = json ? { 'Content-Type': 'application/json' } : {}
  return { ...base, ...(access ? { Authorization: `Bearer ${access}` } : {}) }
}

onMounted(loadTodos)
</script>