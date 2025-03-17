import type { Config, CreateConfig } from "../types";

/**
 * Creates a configuration object based on the provided input.
 *
 * @param {CreateConfig} config - The configuration input.
 * @returns {Config} The generated configuration object.
 *
 * @example
 * const conf = config({
 *   title: "My Page",
 *   styles: ["/styles.css"],
 *   scripts: ["/script.js"],
 *   metas: [{ name: "description", content: "My website" }]
 * });
 */
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
