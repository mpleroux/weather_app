<template>
  <div class="flex h-screen min-w-xs">
    <aside
      class="flex flex-col items-center w-20 gap-6 py-6 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <UIcon name="i-heroicons-cloud" class="text-3xl text-primary" />

      <nav class="flex flex-col items-center gap-6 mt-4">
        <NuxtLink to="/" class="nav-link">
          <UIcon name="i-heroicons-sun" class="text-xl" />
          Weather
        </NuxtLink>

        <NuxtLink to="/locations" class="nav-link">
          <UIcon name="i-heroicons-map-pin" class="text-xl" />
          Cities
        </NuxtLink>

        <NuxtLink to="/settings" class="nav-link">
          <UIcon name="i-heroicons-cog-6-tooth" class="text-xl" />
          Settings
        </NuxtLink>
      </nav>

    </aside>

    <main class="shrink grow basis-0 overflow-hidden">
      <slot />
    </main>
  </div>
</template>
