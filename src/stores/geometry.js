import { useBreakpoints } from "@vueuse/core";
import { defineStore } from "pinia";
import { reactive, ref } from "vue";

export const useGeometryStore = defineStore("geometry", () => {
  const windowSize = reactive({
    width: window?.innerWidth || 1920,
    height: window?.innerHeight || 1200,
  });

  const breakpoints = useBreakpoints({
    mobileSm: 0,
    mobile: 350,
    tablet: 768,
    desktop: 1200,
  });

  const isMobile = breakpoints.smaller("desktop");
  const isTablet = breakpoints.between("tablet", "desktop");

  return {
    windowSize,
    isMobile,
    breakpoints,
  };
});
