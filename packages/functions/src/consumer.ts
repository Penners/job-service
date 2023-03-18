import { SQSEvent } from "aws-lambda";
import { Queue } from "sst/node/queue";

export async function handler(_evt: SQSEvent) {
  console.log("Message processed!", _evt);
  return {};
}
