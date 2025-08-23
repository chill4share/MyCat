import { resolveResource } from "@tauri-apps/api/path";
import { exists, readDir } from "@tauri-apps/plugin-fs";
import { filter, find } from "es-toolkit/compat";
import { nanoid } from "nanoid";
import { defineStore } from "pinia";
import { reactive, ref } from "vue";

import { join } from "@/utils/path";

/**
 * ModelMode = string để tự do, không giới hạn 3 loại
 */
export type ModelMode = string;

export interface Model {
  id: string;
  name: string; // Tên model (Cat, Aiseya…)
  path: string; // path tới thư mục mode
  mode: ModelMode; // bất kỳ thư mục con nào
  isPreset: boolean;
}

interface Motion {
  Name: string;
  File: string;
  Sound?: string;
  FadeInTime: number;
  FadeOutTime: number;
  Description?: string;
}

type MotionGroup = Record<string, Motion[]>;

interface Expression {
  Name: string;
  File: string;
  Description?: string;
}

export const useModelStore = defineStore(
  "model",
  () => {
    const models = ref<Model[]>([]);
    const currentModel = ref<Model>();
    const motions = ref<MotionGroup>({});
    const expressions = ref<Expression[]>([]);
    const supportKeys = reactive<Record<string, string>>({});
    const pressedKeys = reactive<Record<string, string>>({});

    const init = async () => {
      const modelsRoot = await resolveResource("assets/models");

      const userModels = filter(models.value, { isPreset: false });
      const presetModels = filter(models.value, { isPreset: true });

      const discovered: Model[] = [];

      // Đọc tất cả thư mục model trong assets/models
      const modelDirs = await readDir(modelsRoot).catch(() => []);

      for (const modelDir of modelDirs) {
        if (!modelDir.isDirectory) continue;

        const modelName = modelDir.name;

        // Đọc toàn bộ subfolder thay vì fix 3 mode
        const modeDirs = await readDir(join(modelsRoot, modelName)).catch(
          () => []
        );
        for (const modeDir of modeDirs) {
          if (!modeDir.isDirectory) continue;

          const mode = modeDir.name;
          const modePath = join(modelsRoot, modelName, mode);

          const ok = await exists(modePath).catch(() => false);
          if (!ok) continue;

          discovered.push({
            id: find(presetModels, { path: modePath })?.id ?? nanoid(),
            name: modelName,
            mode,
            isPreset: true,
            path: modePath,
          });
        }
      }

      // Sắp xếp: theo tên model, rồi theo mode alphabet
      discovered.sort(
        (a, b) => a.name.localeCompare(b.name) || a.mode.localeCompare(b.mode)
      );

      const nextModels = [...userModels, ...discovered];

      // Giữ model cũ nếu còn, nếu không chọn cái đầu (Bongo cat)
      const matched = find(nextModels, { id: currentModel.value?.id });
      currentModel.value = matched ?? nextModels[3];

      models.value = nextModels;
    };

    return {
      models,
      currentModel,
      motions,
      expressions,
      supportKeys,
      pressedKeys,
      init,
    };
  },
  {
    tauri: {
      filterKeys: ["models", "currentModel"],
      filterKeysStrategy: "pick",
    },
  }
);
