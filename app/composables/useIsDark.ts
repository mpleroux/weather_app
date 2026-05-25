export const useIsDark = () => {
  const colorMode = useColorMode();
  return computed<boolean>(() => colorMode.value === "dark");
};
