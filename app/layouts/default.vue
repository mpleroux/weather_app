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
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-4 focus:text-black">
    Skip to main content
  </a>

  <div class="flex h-screen min-w-xs bg-slate-200 dark:bg-slate-950">
    <!-- Sidebar nav -->
    <UCard
      :ui="{
        root: 'ring ring-slate-300 dark:ring-slate-800',
        body: 'bg-slate-100 dark:bg-slate-900 py-4 px-2 sm:py-4 sm:px-2',
      }"
      class="my-4 ml-4 hidden md:flex">
      <AppNav />
      <div class="flex gap-2">
        <UButton
          variant="ghost"
          size="sm"
          @click="toggleUnits"
          aria-label="Toggle temperature units, currently {{ tempUnit }}">
          {{ tempUnit }}
        </UButton>

        <ClientOnly>
          <UButton
            variant="ghost"
            size="sm"
            @click="toggleColorMode"
            aria-label="Toggle color mode">
            <UIcon :name="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'" />
          </UButton>
        </ClientOnly>
      </div>
    </UCard>

    <main id="main-content" class="shrink grow basis-0 overflow-y-auto">
      <!-- Mobile navigation -->
      <header class="md:hidden">
        <nav
          class="relative flex w-full items-center justify-between bg-slate-100 dark:bg-slate-950"
          aria-label="Main navigation">
          <UButton
            color="neutral"
            variant="ghost"
            class="cursor-pointer rounded-none"
            :class="isMenuOpen ? 'bg-slate-100! dark:bg-slate-700!' : ''"
            @click="isMenuOpen = !isMenuOpen"
            aria-label="Mobile navigation menu"
            :aria-expanded="isMenuOpen.toString()">
            <UIcon name="i-heroicons-bars-3" class="size-6" />
          </UButton>
          <div class="card-heading mr-2 self-center">Weather</div>

          <div
            v-if="isMenuOpen"
            class="absolute top-full z-50 w-full bg-slate-100 px-2 pb-2 dark:bg-slate-900">
            <AppNav />
          </div>
        </nav>
      </header>
      <slot />
    </main>
  </div>
</template>
