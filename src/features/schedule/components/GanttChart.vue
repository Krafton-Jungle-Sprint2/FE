<template>
  <div class="gantt-chart bg-white rounded-lg shadow-sm border">
    <div class="p-4 border-b flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-800">간트 차트</h3>
      <div class="flex items-center gap-2">
        <button class="px-2 py-1 border rounded" @click="zoomOut" aria-label="zoom out">−</button>
        <span class="text-sm w-14 text-center">{{ Math.round(dayWidth) }}px/일</span>
        <button class="px-2 py-1 border rounded" @click="zoomIn" aria-label="zoom in">＋</button>
        <button class="px-2 py-1 border rounded" @click="zoomReset" aria-label="reset">Reset</button>
      </div>
    </div>

    <div class="gantt-container overflow-auto" :style="{ maxHeight: totalGanttHeight + 'px' }" @wheel="onWheel"
      ref="containerEl">
      <!-- 헤더 -->
      <div class="gantt-header flex sticky top-0 bg-gray-50 border-b z-10">
        <div class="lane-column w-32 p-3 border-r bg-gray-100 font-medium text-gray-700">카테고리</div>
        <div class="dates-container flex">
          <div v-for="date in dateRange" :key="date"
            class="date-cell p-2 text-center text-sm border-r border-gray-200 font-medium"
            :style="{ width: dayWidth + 'px' }">
            {{ formatDate(date) }}
          </div>
        </div>
      </div>

      <!-- 레인 -->
      <div class="gantt-body">
        <div v-for="lane in lanes" :key="lane.id" class="lane border-b border-gray-200 hover:bg-gray-50"
          :style="{ backgroundColor: lane.color + '10', height: getLaneHeight(lane.id) + 'px' }">
          <div class="flex h-full">
            <div class="lane-label w-32 p-4 border-r bg-white flex items-start">
              <div class="w-3 h-3 rounded-full mr-2 mt-1" :style="{ backgroundColor: lane.color }"></div>
              <span class="font-medium text-gray-700">{{ lane.name }}</span>
            </div>
            <div class="timeline-area flex-1 relative" :style="{ minHeight: getLaneHeight(lane.id) + 'px' }">
              <div class="timeline-scroll relative h-full" :style="[{ width: contentWidth + 'px' }, timelineBgStyle]">
                <div class="date-grid flex absolute inset-0">
                  <div v-for="date in dateRange" :key="date" class="date-column border-r border-gray-100"
                    :style="{ width: dayWidth + 'px' }"></div>
                </div>
                <!-- 작업 바 -->
                <div v-for="task in getTasksByLane(lane.id)" :key="task.id" class="task-bar absolute cursor-move"
                  :style="getTaskStyle(task)" @mousedown="startDrag(task, $event)">
                  <div class="task-content h-8 rounded px-2 flex items-center text-white text-xs font-medium shadow-sm"
                    :style="{ backgroundColor: lane.color }">
                    <span class="truncate">{{ task.title }}</span>
                  </div>
                </div>

                <!-- 리사이즈 핸들 -->
                <div
                  class="resize-handle-left absolute left-0 top-0 w-1 h-full cursor-ew-resize bg-white opacity-0 hover:opacity-100"
                  @mousedown.stop="startResize(task, 'left', $event)"></div>
                <div
                  class="resize-handle-right absolute right-0 top-0 w-1 h-full cursor-ew-resize bg-white opacity-0 hover:opacity-100"
                  @mousedown.stop="startResize(task, 'right', $event)"></div>
              </div>
            </div>
          </div>
        </div>
      </div> <!-- gantt-body -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import dayjs from '@/shared/lib/dayjs.js'
const contentWidth = computed(() => dateRange.value.length * dayWidth.value)
const MIN_W = 16, MAX_W = 160
const dayWidth = ref(72) // px per day (가변)
const containerEl = ref(null)

const props = defineProps({
  tasks: { type: Array, default: () => [] },     // [{ id, title, category|teamId, status, startDate, endDate }]
  teams: { type: Array, default: () => [] },     // [{ id, name, color }]
  viewMode: { type: String, default: 'team' }    // 'team' | 'status'
})
const emit = defineEmits(['update-task'])

// 로컬 복제
const localTasks = ref(props.tasks.map(t => ({ ...t })))
watch(() => props.tasks, v => { localTasks.value = v.map(t => ({ ...t })) }, { deep: true })

// 팀 기본값(FE/BE/QA)
const defaultTeams = [
  { id: 'FE', name: 'FE', color: '#3B82F6' },
  { id: 'BE', name: 'BE', color: '#10B981' },
  { id: 'QA', name: 'QA', color: '#F59E0B' }
]

// 상태 레인
const STATUS_LANES = [
  { id: '시작 전', name: '전', color: '#9CA3AF' },
  { id: '진행 중', name: '중', color: '#3B82F6' },
  { id: '완료', name: '후', color: '#10B981' }
]

// 레인 계산
const lanes = computed(() => {
  if (props.viewMode === 'team') return (props.teams?.length ? props.teams : defaultTeams)
  return STATUS_LANES
})

// === 날짜 윈도(무한 확장) ===
const baseDate = ref(dayjs().format('YYYY-MM-DD')) // 기준일
const startOffset = ref(-14) // 기준일로부터 시작 오프셋
const endOffset = ref(28)    // 기준일로부터 끝 오프셋

const dateRange = computed(() => {
  const start = dayjs(baseDate.value).add(startOffset.value, 'day')
  const len = endOffset.value - startOffset.value + 1
  const arr = []
  for (let i = 0; i < len; i++) arr.push(start.add(i, 'day').format('YYYY-MM-DD'))
  return arr
})

const rangeStart = computed(() => dayjs(dateRange.value[0]))

const formatDate = (date) => {
  const d = dayjs(date)
  return `${d.format('MM/DD')}\n${d.format('ddd')}`
}

// 스크롤 끝 근처에서 날짜 범위 확장
function maybeExtendRange() {
  const el = containerEl.value
  if (!el) return
  const bufferPx = dayWidth.value * 5

  // 왼쪽 끝 근처 → 앞쪽 확장
  if (el.scrollLeft < bufferPx) {
    const addDays = 14
    startOffset.value -= addDays
    // 앞에 칸이 추가되므로 시점 보정
    el.scrollLeft += addDays * dayWidth.value
  }
  // 오른쪽 끝 근처 → 뒤쪽 확장
  if (el.scrollLeft + el.clientWidth > el.scrollWidth - bufferPx) {
    endOffset.value += 14
  }
}

// 날짜별 작업 필터
function getTasksByLane(laneId) {
  if (props.viewMode === 'team') {
    return localTasks.value.filter(t => t.category === laneId || t.teamId === laneId)
  }
  return localTasks.value.filter(t => t.status === laneId)
}

// 바 충돌 레벨
function calculateTaskLevels(tasks) {
  const levels = new Map()
  const sorted = [...tasks].sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)))
  for (const task of sorted) {
    const tS = dayjs(task.startDate)
    const tE = dayjs(task.endDate)
    let level = 0
    const group = tasks.filter(x =>
      (props.viewMode === 'team'
        ? (x.category === task.category || x.teamId === task.teamId || x.category === task.teamId || x.teamId === task.category)
        : x.status === task.status)
      && x.id !== task.id
    )
    while (true) {
      let conflict = false
      for (const other of group) {
        if (levels.get(other.id) === level) {
          const oS = dayjs(other.startDate), oE = dayjs(other.endDate)
          if (tS.isSameOrBefore(oE, 'day') && tE.isSameOrAfter(oS, 'day')) { conflict = true; break }
        }
      }
      if (!conflict) { levels.set(task.id, level); break }
      level++
    }
  }
  return levels
}

function getMaxLevelByLane(laneId) {
  const laneTasks = getTasksByLane(laneId)
  if (!laneTasks.length) return 0
  const levels = calculateTaskLevels(localTasks.value)
  let max = 0
  for (const t of laneTasks) max = Math.max(max, levels.get(t.id) || 0)
  return max
}

function getLaneHeight(laneId) {
  const maxLevel = getMaxLevelByLane(laneId)
  const levelHeight = 40
  return (maxLevel + 1) * levelHeight + 24
}

// 타임라인 배경(가변 격자)
const timelineBgStyle = computed(() => {
  const w = dayWidth.value
  return {
    background: `repeating-linear-gradient(90deg,
      transparent 0, transparent ${w - 1}px,
      #e5e7eb ${w - 1}px, #e5e7eb ${w}px)`
  }
})

// 스타일 계산
function getTaskStyle(task) {
  const start = dayjs(task.startDate)
  const end = dayjs(task.endDate)
  const startDiff = start.diff(rangeStart.value, 'day')
  const duration = Math.max(1, end.diff(start, 'day') + 1)

  const left = startDiff * dayWidth.value
  const width = duration * dayWidth.value

  const levels = calculateTaskLevels(localTasks.value)
  const level = levels.get(task.id) || 0
  const top = 12 + (level * 40)

  return { left: `${left}px`, width: `${width}px`, top: `${top}px`, zIndex: 10 }
}

// 드래그/리사이즈
const dragState = ref({
  isDragging: false,
  isResizing: false,
  currentTask: null,
  dragType: null,
  startX: 0,
  originalStartDate: null,
  originalEndDate: null
})

function startDrag(task, e) {
  if (e.target.classList.contains('resize-handle-left') || e.target.classList.contains('resize-handle-right')) return
  dragState.value = {
    isDragging: true, isResizing: false, currentTask: task, dragType: 'move',
    startX: e.clientX, originalStartDate: task.startDate, originalEndDate: task.endDate
  }
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function startResize(task, direction, e) {
  dragState.value = {
    isDragging: false, isResizing: true, currentTask: task, dragType: direction,
    startX: e.clientX, originalStartDate: task.startDate, originalEndDate: task.endDate
  }
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(e) {
  if (!dragState.value.currentTask) return
  const deltaX = e.clientX - dragState.value.startX
  const daysDelta = Math.round(deltaX / dayWidth.value)
  const t = dragState.value.currentTask
  const oS = dayjs(dragState.value.originalStartDate)
  const oE = dayjs(dragState.value.originalEndDate)

  if (dragState.value.isDragging) {
    const newStart = oS.add(daysDelta, 'day')
    const duration = oE.diff(oS, 'day')
    const newEnd = newStart.add(duration, 'day')
    t.startDate = newStart.format('YYYY-MM-DD')
    t.endDate = newEnd.format('YYYY-MM-DD')
  } else if (dragState.value.isResizing) {
    if (dragState.value.dragType === 'left') {
      const newStart = oS.add(daysDelta, 'day')
      if (newStart.isBefore(oE)) t.startDate = newStart.format('YYYY-MM-DD')
    } else {
      const newEnd = oE.add(daysDelta, 'day')
      if (newEnd.isAfter(oS)) t.endDate = newEnd.format('YYYY-MM-DD')
    }
  }
}

function handleMouseUp() {
  if (dragState.value.currentTask) {
    emit('update-task', {
      id: dragState.value.currentTask.id,
      startDate: dragState.value.currentTask.startDate,
      endDate: dragState.value.currentTask.endDate
    })
  }
  dragState.value = { isDragging: false, isResizing: false, currentTask: null, dragType: null, startX: 0, originalStartDate: null, originalEndDate: null }
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// 줌 제어
function setZoom(next, pivotClientX = null) {
  const el = containerEl.value
  const prev = dayWidth.value
  const clamped = Math.min(MAX_W, Math.max(MIN_W, next))
  if (clamped === prev) return
  if (el && pivotClientX != null) {
    const rect = el.getBoundingClientRect()
    const cursorX = pivotClientX - rect.left + el.scrollLeft
    const scale = clamped / prev
    dayWidth.value = clamped
    el.scrollLeft = cursorX * scale - (pivotClientX - rect.left)
  } else {
    dayWidth.value = clamped
  }
}

function zoomIn(e) { setZoom(dayWidth.value * 1.1, e?.clientX ?? null) }
function zoomOut(e) { setZoom(dayWidth.value * 0.9, e?.clientX ?? null) }
function zoomReset() { setZoom(72) }

// 휠: Ctrl+휠=줌, 일반 휠=가로 스크롤
function onWheel(e) {
  if (e.ctrlKey) {
    e.preventDefault()
    const next = dayWidth.value * (e.deltaY > 0 ? 0.9 : 1.1)
    setZoom(next, e.clientX)
  } else {
    const el = containerEl.value
    // 트랙패드/마우스 수평·수직 모두 가로 스크롤에 반영
    el.scrollLeft += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY)
  }
  maybeExtendRange()
}

// 키보드 단축키: +, -, 0
function onKeydown(e) {
  if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
  if (e.key === '=' || e.key === '+') { e.preventDefault(); zoomIn() }
  if (e.key === '-') { e.preventDefault(); zoomOut() }
  if (e.key === '0') { e.preventDefault(); zoomReset() }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

// 전체 높이
const totalGanttHeight = computed(() => {
  const header = 60
  const body = lanes.value.reduce((sum, l) => sum + getLaneHeight(l.id), 0)
  const h = header + body + 40
  return Math.min(Math.max(h, 400), 1200)
})
</script>

<style scoped>
.task-bar:hover .resize-handle-left,
.task-bar:hover .resize-handle-right {
  opacity: 1;
}

.date-cell {
  white-space: pre-line;
  line-height: 1.2;
}

.timeline-area {
  position: relative;
}

.timeline-scroll {
  position: relative;
}

/* 배경은 JS dayWidth로 계산 */
</style>