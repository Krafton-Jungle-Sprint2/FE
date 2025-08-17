<template>
  <div class="gantt-chart bg-white rounded-lg shadow-sm border">
    <div class="p-4 border-b">
      <h3 class="text-lg font-semibold text-gray-800">간트 차트</h3>
    </div>
    
    <div class="gantt-container overflow-auto" :style="{ maxHeight: totalGanttHeight + 'px' }">
      <!-- 헤더: 날짜 표시 -->
      <div class="gantt-header flex sticky top-0 bg-gray-50 border-b z-10">
        <div class="category-column w-32 p-3 border-r bg-gray-100 font-medium text-gray-700">
          카테고리
        </div>
        <div class="dates-container flex">
          <div 
            v-for="date in dateRange" 
            :key="date"
            class="date-cell w-24 p-2 text-center text-sm border-r border-gray-200 font-medium"
          >
            {{ formatDate(date) }}
          </div>
        </div>
      </div>

      <!-- 카테고리별 레인 -->
      <div class="gantt-body">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="category-lane border-b border-gray-200 hover:bg-gray-50"
          :style="{ backgroundColor: category.color + '10', height: getCategoryLaneHeight(category.id) + 'px' }"
        >
          <!-- 카테고리 라벨 -->
          <div class="flex h-full">
            <div class="category-label w-32 p-4 border-r bg-white flex items-start">
              <div 
                class="w-3 h-3 rounded-full mr-2 mt-1"
                :style="{ backgroundColor: category.color }"
              ></div>
              <span class="font-medium text-gray-700">{{ category.name }}</span>
            </div>
            
            <!-- 타임라인 영역 -->
            <div class="timeline-area flex-1 relative" :style="{ minHeight: getCategoryLaneHeight(category.id) + 'px' }">
              <!-- 날짜 그리드 -->
              <div class="date-grid flex absolute inset-0">
                <div 
                  v-for="date in dateRange" 
                  :key="date"
                  class="date-column w-24 border-r border-gray-100"
                ></div>
              </div>
              
              <!-- 해당 카테고리의 작업들 -->
              <div 
                v-for="task in getTasksByCategory(category.id)" 
                :key="task.id"
                class="task-bar absolute cursor-move"
                :style="getTaskStyle(task)"
                @mousedown="startDrag(task, $event)"
              >
                <div 
                  class="task-content h-8 rounded px-2 flex items-center text-white text-xs font-medium shadow-sm"
                  :style="{ backgroundColor: category.color }"
                >
                  <span class="truncate">{{ task.title }}</span>
                </div>
                
                <!-- 리사이즈 핸들 -->
                <div 
                  class="resize-handle-left absolute left-0 top-0 w-1 h-full cursor-ew-resize bg-white opacity-0 hover:opacity-100"
                  @mousedown.stop="startResize(task, 'left', $event)"
                ></div>
                <div 
                  class="resize-handle-right absolute right-0 top-0 w-1 h-full cursor-ew-resize bg-white opacity-0 hover:opacity-100"
                  @mousedown.stop="startResize(task, 'right', $event)"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import dayjs from '@/shared/lib/dayjs.js'

const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update-task'])

// 카테고리 정의
const categories = ref([
  { id: 'FE', name: 'FE', color: '#3B82F6' },
  { id: 'BE', name: 'BE', color: '#10B981' },
  { id: 'QA', name: 'QA', color: '#F59E0B' }
])

// 드래그 상태
const dragState = ref({
  isDragging: false,
  isResizing: false,
  currentTask: null,
  dragType: null,
  startX: 0,
  startDate: null,
  originalStartDate: null,
  originalEndDate: null
})

// 날짜 범위 계산
const dateRange = computed(() => {
  const today = dayjs()
  const dates = []
  
  // 2주간의 날짜 생성
  for (let i = -3; i < 11; i++) {
    dates.push(today.add(i, 'day').format('YYYY-MM-DD'))
  }
  
  return dates
})

// 카테고리별 작업 필터링
const getTasksByCategory = (categoryId) => {
  return props.tasks.filter(task => task.category === categoryId)
}

// 날짜 포맷팅
const formatDate = (date) => {
  const d = dayjs(date)
  return `${d.format('MM/DD')}\n${d.format('ddd')}`
}

const calculateTaskLevels = (tasks) => {
  const taskLevels = new Map()
  const sortedTasks = [...tasks].sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)))
  
  for (const task of sortedTasks) {
    const taskStart = dayjs(task.startDate)
    const taskEnd = dayjs(task.endDate)
    let level = 0
    
    // 같은 카테고리의 다른 태스크들과 충돌 검사
    const categoryTasks = tasks.filter(t => t.category === task.category && t.id !== task.id)
    
    while (true) {
      let hasConflict = false
      
      for (const otherTask of categoryTasks) {
        if (taskLevels.get(otherTask.id) === level) {
          const otherStart = dayjs(otherTask.startDate)
          const otherEnd = dayjs(otherTask.endDate)
          
          // 두 기간이 겹치는지 확인: (start1 <= end2) && (end1 >= start2)
          const hasOverlap = taskStart.isSameOrBefore(otherEnd, 'day') && 
                           taskEnd.isSameOrAfter(otherStart, 'day')
          
          if (hasOverlap) {
            hasConflict = true
            break
          }
        }
      }
      
      if (!hasConflict) {
        taskLevels.set(task.id, level)
        break
      }
      
      level++
    }
  }
  
  return taskLevels
}

const getMaxLevelByCategory = (categoryId) => {
  const categoryTasks = getTasksByCategory(categoryId)
  if (categoryTasks.length === 0) return 0
  
  const taskLevels = calculateTaskLevels(props.tasks)
  let maxLevel = 0
  
  for (const task of categoryTasks) {
    const level = taskLevels.get(task.id) || 0
    maxLevel = Math.max(maxLevel, level)
  }
  
  return maxLevel
}

const getCategoryLaneHeight = (categoryId) => {
  const maxLevel = getMaxLevelByCategory(categoryId)
  const minHeight = 64 // 최소 높이
  const levelHeight = 40 // 각 레벨당 높이
  return (maxLevel + 1) * levelHeight + 24 // 24px는 패딩
}

const getTaskStyle = (task) => {
  const startDate = dayjs(task.startDate)
  const endDate = dayjs(task.endDate)
  const rangeStart = dayjs(dateRange.value[0])
  
  const startDiff = startDate.diff(rangeStart, 'day')
  const duration = endDate.diff(startDate, 'day') + 1
  
  const left = startDiff * 96 // 96px per day (w-24)
  const width = duration * 96
  
  // 태스크 레벨 계산
  const taskLevels = calculateTaskLevels(props.tasks)
  const level = taskLevels.get(task.id) || 0
  const top = 12 + (level * 40) // 각 레벨당 40px 간격
  
  return {
    left: `${Math.max(0, left)}px`,
    width: `${width}px`,
    top: `${top}px`,
    zIndex: 10
  }
}

// 드래그 시작
const startDrag = (task, event) => {
  if (event.target.classList.contains('resize-handle-left') || 
      event.target.classList.contains('resize-handle-right')) {
    return
  }
  
  dragState.value = {
    isDragging: true,
    isResizing: false,
    currentTask: task,
    dragType: 'move',
    startX: event.clientX,
    originalStartDate: task.startDate,
    originalEndDate: task.endDate
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 리사이즈 시작
const startResize = (task, direction, event) => {
  dragState.value = {
    isDragging: false,
    isResizing: true,
    currentTask: task,
    dragType: direction,
    startX: event.clientX,
    originalStartDate: task.startDate,
    originalEndDate: task.endDate
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 마우스 이동 처리
const handleMouseMove = (event) => {
  if (!dragState.value.currentTask) return
  
  const deltaX = event.clientX - dragState.value.startX
  const daysDelta = Math.round(deltaX / 96) // 96px per day
  
  const task = dragState.value.currentTask
  const originalStart = dayjs(dragState.value.originalStartDate)
  const originalEnd = dayjs(dragState.value.originalEndDate)
  
  if (dragState.value.isDragging) {
    // 작업 이동
    const newStartDate = originalStart.add(daysDelta, 'day')
    const duration = originalEnd.diff(originalStart, 'day')
    const newEndDate = newStartDate.add(duration, 'day')
    
    task.startDate = newStartDate.format('YYYY-MM-DD')
    task.endDate = newEndDate.format('YYYY-MM-DD')
  } else if (dragState.value.isResizing) {
    // 작업 리사이즈
    if (dragState.value.dragType === 'left') {
      const newStartDate = originalStart.add(daysDelta, 'day')
      if (newStartDate.isBefore(originalEnd)) {
        task.startDate = newStartDate.format('YYYY-MM-DD')
      }
    } else if (dragState.value.dragType === 'right') {
      const newEndDate = originalEnd.add(daysDelta, 'day')
      if (newEndDate.isAfter(originalStart)) {
        task.endDate = newEndDate.format('YYYY-MM-DD')
      }
    }
  }
}

// 마우스 업 처리
const handleMouseUp = () => {
  if (dragState.value.currentTask) {
    // 백엔드에 변경사항 저장
    emit('update-task', {
      id: dragState.value.currentTask.id,
      startDate: dragState.value.currentTask.startDate,
      endDate: dragState.value.currentTask.endDate
    })
  }
  
  dragState.value = {
    isDragging: false,
    isResizing: false,
    currentTask: null,
    dragType: null,
    startX: 0,
    originalStartDate: null,
    originalEndDate: null
  }
  
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

const totalGanttHeight = computed(() => {
  const headerHeight = 60 // 헤더 높이
  const categoryHeights = categories.value.reduce((total, category) => {
    return total + getCategoryLaneHeight(category.id)
  }, 0)
  
  // 최소 400px, 최대 1200px로 제한하되 내용에 따라 동적 조정
  const calculatedHeight = headerHeight + categoryHeights + 40 // 40px는 여유 공간
  return Math.min(Math.max(calculatedHeight, 400), 1200)
})
</script>

<style scoped>
.gantt-container {
  /* max-height 제거하여 동적 높이 적용 */
}

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
  background: linear-gradient(90deg, transparent 95px, #e5e7eb 95px, #e5e7eb 96px, transparent 96px);
  background-size: 96px 100%;
}
</style>
