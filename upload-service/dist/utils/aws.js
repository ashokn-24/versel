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
exports.uploadDirectory = exports.uploadFile = void 0;
const aws_sdk_1 = require("aws-sdk");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const s3 = new aws_sdk_1.S3({
    accessKeyId: "97d9a8a13964be76824283722e96811b",
    secretAccessKey: "b038c1216bb4f0dacadb5b96446fceeec239cff4ba02cf95ee65be61ce6c30c6",
    endpoint: "https://ee31c6ba934114afc276fc43ca72c95f.r2.cloudflarestorage.com",
});
const uploadFile = (fileName, localFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    const fileContent = fs_1.default.readFileSync(localFilePath);
    const res = yield s3
        .upload({
        Body: fileContent,
        Bucket: "vercel",
        Key: fileName,
    })
        .promise();
    console.log(res);
});
exports.uploadFile = uploadFile;
const uploadDirectory = (localDirPath_1, ...args_1) => __awaiter(void 0, [localDirPath_1, ...args_1], void 0, function* (localDirPath, bucketPath = "") {
    const files = fs_1.default.readdirSync(localDirPath);
    for (const file of files) {
        const fullLocalPath = path_1.default.join(localDirPath, file);
        const stats = fs_1.default.statSync(fullLocalPath);
        if (stats.isFile()) {
            // For files, construct the key with the directory structure
            const fileKey = bucketPath ? `${bucketPath}/${file}` : file;
            yield (0, exports.uploadFile)(fileKey, fullLocalPath);
        }
        else if (stats.isDirectory()) {
            // For directories, recurse with updated bucket path
            const newBucketPath = bucketPath ? `${bucketPath}/${file}` : file;
            yield (0, exports.uploadDirectory)(fullLocalPath, newBucketPath);
        }
    }
});
exports.uploadDirectory = uploadDirectory;
