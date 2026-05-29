<script setup lang="ts">
// Track dark mode state for the color mode toggle button
const colorMode = useColorMode();
const isDark = computed<boolean>(() => colorMode.value === "dark");

// Toggle between light and dark mode by setting the preference, not the value directly
const toggleColorMode = (): void => {
  colorMode.preference = isDark.value ? "light" : "dark";
};
</script>

<template>
  <ClientOnly>
    <UButton
      variant="ghost"
      aria-label="Toggle color mode"
      @click="toggleColorMode">
      <UIcon
        :name="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
        class="size-5" />
    </UButton>
  </ClientOnly>
</template>
