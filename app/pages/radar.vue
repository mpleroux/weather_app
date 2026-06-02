<script setup lang="ts">
// Shape of the RainViewer weather-maps API response
interface RainViewerResponse {
  host: string;
  radar: {
    past: Array<{ time: number; path: string }>;
  };
}

// Fetch the radar frame index — runs once on the server before render
const { data: radarData } = await useAsyncData<RainViewerResponse>(() =>
  $fetch("https://api.rainviewer.com/public/weather-maps.json"),
);

const { lat, lon } = useLastLocation();
// mapContainer is passed to Leaflet as its mount target
const mapContainer = useTemplateRef<HTMLDivElement>("mapContainer");

const colorMode = useColorMode();

// Return the CartoDB Dark Matter URL for dark mode, OpenStreetMap URL for light mode
const getTileUrl = (isDark: boolean): string =>
  isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

// Leaflet requires browser APIs, so all map setup runs client-side only
onMounted(async () => {
  // Dynamic import keeps Leaflet out of the SSR bundle
  const { default: L } = await import("leaflet");
  await import("leaflet/dist/leaflet.css");

  // Apply brightness filter to the dark basemap container to soften the contrast
  const applyBasemapFilter = (layer: L.TileLayer, isDark: boolean): void => {
    const container = layer.getContainer();
    if (container) {
      container.style.filter = isDark ? "brightness(2)" : "";
    }
  };

  const map = L.map(mapContainer.value!, {
    center: [lat.value, lon.value],
    zoom: 7,
    maxZoom: 7,
  });

  // Base map tiles — CartoDB Dark Matter in dark mode, OpenStreetMap in light
  let baseTileLayer = L.tileLayer(getTileUrl(colorMode.value === "dark"), {
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
  }).addTo(map);
  applyBasemapFilter(baseTileLayer, colorMode.value === "dark");

  // Swap basemap when light/dark mode is toggled
  watch(
    () => colorMode.value,
    (newMode) => {
      const isDark = newMode === "dark";
      map.removeLayer(baseTileLayer);
      baseTileLayer = L.tileLayer(getTileUrl(isDark), {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(map);
      applyBasemapFilter(baseTileLayer, isDark);
      baseTileLayer.bringToBack();
    },
  );

  // Overlay the most recent radar frame from RainViewer
  const latest = radarData.value?.radar.past.at(-1);

  if (latest) {
    // URL segments: host + frame path + tile coords + color scheme + smoothing/snow options
    L.tileLayer(
      `${radarData.value!.host}${latest.path}/256/{z}/{x}/{y}/2/1_1.png`,
      { opacity: 0.6, attribution: "RainViewer" },
    ).addTo(map);
  }
});
</script>

<template>
  <div class="flex h-full flex-col gap-4 pt-4 pr-6 pb-4 pl-4">
    <h1 class="shrink-0 font-bold">Radar</h1>
    <div class="isolate min-h-0 grow">
      <UCard class="h-full" :ui="{ body: 'h-full p-4 sm:p-4' }">
        <div ref="mapContainer" class="h-full" />
      </UCard>
    </div>
  </div>
</template>
