<!-- /src/features/profile/pages/MyPage.vue -->
<template>
  <section class="space-y-4">
    <h1 class="text-xl font-bold">마이페이지</h1>
    <ProfileCard />
    <ProfileForm class="mt-4" />
    <NotificationToggles class="mt-2" />
  </section>
</template>

<script setup>
import ProfileCard from '@/components/ProfileCard.vue'
import ProfileForm from '@/components/ProfileForm.vue'
import NotificationToggles from '@/components/NotificationToggles.vue'
</script>