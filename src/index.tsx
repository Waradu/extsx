import { renderToStaticMarkup } from "react-dom/server";
import Template from "./template";
import path from "path";
import type { Express, Request, Response, NextFunction } from "express";
import { Readable } from "stream";

type KeyValue = { [key: string]: any };

interface Options {
  app?: KeyValue;
  template?: string;
}

type TemplateProps = {
  App: React.ReactElement;
  [key: string]: any;
};

interface SetupOptions {
  template?: string;
  templatePath?: string;
  viewPath?: string;
  stream?: boolean;
}

const defaultOptions: SetupOptions = {
  templatePath: "templates",
  viewPath: "views",
  stream: true,
};

interface IntSetupOptions extends SetupOptions {
  templatePath: string;
  viewPath: string;
  stream: boolean;
}

const load = <T extends any>(path: string) => {
  try {
    return require(path).default as React.ComponentType<T>;
  } catch {
    return undefined;
  }
};

declare global {
  namespace Express {
    interface Response {
      renderTsx(view: string, data?: KeyValue, options?: Options): void;
    }
  }
}

export const use = (app: Express, setupOptions?: SetupOptions) => {
  const intSetupOptions = {
    ...defaultOptions,
    ...setupOptions,
  } as IntSetupOptions;

  const middleware = (req: Request, res: Response, next: NextFunction) => {
    const StreamToClient = (stream: NodeJS.ReadableStream) => {
      stream.on("data", (chunk) => {
        return res.write(chunk);
      });
      stream.on("end", () => {
        return res.end();
      });
    };

    const StringToClient = (str: string) => {
      return res.send(str);
    };

    const ErrorToClient = (error: any) => {
      console.error(error);
      res.send("An Error occured");
    };

    const render = (component: React.ReactNode) => {
      const html = "<!DOCTYPE html>" + renderToStaticMarkup(component);

      const encoder = new TextEncoder();
      const encoded = encoder.encode(html);

      return Readable.from(encoded);
    };

    res.renderTsx = (view: string, data?: KeyValue, options?: Options) => {
      res.set("Content-Type", "text/html");

      let CustomTemplate: React.ComponentType<TemplateProps> | undefined =
        Template;

      try {
        const Component = load(
          path.join(process.cwd(), intSetupOptions.viewPath, view)
        );

        if (!Component) {
          throw new Error(
            `View '${view}' not found in '${intSetupOptions.viewPath}'`
          );
        }

        if (intSetupOptions.template && !options?.template) {
          const template = load<TemplateProps>(
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
          const template = load<TemplateProps>(
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

        StreamToClient(
          render(
            <CustomTemplate {...options?.app} App={<Component {...data} />} />
          )
        );
      } catch (error: any) {
        if (view != "error") {
          const Component = load<{ error: any }>(
            path.join(process.cwd(), intSetupOptions.viewPath, "error")
          );

          if (Component) {
            StreamToClient(render(<Component error={error} />));
          }
        }

        ErrorToClient(error);
      }
    };

    return next();
  };

  app.use(middleware);
};

export default {
  use,
};
