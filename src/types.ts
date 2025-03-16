export type KeyValue = { [key: string]: any };

export interface Meta extends KeyValue {
  name?: string;
  content?: string;
  charset?: string;
  httpEquiv?: string;
  property?: string;
}

export interface Scripts {
  src?: string;
  charset?: string;
  srcContents?: string;
  type?: string;
  async?: boolean;
  defer?: boolean;
}

export interface Styles {
  style?: string;
  src?: string;
  type?: string;
}

export interface Head extends KeyValue {
  title?: string;
  scripts?: Scripts[];
  metas?: Meta[];
  styles?: Styles[];
}

export interface Config extends KeyValue {
  head?: Head;
  bodyAttrs?: KeyValue;
  htmlAttrs?: KeyValue;
}

export interface Options {
  template?: string | false;
  config?: Config;
}

export interface TemplateProps {
  children: React.ReactElement;
  config?: KeyValue;
  [key: string]: any;
}

export type Languages = "tsx" | "jsx";

export interface SetupOptions {
  template?: string | false;
  templatePath?: string;
  viewPath?: string;
  errorView?: string;
  stream?: boolean;
  publicPath?: string | false;
  globalConfig?: Config;
  language?: Languages;
}

export interface IntSetupOptions extends SetupOptions {
  templatePath: string;
  viewPath: string;
  stream: boolean;
  publicPath: string | false;
  errorView: string;
  language: Languages;
}

declare global {
  namespace Express {
    interface Response {
      renderTsx(view: string, data?: KeyValue, options?: Options): void;
    }
  }
}

export interface CreateConfig {
  title?: string;
  styles?: string[];
  scripts?: string[];
}
