<script setup lang="ts">
const toaster = { position: "top-right" } as const;
</script>

<template>
  <UApp :toaster="toaster">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
