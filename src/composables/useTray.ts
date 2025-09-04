import type { TrayIconOptions } from "@tauri-apps/api/tray";

import { getName, getVersion } from "@tauri-apps/api/app";
import { emit } from "@tauri-apps/api/event";
import { Menu, MenuItem, PredefinedMenuItem } from "@tauri-apps/api/menu";
import { resolveResource } from "@tauri-apps/api/path";
import { TrayIcon } from "@tauri-apps/api/tray";
import { openUrl } from "@tauri-apps/plugin-opener";
import { exit, relaunch } from "@tauri-apps/plugin-process";
import { watchDebounced } from "@vueuse/core";
import { watch } from "vue";
import { useI18n } from "vue-i18n";

import { GITHUB_LINK, GITHUB_LINK_CHILL, LISTEN_KEY } from "../constants";
import { showWindow } from "../plugins/window";
import { isMac } from "../utils/platform";

import { useSharedMenu } from "./useSharedMenu";

import { useCatStore } from "@/stores/cat";

const TRAY_ID = "BONGO_CAT_TRAY";

export function useTray() {
  const catStore = useCatStore();
  const { getSharedMenu } = useSharedMenu();

  // Use vue-i18n for tray menu translations
  const { t } = useI18n();

  // Rebuild tray menu when locale changes
  const { locale } = useI18n();

  watch(locale, () => {
    updateTrayMenu();
  });

  watch([() => catStore.visible, () => catStore.penetrable], () => {
    updateTrayMenu();
  });

  watchDebounced(
    [() => catStore.scale, () => catStore.opacity],
    () => {
      updateTrayMenu();
    },
    { debounce: 200 }
  );

  const createTray = async () => {
    const tray = await getTrayById();

    if (tray) return;

    const appName = await getName();
    const appVersion = await getVersion();

    const menu = await getTrayMenu();

    const path = isMac ? "assets/tray-mac.png" : "assets/tray.png";
    const icon = await resolveResource(path);

    const options: TrayIconOptions = {
      menu,
      icon,
      id: TRAY_ID,
      tooltip: `${appName} v${appVersion}`,
      iconAsTemplate: true,
      menuOnLeftClick: true,
    };

    return TrayIcon.new(options);
  };

  const getTrayById = () => {
    return TrayIcon.getById(TRAY_ID);
  };

  const getTrayMenu = async () => {
    const appVersion = await getVersion();

    const items = await Promise.all([
      ...(await getSharedMenu()),
      PredefinedMenuItem.new({ item: "Separator" }),
      // Replaced hardcoded text with translation key
      MenuItem.new({
        text: t("trayMenu.checkUpdate"),
        action: () => {
          showWindow();
          emit(LISTEN_KEY.UPDATE_APP);
        },
      }),
      MenuItem.new({
        text: t("trayMenu.openSource"),
        action: () => openUrl(GITHUB_LINK),
      }),
      MenuItem.new({
        text: `${t("trayMenu.openSource")} (Chill4Share)`,
        action: () => openUrl(GITHUB_LINK_CHILL),
      }),
      PredefinedMenuItem.new({ item: "Separator" }),
      MenuItem.new({
        text: `${t("trayMenu.version")} v${appVersion}`,
        enabled: false,
      }),
      MenuItem.new({
        text: t("trayMenu.restart"),
        action: async () => {
          catStore.reset();
          await new Promise((resolve) => setTimeout(resolve, 300));
          relaunch();
        },
      }),
      MenuItem.new({
        text: t("trayMenu.exit"),
        accelerator: isMac ? "Cmd+Q" : "",
        action: () => exit(0),
      }),
    ]);

    return Menu.new({ items });
  };

  const updateTrayMenu = async () => {
    const tray = await getTrayById();

    if (!tray) return;

    const menu = await getTrayMenu();

    tray.setMenu(menu);
  };

  return {
    createTray,
  };
}
