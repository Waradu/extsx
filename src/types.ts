import type { Response } from "express";

export type KeyValue = { [key: string]: any };

export interface Meta extends KeyValue {
  name?: string;
  content?: string;
  charSet?: string;
  httpEquiv?: string;
  property?: string;
}

export interface Scripts {
  src: string;
  charset?: string;
  type?: string;
  async?: boolean;
  defer?: boolean;
}

export interface Links {
  rel?: string;
  href?: string;
  type?: string;
}

export interface Head extends KeyValue {
  title?: string;
  scripts?: Scripts[];
  metas?: Meta[];
  links?: Links[];
}

export interface Config extends KeyValue {
  head?: Head;
  bodyAttrs?: KeyValue;
  htmlAttrs?: KeyValue;
}

export interface Options {
  /**
   * Default template to use, uses the extsx tempalte if undefined. false to disable
   */
  template?: string | false;
  /**
   * Template config like head, bodyAttrs and htmlAttrs
   */
  config?: Config;
}

export interface TemplateProps {
  children: React.ReactElement;
  config?: KeyValue;
  [key: string]: any;
}

export type Languages = "tsx" | "jsx";

export interface SetupOptions {
  /**
   * Default template to use, uses the extsx tempalte if undefined. false to disable
   */
  template?: string | false;
  /**
   * Templates path
   */
  templatePath?: string;
  /**
   * Views path
   */
  viewPath?: string;
  /**
   * Custom error view name, false to disable the error view
   */
  errorView?: string | false;
  /**
   * Path to public folder path for css, images etc. false to disable
   */
  publicPath?: string | false;
  /**
   * Default template config like head, bodyAttrs and htmlAttrs
   */
  globalConfig?: Config;
  /**
   * Default view data
   */
  globalData?: KeyValue;
  /**
   * Component language "tsx" or "jsx"
   */
  language?: Languages;
  /**
   * Called if no error template is specified or error template has an error
   */
  onError?: (error: any, res: Response) => void;
}

export interface IntSetupOptions extends SetupOptions {
  templatePath: string;
  viewPath: string;
  publicPath: string | false;
  errorView: string | false;
  language: Languages;
  onError: (error: any, res: Response) => void;
}

declare global {
  namespace Express {
    interface Response {
      /**
       * Renders a TSX view with the provided data and options.
       *
       * @param {string} view - The name of the TSX view to render.
       * @param {KeyValue} [data] - Data to pass to the view.
       * @param {Options} [options] - Optional rendering options.
       *
       * @example
       * renderTsx("index", { userName: "Waradu" });
       */
      renderTsx(view: string, data?: KeyValue, options?: Options): void;
    }
  }
}

export interface CreateConfig {
  /**
   * The The title of the document.
   */
  title?: string;
  /**
   * Array of css file paths.
   */
  styles?: string[];
  /**
   * Array of script file paths.
   */
  scripts?: string[];
  /**
   * Array of meta tags.
   */
  metas?: { name: string; content: string }[];
  /**
   * Custom Favicon
   */
  favIcon?: {
    href: string;
    type?: string;
  };
}
