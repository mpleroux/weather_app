<template>
  <nav aria-label="Main navigation">
    <NuxtLink
      to="/"
      class="flex cursor-pointer flex-row items-center gap-2 px-2 py-1.5 hover:bg-slate-200 md:mb-6 md:flex-col md:rounded-md dark:hover:bg-gray-800"
      active-class="bg-gray-100 font-medium dark:bg-gray-800">
      <UIcon name="i-heroicons-cloud" class="size-6" />
      <span class="text-xs select-none">Weather</span>
    </NuxtLink>

    <NuxtLink
      to="/settings"
      class="flex cursor-pointer flex-row items-center gap-2 px-2 py-1.5 hover:bg-slate-200 md:mb-6 md:flex-col md:rounded-md dark:hover:bg-gray-800"
      active-class="bg-gray-100 font-medium dark:bg-gray-800">
      <UIcon name="i-heroicons-cog-6-tooth" class="size-6" />
      <span class="text-xs select-none">Settings</span>
    </NuxtLink>
  </nav>
</template>
