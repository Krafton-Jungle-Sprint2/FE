<!-- src/app/components/NavBar.vue -->
<template>
  <nav class="border-b bg-white">
    <div class="container mx-auto px-4 h-14 flex items-center justify-between">
      <router-link 
        to="/" 
        class="flex items-center gap-2">
        <span class="font-semibold">
          Codea
        </span>
      </router-link>
      <router-link
        to="/mypage"
        class="rounded-xl px-3 py-1.5 bg-gray-900 text-white hover:bg-gray-800"
      >
        마이페이지
      </router-link>
    </div>
  </nav>
</template>