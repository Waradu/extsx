# Extsx

Extsx (pronounced 'ecstesyx') is a TSX/JSX rendering engine for express.

## install

```bash
bun install extsx react-dom
bun install @types/react-dom # if you are working with tsx instead of jsx
```

## Example

server.ts

```ts
import extsx from "extsx";

extsx.use(app);

app.get("/hello/:name", (req, res, next) => {
  res.renderTsx("hello", { name: req.params.name });
});
```

views/hello.tsx

```tsx
import Greet from "../components/Greet";

const App = ({ name }: { name: string }) => {
  return (
    <html>
      <head>
        <title>Hello from TSX!</title>
      </head>
      <body>
        <Greet name={name} />
      </body>
    </html>
  );
};

export default App;
```

components/Greet.tsx

```tsx
const App = ({ name }: { name: string }) => {
  return <h1>Hello, {name}!</h1>;
};

export default App;
```

## Docs

`extsx.use`

This is used to setup the extsx app. You can configure it as follows:

```ts
extsx.use(app, {
  /* default template to use, uses the extsx tempalte if undefined. false to disable */
  template: undefined,
  /* template path */
  templatePath: "templates",
  /* view path */
  viewPath: "views",
  /* custom error view name, false to disable the error view */
  errorView: "error",
  /* path to public folder path for css, images etc. false to disable */
  publicPath: "public",
  /* default template config like head, bodyAttrs and htmlAttrs */
  globalConfig: {},
  /* default view data */
  globalData: {},
  /* component language "tsx" or "jsx" */
  language: "tsx",
  /* called if no error template is specified or error template has an error */
  onError: (error, res) => {
    console.error(error);
    res.send("An Error occured");
  },
});
```

For custom templates it is recommended to implement the config like following (children and config parameters are required):

```tsx
import type { Config } from "extsx/dist/types";
import Head from "extsx/dist/templates/Head";

const Template = ({
  children,
  config,
}: {
  children: React.ReactNode;
  config: Config;
}) => {
  return (
    <html {...config.htmlAttrs}>
      <Head head={config.head} />
      <body {...config.bodyAttrs}>{children}</body>
    </html>
  );
};

export default Template;
```

A custom error page should look like (error parameter is required):

```tsx
const Error = ({ error }: { error: Error }) => {
  return (
    <html>
      <head>
        <title>Error</title>
      </head>
      <body>
        <h1>{error.message}</h1>
      </body>
    </html>
  );
};

export default Error;
```

---

`res.renderTsx`

Render a tsx response.

```ts
res.renderTsx(
  /* view name */
  "home",
  /* view data */
  {
    authentificatedUser: {
      name: "Waradu",
    },
  },
  /* options */
  {
    /* template to use, uses the extsx/default tempalte if undefined */
    template: undefined,
    /* template config like head, bodyAttrs and htmlAttrs */
    config: {},
  }
);
```

---

`extsx.config`

To easly apply `globalConfig` and/or `config` in `extsx.use` or `res.renderTsx` there is a helper function.

```ts
{
  config: extsx.config({
    title: "Homepage",
    styles: ["/styles/home.css"],
    scripts: ["/scripts/home.js"],
  });
}
```
