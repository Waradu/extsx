import { renderToStaticMarkup } from "react-dom/server";
import Template from "./template";
import path from "path";
import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { Readable } from "stream";

type KeyValue = { [key: string]: any };

export interface Config extends KeyValue {
  head?: {
    title?: string;
    scripts?: {
      src?: string;
      charset?: string;
      srcContents?: string;
      type?: string;
      async?: boolean;
      defer?: boolean;
    }[];
    metas?: any[];
    styles?: { style?: string; src?: string; type?: string }[];
  };
}

interface Options {
  template?: string | false;
  config?: Config;
}

interface TemplateProps {
  children: React.ReactElement;
  config?: KeyValue;
  [key: string]: any;
}

interface SetupOptions {
  template?: string | false;
  templatePath?: string;
  viewPath?: string;
  errorView?: string;
  stream?: boolean;
  publicPath?: string | false;
  globalConfig?: Config;
}

const defaultOptions: SetupOptions = {
  templatePath: "templates",
  viewPath: "views",
  publicPath: "public",
  errorView: "error",
  stream: true,
};

interface IntSetupOptions extends SetupOptions {
  templatePath: string;
  viewPath: string;
  stream: boolean;
  publicPath: string | false;
  errorView: string;
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

      return Readable.from(Buffer.from(encoded));
    };

    res.renderTsx = (view: string, data?: KeyValue, options?: Options) => {
      res.set("Content-Type", "text/html");

      let CustomTemplate: React.ComponentType<TemplateProps> =
        Template as React.ComponentType<TemplateProps>;

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

        const config = {
          ...(intSetupOptions?.globalConfig || {}),
          ...(options?.config || {}),
        };

        StreamToClient(
          render(
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
          const Component = load<{ error: any }>(
            path.join(
              process.cwd(),
              intSetupOptions.viewPath,
              intSetupOptions.errorView
            )
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
  if (intSetupOptions.publicPath != false) {
    app.use(
      express.static(path.join(process.cwd(), intSetupOptions.publicPath))
    );
  }
};

interface CreateConfig {
  title?: string;
  styles?: string[];
  scripts?: string[];
}

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

export default {
  use,
  config,
};
