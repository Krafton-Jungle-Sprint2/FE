<!-- /src/features/todo/pages/TodoPage.vue -->
<template>
  <section class="space-y-4">
    <h1 class="text-xl font-bold">Todo</h1>

    <AddTaskBox v-model:open="boxOpen" @add="addTask" />

    <TaskList :tasks="tasks" @toggle="toggleTask" @dates="updateDates" @remove="deleteTask" />

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AddTaskBox from '@/features/todo/components/AddTaskBox.vue'
import TaskList from '@/features/todo/components/TaskList.vue'
import { list, create, patch, remove } from '@/features/auth/services/todoApi.js' // 네 구조 기준

const tasks = ref([])
const error = ref('')
const loading = ref(false)
const boxOpen = ref(false)

async function load() {
  try {
    const data = await list()
    console.log('[todos]', data) // 배열인지 확인
    tasks.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = e.message;
    tasks.value = []
  }
}

async function addTask(title) {
  const t = (title ?? '').trim()
  if (!t) return
  loading.value = true; error.value = ''
  try {
    await create({ title: t })   // DB 저장
    await load()                 // 확정 반영
    boxOpen.value = false
  } catch (e) {
    error.value = e.message || '추가 실패'
  } finally { loading.value = false }
}

async function toggleTask(id, completed) {
  try {
    await patch(id, { status: completed ? 'completed' : 'pending' })
    const it = tasks.value.find(v => v.id === id)
    if (it) it.status = completed ? 'completed' : 'pending'
  } catch (e) {
    error.value = e.message || '업데이트 실패'
  }
}

async function updateDates(id, { startDate, dueDate }) {
  await patch(id, { startDate, dueDate })
  const it = tasks.value.find(v => v.id === id)
  if (it) {
    it.startDate = startDate;
    it.dueDate = dueDate
  }
}

async function deleteTask(id) {
  await remove(id)
  tasks.value = tasks.value.filter(t => t.id !== id)
}

onMounted(load)

</script>
