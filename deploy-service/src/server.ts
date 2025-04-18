import express from "express";
import cors from "cors";
import simpleGit from "simple-git";

const app = express();
const git = simpleGit();

app.use(cors());
app.use(express.json());


app.listen(4000, () => {
  console.log(`Deploying server is Listening on http://localhost:4000`);
});
