<!-- /src/features/todo/components/TaskList.vue -->
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
/** 스키마에 맞춰 날짜 필드 고정 */
const startOf = t => d(t.startDate)
const endOf = t => d(t.dueDate)

/** 완료 여부는 status === 'completed' 로만 판정 */
const toItem = (t, label) => ({
  id: t.id,
  title: t.title,
  completed: t.status === 'completed',
  status: label,
})

const sections = computed(() => {
  const src = Array.isArray(props.tasks) ? props.tasks : []
  const overdue = [], todayArr = [], future = []

  for (const t of src) {
    const s = startOf(t), e = endOf(t)

    if (!s && !e) { todayArr.push(t); continue }
    if (e && e.isBefore(today)) { overdue.push(t); continue }
    if (s && s.isAfter(today)) { future.push(t); continue }
    todayArr.push(t)
  }

  const by = k => (a, b) => ((a?.[k] ?? '') + '').localeCompare((b?.[k] ?? '') + '')
  overdue.sort(by('dueDate'))
  todayArr.sort(by('dueDate'))
  future.sort(by('startDate'))

  return [
    { key: 'overdue', title: '기한 지남', items: overdue.map(t => toItem(t, '기한 지남')) },
    { key: 'today', title: '오늘 할 일', items: todayArr.map(t => toItem(t, '오늘 할 일')) },
    { key: 'future', title: '내일 이후', items: future.map(t => toItem(t, '내일 이후')) }
  ]
})
</script>
