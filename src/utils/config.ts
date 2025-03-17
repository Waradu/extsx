import type { Config, CreateConfig } from "../types";

export const config = (config: CreateConfig): Config => {
  const conf: Config = {
    head: {
      title: config.title,
      links: config.styles?.map((s) => ({
        href: s,
        rel: "stylesheet",
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
