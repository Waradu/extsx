import type { Config, CreateConfig } from "../types";

export const config = (config: CreateConfig): Config => {
  const conf: Config = {
    head: {
      title: config.title,
      styles: config.styles?.map((s) => ({
        src: s,
      })),
      scripts: config.scripts?.map((s) => ({
        src: s,
      })),
      metas: config.metas?.map((s) => ({
        name: s.name,
        content: s.content,
      })),
    },
  };

  return conf;
};
