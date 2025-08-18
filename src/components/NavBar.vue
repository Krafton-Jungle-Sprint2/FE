<template>
  <header class="fixed top-0 left-0 right-0 h-14 bg-white border-b z-50">
    <div class="h-full max-w-full container px-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <!-- 모바일: 사이드바 토글 -->
        <button
          class="md:hidden p-2 rounded hover:bg-gray-100"
          @click="$emit('toggle-sidebar')"
          aria-label="Toggle sidebar"
        >
          <!-- 단순 햄버거 -->
          <svg viewBox="0 0 24 24" class="w-6 h-6" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <RouterLink to="/" class="font-bold">Codea</RouterLink>
      </div>

      <div class="flex items-center gap-3">
        <!-- 우측 액션(알림/아바타 등 필요시) -->
        <div class="w-8 h-8 rounded-full bg-gray-200"/>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// 상위에서 @toggle-sidebar 이벤트를 받을 수 있게 emit만 사용
</script>
