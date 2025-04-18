import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generateId } from "./utils/generateId";
import path from "path";
import { uploadDirectory} from "./utils/aws";
import {createClient} from 'redis';
import fs from "fs";

const publisher =  createClient();
publisher.connect();


const app = express();
const git = simpleGit();

app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
  try {
    const repo = req.body.repoUrl;
    console.log(`Cloning repo: ${repo}`);

    const id = generateId();
    const repoPath = path.join(__dirname, `repos/${id}`);

    await simpleGit().clone(repo, repoPath);
    console.log(`Cloned to: ${repoPath}`);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await uploadDirectory(repoPath, `newRepo/${id}`);
    console.log(`Uploadind to Cloud: ${repoPath}`);

    // fs.rmSync(repoPath, { recursive: true, force: true });

    publisher.lPush("build-que", id);
    console.log(`Pushed to Redis Queue for Build ID: ${id}`);


    res.json({ id, message: "Uploading successful!" });
  } catch (error) {
    console.log(error);
  }
});

app.listen(3000, () => {
  console.log(`Uploading server is Listening on http://localhost:3000`);
});
