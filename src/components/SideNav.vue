<template>
  <!-- 오버레이(모바일) -->
  <div class="fixed inset-0 z-30 bg-black/40 md:hidden" v-if="open" @click="$emit('close')" />

  <!-- 사이드바 -->
  <aside class="fixed z-40 top-14 md:top-0 left-0
           h-[calc(100vh-3.5rem)] md:h-screen
           w-[var(--sidebar-w)]
           bg-emerald-500 border-r border-emerald-600 text-white
           shadow-md md:shadow-none
           md:relative md:block md:pt-0
           transition-transform" :class="[open ? 'translate-x-0' : '-translate-x-full', 'md:translate-x-0']">
    <nav class="h-full flex flex-col p-3 gap-1">
      <RouterLink v-for="item in items" :key="item.to" :to="item.to"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-emerald-600/30"
        :class="isActive(item.to) ? 'bg-emerald-600 font-semibold' : ''" @click="$emit('close')">
        <component :is="item.icon" class="w-5 h-5" />
        <span class="truncate font-bold">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ClipboardDocumentListIcon, ChatBubbleLeftRightIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline'

defineProps<{ open: boolean }>()
const route = useRoute()
const isActive = (to: string) => route.path.startsWith('/' + to.replace(/^\//, ''))

const items = [
  { to: '/todos', label: 'Todo', icon: ClipboardDocumentListIcon },
  { to: '/chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
  { to: '/schedule', label: 'Schedule', icon: CalendarDaysIcon },
]
</script>
