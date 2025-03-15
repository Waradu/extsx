import { renderToStaticMarkup } from "react-dom/server";
import Template from "./template";
import path from "path";

interface ExTsxOptions {
  title?: string;
}

interface Options {
  app?: ExTsxOptions;
  [key: string]: any;
}

type TemplateProps = {
  App: React.ReactElement;
  [key: string]: any;
};

interface SetupOptions {
  template?: string;
  templatePath: string;
}

const defaultOptions: SetupOptions = {
  templatePath: "templates",
};

export const esTsxSetup = (setupOptions: Partial<SetupOptions>) => {
  const intSetupOptions = {
    ...defaultOptions,
    ...setupOptions,
  } as SetupOptions;

  const render = (
    view: string,
    options: object,
    callback: (err: any, html?: string) => void
  ) => {
    const intOptions = options as Options;

    try {
      const Component = require(view).default;

      const CustomTemplate = intSetupOptions.template
        ? (require(path.join(
            process.cwd(),
            intSetupOptions.templatePath,
            intSetupOptions.template
          )).default as React.ComponentType<TemplateProps>)
        : undefined;

      const html =
        "<!DOCTYPE html>" +
        renderToStaticMarkup(
          <>
            {CustomTemplate ? (
              <CustomTemplate
                {...intOptions.app}
                App={<Component {...intOptions} />}
              />
            ) : (
              <Template
                {...intOptions.app}
                App={<Component {...intOptions} />}
              />
            )}
          </>
        );
      return callback(null, html);
    } catch (err) {
      return callback(err);
    }
  };

  return render;
};

export default esTsxSetup;
