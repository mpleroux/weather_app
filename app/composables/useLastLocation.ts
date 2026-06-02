export const useLastLocation = () => {
  // useState initializer only runs on the server on a direct page load,
  // so localStorage can't be read here — onMounted handles that below
  const lat = useState<number>("last-lat", () => 39.5);
  const lon = useState<number>("last-lon", () => -98.35);

  // Hydrate from localStorage on the client — necessary because useState
  // skips its initializer during hydration if the server already set the value
  onMounted(() => {
    const storedLat = Number(localStorage.getItem("last-lat"));
    const storedLon = Number(localStorage.getItem("last-lon"));
    if (storedLat) lat.value = storedLat;
    if (storedLon) lon.value = storedLon;
  });

  // Called by the weather page whenever coordinates are confirmed from the URL
  const setLocation = (newLat: number, newLon: number): void => {
    lat.value = newLat;
    lon.value = newLon;
    if (import.meta.client) {
      localStorage.setItem("last-lat", String(newLat));
      localStorage.setItem("last-lon", String(newLon));
    }
  };

  return { lat, lon, setLocation };
};
