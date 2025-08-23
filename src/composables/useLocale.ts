import { resolveResource } from "@tauri-apps/api/path";
import { readDir, readTextFile } from "@tauri-apps/plugin-fs";
import enUS from "ant-design-vue/es/locale/en_US";
import viVN from "ant-design-vue/es/locale/vi_VN";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import { ref, watch } from "vue";

import { i18n } from "@/i18n";
import { useGeneralStore } from "@/stores/general";

export const antLocale = ref(zhCN);

const antLocales: Record<string, any> = {
  "zh-CN": zhCN,
  "en-US": enUS,
  "vi-VN": viVN,
};

let availableLocales: string[] = [];

export async function loadAvailableLocales() {
  const localesPath = await resolveResource("assets/locales");
  const files = await readDir(localesPath);
  availableLocales = files
    .filter((f) => f.name.endsWith(".json"))
    .map((f) => f.name.replace(".json", ""));
  return availableLocales;
}

const isLocaleReady = ref(false);
const locales = ref<{ code: string; name: string }[]>([]);

export function useLocale() {
  const generalStore = useGeneralStore();

  async function initLocale() {
    const codes = await loadAvailableLocales();

    locales.value = await Promise.all(
      codes.map(async (code) => {
        const messages = await loadLocaleMessages(code);
        return {
          code,
          name: messages.meta?.name || code,
        };
      })
    );

    if (!generalStore.locale) {
      generalStore.locale = "en-US";
    }

    await setLocale(generalStore.locale);
    isLocaleReady.value = true;
  }

  watch(
    () => generalStore.locale,
    async (val) => {
      if (val && isLocaleReady.value) {
        await setLocale(val);
      }
    }
  );

  return { generalStore, locales, isLocaleReady, initLocale };
}

export async function loadLocaleMessages(locale: string) {
  const filePath = await resolveResource(`assets/locales/${locale}.json`);
  const jsonContent = await readTextFile(filePath);
  return JSON.parse(jsonContent);
}

const loadedLocales = new Set<string>();

export async function setLocale(locale: string) {
  if (!loadedLocales.has(locale)) {
    const messages = await loadLocaleMessages(locale);
    i18n.global.setLocaleMessage(locale, messages);
    loadedLocales.add(locale);
  }
  i18n.global.locale.value = locale;

  antLocale.value = antLocales[locale] || antLocales["en-US"];
}
