<template>
  <div
    class="relative flex items-start h-16 gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
    @click="openPicker" :class="{ 'bg-gray-500 text-white': task.completed }">
    <!-- 체크박스 -->
    <input type="checkbox" :checked="task.completed" @click.stop @change="onToggle"
      class="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2" />

    <!-- 본문 -->
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium" :class="{ 'line-through': task.completed }">
        {{ task.title }}
      </div>
      <div v-if="task.dueDate" class="text-xs mt-1 flex items-center gap-1">
        <span class="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
        {{ formatDueDate(task.dueDate) }}
      </div>
    </div>

    <!-- 삭제 버튼 -->
    <button @click.stop="emit('remove', task.id)" class="text-gray-400 hover:text-red-500 transition-colors">
      ✕
    </button>

    <!-- 날짜 팝오버 -->
    <div v-if="show"
      class="absolute z-10 top-full left-3 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3"
      @click.stop>
      <div class="text-sm font-semibold mb-2">날짜 설정</div>
      <div class="space-y-2">
        <label class="block text-xs text-gray-600">
          시작일
          <input type="date" v-model="start" class="mt-1 w-full border rounded px-2 py-1 text-sm" />
        </label>
        <label class="block text-xs text-gray-600">
          마감일
          <input type="date" v-model="due" class="mt-1 w-full border rounded px-2 py-1 text-sm" />
        </label>
      </div>
      <div class="flex justify-end gap-2 mt-3">
        <button class="px-2 py-1 text-xs text-gray-600 hover:text-gray-800" @click="cancel">
          취소
        </button>
        <button class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700" @click="save">
          저장
        </button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import dayjs from '@/shared/lib/dayjs.js'

const props = defineProps({ task: { type: Object, required: true } })
const emit = defineEmits(['toggle', 'dates'])

const show = ref(false)
const start = ref(toInputDate(props.task.startDate))
const due = ref(toInputDate(props.task.dueDate))

function toInputDate(v) {
  if (!v) return ''
  const d = dayjs(v)
  return d.isValid() ? d.format('YYYY-MM-DD') : ''
}

function openPicker() {
  start.value = toInputDate(props.task.startDate)
  due.value = toInputDate(props.task.dueDate)
  show.value = true
}
function cancel() { show.value = false }
function save() {
  emit('dates', props.task.id, {
    startDate: start.value || null,
    dueDate: due.value || null,
  })
  show.value = false
}

function onToggle(e) { emit('toggle', props.task.id, e.target.checked) }

function formatDueDate(dateStr) {
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
