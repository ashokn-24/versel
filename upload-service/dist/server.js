"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const simple_git_1 = __importDefault(require("simple-git"));
const generateId_1 = require("./utils/generateId");
const path_1 = __importDefault(require("path"));
const aws_1 = require("./utils/aws");
const redis_1 = require("redis");
const fs_1 = __importDefault(require("fs"));
const publisher = (0, redis_1.createClient)();
publisher.connect();
const app = (0, express_1.default)();
const git = (0, simple_git_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post("/deploy", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = req.body.repoUrl;
        console.log(`Cloning repo: ${repo}`);
        const id = (0, generateId_1.generateId)();
        const repoPath = path_1.default.join(__dirname, `repos/${id}`);
        yield (0, simple_git_1.default)().clone(repo, repoPath);
        console.log(`Cloned to: ${repoPath}`);
        yield new Promise((resolve) => setTimeout(resolve, 1000));
        yield (0, aws_1.uploadDirectory)(repoPath, "newRepo");
        console.log(`Uploadind to Cloud: ${repoPath}`);
        fs_1.default.rmSync(repoPath, { recursive: true, force: true });
        publisher.lPush("build-que", id);
        console.log(`Pushed to Redis Queue for Build ID: ${id}`);
        res.json({ id, message: "Uploading successful!" });
    }
    catch (error) {
        console.log(error);
    }
}));
app.listen(3000, () => {
    console.log(`Server is Listening on 3000`);
});
