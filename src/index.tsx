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
  stream: true,
  language: "tsx",
};

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

    const ErrorToClient = (error: any) => {
      console.error(error);
      res.send("An Error occured");
    };

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

        const config = {
          ...(intSetupOptions?.globalConfig || {}),
          ...(options?.config || {}),
        };

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
        if (view != intSetupOptions.errorView) {
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
