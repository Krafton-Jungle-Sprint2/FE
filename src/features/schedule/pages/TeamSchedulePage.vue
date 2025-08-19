<!-- /src/features/schedule/pages/TeamSchedulePage.vue -->
<template>
  <section class="space-y-6">
    <h1 class="text-xl font-bold">팀 일정</h1>

    <!-- Kanban -->
    <KanbanBoard :tasks="tasks" :categories="categories" :statuses="statuses" @create="createTask"
      @update="({ id, patch }) => updateTask(id, patch)" @move="({ id, category }) => updateTask(id, { category })"
      @delete="deleteTask" class="mb-6" />

    <!-- Gantt -->
    <GanttChart :tasks="tasks" @update-task="onGanttUpdate" />
  </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import KanbanBoard from '@/features/schedule/components/KanbanBoard.vue'
import GanttChart from '@/features/schedule/components/GanttChart.vue'
import dayjs, { todayKey, addDays } from '@/shared/lib/dayjs.js'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const route = useRoute()
const router = useRouter()

const categories = ['FE', 'BE', 'QA']
const statuses = ['시작 전', '진행 중', '완료']

const tasks = ref([])            // [{ id, title, description, category, status, startDate, endDate }]
const wsId = ref(null)
const loading = ref(false)
const error = ref('')

// status 매핑
const toApiStatus = (s) => ({ '시작 전': 'NOT_STARTED', '진행 중': 'IN_PROGRESS', '완료': 'DONE' }[s] || 'NOT_STARTED')
const fromApiStatus = (s) => ({ NOT_STARTED: '시작 전', IN_PROGRESS: '진행 중', DONE: '완료' }[s] || '시작 전')

// 인증 헤더
function authHeaders(json = true) {
  const access = localStorage.getItem('accessToken')
  const base = json ? { 'Content-Type': 'application/json' } : {}
  return { ...base, ...(access ? { Authorization: `Bearer ${access}` } : {}) }
}

// WS 선택: /schedule/:wsId 또는 ?wsId=... 없으면 첫 번째
async function ensureWorkspaceId() {
  const param = route.params.wsId || route.query.wsId
  if (param) { wsId.value = String(param); return }
  const res = await fetch(API + '/workspaces', { headers: authHeaders(false) })
  if (res.status === 401) { router.push('/login'); return }
  if (!res.ok) throw new Error('워크스페이스 조회 실패')
  const list = await res.json()
  if (!Array.isArray(list) || list.length === 0) throw new Error('워크스페이스가 없습니다')
  wsId.value = String(list[0].id)
}

// 로드
async function loadTasks() {
  if (!wsId.value) return
  loading.value = true; error.value = ''
  try {
    const res = await fetch(`${API}/workspaces/${wsId.value}/tasks`, { headers: authHeaders(false) })
    if (res.status === 401) { router.push('/login'); return }
    if (!res.ok) throw new Error('작업 조회 실패')
    const data = await res.json()
    tasks.value = (data || []).map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      category: t.department,                                // FE|BE|QA
      status: fromApiStatus(t.status),                       // 레이블로 변환
      startDate: t.startDate,                                // 'YYYY-MM-DD'
      endDate: t.dueDate                                     // 간트가 쓰는 키
    }))
  } catch (e) {
    error.value = e.message || '로드 실패'
  } finally {
    loading.value = false
  }
}

// 생성
const createTask = async (draft) => {
  if (!wsId.value) return
  // draft: { title, description?, category, status?, startDate, endDate }
  const payload = {
    title: draft.title,
    description: draft.description || '',
    department: draft.category,
    status: toApiStatus(draft.status || '시작 전'),
    startDate: draft.startDate,
    dueDate: draft.endDate
  }
  const res = await fetch(`${API}/workspaces/${wsId.value}/tasks`, {
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
  if (!wsId.value) return
  // patch: { title?, description?, category?, status?, startDate?, endDate? }
  const body = {}
  if (patch.title != null) body.title = patch.title
  if (patch.description != null) body.description = patch.description
  if (patch.category != null) body.department = patch.category
  if (patch.status != null) body.status = toApiStatus(patch.status)
  if (patch.startDate != null) body.startDate = patch.startDate
  if (patch.endDate != null) body.dueDate = patch.endDate

  const res = await fetch(`${API}/workspaces/${wsId.value}/tasks/${id}`, {
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
  if (!wsId.value) return
  const res = await fetch(`${API}/workspaces/${wsId.value}/tasks/${id}`, {
    method: 'DELETE', headers: authHeaders(false)
  })
  if (!res.ok) throw new Error('작업 삭제 실패')
  tasks.value = tasks.value.filter(t => t.id !== id)
}

// 간트 이동/리사이즈 반영
const onGanttUpdate = ({ id, startDate, endDate }) => {
  updateTask(id, { startDate, endDate })
}

// 초기화
onMounted(async () => {
  try {
    await ensureWorkspaceId()
    await loadTasks()
  } catch (e) {
    error.value = e.message || '초기화 실패'
  }
})

// 라우트 변경 시 WS 교체
watch(() => [route.params.wsId, route.query.wsId], async () => {
  try {
    await ensureWorkspaceId(); await loadTasks()
  } catch (e) { error.value = e.message || '로드 실패' }
})
</script>
