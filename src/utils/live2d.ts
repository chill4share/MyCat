import type { ModelSize } from "@/composables/useModel";
import type { Cubism4InternalModel } from "pixi-live2d-display";

import { convertFileSrc } from "@tauri-apps/api/core";
import { readDir, readTextFile } from "@tauri-apps/plugin-fs";
import { Cubism4ModelSettings, Live2DModel } from "pixi-live2d-display";
import { Application, Ticker } from "pixi.js";

import { join } from "./path";
import { i18n } from "@/i18n";

Live2DModel.registerTicker(Ticker);

// --- thêm token để phân biệt lượt load ---
let _loadToken = 0;

type LoadResult = {
  width: number;
  height: number;
  motions: any;
  expressions: any;
};

class Live2d {
  private app: Application | null = null;
  public model: Live2DModel | null = null;

  private lastLoadPromise: Promise<LoadResult> | null = null;

  constructor() {}

  private initApp() {
    if (this.app) return;

    const view = document.getElementById("live2dCanvas") as HTMLCanvasElement;
    this.app = new Application({
      view,
      resizeTo: window,
      backgroundAlpha: 0,
      resolution: devicePixelRatio,
    });
  }

  public async load(path: string) {
    this.initApp();

    const token = ++_loadToken;

    const loadPromise = (async (): Promise<LoadResult> => {
      const files = await readDir(path);
      const modelFile = files.find((file) =>
        file.name.endsWith(".model3.json")
      );
      if (!modelFile) {
        throw new Error(i18n.global.t("model.load.error.notFound"));
      }

      const modelPath = join(path, modelFile.name);
      const modelJSON = JSON.parse(await readTextFile(modelPath));

      const modelSettings = new Cubism4ModelSettings({
        ...modelJSON,
        url: convertFileSrc(modelPath),
      });

      modelSettings.replaceFiles((file) => convertFileSrc(join(path, file)));

      const createdModel = await Live2DModel.from(modelSettings);

      // nếu có lượt load mới hơn -> hủy model vừa tạo, trả về kết quả của lần mới
      if (token !== _loadToken) {
        try {
          createdModel.destroy({
            children: true,
            texture: true,
            baseTexture: true,
          });
        } catch {}
        return await (this.lastLoadPromise as Promise<LoadResult>);
      }

      // huỷ model cũ sau khi model mới đã tạo xong
      if (this.model) {
        try {
          if (this.model.parent) {
            this.model.parent.removeChild(this.model);
          } else {
            this.app?.stage.removeChild(this.model);
          }
          this.model.destroy({
            children: true,
            texture: true,
            baseTexture: true,
          });
        } catch (err) {
          console.warn("[live2d.destroy-old] warning:", err);
        }
      }

      this.model = createdModel;
      this.app?.stage.addChild(this.model);

      const { width, height } = this.model;
      const { motions, expressions } = modelSettings;
      return { width, height, motions, expressions };
    })();

    this.lastLoadPromise = loadPromise;
    return await loadPromise;
  }

  /** Hủy model hiện tại một cách an toàn */
  public destroy() {
    if (!this.model) return;
    try {
      if (this.model.parent) {
        this.model.parent.removeChild(this.model);
      } else {
        this.app?.stage.removeChild(this.model);
      }
      this.model.destroy({
        children: true,
        texture: true,
        baseTexture: true,
      });
    } catch (err) {
      console.warn("[live2d.destroy] warning:", err);
    } finally {
      this.model = null;
    }
  }

  public resizeModel(modelSize: ModelSize) {
    if (!this.model) return;
    const { width, height } = modelSize;
    const scaleX = innerWidth / width;
    const scaleY = innerHeight / height;
    const scale = Math.min(scaleX, scaleY);

    this.model.scale.set(scale);
    this.model.x = innerWidth / 2;
    this.model.y = innerHeight / 2;

    // anchor có thể không tồn tại, nên check an toàn
    const anyModel = this.model as unknown as {
      anchor?: { set?: (x: number, y?: number) => void };
    };
    anyModel.anchor?.set?.(0.5);
  }

  public playMotion(group: string, index: number) {
    return this.model?.motion(group, index);
  }

  public playExpressions(index: number) {
    return this.model?.expression(index);
  }

  public getCoreModel() {
    const internalModel = this.model?.internalModel as Cubism4InternalModel;
    return internalModel?.coreModel;
  }

  public getParameterRange(id: string) {
    const coreModel = this.getCoreModel();
    const index = coreModel?.getParameterIndex(id);
    const min = coreModel?.getParameterMinimumValue(index);
    const max = coreModel?.getParameterMaximumValue(index);
    return { min, max };
  }

  public setParameterValue(id: string, value: number | boolean) {
    const coreModel = this.getCoreModel();
    return coreModel?.setParameterValueById?.(id, Number(value));
  }
}

const live2d = new Live2d();
export default live2d;
