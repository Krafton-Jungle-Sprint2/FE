<template>
  <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <input
      type="checkbox"
      :checked="task.completed"
      @change="onToggle"
      class="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
    />
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium text-gray-800" :class="{ 'line-through text-gray-500': task.completed }">
        {{ task.title }}
      </div>
      <div class="text-xs text-red-500 mt-1">
        {{ task.status }}
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['toggle'])

const onToggle = (e) => {
  emit('toggle', props.task.id, e.target.checked)
}
</script>
