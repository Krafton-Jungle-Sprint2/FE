<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

    <div class="flex">
      <SideNav :open="sidebarOpen" @close="sidebarOpen = false" />

      <!-- 채팅 라우트에서만 채팅 사이드바 표시 -->
      <RoomSidebar v-if="showChatBar" />

      <main class="flex-1 container mx-auto px-4 py-6 md:ml-[var(--content-offset)]">
        <router-view />
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

const route = useRoute()
const sidebarOpen = ref(false)
const showChatBar = computed(() => route.path.startsWith('/chat'))

const styleVars = computed(() => ({
  '--sidebar-w': '10rem',
  '--chatbar-w': '14rem',
  '--header-offset': showChatBar.value
    ? 'calc(var(--sidebar-w) + var(--chatbar-w))'
    : 'var(--sidebar-w)',
  '--content-offset': showChatBar.value
    ? 'calc(var(--sidebar-w) + var(--chatbar-w))'
    : 'var(--sidebar-w)',
}))
</script>
