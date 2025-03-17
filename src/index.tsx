import Template from "./templates/Base";
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
  IntSetupOptions,
  KeyValue,
  Options,
  SetupOptions,
  TemplateProps,
} from "./types";
import { Render, config } from "./utils";

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

/**
 * Sets up the extsx app with the provided configuration.
 *
 * @param {Express} app - The Express app instance.
 * @param {SetupOptions} [setupOptions] - Optional setup configuration.
 * @param {string | false} [setupOptions.template] - Default template to use. If `undefined`, the default extsx template is used. Set to `false` to disable templates.
 * @param {string} [setupOptions.templatePath="templates"] - Path to the templates folder.
 * @param {string} [setupOptions.viewPath="views"] - Path to the views folder.
 * @param {string | false} [setupOptions.errorView="error"] - Name of the custom error view. Set to `false` to disable error view.
 * @param {string | false} [setupOptions.publicPath="public"] - Path to the public folder (for CSS, images, etc.). Set to `false` to disable.
 * @param {Object} [setupOptions.globalConfig] - Default template configuration (e.g., head, bodyAttrs, and htmlAttrs).
 * @param {"tsx" | "jsx"} [setupOptions.language="tsx"] - Component language. Can be `"tsx"` or `"jsx"`.
 * @param {(error: Error, res: Response) => void} [setupOptions.onError] - Called if no error template is specified or if an error occurs in the error template.
 *
 * @example
 * extsx.use(app, {
 *   template: undefined,
 *   templatePath: "templates",
 *   viewPath: "views",
 *   errorView: "error",
 *   publicPath: "public",
 *   globalConfig: {},
 *   language: "tsx",
 *   onError: (error, res) => {
 *     console.error(error);
 *     res.send("An Error occurred");
 *   },
 * });
 */
const use = (app: Express, setupOptions?: SetupOptions) => {
  const intSetupOptions = _.merge(
    {},
    defaultOptions,
    setupOptions
  ) as IntSetupOptions;

  const load = async <T extends any>(path: string) => {
    try {
      const componentPath = path + "." + intSetupOptions.language;
      const component = require(componentPath);
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
      data?: KeyValue,
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
          {},
          intSetupOptions?.globalConfig,
          options?.config,
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
              <Component {...data} />
            ) : (
              <CustomTemplate config={config}>
                <Component {...data} />
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
            StreamToClient(Render(<Component error={error} />));
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
  use,
  config,
};
