<script setup lang="ts">
const props = defineProps<{
  label: string;
  options: Array<{ value: string; label: string }>;
}>();

const model = defineModel<string>();
</script>

<template>
  <h2 class="settings-heading">{{ props.label }}</h2>

  <div class="mb-4">
    <UFieldGroup orientation="horizontal" class="flex">
      <UButton
        v-for="option in props.options"
        :key="option.value"
        class="settings-button"
        :class="
          model === option.value
            ? 'bg-slate-200! ring-2 ring-slate-400! dark:bg-slate-700! dark:ring-slate-500!'
            : ''
        "
        color="neutral"
        :variant="model === option.value ? 'subtle' : 'outline'"
        :label="option.label"
        @click="model = option.value" />
    </UFieldGroup>
  </div>
</template>
