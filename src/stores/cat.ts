import { defineStore } from "pinia";
import { ref } from "vue";

export const useCatStore = defineStore("cat", () => {
  const visible = ref(false);
  const mirrorMode = ref(false);
  const singleMode = ref(false);
  const mouseMirror = ref(false);
  const penetrable = ref(false);
  const alwaysOnTop = ref(true);
  const scale = ref(100);
  const opacity = ref(100);

  const init = () => {
    visible.value = true;
  };

  // Thêm hàm reset
  const reset = () => {
    mirrorMode.value = false;
    singleMode.value = false;
    mouseMirror.value = false;
    penetrable.value = false;
    alwaysOnTop.value = true;
    scale.value = 100;
    opacity.value = 100;
  };

  return {
    visible,
    mirrorMode,
    singleMode,
    mouseMirror,
    penetrable,
    alwaysOnTop,
    scale,
    opacity,
    init,
    reset,
  };
});
