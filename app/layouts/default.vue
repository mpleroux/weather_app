<script setup lang="ts">
// Pull in unit toggle and display string for the sidebar button
const { toggleUnits, tempUnit } = useUnits();

// Track dark mode state for the color mode toggle button
const colorMode = useColorMode();
const isDark = computed<boolean>(() => colorMode.value === "dark");

// Toggle between light and dark mode by setting the preference, not the value directly
const toggleColorMode = (): void => {
  colorMode.preference = isDark.value ? "light" : "dark";
};
</script>

<template>
  <div class="flex h-screen min-w-xs bg-white dark:bg-gray-950">
    <UCard :ui="{ body: 'py-4 px-2 sm:py-4 sm:px-2' }">
      <nav class="mb-6">
        <NuxtLink
          to="/"
          class="flex flex-col items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
          active-class="bg-gray-100 font-medium dark:bg-gray-800"
        >
          <UIcon name="i-heroicons-cloud" class="size-6" />
          <span class="text-xs">Weather</span>
        </NuxtLink>
      </nav>

      <nav class="mb-6">
        <NuxtLink
          to="/settings"
          class="flex flex-col items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
          active-class="bg-gray-100 font-medium dark:bg-gray-800"
        >
          <UIcon name="i-heroicons-cog-6-tooth" class="size-6" />
          <span class="text-xs">Settings</span>
        </NuxtLink>
      </nav>

      <div class="flex gap-2">
        <UButton variant="ghost" size="sm" @click="toggleUnits">
          {{ tempUnit }}
        </UButton>

        <ClientOnly>
          <UButton variant="ghost" size="sm" @click="toggleColorMode">
            <UIcon :name="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'" />
          </UButton>
        </ClientOnly>
      </div>
    </UCard>

    <main class="shrink grow basis-0 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
