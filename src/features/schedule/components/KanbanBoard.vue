<template>
  <div class="bg-white rounded-2xl shadow p-4">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="font-semibold text-lg">카테고리</h2>
    </div>

    <!-- 컬럼: 카테고리 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="cat in categories"
        :key="cat"
        class="rounded-xl border bg-gray-50"
        @dragover.prevent
        @drop="onDrop($event, cat)"
      >
        <div class="px-3 py-2 border-b flex items-center justify-between">
          <span class="font-semibold">{{ cat }}</span>
          <button
            class="px-2 py-1 text-blue-600 text-sm hover:bg-blue-100 rounded"
            @click="openAdd(cat)"
            aria-label="컬럼에 작업 추가"
          >
            +
          </button>
        </div>

        <div class="p-3 space-y-3 min-h-40">
          <div
            v-for="t in byCategory[cat]"
            :key="t.id"
            class="rounded-lg bg-white border shadow-sm p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
            draggable="true"
            @dragstart="dragStart($event, t.id)"
            @dragend="onDragEnd"
            @click="onTaskClick(t)"
          >
            <div class="flex items-start justify-between gap-2">
              <h3 class="font-medium truncate">{{ t.title }}</h3>
              <select
                class="text-xs px-2 py-1 rounded border bg-white"
                :value="t.status"
                @change="onChangeStatus(t.id, $event.target.value)"
                @click.stop
              >
                <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>

            <p v-if="t.description" class="text-sm text-gray-600 mt-1 line-clamp-2">
              {{ t.description }}
            </p>

            <div class="mt-2 text-xs text-gray-500 flex items-center justify-between">
              <span>📅 {{ t.startDate }} ~ {{ t.endDate }}</span>
              <span class="rounded-full px-2 py-0.5 border bg-gray-50">{{ t.category }}</span>
            </div>
          </div>

          <p v-if="!byCategory[cat].length" class="text-xs text-gray-400">비어 있음</p>
        </div>
      </div>
    </div>

    <!-- 추가/편집 모달 -->
    <div v-if="addOpen" class="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div class="w-full max-w-md bg-white rounded-xl shadow p-4">
        <!-- Dynamic modal title based on edit mode -->
        <h3 class="font-semibold text-lg mb-3">{{ isEditMode ? '작업 편집' : '작업 추가' }}</h3>

        <div class="grid grid-cols-1 gap-3">
          <input v-model="draft.title" class="border rounded-lg px-3 py-2" placeholder="제목" />
          <textarea v-model="draft.description" class="border rounded-lg px-3 py-2" rows="3" placeholder="상세 설명"></textarea>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-500">시작일</label>
              <input v-model="draft.startDate" type="date" class="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="text-xs text-gray-500">종료일</label>
              <input v-model="draft.endDate" type="date" class="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-500">카테고리</label>
              <select v-model="draft.category" class="w-full border rounded-lg px-3 py-2 bg-white">
                <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-gray-500">상태</label>
              <select v-model="draft.status" class="w-full border rounded-lg px-3 py-2 bg-white">
                <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="mt-4 flex justify-end gap-2">
          <button class="px-3 py-1 rounded-lg border" @click="closeModal">취소</button>
          <button
            class="px-3 py-1 rounded-lg bg-blue-600 text-white disabled:opacity-60"
            :disabled="!draft.title || !draft.startDate || !draft.endDate"
            @click="isEditMode ? commitEdit() : commitAdd()"
          >
            <!-- Dynamic button text based on edit mode -->
            {{ isEditMode ? '수정' : '추가' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import dayjs, { todayKey } from '@/shared/lib/dayjs.js' // Updated import path to local dayjs file

// ✅ 런타임 props
const props = defineProps({
  tasks: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] }, // 예: ['FE','BE','QA']
  statuses: { type: Array, default: () => [] },   // 예: ['시작 전','진행 중','완료']
})

// ✅ 이벤트: 부모에서 @create/@update/@move/@delete 받도록 정의
const emit = defineEmits(['update:tasks', 'create', 'update', 'move', 'delete'])

/* 분류: 전달받은 categories 기준으로 동적 맵 생성 */
const byCategory = computed(() => {
  const map = Object.fromEntries((props.categories || []).map(c => [c, []]))
  for (const t of props.tasks || []) {
    if (t && map[t.category]) map[t.category].push(t)
  }
  return map
})

/* 드래그앤드롭 */
const isDragging = ref(false)

const dragStart = (e, id) => {
  isDragging.value = true
  e.dataTransfer && e.dataTransfer.setData('text/plain', String(id))
}

const onDrop = (e, cat) => {
  const id = Number(e.dataTransfer && e.dataTransfer.getData('text/plain'))
  emit('move', { id, category: cat }) // 부모에 알림
  const next = (props.tasks || []).map(t => (t.id === id ? { ...t, category: cat } : t))
  emit('update:tasks', next)
}

const onDragEnd = () => {
  setTimeout(() => {
    isDragging.value = false
  }, 100)
}

/* 상태 변경 */
const onChangeStatus = (id, status) => {
  emit('update', { id, patch: { status } }) // 부모에 알림(BE 패치 등)
  const next = (props.tasks || []).map(t => (t.id === id ? { ...t, status } : t))
  emit('update:tasks', next)
}

/* 추가/편집 모달 */
const addOpen = ref(false)
const isEditMode = ref(false)
const draft = reactive({
  id: 0,
  title: '',
  description: '',
  category: 'FE',
  status: '시작 전',
  startDate: todayKey(),
  endDate: todayKey(),
})

const onTaskClick = (task) => {
  if (isDragging.value) return // Prevent click during drag
  
  // Populate draft with task data for editing
  draft.id = task.id
  draft.title = task.title
  draft.description = task.description || ''
  draft.category = task.category
  draft.status = task.status
  draft.startDate = task.startDate
  draft.endDate = task.endDate
  
  isEditMode.value = true
  addOpen.value = true
}

const openAdd = (cat) => {
  draft.id = 0
  draft.title = ''
  draft.description = ''
  draft.category = cat || 'FE'
  draft.status = '시작 전'
  draft.startDate = todayKey()
  draft.endDate = todayKey()
  isEditMode.value = false
  addOpen.value = true
}

const closeModal = () => {
  addOpen.value = false
  isEditMode.value = false
}

const commitAdd = () => {
  const newTask = {
    id: Date.now(),
    title: draft.title.trim(),
    description: draft.description?.trim(),
    category: draft.category,
    status: draft.status,
    startDate: draft.startDate,
    endDate: draft.endDate,
  }
  emit('create', newTask)                              // 부모 훅
  emit('update:tasks', [...(props.tasks || []), newTask]) // 로컬 반영
  closeModal()
}

const commitEdit = () => {
  const updatedTask = {
    id: draft.id,
    title: draft.title.trim(),
    description: draft.description?.trim(),
    category: draft.category,
    status: draft.status,
    startDate: draft.startDate,
    endDate: draft.endDate,
  }
  
  emit('update', { id: draft.id, patch: updatedTask }) // 부모에 알림
  const next = (props.tasks || []).map(t => (t.id === draft.id ? updatedTask : t))
  emit('update:tasks', next)
  closeModal()
}
</script>
