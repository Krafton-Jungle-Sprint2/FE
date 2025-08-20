<template>
    <div class="min-h-screen bg-white flex flex-col border-r border-gray-200">
        <!-- Header -->
        <div class="w-50 p-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">프로젝트</h2>
        </div>

        <!-- Workspace List -->
        <div class="flex-1 overflow-y-auto">
            <div class="p-2">
                <div v-if="loading" class="p-3 text-sm text-gray-500">불러오는 중...</div>
                <div v-else-if="error" class="p-3 text-sm text-red-600">{{ error }}</div>
                <!-- 워크스페이스가 없을 때 채팅에서 팀 생성 안내 메시지로 변경 -->
                <div v-else-if="workspaces.length === 0" class="p-4 text-center">
                    <div class="text-sm text-gray-500 mb-2">참여 중인 팀이 없습니다</div>
                    <div class="text-xs text-gray-400">채팅에서 새 팀을 생성하거나 초대를 받아보세요</div>
                </div>
                <div v-else v-for="workspace in workspaces" :key="workspace.id" @click="selectWorkspace(workspace)"
                    :class="[
                        'p-3 rounded-lg cursor-pointer transition-colors mb-2',
                        selectedWorkspace?.id === workspace.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                    ]">
                    <div class="flex items-center space-x-3">
                        <div :class="[
                            'w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold',
                            getWorkspaceColor(workspace.id)
                        ]">
                            {{ workspace.name.charAt(0).toUpperCase() }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="font-medium text-gray-900 truncate">{{ workspace.name }}</h3>
                            <div class="flex items-center mt-1">
                                <span class="text-xs text-gray-400">{{ workspace.memberCount || 0 }}명</span>
                                <!-- 작업 수 대신 예정된 일정 수로 변경 -->
                                <span v-if="workspace.scheduleCount > 0"
                                    class="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                                    {{ workspace.scheduleCount }}개 일정
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 워크스페이스 생성 버튼 완전 제거 -->
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const router = useRouter()

const workspaces = ref([])
const selectedWorkspace = ref(null)
const loading = ref(false)
const error = ref('')

const emit = defineEmits(['workspace-selected'])

const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500']

function getWorkspaceColor(id) {
    return colors[id % colors.length]
}

function authHeaders() {
    const access = localStorage.getItem('accessToken')
    return { 'Content-Type': 'application/json', ...(access ? { Authorization: `Bearer ${access}` } : {}) }
}

async function loadWorkspaces() {
    loading.value = true
    error.value = ''
    try {
        const res = await fetch(`${API}/workspaces`, { headers: authHeaders() })
        if (res.status === 401) {
            router.push('/login')
            return
        }
        if (!res.ok) throw new Error('팀 목록 조회 실패')

        const data = await res.json()
        workspaces.value = Array.isArray(data) ? data : []

        // 첫 번째 워크스페이스를 기본 선택
        if (workspaces.value.length > 0 && !selectedWorkspace.value) {
            selectWorkspace(workspaces.value[0])
        }
    } catch (e) {
        error.value = e.message || '팀 목록 로드 실패'
    } finally {
        loading.value = false
    }
}

function selectWorkspace(workspace) {
    selectedWorkspace.value = workspace
    emit('workspace-selected', workspace)
}


onMounted(() => {
    loadWorkspaces()
})

defineExpose({
    selectedWorkspace: computed(() => selectedWorkspace.value),
    loadWorkspaces
})
</script>
