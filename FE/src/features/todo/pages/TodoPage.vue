<template>
  <section class="space-y-4">
    <h1 class="text-xl font-bold">Todo</h1>
    <TodoFilters />
    <TodoCard />
  </section>
</template>

<script setup>
import TodoFilters from '../components/TodoFilters.vue'
import TodoCard from '../components/TodoCard.vue'
</script>

