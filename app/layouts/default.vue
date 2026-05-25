<script setup lang="ts">
// Pull in unit toggle and display string for the sidebar button
const { toggleUnits, tempUnit } = useUnits();

// Track dark mode state for the color mode toggle button
const colorMode = useColorMode();
const isDark = computed<boolean>(() => colorMode.value === "dark");

const isMenuOpen = ref<boolean>(false);

// Toggle between light and dark mode by setting the preference, not the value directly
const toggleColorMode = (): void => {
  colorMode.preference = isDark.value ? "light" : "dark";
};
</script>

<template>
  <div class="flex h-screen min-w-xs bg-slate-200 dark:bg-slate-950">
    <!-- Sidebar nav -->
    <UCard
      :ui="{
        root: 'ring ring-slate-300 dark:ring-slate-800',
        body: 'bg-slate-100 dark:bg-slate-900 py-4 px-2 sm:py-4 sm:px-2',
      }"
      class="hidden md:flex ml-4 my-4"
    >
      <AppNav />
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
      <!-- Mobile navigation -->
      <header class="md:hidden">
        <div
          class="relative w-full flex justify-between items-center bg-slate-100 dark:bg-slate-700"
        >
          <UButton
            color="neutral"
            variant="ghost"
            class="rounded-none cursor-pointer"
            :class="isMenuOpen ? 'bg-slate-100! dark:bg-slate-700!' : ''"
            @click="isMenuOpen = !isMenuOpen"
          >
            <UIcon name="i-heroicons-bars-3" class="size-6" />
          </UButton>
          <div class="card-heading self-center mr-2">Weather App</div>

          <div
            v-if="isMenuOpen"
            class="absolute z-50 top-full bg-slate-100 dark:bg-slate-900 pb-2 px-2 w-full"
          >
            <AppNav />
          </div>
        </div>
      </header>
      <slot />
    </main>
  </div>
</template>
