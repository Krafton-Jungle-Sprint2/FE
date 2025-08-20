<!-- /src/features/todos/components/TaskList.vue -->
<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <section v-for="sec in sections" :key="sec.key" class="bg-gray-50 rounded-lg p-3">
        <h3 class="text-sm font-semibold text-gray-700 mb-2">{{ sec.title }}</h3>
        <div class="space-y-2">
          <TaskItem v-for="t in sec.items" :key="t.id" :task="t" @toggle="(id, c) => emit('toggle', id, c)" />
          <p v-if="!sec.items.length" class="text-xs text-gray-400">비어 있음</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TaskItem from './TaskItem.vue'
import dayjs from '@/shared/lib/dayjs.js'

const props = defineProps({ tasks: { type: Array, required: true } })
const emit = defineEmits(['toggle'])

const today = dayjs().startOf('day')
const d = v => (v ? dayjs(v).startOf('day') : null)
const startOf = t => d(t.startDate ?? t.start ?? t.start_time)
const endOf = t => d(t.dueDate ?? t.endDate ?? t.due)

const toItem = (t, label) => ({
  id: t.id,
  title: t.title,
  completed: t.status === 'DONE',
  status: label,
})

const sections = computed(() => {
  const overdue = [], todayArr = [], future = []
  for (const t of props.tasks) {
    const s = startOf(t), e = endOf(t)
    if (!s || !e) continue
    if (e.isBefore(today)) overdue.push(t)
    else if (s.isAfter(today)) future.push(t)
    else todayArr.push(t)
  }

  overdue.sort((a, b) => (a.dueDate ?? a.endDate ?? '').localeCompare(b.dueDate ?? b.endDate ?? ''))
  todayArr.sort((a, b) => (a.dueDate ?? a.endDate ?? '').localeCompare(b.dueDate ?? b.endDate ?? ''))
  future.sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? ''))

  const res = []
  if (overdue.length) res.push({ key: 'overdue', title: '기한 지남', items: overdue.map(t => toItem(t, '기한 지남')) })
  res.push({ key: 'today', title: '오늘 할 일', items: todayArr.map(t => toItem(t, '오늘 할 일')) })
  res.push({ key: 'future', title: '내일 이후', items: future.map(t => toItem(t, '내일 이후')) })
  return res
})
</script>