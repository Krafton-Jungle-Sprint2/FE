<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <!-- 한 곳에서 사이드바 폭 정의 -->
    <div class="pt-14 flex" style="--sidebar-w: 10rem;"> <!-- 10rem = w-40 -->
      <SideNav :open="sidebarOpen" @close="sidebarOpen = false" />
      <!-- 본문 좌여백도 동일 변수 사용 -->
      <main class="flex-1 container mx-auto px-4 py-6 md:ml-[var(--sidebar-w)]">
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