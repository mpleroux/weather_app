<script setup lang="ts">
// Renders a weather icon using CSS mask technique in light mode and a plain img in dark mode
const props = defineProps<{
  code: number;
  isDay: number;
  size: string;
}>();

const { weatherIcon, weatherDescription } = useWmoCode();

// Use dark mode indicator to determine weather icon type
const isDark = useIsDark();
const iconFolder = computed(() => (isDark.value ? "fill" : "monochrome"));
</script>

<template>
  <ClientOnly>
    <div
      v-if="!isDark"
      :style="{
        '--mask-url': `url('/meteocons/${iconFolder}/${weatherIcon(props.code, props.isDay)}.svg')`,
      }"
      class="mask-size-contain mask-position-center bg-slate-600 mask-(--mask-url) mask-alpha mask-no-repeat"
      :class="props.size"
      :aria-label="weatherDescription(props.code)"
      role="img" />
    <img
      v-else
      :src="`/meteocons/${iconFolder}/${weatherIcon(props.code, props.isDay)}.svg`"
      :alt="weatherDescription(props.code)"
      :class="props.size" >
    <template #fallback>
      <div :class="props.size" />
    </template>
  </ClientOnly>
</template>
