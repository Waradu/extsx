import type { Config, CreateConfig } from "../types";

export const config = (config: CreateConfig) => {
  return {
    head: {
      title: config.title,
      styles: config.styles?.map((s) => ({
        src: s,
      })),
      scripts: config.scripts?.map((s) => ({
        src: s,
      })),
    },
  } as Config;
};
