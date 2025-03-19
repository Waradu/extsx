import type { Config, CreateConfig } from "../types";

export const config = (config: CreateConfig): Config => {
  const conf: Config = {
    head: {
      title: config.title,
      ...(config.styles?.length && {
        links: config.styles.map((s) => ({
          href: s,
          rel: "stylesheet",
        })),
      }),
      ...(config.scripts?.length && {
        scripts: config.scripts.map((s) => ({
          src: s,
        })),
      }),
      ...(config.metas?.length && {
        metas: config.metas.map((s) => ({
          name: s.name,
          content: s.content,
        })),
      }),
    },
  };

  if (config.favIcon && conf.head?.links) {
    conf.head.links.push({
      rel: "icon",
      href: config.favIcon.href,
      type: config.favIcon.type,
    });
  }

  return conf;
};
