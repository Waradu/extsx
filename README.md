# Extsx

TSX express rendering engine.

## install

```bash
bun install extsx
bun install @types/react-dom
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
