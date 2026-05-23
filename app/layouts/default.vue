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
    <aside
      class="flex flex-col w-56 shrink-0 border-r border-gray-200 dark:border-gray-800 p-4 gap-6"
    >
      <div class="px-2 text-lg font-semibold">Weather</div>

      <NuxtLink
        to="/"
        class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
        active-class="bg-gray-100 font-medium dark:bg-gray-800"
      >
        <UIcon name="i-heroicons-cloud" />
        Weather
      </NuxtLink>

      <nav class="flex flex-col gap-1 flex-1">
        <NuxtLink
          to="/settings"
          class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          active-class="bg-gray-100 font-medium dark:bg-gray-800"
        >
          <UIcon name="i-heroicons-cog-6-tooth" />
          Settings
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
    </aside>

    <main class="shrink grow basis-0 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
