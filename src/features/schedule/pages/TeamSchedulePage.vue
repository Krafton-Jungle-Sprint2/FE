<template>
  <section class="space-y-6">
    <h1 class="text-xl font-bold">팀 일정</h1>

    <!-- Kanban -->
    <KanbanBoard
      :tasks="tasks"
      :categories="categories"
      :statuses="statuses"
      @create="createTask"
      @update="({ id, patch }) => updateTask(id, patch)"
      @move="({ id, category }) => updateTask(id, { category })"
      @delete="deleteTask"
      class="mb-6"
    />

    <!-- Gantt -->
    <GanttChart :tasks="tasks" />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import KanbanBoard from '@/features/schedule/components/KanbanBoard.vue'
import GanttChart from '@/features/schedule/components/GanttChart.vue'
import dayjs, { todayKey, addDays } from '@/shared/lib/dayjs.js'

const categories = ['FE', 'BE', 'QA']
const statuses = ['시작 전', '진행 중', '완료']

// 초기 더미
const tasks = ref([
  {
    id: 1,
    title: '컴포넌트 구조 리팩터링',
    description: 'Atomic 디자인 도입',
    category: 'FE',
    status: '진행 중',
    startDate: todayKey(),
    endDate: addDays(todayKey(), 3),
  },
  {
    id: 2,
    title: '인증 API',
    description: 'JWT 발급/검증/재발급',
    category: 'BE',
    status: '시작 전',
    startDate: addDays(todayKey(), 1),
    endDate: addDays(todayKey(), 5),
  },
  {
    id: 3,
    title: 'E2E 테스트',
    description: 'Cypress 기본 시나리오',
    category: 'QA',
    status: '시작 전',
    startDate: addDays(todayKey(), 2),
    endDate: addDays(todayKey(), 6),
  },
])

// CRUD 핸들러 (BE 연동 전까지 로컬 상태 갱신)
const createTask = (draft) => {
  const newTask = { id: Date.now(), ...draft }
  tasks.value = [...tasks.value, newTask]
}

const updateTask = (id, patch) => {
  tasks.value = tasks.value.map(t => (t.id === id ? { ...t, ...patch } : t))
}

const deleteTask = (id) => {
  tasks.value = tasks.value.filter(t => t.id !== id)
}
</script>
