<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

    <div class="pt-14 flex">
      <!-- 좌측 사이드바 -->
      <SideNav :open="sidebarOpen" @close="sidebarOpen = false" />

      <!-- 메인 컨텐츠 -->
      <main
        class="flex-1 max-w-full container py-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import SideNav from '@/components/SideNav.vue'

const sidebarOpen = ref(false)
// 데스크톱에서는 기본 열림 상태처럼 보이도록(translate-x-0는 CSS로 처리)
onMounted(() => {
  // 모바일에서만 닫힌 상태 유지, 데스크톱은 CSS로 항상 보임
})
</script>