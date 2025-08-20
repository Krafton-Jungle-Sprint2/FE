<template>
  <div class="h-screen bg-gray-50 flex flex-col">
    <NavBar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

    <!-- 워크스페이스 사이드바들을 조건부 렌더링으로 복원 -->
    <div class="flex" style="height: calc(100vh - 3.5rem)">
      <SideNav :open="sidebarOpen" @close="sidebarOpen = false" />

      <!-- 채팅 라우트에서만 RoomSidebar 표시 -->
      <RoomSidebar v-if="showChatBar" @workspace-selected="onWorkspaceSelected" />

      <!-- 스케줄 라우트에서만 ScheduleSidebar 표시 -->
      <ScheduleSidebar v-if="showScheduleBar" @workspace-selected="onWorkspaceSelected" />

      <main class="flex-1 overflow-auto">
        <div class=" container mx-auto px-4 py-6 md:ml-[var(--content-offset)]">
          <router-view :selected-workspace="selectedWorkspace" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import SideNav from '@/components/SideNav.vue'
import RoomSidebar from '@/features/chat/components/RoomSidebar.vue'
import ScheduleSidebar from '@/features/schedule/components/ScheduleSidebar.vue'

const route = useRoute()
const sidebarOpen = ref(false)
const selectedWorkspace = ref(null)

const showChatBar = computed(() => route.path.startsWith('/chat'))
const showScheduleBar = computed(() => route.path.startsWith('/schedule'))

function onWorkspaceSelected(workspace) {
  selectedWorkspace.value = workspace
}

const styleVars = computed(() => ({
  '--sidebar-w': '10rem',
  '--chatbar-w': '14rem',
  '--header-offset': (showChatBar.value || showScheduleBar.value)
    ? 'calc(var(--sidebar-w) + var(--chatbar-w))'
    : 'var(--sidebar-w)',
  '--content-offset': (showChatBar.value || showScheduleBar.value)
    ? 'calc(var(--sidebar-w) + var(--chatbar-w))'
    : 'var(--sidebar-w)',
}))
</script>
