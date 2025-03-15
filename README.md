# Expretsx

TSX express rendering engine.

## install

```bash
bun install expretsx
bun install @types/react-dom
```

## Example

server.ts

```ts
import expretsx from "expretsx";

app.engine("tsx", expretsx);
app.set("view engine", "tsx");

app.get("/hello/:name", (req, res, next) => {
  res.render("hello", { name: req.params.name });
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
