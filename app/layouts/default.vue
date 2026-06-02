<script setup lang="ts">
const isMenuOpen = ref<boolean>(false);

// Close mobile menu if new page is selected or light/dark mode is toggled
const route = useRoute();
watch(
  () => route.path,
  () => {
    isMenuOpen.value = false;
  },
);

const colorMode = useColorMode();
watch(
  () => colorMode.value,
  () => {
    isMenuOpen.value = false;
  },
);
</script>

<template>
  <div>
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-4 focus:text-black">
      Skip to main content
    </a>

    <div class="flex h-screen min-w-xs bg-slate-200 dark:bg-slate-950">
      <!-- Sidebar nav -->
      <UCard
        :ui="{
          body: 'py-4 px-2 sm:py-4 sm:px-2 flex flex-col h-full',
        }"
        class="my-4 ml-4 hidden md:flex">
        <AppNav />
        <div class="mt-auto flex justify-center">
          <DarkModeToggle />
        </div>
      </UCard>

      <main
        id="main-content"
        class="flex shrink grow basis-0 flex-col overflow-y-auto">
        <!-- Mobile navigation -->
        <header class="relative z-1000 md:hidden">
          <nav
            class="relative flex w-full items-center justify-between bg-slate-100 dark:bg-slate-900"
            aria-label="Main navigation">
            <UButton
              variant="ghost"
              class="cursor-pointer rounded-none"
              :ui="{
                base: 'py-3 active:bg-slate-100 hover:bg-slate-100 dark:active:bg-slate-900 dark:hover:bg-slate-900',
              }"
              aria-label="Mobile navigation menu"
              :aria-expanded="isMenuOpen.toString()"
              @click="isMenuOpen = !isMenuOpen">
              <UIcon name="i-heroicons-bars-3" class="size-6" />
            </UButton>
            <div class="card-heading mr-2 self-center">Weather</div>

            <div
              v-if="isMenuOpen"
              class="absolute top-full z-50 w-full bg-slate-100 px-2 pb-2 shadow dark:bg-slate-900">
              <AppNav class="mb-1" />
              <DarkModeToggle />
            </div>
          </nav>
        </header>
        <div class="min-h-0 grow">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
