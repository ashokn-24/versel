import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { createClient, commandOptions } from "redis";
import { downloadFromR2 } from "./cloudFlare";

const app = express();
const git = simpleGit();
const redisServer = createClient();
redisServer.connect();

app.use(cors());
app.use(express.json());

redisServer.on("connect", () => {
  console.log("Connected to Redis!");
});

(async () => {
  while (1) {
    const res = await redisServer.brPop(
      commandOptions({ isolated: true }),
      "build-que",
      0
    );
    downloadFromR2(`newRepo/${res?.element}`);
    // downloadFromR2(`newRepo/3boai`)
    console.log(res);
  }
  console.log(`Deploying server is runnig`);
})();

// app.listen(4000, () => {
//   console.log(`Deploying server is Listening on http://localhost:4000`);
// });
