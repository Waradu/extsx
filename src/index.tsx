import Template from "./templates/Base.js";
import path from "path";
import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import _ from "lodash";
import { register } from "esbuild-register/dist/node";
import type {
  Config,
  IntSetupOptions,
  Options,
  SetupOptions,
  TemplateProps,
} from "./types.js";
import { Render } from "./utils/render.js";
import { config } from "./utils/config.js";
import fs from "fs/promises";
import { transform } from "esbuild";
import { createRequire } from "module";
import { pathToFileURL } from "url";
const require = createRequire(import.meta.url);

const jsxRuntimePath = require.resolve("react/jsx-runtime");
const jsxRuntimeUrl = pathToFileURL(jsxRuntimePath).href;

register();

const defaultOptions: SetupOptions = {
  templatePath: "templates",
  viewPath: "views",
  publicPath: "public",
  errorView: "error",
  language: "tsx",
  onError: (error: any, res: Response) => {
    console.error(error);
    res.send("An Error occured");
  },
};

const use = (app: Express, setupOptions?: SetupOptions) => {
  const intSetupOptions = _.merge(
    {},
    defaultOptions,
    setupOptions
  ) as IntSetupOptions;

  const defaultConfig: Config = {
    head: {
      metas: [
        {
          charSet: "UTF-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1.0",
        },
      ],
    },
  };

  const load = async <T extends any>(path: string) => {
    try {
      const componentPath = path + "." + intSetupOptions.language;
      const code = await fs.readFile(componentPath, "utf-8");

      const result = await transform(code, {
        loader: intSetupOptions.language,
        target: "esnext",
        format: "esm",
        jsx: "automatic",
        jsxImportSource: "react",
      });

      let transformedCode = result.code.replace(
        /(["'])react\/jsx-runtime\1/g,
        `"${jsxRuntimeUrl}"`
      );

      const componentUrl =
        "data:text/javascript;base64," +
        Buffer.from(transformedCode).toString("base64");
      const component = await import(componentUrl);
      return component.default as React.ComponentType<T>;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  };

  const middleware = (req: Request, res: Response, next: NextFunction) => {
    const StreamToClient = (stream: NodeJS.ReadableStream) => {
      stream.on("data", (chunk) => {
        return res.write(chunk);
      });
      stream.on("end", () => {
        return res.end();
      });
    };

    const ErrorToClient = (error: any) => intSetupOptions.onError(error, res);

    res.renderTsx = async (
      view: string,
      data?: Record<string, any>,
      options?: Options
    ) => {
      res.set("Content-Type", "text/html");

      let CustomTemplate: React.ComponentType<TemplateProps> =
        Template as React.ComponentType<TemplateProps>;

      try {
        const Component = await load(
          path.join(process.cwd(), intSetupOptions.viewPath, view)
        );

        if (!Component) {
          throw new Error(
            `View '${view}' not found in '${intSetupOptions.viewPath}'`
          );
        }

        if (intSetupOptions.template && !options?.template) {
          const template = await load<TemplateProps>(
            path.join(
              process.cwd(),
              intSetupOptions.templatePath,
              intSetupOptions.template
            )
          );

          if (!template) {
            throw new Error(
              `Global Template Component '${intSetupOptions.template}' not found in '${intSetupOptions.templatePath}'`
            );
          }

          CustomTemplate = template;
        }

        if (options?.template) {
          const template = await load<TemplateProps>(
            path.join(
              process.cwd(),
              intSetupOptions.templatePath!,
              options.template
            )
          );

          if (!template) {
            throw new Error(
              `Template Component '${options.template}' not found in '${intSetupOptions.templatePath}'`
            );
          }

          CustomTemplate = template;
        }

        const config = _.mergeWith(
          defaultConfig,
          intSetupOptions?.globalConfig,
          options?.config,
          (objValue: any, srcValue: any) => {
            if (Array.isArray(objValue)) {
              return objValue.concat(srcValue);
            }
          }
        );

        const viewData = _.mergeWith(
          {},
          setupOptions?.globalData,
          data,
          (objValue: any, srcValue: any) => {
            if (Array.isArray(objValue)) {
              return objValue.concat(srcValue);
            }
          }
        );

        StreamToClient(
          Render(
            (intSetupOptions.template == false && !options?.template) ||
              options?.template == false ? (
              <Component {...viewData} />
            ) : (
              <CustomTemplate config={config}>
                <Component {...viewData} />
              </CustomTemplate>
            )
          )
        );
      } catch (error: any) {
        if (
          !(intSetupOptions.errorView == false) &&
          view != intSetupOptions.errorView
        ) {
          const Component = await load<{ error: any }>(
            path.join(
              process.cwd(),
              intSetupOptions.viewPath,
              intSetupOptions.errorView
            )
          );

          if (Component) {
            StreamToClient(
              Render(
                <Template config={defaultConfig}>
                  <Component error={error} />
                </Template>
              )
            );
            return;
          }
        }

        ErrorToClient(error);
      }
    };

    return next();
  };

  app.use(middleware);
  if (intSetupOptions.publicPath != false) {
    app.use(
      express.static(path.join(process.cwd(), intSetupOptions.publicPath))
    );
  }
};

export default {
  /**
   * Sets up the extsx app with the provided configuration.
   *
   * @param {Express} app - The Express app instance.
   * @param {SetupOptions} [setupOptions] - Optional setup configuration.
   *
   * @example
   * extsx.use(app, {
   *   template: undefined,
   *   templatePath: "templates",
   *   viewPath: "views",
   *   errorView: "error",
   *   publicPath: "public",
   *   globalConfig: {},
   *   globalData: {},
   *   language: "tsx",
   *   onError: (error, res) => {
   *     console.error(error);
   *     res.send("An Error occurred");
   *   },
   * });
   */
  use,
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
   *   metas: [{ name: "description", content: "My website" }],
   *   favIcon: { href: "favicon.ico" }
   * });
   */
  config,
};
