<!-- /src/features/todo/pages/TodoPage.vue -->
<template>
  <section class="space-y-4">
    <h1 class="text-xl font-bold">Todo</h1>

    <!-- 입력 박스 -->
    <AddTaskBox v-model:open="boxOpen" @add="createTaskFromBox" />

    <!-- 리스트 -->
    <TaskList :tasks="tasks" @toggle="toggleTask" />

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AddTaskBox from '@/features/todo/components/AddTaskBox.vue'
import TaskList from '@/features/todo/components/TaskList.vue'
import { list, create, patch } from '@/features/auth/services/todoApi.js' // 경로 너 기준

const tasks = ref([])
const error = ref('')
const loading = ref(false)
const boxOpen = ref(false)

async function load() {
  try {
    const data = await list()
    tasks.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = e.message || '로드 실패'
    tasks.value = []
  }
}

async function createTaskFromBox(title) {
  const t = (title ?? '').trim()
  if (!t) return
  loading.value = true; error.value = ''
  try {
    await create({ title: t })   // DB 저장
    await load()                 // 확정 반영
    boxOpen.value = false
  } catch (e) {
    error.value = e.message || '추가 실패'
  } finally {
    loading.value = false
  }
}

/** 체크박스 토글: completed ↔ status 매핑 */
async function toggleTask(id, completed) {
  try {
    await patch(id, { status: completed ? 'completed' : 'pending' })
    const it = tasks.value.find(v => v.id === id)
    if (it) it.status = completed ? 'completed' : 'pending'
  } catch (e) {
    error.value = e.message || '업데이트 실패'
  }
}

onMounted(load)
</script>
