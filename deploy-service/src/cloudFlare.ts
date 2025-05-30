import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import dotenv from "dotenv";
dotenv.config();

const s3 = new S3({
  accessKeyId: process.env.CLOUDFLARE_KEY,
  secretAccessKey: process.env.CLOUDFLARE_SECRET,
  endpoint: process.env.CLOUDFLARE_END_POINT,
});

const bucketName = process.env.BUCKET_NAME;
const localDownloadPath = "./dist/downlaods ";

// vercel/newRepo/id
export const downloadFromR2 = async (prefix: string) => {
  console.log(prefix);
  const files = await s3
    .listObjectsV2({
      Bucket: "vercel",
      Prefix: prefix,
    })
    .promise();

  console.log("files", files);

  const allPromises =
    files.Contents?.map(async ({ Key }) => {
      return new Promise(async (resolve) => {
        if (!Key) {
          resolve("");
          return;
        }
        const finalOutputPath = path.join(__dirname, Key);
        const outputFile = fs.createWriteStream(finalOutputPath);
        const dirName = path.dirname(finalOutputPath);
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }
        s3.getObject({
          Bucket: "vercel",
          Key,
        })
          .createReadStream()
          .pipe(outputFile)
          .on("finish", () => {
            resolve("");
          });
      });
    }) || [];
  console.log("awaiting");

  await Promise.all(allPromises?.filter((x) => x !== undefined));
};
