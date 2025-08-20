<template>
    <div class="min-h-screen bg-white flex flex-col">
        <!-- Header -->
        <div class="p-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">워크스페이스</h2>
        </div>

        <!-- Workspace List -->
        <div class="flex-1 overflow-y-auto">
            <div class="p-2">
                <div v-for="workspace in workspaces" :key="workspace.id" @click="selectWorkspace(workspace)" :class="[
                    'p-3 rounded-lg cursor-pointer transition-colors mb-2',
                    selectedWorkspace?.id === workspace.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                ]">
                    <div class="flex items-center space-x-3">
                        <div :class="[
                            'w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold',
                            workspace.color
                        ]">
                            {{ workspace.name.charAt(0).toUpperCase() }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="font-medium text-gray-900 truncate">{{ workspace.name }}</h3>
                            <div class="flex items-center mt-1">
                                <span class="text-xs text-gray-400">{{ workspace.memberCount }}명</span>
                                <span v-if="workspace.unreadCount > 0"
                                    class="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                    {{ workspace.unreadCount }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Workspace Button -->
        <div class="p-4 border-t border-gray-200">
            <button @click="showAddWorkspace = true"
                class="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                + 새 워크스페이스 추가
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const selectedWorkspace = ref(null)
const showAddWorkspace = ref(false)

const workspaces = ref([
    { id: 1, name: '개발팀', memberCount: 8, unreadCount: 3, color: 'bg-blue-500' },
    { id: 2, name: '디자인팀', memberCount: 5, unreadCount: 0, color: 'bg-purple-500' },
    { id: 3, name: '마케팅팀', memberCount: 6, unreadCount: 12, color: 'bg-green-500' },
    { id: 4, name: '기획팀', memberCount: 4, unreadCount: 1, color: 'bg-orange-500' }
])

const emit = defineEmits(['workspace-selected'])

const selectWorkspace = (workspace) => {
    selectedWorkspace.value = workspace
    emit('workspace-selected', workspace)
}

onMounted(() => {
    if (workspaces.value.length > 0) {
        selectedWorkspace.value = workspaces.value[0]
    }
})
</script>