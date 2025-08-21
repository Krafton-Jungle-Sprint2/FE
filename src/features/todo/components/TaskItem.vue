<template>
  <div
    class="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm">
    <input type="checkbox" :checked="task.completed" @change="onToggle"
      class="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2" />
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium text-gray-900" :class="{ 'line-through text-gray-500': task.completed }">
        {{ task.title }}
      </div>
      <div v-if="task.dueDate" class="text-xs text-gray-500 mt-1 flex items-center gap-1">
        <span class="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
        {{ formatDueDate(task.dueDate) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import dayjs from '@/shared/lib/dayjs.js'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['toggle'])

const onToggle = (e) => {
  emit('toggle', props.task.id, e.target.checked)
}

const formatDueDate = (dateStr) => {
  if (!dateStr) return ''
  const date = dayjs(dateStr)
  const today = dayjs().startOf('day')
  const tomorrow = today.add(1, 'day')

  if (date.isSame(today, 'day')) return '오늘'
  if (date.isSame(tomorrow, 'day')) return '내일'
  if (date.isBefore(today)) return `${today.diff(date, 'day')}일 지남`
  return date.format('M월 D일')
}
</script>
