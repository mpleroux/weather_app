<script setup lang="ts">
const props = defineProps<{
  name: string;
  size: string;
}>();
</script>

<template>
  <div
    :style="{ '--mask-url': `url('/meteocons/monochrome/${props.name}.svg')` }"
    :class="size"
    class="mask-size-contain mask-position-center shrink-0 bg-slate-700 mask-(--mask-url) mask-alpha mask-no-repeat dark:bg-slate-300" />
</template>
