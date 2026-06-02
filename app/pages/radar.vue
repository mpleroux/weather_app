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

// Leaflet requires browser APIs, so all map setup runs client-side only
onMounted(async () => {
  // Dynamic import keeps Leaflet out of the SSR bundle
  const { default: L } = await import("leaflet");
  await import("leaflet/dist/leaflet.css");

  const map = L.map(mapContainer.value!, {
    center: [lat.value, lon.value],
    zoom: 7,
    maxZoom: 7,
  });

  // Base map tiles from OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

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
  <div class="h-full">
    <div
      class="grid h-full grid-cols-1 gap-4 pt-4 pr-6 pb-4 pl-4 lg:grid-cols-[3fr_2fr]">
      <div class="flex min-w-0 flex-col gap-4">
        <h1 class="font-bold">Radar</h1>
        <div class="isolate">
          <UCard
            :ui="{
              body: 'p-4 sm:p-4',
            }">
            <div ref="mapContainer" class="aspect-video" />
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>
