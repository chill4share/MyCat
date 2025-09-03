// main.ts
import { createPlugin } from "@tauri-store/pinia";
import { createPinia } from "pinia";
import { createApp } from "vue";
import { invoke } from "@tauri-apps/api/core";

import App from "./App.vue";
import { useLocale } from "./composables/useLocale";
import { i18n } from "./i18n";
import router from "./router";

import "virtual:uno.css";
import "ant-design-vue/dist/reset.css";
import "./assets/css/global.scss";

// Hàm chờ backend sẵn sàng
async function waitForBackendReady() {
  while (true) {
    try {
      const ready = await invoke<boolean>("is_ready");
      if (ready) return;
    } catch {
      // Backend chưa sẵn sàng hoặc chưa compile xong
    }
    await new Promise((r) => setTimeout(r, 200));
  }
}

async function startApp() {
  // Đợi backend
  await waitForBackendReady();

  const app = createApp(App);
  const pinia = createPinia();

  pinia.use(createPlugin({ saveOnChange: true }));
  app.use(pinia);

  // Locale phụ thuộc vào Pinia
  const { initLocale } = useLocale();
  await initLocale();

  app.use(router).use(i18n);
  app.mount("#app");
}

// Khởi động
startApp();
