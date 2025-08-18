<template>
  <div class="space-y-2">
    <TaskItem
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      @toggle="(id, completed) => emit('toggle', id, completed)"
    />
  </div>
</template>

<script setup>
import TaskItem from './TaskItem.vue'

const props = defineProps({
  tasks: {
    type: Array,
    required: true
  }
})
const emit = defineEmits(['toggle'])
</script>
