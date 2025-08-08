// main.ts

import { createPlugin } from '@tauri-store/pinia'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import { useLocale } from './composables/useLocale' // 👈 Import useLocale
import { i18n } from './i18n'
import router from './router'
import 'virtual:uno.css'
import 'ant-design-vue/dist/reset.css'
import './assets/css/global.scss'

async function startApp() {
  const app = createApp(App)
  const pinia = createPinia()

  pinia.use(createPlugin({ saveOnChange: true }))
  app.use(pinia)

  // Phải use(pinia) trước vì useLocale() phụ thuộc vào Pinia store
  const { initLocale } = useLocale()

  // Dùng await để đảm bảo các file ngôn ngữ được tải xong
  // trước khi tiếp tục.
  await initLocale()

  // Bây giờ i18n đã có bản dịch, ta có thể an toàn sử dụng nó
  app.use(router).use(i18n)
  app.mount('#app')
}

// Gọi hàm async để khởi động ứng dụng
startApp()
