<!-- /src/features/schedule/pages/TeamSchedulePage.vue -->
<template>
  <section class="space-y-6">
    <!-- 워크스페이스 정보와 헤더 개선 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">팀 일정</h1>
        <p v-if="selectedWorkspace" class="text-sm text-gray-600 mt-1">
          {{ selectedWorkspace.name }} 워크스페이스
        </p>
      </div>
      <div v-if="selectedWorkspace" class="flex items-center space-x-2">
        <div :class="[
          'w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold',
          getWorkspaceColor(selectedWorkspace.id)
        ]">
          {{ selectedWorkspace.name.charAt(0).toUpperCase() }}
        </div>
        <span class="text-sm text-gray-500">{{ selectedWorkspace.memberCount || 0 }}명</span>
      </div>
    </div>

    <!-- 워크스페이스가 선택되지 않았을 때 안내 메시지 -->
    <div v-if="!selectedWorkspace" class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6-4h6" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">워크스페이스를 선택하세요</h3>
      <p class="text-gray-500">왼쪽 사이드바에서 워크스페이스를 선택하여 팀 일정을 확인하세요.</p>
    </div>

    <!-- 워크스페이스가 선택되었을 때만 칸반과 간트 표시 -->
    <template v-else>
      <!-- Kanban -->
      <KanbanBoard :tasks="tasks" :categories="categories" :statuses="statuses" @create="createTask"
        @update="({ id, patch }) => updateTask(id, patch)" @move="({ id, category }) => updateTask(id, { category })"
        @delete="deleteTask" class="mb-6" />

      <!-- Gantt -->
      <GanttChart :tasks="tasks" @update-task="onGanttUpdate" />
    </template>

    <!-- 에러 메시지 표시 -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-600">{{ error }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import KanbanBoard from '@/features/schedule/components/KanbanBoard.vue'
import GanttChart from '@/features/schedule/components/GanttChart.vue'
import dayjs, { todayKey, addDays } from '@/shared/lib/dayjs.js'

const props = defineProps({
  selectedWorkspace: { type: Object, default: null }
})

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const route = useRoute()
const router = useRouter()

const categories = ['FE', 'BE', 'QA']
const statuses = ['시작 전', '진행 중', '완료']
const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500']

const tasks = ref([])
const loading = ref(false)
const error = ref('')

const selectedWorkspace = computed(() => props.selectedWorkspace)

function getWorkspaceColor(id) {
  return colors[id % colors.length]
}

watch(() => props.selectedWorkspace, async (newWorkspace) => {
  if (newWorkspace) {
    await loadTasks()
  } else {
    tasks.value = []
  }
}, { immediate: true })

// 로드
async function loadTasks() {
  if (!selectedWorkspace.value?.id) return
  loading.value = true; error.value = ''
  try {
    const res = await fetch(`${API}/workspaces/${selectedWorkspace.value.id}/tasks`, { headers: authHeaders(false) })
    if (res.status === 401) { router.push('/login'); return }
    if (!res.ok) throw new Error('작업 조회 실패')
    const data = await res.json()
    tasks.value = (data || []).map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      category: t.department,
      status: fromApiStatus(t.status),
      startDate: t.startDate,
      endDate: t.dueDate
    }))
  } catch (e) {
    error.value = e.message || '로드 실패'
  } finally {
    loading.value = false
  }
}

// 생성
const createTask = async (draft) => {
  if (!selectedWorkspace.value?.id) return
  const payload = {
    title: draft.title,
    description: draft.description || '',
    department: draft.category,
    status: toApiStatus(draft.status || '시작 전'),
    startDate: draft.startDate,
    dueDate: draft.endDate
  }
  const res = await fetch(`${API}/workspaces/${selectedWorkspace.value.id}/tasks`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('작업 생성 실패')
  const t = await res.json()
  tasks.value = [
    ...tasks.value,
    {
      id: t.id, title: t.title, description: t.description || '',
      category: t.department, status: fromApiStatus(t.status),
      startDate: t.startDate, endDate: t.dueDate
    }
  ]
}

// 수정
const updateTask = async (id, patch) => {
  if (!selectedWorkspace.value?.id) return
  const body = {}
  if (patch.title != null) body.title = patch.title
  if (patch.description != null) body.description = patch.description
  if (patch.category != null) body.department = patch.category
  if (patch.status != null) body.status = toApiStatus(patch.status)
  if (patch.startDate != null) body.startDate = patch.startDate
  if (patch.endDate != null) body.dueDate = patch.endDate

  const res = await fetch(`${API}/workspaces/${selectedWorkspace.value.id}/tasks/${id}`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error('작업 수정 실패')
  const t = await res.json()
  tasks.value = tasks.value.map(x => x.id === id ? ({
    id: t.id,
    title: t.title,
    description: t.description || '',
    category: t.department,
    status: fromApiStatus(t.status),
    startDate: t.startDate,
    endDate: t.dueDate
  }) : x)
}

// 삭제
const deleteTask = async (id) => {
  if (!selectedWorkspace.value?.id) return
  const res = await fetch(`${API}/workspaces/${selectedWorkspace.value.id}/tasks/${id}`, {
    method: 'DELETE', headers: authHeaders(false)
  })
  if (!res.ok) throw new Error('작업 삭제 실패')
  tasks.value = tasks.value.filter(t => t.id !== id)
}

// 간트 이동/리사이즈 반영
const onGanttUpdate = ({ id, startDate, endDate }) => {
  updateTask(id, { startDate, endDate })
}

// status 매핑
const toApiStatus = (s) => ({ '시작 전': 'NOT_STARTED', '진행 중': 'IN_PROGRESS', '완료': 'DONE' }[s] || 'NOT_STARTED')
const fromApiStatus = (s) => ({ NOT_STARTED: '시작 전', IN_PROGRESS: '진행 중', DONE: '완료' }[s] || '시작 전')

// 인증 헤더
function authHeaders(json = true) {
  const access = localStorage.getItem('accessToken')
  const base = json ? { 'Content-Type': 'application/json' } : {}
  return { ...base, ...(access ? { Authorization: `Bearer ${access}` } : {}) }
}
</script>