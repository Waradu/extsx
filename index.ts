import express from "express";
import render from "./render";
const startTime = Date.now();

const app = express();
const PORT = parseInt(process.env.PORT || "4000");
app.use(express.json());
app.engine("tsx", render);
app.set("view engine", "tsx");
app.use(express.static("public"));

app.get("/test", (req, res, next) => {
  res.send();
});

app.use((req, res, next) => {
  res.render("test", { name: "World" });
});

app.listen(PORT, "0.0.0.0", () => {
  const endTime = Date.now();
  console.log(
    `Server running on http://0.0.0.0:${PORT}. Took ${
      endTime - startTime
    }ms to start.`
  );
});
