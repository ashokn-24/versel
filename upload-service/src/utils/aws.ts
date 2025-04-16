import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";
import mime from "mime-types";

const s3 = new S3({
  accessKeyId: "97d9a8a13964be76824283722e96811b",
  secretAccessKey:
    "b038c1216bb4f0dacadb5b96446fceeec239cff4ba02cf95ee65be61ce6c30c6",
  endpoint: "https://ee31c6ba934114afc276fc43ca72c95f.r2.cloudflarestorage.com",
});

export const uploadFile = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);
  const contentType = mime.lookup(localFilePath) || "application/octet-stream";
  const res = await s3
    .upload({
      Body: fileContent,
      Bucket: "vercel",
      Key: fileName,
      ContentType: contentType,
    })
    .promise();
  console.log(res);
};

export const uploadDirectory = async (
  localDirPath: string,
  bucketPath: string = ""
) => {
  const files = fs.readdirSync(localDirPath);

  for (const file of files) {
    const fullLocalPath = path.join(localDirPath, file);
    const stats = fs.statSync(fullLocalPath);

    if (stats.isFile()) {
      const fileKey = bucketPath ? `${bucketPath}/${file}` : file;
      await uploadFile(fileKey, fullLocalPath);
    } else if (stats.isDirectory()) {
      const newBucketPath = bucketPath ? `${bucketPath}/${file}` : file;
      await uploadDirectory(fullLocalPath, newBucketPath);
    }
  }
};
