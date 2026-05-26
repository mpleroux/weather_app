<template>
  <nav aria-label="Main navigation">
    <NuxtLink
      to="/"
      class="nav-link-class"
      active-class="nav-link-active-class">
      <UIcon name="i-heroicons-cloud" class="size-6" />
      <span class="text-xs select-none">Weather</span>
    </NuxtLink>

    <NuxtLink
      to="/settings"
      class="nav-link-class"
      active-class="nav-link-active-class">
      <UIcon name="i-heroicons-cog-6-tooth" class="size-6" />
      <span class="text-xs select-none">Settings</span>
    </NuxtLink>
  </nav>
</template>
