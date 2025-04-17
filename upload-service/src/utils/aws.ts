import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";
import mime from "mime-types";

const s3 = new S3({
  accessKeyId: "",
  secretAccessKey:
    "",
  endpoint: "https://.r2.cloudflarestorage.com",
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
