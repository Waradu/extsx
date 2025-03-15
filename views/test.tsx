import Greet from "../components/Greet";

const App = ({ name }: { name: string }) => {
  return (
    <html>
      <head>
        <title>Hello from TSX!</title>
      </head>
      <body>
        <button onClick={() => alert("Hello")}>hey</button>
        <Greet name={name} />
      </body>
    </html>
  );
};

export default App;
